import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, BACKEND_URL } from '../config';
import './OfferManagementPage.css';

export default function OfferManagementPage() {
  const { token } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    badge: 'GRAND FESTIVE SALE',
    title: '',
    subtitle: '',
    discountText: 'FLAT 35% OFF',
    code: 'SILK35',
    image: '',
    ctaText: 'EXPLORE OFFERS',
    ctaLink: '/products?category=Sarees',
    validTill: 'Valid till 30th Sept 2026',
    isActive: true,
    order: 0
  });

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE_URL}/offers/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOffers(data.data || []);
      } else {
        setError(data.message || 'Failed to load offers');
      }
    } catch (err) {
      console.error('Error fetching admin offers:', err);
      setError('Network error loading offers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [token]);

  const handleOpenAddModal = () => {
    setEditingOffer(null);
    setFormData({
      badge: 'GRAND FESTIVE SALE',
      title: '',
      subtitle: '',
      discountText: 'FLAT 35% OFF',
      code: 'SILK35',
      image: '',
      ctaText: 'EXPLORE OFFERS',
      ctaLink: '/products?category=Sarees',
      validTill: 'Valid till 30th Sept 2026',
      isActive: true,
      order: offers.length
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (offer) => {
    setEditingOffer(offer);
    setFormData({
      badge: offer.badge || 'GRAND FESTIVE SALE',
      title: offer.title || '',
      subtitle: offer.subtitle || '',
      discountText: offer.discountText || 'FLAT 35% OFF',
      code: offer.code || 'SILK35',
      image: offer.image || '',
      ctaText: offer.ctaText || 'EXPLORE OFFERS',
      ctaLink: offer.ctaLink || '/products?category=Sarees',
      validTill: offer.validTill || 'Valid till 30th Sept 2026',
      isActive: offer.isActive !== undefined ? offer.isActive : true,
      order: offer.order !== undefined ? offer.order : 0
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
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: bodyData
      });
      const data = await res.json();
      if (res.ok && (data.url || data.filePath)) {
        const imageUrl = data.url || (data.filePath ? (data.filePath.startsWith('http') ? data.filePath : `${BACKEND_URL}${data.filePath}`) : '');
        setFormData(prev => ({ ...prev, image: imageUrl }));
        setSuccessMsg('Image uploaded successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setError(data.message || 'Image upload failed.');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.image) {
      setError('Title and Image are required.');
      return;
    }

    try {
      const url = editingOffer
        ? `${API_BASE_URL}/offers/${editingOffer._id}`
        : `${API_BASE_URL}/offers`;
      const method = editingOffer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(editingOffer ? 'Offer updated!' : 'Offer created!');
        setTimeout(() => setSuccessMsg(''), 3000);
        setIsModalOpen(false);
        fetchOffers();
      } else {
        setError(data.message || 'Failed to save offer');
      }
    } catch (err) {
      console.error('Error saving offer:', err);
      setError('Server error saving offer.');
    }
  };

  const handleToggleStatus = async (offerId, currentStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/offers/${offerId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Offer is now ${!currentStatus ? 'ACTIVE (ON)' : 'INACTIVE (OFF)'}`);
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchOffers();
      } else {
        setError(data.message || 'Failed to toggle status');
      }
    } catch (err) {
      console.error('Error toggling status:', err);
      setError('Network error toggling status.');
    }
  };

  const handleDelete = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/offers/${offerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Offer deleted successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchOffers();
      } else {
        setError(data.message || 'Failed to delete offer');
      }
    } catch (err) {
      console.error('Error deleting offer:', err);
      setError('Network error deleting offer.');
    }
  };

  return (
    <div className="offer-mgmt-container">
      <AdminSidebar />

      <main className="offer-mgmt-main">
        <div className="offer-mgmt-header">
          <div className="offer-mgmt-title">
            <h1>Special Offers & Promotions</h1>
            <p>Manage home page offer banners, discount codes, and live ON/OFF status.</p>
          </div>
          <button className="add-offer-btn" onClick={handleOpenAddModal}>
            <span>+ Add New Offer</span>
          </button>
        </div>

        {error && <div className="alert-msg error">{error}</div>}
        {successMsg && <div className="alert-msg success">{successMsg}</div>}

        {loading ? (
          <div className="loading-state">
            <p>Loading promotional offers...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="empty-state">
            <p>No promotional offers found.</p>
            <button className="add-offer-btn" onClick={handleOpenAddModal}>
              Create First Offer
            </button>
          </div>
        ) : (
          <div className="offers-grid">
            {offers.map((offer) => (
              <div key={offer._id} className={`offer-card ${!offer.isActive ? 'inactive' : ''}`}>
                <div className="offer-card-preview">
                  <img src={offer.image} alt={offer.title} className="offer-card-img" />
                  <span className="offer-badge-pill">{offer.badge || 'PROMO'}</span>
                  <span className={`offer-status-badge ${offer.isActive ? 'active' : 'inactive'}`}>
                    <span className="status-dot"></span>
                    {offer.isActive ? 'LIVE ON SITE' : 'OFF (DISABLED)'}
                  </span>
                </div>

                <div className="offer-card-body">
                  <h3 className="offer-title">{offer.title}</h3>
                  <p className="offer-subtitle">{offer.subtitle}</p>

                  <div className="offer-details-row">
                    <div className="offer-meta-item">Discount: <strong>{offer.discountText}</strong></div>
                    <div className="offer-meta-item">Code: <strong>{offer.code}</strong></div>
                    <div className="offer-meta-item">Expiry: {offer.validTill}</div>
                  </div>

                  <div className="offer-card-actions">
                    <button
                      className={`toggle-switch-btn ${offer.isActive ? 'on' : 'off'}`}
                      onClick={() => handleToggleStatus(offer._id, offer.isActive)}
                      title="Click to toggle display status on Home Page"
                    >
                      {offer.isActive ? '🟢 Display ON' : '🔴 Display OFF'}
                    </button>

                    <div className="action-buttons-group">
                      <button
                        className="btn-icon-action"
                        onClick={() => handleOpenEditModal(offer)}
                        title="Edit Offer"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon-action delete"
                        onClick={() => handleDelete(offer._id)}
                        title="Delete Offer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingOffer ? 'Edit Promotional Offer' : 'Add New Promotional Offer'}</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label>Badge / Eyebrow Text</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. GRAND FESTIVE SALE"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Coupon Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. SILK35"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Offer Main Title *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Exclusive Silk Extravaganza"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Subtitle / Description</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="e.g. Get up to 35% OFF on pure Kanchipuram & Banarasi silk sarees."
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                ></textarea>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Discount Badge Text</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. FLAT 35% OFF"
                    value={formData.discountText}
                    onChange={(e) => setFormData({ ...formData, discountText: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Validity / Expiry Text</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Valid till 30th Sept 2026"
                    value={formData.validTill}
                    onChange={(e) => setFormData({ ...formData, validTill: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Banner Image URL *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
                <div style={{ marginTop: '8px' }}>
                  <label style={{ fontSize: '11.5px', color: '#94a3b8' }}>Or Upload File:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    disabled={uploadingImage}
                    style={{ fontSize: '12px', marginTop: '4px', color: '#cbd5e1' }}
                  />
                  {uploadingImage && <span style={{ fontSize: '11px', color: '#60a5fa', marginLeft: '8px' }}>Uploading...</span>}
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Button Text</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. EXPLORE OFFERS"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Button Link</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. /products?category=Sarees"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActiveCheck" style={{ cursor: 'pointer' }}>
                  Enable Offer immediately on Home Page (ON)
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingOffer ? 'Save Changes' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
