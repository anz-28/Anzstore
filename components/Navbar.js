'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Menu, X, Zap } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { totalItems, setIsOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          <Zap size={22} className={styles.logoIcon} />
          <span>ANZ</span>
          <span className={styles.logoAccent}>LAB</span>
        </Link>

        <div className={`${styles.links} ${mobileOpen ? styles.open : ''}`}>
          <Link href="/" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link href="/products" onClick={() => setMobileOpen(false)}>Services</Link>
        </div>

        <div className={styles.actions}>
          <button className={styles.cartBtn} onClick={() => setIsOpen(true)} id="cart-button">
            <ShoppingCart size={20} />
            {totalItems > 0 && <span className={styles.cartCount}>{totalItems}</span>}
          </button>
          <button className={styles.menuBtn} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
