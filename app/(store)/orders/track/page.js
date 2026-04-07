'use client';

import { useState } from 'react';
import { Search, Package, Truck, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import styles from './Track.module.css';

const statusConfig = {
  pending: { icon: Clock, color: 'var(--warning)', label: 'Pending', step: 1 },
  processing: { icon: Loader2, color: 'var(--accent-cool)', label: 'Processing', step: 2 },
  shipped: { icon: Truck, color: 'var(--accent-purple)', label: 'Shipped', step: 3 },
  delivered: { icon: CheckCircle, color: 'var(--success)', label: 'Delivered', step: 4 },
  cancelled: { icon: XCircle, color: 'var(--danger)', label: 'Cancelled', step: 0 },
};

export default function TrackOrderPage() {
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/${query.trim()}`);
      if (!res.ok) {
        setError('Order not found. Please check your order ID.');
        return;
      }
      const data = await res.json();
      setOrder(data);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setOrder(data);
      } else {
        alert(data.error || 'Cannot cancel this order.');
      }
    } catch {
      alert('Something went wrong.');
    } finally {
      setCancelling(false);
    }
  };

  const status = order ? statusConfig[order.status] : null;
  const canCancel = order && ['pending', 'processing'].includes(order.status);

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.tag}>ORDER TRACKING</span>
          <h1>Track Your Order</h1>
          <p>Enter your order ID to check the current status</p>
        </div>

        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchWrap}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Enter order ID..."
              className={`input ${styles.searchInput}`}
              value={query}
              onChange={e => setQuery(e.target.value)}
              id="order-search"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {error && <div className={styles.error}>{error}</div>}

        {order && (
          <div className={styles.result}>
            <div className={styles.statusCard}>
              <div className={styles.statusHeader}>
                <div>
                  <span className={styles.orderId}>Order #{order.id.slice(0, 8).toUpperCase()}</span>
                  <span className={`badge ${order.status === 'cancelled' ? 'badge-danger' : order.status === 'delivered' ? 'badge-success' : 'badge-info'}`}>
                    {status.label}
                  </span>
                </div>
                <span className={styles.date}>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>

              {order.status !== 'cancelled' && (
                <div className={styles.progress}>
                  {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, i) => (
                    <div key={step} className={`${styles.step} ${i + 1 <= status.step ? styles.active : ''}`}>
                      <div className={styles.stepDot} />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.details}>
                <div className={styles.detailRow}>
                  <span>Customer</span>
                  <span>{order.customer_name}</span>
                </div>
                <div className={styles.detailRow}>
                  <span>Email</span>
                  <span>{order.customer_email}</span>
                </div>
                <div className={styles.detailRow}>
                  <span>Total</span>
                  <span className="mono">${order.total.toFixed(2)}</span>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className={styles.items}>
                  <h4>Items</h4>
                  {order.items.map(item => (
                    <div key={item.id} className={styles.item}>
                      <span>{item.product_name}</span>
                      <span className="mono">x{item.quantity} — ${(item.price_at_time * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {canCancel && (
                <div className={styles.cancelSection}>
                  <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling} id="cancel-order">
                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
