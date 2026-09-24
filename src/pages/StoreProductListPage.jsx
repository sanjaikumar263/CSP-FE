import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import SafeImage from '../components/SafeImage';
import placeholderSvg from '../assets/placeholder.svg';
import { API_BASE_URL } from '../config';
import { CATEGORY_TREE, getCategoriesByGender, isProductInCategory } from '../data/categoriesData';
import './StoreProductListPage.css';


// Initial sample catalog items matching the screenshot
const STORE_PRODUCTS = [
  {
    id: 1,
    name: 'Kanchipuram Silk Saree',
    category: 'Kanchipuram Silk',
    price: 170.00,
    originalPrice: 220.00,
    currency: 'MYR',
    image: placeholderSvg,
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
    image: placeholderSvg,
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
    image: placeholderSvg,
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
    image: placeholderSvg,
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
    image: placeholderSvg,
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
    image: placeholderSvg,
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
    image: placeholderSvg,
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
    image: placeholderSvg,
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
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  // Products & Loading state from API
  const [catalogItems, setCatalogItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [expandedGroups, setExpandedGroups] = useState({});
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // Structured category hierarchy with dynamic counts
  const categoryHierarchy = useMemo(() => {
    let groups = [];
    const g = (selectedGender || 'All').toLowerCase();

    if (g === 'women') {
      groups = CATEGORY_TREE.women.groups;
    } else if (g === 'men') {
      groups = CATEGORY_TREE.men.groups;
    } else if (g === 'kids') {
      groups = CATEGORY_TREE.kids.groups;
    } else {
      groups = [
        ...CATEGORY_TREE.women.groups.map(grp => ({ ...grp, department: "Women" })),
        ...CATEGORY_TREE.men.groups.map(grp => ({ ...grp, department: "Men" })),
        ...CATEGORY_TREE.kids.groups.map(grp => ({ ...grp, department: "Kids" }))
      ];
    }

    const baseItems = catalogItems.length > 0 ? catalogItems : STORE_PRODUCTS;

    return groups.map(grp => {
      const subItemsWithCount = grp.items.map(itemName => {
        const count = baseItems.filter(item => {
          if (selectedGender !== 'All' && item.gender?.toLowerCase() !== selectedGender.toLowerCase()) {
            return false;
          }
          return isProductInCategory(item, itemName);
        }).length;

        return {
          name: itemName,
          count
        };
      });

      const totalCount = baseItems.filter(item => {
        if (selectedGender !== 'All' && item.gender?.toLowerCase() !== selectedGender.toLowerCase()) {
          return false;
        }
        return isProductInCategory(item, grp.name);
      }).length;

      return {
        id: grp.id,
        name: grp.name,
        department: grp.department,
        totalCount,
        items: subItemsWithCount
      };
    });
  }, [catalogItems, selectedGender]);

  // Filtered by search query if user searches inside the category box
  const filteredCategoryHierarchy = useMemo(() => {
    if (!categorySearchQuery.trim()) {
      return categoryHierarchy;
    }
    const q = categorySearchQuery.toLowerCase().trim();
    return categoryHierarchy
      .map(grp => {
        const groupMatches = grp.name.toLowerCase().includes(q);
        const matchingItems = grp.items.filter(item => item.name.toLowerCase().includes(q));
        if (groupMatches) return grp;
        if (matchingItems.length > 0) {
          return {
            ...grp,
            items: matchingItems
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [categoryHierarchy, categorySearchQuery]);

  // Auto-expand all groups by default when gender changes
  useEffect(() => {
    const next = {};
    categoryHierarchy.forEach((grp) => {
      next[grp.id] = true;
    });
    setExpandedGroups(next);
  }, [selectedGender]);

  // Toggle expand / collapse all groups
  const handleToggleExpandAll = () => {
    const allExpanded = filteredCategoryHierarchy.every(grp => Boolean(expandedGroups[grp.id] ?? true));
    const next = {};
    categoryHierarchy.forEach(grp => {
      next[grp.id] = !allExpanded;
    });
    setExpandedGroups(next);
  };

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [maxPrice, setMaxPrice] = useState(1600);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedOccasions, setSelectedOccasions] = useState([]);
  const [availability, setAvailability] = useState({ inStock: false, outOfStock: false });
  const [currentPage, setCurrentPage] = useState(1);

  // Active filters count for badges
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedGender && selectedGender !== 'All') count++;
    count += selectedCategories.length;
    if (maxPrice < 1600) count++;
    return count;
  }, [selectedGender, selectedCategories, maxPrice]);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/products`);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          const mapped = data.data.map((item, idx) => ({
            id: item._id || item.id || idx + 1,
            name: item.name,
            category: item.category || 'Banarasi Silk',
            price: item.price,
            originalPrice: item.originalPrice || item.salePrice || null,
            currency: item.currency || 'MYR',
            image: item.image || item.images?.[0] || placeholderSvg,
            isNew: item.isNewProduct || idx % 2 === 0,
            color: item.color || 'Pink',
            occasion: item.occasion || 'Wedding',
            gender: item.gender || 'Women',
            categories: item.categories || (item.category ? [item.category] : []),
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
    setCategorySearchQuery('');
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
      const matchesCategory = selectedCategories.some(cat => isProductInCategory(item, cat));
      if (!matchesCategory) return false;
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

        {/* Mobile / Tablet Filter & Sort Bar (Visible on tablets and phones) */}
        <div className="mobile-catalog-toolbar">
          <button
            type="button"
            className="mobile-filter-open-btn"
            onClick={() => setMobileFilterOpen(true)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="mobile-toolbar-badge">{activeFiltersCount}</span>
            )}
          </button>

          <div className="mobile-toolbar-count">
            <span>{filteredList.length} items</span>
          </div>

          <div className="mobile-sort-box">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="mobile-sort-dropdown"
              aria-label="Sort products"
            >
              <option value="relevance">Featured</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>
        </div>

        {/* Backdrop for Mobile Filter Drawer */}
        <div
          className={`mobile-filter-backdrop ${mobileFilterOpen ? 'active' : ''}`}
          onClick={() => setMobileFilterOpen(false)}
          aria-hidden={!mobileFilterOpen}
        />

        {/* Content Layout: Left Sidebar Filters + Right Product Grid */}
        <div className="catalog-body-grid">
          {/* Left Sidebar Filters (Responsive Drawer on Mobile/Tablet) */}
          <aside className={`filters-sidebar ${mobileFilterOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-header">
              <div className="sidebar-header-left">
                <h3 className="filter-title">FILTERS</h3>
                {activeFiltersCount > 0 && (
                  <span className="sidebar-count-badge">{activeFiltersCount}</span>
                )}
              </div>
              <div className="sidebar-header-right">
                {activeFiltersCount > 0 && (
                  <button type="button" className="clear-all-btn" onClick={handleClearAllFilters}>
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  className="mobile-sidebar-close-btn"
                  onClick={() => setMobileFilterOpen(false)}
                  aria-label="Close filters drawer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Gender / Collection Filter */}
            <div className="filter-group gender-filter-group">
              <div className="group-title-row">
                <h4 className="group-title">COLLECTION / GENDER</h4>
              </div>
              <div className="gender-pill-grid">
                {[
                  { key: 'All', label: 'All', badge: '✨' },
                  { key: 'Women', label: "Women's", badge: '👗' },
                  { key: 'Men', label: "Men's", badge: '👔' },
                  { key: 'Kids', label: "Kids'", badge: '🧒' }
                ].map(item => {
                  const isActive = selectedGender.toLowerCase() === item.key.toLowerCase();
                  return (
                    <button
                      key={item.key}
                      type="button"
                      className={`gender-pill-card ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedGender(item.key);
                        setSelectedCategories([]);
                      }}
                      title={`${item.label} Collection`}
                    >
                      <span className="gender-pill-badge">{item.badge}</span>
                      <span className="gender-pill-name">{item.label}</span>
                      {isActive && <span className="gender-pill-check">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Filter - Hierarchical Grouped Cards */}
            <div className="filter-group category-filter-group">
              <div className="group-title-row">
                <div className="group-title-left">
                  <h4 className="group-title">CATEGORIES</h4>
                  {selectedCategories.length > 0 && (
                    <span className="cat-active-total-pill">
                      {selectedCategories.length} selected
                    </span>
                  )}
                </div>
                <div className="group-title-actions">
                  <button
                    type="button"
                    className="toggle-all-groups-btn"
                    onClick={handleToggleExpandAll}
                    title="Expand or collapse all category groups"
                  >
                    {filteredCategoryHierarchy.every(grp => Boolean(expandedGroups[grp.id] ?? true)) ? 'Collapse All' : 'Expand All'}
                  </button>
                  {selectedCategories.length > 0 && (
                    <button
                      type="button"
                      className="clear-cat-link"
                      onClick={() => setSelectedCategories([])}
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Search */}
              <div className="cat-filter-search-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.5" y2="16.5" />
                </svg>
                <input
                  type="text"
                  placeholder="Search categories (e.g. Silk, Saree)..."
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  className="cat-filter-search-input"
                />
                {categorySearchQuery && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => setCategorySearchQuery('')}
                    aria-label="Clear category search"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Active category pill tags */}
              {selectedCategories.length > 0 && (
                <div className="active-cat-pills">
                  {selectedCategories.map(cat => (
                    <span key={cat} className="active-cat-pill">
                      <span className="pill-text">{cat}</span>
                      <button
                        type="button"
                        className="pill-remove"
                        onClick={() => handleCategoryToggle(cat)}
                        aria-label={`Remove ${cat}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Hierarchical Accordion List */}
              <div className="cat-accordion-list">
                {filteredCategoryHierarchy.map(grp => {
                  const isExpanded = Boolean(expandedGroups[grp.id] ?? true);
                  const isGroupSelected = selectedCategories.includes(grp.name);
                  const activeSubCount = grp.items.filter(sub => selectedCategories.includes(sub.name)).length;

                  return (
                    <div
                      key={grp.id}
                      className={`cat-accordion-item ${isExpanded ? 'open' : ''} ${isGroupSelected || activeSubCount > 0 ? 'has-active' : ''}`}
                    >
                      <div
                        className="cat-group-header"
                        onClick={() => {
                          setExpandedGroups(prev => ({
                            ...prev,
                            [grp.id]: !Boolean(prev[grp.id] ?? true)
                          }));
                        }}
                      >
                        <div className="cat-group-header-left">
                          <span className={`cat-chevron-icon ${isExpanded ? 'open' : ''}`}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </span>
                          <div className="cat-group-name-box">
                            {grp.department && selectedGender === 'All' && (
                              <span className="cat-dept-subpill">{grp.department}</span>
                            )}
                            <span className="cat-group-title-text">{grp.name}</span>
                          </div>
                        </div>

                        <div className="cat-group-header-right" onClick={(e) => e.stopPropagation()}>
                          {activeSubCount > 0 ? (
                            <span className="cat-group-active-tag">
                              {activeSubCount} selected
                            </span>
                          ) : (
                            <span className="cat-group-count">({grp.totalCount})</span>
                          )}

                          <button
                            type="button"
                            className={`cat-select-all-btn ${isGroupSelected ? 'active' : ''}`}
                            title={`Filter all products in ${grp.name}`}
                            onClick={() => handleCategoryToggle(grp.name)}
                          >
                            {isGroupSelected ? '✓ All' : 'All'}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="cat-sub-list">
                          {grp.items.map(sub => {
                            const isChecked = selectedCategories.includes(sub.name);
                            return (
                              <label key={sub.name} className={`cat-sub-item ${isChecked ? 'checked' : ''}`}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleCategoryToggle(sub.name)}
                                />
                                <span className="cat-sub-name">{sub.name}</span>
                                <span className={`cat-sub-count ${sub.count > 0 ? 'has-products' : ''}`}>
                                  ({sub.count})
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
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

            {/* Mobile Drawer Bottom Action Bar */}
            <div className="mobile-sidebar-actions">
              <button
                type="button"
                className="mobile-drawer-clear-btn"
                onClick={handleClearAllFilters}
              >
                Clear All
              </button>
              <button
                type="button"
                className="mobile-drawer-apply-btn"
                onClick={() => setMobileFilterOpen(false)}
              >
                Show {filteredList.length} Products
              </button>
            </div>
          </aside>

          {/* Right Product Grid (4 Columns matching screenshot) */}
          <main className="product-grid-main">
            {loading ? (
              <Loader message="Fetching latest collection from database..." />
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
                        <SafeImage src={prod.image || placeholderSvg} alt={prod.name} className="card-img" />
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
      <Footer />
    </div>
  );
}
