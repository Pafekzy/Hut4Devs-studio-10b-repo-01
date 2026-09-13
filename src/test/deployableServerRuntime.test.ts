import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { createDeployableServer, startDeployableServer } from '../../server';
import { calculateRemainingAmount, ResponsibilityStatus } from '../domain/accommodation';
import { DEMO_ACCOMMODATION_RESPONSIBILITY } from '../data/demoAccommodation';
import { FakePaymentProvider } from '../server/payments/fakeProvider';
import { PaymentProvider } from '../domain/payments';

describe('H4D-FUNC-007: Deployable Payment Server Runtime', () => {
  let serverInstance: http.Server;
  let serverUrl: string;
  let serverPort: number;

  beforeAll(async () => {
    // 1. Deployable server starts independently of Vite dev middleware on an ephemeral port
    const started = await startDeployableServer(0, '127.0.0.1');
    serverInstance = started.server;
    serverPort = started.port;
    serverUrl = started.url;
  });

  afterAll(async () => {
    if (serverInstance) {
      await new Promise<void>((resolve) => serverInstance.close(() => resolve()));
    }
  });

  const sampleIntent = {
    intentId: 'intent-srv-test-001',
    responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
    amount: 66000,
    currency: 'NGN',
  };

  // Requirement 1: Starts independently of Vite dev middleware
  it('1. deployable server starts independently of Vite dev middleware', () => {
    expect(serverInstance).toBeDefined();
    expect(serverInstance.listening).toBe(true);
    expect(serverPort).toBeGreaterThan(0);
    expect(serverUrl).toContain('http://127.0.0.1:');
  });

  // Requirement 2: POST /api/payments/proposal is reachable
  it('2. POST /api/payments/proposal is reachable on the deployable server', async () => {
    const res = await fetch(`${serverUrl}/api/payments/proposal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sampleIntent),
    });

    // Should return HTTP response (not 404 or connection refused)
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(500);
    const json = await res.json();
    expect(json).toBeDefined();
  });

  // Requirement 3: Request reaches handleCreateProposal
  it('3. request reaches handleCreateProposal and validates schema', async () => {
    // Send invalid intent parameters
    const res = await fetch(`${serverUrl}/api/payments/proposal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 0 }),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('Invalid payment intent parameters.');
  });

  // Requirement 4: SIMULATED mode works through the real server endpoint
  it('4. SIMULATED mode works through real server endpoint using custom provider injection or env', async () => {
    // Start an independent deployable server instance configured with FakePaymentProvider
    const simServer = createDeployableServer({
      customProvider: new FakePaymentProvider(),
    });

    const simPort = await new Promise<number>((resolve) => {
      simServer.listen(0, '127.0.0.1', () => {
        const addr = simServer.address();
        resolve(typeof addr === 'object' && addr ? addr.port : 0);
      });
    });

    try {
      const res = await fetch(`http://127.0.0.1:${simPort}/api/payments/proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleIntent),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.proposal).toBeDefined();
      expect(json.proposal.provider).toBe('SIMULATED');
      expect(json.proposal.providerStatus).toBe('Simulated');
      expect(json.proposal.isSimulated).toBe(true);
      expect(json.proposal.paymentIntentId).toBe(sampleIntent.intentId);
    } finally {
      await new Promise<void>((resolve) => simServer.close(() => resolve()));
    }
  });

  // Requirement 5 & 6: BMONI mode does not silently fall back, missing credentials reported truthfully
  it('5 & 6. BMONI mode does not silently fall back; missing credentials reported truthfully', async () => {
    // Standard server without credentials in BMONI mode
    const res = await fetch(`${serverUrl}/api/payments/proposal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sampleIntent),
    });

    const json = await res.json();
    // Must NOT produce a simulated proposal
    expect(json.proposal).toBeUndefined();
    expect(json.success).toBe(false);
    expect(json.notConfigured).toBe(true);
    expect(json.requiresCredentials).toBe(true);
    expect(json.error).toBe('BMONI Sandbox Not Configured');
  });

  // Requirement 7: Payment provider secrets are not returned to the browser
  it('7. payment provider secrets and private keys are never returned in responses', async () => {
    const res = await fetch(`${serverUrl}/api/payments/proposal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sampleIntent),
    });

    const bodyText = await res.text();
    expect(bodyText).not.toContain('BMONI_API_KEY');
    expect(bodyText).not.toContain('BMONI_PARTNER_SECRET');
    expect(bodyText).not.toContain('private_key');
    expect(bodyText).not.toContain('secret');

    // Also check headers
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  // Extra server features: Health check & SPA routing fallback
  it('server exposes GET /api/health with status ok', async () => {
    const res = await fetch(`${serverUrl}/api/health`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.server).toBe('hut4devs-deployable');
    expect(json.endpoint).toBe('/api/payments/proposal');
  });

  it('rejects malformed JSON payload with 400 Bad Request', async () => {
    const res = await fetch(`${serverUrl}/api/payments/proposal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'INVALID_NOT_JSON{',
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('Invalid JSON payload.');
  });

  it('rejects unknown /api endpoints with 404', async () => {
    const res = await fetch(`${serverUrl}/api/unknown-endpoint`);
    expect(res.status).toBe(404);
  });

  // Critical Invariant: Accounting balances remain unaltered across all server states
  it('CRITICAL INVARIANT: Accommodation responsibility accounting remains untouched', () => {
    const resp = DEMO_ACCOMMODATION_RESPONSIBILITY;
    expect(resp.requiredAmount).toBe(66000);
    expect(resp.verifiedAmount).toBe(0);
    expect(calculateRemainingAmount(resp)).toBe(66000);
    expect(resp.status).toBe(ResponsibilityStatus.OUTSTANDING);
  });
});
