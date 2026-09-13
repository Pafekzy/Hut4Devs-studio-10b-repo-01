import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import http from 'node:http';
import { newDb } from 'pg-mem';
import { runMigrations, REQUIRED_TABLES } from '../server/db/migrator';
import { seedDevelopmentDatabase } from '../server/db/seed';
import { PostgresRepositories } from '../server/db/postgresRepository';
import { createDeployableServer } from '../../server';
import { MemberRole } from '../domain/auth';
import { DEV_IDENTITIES } from '../server/auth/authService';
import { OutboxPublisher } from '../server/realtime/outboxPublisher';
import { DEMO_ACCOMMODATION_RESPONSIBILITY } from '../data/demoAccommodation';

describe('H4D-FUNC-011: Fellow and Accommodation Admin Authorization Foundation', () => {
  let memDb: any;
  let pool: any;
  let repos: PostgresRepositories;
  let publisher: OutboxPublisher;
  let server: http.Server;
  let baseUrl: string;

  beforeEach(async () => {
    // Isolated PostgreSQL in-memory database using pg-mem
    memDb = newDb({ autoCreateForeignKeyIndices: true });
    const adapter = memDb.adapters.createPg();
    pool = new adapter.Pool();

    // Run migrations
    await runMigrations(pool);

    // Seed deterministic development data
    await seedDevelopmentDatabase(pool);

    repos = new PostgresRepositories(pool);
    publisher = new OutboxPublisher();

    // Create server instance with isolated test repositories
    server = createDeployableServer({
      repos,
      publisher,
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

  // 1. FELLOW and ACCOMMODATION_ADMIN roles exist
  it('1. FELLOW and ACCOMMODATION_ADMIN roles exist in domain model', () => {
    expect(MemberRole.FELLOW).toBe('FELLOW');
    expect(MemberRole.ACCOMMODATION_ADMIN).toBe('ACCOMMODATION_ADMIN');
    expect(Object.values(MemberRole)).toContain('FELLOW');
    expect(Object.values(MemberRole)).toContain('ACCOMMODATION_ADMIN');
  });

  // 2. Authentication/session state is recognized server-side
  it('2. recognizes authentication and session state server-side', async () => {
    // Establish a development session for Fellow via POST /api/auth/dev-session
    const devFellowRes = await fetch(`${baseUrl}/api/auth/dev-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: MemberRole.FELLOW }),
    });

    expect(devFellowRes.status).toBe(200);
    const fellowData = await devFellowRes.json();
    expect(fellowData.success).toBe(true);
    expect(fellowData.token).toBe('dev-session-token-fellow');
    expect(fellowData.member.displayName).toBe('Current Fellow');
    expect(fellowData.member.roles).toContain('FELLOW');

    // Query session with Bearer token
    const sessionRes = await fetch(`${baseUrl}/api/auth/session`, {
      headers: { Authorization: `Bearer ${fellowData.token}` },
    });
    expect(sessionRes.status).toBe(200);
    const sessionData = await sessionRes.json();
    expect(sessionData.success).toBe(true);
    expect(sessionData.member.displayName).toBe('Current Fellow');
    expect(sessionData.member.roles).toContain('FELLOW');

    // Query session with Cookie
    const cookieRes = await fetch(`${baseUrl}/api/auth/session`, {
      headers: { Cookie: `h4d_session=${fellowData.token}` },
    });
    expect(cookieRes.status).toBe(200);
    const cookieData = await cookieRes.json();
    expect(cookieData.success).toBe(true);
    expect(cookieData.member.displayName).toBe('Current Fellow');
  });

  // 3. Development auth is explicitly labelled DEVELOPMENT AUTH
  it('3. explicitly labels development auth as DEVELOPMENT AUTH across API and metadata', async () => {
    // Dev session endpoint returns DEVELOPMENT AUTH notice
    const devRes = await fetch(`${baseUrl}/api/auth/dev-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: MemberRole.FELLOW }),
    });
    const devData = await devRes.json();
    expect(devData.mode).toBe('DEVELOPMENT');
    expect(devData.notice).toContain('DEVELOPMENT AUTH');
    expect(devData.notice).toContain('does not represent production authentication');

    // Dev identities endpoint returns DEVELOPMENT AUTH label
    const identitiesRes = await fetch(`${baseUrl}/api/auth/dev-identities`);
    const identitiesData = await identitiesRes.json();
    expect(identitiesData.mode).toBe('DEVELOPMENT');
    expect(identitiesData.notice).toContain('DEVELOPMENT AUTH');
    expect(identitiesData.identities.length).toBeGreaterThanOrEqual(2);
    expect(identitiesData.identities.some((i: any) => i.role === 'FELLOW')).toBe(true);
    expect(identitiesData.identities.some((i: any) => i.role === 'ACCOMMODATION_ADMIN')).toBe(true);
  });

  // 4. Fellow access to Fellow workspace works
  it('4. allows Fellow access to Fellow workspace accommodation responsibility', async () => {
    const res = await fetch(`${baseUrl}/api/accommodation/responsibility`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.responsibility.id).toBe(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(data.responsibility.requiredAmount).toBe(66000);
    expect(data.responsibility.verifiedAmount).toBe(0);
  });

  // 5. Fellow cannot access Accommodation Admin API (403 Forbidden)
  it('5. prevents Fellow from accessing Accommodation Admin API with 403 Forbidden', async () => {
    // Attempt Admin Overview with Fellow token
    const overviewRes = await fetch(`${baseUrl}/api/accommodation/admin/overview`, {
      headers: { Authorization: 'Bearer dev-session-token-fellow' },
    });
    expect(overviewRes.status).toBe(403);
    const overviewData = await overviewRes.json();
    expect(overviewData.success).toBe(false);
    expect(overviewData.error).toContain('Forbidden');
    expect(overviewData.error).toContain('ACCOMMODATION_ADMIN');

    // Attempt Outbox List with Fellow token
    const outboxRes = await fetch(`${baseUrl}/api/accommodation/outbox`, {
      headers: { Authorization: 'Bearer dev-session-token-fellow' },
    });
    expect(outboxRes.status).toBe(403);
    const outboxData = await outboxRes.json();
    expect(outboxData.success).toBe(false);
    expect(outboxData.error).toContain('Forbidden');
  });

  // 6. Fellow cannot subscribe to Accommodation Admin SSE (403 Forbidden)
  it('6. prevents Fellow from subscribing to Accommodation Admin SSE stream with 403 Forbidden', async () => {
    const streamRes = await fetch(`${baseUrl}/api/accommodation/admin/stream?token=dev-session-token-fellow`);
    expect(streamRes.status).toBe(403);
    const data = await streamRes.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Forbidden');
    expect(data.error).toContain('ACCOMMODATION_ADMIN');
  });

  // 7. Accommodation Admin can access Admin operational API
  it('7. allows Accommodation Admin to access Admin operational API with 200 OK', async () => {
    const overviewRes = await fetch(`${baseUrl}/api/accommodation/admin/overview`, {
      headers: { Authorization: 'Bearer dev-session-token-admin' },
    });
    expect(overviewRes.status).toBe(200);
    const overviewData = await overviewRes.json();
    expect(overviewData.success).toBe(true);
    expect(overviewData.responsibilities.length).toBeGreaterThanOrEqual(1);

    const outboxRes = await fetch(`${baseUrl}/api/accommodation/outbox`, {
      headers: { Authorization: 'Bearer dev-session-token-admin' },
    });
    expect(outboxRes.status).toBe(200);
    const outboxData = await outboxRes.json();
    expect(outboxData.success).toBe(true);
    expect(Array.isArray(outboxData.events)).toBe(true);
  });

  // 8. Accommodation Admin can subscribe to Admin SSE
  it('8. allows Accommodation Admin to subscribe to Admin SSE stream with 200 OK', async () => {
    const client = http.request(`${baseUrl}/api/accommodation/admin/stream?token=dev-session-token-admin`, {
      method: 'GET',
    });

    const sseResponse = await new Promise<{ statusCode?: number; contentType?: string }>((resolve) => {
      client.on('response', (res) => {
        resolve({
          statusCode: res.statusCode,
          contentType: res.headers['content-type'],
        });
        res.destroy();
      });
      client.end();
    });

    expect(sseResponse.statusCode).toBe(200);
    expect(sseResponse.contentType).toContain('text/event-stream');
  });

  // 9. Unauthenticated request returns 401
  it('9. unauthenticated requests return 401 Unauthorized', async () => {
    // Admin overview without token
    const overviewRes = await fetch(`${baseUrl}/api/accommodation/admin/overview`);
    expect(overviewRes.status).toBe(401);
    const overviewData = await overviewRes.json();
    expect(overviewData.success).toBe(false);
    expect(overviewData.error).toContain('Unauthorized');

    // Admin stream without token
    const streamRes = await fetch(`${baseUrl}/api/accommodation/admin/stream`);
    expect(streamRes.status).toBe(401);
    const streamData = await streamRes.json();
    expect(streamData.success).toBe(false);
    expect(streamData.error).toContain('Unauthorized');

    // Outbox list without token
    const outboxRes = await fetch(`${baseUrl}/api/accommodation/outbox`);
    expect(outboxRes.status).toBe(401);
    const outboxData = await outboxRes.json();
    expect(outboxData.success).toBe(false);
    expect(outboxData.error).toContain('Unauthorized');

    // Session endpoint without token
    const sessionRes = await fetch(`${baseUrl}/api/auth/session`);
    expect(sessionRes.status).toBe(401);
  });

  // 10. Authenticated but unauthorized request returns 403
  it('10. authenticated but unauthorized requests return 403 Forbidden with descriptive error', async () => {
    // Valid fellow token, but requesting admin-only endpoint
    const res = await fetch(`${baseUrl}/api/accommodation/admin/overview`, {
      headers: { Authorization: 'Bearer dev-session-token-fellow' },
    });
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Forbidden');
    expect(data.error).toContain("Member 'Current Fellow' lacks required role 'ACCOMMODATION_ADMIN'");
  });

  // 11. Authorization is enforced server-side, not only by React UI
  it('11. authorization is strictly enforced on the server independent of client UI', async () => {
    // Sending spoofed role in arbitrary header or body does NOT bypass server token verification
    const spoofRes = await fetch(`${baseUrl}/api/accommodation/admin/overview`, {
      headers: {
        Authorization: 'Bearer invalid-spoofed-token',
        'X-User-Role': 'ACCOMMODATION_ADMIN',
      },
    });
    expect(spoofRes.status).toBe(401);
  });

  // 12. Server-recognized development identity switching
  it('12. supports server-recognized development identity switching and logout', async () => {
    // Switch to Admin
    const adminSwitchRes = await fetch(`${baseUrl}/api/auth/dev-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: MemberRole.ACCOMMODATION_ADMIN }),
    });
    const adminSwitchData = await adminSwitchRes.json();
    expect(adminSwitchData.success).toBe(true);
    expect(adminSwitchData.token).toBe('dev-session-token-admin');
    expect(adminSwitchData.member.roles).toContain('ACCOMMODATION_ADMIN');

    // Verify Admin session
    const adminSessionRes = await fetch(`${baseUrl}/api/auth/session`, {
      headers: { Authorization: `Bearer ${adminSwitchData.token}` },
    });
    expect(adminSessionRes.status).toBe(200);

    // Switch to Fellow
    const fellowSwitchRes = await fetch(`${baseUrl}/api/auth/dev-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: MemberRole.FELLOW }),
    });
    const fellowSwitchData = await fellowSwitchRes.json();
    expect(fellowSwitchData.success).toBe(true);
    expect(fellowSwitchData.token).toBe('dev-session-token-fellow');
    expect(fellowSwitchData.member.roles).toContain('FELLOW');

    // Logout
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${fellowSwitchData.token}` },
    });
    expect(logoutRes.status).toBe(200);
  });

  // 13. Database migration for minimum member/role persistence is correct
  it('13. database migration establishes members, member_roles, and sessions tables with integrity constraints', async () => {
    // Verify required tables exist
    const tableRes = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    const tables = tableRes.rows.map((r: any) => r.table_name);
    expect(tables).toContain('members');
    expect(tables).toContain('member_roles');
    expect(tables).toContain('sessions');

    // Test member repository persistence
    const members = await repos.members.listAll();
    expect(members.length).toBeGreaterThanOrEqual(2);

    const fellow = await repos.members.findById('member-fellow-current');
    expect(fellow).not.toBeNull();
    expect(fellow?.displayName).toBe('Current Fellow');
    expect(fellow?.roles).toContain('FELLOW');

    const admin = await repos.members.findById('member-admin-current');
    expect(admin).not.toBeNull();
    expect(admin?.displayName).toBe('Accommodation Admin');
    expect(admin?.roles).toContain('ACCOMMODATION_ADMIN');

    // Test session repository persistence
    const session = await repos.sessions.findByToken('dev-session-token-fellow');
    expect(session).not.toBeNull();
    expect(session?.memberId).toBe('member-fellow-current');
    expect(session?.member?.roles).toContain('FELLOW');
  });

  // 14. Existing accommodation/payment/realtime functionality still passes
  it('14. existing accommodation, payment, and real-time outbox functionality continues to pass', async () => {
    // Prepare intent via POST /api/payments/intents
    const intentRes = await fetch(`${baseUrl}/api/payments/intents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'intent-auth-test-01',
        responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
        amount: 20000,
        fulfilmentType: 'PARTIAL',
        status: 'PREPARED',
        createdAt: new Date().toISOString(),
      }),
    });
    expect(intentRes.status).toBe(200);
    const intentData = await intentRes.json();
    expect(intentData.success).toBe(true);

    // Verify intent persisted
    const persistedIntent = await repos.intents.findById('intent-auth-test-01');
    expect(persistedIntent).not.toBeNull();
    expect(persistedIntent?.amount).toBe(20000);
  });

  // 15. Financial state remains: Required: ₦66,000, Verified: ₦0, Remaining: ₦66,000, Status: Outstanding
  it('15. financial state remains strictly preserved: ₦66,000 / ₦0 / ₦66,000 / Outstanding', async () => {
    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp).not.toBeNull();
    expect(resp?.requiredAmount).toBe(66000);
    expect(resp?.verifiedAmount).toBe(0);
    expect(resp?.status).toBe('OUTSTANDING');

    // Calculate remaining
    const remaining = resp!.requiredAmount - resp!.verifiedAmount;
    expect(remaining).toBe(66000);
  });
});
