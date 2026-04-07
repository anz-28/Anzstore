import { NextResponse } from 'next/server';
import { createAdminToken, adminCookieOptions, getClientIp } from '@/lib/security';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const BLOCK_MS = 15 * 60 * 1000;
const loginAttempts = new Map();

function getAttemptKey(request, username) {
  return `${getClientIp(request)}:${String(username || '').toLowerCase()}`;
}

function isBlocked(key) {
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record) return false;
  if (record.blockedUntil && record.blockedUntil > now) return true;
  if (record.windowStart + WINDOW_MS < now) {
    loginAttempts.delete(key);
    return false;
  }
  return false;
}

function recordFailure(key) {
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record || record.windowStart + WINDOW_MS < now) {
    loginAttempts.set(key, { count: 1, windowStart: now, blockedUntil: 0 });
    return;
  }

  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_MS;
  }
  loginAttempts.set(key, record);
}

function clearFailures(key) {
  loginAttempts.delete(key);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;
    const key = getAttemptKey(request, username);

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    if (isBlocked(key)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const { getAdminByUsername } = require('@/lib/db');
    const bcrypt = require('bcryptjs');

    const admin = getAdminByUsername(username);
    if (!admin) {
      recordFailure(key);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      recordFailure(key);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    clearFailures(key);

    const token = createAdminToken({ id: admin.id, username: admin.username });

    const response = NextResponse.json({ success: true, username: admin.username });
    response.cookies.set('admin-token', token, adminCookieOptions());

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
