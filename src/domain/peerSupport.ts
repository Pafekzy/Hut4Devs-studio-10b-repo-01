/**
 * Hut4Devs Peer-to-Peer Support Domain Model (H4D-DEMO-003)
 * 
 * Core Direction:
 * Coordinate -> Support -> Account -> Grow
 * 
 * "Turning everyday collaboration into trails of trust built by us and for us-all."
 * 
 * Rules:
 * 1. A GIFT has no repayment obligation. Once an obligation is converted into a Gift,
 *    Gift cannot later become Debt.
 * 2. Overdue loan triggers "⚠️ Not Advisable" signal to inform human judgment;
 *    the lender may consciously proceed after acknowledging the warning.
 * 3. A Vouch is contextual and creates NO automatic guarantor liability.
 * 4. Declining a support request ("No") is legitimate and non-punitive.
 * 5. Universal credit scores, human rankings, wealth leaderboards, and public
 *    debt-shaming registries are strictly forbidden.
 */

export type PeerSupportType = 'gift' | 'loan' | 'contribution';

export type PeerLoanStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'ACTIVE'
  | 'PARTIALLY_REPAID'
  | 'REPAID'
  | 'OVERDUE'
  | 'CONVERTED_TO_GIFT'
  | 'DECLINED';

export interface CampaignContributor {
  memberId: string;
  memberName: string;
  amount: number;
  timestamp: string;
  note?: string;
}

export interface PeerSupportAgreement {
  id: string;
  fromMemberId: string;
  fromMemberName: string;
  toMemberId?: string; // Optional for shared contribution campaigns
  toMemberName?: string;
  type: PeerSupportType;
  amount: number;
  currency: string;
  purpose: string;
  
  // Loan-specific fields
  repaymentPeriod?: string; // e.g. "2 weeks", "End of month (Sept 30)", "1 month"
  repaymentDate?: string;
  amountRepaid: number;
  status: PeerLoanStatus;
  
  // Contribution-specific fields
  title?: string;
  targetAmount?: number;
  contributors?: CampaignContributor[];
  
  // Conversion & Audit fields
  forgivenDate?: string;
  forgivenByMemberId?: string;
  forgivenReason?: string;
  createdAt: string;
  notes?: string;
}

export interface PeerVouch {
  id: string;
  voucherMemberId: string;
  voucherMemberName: string;
  targetMemberId: string;
  targetMemberName: string;
  context: string;
  confidence: 'high' | 'moderate' | 'cautious';
  commitmentScope: string;
  createdAt: string;
  notes: string;
  disclaimer: string; // Explaining NO guarantor liability
}

export interface TrustTrailEvent {
  id: string;
  timestamp: string;
  type:
    | 'gift_created'
    | 'loan_requested'
    | 'loan_accepted'
    | 'peer_loan'
    | 'part_payment'
    | 'repayment_recorded'
    | 'loan_overdue'
    | 'debt_to_gift'
    | 'contribution_created'
    | 'contribution_received'
    | 'contribution_completed'
    | 'vouch_issued'
    | 'support_declined'
    | 'payment_recorded'
    | 'repair_logged';
  actorId: string;
  actorName: string;
  recipientId?: string;
  recipientName?: string;
  title: string;
  description: string;
  evidenceRef: string;
  verificationStatus: 'verified' | 'acknowledged';
  amount?: number;
  currency?: string;
}

export interface CommunityRecognition {
  id: string;
  memberId: string;
  memberName: string;
  title: string;
  description: string;
  category: 'responsibility' | 'communication' | 'peer_support' | 'repair' | 'judgment';
  earnedAt: string;
  symbol: string;
  principle: string; // e.g. "We noticed what you repeatedly demonstrated here."
}
