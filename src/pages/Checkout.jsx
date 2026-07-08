import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, User, ChevronRight, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { trackBeginCheckout, trackPurchase } from '../lib/analytics';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [address, setAddress] = useState({ name: '', email: user?.email || '', phone: '', street: '', city: '', state: '', zip: '', country: 'India' });
  const [payment, setPayment] = useState({ cardNumber: '', expiry: '', cvv: '', name: '' });

  useEffect(() => {
    if (cartItems.length > 0) {
      trackBeginCheckout(cartItems.map(i => ({ ...i.products, quantity: i.quantity })), cartTotal);
    }
  }, []);

  if (!user) {
    navigate('/login');
    return null;
  }

  if (cartItems.length === 0 && !orderId) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ paddingTop: 80, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Your cart is empty.</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>Shop Now</button>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const items = cartItems.map(i => ({ product_id: i.product_id, name: i.products?.name, price: i.products?.price, quantity: i.quantity }));
      const { data, error } = await supabase.from('orders').insert({
        user_id: user.id,
        total_amount: cartTotal,
        status: 'pending',
        items,
        shipping_address: address,
      }).select().single();

      if (error) throw error;

      trackPurchase(data.id, items, cartTotal);
      await clearCart();
      setOrderId(data.id);
      setStep(3);
      toast.success('Order placed successfully! 🎮');
    } catch (err) {
      toast.error(err.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
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

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <h1 className="section-title" style={{ marginBottom: 8 }}>Checkout</h1>

        {/* Steps */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 40, maxWidth: 400 }}>
          {[{ n: 1, label: 'Shipping' }, { n: 2, label: 'Payment' }].map(s => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= s.n ? 'var(--accent-primary)' : 'var(--bg-card)', border: `2px solid ${step >= s.n ? 'var(--accent-primary)' : 'var(--border-color)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>{s.n}</div>
                <span style={{ fontSize: '0.85rem', fontWeight: step === s.n ? 700 : 400, color: step >= s.n ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s.label}</span>
              </div>
              {s.n < 2 && <div style={{ flex: 1, height: 2, background: step > s.n ? 'var(--accent-primary)' : 'var(--border-color)', margin: '0 12px' }} />}
            </div>
          ))}
        </div>

        <div className="checkout-grid">
          <div>
            {step === 1 && (
              <form id="shipping-form" onSubmit={e => { e.preventDefault(); setStep(2); }}>
                <div className="checkout-form-card">
                  <h2 className="checkout-form-title"><MapPin size={18} /> Shipping Address</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input id="ship-name" type="text" className="form-input" required value={address.name} onChange={e => setAddress({ ...address, name: e.target.value })} placeholder="John Doe" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input id="ship-phone" type="tel" className="form-input" required value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} placeholder="+91 xxxxxxxxxx" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input id="ship-email" type="email" className="form-input" required value={address.email} onChange={e => setAddress({ ...address, email: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Street Address</label>
                    <input id="ship-street" type="text" className="form-input" required value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} placeholder="123 Main St, Apt 4" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input id="ship-city" type="text" className="form-input" required value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder="Mumbai" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input id="ship-state" type="text" className="form-input" required value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} placeholder="Maharashtra" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">ZIP Code</label>
                      <input id="ship-zip" type="text" className="form-input" required value={address.zip} onChange={e => setAddress({ ...address, zip: e.target.value })} placeholder="400001" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Country</label>
                      <input id="ship-country" type="text" className="form-input" value={address.country} onChange={e => setAddress({ ...address, country: e.target.value })} />
                    </div>
                  </div>
                  <button id="shipping-next-btn" type="submit" className="btn btn-primary btn-full">
                    Continue to Payment <ChevronRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form id="payment-form" onSubmit={handlePlaceOrder}>
                <div className="checkout-form-card">
                  <h2 className="checkout-form-title"><CreditCard size={18} /> Payment (Demo)</h2>
                  <div style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: 24, fontSize: '0.82rem', color: 'var(--accent-secondary)' }}>
                    🔒 This is a demo checkout. No real payment is processed.
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cardholder Name</label>
                    <input id="card-name" type="text" className="form-input" required placeholder="John Doe" value={payment.name} onChange={e => setPayment({ ...payment, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Card Number</label>
                    <input id="card-number" type="text" className="form-input" required placeholder="4242 4242 4242 4242" maxLength={19} value={payment.cardNumber} onChange={e => setPayment({ ...payment, cardNumber: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() })} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Expiry</label>
                      <input id="card-expiry" type="text" className="form-input" required placeholder="MM/YY" maxLength={5} value={payment.expiry} onChange={e => setPayment({ ...payment, expiry: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVV</label>
                      <input id="card-cvv" type="text" className="form-input" required placeholder="123" maxLength={4} value={payment.cvv} onChange={e => setPayment({ ...payment, cvv: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="button" className="btn btn-secondary" id="back-to-shipping-btn" onClick={() => setStep(1)}>← Back</button>
                    <button id="place-order-btn" type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                      {loading ? 'Placing Order...' : `Place Order • $${cartTotal.toFixed(2)}`}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Order Summary */}
          <div className="checkout-summary">
            <h2 className="checkout-summary-title">Order Summary</h2>
            {cartItems.map(item => (
              <div key={item.id} className="summary-item">
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={item.products?.image_url || `https://picsum.photos/seed/${item.product_id}/60/60`} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                  <span>
                    <span style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem' }}>{item.products?.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>×{item.quantity}</span>
                  </span>
                </span>
                <span style={{ fontWeight: 600 }}>${(item.products?.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-item">
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
              <span style={{ color: 'var(--accent-green)' }}>Free</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span className="summary-total-amount">${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
