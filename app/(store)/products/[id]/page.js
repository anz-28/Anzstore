import ProductDetailClient from './ProductDetailClient';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { getProductById } = require('@/lib/db');
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: `${product.name} | ANZ LAB`,
    description: product.description,
  };
}

export default async function ProductPage({ params }) {
  const { getProductById, getAllProducts } = require('@/lib/db');
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();
  
  const related = getAllProducts({ category: product.category })
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  return <ProductDetailClient product={product} relatedProducts={related} />;
}
