import { Link, useLocation, Outlet } from 'react-router-dom';
import { BarChart3, Package, ShoppingBag, Home, ArrowLeft } from 'lucide-react';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3 },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <p className="admin-sidebar-title">Admin Panel</p>
        {NAV.map(item => (
          <Link
            key={item.to}
            to={item.to}
            id={`admin-nav-${item.label.toLowerCase()}`}
            className={`admin-nav-item ${location.pathname === item.to ? 'active' : ''}`}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
        <div style={{ marginTop: 24, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
          <Link to="/" className="admin-nav-item">
            <Home size={18} /> Back to Store
          </Link>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
