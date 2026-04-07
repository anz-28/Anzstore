import { Suspense } from 'react';
import ProductsClient from './ProductsClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Services | ANZ LAB',
  description: 'Browse our full catalog of web development services.',
};

async function getProducts() {
  try {
    const { getAllProducts, getCategories } = require('@/lib/db');
    const products = await getAllProducts();
    const categories = await getCategories();
    return { products, categories };
  } catch {
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
