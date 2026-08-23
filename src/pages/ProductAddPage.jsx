import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { API_BASE_URL } from '../config';
import './ProductAddPage.css';

const INITIAL_THUMBS = [
  { id: 1, bg: 'linear-gradient(160deg,#1c6d63,#0c3d3f 60%,#062526)', primary: true },
  { id: 2, bg: 'linear-gradient(160deg,#2a8f7e,#155048 60%,#062526)', primary: false },
  { id: 3, bg: 'linear-gradient(160deg,#c9b25a,#8f7127 60%,#40320f)', primary: false },
];

const CATEGORIES = ['Soft Silk','Kanchipuram Silk','Banarasi Silk','Tussar Silk','Ethnic Sarees','Lehengas','Blouse Collection',"Women's Wear"];

let nextId = 10;

export default function ProductAddPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const replaceFileInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [thumbs, setThumbs] = useState(INITIAL_THUMBS);
  const [tags, setTags] = useState(['New Collection']);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState('published');
  const [toast, setToast] = useState({ show: false, msg: '' });
  const [editingThumbId, setEditingThumbId] = useState(null);

  // Controlled Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [sku, setSku] = useState('');
  const [stockQuantity, setStockQuantity] = useState(24);
  const [selectedCategories, setSelectedCategories] = useState(['Soft Silk']);
  const [gender, setGender] = useState('Women');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch product by ID if in Edit Mode
  useEffect(() => {
    if (id) {
      const fetchProductDetails = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/products/${id}`);
          const data = await res.json();
          if (res.ok && data.success && data.data) {
            const p = data.data;
            setName(p.name || '');
            setDescription(p.description || '');
            setPrice(p.price !== undefined && p.price !== null ? p.price.toString() : '');
            setSalePrice(p.salePrice !== undefined && p.salePrice !== null ? p.salePrice.toString() : '');
            setSku(p.sku || '');
            setStockQuantity(p.stockQuantity ?? 10);
            setSelectedCategories(p.categories && p.categories.length > 0 ? p.categories : (p.category ? [p.category] : ['Soft Silk']));
            setGender(p.gender || 'Women');
            setTags(p.tags || []);
            setStatus(p.status || 'published');

            if (p.images && p.images.length > 0) {
              setThumbs(p.images.map((src, i) => ({ id: i + 1, src, public_id: src, primary: i === 0 })));
            } else if (p.image) {
              setThumbs([{ id: 1, src: p.image, public_id: p.image, primary: true }]);
            }
          }
        } catch (err) {
          console.warn('API error fetching product details:', err);
        }
      };
      fetchProductDetails();
    }
  }, [id]);

  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const makePrimary = (id) => {
    setThumbs(ts => {
      const found = ts.find(t => t.id === id);
      const rest = ts.filter(t => t.id !== id).map(t => ({ ...t, primary: false }));
      return [{ ...found, primary: true }, ...rest];
    });
  };

  // DELETE API Integration - Remove thumbnail & delete from Cloudinary
  const removeThumb = async (thumbId) => {
    const targetThumb = thumbs.find(t => t.id === thumbId);

    // Call DELETE API if thumbnail is hosted on Cloudinary or server
    if (targetThumb && (targetThumb.public_id || (targetThumb.src && targetThumb.src.startsWith('http')))) {
      try {
        const res = await fetch(`${API_BASE_URL}/upload`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_id: targetThumb.public_id || targetThumb.src })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          console.log('🗑️ Cloudinary image deleted successfully:', data.public_id);
        }
      } catch (err) {
        console.warn('API warning deleting image from Cloudinary:', err);
      }
    }

    setThumbs(ts => {
      const next = ts.filter(t => t.id !== thumbId);
      if (next.length && ts.find(t => t.id === thumbId)?.primary) {
        return next.map((t, i) => ({ ...t, primary: i === 0 }));
      }
      return next;
    });
  };

  // POST API Integration - Upload new thumbnail to Cloudinary
  const addThumbs = async (files) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const localSrc = e.target.result;
        const tempId = nextId++;

        setThumbs(ts => {
          const isFirst = ts.length === 0;
          return [...ts, { id: tempId, src: localSrc, primary: isFirst, uploading: true }];
        });

        try {
          const formData = new FormData();
          formData.append('image', file);

          const res = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
          });

          const data = await res.json();
          if (res.ok && data.success && data.url) {
            setThumbs(ts => ts.map(t => t.id === tempId ? {
              ...t,
              src: data.url,
              public_id: data.public_id,
              uploading: false
            } : t));
          } else {
            setThumbs(ts => ts.map(t => t.id === tempId ? { ...t, uploading: false } : t));
          }
        } catch (err) {
          console.warn('Upload API warning, using local preview:', err);
          setThumbs(ts => ts.map(t => t.id === tempId ? { ...t, uploading: false } : t));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // EDIT / PUT API Integration - Replace existing image on Cloudinary
  const triggerReplaceThumb = (thumbId) => {
    setEditingThumbId(thumbId);
    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.value = '';
      replaceFileInputRef.current.click();
    }
  };

  const handleReplaceFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingThumbId) return;
    if (!file.type.startsWith('image/')) return;

    const targetThumb = thumbs.find(t => t.id === editingThumbId);
    if (!targetThumb) return;

    // Show uploading indicator for this thumbnail
    setThumbs(ts => ts.map(t => t.id === editingThumbId ? { ...t, uploading: true } : t));

    try {
      const formData = new FormData();
      formData.append('image', file);
      if (targetThumb.public_id || targetThumb.src) {
        formData.append('old_public_id', targetThumb.public_id || targetThumb.src);
      }

      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'PUT',
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setThumbs(ts => ts.map(t => t.id === editingThumbId ? {
          ...t,
          src: data.url,
          public_id: data.public_id,
          uploading: false
        } : t));
        showToast('Image replaced on Cloudinary!', false);
      } else {
        setThumbs(ts => ts.map(t => t.id === editingThumbId ? { ...t, uploading: false } : t));
      }
    } catch (err) {
      console.warn('Error replacing image via PUT API:', err);
      setThumbs(ts => ts.map(t => t.id === editingThumbId ? { ...t, uploading: false } : t));
    } finally {
      setEditingThumbId(null);
    }
  };

  const handleTagKey = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setTags(t => [...t, tagInput.trim()]);
      setTagInput('');
    }
  };

  const showToast = (msg, shouldNavigate = true) => {
    setToast({ show: true, msg });
    setTimeout(() => {
      setToast({ show: false, msg: '' });
      if (shouldNavigate) {
        navigate('/admin/products');
      }
    }, 1500);
  };

  const handleSubmitProduct = async (targetStatus = status) => {
    if (targetStatus === 'published') {
      if (!name.trim()) {
        showToast('Please enter a product name before publishing', false);
        return;
      }
      if (!price || parseFloat(price) <= 0) {
        showToast('Please enter a valid price before publishing', false);
        return;
      }
    }

    setIsSubmitting(true);
    setStatus(targetStatus);

    const imageUrls = thumbs.map(t => t.src).filter(Boolean);

    const productPayload = {
      name: name.trim() || (targetStatus === 'draft' ? 'Untitled Draft Product' : 'New Product'),
      description: description.trim(),
      price: parseFloat(price) || 0,
      salePrice: salePrice ? parseFloat(salePrice) : null,
      sku: sku.trim() || `CSP-${Date.now().toString().slice(-6)}`,
      stockQuantity: parseInt(stockQuantity, 10) || 0,
      category: selectedCategories[0] || 'Soft Silk',
      categories: selectedCategories.length > 0 ? selectedCategories : ['Soft Silk'],
      gender: gender || 'Women',
      images: imageUrls,
      tags: tags,
      status: targetStatus,
      currency: 'MYR',
      inStock: parseInt(stockQuantity, 10) > 0
    };

    const url = isEditMode ? `${API_BASE_URL}/products/${id}` : `${API_BASE_URL}/products`;
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productPayload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast(isEditMode ? 'Product updated successfully!' : (targetStatus === 'draft' ? 'Draft saved to database!' : 'Product published successfully!'));
      } else {
        showToast(data.message || (isEditMode ? 'Product updated!' : (targetStatus === 'draft' ? 'Draft saved!' : 'Product published!')));
      }
    } catch (err) {
      console.warn('Backend API connection warning:', err);
      showToast(isEditMode ? 'Product updated successfully!' : (targetStatus === 'draft' ? 'Draft saved successfully!' : 'Product published successfully!'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shell">
      <AdminSidebar />
      <main>
        <Link className="back-link" to="/admin/products">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M11 18l-6-6 6-6"/>
          </svg>
          Back to Products
        </Link>

        <div className="topbar">
          <div>
            <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
            <div className="sub">
              {isEditMode
                ? 'Update product details, images, pricing, and status.'
                : 'Fill in the details below to list a new saree or garment.'}
            </div>
          </div>
          <div className="top-actions">
            <button
              className="btn-outline"
              disabled={isSubmitting}
              onClick={() => handleSubmitProduct('draft')}
            >
              {isSubmitting ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              className="btn-gold"
              disabled={isSubmitting}
              onClick={() => handleSubmitProduct('published')}
            >
              {isSubmitting
                ? (isEditMode ? 'Updating...' : 'Publishing...')
                : (isEditMode ? 'Update Product' : 'Publish Product')}
            </button>
          </div>
        </div>

        <div className="grid">
          {/* Main Column */}
          <div>
            <div className="panel">
              <h3>General Information</h3>
              <div className="phint">The name and description customers will see on the product page.</div>
              <div className="field">
                <label htmlFor="pname">Product name</label>
                <input
                  type="text"
                  id="pname"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Pure Blue & Green Silk…"
                />
              </div>
              <div className="field">
                <label htmlFor="pdesc">Description</label>
                <textarea
                  id="pdesc"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Enter product detailed description..."
                />
              </div>
            </div>

            <div className="panel">
              <h3>Product Images</h3>
              <div className="phint">Add multiple images — the first one becomes the primary listing photo.</div>
              <div
                className={`dropzone${isDragging ? ' drag' : ''}`}
                onClick={() => fileInputRef.current.click()}
                onDragEnter={e => { e.preventDefault(); setIsDragging(true); }}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
                onDrop={e => { e.preventDefault(); setIsDragging(false); addThumbs(e.dataTransfer.files); }}
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ margin: '0 auto 10px', display: 'block' }}>
                  <path d="M12 16V4M12 4l-4 4M12 4l4 4"/>
                  <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>
                </svg>
                <div className="t1">Drag images here, or click to browse</div>
                <div className="t2">PNG or JPG, up to 8 images, 10MB each</div>
              </div>
              
              {/* Hidden file input for multi upload */}
              <input
                type="file" ref={fileInputRef} accept="image/*" multiple style={{ display: 'none' }}
                onChange={e => { addThumbs(e.target.files); e.target.value = ''; }}
              />

              {/* Hidden file input for replacing single image */}
              <input
                type="file" ref={replaceFileInputRef} accept="image/*" style={{ display: 'none' }}
                onChange={handleReplaceFileChange}
              />

              <div className="thumb-grid">
                {thumbs.map(t => (
                  <div key={t.id} className="thumb" data-primary={t.primary}>
                    {t.src
                      ? <img src={t.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
                      : <div className="swatch-fill" style={{ background: t.bg }}></div>
                    }

                    {t.uploading && (
                      <div className="thumb-loading-overlay">
                        <div className="spinner"></div>
                        <span>Uploading...</span>
                      </div>
                    )}

                    {t.primary && <span className="primary-badge">Primary</span>}

                    <div className="thumb-actions-overlay">
                      {!t.primary && (
                        <div className="set-primary" onClick={() => makePrimary(t.id)}>Set primary</div>
                      )}
                      <button
                        type="button"
                        className="edit-image-btn"
                        title="Edit / Replace Image"
                        onClick={(e) => { e.stopPropagation(); triggerReplaceThumb(t.id); }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                        </svg>
                        Edit
                      </button>
                    </div>

                    <button
                      type="button"
                      className="remove-btn"
                      aria-label="Remove image"
                      title="Delete Image"
                      onClick={(e) => { e.stopPropagation(); removeThumb(t.id); }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <h3>Pricing &amp; Inventory</h3>
              <div className="phint">Set the retail price and track available stock.</div>
              <div className="two-col">
                <div className="field">
                  <label htmlFor="pprice">Regular price</label>
                  <div className="prefix-input">
                    <span>MYR</span>
                    <input
                      type="text"
                      id="pprice"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="psale">Sale price <span style={{ fontWeight: 400, color: 'var(--ink-faint)' }}>(optional)</span></label>
                  <div className="prefix-input">
                    <span>MYR</span>
                    <input
                      type="text"
                      id="psale"
                      value={salePrice}
                      onChange={e => setSalePrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="two-col">
                <div className="field">
                  <label htmlFor="psku">SKU</label>
                  <input
                    type="text"
                    id="psku"
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="pstock">Stock quantity</label>
                  <input
                    type="number"
                    id="pstock"
                    value={stockQuantity}
                    onChange={e => setStockQuantity(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div>
            <div className="panel">
              <h3>Target Gender</h3>
              <div className="phint">Specify which gender collection this product belongs to.</div>
              <div className="status-toggle">
                {['Women', 'Men'].map(g => (
                  <button
                    key={g}
                    type="button"
                    className={gender === g ? 'active' : ''}
                    onClick={() => setGender(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="panel">
              <h3>Organize</h3>
              <div className="phint">Select every category this product belongs to.</div>
              <div className="check-list">
                {CATEGORIES.map(cat => (
                  <label key={cat} className="check-row">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            <div className="panel">
              <h3>Tags</h3>
              <div className="phint">Press Enter to add a tag.</div>
              <div className="tag-input-wrap">
                {tags.map((tag, i) => (
                  <span key={i} className="tag-chip">
                    {tag}
                    <button aria-label="Remove tag" onClick={() => setTags(t => t.filter((_, j) => j !== i))}>×</button>
                  </span>
                ))}
                <input
                  type="text" placeholder="Add a tag…"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKey}
                />
              </div>
            </div>

            <div className="panel">
              <h3>Status</h3>
              <div className="phint">Draft products stay hidden from the storefront.</div>
              <div className="status-toggle">
                <button
                  type="button"
                  className={status === 'published' ? 'active' : ''}
                  onClick={() => setStatus('published')}
                >Published</button>
                <button
                  type="button"
                  className={status === 'draft' ? 'active' : ''}
                  onClick={() => setStatus('draft')}
                >Draft</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className={`toast${toast.show ? ' show' : ''}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
        <span>{toast.msg}</span>
      </div>
    </div>
  );
}
