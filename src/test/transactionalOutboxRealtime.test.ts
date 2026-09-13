import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { newDb } from 'pg-mem';
import http from 'node:http';
import { runMigrations, REQUIRED_TABLES } from '../server/db/migrator';
import { seedDevelopmentDatabase } from '../server/db/seed';
import { PostgresRepositories } from '../server/db/postgresRepository';
import { OutboxPublisher } from '../server/realtime/outboxPublisher';
import { createDeployableServer } from '../../server';
import { DEMO_ACCOMMODATION_RESPONSIBILITY } from '../data/demoAccommodation';
import {
  FulfilmentType,
  PaymentIntentStatus,
  AccommodationPaymentIntent,
  calculateRemainingAmount,
  ResponsibilityStatus,
} from '../domain/accommodation';
import { FakePaymentProvider } from '../server/payments/fakeProvider';

describe('H4D-FUNC-010: Transactional Outbox + Real-Time Accommodation Admin Delivery', () => {
  let memDb: any;
  let pool: any;
  let repos: PostgresRepositories;
  let publisher: OutboxPublisher;
  let serverInstance: http.Server;
  let baseUrl: string;

  beforeEach(async () => {
    // Isolated pg-mem database emulator with foreign key constraints enabled
    memDb = newDb({ autoCreateForeignKeyIndices: true });
    const adapter = memDb.adapters.createPg();
    pool = new adapter.Pool();

    // Run migrations including 001_initial_schema and 002_outbox_events
    await runMigrations(pool);

    // Seed deterministic development accommodation responsibility
    await seedDevelopmentDatabase(pool);

    repos = new PostgresRepositories(pool);
    publisher = new OutboxPublisher();

    serverInstance = createDeployableServer({
      repos,
      publisher,
      customProvider: new FakePaymentProvider(),
    });

    const port = await new Promise<number>((resolve) => {
      serverInstance.listen(0, '127.0.0.1', () => {
        const addr = serverInstance.address();
        resolve(typeof addr === 'object' && addr ? addr.port : 0);
      });
    });

    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterEach(async () => {
    publisher.closeAll();
    await new Promise<void>((resolve) => {
      serverInstance.close(() => resolve());
    });
  });

  // 1. Schema verification: outbox_events exists with expected columns
  it('1. migrations create outbox_events table with required columns', async () => {
    const tableRes = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    const tables = tableRes.rows.map((r: any) => r.table_name);
    expect(tables).toContain('outbox_events');

    const colRes = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'outbox_events'
    `);
    const columns = colRes.rows.map((r: any) => r.column_name);
    expect(columns).toContain('id');
    expect(columns).toContain('event_type');
    expect(columns).toContain('aggregate_type');
    expect(columns).toContain('aggregate_id');
    expect(columns).toContain('payload');
    expect(columns).toContain('created_at');
    expect(columns).toContain('published_at');
  });

  // 2. Atomic state change + outbox event within single transaction
  it('2. payment preparation atomically persists domain intent and outbox event', async () => {
    const intent: AccommodationPaymentIntent = {
      id: 'intent-atomic-20000',
      responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
      amount: 20000,
      fulfilmentType: FulfilmentType.PARTIAL,
      status: PaymentIntentStatus.PREPARED,
      createdAt: new Date().toISOString(),
    };

    const res = await fetch(`${baseUrl}/api/payments/intents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);

    // Verify domain persistence
    const savedIntent = await repos.intents.findById('intent-atomic-20000');
    expect(savedIntent).not.toBeNull();
    expect(savedIntent?.amount).toBe(20000);

    // Verify outbox event record
    const outboxEvents = await repos.outbox.listAll();
    const intentEvent = outboxEvents.find(
      (e) => e.eventType === 'accommodation.payment_intent.prepared' && e.payload.intentId === 'intent-atomic-20000'
    );
    expect(intentEvent).toBeDefined();
    expect(intentEvent?.aggregateId).toBe(DEMO_ACCOMMODATION_RESPONSIBILITY.id);
    expect(intentEvent?.payload.amount).toBe(20000);
    expect(intentEvent?.payload.statusLabel).toBe('Prepared — Not Verified');
  });

  // 3. Rollback safety: FK violation rolls back BOTH intent and outbox event
  it('3. transaction failure rolls back both payment intent and outbox event', async () => {
    const invalidIntent: AccommodationPaymentIntent = {
      id: 'intent-invalid-fk',
      responsibilityId: 'non-existent-responsibility-id',
      amount: 20000,
      fulfilmentType: FulfilmentType.PARTIAL,
      status: PaymentIntentStatus.PREPARED,
      createdAt: new Date().toISOString(),
    };

    const res = await fetch(`${baseUrl}/api/payments/intents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent: invalidIntent }),
    });

    expect(res.status).toBe(400);

    // Verify intent does NOT exist
    const savedIntent = await repos.intents.findById('intent-invalid-fk');
    expect(savedIntent).toBeNull();

    // Verify outbox event does NOT exist
    const outboxEvents = await repos.outbox.listAll();
    const leakedEvent = outboxEvents.find((e) => e.payload?.intentId === 'intent-invalid-fk');
    expect(leakedEvent).toBeUndefined();
  });

  // 4. Real-time SSE delivery: Fellow prepares intent, Admin stream receives live event
  it('4. real-time delivery: SSE subscriber receives live payment preparation event', async () => {
    const receivedEvents: Array<{ eventType: string; data: any }> = [];

    // Open real-time SSE stream to /api/accommodation/admin/stream as authenticated Accommodation Admin
    const sseReq = http.request(`${baseUrl}/api/accommodation/admin/stream?token=dev-session-token-admin`, (sseRes) => {
      expect(sseRes.statusCode).toBe(200);
      expect(sseRes.headers['content-type']).toBe('text/event-stream; charset=utf-8');

      let buffer = '';
      sseRes.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          if (!block.trim()) continue;
          let eventType = 'message';
          let dataStr = '';
          for (const line of block.split('\n')) {
            if (line.startsWith('event: ')) {
              eventType = line.replace('event: ', '').trim();
            } else if (line.startsWith('data: ')) {
              dataStr = line.replace('data: ', '').trim();
            }
          }
          if (dataStr) {
            try {
              receivedEvents.push({ eventType, data: JSON.parse(dataStr) });
            } catch {
              receivedEvents.push({ eventType, data: dataStr });
            }
          }
        }
      });
    });

    sseReq.end();

    // Give SSE client a brief moment to connect
    await new Promise((r) => setTimeout(r, 100));

    // Initial connection message received
    expect(receivedEvents.length).toBeGreaterThanOrEqual(1);
    expect(receivedEvents[0].eventType).toBe('connected');

    // Action in Fellow window: prepare ₦20,000 partial fulfilment intent
    const intentRes = await fetch(`${baseUrl}/api/payments/intents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: {
          id: 'intent-live-20000',
          responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
          amount: 20000,
          fulfilmentType: FulfilmentType.PARTIAL,
          status: PaymentIntentStatus.PREPARED,
          createdAt: new Date().toISOString(),
        },
      }),
    });
    expect(intentRes.status).toBe(200);

    // Wait for event delivery over SSE
    await new Promise((r) => setTimeout(r, 150));

    const preparedEvent = receivedEvents.find(
      (e) => e.eventType === 'accommodation.payment_intent.prepared'
    );
    expect(preparedEvent).toBeDefined();
    expect(preparedEvent?.data.intentId).toBe('intent-live-20000');
    expect(preparedEvent?.data.amount).toBe(20000);
    expect(preparedEvent?.data.statusLabel).toBe('Prepared — Not Verified');

    sseReq.destroy();
  });

  // 5. Invariant check: verifiedAmount remains ₦0, remainingAmount remains ₦66,000, status remains Outstanding
  it('5. financial invariants strictly hold after real-time intent preparation', async () => {
    // Prepare ₦20,000 intent
    await fetch(`${baseUrl}/api/payments/intents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: {
          id: 'intent-invariants-20000',
          responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
          amount: 20000,
          fulfilmentType: FulfilmentType.PARTIAL,
          status: PaymentIntentStatus.PREPARED,
          createdAt: new Date().toISOString(),
        },
      }),
    });

    // Create proposal
    await fetch(`${baseUrl}/api/payments/proposal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intentId: 'intent-invariants-20000',
        responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
        amount: 20000,
        currency: 'NGN',
      }),
    });

    // Read authoritative state from GET /api/accommodation/responsibility
    const respRes = await fetch(`${baseUrl}/api/accommodation/responsibility`);
    expect(respRes.status).toBe(200);
    const state = await respRes.json();
    expect(state.success).toBe(true);

    const resp = state.responsibility;
    expect(resp).toBeDefined();

    // Invariant assertions
    expect(resp.requiredAmount).toBe(66000);
    expect(resp.verifiedAmount).toBe(0);
    expect(calculateRemainingAmount(resp)).toBe(66000);
    expect(resp.status).toBe(ResponsibilityStatus.OUTSTANDING);

    // Prepared intent exists and is recorded as PREPARED
    expect(state.preparedIntents.length).toBeGreaterThanOrEqual(1);
    const foundIntent = state.preparedIntents.find((i: any) => i.id === 'intent-invariants-20000');
    expect(foundIntent).toBeDefined();
    expect(foundIntent.status).toBe(PaymentIntentStatus.PREPARED);
    expect(foundIntent.amount).toBe(20000);
  });

  // 6. Zero loss of state on reload: Outbox and persistence match
  it('6. persistence matches real-time delivery and survives server reload', async () => {
    // 1. Prepare intent
    await fetch(`${baseUrl}/api/payments/intents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: {
          id: 'intent-reload-20000',
          responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
          amount: 20000,
          fulfilmentType: FulfilmentType.PARTIAL,
          status: PaymentIntentStatus.PREPARED,
          createdAt: new Date().toISOString(),
        },
      }),
    });

    // 2. Audit GET /api/accommodation/outbox as authenticated Accommodation Admin
    const outboxRes = await fetch(`${baseUrl}/api/accommodation/outbox`, {
      headers: { Authorization: 'Bearer dev-session-token-admin' },
    });
    expect(outboxRes.status).toBe(200);
    const outboxJson = await outboxRes.json();
    expect(outboxJson.success).toBe(true);
    expect(Array.isArray(outboxJson.events)).toBe(true);

    const event = outboxJson.events.find(
      (e: any) => e.eventType === 'accommodation.payment_intent.prepared' && e.payload?.intentId === 'intent-reload-20000'
    );
    expect(event).toBeDefined();
    expect(event.publishedAt).not.toBeNull();

    // 3. Simulate reload with fresh server instance pointing to the same database
    const freshPublisher = new OutboxPublisher();
    const freshServer = createDeployableServer({
      repos,
      publisher: freshPublisher,
    });

    const freshPort = await new Promise<number>((resolve) => {
      freshServer.listen(0, '127.0.0.1', () => {
        const addr = freshServer.address();
        resolve(typeof addr === 'object' && addr ? addr.port : 0);
      });
    });

    const freshBaseUrl = `http://127.0.0.1:${freshPort}`;

    try {
      const reloadStateRes = await fetch(`${freshBaseUrl}/api/accommodation/responsibility`);
      const reloadState = await reloadStateRes.json();
      expect(reloadState.success).toBe(true);
      expect(reloadState.preparedIntents.some((i: any) => i.id === 'intent-reload-20000')).toBe(true);

      // Invariants strictly preserved across reload
      expect(reloadState.responsibility.verifiedAmount).toBe(0);
      expect(reloadState.responsibility.requiredAmount).toBe(66000);
      expect(reloadState.responsibility.status).toBe('OUTSTANDING');
    } finally {
      freshPublisher.closeAll();
      await new Promise<void>((resolve) => {
        freshServer.close(() => resolve());
      });
    }
  });
});
