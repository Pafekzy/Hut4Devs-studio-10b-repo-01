import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import http from 'node:http';
import crypto from 'node:crypto';
import { newDb } from 'pg-mem';
import { runMigrations } from '../server/db/migrator';
import { seedDevelopmentDatabase } from '../server/db/seed';
import { PostgresRepositories } from '../server/db/postgresRepository';
import { createDeployableServer } from '../../server';
import { OutboxPublisher } from '../server/realtime/outboxPublisher';
import { DEMO_ACCOMMODATION_RESPONSIBILITY } from '../data/demoAccommodation';
import { verifyBmoniWebhookSignature, normalizeBmoniWebhookEvent } from '../server/payments/bmoniWebhook';
import { MemberRole } from '../domain/auth';

describe('H4D-FUNC-012: BMONI Webhook Ingestion + Idempotent Provider Event Store', () => {
  let memDb: any;
  let pool: any;
  let repos: PostgresRepositories;
  let publisher: OutboxPublisher;
  let server: http.Server;
  let baseUrl: string;
  const TEST_WEBHOOK_SECRET = 'test_bmoni_webhook_secret_xyz987';

  beforeEach(async () => {
    memDb = newDb({ autoCreateForeignKeyIndices: true });
    const adapter = memDb.adapters.createPg();
    pool = new adapter.Pool();

    // Run all migrations including 004_provider_events
    await runMigrations(pool);
    await seedDevelopmentDatabase(pool);

    repos = new PostgresRepositories(pool);
    publisher = new OutboxPublisher();

    server = createDeployableServer({
      repos,
      publisher,
      bmoniWebhookSecret: TEST_WEBHOOK_SECRET,
    });

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address() as any;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  afterEach(async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
  });

  function computeHmacSignature(rawBody: string, secret = TEST_WEBHOOK_SECRET): string {
    return crypto.createHmac('sha256', secret).update(Buffer.from(rawBody, 'utf8')).digest('hex');
  }

  // 1. Valid signed webhook accepted
  it('1. accepts valid signed BMONI webhook and returns durable acknowledgment', async () => {
    const rawPayload = JSON.stringify({
      id: 'bmoni_evt_101',
      type: 'payment.completed',
      data: {
        proposalId: 'prop_bmoni_888',
        status: 'COMPLETED',
        amount: 66000,
        currency: 'NGN',
        metadata: {
          responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
        },
      },
      createdAt: '2026-09-09T12:00:00Z',
    });

    const signature = computeHmacSignature(rawPayload);

    const res = await fetch(`${baseUrl}/api/webhooks/bmoni`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Id': 'bmoni_evt_101',
        'X-Source-Event-Id': 'src_evt_101',
      },
      body: rawPayload,
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.received).toBe(true);
    expect(data.processingStatus).toBe('RECEIVED');
    expect(data.providerEventId).toBe('bmoni_evt_101');
    expect(data.id).toMatch(/^pevt_/);

    // Verify stored event payload reflects data minimization
    const stored = await repos.providerEvents.findByProviderEventId('BMONI', 'bmoni_evt_101');
    expect(stored).not.toBeNull();
    expect(stored?.sourceEventId).toBe('src_evt_101');
    expect(stored?.payload.provider).toBe('BMONI');
    expect(stored?.payload.eventId).toBe('bmoni_evt_101');
    expect(stored?.payload.sourceEventId).toBe('src_evt_101');
    expect(stored?.payload.secret).toBeUndefined();
    expect(stored?.payload.rawPayload).toBeUndefined();
  });

  // 2. Invalid signature rejected
  it('2. rejects webhook with invalid HMAC signature with 401 Unauthorized', async () => {
    const rawPayload = JSON.stringify({
      id: 'bmoni_evt_102',
      type: 'payment.completed',
      data: { status: 'COMPLETED' },
    });

    const invalidSignature = 'deadbeefbadsignature1234567890abcdef';

    const res = await fetch(`${baseUrl}/api/webhooks/bmoni`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': invalidSignature,
      },
      body: rawPayload,
    });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('mismatch');
  });

  // 3. Missing signature rejected
  it('3. rejects webhook without signature header with 401 Unauthorized', async () => {
    const rawPayload = JSON.stringify({
      id: 'bmoni_evt_103',
      type: 'payment.completed',
    });

    const res = await fetch(`${baseUrl}/api/webhooks/bmoni`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: rawPayload,
    });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Missing webhook signature header');
  });

  // 4. Raw body is used correctly for signature verification (whitespace sensitivity)
  it('4. uses exact raw request body for signature verification', () => {
    const rawBodyWithSpaces = '{\n  "id": "evt_spaced",\n  "status": "COMPLETED"\n}';
    const rawBodyMinified = '{"id":"evt_spaced","status":"COMPLETED"}';

    const sigSpaced = computeHmacSignature(rawBodyWithSpaces);

    // Verifying rawBodyWithSpaces with sigSpaced succeeds
    const check1 = verifyBmoniWebhookSignature(rawBodyWithSpaces, sigSpaced, TEST_WEBHOOK_SECRET);
    expect(check1.valid).toBe(true);

    // Verifying minified body against spaced signature fails (proving exact raw byte verification)
    const check2 = verifyBmoniWebhookSignature(rawBodyMinified, sigSpaced, TEST_WEBHOOK_SECRET);
    expect(check2.valid).toBe(false);
  });

  // 5. Provider event persists in database
  it('5. persists raw provider event record in PostgreSQL provider_events table', async () => {
    const rawPayload = JSON.stringify({
      id: 'bmoni_evt_persistence_test',
      type: 'proposal.status_updated',
      data: {
        proposalId: 'prop_999',
        status: 'PENDING_APPROVAL',
        amount: 33000,
      },
    });

    const signature = computeHmacSignature(rawPayload);

    const res = await fetch(`${baseUrl}/api/webhooks/bmoni`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Id': 'bmoni_evt_persistence_test',
      },
      body: rawPayload,
    });

    expect(res.status).toBe(200);

    // Verify in repository
    const stored = await repos.providerEvents.findByProviderEventId('BMONI', 'bmoni_evt_persistence_test');
    expect(stored).not.toBeNull();
    expect(stored?.provider).toBe('BMONI');
    expect(stored?.providerEventId).toBe('bmoni_evt_persistence_test');
    expect(stored?.eventType).toBe('proposal.status_updated');
    expect(stored?.providerStatus).toBe('PENDING_APPROVAL');
    expect(stored?.providerProposalId).toBe('prop_999');
    expect(stored?.processingStatus).toBe('RECEIVED');
    expect(stored?.payload).toBeDefined();
  });

  // 6. Duplicate provider event does not duplicate storage (Idempotency)
  it('6. deduplicates repeated provider event deliveries idempotently', async () => {
    const rawPayload = JSON.stringify({
      id: 'bmoni_evt_duplicate_test',
      type: 'payment.completed',
      data: {
        proposalId: 'prop_dup',
        status: 'COMPLETED',
      },
    });

    const signature = computeHmacSignature(rawPayload);

    // First delivery
    const res1 = await fetch(`${baseUrl}/api/webhooks/bmoni`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Id': 'bmoni_evt_duplicate_test',
      },
      body: rawPayload,
    });
    expect(res1.status).toBe(200);
    const data1 = await res1.json();
    expect(data1.processingStatus).toBe('RECEIVED');

    // Second delivery of exact same event
    const res2 = await fetch(`${baseUrl}/api/webhooks/bmoni`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Id': 'bmoni_evt_duplicate_test',
      },
      body: rawPayload,
    });
    expect(res2.status).toBe(200);
    const data2 = await res2.json();
    expect(data2.success).toBe(true);
    expect(data2.duplicate).toBe(true);
    expect(data2.processingStatus).toBe('DUPLICATE');

    // Verify in database: exactly ONE record exists for this event
    const allRecords = await repos.providerEvents.listAll();
    const matches = allRecords.filter((r) => r.providerEventId === 'bmoni_evt_duplicate_test');
    expect(matches.length).toBe(1);
  });

  // 7. Provider proposal/event correlation fields persist
  it('7. preserves provider proposal ID and status correlation fields', async () => {
    const rawPayload = JSON.stringify({
      eventId: 'evt_correlation_777',
      sourceEventId: 'src_ext_999',
      event: 'payment.completed',
      data: {
        proposalId: 'bmoni_prop_alpha_1',
        providerStatus: 'COMPLETED',
      },
    });

    const signature = computeHmacSignature(rawPayload);

    const res = await fetch(`${baseUrl}/api/webhooks/bmoni`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Id': 'evt_correlation_777',
        'X-Source-Event-Id': 'src_ext_999',
      },
      body: rawPayload,
    });

    expect(res.status).toBe(200);

    const stored = await repos.providerEvents.findByProviderEventId('BMONI', 'evt_correlation_777');
    expect(stored?.sourceEventId).toBe('src_ext_999');
    expect(stored?.providerProposalId).toBe('bmoni_prop_alpha_1');
    expect(stored?.providerStatus).toBe('COMPLETED');
  });

  // 8. Malformed webhook rejected
  it('8. rejects malformed webhook body with 400 Bad Request', async () => {
    const invalidJson = '{ not valid json ';
    const signature = computeHmacSignature(invalidJson);

    const res = await fetch(`${baseUrl}/api/webhooks/bmoni`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
      },
      body: invalidJson,
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('invalid JSON');
  });

  // 8b. Missing event ID rejected
  it('8b. rejects payload missing provider event identifier with 400 Bad Request', async () => {
    const missingIdPayload = JSON.stringify({
      type: 'payment.completed',
      data: { status: 'COMPLETED' },
    });
    const signature = computeHmacSignature(missingIdPayload);

    const res = await fetch(`${baseUrl}/api/webhooks/bmoni`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
      },
      body: missingIdPayload,
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('missing provider event identifier');
  });

  // 9. Database failure does not falsely mark event processed
  it('9. returns 500 and does not falsely claim processed on database failure', async () => {
    const brokenRepos: any = {
      providerEvents: {
        findByProviderEventId: async () => {
          throw new Error('Database connection lost');
        },
      },
      runInTransaction: async () => {
        throw new Error('Database transaction failed');
      },
    };

    const brokenServer = createDeployableServer({
      repos: brokenRepos,
      bmoniWebhookSecret: TEST_WEBHOOK_SECRET,
    });

    await new Promise<void>((resolve) => {
      brokenServer.listen(0, '127.0.0.1', () => {
        const addr = brokenServer.address() as any;
        const brokenUrl = `http://127.0.0.1:${addr.port}`;

        const raw = JSON.stringify({ id: 'evt_fail', type: 'test' });
        const sig = computeHmacSignature(raw);

        fetch(`${brokenUrl}/api/webhooks/bmoni`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': sig,
          },
          body: raw,
        })
          .then(async (res) => {
            expect(res.status).toBe(500);
            const data = await res.json();
            expect(data.success).toBe(false);
            expect(data.processingStatus).toBe('REJECTED');
            brokenServer.close(() => resolve());
          })
          .catch((err) => {
            brokenServer.close(() => resolve());
            throw err;
          });
      });
    });
  });

  // 10. Webhook secret is server-side only
  it('10. verifies webhook secret is server-side and fails if unconfigured', async () => {
    const unconfiguredServer = createDeployableServer({
      repos,
      bmoniWebhookSecret: '', // No secret configured
    });

    await new Promise<void>((resolve) => {
      unconfiguredServer.listen(0, '127.0.0.1', () => {
        const addr = unconfiguredServer.address() as any;
        const unconfUrl = `http://127.0.0.1:${addr.port}`;

        const raw = JSON.stringify({ id: 'evt_unconf', type: 'test' });
        fetch(`${unconfUrl}/api/webhooks/bmoni`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': 'some-sig',
          },
          body: raw,
        })
          .then(async (res) => {
            expect(res.status).toBe(500);
            const data = await res.json();
            expect(data.error).toContain('Webhook secret is not configured');
            unconfiguredServer.close(() => resolve());
          })
          .catch((err) => {
            unconfiguredServer.close(() => resolve());
            throw err;
          });
      });
    });
  });

  // 11, 12, 13: Critical Invariant: Provider COMPLETED does NOT change verifiedAmount, remainingAmount, or status
  it('11, 12, 13. INVARIANT: BMONI COMPLETED webhook does NOT change verifiedAmount (₦0), remainingAmount (₦66,000), or status (OUTSTANDING)', async () => {
    // Check initial state
    const beforeResp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(beforeResp?.verifiedAmount).toBe(0);
    expect(beforeResp?.requiredAmount).toBe(66000);
    expect(beforeResp?.status).toBe('OUTSTANDING');

    // Ingest BMONI webhook stating payment completed
    const rawPayload = JSON.stringify({
      id: 'bmoni_evt_financial_invariant_check',
      type: 'payment.completed',
      data: {
        proposalId: 'bmoni_prop_completed_123',
        status: 'COMPLETED',
        amount: 66000,
        currency: 'NGN',
        metadata: {
          responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
        },
      },
    });

    const signature = computeHmacSignature(rawPayload);

    const res = await fetch(`${baseUrl}/api/webhooks/bmoni`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Id': 'bmoni_evt_financial_invariant_check',
      },
      body: rawPayload,
    });

    expect(res.status).toBe(200);

    // Verify AFTER webhook receipt: Accommodation Responsibility MUST REMAIN UNCHANGED
    const afterResp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(afterResp?.verifiedAmount).toBe(0);
    expect(afterResp?.requiredAmount).toBe(66000);
    expect(afterResp?.status).toBe('OUTSTANDING');

    // Also check through GET /api/accommodation/responsibility API
    const getRes = await fetch(`${baseUrl}/api/accommodation/responsibility`);
    const getData = await getRes.json();
    expect(getData.responsibility.verifiedAmount).toBe(0);
    expect(getData.responsibility.requiredAmount).toBe(66000);
    expect(getData.responsibility.status).toBe('OUTSTANDING');
  });

  // 14. Browser Fellow/Admin session is NOT used as webhook authentication
  it('14. rejects browser session authentication on webhook endpoint without valid HMAC signature', async () => {
    // Create valid fellow session
    const fellowSessionRes = await fetch(`${baseUrl}/api/auth/dev-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: MemberRole.FELLOW }),
    });
    const fellowData = await fellowSessionRes.json();
    const token = fellowData.token;

    const rawPayload = JSON.stringify({
      id: 'bmoni_evt_auth_check',
      type: 'payment.completed',
      data: { status: 'COMPLETED' },
    });

    // Send with Fellow Bearer token and Cookie, but no HMAC signature
    const res = await fetch(`${baseUrl}/api/webhooks/bmoni`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Cookie: `h4d_session=${token}`,
      },
      body: rawPayload,
    });

    // Must be rejected with 401 because webhook requires provider HMAC signature, not browser session auth
    expect(res.status).toBe(401);
  });

  // 15. Admin audit endpoint GET /api/accommodation/admin/provider-events requires ACCOMMODATION_ADMIN role
  it('15. restricts GET /api/accommodation/admin/provider-events to ACCOMMODATION_ADMIN', async () => {
    // Unauthenticated request
    const unauthRes = await fetch(`${baseUrl}/api/accommodation/admin/provider-events`);
    expect(unauthRes.status).toBe(401);

    // Fellow request -> 403 Forbidden
    const fellowRes = await fetch(`${baseUrl}/api/auth/dev-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: MemberRole.FELLOW }),
    });
    const fellowData = await fellowRes.json();

    const fellowAuditRes = await fetch(`${baseUrl}/api/accommodation/admin/provider-events`, {
      headers: { Authorization: `Bearer ${fellowData.token}` },
    });
    expect(fellowAuditRes.status).toBe(403);

    // Admin request -> 200 OK
    const adminRes = await fetch(`${baseUrl}/api/auth/dev-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: MemberRole.ACCOMMODATION_ADMIN }),
    });
    const adminData = await adminRes.json();

    const adminAuditRes = await fetch(`${baseUrl}/api/accommodation/admin/provider-events`, {
      headers: { Authorization: `Bearer ${adminData.token}` },
    });
    expect(adminAuditRes.status).toBe(200);
    const adminAuditData = await adminAuditRes.json();
    expect(adminAuditData.success).toBe(true);
    expect(Array.isArray(adminAuditData.providerEvents)).toBe(true);
  });

  // 16. Documented headers mapping: X-Webhook-Id -> provider_event_id, X-Source-Event-Id -> source_event_id
  it('16. maps documented X-Webhook-Id and X-Source-Event-Id headers without substituting generated IDs', async () => {
    const rawPayload = JSON.stringify({
      type: 'proposal.status_updated',
      data: {
        proposalId: 'prop_hdr_map',
        status: 'PENDING_APPROVAL',
      },
    });

    const signature = computeHmacSignature(rawPayload);

    const res = await fetch(`${baseUrl}/api/webhooks/bmoni`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Id': 'bmoni_hdr_evt_9988',
        'X-Source-Event-Id': 'upstream_source_5544',
      },
      body: rawPayload,
    });

    expect(res.status).toBe(200);
    const resData = await res.json();
    expect(resData.providerEventId).toBe('bmoni_hdr_evt_9988');

    // Query repository to confirm exact mapping into database columns
    const stored = await repos.providerEvents.findByProviderEventId('BMONI', 'bmoni_hdr_evt_9988');
    expect(stored).not.toBeNull();
    expect(stored?.providerEventId).toBe('bmoni_hdr_evt_9988');
    expect(stored?.sourceEventId).toBe('upstream_source_5544');
  });

  // 17. Unnecessary provider payload minimized: secrets and raw bulk excluded
  it('17. minimizes persisted provider payload and excludes sensitive fields', async () => {
    const rawPayload = JSON.stringify({
      id: 'bmoni_evt_minimize_test',
      type: 'payment.completed',
      data: {
        proposalId: 'prop_min_1',
        status: 'COMPLETED',
        amount: 66000,
        currency: 'NGN',
        secretToken: 'super_secret_partner_key_should_not_be_stored',
        pin: '1234',
        privateKey: '0xabc123private',
        bvn: '22223333444',
        metadata: {
          responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
          safeNote: 'September 2026 accommodation',
          secretInternalKey: 'must_not_store',
        },
      },
      bulkRoutingInfo: {
        hop1: 'internal-gw-1',
        hop2: 'internal-gw-2',
      },
    });

    const signature = computeHmacSignature(rawPayload);

    const res = await fetch(`${baseUrl}/api/webhooks/bmoni`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Id': 'bmoni_evt_minimize_test',
      },
      body: rawPayload,
    });

    expect(res.status).toBe(200);

    const stored = await repos.providerEvents.findByProviderEventId('BMONI', 'bmoni_evt_minimize_test');
    expect(stored).not.toBeNull();
    const payload = stored!.payload;

    // Check minimized structure
    expect(payload.provider).toBe('BMONI');
    expect(payload.eventId).toBe('bmoni_evt_minimize_test');
    expect(payload.eventType).toBe('payment.completed');
    expect(payload.providerStatus).toBe('COMPLETED');
    expect(payload.amount).toBe(66000);
    expect(payload.currency).toBe('NGN');

    // Check sensitive fields are NOT present
    expect(payload.secretToken).toBeUndefined();
    expect(payload.pin).toBeUndefined();
    expect(payload.privateKey).toBeUndefined();
    expect(payload.bvn).toBeUndefined();
    expect(payload.bulkRoutingInfo).toBeUndefined();
    expect(payload.metadata?.safeNote).toBe('September 2026 accommodation');
    expect(payload.metadata?.secretInternalKey).toBeUndefined();
  });
});
