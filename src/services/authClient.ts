import { Member, MemberRole } from '../domain/auth';

export interface DevIdentity {
  memberId: string;
  displayName: string;
  email: string;
  role: MemberRole;
  token: string;
}

export interface AuthSessionResponse {
  success: boolean;
  member?: Member;
  token?: string;
  mode?: string;
  notice?: string;
  error?: string;
}

const TOKEN_STORAGE_KEY = 'h4d_session_token';

export function getStoredSessionToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredSessionToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage restrictions
  }
}

export async function fetchCurrentSession(): Promise<AuthSessionResponse> {
  const token = getStoredSessionToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch('/api/auth/session', { headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'Unauthenticated.',
        mode: 'DEVELOPMENT',
      };
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: 'Auth service unreachable.',
      mode: 'DEVELOPMENT',
    };
  }
}

export async function establishDevSession(role: MemberRole | string): Promise<AuthSessionResponse> {
  try {
    const res = await fetch('/api/auth/dev-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'Failed to establish development session.',
      };
    }

    if (data.token) {
      setStoredSessionToken(data.token);
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: 'Could not connect to auth service.',
    };
  }
}

export async function logoutSession(): Promise<boolean> {
  const token = getStoredSessionToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    await fetch('/api/auth/logout', { method: 'POST', headers });
  } catch {
    // Ignore network error during logout
  }

  setStoredSessionToken(null);
  return true;
}

export async function fetchDevIdentities(): Promise<DevIdentity[]> {
  try {
    const res = await fetch('/api/auth/dev-identities');
    const data = await res.json().catch(() => ({}));
    if (res.ok && Array.isArray(data.identities)) {
      return data.identities;
    }
    return [];
  } catch {
    return [];
  }
}
