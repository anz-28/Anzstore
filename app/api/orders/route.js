import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/security';

export async function GET(request) {
  try {
    const auth = requireAdmin(request);
    if (!auth.ok) return auth.response;

    const { getAllOrders } = require('@/lib/db');
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const orders = getAllOrders({ status });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
