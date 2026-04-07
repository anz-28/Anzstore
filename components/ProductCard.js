'use client';

import Link from 'next/link';
import { ShoppingCart, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className={styles.card}
      data-aos="fade-up"
      data-aos-duration="650"
    >
      <div className={styles.imageWrap}>
        {product.image ? (
          <img src={product.image} alt={product.name} className={styles.image} />
        ) : (
          <div className={styles.placeholder}><Package size={40} /></div>
        )}
        {product.featured ? <span className={styles.featuredBadge}>Featured</span> : null}
        <button className={styles.quickAdd} onClick={handleAdd} title="Add to cart">
          <ShoppingCart size={18} />
        </button>
      </div>
      <div className={styles.info}>
        <span className={styles.category}>{product.category}</span>
        <h3 className={styles.name}>{product.name}</h3>
        <div className={styles.bottom}>
          <span className={styles.price}>${product.price.toFixed(2)}</span>
        </div>
      </div>
    </Link>
  );
}
