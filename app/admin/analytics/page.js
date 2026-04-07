'use client';

import { useEffect, useState, useRef } from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import styles from './Analytics.module.css';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?days=${days}`)
      .then(r => r.json())
      .then(setAnalytics)
      .finally(() => setLoading(false));
  }, [days]);

  useEffect(() => {
    if (!analytics?.revenueByDay?.length || !canvasRef.current) return;

    // Simple canvas chart
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const data = analytics.revenueByDay;
    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const rootStyles = getComputedStyle(document.documentElement);
    const accentPrimary = rootStyles.getPropertyValue('--accent-primary').trim() || '#7c3aed';
    const accentMuted = rootStyles.getPropertyValue('--accent-muted').trim() || 'rgba(124, 58, 237, 0.15)';
    const textMuted = rootStyles.getPropertyValue('--text-muted').trim() || '#5d5775';
    const borderSubtle = rootStyles.getPropertyValue('--border-subtle').trim() || 'rgba(124, 58, 237, 0.1)';
    const bgPrimary = rootStyles.getPropertyValue('--bg-primary').trim() || '#000000';

    const maxVal = Math.max(...data.map(d => d.revenue), 1);
    const stepX = chartW / Math.max(data.length - 1, 1);

    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = borderSubtle;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = textMuted;
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText('$' + Math.round(maxVal * (1 - i / 4)), padding.left - 8, y + 4);
    }

    // Area fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, accentMuted);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.beginPath();
    ctx.moveTo(padding.left, height - padding.bottom);
    data.forEach((d, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + chartH * (1 - d.revenue / maxVal);
      if (i === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(padding.left + (data.length - 1) * stepX, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = accentPrimary;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    data.forEach((d, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + chartH * (1 - d.revenue / maxVal);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Dots
    data.forEach((d, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + chartH * (1 - d.revenue / maxVal);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = accentPrimary;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = bgPrimary;
      ctx.fill();
    });

    // X labels
    ctx.fillStyle = textMuted;
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    data.forEach((d, i) => {
      if (data.length <= 10 || i % Math.ceil(data.length / 8) === 0) {
        const x = padding.left + i * stepX;
        const label = new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' });
        ctx.fillText(label, x, height - padding.bottom + 24);
      }
    });
  }, [analytics]);

  if (loading) {
    return (
      <div className={styles.page}>
        <h1>Analytics</h1>
        <div className="skeleton" style={{ height: 400, borderRadius: 16, marginTop: 24 }} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Analytics</h1>
          <p>Revenue and order insights</p>
        </div>
        <div className={styles.periodBtns}>
          {[7, 14, 30, 90].map(d => (
            <button key={d} className={`${styles.periodBtn} ${days === d ? styles.active : ''}`} onClick={() => setDays(d)}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <DollarSign size={18} />
          <div>
            <span className={styles.statVal}>${analytics?.revenue?.toFixed(2) || '0'}</span>
            <span className={styles.statLbl}>Revenue</span>
          </div>
        </div>
        <div className={styles.stat}>
          <ShoppingCart size={18} />
          <div>
            <span className={styles.statVal}>{analytics?.totalOrders || 0}</span>
            <span className={styles.statLbl}>Orders</span>
          </div>
        </div>
        <div className={styles.stat}>
          <TrendingUp size={18} />
          <div>
            <span className={styles.statVal}>${analytics?.avgOrderValue?.toFixed(2) || '0'}</span>
            <span className={styles.statLbl}>Avg Order</span>
          </div>
        </div>
        <div className={styles.stat}>
          <BarChart3 size={18} />
          <div>
            <span className={styles.statVal}>{analytics?.completedOrders || 0}</span>
            <span className={styles.statLbl}>Completed</span>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className={styles.chartPanel}>
        <h3>Revenue Over Time</h3>
        {analytics?.revenueByDay?.length > 0 ? (
          <div className={styles.chartWrap}>
            <canvas ref={canvasRef} className={styles.canvas} />
          </div>
        ) : (
          <div className={styles.noData}>No revenue data for this period</div>
        )}
      </div>

      <div className={styles.grid2col}>
        {/* Top Products */}
        <div className={styles.panel}>
          <h3>Top Selling Products</h3>
          {analytics?.topProducts?.length > 0 ? (
            <div className={styles.list}>
              {analytics.topProducts.map((p, i) => (
                <div key={i} className={styles.listItem}>
                  <div className={styles.listRank}>#{i + 1}</div>
                  <div className={styles.listInfo}>
                    <span className={styles.listName}>{p.product_name}</span>
                    <span className={styles.listMeta}>{p.total_sold} units · ${p.revenue?.toFixed(2)}</span>
                  </div>
                  <div className={styles.listBar}>
                    <div style={{ width: `${(p.total_sold / analytics.topProducts[0].total_sold) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noData}>No sales data</div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className={styles.panel}>
          <h3>Category Breakdown</h3>
          {analytics?.categoryBreakdown?.length > 0 ? (
            <div className={styles.list}>
              {analytics.categoryBreakdown.map((c, i) => (
                <div key={i} className={styles.listItem}>
                  <div className={styles.catDot} />
                  <div className={styles.listInfo}>
                    <span className={styles.listName} style={{textTransform: 'capitalize'}}>{c.category}</span>
                    <span className={styles.listMeta}>{c.orders} orders · ${c.revenue?.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noData}>No category data</div>
          )}
        </div>
      </div>
    </div>
  );
}
