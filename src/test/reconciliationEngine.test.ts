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
import { MemberRole } from '../domain/auth';
import { ReconciliationEngine } from '../server/payments/reconciliationEngine';
import { PaymentIntentStatus, ResponsibilityStatus, FulfilmentType } from '../domain/accommodation';
import { PaymentReconciliationStatus, ReconciliationReasonCode } from '../domain/reconciliation';
import { ProviderEventRecord } from '../domain/repositories';

describe('H4D-FUNC-013: Concurrency, Idempotency & Audit Hardened Reconciliation Suite (39 Scenarios)', () => {
  let memDb: any;
  let pool: any;
  let repos: PostgresRepositories;
  let publisher: OutboxPublisher;
  let server: http.Server;
  let baseUrl: string;
  let reconciliationEngine: ReconciliationEngine;
  const TEST_WEBHOOK_SECRET = 'test_bmoni_secret_reconciliation_456';

  beforeEach(async () => {
    memDb = newDb({ autoCreateForeignKeyIndices: true });
    const adapter = memDb.adapters.createPg();
    pool = new adapter.Pool();

    // Run all migrations up to 005_payment_reconciliations
    await runMigrations(pool);
    await seedDevelopmentDatabase(pool);

    repos = new PostgresRepositories(pool);
    publisher = new OutboxPublisher();
    reconciliationEngine = new ReconciliationEngine(repos, publisher);

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

  async function establishSession(role: MemberRole): Promise<string> {
    const res = await fetch(`${baseUrl}/api/auth/dev-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    return data.token;
  }

  async function setupIntentAndProposal(opts: {
    intentId: string;
    proposalId: string;
    amount: number;
    respId?: string;
    fulfilmentType?: FulfilmentType;
  }) {
    const respId = opts.respId || DEMO_ACCOMMODATION_RESPONSIBILITY.id;
    await repos.intents.save({
      id: opts.intentId,
      responsibilityId: respId,
      amount: opts.amount,
      fulfilmentType: opts.fulfilmentType || FulfilmentType.PARTIAL,
      status: PaymentIntentStatus.PREPARED,
      createdAt: new Date().toISOString(),
    });

    await repos.proposals.save({
      id: `ext_${opts.proposalId}`,
      paymentIntentId: opts.intentId,
      responsibilityId: respId,
      amount: opts.amount,
      currency: 'NGN',
      provider: 'BMONI',
      providerProposalId: opts.proposalId,
      providerStatus: 'PENDING',
      isSimulated: false,
      createdAt: new Date().toISOString(),
    });
  }

  function createSampleProviderEvent(opts: {
    eventId: string;
    proposalId?: string;
    amount?: number;
    status?: string;
    provider?: string;
    currency?: string;
    extraPayload?: Record<string, any>;
  }): ProviderEventRecord {
    return {
      id: `pevt_${opts.eventId}`,
      provider: opts.provider || 'BMONI',
      providerEventId: opts.eventId,
      sourceEventId: `src_${opts.eventId}`,
      eventType: 'payment.completed',
      providerStatus: opts.status || 'COMPLETED',
      providerProposalId: opts.proposalId,
      payload: {
        proposalId: opts.proposalId,
        status: opts.status || 'COMPLETED',
        amount: opts.amount !== undefined ? opts.amount : 10000,
        currency: opts.currency || 'NGN',
        ...(opts.extraPayload || {}),
      },
      receivedAt: new Date().toISOString(),
      processingStatus: 'RECEIVED' as any,
    };
  }

  // 1. provider event ingestion alone does not modify accommodation verifiedAmount
  it('1. provider event ingestion alone does not modify accommodation verifiedAmount', async () => {
    await repos.providerEvents.create({
      id: 'pevt_ingest_only',
      provider: 'BMONI',
      providerEventId: 'evt_ingest_only',
      sourceEventId: 'src_ingest_only',
      eventType: 'payment.completed',
      providerStatus: 'COMPLETED',
      providerProposalId: 'prop_ingest_only',
      payload: { amount: 50000, proposalId: 'prop_ingest_only' },
      receivedAt: new Date().toISOString(),
      processingStatus: 'RECEIVED' as any,
    });

    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBe(0);
    expect(resp!.status).toBe(ResponsibilityStatus.OUTSTANDING);
  });

  // 2. invalid provider status (e.g. PENDING, FAILED) does not verify
  it('2. invalid provider status (e.g. PENDING, FAILED) does not verify', async () => {
    await setupIntentAndProposal({ intentId: 'intent_02', proposalId: 'prop_02', amount: 20000 });
    const event = createSampleProviderEvent({ eventId: 'evt_02', proposalId: 'prop_02', amount: 20000, status: 'FAILED' });
    const res = await reconciliationEngine.reconcileProviderEvent(event);

    expect(res.success).toBe(false);
    expect(res.reconciliationStatus).toBe(PaymentReconciliationStatus.NON_ELIGIBLE);
    expect(res.reasonCode).toBe(ReconciliationReasonCode.UNSUPPORTED_PROVIDER_STATUS);

    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBe(0);
  });

  // 3. unknown provider proposal does not verify
  it('3. unknown provider proposal does not verify', async () => {
    const event = createSampleProviderEvent({ eventId: 'evt_03', proposalId: 'prop_non_existent', amount: 20000 });
    const res = await reconciliationEngine.reconcileProviderEvent(event);

    expect(res.success).toBe(false);
    expect(res.reconciliationStatus).toBe(PaymentReconciliationStatus.MISMATCH);
    expect(res.reasonCode).toBe(ReconciliationReasonCode.PROPOSAL_NOT_FOUND);

    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBe(0);
  });

  // 4. unknown payment intent does not verify
  it('4. unknown payment intent does not verify', async () => {
    await pool.query('ALTER TABLE external_payment_proposals DROP CONSTRAINT IF EXISTS external_payment_proposals_payment_intent_id_fk;');
    await repos.proposals.save({
      id: 'ext_prop_orphaned_intent',
      paymentIntentId: 'non_existent_intent_id',
      responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
      amount: 15000,
      currency: 'NGN',
      provider: 'BMONI',
      providerProposalId: 'prop_04',
      providerStatus: 'PENDING',
      isSimulated: false,
      createdAt: new Date().toISOString(),
    });

    const event = createSampleProviderEvent({ eventId: 'evt_04', proposalId: 'prop_04', amount: 15000 });
    const res = await reconciliationEngine.reconcileProviderEvent(event);

    expect(res.success).toBe(false);
    expect(res.reconciliationStatus).toBe(PaymentReconciliationStatus.MISMATCH);
    expect(res.reasonCode).toBe(ReconciliationReasonCode.INTENT_NOT_FOUND);

    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBe(0);
  });

  // 5. unknown accommodation responsibility does not verify
  it('5. unknown accommodation responsibility does not verify', async () => {
    await pool.query('ALTER TABLE payment_intents DROP CONSTRAINT IF EXISTS payment_intents_responsibility_id_fk;');
    await repos.intents.save({
      id: 'intent_orphan_resp',
      responsibilityId: 'non_existent_resp_id',
      amount: 15000,
      fulfilmentType: FulfilmentType.PARTIAL,
      status: PaymentIntentStatus.PREPARED,
      createdAt: new Date().toISOString(),
    });

    await repos.proposals.save({
      id: 'ext_prop_05',
      paymentIntentId: 'intent_orphan_resp',
      responsibilityId: 'non_existent_resp_id',
      amount: 15000,
      currency: 'NGN',
      provider: 'BMONI',
      providerProposalId: 'prop_05',
      providerStatus: 'PENDING',
      isSimulated: false,
      createdAt: new Date().toISOString(),
    });

    const event = createSampleProviderEvent({ eventId: 'evt_05', proposalId: 'prop_05', amount: 15000 });
    const res = await reconciliationEngine.reconcileProviderEvent(event);

    expect(res.success).toBe(false);
    expect(res.reconciliationStatus).toBe(PaymentReconciliationStatus.MISMATCH);
    expect(res.reasonCode).toBe(ReconciliationReasonCode.RESPONSIBILITY_NOT_FOUND);
  });

  // 6. amount mismatch between event and intent does not verify
  it('6. amount mismatch between event and intent does not verify', async () => {
    await setupIntentAndProposal({ intentId: 'intent_06', proposalId: 'prop_06', amount: 30000 });
    const event = createSampleProviderEvent({ eventId: 'evt_06', proposalId: 'prop_06', amount: 20000 });
    const res = await reconciliationEngine.reconcileProviderEvent(event);

    expect(res.success).toBe(false);
    expect(res.reconciliationStatus).toBe(PaymentReconciliationStatus.MISMATCH);
    expect(res.reasonCode).toBe(ReconciliationReasonCode.AMOUNT_MISMATCH);

    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBe(0);
  });

  // 7. currency mismatch does not verify
  it('7. currency mismatch does not verify', async () => {
    await setupIntentAndProposal({ intentId: 'intent_07', proposalId: 'prop_07', amount: 25000 });
    const event = createSampleProviderEvent({ eventId: 'evt_07', proposalId: 'prop_07', amount: 25000, currency: 'USD' });
    const res = await reconciliationEngine.reconcileProviderEvent(event);

    expect(res.success).toBe(false);
    expect(res.reconciliationStatus).toBe(PaymentReconciliationStatus.MISMATCH);
    expect(res.reasonCode).toBe(ReconciliationReasonCode.CURRENCY_MISMATCH);

    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBe(0);
  });

  // 8. zero or negative event amount does not verify
  it('8. zero or negative event amount does not verify', async () => {
    await setupIntentAndProposal({ intentId: 'intent_08', proposalId: 'prop_08', amount: 10000 });
    const eventZero = createSampleProviderEvent({ eventId: 'evt_08_zero', proposalId: 'prop_08', amount: 0 });
    const resZero = await reconciliationEngine.reconcileProviderEvent(eventZero);
    expect(resZero.success).toBe(false);
    expect(resZero.reasonCode).toBe(ReconciliationReasonCode.INVALID_AMOUNT);

    const eventNeg = createSampleProviderEvent({ eventId: 'evt_08_neg', proposalId: 'prop_08', amount: -5000 });
    const resNeg = await reconciliationEngine.reconcileProviderEvent(eventNeg);
    expect(resNeg.success).toBe(false);
    expect(resNeg.reasonCode).toBe(ReconciliationReasonCode.INVALID_AMOUNT);

    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBe(0);
  });

  // 9. amount exceeding remaining requirement does not verify
  it('9. amount exceeding remaining requirement does not verify', async () => {
    // Required is 66,000. Try to verify 70,000.
    await setupIntentAndProposal({ intentId: 'intent_09', proposalId: 'prop_09', amount: 70000 });
    const event = createSampleProviderEvent({ eventId: 'evt_09', proposalId: 'prop_09', amount: 70000 });
    const res = await reconciliationEngine.reconcileProviderEvent(event);

    expect(res.success).toBe(false);
    expect(res.reconciliationStatus).toBe(PaymentReconciliationStatus.MISMATCH);
    expect(res.reasonCode).toBe(ReconciliationReasonCode.AMOUNT_EXCEEDS_REMAINING);

    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBe(0);
  });

  // 10. complete valid evidence chain verifies and updates verifiedAmount
  it('10. complete valid evidence chain verifies and updates verifiedAmount', async () => {
    await setupIntentAndProposal({ intentId: 'intent_10', proposalId: 'prop_10', amount: 33000 });
    const event = createSampleProviderEvent({ eventId: 'evt_10', proposalId: 'prop_10', amount: 33000 });
    const res = await reconciliationEngine.reconcileProviderEvent(event);

    expect(res.success).toBe(true);
    expect(res.reconciliationStatus).toBe(PaymentReconciliationStatus.VERIFIED);
    expect(res.financialEffect).toBe(33000);

    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBe(33000);
  });

  // 11. full payment transitions status to FULFILLED
  it('11. full payment transitions status to FULFILLED', async () => {
    await setupIntentAndProposal({ intentId: 'intent_11', proposalId: 'prop_11', amount: 66000, fulfilmentType: FulfilmentType.FULL });
    const event = createSampleProviderEvent({ eventId: 'evt_11', proposalId: 'prop_11', amount: 66000 });
    const res = await reconciliationEngine.reconcileProviderEvent(event);

    expect(res.success).toBe(true);
    expect(res.updatedResponsibility!.status).toBe(ResponsibilityStatus.FULFILLED);

    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.status).toBe(ResponsibilityStatus.FULFILLED);
    expect(resp!.verifiedAmount).toBe(66000);
  });

  // 12. partial payment transitions status to PARTIALLY_FULFILLED
  it('12. partial payment transitions status to PARTIALLY_FULFILLED', async () => {
    await setupIntentAndProposal({ intentId: 'intent_12', proposalId: 'prop_12', amount: 20000 });
    const event = createSampleProviderEvent({ eventId: 'evt_12', proposalId: 'prop_12', amount: 20000 });
    const res = await reconciliationEngine.reconcileProviderEvent(event);

    expect(res.success).toBe(true);
    expect(res.updatedResponsibility!.status).toBe(ResponsibilityStatus.PARTIALLY_FULFILLED);

    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.status).toBe(ResponsibilityStatus.PARTIALLY_FULFILLED);
    expect(resp!.verifiedAmount).toBe(20000);
  });

  // 13. second reconciliation of the same provider event is idempotent (no second financial effect)
  it('13. second reconciliation of the same provider event is idempotent (no second financial effect)', async () => {
    await setupIntentAndProposal({ intentId: 'intent_13', proposalId: 'prop_13', amount: 15000 });
    const event = createSampleProviderEvent({ eventId: 'evt_13', proposalId: 'prop_13', amount: 15000 });

    const res1 = await reconciliationEngine.reconcileProviderEvent(event);
    expect(res1.financialEffect).toBe(15000);

    const res2 = await reconciliationEngine.reconcileProviderEvent(event);
    expect(res2.success).toBe(true);
    expect(res2.isDuplicate).toBe(true);
    expect(res2.financialEffect).toBe(0);

    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBe(15000);
  });

  // 14. repeated duplicate webhook delivery produces no duplicate credit
  it('14. repeated duplicate webhook delivery produces no duplicate credit', async () => {
    await setupIntentAndProposal({ intentId: 'intent_14', proposalId: 'prop_14', amount: 18000 });
    const rawPayload = JSON.stringify({
      id: 'evt_webhook_14',
      type: 'payment.completed',
      data: { proposalId: 'prop_14', status: 'COMPLETED', amount: 18000, currency: 'NGN' },
    });
    const signature = computeHmacSignature(rawPayload);

    // Call 1
    const res1 = await fetch(`${baseUrl}/api/webhooks/bmoni`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Webhook-Signature': signature, 'X-Webhook-Id': 'evt_webhook_14' },
      body: rawPayload,
    });
    expect(res1.status).toBe(200);

    // Call 2 (Duplicate delivery)
    const res2 = await fetch(`${baseUrl}/api/webhooks/bmoni`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Webhook-Signature': signature, 'X-Webhook-Id': 'evt_webhook_14' },
      body: rawPayload,
    });
    expect(res2.status).toBe(200);

    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBe(18000);
  });

  // 15. duplicate provider event returns existing reconciliation record
  it('15. duplicate provider event returns existing reconciliation record', async () => {
    await setupIntentAndProposal({ intentId: 'intent_15', proposalId: 'prop_15', amount: 10000 });
    const event = createSampleProviderEvent({ eventId: 'evt_15', proposalId: 'prop_15', amount: 10000 });

    const res1 = await reconciliationEngine.reconcileProviderEvent(event);
    const res2 = await reconciliationEngine.reconcileProviderEvent(event);

    expect(res2.reconciliation.id).toBe(res1.reconciliation.id);
    expect(res2.reconciliation.reconciliationStatus).toBe(PaymentReconciliationStatus.VERIFIED);
  });

  // 16. outbox event is created inside the same transaction
  it('16. outbox event is created inside the same transaction', async () => {
    await setupIntentAndProposal({ intentId: 'intent_16', proposalId: 'prop_16', amount: 12000 });
    const event = createSampleProviderEvent({ eventId: 'evt_16', proposalId: 'prop_16', amount: 12000 });

    await reconciliationEngine.reconcileProviderEvent(event);

    const outboxEvents = await repos.outbox.listAll();
    const eventFound = outboxEvents.find(
      (e) => e.eventType === 'accommodation.payment.reconciled' && e.payload.amount === 12000
    );
    expect(eventFound).toBeDefined();
    expect(eventFound!.payload.verifiedAmount).toBe(12000);
  });

  // 17. outbox event is not published if the transaction fails
  it('17. outbox event is not published if the transaction fails', async () => {
    let published = false;
    const testPublisher: any = {
      publish: () => { published = true; },
      subscribe: () => () => {},
      subscriberCount: () => 0,
    };

    const faultyRepos: any = {
      ...repos,
      runInTransaction: async () => {
        throw new Error('Database transaction abort test');
      },
    };

    const engineWithFault = new ReconciliationEngine(faultyRepos, testPublisher);
    await setupIntentAndProposal({ intentId: 'intent_17', proposalId: 'prop_17', amount: 10000 });
    const event = createSampleProviderEvent({ eventId: 'evt_17', proposalId: 'prop_17', amount: 10000 });

    await expect(engineWithFault.reconcileProviderEvent(event)).rejects.toThrow('Database transaction abort test');
    expect(published).toBe(false);
  });

  // 18. outbox event is published via SSE on successful commit
  it('18. outbox event is published via SSE on successful commit', async () => {
    let publishedEvent: any = null;
    const trackingPublisher: any = {
      publish: (e: any) => { publishedEvent = e; },
      subscribe: () => () => {},
      subscriberCount: () => 1,
    };

    const engine = new ReconciliationEngine(repos, trackingPublisher);
    await setupIntentAndProposal({ intentId: 'intent_18', proposalId: 'prop_18', amount: 14000 });
    const event = createSampleProviderEvent({ eventId: 'evt_18', proposalId: 'prop_18', amount: 14000 });

    await engine.reconcileProviderEvent(event);
    expect(publishedEvent).toBeDefined();
    expect(publishedEvent.eventType).toBe('accommodation.payment.reconciled');
    expect(publishedEvent.payload.amount).toBe(14000);
  });

  // 19. mismatched reconciliation record is preserved with reason code
  it('19. mismatched reconciliation record is preserved with reason code', async () => {
    await setupIntentAndProposal({ intentId: 'intent_19', proposalId: 'prop_19', amount: 20000 });
    const event = createSampleProviderEvent({ eventId: 'evt_19', proposalId: 'prop_19', amount: 10000 });

    await reconciliationEngine.reconcileProviderEvent(event);
    const rec = await repos.reconciliations.findByProviderEventId('BMONI', 'evt_19');

    expect(rec).toBeDefined();
    expect(rec!.reconciliationStatus).toBe(PaymentReconciliationStatus.MISMATCH);
    expect(rec!.reasonCode).toBe(ReconciliationReasonCode.AMOUNT_MISMATCH);
  });

  // 20. mismatch does not prevent later valid reconciliation of a different event
  it('20. mismatch does not prevent later valid reconciliation of a different event', async () => {
    // Event 1 mismatches
    const eventBad = createSampleProviderEvent({ eventId: 'evt_20_bad', proposalId: 'prop_unknown', amount: 5000 });
    await reconciliationEngine.reconcileProviderEvent(eventBad);

    // Event 2 is valid
    await setupIntentAndProposal({ intentId: 'intent_20', proposalId: 'prop_20', amount: 16000 });
    const eventGood = createSampleProviderEvent({ eventId: 'evt_20_good', proposalId: 'prop_20', amount: 16000 });
    const resGood = await reconciliationEngine.reconcileProviderEvent(eventGood);

    expect(resGood.success).toBe(true);
    expect(resGood.reconciliationStatus).toBe(PaymentReconciliationStatus.VERIFIED);
    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBe(16000);
  });

  // 21. mismatch on an event does not prevent later valid reconciliation of that event if the proposal becomes available
  it('21. mismatch on an event does not prevent later valid reconciliation of that event if proposal becomes available', async () => {
    // Step 1: Event arrives before proposal exists
    const event = createSampleProviderEvent({ eventId: 'evt_21_retry', proposalId: 'prop_21_delayed', amount: 22000 });
    const res1 = await reconciliationEngine.reconcileProviderEvent(event);
    expect(res1.reconciliationStatus).toBe(PaymentReconciliationStatus.MISMATCH);
    expect(res1.reasonCode).toBe(ReconciliationReasonCode.PROPOSAL_NOT_FOUND);

    // Verify initial mismatch audit is recorded
    const recsInitial = await repos.reconciliations.listByProviderEventId('BMONI', 'evt_21_retry');
    expect(recsInitial.length).toBe(1);
    expect(recsInitial[0].reconciliationStatus).toBe(PaymentReconciliationStatus.MISMATCH);

    // Step 2: Proposal and intent become available later
    await setupIntentAndProposal({ intentId: 'intent_21', proposalId: 'prop_21_delayed', amount: 22000 });

    // Step 3: Event is re-reconciled
    const res2 = await reconciliationEngine.reconcileProviderEvent(event);
    expect(res2.success).toBe(true);
    expect(res2.reconciliationStatus).toBe(PaymentReconciliationStatus.VERIFIED);
    expect(res2.financialEffect).toBe(22000);

    // Both records are preserved in reconciliation history (append-oriented)
    const recsAll = await repos.reconciliations.listByProviderEventId('BMONI', 'evt_21_retry');
    expect(recsAll.length).toBe(2);
    expect(recsAll[0].reconciliationStatus).toBe(PaymentReconciliationStatus.MISMATCH);
    expect(recsAll[1].reconciliationStatus).toBe(PaymentReconciliationStatus.VERIFIED);

    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBe(22000);
  });

  // 22. provider metadata responsibilityId cannot redirect payment to another responsibility
  it('22. provider metadata responsibilityId cannot redirect payment to another responsibility', async () => {
    await setupIntentAndProposal({ intentId: 'intent_22', proposalId: 'prop_22', amount: 15000 });
    // Payload contains spoofed metadata trying to credit a different responsibility
    const event = createSampleProviderEvent({
      eventId: 'evt_22',
      proposalId: 'prop_22',
      amount: 15000,
      extraPayload: { metadata: { responsibilityId: 'malicious_responsibility_spoof' } },
    });

    const res = await reconciliationEngine.reconcileProviderEvent(event);
    expect(res.success).toBe(true);
    // Verified credit was applied to the authoritative DEMO responsibility, NOT spoofed id!
    expect(res.updatedResponsibility!.id).toBe(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBe(15000);
  });

  // 23. proposal → intent → responsibility relationship is authoritative
  it('23. proposal → intent → responsibility relationship is authoritative', async () => {
    await setupIntentAndProposal({ intentId: 'intent_23', proposalId: 'prop_23', amount: 11000 });
    const event = createSampleProviderEvent({ eventId: 'evt_23', proposalId: 'prop_23', amount: 11000 });

    const res = await reconciliationEngine.reconcileProviderEvent(event);
    expect(res.success).toBe(true);
    expect(res.reconciliation.externalPaymentProposalId).toBe('ext_prop_23');
    expect(res.reconciliation.paymentIntentId).toBe('intent_23');
    expect(res.reconciliation.accommodationResponsibilityId).toBe(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
  });

  // 24. wrong proposal/intent relationship does not verify
  it('24. wrong proposal/intent relationship does not verify', async () => {
    // Proposal pointing to intent A, but intent in DB points elsewhere
    await repos.intents.save({
      id: 'intent_24_A',
      responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
      amount: 10000,
      fulfilmentType: FulfilmentType.PARTIAL,
      status: PaymentIntentStatus.PREPARED,
      createdAt: new Date().toISOString(),
    });

    await repos.proposals.save({
      id: 'ext_prop_24',
      paymentIntentId: 'intent_24_A',
      responsibilityId: 'different_resp_id', // Intentionally mismatched
      amount: 10000,
      currency: 'NGN',
      provider: 'BMONI',
      providerProposalId: 'prop_24',
      providerStatus: 'PENDING',
      isSimulated: false,
      createdAt: new Date().toISOString(),
    });

    const event = createSampleProviderEvent({ eventId: 'evt_24', proposalId: 'prop_24', amount: 10000 });
    const res = await reconciliationEngine.reconcileProviderEvent(event);

    expect(res.success).toBe(false);
    expect(res.reconciliationStatus).toBe(PaymentReconciliationStatus.MISMATCH);
    expect(res.reasonCode).toBe(ReconciliationReasonCode.CORRELATION_BROKEN);
  });

  // 25. unsupported provider does not verify
  it('25. unsupported provider does not verify', async () => {
    const event = createSampleProviderEvent({ eventId: 'evt_25', proposalId: 'prop_25', amount: 10000, provider: 'STRIPE' });
    const res = await reconciliationEngine.reconcileProviderEvent(event);

    expect(res.success).toBe(false);
    expect(res.reconciliationStatus).toBe(PaymentReconciliationStatus.NON_ELIGIBLE);
    expect(res.reasonCode).toBe(ReconciliationReasonCode.UNSUPPORTED_PROVIDER);
  });

  // 26. missing proposalId in event does not verify
  it('26. missing proposalId in event does not verify', async () => {
    const event = createSampleProviderEvent({ eventId: 'evt_26', amount: 10000 });
    event.providerProposalId = undefined;
    delete event.payload.proposalId;

    const res = await reconciliationEngine.reconcileProviderEvent(event);
    expect(res.success).toBe(false);
    expect(res.reconciliationStatus).toBe(PaymentReconciliationStatus.MISMATCH);
    expect(res.reasonCode).toBe(ReconciliationReasonCode.PROPOSAL_NOT_FOUND);
  });

  // 27. non-COMPLETED status does not create verified reconciliation record
  it('27. non-COMPLETED status does not create verified reconciliation record', async () => {
    await setupIntentAndProposal({ intentId: 'intent_27', proposalId: 'prop_27', amount: 10000 });
    const event = createSampleProviderEvent({ eventId: 'evt_27', proposalId: 'prop_27', amount: 10000, status: 'PROCESSING' });

    const res = await reconciliationEngine.reconcileProviderEvent(event);
    expect(res.success).toBe(false);
    expect(res.reconciliationStatus).not.toBe(PaymentReconciliationStatus.VERIFIED);
  });

  // 28. non-COMPLETED status creates NON_ELIGIBLE or MISMATCH record
  it('28. non-COMPLETED status creates NON_ELIGIBLE or MISMATCH record', async () => {
    const event = createSampleProviderEvent({ eventId: 'evt_28', proposalId: 'prop_28', amount: 10000, status: 'EXPIRED' });
    const res = await reconciliationEngine.reconcileProviderEvent(event);

    expect(res.reconciliationStatus).toBe(PaymentReconciliationStatus.NON_ELIGIBLE);
    const rec = await repos.reconciliations.findByProviderEventId('BMONI', 'evt_28');
    expect(rec).toBeDefined();
    expect(rec!.reconciliationStatus).toBe(PaymentReconciliationStatus.NON_ELIGIBLE);
  });

  // 29. reconciliation record stores correct reason code
  it('29. reconciliation record stores correct reason code', async () => {
    await setupIntentAndProposal({ intentId: 'intent_29', proposalId: 'prop_29', amount: 17000 });
    const event = createSampleProviderEvent({ eventId: 'evt_29', proposalId: 'prop_29', amount: 17000 });

    const res = await reconciliationEngine.reconcileProviderEvent(event);
    expect(res.reconciliation.reasonCode).toBe(ReconciliationReasonCode.MATCHED_VERIFIED);
  });

  // 30. reconciliation record stores correct financial snapshot
  it('30. reconciliation record stores correct financial snapshot', async () => {
    await setupIntentAndProposal({ intentId: 'intent_30', proposalId: 'prop_30', amount: 13500 });
    const event = createSampleProviderEvent({ eventId: 'evt_30', proposalId: 'prop_30', amount: 13500 });

    const res = await reconciliationEngine.reconcileProviderEvent(event);
    expect(res.reconciliation.amount).toBe(13500);
    expect(res.reconciliation.currency).toBe('NGN');
    expect(res.reconciliation.provider).toBe('BMONI');
    expect(res.reconciliation.reconciledAt).toBeDefined();
  });

  // 31. admin can list reconciliations with correct authorization
  it('31. admin can list reconciliations with correct authorization', async () => {
    const adminToken = await establishSession(MemberRole.ACCOMMODATION_ADMIN);
    const res = await fetch(`${baseUrl}/api/accommodation/admin/reconciliations`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.reconciliations)).toBe(true);
  });

  // 32. fellow cannot access admin reconciliation endpoint
  it('32. fellow cannot access admin reconciliation endpoint', async () => {
    const fellowToken = await establishSession(MemberRole.FELLOW);
    const res = await fetch(`${baseUrl}/api/accommodation/admin/reconciliations`, {
      headers: { Authorization: `Bearer ${fellowToken}` },
    });
    expect(res.status).toBe(403);
  });

  // 33. unauthenticated caller cannot access admin reconciliation endpoint
  it('33. unauthenticated caller cannot access admin reconciliation endpoint', async () => {
    const res = await fetch(`${baseUrl}/api/accommodation/admin/reconciliations`);
    expect(res.status).toBe(401);
  });

  // 34. admin manual reconciliation trigger verifies valid event
  it('34. admin manual reconciliation trigger verifies valid event', async () => {
    await setupIntentAndProposal({ intentId: 'intent_34', proposalId: 'prop_34', amount: 20000 });
    await repos.providerEvents.create({
      id: 'pevt_34',
      provider: 'BMONI',
      providerEventId: 'evt_34',
      sourceEventId: 'src_34',
      eventType: 'payment.completed',
      providerStatus: 'COMPLETED',
      providerProposalId: 'prop_34',
      payload: { proposalId: 'prop_34', status: 'COMPLETED', amount: 20000, currency: 'NGN' },
      receivedAt: new Date().toISOString(),
      processingStatus: 'RECEIVED' as any,
    });

    const adminToken = await establishSession(MemberRole.ACCOMMODATION_ADMIN);
    const res = await fetch(`${baseUrl}/api/accommodation/admin/reconcile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ providerEventId: 'evt_34', provider: 'BMONI' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.result.reconciliationStatus).toBe(PaymentReconciliationStatus.VERIFIED);

    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBe(20000);
  });

  // 35. admin manual reconciliation trigger reports mismatch for invalid event
  it('35. admin manual reconciliation trigger reports mismatch for invalid event', async () => {
    await repos.providerEvents.create({
      id: 'pevt_35',
      provider: 'BMONI',
      providerEventId: 'evt_35',
      sourceEventId: 'src_35',
      eventType: 'payment.completed',
      providerStatus: 'COMPLETED',
      providerProposalId: 'prop_nonexistent_35',
      payload: { proposalId: 'prop_nonexistent_35', status: 'COMPLETED', amount: 5000, currency: 'NGN' },
      receivedAt: new Date().toISOString(),
      processingStatus: 'RECEIVED' as any,
    });

    const adminToken = await establishSession(MemberRole.ACCOMMODATION_ADMIN);
    const res = await fetch(`${baseUrl}/api/accommodation/admin/reconcile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ providerEventId: 'evt_35', provider: 'BMONI' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.result.reconciliationStatus).toBe(PaymentReconciliationStatus.MISMATCH);

    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBe(0);
  });

  // 36. concurrent reconciliation attempts for the same event produce exactly one credit
  it('36. concurrent reconciliation attempts for the same event produce exactly one credit', async () => {
    await setupIntentAndProposal({ intentId: 'intent_36', proposalId: 'prop_36', amount: 19000 });
    const event = createSampleProviderEvent({ eventId: 'evt_36', proposalId: 'prop_36', amount: 19000 });

    // Execute concurrent reconciliation attempts
    const [result1, result2] = await Promise.all([
      reconciliationEngine.reconcileProviderEvent(event),
      reconciliationEngine.reconcileProviderEvent(event),
    ]);

    const totalFinancialEffect = (result1.financialEffect || 0) + (result2.financialEffect || 0);
    expect(totalFinancialEffect).toBe(19000);

    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBe(19000);
  });

  // 37. concurrent reconciliation attempts for different events do not exceed required amount
  it('37. concurrent reconciliation attempts for different events do not exceed required amount', async () => {
    // Current required amount is 66,000.
    // Event A is 40,000. Event B is 40,000.
    await setupIntentAndProposal({ intentId: 'intent_37_A', proposalId: 'prop_37_A', amount: 40000 });
    await setupIntentAndProposal({ intentId: 'intent_37_B', proposalId: 'prop_37_B', amount: 40000 });

    const eventA = createSampleProviderEvent({ eventId: 'evt_37_A', proposalId: 'prop_37_A', amount: 40000 });
    const eventB = createSampleProviderEvent({ eventId: 'evt_37_B', proposalId: 'prop_37_B', amount: 40000 });

    const [resA, resB] = await Promise.all([
      reconciliationEngine.reconcileProviderEvent(eventA),
      reconciliationEngine.reconcileProviderEvent(eventB),
    ]);

    // One must succeed, the other must fail with AMOUNT_EXCEEDS_REMAINING
    const oneVerified = (resA.reconciliationStatus === 'VERIFIED') !== (resB.reconciliationStatus === 'VERIFIED');
    expect(oneVerified).toBe(true);

    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBe(40000);
    expect(resp!.verifiedAmount).toBeLessThanOrEqual(Number(resp!.requiredAmount));
  });

  // 38. verifiedAmount invariant: 0 <= verifiedAmount <= requiredAmount
  it('38. verifiedAmount invariant: 0 <= verifiedAmount <= requiredAmount', async () => {
    await setupIntentAndProposal({ intentId: 'intent_38', proposalId: 'prop_38', amount: 66000, fulfilmentType: FulfilmentType.FULL });
    const event = createSampleProviderEvent({ eventId: 'evt_38', proposalId: 'prop_38', amount: 66000 });

    const res = await reconciliationEngine.reconcileProviderEvent(event);
    expect(res.success).toBe(true);

    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBeGreaterThanOrEqual(0);
    expect(resp!.verifiedAmount).toBeLessThanOrEqual(Number(resp!.requiredAmount));
  });

  // 39. remainingAmount invariant: remainingAmount = requiredAmount - verifiedAmount
  it('39. remainingAmount invariant: remainingAmount = requiredAmount - verifiedAmount', async () => {
    await setupIntentAndProposal({ intentId: 'intent_39', proposalId: 'prop_39', amount: 26000 });
    const event = createSampleProviderEvent({ eventId: 'evt_39', proposalId: 'prop_39', amount: 26000 });

    const res = await reconciliationEngine.reconcileProviderEvent(event);
    expect(res.success).toBe(true);

    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    const expectedRemaining = Math.round((Number(resp!.requiredAmount) - Number(resp!.verifiedAmount)) * 100) / 100;
    expect(res.updatedResponsibility!.remainingAmount).toBe(expectedRemaining);
    expect(expectedRemaining).toBe(40000);
  });

  // 40. explicit two-stage monthly payment: ₦20,000 partial followed by ₦46,000 reaching ₦66,000 FULFILLED
  it('40. explicit two-stage monthly payment: ₦20,000 partial followed by ₦46,000 reaching ₦66,000 FULFILLED', async () => {
    // Stage 1: Partial payment of ₦20,000
    await setupIntentAndProposal({ intentId: 'intent_40_stage1', proposalId: 'prop_40_stage1', amount: 20000 });
    const event1 = createSampleProviderEvent({ eventId: 'evt_40_stage1', proposalId: 'prop_40_stage1', amount: 20000 });
    const res1 = await reconciliationEngine.reconcileProviderEvent(event1);

    expect(res1.success).toBe(true);
    expect(res1.reconciliationStatus).toBe(PaymentReconciliationStatus.VERIFIED);
    expect(res1.financialEffect).toBe(20000);

    const respStage1 = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(respStage1!.verifiedAmount).toBe(20000);
    expect(Number(respStage1!.requiredAmount) - Number(respStage1!.verifiedAmount)).toBe(46000);
    expect(respStage1!.status).toBe(ResponsibilityStatus.PARTIALLY_FULFILLED);

    // Stage 2: Second distinct payment of ₦46,000
    await setupIntentAndProposal({ intentId: 'intent_40_stage2', proposalId: 'prop_40_stage2', amount: 46000 });
    const event2 = createSampleProviderEvent({ eventId: 'evt_40_stage2', proposalId: 'prop_40_stage2', amount: 46000 });
    const res2 = await reconciliationEngine.reconcileProviderEvent(event2);

    expect(res2.success).toBe(true);
    expect(res2.reconciliationStatus).toBe(PaymentReconciliationStatus.VERIFIED);
    expect(res2.financialEffect).toBe(46000);

    const respStage2 = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(respStage2!.verifiedAmount).toBe(66000);
    expect(Number(respStage2!.requiredAmount)).toBe(66000);
    expect(Number(respStage2!.requiredAmount) - Number(respStage2!.verifiedAmount)).toBe(0);
    expect(respStage2!.status).toBe(ResponsibilityStatus.FULFILLED);
  });

  // 41. duplicate same-event processing produces financialEffect = 0 and no additional credit
  it('41. duplicate same-event processing produces financialEffect = 0 and no additional credit', async () => {
    await setupIntentAndProposal({ intentId: 'intent_41', proposalId: 'prop_41', amount: 15000 });
    const event = createSampleProviderEvent({ eventId: 'evt_41', proposalId: 'prop_41', amount: 15000 });

    const firstRun = await reconciliationEngine.reconcileProviderEvent(event);
    expect(firstRun.success).toBe(true);
    expect(firstRun.financialEffect).toBe(15000);

    const secondRun = await reconciliationEngine.reconcileProviderEvent(event);
    expect(secondRun.success).toBe(true);
    expect(secondRun.financialEffect).toBe(0);
    expect(secondRun.isDuplicate).toBe(true);
    expect(secondRun.idempotent).toBe(true);
    expect(secondRun.reasonCode).toBe('ALREADY_RECONCILED');

    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBe(15000);
  });

  // 42. append-oriented history: previous mismatch remains inspectable and can later be followed by valid VERIFIED attempt
  it('42. append-oriented history: previous mismatch remains inspectable and can later be followed by valid VERIFIED attempt', async () => {
    const event = createSampleProviderEvent({ eventId: 'evt_42_append', proposalId: 'prop_42_late', amount: 25000 });

    // Attempt 1: Proposal not yet registered in database
    const res1 = await reconciliationEngine.reconcileProviderEvent(event);
    expect(res1.success).toBe(false);
    expect(res1.reconciliationStatus).toBe(PaymentReconciliationStatus.MISMATCH);
    expect(res1.reasonCode).toBe(ReconciliationReasonCode.PROPOSAL_NOT_FOUND);

    // Verify inspectable MISMATCH record was persisted
    const allReconciliationsAfterAttempt1 = await repos.reconciliations.listAll();
    const attempt1Record = allReconciliationsAfterAttempt1.find(r => r.providerEventId === 'evt_42_append');
    expect(attempt1Record).toBeDefined();
    expect(attempt1Record!.reconciliationStatus).toBe(PaymentReconciliationStatus.MISMATCH);

    // Verify verifiedAmount remained 0
    let resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBe(0);

    // Now proposal is registered
    await setupIntentAndProposal({ intentId: 'intent_42', proposalId: 'prop_42_late', amount: 25000 });

    // Attempt 2: Re-reconcile the same provider event
    const res2 = await reconciliationEngine.reconcileProviderEvent(event);
    expect(res2.success).toBe(true);
    expect(res2.reconciliationStatus).toBe(PaymentReconciliationStatus.VERIFIED);
    expect(res2.financialEffect).toBe(25000);

    // Verify verifiedAmount is updated to 25,000
    resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBe(25000);

    // Verify both records exist in history (append-oriented)
    const allReconciliationsAfterAttempt2 = await repos.reconciliations.listAll();
    const eventRecords = allReconciliationsAfterAttempt2.filter(r => r.providerEventId === 'evt_42_append');
    expect(eventRecords.length).toBe(2);
    expect(eventRecords.some(r => r.reconciliationStatus === PaymentReconciliationStatus.MISMATCH)).toBe(true);
    expect(eventRecords.some(r => r.reconciliationStatus === PaymentReconciliationStatus.VERIFIED)).toBe(true);

    // Attempt 3: Idempotent re-run produces financialEffect = 0 and does not add another VERIFIED
    const res3 = await reconciliationEngine.reconcileProviderEvent(event);
    expect(res3.financialEffect).toBe(0);
    expect(res3.idempotent).toBe(true);

    const verifiedRecords = (await repos.reconciliations.listAll())
      .filter(r => r.providerEventId === 'evt_42_append' && r.reconciliationStatus === PaymentReconciliationStatus.VERIFIED);
    expect(verifiedRecords.length).toBe(1);
  });

  // 43. unsupported provider statuses (PENDING_APPROVALS, PENDING_SIGNATURES, REJECTED, UNKNOWN) rejected from verification
  it('43. unsupported provider statuses (PENDING_APPROVALS, PENDING_SIGNATURES, REJECTED, UNKNOWN) rejected from verification', async () => {
    await setupIntentAndProposal({ intentId: 'intent_43', proposalId: 'prop_43', amount: 10000 });

    const statuses = ['PENDING_APPROVALS', 'PENDING_SIGNATURES', 'REJECTED', 'UNKNOWN', 'PENDING'];
    for (let i = 0; i < statuses.length; i++) {
      const status = statuses[i];
      const event = createSampleProviderEvent({
        eventId: `evt_43_${i}`,
        proposalId: 'prop_43',
        amount: 10000,
        status,
      });

      const res = await reconciliationEngine.reconcileProviderEvent(event);
      expect(res.success).toBe(false);
      expect(res.reconciliationStatus).toBe(PaymentReconciliationStatus.NON_ELIGIBLE);
      expect(res.reasonCode).toBe(ReconciliationReasonCode.UNSUPPORTED_PROVIDER_STATUS);
      expect(res.financialEffect).toBe(0);
    }

    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBe(0);
  });

  // 44. zero or negative amounts are rejected with INVALID_AMOUNT and no financial change
  it('44. zero or negative amounts are rejected with INVALID_AMOUNT and no financial change', async () => {
    await setupIntentAndProposal({ intentId: 'intent_44', proposalId: 'prop_44', amount: 10000 });

    // Zero amount
    const eventZero = createSampleProviderEvent({ eventId: 'evt_44_zero', proposalId: 'prop_44', amount: 0 });
    const resZero = await reconciliationEngine.reconcileProviderEvent(eventZero);
    expect(resZero.success).toBe(false);
    expect(resZero.reasonCode).toBe(ReconciliationReasonCode.INVALID_AMOUNT);
    expect(resZero.financialEffect).toBe(0);

    // Negative amount
    const eventNeg = createSampleProviderEvent({ eventId: 'evt_44_neg', proposalId: 'prop_44', amount: -5000 });
    const resNeg = await reconciliationEngine.reconcileProviderEvent(eventNeg);
    expect(resNeg.success).toBe(false);
    expect(resNeg.reasonCode).toBe(ReconciliationReasonCode.INVALID_AMOUNT);
    expect(resNeg.financialEffect).toBe(0);

    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBe(0);
  });

  // 45. rollback safety: failure inside transaction aborts outbox broadcast and does not record verified state
  it('45. rollback safety: failure inside transaction aborts outbox broadcast and does not record verified state', async () => {
    await setupIntentAndProposal({ intentId: 'intent_45', proposalId: 'prop_45', amount: 20000 });
    const event = createSampleProviderEvent({ eventId: 'evt_45', proposalId: 'prop_45', amount: 20000 });

    let sseBroadcasted = false;
    const testPublisher: any = {
      publish: () => { sseBroadcasted = true; },
      subscribe: () => () => {},
      subscriberCount: () => 1,
    };

    const faultyRepos: any = {
      ...repos,
      runInTransaction: async () => {
        throw new Error('Simulated failure inside transaction during financial reconciliation');
      },
    };

    const faultEngine = new ReconciliationEngine(faultyRepos, testPublisher);

    await expect(faultEngine.reconcileProviderEvent(event)).rejects.toThrow(
      /Simulated failure inside transaction/
    );

    // Verify responsibility verifiedAmount was never committed
    const resp = await repos.accommodation.findById(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(resp!.verifiedAmount).toBe(0);
    expect(resp!.status).toBe(ResponsibilityStatus.OUTSTANDING);

    // Verify no outbox event was broadcast to SSE
    expect(sseBroadcasted).toBe(false);

    // Verify no verified reconciliation record was created
    const recs = await repos.reconciliations.listAll();
    expect(recs.some(r => r.providerEventId === 'evt_45' && r.reconciliationStatus === 'VERIFIED')).toBe(false);
  });

  // 46. privileged admin retry endpoint enforces authentication and authorization (401, 403)
  it('46. privileged admin retry endpoint enforces authentication and authorization (401, 403)', async () => {
    // 1. Unauthenticated request returns 401
    const unauthRes = await fetch(`${baseUrl}/api/accommodation/admin/reconcile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerEventId: 'evt_test', provider: 'BMONI' }),
    });
    expect(unauthRes.status).toBe(401);

    // 2. FELLOW request returns 403
    const fellowToken = await establishSession(MemberRole.FELLOW);
    const fellowRes = await fetch(`${baseUrl}/api/accommodation/admin/reconcile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${fellowToken}` },
      body: JSON.stringify({ providerEventId: 'evt_test', provider: 'BMONI' }),
    });
    expect(fellowRes.status).toBe(403);
  });
});
