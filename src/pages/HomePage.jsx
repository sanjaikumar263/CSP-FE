import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import productsData from '../data/products.json';
import shopImg from '../assets/Shop Image.png';
import Header from '../components/Header';
import './HomePage.css';
import logoSvg from '../assets/hero_logo.svg';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('search') || '';
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [wishlist, setWishlist] = useState({});
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trendingProducts, setTrendingProducts] = useState(productsData.trendingProducts || []);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        setLoadingProducts(true);
        const res = await fetch('http://localhost:5000/api/products/latest');
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data) && data.data.length > 0) {
          const mapped = data.data.map((item, idx) => {
            const rawPrice = item.price;
            const numPrice = typeof rawPrice === 'number' ? rawPrice : (parseFloat(rawPrice) || 0);
            
            const rawOrig = item.originalPrice;
            const numOrig = rawOrig ? (typeof rawOrig === 'number' ? rawOrig : parseFloat(rawOrig)) : null;

            return {
              id: item._id || item.id || idx + 1,
              _id: item._id,
              name: item.name,
              category: item.category || 'Soft Silk',
              price: numPrice,
              originalPrice: numOrig,
              currency: item.currency || 'MYR',
              image: item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
              isNew: item.isNewProduct !== undefined ? item.isNewProduct : true,
              rating: item.rating || 5.0
            };
          });
          setTrendingProducts(mapped);
        }
      } catch (err) {
        console.warn('Error fetching latest products from backend API:', err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchLatestProducts();
  }, []);

  const heroSlides = productsData.heroSlides;
  const trustBadges = productsData.trustBadges;
  const featuredCategories = productsData.featuredCategories;
  const lehengaCollection = productsData.lehengaCollection;
  const shopByCategories = productsData.shopByCategories;
  const heritageInfo = productsData.heritageInfo;

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const toggleWishlist = (id) => {
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const filteredTrendingProducts = trendingProducts.filter((prod) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      prod.name.toLowerCase().includes(q) ||
      (prod.category && prod.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="home-page-container">
      {/* Common Header */}
      <Header />

      {/* Hero Banner Section */}
      <section className="hero-banner-section">
        <div className="hero-slide-wrapper">
          <button className="hero-arrow prev-arrow" onClick={handlePrevSlide} aria-label="Previous Slide">
            ‹
          </button>
          <button className="hero-arrow next-arrow" onClick={handleNextSlide} aria-label="Next Slide">
            ›
          </button>

          <div className="hero-content-grid">
            <div className="hero-text-side">
              <div className="hero-headline-group">
                <h2 className="hero-title-main">{heroSlides[currentSlide].title}</h2>
                <h2 className="hero-title-highlight">{heroSlides[currentSlide].titleHighlight}</h2>
              </div>
              <p className="hero-subtitle">{heroSlides[currentSlide].subtitle}</p>
              <a href={heroSlides[currentSlide].ctaLink} className="hero-cta-btn">
                {heroSlides[currentSlide].ctaText}
              </a>

              {/* Trust Badges */}
              <div className="hero-trust-bar">
                {trustBadges.map((badge) => (
                  <div key={badge.id} className="trust-item">
                    <div className="trust-icon-box">
                      {badge.icon === 'shield' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      )}
                      {badge.icon === 'sparkles' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      )}
                      {badge.icon === 'award' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="8" r="7" />
                          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                        </svg>
                      )}
                    </div>
                    <div className="trust-text-box">
                      <div className="trust-title">{badge.title}</div>
                      <div className="trust-sub">{badge.subtitle}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-image-side">
              <img
                src={heroSlides[currentSlide].image}
                alt={heroSlides[currentSlide].title}
                className="hero-main-img"
              />
            </div>
          </div>

          {/* Slider Indicator Dots */}
          <div className="hero-dots">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4 Feature Category Cards */}
      <section className="featured-categories-section" id="categories">
        <div className="container-inner">
          <div className="category-cards-grid">
            {featuredCategories.map((cat) => (
              <div key={cat.id} className="featured-cat-card">
                <img src={cat.image} alt={cat.title} className="cat-card-bg" />
                <div className="cat-card-overlay">
                  <div className="cat-card-info">
                    <h3 className="cat-title">{cat.title}</h3>
                    <p className="cat-subtitle">{cat.subtitle}</p>
                    <Link to={`/products?category=${encodeURIComponent(cat.title + ' ' + cat.subtitle)}`} className="cat-explore-btn">
                      EXPLORE →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop By Gender Module Section */}
      <section className="shop-by-gender-section" id="gender-module">
        <div className="container-inner">
          <div className="section-header-centered">
            <div className="ornament-eyebrow">❖ CURATED FOR EVERYONE ❖</div>
            <h2 className="section-main-title">Shop By Gender</h2>
            <p className="section-sub-desc">Explore tailored collections handcrafted with pure silk and timeless elegance.</p>
          </div>

          <div className="gender-cards-grid">
            <div className="gender-card women-card">
              <div className="gender-card-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80')" }}></div>
              <div className="gender-card-content">
                <span className="gender-tag">HERITAGE SAREES &amp; LEHENGAS</span>
                <h3 className="gender-title">Women's Collection</h3>
                <p className="gender-desc">Exquisite Banarasi, Kanchipuram &amp; Soft Silk Sarees crafted for timeless grace.</p>
                <Link to="/gender/women" className="gender-cta-btn">EXPLORE WOMEN →</Link>
              </div>
            </div>

            <div className="gender-card men-card">
              <div className="gender-card-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80')" }}></div>
              <div className="gender-card-content">
                <span className="gender-tag">ROYAL TRADITIONAL WEAR</span>
                <h3 className="gender-title">Men's Collection</h3>
                <p className="gender-desc">Pure Silk Shirts, Gold Zari Dhotis &amp; Handcrafted Kurta Sets for regal style.</p>
                <Link to="/gender/men" className="gender-cta-btn">EXPLORE MEN →</Link>
              </div>
            </div>

            <div className="gender-card unisex-card">
              <div className="gender-card-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80')" }}></div>
              <div className="gender-card-content">
                <span className="gender-tag">ARTISANAL ACCESSORIES</span>
                <h3 className="gender-title">Unisex Collection</h3>
                <p className="gender-desc">Handwoven Silk Shawls, Heritage Stoles &amp; Festive Accessories for all.</p>
                <Link to="/gender/unisex" className="gender-cta-btn">EXPLORE UNISEX →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Products Section */}
      <section className="trending-products-section" id="trending">
        <div className="container-inner">
          <div className="section-header-centered">
            <div className="ornament-eyebrow">❖ {searchQuery ? 'SEARCH RESULTS' : 'TRENDING NOW'} ❖</div>
            <h2 className="section-main-title">
              {searchQuery ? `Products matching "${searchQuery}"` : 'Trending Products'}
            </h2>
            {searchQuery ? (
              <button className="clear-search-link" onClick={handleClearSearch}>
                Clear Search ✕
              </button>
            ) : (
              <a href="#all" className="view-all-link">VIEW ALL →</a>
            )}
          </div>

          {searchQuery && (
            <div className="search-summary-bar">
              <span>Showing {filteredTrendingProducts.length} product(s) for <strong>"{searchQuery}"</strong></span>
            </div>
          )}

          {filteredTrendingProducts.length > 0 ? (
            <div className="products-grid">
              {filteredTrendingProducts.map((prod) => (
                <div key={prod.id} className="product-card">
                  <div className="product-image-container">
                    <Link to={`/product/${prod.id}`}>
                      <img src={prod.image} alt={prod.name} className="product-img" />
                    </Link>
                    <button
                      className={`wishlist-icon-btn ${wishlist[prod.id] ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(prod.id);
                      }}
                      aria-label="Add to Wishlist"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlist[prod.id] ? '#0a305d' : 'none'} stroke={wishlist[prod.id] ? '#0a305d' : '#555'} strokeWidth="1.8">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                    {prod.isNew && <span className="product-tag-badge">NEW</span>}
                  </div>
                  <div className="product-info-body">
                    <Link to={`/product/${prod.id}`} className="product-title-link">
                      <div className="product-title">{prod.name}</div>
                    </Link>
                    <div className="product-price-row">
                      <span className="price-current">{prod.currency} {prod.price.toFixed(2)}</span>
                      {prod.originalPrice && (
                        <span className="price-original">{prod.currency} {prod.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <button
                      className="home-add-to-cart-btn disabled-action-btn"
                      disabled
                      title="Coming Soon"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                      </svg>
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results-box">
              <div className="no-results-icon">🔍</div>
              <h3>No products found</h3>
              <p>We couldn't find any products matching <strong>"{searchQuery}"</strong>.</p>
              <button className="reset-search-btn" onClick={handleClearSearch}>
                View All Collections
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Lehenga Collection Showcase */}
      <section className="lehenga-showcase-section" id="lehenga">
        <div className="container-inner">
          <div className="lehenga-layout-grid">
            <div className="lehenga-info-box">
              <span className="lehenga-tag">NEW COLLECTION</span>
              <h2 className="lehenga-heading">Lehenga Collection</h2>
              <p className="lehenga-subtext">
                From classic elegance to modern grace - find the perfect lehenga for every celebration.
              </p>
              <a href="#explore-lehengas" className="lehenga-btn">
                EXPLORE COLLECTION
              </a>
            </div>

            <div className="lehenga-slider-area">
              <div className="lehenga-items-row">
                {lehengaCollection.map((item) => (
                  <div key={item.id} className="lehenga-card">
                    <Link to={`/product/${item.id}`}>
                      <div className="lehenga-img-wrapper">
                        <img src={item.image} alt={item.title} />
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
              <button className="lehenga-slide-arrow" aria-label="Next Lehenga">
                ›
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Service Highlights Bar */}
      <section className="service-highlights-bar">
        <div className="container-inner">
          <div className="service-grid">
            <div className="service-item">
              <div className="service-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div className="service-text">
                <div className="title">Free Shipping</div>
                <div className="desc">On orders over MYR 100</div>
              </div>
            </div>

            <div className="service-item">
              <div className="service-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M23 4v6h-6" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              </div>
              <div className="service-text">
                <div className="title">Easy Returns</div>
                <div className="desc">7 Days return policy</div>
              </div>
            </div>

            <div className="service-item">
              <div className="service-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <div className="service-text">
                <div className="title">Secure Payment</div>
                <div className="desc">100% Secure checkout</div>
              </div>
            </div>

            <div className="service-item">
              <div className="service-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div className="service-text">
                <div className="title">Support 24/7</div>
                <div className="desc">We're here to help</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop By Category (Circular Collections) */}
      <section className="shop-by-category-section">
        <div className="container-inner">
          <div className="section-header-centered">
            <div className="ornament-eyebrow">SHOP BY CATEGORY</div>
            <h2 className="section-main-title">Explore Our Collections</h2>
          </div>

          <div className="circle-categories-grid">
            {shopByCategories.map((item) => (
              <Link key={item.id} to={`/products?category=${encodeURIComponent(item.name)}`} className="circle-cat-item">
                <div className="circle-img-container">
                  <img src={item.image} alt={item.name} />
                </div>
                <span className="circle-cat-label">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Our Heritage Section */}
      <section className="heritage-section" id="heritage">
        <div className="heritage-container">
          <div className="heritage-image-wrapper">
            <img src={shopImg} alt="Chennai Silk Palace Storefront" className="heritage-store-img" />
            
            {/* White Layer Overlay in Center */}
            <div className="heritage-white-overlay">
              <div className="heritage-overlay-badge">OUR HERITAGE</div>
              <h2 className="heritage-overlay-title">{heritageInfo?.heading || "A Legacy Woven with Trust"}</h2>
              <p className="heritage-overlay-desc">
                {heritageInfo?.description || "For over five decades, Chennai Silk Palace has been a symbol of purity, quality and tradition."}
              </p>
              
              <Link to="/about" className="heritage-about-btn">
                <span>Show About Us</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Subscription Section */}
      <section className="newsletter-section">
        <div className="container-inner">
          <div className="newsletter-card">
            <div className="newsletter-icon-circle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div className="newsletter-text-box">
              <h3 className="newsletter-title">Stay Updated</h3>
              <p className="newsletter-desc">
                Subscribe to get special offers, free giveaways and once-in-a-lifetime deals.
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="newsletter-email-input"
              />
              <button type="submit" className="newsletter-submit-btn">
                SUBSCRIBE
              </button>
            </form>
            {subscribed && <div className="newsletter-success-toast">Thank you for subscribing!</div>}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="site-footer" id="footer">
        <div className="container-inner">
          <div className="footer-top-grid">
            {/* Column 1: Brand Info */}
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
                <a href="#youtube" aria-label="YouTube">
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
                <li><a href="#sarees">Sarees</a></li>
                <li><a href="#collections">Collections</a></li>
                <li><a href="#new-arrivals">New Arrivals</a></li>
                <li><a href="#gift-cards">Gift Cards</a></li>
                <li><a href="#special-offers">Special Offers</a></li>
              </ul>
            </div>

            {/* Column 3: Customer Service */}
            <div className="footer-col">
              <h4 className="footer-heading">CUSTOMER SERVICE</h4>
              <ul className="footer-links">
                <li><a href="#my-account">My Account</a></li>
                <li><a href="#track-order">Track Order</a></li>
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
                <li><a href="#our-story">Our Story</a></li>
                <li><a href="#achievements">Achievements</a></li>
                <li><a href="#our-owners">Our Owners</a></li>
                <li><a href="#store-locator">Store Locator</a></li>
                <li><a href="#contact">Contact Us</a></li>
              </ul>
            </div>

            {/* Column 5: Contact Us & Admin */}
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
