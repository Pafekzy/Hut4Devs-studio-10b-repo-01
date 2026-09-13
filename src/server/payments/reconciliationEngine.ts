import {
  IHut4DevsRepositories,
  ProviderEventRecord,
  OutboxEventRecord,
} from '../../domain/repositories';
import {
  PaymentReconciliationRecord,
  ReconciliationResult,
  ReconciliationStatus,
  ReconciliationReasonCode,
} from '../../domain/reconciliation';
import {
  ResponsibilityStatus,
  getStatusLabel,
} from '../../domain/accommodation';
import { OutboxPublisher } from '../realtime/outboxPublisher';

/**
 * Accommodation Payment Reconciliation Engine (H4D-FUNC-013)
 *
 * Invariant: BMONI COMPLETED != Hut4Devs VERIFIED.
 * Only a fully reconciled evidence chain (Provider Event -> Proposal -> Intent -> Responsibility)
 * can modify verified amounts.
 *
 * Enforces all 12 invariant checks, atomic transactional writes, and post-commit outbox notification.
 */
export class ReconciliationEngine {
  private responsibilityLocks = new Map<string, Promise<void>>();

  private async withResponsibilityLock<T>(id: string, fn: () => Promise<T>): Promise<T> {
    const prev = this.responsibilityLocks.get(id) || Promise.resolve();
    let resolveCurrent!: () => void;
    const current = new Promise<void>((r) => { resolveCurrent = r; });
    this.responsibilityLocks.set(id, current);

    try {
      await prev;
      return await fn();
    } finally {
      if (this.responsibilityLocks.get(id) === current) {
        this.responsibilityLocks.delete(id);
      }
      resolveCurrent();
    }
  }

  constructor(
    private defaultRepos?: IHut4DevsRepositories,
    private defaultPublisher?: OutboxPublisher
  ) {}

  /**
   * Reconciles a persisted provider event against the authoritative Hut4Devs evidence chain.
   */
  async reconcileProviderEvent(
    event: ProviderEventRecord,
    reposParam?: IHut4DevsRepositories,
    publisherParam?: OutboxPublisher
  ): Promise<ReconciliationResult> {
    const repos = reposParam || this.defaultRepos;
    const publisher = publisherParam || this.defaultPublisher;
    if (!repos) {
      throw new Error('Repositories instance is required for reconciliation.');
    }

    if (!event || !event.providerEventId) {
      throw new Error('Cannot reconcile empty or invalid provider event.');
    }

    // Check 1 & 2: Provider verification
    if (event.provider !== 'BMONI') {
      return this.recordNonEligible(
        event,
        'UNSUPPORTED_PROVIDER',
        repos,
        publisher,
        `Unsupported payment provider: ${event.provider}`
      );
    }

    // Check 3: Idempotency check - Has this exact provider event already been verified?
    const existingVerified = await repos.reconciliations.findVerifiedByProviderEventId(
      event.provider,
      event.providerEventId
    );
    if (existingVerified) {
      return {
        success: true,
        reconciliationStatus: 'VERIFIED',
        reasonCode: 'ALREADY_RECONCILED',
        financialEffect: 0,
        idempotent: true,
        isDuplicate: true,
        reconciliation: existingVerified,
      };
    }

    // Check 4: Provider status qualification check
    const rawStatus = (event.providerStatus || '').toUpperCase().trim();
    if (rawStatus !== 'COMPLETED') {
      return this.recordNonEligible(
        event,
        'UNSUPPORTED_PROVIDER_STATUS',
        repos,
        publisher,
        `Provider status "${event.providerStatus}" is not eligible for accommodation verification.`
      );
    }

    // Check 5: Resolve External Payment Proposal
    // Invariant: Do NOT trust client or provider-supplied metadata blindly.
    const proposalIdentifier =
      event.providerProposalId ||
      event.payload?.proposalId ||
      event.payload?.data?.proposalId;

    if (!proposalIdentifier || String(proposalIdentifier).trim().length === 0) {
      return this.recordMismatch(
        event,
        'PROPOSAL_NOT_FOUND',
        null,
        null,
        null,
        repos,
        publisher,
        'Provider event does not contain a valid provider proposal reference.'
      );
    }

    const proposal = await repos.proposals.findByProviderProposalId(
      event.provider,
      String(proposalIdentifier).trim()
    );

    if (!proposal) {
      return this.recordMismatch(
        event,
        'PROPOSAL_NOT_FOUND',
        null,
        null,
        null,
        repos,
        publisher,
        `No external payment proposal found for provider proposal ID "${proposalIdentifier}".`
      );
    }

    // Check 6: Resolve Payment Intent
    const intent = await repos.intents.findById(proposal.paymentIntentId);
    if (!intent) {
      return this.recordMismatch(
        event,
        'INTENT_NOT_FOUND',
        proposal.id,
        null,
        null,
        repos,
        publisher,
        `External proposal "${proposal.id}" references non-existent payment intent "${proposal.paymentIntentId}".`
      );
    }

    // Check 6b: Authoritative correlation between proposal and intent
    if (proposal.paymentIntentId !== intent.id) {
      return this.recordMismatch(
        event,
        'CORRELATION_BROKEN',
        proposal.id,
        intent.id,
        null,
        repos,
        publisher,
        `Proposal paymentIntentId "${proposal.paymentIntentId}" does not match intent ID "${intent.id}".`
      );
    }

    // Check 7: Resolve Accommodation Responsibility
    // Authoritative relationship: proposal -> intent.responsibilityId
    const responsibility = await repos.accommodation.findById(intent.responsibilityId);
    if (!responsibility) {
      return this.recordMismatch(
        event,
        'RESPONSIBILITY_NOT_FOUND',
        proposal.id,
        intent.id,
        null,
        repos,
        publisher,
        `Payment intent "${intent.id}" references non-existent accommodation responsibility "${intent.responsibilityId}".`
      );
    }

    // Check 7b: Authoritative correlation: proposal responsibilityId (if present) must match intent.responsibilityId
    if (proposal.responsibilityId && proposal.responsibilityId !== responsibility.id) {
      return this.recordMismatch(
        event,
        'CORRELATION_BROKEN',
        proposal.id,
        intent.id,
        responsibility.id,
        repos,
        publisher,
        `Proposal responsibility "${proposal.responsibilityId}" does not match intent responsibility "${responsibility.id}".`
      );
    }

    // Extract amounts and currencies
    const eventAmount = Number(
      event.payload?.amount !== undefined ? event.payload.amount : event.payload?.data?.amount
    );
    const eventCurrency = String(
      event.payload?.currency || event.payload?.data?.currency || 'NGN'
    ).toUpperCase().trim();
    const respCurrency = String(responsibility.currency || 'NGN').toUpperCase().trim();

    // Check 10 & 8: Positive amount and amount match
    if (isNaN(eventAmount) || eventAmount <= 0) {
      return this.recordMismatch(
        event,
        'INVALID_AMOUNT',
        proposal.id,
        intent.id,
        responsibility.id,
        repos,
        publisher,
        `Provider event amount "${eventAmount}" is invalid or non-positive.`
      );
    }

    if (Math.abs(eventAmount - Number(intent.amount)) > 0.001) {
      return this.recordMismatch(
        event,
        'AMOUNT_MISMATCH',
        proposal.id,
        intent.id,
        responsibility.id,
        repos,
        publisher,
        `Provider event amount (₦${eventAmount}) does not match payment intent amount (₦${intent.amount}).`
      );
    }

    // Check 9: Currency match
    if (eventCurrency !== respCurrency) {
      return this.recordMismatch(
        event,
        'CURRENCY_MISMATCH',
        proposal.id,
        intent.id,
        responsibility.id,
        repos,
        publisher,
        `Provider event currency "${eventCurrency}" does not match responsibility currency "${respCurrency}".`
      );
    }

    // Check 11: Applying amount would not make verifiedAmount exceed requiredAmount
    const currentVerified = Number(responsibility.verifiedAmount) || 0;
    const requiredAmount = Number(responsibility.requiredAmount);
    const potentialVerified = currentVerified + eventAmount;

    if (potentialVerified > requiredAmount + 0.001) {
      return this.recordMismatch(
        event,
        'AMOUNT_EXCEEDS_REMAINING',
        proposal.id,
        intent.id,
        responsibility.id,
        repos,
        publisher,
        `Applying payment of ₦${eventAmount} would exceed remaining requirement (Verified: ₦${currentVerified}, Required: ₦${requiredAmount}).`
      );
    }

    // Check 12: Atomic Transactional Accounting
    // Atomically:
    // 1. Lock/read responsibility
    // 2. Re-verify idempotency
    // 3. Update verified amount and status
    // 4. Insert reconciliation record
    // 5. Insert outbox event
    // 6. COMMIT
    // 7. Publish to SSE subscribers only AFTER commit
    return await this.withResponsibilityLock(responsibility.id, async () => {
      let outboxToPublish: OutboxEventRecord | null = null;
      let recRecord: PaymentReconciliationRecord | null = null;
      let updatedRespResult: any = null;
      let isDuplicateReconciliation = false;
      let amountExceededRemainingInTx = false;
      let inTxCurrentVerified = 0;
      let inTxRequiredAmount = 0;

      await repos.runInTransaction(async (txRepos) => {
        // 1. Lock the responsibility row using SELECT ... FOR UPDATE on the same transaction client
        const txResp = await txRepos.accommodation.findByIdForUpdate(responsibility.id);
        if (!txResp) {
          throw new Error(`Responsibility "${responsibility.id}" not found during transaction.`);
        }

        // 2. Re-check idempotency within the same transaction boundary (AFTER acquiring the row lock)
        const inTxExisting = await txRepos.reconciliations.findVerifiedByProviderEventId(
          event.provider,
          event.providerEventId
        );
        if (inTxExisting) {
          recRecord = inTxExisting;
          isDuplicateReconciliation = true;
          return;
        }

      inTxCurrentVerified = Number(txResp.verifiedAmount) || 0;
      inTxRequiredAmount = Number(txResp.requiredAmount);
      const inTxRemainingAmount = Math.max(0, Math.round((inTxRequiredAmount - inTxCurrentVerified) * 100) / 100);

      // Check if concurrent modifications have already consumed the remaining amount
      if (eventAmount > inTxRemainingAmount + 0.001) {
        amountExceededRemainingInTx = true;
        return;
      }

      const newVerifiedAmount = Math.round((inTxCurrentVerified + eventAmount) * 100) / 100;
      const remainingAmount = Math.max(0, Math.round((inTxRequiredAmount - newVerifiedAmount) * 100) / 100);

      // Authoritative Invariant: 0 <= verifiedAmount <= requiredAmount
      if (newVerifiedAmount > inTxRequiredAmount + 0.001) {
        throw new Error(`Invariant violation: new verified amount ₦${newVerifiedAmount} exceeds required amount ₦${inTxRequiredAmount}`);
      }

      // Derive operational status
      let newStatus = ResponsibilityStatus.OUTSTANDING;
      if (newVerifiedAmount >= inTxRequiredAmount) {
        newStatus = ResponsibilityStatus.FULFILLED;
      } else if (newVerifiedAmount > 0) {
        newStatus = ResponsibilityStatus.PARTIALLY_FULFILLED;
      }

      // Update responsibility state
      txResp.verifiedAmount = newVerifiedAmount;
      txResp.status = newStatus;
      await txRepos.accommodation.save(txResp);

      // Insert reconciliation record (append-oriented)
      const createdRecRecord: PaymentReconciliationRecord = {
        id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        providerEventId: event.providerEventId,
        externalPaymentProposalId: proposal.id,
        paymentIntentId: intent.id,
        accommodationResponsibilityId: txResp.id,
        provider: event.provider,
        providerStatus: event.providerStatus,
        amount: eventAmount,
        currency: respCurrency,
        reconciliationStatus: 'VERIFIED',
        reasonCode: 'MATCHED_VERIFIED',
        reconciledAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      await txRepos.reconciliations.create(createdRecRecord);
      recRecord = createdRecRecord;

      // Prepare Transactional Outbox Event
      outboxToPublish = {
        id: `outbox_rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        eventType: 'accommodation.payment.reconciled',
        aggregateType: 'accommodation_responsibility',
        aggregateId: txResp.id,
        payload: {
          provider: event.provider,
          providerEventId: event.providerEventId,
          providerProposalId: proposal.providerProposalId,
          reconciliationId: createdRecRecord.id,
          amount: eventAmount,
          currency: respCurrency,
          requiredAmount: inTxRequiredAmount,
          verifiedAmount: newVerifiedAmount,
          remainingAmount,
          status: newStatus,
          statusLabel: getStatusLabel(newStatus),
          reconciledAt: createdRecRecord.reconciledAt,
        },
        createdAt: new Date().toISOString(),
      };
      await txRepos.outbox.insert(outboxToPublish);

      updatedRespResult = {
        id: txResp.id,
        verifiedAmount: newVerifiedAmount,
        remainingAmount,
        requiredAmount: inTxRequiredAmount,
        status: newStatus,
      };
    });

    if (isDuplicateReconciliation && recRecord) {
      return {
        success: true,
        reconciliationStatus: 'VERIFIED',
        reasonCode: 'ALREADY_RECONCILED',
        financialEffect: 0,
        idempotent: true,
        isDuplicate: true,
        reconciliation: recRecord,
      };
    }

    if (amountExceededRemainingInTx) {
      return await this.recordMismatch(
        event,
        ReconciliationReasonCode.AMOUNT_EXCEEDS_REMAINING,
        proposal.id,
        intent.id,
        responsibility.id,
        repos,
        publisher,
        `Applying payment of ₦${eventAmount} would exceed remaining requirement (Verified: ₦${inTxCurrentVerified}, Required: ₦${inTxRequiredAmount}).`
      );
    }

    // Publish outbox event to SSE subscribers ONLY AFTER COMMIT
    if (outboxToPublish && publisher) {
      try {
        publisher.publish(outboxToPublish);
      } catch (pubErr) {
        console.error('[ReconciliationEngine] Failed to broadcast outbox event:', pubErr);
      }
    }

      return {
        success: true,
        reconciliationStatus: 'VERIFIED',
        reasonCode: 'MATCHED_VERIFIED',
        financialEffect: eventAmount,
        reconciliation: recRecord!,
        updatedResponsibility: updatedRespResult,
      };
    });
  }

  /**
   * Records a MISMATCH reconciliation result without modifying verified financial state.
   */
  private async recordMismatch(
    event: ProviderEventRecord,
    reasonCode: ReconciliationReasonCode,
    proposalId: string | null,
    intentId: string | null,
    responsibilityId: string | null,
    repos: IHut4DevsRepositories,
    publisher?: OutboxPublisher,
    notice?: string
  ): Promise<ReconciliationResult> {
    const amount = Number(event.payload?.amount ?? event.payload?.data?.amount) || 0;
    const currency = String(event.payload?.currency || event.payload?.data?.currency || 'NGN').toUpperCase();

    const record: PaymentReconciliationRecord = {
      id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      providerEventId: event.providerEventId,
      externalPaymentProposalId: proposalId,
      paymentIntentId: intentId,
      accommodationResponsibilityId: responsibilityId,
      provider: event.provider,
      providerStatus: event.providerStatus,
      amount,
      currency,
      reconciliationStatus: 'MISMATCH',
      reasonCode,
      reconciledAt: null,
      createdAt: new Date().toISOString(),
    };

    let outboxEvent: OutboxEventRecord | null = null;
    try {
      await repos.runInTransaction(async (txRepos) => {
        await txRepos.reconciliations.create(record);

        outboxEvent = {
          id: `outbox_mis_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          eventType: 'accommodation.reconciliation.mismatch',
          aggregateType: 'accommodation_responsibility',
          aggregateId: responsibilityId || 'unknown',
          payload: {
            provider: event.provider,
            providerEventId: event.providerEventId,
            reasonCode,
            notice: notice || 'Reconciliation: Requires Review. Financial State: Unchanged',
            amount,
            currency,
            financialEffect: 0,
            status: 'Requires Review',
          },
          createdAt: new Date().toISOString(),
        };
        await txRepos.outbox.insert(outboxEvent);
      });

      if (outboxEvent && publisher) {
        publisher.publish(outboxEvent);
      }
    } catch (saveErr) {
      console.error('[ReconciliationEngine] Could not save mismatch record:', saveErr);
    }

    return {
      success: false,
      reconciliationStatus: 'MISMATCH',
      reasonCode,
      financialEffect: 0,
      reconciliation: record,
      error: notice,
    };
  }

  /**
   * Records a NOT_ELIGIBLE reconciliation result without modifying verified financial state.
   */
  private async recordNonEligible(
    event: ProviderEventRecord,
    reasonCode: ReconciliationReasonCode,
    repos: IHut4DevsRepositories,
    publisher?: OutboxPublisher,
    notice?: string
  ): Promise<ReconciliationResult> {
    const amount = Number(event.payload?.amount ?? event.payload?.data?.amount) || 0;
    const currency = String(event.payload?.currency || event.payload?.data?.currency || 'NGN').toUpperCase();

    const record: PaymentReconciliationRecord = {
      id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      providerEventId: event.providerEventId,
      externalPaymentProposalId: null,
      paymentIntentId: null,
      accommodationResponsibilityId: null,
      provider: event.provider,
      providerStatus: event.providerStatus,
      amount,
      currency,
      reconciliationStatus: 'NOT_ELIGIBLE',
      reasonCode,
      reconciledAt: null,
      createdAt: new Date().toISOString(),
    };

    try {
      await repos.reconciliations.create(record);
    } catch (saveErr) {
      console.error('[ReconciliationEngine] Could not save non-eligible record:', saveErr);
    }

    return {
      success: false,
      reconciliationStatus: 'NOT_ELIGIBLE',
      reasonCode,
      financialEffect: 0,
      reconciliation: record,
      error: notice,
    };
  }
}

export const reconciliationEngine = new ReconciliationEngine();
