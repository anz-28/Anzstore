import crypto from 'crypto';
import { NextResponse } from 'next/server';

const ADMIN_COOKIE = 'admin-token';
const ADMIN_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const SECURITY_SECRET =
  process.env.ADMIN_AUTH_SECRET ||
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  'dev-only-change-this-secret';

function hmac(value) {
  return crypto.createHmac('sha256', SECURITY_SECRET).update(value).digest('base64url');
}

function safeCompare(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function createAdminToken({ id, username }) {
  const payload = {
    id,
    username,
    exp: Date.now() + ADMIN_TOKEN_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = hmac(encoded);
  return `${encoded}.${signature}`;
}

export function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;

  const expected = hmac(encoded);
  if (!safeCompare(signature, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!payload?.id || !payload?.username || !payload?.exp) return null;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getAdminSession(request) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  return verifyAdminToken(token);
}

export function requireAdmin(request) {
  const session = getAdminSession(request);
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { ok: true, session };
}

export function isSameOriginRequest(request) {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'http';

  if (!host) return false;
  const expectedOrigin = `${proto}://${host}`;

  if (origin) return origin === expectedOrigin;
  if (referer) return referer.startsWith(expectedOrigin);
  return false;
}

export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400,
    path: '/',
  };
}
