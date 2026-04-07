import { NextResponse } from 'next/server';
import { requireAdmin, isSameOriginRequest } from '@/lib/security';

export async function GET(request, { params }) {
  try {
    const auth = requireAdmin(request);
    if (!auth.ok) return auth.response;

    const { getOrderById } = require('@/lib/db');
    const { id } = await params;
    const order = await getOrderById(id);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = requireAdmin(request);
    if (!auth.ok) return auth.response;
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
    }

    const { updateOrderStatus } = require('@/lib/db');
    const { id } = await params;
    const body = await request.json();
    if (!body.status) return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    const order = await updateOrderStatus(id, body.status);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
