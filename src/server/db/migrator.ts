import { QueryResult } from 'pg';

export interface SqlQueryable {
  query(queryText: string, values?: any[]): Promise<QueryResult<any>>;
}

export const INITIAL_SCHEMA_SQL = `
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

-- 2. Payment Intents (Status strictly remains PREPARED)
CREATE TABLE payment_intents (
  id VARCHAR(255) PRIMARY KEY,
  responsibility_id VARCHAR(255) NOT NULL REFERENCES accommodation_responsibilities(id) ON DELETE RESTRICT,
  amount NUMERIC(14, 2) NOT NULL,
  fulfilment_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PREPARED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. External Payment Proposals (No secrets, private keys, PINs, BVN, NIN, raw credentials)
CREATE TABLE external_payment_proposals (
  id VARCHAR(255) PRIMARY KEY,
  payment_intent_id VARCHAR(255) NOT NULL REFERENCES payment_intents(id) ON DELETE RESTRICT,
  provider VARCHAR(50) NOT NULL,
  provider_proposal_id VARCHAR(255) NOT NULL,
  provider_status VARCHAR(100) NOT NULL,
  is_simulated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_intents_resp_id ON payment_intents(responsibility_id);
CREATE INDEX idx_payment_proposals_intent_id ON external_payment_proposals(payment_intent_id);
`;

export const OUTBOX_EVENTS_SQL = `
-- 4. Transactional Outbox Events (H4D-FUNC-010)
CREATE TABLE outbox_events (
  id VARCHAR(255) PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  aggregate_type VARCHAR(100) NOT NULL,
  aggregate_id VARCHAR(255) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX idx_outbox_events_published_at ON outbox_events(published_at);
CREATE INDEX idx_outbox_events_aggregate ON outbox_events(aggregate_type, aggregate_id);
`;

export const AUTH_MEMBERS_ROLES_SQL = `
-- 5. Members, Roles, and Sessions (H4D-FUNC-011)
CREATE TABLE members (
  id VARCHAR(255) PRIMARY KEY,
  display_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE member_roles (
  id VARCHAR(255) PRIMARY KEY,
  member_id VARCHAR(255) NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_member_role UNIQUE (member_id, role)
);

CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  member_id VARCHAR(255) NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_member_roles_member ON member_roles(member_id);
`;

export const PROVIDER_EVENTS_SQL = `
-- 6. Provider Events Store (H4D-FUNC-012)
CREATE TABLE provider_events (
  id VARCHAR(255) PRIMARY KEY,
  provider VARCHAR(50) NOT NULL,
  provider_event_id VARCHAR(255) NOT NULL,
  source_event_id VARCHAR(255),
  event_type VARCHAR(100) NOT NULL,
  provider_status VARCHAR(100) NOT NULL,
  provider_proposal_id VARCHAR(255),
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processing_status VARCHAR(50) NOT NULL DEFAULT 'RECEIVED',
  CONSTRAINT uq_provider_event UNIQUE (provider, provider_event_id)
);

CREATE INDEX idx_provider_events_provider_event ON provider_events(provider, provider_event_id);
CREATE INDEX idx_provider_events_proposal_id ON provider_events(provider_proposal_id);
CREATE INDEX idx_provider_events_received_at ON provider_events(received_at);
`;

export const PAYMENT_RECONCILIATIONS_SQL = `
-- 7. Payment Reconciliations (H4D-FUNC-013)
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
`;

export const MIGRATIONS = [
  {
    version: '001_initial_schema',
    sql: INITIAL_SCHEMA_SQL,
  },
  {
    version: '002_outbox_events',
    sql: OUTBOX_EVENTS_SQL,
  },
  {
    version: '003_auth_members_roles',
    sql: AUTH_MEMBERS_ROLES_SQL,
  },
  {
    version: '004_provider_events',
    sql: PROVIDER_EVENTS_SQL,
  },
  {
    version: '005_payment_reconciliations',
    sql: PAYMENT_RECONCILIATIONS_SQL,
  },
];

export const REQUIRED_TABLES = [
  'schema_migrations',
  'accommodation_responsibilities',
  'payment_intents',
  'external_payment_proposals',
  'outbox_events',
  'members',
  'member_roles',
  'sessions',
  'provider_events',
  'payment_reconciliations',
];

/**
 * Ensures the schema_migrations tracking table exists.
 */
export async function ensureMigrationTable(client: SqlQueryable): Promise<void> {
  const check = await client.query(`
    SELECT 1 FROM information_schema.tables WHERE table_name = 'schema_migrations'
  `);
  if (check.rows.length === 0) {
    await client.query(`
      CREATE TABLE schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }
}

async function isPgMemClient(client: SqlQueryable): Promise<boolean> {
  try {
    const res = await client.query('SELECT version() AS v;');
    const v = res.rows?.[0]?.v || '';
    return typeof v === 'string' && v.includes('pg-mem');
  } catch {
    return false;
  }
}

/**
 * Applies pending schema migrations deterministically.
 */
export async function runMigrations(client: SqlQueryable): Promise<string[]> {
  await ensureMigrationTable(client);

  const appliedResult = await client.query(`SELECT version FROM schema_migrations;`);
  const appliedVersions = new Set<string>(appliedResult.rows.map((r: any) => r.version));

  const newlyApplied: string[] = [];

  for (const migration of MIGRATIONS) {
    if (!appliedVersions.has(migration.version)) {
      if ('connect' in client && typeof (client as any).connect === 'function') {
        const poolClient = await (client as any).connect();
        try {
          await poolClient.query('BEGIN');
          let sqlToExecute = migration.sql;
          // PG-MEM LIMITATION: Partial unique indexes (e.g. WHERE reconciliation_status = 'VERIFIED')
          // are not faithfully emulated by pg-mem; pg-mem mistakenly treats them as unconditional unique indexes across all rows,
          // which prevents append-oriented history of (MISMATCH -> later VERIFIED).
          // In real PostgreSQL, the partial unique index is authoritative and executed as written.
          if (migration.version === '005_payment_reconciliations') {
            const isPgMem = await isPgMemClient(poolClient);
            if (isPgMem) {
              sqlToExecute = sqlToExecute.replace(
                /CREATE UNIQUE INDEX uq_payment_reconciliations_verified_event\s+ON payment_reconciliations\s*\(provider,\s*provider_event_id\)\s+WHERE reconciliation_status\s*=\s*'VERIFIED';/i,
                `-- PG-MEM COMPATIBILITY: pg-mem does not support partial unique indexes with WHERE filter. Converted to non-unique index for emulator only.
CREATE INDEX uq_payment_reconciliations_verified_event ON payment_reconciliations (provider, provider_event_id);`
              );
            }
          }
          await poolClient.query(sqlToExecute);
          await poolClient.query(
            `INSERT INTO schema_migrations (version, applied_at) VALUES ($1, NOW());`,
            [migration.version]
          );
          await poolClient.query('COMMIT');
          newlyApplied.push(migration.version);
        } catch (err) {
          await poolClient.query('ROLLBACK');
          throw new Error(`Migration ${migration.version} failed: ${err}`);
        } finally {
          poolClient.release();
        }
      } else {
        await client.query('BEGIN');
        try {
          let sqlToExecute = migration.sql;
          if (migration.version === '005_payment_reconciliations') {
            const isPgMem = await isPgMemClient(client);
            if (isPgMem) {
              sqlToExecute = sqlToExecute.replace(
                /CREATE UNIQUE INDEX uq_payment_reconciliations_verified_event\s+ON payment_reconciliations\s*\(provider,\s*provider_event_id\)\s+WHERE reconciliation_status\s*=\s*'VERIFIED';/i,
                `-- PG-MEM COMPATIBILITY: pg-mem does not support partial unique indexes with WHERE filter. Converted to non-unique index for emulator only.
CREATE INDEX uq_payment_reconciliations_verified_event ON payment_reconciliations (provider, provider_event_id);`
              );
            }
          }
          await client.query(sqlToExecute);
          await client.query(
            `INSERT INTO schema_migrations (version, applied_at) VALUES ($1, NOW());`,
            [migration.version]
          );
          await client.query('COMMIT');
          newlyApplied.push(migration.version);
        } catch (err) {
          await client.query('ROLLBACK');
          throw new Error(`Migration ${migration.version} failed: ${err}`);
        }
      }
    }
  }

  return newlyApplied;
}
