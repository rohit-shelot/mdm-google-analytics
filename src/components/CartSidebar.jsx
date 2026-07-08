import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

export default function CartSidebar() {
  const { cartItems, cartOpen, setCartOpen, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <div
        className={`cart-overlay ${cartOpen ? 'open' : ''}`}
        onClick={() => setCartOpen(false)}
        id="cart-overlay"
      />
      <div className={`cart-sidebar ${cartOpen ? 'open' : ''}`} id="cart-sidebar">
        <div className="cart-sidebar-header">
          <span className="cart-sidebar-title">
            🛒 Shopping Cart
            {cartCount > 0 && <span style={{ marginLeft: 8, background: 'var(--accent-primary)', color: 'white', borderRadius: '12px', padding: '2px 8px', fontSize: '0.75rem' }}>{cartCount}</span>}
          </span>
          <button className="cart-close-btn" id="cart-close-btn" onClick={() => setCartOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag size={56} strokeWidth={1} />
            <div>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>Your cart is empty</p>
              <p style={{ fontSize: '0.85rem' }}>Add some epic gaming gear!</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => { setCartOpen(false); navigate('/products'); }}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              {cartItems.map(item => (
                <div key={item.id} className="cart-item" id={`cart-item-${item.id}`}>
                  <img
                    src={item.products?.image_url || `https://picsum.photos/seed/${item.product_id}/100/100`}
                    alt={item.products?.name}
                    className="cart-item-image"
                  />
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.products?.name}</p>
                    <p className="cart-item-price">${(item.products?.price * item.quantity).toFixed(2)}</p>
                    <div className="cart-item-qty">
                      <button className="qty-btn" id={`qty-minus-${item.id}`} onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus size={12} />
                      </button>
                      <span className="qty-num">{item.quantity}</span>
                      <button className="qty-btn" id={`qty-plus-${item.id}`} onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <button className="cart-remove-btn" id={`cart-remove-${item.id}`} onClick={() => removeFromCart(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-sidebar-footer">
              <div className="cart-total-row">
                <span className="cart-total-label">Total</span>
                <span className="cart-total-amount">${cartTotal.toFixed(2)}</span>
              </div>
              <button
                className="btn btn-primary btn-full"
                id="checkout-btn"
                onClick={handleCheckout}
              >
                Proceed to Checkout →
              </button>
              <button
                className="btn btn-secondary btn-full"
                style={{ marginTop: 8 }}
                onClick={() => setCartOpen(false)}
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
