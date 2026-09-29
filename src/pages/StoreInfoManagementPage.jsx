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
  const [achievementUploadingIdx, setAchievementUploadingIdx] = useState(null);
  const [cardUploadingKey, setCardUploadingKey] = useState(null); // format: `${secIdx}-${cardIdx}`

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
    tiktok: 'https://www.tiktok.com/@chennaisilkpalace.klang',

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

    // Dynamic Custom Showcase Sections (One after another)
    customSections: [],

    // Legacy Achievements (fallback)
    achievementsHeading: 'Behind the Legacy of Chennai Silk Palace',
    achievementsEyebrow: 'OUR LEADERSHIP & FAMILY',
    achievementsSubtitle: 'Guided by Mr. Thanasekaran Vellaikkoothan, our dedicated team upholds decades of commitment to excellence and authentic craftsmanship.',
    achievements: [],

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
          ...data.data,
          tiktok: data.data.tiktok || prev.tiktok || 'https://www.tiktok.com/@chennaisilkpalace.klang'
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

  // --- Dynamic Showcase Sections & Cards Handlers ---
  const handleAddSection = () => {
    const nextIdx = (formData.customSections ? formData.customSections.length : 0) + 1;
    const newSection = {
      eyebrow: 'NEW SHOWCASE SECTION',
      title: `Showcase Section #${nextIdx}`,
      subtitle: 'Add a descriptive subtitle highlighting this collection, milestone, or artisan craftsmanship.',
      cards: [
        {
          title: 'Card Highlight #1',
          tag: 'FEATURED',
          image: '',
          description: 'Enter description highlighting this achievement, collection, or milestone...'
        }
      ]
    };
    setFormData(prev => ({
      ...prev,
      customSections: [...(prev.customSections || []), newSection]
    }));
  };

  const handleRemoveSection = (secIdx) => {
    const sectionName = formData.customSections?.[secIdx]?.title || `Section #${secIdx + 1}`;
    if (!window.confirm(`Are you sure you want to remove "${sectionName}"? All cards inside this section will also be deleted.`)) return;
    const updated = [...(formData.customSections || [])];
    updated.splice(secIdx, 1);
    setFormData(prev => ({ ...prev, customSections: updated }));
  };

  const handleSectionFieldChange = (secIdx, field, value) => {
    const updated = [...(formData.customSections || [])];
    if (updated[secIdx]) {
      updated[secIdx] = { ...updated[secIdx], [field]: value };
      setFormData(prev => ({ ...prev, customSections: updated }));
    }
  };

  const handleAddCardToSection = (secIdx) => {
    const updated = [...(formData.customSections || [])];
    if (updated[secIdx]) {
      const currentCards = updated[secIdx].cards || [];
      const newCard = {
        title: `Highlight Card #${currentCards.length + 1}`,
        tag: 'HIGHLIGHT',
        image: '',
        description: 'Enter description highlighting this achievement or collection detail...'
      };
      updated[secIdx] = {
        ...updated[secIdx],
        cards: [...currentCards, newCard]
      };
      setFormData(prev => ({ ...prev, customSections: updated }));
    }
  };

  const handleRemoveCardFromSection = (secIdx, cardIdx) => {
    if (!window.confirm('Remove this card from this section?')) return;
    const updated = [...(formData.customSections || [])];
    if (updated[secIdx] && updated[secIdx].cards) {
      const cards = [...updated[secIdx].cards];
      cards.splice(cardIdx, 1);
      updated[secIdx] = { ...updated[secIdx], cards };
      setFormData(prev => ({ ...prev, customSections: updated }));
    }
  };

  const handleCardFieldChange = (secIdx, cardIdx, field, value) => {
    const updated = [...(formData.customSections || [])];
    if (updated[secIdx] && updated[secIdx].cards && updated[secIdx].cards[cardIdx]) {
      const cards = [...updated[secIdx].cards];
      cards[cardIdx] = { ...cards[cardIdx], [field]: value };
      updated[secIdx] = { ...updated[secIdx], cards };
      setFormData(prev => ({ ...prev, customSections: updated }));
    }
  };

  const handleCardImageUpload = async (secIdx, cardIdx, file) => {
    if (!file) return;
    const uploadKey = `${secIdx}-${cardIdx}`;
    try {
      setCardUploadingKey(uploadKey);
      setError('');
      const compressed = await compressImage(file, { maxWidth: 1200, maxHeight: 900, quality: 0.85 });
      const uploadFormData = new FormData();
      uploadFormData.append('image', compressed);

      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      const data = await res.json();
      if (res.ok && (data.url || data.filePath || data.imageUrl)) {
        const imageUrl = data.url || data.imageUrl || (data.filePath ? (data.filePath.startsWith('http') ? data.filePath : `${BACKEND_URL}${data.filePath}`) : '');
        handleCardFieldChange(secIdx, cardIdx, 'image', imageUrl);
        setSuccessMsg('Card image uploaded successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setError(data.message || 'Image upload failed');
      }
    } catch (err) {
      console.error('Error uploading card image:', err);
      setError('Failed to upload image');
    } finally {
      setCardUploadingKey(null);
    }
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
            type="button"
            className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            🚀 Entrepreneur Journey Timeline ({formData.timeline ? formData.timeline.length : 0})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            🏆 Showcase Sections ({formData.customSections ? formData.customSections.length : (formData.achievements ? 1 : 0)})
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

                  <div className="form-field-wrapper">
                    <label>TikTok Profile Link</label>
                    <input
                      type="text"
                      className="form-input-text"
                      value={formData.tiktok || ''}
                      onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                      placeholder="https://www.tiktok.com/@chennaisilkpalace.klang"
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

            {activeTab === 'achievements' && (
              <div>
                <div className="section-form-title">
                  <div>
                    <span>Dynamic Showcase Sections (About Us Page)</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
                      Add custom showcase sections one after another with their own headings and card grids.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-add-section-top"
                    onClick={handleAddSection}
                  >
                    <span>➕</span>
                    <span>Add New Section</span>
                  </button>
                </div>

                {(!formData.customSections || formData.customSections.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', background: '#F8FAFC', borderRadius: '12px', border: '1.5px dashed #CBD5E1', marginBottom: '24px' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏛️</div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#0F172A', fontWeight: 700 }}>
                      No Showcase Sections Created Yet
                    </h4>
                    <p style={{ margin: '0 0 20px 0', fontSize: '13.5px', color: '#64748B' }}>
                      Click below to add your first showcase section (e.g. Behind the Legacy, Our Master Weavers, or Awards).
                    </p>
                    <button
                      type="button"
                      className="btn-add-section-top"
                      onClick={handleAddSection}
                    >
                      ➕ Add Your First Section
                    </button>
                  </div>
                ) : (
                  <div className="dynamic-sections-container">
                    {formData.customSections.map((sec, secIdx) => (
                      <div key={secIdx} className="dynamic-section-block">
                        <div className="dynamic-section-header-bar">
                          <div className="dynamic-section-title-wrap">
                            <span className="dynamic-section-badge">Section #{secIdx + 1}</span>
                            <span className="dynamic-section-name">{sec.title || `Untitled Section #${secIdx + 1}`}</span>
                          </div>
                          <div className="dynamic-section-actions">
                            <button
                              type="button"
                              className="btn-add-card-to-sec"
                              onClick={() => handleAddCardToSection(secIdx)}
                            >
                              ➕ Add Card
                            </button>
                            <button
                              type="button"
                              className="btn-remove-section"
                              onClick={() => handleRemoveSection(secIdx)}
                            >
                              🗑️ Remove Section
                            </button>
                          </div>
                        </div>

                        {/* Section Header Settings */}
                        <div style={{ background: '#F8FAFC', padding: '18px 20px', borderRadius: '10px', border: '1px solid #CBD5E1', marginBottom: '20px' }}>
                          <h4 style={{ margin: '0 0 14px 0', fontSize: '13.5px', color: '#0F172A', fontWeight: 700 }}>
                            ⚙️ Section #{secIdx + 1} Header Settings (About Us Page)
                          </h4>
                          <div className="form-grid-2">
                            <div className="form-field-wrapper">
                              <label>Section Eyebrow Tag</label>
                              <input
                                type="text"
                                className="form-input-text"
                                value={sec.eyebrow || ''}
                                onChange={(e) => handleSectionFieldChange(secIdx, 'eyebrow', e.target.value)}
                                placeholder="e.g. OUR LEADERSHIP & FAMILY"
                              />
                            </div>
                            <div className="form-field-wrapper">
                              <label>Section Main Title</label>
                              <input
                                type="text"
                                required
                                className="form-input-text"
                                value={sec.title || ''}
                                onChange={(e) => handleSectionFieldChange(secIdx, 'title', e.target.value)}
                                placeholder="e.g. Behind the Legacy of Chennai Silk Palace"
                              />
                            </div>
                          </div>
                          <div className="form-field-wrapper" style={{ marginBottom: 0 }}>
                            <label>Section Subtitle</label>
                            <textarea
                              className="form-textarea"
                              rows="2"
                              value={sec.subtitle || ''}
                              onChange={(e) => handleSectionFieldChange(secIdx, 'subtitle', e.target.value)}
                              placeholder="e.g. Guided by Mr. Thanasekaran Vellaikkoothan..."
                            ></textarea>
                          </div>
                        </div>

                        {/* Cards in this Section */}
                        <div className="section-cards-container">
                          <div className="section-cards-subheading">
                            <span>🎴 Cards in Section #{secIdx + 1} ({sec.cards?.length || 0})</span>
                            <button
                              type="button"
                              className="btn-add-card-to-sec"
                              onClick={() => handleAddCardToSection(secIdx)}
                            >
                              ➕ Add Card to this Section
                            </button>
                          </div>

                          {(!sec.cards || sec.cards.length === 0) ? (
                            <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '13px' }}>
                              No cards in this section yet. Click "+ Add Card to this Section" above.
                            </div>
                          ) : (
                            <div className="timeline-admin-list">
                              {sec.cards.map((card, cardIdx) => (
                                <div key={cardIdx} className="timeline-admin-card">
                                  <div className="timeline-card-header">
                                    <span className="timeline-badge-year">Card #{cardIdx + 1}</span>
                                    <button
                                      type="button"
                                      className="btn-remove-milestone"
                                      onClick={() => handleRemoveCardFromSection(secIdx, cardIdx)}
                                    >
                                      🗑️ Remove Card
                                    </button>
                                  </div>

                                  <div className="form-grid-2">
                                    <div className="form-field-wrapper">
                                      <label>Card Title</label>
                                      <input
                                        type="text"
                                        required
                                        className="form-input-text"
                                        placeholder="e.g. Visionary Leadership / Award"
                                        value={card.title || ''}
                                        onChange={(e) => handleCardFieldChange(secIdx, cardIdx, 'title', e.target.value)}
                                      />
                                    </div>

                                    <div className="form-field-wrapper">
                                      <label>Card Badge / Category Tag (Optional)</label>
                                      <input
                                        type="text"
                                        className="form-input-text"
                                        placeholder="e.g. LEADERSHIP, TRADITION, 2023 AWARD"
                                        value={card.tag || ''}
                                        onChange={(e) => handleCardFieldChange(secIdx, cardIdx, 'tag', e.target.value)}
                                      />
                                    </div>
                                  </div>

                                  <div className="form-field-wrapper">
                                    <label>Card Image URL or Upload</label>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                      <input
                                        type="text"
                                        className="form-input-text"
                                        style={{ flex: 1, minWidth: '220px' }}
                                        placeholder="https://... or upload photo"
                                        value={card.image || ''}
                                        onChange={(e) => handleCardFieldChange(secIdx, cardIdx, 'image', e.target.value)}
                                      />
                                      <label style={{
                                        background: 'rgba(212, 175, 55, 0.2)',
                                        color: '#b48a1e',
                                        padding: '9px 16px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        border: '1px solid rgba(212, 175, 55, 0.4)'
                                      }}>
                                        <span>📷</span>
                                        <span>{cardUploadingKey === `${secIdx}-${cardIdx}` ? 'Uploading...' : 'Upload Image'}</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                              handleCardImageUpload(secIdx, cardIdx, e.target.files[0]);
                                            }
                                          }}
                                          style={{ display: 'none' }}
                                        />
                                      </label>
                                    </div>
                                    {card.image && (
                                      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img
                                          src={card.image}
                                          alt="Preview"
                                          style={{ width: '80px', height: '54px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                                          onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                        <span style={{ fontSize: '12px', color: '#64748B' }}>Card Image Preview</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="form-field-wrapper" style={{ marginBottom: 0 }}>
                                    <label>Card Description</label>
                                    <textarea
                                      className="form-textarea"
                                      rows="3"
                                      required
                                      placeholder="Enter description highlighting this achievement or team legacy..."
                                      value={card.description || ''}
                                      onChange={(e) => handleCardFieldChange(secIdx, cardIdx, 'description', e.target.value)}
                                    ></textarea>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn-add-section-bottom"
                      onClick={handleAddSection}
                    >
                      ➕ Add Another New Section
                    </button>
                  </div>
                )}
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
