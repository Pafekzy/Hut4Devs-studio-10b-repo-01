import {
  PeerSupportAgreement,
  PeerVouch,
  TrustTrailEvent,
  CommunityRecognition,
  PeerLoanStatus,
  CampaignContributor,
} from '../domain/peerSupport';

/**
 * Seed data representing the 9 required demo scenarios for H4D-DEMO-003:
 * 1. Completed Gift
 * 2. Active Loan
 * 3. Partially Repaid Loan
 * 4. Repaid Loan
 * 5. Overdue Loan showing ⚠️ Not Advisable
 * 6. Debt converted to Gift
 * 7. Active Contribution campaign
 * 8. Completed Contribution campaign
 * 9. Contextual Vouch example
 */
const SEED_PEER_SUPPORTS: PeerSupportAgreement[] = [
  // 1. Completed Gift (Tunde to Amina for solar inverter solidarity)
  {
    id: 'ps-gift-01',
    fromMemberId: 'mem-3',
    fromMemberName: 'Tunde Ojo',
    toMemberId: 'mem-2',
    toMemberName: 'Amina Bello',
    type: 'gift',
    amount: 15000,
    currency: '₦',
    purpose: 'Chamber solidarity gift for solar inverter battery replacement',
    amountRepaid: 0,
    status: 'ACTIVE',
    createdAt: '2026-08-28T14:15:00Z',
    notes: 'Designated strictly as a gift. Has zero repayment obligation and cannot be converted back to debt.',
  },

  // 2. Active Loan (Emmanuel to Amina for rent bridge)
  // 3. Partially Repaid Loan (₦10,000 paid out of ₦25,000)
  {
    id: 'ps-loan-01',
    fromMemberId: 'mem-1',
    fromMemberName: 'Emmanuel Ukom',
    toMemberId: 'mem-2',
    toMemberName: 'Amina Bello',
    type: 'loan',
    amount: 25000,
    currency: '₦',
    purpose: 'Bridge accommodation share until mid-month stipend payout',
    repaymentPeriod: '2 weeks (by Sept 25)',
    repaymentDate: '2026-09-25',
    amountRepaid: 10000,
    status: 'PARTIALLY_REPAID',
    createdAt: '2026-09-01T10:30:00Z',
    notes: 'Agreed directly between peers. Repayment scheduled in two installments upon stipend receipt.',
  },

  // 4. Repaid Loan (Maya to Tunde - 100% repaid)
  {
    id: 'ps-loan-02',
    fromMemberId: 'mem-5',
    fromMemberName: 'Maya Mwangi',
    toMemberId: 'mem-3',
    toMemberName: 'Tunde Ojo',
    type: 'loan',
    amount: 15000,
    currency: '₦',
    purpose: 'Emergency laptop charger replacement during hackathon week',
    repaymentPeriod: '1 week',
    repaymentDate: '2026-08-20',
    amountRepaid: 15000,
    status: 'REPAID',
    createdAt: '2026-08-12T09:00:00Z',
    notes: 'Honored in full on August 19. Transparent repayment recorded on the Trust Trail.',
  },

  // 5. Overdue Loan showing ⚠️ Not Advisable (Chidi has an overdue loan)
  {
    id: 'ps-loan-03',
    fromMemberId: 'mem-3',
    fromMemberName: 'Tunde Ojo',
    toMemberId: 'mem-4',
    toMemberName: 'Chidi Okeke',
    type: 'loan',
    amount: 30000,
    currency: '₦',
    purpose: 'Quarterly internet equipment contribution advance',
    repaymentPeriod: 'End of August',
    repaymentDate: '2026-08-31',
    amountRepaid: 0,
    status: 'OVERDUE',
    createdAt: '2026-08-15T11:00:00Z',
    notes: 'Chidi communicated stipend delay. Status surfaces as ⚠️ Not Advisable to inform prospective lenders.',
  },

  // 6. Debt converted to Gift (Emmanuel converted a ₦20,000 loan to Chidi into a Gift)
  {
    id: 'ps-loan-04',
    fromMemberId: 'mem-1',
    fromMemberName: 'Emmanuel Ukom',
    toMemberId: 'mem-4',
    toMemberName: 'Chidi Okeke',
    type: 'loan',
    amount: 20000,
    currency: '₦',
    purpose: 'Transport to technical interview & tech kit essentials',
    repaymentPeriod: '2 weeks',
    repaymentDate: '2026-08-20',
    amountRepaid: 0,
    status: 'CONVERTED_TO_GIFT',
    forgivenDate: '2026-08-25T16:00:00Z',
    forgivenByMemberId: 'mem-1',
    forgivenReason: 'Celebration of technical interview success and chamber solidarity. Debt permanently forgiven.',
    createdAt: '2026-08-10T09:00:00Z',
    notes: 'Converted from Debt to Gift on Aug 25. Once converted, it cannot ever be converted back to debt.',
  },

  // 7. Active Contribution campaign (Chamber Solar Inverter Backup Battery)
  {
    id: 'ps-contrib-01',
    fromMemberId: 'mem-1',
    fromMemberName: 'Emmanuel Ukom',
    type: 'contribution',
    title: 'Chamber Solar Inverter Backup Battery',
    purpose: 'Communal 2.5kVA battery replacement for 24/7 power during grid outages',
    amount: 85000,
    targetAmount: 120000,
    currency: '₦',
    amountRepaid: 0,
    status: 'ACTIVE',
    createdAt: '2026-09-02T12:00:00Z',
    notes: 'Shared chamber need. Generosity without equity, interest, or social debt.',
    contributors: [
      {
        memberId: 'mem-1',
        memberName: 'Emmanuel Ukom',
        amount: 40000,
        timestamp: '2026-09-02T12:00:00Z',
        note: 'Seed contribution from coordinator stipend savings',
      },
      {
        memberId: 'mem-3',
        memberName: 'Tunde Ojo',
        amount: 25000,
        timestamp: '2026-09-03T15:30:00Z',
        note: 'Chamber representative match',
      },
      {
        memberId: 'mem-2',
        memberName: 'Amina Bello',
        amount: 20000,
        timestamp: '2026-09-05T09:15:00Z',
        note: 'Solidarity contribution',
      },
    ],
  },

  // 8. Completed Contribution campaign (High-Speed Fiber Router & Setup)
  {
    id: 'ps-contrib-02',
    fromMemberId: 'mem-3',
    fromMemberName: 'Tunde Ojo',
    type: 'contribution',
    title: 'High-Speed Fiber Router & Mesh Setup',
    purpose: 'Dual-band Wi-Fi 6 mesh router to ensure stable connections for remote work',
    amount: 50000,
    targetAmount: 50000,
    currency: '₦',
    amountRepaid: 0,
    status: 'REPAID', // Used here to indicate 100% Target Met / Completed
    createdAt: '2026-08-18T10:00:00Z',
    notes: 'Target ₦50,000 fully funded. Router installed and actively functioning in Chamber 4B.',
    contributors: [
      {
        memberId: 'mem-3',
        memberName: 'Tunde Ojo',
        amount: 20000,
        timestamp: '2026-08-18T10:00:00Z',
      },
      {
        memberId: 'mem-1',
        memberName: 'Emmanuel Ukom',
        amount: 15000,
        timestamp: '2026-08-19T11:20:00Z',
      },
      {
        memberId: 'mem-2',
        memberName: 'Amina Bello',
        amount: 10000,
        timestamp: '2026-08-19T14:40:00Z',
      },
      {
        memberId: 'mem-5',
        memberName: 'Maya Mwangi',
        amount: 5000,
        timestamp: '2026-08-20T08:15:00Z',
      },
    ],
  },
];

// 9. Contextual Vouch Examples (with explicit NO guarantor liability disclaimer)
const SEED_VOUCHES: PeerVouch[] = [
  {
    id: 'vc-01',
    voucherMemberId: 'mem-1',
    voucherMemberName: 'Emmanuel Ukom',
    targetMemberId: 'mem-2',
    targetMemberName: 'Amina Bello',
    context: 'Accommodation Rent Reliability',
    confidence: 'high',
    commitmentScope: 'Up to ₦50,000 peer commitments & accommodation coordination',
    createdAt: '2026-08-15T11:00:00Z',
    notes: 'Amina consistently communicates transparently before payment due dates and honors roommate commitments.',
    disclaimer: 'This vouch represents contextual peer confidence and creates NO automatic financial guarantor liability.',
  },
  {
    id: 'vc-02',
    voucherMemberId: 'mem-3',
    voucherMemberName: 'Tunde Ojo',
    targetMemberId: 'mem-1',
    targetMemberName: 'Emmanuel Ukom',
    context: 'Chamber Utility Management & Operations',
    confidence: 'high',
    commitmentScope: 'Colony operations, direct lending, and utility oversight',
    createdAt: '2026-07-20T08:30:00Z',
    notes: 'Emmanuel has consistently verified electric meter recharges on time and supported fellows fairly.',
    disclaimer: 'This vouch represents contextual peer confidence and creates NO automatic financial guarantor liability.',
  },
  {
    id: 'vc-03',
    voucherMemberId: 'mem-5',
    voucherMemberName: 'Maya Mwangi',
    targetMemberId: 'mem-4',
    targetMemberName: 'Chidi Okeke',
    context: 'Technical Dedication & Honest Repair Intent',
    confidence: 'moderate',
    commitmentScope: 'Development collaboration & structured repair timelines',
    createdAt: '2026-09-02T15:45:00Z',
    notes: 'Chidi communicates honestly when facing cashflow issues and follows up with concrete recovery plans.',
    disclaimer: 'This vouch represents contextual peer confidence and creates NO automatic financial guarantor liability.',
  },
];

const SEED_TRAIL_EVENTS: TrustTrailEvent[] = [
  {
    id: 'tr-01',
    timestamp: '2026-09-05T09:15:00Z',
    type: 'contribution_received',
    actorId: 'mem-2',
    actorName: 'Amina Bello',
    title: 'Contribution Added to Solar Battery Campaign',
    description: 'Amina contributed ₦20,000 toward the Chamber Solar Inverter Backup Battery.',
    evidenceRef: 'TX-CONTRIB-0905-11',
    verificationStatus: 'verified',
    amount: 20000,
    currency: '₦',
  },
  {
    id: 'tr-02',
    timestamp: '2026-09-02T12:00:00Z',
    type: 'contribution_created',
    actorId: 'mem-1',
    actorName: 'Emmanuel Ukom',
    title: 'Community Contribution Campaign Initiated',
    description: 'Emmanuel initiated the Chamber Solar Inverter Backup Battery campaign (Target: ₦120,000).',
    evidenceRef: 'CAMPAIGN-0902-BAT',
    verificationStatus: 'verified',
    amount: 120000,
    currency: '₦',
  },
  {
    id: 'tr-03',
    timestamp: '2026-09-01T10:30:00Z',
    type: 'peer_loan',
    actorId: 'mem-1',
    actorName: 'Emmanuel Ukom',
    recipientId: 'mem-2',
    recipientName: 'Amina Bello',
    title: 'Direct Peer Loan Confirmed',
    description: 'Emmanuel supported Amina with ₦25,000 for rent bridge. Expected repayment Sept 25.',
    evidenceRef: 'PEER-SUPPORT-260901',
    verificationStatus: 'verified',
    amount: 25000,
    currency: '₦',
  },
  {
    id: 'tr-04',
    timestamp: '2026-08-28T14:15:00Z',
    type: 'gift_created',
    actorId: 'mem-3',
    actorName: 'Tunde Ojo',
    recipientId: 'mem-2',
    recipientName: 'Amina Bello',
    title: 'Voluntary Peer Gift Recorded',
    description: 'Tunde provided a ₦15,000 voluntary solidarity gift to Amina with zero repayment obligation.',
    evidenceRef: 'GIFT-260828-09',
    verificationStatus: 'verified',
    amount: 15000,
    currency: '₦',
  },
  {
    id: 'tr-05',
    timestamp: '2026-08-25T16:00:00Z',
    type: 'debt_to_gift',
    actorId: 'mem-1',
    actorName: 'Emmanuel Ukom',
    recipientId: 'mem-4',
    recipientName: 'Chidi Okeke',
    title: 'Debt-to-Gift Conversion (Forgiveness)',
    description: 'Emmanuel permanently converted a ₦20,000 loan to Chidi into a gift celebrating interview completion.',
    evidenceRef: 'GIFT-FORGIVE-260825',
    verificationStatus: 'verified',
    amount: 20000,
    currency: '₦',
  },
  {
    id: 'tr-06',
    timestamp: '2026-08-19T18:00:00Z',
    type: 'repayment_recorded',
    actorId: 'mem-3',
    actorName: 'Tunde Ojo',
    recipientId: 'mem-5',
    recipientName: 'Maya Mwangi',
    title: 'Peer Loan Honoured in Full',
    description: 'Tunde completed full repayment of ₦15,000 laptop charger bridge loan to Maya on schedule.',
    evidenceRef: 'REPAY-260819-54',
    verificationStatus: 'verified',
    amount: 15000,
    currency: '₦',
  },
  {
    id: 'tr-07',
    timestamp: '2026-08-15T11:00:00Z',
    type: 'vouch_issued',
    actorId: 'mem-1',
    actorName: 'Emmanuel Ukom',
    recipientId: 'mem-2',
    recipientName: 'Amina Bello',
    title: 'Contextual Vouch Issued',
    description: 'Emmanuel issued High Confidence vouch for Amina regarding accommodation commitments.',
    evidenceRef: 'VOUCH-CTX-260815',
    verificationStatus: 'verified',
  },
];

const SEED_RECOGNITIONS: CommunityRecognition[] = [
  {
    id: 'rec-01',
    memberId: 'mem-1',
    memberName: 'Emmanuel Ukom',
    title: 'Consistent Responsibility & Solidarity',
    description: 'Provided peer bridge funding, initiated shared utilities, and exercised generous Debt-to-Gift forgiveness.',
    category: 'peer_support',
    earnedAt: '2026-09-02',
    symbol: '🤝',
    principle: 'We noticed what you repeatedly demonstrated here.',
  },
  {
    id: 'rec-02',
    memberId: 'mem-2',
    memberName: 'Amina Bello',
    title: 'Responsible & Transparent Communicator',
    description: 'Demonstrated exemplary transparency by establishing partial fulfillment and staged timelines before due dates.',
    category: 'communication',
    earnedAt: '2026-09-08',
    symbol: '💬',
    principle: 'We noticed what you repeatedly demonstrated here.',
  },
  {
    id: 'rec-03',
    memberId: 'mem-3',
    memberName: 'Tunde Ojo',
    title: 'Reliable Chamber Collaborator',
    description: 'Honored peer agreements on schedule and contributed actively to shared chamber connectivity.',
    category: 'responsibility',
    earnedAt: '2026-08-20',
    symbol: '🛡️',
    principle: 'We noticed what you repeatedly demonstrated here.',
  },
  {
    id: 'rec-04',
    memberId: 'mem-4',
    memberName: 'Chidi Okeke',
    title: 'Proactive Repair Pioneer',
    description: 'Navigated unexpected delay with structured communication and transparent timelines without evading contact.',
    category: 'repair',
    earnedAt: '2026-09-04',
    symbol: '🌱',
    principle: 'We noticed what you repeatedly demonstrated here.',
  },
  {
    id: 'rec-05',
    memberId: 'mem-5',
    memberName: 'Maya Mwangi',
    title: 'Careful Judgment & Bounded Vouching',
    description: 'Provided contextual, bounded vouches that helped peers coordinate with dignity and safety.',
    category: 'judgment',
    earnedAt: '2026-08-20',
    symbol: '⚖️',
    principle: 'We noticed what you repeatedly demonstrated here.',
  },
];

export class PeerSupportStore {
  private supports: PeerSupportAgreement[] = [...SEED_PEER_SUPPORTS];
  private vouches: PeerVouch[] = [...SEED_VOUCHES];
  private trailEvents: TrustTrailEvent[] = [...SEED_TRAIL_EVENTS];
  private recognitions: CommunityRecognition[] = [...SEED_RECOGNITIONS];

  // Get all support agreements
  public getAllSupports(): PeerSupportAgreement[] {
    return [...this.supports];
  }

  // Get supports involving a specific member
  public getSupportsForMember(memberId: string): PeerSupportAgreement[] {
    return this.supports.filter(
      (s) =>
        s.fromMemberId === memberId ||
        s.toMemberId === memberId ||
        s.type === 'contribution' ||
        s.contributors?.some((c) => c.memberId === memberId)
    );
  }

  // Check if a member has any overdue loan
  public checkBorrowerOverdueStatus(memberId: string): {
    isOverdue: boolean;
    overdueLoans: PeerSupportAgreement[];
    warningMessage?: string;
  } {
    const overdueLoans = this.supports.filter(
      (s) => s.toMemberId === memberId && s.type === 'loan' && s.status === 'OVERDUE'
    );

    if (overdueLoans.length > 0) {
      return {
        isOverdue: true,
        overdueLoans,
        warningMessage:
          '⚠️ Signal: Not Advisable — This fellow currently has an active unresolved peer loan delay. In Hut4Devs, this signal serves to inform human judgment; you may still consciously proceed if you choose to offer a gift, grant, or structured agreement.',
      };
    }

    return {
      isOverdue: false,
      overdueLoans: [],
    };
  }

  // Contextual debt history for a member (without public shaming)
  public getBorrowerDebtHistory(memberId: string): {
    activeLoans: PeerSupportAgreement[];
    repaidLoans: PeerSupportAgreement[];
    convertedGifts: PeerSupportAgreement[];
    overdueLoans: PeerSupportAgreement[];
  } {
    const memberLoans = this.supports.filter(
      (s) => s.toMemberId === memberId && s.type === 'loan'
    );

    return {
      activeLoans: memberLoans.filter((s) => s.status === 'ACTIVE' || s.status === 'PARTIALLY_REPAID'),
      repaidLoans: memberLoans.filter((s) => s.status === 'REPAID'),
      convertedGifts: memberLoans.filter((s) => s.status === 'CONVERTED_TO_GIFT'),
      overdueLoans: memberLoans.filter((s) => s.status === 'OVERDUE'),
    };
  }

  // 1. Create a Gift
  public createGift(
    fromMemberId: string,
    fromMemberName: string,
    toMemberId: string,
    toMemberName: string,
    amount: number,
    purpose: string,
    notes?: string
  ): PeerSupportAgreement {
    if (amount <= 0) {
      throw new Error('Gift amount must be greater than zero.');
    }
    if (!toMemberId) {
      throw new Error('Gift recipient is required.');
    }

    const gift: PeerSupportAgreement = {
      id: `ps-gift-${Date.now()}`,
      fromMemberId,
      fromMemberName,
      toMemberId,
      toMemberName,
      type: 'gift',
      amount,
      currency: '₦',
      purpose,
      amountRepaid: 0,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      notes: notes || 'Voluntary peer gift. Has zero repayment obligation and cannot be converted to debt.',
    };

    this.supports.unshift(gift);

    // Append to Trust Trail
    this.appendTrailEvent({
      id: `tr-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'gift_created',
      actorId: fromMemberId,
      actorName: fromMemberName,
      recipientId: toMemberId,
      recipientName: toMemberName,
      title: 'Voluntary Peer Gift Recorded',
      description: `${fromMemberName} provided a ₦${amount.toLocaleString()} voluntary solidarity gift to ${toMemberName} (${purpose}) with zero repayment obligation.`,
      evidenceRef: `GIFT-${Date.now().toString().slice(-6)}`,
      verificationStatus: 'verified',
      amount,
      currency: '₦',
    });

    return gift;
  }

  // 2. Create a Loan
  public createLoan(
    fromMemberId: string,
    fromMemberName: string,
    toMemberId: string,
    toMemberName: string,
    amount: number,
    purpose: string,
    repaymentPeriod: string,
    repaymentDate: string,
    notes?: string,
    acknowledgedWarning: boolean = false
  ): PeerSupportAgreement {
    if (amount <= 0) {
      throw new Error('Loan amount must be greater than zero.');
    }
    if (!toMemberId) {
      throw new Error('Borrower is required.');
    }
    if (!repaymentPeriod || !repaymentDate) {
      throw new Error('Repayment period and expected repayment date are required for loans.');
    }

    const overdueCheck = this.checkBorrowerOverdueStatus(toMemberId);
    if (overdueCheck.isOverdue && !acknowledgedWarning) {
      throw new Error('Borrower has an overdue loan. Lender must explicitly acknowledge warning to proceed.');
    }

    const loan: PeerSupportAgreement = {
      id: `ps-loan-${Date.now()}`,
      fromMemberId,
      fromMemberName,
      toMemberId,
      toMemberName,
      type: 'loan',
      amount,
      currency: '₦',
      purpose,
      repaymentPeriod,
      repaymentDate,
      amountRepaid: 0,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      notes: notes || 'Direct peer-to-peer agreement with clear repayment timeline.',
    };

    this.supports.unshift(loan);

    // Append to Trust Trail
    this.appendTrailEvent({
      id: `tr-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'peer_loan',
      actorId: fromMemberId,
      actorName: fromMemberName,
      recipientId: toMemberId,
      recipientName: toMemberName,
      title: 'Direct Peer Loan Confirmed',
      description: `${fromMemberName} provided a ₦${amount.toLocaleString()} loan to ${toMemberName} for: "${purpose}". Expected repayment: ${repaymentPeriod} (${repaymentDate}).`,
      evidenceRef: `LOAN-${Date.now().toString().slice(-6)}`,
      verificationStatus: 'verified',
      amount,
      currency: '₦',
    });

    return loan;
  }

  // Record Repayment
  public recordLoanRepayment(
    supportId: string,
    repaymentAmount: number,
    recordedByMemberId: string
  ): PeerSupportAgreement {
    const agreement = this.supports.find((s) => s.id === supportId);
    if (!agreement) {
      throw new Error('Support agreement not found.');
    }
    if (agreement.type !== 'loan') {
      throw new Error('Repayments can only be recorded on loans.');
    }
    if (agreement.status === 'CONVERTED_TO_GIFT') {
      throw new Error('Cannot record repayment on a loan that has already been converted to a gift.');
    }
    if (repaymentAmount <= 0) {
      throw new Error('Repayment amount must be greater than zero.');
    }

    const remaining = agreement.amount - agreement.amountRepaid;
    if (repaymentAmount > remaining) {
      throw new Error(`Repayment amount cannot exceed remaining balance of ₦${remaining.toLocaleString()}.`);
    }

    agreement.amountRepaid += repaymentAmount;

    if (agreement.amountRepaid >= agreement.amount) {
      agreement.status = 'REPAID';
      this.appendTrailEvent({
        id: `tr-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'repayment_recorded',
        actorId: agreement.toMemberId || recordedByMemberId,
        actorName: agreement.toMemberName || 'Borrower',
        recipientId: agreement.fromMemberId,
        recipientName: agreement.fromMemberName,
        title: 'Peer Loan Honoured in Full',
        description: `${agreement.toMemberName} repaid remaining ₦${repaymentAmount.toLocaleString()} to ${agreement.fromMemberName}, fulfilling agreement in full.`,
        evidenceRef: `REPAY-${Date.now().toString().slice(-6)}`,
        verificationStatus: 'verified',
        amount: repaymentAmount,
        currency: '₦',
      });
    } else {
      agreement.status = 'PARTIALLY_REPAID';
      this.appendTrailEvent({
        id: `tr-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'part_payment',
        actorId: agreement.toMemberId || recordedByMemberId,
        actorName: agreement.toMemberName || 'Borrower',
        recipientId: agreement.fromMemberId,
        recipientName: agreement.fromMemberName,
        title: 'Partial Peer Loan Repayment Logged',
        description: `${agreement.toMemberName} made partial repayment of ₦${repaymentAmount.toLocaleString()} to ${agreement.fromMemberName} (₦${(agreement.amount - agreement.amountRepaid).toLocaleString()} remaining).`,
        evidenceRef: `PART-PAY-${Date.now().toString().slice(-6)}`,
        verificationStatus: 'verified',
        amount: repaymentAmount,
        currency: '₦',
      });
    }

    return agreement;
  }

  // Debt -> Gift Conversion (Lender Forgiveness)
  public convertDebtToGift(
    supportId: string,
    lenderMemberId: string,
    reason: string = 'Solidarity and mutual support'
  ): PeerSupportAgreement {
    const agreement = this.supports.find((s) => s.id === supportId);
    if (!agreement) {
      throw new Error('Support agreement not found.');
    }

    // STRICT INVARIANT: Gift -> Debt is FORBIDDEN
    if (agreement.type === 'gift') {
      throw new Error('CRITICAL VIOLATION: A Gift can never be converted into a Debt. Gifts have zero repayment obligations.');
    }

    if (agreement.fromMemberId !== lenderMemberId) {
      throw new Error('Only the original lender has authority to forgive debt and convert it to a gift.');
    }

    if (agreement.status === 'CONVERTED_TO_GIFT') {
      throw new Error('Agreement has already been converted to a gift.');
    }

    const remainingAmount = agreement.amount - agreement.amountRepaid;

    agreement.status = 'CONVERTED_TO_GIFT';
    agreement.forgivenDate = new Date().toISOString();
    agreement.forgivenByMemberId = lenderMemberId;
    agreement.forgivenReason = reason;

    // Append to Trust Trail
    this.appendTrailEvent({
      id: `tr-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'debt_to_gift',
      actorId: agreement.fromMemberId,
      actorName: agreement.fromMemberName,
      recipientId: agreement.toMemberId,
      recipientName: agreement.toMemberName,
      title: 'Debt-to-Gift Conversion (Forgiveness)',
      description: `${agreement.fromMemberName} permanently converted outstanding loan balance (₦${remainingAmount.toLocaleString()}) to ${agreement.toMemberName} into a voluntary gift. Reason: "${reason}".`,
      evidenceRef: `GIFT-FORGIVE-${Date.now().toString().slice(-6)}`,
      verificationStatus: 'verified',
      amount: remainingAmount,
      currency: '₦',
    });

    return agreement;
  }

  // 3. Create Contribution Campaign
  public createContributionCampaign(
    creatorMemberId: string,
    creatorMemberName: string,
    title: string,
    purpose: string,
    targetAmount: number,
    initialSeedAmount: number = 0,
    notes?: string
  ): PeerSupportAgreement {
    if (targetAmount <= 0) {
      throw new Error('Campaign target amount must be greater than zero.');
    }
    if (!title || !purpose) {
      throw new Error('Campaign title and purpose are required.');
    }

    const contributors: CampaignContributor[] = [];
    if (initialSeedAmount > 0) {
      contributors.push({
        memberId: creatorMemberId,
        memberName: creatorMemberName,
        amount: initialSeedAmount,
        timestamp: new Date().toISOString(),
        note: 'Seed contribution',
      });
    }

    const campaign: PeerSupportAgreement = {
      id: `ps-contrib-${Date.now()}`,
      fromMemberId: creatorMemberId,
      fromMemberName: creatorMemberName,
      type: 'contribution',
      title,
      purpose,
      amount: initialSeedAmount,
      targetAmount,
      currency: '₦',
      amountRepaid: 0,
      status: initialSeedAmount >= targetAmount ? 'REPAID' : 'ACTIVE',
      createdAt: new Date().toISOString(),
      notes: notes || 'Shared chamber contribution. Mutual cooperation without investment or profit-sharing.',
      contributors,
    };

    this.supports.unshift(campaign);

    // Append to Trust Trail
    this.appendTrailEvent({
      id: `tr-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'contribution_created',
      actorId: creatorMemberId,
      actorName: creatorMemberName,
      title: 'Community Contribution Campaign Initiated',
      description: `${creatorMemberName} initiated campaign "${title}" (Target: ₦${targetAmount.toLocaleString()}) for shared purpose: "${purpose}".`,
      evidenceRef: `CAMPAIGN-${Date.now().toString().slice(-6)}`,
      verificationStatus: 'verified',
      amount: targetAmount,
      currency: '₦',
    });

    return campaign;
  }

  // Contribute to an existing Campaign
  public contributeToCampaign(
    campaignId: string,
    contributorMemberId: string,
    contributorMemberName: string,
    amount: number,
    note?: string
  ): PeerSupportAgreement {
    const campaign = this.supports.find((s) => s.id === campaignId);
    if (!campaign) {
      throw new Error('Contribution campaign not found.');
    }
    if (campaign.type !== 'contribution') {
      throw new Error('Can only contribute to contribution campaigns.');
    }
    if (amount <= 0) {
      throw new Error('Contribution amount must be greater than zero.');
    }

    if (!campaign.contributors) {
      campaign.contributors = [];
    }

    campaign.contributors.push({
      memberId: contributorMemberId,
      memberName: contributorMemberName,
      amount,
      timestamp: new Date().toISOString(),
      note,
    });

    campaign.amount += amount;

    if (campaign.targetAmount && campaign.amount >= campaign.targetAmount) {
      campaign.status = 'REPAID'; // Indicates completed target
      this.appendTrailEvent({
        id: `tr-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'contribution_completed',
        actorId: contributorMemberId,
        actorName: contributorMemberName,
        title: 'Community Contribution Target Fully Met',
        description: `Campaign "${campaign.title}" has reached its target of ₦${campaign.targetAmount.toLocaleString()} thanks to peer contributions!`,
        evidenceRef: `CAMPAIGN-MET-${Date.now().toString().slice(-6)}`,
        verificationStatus: 'verified',
        amount: campaign.amount,
        currency: '₦',
      });
    } else {
      this.appendTrailEvent({
        id: `tr-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'contribution_received',
        actorId: contributorMemberId,
        actorName: contributorMemberName,
        title: 'Contribution Added to Shared Campaign',
        description: `${contributorMemberName} contributed ₦${amount.toLocaleString()} toward "${campaign.title}".`,
        evidenceRef: `TX-CONTRIB-${Date.now().toString().slice(-6)}`,
        verificationStatus: 'verified',
        amount,
        currency: '₦',
      });
    }

    return campaign;
  }

  // Decline Support Request (Non-punitive "No is legitimate")
  public declineSupportRequest(
    supportId: string,
    memberId: string,
    reason?: string
  ): PeerSupportAgreement {
    const agreement = this.supports.find((s) => s.id === supportId);
    if (!agreement) {
      throw new Error('Support agreement not found.');
    }

    agreement.status = 'DECLINED';
    agreement.notes = reason ? `Declined: ${reason}` : 'Declined respectfully.';

    this.appendTrailEvent({
      id: `tr-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'support_declined',
      actorId: memberId,
      actorName: 'Fellow',
      title: 'Support Request Declined Respectfully',
      description: 'Request was declined. In Hut4Devs, "No" is legitimate and carries zero negative rating or penalty.',
      evidenceRef: `DECLINE-${Date.now().toString().slice(-6)}`,
      verificationStatus: 'acknowledged',
    });

    return agreement;
  }

  // Vouches
  public getAllVouches(): PeerVouch[] {
    return [...this.vouches];
  }

  public addVouch(
    voucherMemberId: string,
    voucherMemberName: string,
    targetMemberId: string,
    targetMemberName: string,
    context: string,
    confidence: 'high' | 'moderate' | 'cautious',
    commitmentScope: string,
    notes: string
  ): PeerVouch {
    if (!targetMemberId || !context || !commitmentScope) {
      throw new Error('Target fellow, context, and commitment scope are required.');
    }

    const vouch: PeerVouch = {
      id: `vc-${Date.now()}`,
      voucherMemberId,
      voucherMemberName,
      targetMemberId,
      targetMemberName,
      context,
      confidence,
      commitmentScope,
      createdAt: new Date().toISOString(),
      notes,
      disclaimer: 'This vouch represents contextual peer confidence and creates NO automatic financial guarantor liability.',
    };

    this.vouches.unshift(vouch);

    this.appendTrailEvent({
      id: `tr-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'vouch_issued',
      actorId: voucherMemberId,
      actorName: voucherMemberName,
      recipientId: targetMemberId,
      recipientName: targetMemberName,
      title: 'Contextual Vouch Issued',
      description: `${voucherMemberName} issued a ${confidence.toUpperCase()} confidence vouch for ${targetMemberName} in context: "${context}". Notice: No guarantor liability.`,
      evidenceRef: `VOUCH-${Date.now().toString().slice(-6)}`,
      verificationStatus: 'verified',
    });

    return vouch;
  }

  // Trust Trail
  public getAllTrailEvents(): TrustTrailEvent[] {
    return [...this.trailEvents];
  }

  public appendTrailEvent(event: TrustTrailEvent): void {
    this.trailEvents.unshift(event);
  }

  // Recognitions
  public getAllRecognitions(): CommunityRecognition[] {
    return [...this.recognitions];
  }

  // Reset to seed data (useful for clean test runs)
  public resetToSeed(): void {
    this.supports = [...SEED_PEER_SUPPORTS];
    this.vouches = [...SEED_VOUCHES];
    this.trailEvents = [...SEED_TRAIL_EVENTS];
    this.recognitions = [...SEED_RECOGNITIONS];
  }
}

export const peerSupportStore = new PeerSupportStore();
