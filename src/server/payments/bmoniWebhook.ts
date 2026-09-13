import http from 'node:http';
import crypto from 'node:crypto';
import {
  IHut4DevsRepositories,
  ProviderEventRecord,
  ProviderEventProcessingStatus,
  OutboxEventRecord,
} from '../../domain/repositories';
import { OutboxPublisher } from '../realtime/outboxPublisher';
import { DEMO_ACCOMMODATION_RESPONSIBILITY } from '../../data/demoAccommodation';
import { reconciliationEngine } from './reconciliationEngine';

export interface NormalizedBmoniEvent {
  provider: 'BMONI';
  providerEventId: string;
  sourceEventId?: string | null;
  eventType: string;
  providerStatus: string;
  providerProposalId?: string | null;
  responsibilityId?: string | null;
  payload: Record<string, any>;
}

export interface WebhookVerificationResult {
  valid: boolean;
  reason?: string;
  configured: boolean;
}

/**
 * Validates BMONI webhook authenticity using HMAC-SHA256 over raw request body.
 *
 * Invariant: Must verify raw request body bytes/string, NEVER parsed/re-serialized JSON.
 * Uses timingSafeEqual to prevent timing side-channel attacks.
 * Never exposes webhook secret to client code.
 */
export function verifyBmoniWebhookSignature(
  rawBody: string | Buffer,
  signatureHeader: string | undefined | null,
  secretOverride?: string
): WebhookVerificationResult {
  const secret =
    (secretOverride && secretOverride.trim().length > 0
      ? secretOverride
      : (typeof process !== 'undefined' && process.env
          ? process.env.BMONI_WEBHOOK_SECRET || process.env.BMONI_PARTNER_SECRET
          : undefined)) || '';

  if (!secret || secret.trim().length === 0) {
    return {
      valid: false,
      configured: false,
      reason: 'Webhook secret is not configured on the server.',
    };
  }

  if (!signatureHeader || signatureHeader.trim().length === 0) {
    return {
      valid: false,
      configured: true,
      reason: 'Missing webhook signature header.',
    };
  }

  const normalizedRawBody = typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf8') : rawBody;

  // Calculate HMAC-SHA256 hex
  const hmacHex = crypto.createHmac('sha256', secret.trim()).update(normalizedRawBody).digest('hex');

  // Provider may send signature directly as hex or prefixed with "sha256="
  let cleanHeader = signatureHeader.trim();
  if (cleanHeader.toLowerCase().startsWith('sha256=')) {
    cleanHeader = cleanHeader.slice('sha256='.length).trim();
  }

  const expectedHexBuffer = Buffer.from(hmacHex, 'utf8');
  const actualBuffer = Buffer.from(cleanHeader, 'utf8');

  // Check hex representation
  if (
    expectedHexBuffer.length === actualBuffer.length &&
    crypto.timingSafeEqual(expectedHexBuffer, actualBuffer)
  ) {
    return { valid: true, configured: true };
  }

  // Fallback: check base64 encoding if provided
  const hmacBase64 = crypto.createHmac('sha256', secret.trim()).update(normalizedRawBody).digest('base64');
  const expectedBase64Buffer = Buffer.from(hmacBase64, 'utf8');
  if (
    expectedBase64Buffer.length === actualBuffer.length &&
    crypto.timingSafeEqual(expectedBase64Buffer, actualBuffer)
  ) {
    return { valid: true, configured: true };
  }

  return {
    valid: false,
    configured: true,
    reason: 'Webhook signature mismatch.',
  };
}

/**
 * Normalizes raw BMONI provider webhook payload into structured domain event.
 * Preserves raw provider status without inventing status names.
 * Ensures data minimization: retains only fields required for authentication/audit evidence,
 * proposal correlation, event type/status, reconciliation, and troubleshooting.
 * Excludes unnecessary sensitive fields (secrets, tokens, private keys, PINs, BVN, NIN, internal routing).
 */
export function normalizeBmoniWebhookEvent(
  rawPayload: Record<string, any>,
  headers?: { webhookId?: string | null; sourceEventId?: string | null }
): { success: boolean; event?: NormalizedBmoniEvent; error?: string } {
  if (!rawPayload || typeof rawPayload !== 'object') {
    return { success: false, error: 'Malformed webhook payload: expected JSON object.' };
  }

  // Extract stable provider event ID for deduplication:
  // Priority: documented X-Webhook-Id header, then payload body id/eventId
  const providerEventId =
    (headers?.webhookId && String(headers.webhookId).trim().length > 0 ? String(headers.webhookId).trim() : null) ||
    rawPayload.id ||
    rawPayload.eventId ||
    rawPayload.event_id ||
    rawPayload.data?.id ||
    rawPayload.data?.eventId ||
    rawPayload.data?.event_id;

  if (!providerEventId || String(providerEventId).trim().length === 0) {
    return {
      success: false,
      error: 'Malformed webhook payload: missing provider event identifier for deduplication.',
    };
  }

  // Extract source event ID:
  // Priority: documented X-Source-Event-Id header, then payload body sourceEventId
  const sourceEventId =
    (headers?.sourceEventId && String(headers.sourceEventId).trim().length > 0
      ? String(headers.sourceEventId).trim()
      : null) ||
    rawPayload.sourceEventId ||
    rawPayload.source_event_id ||
    rawPayload.data?.sourceEventId ||
    rawPayload.data?.source_event_id ||
    null;

  // Extract event type
  const eventType = String(
    rawPayload.type ||
    rawPayload.eventType ||
    rawPayload.event_type ||
    rawPayload.event ||
    'bmoni.event.unknown'
  );

  // Extract provider status (e.g. COMPLETED, PENDING_APPROVAL, FAILED)
  const providerStatus = String(
    rawPayload.data?.status ||
    rawPayload.data?.providerStatus ||
    rawPayload.data?.state ||
    rawPayload.status ||
    rawPayload.providerStatus ||
    rawPayload.state ||
    'UNKNOWN'
  );

  // Extract proposal correlation
  const providerProposalId =
    rawPayload.data?.proposalId ||
    rawPayload.data?.providerProposalId ||
    rawPayload.data?.proposal_id ||
    rawPayload.proposalId ||
    rawPayload.providerProposalId ||
    rawPayload.proposal_id ||
    null;

  // Extract responsibility ID correlation if present
  const responsibilityId =
    rawPayload.data?.metadata?.responsibilityId ||
    rawPayload.data?.responsibilityId ||
    rawPayload.metadata?.responsibilityId ||
    rawPayload.responsibilityId ||
    null;

  // DATA MINIMIZATION:
  // Do not make indefinite storage of the entire raw provider payload an architectural requirement.
  // Persist only what is reasonably required for:
  // - authentication/audit evidence
  // - proposal correlation
  // - event type/status
  // - later reconciliation
  // - troubleshooting
  // Strip any sensitive fields, secrets, credentials, or irrelevant bulk payload
  const minimizedPayload: Record<string, any> = {
    provider: 'BMONI',
    eventId: String(providerEventId),
    sourceEventId: sourceEventId ? String(sourceEventId) : null,
    eventType,
    providerStatus,
    providerProposalId: providerProposalId ? String(providerProposalId) : null,
    amount: rawPayload.data?.amount ?? rawPayload.amount ?? null,
    currency: rawPayload.data?.currency ?? rawPayload.currency ?? 'NGN',
    responsibilityId: responsibilityId ? String(responsibilityId) : null,
    createdAt: rawPayload.createdAt || rawPayload.data?.createdAt || null,
  };

  // If customer or metadata has safe non-sensitive troubleshooting context, retain only safe subset
  if (rawPayload.data?.metadata && typeof rawPayload.data.metadata === 'object') {
    const safeMeta: Record<string, any> = {};
    for (const [k, v] of Object.entries(rawPayload.data.metadata)) {
      const lower = k.toLowerCase();
      if (
        !lower.includes('secret') &&
        !lower.includes('key') &&
        !lower.includes('pin') &&
        !lower.includes('token') &&
        !lower.includes('password') &&
        !lower.includes('bvn') &&
        !lower.includes('nin')
      ) {
        safeMeta[k] = v;
      }
    }
    if (Object.keys(safeMeta).length > 0) {
      minimizedPayload.metadata = safeMeta;
    }
  }

  return {
    success: true,
    event: {
      provider: 'BMONI',
      providerEventId: String(providerEventId),
      sourceEventId: sourceEventId ? String(sourceEventId) : null,
      eventType,
      providerStatus,
      providerProposalId: providerProposalId ? String(providerProposalId) : null,
      responsibilityId: responsibilityId ? String(responsibilityId) : null,
      payload: minimizedPayload,
    },
  };
}

/**
 * Server-side Request Handler for POST /api/webhooks/bmoni (H4D-FUNC-012)
 *
 * Machine-to-machine boundary:
 * 1. Verifies HMAC-SHA256 signature using raw request body.
 * 2. Idempotently deduplicates repeated provider event deliveries.
 * 3. Persists provider event in PostgreSQL provider_events.
 * 4. Inserts outbox event transactionally and publishes only after COMMIT.
 * 5. Returns durable HTTP acknowledgement.
 *
 * CRITICAL INVARIANT: Provider event receipt is evidence, NOT accounting mutation.
 * BMONI COMPLETED != Hut4Devs VERIFIED.
 * verifiedAmount, remainingAmount, and status remain UNCHANGED.
 */
export async function handleBmoniWebhookRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  repos?: IHut4DevsRepositories,
  publisher?: OutboxPublisher,
  webhookSecretOverride?: string
): Promise<void> {
  const chunks: Buffer[] = [];
  let totalLength = 0;
  const MAX_PAYLOAD_SIZE = 1024 * 1024; // 1MB limit

  req.on('data', (chunk) => {
    const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    chunks.push(bufferChunk);
    totalLength += bufferChunk.length;
    if (totalLength > MAX_PAYLOAD_SIZE) {
      res.statusCode = 413;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.end(JSON.stringify({ success: false, error: 'Webhook payload too large.' }));
      req.destroy();
    }
  });

  req.on('end', async () => {
    try {
      const rawBody = Buffer.concat(chunks);
      const rawBodyStr = rawBody.toString('utf8');

      // 1. Webhook Signature Verification
      // Documented BMONI webhook header: X-Webhook-Signature
      // (Node.js http normalizes incoming header names to lowercase: x-webhook-signature)
      const signatureHeader = req.headers['x-webhook-signature'] as string | undefined;

      const verification = verifyBmoniWebhookSignature(
        rawBody,
        signatureHeader,
        webhookSecretOverride
      );

      // If server has no webhook secret configured
      if (!verification.configured) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.end(
          JSON.stringify({
            success: false,
            error: 'Webhook secret is not configured on the server.',
            processingStatus: 'REJECTED' as ProviderEventProcessingStatus,
          })
        );
        return;
      }

      // If signature is missing or mismatch
      if (!verification.valid) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.end(
          JSON.stringify({
            success: false,
            error: verification.reason || 'Invalid webhook signature.',
            processingStatus: 'REJECTED' as ProviderEventProcessingStatus,
          })
        );
        return;
      }

      // 2. Parse JSON body
      let parsedBody: any;
      try {
        parsedBody = JSON.parse(rawBodyStr);
      } catch {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.end(
          JSON.stringify({
            success: false,
            error: 'Malformed webhook payload: invalid JSON.',
            processingStatus: 'REJECTED' as ProviderEventProcessingStatus,
          })
        );
        return;
      }

      // 3. Normalize BMONI Event
      // Documented BMONI webhook identification headers:
      // X-Webhook-Id: stable provider event identity used for deduplication
      // X-Source-Event-Id: upstream provider source event identifier
      const webhookIdHeader = req.headers['x-webhook-id'] as string | undefined;
      const sourceEventIdHeader = req.headers['x-source-event-id'] as string | undefined;

      const normalizedResult = normalizeBmoniWebhookEvent(parsedBody, {
        webhookId: webhookIdHeader,
        sourceEventId: sourceEventIdHeader,
      });
      if (!normalizedResult.success || !normalizedResult.event) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.end(
          JSON.stringify({
            success: false,
            error: normalizedResult.error || 'Malformed webhook payload.',
            processingStatus: 'REJECTED' as ProviderEventProcessingStatus,
          })
        );
        return;
      }

      const normalized = normalizedResult.event;

      // 4. Ensure Repositories available
      if (!repos) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.end(
          JSON.stringify({
            success: false,
            error: 'Database persistence unavailable: repositories not initialized.',
            processingStatus: 'REJECTED' as ProviderEventProcessingStatus,
          })
        );
        return;
      }

      // 5. Idempotent Deduplication Check
      // Deduplicate on (provider, provider_event_id)
      const existingEvent = await repos.providerEvents.findByProviderEventId(
        normalized.provider,
        normalized.providerEventId
      );

      if (existingEvent) {
        // Acknowledge repeated delivery safely without duplicating records or outbox events
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.end(
          JSON.stringify({
            success: true,
            duplicate: true,
            processingStatus: 'DUPLICATE' as ProviderEventProcessingStatus,
            message: 'Provider event already received and recorded.',
            providerEventId: normalized.providerEventId,
            id: existingEvent.id,
          })
        );
        return;
      }

      // 6. Prepare New Provider Event Record
      const providerEventRecord: ProviderEventRecord = {
        id: `pevt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        provider: normalized.provider,
        providerEventId: normalized.providerEventId,
        sourceEventId: normalized.sourceEventId || null,
        eventType: normalized.eventType,
        providerStatus: normalized.providerStatus,
        providerProposalId: normalized.providerProposalId || null,
        payload: normalized.payload,
        receivedAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        processingStatus: 'RECEIVED',
      };

      // 7. Prepare Transactional Outbox Event for Admin real-time delivery
      const outboxEvent: OutboxEventRecord = {
        id: `outbox_pevt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        eventType: 'accommodation.provider_event.received',
        aggregateType: 'accommodation_responsibility',
        aggregateId: normalized.responsibilityId || DEMO_ACCOMMODATION_RESPONSIBILITY.id,
        payload: {
          provider: 'BMONI',
          providerEventId: normalized.providerEventId,
          eventType: normalized.eventType,
          providerProposalId: normalized.providerProposalId,
          providerStatus: normalized.providerStatus,
          statusLabel: 'Received — Awaiting Reconciliation',
          notice: 'Provider event received. Not verified. Awaiting reconciliation.',
          receivedAt: providerEventRecord.receivedAt,
        },
        createdAt: new Date().toISOString(),
      };

      // 8. Transactional persistence: provider event + outbox event inside single PostgreSQL transaction
      await repos.runInTransaction(async (txRepos) => {
        await txRepos.providerEvents.create(providerEventRecord);
        await txRepos.outbox.insert(outboxEvent);
      });

      // 9. Publish outbox event to SSE subscribers ONLY AFTER COMMIT
      if (publisher) {
        publisher.publish(outboxEvent);
      }

      // 10. Automatically run reconciliation engine on the ingested provider event
      let reconciliationResult: any = null;
      try {
        reconciliationResult = await reconciliationEngine.reconcileProviderEvent(
          providerEventRecord,
          repos,
          publisher
        );
      } catch (recErr) {
        console.error('[BMONI Webhook] Automated reconciliation encountered error:', recErr);
      }

      // 11. Acknowledge Durable Ingestion
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.end(
        JSON.stringify({
          success: true,
          received: true,
          processingStatus: 'RECEIVED' as ProviderEventProcessingStatus,
          id: providerEventRecord.id,
          providerEventId: providerEventRecord.providerEventId,
          eventType: providerEventRecord.eventType,
          providerStatus: providerEventRecord.providerStatus,
          notice: reconciliationResult?.success
            ? 'Provider event recorded and verified via reconciliation.'
            : 'Provider event recorded. Awaiting future reconciliation.',
          reconciliation: reconciliationResult,
        })
      );
    } catch (err: any) {
      console.error('[BMONI Webhook] Ingestion failure:', err);
      // If database fails, do NOT falsely acknowledge durable processing!
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.end(
        JSON.stringify({
          success: false,
          error: 'Failed to persist provider event in database.',
          processingStatus: 'REJECTED' as ProviderEventProcessingStatus,
        })
      );
    }
  });
}
