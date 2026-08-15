import React from 'react';
import { Link } from 'react-router-dom';
import logoSvg from '../assets/hero_logo.svg';
import './Footer.css';

export default function Footer() {
  return (
    <>
      {/* Value Proposition Bar Above Footer */}
      <div className="footer-value-props-bar">
        <div className="container-inner">
          <div className="value-props-grid">
            <div className="prop-item">
              <div className="prop-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="7" />
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                </svg>
              </div>
              <div className="prop-text">
                <span className="prop-title">Authentic Quality</span>
                <span className="prop-sub">100% Pure Silk</span>
              </div>
            </div>

            <div className="prop-item">
              <div className="prop-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div className="prop-text">
                <span className="prop-title">Free Shipping</span>
                <span className="prop-sub">On orders over MYR 100</span>
              </div>
            </div>

            <div className="prop-item">
              <div className="prop-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              </div>
              <div className="prop-text">
                <span className="prop-title">Easy Returns</span>
                <span className="prop-sub">7 Days return policy</span>
              </div>
            </div>

            <div className="prop-item">
              <div className="prop-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <div className="prop-text">
                <span className="prop-title">Secure Payment</span>
                <span className="prop-sub">100% Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Light Site Footer */}
      <footer className="site-footer" id="footer">
        <div className="container-inner">
          <div className="footer-top-grid">
            {/* Column 1: Brand Info */}
            <div className="footer-col brand-col">
              <div className="footer-brand-header">
                <img src={logoSvg} alt="Chennai Silk Palace" className="footer-logo-img" />
              </div>
              <p className="footer-about-text">
                Your ultimate destination for exquisite silk sarees and traditional wear. Experience timeless elegance with our handpicked collections.
              </p>
              <div className="footer-social-links">
                <a href="#facebook" aria-label="Facebook">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a href="#instagram" aria-label="Instagram">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a href="#whatsapp" aria-label="WhatsApp">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </a>
                <a href="#youtube" aria-label="YouTube">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#FAF6F0" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="footer-col">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/products?category=Sarees">Sarees</Link></li>
                <li><Link to="/products">Collections</Link></li>
                <li><Link to="/products?new=true">New Arrivals</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><a href="#contact">Contact Us</a></li>
              </ul>
            </div>

            {/* Column 3: Customer Service */}
            <div className="footer-col">
              <h4 className="footer-heading">Customer Service</h4>
              <ul className="footer-links">
                <li><a href="#my-account">My Account</a></li>
                <li><a href="#track-order">Track Order</a></li>
                <li><a href="#shipping">Shipping & Delivery</a></li>
                <li><a href="#returns">Returns & Exchanges</a></li>
                <li><a href="#faqs">FAQs</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Column 4: Contact Us */}
            <div className="footer-col contact-col">
              <h4 className="footer-heading">Contact Us</h4>
              <div className="footer-contact-info">
                <p className="contact-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <span>03 33727272</span>
                </p>
                <p className="contact-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span>info@chennaisilkpalace.com</span>
                </p>
                <p className="contact-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>No. 1, Jalan Istana, 41000 Klang, Selangor Darul Ehsan, Malaysia.</span>
                </p>
                <p className="contact-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>No. 1, Jalan Sultan Iskandar, 30000 Ipoh, Perak, Malaysia.</span>
                </p>
              </div>
            </div>

            {/* Column 5: Admin Login Box */}
            <div className="footer-col admin-col">
              <div className="admin-login-box">
                <h5 className="admin-box-title">Admin Login</h5>
                <p className="admin-box-sub">Secure login for admin panel.</p>
                <Link to="/admin/login" className="admin-login-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <span>ADMIN LOGIN</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="footer-bottom-bar">
            <div className="copyright-text">
              © {new Date().getFullYear()} Chennai Silk Palace. All Rights Reserved.
            </div>
            <div className="payment-gateways">
              <span className="pay-partner-text">Payments Partner</span>
              <span className="pay-badge visa">VISA</span>
              <span className="pay-badge mastercard">Mastercard</span>
              <span className="pay-badge stripe">stripe</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
