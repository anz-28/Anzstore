import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/security';

export async function GET(request) {
  try {
    const session = getAdminSession(request);
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, username: session.username });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
