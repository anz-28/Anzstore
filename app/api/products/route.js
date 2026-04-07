import { NextResponse } from 'next/server';
import { requireAdmin, isSameOriginRequest } from '@/lib/security';

export async function GET(request) {
  try {
    console.log('[API/products] Database URL exists:', !!process.env.DATABASE_URL);
    console.log('[API/products] Node env:', process.env.NODE_ENV);
    
    const { getAllProducts } = require('@/lib/db');
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const search = searchParams.get('search') || '';
    const featured = searchParams.get('featured') === 'true';

    console.log('[API/products] Fetching products with filters:', { category, search, featured });
    const products = await getAllProducts({ category, search, featured });
    console.log('[API/products] Successfully fetched', products.length, 'products');
    return NextResponse.json(products);
  } catch (error) {
    console.error('[API/products] Error:', error.message, error.stack);
    return NextResponse.json({ 
      error: 'Failed to fetch products',
      details: error.message,
      dbUrl: process.env.DATABASE_URL ? 'configured' : 'missing'
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = requireAdmin(request);
    if (!auth.ok) return auth.response;
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
    }

    const { createProduct } = require('@/lib/db');
    const body = await request.json();

    if (!body.name || !body.price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    const product = await createProduct({
      name: body.name,
      description: body.description || '',
      price: parseFloat(body.price),
      image: body.image || null,
      category: body.category || 'general',
      stock: parseInt(body.stock) || 0,
      featured: !!body.featured,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
