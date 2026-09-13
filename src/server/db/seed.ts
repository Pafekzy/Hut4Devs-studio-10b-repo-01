import { SqlQueryable } from './migrator';
import { DEMO_ACCOMMODATION_RESPONSIBILITY } from '../../data/demoAccommodation';

/**
 * Deterministic Development Seed (H4D-FUNC-008)
 *
 * Seeds:
 * - Property: Infinite Grace Apartments
 * - Floor: Floor 3
 * - Room: Room 3B
 * - Fellow: Current Fellow
 * - Responsibility: September Accommodation
 * - Required Amount: ₦66,000
 * - Verified Amount: ₦0
 * - Status: Outstanding
 *
 * Does not generate large random fake datasets.
 */
export async function seedDevelopmentDatabase(client: SqlQueryable): Promise<void> {
  const resp = DEMO_ACCOMMODATION_RESPONSIBILITY;
  const ctx = resp.accommodationContext;

  await client.query(
    `
    INSERT INTO accommodation_responsibilities (
      id,
      fellow_id,
      title,
      required_amount,
      verified_amount,
      status,
      period,
      currency,
      property_id,
      property_name,
      property_address,
      floor_id,
      floor_name,
      floor_level,
      room_id,
      room_name,
      room_code,
      fellow_name,
      fellow_email,
      context_data
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
    ON CONFLICT (id) DO UPDATE SET
      required_amount = EXCLUDED.required_amount,
      verified_amount = EXCLUDED.verified_amount,
      status = EXCLUDED.status,
      period = EXCLUDED.period,
      currency = EXCLUDED.currency,
      context_data = EXCLUDED.context_data,
      updated_at = NOW()
    `,
    [
      resp.id,
      resp.fellowId,
      resp.title,
      resp.requiredAmount,
      resp.verifiedAmount,
      resp.status,
      resp.period || 'September 2026',
      resp.currency || 'NGN',
      ctx.property.id,
      ctx.property.name,
      ctx.property.address || null,
      ctx.floor.id,
      ctx.floor.name,
      ctx.floor.levelNumber || 3,
      ctx.room.id,
      ctx.room.name,
      ctx.room.code || null,
      resp.fellow.name,
      resp.fellow.email || null,
      JSON.stringify(ctx),
    ]
  );

  // Deterministic Members and Roles (H4D-FUNC-011)
  // 1. Current Fellow
  await client.query(
    `
    INSERT INTO members (id, display_name, email)
    VALUES ($1, $2, $3)
    ON CONFLICT (id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      email = EXCLUDED.email
    `,
    ['member-fellow-current', 'Current Fellow', 'fellow@infinitegrace.local']
  );

  await client.query(
    `
    INSERT INTO member_roles (id, member_id, role)
    VALUES ($1, $2, $3)
    ON CONFLICT (member_id, role) DO NOTHING
    `,
    ['role-fellow-current', 'member-fellow-current', 'FELLOW']
  );

  // 2. Accommodation Admin
  await client.query(
    `
    INSERT INTO members (id, display_name, email)
    VALUES ($1, $2, $3)
    ON CONFLICT (id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      email = EXCLUDED.email
    `,
    ['member-admin-current', 'Accommodation Admin', 'admin@infinitegrace.local']
  );

  await client.query(
    `
    INSERT INTO member_roles (id, member_id, role)
    VALUES ($1, $2, $3)
    ON CONFLICT (member_id, role) DO NOTHING
    `,
    ['role-admin-current', 'member-admin-current', 'ACCOMMODATION_ADMIN']
  );

  // 3. Room Captain (Chinedu Okeke - Room 304)
  await client.query(
    `
    INSERT INTO members (id, display_name, email)
    VALUES ($1, $2, $3)
    ON CONFLICT (id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      email = EXCLUDED.email
    `,
    ['member-chinedu-captain', 'Chinedu Okeke', 'chinedu@infinitegrace.local']
  );

  await client.query(
    `
    INSERT INTO member_roles (id, member_id, role)
    VALUES ($1, $2, $3)
    ON CONFLICT (member_id, role) DO NOTHING
    `,
    ['role-chinedu-fellow', 'member-chinedu-captain', 'FELLOW']
  );

  await client.query(
    `
    INSERT INTO member_roles (id, member_id, role)
    VALUES ($1, $2, $3)
    ON CONFLICT (member_id, role) DO NOTHING
    `,
    ['role-chinedu-captain', 'member-chinedu-captain', 'ROOM_CAPTAIN']
  );

  // 4. Accommodation Fellows Coordinator (Emmanuel Ukom)
  await client.query(
    `
    INSERT INTO members (id, display_name, email)
    VALUES ($1, $2, $3)
    ON CONFLICT (id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      email = EXCLUDED.email
    `,
    ['member-coordinator-current', 'Emmanuel Ukom', 'coordinator@hut4devs.local']
  );

  await client.query(
    `
    INSERT INTO member_roles (id, member_id, role)
    VALUES ($1, $2, $3)
    ON CONFLICT (member_id, role) DO NOTHING
    `,
    ['role-coordinator-fellow', 'member-coordinator-current', 'FELLOW']
  );

  await client.query(
    `
    INSERT INTO member_roles (id, member_id, role)
    VALUES ($1, $2, $3)
    ON CONFLICT (member_id, role) DO NOTHING
    `,
    ['role-coordinator-admin', 'member-coordinator-current', 'ACCOMMODATION_FELLOWS_COORDINATOR']
  );

  // 5. Accommodation Welfare & Mediation Officer (Arc. Olumide Adeleke)
  await client.query(
    `
    INSERT INTO members (id, display_name, email)
    VALUES ($1, $2, $3)
    ON CONFLICT (id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      email = EXCLUDED.email
    `,
    ['member-welfare-mediation-officer', 'Arc. Olumide Adeleke', 'mediation@hut4devs.local']
  );

  await client.query(
    `
    INSERT INTO member_roles (id, member_id, role)
    VALUES ($1, $2, $3)
    ON CONFLICT (member_id, role) DO NOTHING
    `,
    ['role-welfare-officer', 'member-welfare-mediation-officer', 'ACCOMMODATION_WELFARE_OFFICER']
  );

  // 6. Deterministic Development Sessions (valid for 1 year)
  const oneYearExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  await client.query(
    `
    INSERT INTO sessions (id, token, member_id, expires_at)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (token) DO UPDATE SET
      expires_at = EXCLUDED.expires_at
    `,
    ['session-dev-fellow', 'dev-session-token-fellow', 'member-fellow-current', oneYearExpiry]
  );

  await client.query(
    `
    INSERT INTO sessions (id, token, member_id, expires_at)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (token) DO UPDATE SET
      expires_at = EXCLUDED.expires_at
    `,
    ['session-dev-admin', 'dev-session-token-admin', 'member-admin-current', oneYearExpiry]
  );

  await client.query(
    `
    INSERT INTO sessions (id, token, member_id, expires_at)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (token) DO UPDATE SET
      expires_at = EXCLUDED.expires_at
    `,
    ['session-dev-captain', 'dev-session-token-captain', 'member-chinedu-captain', oneYearExpiry]
  );

  await client.query(
    `
    INSERT INTO sessions (id, token, member_id, expires_at)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (token) DO UPDATE SET
      expires_at = EXCLUDED.expires_at
    `,
    ['session-dev-coordinator', 'dev-session-token-coordinator', 'member-coordinator-current', oneYearExpiry]
  );

  await client.query(
    `
    INSERT INTO sessions (id, token, member_id, expires_at)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (token) DO UPDATE SET
      expires_at = EXCLUDED.expires_at
    `,
    ['session-dev-welfare', 'dev-session-token-welfare', 'member-welfare-mediation-officer', oneYearExpiry]
  );
}
