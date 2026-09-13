import {
  AccommodationResponsibility,
  AccommodationPaymentIntent,
  ResponsibilityStatus,
  FulfilmentType,
  PaymentIntentStatus,
} from '../../domain/accommodation';
import { ExternalPaymentProposal } from '../../domain/payments';
import {
  Member,
  MemberRole,
  Session,
  IMemberRepository,
  ISessionRepository,
} from '../../domain/auth';
import {
  IAccommodationRepository,
  IPaymentIntentRepository,
  IExternalProposalRepository,
  IOutboxRepository,
  OutboxEventRecord,
  ProviderEventRecord,
  IProviderEventRepository,
  IPaymentReconciliationRepository,
  IHut4DevsRepositories,
} from '../../domain/repositories';
import { PaymentReconciliationRecord } from '../../domain/reconciliation';
import { SqlQueryable } from './migrator';
import { Pool, PoolClient } from 'pg';

export class PostgresAccommodationRepository implements IAccommodationRepository {
  constructor(private client: SqlQueryable) {}

  async findById(id: string): Promise<AccommodationResponsibility | null> {
    const res = await this.client.query(
      'SELECT * FROM accommodation_responsibilities WHERE id = $1',
      [id]
    );
    if (res.rows.length === 0) return null;
    return this.mapRowToResponsibility(res.rows[0]);
  }

  async findByIdForUpdate(id: string): Promise<AccommodationResponsibility | null> {
    const res = await this.client.query(
      'SELECT * FROM accommodation_responsibilities WHERE id = $1 FOR UPDATE',
      [id]
    );
    if (res.rows.length === 0) return null;
    return this.mapRowToResponsibility(res.rows[0]);
  }

  async save(responsibility: AccommodationResponsibility): Promise<void> {
    const ctx = responsibility.accommodationContext;
    await this.client.query(
      `
      INSERT INTO accommodation_responsibilities (
        id, fellow_id, title, required_amount, verified_amount,
        status, period, currency, property_id, property_name,
        property_address, floor_id, floor_name, floor_level,
        room_id, room_name, room_code, fellow_name, fellow_email,
        context_data, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        required_amount = EXCLUDED.required_amount,
        verified_amount = EXCLUDED.verified_amount,
        status = EXCLUDED.status,
        period = EXCLUDED.period,
        currency = EXCLUDED.currency,
        property_id = EXCLUDED.property_id,
        property_name = EXCLUDED.property_name,
        property_address = EXCLUDED.property_address,
        floor_id = EXCLUDED.floor_id,
        floor_name = EXCLUDED.floor_name,
        floor_level = EXCLUDED.floor_level,
        room_id = EXCLUDED.room_id,
        room_name = EXCLUDED.room_name,
        room_code = EXCLUDED.room_code,
        fellow_name = EXCLUDED.fellow_name,
        fellow_email = EXCLUDED.fellow_email,
        context_data = EXCLUDED.context_data,
        updated_at = NOW()
      `,
      [
        responsibility.id,
        responsibility.fellowId,
        responsibility.title,
        responsibility.requiredAmount,
        responsibility.verifiedAmount,
        responsibility.status,
        responsibility.period || null,
        responsibility.currency || 'NGN',
        ctx?.property?.id || null,
        ctx?.property?.name || null,
        ctx?.property?.address || null,
        ctx?.floor?.id || null,
        ctx?.floor?.name || null,
        ctx?.floor?.levelNumber || null,
        ctx?.room?.id || null,
        ctx?.room?.name || null,
        ctx?.room?.code || null,
        responsibility.fellow?.name || null,
        responsibility.fellow?.email || null,
        ctx ? JSON.stringify(ctx) : null,
      ]
    );
  }

  async listAll(): Promise<AccommodationResponsibility[]> {
    const res = await this.client.query(
      'SELECT * FROM accommodation_responsibilities ORDER BY created_at ASC'
    );
    return res.rows.map((row) => this.mapRowToResponsibility(row));
  }

  private mapRowToResponsibility(row: any): AccommodationResponsibility {
    let context = row.context_data ? JSON.parse(row.context_data) : null;
    if (!context) {
      context = {
        property: {
          id: row.property_id || 'unknown-prop',
          name: row.property_name || 'Property',
          address: row.property_address || undefined,
        },
        floor: {
          id: row.floor_id || 'unknown-floor',
          propertyId: row.property_id || 'unknown-prop',
          name: row.floor_name || 'Floor',
          levelNumber: row.floor_level || undefined,
        },
        room: {
          id: row.room_id || 'unknown-room',
          floorId: row.floor_id || 'unknown-floor',
          name: row.room_name || 'Room',
          code: row.room_code || undefined,
        },
      };
    }

    return {
      id: row.id,
      fellowId: row.fellow_id,
      fellow: {
        id: row.fellow_id,
        name: row.fellow_name || 'Fellow',
        email: row.fellow_email || undefined,
        roomId: row.room_id || undefined,
      },
      title: row.title,
      accommodationContext: context,
      requiredAmount: Number(row.required_amount),
      verifiedAmount: Number(row.verified_amount),
      status: row.status as ResponsibilityStatus,
      period: row.period || undefined,
      currency: row.currency || 'NGN',
    };
  }
}

export class PostgresPaymentIntentRepository implements IPaymentIntentRepository {
  constructor(private client: SqlQueryable) {}

  async findById(id: string): Promise<AccommodationPaymentIntent | null> {
    const res = await this.client.query(
      'SELECT * FROM payment_intents WHERE id = $1',
      [id]
    );
    if (res.rows.length === 0) return null;
    return this.mapRowToIntent(res.rows[0]);
  }

  async findByResponsibilityId(responsibilityId: string): Promise<AccommodationPaymentIntent[]> {
    const res = await this.client.query(
      'SELECT * FROM payment_intents WHERE responsibility_id = $1 ORDER BY created_at ASC',
      [responsibilityId]
    );
    return res.rows.map((row) => this.mapRowToIntent(row));
  }

  async save(intent: AccommodationPaymentIntent): Promise<void> {
    try {
      await this.client.query(
        `
        INSERT INTO payment_intents (
          id, responsibility_id, amount, fulfilment_type, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          amount = EXCLUDED.amount,
          fulfilment_type = EXCLUDED.fulfilment_type,
          status = EXCLUDED.status
        `,
        [
          intent.id,
          intent.responsibilityId,
          intent.amount,
          intent.fulfilmentType,
          intent.status || PaymentIntentStatus.PREPARED,
          intent.createdAt || new Date().toISOString(),
        ]
      );
    } catch (err: any) {
      if (err?.code === '23503' || String(err?.message || '').toLowerCase().includes('foreign key')) {
        throw new Error(`Foreign key violation: ${err.message}`);
      }
      throw err;
    }
  }

  async listAll(): Promise<AccommodationPaymentIntent[]> {
    const res = await this.client.query('SELECT * FROM payment_intents ORDER BY created_at ASC');
    return res.rows.map((row) => this.mapRowToIntent(row));
  }

  private mapRowToIntent(row: any): AccommodationPaymentIntent {
    return {
      id: row.id,
      responsibilityId: row.responsibility_id,
      amount: Number(row.amount),
      fulfilmentType: row.fulfilment_type as FulfilmentType,
      status: row.status as PaymentIntentStatus,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    };
  }
}

export class PostgresExternalProposalRepository implements IExternalProposalRepository {
  constructor(private client: SqlQueryable) {}

  async findById(id: string): Promise<ExternalPaymentProposal | null> {
    const res = await this.client.query(
      `
      SELECT p.*, COALESCE(p.responsibility_id, i.responsibility_id) AS responsibility_id, i.amount, r.currency
      FROM external_payment_proposals p
      LEFT JOIN payment_intents i ON p.payment_intent_id = i.id
      LEFT JOIN accommodation_responsibilities r ON i.responsibility_id = r.id
      WHERE p.id = $1
      `,
      [id]
    );
    if (res.rows.length === 0) return null;
    return this.mapRowToProposal(res.rows[0]);
  }

  async findByIntentId(intentId: string): Promise<ExternalPaymentProposal | null> {
    const res = await this.client.query(
      `
      SELECT p.*, COALESCE(p.responsibility_id, i.responsibility_id) AS responsibility_id, i.amount, r.currency
      FROM external_payment_proposals p
      JOIN payment_intents i ON p.payment_intent_id = i.id
      JOIN accommodation_responsibilities r ON i.responsibility_id = r.id
      WHERE p.payment_intent_id = $1
      ORDER BY p.created_at DESC
      LIMIT 1
      `,
      [intentId]
    );
    if (res.rows.length === 0) return null;
    return this.mapRowToProposal(res.rows[0]);
  }

  async findByProviderProposalId(provider: string, providerProposalId: string): Promise<ExternalPaymentProposal | null> {
    const res = await this.client.query(
      `
      SELECT p.*, COALESCE(p.responsibility_id, i.responsibility_id) AS responsibility_id, i.amount, r.currency
      FROM external_payment_proposals p
      LEFT JOIN payment_intents i ON p.payment_intent_id = i.id
      LEFT JOIN accommodation_responsibilities r ON i.responsibility_id = r.id
      WHERE p.provider = $1 AND p.provider_proposal_id = $2
      ORDER BY p.created_at DESC
      LIMIT 1
      `,
      [provider, providerProposalId]
    );
    if (res.rows.length === 0) return null;
    return this.mapRowToProposal(res.rows[0]);
  }

  async save(proposal: ExternalPaymentProposal): Promise<void> {
    try {
      await this.client.query(
        `
        INSERT INTO external_payment_proposals (
          id, payment_intent_id, provider, provider_proposal_id,
          provider_status, is_simulated, created_at, responsibility_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          provider = EXCLUDED.provider,
          provider_proposal_id = EXCLUDED.provider_proposal_id,
          provider_status = EXCLUDED.provider_status,
          is_simulated = EXCLUDED.is_simulated,
          responsibility_id = EXCLUDED.responsibility_id
        `,
        [
          proposal.id,
          proposal.paymentIntentId,
          proposal.provider,
          proposal.providerProposalId,
          proposal.providerStatus,
          Boolean(proposal.isSimulated),
          proposal.createdAt || new Date().toISOString(),
          proposal.responsibilityId || null,
        ]
      );
    } catch (err: any) {
      if (err?.code === '23503' || String(err?.message || '').toLowerCase().includes('foreign key')) {
        throw new Error(`Foreign key violation: ${err.message}`);
      }
      throw err;
    }
  }

  async listAll(): Promise<ExternalPaymentProposal[]> {
    const res = await this.client.query(
      `
      SELECT p.*, COALESCE(p.responsibility_id, i.responsibility_id) AS responsibility_id, i.amount, r.currency
      FROM external_payment_proposals p
      LEFT JOIN payment_intents i ON p.payment_intent_id = i.id
      LEFT JOIN accommodation_responsibilities r ON i.responsibility_id = r.id
      ORDER BY p.created_at ASC
      `
    );
    return res.rows.map((row) => this.mapRowToProposal(row));
  }

  private mapRowToProposal(row: any): ExternalPaymentProposal {
    return {
      id: row.id,
      paymentIntentId: row.payment_intent_id,
      responsibilityId: row.responsibility_id || '',
      amount: Number(row.amount || 0),
      currency: row.currency || 'NGN',
      provider: row.provider,
      providerProposalId: row.provider_proposal_id,
      providerStatus: row.provider_status,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
      isSimulated: Boolean(row.is_simulated),
    };
  }
}

/**
 * PostgreSQL Outbox Repository Implementation (H4D-FUNC-010)
 */
export class PostgresOutboxRepository implements IOutboxRepository {
  constructor(private client: SqlQueryable) {}

  async insert(event: OutboxEventRecord): Promise<void> {
    const payloadJson = typeof event.payload === 'string' ? event.payload : JSON.stringify(event.payload);
    await this.client.query(
      `
      INSERT INTO outbox_events (
        id, event_type, aggregate_type, aggregate_id, payload, created_at, published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO NOTHING
      `,
      [
        event.id,
        event.eventType,
        event.aggregateType,
        event.aggregateId,
        payloadJson,
        event.createdAt || new Date().toISOString(),
        event.publishedAt || null,
      ]
    );
  }

  async markPublished(id: string, publishedAt?: string): Promise<void> {
    const pubDate = publishedAt || new Date().toISOString();
    await this.client.query(
      'UPDATE outbox_events SET published_at = $1 WHERE id = $2',
      [pubDate, id]
    );
  }

  async findPending(): Promise<OutboxEventRecord[]> {
    const res = await this.client.query(
      'SELECT * FROM outbox_events WHERE published_at IS NULL ORDER BY created_at ASC'
    );
    return res.rows.map(this.mapRowToEvent);
  }

  async findById(id: string): Promise<OutboxEventRecord | null> {
    const res = await this.client.query(
      'SELECT * FROM outbox_events WHERE id = $1',
      [id]
    );
    if (res.rows.length === 0) return null;
    return this.mapRowToEvent(res.rows[0]);
  }

  async listAll(): Promise<OutboxEventRecord[]> {
    const res = await this.client.query(
      'SELECT * FROM outbox_events ORDER BY created_at DESC'
    );
    return res.rows.map(this.mapRowToEvent);
  }

  private mapRowToEvent(row: any): OutboxEventRecord {
    let payload = row.payload;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        // Keep raw if invalid JSON
      }
    }
    return {
      id: row.id,
      eventType: row.event_type,
      aggregateType: row.aggregate_type,
      aggregateId: row.aggregate_id,
      payload,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
      publishedAt: row.published_at ? (row.published_at instanceof Date ? row.published_at.toISOString() : String(row.published_at)) : null,
    };
  }
}

/**
 * PostgreSQL Member Repository Implementation (H4D-FUNC-011)
 */
export class PostgresMemberRepository implements IMemberRepository {
  constructor(private client: SqlQueryable) {}

  async findById(id: string): Promise<Member | null> {
    const res = await this.client.query(
      `
      SELECT m.id, m.display_name, m.email, m.created_at, mr.role
      FROM members m
      LEFT JOIN member_roles mr ON mr.member_id = m.id
      WHERE m.id = $1
      `,
      [id]
    );

    if (res.rows.length === 0) return null;

    const first = res.rows[0];
    const roles: MemberRole[] = [];
    for (const r of res.rows) {
      if (r.role && !roles.includes(r.role as MemberRole)) {
        roles.push(r.role as MemberRole);
      }
    }

    return {
      id: first.id,
      displayName: first.display_name,
      email: first.email || undefined,
      roles,
      createdAt: first.created_at instanceof Date ? first.created_at.toISOString() : String(first.created_at),
    };
  }

  async save(member: Member): Promise<void> {
    await this.client.query(
      `
      INSERT INTO members (id, display_name, email, created_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        email = EXCLUDED.email
      `,
      [
        member.id,
        member.displayName,
        member.email || null,
        member.createdAt || new Date().toISOString(),
      ]
    );

    for (const role of member.roles) {
      const roleId = `role-${member.id}-${role.toLowerCase()}`;
      await this.client.query(
        `
        INSERT INTO member_roles (id, member_id, role)
        VALUES ($1, $2, $3)
        ON CONFLICT (member_id, role) DO NOTHING
        `,
        [roleId, member.id, role]
      );
    }
  }

  async listAll(): Promise<Member[]> {
    const res = await this.client.query(
      `
      SELECT m.id, m.display_name, m.email, m.created_at, mr.role
      FROM members m
      LEFT JOIN member_roles mr ON mr.member_id = m.id
      ORDER BY m.created_at ASC
      `
    );

    const membersMap = new Map<string, Member>();
    for (const row of res.rows) {
      let m = membersMap.get(row.id);
      if (!m) {
        m = {
          id: row.id,
          displayName: row.display_name,
          email: row.email || undefined,
          roles: [],
          createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
        };
        membersMap.set(row.id, m);
      }
      if (row.role && !m.roles.includes(row.role as MemberRole)) {
        m.roles.push(row.role as MemberRole);
      }
    }

    return Array.from(membersMap.values());
  }
}

/**
 * PostgreSQL Session Repository Implementation (H4D-FUNC-011)
 */
export class PostgresSessionRepository implements ISessionRepository {
  constructor(private client: SqlQueryable) {}

  async create(session: Session): Promise<void> {
    await this.client.query(
      `
      INSERT INTO sessions (id, token, member_id, created_at, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (token) DO UPDATE SET
        expires_at = EXCLUDED.expires_at
      `,
      [
        session.id,
        session.token,
        session.memberId,
        session.createdAt || new Date().toISOString(),
        session.expiresAt,
      ]
    );
  }

  async findByToken(token: string): Promise<Session | null> {
    const res = await this.client.query(
      `
      SELECT s.id, s.token, s.member_id, s.created_at, s.expires_at,
             m.display_name, m.email, m.created_at as member_created_at, mr.role
      FROM sessions s
      JOIN members m ON m.id = s.member_id
      LEFT JOIN member_roles mr ON mr.member_id = m.id
      WHERE s.token = $1
      `,
      [token]
    );

    if (res.rows.length === 0) return null;

    const first = res.rows[0];
    const roles: MemberRole[] = [];
    for (const r of res.rows) {
      if (r.role && !roles.includes(r.role as MemberRole)) {
        roles.push(r.role as MemberRole);
      }
    }

    const member: Member = {
      id: first.member_id,
      displayName: first.display_name,
      email: first.email || undefined,
      roles,
      createdAt: first.member_created_at instanceof Date ? first.member_created_at.toISOString() : String(first.member_created_at),
    };

    return {
      id: first.id,
      token: first.token,
      memberId: first.member_id,
      member,
      createdAt: first.created_at instanceof Date ? first.created_at.toISOString() : String(first.created_at),
      expiresAt: first.expires_at instanceof Date ? first.expires_at.toISOString() : String(first.expires_at),
    };
  }

  async deleteByToken(token: string): Promise<void> {
    await this.client.query('DELETE FROM sessions WHERE token = $1', [token]);
  }

  async deleteExpired(): Promise<void> {
    await this.client.query('DELETE FROM sessions WHERE expires_at < NOW()');
  }
}

/**
 * PostgreSQL Provider Event Repository (H4D-FUNC-012)
 *
 * Persists raw provider event receipts for audit and later reconciliation.
 * Never stores webhook secrets, API secrets, private keys, wallet PINs, BVN, or NIN.
 */
export class PostgresProviderEventRepository implements IProviderEventRepository {
  constructor(private client: SqlQueryable) {}

  async create(event: ProviderEventRecord): Promise<ProviderEventRecord> {
    const payloadStr = typeof event.payload === 'string' ? event.payload : JSON.stringify(event.payload);
    await this.client.query(
      `INSERT INTO provider_events (
        id, provider, provider_event_id, source_event_id, event_type,
        provider_status, provider_proposal_id, payload, received_at,
        processed_at, processing_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (provider, provider_event_id) DO NOTHING`,
      [
        event.id,
        event.provider,
        event.providerEventId,
        event.sourceEventId || null,
        event.eventType,
        event.providerStatus,
        event.providerProposalId || null,
        payloadStr,
        event.receivedAt,
        event.processedAt || null,
        event.processingStatus || 'RECEIVED',
      ]
    );
    return event;
  }

  async createWithOutbox(event: ProviderEventRecord, outboxEvent: OutboxEventRecord): Promise<ProviderEventRecord> {
    const payloadStr = typeof event.payload === 'string' ? event.payload : JSON.stringify(event.payload);
    const outboxPayloadStr = typeof outboxEvent.payload === 'string' ? outboxEvent.payload : JSON.stringify(outboxEvent.payload);

    await this.client.query('BEGIN');
    try {
      await this.client.query(
        `INSERT INTO provider_events (
          id, provider, provider_event_id, source_event_id, event_type,
          provider_status, provider_proposal_id, payload, received_at,
          processed_at, processing_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (provider, provider_event_id) DO NOTHING`,
        [
          event.id,
          event.provider,
          event.providerEventId,
          event.sourceEventId || null,
          event.eventType,
          event.providerStatus,
          event.providerProposalId || null,
          payloadStr,
          event.receivedAt,
          event.processedAt || null,
          event.processingStatus || 'RECEIVED',
        ]
      );

      await this.client.query(
        `INSERT INTO outbox_events (id, event_type, aggregate_type, aggregate_id, payload, created_at, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          outboxEvent.id,
          outboxEvent.eventType,
          outboxEvent.aggregateType,
          outboxEvent.aggregateId,
          outboxPayloadStr,
          outboxEvent.createdAt,
          outboxEvent.publishedAt || null,
        ]
      );
      await this.client.query('COMMIT');
      return event;
    } catch (err) {
      await this.client.query('ROLLBACK');
      throw err;
    }
  }

  async findByProviderEventId(provider: string, providerEventId: string): Promise<ProviderEventRecord | null> {
    const res = await this.client.query(
      `SELECT * FROM provider_events WHERE provider = $1 AND provider_event_id = $2`,
      [provider, providerEventId]
    );
    if (res.rows.length === 0) return null;
    return this.mapRowToProviderEvent(res.rows[0]);
  }

  async findById(id: string): Promise<ProviderEventRecord | null> {
    const res = await this.client.query(
      `SELECT * FROM provider_events WHERE id = $1`,
      [id]
    );
    if (res.rows.length === 0) return null;
    return this.mapRowToProviderEvent(res.rows[0]);
  }

  async listByProposalId(providerProposalId: string): Promise<ProviderEventRecord[]> {
    const res = await this.client.query(
      `SELECT * FROM provider_events WHERE provider_proposal_id = $1 ORDER BY received_at DESC`,
      [providerProposalId]
    );
    return res.rows.map((r: any) => this.mapRowToProviderEvent(r));
  }

  async listAll(): Promise<ProviderEventRecord[]> {
    const res = await this.client.query(
      `SELECT * FROM provider_events ORDER BY received_at DESC`
    );
    return res.rows.map((r: any) => this.mapRowToProviderEvent(r));
  }

  private mapRowToProviderEvent(row: any): ProviderEventRecord {
    let parsedPayload: any = {};
    if (row.payload) {
      if (typeof row.payload === 'string') {
        try {
          parsedPayload = JSON.parse(row.payload);
        } catch {
          parsedPayload = { raw: row.payload };
        }
      } else {
        parsedPayload = row.payload;
      }
    }

    return {
      id: row.id,
      provider: row.provider,
      providerEventId: row.provider_event_id,
      sourceEventId: row.source_event_id,
      eventType: row.event_type,
      providerStatus: row.provider_status,
      providerProposalId: row.provider_proposal_id,
      payload: parsedPayload,
      receivedAt: row.received_at instanceof Date ? row.received_at.toISOString() : String(row.received_at),
      processedAt: row.processed_at ? (row.processed_at instanceof Date ? row.processed_at.toISOString() : String(row.processed_at)) : null,
      processingStatus: row.processing_status,
    };
  }
}

export class PostgresReconciliationRepository implements IPaymentReconciliationRepository {
  constructor(private client: SqlQueryable) {}

  async create(record: PaymentReconciliationRecord): Promise<PaymentReconciliationRecord> {
    await this.client.query(
      `
      INSERT INTO payment_reconciliations (
        id, provider_event_id, external_payment_proposal_id, payment_intent_id,
        accommodation_responsibility_id, provider, provider_status, amount,
        currency, reconciliation_status, reason_code, reconciled_at, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `,
      [
        record.id,
        record.providerEventId,
        record.externalPaymentProposalId || null,
        record.paymentIntentId || null,
        record.accommodationResponsibilityId || null,
        record.provider,
        record.providerStatus,
        record.amount,
        record.currency,
        record.reconciliationStatus,
        record.reasonCode,
        record.reconciledAt || null,
        record.createdAt || new Date().toISOString(),
      ]
    );
    return record;
  }

  async findByProviderEventId(provider: string, providerEventId: string): Promise<PaymentReconciliationRecord | null> {
    // Return VERIFIED record if present, else return the latest attempt
    const res = await this.client.query(
      `SELECT * FROM payment_reconciliations 
       WHERE provider = $1 AND provider_event_id = $2 
       ORDER BY CASE WHEN reconciliation_status = 'VERIFIED' THEN 1 ELSE 2 END ASC, created_at DESC 
       LIMIT 1`,
      [provider, providerEventId]
    );
    if (res.rows.length === 0) return null;
    return this.mapRowToReconciliation(res.rows[0]);
  }

  async findVerifiedByProviderEventId(provider: string, providerEventId: string): Promise<PaymentReconciliationRecord | null> {
    const res = await this.client.query(
      `SELECT * FROM payment_reconciliations 
       WHERE provider = $1 AND provider_event_id = $2 AND reconciliation_status = 'VERIFIED' 
       LIMIT 1`,
      [provider, providerEventId]
    );
    if (res.rows.length === 0) return null;
    return this.mapRowToReconciliation(res.rows[0]);
  }

  async listByProviderEventId(provider: string, providerEventId: string): Promise<PaymentReconciliationRecord[]> {
    const res = await this.client.query(
      `SELECT * FROM payment_reconciliations 
       WHERE provider = $1 AND provider_event_id = $2 
       ORDER BY created_at ASC`,
      [provider, providerEventId]
    );
    return res.rows.map((r) => this.mapRowToReconciliation(r));
  }

  async findById(id: string): Promise<PaymentReconciliationRecord | null> {
    const res = await this.client.query(
      `SELECT * FROM payment_reconciliations WHERE id = $1`,
      [id]
    );
    if (res.rows.length === 0) return null;
    return this.mapRowToReconciliation(res.rows[0]);
  }

  async listByResponsibilityId(responsibilityId: string): Promise<PaymentReconciliationRecord[]> {
    const res = await this.client.query(
      `SELECT * FROM payment_reconciliations WHERE accommodation_responsibility_id = $1 ORDER BY created_at DESC`,
      [responsibilityId]
    );
    return res.rows.map((r) => this.mapRowToReconciliation(r));
  }

  async listAll(): Promise<PaymentReconciliationRecord[]> {
    const res = await this.client.query(
      `SELECT * FROM payment_reconciliations ORDER BY created_at DESC`
    );
    return res.rows.map((r) => this.mapRowToReconciliation(r));
  }

  private mapRowToReconciliation(row: any): PaymentReconciliationRecord {
    return {
      id: row.id,
      providerEventId: row.provider_event_id,
      externalPaymentProposalId: row.external_payment_proposal_id,
      paymentIntentId: row.payment_intent_id,
      accommodationResponsibilityId: row.accommodation_responsibility_id,
      provider: row.provider,
      providerStatus: row.provider_status,
      amount: Number(row.amount),
      currency: row.currency,
      reconciliationStatus: row.reconciliation_status,
      reasonCode: row.reason_code,
      reconciledAt: row.reconciled_at ? (row.reconciled_at instanceof Date ? row.reconciled_at.toISOString() : String(row.reconciled_at)) : null,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    };
  }
}

/**
 * Top-level PostgreSQL Repositories Coordinator
 */
export class PostgresRepositories implements IHut4DevsRepositories {
  accommodation: IAccommodationRepository;
  intents: IPaymentIntentRepository;
  proposals: IExternalProposalRepository;
  outbox: IOutboxRepository;
  members: IMemberRepository;
  sessions: ISessionRepository;
  providerEvents: IProviderEventRepository;
  reconciliations: IPaymentReconciliationRepository;

  constructor(private poolOrClient: Pool | PoolClient | SqlQueryable) {
    this.accommodation = new PostgresAccommodationRepository(this.poolOrClient);
    this.intents = new PostgresPaymentIntentRepository(this.poolOrClient);
    this.proposals = new PostgresExternalProposalRepository(this.poolOrClient);
    this.outbox = new PostgresOutboxRepository(this.poolOrClient);
    this.members = new PostgresMemberRepository(this.poolOrClient);
    this.sessions = new PostgresSessionRepository(this.poolOrClient);
    this.providerEvents = new PostgresProviderEventRepository(this.poolOrClient);
    this.reconciliations = new PostgresReconciliationRepository(this.poolOrClient);
  }

  async runInTransaction<T>(fn: (repos: IHut4DevsRepositories) => Promise<T>): Promise<T> {
    // If poolOrClient has connect (i.e. is a Pool), acquire a client
    if ('connect' in this.poolOrClient && typeof (this.poolOrClient as Pool).connect === 'function') {
      const client = await (this.poolOrClient as Pool).connect();
      try {
        await client.query('BEGIN');
        const txRepos = new PostgresRepositories(client);
        const result = await fn(txRepos);
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      // Direct client (e.g. single connection or pg-mem adapter)
      const directClient = this.poolOrClient as SqlQueryable;
      await directClient.query('BEGIN');
      try {
        const txRepos = new PostgresRepositories(directClient);
        const result = await fn(txRepos);
        await directClient.query('COMMIT');
        return result;
      } catch (err) {
        await directClient.query('ROLLBACK');
        throw err;
      }
    }
  }
}
