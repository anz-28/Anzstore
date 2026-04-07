'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DollarSign, ShoppingCart, Package, Clock3, ArrowUpRight } from 'lucide-react';
import styles from './Dashboard.module.css';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics').then(r => r.json()),
      fetch('/api/orders?status=all').then(r => r.json()),
    ]).then(([analyticsData, ordersData]) => {
      setAnalytics(analyticsData);
      setOrders(ordersData.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Dashboard</h1>
        <div className={styles.statsGrid}>
          {[1,2,3,4].map(i => <div key={i} className={`${styles.statCard} skeleton`} style={{height: 120}} />)}
        </div>
      </div>
    );
  }

  const statusBadge = (status) => {
    const map = {
      pending: 'badge-warning',
      processing: 'badge-info',
      shipped: 'badge-info',
      delivered: 'badge-success',
      cancelled: 'badge-danger',
    };
    return map[status] || 'badge-default';
  };

  const activePipeline = orders.filter(order => ['pending', 'processing'].includes(order.status)).length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>ANZ LAB Dashboard</h1>
        <p className={styles.subtitle}>Live overview of your service operations and sales activity.</p>
      </div>

      <div className={styles.quickGrid}>
        <Link href="/admin/orders" className={styles.quickCard}>
          <span className={styles.quickTitle}>Manage Orders</span>
          <span className={styles.quickMeta}>Review pending and processing requests</span>
        </Link>
        <Link href="/admin/products" className={styles.quickCard}>
          <span className={styles.quickTitle}>Manage Services</span>
          <span className={styles.quickMeta}>Update pricing and featured entries</span>
        </Link>
        <Link href="/admin/analytics" className={styles.quickCard}>
          <span className={styles.quickTitle}>View Analytics</span>
          <span className={styles.quickMeta}>Track trends and performance metrics</span>
        </Link>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--success-dim)', color: 'var(--success)' }}>
            <DollarSign size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Revenue</span>
            <span className={styles.statValue}>${analytics?.revenue?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--accent-cool-dim)', color: 'var(--accent-cool)' }}>
            <ShoppingCart size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Orders</span>
            <span className={styles.statValue}>{analytics?.totalOrders || 0}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--accent-secondary-dim)', color: 'var(--accent-secondary)' }}>
            <Clock3 size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Active Pipeline</span>
            <span className={styles.statValue}>{activePipeline}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--warning-dim)', color: 'var(--warning)' }}>
            <Package size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Services</span>
            <span className={styles.statValue}>{analytics?.totalProducts || 0}</span>
          </div>
        </div>
      </div>

      <div className={styles.grid2col}>
        {/* Recent Orders */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Recent Orders</h2>
            <Link href="/admin/orders" className={styles.viewAll}>View All <ArrowUpRight size={14} /></Link>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="mono" style={{fontSize: 12}}>#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td>{order.customer_name}</td>
                    <td className="mono">${order.total.toFixed(2)}</td>
                    <td><span className={`badge ${statusBadge(order.status)}`}>{order.status}</span></td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-dim)' }}>No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Services */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Top Services</h2>
            <Link href="/admin/products" className={styles.viewAll}>View All <ArrowUpRight size={14} /></Link>
          </div>
          {analytics?.topProducts?.length > 0 ? (
            <div className={styles.topList}>
              {analytics.topProducts.map((product, i) => (
                <div key={i} className={styles.topItem}>
                  <span className={styles.topRank}>#{i + 1}</span>
                  <div className={styles.topInfo}>
                    <span className={styles.topName}>{product.product_name}</span>
                    <span className={styles.topMeta}>{product.total_sold} booked · ${product.revenue?.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>No sales data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
