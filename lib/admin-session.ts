import { createHmac, timingSafeEqual } from 'crypto';

export const ADMIN_SESSION_COOKIE = 'admin_session';

const MAX_AGE_SEC = 60 * 60 * 24 * 7;

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || 'dev-only-change-in-production';
}

export function createSessionToken(): string {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const payload = Buffer.from(JSON.stringify({ exp }), 'utf8').toString(
    'base64url',
  );
  const sig = createHmac('sha256', getSecret())
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token || !token.includes('.')) return false;
  const dot = token.indexOf('.');
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac('sha256', getSecret())
    .update(payload)
    .digest('base64url');
  try {
    const a = Buffer.from(sig, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    if (a.length !== b.length) return false;
    if (!timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  try {
    const data = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as { exp?: number };
    if (typeof data.exp !== 'number') return false;
    if (data.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

export function getAdminCredentials(): { email: string; password: string } {
  return {
    email: process.env.ADMIN_EMAIL || 'admin@imran.com',
    password: process.env.ADMIN_PASSWORD || '1234asdf',
  };
}
