import {
  PaymentProvider,
  CreateProposalRequest,
  CreateProposalResult,
  ExternalPaymentProposal,
} from '../../domain/payments';

/**
 * Pure mapping function from Hut4Devs intent request to BMONI API payload.
 * Anti-corruption layer ensuring Hut4Devs domain never depends on raw BMONI structure.
 */
export function mapIntentToBmoniRequest(request: CreateProposalRequest): {
  amount: number;
  currency: string;
  category: string;
  metadata: {
    intentId: string;
    responsibilityId: string;
    app: string;
  };
} {
  return {
    amount: request.amount,
    currency: request.currency || 'NGN',
    category: 'ACCOMMODATION_FULFILMENT',
    metadata: {
      intentId: request.intentId,
      responsibilityId: request.responsibilityId,
      app: 'Hut4Devs',
    },
  };
}

/**
 * Pure mapping function from raw BMONI provider response to Hut4Devs ExternalPaymentProposal.
 * Preserves the provider's actual proposal status into Hut4Devs without inventing status names.
 */
export function mapBmoniProposalResponse(
  rawResponse: Record<string, any>,
  request: CreateProposalRequest
): ExternalPaymentProposal {
  // Directly preserve the provider's actual proposal status without inventing status names
  const actualProviderStatus = String(
    rawResponse.status ??
    rawResponse.providerStatus ??
    rawResponse.proposalStatus ??
    rawResponse.state ??
    'Pending Approval'
  );

  const providerProposalId =
    rawResponse.proposalId ||
    rawResponse.providerProposalId ||
    rawResponse.id ||
    rawResponse.proposal_id ||
    `bmoni-prop-${Date.now()}`;

  return {
    id: `ext-prop-${Date.now()}`,
    paymentIntentId: request.intentId,
    responsibilityId: request.responsibilityId,
    amount: request.amount,
    currency: request.currency || 'NGN',
    provider: 'BMONI',
    providerProposalId: String(providerProposalId),
    providerStatus: actualProviderStatus,
    createdAt: new Date().toISOString(),
    isSimulated: false,
  };
}

/**
 * Server-Side BMONI Payment Provider
 *
 * Reads secrets STRICTLY from server-side environment variables.
 * Never exposes API key, partner secret, or signing keys to the browser.
 */
export class BmoniPaymentProvider implements PaymentProvider {
  public readonly name = 'BMONI';

  private get apiUrl(): string {
    return (
      (typeof process !== 'undefined' && process.env && process.env.BMONI_API_URL) ||
      'https://api.sandbox.bmoni.com'
    );
  }

  private get apiKey(): string | undefined {
    return typeof process !== 'undefined' && process.env ? process.env.BMONI_API_KEY : undefined;
  }

  private get partnerSecret(): string | undefined {
    return typeof process !== 'undefined' && process.env ? process.env.BMONI_PARTNER_SECRET : undefined;
  }

  public hasCredentials(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async createProposal(request: CreateProposalRequest): Promise<CreateProposalResult> {
    if (!this.hasCredentials()) {
      return {
        success: false,
        error: 'BMONI Sandbox Not Configured',
        notConfigured: true,
        requiresCredentials: true,
      };
    }

    const payload = mapIntentToBmoniRequest(request);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${this.apiUrl}/proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey!,
          ...(this.partnerSecret ? { 'x-partner-secret': this.partnerSecret } : {}),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.warn(`[BMONI] Proposal creation rejected (${response.status}): ${errorText}`, {
          intentId: request.intentId,
        });
        return {
          success: false,
          error: "We couldn't prepare this payment with BMONI. No payment has been executed. Your accommodation balance has not changed.",
          definitiveFailure: true,
        };
      }

      const data = await response.json();
      const proposal = mapBmoniProposalResponse(data, request);

      return {
        success: true,
        proposal,
      };
    } catch (err: any) {
      console.warn('[BMONI] Ambiguous network failure or timeout:', {
        intentId: request.intentId,
        error: err?.message,
      });
      // No assumed idempotency: do NOT blindly retry. Represent truthfully as unresolved.
      return {
        success: false,
        error: "Unresolved proposal attempt: Network timeout or connection interruption contacting BMONI. It is unknown whether BMONI accepted the proposal. Investigation or reconciliation is required before retrying. Do not retry automatically to prevent duplicate proposals. Your accommodation balance has not changed.",
        isAmbiguousError: true,
      };
    }
  }
}
