import HomePage from './HomeClient';

export const metadata = {
  title: 'ANZ LAB | Web Development Services',
  description: 'Custom web development services for startups, creators, and growing businesses.',
};

async function getProducts() {
  try {
    const { getAllProducts } = require('@/lib/db');
    return getAllProducts({ featured: true });
  } catch {
    return [];
  }
}

export default async function Page() {
  const featuredProducts = await getProducts();
  return <HomePage featuredProducts={featuredProducts} />;
}
