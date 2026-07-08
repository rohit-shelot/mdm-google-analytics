import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, Package, ShoppingBag, Users, TrendingUp, ArrowUp, ExternalLink, Activity, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { trackPageView } from '../../lib/analytics';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ orders: 0, revenue: 0, users: 0, products: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackPageView('/admin');
    if (!authLoading && !isAdmin) navigate('/');
  }, [isAdmin, authLoading]);

  useEffect(() => {
    const fetchStats = async () => {
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        supabase.from('orders').select('total_amount, status, created_at'),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('products').select('id', { count: 'exact' }),
      ]);

      const orders = ordersRes.data || [];
      const revenue = orders.reduce((s, o) => s + (o.total_amount || 0), 0);

      setStats({
        orders: orders.length,
        revenue,
        users: usersRes.count || 0,
        products: productsRes.count || 0,
      });

      const { data: recent } = await supabase
        .from('orders')
        .select('*, profiles(username, email)')
        .order('created_at', { ascending: false })
        .limit(10);
      setRecentOrders(recent || []);
      setLoading(false);
    };
    if (isAdmin) fetchStats();
  }, [isAdmin]);

  const STAT_CARDS = [
    { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: '#6c63ff', bg: 'rgba(108,99,255,0.15)', change: '+12%' },
    { label: 'Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, color: '#00ff88', bg: 'rgba(0,255,136,0.15)', change: '+8.5%' },
    { label: 'Users', value: stats.users, icon: Users, color: '#00d4ff', bg: 'rgba(0,212,255,0.15)', change: '+24%' },
    { label: 'Products', value: stats.products, icon: Package, color: '#ff6b35', bg: 'rgba(255,107,53,0.15)', change: '+5' },
  ];

  const statusColors = { pending: 'status-pending', completed: 'status-completed', cancelled: 'status-cancelled' };

  if (authLoading || loading) return (
    <div className="loading-page"><div className="loading-spinner" /></div>
  );

  return (
    <div>
      <div className="admin-page-title">Dashboard</div>
      <p className="admin-page-subtitle">Welcome back! Here's what's happening with your store.</p>

      {/* Stat Cards */}
      <div className="stats-grid">
        {STAT_CARDS.map(card => (
          <div className="stat-card" key={card.label} id={`stat-card-${card.label.toLowerCase().replace(' ', '-')}`}>
            <div className="stat-card-header">
              <span className="stat-card-label">{card.label}</span>
              <div className="stat-icon" style={{ background: card.bg }}>
                <card.icon size={20} color={card.color} />
              </div>
            </div>
            <p className="stat-value" style={{ color: card.color }}>{card.value}</p>
            <div className="stat-change up">
              <ArrowUp size={12} /> {card.change} this month
            </div>
          </div>
        ))}
      </div>

      {/* Google Analytics Section */}
      <div className="ga-embed-section">
        <div className="ga-embed-header">
          <BarChart3 size={20} color="#fbbc04" />
          <span className="ga-embed-title">Google Analytics 4 — Live Reports</span>
          <div className="ga-logo">
            <span>GA4</span>
            <span>{GA_MEASUREMENT_ID}</span>
          </div>
          <a
            href={`https://analytics.google.com/analytics/web/`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            id="ga-open-btn"
            style={{ marginLeft: 'auto' }}
          >
            <ExternalLink size={14} /> Open GA4
          </a>
        </div>

        {/* GA4 Real-Time embed — requires Looker Studio or GA4 embed link */}
        <div style={{ padding: '24px', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
            {[
              { label: 'Active Users Now', value: '—', sub: 'Real-time via GA4', icon: Activity, color: '#00ff88' },
              { label: 'Sessions Today', value: '—', sub: 'Open GA4 for live data', icon: TrendingUp, color: '#6c63ff' },
              { label: 'Measurement ID', value: GA_MEASUREMENT_ID, sub: 'Currently tracking', icon: BarChart3, color: '#fbbc04' },
            ].map(item => (
              <div key={item.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', background: `${item.color}20`, border: `1px solid ${item.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <item.icon size={22} color={item.color} />
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</p>
                  <p style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: '1rem', color: item.color, wordBreak: 'break-all' }}>{item.value}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Looker Studio embed placeholder — user fills in their Looker Studio share URL */}
          <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <BarChart3 size={16} color="#fbbc04" />
              Looker Studio / GA4 Report Embed — Paste your shareable report URL below
            </div>
            <div className="ga-placeholder" id="ga-embed-placeholder">
              <div className="ga-placeholder-icon">📊</div>
              <p style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: 8 }}>
                Connect Your GA4 Dashboard
              </p>
              <p style={{ fontSize: '0.88rem', maxWidth: 400 }}>
                Create a <strong>Looker Studio</strong> report linked to your GA4 property, then enable embedding and paste the iframe URL in the <code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4, fontSize: '0.82rem' }}>VITE_GA_EMBED_URL</code> environment variable.
              </p>
              <a
                href="https://lookerstudio.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
                style={{ marginTop: 8 }}
                id="looker-studio-link"
              >
                <ExternalLink size={14} /> Open Looker Studio
              </a>
            </div>

            {/* This iframe is shown once VITE_GA_EMBED_URL is set */}
            {import.meta.env.VITE_GA_EMBED_URL && (
              <iframe
                id="ga-embed-iframe"
                src={import.meta.env.VITE_GA_EMBED_URL}
                className="ga-embed-iframe"
                title="Google Analytics Dashboard"
                allowFullScreen
              />
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <h2 className="data-table-title">Recent Orders</h2>
          <Link to="/admin/orders" className="btn btn-secondary btn-sm" id="view-all-orders-btn">View All</Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No orders yet</td></tr>
            ) : recentOrders.map(order => (
              <tr key={order.id} id={`admin-order-row-${order.id}`}>
                <td><code style={{ fontSize: '0.78rem', color: 'var(--accent-primary)' }}>{order.id.slice(0, 8)}...</code></td>
                <td style={{ color: 'var(--text-secondary)' }}>{order.profiles?.username || order.profiles?.email || 'Unknown'}</td>
                <td>{Array.isArray(order.items) ? order.items.length : '-'}</td>
                <td style={{ fontWeight: 700 }}>${Number(order.total_amount).toFixed(2)}</td>
                <td><span className={`status-badge ${statusColors[order.status] || 'status-pending'}`}>{order.status}</span></td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{new Date(order.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
