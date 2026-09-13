-- 7. Payment Reconciliations (H4D-FUNC-013)
-- Invariant: Reconciliation record links provider event to external payment proposal,
-- payment intent, and accommodation responsibility.
CREATE TABLE payment_reconciliations (
  id VARCHAR(255) PRIMARY KEY,
  provider_event_id VARCHAR(255) NOT NULL,
  external_payment_proposal_id VARCHAR(255) REFERENCES external_payment_proposals(id) ON DELETE SET NULL,
  payment_intent_id VARCHAR(255) REFERENCES payment_intents(id) ON DELETE SET NULL,
  accommodation_responsibility_id VARCHAR(255) REFERENCES accommodation_responsibilities(id) ON DELETE SET NULL,
  provider VARCHAR(50) NOT NULL,
  provider_status VARCHAR(100) NOT NULL,
  amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
  reconciliation_status VARCHAR(50) NOT NULL,
  reason_code VARCHAR(100) NOT NULL,
  reconciled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial unique index: at most ONE VERIFIED reconciliation record per provider event (H4D-FUNC-013 hardening)
CREATE UNIQUE INDEX uq_payment_reconciliations_verified_event 
ON payment_reconciliations (provider, provider_event_id) 
WHERE reconciliation_status = 'VERIFIED';

CREATE INDEX idx_payment_reconciliations_event ON payment_reconciliations(provider, provider_event_id);
CREATE INDEX idx_payment_reconciliations_resp ON payment_reconciliations(accommodation_responsibility_id);
CREATE INDEX idx_payment_reconciliations_status ON payment_reconciliations(reconciliation_status);
CREATE INDEX idx_external_proposals_provider_proposal ON external_payment_proposals(provider, provider_proposal_id);
ALTER TABLE external_payment_proposals ADD COLUMN IF NOT EXISTS responsibility_id VARCHAR(255);
