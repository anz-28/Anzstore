import HomePage from './HomeClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'ANZ LAB | Web Development Services',
  description: 'Custom web development services for startups, creators, and growing businesses.',
};

async function getProducts() {
  try {
    const { getAllProducts } = require('@/lib/db');
    return await getAllProducts({ featured: true });
  } catch {
    return [];
  }
}

export default async function Page() {
  const featuredProducts = await getProducts();
  return <HomePage featuredProducts={featuredProducts} />;
}
