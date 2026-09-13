import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from '../App';
import {
  validateFulfilmentAmount,
  calculateRemainingAmount,
  FulfilmentType,
  PaymentIntentStatus,
  AccommodationResponsibility,
  ResponsibilityStatus,
  formatNaira,
} from '../domain/accommodation';
import { DEMO_ACCOMMODATION_RESPONSIBILITY } from '../data/demoAccommodation';
import { FulfilmentFlow } from '../components/FulfilmentFlow';
import { ResponsibilityDetailView } from '../components/ResponsibilityDetailView';

describe('H4D-FUNC-004: Accommodation Fulfilment Intent Preparation', () => {
  // 1. Full fulfilment defaults to remaining amount
  it('1. defaults full fulfilment to the remaining amount', () => {
    const handlePrepared = vi.fn();
    render(
      <FulfilmentFlow
        responsibility={DEMO_ACCOMMODATION_RESPONSIBILITY}
        isDark={false}
        onClose={() => {}}
        onIntentPrepared={handlePrepared}
      />
    );

    // Initial step shows full amount with ₦66,000
    expect(screen.getByText(/full amount — ₦66,000/i)).toBeInTheDocument();

    // Click "Continue to Review"
    fireEvent.click(screen.getByRole('button', { name: /continue to review/i }));

    // Review step should display Full type and ₦66,000
    expect(screen.getByRole('heading', { name: /review fulfilment/i })).toBeInTheDocument();
    expect(screen.getByText('Full')).toBeInTheDocument();
    expect(screen.getByText('₦66,000', { selector: 'span.font-mono.font-bold' })).toBeInTheDocument();
  });

  // 2. Partial fulfilment accepts a valid amount
  it('2. accepts a valid partial amount and displays in review step', () => {
    const handlePrepared = vi.fn();
    render(
      <FulfilmentFlow
        responsibility={DEMO_ACCOMMODATION_RESPONSIBILITY}
        isDark={false}
        onClose={() => {}}
        onIntentPrepared={handlePrepared}
      />
    );

    // Select Partial Amount
    fireEvent.click(screen.getByText('Partial Amount'));

    // Input 25000
    const input = screen.getByLabelText('Partial Amount');
    fireEvent.change(input, { target: { value: '25000' } });

    // Proceed to review
    fireEvent.click(screen.getByRole('button', { name: /continue to review/i }));

    expect(screen.getByRole('heading', { name: /review fulfilment/i })).toBeInTheDocument();
    expect(screen.getByText('Partial')).toBeInTheDocument();
    expect(screen.getByText('₦25,000', { selector: 'span.font-mono.font-bold' })).toBeInTheDocument();
    expect(screen.getByText('Expected Remaining IF payment is eventually verified:')).toBeInTheDocument();
    expect(screen.getByText('₦41,000')).toBeInTheDocument();
  });

  // 3. Zero is rejected
  it('3. rejects zero as an invalid fulfilment amount', () => {
    // Pure function validation
    const result = validateFulfilmentAmount(0, 66000);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/enter an amount up to your remaining responsibility/i);

    // UI validation
    render(
      <FulfilmentFlow
        responsibility={DEMO_ACCOMMODATION_RESPONSIBILITY}
        isDark={false}
        onClose={() => {}}
        onIntentPrepared={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Partial Amount'));
    const input = screen.getByLabelText('Partial Amount');
    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /continue to review/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Enter an amount up to your remaining responsibility of ₦66,000.'
    );
  });

  // 4. Negative amount is rejected
  it('4. rejects negative amounts', () => {
    const result = validateFulfilmentAmount(-10000, 66000);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/enter an amount up to your remaining responsibility/i);
  });

  // 5. Amount greater than remaining is rejected
  it('5. rejects amounts exceeding the remaining responsibility (e.g. ₦70,000 when remaining is ₦66,000)', () => {
    const result = validateFulfilmentAmount(70000, 66000);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Enter an amount up to your remaining responsibility of ₦66,000.');

    // UI test
    render(
      <FulfilmentFlow
        responsibility={DEMO_ACCOMMODATION_RESPONSIBILITY}
        isDark={false}
        onClose={() => {}}
        onIntentPrepared={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Partial Amount'));
    const input = screen.getByLabelText('Partial Amount');
    fireEvent.change(input, { target: { value: '70000' } });
    fireEvent.click(screen.getByRole('button', { name: /continue to review/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Enter an amount up to your remaining responsibility of ₦66,000.'
    );
  });

  // 6. Prepared intent records correct amount and type
  it('6. records prepared intent with correct amount, status PREPARED, and type', () => {
    const handlePrepared = vi.fn();
    render(
      <FulfilmentFlow
        responsibility={DEMO_ACCOMMODATION_RESPONSIBILITY}
        isDark={false}
        onClose={() => {}}
        onIntentPrepared={handlePrepared}
      />
    );

    // Select Partial and enter 20000
    fireEvent.click(screen.getByText('Partial Amount'));
    const input = screen.getByLabelText('Partial Amount');
    fireEvent.change(input, { target: { value: '20000' } });
    fireEvent.click(screen.getByRole('button', { name: /continue to review/i }));

    // Review step notices
    expect(screen.getByText(/payment execution is not connected in this build/i)).toBeInTheDocument();
    expect(
      screen.getByText(/preparing this fulfilment does not mark your responsibility as paid or verified/i)
    ).toBeInTheDocument();

    // Confirm preparation
    fireEvent.click(screen.getByRole('button', { name: /confirm preparation/i }));

    // Check callback arguments
    expect(handlePrepared).toHaveBeenCalledTimes(1);
    const intent = handlePrepared.mock.calls[0][0];
    expect(intent.amount).toBe(20000);
    expect(intent.fulfilmentType).toBe(FulfilmentType.PARTIAL);
    expect(intent.status).toBe(PaymentIntentStatus.PREPARED);
    expect(intent.responsibilityId).toBe(DEMO_ACCOMMODATION_RESPONSIBILITY.id);

    // Confirmation step visible
    expect(screen.getByRole('heading', { name: /fulfilment prepared/i })).toBeInTheDocument();
    expect(screen.getByText('Prepared', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText(/no payment has been executed yet/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /your verified accommodation balance will only change after a payment is successfully executed and verified/i
      )
    ).toBeInTheDocument();
  });

  // 7, 8, 9. Critical Invariant: Preparing an intent does NOT modify verifiedAmount, remainingAmount, or status
  it('7, 8, 9. CRITICAL INVARIANT: Preparing an intent does NOT modify verifiedAmount, remainingAmount, or responsibility status', () => {
    // Immutable snapshot of responsibility
    const initialResponsibility: AccommodationResponsibility = {
      ...DEMO_ACCOMMODATION_RESPONSIBILITY,
      requiredAmount: 66000,
      verifiedAmount: 0,
      status: ResponsibilityStatus.OUTSTANDING,
    };

    let capturedIntent: any = null;
    const { rerender } = render(
      <ResponsibilityDetailView
        responsibility={initialResponsibility}
        isDark={false}
        onToggleTheme={() => {}}
        onBackToHome={() => {}}
        onIntentPrepared={(intent) => {
          capturedIntent = intent;
        }}
      />
    );

    // Click "Fulfil Responsibility"
    fireEvent.click(screen.getByRole('button', { name: /fulfil responsibility/i }));

    // Select Partial 20,000
    fireEvent.click(screen.getByText('Partial Amount'));
    const input = screen.getByLabelText('Partial Amount');
    fireEvent.change(input, { target: { value: '20000' } });
    fireEvent.click(screen.getByRole('button', { name: /continue to review/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm preparation/i }));

    // Close modal via Back to Responsibility
    fireEvent.click(screen.getByRole('button', { name: /back to responsibility/i }));

    // Rerender with captured intent in list
    rerender(
      <ResponsibilityDetailView
        responsibility={initialResponsibility}
        isDark={false}
        onToggleTheme={() => {}}
        onBackToHome={() => {}}
        preparedIntents={capturedIntent ? [capturedIntent] : []}
      />
    );

    // INVARIANT 7: verifiedAmount remains ₦0
    expect(initialResponsibility.verifiedAmount).toBe(0);
    expect(screen.getByText(formatNaira(0))).toBeInTheDocument();

    // INVARIANT 8: remainingAmount remains ₦66,000
    expect(calculateRemainingAmount(initialResponsibility)).toBe(66000);
    const naira66kElements = screen.getAllByText(formatNaira(66000));
    expect(naira66kElements.length).toBeGreaterThanOrEqual(1);

    // INVARIANT 9: status remains Outstanding
    expect(initialResponsibility.status).toBe(ResponsibilityStatus.OUTSTANDING);
    expect(screen.getByText('Outstanding')).toBeInTheDocument();

    // Prepared intent badge shows "Prepared — Not Verified"
    expect(screen.getByText('Prepared — Not Verified')).toBeInTheDocument();
  });

  // 10. No success/verified payment message is rendered
  it('10. does NOT display "Payment Successful", "Payment Completed", "Payment Verified", "Paid", or "Settled"', () => {
    render(
      <FulfilmentFlow
        responsibility={DEMO_ACCOMMODATION_RESPONSIBILITY}
        isDark={false}
        onClose={() => {}}
        onIntentPrepared={() => {}}
      />
    );

    // Proceed to review and confirm
    fireEvent.click(screen.getByRole('button', { name: /continue to review/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm preparation/i }));

    // Assert strictly that forbidden payment success phrases are absent
    expect(screen.queryByText(/payment successful/i)).toBeNull();
    expect(screen.queryByText(/payment completed/i)).toBeNull();
    expect(screen.queryByText(/payment verified/i)).toBeNull();
    expect(screen.queryByText(/^paid$/i)).toBeNull();
    expect(screen.queryByText(/^settled$/i)).toBeNull();
  });

  // 11. Full App flow integration
  it('11. allows opening fulfilment flow from Detail View in full App, preparing intent, and returning', () => {
    render(<App />);

    // Enter Member Home
    fireEvent.click(screen.getByRole('button', { name: /enter hut4devs/i }));

    // Open Responsibility Detail
    fireEvent.click(screen.getByRole('button', { name: /view responsibility/i }));

    // Detail view rendered with Fulfil Responsibility button
    const fulfilBtn = screen.getByRole('button', { name: /fulfil responsibility/i });
    expect(fulfilBtn).toBeInTheDocument();
    fireEvent.click(fulfilBtn);

    // In Fulfilment Flow: choose Partial 25000
    fireEvent.click(screen.getByText('Partial Amount'));
    const input = screen.getByLabelText('Partial Amount');
    fireEvent.change(input, { target: { value: '25000' } });
    fireEvent.click(screen.getByRole('button', { name: /continue to review/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm preparation/i }));

    // Click Back to Responsibility
    fireEvent.click(screen.getByRole('button', { name: /back to responsibility/i }));

    // Back on Detail View: verify invariants are intact
    expect(screen.getByText('September Accommodation')).toBeInTheDocument();
    expect(screen.getByText('Outstanding')).toBeInTheDocument();
    const naira66kElements = screen.getAllByText(formatNaira(66000));
    expect(naira66kElements.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(formatNaira(0), { selector: 'p' })).toBeInTheDocument();
  });
});
