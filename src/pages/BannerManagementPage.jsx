import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import './BannerManagementPage.css';

export default function BannerManagementPage() {
  const { token } = useAuth();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    eyebrow: 'AUTUMN WEAVES · 2026',
    title: '',
    titleHighlight: '',
    subtitle: '',
    image: '',
    ctaText: 'SHOP NOW',
    ctaLink: '#trending',
    isActive: true,
    order: 0
  });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('http://localhost:5000/api/banners/admin', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBanners(data.data || []);
      } else {
        setError(data.message || 'Failed to load banners');
      }
    } catch (err) {
      console.error('Error fetching admin banners:', err);
      setError('Network error loading banners.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [token]);

  const handleOpenAddModal = () => {
    setEditingBanner(null);
    setFormData({
      eyebrow: 'AUTUMN WEAVES · 2026',
      title: '',
      titleHighlight: '',
      subtitle: '',
      image: '',
      ctaText: 'SHOP NOW',
      ctaLink: '#trending',
      isActive: true,
      order: banners.length
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      eyebrow: banner.eyebrow || 'AUTUMN WEAVES · 2026',
      title: banner.title || '',
      titleHighlight: banner.titleHighlight || '',
      subtitle: banner.subtitle || '',
      image: banner.image || '',
      ctaText: banner.ctaText || 'SHOP NOW',
      ctaLink: banner.ctaLink || '#trending',
      isActive: banner.isActive !== undefined ? banner.isActive : true,
      order: banner.order !== undefined ? banner.order : 0
    });
    setIsModalOpen(true);
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const bodyData = new FormData();
    bodyData.append('image', file);

    try {
      setUploadingImage(true);
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: bodyData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData(prev => ({ ...prev, image: data.url }));
      } else {
        alert(data.message || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Error uploading image to server');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.image.trim()) {
      alert('Please fill in the banner Title and Image URL');
      return;
    }

    try {
      const url = editingBanner
        ? `http://localhost:5000/api/banners/${editingBanner._id}`
        : 'http://localhost:5000/api/banners';
      const method = editingBanner ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(editingBanner ? 'Banner updated successfully!' : 'Banner created successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
        setIsModalOpen(false);
        fetchBanners();
      } else {
        alert(data.message || 'Failed to save banner');
      }
    } catch (err) {
      console.error('Error saving banner:', err);
      alert('Failed to connect to server.');
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      const res = await fetch(`http://localhost:5000/api/banners/${banner._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !banner.isActive })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchBanners();
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner slide?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/banners/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchBanners();
      } else {
        alert(data.message || 'Failed to delete banner');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="banner-page-container">
      <AdminSidebar />

      <main className="banner-content-area">
        <header className="banner-header">
          <div className="banner-header-title">
            <h1>Hero Banner Slides</h1>
            <p>Manage homepage hero banners, promotional titles, CTA buttons, and background images</p>
          </div>
          <button className="add-banner-btn" onClick={handleOpenAddModal}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add New Banner</span>
          </button>
        </header>

        {successMsg && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            color: '#4ade80',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '0.9rem'
          }}>
            ✓ {successMsg}
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '0.9rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            Loading hero banners...
          </div>
        ) : banners.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#131b2e',
            borderRadius: '16px',
            border: '1px dashed rgba(255,255,255,0.1)'
          }}>
            <h3 style={{ color: '#fff', marginBottom: '8px' }}>No Banners Configured</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Click "Add New Banner" above to create your first dynamic slide.
            </p>
          </div>
        ) : (
          <div className="banners-grid">
            {banners.map((banner) => (
              <div key={banner._id} className="banner-card">
                <div className="banner-card-img-wrapper">
                  <img src={banner.image} alt={banner.title} className="banner-card-img" />
                  <span className={`banner-badge-status ${banner.isActive ? 'active' : 'inactive'}`}>
                    {banner.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>

                <div className="banner-card-body">
                  <div className="banner-eyebrow">{banner.eyebrow || 'PROMOTION'}</div>
                  <h3 className="banner-title">{banner.title}</h3>
                  {banner.titleHighlight && (
                    <div className="banner-title-highlight">{banner.titleHighlight}</div>
                  )}
                  <p className="banner-subtitle">{banner.subtitle}</p>

                  <div className="banner-meta-bar">
                    <span className="banner-cta-chip">
                      CTA: {banner.ctaText} → {banner.ctaLink}
                    </span>
                    <span>Order: #{banner.order}</span>
                  </div>

                  <div className="banner-card-actions">
                    <button
                      className="banner-action-btn btn-edit"
                      onClick={() => handleOpenEditModal(banner)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </button>

                    <button
                      className="banner-action-btn btn-toggle-active"
                      onClick={() => handleToggleActive(banner)}
                    >
                      {banner.isActive ? 'Hide Slide' : 'Publish Slide'}
                    </button>

                    <button
                      className="banner-action-btn btn-delete"
                      onClick={() => handleDeleteBanner(banner._id)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingBanner ? 'Edit Hero Banner' : 'Add New Hero Banner'}</h2>
                <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveBanner}>
                <div className="form-group">
                  <label>Eyebrow Tag / Header Badge</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="AUTUMN WEAVES · 2026"
                    value={formData.eyebrow}
                    onChange={(e) => setFormData({ ...formData, eyebrow: e.target.value })}
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Main Title *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Timeless Silks."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Title Highlight (Gold Accent)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Tradition in Every Weave."
                      value={formData.titleHighlight}
                      onChange={(e) => setFormData({ ...formData, titleHighlight: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Subtitle Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Discover our exquisite collection of pure silk sarees..."
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Banner Image URL *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      required
                    />
                    <label style={{
                      background: 'rgba(212, 175, 55, 0.2)',
                      color: '#d4af37',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}>
                      {uploadingImage ? 'Uploading...' : 'Upload File'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  {formData.image && (
                    <div className="image-preview-container">
                      <img src={formData.image} alt="Preview" className="image-preview-img" />
                    </div>
                  )}
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>CTA Button Text</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="SHOP NOW"
                      value={formData.ctaText}
                      onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>CTA Button Link</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="#trending or /products"
                      value={formData.ctaLink}
                      onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Display Order Priority</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '26px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        style={{ accentColor: '#d4af37', width: '18px', height: '18px' }}
                      />
                      <span>Active (Visible on Homepage)</span>
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-save">
                    {editingBanner ? 'Update Slide' : 'Publish Banner Slide'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
