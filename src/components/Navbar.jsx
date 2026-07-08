import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Gamepad2, Menu, User, LogOut, Settings, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, signOut, isAdmin } = useAuth();
  const { cartCount, setCartOpen } = useCart();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/products?category=console', label: 'Consoles' },
    { to: '/products?category=game', label: 'Games' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <Gamepad2 size={20} />
          </div>
          MDM Gaming
        </Link>

        <div className="navbar-nav">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          <button
            className="cart-btn"
            id="cart-toggle-btn"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart size={18} />
            Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                id="user-menu-btn"
                className="btn btn-secondary btn-sm"
                onClick={() => setUserMenuOpen(o => !o)}
              >
                <User size={16} />
                Account
              </button>
              {userMenuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)', padding: '8px', minWidth: '180px',
                  zIndex: 2000, boxShadow: 'var(--shadow-card)'
                }}>
                  <Link to="/profile" className="admin-nav-item" onClick={() => setUserMenuOpen(false)} style={{ borderRadius: 'var(--radius-sm)' }}>
                    <User size={16} /> Profile
                  </Link>
                  {isAdmin && (
                    <>
                      <Link to="/admin" className="admin-nav-item" onClick={() => setUserMenuOpen(false)} style={{ borderRadius: 'var(--radius-sm)' }}>
                        <BarChart3 size={16} /> Admin
                      </Link>
                    </>
                  )}
                  <button
                    id="signout-btn"
                    className="admin-nav-item"
                    style={{ width: '100%', background: 'none', border: 'none', color: 'var(--accent-red)', borderRadius: 'var(--radius-sm)' }}
                    onClick={() => { signOut(); setUserMenuOpen(false); }}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" id="login-nav-btn">
              Sign In
            </Link>
          )}

          <button className="navbar-mobile-toggle" id="mobile-menu-btn" onClick={() => setMenuOpen(o => !o)}>
            <Menu size={22} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="nav-menu-mobile" id="mobile-menu-drawer">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className="nav-link" onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
