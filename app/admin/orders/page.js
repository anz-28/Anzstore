'use client';

import { useEffect, useState } from 'react';
import { Search, Eye, XCircle, ChevronDown } from 'lucide-react';
import styles from './Orders.module.css';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = () => {
    fetch(`/api/orders?status=${statusFilter}`).then(r => r.json()).then(setOrders).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const updateStatus = async (orderId, newStatus) => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchOrders();
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }
  };

  const cancelOrder = async (orderId) => {
    if (!confirm('Cancel this order? Stock will be restored.')) return;
    await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' });
    fetchOrders();
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: 'cancelled' }));
    }
  };

  const viewOrder = async (orderId) => {
    const res = await fetch(`/api/orders/${orderId}`);
    const data = await res.json();
    setSelectedOrder(data);
  };

  const statusBadge = (status) => {
    const map = { pending: 'badge-warning', processing: 'badge-info', shipped: 'badge-info', delivered: 'badge-success', cancelled: 'badge-danger' };
    return map[status] || 'badge-default';
  };

  const nextStatus = { pending: 'processing', processing: 'shipped', shipped: 'delivered' };

  const filtered = orders.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return o.customer_name.toLowerCase().includes(q) || o.customer_email.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Orders</h1>
          <p>{orders.length} total orders</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input type="text" placeholder="Search orders..." className={`input ${styles.searchInput}`} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.statusFilters}>
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button key={s} className={`${styles.filterBtn} ${statusFilter === s ? styles.active : ''}`} onClick={() => setStatusFilter(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Email</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => (
              <tr key={order.id}>
                <td className="mono" style={{fontSize: 12}}>#{order.id.slice(0, 8).toUpperCase()}</td>
                <td style={{fontWeight: 500}}>{order.customer_name}</td>
                <td style={{color: 'var(--text-secondary)', fontSize: 13}}>{order.customer_email}</td>
                <td className="mono" style={{fontWeight: 600}}>${order.total.toFixed(2)}</td>
                <td><span className={`badge ${statusBadge(order.status)}`}>{order.status}</span></td>
                <td style={{fontSize: 13, color: 'var(--text-secondary)'}}>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actionBtns}>
                    <button className="btn btn-ghost btn-sm" onClick={() => viewOrder(order.id)} title="View"><Eye size={14} /></button>
                    {nextStatus[order.status] && (
                      <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(order.id, nextStatus[order.status])}>
                        → {nextStatus[order.status]}
                      </button>
                    )}
                    {['pending', 'processing'].includes(order.status) && (
                      <button className="btn btn-ghost btn-sm" onClick={() => cancelOrder(order.id)} style={{color: 'var(--danger)'}} title="Cancel"><XCircle size={14} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedOrder(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Order #{selectedOrder.id.slice(0, 8).toUpperCase()}</h2>
              <button onClick={() => setSelectedOrder(null)} className="btn btn-ghost btn-icon"><XCircle size={20} /></button>
            </div>
            <div className="modal-body">
              <div className={styles.detailGrid}>
                <div className={styles.detailLabel}>Customer</div>
                <div>{selectedOrder.customer_name}</div>
                <div className={styles.detailLabel}>Email</div>
                <div>{selectedOrder.customer_email}</div>
                <div className={styles.detailLabel}>Status</div>
                <div><span className={`badge ${statusBadge(selectedOrder.status)}`}>{selectedOrder.status}</span></div>
                <div className={styles.detailLabel}>Total</div>
                <div className="mono" style={{fontWeight: 700, fontSize: 18}}>${selectedOrder.total.toFixed(2)}</div>
                <div className={styles.detailLabel}>Date</div>
                <div>{new Date(selectedOrder.created_at).toLocaleString()}</div>
              </div>

              {selectedOrder.items?.length > 0 && (
                <div className={styles.orderItems}>
                  <h4>Items</h4>
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className={styles.orderItem}>
                      <span>{item.product_name}</span>
                      <span className="mono">x{item.quantity} — ${(item.price_at_time * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
