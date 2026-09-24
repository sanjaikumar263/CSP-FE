import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, BACKEND_URL } from '../config';
import { compressImage } from '../utils/imageCompressor';
import defaultOwnerImg from '../assets/owner_image_full.jpg';
import ImageCropperModal from '../components/ImageCropperModal';
import './StoreInfoManagementPage.css';

export default function StoreInfoManagementPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('contact'); // 'contact' | 'about' | 'timeline'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Cropper State for Director Image
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState('');
  const [cropperUploading, setCropperUploading] = useState(false);

  const [formData, setFormData] = useState({
    // Contact & Address Details
    phone: '03 33727272',
    altPhone: '+60 3 3372 7272',
    email: 'info@chennaisilkpalace.com',
    supportEmail: 'support@chennaisilkpalace.com',
    address: 'No. 1, Jalan Sultan Iskandar, 30000 Ipoh, Perak, Malaysia.',
    businessHours: 'Daily: 10:00 AM - 9:30 PM',
    whatsapp: '+60123456789',
    facebook: '#facebook',
    instagram: '#instagram',
    youtube: '#youtube',

    // About Us Content
    heroSubtitleTag: 'ABOUT CHENNAI SILK PALACE',
    heroTitle: 'A Legacy of Trust, Tradition & Excellence',
    heroSubtitle: 'Crafting elegance and preserving timeless Indian textile traditions for over four decades in Malaysia.',
    directorName: 'Mr. Thanasekaran Vellaikkoothan',
    directorRole: 'Director, Chennai Silk Palace Sdn. Bhd.',
    directorQuote: 'Behind every great brand is a visionary whose passion transforms dreams into reality. For over four decades, Mr. Thanasekaran Vellaikkoothan has been a respected pioneer in Malaysia’s textile industry, building Chennai Silk Palace into one of the country’s most trusted and admired destinations for authentic Indian textiles and traditional attire.',
    directorBody: 'Driven by a commitment to quality, integrity, authenticity, and exceptional customer service, he has earned the confidence of generations of customers. Today, Chennai Silk Palace is more than a textile retailer — it is a household name synonymous with elegance, heritage, and timeless craftsmanship.',
    directorYears: '40+',
    directorImage: '',
    footerAboutText: 'Your ultimate destination for exquisite silk sarees and traditional Indian wear. Experience timeless elegance, handcrafted with passion.',
    visionText: 'To preserve the timeless beauty of Indian textiles while continuously delivering quality, authenticity, innovation, and exceptional customer experiences for generations to come.',
    missionText: 'To be Malaysia’s most trusted destination for premium Indian textiles by offering authentic products, outstanding value, personalised service, and an unforgettable shopping experience, while preserving cultural heritage and making a meaningful contribution to the community.',

    // Timeline Array
    timeline: [
      {
        year: '1985',
        title: 'The Early Vision',
        description: 'Mr. Thanasekaran’s entrepreneurial journey began in 1985 with a clear vision to bring the finest Indian textiles to customers in Malaysia.'
      },
      {
        year: '1992',
        title: 'Wholesale Operations Established',
        description: 'In 1992, he officially established his wholesale textile company in Malaysia under his late father’s name.'
      },
      {
        year: '2004 - 2006',
        title: 'Creating an Iconic Landmark',
        description: 'A defining milestone came in 2004, when Mr. Thanasekaran acquired the historic Standard Chartered Bank building in Klang.'
      },
      {
        year: '2012',
        title: 'Ipoh Branch Expansion',
        description: 'The opening of the Ipoh showroom brought Chennai Silk Palace’s signature quality and exceptional service closer to customers.'
      },
      {
        year: '2013',
        title: 'Penang Branch Expansion',
        description: 'The Penang showroom further strengthened the brand’s nationwide presence.'
      }
    ]
  });

  const fetchStoreInfo = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE_URL}/store-info`);
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setFormData(prev => ({
          ...prev,
          ...data.data
        }));
      }
    } catch (err) {
      console.error('Error fetching store info:', err);
      setError('Failed to load store information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreInfo();
  }, []);

  // When selecting an image file for Director, open the cropper
  const handleImageFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    const reader = new FileReader();
    reader.onload = () => {
      setCropperImageSrc(reader.result);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  // Open cropper with existing director image
  const handleCropCurrentImage = () => {
    const src = formData.directorImage || defaultOwnerImg;
    setCropperImageSrc(src);
    setCropperOpen(true);
  };

  // Upload cropped director image to server
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
      if (res.ok && (data.url || data.filePath)) {
        const imageUrl = data.url || (data.filePath ? (data.filePath.startsWith('http') ? data.filePath : `${BACKEND_URL}${data.filePath}`) : '');
        setFormData(prev => ({ ...prev, directorImage: imageUrl }));
        setCropperOpen(false);
        setSuccessMsg('Director image cropped and saved successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setError(data.message || 'Image upload failed.');
      }
    } catch (err) {
      console.error('Error uploading cropped image:', err);
      setError('Image upload failed.');
    } finally {
      setCropperUploading(false);
    }
  };

  // Timeline handlers
  const handleTimelineChange = (index, field, value) => {
    const updated = [...(formData.timeline || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, timeline: updated }));
  };

  const handleAddTimelineMilestone = () => {
    const updated = [
      ...(formData.timeline || []),
      { year: `${new Date().getFullYear()}`, title: 'New Milestone Title', description: 'Enter description of milestone...' }
    ];
    setFormData(prev => ({ ...prev, timeline: updated }));
  };

  const handleRemoveTimelineMilestone = (index) => {
    if (!window.confirm('Remove this timeline milestone?')) return;
    const updated = [...(formData.timeline || [])];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, timeline: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccessMsg('');

      const res = await fetch(`${API_BASE_URL}/store-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Store & About Us information updated successfully! Changes are live site-wide.');
        setTimeout(() => setSuccessMsg(''), 4000);
        setFormData(prev => ({ ...prev, ...data.data }));
      } else {
        setError(data.message || 'Failed to update store info');
      }
    } catch (err) {
      console.error('Error updating store info:', err);
      setError('Server error saving store info.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="store-mgmt-container">
      <AdminSidebar />

      <main className="store-mgmt-main">
        <div className="store-mgmt-header">
          <h1>Store Settings & About Us Information</h1>
          <p>Manage store contact details, physical address, social links, About Us content, and Entrepreneur Journey milestones.</p>
        </div>

        {error && <div className="alert-msg error">{error}</div>}
        {successMsg && <div className="alert-msg success">{successMsg}</div>}

        <div className="tabs-navigation">
          <button
            className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            📍 Contact & Address Details
          </button>
          <button
            className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            🏛️ About Us Hero & Leadership
          </button>
          <button
            className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            🚀 Entrepreneur Journey Timeline ({formData.timeline ? formData.timeline.length : 0})
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="store-form-card">
            {activeTab === 'contact' && (
              <div>
                <h3 className="section-form-title">Store Contact Information & Address</h3>

                <div className="form-grid-2">
                  <div className="form-field-wrapper">
                    <label>Main Store Phone Number</label>
                    <input
                      type="text"
                      className="form-input-text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-field-wrapper">
                    <label>Alternative / International Phone Number</label>
                    <input
                      type="text"
                      className="form-input-text"
                      value={formData.altPhone}
                      onChange={(e) => setFormData({ ...formData, altPhone: e.target.value })}
                    />
                  </div>

                  <div className="form-field-wrapper">
                    <label>Main Store Email Address</label>
                    <input
                      type="email"
                      className="form-input-text"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="form-field-wrapper">
                    <label>Customer Support Email</label>
                    <input
                      type="email"
                      className="form-input-text"
                      value={formData.supportEmail}
                      onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                    />
                  </div>

                  <div className="form-field-wrapper form-group-full">
                    <label>Physical Store Address</label>
                    <input
                      type="text"
                      className="form-input-text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="form-field-wrapper form-group-full">
                    <label>Daily Business Hours</label>
                    <input
                      type="text"
                      className="form-input-text"
                      value={formData.businessHours}
                      onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
                    />
                  </div>
                </div>

                <h3 className="section-form-title" style={{ marginTop: '24px' }}>Social Media & Messaging Links</h3>

                <div className="form-grid-2">
                  <div className="form-field-wrapper">
                    <label>WhatsApp Contact Number / Link</label>
                    <input
                      type="text"
                      className="form-input-text"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    />
                  </div>

                  <div className="form-field-wrapper">
                    <label>Facebook Page Link</label>
                    <input
                      type="text"
                      className="form-input-text"
                      value={formData.facebook}
                      onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    />
                  </div>

                  <div className="form-field-wrapper">
                    <label>Instagram Handle / Link</label>
                    <input
                      type="text"
                      className="form-input-text"
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    />
                  </div>

                  <div className="form-field-wrapper">
                    <label>YouTube Channel Link</label>
                    <input
                      type="text"
                      className="form-input-text"
                      value={formData.youtube}
                      onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div>
                <h3 className="section-form-title">About Us Hero & Overview</h3>

                <div className="form-field-wrapper">
                  <label>About Us Hero Subtitle Tag</label>
                  <input
                    type="text"
                    className="form-input-text"
                    value={formData.heroSubtitleTag}
                    onChange={(e) => setFormData({ ...formData, heroSubtitleTag: e.target.value })}
                  />
                </div>

                <div className="form-field-wrapper">
                  <label>About Us Main Hero Title</label>
                  <input
                    type="text"
                    className="form-input-text"
                    value={formData.heroTitle}
                    onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                  />
                </div>

                <div className="form-field-wrapper">
                  <label>About Us Hero Subtitle / Tagline</label>
                  <textarea
                    className="form-textarea"
                    rows="2"
                    value={formData.heroSubtitle}
                    onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  ></textarea>
                </div>

                <div className="form-field-wrapper">
                  <label>Footer Short Brand Description</label>
                  <textarea
                    className="form-textarea"
                    rows="2"
                    value={formData.footerAboutText}
                    onChange={(e) => setFormData({ ...formData, footerAboutText: e.target.value })}
                  ></textarea>
                </div>

                <h3 className="section-form-title" style={{ marginTop: '24px' }}>Leadership & Director Legacy</h3>

                <div className="form-grid-2">
                  <div className="form-field-wrapper">
                    <label>Director Name</label>
                    <input
                      type="text"
                      className="form-input-text"
                      value={formData.directorName}
                      onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
                    />
                  </div>

                  <div className="form-field-wrapper">
                    <label>Director Title / Role</label>
                    <input
                      type="text"
                      className="form-input-text"
                      value={formData.directorRole}
                      onChange={(e) => setFormData({ ...formData, directorRole: e.target.value })}
                    />
                  </div>

                  <div className="form-field-wrapper">
                    <label>Years of Leadership Badge (e.g. 40+)</label>
                    <input
                      type="text"
                      className="form-input-text"
                      value={formData.directorYears}
                      onChange={(e) => setFormData({ ...formData, directorYears: e.target.value })}
                    />
                  </div>

                  <div className="form-field-wrapper">
                    <label>Director Showcase Image URL</label>
                    <input
                      type="text"
                      className="form-input-text"
                      value={formData.directorImage}
                      onChange={(e) => setFormData({ ...formData, directorImage: e.target.value })}
                      placeholder="https://..."
                    />
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <label style={{
                        background: 'rgba(212, 175, 55, 0.2)',
                        color: '#d4af37',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>📷</span>
                        <span>{cropperUploading ? 'Processing...' : 'Upload & Crop Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileSelect}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleCropCurrentImage}
                        style={{
                          background: '#1e293b',
                          border: '1px solid #334155',
                          color: '#cbd5e1',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          fontWeight: 500,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>✂</span>
                        <span>Crop / Refit</span>
                      </button>
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: '#1e293b', borderRadius: '10px', border: '1px solid #334155' }}>
                      <img 
                        src={formData.directorImage || defaultOwnerImg} 
                        alt="Director Preview" 
                        style={{ width: '56px', height: '56px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #475569' }} 
                        onError={(e) => { e.target.onerror = null; e.target.src = defaultOwnerImg; }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '12px', color: '#f8fafc', fontWeight: 600 }}>Active Owner Portrait</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Preview of image displayed on the About Us page</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-field-wrapper">
                  <label>Director Highlight Quote</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={formData.directorQuote}
                    onChange={(e) => setFormData({ ...formData, directorQuote: e.target.value })}
                  ></textarea>
                </div>

                <div className="form-field-wrapper">
                  <label>Director Body Text</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={formData.directorBody}
                    onChange={(e) => setFormData({ ...formData, directorBody: e.target.value })}
                  ></textarea>
                </div>

                <h3 className="section-form-title" style={{ marginTop: '24px' }}>Vision & Mission Statements</h3>

                <div className="form-field-wrapper">
                  <label>Our Vision Statement</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={formData.visionText}
                    onChange={(e) => setFormData({ ...formData, visionText: e.target.value })}
                  ></textarea>
                </div>

                <div className="form-field-wrapper">
                  <label>Our Mission Statement</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={formData.missionText}
                    onChange={(e) => setFormData({ ...formData, missionText: e.target.value })}
                  ></textarea>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div>
                <div className="section-form-title">
                  <span>The Journey of a Visionary Entrepreneur (Timeline)</span>
                  <button
                    type="button"
                    className="btn-add-milestone"
                    onClick={handleAddTimelineMilestone}
                  >
                    + Add New Milestone
                  </button>
                </div>

                <div className="timeline-admin-list">
                  {(!formData.timeline || formData.timeline.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                      No timeline milestones added yet. Click "+ Add New Milestone" above.
                    </div>
                  ) : (
                    formData.timeline.map((item, idx) => (
                      <div key={idx} className="timeline-admin-card">
                        <div className="timeline-card-header">
                          <span className="timeline-badge-year">Milestone #{idx + 1}</span>
                          <button
                            type="button"
                            className="btn-remove-milestone"
                            onClick={() => handleRemoveTimelineMilestone(idx)}
                          >
                            🗑️ Remove
                          </button>
                        </div>

                        <div className="form-grid-2">
                          <div className="form-field-wrapper">
                            <label>Year / Period (e.g. 1985, 2004 - 2006, 2026)</label>
                            <input
                              type="text"
                              required
                              className="form-input-text"
                              placeholder="e.g. 1985"
                              value={item.year}
                              onChange={(e) => handleTimelineChange(idx, 'year', e.target.value)}
                            />
                          </div>

                          <div className="form-field-wrapper">
                            <label>Milestone Title</label>
                            <input
                              type="text"
                              required
                              className="form-input-text"
                              placeholder="e.g. The Early Vision"
                              value={item.title}
                              onChange={(e) => handleTimelineChange(idx, 'title', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="form-field-wrapper" style={{ marginBottom: 0 }}>
                          <label>Milestone Description</label>
                          <textarea
                            className="form-textarea"
                            rows="3"
                            required
                            placeholder="Enter full description of this milestone..."
                            value={item.description}
                            onChange={(e) => handleTimelineChange(idx, 'description', e.target.value)}
                          ></textarea>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="form-actions-bar">
              <button type="submit" className="save-settings-btn" disabled={saving}>
                {saving ? 'Saving Changes...' : '💾 Save & Publish Settings'}
              </button>
            </div>
          </form>
        )}

        {/* Interactive Image Cropper Modal for Director Portrait */}
        <ImageCropperModal
          isOpen={cropperOpen}
          imageSrc={cropperImageSrc}
          onClose={() => setCropperOpen(false)}
          onCropComplete={handleCropSave}
          isProcessing={cropperUploading}
        />
      </main>
    </div>
  );
}
