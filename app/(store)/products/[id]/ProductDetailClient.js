'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import { ShoppingCart, ArrowLeft, Package, Check } from 'lucide-react';
import styles from './ProductDetail.module.css';

export default function ProductDetailClient({ product, relatedProducts }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <Link href="/products" className={styles.back}>
          <ArrowLeft size={18} /> Back to Services
        </Link>

        <div className={styles.main}>
          <div className={styles.imageSection}>
            <div className={styles.imageWrap}>
              {product.image ? (
                <img src={product.image} alt={product.name} className={styles.image} />
              ) : (
                <div className={styles.placeholder}><Package size={80} /></div>
              )}
            </div>
          </div>

          <div className={styles.info}>
            <span className={styles.category}>{product.category}</span>
            <h1 className={styles.name}>{product.name}</h1>
            <p className={styles.price}>${product.price.toFixed(2)}</p>
            <p className={styles.desc}>{product.description}</p>

            <div className={styles.stock}>
              {product.stock > 0 ? (
                <span className={styles.inStock}>
                  <Check size={14} /> In Stock ({product.stock} available)
                </span>
              ) : (
                <span className={styles.outStock}>Out of Stock</span>
              )}
            </div>

            {product.stock > 0 && (
              <div className={styles.actions}>
                <button className={`btn btn-primary btn-lg ${styles.addBtn}`} onClick={handleAdd} id="add-to-cart">
                  {added ? (
                    <><Check size={18} /> Added!</>
                  ) : (
                    <><ShoppingCart size={18} /> Add to Cart — ${product.price.toFixed(2)}</>
                  )}
                </button>
              </div>
            )}

            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Category</span>
                <span>{product.category}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>SKU</span>
                <span className="mono">{product.id.slice(0, 8).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className={styles.related}>
            <h2>Related Services</h2>
            <div className={styles.relatedGrid}>
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
