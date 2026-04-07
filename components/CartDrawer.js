'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, totalPrice, totalItems } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={() => setIsOpen(false)} />
      <div className={styles.drawer}>
        <div className={styles.header}>
          <h2><ShoppingBag size={20} /> Cart ({totalItems})</h2>
          <button onClick={() => setIsOpen(false)} className={styles.closeBtn}><X size={22} /></button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <ShoppingBag size={48} />
            <p>Your cart is empty</p>
            <button className="btn btn-primary" onClick={() => setIsOpen(false)}>Continue Shopping</button>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {items.map(item => (
                <div key={item.id} className={styles.item}>
                  <div className={styles.itemImage}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className={styles.placeholder}><ShoppingBag size={20} /></div>
                    )}
                  </div>
                  <div className={styles.itemInfo}>
                    <h4>{item.name}</h4>
                    <p className="mono">${item.price.toFixed(2)}</p>
                    <div className={styles.qty}>
                      <span className="mono">{item.quantity}</span>
                    </div>
                  </div>
                  <button className={styles.removeBtn} onClick={() => removeItem(item.id)}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <div className={styles.total}>
                <span>Total</span>
                <span className="mono">${totalPrice.toFixed(2)}</span>
              </div>
              <Link href="/cart" onClick={() => setIsOpen(false)} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                View Cart <ArrowRight size={18} />
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
