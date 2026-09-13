import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from '../App';
import {
  deriveAccommodationOperationalSummary,
  calculateRemainingAmount,
  ResponsibilityStatus,
  formatNaira,
} from '../domain/accommodation';
import { DEMO_ACCOMMODATION_RESPONSIBILITY } from '../data/demoAccommodation';
import { AccommodationAdminView } from '../components/AccommodationAdminView';

describe('H4D-FUNC-003: Accommodation Admin Command Center (Read View)', () => {
  // 1. Admin workspace renders
  it('1. renders the Accommodation Admin workspace heading and development preview notice', () => {
    render(
      <AccommodationAdminView
        isDark={false}
        responsibilities={[DEMO_ACCOMMODATION_RESPONSIBILITY]}
        onToggleTheme={() => {}}
        onSwitchToFellow={() => {}}
        onExitToLanding={() => {}}
      />
    );

    // Workspace title
    expect(screen.getByRole('heading', { level: 1, name: /accommodation admin/i })).toBeInTheDocument();

    // Dev preview notice: no auth claimed
    expect(screen.getByText(/no authentication or authorization is claimed/i)).toBeInTheDocument();
  });

  // 2. Property → Floor → Room → Fellow hierarchy renders
  it('2. renders Property → Floor → Room → Fellow → Responsibility hierarchy', () => {
    render(
      <AccommodationAdminView
        isDark={false}
        responsibilities={[DEMO_ACCOMMODATION_RESPONSIBILITY]}
        onToggleTheme={() => {}}
        onSwitchToFellow={() => {}}
        onExitToLanding={() => {}}
      />
    );

    // Hierarchy nodes
    expect(screen.getByText('Infinite Grace Apartments')).toBeInTheDocument();
    expect(screen.getByText('Floor 3')).toBeInTheDocument();
    expect(screen.getByText('Room 3B')).toBeInTheDocument();
    expect(screen.getByText('Current Fellow')).toBeInTheDocument();
    expect(screen.getByText('September Accommodation')).toBeInTheDocument();

    // Visual arrows
    const arrows = screen.getAllByText('→');
    expect(arrows.length).toBeGreaterThanOrEqual(4);
  });

  // 3. ₦66,000 / ₦0 / ₦66,000 renders correctly
  it('3. renders Required: ₦66,000, Verified: ₦0, and Remaining: ₦66,000 correctly', () => {
    render(
      <AccommodationAdminView
        isDark={false}
        responsibilities={[DEMO_ACCOMMODATION_RESPONSIBILITY]}
        onToggleTheme={() => {}}
        onSwitchToFellow={() => {}}
        onExitToLanding={() => {}}
      />
    );

    expect(screen.getByText('Required:')).toBeInTheDocument();
    expect(screen.getByText('Verified:')).toBeInTheDocument();
    expect(screen.getByText('Remaining:')).toBeInTheDocument();

    // ₦66,000 appears for both Required and Remaining
    const naira66k = screen.getAllByText(formatNaira(66000));
    expect(naira66k.length).toBeGreaterThanOrEqual(2);

    // ₦0 appears for Verified
    expect(screen.getByText(formatNaira(0))).toBeInTheDocument();
  });

  // 4. Outstanding status renders
  it('4. renders the Outstanding responsibility status', () => {
    render(
      <AccommodationAdminView
        isDark={false}
        responsibilities={[DEMO_ACCOMMODATION_RESPONSIBILITY]}
        onToggleTheme={() => {}}
        onSwitchToFellow={() => {}}
        onExitToLanding={() => {}}
      />
    );

    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('Outstanding')).toBeInTheDocument();
  });

  // 5. Summary counts derive correctly
  it('5. derives and renders operational summary counts correctly', () => {
    // Test pure derivation function
    const summary = deriveAccommodationOperationalSummary([DEMO_ACCOMMODATION_RESPONSIBILITY]);
    expect(summary.propertiesCount).toBe(1);
    expect(summary.roomsRepresentedCount).toBe(1);
    expect(summary.fellowsRepresentedCount).toBe(1);
    expect(summary.outstandingResponsibilitiesCount).toBe(1);

    // Render component and verify displayed summary counts
    render(
      <AccommodationAdminView
        isDark={false}
        responsibilities={[DEMO_ACCOMMODATION_RESPONSIBILITY]}
        onToggleTheme={() => {}}
        onSwitchToFellow={() => {}}
        onExitToLanding={() => {}}
      />
    );

    expect(screen.getByText('Properties: 1')).toBeInTheDocument();
    expect(screen.getByText('Rooms represented: 1')).toBeInTheDocument();
    expect(screen.getByText('Fellows represented: 1')).toBeInTheDocument();
    expect(screen.getByText('Outstanding responsibilities: 1')).toBeInTheDocument();
  });

  // 6. No payment action exists
  it('6. verifies that NO payment action or button exists in the admin workspace', () => {
    render(
      <AccommodationAdminView
        isDark={false}
        responsibilities={[DEMO_ACCOMMODATION_RESPONSIBILITY]}
        onToggleTheme={() => {}}
        onSwitchToFellow={() => {}}
        onExitToLanding={() => {}}
      />
    );

    expect(screen.queryByRole('button', { name: /settle/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /pay/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /make payment/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /bmoni/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /verify payment/i })).toBeNull();
    expect(screen.queryByText(/upload screenshot/i)).toBeNull();
    expect(screen.queryByText(/peer support/i)).toBeNull();
    expect(screen.queryByText(/vouching/i)).toBeNull();
  });

  // 7. Full App Workflow: Switch between Fellow view and Admin view
  it('7. allows switching from Fellow view to Accommodation Admin view and back via Dev Preview', () => {
    render(<App />);

    // Start at Landing, enter Hut4Devs
    fireEvent.click(screen.getByRole('button', { name: /enter hut4devs/i }));

    // Fellow view is active
    expect(screen.getByText('What needs your attention?')).toBeInTheDocument();

    // Dev preview switcher is available
    const switchToAdminBtns = screen.getAllByRole('button', { name: /switch to accommodation admin/i });
    expect(switchToAdminBtns.length).toBeGreaterThanOrEqual(1);

    // Click to switch to Accommodation Admin
    fireEvent.click(switchToAdminBtns[0]);

    // Admin view should now be active
    expect(screen.getByRole('heading', { level: 1, name: /accommodation admin/i })).toBeInTheDocument();
    expect(screen.getByText(/Properties:/i)).toBeInTheDocument();
    expect(screen.getAllByText('Infinite Grace Apartments').length).toBeGreaterThanOrEqual(1);

    // Switch back to Fellow view
    const switchToFellowBtns = screen.getAllByRole('button', { name: /switch to fellow view/i });
    expect(switchToFellowBtns.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(switchToFellowBtns[0]);

    // Back in Fellow view
    expect(screen.getByText('What needs your attention?')).toBeInTheDocument();
  });

  // 8. H4D-FUNC-010: Live Real-Time Stream Status & Prepared Intent Delivery
  it('8. renders live real-time stream status and prepared intent operational updates', () => {
    render(
      <AccommodationAdminView
        isDark={false}
        responsibilities={[DEMO_ACCOMMODATION_RESPONSIBILITY]}
        onToggleTheme={() => {}}
        onSwitchToFellow={() => {}}
        onExitToLanding={() => {}}
        streamStatus="connected"
        preparedIntents={[
          {
            id: 'intent-live-test',
            responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
            amount: 20000,
            fulfilmentType: 'PARTIAL' as any,
            status: 'PREPARED' as any,
            createdAt: new Date().toISOString(),
          },
        ]}
      />
    );

    // Live stream status badge
    expect(screen.getByText(/live stream:\s*connected/i)).toBeInTheDocument();

    // Operational Activity section
    expect(screen.getByText('Operational Activity: Payment Preparation')).toBeInTheDocument();
    expect(screen.getByText('Status: Prepared — Not Verified')).toBeInTheDocument();
    expect(screen.getByText(formatNaira(20000))).toBeInTheDocument();
  });

  // 9. Invariant: Prepared intent does NOT claim verified money in Admin view
  it('9. ensures prepared intents do NOT alter verified amounts or claim payment verification', () => {
    render(
      <AccommodationAdminView
        isDark={false}
        responsibilities={[DEMO_ACCOMMODATION_RESPONSIBILITY]}
        onToggleTheme={() => {}}
        onSwitchToFellow={() => {}}
        onExitToLanding={() => {}}
        streamStatus="connected"
        preparedIntents={[
          {
            id: 'intent-live-test',
            responsibilityId: DEMO_ACCOMMODATION_RESPONSIBILITY.id,
            amount: 20000,
            fulfilmentType: 'PARTIAL' as any,
            status: 'PREPARED' as any,
            createdAt: new Date().toISOString(),
          },
        ]}
      />
    );

    // Verified amount must still be ₦0
    expect(screen.getByText('Verified:')).toBeInTheDocument();
    expect(screen.getByText(formatNaira(0))).toBeInTheDocument();

    // Never display "Verified: ₦20,000"
    expect(screen.queryByText('Verified: ₦20,000')).toBeNull();
  });
});
