import {
  AccommodationResponsibility,
  AccommodationPaymentIntent,
} from '../domain/accommodation';
import {
  CreateProposalResult,
  ExternalPaymentProposal,
} from '../domain/payments';

export interface AccommodationServerState {
  success: boolean;
  responsibility?: AccommodationResponsibility;
  preparedIntents?: AccommodationPaymentIntent[];
  paymentProposals?: ExternalPaymentProposal[];
  error?: string;
}

export interface SaveIntentResult {
  success: boolean;
  intent?: AccommodationPaymentIntent;
  error?: string;
}

/**
 * Fetches authoritative accommodation responsibility state from PostgreSQL backend.
 * (H4D-FUNC-008)
 */
export async function fetchAccommodationState(): Promise<AccommodationServerState> {
  try {
    const response = await fetch('/api/accommodation/responsibility');
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to fetch accommodation responsibility state.',
      };
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: 'Database unavailable: Could not connect to authoritative persistence layer.',
    };
  }
}

/**
 * Persists a prepared payment intent to the PostgreSQL repository.
 * (H4D-FUNC-008)
 *
 * Invariant: Failure does NOT fall back to localStorage for authoritative state.
 */
export async function savePaymentIntent(
  intent: AccommodationPaymentIntent
): Promise<SaveIntentResult> {
  try {
    const response = await fetch('/api/payments/intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ intent }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to persist payment intent to PostgreSQL.',
      };
    }

    return data;
  } catch (err: any) {
    return {
      success: false,
      error: 'Database unavailable: Connection failed while saving payment intent.',
    };
  }
}

/**
 * Client-Side Payment Provider Boundary (H4D-FUNC-005 & H4D-FUNC-008)
 *
 * This client function talks ONLY to the local server endpoint /api/payments/proposal.
 * It does NOT hold or transmit any BMONI API keys, partner secrets, or private keys.
 */
export async function requestBmoniProposal(
  intent: AccommodationPaymentIntent
): Promise<CreateProposalResult> {
  try {
    const response = await fetch('/api/payments/proposal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intentId: intent.id,
        responsibilityId: intent.responsibilityId,
        amount: intent.amount,
        currency: 'NGN',
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        error:
          data.error ||
          "We couldn't prepare this payment with BMONI. No payment has been executed. Your accommodation balance has not changed.",
        isAmbiguousError: data.isAmbiguousError || response.status === 504,
        notConfigured: data.notConfigured,
        requiresCredentials: data.requiresCredentials,
        definitiveFailure: data.definitiveFailure,
      };
    }

    return data;
  } catch (err: any) {
    // Ambiguous client network failure / timeout: do NOT blindly retry.
    return {
      success: false,
      error:
        "Unresolved proposal attempt: Network connection failure or timeout. It is unknown whether BMONI accepted the proposal. Investigation or reconciliation is required before retrying. Do not retry automatically to prevent duplicate proposals. Your accommodation balance has not changed.",
      isAmbiguousError: true,
    };
  }
}

export interface AdminStreamEvent {
  eventType: string;
  data: any;
}

/**
 * Subscribes to the real-time SSE stream for Accommodation Admin operational updates.
 * (H4D-FUNC-010 & H4D-FUNC-011)
 *
 * Enforces server-side authorization: requires ACCOMMODATION_ADMIN session token.
 * Invariant: Real-time stream is a convenience notification layer;
 * PostgreSQL remains the sole authoritative source of truth.
 */
export function subscribeToAdminStream(
  onEvent: (event: AdminStreamEvent) => void,
  onStatusChange?: (status: 'connecting' | 'connected' | 'error' | 'disconnected') => void,
  sessionToken?: string | null
): () => void {
  if (typeof window === 'undefined' || typeof (window as any).EventSource === 'undefined') {
    onStatusChange?.('disconnected');
    return () => {};
  }

  onStatusChange?.('connecting');
  const token = sessionToken || (typeof localStorage !== 'undefined' ? localStorage.getItem('h4d_session_token') : null);
  const streamUrl = token
    ? `/api/accommodation/admin/stream?token=${encodeURIComponent(token)}`
    : '/api/accommodation/admin/stream';

  const eventSource = new window.EventSource(streamUrl);

  eventSource.onopen = () => {
    onStatusChange?.('connected');
  };

  eventSource.addEventListener('connected', (e: MessageEvent) => {
    try {
      const data = JSON.parse(e.data);
      onEvent({ eventType: 'connected', data });
    } catch {
      onEvent({ eventType: 'connected', data: e.data });
    }
  });

  eventSource.addEventListener('accommodation.payment_intent.prepared', (e: MessageEvent) => {
    try {
      const data = JSON.parse(e.data);
      onEvent({ eventType: 'accommodation.payment_intent.prepared', data });
    } catch {
      onEvent({ eventType: 'accommodation.payment_intent.prepared', data: e.data });
    }
  });

  eventSource.addEventListener('accommodation.payment_proposal.created', (e: MessageEvent) => {
    try {
      const data = JSON.parse(e.data);
      onEvent({ eventType: 'accommodation.payment_proposal.created', data });
    } catch {
      onEvent({ eventType: 'accommodation.payment_proposal.created', data: e.data });
    }
  });

  eventSource.addEventListener('accommodation.provider_event.received', (e: MessageEvent) => {
    try {
      const data = JSON.parse(e.data);
      onEvent({ eventType: 'accommodation.provider_event.received', data });
    } catch {
      onEvent({ eventType: 'accommodation.provider_event.received', data: e.data });
    }
  });

  eventSource.addEventListener('accommodation.payment.reconciled', (e: MessageEvent) => {
    try {
      const data = JSON.parse(e.data);
      onEvent({ eventType: 'accommodation.payment.reconciled', data });
    } catch {
      onEvent({ eventType: 'accommodation.payment.reconciled', data: e.data });
    }
  });

  eventSource.addEventListener('accommodation.reconciliation.mismatch', (e: MessageEvent) => {
    try {
      const data = JSON.parse(e.data);
      onEvent({ eventType: 'accommodation.reconciliation.mismatch', data });
    } catch {
      onEvent({ eventType: 'accommodation.reconciliation.mismatch', data: e.data });
    }
  });

  eventSource.onerror = () => {
    onStatusChange?.('error');
  };

  return () => {
    eventSource.close();
    onStatusChange?.('disconnected');
  };
}

/**
 * Fetches received provider events for Accommodation Admin audit.
 * (H4D-FUNC-012)
 */
export async function fetchAdminProviderEvents(sessionToken?: string | null): Promise<{
  success: boolean;
  providerEvents?: any[];
  error?: string;
}> {
  try {
    const token = sessionToken || (typeof localStorage !== 'undefined' ? localStorage.getItem('h4d_session_token') : null);
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch('/api/accommodation/admin/provider-events', { headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to fetch provider events.' };
    }
    return data;
  } catch (err: any) {
    return { success: false, error: 'Network error fetching provider events.' };
  }
}

/**
 * Fetches authoritative payment reconciliations for Accommodation Admin.
 * (H4D-FUNC-013)
 */
export async function fetchAdminReconciliations(sessionToken?: string | null): Promise<{
  success: boolean;
  reconciliations?: any[];
  error?: string;
}> {
  try {
    const token = sessionToken || (typeof localStorage !== 'undefined' ? localStorage.getItem('h4d_session_token') : null);
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch('/api/accommodation/admin/reconciliations', { headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to fetch reconciliations.' };
    }
    return data;
  } catch (err: any) {
    return { success: false, error: 'Network error fetching reconciliations.' };
  }
}

/**
 * Triggers manual or retry reconciliation for a provider event.
 * (H4D-FUNC-013)
 */
export async function triggerAdminReconcile(
  providerEventId: string,
  sessionToken?: string | null
): Promise<{
  success: boolean;
  result?: any;
  error?: string;
}> {
  try {
    const token = sessionToken || (typeof localStorage !== 'undefined' ? localStorage.getItem('h4d_session_token') : null);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch('/api/accommodation/admin/reconcile', {
      method: 'POST',
      headers,
      body: JSON.stringify({ providerEventId, provider: 'BMONI' }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.error || 'Reconciliation request failed.' };
    }
    return data;
  } catch (err: any) {
    return { success: false, error: 'Network error submitting reconciliation.' };
  }
}
