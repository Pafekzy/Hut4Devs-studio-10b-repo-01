import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { AccommodationAdminView, AdminProviderEventDisplay } from '../components/AccommodationAdminView';
import { DEMO_ACCOMMODATION_RESPONSIBILITY } from '../data/demoAccommodation';

describe('H4D-FUNC-012: Accommodation Admin Provider Event Store Audit View', () => {
  const sampleEvents: AdminProviderEventDisplay[] = [
    {
      id: 'pevt_123',
      provider: 'BMONI',
      providerEventId: 'bmoni_evt_99901',
      eventType: 'payment.completed',
      providerStatus: 'COMPLETED',
      providerProposalId: 'bmoni_prop_alpha',
      statusLabel: 'Received — Awaiting Reconciliation',
      receivedAt: '2026-09-09T14:30:00Z',
    },
  ];

  it('1. renders provider events audit log when providerEvents are provided', () => {
    render(
      <AccommodationAdminView
        isDark={false}
        responsibilities={[DEMO_ACCOMMODATION_RESPONSIBILITY]}
        onToggleTheme={() => {}}
        onSwitchToFellow={() => {}}
        onExitToLanding={() => {}}
        providerEvents={sampleEvents}
      />
    );

    // Section title
    expect(screen.getByText(/Provider Ingestion Audit/i)).toBeInTheDocument();
    expect(screen.getByText(/Provider Events Received/i)).toBeInTheDocument();

    // Event details
    expect(screen.getByText(/Provider: BMONI/i)).toBeInTheDocument();
    expect(screen.getByText(/Event: payment.completed/i)).toBeInTheDocument();
    expect(screen.getByText(/ID: bmoni_evt_99901/i)).toBeInTheDocument();
    expect(screen.getByText(/Proposal: bmoni_prop_alpha/i)).toBeInTheDocument();

    // Clear operational status badge
    expect(screen.getByText(/Status: Received — Awaiting Reconciliation/i)).toBeInTheDocument();
    expect(screen.getByText(/\* Provider event received\. Not verified\. Awaiting reconciliation\./i)).toBeInTheDocument();
  });

  it('2. preserves financial amounts as Required: ₦66,000, Verified: ₦0, Remaining: ₦66,000', () => {
    render(
      <AccommodationAdminView
        isDark={false}
        responsibilities={[DEMO_ACCOMMODATION_RESPONSIBILITY]}
        onToggleTheme={() => {}}
        onSwitchToFellow={() => {}}
        onExitToLanding={() => {}}
        providerEvents={sampleEvents}
      />
    );

    // Invariant: Accommodation Responsibility amounts are completely untouched
    const naira66k = screen.getAllByText('₦66,000');
    expect(naira66k.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('₦0')).toBeInTheDocument();
    expect(screen.getByText('Outstanding')).toBeInTheDocument();
  });

  it('3. does not render provider events section when providerEvents list is empty', () => {
    render(
      <AccommodationAdminView
        isDark={false}
        responsibilities={[DEMO_ACCOMMODATION_RESPONSIBILITY]}
        onToggleTheme={() => {}}
        onSwitchToFellow={() => {}}
        onExitToLanding={() => {}}
        providerEvents={[]}
      />
    );

    expect(screen.queryByText(/Provider Ingestion Audit/i)).not.toBeInTheDocument();
  });
});
