import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import SafeImage from '../components/SafeImage';
import placeholderSvg from '../assets/placeholder.svg';
import { API_BASE_URL } from '../config';
import { getTopLevelCategoryTabs, isProductInCategory } from '../data/categoriesData';
import './GenderCollectionPage.css';

const GENDER_HERO_DATA = {
  women: {
    title: "Women's Collection",
    subtitle: "Discover opulent Kanchipuram silks, Banarasi weaves, Designer Lehengas, and Punjabi suits crafted for royalty.",
    eyebrow: "HERITAGE ELEGANCE",
    bgImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
    badge: "100% Pure Silk & Artisanal Weaves"
  },
  men: {
    title: "Men's Collection",
    subtitle: "Regal silk shirts, traditional pattu dhotis, wedding sherwanis, and royal handcrafted kurta sets tailored for every celebratory occasion.",
    eyebrow: "TRADITIONAL SPLENDOR",
    bgImage: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1200&q=80",
    badge: "Authentic Zari Weaves & Sherwanis"
  },
  kids: {
    title: "Kids' Collection",
    subtitle: "Adorable Pattu Pavadais, royal Boys Sherwanis, traditional dhoti combos, and celebratory lehengas crafted with pure comfort.",
    eyebrow: "FESTIVE INNOCENCE & CHARM",
    bgImage: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1200&q=80",
    badge: "100% Child-Friendly Pure Fabrics"
  },
  all: {
    title: "Shop By Collection",
    subtitle: "Explore our complete curated collections tailored for Women, Men, and Kids.",
    eyebrow: "FULL CATALOGUE",
    bgImage: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80",
    badge: "Generations of Heritage & Trust"
  }
};

export default function GenderCollectionPage() {
  const { genderType } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Normalize active gender tab
  const activeGenderFromParam = (genderType || searchParams.get('gender') || 'all').toLowerCase();
  const [selectedGender, setSelectedGender] = useState(
    ['women', 'men', 'kids'].includes(activeGenderFromParam) ? activeGenderFromParam : 'all'
  );

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [priceSort, setPriceSort] = useState('newest');
  const [wishlist, setWishlist] = useState({});

  useEffect(() => {
    if (genderType) {
      const g = genderType.toLowerCase();
      if (['women', 'men', 'kids'].includes(g)) {
        setSelectedGender(g);
      }
    }
  }, [genderType]);

  useEffect(() => {
    const cat = searchParams.get('category');
    setSelectedCategory(cat || 'All');
  }, [searchParams]);

  // Fetch full catalog once on mount
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/products`);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          setAllProducts(data.data);
        } else {
          setAllProducts([]);
        }
      } catch (err) {
        console.warn('API error fetching gender products:', err);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  // Products belonging to the selected collection/gender
  const genderProducts = useMemo(() => {
    if (selectedGender === 'all') return allProducts;
    const target = selectedGender.toLowerCase();
    return allProducts.filter(item => {
      const g = (item.gender || '').toLowerCase().trim();
      if (target === 'women') return g === 'women' || g === 'female';
      if (target === 'men') return g === 'men' || g === 'male';
      if (target === 'kids') return g.includes('kid') || g.includes('boy') || g.includes('girl');
      return true;
    });
  }, [allProducts, selectedGender]);

  // Filtered by category, search query, and sorted by price
  const displayedProducts = useMemo(() => {
    let list = genderProducts.filter(item => {
      // 1. Category Filter using intelligent hierarchy matcher
      if (selectedCategory && selectedCategory !== 'All') {
        if (!isProductInCategory(item, selectedCategory)) {
          return false;
        }
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (item.name || '').toLowerCase().includes(q);
        const matchCat = (item.category || '').toLowerCase().includes(q);
        const matchDesc = (item.description || '').toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchDesc) return false;
      }

      return true;
    });

    // 3. Sorting
    list = [...list].sort((a, b) => {
      const priceA = typeof a.price === 'number' ? a.price : parseFloat(a.price) || 0;
      const priceB = typeof b.price === 'number' ? b.price : parseFloat(b.price) || 0;
      if (priceSort === 'price-low-high') return priceA - priceB;
      if (priceSort === 'price-high-low') return priceB - priceA;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return list;
  }, [genderProducts, selectedCategory, searchQuery, priceSort]);

  const handleGenderTabChange = (g) => {
    setSelectedGender(g);
    setSelectedCategory('All');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('category');
    setSearchParams(newParams);
    if (g === 'all') {
      navigate('/gender');
    } else {
      navigate(`/gender/${g}`);
    }
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  const toggleWishlist = (id) => {
    setWishlist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const heroInfo = GENDER_HERO_DATA[selectedGender] || GENDER_HERO_DATA.all;

  // Dynamic category tabs for the active gender
  const categoriesList = useMemo(() => {
    const list = getTopLevelCategoryTabs(selectedGender);
    if (selectedCategory && selectedCategory !== 'All' && !list.includes(selectedCategory)) {
      list.splice(1, 0, selectedCategory);
    }
    return list;
  }, [selectedGender, selectedCategory]);

  // Compute live product counts for each category pill
  const categoryCounts = useMemo(() => {
    const counts = {};
    counts['All'] = genderProducts.length;
    categoriesList.forEach(cat => {
      if (cat === 'All') return;
      counts[cat] = genderProducts.filter(item => isProductInCategory(item, cat)).length;
    });
    return counts;
  }, [genderProducts, categoriesList]);

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
            className={`gp-gender-tab ${selectedGender === 'kids' ? 'active' : ''}`}
            onClick={() => handleGenderTabChange('kids')}
          >
            <span className="tab-icon">🧒</span>
            Kids' Collection
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="gp-main-body">
        {/* Controls bar: Sub-category chips & Sort */}
        <div className="gp-controls-bar">
          <div className="gp-category-chips">
            {categoriesList.map(cat => {
              const count = categoryCounts[cat] ?? 0;
              const isActive = (selectedCategory || 'All').toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  className={`gp-chip ${isActive ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  <span>{cat}</span>
                  <span className="gp-chip-count">{count}</span>
                </button>
              );
            })}
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
          <Loader message={`Loading ${heroInfo.title}...`} />
        ) : displayedProducts.length === 0 ? (
          <div className="gp-empty-state">
            <div className="empty-icon">🛍️</div>
            <h3>No products found</h3>
            <p>We couldn't find any products in this collection matching your criteria.</p>
            <button className="gp-btn-reset" onClick={() => handleCategoryClick('All')}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="gp-product-grid">
            {displayedProducts.map(product => (
              <div key={product._id || product.id} className="gp-product-card">
                <div className="gp-card-image-wrap">
                  <SafeImage
                    src={product.image || product.images?.[0] || placeholderSvg}
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
