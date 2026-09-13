import {
  AccommodationResponsibility,
  AccommodationPaymentIntent,
} from './accommodation';
import { ExternalPaymentProposal } from './payments';
import { IMemberRepository, ISessionRepository } from './auth';
import { PaymentReconciliationRecord } from './reconciliation';

/**
 * Accommodation Responsibility Repository Interface (H4D-FUNC-008)
 */
export interface IAccommodationRepository {
  findById(id: string): Promise<AccommodationResponsibility | null>;
  findByIdForUpdate(id: string): Promise<AccommodationResponsibility | null>;
  save(responsibility: AccommodationResponsibility): Promise<void>;
  listAll(): Promise<AccommodationResponsibility[]>;
}

/**
 * Payment Intent Repository Interface (H4D-FUNC-008)
 */
export interface IPaymentIntentRepository {
  findById(id: string): Promise<AccommodationPaymentIntent | null>;
  findByResponsibilityId(responsibilityId: string): Promise<AccommodationPaymentIntent[]>;
  save(intent: AccommodationPaymentIntent): Promise<void>;
  listAll(): Promise<AccommodationPaymentIntent[]>;
}

/**
 * External Payment Proposal Repository Interface (H4D-FUNC-008)
 */
export interface IExternalProposalRepository {
  findById(id: string): Promise<ExternalPaymentProposal | null>;
  findByIntentId(intentId: string): Promise<ExternalPaymentProposal | null>;
  findByProviderProposalId(provider: string, providerProposalId: string): Promise<ExternalPaymentProposal | null>;
  save(proposal: ExternalPaymentProposal): Promise<void>;
  listAll(): Promise<ExternalPaymentProposal[]>;
}

/**
 * Outbox Event Record (H4D-FUNC-010)
 *
 * Invariant: Provider-independent, minimal operational payload.
 * No secrets, private keys, wallet history, vouches, or unrelated data.
 */
export interface OutboxEventRecord {
  id: string;
  eventType: string; // e.g. 'accommodation.payment_intent.prepared'
  aggregateType: string; // e.g. 'accommodation_responsibility'
  aggregateId: string; // e.g. 'resp-infinite-grace-3b-sep2026'
  payload: Record<string, any>;
  createdAt: string;
  publishedAt?: string | null;
}

/**
 * Transactional Outbox Repository Interface (H4D-FUNC-010)
 */
export interface IOutboxRepository {
  insert(event: OutboxEventRecord): Promise<void>;
  markPublished(id: string, publishedAt?: string): Promise<void>;
  findPending(): Promise<OutboxEventRecord[]>;
  findById(id: string): Promise<OutboxEventRecord | null>;
  listAll(): Promise<OutboxEventRecord[]>;
}

/**
 * Provider Event Processing Status (H4D-FUNC-012)
 *
 * Invariant: Provider event receipt is evidence. It is NOT automatically
 * a Hut4Devs accounting mutation. BMONI COMPLETED != Hut4Devs VERIFIED.
 */
export type ProviderEventProcessingStatus = 'RECEIVED' | 'DUPLICATE' | 'REJECTED';

/**
 * Provider Event Record (H4D-FUNC-012)
 *
 * Persists raw provider status and stable event identifiers for audit and later reconciliation.
 * Never stores webhook secrets, API secrets, private keys, wallet PINs, BVN, or NIN.
 */
export interface ProviderEventRecord {
  id: string;
  provider: string; // e.g. 'BMONI'
  providerEventId: string;
  sourceEventId?: string | null;
  eventType: string; // e.g. 'proposal.status_updated', 'payment.completed'
  providerStatus: string; // e.g. 'COMPLETED', 'PENDING_APPROVAL'
  providerProposalId?: string | null;
  payload: Record<string, any>;
  receivedAt: string;
  processedAt?: string | null;
  processingStatus: ProviderEventProcessingStatus;
}

/**
 * Provider Event Repository Interface (H4D-FUNC-012)
 */
export interface IProviderEventRepository {
  create(event: ProviderEventRecord): Promise<ProviderEventRecord>;
  createWithOutbox(event: ProviderEventRecord, outboxEvent: OutboxEventRecord): Promise<ProviderEventRecord>;
  findByProviderEventId(provider: string, providerEventId: string): Promise<ProviderEventRecord | null>;
  findById(id: string): Promise<ProviderEventRecord | null>;
  listByProposalId(providerProposalId: string): Promise<ProviderEventRecord[]>;
  listAll(): Promise<ProviderEventRecord[]>;
}

/**
 * Payment Reconciliation Repository Interface (H4D-FUNC-013)
 *
 * Persists authoritative reconciliation records verifying the complete evidence chain.
 */
export interface IPaymentReconciliationRepository {
  create(record: PaymentReconciliationRecord): Promise<PaymentReconciliationRecord>;
  findByProviderEventId(provider: string, providerEventId: string): Promise<PaymentReconciliationRecord | null>;
  findVerifiedByProviderEventId(provider: string, providerEventId: string): Promise<PaymentReconciliationRecord | null>;
  listByProviderEventId(provider: string, providerEventId: string): Promise<PaymentReconciliationRecord[]>;
  findById(id: string): Promise<PaymentReconciliationRecord | null>;
  listByResponsibilityId(responsibilityId: string): Promise<PaymentReconciliationRecord[]>;
  listAll(): Promise<PaymentReconciliationRecord[]>;
}

/**
 * Coherent Unit of Work & Transaction Boundary
 */
export interface IHut4DevsRepositories {
  accommodation: IAccommodationRepository;
  intents: IPaymentIntentRepository;
  proposals: IExternalProposalRepository;
  outbox: IOutboxRepository;
  members: IMemberRepository;
  sessions: ISessionRepository;
  providerEvents: IProviderEventRepository;
  reconciliations: IPaymentReconciliationRepository;
  runInTransaction<T>(fn: (repos: IHut4DevsRepositories) => Promise<T>): Promise<T>;
}
