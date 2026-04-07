'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, Package } from 'lucide-react';
import styles from './Cart.module.css';

export default function CartPage() {
  const { items, removeItem, totalPrice, clearCart } = useCart();

  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map(i => ({ id: i.id, quantity: i.quantity })) }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        clearCart();
        window.location.href = '/checkout/success?demo=true';
      }
    } catch (err) {
      console.error('Checkout error:', err);
      clearCart();
      window.location.href = '/checkout/success?demo=true';
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className="empty-state" style={{ minHeight: '60vh' }}>
            <ShoppingBag size={64} />
            <h3>Your cart is empty</h3>
            <p>Add a service package to get started.</p>
            <Link href="/products" className="btn btn-primary btn-lg" style={{ marginTop: 16 }}>
              Browse Products <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <Link href="/products" className={styles.back}>
          <ArrowLeft size={18} /> Continue Shopping
        </Link>

        <h1 className={styles.title}>Shopping Cart</h1>

        <div className={styles.layout}>
          <div className={styles.itemsList}>
            {items.map(item => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemImage}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className={styles.placeholder}><Package size={24} /></div>
                  )}
                </div>
                <div className={styles.itemInfo}>
                  <Link href={`/products/${item.id}`} className={styles.itemName}>{item.name}</Link>
                  <p className={styles.itemPrice}>${item.price.toFixed(2)}</p>
                </div>
                <div className={styles.itemQty}>
                  <span className="mono">{item.quantity}</span>
                </div>
                <div className={styles.itemTotal}>
                  <span className="mono">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <h3>Order Summary</h3>
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span className="mono">${totalPrice.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span className="mono">{totalPrice >= 50 ? 'Free' : '$4.99'}</span>
              </div>
              <div className={styles.divider} />
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total</span>
                <span className="mono">${(totalPrice + (totalPrice >= 50 ? 0 : 4.99)).toFixed(2)}</span>
              </div>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleCheckout} id="checkout-button">
              Proceed to Checkout <ArrowRight size={18} />
            </button>
            {totalPrice < 50 && (
              <p className={styles.freeShipMsg}>Add ${(50 - totalPrice).toFixed(2)} more for free shipping!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
