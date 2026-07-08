import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || 'unknown';

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '60px 40px' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(0,255,136,0.15)', border: '2px solid var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
            <CheckCircle size={40} color="var(--accent-green)" />
          </div>
          <h1 className="auth-title" style={{ color: 'var(--accent-green)', marginBottom: 12 }}>Order Placed!</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Your order has been confirmed.</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 32 }}>Order ID: <code style={{ color: 'var(--accent-primary)' }}>{orderId}</code></p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Continue Shopping</button>
            <button className="btn btn-secondary" onClick={() => navigate('/profile')}>View Orders</button>
          </div>
        </div>
      </div>
    </div>
  );
}
