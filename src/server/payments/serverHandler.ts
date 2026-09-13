import {
  CreateProposalRequest,
  CreateProposalResult,
  PaymentProvider,
} from '../../domain/payments';
import {
  FulfilmentType,
  PaymentIntentStatus,
} from '../../domain/accommodation';
import { IHut4DevsRepositories, OutboxEventRecord } from '../../domain/repositories';
import { BmoniPaymentProvider } from './bmoniProvider';
import { FakePaymentProvider } from './fakeProvider';
import { OutboxPublisher, globalOutboxPublisher } from '../realtime/outboxPublisher';

export interface ServerHandlerResponse {
  status: number;
  body: CreateProposalResult;
}

export type ServerProviderMode = 'BMONI' | 'SIMULATED';

/**
 * Reads server-side provider mode from environment.
 * Default is strictly BMONI.
 */
export function getServerProviderMode(): ServerProviderMode {
  const envMode =
    typeof process !== 'undefined' && process.env && process.env.PAYMENT_PROVIDER_MODE
      ? process.env.PAYMENT_PROVIDER_MODE.trim().toUpperCase()
      : 'BMONI';

  return envMode === 'SIMULATED' ? 'SIMULATED' : 'BMONI';
}

/**
 * Isolated Server-Side Boundary Handler for /api/payments/proposal
 *
 * Persists proposal state into PostgreSQL when repositories are provided.
 *
 * Invariant: Never alters accommodation balances or status. Browser client never sees BMONI credentials.
 * Invariant: When in BMONI mode, NEVER silently fall back to FakePaymentProvider.
 * Invariant: Transaction boundary ensures proposal is never saved without a valid payment intent and responsibility.
 */
export async function handleCreateProposal(
  body: any,
  customProvider?: PaymentProvider,
  overrideMode?: ServerProviderMode,
  repos?: IHut4DevsRepositories,
  publisher?: OutboxPublisher
): Promise<ServerHandlerResponse> {
  if (!body || typeof body !== 'object') {
    return {
      status: 400,
      body: {
        success: false,
        error: 'Invalid request body.',
      },
    };
  }

  const { intentId, responsibilityId, amount, currency } = body;

  if (!intentId || typeof amount !== 'number' || amount <= 0) {
    return {
      status: 400,
      body: {
        success: false,
        error: 'Invalid payment intent parameters.',
      },
    };
  }

  const request: CreateProposalRequest = {
    intentId,
    responsibilityId: responsibilityId || 'unknown-responsibility',
    amount,
    currency: currency || 'NGN',
  };

  let proposalResult: CreateProposalResult;
  let status = 200;

  // 1. If a custom provider is explicitly injected (e.g. for testing)
  if (customProvider) {
    proposalResult = await customProvider.createProposal(request);
    status = proposalResult.success ? 200 : 400;
  } else {
    // 2. Evaluate Server-Side Provider Mode
    const activeMode = overrideMode ?? getServerProviderMode();

    // Mode: SIMULATED — explicit simulation only
    if (activeMode === 'SIMULATED') {
      const fakeProvider = new FakePaymentProvider();
      proposalResult = await fakeProvider.createProposal(request);
      status = 200;
    } else {
      // Mode: BMONI — strictly real BMONI provider. Never fall back to simulation!
      const bmoniProvider = new BmoniPaymentProvider();

      if (!bmoniProvider.hasCredentials()) {
        return {
          status: 200,
          body: {
            success: false,
            error: 'BMONI Sandbox Not Configured',
            notConfigured: true,
            requiresCredentials: true,
          },
        };
      }

      proposalResult = await bmoniProvider.createProposal(request);
      status = proposalResult.success ? 200 : proposalResult.isAmbiguousError ? 504 : 400;
    }
  }

  // 3. PostgreSQL Transactional Persistence & Outbox (H4D-FUNC-008 & H4D-FUNC-010)
  if (proposalResult.success && proposalResult.proposal && repos) {
    let proposalOutboxEvent: OutboxEventRecord | null = null;
    try {
      await repos.runInTransaction(async (tx) => {
        // Enforce intent exists or save it within transaction
        let existingIntent = await tx.intents.findById(intentId);
        if (!existingIntent) {
          // Verify responsibility exists first
          const resp = await tx.accommodation.findById(request.responsibilityId);
          if (!resp) {
            throw new Error(
              `Foreign key violation: accommodation responsibility "${request.responsibilityId}" does not exist.`
            );
          }

          existingIntent = {
            id: intentId,
            responsibilityId: request.responsibilityId,
            amount: request.amount,
            fulfilmentType: FulfilmentType.FULL,
            status: PaymentIntentStatus.PREPARED,
            createdAt: new Date().toISOString(),
          };
          await tx.intents.save(existingIntent);
        }

        // Save external payment proposal
        await tx.proposals.save(proposalResult.proposal!);

        // Create transactional outbox event
        proposalOutboxEvent = {
          id: `outbox-proposal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          eventType: 'accommodation.payment_proposal.created',
          aggregateType: 'accommodation_responsibility',
          aggregateId: request.responsibilityId,
          payload: {
            proposalId: proposalResult.proposal!.id,
            paymentIntentId: proposalResult.proposal!.paymentIntentId,
            responsibilityId: request.responsibilityId,
            amount: request.amount,
            currency: request.currency,
            provider: proposalResult.proposal!.provider,
            providerStatus: proposalResult.proposal!.providerStatus,
            isSimulated: Boolean(proposalResult.proposal!.isSimulated),
            createdAt: proposalResult.proposal!.createdAt,
          },
          createdAt: new Date().toISOString(),
          publishedAt: null,
        };
        await tx.outbox.insert(proposalOutboxEvent);
      });

      // Deliver via SSE strictly AFTER database commit succeeds
      if (proposalOutboxEvent) {
        const activePublisher = publisher || globalOutboxPublisher;
        await activePublisher.publish(proposalOutboxEvent, repos);
      }
    } catch (err: any) {
      return {
        status: 500,
        body: {
          success: false,
          error: `Database persistence failed: ${err.message || String(err)}`,
        },
      };
    }
  }

  return {
    status,
    body: proposalResult,
  };
}
