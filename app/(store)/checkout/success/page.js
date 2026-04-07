'use client';

import Link from 'next/link';
import { CircleAlert, ArrowRight } from 'lucide-react';
import styles from './Success.module.css';

export default function CheckoutSuccessPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.card} role="alert" aria-live="polite">
          <div className={styles.iconWrap}>
            <CircleAlert size={58} strokeWidth={1.5} />
          </div>
          <h1>Store Temporarily Closed</h1>
          <p>Stripe payments are not set up right now, so checkout is disabled.</p>
          <p className={styles.sub}>ANZ is currently closing the store temporarily and will be back soon.</p>
          <div className={styles.actions}>
            <Link href="/" className="btn btn-primary btn-lg">
              Return Home <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
