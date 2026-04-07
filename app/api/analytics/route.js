import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/security';

export async function GET(request) {
  try {
    const auth = requireAdmin(request);
    if (!auth.ok) return auth.response;

    const { getAnalytics } = require('@/lib/db');
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days')) || 30;
    const analytics = getAnalytics(days);
    return NextResponse.json(analytics);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
