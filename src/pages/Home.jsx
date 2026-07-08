import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowRight, Gamepad2, Cpu, Keyboard, Mouse, Disc, Zap, Shield, Truck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { trackViewPromotion, trackSelectPromotion } from '../lib/analytics';

const CATEGORIES = [
  { id: 'console', name: 'Consoles', icon: '🎮', color: '#6c63ff', bg: 'rgba(108,99,255,0.12)' },
  { id: 'game', name: 'Games', icon: '💿', color: '#00d4ff', bg: 'rgba(0,212,255,0.12)' },
  { id: 'keyboard', name: 'Keyboards', icon: '⌨️', color: '#00ff88', bg: 'rgba(0,255,136,0.12)' },
  { id: 'mouse', name: 'Mice', icon: '🖱️', color: '#ff6b35', bg: 'rgba(255,107,53,0.12)' },
  { id: 'accessory', name: 'Accessories', icon: '🎧', color: '#ff4757', bg: 'rgba(255,71,87,0.12)' },
];

const FEATURES = [
  { icon: Zap, title: 'Fast Delivery', desc: 'Same-day shipping on most items', color: '#ffd700' },
  { icon: Shield, title: 'Authentic Products', desc: '100% genuine gaming hardware', color: '#00ff88' },
  { icon: Truck, title: 'Free Returns', desc: '30-day hassle-free returns', color: '#6c63ff' },
];

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  delay: `${Math.random() * 8}s`,
  size: Math.random() * 3 + 1,
}));

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    trackViewPromotion('hero_banner_2026', 'New Arrivals 2026 Hero Banner');
    const fetch = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .limit(8);
      setFeatured(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="hero">
        <div className="hero-particles">
          {particles.map(p => (
            <div key={p.id} className="hero-particle" style={{
              left: p.left, top: p.top,
              animationDelay: p.delay,
              width: p.size, height: p.size,
            }} />
          ))}
        </div>
        <div className="hero-glow-circle" />

        <div className="container">
          <div className="hero-grid">
            <div className="hero-content fade-in">
              <div className="hero-tag">
                <span className="hero-tag-dot" />
                New Arrivals 2026
              </div>
              <h1 className="hero-title">
                Elevate Your<br />
                <span>Gaming Experience</span>
              </h1>
              <p className="hero-desc">
                Discover the latest PlayStation 5 discs, AAA games, mechanical keyboards, and pro-grade mice. Everything a gamer needs — in one place.
              </p>
              <div className="hero-cta">
                <Link
                  to="/products"
                  className="btn btn-primary btn-lg"
                  id="hero-shop-btn"
                  onClick={() => trackSelectPromotion('hero_banner_2026', 'New Arrivals 2026 Hero Banner')}
                >
                  Shop Now <ArrowRight size={18} />
                </Link>
                <Link to="/products?category=console" className="btn btn-outline btn-lg" id="hero-consoles-btn">
                  <Gamepad2 size={18} /> Consoles
                </Link>
              </div>
              <div className="hero-stats">
                {[['500+', 'Products'], ['50K+', 'Gamers'], ['4.9★', 'Rating'], ['24/7', 'Support']].map(([val, lbl]) => (
                  <div key={lbl}>
                    <div className="hero-stat-value">{val}</div>
                    <div className="hero-stat-label">{lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-visual fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="hero-visual-container">
                <div className="hero-badge-floating c1">
                  <div className="hero-badge-icon" style={{ background: 'rgba(108, 99, 255, 0.12)', color: '#6c63ff' }}>🎮</div>
                  <div>
                    <p className="hero-badge-text">PS5 Console</p>
                    <p className="hero-badge-sub">Next-Gen Disc Edition</p>
                  </div>
                </div>
                <div className="hero-badge-floating c2">
                  <div className="hero-badge-icon" style={{ background: 'rgba(0, 212, 255, 0.12)', color: '#00d4ff' }}>💿</div>
                  <div>
                    <p className="hero-badge-text">God of War</p>
                    <p className="hero-badge-sub">AAA Best Seller</p>
                  </div>
                </div>
                <div className="hero-badge-floating c3">
                  <div className="hero-badge-icon" style={{ background: 'rgba(0, 255, 136, 0.12)', color: '#00ff88' }}>⌨️</div>
                  <div>
                    <p className="hero-badge-text">Pro Keyboard</p>
                    <p className="hero-badge-sub">Mechanical RGB Blue</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES BAR */}
      <section style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '32px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: '12px', background: `${f.color}20`, border: `1px solid ${f.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <f.icon size={22} color={f.color} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, marginBottom: 2 }}>{f.title}</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Browse by Category</span>
            <h2 className="section-title">Find Your <span>Gear</span></h2>
            <p className="section-desc">From next-gen consoles to precision peripherals — we've got every category covered.</p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <div
                key={cat.id}
                className="category-card"
                id={`category-${cat.id}`}
                onClick={() => navigate(`/products?category=${cat.id}`)}
              >
                <div className="category-icon" style={{ background: cat.bg, border: `1px solid ${cat.color}40` }}>
                  {cat.icon}
                </div>
                <div className="category-name" style={{ color: cat.color }}>{cat.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Handpicked for You</span>
            <h2 className="section-title">Featured <span>Products</span></h2>
            <p className="section-desc">Our curated selection of top-rated gaming products for the serious gamer.</p>
          </div>

          {loading ? (
            <div className="products-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <div className="skeleton" style={{ height: 200 }} />
                  <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div className="skeleton" style={{ height: 12, width: '60%' }} />
                    <div className="skeleton" style={{ height: 16, width: '80%' }} />
                    <div className="skeleton" style={{ height: 20, width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="products-grid">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Gamepad2 size={56} strokeWidth={1} style={{ margin: '0 auto 16px' }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>No products yet</p>
              <p style={{ fontSize: '0.9rem' }}>Add products from the admin panel to see them here.</p>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link to="/products" className="btn btn-outline btn-lg" id="view-all-btn">
              View All Products <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="section">
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,212,255,0.1))',
            border: '1px solid rgba(108,99,255,0.3)',
            borderRadius: 'var(--radius-xl)',
            padding: '60px 48px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <span className="section-tag">Limited Time</span>
            <h2 className="section-title" style={{ marginBottom: 16 }}>Ready to <span>Level Up?</span></h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 36, fontSize: '1.05rem', maxWidth: 500, margin: '0 auto 36px' }}>
              Sign up today and get exclusive access to new drops, member-only deals, and gaming news.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg" id="cta-register-btn">Create Account</Link>
              <Link to="/products" className="btn btn-secondary btn-lg">Explore Products</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
