import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Package, LogOut, Shield, ShoppingBag } from 'lucide-react';
import { trackPageView } from '../lib/analytics';

export default function Profile() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackPageView('/profile');
    if (user) {
      supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        .then(({ data }) => { setOrders(data || []); setLoading(false); });
    }
  }, [user]);

  if (!user) return (
    <div className="loading-page">
      <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Please log in to view your profile.</p>
      <Link to="/login" className="btn btn-primary">Sign In</Link>
    </div>
  );

  const statusColors = { pending: 'status-pending', completed: 'status-completed', cancelled: 'status-cancelled' };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'G'}
          </div>
          <div style={{ flex: 1 }}>
            <h1 className="profile-name">{profile?.username || 'Gamer'}</h1>
            <p className="profile-email">{user.email}</p>
            <div className={`profile-role ${isAdmin ? 'role-admin' : 'role-customer'}`}>
              {isAdmin ? <Shield size={12} /> : <User size={12} />}
              {isAdmin ? 'Admin' : 'Customer'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {isAdmin && (
              <Link to="/admin" className="btn btn-primary btn-sm" id="profile-admin-link">
                <Shield size={14} /> Admin Panel
              </Link>
            )}
            <button className="btn btn-secondary btn-sm" id="profile-signout-btn" onClick={signOut}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: 40 }}>
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Total Orders</span>
              <div className="stat-icon" style={{ background: 'rgba(108,99,255,0.15)' }}>
                <Package size={20} color="var(--accent-primary)" />
              </div>
            </div>
            <p className="stat-value">{orders.length}</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Total Spent</span>
              <div className="stat-icon" style={{ background: 'rgba(0,255,136,0.15)' }}>
                <ShoppingBag size={20} color="var(--accent-green)" />
              </div>
            </div>
            <p className="stat-value" style={{ color: 'var(--accent-green)' }}>
              ${orders.reduce((s, o) => s + (o.total_amount || 0), 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Orders */}
        <div className="data-table-wrapper">
          <div className="data-table-header">
            <h2 className="data-table-title">Order History</h2>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div className="loading-spinner" />
            </div>
          ) : orders.length === 0 ? (
            <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <ShoppingBag size={48} strokeWidth={1} style={{ margin: '0 auto 16px' }} />
              <p style={{ fontWeight: 600, marginBottom: 8 }}>No orders yet</p>
              <Link to="/products" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Start Shopping</Link>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} id={`order-row-${order.id}`}>
                    <td><code style={{ fontSize: '0.78rem', color: 'var(--accent-primary)' }}>{order.id.slice(0, 8)}...</code></td>
                    <td>{Array.isArray(order.items) ? order.items.length : '-'} item(s)</td>
                    <td style={{ fontWeight: 700 }}>${Number(order.total_amount).toFixed(2)}</td>
                    <td><span className={`status-badge ${statusColors[order.status] || 'status-pending'}`}>{order.status}</span></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
