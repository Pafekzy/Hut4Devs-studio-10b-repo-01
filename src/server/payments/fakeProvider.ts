import {
  PaymentProvider,
  CreateProposalRequest,
  CreateProposalResult,
  ExternalPaymentProposal,
} from '../../domain/payments';

/**
 * Fake/Mock Payment Provider for automated testing and development preview.
 * Simulates a proposal creation without network calls or real BMONI requests.
 * Visibly distinguishes simulated outcomes from real BMONI provider responses.
 */
export class FakePaymentProvider implements PaymentProvider {
  public readonly name = 'SIMULATED';
  public shouldFail: boolean = false;
  public lastRequest?: CreateProposalRequest;

  constructor(shouldFail = false) {
    this.shouldFail = shouldFail;
  }

  public async createProposal(request: CreateProposalRequest): Promise<CreateProposalResult> {
    this.lastRequest = request;

    if (this.shouldFail) {
      return {
        success: false,
        error: "We couldn't prepare this simulated payment. Your accommodation balance has not changed.",
      };
    }

    const proposal: ExternalPaymentProposal = {
      id: `sim-prop-${Date.now()}`,
      paymentIntentId: request.intentId,
      responsibilityId: request.responsibilityId,
      amount: request.amount,
      currency: request.currency || 'NGN',
      provider: 'SIMULATED',
      providerProposalId: `sim-prop-${Math.floor(100000 + Math.random() * 900000)}`,
      providerStatus: 'Simulated',
      createdAt: new Date().toISOString(),
      isSimulated: true,
    };

    return {
      success: true,
      proposal,
    };
  }
}
