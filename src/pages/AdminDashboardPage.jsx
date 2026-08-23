import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import './AdminDashboardPage.css';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeOffers: 0,
    activeBanners: 0,
    totalCategories: 0
  });

  const [recentProducts, setRecentProducts] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch products, offers, banners in parallel
        const [prodRes, offerRes, bannerRes] = await Promise.all([
          fetch('http://localhost:5000/api/products'),
          fetch('http://localhost:5000/api/offers'),
          fetch('http://localhost:5000/api/banners')
        ]);

        const prodData = await prodRes.json();
        const offerData = await offerRes.json();
        const bannerData = await bannerRes.json();

        const products = (prodRes.ok && prodData.products) ? prodData.products : [];
        const offers = (offerRes.ok && offerData.data) ? offerData.data : [];
        const banners = (bannerRes.ok && bannerData.data) ? bannerData.data : [];

        // Compute categories
        const catMap = {};
        products.forEach(p => {
          const cat = p.category || 'General';
          catMap[cat] = (catMap[cat] || 0) + 1;
        });

        const totalCatCount = Object.keys(catMap).length;
        const totalProds = products.length;

        const colors = ['#0284c7', '#38bdf8', '#22c55e', '#eab308', '#ec4899', '#a855f7'];
        const breakdown = Object.keys(catMap).map((catName, idx) => {
          const count = catMap[catName];
          const pct = totalProds > 0 ? Math.round((count / totalProds) * 100) : 0;
          return {
            name: catName,
            count: count,
            pct: `${pct}%`,
            color: colors[idx % colors.length]
          };
        });

        setStats({
          totalProducts: totalProds,
          activeOffers: offers.filter(o => o.isActive).length,
          activeBanners: banners.filter(b => b.isActive).length,
          totalCategories: totalCatCount
        });

        setRecentProducts(products.slice(0, 5));
        setCategoryBreakdown(breakdown);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="shell">
      <AdminSidebar />

      <main>
        <div className="topbar">
          <div>
            <h1>Admin Dashboard</h1>
            <div className="sub">Welcome back — here is your real-time store overview & management suite.</div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="quick-action-grid">
          <Link to="/admin/products" className="quick-action-card">
            <div className="quick-icon-wrap">🛍️</div>
            <div className="quick-action-title">Manage Products</div>
            <div className="quick-action-sub">View & Edit Catalog</div>
          </Link>

          <Link to="/admin/products/add" className="quick-action-card">
            <div className="quick-icon-wrap">➕</div>
            <div className="quick-action-title">Add New Product</div>
            <div className="quick-action-sub">Upload New Stock</div>
          </Link>

          <Link to="/admin/banners" className="quick-action-card">
            <div className="quick-icon-wrap">🎨</div>
            <div className="quick-action-title">Hero Banners</div>
            <div className="quick-action-sub">Homepage Sliders</div>
          </Link>

          <Link to="/admin/offers" className="quick-action-card">
            <div className="quick-icon-wrap">🏷️</div>
            <div className="quick-action-title">Special Offers</div>
            <div className="quick-action-sub">Promotions & Discounts</div>
          </Link>

          <Link to="/admin/settings" className="quick-action-card">
            <div className="quick-icon-wrap">📍</div>
            <div className="quick-action-title">Store Settings</div>
            <div className="quick-action-sub">Contact & About Us</div>
          </Link>
        </div>

        {/* Live Statistics Cards */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="k">Total Products Catalog</div>
            <div className="v">{loading ? '...' : stats.totalProducts}</div>
            <span className="trend up">✓ Active Catalog</span>
          </div>

          <div className="stat-card">
            <div className="k">Active Special Offers</div>
            <div className="v">{loading ? '...' : stats.activeOffers}</div>
            <span className="trend neutral">🏷️ Promo Banners</span>
          </div>

          <div className="stat-card">
            <div className="k">Hero Banner Sliders</div>
            <div className="v">{loading ? '...' : stats.activeBanners}</div>
            <span className="trend up">🎨 Live Sliders</span>
          </div>

          <div className="stat-card">
            <div className="k">Product Categories</div>
            <div className="v">{loading ? '...' : stats.totalCategories}</div>
            <span className="trend neutral">📦 Collections</span>
          </div>
        </div>

        {/* Category Breakdown & Recent Additions */}
        <div className="row split">
          {/* Recent Products */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Recently Added Products</h3>
                <div className="sub">Latest additions to your store catalog</div>
              </div>
              <Link to="/admin/products" className="panel-link">View all products →</Link>
            </div>

            {loading ? (
              <p style={{ color: '#94a3b8' }}>Loading products...</p>
            ) : recentProducts.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>No products found in catalog.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProducts.map(p => (
                    <tr key={p._id}>
                      <td>
                        <div className="product-row-info">
                          <img
                            src={p.image || 'https://via.placeholder.com/40'}
                            alt={p.name}
                            className="prod-thumb-img"
                          />
                          <span className="prod-title-text">{p.name}</span>
                        </div>
                      </td>
                      <td>{p.category || 'Sarees'}</td>
                      <td style={{ fontWeight: '700', color: '#ffffff' }}>
                        MYR {p.price ? p.price.toLocaleString() : '0'}
                      </td>
                      <td>
                        <span className={`pill-stock ${p.inStock !== false ? 'in-stock' : 'low-stock'}`}>
                          {p.inStock !== false ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Category Distribution */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Catalog by Category</h3>
                <div className="sub">Share of products across collections</div>
              </div>
            </div>
            <div className="cat-list">
              {categoryBreakdown.length === 0 ? (
                <p style={{ color: '#94a3b8' }}>No categories data.</p>
              ) : (
                categoryBreakdown.map(c => (
                  <div key={c.name} className="cat-row-wrap">
                    <div className="cat-name-row">
                      <span className="name">{c.name}</span>
                      <span className="amt">{c.count} items ({c.pct})</span>
                    </div>
                    <div className="cat-bar-track">
                      <div className="cat-bar-fill" style={{ width: c.pct, background: c.color }}></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="footer-note">Chennai Silk Palace Admin Console · Powered by Live Database API</div>
      </main>
    </div>
  );
}
