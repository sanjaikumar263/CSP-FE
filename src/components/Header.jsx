import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import logoSvg from '../assets/hero_logo.svg';
import './Header.css';

const NAV_LINKS = [
  { label: 'HOME', href: '/' },
  { label: 'WOMEN', href: '/gender/women' },
  { label: 'MEN', href: '/gender/men' },
  { label: 'ALL COLLECTIONS', href: '/products' },
  { label: 'ABOUT US', href: '/about' },
  { label: 'CONTACT US', href: '#footer' },
];

export default function Header({ initialSearchQuery = '', onSearchSubmit }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || searchParams.get('search') || '');

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) {
      setSearchQuery(q);
    } else if (!initialSearchQuery) {
      setSearchQuery('');
    }
  }, [searchParams, initialSearchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(searchQuery);
    } else if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const isLinkActive = (href) => {
    const currentPath = location.pathname;
    const currentHash = location.hash;

    if (href === '/') {
      return currentPath === '/';
    }
    if (href.startsWith('/gender/')) {
      return currentPath === href;
    }
    if (href === '/products') {
      return currentPath === '/products' && !searchParams.get('category');
    }
    if (href === '/about') {
      return currentPath === '/about';
    }
    if (href === '#footer') {
      return currentHash === '#footer';
    }
    return false;
  };

  return (
    <div className="header-component-wrapper">
      {/* Top Announcement Bar */}
      <div className="top-announce-bar">
        <span>🚚 Free Express Shipping on Orders Over MYR 100+</span>
      </div>

      {/* Main Header */}
      <header className="main-header">
        <div className="header-inner">
          {/* Brand Logo Image */}
          <Link to="/" className="brand-text-logo">
            <img src={logoSvg} alt="Chennai Silk Palace" className="brand-logo-img" />
          </Link>

          {/* Search Bar */}
          <form className="header-search-container" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="Search for products, collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-submit-btn" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.5" y2="16.5" />
              </svg>
            </button>
          </form>

          {/* Header Action Icons */}
          <div className="header-actions">
            <Link to="/products" className="action-btn" aria-label="Wishlist">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>Wishlist</span>
            </Link>

            <Link to="/admin" className="action-btn" aria-label="My Account">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>My Account</span>
            </Link>

            <Link to="/products" className="action-btn cart-btn" aria-label="Cart">
              <div className="cart-icon-wrapper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span className="cart-badge">0</span>
              </div>
              <span>Cart</span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              className="mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Secondary Navigation Bar */}
      <nav className={`secondary-nav ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="nav-inner">
          <ul className="nav-menu">
            {NAV_LINKS.map((item) => {
              const active = isLinkActive(item.href);
              return (
                <li key={item.label} className={active ? 'active' : ''}>
                  {item.href.startsWith('#') ? (
                    <a href={item.href} onClick={() => setMobileMenuOpen(false)}>{item.label}</a>
                  ) : (
                    <Link to={item.href} onClick={() => setMobileMenuOpen(false)}>{item.label}</Link>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="nav-contact-phone">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>03 33727272</span>
          </div>
        </div>
      </nav>
    </div>
  );
}
