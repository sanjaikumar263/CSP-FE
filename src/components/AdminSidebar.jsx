import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import logoSvg from '../assets/hero_logo.svg';
import './AdminSidebar.css';

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  // Extract initials for avatar
  const getInitials = (name) => {
    if (!name) return 'AD';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <button className="menu-toggle" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 7h16M4 12h16M4 17h16"/>
        </svg>
      </button>

      <aside className={`sidebar${open ? ' open' : ''}`} id="sidebar">
        <div className="side-logo">
          <img src={logoSvg} alt="Chennai Silk Palace Admin" className="admin-side-logo-img" />
          <div className="role-tag">ADMIN CONSOLE</div>
        </div>

        <div className="nav-label">Overview</div>
        <nav className="side-nav">
          <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/>
              <rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>
            </svg>
            Dashboard
          </Link>
          <Link to="#" className="">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 4h16l-1.5 13.5a2 2 0 0 1-2 1.8H7.5a2 2 0 0 1-2-1.8L4 4Z"/>
              <path d="M8 4a4 4 0 0 1 8 0"/>
            </svg>
            Orders
          </Link>
          <Link to="/admin/products" className={isActive('/admin/products') || isActive('/admin/products/add') ? 'active' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 8l8-4 8 4-8 4-8-4Z"/><path d="M4 8v8l8 4 8-4V8"/><path d="M12 12v8"/>
            </svg>
            Products
          </Link>
          <Link to="/admin/banners" className={isActive('/admin/banners') ? 'active' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            Hero Banners
          </Link>
          <Link to="/admin/offers" className={isActive('/admin/offers') ? 'active' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            Special Offers
          </Link>
          <Link to="#">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="7" width="18" height="14" rx="1.5"/>
              <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Inventory
          </Link>
          <Link to="#">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="9" cy="8" r="3.2"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/>
              <circle cx="17.5" cy="9" r="2.6"/><path d="M15.5 20a5 5 0 0 1 6.5-3.4"/>
            </svg>
            Customers
          </Link>
        </nav>

        <div className="nav-label">Manage</div>
        <nav className="side-nav">
          <Link to="#">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 20V10M12 20V4M20 20v-7"/>
            </svg>
            Reports
          </Link>
          <Link to="/admin/settings" className={isActive('/admin/settings') ? 'active' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>
            </svg>
            Store Settings & About
          </Link>
        </nav>

        <div className="side-foot">
          <div className="admin">
            <div className="avatar">{getInitials(user?.name)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'Radhika Menon'}
              </div>
              <div className="mail" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email || 'admin@example.com'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="admin-logout-btn"
              title="Logout from Admin"
              aria-label="Logout"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
