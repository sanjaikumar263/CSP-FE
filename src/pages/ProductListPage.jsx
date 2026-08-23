import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { API_BASE_URL } from '../config';
import './ProductListPage.css';

const STATUS_LABEL = { published: 'Published', draft: 'Draft', outofstock: 'Out of Stock' };

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [modal, setModal] = useState(null); // null | { type: 'single', id } | { type: 'bulk' }
  const [searchQuery, setSearchQuery] = useState('');
  const [catFilter, setCatFilter] = useState('All Categories');
  const [genderFilter, setGenderFilter] = useState('All Genders');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/products`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        const mapped = data.data.map((item, idx) => ({
          id: item._id || item.id || idx + 1,
          _id: item._id,
          sw: `sw${(idx % 8) + 1}`,
          img: item.image || item.images?.[0] || '',
          name: item.name,
          sku: item.sku || `CSP${item._id?.slice(-6) || '100'}`,
          cat: item.category || 'Soft Silk',
          gender: item.gender || 'Women',
          price: item.currency ? `${item.currency} ${item.price?.toFixed(2)}` : `MYR ${item.price}`,
          stock: item.stockQuantity ?? 10,
          status: item.status || (item.inStock ? 'published' : 'outofstock'),
          date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '16 Jul 2026'
        }));
        setProducts(mapped);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.warn('Backend API connection error:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery.trim() || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase().trim());

    const matchesCat = catFilter === 'All Categories' || p.cat === catFilter;
    const matchesGender = genderFilter === 'All Genders' || p.gender.toLowerCase() === genderFilter.toLowerCase();

    let matchesStatus = true;
    if (statusFilter === 'Published') matchesStatus = p.status === 'published';
    else if (statusFilter === 'Draft') matchesStatus = p.status === 'draft';
    else if (statusFilter === 'Out of Stock') matchesStatus = p.status === 'outofstock';

    return matchesSearch && matchesCat && matchesGender && matchesStatus;
  });

  const allChecked = filteredProducts.length > 0 && selected.size === filteredProducts.length;
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(filteredProducts.map(p => p.id)));
  const toggleRow = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const openDeleteSingle = (id) => setModal({ type: 'single', id });
  const openDeleteBulk = () => setModal({ type: 'bulk' });
  const closeModal = () => setModal(null);

  const confirmDelete = async () => {
    const deleteProductImages = async (targetProd) => {
      if (targetProd?.img && targetProd.img.startsWith('http')) {
        try {
          await fetch(`${API_BASE_URL}/upload`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ public_id: targetProd.img })
          });
        } catch (e) {
          console.warn('Cloudinary image delete warning:', e);
        }
      }
    };

    if (modal?.type === 'single') {
      const targetId = modal.id;
      const targetProd = products.find(p => p.id === targetId);
      if (targetProd?._id) {
        try {
          await fetch(`${API_BASE_URL}/products/${targetProd._id}`, { method: 'DELETE' });
          await deleteProductImages(targetProd);
        } catch (e) {
          console.warn('API delete warning:', e);
        }
      }
      setProducts(ps => ps.filter(p => p.id !== targetId));
      setSelected(s => { const n = new Set(s); n.delete(targetId); return n; });
    } else {
      for (const targetId of selected) {
        const targetProd = products.find(p => p.id === targetId);
        if (targetProd?._id) {
          try {
            await fetch(`${API_BASE_URL}/products/${targetProd._id}`, { method: 'DELETE' });
            await deleteProductImages(targetProd);
          } catch (e) {
            console.warn('API delete warning:', e);
          }
        }
      }
      setProducts(ps => ps.filter(p => !selected.has(p.id)));
      setSelected(new Set());
    }
    closeModal();
  };

  const modalTitle = modal?.type === 'bulk'
    ? `Delete ${selected.size} products?`
    : 'Delete this product?';
  const modalBody = modal?.type === 'bulk'
    ? 'Selected products will be permanently removed from your catalog. This action cannot be undone.'
    : 'This will permanently remove it from your catalog. This action cannot be undone.';

  return (
    <div className="shell">
      <AdminSidebar />
      <main>
        <div className="topbar">
          <div>
            <h1>Products</h1>
            <div className="sub">{filteredProducts.length} of {products.length} products displayed</div>
          </div>
          <Link className="btn-gold" to="/admin/products/add">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add Product
          </Link>
        </div>

        <div className="filter-bar">
          <div className="search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink-soft)" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>
            </svg>
            <input
              type="text"
              placeholder="Search products by name or SKU…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select className="filter-select" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            <option>All Categories</option>
            <option>Soft Silk</option><option>Kanchipuram Silk</option>
            <option>Banarasi Silk</option><option>Tussar Silk</option>
            <option>Ethnic Sarees</option><option>Fancy Saree</option>
            <option>Silk Cotton</option><option>Kanchi Cotton</option>
            <option>Men's Wear</option><option>Accessories</option>
          </select>
          <select className="filter-select" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
            <option>All Genders</option>
            <option>Women</option>
            <option>Men</option>
          </select>
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All Status</option>
            <option>Published</option><option>Draft</option><option>Out of Stock</option>
          </select>
        </div>

        {selected.size > 0 && (
          <div className="bulk-bar show">
            <span><span>{selected.size}</span> product(s) selected</span>
            <button className="btn-del" onClick={openDeleteBulk}>Delete selected</button>
          </div>
        )}

        <div className="panel">
          <table>
            <thead>
              <tr>
                <th style={{ width: '30px' }}>
                  <input type="checkbox" checked={allChecked} onChange={toggleAll}/>
                </th>
                <th>Product</th><th>Category</th><th>Gender</th><th>Price</th>
                <th>Stock</th><th>Status</th><th>Added</th>
                <th style={{ width: '90px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-soft)' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                        <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10"/>
                      </svg>
                      Loading products from database...
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-soft)' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>No products found</div>
                    <div style={{ fontSize: '13px', marginBottom: '16px' }}>There are no products matching your search or filters.</div>
                    <Link to="/admin/products/add" className="btn-gold" style={{ display: 'inline-flex', padding: '8px 16px', fontSize: '12px' }}>
                      + Add New Product
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id}>
                    <td><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleRow(p.id)}/></td>
                    <td>
                      <div className="prod-cell">
                        {p.img ? (
                          <img src={p.img} alt={p.name} className="swatch" style={{ objectFit: 'cover' }} />
                        ) : (
                          <div className={`swatch ${p.sw}`}></div>
                        )}
                        <div><div className="n">{p.name}</div><div className="s">SKU {p.sku}</div></div>
                      </div>
                    </td>
                    <td>{p.cat}</td>
                    <td><span className="pill" style={{ background: '#f1f5f9', color: '#334155', fontWeight: 600 }}>{p.gender}</span></td>
                    <td>{p.price}</td>
                    <td>{p.stock}</td>
                    <td><span className={`pill ${p.status}`}>{STATUS_LABEL[p.status] || p.status}</span></td>
                    <td>{p.date}</td>
                    <td>
                      <div className="row-actions">
                        <Link className="icon-act" to={`/admin/products/edit/${p._id || p.id}`} title="Edit">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/>
                          </svg>
                        </Link>
                        <button className="icon-act del" title="Delete" onClick={() => openDeleteSingle(p.id)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="pager">
            <span>Showing {filteredProducts.length} of {products.length} products</span>
            <div className="pages">
              <button aria-label="Previous">‹</button>
              <button className="active">1</button>
              <button>2</button><button>3</button>
              <button aria-label="Next">›</button>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Modal */}
      {modal && (
        <div className="modal-backdrop show" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="warn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 9v4M12 17h.01"/>
                <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>
              </svg>
            </div>
            <h3>{modalTitle}</h3>
            <p>{modalBody}</p>
            <div className="actions">
              <button className="cancel" onClick={closeModal}>Cancel</button>
              <button className="confirm" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
