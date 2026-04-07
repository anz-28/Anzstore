import { Suspense } from 'react';
import { headers } from 'next/headers';
import ProductsClient from './ProductsClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Services | ANZ LAB',
  description: 'Browse our full catalog of web development services.',
};

async function getProducts() {
  try {
    const h = await headers();
    const host = h.get('host');
    const proto = h.get('x-forwarded-proto') || 'https';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

    const productsRes = await fetch(`${baseUrl}/api/products`, { cache: 'no-store' });
    if (!productsRes.ok) {
      throw new Error(`Failed to fetch products: ${productsRes.status}`);
    }

    const products = await productsRes.json();
    const categories = Array.from(new Set(products.map((p) => p.category))).sort();
    return { products, categories };
  } catch (error) {
    console.error('Products page load failed:', error);
    return { products: [], categories: [] };
  }
}

export default async function ProductsPage() {
  const { products, categories } = await getProducts();
  return (
    <Suspense fallback={<div className="container" style={{padding: '100px 24px', textAlign: 'center'}}>Loading services...</div>}>
      <ProductsClient products={products} categories={categories} />
    </Suspense>
  );
}
