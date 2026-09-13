/**
 * Accommodation Payment Reconciliation Domain Types (H4D-FUNC-013)
 *
 * Invariant: Provider event receipt alone does NOT alter verified accommodation accounting.
 * Only a fully reconciled evidence chain (Provider Event -> External Proposal -> Payment Intent
 * -> Accommodation Responsibility) atomically updates verified amounts.
 */

export type ReconciliationStatus = 'VERIFIED' | 'MISMATCH' | 'NOT_ELIGIBLE';

export const ReconciliationStatus = {
  VERIFIED: 'VERIFIED' as const,
  MISMATCH: 'MISMATCH' as const,
  NOT_ELIGIBLE: 'NOT_ELIGIBLE' as const,
  NON_ELIGIBLE: 'NOT_ELIGIBLE' as const,
};

export const PaymentReconciliationStatus = ReconciliationStatus;
export type PaymentReconciliationStatus = ReconciliationStatus;

export type ReconciliationReasonCode =
  | 'MATCHED_VERIFIED'
  | 'ALREADY_RECONCILED'
  | 'UNSUPPORTED_PROVIDER_STATUS'
  | 'UNSUPPORTED_PROVIDER'
  | 'PROPOSAL_NOT_FOUND'
  | 'INTENT_NOT_FOUND'
  | 'RESPONSIBILITY_NOT_FOUND'
  | 'AMOUNT_MISMATCH'
  | 'CURRENCY_MISMATCH'
  | 'INVALID_AMOUNT'
  | 'AMOUNT_EXCEEDS_REMAINING'
  | 'AMBIGUOUS_CORRELATION'
  | 'CORRELATION_BROKEN';

export const ReconciliationReasonCode = {
  MATCHED_VERIFIED: 'MATCHED_VERIFIED' as const,
  ALREADY_RECONCILED: 'ALREADY_RECONCILED' as const,
  UNSUPPORTED_PROVIDER_STATUS: 'UNSUPPORTED_PROVIDER_STATUS' as const,
  UNSUPPORTED_PROVIDER: 'UNSUPPORTED_PROVIDER' as const,
  PROPOSAL_NOT_FOUND: 'PROPOSAL_NOT_FOUND' as const,
  INTENT_NOT_FOUND: 'INTENT_NOT_FOUND' as const,
  RESPONSIBILITY_NOT_FOUND: 'RESPONSIBILITY_NOT_FOUND' as const,
  AMOUNT_MISMATCH: 'AMOUNT_MISMATCH' as const,
  CURRENCY_MISMATCH: 'CURRENCY_MISMATCH' as const,
  INVALID_AMOUNT: 'INVALID_AMOUNT' as const,
  AMOUNT_EXCEEDS_REMAINING: 'AMOUNT_EXCEEDS_REMAINING' as const,
  AMBIGUOUS_CORRELATION: 'AMBIGUOUS_CORRELATION' as const,
  CORRELATION_BROKEN: 'CORRELATION_BROKEN' as const,
};

export interface PaymentReconciliationRecord {
  id: string;
  providerEventId: string;
  externalPaymentProposalId?: string | null;
  paymentIntentId?: string | null;
  accommodationResponsibilityId?: string | null;
  provider: string;
  providerStatus: string;
  amount: number;
  currency: string;
  reconciliationStatus: ReconciliationStatus;
  reasonCode: ReconciliationReasonCode | string;
  reconciledAt?: string | null;
  createdAt: string;
}

export interface ReconciliationResult {
  success: boolean;
  reconciliationStatus: ReconciliationStatus;
  reasonCode: ReconciliationReasonCode | string;
  financialEffect: number; // 0 if duplicate, mismatch, or ineligible; eventAmount if verified
  idempotent?: boolean;
  isDuplicate?: boolean;
  reconciliation: PaymentReconciliationRecord;
  updatedResponsibility?: {
    id: string;
    verifiedAmount: number;
    remainingAmount: number;
    requiredAmount: number;
    status: string;
  };
  error?: string;
}
