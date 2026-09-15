import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MissingPuzzleModal } from '../components/MissingPuzzleModal';
import { Member, MemberRole } from '../domain/auth';
import { puzzleFeedbackStore } from '../services/puzzleFeedbackStore';

describe('Fix a Puzzle - Refined Information Architecture & Form Controls', () => {
  const currentFellow: Member = {
    id: 'fellow-test-01',
    email: 'fellow.test@hut4devs.org',
    displayName: 'Amina Bello',
    h4dMemberId: 'H4D-00201',
    roles: [MemberRole.FELLOW],
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    // Reset test reports if needed
  });

  it('1. Default view is Section 1: Community Puzzle Board', () => {
    render(
      <MissingPuzzleModal
        isOpen={true}
        onClose={() => {}}
        currentMember={currentFellow}
        isDark={false}
        defaultLocation="Member Home Workspace"
      />
    );

    // Verify Tab buttons in exact conceptual order
    const tabs = screen.getAllByRole('button').filter((b) =>
      ['Community Puzzle Board', 'Spot & Log', 'My Reports & Community Trail'].some((name) =>
        b.textContent?.includes(name)
      )
    );

    expect(tabs[0].textContent).toContain('Community Puzzle Board');
    expect(tabs[1].textContent).toContain('Spot & Log');
    expect(tabs[2].textContent).toContain('My Reports & Community Trail');

    // Section 1 must be active by default
    expect(screen.getByText('See What Is Already Being Solved')).toBeDefined();
    expect(screen.getByText('Technical Lifecycle:')).toBeDefined();
  });

  it('2. App Location / Context starts empty and uses placeholder/example guidance only', () => {
    render(
      <MissingPuzzleModal
        isOpen={true}
        onClose={() => {}}
        currentMember={currentFellow}
        isDark={false}
        defaultLocation="Member Home Workspace"
      />
    );

    // Switch to Spot & Log via tab
    const spotAndLogTab = screen.getByTestId('tab-btn-report-puzzle');
    fireEvent.click(spotAndLogTab);

    // Find the App Location / Context input
    const locationInput = screen.getByLabelText(/App Location \/ Context \*/i) as HTMLInputElement;
    expect(locationInput).toBeDefined();

    // Value MUST be empty initially, NOT prefilled with "Member Home Workspace"
    expect(locationInput.value).toBe('');

    // Placeholder guidance contains the example text
    expect(locationInput.placeholder).toContain('Member Home Workspace');
  });

  it('3. Form validation requires a genuine user-entered value for App Location / Context', async () => {
    render(
      <MissingPuzzleModal
        isOpen={true}
        onClose={() => {}}
        currentMember={currentFellow}
        isDark={false}
        defaultLocation="Member Home Workspace"
      />
    );

    // Switch to Spot & Log
    fireEvent.click(screen.getByTestId('tab-btn-report-puzzle'));

    // Fill Title and Description but leave Location empty
    fireEvent.change(screen.getByLabelText(/Issue Title \*/i), {
      target: { value: 'Broken electrical outlet' },
    });
    fireEvent.change(screen.getByLabelText(/Description & Observations \*/i), {
      target: { value: 'Sparking noticed when plugging laptop in room 301.' },
    });

    const submitBtn = screen.getByRole('button', { name: /Record Missing Puzzle Piece/i });
    const form = submitBtn.closest('form')!;
    fireEvent.submit(form);

    // Error message must prompt for App Location / Context
    await waitFor(() => {
      expect(
        screen.getByText(/Please specify the App Location \/ Context where this was observed/i)
      ).toBeDefined();
    });
  });

  it('4. Custom Category Dropdown opens, allows selection, and maintains firm typography', () => {
    render(
      <MissingPuzzleModal
        isOpen={true}
        onClose={() => {}}
        currentMember={currentFellow}
        isDark={false}
      />
    );

    // Switch to Spot & Log
    fireEvent.click(screen.getByTestId('tab-btn-report-puzzle'));

    const trigger = screen.getByRole('combobox', { name: /Select issue category/i });
    expect(trigger).toBeDefined();
    expect(trigger.textContent).toContain('Visual / UI Glitch');

    // Click trigger to open menu
    fireEvent.click(trigger);

    // Menu options should be visible
    const option = screen.getByRole('option', { name: /Accommodation Flow/i });
    expect(option).toBeDefined();

    // Select Accommodation Flow
    fireEvent.click(option);

    // Trigger should now show Accommodation Flow
    expect(trigger.textContent).toContain('Accommodation Flow');
  });

  it('5. Community Puzzle Board preserves privacy and does not allow ordinary members to promote status', () => {
    render(
      <MissingPuzzleModal
        isOpen={true}
        onClose={() => {}}
        currentMember={currentFellow}
        isDark={false}
      />
    );

    // On Community Puzzle Board
    expect(screen.getByText('Community Improvement System')).toBeDefined();

    // Sensitive reporter emails or tokens must NOT be displayed
    expect(screen.queryByText('fellow@infinitegrace.local')).toBeNull();
    expect(screen.queryByText('chinedu@infinitegrace.local')).toBeNull();

    // Ordinary member should NOT have status promotion controls (no promote buttons or status select dropdowns)
    expect(screen.queryByRole('button', { name: /Promote to Under Review/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Mark as Implemented/i })).toBeNull();
  });
});
