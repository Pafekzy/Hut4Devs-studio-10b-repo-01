import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from '../App';
import {
  calculateRemainingAmount,
  ResponsibilityStatus,
  formatNaira,
} from '../domain/accommodation';
import { DEMO_ACCOMMODATION_RESPONSIBILITY } from '../data/demoAccommodation';
import { AccommodationResponsibilityCard } from '../components/AccommodationResponsibilityCard';
import { ResponsibilityDetailView } from '../components/ResponsibilityDetailView';

describe('Accommodation Responsibility Domain & Component Tests', () => {
  // 1. Remaining amount derives correctly
  it('1. correctly derives remainingAmount from requiredAmount and verifiedAmount', () => {
    // Current demo case: 66,000 - 0 = 66,000
    const demoRemaining = calculateRemainingAmount({
      requiredAmount: 66000,
      verifiedAmount: 0,
    });
    expect(demoRemaining).toBe(66000);

    // Partially fulfilled case: 66,000 - 20,000 = 46,000
    const partialRemaining = calculateRemainingAmount({
      requiredAmount: 66000,
      verifiedAmount: 20000,
    });
    expect(partialRemaining).toBe(46000);

    // Fully fulfilled case: 66,000 - 66,000 = 0
    const fullRemaining = calculateRemainingAmount({
      requiredAmount: 66000,
      verifiedAmount: 66000,
    });
    expect(fullRemaining).toBe(0);

    // Overpayment guard: Math.max(0, ...)
    const overRemaining = calculateRemainingAmount({
      requiredAmount: 66000,
      verifiedAmount: 70000,
    });
    expect(overRemaining).toBe(0);
  });

  // 2. Outstanding responsibility renders
  it('2. renders the outstanding responsibility card with all required amounts and status', () => {
    render(
      <AccommodationResponsibilityCard
        responsibility={DEMO_ACCOMMODATION_RESPONSIBILITY}
        isDark={false}
        onViewDetails={() => {}}
      />
    );

    // Title
    expect(screen.getByText('September Accommodation')).toBeInTheDocument();

    // Status
    expect(screen.getByText('Outstanding')).toBeInTheDocument();

    // Amounts
    expect(screen.getByText('Required Amount')).toBeInTheDocument();
    expect(screen.getByText('Verified Amount')).toBeInTheDocument();
    expect(screen.getByText('Remaining Amount')).toBeInTheDocument();

    // Formatted amounts
    expect(screen.getAllByText(formatNaira(66000)).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(formatNaira(0))).toBeInTheDocument();
  });

  // 3. Property / Floor / Room context renders
  it('3. renders property, floor, and room context clearly', () => {
    render(
      <AccommodationResponsibilityCard
        responsibility={DEMO_ACCOMMODATION_RESPONSIBILITY}
        isDark={false}
        onViewDetails={() => {}}
      />
    );

    expect(screen.getByText('Infinite Grace Apartments')).toBeInTheDocument();
    expect(screen.getByText('Floor 3')).toBeInTheDocument();
    expect(screen.getByText('Room 3B')).toBeInTheDocument();
  });

  // 4. "View Responsibility" opens detail view in full App workflow
  it('4. opens detail view when "View Responsibility" is clicked', () => {
    render(<App />);

    // Enter Hut4Devs from Landing
    const enterBtn = screen.getByRole('button', { name: /enter hut4devs/i });
    fireEvent.click(enterBtn);

    // We are on Member Home: find "View Responsibility"
    const viewBtn = screen.getByRole('button', { name: /view responsibility/i });
    expect(viewBtn).toBeInTheDocument();

    fireEvent.click(viewBtn);

    // Detail view should now be visible
    expect(screen.getByRole('heading', { level: 1, name: /september accommodation/i })).toBeInTheDocument();
    expect(screen.getByText(/accommodation context/i)).toBeInTheDocument();
    expect(screen.getByText('Infinite Grace Apartments')).toBeInTheDocument();
    expect(screen.getByText('Floor 3')).toBeInTheDocument();
    expect(screen.getByText('Room 3B')).toBeInTheDocument();
  });

  // 5. "Back to Home" returns correctly
  it('5. returns to Member Home when "Back to Home" is clicked in detail view', () => {
    render(<App />);

    // Enter Member Home
    fireEvent.click(screen.getByRole('button', { name: /enter hut4devs/i }));

    // Click "View Responsibility"
    fireEvent.click(screen.getByRole('button', { name: /view responsibility/i }));

    // Click "[ Back to Home ]"
    const backBtns = screen.getAllByRole('button', { name: /back to home/i });
    expect(backBtns.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(backBtns[0]);

    // Should return to Member Home heading
    expect(screen.getByText('What needs your attention?')).toBeInTheDocument();
  });

  // 6. No payment action is rendered
  it('6. verifies that NO payment buttons or payment actions are rendered', () => {
    const { container: cardContainer } = render(
      <AccommodationResponsibilityCard
        responsibility={DEMO_ACCOMMODATION_RESPONSIBILITY}
        isDark={false}
        onViewDetails={() => {}}
      />
    );

    // Check card for absence of payment keywords
    expect(screen.queryByRole('button', { name: /settle/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /pay/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /make payment/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /bmoni/i })).toBeNull();
    expect(screen.queryByText(/upload screenshot/i)).toBeNull();
    expect(screen.queryByText(/payment reference/i)).toBeNull();

    const { container: detailContainer } = render(
      <ResponsibilityDetailView
        responsibility={DEMO_ACCOMMODATION_RESPONSIBILITY}
        isDark={false}
        onToggleTheme={() => {}}
        onBackToHome={() => {}}
      />
    );

    // Check detail view for absence of payment keywords
    expect(screen.queryByRole('button', { name: /settle/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /pay/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /make payment/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /bmoni/i })).toBeNull();
  });
});
