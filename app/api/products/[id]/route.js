import { NextResponse } from 'next/server';
import { requireAdmin, isSameOriginRequest } from '@/lib/security';

export async function GET(request, { params }) {
  try {
    const { getProductById } = require('@/lib/db');
    const { id } = await params;
    const product = getProductById(id);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = requireAdmin(request);
    if (!auth.ok) return auth.response;
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
    }

    const { updateProduct } = require('@/lib/db');
    const { id } = await params;
    const body = await request.json();
    const product = updateProduct(id, body);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = requireAdmin(request);
    if (!auth.ok) return auth.response;
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
    }

    const { deleteProduct } = require('@/lib/db');
    const { id } = await params;
    deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
