-- 001_initial_schema.sql
-- Hut4Devs PostgreSQL Schema: Accommodation Responsibilities, Payment Intents, and External Proposals

-- 1. Accommodation Responsibilities
CREATE TABLE accommodation_responsibilities (
  id VARCHAR(255) PRIMARY KEY,
  fellow_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  required_amount NUMERIC(14, 2) NOT NULL,
  verified_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  status VARCHAR(50) NOT NULL DEFAULT 'OUTSTANDING',
  period VARCHAR(100),
  currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
  property_id VARCHAR(255),
  property_name VARCHAR(255),
  property_address TEXT,
  floor_id VARCHAR(255),
  floor_name VARCHAR(255),
  floor_level INT,
  room_id VARCHAR(255),
  room_name VARCHAR(255),
  room_code VARCHAR(50),
  fellow_name VARCHAR(255),
  fellow_email VARCHAR(255),
  context_data TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Payment Intents (Status strictly remains PREPARED in this milestone)
CREATE TABLE payment_intents (
  id VARCHAR(255) PRIMARY KEY,
  responsibility_id VARCHAR(255) NOT NULL REFERENCES accommodation_responsibilities(id) ON DELETE RESTRICT,
  amount NUMERIC(14, 2) NOT NULL,
  fulfilment_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PREPARED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. External Payment Proposals (No API secrets, private keys, wallet PINs, BVN, NIN, raw credentials)
CREATE TABLE external_payment_proposals (
  id VARCHAR(255) PRIMARY KEY,
  payment_intent_id VARCHAR(255) NOT NULL REFERENCES payment_intents(id) ON DELETE RESTRICT,
  provider VARCHAR(50) NOT NULL,
  provider_proposal_id VARCHAR(255) NOT NULL,
  provider_status VARCHAR(100) NOT NULL,
  is_simulated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for rapid lookup & relational integrity
CREATE INDEX idx_payment_intents_resp_id ON payment_intents(responsibility_id);
CREATE INDEX idx_payment_proposals_intent_id ON external_payment_proposals(payment_intent_id);
