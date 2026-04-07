import { NextResponse } from 'next/server';
import { requireAdmin, isSameOriginRequest } from '@/lib/security';

export async function POST(request, { params }) {
  try {
    const auth = requireAdmin(request);
    if (!auth.ok) return auth.response;
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
    }

    const { cancelOrder, getOrderById } = require('@/lib/db');
    const { id } = await params;
    
    const order = await getOrderById(id);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    
    if (!['pending', 'processing'].includes(order.status)) {
      return NextResponse.json({ error: 'Order cannot be cancelled at this stage' }, { status: 400 });
    }

    const cancelled = await cancelOrder(id);
    return NextResponse.json(cancelled);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 });
  }
}
