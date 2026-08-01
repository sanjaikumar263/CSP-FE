import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './StoreProductListPage.css';
import logoSvg from '../assets/hero_logo.svg';


// Initial sample catalog items matching the screenshot
const STORE_PRODUCTS = [
  {
    id: 1,
    name: 'Kanchipuram Silk Saree',
    category: 'Kanchipuram Silk',
    price: 170.00,
    originalPrice: 220.00,
    currency: 'MYR',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    isNew: true,
    color: 'Magenta',
    occasion: 'Wedding',
    gender: 'Women',
    inStock: true
  },
  {
    id: 2,
    name: 'Royal Silk Kurta & Pyjama Set',
    category: "Men's Wear",
    price: 155.00,
    originalPrice: 199.00,
    currency: 'MYR',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=600&q=80',
    isNew: true,
    color: 'Cream Gold',
    occasion: 'Wedding',
    gender: 'Men',
    inStock: true
  },
  {
    id: 3,
    name: 'Rose Pink Embroidered Lehenga',
    category: 'Lehengas',
    price: 380.00,
    originalPrice: 450.00,
    currency: 'MYR',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    isNew: true,
    color: 'Pink',
    occasion: 'Party Wear',
    gender: 'Women',
    inStock: true
  },
  {
    id: 4,
    name: 'Kanchipuram Silk Shirt & Dhoti Set',
    category: "Men's Wear",
    price: 210.00,
    originalPrice: 270.00,
    currency: 'MYR',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
    isNew: true,
    color: 'White',
    occasion: 'Wedding',
    gender: 'Men',
    inStock: true
  },
  {
    id: 5,
    name: 'Soft Silk Saree',
    category: 'Soft Silk',
    price: 140.00,
    originalPrice: 210.00,
    currency: 'MYR',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
    isNew: false,
    color: 'Magenta',
    occasion: 'Wedding',
    gender: 'Women',
    inStock: true
  },
  {
    id: 6,
    name: 'Heritage Silk Shawl & Stole',
    category: 'Accessories',
    price: 85.00,
    originalPrice: 110.00,
    currency: 'MYR',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    isNew: true,
    color: 'Maroon Gold',
    occasion: 'Festive',
    gender: 'Unisex',
    inStock: true
  },
  {
    id: 7,
    name: 'Banarasi Silk Saree',
    category: 'Banarasi Silk',
    price: 180.00,
    originalPrice: null,
    currency: 'MYR',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
    isNew: false,
    color: 'Pink',
    occasion: 'Party Wear',
    gender: 'Women',
    inStock: true
  },
  {
    id: 8,
    name: 'Tussar Silk Saree',
    category: 'Tussar Silk',
    price: 190.00,
    originalPrice: null,
    currency: 'MYR',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    isNew: true,
    color: 'Blue',
    occasion: 'Festive',
    gender: 'Women',
    inStock: true
  }
];

export default function StoreProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchVal = searchParams.get('search') || '';
  const categoryVal = searchParams.get('category') || '';
  const genderParam = searchParams.get('gender') || 'All';

  const [headerSearch, setHeaderSearch] = useState(searchVal);
  const [selectedGender, setSelectedGender] = useState(genderParam);
  const [wishlist, setWishlist] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  // Products & Loading state from API
  const [catalogItems, setCatalogItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [maxPrice, setMaxPrice] = useState(1600);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedOccasions, setSelectedOccasions] = useState([]);
  const [availability, setAvailability] = useState({ inStock: false, outOfStock: false });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/products');
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          const mapped = data.data.map((item, idx) => ({
            id: item._id || item.id || idx + 1,
            name: item.name,
            category: item.category || 'Banarasi Silk',
            price: item.price,
            originalPrice: item.originalPrice || item.salePrice || null,
            currency: item.currency || 'MYR',
            image: item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
            isNew: item.isNewProduct || idx % 2 === 0,
            color: item.color || 'Pink',
            occasion: item.occasion || 'Wedding',
            gender: item.gender || 'Women',
            inStock: item.inStock ?? true
          }));
          setCatalogItems(mapped);
        } else {
          setCatalogItems([]);
        }
      } catch (err) {
        console.warn('Backend API connection error:', err);
        setCatalogItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  useEffect(() => {
    setHeaderSearch(searchVal);
  }, [searchVal]);

  useEffect(() => {
    if (categoryVal) {
      setSelectedCategories([categoryVal]);
    }
    if (genderParam) {
      setSelectedGender(genderParam);
    }
  }, [categoryVal, genderParam]);

  const handleHeaderSearchSubmit = (e) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      setSearchParams({ search: headerSearch.trim() });
    } else {
      setSearchParams({});
    }
  };

  const toggleWishlist = (id) => {
    setWishlist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCategoryToggle = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleOccasionToggle = (occ) => {
    setSelectedOccasions(prev =>
      prev.includes(occ) ? prev.filter(o => o !== occ) : [...prev, occ]
    );
  };

  const handleClearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedGender('All');
    setMaxPrice(1600);
    setSelectedColor('');
    setSelectedOccasions([]);
    setAvailability({ inStock: false, outOfStock: false });
    setSearchParams({});
    setHeaderSearch('');
  };

  // Dynamic Filtering Logic
  let filteredList = catalogItems.filter(item => {
    // Header / URL search query
    if (searchVal.trim()) {
      const q = searchVal.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      if (!matchName && !matchCat) return false;
    }

    // Category filter
    if (selectedCategories.length > 0) {
      if (!selectedCategories.includes(item.category)) return false;
    }

    // Gender filter
    if (selectedGender && selectedGender !== 'All') {
      if (item.gender?.toLowerCase() !== selectedGender.toLowerCase()) return false;
    }

    // Price filter
    if (item.price > maxPrice) return false;

    // Color filter
    if (selectedColor && item.color.toLowerCase() !== selectedColor.toLowerCase()) return false;

    // Occasion filter
    if (selectedOccasions.length > 0 && !selectedOccasions.includes(item.occasion)) return false;

    // Availability filter
    if (availability.inStock && !item.inStock) return false;
    if (availability.outOfStock && item.inStock) return false;

    return true;
  });

  // Sorting Logic
  if (sortBy === 'price-low') {
    filteredList.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredList.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'newest') {
    filteredList.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  }

  const pageTitle = searchVal
    ? `Search Results for "${searchVal}"`
    : categoryVal
    ? `${categoryVal} Collection`
    : 'All Collections';

  return (
    <div className="store-list-container">
      {/* Common Header */}
      <Header />

      {/* Dark Navy Hero Banner matching screenshot */}
      <section className="search-banner-section">
        <div className="container-inner banner-content-grid">
          <div className="banner-text-box">
            <div className="banner-eyebrow">
              {searchVal ? 'Search Results for' : 'EXPLORE OUR CATALOG'}
            </div>
            <h2 className="banner-main-title">
              {searchVal ? `"${searchVal}"` : pageTitle}
            </h2>
            <p className="banner-sub-count">
              Showing {filteredList.length} results {searchVal ? `for ${searchVal}` : ''}
            </p>
          </div>

         
        </div>
      </section>

      {/* Main Catalog Layout */}
      <div className="container-inner catalog-main-wrap">
        {/* Top Control Bar (Breadcrumbs & Sorting) */}
        <div className="catalog-top-bar">
          <div className="catalog-breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">›</span>
            <span className="cur">{searchVal ? 'Search Results' : (categoryVal || 'All Collections')}</span>
          </div>

          <div className="catalog-controls-right">
            <div className="sort-box">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>

            <div className="view-grid-icons">
              <button className="grid-icon-btn active" aria-label="Grid View">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              </button>
              <button className="grid-icon-btn" aria-label="List View">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content Layout: Left Sidebar Filters + Right Product Grid */}
        <div className="catalog-body-grid">
          {/* Left Sidebar Filters */}
          <aside className="filters-sidebar">
            <div className="sidebar-header">
              <h3 className="filter-title">FILTERS</h3>
              <button className="clear-all-btn" onClick={handleClearAllFilters}>
                Clear All
              </button>
            </div>

            {/* Gender Filter */}
            <div className="filter-group">
              <h4 className="group-title">GENDER</h4>
              <div className="radio-list">
                {['All', 'Women', 'Men', 'Unisex'].map(g => (
                  <label key={g} className="checkbox-item">
                    <input
                      type="radio"
                      name="genderFilter"
                      checked={selectedGender.toLowerCase() === g.toLowerCase()}
                      onChange={() => setSelectedGender(g)}
                    />
                    <span className="cb-label">{g === 'All' ? 'All Genders' : `${g}'s Collection`}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <h4 className="group-title">CATEGORY</h4>
              <div className="checkbox-list">
                {[
                  { name: 'Banarasi Silk', count: 12 },
                  { name: 'Kanchipuram Silk', count: 8 },
                  { name: "Men's Wear", count: 10 },
                  { name: 'Lehengas', count: 6 },
                  { name: 'Soft Silk', count: 6 },
                  { name: 'Accessories', count: 5 },
                  { name: 'Tussar Silk', count: 4 }
                ].map(c => (
                  <label key={c.name} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(c.name)}
                      onChange={() => handleCategoryToggle(c.name)}
                    />
                    <span className="cb-label">{c.name} ({c.count})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="filter-group">
              <h4 className="group-title">PRICE RANGE</h4>
              <div className="price-slider-box">
                <input
                  type="range"
                  min="80"
                  max="1600"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="range-input"
                />
                <div className="price-min-max">
                  <span>MYR 80</span>
                  <span>MYR {maxPrice}</span>
                </div>
              </div>
            </div>

            {/* Color Filter */}
            <div className="filter-group">
              <h4 className="group-title">COLOR</h4>
              <div className="color-swatches-grid">
                {[
                  { name: 'Gold', hex: '#EAB308' },
                  { name: 'Magenta', hex: '#EC4899' },
                  { name: 'Pink', hex: '#F43F5E' },
                  { name: 'Blue', hex: '#3B82F6' },
                  { name: 'Green', hex: '#10B981' },
                  { name: 'White', hex: '#FFFFFF' }
                ].map(col => (
                  <button
                    key={col.name}
                    className={`color-swatch-dot ${selectedColor === col.name ? 'active' : ''}`}
                    style={{ backgroundColor: col.hex }}
                    onClick={() => setSelectedColor(selectedColor === col.name ? '' : col.name)}
                    title={col.name}
                  />
                ))}
              </div>
            </div>

            {/* Occasion Filter */}
            <div className="filter-group">
              <h4 className="group-title">OCCASION</h4>
              <div className="checkbox-list">
                {[
                  { name: 'Wedding', count: 14 },
                  { name: 'Festive', count: 16 },
                  { name: 'Party Wear', count: 8 },
                  { name: 'Casual', count: 4 }
                ].map(occ => (
                  <label key={occ.name} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedOccasions.includes(occ.name)}
                      onChange={() => handleOccasionToggle(occ.name)}
                    />
                    <span className="cb-label">{occ.name} ({occ.count})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div className="filter-group">
              <h4 className="group-title">AVAILABILITY</h4>
              <div className="checkbox-list">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={availability.inStock}
                    onChange={(e) => setAvailability({ ...availability, inStock: e.target.checked })}
                  />
                  <span className="cb-label">In Stock (22)</span>
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={availability.outOfStock}
                    onChange={(e) => setAvailability({ ...availability, outOfStock: e.target.checked })}
                  />
                  <span className="cb-label">Out of Stock (2)</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Right Product Grid (4 Columns matching screenshot) */}
          <main className="product-grid-main">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', background: '#ffffff', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0a305d" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite', marginBottom: '14px' }}>
                  <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10"/>
                </svg>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>Loading Products...</div>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>Fetching latest collection from database</div>
              </div>
            ) : filteredList.length > 0 ? (
              <div className="store-products-grid">
                {filteredList.map((prod) => (
                  <div key={prod.id} className="store-product-card">
                    <div className="card-image-box">
                      {prod.isNew && <span className="badge-new">NEW</span>}
                      <button
                        className={`card-wishlist-btn ${wishlist[prod.id] ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(prod.id);
                        }}
                        aria-label="Add to Wishlist"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlist[prod.id] ? '#0a305d' : 'none'} stroke={wishlist[prod.id] ? '#0a305d' : '#555'} strokeWidth="1.8">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>
                      <Link to={`/product/${prod.id}`}>
                        <img src={prod.image} alt={prod.name} className="card-img" />
                      </Link>
                    </div>

                    <div className="card-content-box">
                      <Link to={`/product/${prod.id}`}>
                        <h4 className="card-title">{prod.name}</h4>
                      </Link>

                      <div className="card-price-row">
                        <span className="card-price-current">
                          {prod.currency} {prod.price ? prod.price.toFixed(2) : '0.00'}
                        </span>
                        {prod.originalPrice && (
                          <span className="card-price-original">
                            {prod.currency} {prod.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <button
                        className="add-to-collection-btn disabled-action-btn"
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
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5" style={{ margin: '0 auto 12px', display: 'block' }}>
                  <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>
                </svg>
                <h3>No Products Found</h3>
                <p>We couldn't find any products matching your active search or filters.</p>
                <button className="reset-filter-btn" onClick={handleClearAllFilters}>
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="catalog-pagination">
              <button className="page-nav-btn" disabled>‹</button>
              <button
                className={`page-num-btn ${currentPage === 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(1)}
              >
                1
              </button>
              <button
                className={`page-num-btn ${currentPage === 2 ? 'active' : ''}`}
                onClick={() => setCurrentPage(2)}
              >
                2
              </button>
              <button
                className={`page-num-btn ${currentPage === 3 ? 'active' : ''}`}
                onClick={() => setCurrentPage(3)}
              >
                3
              </button>
              <button className="page-nav-btn">›</button>
            </div>
          </main>
        </div>
      </div>

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
                <li><Link to="/products?category=Sarees">Sarees</Link></li>
                <li><Link to="/products?category=Collections">Collections</Link></li>
                <li><Link to="/products?category=New Arrivals">New Arrivals</Link></li>
                <li><Link to="/products">Gift Cards</Link></li>
                <li><Link to="/products">Special Offers</Link></li>
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
