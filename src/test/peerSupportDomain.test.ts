import { describe, it, expect, beforeEach } from 'vitest';
import { PeerSupportStore } from '../services/peerSupportStore';

describe('H4D-DEMO-003 — Peer-to-Peer Support Domain & Invariants', () => {
  let store: PeerSupportStore;

  beforeEach(() => {
    store = new PeerSupportStore();
  });

  describe('1. Voluntary Gifting', () => {
    it('creates a voluntary gift with zero repayment obligation', () => {
      const gift = store.createGift(
        'mem-1',
        'Emmanuel Ukom',
        'mem-2',
        'Amina Bello',
        15000,
        'Solidarity gift for solar inverter battery'
      );

      expect(gift.id).toBeDefined();
      expect(gift.type).toBe('gift');
      expect(gift.amount).toBe(15000);
      expect(gift.amountRepaid).toBe(0);
      expect(gift.status).toBe('ACTIVE');

      // Check trail event
      const trail = store.getAllTrailEvents();
      const giftEvent = trail.find((e) => e.type === 'gift_created' && e.amount === 15000);
      expect(giftEvent).toBeDefined();
      expect(giftEvent?.actorName).toBe('Emmanuel Ukom');
      expect(giftEvent?.recipientName).toBe('Amina Bello');
    });

    it('rejects invalid gift amounts', () => {
      expect(() => {
        store.createGift('mem-1', 'Emmanuel', 'mem-2', 'Amina', 0, 'Zero gift');
      }).toThrow(/greater than zero/i);
    });
  });

  describe('2. Peer Lending & Repayment', () => {
    it('creates a peer loan with expected repayment period and date', () => {
      const loan = store.createLoan(
        'mem-1',
        'Emmanuel Ukom',
        'mem-2',
        'Amina Bello',
        25000,
        'Stipend bridge funding',
        '2 weeks',
        '2026-09-25'
      );

      expect(loan.type).toBe('loan');
      expect(loan.amount).toBe(25000);
      expect(loan.repaymentPeriod).toBe('2 weeks');
      expect(loan.repaymentDate).toBe('2026-09-25');
      expect(loan.status).toBe('ACTIVE');
    });

    it('handles partial repayment accurately', () => {
      const loan = store.createLoan(
        'mem-1',
        'Emmanuel Ukom',
        'mem-2',
        'Amina Bello',
        25000,
        'Stipend bridge',
        '2 weeks',
        '2026-09-25'
      );

      const updated = store.recordLoanRepayment(loan.id, 10000, 'mem-2');
      expect(updated.amountRepaid).toBe(10000);
      expect(updated.status).toBe('PARTIALLY_REPAID');

      // Check partial payment trail event
      const trail = store.getAllTrailEvents();
      const partEvent = trail.find((e) => e.type === 'part_payment' && e.amount === 10000);
      expect(partEvent).toBeDefined();
    });

    it('handles full repayment and sets status to REPAID', () => {
      const loan = store.createLoan(
        'mem-1',
        'Emmanuel Ukom',
        'mem-2',
        'Amina Bello',
        10000,
        'Hardware bridge',
        '1 week',
        '2026-09-20'
      );

      const updated = store.recordLoanRepayment(loan.id, 10000, 'mem-2');
      expect(updated.amountRepaid).toBe(10000);
      expect(updated.status).toBe('REPAID');

      const trail = store.getAllTrailEvents();
      const fullEvent = trail.find((e) => e.type === 'repayment_recorded' && e.amount === 10000);
      expect(fullEvent).toBeDefined();
    });

    it('rejects repayment amounts that exceed remaining balance', () => {
      const loan = store.createLoan(
        'mem-1',
        'Emmanuel Ukom',
        'mem-2',
        'Amina Bello',
        10000,
        'Hardware bridge',
        '1 week',
        '2026-09-20'
      );

      expect(() => {
        store.recordLoanRepayment(loan.id, 15000, 'mem-2');
      }).toThrow(/cannot exceed remaining balance/i);
    });
  });

  describe('3. Debt-to-Gift Forgiveness & Anti-Weaponization Invariant', () => {
    it('allows lender to permanently forgive remaining debt into a gift', () => {
      const loan = store.createLoan(
        'mem-1',
        'Emmanuel Ukom',
        'mem-3',
        'Tunde Ojo',
        20000,
        'Interview travel and tech kit',
        '2 weeks',
        '2026-08-20'
      );

      const forgiven = store.convertDebtToGift(
        loan.id,
        'mem-1',
        'Celebration of technical interview success and solidarity'
      );

      expect(forgiven.status).toBe('CONVERTED_TO_GIFT');
      expect(forgiven.forgivenDate).toBeDefined();
      expect(forgiven.forgivenByMemberId).toBe('mem-1');

      // Audit trail appended
      const trail = store.getAllTrailEvents();
      const forgiveEvent = trail.find((e) => e.type === 'debt_to_gift' && e.amount === 20000);
      expect(forgiveEvent).toBeDefined();
    });

    it('blocks non-lender from forgiving debt', () => {
      const loan = store.createLoan(
        'mem-1',
        'Emmanuel Ukom',
        'mem-3',
        'Tunde Ojo',
        20000,
        'Travel',
        '2 weeks',
        '2026-08-20'
      );

      expect(() => {
        store.convertDebtToGift(loan.id, 'mem-2', 'Unauthorized forgiveness');
      }).toThrow(/Only the original lender/i);
    });

    it('STRICT INVARIANT: Blocks converting a Gift into Debt (Gift -> Debt is forbidden)', () => {
      const gift = store.createGift(
        'mem-1',
        'Emmanuel Ukom',
        'mem-2',
        'Amina Bello',
        15000,
        'Solidarity gift'
      );

      expect(() => {
        store.convertDebtToGift(gift.id, 'mem-1', 'Attempting illegal conversion');
      }).toThrow(/A Gift can never be converted into a Debt/i);
    });
  });

  describe('4. Overdue Signal & Dignified "Not Advisable" Warning', () => {
    it('detects borrower with overdue loan and generates warning signal', () => {
      // Seed data contains Chidi Okeke ('mem-4') with overdue loan 'ps-loan-03'
      const check = store.checkBorrowerOverdueStatus('mem-4');
      expect(check.isOverdue).toBe(true);
      expect(check.overdueLoans.length).toBeGreaterThan(0);
      expect(check.warningMessage).toContain('⚠️ Signal: Not Advisable');
    });

    it('requires lender to acknowledge warning when creating a loan for an overdue fellow', () => {
      // Trying to create loan without acknowledgment throws error
      expect(() => {
        store.createLoan(
          'mem-1',
          'Emmanuel Ukom',
          'mem-4',
          'Chidi Okeke',
          10000,
          'Extra bridge',
          '1 week',
          '2026-09-30',
          'Test notes',
          false // not acknowledged
        );
      }).toThrow(/Borrower has an overdue loan. Lender must explicitly acknowledge/i);

      // When lender consciously acknowledges, loan creation succeeds
      const consciousLoan = store.createLoan(
        'mem-1',
        'Emmanuel Ukom',
        'mem-4',
        'Chidi Okeke',
        10000,
        'Extra bridge with personal understanding',
        '1 week',
        '2026-09-30',
        'Conscious mutual agreement',
        true // acknowledged
      );

      expect(consciousLoan.id).toBeDefined();
      expect(consciousLoan.status).toBe('ACTIVE');
    });
  });

  describe('5. Communal Contribution Campaigns', () => {
    it('creates a contribution campaign and pools community support', () => {
      const campaign = store.createContributionCampaign(
        'mem-1',
        'Emmanuel Ukom',
        'Chamber Solar Battery 3kVA',
        'Communal 24/7 power during outages',
        100000,
        30000,
        'Seed contribution'
      );

      expect(campaign.type).toBe('contribution');
      expect(campaign.amount).toBe(30000);
      expect(campaign.targetAmount).toBe(100000);
      expect(campaign.contributors?.length).toBe(1);
      expect(campaign.status).toBe('ACTIVE');

      // Amina contributes ₦40,000
      store.contributeToCampaign(campaign.id, 'mem-2', 'Amina Bello', 40000, 'Solidarity match');
      expect(campaign.amount).toBe(70000);
      expect(campaign.contributors?.length).toBe(2);
      expect(campaign.status).toBe('ACTIVE');

      // Tunde contributes ₦30,000 (Target met!)
      store.contributeToCampaign(campaign.id, 'mem-3', 'Tunde Ojo', 30000, 'Final pool');
      expect(campaign.amount).toBe(100000);
      expect(campaign.status).toBe('REPAID'); // Target Met

      const trail = store.getAllTrailEvents();
      const completedEvent = trail.find((e) => e.type === 'contribution_completed');
      expect(completedEvent).toBeDefined();
    });
  });

  describe('6. Contextual Vouches & No-Guarantor Invariant', () => {
    it('records a contextual vouch with explicit disclaimer against guarantor liability', () => {
      const vouch = store.addVouch(
        'mem-1',
        'Emmanuel Ukom',
        'mem-2',
        'Amina Bello',
        'Accommodation Rent Reliability',
        'high',
        'Up to ₦50,000 accommodation commitments',
        'Amina consistently communicates transparently before due dates.'
      );

      expect(vouch.id).toBeDefined();
      expect(vouch.confidence).toBe('high');
      expect(vouch.disclaimer).toContain('NO automatic financial guarantor liability');

      const trail = store.getAllTrailEvents();
      const vouchEvent = trail.find((e) => e.type === 'vouch_issued');
      expect(vouchEvent).toBeDefined();
      expect(vouchEvent?.description).toContain('No guarantor liability');
    });
  });

  describe('7. Respectful Decline ("No is legitimate")', () => {
    it('allows declining a request respectfully without punitive penalty', () => {
      const loan = store.createLoan(
        'mem-1',
        'Emmanuel Ukom',
        'mem-2',
        'Amina Bello',
        20000,
        'Equipment support',
        '2 weeks',
        '2026-09-30'
      );

      const declined = store.declineSupportRequest(loan.id, 'mem-2', 'Allocated funds to other commitments');
      expect(declined.status).toBe('DECLINED');

      const trail = store.getAllTrailEvents();
      const declineEvent = trail.find((e) => e.type === 'support_declined');
      expect(declineEvent).toBeDefined();
      expect(declineEvent?.description).toContain('"No" is legitimate and carries zero negative rating');
    });
  });
});
