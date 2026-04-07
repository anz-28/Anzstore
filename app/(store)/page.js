import HomePage from './HomeClient';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'ANZ LAB | Web Development Services',
  description: 'Custom web development services for startups, creators, and growing businesses.',
};

async function getProducts() {
  try {
    const h = await headers();
    const host = h.get('host');
    const proto = h.get('x-forwarded-proto') || 'https';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

    const res = await fetch(`${baseUrl}/api/products?featured=true`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch featured products: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Home featured products load failed:', error);
    return [];
  }
}

export default async function Page() {
  const featuredProducts = await getProducts();
  return <HomePage featuredProducts={featuredProducts} />;
}
