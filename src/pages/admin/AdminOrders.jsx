import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { trackPageView } from '../../lib/analytics';

const STATUSES = ['pending', 'completed', 'cancelled'];
const STATUS_COLORS = { pending: 'status-pending', completed: 'status-completed', cancelled: 'status-cancelled' };

export default function AdminOrders() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    trackPageView('/admin/orders');
    if (!authLoading && !isAdmin) navigate('/');
  }, [isAdmin, authLoading]);

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase.from('orders').select('*, profiles(username, email)').order('created_at', { ascending: false });
    if (filter) query = query.eq('status', filter);
    const { data } = await query;
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) fetchOrders(); }, [isAdmin, filter]);

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Order marked as ${status}`);
    fetchOrders();
  };

  return (
    <div>
      <div className="admin-page-title">Orders</div>
      <p className="admin-page-subtitle">Manage and track all customer orders.</p>

      <div className="data-table-wrapper">
        <div className="data-table-header">
          <h2 className="data-table-title">All Orders ({orders.length})</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {['', ...STATUSES].map(s => (
              <button
                key={s}
                id={`filter-${s || 'all'}`}
                className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(s)}
              >
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="loading-spinner" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No orders found.</td></tr>
              ) : orders.map(order => (
                <tr key={order.id} id={`order-manage-${order.id}`}>
                  <td><code style={{ fontSize: '0.78rem', color: 'var(--accent-primary)' }}>{order.id.slice(0, 8)}...</code></td>
                  <td>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{order.profiles?.username || '—'}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.profiles?.email}</p>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {Array.isArray(order.items) && order.items.slice(0, 2).map((item, i) => (
                        <span key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>• {item.name} ×{item.quantity}</span>
                      ))}
                      {Array.isArray(order.items) && order.items.length > 2 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{order.items.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, fontFamily: 'Orbitron, sans-serif', fontSize: '0.9rem', color: 'var(--accent-primary)' }}>
                    ${Number(order.total_amount).toFixed(2)}
                  </td>
                  <td><span className={`status-badge ${STATUS_COLORS[order.status] || 'status-pending'}`}>{order.status}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <select
                      id={`status-select-${order.id}`}
                      className="filter-select"
                      style={{ minWidth: 130, fontSize: '0.82rem', padding: '6px 10px' }}
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
