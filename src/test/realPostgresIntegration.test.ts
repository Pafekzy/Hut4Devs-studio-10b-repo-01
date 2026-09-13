import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import pg from 'pg';
import { ensureRealPostgresServer, RealPostgresInfo } from './realPostgresManager';
import { runMigrations, REQUIRED_TABLES } from '../server/db/migrator';
import { seedDevelopmentDatabase } from '../server/db/seed';
import { PostgresRepositories } from '../server/db/postgresRepository';
import {
  ResponsibilityStatus,
  FulfilmentType,
  PaymentIntentStatus,
  AccommodationPaymentIntent,
} from '../domain/accommodation';
import { ExternalPaymentProposal } from '../domain/payments';
import { DEMO_ACCOMMODATION_RESPONSIBILITY } from '../data/demoAccommodation';

const pgInfo = await ensureRealPostgresServer();

describe.skipIf(!pgInfo.available)('H4D-FUNC-009: Real PostgreSQL Persistence Integration Validation', () => {
  let pool: pg.Pool;
  let repos: PostgresRepositories;

  beforeAll(async () => {
    pool = new pg.Pool({
      connectionString: pgInfo.connectionString,
    });

    // Clean public schema to guarantee an isolated, deterministic execution
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

    repos = new PostgresRepositories(pool);
  });

  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
  });

  // 1. DATABASE_URL connection succeeds
  it('1. DATABASE_URL connection succeeds against real PostgreSQL server', async () => {
    const res = await pool.query('SELECT version();');
    expect(res.rows.length).toBe(1);
    expect(res.rows[0].version).toMatch(/PostgreSQL/i);
  });

  // 2. 001_initial_schema migration executes
  it('2. 001_initial_schema migration executes on clean PostgreSQL schema', async () => {
    const applied = await runMigrations(pool);
    expect(applied).toContain('001_initial_schema');
  });

  // 3. schema_migrations is populated
  it('3. schema_migrations table is populated with 001_initial_schema', async () => {
    const res = await pool.query('SELECT version, applied_at FROM schema_migrations;');
    expect(res.rows.length).toBeGreaterThanOrEqual(1);
    const versions = res.rows.map((r) => r.version);
    expect(versions).toContain('001_initial_schema');
    expect(res.rows[0].applied_at).toBeDefined();
  });

  // 4. accommodation_responsibilities exists
  it('4. accommodation_responsibilities table exists in public schema', async () => {
    const res = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'accommodation_responsibilities'
    `);
    expect(res.rows.length).toBe(1);
    expect(res.rows[0].table_name).toBe('accommodation_responsibilities');
  });

  // 5. payment_intents exists
  it('5. payment_intents table exists in public schema', async () => {
    const res = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'payment_intents'
    `);
    expect(res.rows.length).toBe(1);
    expect(res.rows[0].table_name).toBe('payment_intents');
  });

  // 6. external_payment_proposals exists
  it('6. external_payment_proposals table exists in public schema', async () => {
    const res = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'external_payment_proposals'
    `);
    expect(res.rows.length).toBe(1);
    expect(res.rows[0].table_name).toBe('external_payment_proposals');
  });

  // 7. foreign keys are enforced by PostgreSQL engine
  it('7. foreign keys are enforced by PostgreSQL engine', async () => {
    // Attempting to insert payment_intent referencing non-existent responsibility must fail
    let intentFkFailed = false;
    try {
      await pool.query(`
        INSERT INTO payment_intents (id, responsibility_id, amount, fulfilment_type, status)
        VALUES ('invalid-intent-id', 'non-existent-resp', 10000, 'FULL', 'PREPARED');
      `);
    } catch (err: any) {
      intentFkFailed = true;
      // PostgreSQL error code 23503 is foreign_key_violation
      expect(err.code).toBe('23503');
    }
    expect(intentFkFailed).toBe(true);

    // Attempting to insert proposal referencing non-existent payment_intent must fail
    let proposalFkFailed = false;
    try {
      await pool.query(`
        INSERT INTO external_payment_proposals (id, payment_intent_id, provider, provider_proposal_id, provider_status, is_simulated)
        VALUES ('invalid-prop-id', 'non-existent-intent', 'BMONI_SANDBOX', 'ext-123', 'PROPOSAL_GENERATED', false);
      `);
    } catch (err: any) {
      proposalFkFailed = true;
      expect(err.code).toBe('23503');
    }
    expect(proposalFkFailed).toBe(true);
  });

  // 8. deterministic seed works
  it('8. deterministic seed works without modifying verifiedAmount or status', async () => {
    await seedDevelopmentDatabase(pool);

    const res = await pool.query(
      'SELECT * FROM accommodation_responsibilities WHERE id = $1',
      [DEMO_ACCOMMODATION_RESPONSIBILITY.id]
    );
    expect(res.rows.length).toBe(1);
    const row = res.rows[0];
    expect(row.id).toBe(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(Number(row.required_amount)).toBe(66000);
    expect(Number(row.verified_amount)).toBe(0);
    expect(row.status).toBe(ResponsibilityStatus.OUTSTANDING);
    expect(row.property_name).toBe('Infinite Grace Apartments');
    expect(row.floor_name).toBe('Floor 3');
    expect(row.room_name).toBe('Room 3B');
    expect(row.fellow_name).toBe('Current Fellow');
  });

  // 9. Accommodation Responsibility persists
  it('9. Accommodation Responsibility persists and maps through repository correctly', async () => {
    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp).not.toBeNull();
    expect(resp?.id).toBe(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp?.fellowId).toBe(DEMO_ACCOMMODATION_RESPONSIBILITY.fellowId);
    expect(resp?.title).toBe('September Accommodation');
    expect(resp?.requiredAmount).toBe(66000);
    expect(resp?.verifiedAmount).toBe(0);
    expect(resp?.status).toBe(ResponsibilityStatus.OUTSTANDING);
    expect(resp?.currency).toBe('NGN');
    expect(resp?.accommodationContext.property.name).toBe('Infinite Grace Apartments');
    expect(resp?.accommodationContext.floor.name).toBe('Floor 3');
    expect(resp?.accommodationContext.room.name).toBe('Room 3B');
    expect(resp?.fellow.name).toBe('Current Fellow');
  });

  // 10. Prepared Payment Intent persists
  it('10. Prepared Payment Intent persists and does NOT modify verifiedAmount or status', async () => {
    const testIntent: AccommodationPaymentIntent = {
      id: 'intent-real-pg-test-01',
      responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
      amount: 30000,
      fulfilmentType: FulfilmentType.PARTIAL,
      status: PaymentIntentStatus.PREPARED,
      createdAt: new Date().toISOString(),
    };

    await repos.intents.save(testIntent);

    const loaded = await repos.intents.findById(testIntent.id);
    expect(loaded).not.toBeNull();
    expect(loaded?.id).toBe(testIntent.id);
    expect(loaded?.responsibilityId).toBe(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(loaded?.amount).toBe(30000);
    expect(loaded?.status).toBe(PaymentIntentStatus.PREPARED);

    // Responsibility remains unaffected
    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp?.verifiedAmount).toBe(0);
    expect(resp?.requiredAmount).toBe(66000);
    expect(resp?.status).toBe(ResponsibilityStatus.OUTSTANDING);
  });

  // 11. External Payment Proposal persists
  it('11. External Payment Proposal persists linked to intent', async () => {
    const testProposal: ExternalPaymentProposal = {
      id: 'proposal-real-pg-test-01',
      paymentIntentId: 'intent-real-pg-test-01',
      responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
      amount: 30000,
      currency: 'NGN',
      provider: 'BMONI',
      providerProposalId: 'bmoni-prop-real-999',
      providerStatus: 'PROPOSAL_GENERATED',
      isSimulated: true,
      createdAt: new Date().toISOString(),
    };

    await repos.proposals.save(testProposal);

    const loaded = await repos.proposals.findById(testProposal.id);
    expect(loaded).not.toBeNull();
    expect(loaded?.id).toBe(testProposal.id);
    expect(loaded?.paymentIntentId).toBe('intent-real-pg-test-01');
    expect(loaded?.amount).toBe(30000);
    expect(loaded?.provider).toBe('BMONI');
    expect(loaded?.providerStatus).toBe('PROPOSAL_GENERATED');
    expect(loaded?.isSimulated).toBe(true);

    const byIntent = await repos.proposals.findByIntentId('intent-real-pg-test-01');
    expect(byIntent?.id).toBe(testProposal.id);
  });

  // 12. records survive disconnect/reconnect
  it('12. records survive database disconnect and reconnect with a fresh pool', async () => {
    // Disconnect current pool
    await pool.end();

    // Reconnect with a fresh pool
    const newPool = new pg.Pool({
      connectionString: pgInfo.connectionString,
    });
    const freshRepos = new PostgresRepositories(newPool);

    try {
      // Responsibility survives
      const resp = await freshRepos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
      expect(resp).not.toBeNull();
      expect(resp?.id).toBe(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
      expect(resp?.requiredAmount).toBe(66000);
      expect(resp?.verifiedAmount).toBe(0);
      expect(resp?.status).toBe(ResponsibilityStatus.OUTSTANDING);

      // Prepared intent survives
      const intent = await freshRepos.intents.findById('intent-real-pg-test-01');
      expect(intent).not.toBeNull();
      expect(intent?.amount).toBe(30000);
      expect(intent?.status).toBe(PaymentIntentStatus.PREPARED);

      // Proposal survives
      const proposal = await freshRepos.proposals.findById('proposal-real-pg-test-01');
      expect(proposal).not.toBeNull();
      expect(proposal?.providerProposalId).toBe('bmoni-prop-real-999');
      expect(proposal?.providerStatus).toBe('PROPOSAL_GENERATED');
    } finally {
      // Re-assign pool for afterAll
      pool = newPool;
      repos = freshRepos;
    }
  });

  // 13. ON DELETE RESTRICT behaves correctly
  it('13. ON DELETE RESTRICT prevents deleting referenced responsibility and intent', async () => {
    // 13a. Attempting to delete accommodation_responsibilities when payment_intents reference it
    let respDeleteBlocked = false;
    try {
      await pool.query(
        'DELETE FROM accommodation_responsibilities WHERE id = $1',
        [DEMO_ACCOMMODATION_RESPONSIBILITY.id]
      );
    } catch (err: any) {
      respDeleteBlocked = true;
      // PostgreSQL error code 23503 is foreign_key_violation
      expect(err.code).toBe('23503');
    }
    expect(respDeleteBlocked).toBe(true);

    // 13b. Attempting to delete payment_intents when external_payment_proposals reference it
    let intentDeleteBlocked = false;
    try {
      await pool.query(
        'DELETE FROM payment_intents WHERE id = $1',
        ['intent-real-pg-test-01']
      );
    } catch (err: any) {
      intentDeleteBlocked = true;
      expect(err.code).toBe('23503');
    }
    expect(intentDeleteBlocked).toBe(true);
  });

  // Critical State Verification
  it('Critical State Verification: amounts and status remain strictly unchanged', async () => {
    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp).not.toBeNull();
    expect(resp?.requiredAmount).toBe(66000);
    expect(resp?.verifiedAmount).toBe(0);
    expect(resp?.requiredAmount! - resp?.verifiedAmount!).toBe(66000);
    expect(resp?.status).toBe(ResponsibilityStatus.OUTSTANDING);
  });
});
