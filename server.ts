import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { handleCreateProposal, ServerHandlerResponse } from './src/server/payments/serverHandler';
import { PaymentProvider } from './src/domain/payments';
import { IHut4DevsRepositories, OutboxEventRecord } from './src/domain/repositories';
import { getAuthoritativeRepositories } from './src/server/db/connection';
import { AccommodationPaymentIntent } from './src/domain/accommodation';
import { DEMO_ACCOMMODATION_RESPONSIBILITY } from './src/data/demoAccommodation';
import { OutboxPublisher, globalOutboxPublisher } from './src/server/realtime/outboxPublisher';
import { MemberRole } from './src/domain/auth';
import {
  authenticateRequest,
  requireRole,
  createDevelopmentSession,
  DEV_IDENTITIES,
  extractSessionToken,
} from './src/server/auth/authService';
import { handleBmoniWebhookRequest } from './src/server/payments/bmoniWebhook';
import { reconciliationEngine } from './src/server/payments/reconciliationEngine';
export { OutboxPublisher, globalOutboxPublisher };

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

export interface ServerOptions {
  distDir?: string;
  customProvider?: PaymentProvider;
  repos?: IHut4DevsRepositories;
  publisher?: OutboxPublisher;
  bmoniWebhookSecret?: string;
}

async function resolveRepositories(repos?: IHut4DevsRepositories): Promise<IHut4DevsRepositories> {
  if (repos) return repos;
  return getAuthoritativeRepositories();
}

/**
 * Request handler for POST /api/payments/proposal
 */
export async function handlePaymentProposalRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  customProvider?: PaymentProvider,
  repos?: IHut4DevsRepositories,
  publisher?: OutboxPublisher
): Promise<void> {
  let bodyStr = '';
  req.on('data', (chunk) => {
    bodyStr += chunk;
    if (bodyStr.length > 1024 * 1024) {
      res.statusCode = 413;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Payload too large.' }));
      req.destroy();
    }
  });

  req.on('end', async () => {
    try {
      let body: any = {};
      if (bodyStr.trim().length > 0) {
        try {
          body = JSON.parse(bodyStr);
        } catch {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload.' }));
          return;
        }
      }

      let activeRepos: IHut4DevsRepositories | undefined;
      try {
        activeRepos = await resolveRepositories(repos);
      } catch {
        // If repositories cannot be initialized, still proceed to evaluate provider
        // but transactional DB persistence will report failure if required
      }

      const result: ServerHandlerResponse = await handleCreateProposal(
        body,
        customProvider,
        undefined,
        activeRepos,
        publisher
      );

      res.statusCode = result.status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.end(JSON.stringify(result.body));
    } catch (err: any) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.end(JSON.stringify({ success: false, error: 'Internal server error.' }));
    }
  });
}

/**
 * Request handler for GET /api/accommodation/responsibility
 */
export async function handleAccommodationRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  repos?: IHut4DevsRepositories
): Promise<void> {
  try {
    const activeRepos = await resolveRepositories(repos);
    const responsibilities = await activeRepos.accommodation.listAll();
    const responsibility =
      responsibilities.length > 0
        ? responsibilities[0]
        : await activeRepos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);

    if (!responsibility) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.end(JSON.stringify({ success: false, error: 'Accommodation responsibility not found.' }));
      return;
    }

    const preparedIntents = await activeRepos.intents.findByResponsibilityId(responsibility.id);
    const paymentProposals = await activeRepos.proposals.listAll();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(
      JSON.stringify({
        success: true,
        responsibility,
        preparedIntents,
        paymentProposals,
      })
    );
  } catch (err: any) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(
      JSON.stringify({
        success: false,
        error: `Database unavailable: ${err.message || 'Could not connect to PostgreSQL.'}`,
      })
    );
  }
}

/**
 * Request handler for POST /api/payments/intents
 *
 * Transaction + Outbox pattern (H4D-FUNC-010):
 * Persists domain state (PaymentIntent) and inserts matching outbox event within
 * a single database transaction.
 * Real-time event is strictly published AFTER database commit succeeds.
 */
export async function handleSaveIntentRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  repos?: IHut4DevsRepositories,
  publisher?: OutboxPublisher
): Promise<void> {
  let bodyStr = '';
  req.on('data', (chunk) => {
    bodyStr += chunk;
  });

  req.on('end', async () => {
    try {
      let body: any = {};
      try {
        body = JSON.parse(bodyStr || '{}');
      } catch {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload.' }));
        return;
      }

      const intentData: AccommodationPaymentIntent = body.intent || body;

      if (
        !intentData ||
        !intentData.id ||
        !intentData.responsibilityId ||
        typeof intentData.amount !== 'number' ||
        intentData.amount <= 0
      ) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.end(JSON.stringify({ success: false, error: 'Invalid payment intent payload.' }));
        return;
      }

      const activeRepos = await resolveRepositories(repos);

      let outboxEventToPublish: OutboxEventRecord | null = null;

      await activeRepos.runInTransaction(async (tx) => {
        // 1. Foreign key verification
        const resp = await tx.accommodation.findById(intentData.responsibilityId);
        if (!resp) {
          throw new Error(
            `Foreign key violation: accommodation responsibility "${intentData.responsibilityId}" does not exist.`
          );
        }

        // 2. Persist domain state (Prepared payment intent)
        await tx.intents.save(intentData);

        // 3. Insert transactional outbox event
        outboxEventToPublish = {
          id: `outbox-intent-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          eventType: 'accommodation.payment_intent.prepared',
          aggregateType: 'accommodation_responsibility',
          aggregateId: intentData.responsibilityId,
          payload: {
            intentId: intentData.id,
            responsibilityId: intentData.responsibilityId,
            fellowId: resp.fellowId,
            fellowName: resp.fellow?.name || 'Current Fellow',
            accommodationTitle: resp.title || 'September Accommodation',
            amount: intentData.amount,
            currency: resp.currency || 'NGN',
            fulfilmentType: intentData.fulfilmentType,
            status: 'PREPARED',
            statusLabel: 'Prepared — Not Verified',
            createdAt: intentData.createdAt || new Date().toISOString(),
          },
          createdAt: new Date().toISOString(),
          publishedAt: null,
        };
        await tx.outbox.insert(outboxEventToPublish);
      });

      // 4. Publish to connected clients ONLY AFTER database commit succeeds
      if (outboxEventToPublish) {
        const activePublisher = publisher || globalOutboxPublisher;
        await activePublisher.publish(outboxEventToPublish, activeRepos);
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.end(JSON.stringify({ success: true, intent: intentData }));
    } catch (err: any) {
      const isFkError = String(err).includes('Foreign key violation');
      res.statusCode = isFkError ? 400 : 503;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.end(
        JSON.stringify({
          success: false,
          error: err.message || 'Database error while persisting intent.',
        })
      );
    }
  });
}

/**
 * Request handler for GET /api/accommodation/outbox
 * Lists outbox records stored in PostgreSQL.
 * Protected by ACCOMMODATION_ADMIN role authorization (H4D-FUNC-011).
 */
export async function handleOutboxListRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  repos?: IHut4DevsRepositories
): Promise<void> {
  try {
    const activeRepos = await resolveRepositories(repos);
    const member = await authenticateRequest(req, activeRepos);
    const auth = requireRole(member, MemberRole.ACCOMMODATION_ADMIN);
    if (!auth.authorized) {
      res.statusCode = auth.status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.end(JSON.stringify({ success: false, error: auth.error }));
      return;
    }

    const events = await activeRepos.outbox.listAll();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(JSON.stringify({ success: true, events }));
  } catch (err: any) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(
      JSON.stringify({
        success: false,
        error: err.message || 'Database error while reading outbox.',
      })
    );
  }
}

/**
 * Request handler for GET /api/accommodation/admin/stream (SSE)
 * Protected by ACCOMMODATION_ADMIN role authorization (H4D-FUNC-011).
 * Unauthenticated requests receive 401 Unauthorized.
 * Unauthorized Fellow requests receive 403 Forbidden.
 */
export async function handleAdminStreamRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  repos?: IHut4DevsRepositories,
  publisher?: OutboxPublisher
): Promise<void> {
  try {
    const activeRepos = await resolveRepositories(repos);
    const member = await authenticateRequest(req, activeRepos);
    const auth = requireRole(member, MemberRole.ACCOMMODATION_ADMIN);
    if (!auth.authorized) {
      res.statusCode = auth.status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.end(JSON.stringify({ success: false, error: auth.error }));
      return;
    }

    const activePublisher = publisher || globalOutboxPublisher;
    activePublisher.handleSseConnection(req, res);
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(JSON.stringify({ success: false, error: err.message || 'Stream authorization error.' }));
  }
}

/**
 * Request handler for GET /api/accommodation/admin/overview
 * Protected by ACCOMMODATION_ADMIN role authorization (H4D-FUNC-011).
 */
export async function handleAdminOverviewRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  repos?: IHut4DevsRepositories
): Promise<void> {
  try {
    const activeRepos = await resolveRepositories(repos);
    const member = await authenticateRequest(req, activeRepos);
    const auth = requireRole(member, MemberRole.ACCOMMODATION_ADMIN);
    if (!auth.authorized) {
      res.statusCode = auth.status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.end(JSON.stringify({ success: false, error: auth.error }));
      return;
    }

    const responsibilities = await activeRepos.accommodation.listAll();
    const preparedIntents = await activeRepos.intents.listAll();
    const paymentProposals = await activeRepos.proposals.listAll();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(
      JSON.stringify({
        success: true,
        responsibilities,
        preparedIntents,
        paymentProposals,
      })
    );
  } catch (err: any) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(
      JSON.stringify({
        success: false,
        error: err.message || 'Database error while loading admin overview.',
      })
    );
  }
}

/**
 * Request handler for GET /api/auth/session
 * Returns authenticated session member details, or 401 if unauthenticated.
 */
export async function handleGetSessionRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  repos?: IHut4DevsRepositories
): Promise<void> {
  try {
    const activeRepos = await resolveRepositories(repos);
    const member = await authenticateRequest(req, activeRepos);
    if (!member) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.end(
        JSON.stringify({
          success: false,
          error: 'Unauthenticated: No valid development session found.',
          mode: 'DEVELOPMENT',
        })
      );
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(
      JSON.stringify({
        success: true,
        member,
        mode: 'DEVELOPMENT',
      })
    );
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(JSON.stringify({ success: false, error: err.message || 'Session verification failed.' }));
  }
}

/**
 * Request handler for POST /api/auth/dev-session
 * Establishes a server-recognized development session for Fellow or Admin.
 */
export async function handleDevSessionRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  repos?: IHut4DevsRepositories
): Promise<void> {
  let bodyStr = '';
  req.on('data', (chunk) => {
    bodyStr += chunk;
  });

  req.on('end', async () => {
    try {
      const activeRepos = await resolveRepositories(repos);
      let body: any = {};
      try {
        body = JSON.parse(bodyStr || '{}');
      } catch {
        // use default
      }

      const session = await createDevelopmentSession(activeRepos, body);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader(
        'Set-Cookie',
        `h4d_session=${encodeURIComponent(session.token)}; Path=/; HttpOnly; SameSite=Lax`
      );
      res.end(
        JSON.stringify({
          success: true,
          token: session.token,
          member: session.member,
          mode: 'DEVELOPMENT',
          notice:
            'DEVELOPMENT AUTH: This session is strictly for local/preview development and does not represent production authentication.',
        })
      );
    } catch (err: any) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.end(
        JSON.stringify({
          success: false,
          error: err.message || 'Could not establish development session.',
        })
      );
    }
  });
}

/**
 * Request handler for GET /api/auth/dev-identities
 */
export function handleDevIdentitiesRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse
): void {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(
    JSON.stringify({
      success: true,
      mode: 'DEVELOPMENT',
      notice: 'DEVELOPMENT AUTH: Strictly for local/preview development.',
      identities: DEV_IDENTITIES,
    })
  );
}

/**
 * Request handler for POST /api/auth/logout
 */
export async function handleLogoutRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  repos?: IHut4DevsRepositories
): Promise<void> {
  try {
    const activeRepos = await resolveRepositories(repos);
    const token = extractSessionToken(req);
    if (token) {
      await activeRepos.sessions.deleteByToken(token);
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader(
      'Set-Cookie',
      'h4d_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax'
    );
    res.end(JSON.stringify({ success: true, message: 'Logged out successfully.' }));
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(JSON.stringify({ success: false, error: err.message || 'Logout failed.' }));
  }
}

/**
 * Request handler for GET /api/accommodation/admin/provider-events (H4D-FUNC-012)
 *
 * Restricts to authenticated ACCOMMODATION_ADMIN role.
 * Read-only audit of provider event receipts.
 */
export async function handleAdminProviderEventsRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  repos?: IHut4DevsRepositories
): Promise<void> {
  const activeRepos = await resolveRepositories(repos);
  const session = await authenticateRequest(req, activeRepos);
  const auth = requireRole(session, MemberRole.ACCOMMODATION_ADMIN);
  if (!auth.authorized) {
    res.statusCode = auth.status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(JSON.stringify({ success: false, error: auth.error }));
    return;
  }

  const events = await activeRepos.providerEvents.listAll();
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(
    JSON.stringify({
      success: true,
      providerEvents: events,
      notice: 'Provider events received. Awaiting future reconciliation. Not verified.',
    })
  );
}

/**
 * Request handler for GET /api/accommodation/admin/reconciliations (H4D-FUNC-013)
 * Restricts to authenticated ACCOMMODATION_ADMIN role.
 */
export async function handleAdminReconciliationsRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  repos?: IHut4DevsRepositories
): Promise<void> {
  const activeRepos = await resolveRepositories(repos);
  const session = await authenticateRequest(req, activeRepos);
  const auth = requireRole(session, MemberRole.ACCOMMODATION_ADMIN);
  if (!auth.authorized) {
    res.statusCode = auth.status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(JSON.stringify({ success: false, error: auth.error }));
    return;
  }

  const reconciliations = await activeRepos.reconciliations.listAll();
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(
    JSON.stringify({
      success: true,
      reconciliations,
    })
  );
}

/**
 * Request handler for POST /api/accommodation/admin/reconcile (H4D-FUNC-013)
 * Restricts to authenticated ACCOMMODATION_ADMIN role.
 */
export async function handleAdminReconcileRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  repos?: IHut4DevsRepositories,
  publisher?: OutboxPublisher
): Promise<void> {
  let bodyStr = '';
  req.on('data', (chunk) => {
    bodyStr += chunk;
  });

  req.on('end', async () => {
    try {
      const activeRepos = await resolveRepositories(repos);
      const session = await authenticateRequest(req, activeRepos);
      const auth = requireRole(session, MemberRole.ACCOMMODATION_ADMIN);
      if (!auth.authorized) {
        res.statusCode = auth.status;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.end(JSON.stringify({ success: false, error: auth.error }));
        return;
      }

      let body: any = {};
      try {
        body = JSON.parse(bodyStr || '{}');
      } catch {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload.' }));
        return;
      }

      const { providerEventId, provider = 'BMONI' } = body;
      if (!providerEventId) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.end(JSON.stringify({ success: false, error: 'providerEventId is required.' }));
        return;
      }

      const event = await activeRepos.providerEvents.findByProviderEventId(provider, providerEventId);
      if (!event) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.end(JSON.stringify({ success: false, error: `Provider event "${providerEventId}" not found.` }));
        return;
      }

      const result = await reconciliationEngine.reconcileProviderEvent(event, activeRepos, publisher);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.end(JSON.stringify({ success: true, result }));
    } catch (err: any) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.end(JSON.stringify({ success: false, error: err.message || 'Reconciliation execution failed.' }));
    }
  });
}

/**
 * Dispatches API requests to corresponding domain handlers.
 * Returns true if the request was handled, false if it was not an /api route.
 */
export async function handleApiRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  options: ServerOptions = {}
): Promise<boolean> {
  const rawUrl = req.url || '/';
  const parsedUrl = new URL(rawUrl, 'http://localhost');
  const pathname = parsedUrl.pathname;

  if (!pathname.startsWith('/api/')) {
    return false;
  }

  // 1. API: POST /api/payments/proposal
  if (pathname === '/api/payments/proposal' && req.method === 'POST') {
    await handlePaymentProposalRequest(
      req,
      res,
      options.customProvider,
      options.repos,
      options.publisher
    );
    return true;
  }

  // 2. API: GET /api/accommodation/responsibility
  if (pathname === '/api/accommodation/responsibility' && req.method === 'GET') {
    await handleAccommodationRequest(req, res, options.repos);
    return true;
  }

  // 3. API: POST /api/payments/intents
  if (pathname === '/api/payments/intents' && req.method === 'POST') {
    await handleSaveIntentRequest(req, res, options.repos, options.publisher);
    return true;
  }

  // 4. API: GET /api/accommodation/admin/stream (SSE Real-Time Stream - H4D-FUNC-010 & H4D-FUNC-011)
  if (pathname === '/api/accommodation/admin/stream' && req.method === 'GET') {
    await handleAdminStreamRequest(req, res, options.repos, options.publisher);
    return true;
  }

  // 5. API: GET /api/accommodation/admin/overview (H4D-FUNC-011)
  if (pathname === '/api/accommodation/admin/overview' && req.method === 'GET') {
    await handleAdminOverviewRequest(req, res, options.repos);
    return true;
  }

  // 6. API: GET /api/accommodation/outbox (Outbox Audit - H4D-FUNC-010 & H4D-FUNC-011)
  if (pathname === '/api/accommodation/outbox' && req.method === 'GET') {
    await handleOutboxListRequest(req, res, options.repos);
    return true;
  }

  // 7. API: GET /api/auth/session (H4D-FUNC-011)
  if (pathname === '/api/auth/session' && req.method === 'GET') {
    await handleGetSessionRequest(req, res, options.repos);
    return true;
  }

  // 8. API: POST /api/auth/dev-session (H4D-FUNC-011)
  if (pathname === '/api/auth/dev-session' && req.method === 'POST') {
    await handleDevSessionRequest(req, res, options.repos);
    return true;
  }

  // 9. API: GET /api/auth/dev-identities (H4D-FUNC-011)
  if (pathname === '/api/auth/dev-identities' && req.method === 'GET') {
    handleDevIdentitiesRequest(req, res);
    return true;
  }

  // 10. API: POST /api/auth/logout (H4D-FUNC-011)
  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    await handleLogoutRequest(req, res, options.repos);
    return true;
  }

  // 11. API: POST /api/webhooks/bmoni (BMONI Webhook Ingestion - H4D-FUNC-012)
  if (pathname === '/api/webhooks/bmoni' && req.method === 'POST') {
    await handleBmoniWebhookRequest(
      req,
      res,
      options.repos,
      options.publisher,
      options.bmoniWebhookSecret
    );
    return true;
  }

  // 12. API: GET /api/accommodation/admin/provider-events (H4D-FUNC-012)
  if (pathname === '/api/accommodation/admin/provider-events' && req.method === 'GET') {
    await handleAdminProviderEventsRequest(req, res, options.repos);
    return true;
  }

  // 13. API: GET /api/accommodation/admin/reconciliations (H4D-FUNC-013)
  if (pathname === '/api/accommodation/admin/reconciliations' && req.method === 'GET') {
    await handleAdminReconciliationsRequest(req, res, options.repos);
    return true;
  }

  // 14. API: POST /api/accommodation/admin/reconcile (H4D-FUNC-013)
  if (pathname === '/api/accommodation/admin/reconcile' && req.method === 'POST') {
    await handleAdminReconcileRequest(req, res, options.repos, options.publisher);
    return true;
  }

  // 15. API: GET /api/health
  if (pathname === '/api/health' && req.method === 'GET') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(
      JSON.stringify({
        status: 'ok',
        server: 'hut4devs-deployable',
        database: 'postgresql',
        endpoint: '/api/payments/proposal',
        timestamp: new Date().toISOString(),
      })
    );
    return true;
  }

  // Reject unknown /api routes with 404 JSON
  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify({ error: 'Endpoint not found.' }));
  return true;
}

/**
 * Creates the deployable Hut4Devs HTTP Server instance.
 * Exposes POST /api/payments/proposal, GET /api/accommodation/responsibility,
 * and POST /api/payments/intents outside of Vite.
 * Serves built static frontend from dist/ when available, with SPA routing fallback.
 */
export function createDeployableServer(options: ServerOptions = {}): http.Server {
  const distDir = options.distDir || path.join(process.cwd(), 'dist');

  const server = http.createServer(async (req, res) => {
    const rawUrl = req.url || '/';
    const parsedUrl = new URL(rawUrl, 'http://localhost');
    const pathname = parsedUrl.pathname;

    // Dispatch API requests
    if (pathname.startsWith('/api/')) {
      return handleApiRequest(req, res, options);
    }

    // Static frontend serving from dist/
    if (req.method === 'GET' || req.method === 'HEAD') {
      try {
        const resolvedDist = path.resolve(distDir);
        let safeRelativePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
        if (safeRelativePath.startsWith('/') || safeRelativePath.startsWith('\\')) {
          safeRelativePath = safeRelativePath.slice(1);
        }

        const potentialFilePath = path.join(resolvedDist, safeRelativePath);

        // Security check: ensure path stays within distDir
        if (!potentialFilePath.startsWith(resolvedDist)) {
          res.statusCode = 403;
          res.end('Forbidden');
          return;
        }

        // Check if static file exists
        if (fs.existsSync(potentialFilePath) && fs.statSync(potentialFilePath).isFile()) {
          const ext = path.extname(potentialFilePath).toLowerCase();
          const contentType = MIME_TYPES[ext] || 'application/octet-stream';
          res.statusCode = 200;
          res.setHeader('Content-Type', contentType);
          if (ext === '.html') {
            res.setHeader('Cache-Control', 'no-cache');
          } else {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
          if (req.method === 'HEAD') {
            res.end();
            return;
          }
          fs.createReadStream(potentialFilePath).pipe(res);
          return;
        }

        // SPA Fallback: Serve dist/index.html for client-side navigation routes
        const indexPath = path.join(resolvedDist, 'index.html');
        if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache');
          if (req.method === 'HEAD') {
            res.end();
            return;
          }
          fs.createReadStream(indexPath).pipe(res);
          return;
        }

        // If dist not yet built
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(
          `<!DOCTYPE html><html><head><title>Hut4Devs Server</title></head><body><h1>Hut4Devs Deployable Server</h1><p>Server is running. Payment API endpoint is active at <code>POST /api/payments/proposal</code>.</p><p>Frontend assets are not yet built. Run <code>npm run build</code> to compile static assets.</p></body></html>`
        );
        return;
      } catch (err: any) {
        res.statusCode = 500;
        res.end('Server Error');
        return;
      }
    }

    res.statusCode = 405;
    res.end('Method Not Allowed');
  });

  return server;
}

/**
 * Starts the deployable server on specified port (default 3000).
 */
export function startDeployableServer(
  port = Number(process.env.PORT) || 3000,
  host = '0.0.0.0',
  options: ServerOptions = {}
): Promise<{ server: http.Server; port: number; url: string }> {
  return new Promise((resolve, reject) => {
    const server = createDeployableServer(options);

    server.on('error', (err) => {
      reject(err);
    });

    server.listen(port, host, () => {
      const addr = server.address();
      const actualPort = typeof addr === 'object' && addr ? addr.port : port;
      const url = `http://${host === '0.0.0.0' ? 'localhost' : host}:${actualPort}`;
      console.log(`[Hut4Devs] Deployable Payment Server running at ${url}`);
      console.log(`[Hut4Devs] Payment Endpoint: POST ${url}/api/payments/proposal`);
      resolve({ server, port: actualPort, url });
    });
  });
}

// Auto-start if executed directly via Node (supports both CommonJS bundle and direct execution)
const isDirectRun =
  (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) ||
  (Boolean(process.argv[1]) && (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.cjs')));

if (isDirectRun) {
  startDeployableServer().catch((err) => {
    console.error('[Hut4Devs] Failed to start server:', err);
    process.exit(1);
  });
}
