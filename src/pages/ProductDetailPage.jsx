import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productsData from '../data/products.json';
import logoSvg from '../assets/chennai palace logo_page.png';
import './ProductDetailPage.css';

// Sample product gallery images for Kanchipuram / Banarasi silk sarees
const SAMPLE_GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
];

const RELATED_PRODUCTS = [
  {
    id: 1,
    name: 'Banarasi Silk Saree',
    price: 180.00,
    rating: 5,
    reviewsCount: 96,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 2,
    name: 'Kanchipuram Silk Saree',
    price: 160.00,
    rating: 5,
    reviewsCount: 84,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 3,
    name: 'Soft Silk Saree',
    price: 140.00,
    rating: 5,
    reviewsCount: 72,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 4,
    name: 'Tussar Silk Saree',
    price: 190.00,
    rating: 5,
    reviewsCount: 68,
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 5,
    name: 'Designer Silk Saree',
    price: 210.00,
    rating: 5,
    reviewsCount: 54,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 6,
    name: 'Paithani Silk Saree',
    price: 230.00,
    rating: 5,
    reviewsCount: 48,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=500&q=80'
  }
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const [apiProduct, setApiProduct] = useState(null);

  // Scroll to top on load or ID change and fetch product if backend ID
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      try {
        if (id) {
          const res = await fetch(`http://localhost:5000/api/products/${id}`);
          const data = await res.json();
          if (res.ok && data.success && data.data) {
            setApiProduct(data.data);
          }
        }
      } catch (err) {
        console.warn('Error fetching product detail from backend:', err);
      }
    };
    fetchProduct();
  }, [id]);

  // Find product from JSON or use fallback matching screenshot
  const foundProd = apiProduct || 
                    productsData.trendingProducts.find(p => p.id === parseInt(id) || p.id === id || p._id === id) || 
                    productsData.lehengaCollection.find(p => p.id === parseInt(id) || p.id === id || p._id === id);

  const product = {
    id: id || 1,
    title: foundProd?.name || foundProd?.title || 'Kanchipuram Banarasi Silk Saree',
    category: foundProd?.category || 'Banarasi Silk Sarees',
    subCategory: 'Sarees',
    price: foundProd?.price ? (typeof foundProd.price === 'number' ? foundProd.price : parseFloat(foundProd.price.replace(/[^0-9.]/g, ''))) : 170.00,
    rating: foundProd?.rating || 5.0,
    reviewsCount: foundProd?.reviewsCount || 128,
    inStock: foundProd?.inStock ?? true,
    fabric: foundProd?.fabric || 'Pure Banarasi Silk',
    color: foundProd?.color || 'Magenta Pink',
    blouse: 'Matching Blouse Piece',
    size: '6.3 Meters (with Blouse Piece)',
    work: 'Zari Weaving',
    occasion: foundProd?.occasion || 'Wedding, Festival, Party Wear',
    images: (foundProd?.images && foundProd.images.length > 0) ? foundProd.images : (foundProd?.image ? [foundProd.image, ...SAMPLE_GALLERY_IMAGES.slice(1)] : SAMPLE_GALLERY_IMAGES),
    description: foundProd?.description || 'This exquisite Kanchipuram Banarasi Silk Saree is a timeless masterpiece woven with rich zari motifs and intricate floral patterns. Crafted for those special moments that deserve nothing but the finest.',
    features: [
      'Pure Kanchipuram Banarasi Silk',
      'Intricate Gold Zari Weaving',
      'Rich Pallu with Traditional Motifs',
      'Comes with Matching Blouse Piece',
      'Lightweight & Comfortable to Drape'
    ]
  };

  const handleAddToCart = () => {
    setCartCount(prev => prev + quantity);
  };

  return (
    <div className="product-detail-container">
      {/* Top Announcement Bar */}
      <div className="top-announce-bar">
        <span>🚚 Free Express Shipping on Orders Over MYR 100+</span>
      </div>

      {/* Main Header */}
      <header className="main-header">
        <div className="header-inner">
          <Link to="/" className="brand-text-logo">
            <img src={logoSvg} alt="Chennai Silk Palace" className="brand-logo-img" />
          </Link>

          <form className="header-search-container" onSubmit={handleSearchSubmit}>
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

          <div className="header-actions">
            <button className="action-btn" aria-label="Wishlist">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>Wishlist</span>
            </button>

            <button className="action-btn" aria-label="My Account">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>My Account</span>
            </button>

            <button className="action-btn cart-btn" aria-label="Cart">
              <div className="cart-icon-wrapper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span className="cart-badge">{cartCount}</span>
              </div>
              <span>Cart</span>
            </button>

            <button className="mobile-toggle-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle navigation">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Secondary Navigation */}
      <nav className={`secondary-nav ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="nav-inner">
          <ul className="nav-menu">
            <li><Link to="/">HOME</Link></li>
            <li><Link to="/products?category=Sarees">SAREES</Link></li>
            <li><Link to="/">COLLECTIONS</Link></li>
            <li><Link to="/">NEW ARRIVALS</Link></li>
            <li><Link to="/">ABOUT US</Link></li>
            <li><Link to="/">CONTACT US</Link></li>
          </ul>
          <div className="nav-contact-phone">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>03 33727272</span>
          </div>
        </div>
      </nav>

      {/* Breadcrumbs */}
      <div className="container-inner">
        <div className="pd-breadcrumb">
          <Link to="/">Home</Link>
          <span className="sep">›</span>
          <Link to="/">{product.subCategory}</Link>
          <span className="sep">›</span>
          <Link to="/">{product.category}</Link>
          <span className="sep">›</span>
          <span className="current">{product.title}</span>
        </div>

        {/* Main Product Grid */}
        <div className="pd-main-grid">
          {/* Gallery Side */}
          <div className="pd-gallery-section">
            <div className="pd-thumb-column">
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`pd-thumb-box ${selectedImage === idx && !isVideoActive ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedImage(idx);
                    setIsVideoActive(false);
                  }}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} />
                </div>
              ))}
              <div
                className={`pd-thumb-box pd-video-thumb ${isVideoActive ? 'active' : ''}`}
                onClick={() => setIsVideoActive(true)}
              >
                <div className="video-icon-circle">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <span>VIDEO</span>
              </div>
            </div>

            <div className="pd-main-image-wrapper">
              <span className="bestseller-badge">BEST SELLER</span>
              {isVideoActive ? (
                <div className="pd-video-container">
                  <div className="video-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <p>Playing Product Video Showcase</p>
                  </div>
                </div>
              ) : (
                <img
                  src={product.images[selectedImage]}
                  alt={product.title}
                  className="pd-main-image"
                />
              )}
              <button className="pd-zoom-btn" aria-label="Zoom Image">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.5" y2="16.5" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </button>
            </div>
          </div>

          {/* Info Side */}
          <div className="pd-info-section">
            {/* Category Badges */}
            <div className="pd-badge-row">
              <span className="pd-tag-pill">Banarasi Silk</span>
              <span className="pd-tag-pill">Handloom</span>
            </div>

            {/* Product Title */}
            <h1 className="pd-title">{product.title}</h1>

            {/* Rating & Stock */}
            <div className="pd-rating-stock-row">
              <div className="pd-stars">
                ★★★★★
                <span className="reviews-text">({product.reviewsCount} Reviews)</span>
              </div>
              <div className="pd-stock-status">
                <span className="green-dot"></span> In Stock
              </div>
            </div>

            {/* Price */}
            <div className="pd-price-box">
              <div className="pd-price-amount">MYR {product.price.toFixed(2)}</div>
              <div className="pd-tax-note">Inclusive of all taxes</div>
            </div>

            {/* Specifications Grid */}
            <div className="pd-specs-table">
              <div className="spec-row">
                <div className="spec-label">
                  <span className="spec-icon">🧶</span> Fabric
                </div>
                <div className="spec-value">{product.fabric}</div>
              </div>
              <div className="spec-row">
                <div className="spec-label">
                  <span className="spec-icon">🎨</span> Color
                </div>
                <div className="spec-value">{product.color}</div>
              </div>
              <div className="spec-row">
                <div className="spec-label">
                  <span className="spec-icon">👚</span> Blouse
                </div>
                <div className="spec-value">{product.blouse}</div>
              </div>
              <div className="spec-row">
                <div className="spec-label">
                  <span className="spec-icon">📐</span> Size
                </div>
                <div className="spec-value">{product.size}</div>
              </div>
              <div className="spec-row">
                <div className="spec-label">
                  <span className="spec-icon">⚙️</span> Work
                </div>
                <div className="spec-value">{product.work}</div>
              </div>
              <div className="spec-row">
                <div className="spec-label">
                  <span className="spec-icon">💃</span> Occasion
                </div>
                <div className="spec-value">{product.occasion}</div>
              </div>
            </div>

            {/* Delivery Info Banner */}
            <div className="pd-delivery-card">
              <div className="delivery-col">
                <span className="del-icon">🚚</span>
                <div>
                  <div className="del-title">Delivery</div>
                  <div className="del-sub">2 - 4 Working Days</div>
                </div>
              </div>
              <div className="delivery-col">
                <span className="del-icon">📦</span>
                <div>
                  <div className="del-title">Free Shipping</div>
                  <div className="del-sub">On orders above MYR 100</div>
                </div>
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="pd-quantity-row">
              <span className="qty-title">Quantity</span>
              <div className="qty-stepper-box">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="qty-num">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pd-actions-row">
              <button
                className="pd-buy-now-btn disabled-action-btn"
                disabled
                title="Coming Soon"
              >
                ⚡ BUY NOW
              </button>

              <button
                className="pd-add-to-cart-btn disabled-action-btn"
                disabled
                title="Coming Soon"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                ADD TO CART
              </button>

              <button
                className={`pd-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? '#0a305d' : 'none'} stroke={isWishlisted ? '#0a305d' : '#555'} strokeWidth="1.8">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                WISHLIST
              </button>
            </div>

            {/* Guarantees */}
            <div className="pd-guarantee-row">
              <div className="guarantee-item">
                🔒 <span>100% Secure Payment</span>
              </div>
              <div className="guarantee-item">
                🔄 <span>Easy Returns & 7 Days Return Policy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Section */}
        <div className="pd-tabs-section">
          <div className="pd-tabs-header">
            {['description', 'details', 'care', 'shipping', 'reviews'].map(tab => (
              <button
                key={tab}
                className={`pd-tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'description' && 'DESCRIPTION'}
                {tab === 'details' && 'DETAILS'}
                {tab === 'care' && 'CARE INSTRUCTIONS'}
                {tab === 'shipping' && 'SHIPPING & RETURNS'}
                {tab === 'reviews' && `REVIEWS (${product.reviewsCount})`}
              </button>
            ))}
          </div>

          <div className="pd-tab-content-card">
            {activeTab === 'description' && (
              <div className="tab-description-grid">
                <div className="tab-text-side">
                  <h3 className="tab-heading">A heritage we weave with pride.</h3>
                  <p className="tab-paragraph">{product.description}</p>

                  <ul className="tab-features-list">
                    {product.features.map((feat, idx) => (
                      <li key={idx}>
                        <span className="check-icon">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="tab-image-side">
                  <img
                    src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
                    alt="Banarasi Silk Weave Detail"
                    className="tab-detail-img"
                  />
                </div>
              </div>
            )}

            {activeTab !== 'description' && (
              <div className="tab-generic-content">
                <h3>{activeTab.toUpperCase()}</h3>
                <p>Detailed information regarding {activeTab} for {product.title}. Premium handcrafted quality assured.</p>
              </div>
            )}
          </div>
        </div>

        {/* You May Also Like Section */}
        <div className="pd-related-section">
          <div className="pd-related-header">
            <span className="ornament-line">❖</span>
            <h2 className="related-title">You May Also Like</h2>
            <span className="ornament-line">❖</span>
          </div>

          <div className="pd-related-grid">
            {RELATED_PRODUCTS.map((rel) => (
              <div key={rel.id} className="pd-rel-card">
                <Link to={`/product/${rel.id}`} onClick={() => window.scrollTo(0, 0)}>
                  <div className="rel-img-wrapper">
                    <img src={rel.image} alt={rel.name} />
                  </div>
                  <div className="rel-info">
                    <div className="rel-name">{rel.name}</div>
                    <div className="rel-price">MYR {rel.price.toFixed(2)}</div>
                    <div className="rel-stars">
                      ★★★★★ <span>({rel.reviewsCount})</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container-inner">
          <div className="footer-top-grid">
            <div className="footer-col brand-col">
              <div className="footer-brand-text">
                <img src={logoSvg} alt="Chennai Silk Palace" className="footer-logo-img" />
              </div>
              <p className="footer-about-text">
                Your ultimate destination for exquisite silk sarees and traditional Indian wear. Experience timeless elegance, handcrafted with passion.
              </p>
              <div className="footer-social-links">
                <a href="#facebook" aria-label="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a href="#instagram" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a href="#whatsapp" aria-label="WhatsApp">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">SHOP</h4>
              <ul className="footer-links">
                <li><Link to="/">Sarees</Link></li>
                <li><Link to="/">Collections</Link></li>
                <li><Link to="/">New Arrivals</Link></li>
                <li><Link to="/">Gift Cards</Link></li>
                <li><Link to="/">Special Offers</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">CUSTOMER SERVICE</h4>
              <ul className="footer-links">
                <li><Link to="/">My Account</Link></li>
                <li><Link to="/">Track Order</Link></li>
                <li><Link to="/">Shipping & Delivery</Link></li>
                <li><Link to="/">Returns & Exchanges</Link></li>
                <li><Link to="/">FAQs</Link></li>
                <li><Link to="/">Privacy Policy</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">ABOUT US</h4>
              <ul className="footer-links">
                <li><Link to="/">Our Story</Link></li>
                <li><Link to="/">Achievements</Link></li>
                <li><Link to="/">Our Owners</Link></li>
                <li><Link to="/">Store Locator</Link></li>
                <li><Link to="/">Contact Us</Link></li>
              </ul>
            </div>

            <div className="footer-col contact-admin-col">
              <h4 className="footer-heading">CONTACT US</h4>
              <div className="footer-contact-info">
                <p>📞 03 33727272</p>
                <p>✉️ info@chennaisilkpalace.com</p>
                <p>📍 No. 1, Jalan Sultan Iskandar, 30000 Ipoh, Perak, Malaysia.</p>
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
              © 2025 Chennai Silk Palace. All Rights Reserved.
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
    </div>
  );
}
