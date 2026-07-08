import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Star, Shield, Truck, RotateCcw, Plus, Minus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { trackViewItem } from '../lib/analytics';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgStyle, setImgStyle] = useState({});
  const imgRef = useRef(null);

  // Scroll-linked fade: image gently fades and lifts as user scrolls
  useEffect(() => {
    const onScroll = () => {
      if (!imgRef.current) return;
      const rect = imgRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      // Start fading when top of image is above 60% of viewport
      const progress = Math.max(0, Math.min(1, (windowH * 0.6 - rect.top) / (windowH * 0.4)));
      setImgStyle({
        opacity: 1 - progress * 0.85,
        transform: `translateY(${-progress * 30}px) scale(${1 - progress * 0.03})`,
        transition: 'opacity 0.05s linear, transform 0.05s linear',
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      setProduct(data);
      if (data) trackViewItem(data);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <div className="loading-page">
      <div className="loading-spinner" />
      <p style={{ color: 'var(--text-muted)' }}>Loading product...</p>
    </div>
  );

  if (!product) return (
    <div className="loading-page">
      <p>Product not found.</p>
      <Link to="/products" className="btn btn-primary">Back to Products</Link>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <Link to="/products" className="btn btn-secondary btn-sm" style={{ marginBottom: 32, display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Back to Products
        </Link>

        <div className="product-detail-grid">
          {/* Image */}
          <div className="product-detail-image-wrapper" ref={imgRef}>
            <img
              src={product.image_url || `https://picsum.photos/seed/${product.id}/600/600`}
              alt={product.name}
              style={imgStyle}
            />
          </div>

          {/* Info */}
          <div className="fade-in">
            <p className="product-detail-category">{product.category}</p>
            <h1 className="product-detail-name">{product.name}</h1>

            <div className="product-rating" style={{ marginBottom: 20 }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill={i < 4 ? '#ffd700' : 'none'} color="#ffd700" />
              ))}
              <span style={{ color: 'var(--text-secondary)', marginLeft: 8, fontSize: '0.9rem' }}>4.2 (128 reviews)</span>
            </div>

            <p className="product-detail-price">${Number(product.price).toFixed(2)}</p>
            <p className="product-detail-desc">{product.description || 'Premium gaming product. No description provided.'}</p>

            {/* Stock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, fontSize: '0.9rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: product.stock > 0 ? 'var(--accent-green)' : 'var(--accent-red)', boxShadow: `0 0 8px ${product.stock > 0 ? 'var(--accent-green)' : 'var(--accent-red)'}` }} />
              <span style={{ color: product.stock > 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>Quantity</p>
              <div className="qty-selector" style={{ display: 'inline-flex' }}>
                <button className="qty-btn" id="qty-minus-detail" onClick={() => setQty(q => Math.max(1, q - 1))}>
                  <Minus size={14} />
                </button>
                <span className="qty-num">{qty}</span>
                <button className="qty-btn" id="qty-plus-detail" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="product-detail-actions">
              <button
                className="btn btn-primary btn-lg"
                id="product-add-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                style={{ flex: 1, background: added ? 'linear-gradient(135deg, var(--accent-green), #00aa55)' : undefined }}
              >
                <ShoppingCart size={18} />
                {added ? 'Added to Cart!' : 'Add to Cart'}
              </button>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 32 }}>
              {[
                { icon: Shield, label: '2 Year Warranty' },
                { icon: Truck, label: 'Free Shipping' },
                { icon: RotateCcw, label: '30-Day Returns' },
              ].map(b => (
                <div key={b.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px 10px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <b.icon size={18} color="var(--accent-primary)" />
                  {b.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
