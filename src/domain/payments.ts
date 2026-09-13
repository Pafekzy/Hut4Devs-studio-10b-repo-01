/**
 * Provider-Independent Payment Domain Abstraction (H4D-FUNC-005)
 *
 * Invariant: Payment proposals represent external intent recording only.
 * They do NOT approve, sign, or execute transfers, and do NOT alter verified
 * accommodation amounts or responsibility status.
 */

export type PaymentProviderType = 'BMONI' | 'SIMULATED';

export interface ExternalPaymentProposal {
  id: string;
  paymentIntentId: string;
  responsibilityId?: string;
  amount?: number;
  currency?: string;
  provider: PaymentProviderType;
  providerProposalId: string;
  providerStatus: string; // e.g. 'Pending Approval' or 'Simulated'
  createdAt: string;
  isSimulated?: boolean;
}

export interface CreateProposalRequest {
  intentId: string;
  responsibilityId: string;
  amount: number;
  currency: string; // e.g. 'NGN'
  description?: string;
}

export interface CreateProposalResult {
  success: boolean;
  proposal?: ExternalPaymentProposal;
  error?: string;
  requiresCredentials?: boolean;
  notConfigured?: boolean;
  isAmbiguousError?: boolean;
  definitiveFailure?: boolean;
}

export interface PaymentProvider {
  readonly name: PaymentProviderType | string;
  createProposal(request: CreateProposalRequest): Promise<CreateProposalResult>;
}
