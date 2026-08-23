import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './GenderCollectionPage.css';

const GENDER_HERO_DATA = {
  women: {
    title: "Women's Collection",
    subtitle: "Discover opulent Kanchipuram silks, Banarasi weaves, and artisanal ethnic wear crafted for royalty.",
    eyebrow: "HERITAGE ELEGANCE",
    bgImage: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1400&q=80",
    badge: "100% Pure Silk Sarees"
  },
  men: {
    title: "Men's Collection",
    subtitle: "Regal silk shirts, traditional dhotis, and royal handcrafted kurta sets tailored for every celebratory occasion.",
    eyebrow: "TRADITIONAL SPLENDOR",
    bgImage: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1400&q=80",
    badge: "Authentic Zari Weaves"
  },

  all: {
    title: "Shop By Gender",
    subtitle: "Explore our complete curated collections tailored for Men, Women, and Unisex accessories.",
    eyebrow: "FULL CATALOGUE",
    bgImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1400&q=80",
    badge: "Generations of Trust"
  }
};

export default function GenderCollectionPage() {
  const { genderType } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Normalize active gender tab
  const activeGenderFromParam = (genderType || searchParams.get('gender') || 'all').toLowerCase();
  const [selectedGender, setSelectedGender] = useState(
    ['women', 'men', 'unisex'].includes(activeGenderFromParam) ? activeGenderFromParam : 'all'
  );

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceSort, setPriceSort] = useState('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [wishlist, setWishlist] = useState({});

  useEffect(() => {
    if (genderType) {
      const g = genderType.toLowerCase();
      if (['women', 'men', 'unisex'].includes(g)) {
        setSelectedGender(g);
      }
    }
  }, [genderType]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/products';
      const params = new URLSearchParams();

      if (selectedGender !== 'all') {
        const genderQueryVal = selectedGender === 'women' ? 'Women' : (selectedGender === 'men' ? 'Men' : 'Unisex');
        params.append('gender', genderQueryVal);
      }

      if (selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      if (priceSort === 'price-low-high') {
        params.append('sort', 'price-low-high');
      } else if (priceSort === 'price-high-low') {
        params.append('sort', 'price-high-low');
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.warn('API error fetching gender products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedGender, selectedCategory, priceSort]);

  const handleGenderTabChange = (g) => {
    setSelectedGender(g);
    setSelectedCategory('All');
    if (g === 'all') {
      navigate('/gender');
    } else {
      navigate(`/gender/${g}`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const toggleWishlist = (id) => {
    setWishlist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const heroInfo = GENDER_HERO_DATA[selectedGender] || GENDER_HERO_DATA.all;

  // Categories list per gender
  const categoriesList = selectedGender === 'men'
    ? ['All', "Men's Wear", 'Kurta Sets', 'Dhoti Sets', 'Traditional Wear']
    : (selectedGender === 'women'
      ? ['All', 'Soft Silk', 'Kanchipuram Silk', 'Banarasi Silk', 'Tussar Silk', "Women's Wear"]
      : ['All', 'Accessories', 'Unisex', 'Silk Sarees', "Men's Wear"]);

  return (
    <div className="gender-page-container">
      {/* Common Header */}
      <Header />

      {/* Hero Section */}
      <section className="gp-hero" style={{ backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.88), rgba(248, 244, 236, 0.94)), url(${heroInfo.bgImage})` }}>
        <div className="gp-hero-content">
          <span className="gp-hero-eyebrow">{heroInfo.eyebrow}</span>
          <h1 className="gp-hero-title">{heroInfo.title}</h1>
          <p className="gp-hero-subtitle">{heroInfo.subtitle}</p>
          <div className="gp-hero-badge">{heroInfo.badge}</div>
        </div>
      </section>

      {/* Gender Module Tabs */}
      <div className="gp-tabs-wrapper">
        <div className="gp-tabs-container">
          <button
            className={`gp-gender-tab ${selectedGender === 'all' ? 'active' : ''}`}
            onClick={() => handleGenderTabChange('all')}
          >
            <span className="tab-icon">✨</span>
            All Collections
          </button>
          <button
            className={`gp-gender-tab ${selectedGender === 'women' ? 'active' : ''}`}
            onClick={() => handleGenderTabChange('women')}
          >
            <span className="tab-icon">👗</span>
            Women's Collection
          </button>
          <button
            className={`gp-gender-tab ${selectedGender === 'men' ? 'active' : ''}`}
            onClick={() => handleGenderTabChange('men')}
          >
            <span className="tab-icon">👔</span>
            Men's Collection
          </button>
          <button
            className={`gp-gender-tab ${selectedGender === 'unisex' ? 'active' : ''}`}
            onClick={() => handleGenderTabChange('unisex')}
          >
            <span className="tab-icon">🧣</span>
            Unisex &amp; Accessories
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="gp-main-body">
        {/* Controls bar: Sub-category chips & Sort */}
        <div className="gp-controls-bar">
          <div className="gp-category-chips">
            {categoriesList.map(cat => (
              <button
                key={cat}
                className={`gp-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="gp-sort-box">
            <label htmlFor="priceSortSelect">Sort By:</label>
            <select
              id="priceSortSelect"
              value={priceSort}
              onChange={e => setPriceSort(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="gp-loading-state">
            <div className="gp-spinner"></div>
            <p>Loading {heroInfo.title}...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="gp-empty-state">
            <div className="empty-icon">🛍️</div>
            <h3>No products found</h3>
            <p>We couldn't find any products in this gender category matching your criteria.</p>
            <button className="gp-btn-reset" onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="gp-product-grid">
            {products.map(product => (
              <div key={product._id || product.id} className="gp-product-card">
                <div className="gp-card-image-wrap">
                  <img
                    src={product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'}
                    alt={product.name}
                    className="gp-card-img"
                  />
                  <div className="gp-gender-badge">{product.gender || 'Women'}</div>
                  {product.isNewProduct && <div className="gp-new-tag">NEW</div>}

                  <button
                    className={`gp-wishlist-btn ${wishlist[product._id || product.id] ? 'active' : ''}`}
                    onClick={() => toggleWishlist(product._id || product.id)}
                    title="Add to wishlist"
                  >
                    ♥
                  </button>
                </div>

                <div className="gp-card-details">
                  <span className="gp-card-category">{product.category || 'Traditional'}</span>
                  <h3 className="gp-card-title">
                    <Link to={`/product/${product._id || product.id}`}>{product.name}</Link>
                  </h3>

                  <div className="gp-card-price-row">
                    <span className="gp-current-price">
                      {product.currency || 'MYR'} {typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="gp-original-price">
                        {product.currency || 'MYR'} {product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="gp-card-actions">
                    <Link to={`/product/${product._id || product.id}`} className="gp-btn-view">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
