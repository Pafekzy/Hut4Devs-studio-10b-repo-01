import http from 'http';
import { Member, MemberRole, Session } from '../../domain/auth';
import { IHut4DevsRepositories } from '../../domain/repositories';

/**
 * Hut4Devs Authentication & Role Authorization Service (H4D-FUNC-011)
 *
 * Strict separation:
 * Identity -> Authenticated Session -> Hut4Devs Member -> Role / Permission -> Authorized Operation
 *
 * All authorization is enforced server-side.
 */

/**
 * Extracts session token from HTTP request across:
 * 1. Authorization header ("Bearer <token>")
 * 2. Cookie header ("h4d_session=<token>")
 * 3. URL query parameter ("?token=<token>" - essential for browser EventSource / SSE)
 */
export function extractSessionToken(req: http.IncomingMessage): string | null {
  // 1. Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  if (authHeader && typeof authHeader === 'string') {
    const parts = authHeader.trim().split(' ');
    if (parts.length === 2 && /^bearer$/i.test(parts[0])) {
      return parts[1];
    }
  }

  // 2. Cookie: h4d_session=<token>
  const cookieHeader = req.headers['cookie'];
  if (cookieHeader && typeof cookieHeader === 'string') {
    const cookies = cookieHeader.split(';');
    for (const c of cookies) {
      const [k, v] = c.trim().split('=');
      if (k === 'h4d_session' && v) {
        return decodeURIComponent(v);
      }
    }
  }

  // 3. Query string: ?token=<token>
  if (req.url) {
    try {
      const parsedUrl = new URL(req.url, 'http://localhost');
      const token = parsedUrl.searchParams.get('token');
      if (token) {
        return token;
      }
    } catch {
      // Ignore URL parse failures
    }
  }

  return null;
}

/**
 * Authenticates request against PostgreSQL sessions repository.
 * Returns authenticated Member, or null if unauthenticated / expired.
 */
export async function authenticateRequest(
  req: http.IncomingMessage,
  repos: IHut4DevsRepositories
): Promise<Member | null> {
  const token = extractSessionToken(req);
  if (!token) {
    return null;
  }

  const session = await repos.sessions.findByToken(token);
  if (!session) {
    return null;
  }

  // Check expiration
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    return null;
  }

  return session.member;
}

export interface RoleCheckResult {
  authorized: boolean;
  status: number;
  error: string;
}

/**
 * Enforces role authorization server-side.
 * Returns 401 if unauthenticated, 403 if authenticated but lacking required role.
 */
export function requireRole(
  member: Member | null,
  requiredRole: MemberRole
): RoleCheckResult {
  if (!member) {
    return {
      authorized: false,
      status: 401,
      error: 'Unauthorized: Authentication required. No valid session provided.',
    };
  }

  if (!member.roles.includes(requiredRole)) {
    return {
      authorized: false,
      status: 403,
      error: `Forbidden: Member '${member.displayName}' lacks required role '${requiredRole}'.`,
    };
  }

  return {
    authorized: true,
    status: 200,
    error: '',
  };
}

/**
 * Deterministic Development Auth identities
 */
export const DEV_IDENTITIES = [
  {
    memberId: 'member-fellow-current',
    displayName: 'Current Fellow (Emmanuel)',
    email: 'fellow@infinitegrace.local',
    role: MemberRole.FELLOW,
    token: 'dev-session-token-fellow',
  },
  {
    memberId: 'member-admin-current',
    displayName: 'Accommodation Financial Admin (Amara Nwosu)',
    email: 'admin@infinitegrace.local',
    role: MemberRole.ACCOMMODATION_ADMIN,
    token: 'dev-session-token-admin',
  },
  {
    memberId: 'member-chinedu-captain',
    displayName: 'Room Captain — Room 304 (Chinedu Okeke)',
    email: 'chinedu@infinitegrace.local',
    role: MemberRole.ROOM_CAPTAIN,
    token: 'dev-session-token-captain',
  },
  {
    memberId: 'member-coordinator-current',
    displayName: 'Accommodation Fellows Coordinator (Emmanuel Ukom)',
    email: 'coordinator@hut4devs.local',
    role: MemberRole.ACCOMMODATION_FELLOWS_COORDINATOR,
    token: 'dev-session-token-coordinator',
  },
  {
    memberId: 'member-welfare-mediation-officer',
    displayName: 'Accommodation Welfare & Mediation Officer (Arc. Olumide Adeleke)',
    email: 'mediation@hut4devs.local',
    role: MemberRole.ACCOMMODATION_WELFARE_OFFICER,
    token: 'dev-session-token-welfare',
  },
];

/**
 * Creates or activates a server-recognized development session.
 */
export async function createDevelopmentSession(
  repos: IHut4DevsRepositories,
  target: { role?: string; memberId?: string }
): Promise<Session> {
  let matched = DEV_IDENTITIES[0]; // Default: Fellow

  if (
    target.role === MemberRole.ACCOMMODATION_ADMIN ||
    target.role === 'ACCOMMODATION_ADMIN' ||
    target.memberId === 'member-admin-current'
  ) {
    matched = DEV_IDENTITIES[1];
  } else if (
    target.role === MemberRole.ROOM_CAPTAIN ||
    target.role === 'ROOM_CAPTAIN' ||
    target.memberId === 'member-chinedu-captain'
  ) {
    matched = DEV_IDENTITIES[2];
  } else if (
    target.role === MemberRole.ACCOMMODATION_FELLOWS_COORDINATOR ||
    target.role === 'ACCOMMODATION_FELLOWS_COORDINATOR' ||
    target.memberId === 'member-coordinator-current'
  ) {
    matched = DEV_IDENTITIES[3];
  } else if (
    target.role === MemberRole.ACCOMMODATION_WELFARE_OFFICER ||
    target.role === 'ACCOMMODATION_WELFARE_OFFICER' ||
    target.memberId === 'member-welfare-mediation-officer'
  ) {
    matched = DEV_IDENTITIES[4];
  } else if (
    target.role === MemberRole.FELLOW ||
    target.role === 'FELLOW' ||
    target.memberId === 'member-fellow-current'
  ) {
    matched = DEV_IDENTITIES[0];
  }

  const member = await repos.members.findById(matched.memberId);
  if (!member) {
    throw new Error(`Development member '${matched.memberId}' not found in database.`);
  }

  const oneYearExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  const session: Session = {
    id: `session-dev-${matched.role.toLowerCase()}`,
    token: matched.token,
    memberId: member.id,
    member,
    createdAt: new Date().toISOString(),
    expiresAt: oneYearExpiry,
  };

  await repos.sessions.create(session);
  return session;
}
