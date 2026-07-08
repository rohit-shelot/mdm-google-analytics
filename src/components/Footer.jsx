import { Link } from 'react-router-dom';
import { Gamepad2, Globe, Mail, Rss, GitBranch } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo-wrap">
              <div className="navbar-logo-icon">
                <Gamepad2 size={20} />
              </div>
              <span style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 900, fontSize: '1.2rem', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                MDM Gaming
              </span>
            </div>
            <p className="footer-desc">
              Your ultimate destination for gaming hardware, discs, and accessories. Level up your setup with MDM Gaming.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              {[Globe, Mail, Rss, GitBranch].map((Icon, i) => (
                <a key={i} href="#" style={{ width: 36, height: 36, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', transition: 'var(--transition)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="footer-heading">Shop</h4>
            <div className="footer-links">
              {['Consoles', 'Games', 'Keyboards', 'Mice', 'Accessories'].map(item => (
                <Link key={item} to="/products" className="footer-link">{item}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="footer-heading">Support</h4>
            <div className="footer-links">
              {['Help Center', 'Track Order', 'Returns', 'Warranty', 'Contact Us'].map(item => (
                <a key={item} href="#" className="footer-link">{item}</a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="footer-heading">Company</h4>
            <div className="footer-links">
              {['About Us', 'Careers', 'Blog', 'Press', 'Partners'].map(item => (
                <a key={item} href="#" className="footer-link">{item}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 MDM Gaming Store. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
