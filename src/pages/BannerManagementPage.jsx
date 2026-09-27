import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { compressImage } from '../utils/imageCompressor';
import ImageCropperModal from '../components/ImageCropperModal';
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

  // Cropper State
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState('');
  const [cropperUploading, setCropperUploading] = useState(false);
  const [croppingTargetField, setCroppingTargetField] = useState('image'); // 'image' or 'mobileImage'
  const [cropperRatioIndex, setCropperRatioIndex] = useState(0); // 0 = Desktop 16:7, 1 = Mobile 4:5

  // Form State
  const [formData, setFormData] = useState({
    eyebrow: '',
    title: '',
    titleHighlight: '',
    subtitle: '',
    image: '',
    mobileImage: '',
    ctaText: 'SHOP NOW',
    ctaLink: '/products',
    isActive: true,
    order: 0
  });

  const PLACEHOLDER_PRESETS = [
    {
      label: "👗 Women's Collection",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
      mobileImage: "",
      eyebrow: "HERITAGE SAREES & LEHENGAS",
      title: "Women's Collection",
      titleHighlight: "Exquisite Silk Sarees",
      subtitle: "Exquisite Banarasi, Kanchipuram & Soft Silk Sarees crafted for timeless grace.",
      ctaText: "EXPLORE WOMEN",
      ctaLink: "/gender/women"
    },
    {
      label: "👔 Men's Collection",
      image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1200&q=80",
      mobileImage: "",
      eyebrow: "ROYAL TRADITIONAL WEAR",
      title: "Men's Collection",
      titleHighlight: "Pure Zari & Silk Outfits",
      subtitle: "Pure Silk Shirts, Gold Zari Dhotis & Handcrafted Kurta Sets for regal style.",
      ctaText: "EXPLORE MEN",
      ctaLink: "/gender/men"
    },
    {
      label: "🌸 Kanchipuram Silk",
      image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80",
      mobileImage: "",
      eyebrow: "ROYAL HERITAGE 2026",
      title: "Kanchipuram Silk Splendor",
      titleHighlight: "Woven with Pure Zari",
      subtitle: "Handcrafted by master weavers with generational expertise and timeless elegance.",
      ctaText: "SHOP KANCHIPURAM",
      ctaLink: "/products?category=Kanchipuram Silk"
    },
    {
      label: "👑 Royal Kurta & Dhoti",
      image: "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=1200&q=80",
      mobileImage: "",
      eyebrow: "FESTIVE ESSENTIALS",
      title: "Royal Kurta & Dhoti Sets",
      titleHighlight: "Crafted for Celebrations",
      subtitle: "Embracing authentic South Indian heritage with contemporary regal style.",
      ctaText: "SHOP MEN'S WEAR",
      ctaLink: "/gender/men"
    },
    {
      label: "💃 Bridal Silk Lehenga",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=80",
      mobileImage: "",
      eyebrow: "BRIDAL EDITIONS",
      title: "Grand Wedding Collection",
      titleHighlight: "Memories Woven in Gold",
      subtitle: "Regal bridal lehengas adorned with intricate hand-embroidered zari.",
      ctaText: "EXPLORE BRIDAL",
      ctaLink: "/products?category=Lehengas"
    }
  ];

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE_URL}/banners/admin`, {
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
      eyebrow: '',
      title: '',
      titleHighlight: '',
      subtitle: '',
      image: '',
      mobileImage: '',
      ctaText: 'SHOP NOW',
      ctaLink: '/products',
      isActive: true,
      order: banners.length
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      eyebrow: banner.eyebrow || '',
      title: banner.title || '',
      titleHighlight: banner.titleHighlight || '',
      subtitle: banner.subtitle || '',
      image: banner.image || '',
      mobileImage: banner.mobileImage || '',
      ctaText: banner.ctaText || 'SHOP NOW',
      ctaLink: banner.ctaLink || '/products',
      isActive: banner.isActive !== undefined ? banner.isActive : true,
      order: banner.order !== undefined ? banner.order : 0
    });
    setIsModalOpen(true);
  };

  // When a file is selected from disk, open Image Cropper modal
  const handleImageFileSelect = (e, targetField = 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';
    setCroppingTargetField(targetField);
    setCropperRatioIndex(targetField === 'mobileImage' ? 1 : 0);

    const reader = new FileReader();
    reader.onload = () => {
      setCropperImageSrc(reader.result);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  // Open cropper with existing image URL
  const handleCropCurrentImage = (targetField = 'image') => {
    const src = targetField === 'mobileImage' ? formData.mobileImage : formData.image;
    if (!src) return;
    setCroppingTargetField(targetField);
    setCropperRatioIndex(targetField === 'mobileImage' ? 1 : 0);
    setCropperImageSrc(src);
    setCropperOpen(true);
  };

  // Upload cropped image to server
  const handleCropSave = async (croppedBlob, croppedFile) => {
    try {
      setCropperUploading(true);
      const compressedFile = await compressImage(croppedFile);
      const bodyData = new FormData();
      bodyData.append('image', compressedFile);

      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: bodyData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData(prev => ({ ...prev, [croppingTargetField]: data.url }));
        setCropperOpen(false);
        setSuccessMsg(
          croppingTargetField === 'mobileImage'
            ? 'Mobile banner image cropped and uploaded successfully!'
            : 'Desktop banner image cropped and uploaded successfully!'
        );
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        alert(data.message || 'Failed to upload cropped image');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Error uploading cropped image to server');
    } finally {
      setCropperUploading(false);
    }
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!formData.image.trim()) {
      alert('Please provide at least a Desktop Banner Image (or click Upload & Crop)');
      return;
    }

    try {
      const url = editingBanner
        ? `${API_BASE_URL}/banners/${editingBanner._id}`
        : `${API_BASE_URL}/banners`;
      const method = editingBanner ? 'PUT' : 'POST';

      // Send user's fields as entered - do not automatically add 'Hero Banner Slide' when title is empty
      const payload = {
        ...formData,
        title: formData.title.trim(),
        titleHighlight: formData.titleHighlight.trim(),
        subtitle: formData.subtitle.trim(),
        eyebrow: formData.eyebrow.trim(),
        image: formData.image.trim(),
        mobileImage: formData.mobileImage.trim(),
        ctaText: 'SHOP NOW',
        ctaLink: formData.ctaLink.trim() || '/products'
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
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
      const res = await fetch(`${API_BASE_URL}/banners/${banner._id}`, {
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
      const res = await fetch(`${API_BASE_URL}/banners/${id}`, {
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
                <div className="banner-card-img-wrapper" style={{ position: 'relative' }}>
                  <img src={banner.image} alt={banner.title || 'Banner'} className="banner-card-img" />
                  <span className={`banner-badge-status ${banner.isActive ? 'active' : 'inactive'}`}>
                    {banner.isActive ? 'Active' : 'Hidden'}
                  </span>
                  {banner.mobileImage && (
                    <span style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '8px',
                      background: 'rgba(10, 48, 93, 0.9)',
                      color: '#ffc73a',
                      fontSize: '10.5px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 199, 58, 0.4)',
                      backdropFilter: 'blur(4px)'
                    }}>
                      📱 Mobile Image
                    </span>
                  )}
                </div>

                <div className="banner-card-body">
                  {banner.eyebrow && <div className="banner-eyebrow">{banner.eyebrow}</div>}
                  {banner.title ? (
                    <h3 className="banner-title">{banner.title}</h3>
                  ) : (
                    <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '8px' }}>
                      [Clean Image Banner · No Title]
                    </div>
                  )}
                  {banner.titleHighlight && (
                    <div className="banner-title-highlight">{banner.titleHighlight}</div>
                  )}
                  {banner.subtitle && <p className="banner-subtitle">{banner.subtitle}</p>}

                  <div className="banner-meta-bar">
                    <span className="banner-cta-chip">
                      🔗 Link: {banner.ctaLink || '/products'}
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
                {/* Desktop Banner Image Upload */}
                <div className="form-group" style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#f8fafc' }}>🖥️ Desktop Banner Image (Full Screen / Landscape) *</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Ratio: 16:7 or 16:9</span>
                  </label>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://example.com/desktop-banner.jpg"
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
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      border: '1px solid rgba(212, 175, 55, 0.4)'
                    }}>
                      <span>📷</span>
                      <span>{cropperUploading && croppingTargetField === 'image' ? 'Processing...' : 'Upload & Crop'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileSelect(e, 'image')}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  {formData.image && (
                    <div className="image-preview-container" style={{ position: 'relative', marginTop: '10px' }}>
                      <img src={formData.image} alt="Desktop Preview" className="image-preview-img" style={{ maxHeight: '180px', width: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => handleCropCurrentImage('image')}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(15, 23, 42, 0.9)',
                          backdropFilter: 'blur(8px)',
                          color: '#d4af37',
                          border: '1px solid rgba(212, 175, 55, 0.45)',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>✂</span>
                        <span>Crop Desktop Image</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Banner Image Upload (Dedicated for Mobile Responses) */}
                <div className="form-group" style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.25)', marginTop: '14px' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#ffc73a' }}>📱 Mobile Banner Image (Optimized for Mobile Responses)</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Ratio: 4:5 Portrait / Vertical</span>
                  </label>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 8px' }}>
                    Uploaded specifically for mobile phones. If left empty, the desktop image will be automatically used.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://example.com/mobile-banner.jpg"
                      value={formData.mobileImage}
                      onChange={(e) => setFormData({ ...formData, mobileImage: e.target.value })}
                    />
                    <label style={{
                      background: 'rgba(56, 189, 248, 0.2)',
                      color: '#38bdf8',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      border: '1px solid rgba(56, 189, 248, 0.4)'
                    }}>
                      <span>📷</span>
                      <span>{cropperUploading && croppingTargetField === 'mobileImage' ? 'Processing...' : 'Upload & Crop Mobile'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileSelect(e, 'mobileImage')}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  {formData.mobileImage && (
                    <div className="image-preview-container" style={{ position: 'relative', marginTop: '10px' }}>
                      <img src={formData.mobileImage} alt="Mobile Preview" className="image-preview-img" style={{ maxHeight: '180px', width: '100%', objectFit: 'contain', background: '#0a192f' }} />
                      <button
                        type="button"
                        onClick={() => handleCropCurrentImage('mobileImage')}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(15, 23, 42, 0.9)',
                          backdropFilter: 'blur(8px)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.45)',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>✂</span>
                        <span>Crop Mobile Image</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Banner Click Target Link */}
                <div className="form-group" style={{ marginTop: '14px' }}>
                  <label style={{ fontWeight: 600, color: '#f8fafc' }}>
                    🔗 Banner Destination Link (Clicked Anywhere on Slide)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="/products or /gender/women or https://..."
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                  />
                  <small style={{ color: '#94a3b8', fontSize: '11.5px', marginTop: '4px', display: 'block' }}>
                    Users can click anywhere on the full-screen banner to navigate to this page.
                  </small>
                </div>

                {/* Optional Text Details Accordion/Section */}
                <div style={{ marginTop: '16px', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', marginBottom: '10px' }}>
                    Optional Slide Text & Overlays <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '12px' }}>(Leave empty if image already has text)</span>
                  </div>

                  <div className="form-group">
                    <label>Eyebrow Tag / Header Badge (Optional)</label>
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
                      <label>Main Title (Optional)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Timeless Silks."
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Title Highlight (Gold Accent - Optional)</label>
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
                    <label>Subtitle Description (Optional)</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Discover our exquisite collection of pure silk sarees..."
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginTop: '14px' }}>
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

        {/* Interactive Image Cropper Modal */}
        <ImageCropperModal
          isOpen={cropperOpen}
          imageSrc={cropperImageSrc}
          onClose={() => setCropperOpen(false)}
          onCropComplete={handleCropSave}
          isProcessing={cropperUploading}
          defaultRatioIndex={cropperRatioIndex}
        />
      </main>
    </div>
  );
}
