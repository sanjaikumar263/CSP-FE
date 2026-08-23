import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoSvg from '../assets/hero_logo.svg';
import './Footer.css';

export default function Footer() {
  const [storeInfo, setStoreInfo] = useState({
    phone: '03 33727272',
    email: 'info@chennaisilkpalace.com',
    address: 'No. 1, Jalan Sultan Iskandar, 30000 Ipoh, Perak, Malaysia.',
    footerAboutText: 'Your ultimate destination for exquisite silk sarees and traditional Indian wear. Experience timeless elegance, handcrafted with passion.',
    facebook: '#facebook',
    instagram: '#instagram',
    whatsapp: '#whatsapp',
    youtube: '#youtube'
  });

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/store-info');
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          setStoreInfo(prev => ({
            ...prev,
            ...data.data
          }));
        }
      } catch (err) {
        console.warn('Using fallback store info in Footer:', err);
      }
    };
    fetchStoreInfo();
  }, []);

  return (
    <footer className="site-footer" id="footer">
      <div className="container-inner">
        <div className="footer-top-grid">
          {/* Column 1: Brand Info */}
          <div className="footer-col brand-col">
            <div className="footer-brand-text">
              <img src={logoSvg} alt="Chennai Silk Palace" className="footer-logo-img" />
            </div>
            <p className="footer-about-text">
              {storeInfo.footerAboutText}
            </p>
            <div className="footer-social-links">
              <a href={storeInfo.facebook || '#facebook'} aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href={storeInfo.instagram || '#instagram'} aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href={storeInfo.whatsapp.startsWith('http') ? storeInfo.whatsapp : `https://wa.me/${storeInfo.whatsapp.replace(/[^0-9]/g, '')}`} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </a>
              <a href={storeInfo.youtube || '#youtube'} aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#fff" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div className="footer-col">
            <h4 className="footer-heading">SHOP</h4>
            <ul className="footer-links">
              <li><Link to="/products?category=Sarees">Sarees</Link></li>
              <li><Link to="/products?category=Collections">Collections</Link></li>
              <li><Link to="/products?category=New Arrivals">New Arrivals</Link></li>
              <li><Link to="/products">Gift Cards</Link></li>
              <li><Link to="/products">Special Offers</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div className="footer-col">
            <h4 className="footer-heading">CUSTOMER SERVICE</h4>
            <ul className="footer-links">
              <li><Link to="/admin/login">My Account</Link></li>
              <li><Link to="/products">Track Order</Link></li>
              <li><a href="#shipping">Shipping & Delivery</a></li>
              <li><a href="#returns">Returns & Exchanges</a></li>
              <li><a href="#faqs">FAQs</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Column 4: About Us */}
          <div className="footer-col">
            <h4 className="footer-heading">ABOUT US</h4>
            <ul className="footer-links">
              <li><Link to="/about">Our Story</Link></li>
              <li><Link to="/about">Achievements</Link></li>
              <li><Link to="/about">Our Owners</Link></li>
              <li><Link to="/about">Store Locator</Link></li>
              <li><Link to="/about">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 5: Contact Us & Admin */}
          <div className="footer-col contact-admin-col">
            <h4 className="footer-heading">CONTACT US</h4>
            <div className="footer-contact-info">
              <p>📞 {storeInfo.phone}</p>
              <p>✉️ {storeInfo.email}</p>
              <p>📍 {storeInfo.address}</p>
            </div>

            <div className="admin-login-box">
              <div className="admin-box-title">ADMIN LOGIN</div>
              <div className="admin-box-sub">Secure login for admin panel.</div>
              <Link to="/admin" className="admin-login-btn">
                ADMIN LOGIN
              </Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="copyright-text">
            © {new Date().getFullYear()} Chennai Silk Palace. All Rights Reserved.
          </div>
          <div className="payment-gateways">
            <span>We Accept</span>
            <span className="pay-badge">VISA</span>
            <span className="pay-badge">Mastercard</span>
            <span className="pay-badge">Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
