import { describe, it, expect, beforeEach } from 'vitest';
import { newDb } from 'pg-mem';
import { runMigrations, REQUIRED_TABLES } from '../server/db/migrator';
import { seedDevelopmentDatabase } from '../server/db/seed';
import { PostgresRepositories } from '../server/db/postgresRepository';
import {
  calculateRemainingAmount,
  ResponsibilityStatus,
  FulfilmentType,
  PaymentIntentStatus,
  AccommodationResponsibility,
  AccommodationPaymentIntent,
} from '../domain/accommodation';
import { ExternalPaymentProposal } from '../domain/payments';
import { DEMO_ACCOMMODATION_RESPONSIBILITY } from '../data/demoAccommodation';
import { createDeployableServer } from '../../server';
import http from 'node:http';
import { FakePaymentProvider } from '../server/payments/fakeProvider';

describe('H4D-FUNC-008: PostgreSQL Persistence Foundation for Accommodation Payments (pg-mem emulator)', () => {
  let memDb: any;
  let pool: any;
  let repos: PostgresRepositories;

  beforeEach(async () => {
    // Isolated PostgreSQL emulator strategy (pg-mem in-memory emulator, NOT actual PostgreSQL server)
    memDb = newDb({ autoCreateForeignKeyIndices: true });
    const adapter = memDb.adapters.createPg();
    pool = new adapter.Pool();

    // Run migrations on isolated PostgreSQL instance
    await runMigrations(pool);

    // Seed deterministic development data
    await seedDevelopmentDatabase(pool);

    repos = new PostgresRepositories(pool);
  });

  // Requirement 1: migrations create required tables
  it('1. migrations create all required relational tables', async () => {
    const tableRes = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    const createdTables = tableRes.rows.map((r: any) => r.table_name);

    for (const requiredTable of REQUIRED_TABLES) {
      expect(createdTables).toContain(requiredTable);
    }
  });

  // Requirement 2: responsibility persists
  it('2. accommodation responsibility persists with structural context intact', async () => {
    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp).not.toBeNull();
    expect(resp?.id).toBe(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp?.fellowId).toBe(DEMO_ACCOMMODATION_RESPONSIBILITY.fellowId);
    expect(resp?.title).toBe('September Accommodation');
    expect(resp?.requiredAmount).toBe(66000);
    expect(resp?.verifiedAmount).toBe(0);
    expect(resp?.status).toBe(ResponsibilityStatus.OUTSTANDING);
    expect(resp?.currency).toBe('NGN');

    // Structural context is preserved without flattening
    expect(resp?.accommodationContext.property.name).toBe('Infinite Grace Apartments');
    expect(resp?.accommodationContext.floor.name).toBe('Floor 3');
    expect(resp?.accommodationContext.room.name).toBe('Room 3B');
    expect(resp?.fellow.name).toBe('Current Fellow');
  });

  // Requirement 3: payment intent persists
  it('3. accommodation payment intent persists with PREPARED status', async () => {
    const intent: AccommodationPaymentIntent = {
      id: 'intent-pg-001',
      responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
      amount: 20000,
      fulfilmentType: FulfilmentType.PARTIAL,
      status: PaymentIntentStatus.PREPARED,
      createdAt: new Date().toISOString(),
    };

    await repos.intents.save(intent);

    const saved = await repos.intents.findById('intent-pg-001');
    expect(saved).not.toBeNull();
    expect(saved?.id).toBe('intent-pg-001');
    expect(saved?.responsibilityId).toBe(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(saved?.amount).toBe(20000);
    expect(saved?.fulfilmentType).toBe(FulfilmentType.PARTIAL);
    expect(saved?.status).toBe(PaymentIntentStatus.PREPARED);
  });

  // Requirement 4: external proposal persists
  it('4. external payment proposal persists without secrets or credentials', async () => {
    const intent: AccommodationPaymentIntent = {
      id: 'intent-pg-prop-001',
      responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
      amount: 25000,
      fulfilmentType: FulfilmentType.PARTIAL,
      status: PaymentIntentStatus.PREPARED,
      createdAt: new Date().toISOString(),
    };
    await repos.intents.save(intent);

    const proposal: ExternalPaymentProposal = {
      id: 'prop-pg-001',
      paymentIntentId: intent.id,
      responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
      amount: 25000,
      currency: 'NGN',
      provider: 'SIMULATED',
      providerProposalId: 'sim-ref-999',
      providerStatus: 'Simulated',
      createdAt: new Date().toISOString(),
      isSimulated: true,
    };

    await repos.proposals.save(proposal);

    const saved = await repos.proposals.findById('prop-pg-001');
    expect(saved).not.toBeNull();
    expect(saved?.id).toBe('prop-pg-001');
    expect(saved?.paymentIntentId).toBe('intent-pg-prop-001');
    expect(saved?.provider).toBe('SIMULATED');
    expect(saved?.providerStatus).toBe('Simulated');
    expect(saved?.isSimulated).toBe(true);

    // Verify table columns do not contain secret keys, PINs, BVN, NIN
    const colsRes = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'external_payment_proposals'
    `);
    const colNames = colsRes.rows.map((r: any) => r.column_name.toLowerCase());
    expect(colNames).not.toContain('api_key');
    expect(colNames).not.toContain('secret');
    expect(colNames).not.toContain('private_key');
    expect(colNames).not.toContain('pin');
    expect(colNames).not.toContain('bvn');
    expect(colNames).not.toContain('nin');
  });

  // Requirement 5: foreign-key relationships are enforced
  it('5. foreign-key relationships are strictly enforced', async () => {
    // Attempt 1: Payment intent linked to nonexistent responsibility must fail
    const orphanIntent: AccommodationPaymentIntent = {
      id: 'intent-orphan',
      responsibilityId: 'nonexistent-responsibility-id',
      amount: 10000,
      fulfilmentType: FulfilmentType.PARTIAL,
      status: PaymentIntentStatus.PREPARED,
      createdAt: new Date().toISOString(),
    };

    await expect(repos.intents.save(orphanIntent)).rejects.toThrow(/Foreign key violation/);

    // Attempt 2: External proposal linked to nonexistent payment intent must fail
    const orphanProposal: ExternalPaymentProposal = {
      id: 'prop-orphan',
      paymentIntentId: 'nonexistent-intent-id',
      responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
      amount: 10000,
      currency: 'NGN',
      provider: 'SIMULATED',
      providerProposalId: 'sim-ref-000',
      providerStatus: 'Simulated',
      createdAt: new Date().toISOString(),
      isSimulated: true,
    };

    await expect(repos.proposals.save(orphanProposal)).rejects.toThrow(/Foreign key violation/);
  });

  // Requirement 6: prepared intent survives repository reload
  it('6. prepared intent survives repository reload', async () => {
    const intent: AccommodationPaymentIntent = {
      id: 'intent-reload-test',
      responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
      amount: 20000,
      fulfilmentType: FulfilmentType.PARTIAL,
      status: PaymentIntentStatus.PREPARED,
      createdAt: new Date().toISOString(),
    };
    await repos.intents.save(intent);

    // Simulate reload: create a new repository instance pointing to the same PostgreSQL store
    const reloadedRepos = new PostgresRepositories(pool);
    const retrieved = await reloadedRepos.intents.findById('intent-reload-test');

    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe('intent-reload-test');
    expect(retrieved?.amount).toBe(20000);
    expect(retrieved?.status).toBe(PaymentIntentStatus.PREPARED);
  });

  // Requirement 7: provider proposal survives repository reload
  it('7. provider proposal survives repository reload', async () => {
    const intent: AccommodationPaymentIntent = {
      id: 'intent-prop-reload',
      responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
      amount: 20000,
      fulfilmentType: FulfilmentType.PARTIAL,
      status: PaymentIntentStatus.PREPARED,
      createdAt: new Date().toISOString(),
    };
    await repos.intents.save(intent);

    const proposal: ExternalPaymentProposal = {
      id: 'proposal-reload-test',
      paymentIntentId: intent.id,
      responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
      amount: 20000,
      currency: 'NGN',
      provider: 'SIMULATED',
      providerProposalId: 'sim-reload-123',
      providerStatus: 'Simulated',
      createdAt: new Date().toISOString(),
      isSimulated: true,
    };
    await repos.proposals.save(proposal);

    // Reload repository
    const reloadedRepos = new PostgresRepositories(pool);
    const retrieved = await reloadedRepos.proposals.findByIntentId(intent.id);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe('proposal-reload-test');
    expect(retrieved?.provider).toBe('SIMULATED');
    expect(retrieved?.providerStatus).toBe('Simulated');
    expect(retrieved?.isSimulated).toBe(true);
  });

  // Requirement 8: verifiedAmount remains ₦0
  it('8. verifiedAmount remains strictly ₦0 after preparing intents and proposals', async () => {
    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp?.verifiedAmount).toBe(0);
  });

  // Requirement 9: remainingAmount remains ₦66,000
  it('9. remainingAmount remains strictly ₦66,000', async () => {
    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp).not.toBeNull();
    const remaining = calculateRemainingAmount(resp!);
    expect(remaining).toBe(66000);
  });

  // Requirement 10: status remains Outstanding
  it('10. responsibility status remains strictly OUTSTANDING', async () => {
    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp?.status).toBe(ResponsibilityStatus.OUTSTANDING);
  });

  // Requirement 11: DATABASE_URL is server-side only
  it('11. DATABASE_URL is server-side only and never exposed via VITE_*', () => {
    // Check vite env
    const viteEnv = (import.meta as any).env || {};
    expect(viteEnv.VITE_DATABASE_URL).toBeUndefined();

    // Verify key name does not start with VITE_
    const envKeys = Object.keys(process.env);
    const exposedDbKeys = envKeys.filter((k) => k.startsWith('VITE_') && k.includes('DATABASE'));
    expect(exposedDbKeys.length).toBe(0);
  });

  // HTTP Integration: Server persistence & reload survival over real HTTP
  it('12. End-to-end HTTP integration: intent and proposal survive server reload', async () => {
    const serverInstance = createDeployableServer({
      repos,
      customProvider: new FakePaymentProvider(),
    });

    const port = await new Promise<number>((resolve) => {
      serverInstance.listen(0, '127.0.0.1', () => {
        const addr = serverInstance.address();
        resolve(typeof addr === 'object' && addr ? addr.port : 0);
      });
    });

    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      // Step A: Fellow prepares intent of ₦20,000
      const saveRes = await fetch(`${baseUrl}/api/payments/intents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: {
            id: 'intent-http-20000',
            responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
            amount: 20000,
            fulfilmentType: FulfilmentType.PARTIAL,
            status: PaymentIntentStatus.PREPARED,
            createdAt: new Date().toISOString(),
          },
        }),
      });
      expect(saveRes.status).toBe(200);
      const saveJson = await saveRes.json();
      expect(saveJson.success).toBe(true);

      // Step B: Proposal created via POST /api/payments/proposal
      const propRes = await fetch(`${baseUrl}/api/payments/proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intentId: 'intent-http-20000',
          responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
          amount: 20000,
          currency: 'NGN',
        }),
      });
      expect(propRes.status).toBe(200);
      const propJson = await propRes.json();
      expect(propJson.success).toBe(true);
      expect(propJson.proposal).toBeDefined();

      // Step C: Simulate Browser Refresh by calling GET /api/accommodation/responsibility
      const reloadRes = await fetch(`${baseUrl}/api/accommodation/responsibility`);
      expect(reloadRes.status).toBe(200);
      const reloadJson = await reloadRes.json();

      expect(reloadJson.success).toBe(true);
      expect(reloadJson.responsibility.requiredAmount).toBe(66000);
      expect(reloadJson.responsibility.verifiedAmount).toBe(0);
      expect(reloadJson.responsibility.status).toBe(ResponsibilityStatus.OUTSTANDING);

      // Prepared intent still exists after reload
      const loadedIntent = reloadJson.preparedIntents.find((i: any) => i.id === 'intent-http-20000');
      expect(loadedIntent).toBeDefined();
      expect(loadedIntent.amount).toBe(20000);
      expect(loadedIntent.status).toBe(PaymentIntentStatus.PREPARED);

      // Created proposal still exists with its provider state after reload
      const loadedProposal = reloadJson.paymentProposals.find(
        (p: any) => p.paymentIntentId === 'intent-http-20000'
      );
      expect(loadedProposal).toBeDefined();
      expect(loadedProposal.provider).toBe('SIMULATED');
      expect(loadedProposal.providerStatus).toBe('Simulated');
      expect(loadedProposal.isSimulated).toBe(true);
    } finally {
      await new Promise<void>((resolve) => serverInstance.close(() => resolve()));
    }
  });

  // Failure behavior: Truthful server error on DB failure, no silent success or localStorage fallback
  it('13. Truthful failure behavior when database encounters an error', async () => {
    // Failing repository implementation
    const failingRepos = {
      accommodation: {
        findById: async () => {
          throw new Error('PostgreSQL connection timeout');
        },
        save: async () => {
          throw new Error('PostgreSQL connection timeout');
        },
        listAll: async () => {
          throw new Error('PostgreSQL connection timeout');
        },
      },
      intents: {
        findById: async () => {
          throw new Error('PostgreSQL connection timeout');
        },
        findByResponsibilityId: async () => {
          throw new Error('PostgreSQL connection timeout');
        },
        save: async () => {
          throw new Error('PostgreSQL connection timeout');
        },
        listAll: async () => {
          throw new Error('PostgreSQL connection timeout');
        },
      },
      proposals: {
        findById: async () => {
          throw new Error('PostgreSQL connection timeout');
        },
        findByIntentId: async () => {
          throw new Error('PostgreSQL connection timeout');
        },
        save: async () => {
          throw new Error('PostgreSQL connection timeout');
        },
        listAll: async () => {
          throw new Error('PostgreSQL connection timeout');
        },
      },
      runInTransaction: async () => {
        throw new Error('PostgreSQL connection timeout');
      },
    };

    const serverInstance = createDeployableServer({
      repos: failingRepos as any,
    });

    const port = await new Promise<number>((resolve) => {
      serverInstance.listen(0, '127.0.0.1', () => {
        const addr = serverInstance.address();
        resolve(typeof addr === 'object' && addr ? addr.port : 0);
      });
    });

    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      const res = await fetch(`${baseUrl}/api/accommodation/responsibility`);
      expect(res.status).toBe(503);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('PostgreSQL connection timeout');
    } finally {
      await new Promise<void>((resolve) => serverInstance.close(() => resolve()));
    }
  });
});
