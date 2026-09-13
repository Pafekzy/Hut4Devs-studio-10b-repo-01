export type SupportType = 'loan' | 'gift' | 'contribution';

export type CommitmentStatus = 'paid' | 'partial' | 'pending' | 'overdue' | 'extended';

export interface Fellow {
  id: string;
  name: string;
  handle: string;
  role: 'Fellow' | 'Intern' | 'Alumni Contributor' | 'Community Steward';
  avatar: string;
  bio: string;
  chamberId: string;
  stipendSchedule: string;
  hasOverdueObligation?: boolean;
}

export interface Chamber {
  id: string;
  name: string;
  code: string;
  location: string;
  totalMonthlyRent: number;
  totalUtilities: number;
  dueDate: string;
  currency: string;
  cycle: string;
  members: string[]; // fellow IDs
}

export interface Commitment {
  id: string;
  fellowId: string;
  chamberId: string;
  title: string;
  category: 'rent' | 'utilities' | 'communal_wifi' | 'amenities';
  amount: number;
  amountPaid: number;
  currency: string;
  dueDate: string;
  status: CommitmentStatus;
  revisedDueDate?: string;
  repairNotes?: string;
  paymentReference?: string;
}

export interface PeerSupport {
  id: string;
  fromFellowId: string;
  toFellowId: string;
  type: SupportType;
  amount: number;
  currency: string;
  purpose: string;
  commitmentId?: string;
  repaymentDate?: string;
  amountRepaid: number;
  status: 'active' | 'repaid' | 'converted_to_gift' | 'declined';
  createdAt: string;
  notes?: string;
  forgivenDate?: string;
}

export interface Vouch {
  id: string;
  voucherId: string;
  targetFellowId: string;
  context: string;
  confidence: 'high' | 'moderate' | 'cautious';
  commitmentScope: string;
  createdAt: string;
  notes: string;
}

export type TrailEventType =
  | 'commitment_created'
  | 'payment_recorded'
  | 'part_payment'
  | 'peer_loan'
  | 'peer_gift'
  | 'peer_contribution'
  | 'debt_to_gift'
  | 'repayment_recorded'
  | 'vouch_issued'
  | 'repair_logged';

export interface TrustTrailEvent {
  id: string;
  timestamp: string;
  type: TrailEventType;
  actorId: string;
  recipientId?: string;
  title: string;
  description: string;
  evidenceRef: string;
  verificationStatus: 'verified' | 'acknowledged';
  amount?: number;
  currency?: string;
}

export interface RecognitionBadge {
  id: string;
  title: string;
  description: string;
  category: 'responsibility' | 'communication' | 'peer_support' | 'repair' | 'judgment';
  earnedAt: string;
  fellowId: string;
  symbol: string;
}
