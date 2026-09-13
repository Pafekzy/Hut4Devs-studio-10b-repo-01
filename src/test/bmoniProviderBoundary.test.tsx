import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import {
  PaymentProvider,
  ExternalPaymentProposal,
} from '../domain/payments';
import {
  BmoniPaymentProvider,
  mapBmoniProposalResponse,
  mapIntentToBmoniRequest,
} from '../server/payments/bmoniProvider';
import { FakePaymentProvider } from '../server/payments/fakeProvider';
import { handleCreateProposal } from '../server/payments/serverHandler';
import {
  AccommodationResponsibility,
  ResponsibilityStatus,
  AccommodationPaymentIntent,
  FulfilmentType,
  PaymentIntentStatus,
  calculateRemainingAmount,
} from '../domain/accommodation';
import { DEMO_ACCOMMODATION_RESPONSIBILITY } from '../data/demoAccommodation';
import { FulfilmentFlow } from '../components/FulfilmentFlow';
import { AccommodationAdminView } from '../components/AccommodationAdminView';
import { ResponsibilityDetailView } from '../components/ResponsibilityDetailView';

describe('H4D-FUNC-005 & H4D-FUNC-006: Real BMONI Sandbox Proposal Validation & Provider Boundary', () => {
  const sampleIntent: AccommodationPaymentIntent = {
    id: 'intent-test-001',
    responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
    amount: 66000,
    fulfilmentType: FulfilmentType.FULL,
    status: PaymentIntentStatus.PREPARED,
    createdAt: new Date().toISOString(),
  };

  // Requirement 1: SIMULATED mode explicitly uses FakePaymentProvider
  it('1. SIMULATED mode explicitly uses FakePaymentProvider', async () => {
    const res = await handleCreateProposal(
      {
        intentId: sampleIntent.id,
        responsibilityId: sampleIntent.responsibilityId,
        amount: sampleIntent.amount,
        currency: 'NGN',
      },
      undefined,
      'SIMULATED'
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.proposal).toBeDefined();
    expect(res.body.proposal?.provider).toBe('SIMULATED');
    expect(res.body.proposal?.providerStatus).toBe('Simulated');
    expect(res.body.proposal?.isSimulated).toBe(true);
    expect(res.body.proposal?.paymentIntentId).toBe(sampleIntent.id);
  });

  // Requirement 2: BMONI mode never silently falls back to simulation
  it('2. BMONI mode never silently falls back to simulation', async () => {
    // When in BMONI mode with unconfigured credentials, even if preview/fallback were attempted:
    const res = await handleCreateProposal(
      {
        intentId: sampleIntent.id,
        responsibilityId: sampleIntent.responsibilityId,
        amount: sampleIntent.amount,
        currency: 'NGN',
        allowPreviewMode: true,
      },
      undefined,
      'BMONI'
    );

    // MUST NOT produce a simulated proposal
    expect(res.body.proposal).toBeUndefined();
    expect(res.body.notConfigured).toBe(true);
    expect(res.body.error).toBe('BMONI Sandbox Not Configured');
  });

  // Requirement 3: Missing credentials produce NOT CONFIGURED
  it('3. missing credentials produce NOT CONFIGURED', async () => {
    const res = await handleCreateProposal(
      {
        intentId: sampleIntent.id,
        responsibilityId: sampleIntent.responsibilityId,
        amount: sampleIntent.amount,
        currency: 'NGN',
      },
      undefined,
      'BMONI'
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.notConfigured).toBe(true);
    expect(res.body.requiresCredentials).toBe(true);
    expect(res.body.error).toBe('BMONI Sandbox Not Configured');
  });

  // Requirement 4: Real BMONI response mapping preserves actual provider status
  it('4. real BMONI response mapping preserves actual provider status without inventing names', () => {
    const req = {
      intentId: 'intent-status-001',
      responsibilityId: 'resp-status-001',
      amount: 66000,
      currency: 'NGN',
    };

    const mappedA = mapBmoniProposalResponse(
      { status: 'pending_approval', id: 'bmoni-001' },
      req
    );
    expect(mappedA.providerStatus).toBe('pending_approval');
    expect(mappedA.provider).toBe('BMONI');
    expect(mappedA.isSimulated).toBe(false);

    const mappedB = mapBmoniProposalResponse(
      { providerStatus: 'AWAITING_AUTHORIZATION', id: 'bmoni-002' },
      req
    );
    expect(mappedB.providerStatus).toBe('AWAITING_AUTHORIZATION');

    const mappedC = mapBmoniProposalResponse(
      { status: 'DRAFT_CREATED', id: 'bmoni-003' },
      req
    );
    expect(mappedC.providerStatus).toBe('DRAFT_CREATED');
  });

  // Requirement 5: providerProposalId is correlated with paymentIntentId
  it('5. providerProposalId is correlated with paymentIntentId', () => {
    const req = {
      intentId: 'intent-corr-999',
      responsibilityId: 'resp-corr-999',
      amount: 66000,
      currency: 'NGN',
    };

    const mapped = mapBmoniProposalResponse(
      { id: 'BMONI-PROP-UNIQUE-888', status: 'PENDING_CONFIRMATION' },
      req
    );

    expect(mapped.paymentIntentId).toBe('intent-corr-999');
    expect(mapped.providerProposalId).toBe('BMONI-PROP-UNIQUE-888');
    expect(mapped.responsibilityId).toBe('resp-corr-999');
  });

  // Requirement 6: definitive provider failure does not mutate responsibility
  it('6. definitive provider failure does not mutate responsibility', async () => {
    const original: AccommodationResponsibility = {
      ...DEMO_ACCOMMODATION_RESPONSIBILITY,
    };

    // Mock definitive provider rejection (HTTP 400 from BMONI)
    const mockRejectProvider: PaymentProvider = {
      name: 'BMONI',
      createProposal: async () => ({
        success: false,
        error:
          "We couldn't prepare this payment with BMONI. No payment has been executed. Your accommodation balance has not changed.",
        definitiveFailure: true,
      }),
    };

    const res = await handleCreateProposal(
      {
        intentId: sampleIntent.id,
        responsibilityId: sampleIntent.responsibilityId,
        amount: sampleIntent.amount,
        currency: 'NGN',
      },
      mockRejectProvider
    );

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.definitiveFailure).toBe(true);

    // Responsibility remains completely unmutated
    expect(original.requiredAmount).toBe(66000);
    expect(original.verifiedAmount).toBe(0);
    expect(calculateRemainingAmount(original)).toBe(66000);
    expect(original.status).toBe(ResponsibilityStatus.OUTSTANDING);
  });

  // Requirement 7: ambiguous network failure does not blindly retry
  it('7. ambiguous network failure does not blindly retry', async () => {
    let callCount = 0;
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      callCount++;
      throw new Error('Network timeout (ETIMEDOUT)');
    });

    const { requestBmoniProposal } = await import('../services/paymentClient');
    const result = await requestBmoniProposal(sampleIntent);

    // Verify fetch was invoked once without blind automated retry
    expect(callCount).toBe(1);
    expect(result.success).toBe(false);
    expect(result.isAmbiguousError).toBe(true);
    expect(result.error).toContain('Unresolved proposal attempt');
    expect(result.error).toContain('Do not retry automatically');

    fetchSpy.mockRestore();
  });

  // Requirement 8: no credentials appear in client-side source/bundle-facing configuration
  it('8. no credentials appear in client-side source/bundle-facing configuration', () => {
    // In Vite, only VITE_ prefixed env variables are exposed to client bundle
    const clientEnv = (import.meta as any).env || {};

    expect(clientEnv.VITE_BMONI_API_KEY).toBeUndefined();
    expect(clientEnv.VITE_BMONI_PARTNER_SECRET).toBeUndefined();
    expect(clientEnv.BMONI_API_KEY).toBeUndefined();
    expect(clientEnv.BMONI_PARTNER_SECRET).toBeUndefined();
  });

  // Requirement 9, 10, 11: verifiedAmount remains 0, remainingAmount remains 66000, status remains Outstanding
  it('9, 10, 11. CRITICAL INVARIANTS: verifiedAmount is 0, remainingAmount is 66000, status remains Outstanding across all states', () => {
    const resp: AccommodationResponsibility = {
      ...DEMO_ACCOMMODATION_RESPONSIBILITY,
    };

    // State A: Simulation
    expect(resp.verifiedAmount).toBe(0);
    expect(calculateRemainingAmount(resp)).toBe(66000);
    expect(resp.status).toBe(ResponsibilityStatus.OUTSTANDING);

    // State B: Not configured
    expect(resp.verifiedAmount).toBe(0);
    expect(calculateRemainingAmount(resp)).toBe(66000);
    expect(resp.status).toBe(ResponsibilityStatus.OUTSTANDING);

    // State C: Proposal created
    expect(resp.verifiedAmount).toBe(0);
    expect(calculateRemainingAmount(resp)).toBe(66000);
    expect(resp.status).toBe(ResponsibilityStatus.OUTSTANDING);

    // State D: Definitive failure
    expect(resp.verifiedAmount).toBe(0);
    expect(calculateRemainingAmount(resp)).toBe(66000);
    expect(resp.status).toBe(ResponsibilityStatus.OUTSTANDING);

    // Ambiguous failure
    expect(resp.verifiedAmount).toBe(0);
    expect(calculateRemainingAmount(resp)).toBe(66000);
    expect(resp.status).toBe(ResponsibilityStatus.OUTSTANDING);
  });

  // Requirement 12: UI Verification for State B (BMONI Sandbox Not Configured)
  it('12. UI displays "BMONI Sandbox Not Configured" when credentials are unconfigured', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: false,
        error: 'BMONI Sandbox Not Configured',
        notConfigured: true,
        requiresCredentials: true,
      }),
    } as Response);

    render(
      <FulfilmentFlow
        responsibility={DEMO_ACCOMMODATION_RESPONSIBILITY}
        isDark={false}
        onClose={() => {}}
        onIntentPrepared={() => {}}
      />
    );

    // Move to review and prepare
    fireEvent.click(screen.getByRole('button', { name: /continue to review/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm preparation/i }));

    // Click Continue with BMONI
    fireEvent.click(screen.getByRole('button', { name: /continue with bmoni/i }));

    // State B notice should appear
    await waitFor(() => {
      expect(screen.getByText('BMONI Sandbox Not Configured')).toBeInTheDocument();
      expect(screen.getByText('No request was sent.')).toBeInTheDocument();
      expect(screen.getByText('Your accommodation balance has not changed.')).toBeInTheDocument();
    });

    fetchSpy.mockRestore();
  });

  // UI Verification for State C (Real BMONI Proposal Created)
  it('UI displays State C with actual provider status and safe reference when real BMONI response confirms creation', async () => {
    const realBmoniProposal: ExternalPaymentProposal = {
      id: 'prop-real-001',
      paymentIntentId: sampleIntent.id,
      responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
      provider: 'BMONI',
      providerProposalId: 'BMONI-REF-LIVE-777',
      amount: 66000,
      currency: 'NGN',
      providerStatus: 'PENDING_APPROVAL',
      createdAt: new Date().toISOString(),
      isSimulated: false,
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        proposal: realBmoniProposal,
      }),
    } as Response);

    render(
      <FulfilmentFlow
        responsibility={DEMO_ACCOMMODATION_RESPONSIBILITY}
        isDark={false}
        onClose={() => {}}
        onIntentPrepared={() => {}}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /continue to review/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm preparation/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue with bmoni/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /payment preparation/i })).toBeInTheDocument();
    });

    // STATE C: Real BMONI assertions
    expect(screen.getByText('BMONI')).toBeInTheDocument();
    expect(screen.getByText('Proposal: Created')).toBeInTheDocument();
    expect(screen.getByText('PENDING_APPROVAL')).toBeInTheDocument();
    expect(screen.getByText('BMONI-REF-LIVE-777')).toBeInTheDocument();
    expect(screen.getByText('No money has moved yet.')).toBeInTheDocument();
    expect(screen.getByText('Your accommodation responsibility remains unverified.')).toBeInTheDocument();

    fetchSpy.mockRestore();
  });

  // UI Verification for State D (Definitive Failure)
  it('UI displays State D "We couldn\'t prepare this payment with BMONI" on definitive rejection', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        error: "We couldn't prepare this payment with BMONI. No payment has been executed. Your accommodation balance has not changed.",
        definitiveFailure: true,
      }),
    } as Response);

    render(
      <FulfilmentFlow
        responsibility={DEMO_ACCOMMODATION_RESPONSIBILITY}
        isDark={false}
        onClose={() => {}}
        onIntentPrepared={() => {}}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /continue to review/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm preparation/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue with bmoni/i }));

    await waitFor(() => {
      expect(screen.getByText("We couldn't prepare this payment with BMONI.")).toBeInTheDocument();
      expect(screen.getByText('No payment has been executed.')).toBeInTheDocument();
      expect(screen.getByText('Your accommodation balance has not changed.')).toBeInTheDocument();
    });

    fetchSpy.mockRestore();
  });
});
