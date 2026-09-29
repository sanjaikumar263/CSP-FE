import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import SafeImage from '../components/SafeImage';
import placeholderSvg from '../assets/placeholder.svg';
import { API_BASE_URL } from '../config';
import { useWishlist } from '../context/WishlistContext';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [shareFeedback, setShareFeedback] = useState('');
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [apiProduct, setApiProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [isMainHovered, setIsMainHovered] = useState(false);
  const [mainHoverPos, setMainHoverPos] = useState({ x: 50, y: 50 });
  const [isModalHovered, setIsModalHovered] = useState(false);
  const [modalHoverPos, setModalHoverPos] = useState({ x: 50, y: 50 });
  const [modalZoomLevel, setModalZoomLevel] = useState(2.5);
  const [isZoomLocked, setIsZoomLocked] = useState(false);

  const handleMainMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setMainHoverPos({ x, y });
  };

  const handleModalMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setModalHoverPos({ x, y });
  };
  const [cartFeedback, setCartFeedback] = useState(false);

  const handleAddToCart = () => {
    setCartFeedback(true);
    setTimeout(() => setCartFeedback(false), 2500);
  };

  const handleBuyNow = () => {
    setCartFeedback(true);
    setTimeout(() => setCartFeedback(false), 2500);
  };

  // Scroll to top on load or ID change and fetch product & related products from backend
  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImage(0);

    const fetchProductData = async () => {
      try {
        setLoading(true);
        if (id) {
          const res = await fetch(`${API_BASE_URL}/products/${id}`);
          const data = await res.json();
          if (res.ok && data.success && data.data) {
            const prodData = data.data;
            setApiProduct(prodData);

            // Fetch related products from backend
            try {
              const relRes = await fetch(`${API_BASE_URL}/products`);
              const relData = await relRes.json();
              if (relRes.ok && relData.success && Array.isArray(relData.data)) {
                // Exclude current product
                const currentIdStr = String(prodData._id || prodData.id || id);
                let otherProducts = relData.data.filter(
                  p => String(p._id || p.id) !== currentIdStr
                );

                // If same category exists, prioritize same category products
                if (prodData.category) {
                  const sameCat = otherProducts.filter(p => p.category === prodData.category);
                  const diffCat = otherProducts.filter(p => p.category !== prodData.category);
                  otherProducts = [...sameCat, ...diffCat];
                }

                setRelatedProducts(otherProducts.slice(0, 4));
              } else {
                setRelatedProducts([]);
              }
            } catch (rErr) {
              console.warn('Error fetching related products:', rErr);
              setRelatedProducts([]);
            }
          } else {
            setApiProduct(null);
            setRelatedProducts([]);
          }
        }
      } catch (err) {
        console.warn('Error fetching product detail from backend:', err);
        setApiProduct(null);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  // Handle escape key and arrow navigation when zoom modal is active
  useEffect(() => {
    if (!isZoomOpen) {
      setZoomScale(1);
      setIsModalHovered(false);
      setIsZoomLocked(false);
      setModalHoverPos({ x: 50, y: 50 });
      return;
    }

    const imagesCount = (apiProduct?.images && apiProduct.images.length > 0)
      ? apiProduct.images.length
      : 1;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsZoomOpen(false);
      } else if (e.key === 'ArrowRight' && imagesCount > 1) {
        setSelectedImage((prev) => (prev + 1) % imagesCount);
        setZoomScale(1);
      } else if (e.key === 'ArrowLeft' && imagesCount > 1) {
        setSelectedImage((prev) => (prev - 1 + imagesCount) % imagesCount);
        setZoomScale(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isZoomOpen, apiProduct?.images?.length]);

  if (loading) {
    return (
      <div className="product-detail-container">
        <Header />
        <div className="container-inner" style={{ padding: '60px 0', textAlign: 'center' }}>
          <Loader message="Loading Product Details..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (!apiProduct) {
    return (
      <div className="product-detail-container">
        <Header />
        <div className="container-inner" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛍️</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>Product Not Found</h2>
          <p style={{ color: '#64748B', marginBottom: '24px' }}>The product you are looking for does not exist or has been removed.</p>
          <Link to="/" style={{ display: 'inline-block', background: '#0a305d', color: '#fff', padding: '10px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}>
            Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const rawImages = (apiProduct.images && apiProduct.images.length > 0)
    ? apiProduct.images
    : (apiProduct.image ? [apiProduct.image] : [placeholderSvg]);

  const product = {
    id: apiProduct._id || apiProduct.id || id,
    title: apiProduct.name || apiProduct.title || 'Product Details',
    category: Array.isArray(apiProduct.categories) && apiProduct.categories.length > 0
      ? apiProduct.categories.join(', ')
      : (apiProduct.category || ''),
    gender: apiProduct.gender || '',
    price: apiProduct.price ? (typeof apiProduct.price === 'number' ? apiProduct.price : parseFloat(String(apiProduct.price).replace(/[^0-9.]/g, '')) || 0) : 0.00,
    salePrice: (apiProduct.salePrice !== undefined && apiProduct.salePrice !== null && apiProduct.salePrice !== '')
      ? (typeof apiProduct.salePrice === 'number' ? apiProduct.salePrice : parseFloat(String(apiProduct.salePrice).replace(/[^0-9.]/g, '')) || null)
      : null,
    sku: apiProduct.sku || '',
    stockQuantity: apiProduct.stockQuantity ?? (apiProduct.inStock ? 10 : 0),
    inStock: apiProduct.inStock ?? ((apiProduct.stockQuantity ?? 1) > 0),
    images: rawImages,
    description: apiProduct.description || '',
    fabric: apiProduct.fabric || '',
    color: apiProduct.color || '',
    work: apiProduct.work || '',
    occasion: apiProduct.occasion || '',
    tags: apiProduct.tags || []
  };

  const handleShare = async () => {
    const shareTitle = product.title || 'Product';
    const shareText = `Check out ${shareTitle} at Chennai Silk Palace!`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.warn('Navigator share error, falling back to copy:', err);
      }
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setShareFeedback('Link copied to clipboard!');
      setTimeout(() => setShareFeedback(''), 3000);
    } catch (copyErr) {
      console.warn('Failed to copy link:', copyErr);
      setShareFeedback('Failed to copy link');
      setTimeout(() => setShareFeedback(''), 3000);
    }
  };

  return (
    <div className="product-detail-container">
      {/* Common Header */}
      <Header />

      {/* Breadcrumbs */}
      <div className="container-inner">
        <div className="pd-breadcrumb">
          <Link to="/">Home</Link>
          <span className="sep">›</span>
          {product.category && (
            <>
              <Link to={`/products?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
              <span className="sep">›</span>
            </>
          )}
          <span className="current">{product.title}</span>
        </div>

        {/* Main Product Grid */}
        <div className="pd-main-grid">
          {/* Gallery Side */}
          <div className="pd-gallery-section">
            {product.images.length > 1 && (
              <div className="pd-thumb-column">
                {product.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`pd-thumb-box ${selectedImage === idx ? 'active' : ''}`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <SafeImage src={img} alt={`Thumbnail ${idx + 1}`} />
                  </div>
                ))}
              </div>
            )}

            <div
              className={`pd-main-image-wrapper ${isMainHovered ? 'is-hover-zoomed' : ''}`}
              onClick={() => setIsZoomOpen(true)}
              onMouseEnter={() => setIsMainHovered(true)}
              onMouseLeave={() => {
                setIsMainHovered(false);
                setMainHoverPos({ x: 50, y: 50 });
              }}
              onMouseMove={handleMainMouseMove}
              title="Hover to zoom • Click for full screen"
            >
              <SafeImage
                src={product.images?.[selectedImage] || product.images?.[0] || placeholderSvg}
                alt={product.title}
                className="pd-main-image"
                style={{
                  transformOrigin: `${mainHoverPos.x}% ${mainHoverPos.y}%`,
                  transform: isMainHovered ? 'scale(2.2)' : 'scale(1)',
                  cursor: isMainHovered ? 'crosshair' : 'zoom-in'
                }}
              />
              {!isMainHovered && (
                <div className="pd-main-hover-hint">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                  <span>Hover to Zoom</span>
                </div>
              )}
              {/* Floating Wishlist Button on Top-Right of Main Product Image */}
              <button
                type="button"
                className={`pd-floating-wishlist-btn ${isWishlisted(product._id || product.id) ? 'active' : ''}`}
                aria-label={isWishlisted(product._id || product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                title={isWishlisted(product._id || product.id) ? "In Wishlist" : "Add to Wishlist"}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product);
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={isWishlisted(product._id || product.id) ? "#b91c1c" : "none"} stroke={isWishlisted(product._id || product.id) ? "#b91c1c" : "#1e293b"} strokeWidth="2">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>

              <button
                type="button"
                className="pd-zoom-btn"
                aria-label="Zoom Image"
                title="Click to zoom image"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomOpen(true);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.5" y2="16.5" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </button>
            </div>
          </div>

          {/* Info Side */}
          <div className="pd-info-section">
            {/* Category Badges / Tags & Top Wishlist Button */}
            <div className="pd-badge-row">
              <div className="pd-badge-tags-group">
                {(product.tags.length > 0 ? product.tags : (product.category ? [product.category] : ['New Collection'])).map((tag, i) => (
                  <span key={i} className="pd-tag-pill">{tag}</span>
                ))}
              </div>

              {/* Wishlist Button on Top of Product Info */}
              <button
                type="button"
                className={`pd-top-wishlist-btn ${isWishlisted(product._id || product.id) ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
                title={isWishlisted(product._id || product.id) ? "Saved in Wishlist" : "Save to Wishlist"}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill={isWishlisted(product._id || product.id) ? "#b91c1c" : "none"} stroke={isWishlisted(product._id || product.id) ? "#b91c1c" : "currentColor"} strokeWidth="2">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span>{isWishlisted(product._id || product.id) ? 'Wishlisted' : 'Wishlist'}</span>
              </button>
            </div>

            {/* Product Title */}
            {product.sku && <div className="pd-sku-header">SKU: {product.sku}</div>}
            <h1 className="pd-title">{product.title}</h1>

            {/* Price */}
            <div className="pd-price-box">
              <div className="pd-price-amount">
                {product.salePrice && product.salePrice > 0 ? (
                  <>
                    <span className="pd-sale-price">MYR {product.salePrice.toFixed(2)}</span>
                    <span className="pd-regular-strike">MYR {product.price.toFixed(2)}</span>
                    {product.price > product.salePrice && (
                      <span className="pd-discount-badge">
                        {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                      </span>
                    )}
                  </>
                ) : (
                  <span className="pd-normal-price">MYR {product.price.toFixed(2)}</span>
                )}
              </div>
              <div className="pd-tax-note">Tax included. <Link to="/about" className="tax-shipping-link">Shipping</Link> calculated at checkout.</div>
            </div>

            {/* Wishlist & Share Inline Row (Matching Reference Screenshot) */}
            <div className="pd-wishlist-inline-row">
              <button
                type="button"
                className={`pd-kalyan-wishlist-btn ${isWishlisted(product._id || product.id) ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={isWishlisted(product._id || product.id) ? '#dc2626' : 'none'} stroke={isWishlisted(product._id || product.id) ? '#dc2626' : '#dc2626'} strokeWidth="1.8">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span>{isWishlisted(product._id || product.id) ? 'Added to wishlist' : 'Add to wishlist'}</span>
              </button>

              <button
                type="button"
                className={`pd-kalyan-share-btn ${shareFeedback ? 'copied' : ''}`}
                onClick={handleShare}
                title="Share this product"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                <span>{shareFeedback ? 'Copied Link' : 'Share'}</span>
              </button>
            </div>

            {/* In Stock Highlight (Matching Reference Screenshot: "7 Items In Stock") */}
            <div className="pd-stock-kalyan-box">
              {product.inStock && product.stockQuantity > 0 ? (
                <span className="pd-kalyan-stock-count">{product.stockQuantity} Items In Stock</span>
              ) : (
                <span className="pd-kalyan-stock-out">Out of Stock</span>
              )}
            </div>

            {/* Dynamic Specifications Grid */}
            <div className="pd-specs-table">
              {product.sku && (
                <div className="spec-row">
                  <div className="spec-label"><span className="spec-icon">🏷️</span> SKU</div>
                  <div className="spec-value">{product.sku}</div>
                </div>
              )}
              {product.category && (
                <div className="spec-row">
                  <div className="spec-label"><span className="spec-icon">📁</span> Category</div>
                  <div className="spec-value">{product.category}</div>
                </div>
              )}
              {product.gender && (
                <div className="spec-row">
                  <div className="spec-label"><span className="spec-icon">👤</span> Gender</div>
                  <div className="spec-value">{product.gender}</div>
                </div>
              )}
              <div className="spec-row">
                <div className="spec-label"><span className="spec-icon">📦</span> Stock</div>
                <div className="spec-value">{product.inStock && product.stockQuantity > 0 ? `${product.stockQuantity} units available` : 'Out of Stock'}</div>
              </div>
              {product.fabric && (
                <div className="spec-row">
                  <div className="spec-label"><span className="spec-icon">🧶</span> Fabric</div>
                  <div className="spec-value">{product.fabric}</div>
                </div>
              )}
              {product.color && (
                <div className="spec-row">
                  <div className="spec-label"><span className="spec-icon">🎨</span> Color</div>
                  <div className="spec-value">{product.color}</div>
                </div>
              )}
              {product.work && (
                <div className="spec-row">
                  <div className="spec-label"><span className="spec-icon">⚙️</span> Work</div>
                  <div className="spec-value">{product.work}</div>
                </div>
              )}
              {product.occasion && (
                <div className="spec-row">
                  <div className="spec-label"><span className="spec-icon">💃</span> Occasion</div>
                  <div className="spec-value">{product.occasion}</div>
                </div>
              )}
            </div>

            {/* Quantity Stepper */}
            <div className="pd-quantity-row">
              <span className="qty-title">Quantity</span>
              <div className="qty-stepper-box">
                <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                <span className="qty-num">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
              </div>
            </div>

            {/* Action Buttons: Add to Cart (Top) & Buy It Now (Bottom in Website Navy Color) */}
            <div className="pd-actions-row">
              <button
                type="button"
                className="pd-add-to-cart-btn disabled-action-btn"
                disabled
                title="Coming Soon"
              >
                Add to Cart
              </button>

              <button
                type="button"
                className="pd-buy-now-btn disabled-action-btn"
                disabled
                title="Coming Soon"
              >
                Buy It Now
              </button>
            </div>

            {/* Shipping & Delivery Perks (Matching Reference Screenshot) */}
            <div className="pd-shipping-perks-list">
              <div className="shipping-perk-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
                <span>Free Shipping on Orders above MYR 150</span>
              </div>
              <div className="shipping-perk-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span>Shipped within 48 business hours</span>
              </div>
              <div className="shipping-perk-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                <span>Delivery within 7 business days after dispatch. <Link to="/about" className="shipping-policy-link">View Shipping Policy</Link></span>
              </div>
            </div>

            {/* Guarantees */}
            <div className="pd-guarantee-row">
              <div className="guarantee-item">🔒 <span>100% Secure Payment</span></div>
              <div className="guarantee-item">🔄 <span>Easy Returns & 7 Days Return Policy</span></div>
            </div>
          </div>
        </div>

        {/* Dynamic Product Description Section */}
        <div className="pd-description-card">
          <h3 className="pd-section-heading">Description</h3>
          <div className="pd-description-body">
            {product.description ? (
              product.description.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))
            ) : (
              <p className="no-desc">No description available for this product.</p>
            )}
          </div>
        </div>

        {/* You May Also Like Section - Only shown when backend related products exist */}
        {relatedProducts.length > 0 && (
          <div className="pd-related-section">
            <div className="pd-related-header">
              <span className="ornament-line">❖</span>
              <h2 className="related-title">You May Also Like</h2>
              <span className="ornament-line">❖</span>
            </div>

            <div className="pd-related-grid">
              {relatedProducts.map((rel) => {
                const relId = rel._id || rel.id;
                const relPrice = typeof rel.price === 'number'
                  ? rel.price
                  : (parseFloat(String(rel.price).replace(/[^0-9.]/g, '')) || 0);
                const relSalePrice = (rel.salePrice !== undefined && rel.salePrice !== null && rel.salePrice !== '')
                  ? (typeof rel.salePrice === 'number' ? rel.salePrice : parseFloat(String(rel.salePrice).replace(/[^0-9.]/g, '')) || null)
                  : null;
                const relImg = rel.image || (Array.isArray(rel.images) && rel.images.length > 0 ? rel.images[0] : placeholderSvg);

                return (
                  <div key={relId} className="pd-rel-card">
                    <Link to={`/product/${relId}`} onClick={() => window.scrollTo(0, 0)}>
                      <div className="rel-img-wrapper">
                        <SafeImage src={relImg} alt={rel.name || rel.title} />
                      </div>
                      <div className="rel-info">
                        <div className="rel-name">{rel.name || rel.title}</div>
                        <div className="rel-price">
                          {relSalePrice && relSalePrice > 0 ? (
                            <>
                              <span className="rel-sale-price">MYR {relSalePrice.toFixed(2)}</span>
                              <span className="rel-regular-strike">MYR {relPrice.toFixed(2)}</span>
                            </>
                          ) : (
                            <span>MYR {relPrice.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />

      {/* Share Toast Notification */}
      {shareFeedback && (
        <div className="pd-share-toast">
          <span>✓</span> {shareFeedback}
        </div>
      )}

      {/* Image Zoom Lightbox Modal */}
      {isZoomOpen && (
        <div
          className="pd-zoom-modal-backdrop"
          onClick={(e) => {
            if (e.target.classList.contains('pd-zoom-modal-backdrop') || e.target.classList.contains('pd-zoom-stage')) {
              setIsZoomOpen(false);
            }
          }}
        >
          {/* Header Controls */}
          <div className="pd-zoom-header">
            <div className="pd-zoom-counter">
              {product.images.length > 1
                ? `${selectedImage + 1} / ${product.images.length}`
                : product.title}
            </div>

            <div className="pd-zoom-hint-badge">
              <span className="pd-hint-pulse"></span>
              <span>Hover image to zoom • Move cursor to inspect details</span>
            </div>

            <div className="pd-zoom-controls">
              <div className="pd-zoom-level-toggle" title="Zoom magnification on hover">
                <span className="pd-zoom-toggle-label">Scale:</span>
                {[1.8, 2.5, 3.2].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    className={`pd-zoom-lvl-btn ${modalZoomLevel === lvl ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalZoomLevel(lvl);
                    }}
                    title={`Set zoom scale to ${lvl}x`}
                  >
                    {lvl}x
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="pd-zoom-close-btn"
                onClick={() => setIsZoomOpen(false)}
                title="Close (Esc)"
                aria-label="Close Zoom"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Main Zoomed Image Stage */}
          <div className="pd-zoom-stage">
            {product.images.length > 1 && (
              <button
                type="button"
                className="pd-zoom-nav-btn prev"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
                  setIsModalHovered(false);
                  setIsZoomLocked(false);
                }}
                aria-label="Previous Image"
              >
                ‹
              </button>
            )}

            <div
              className={`pd-zoom-image-container ${isModalHovered || isZoomLocked ? 'is-zoomed' : ''}`}
              onMouseEnter={() => setIsModalHovered(true)}
              onMouseLeave={() => {
                if (!isZoomLocked) {
                  setIsModalHovered(false);
                  setModalHoverPos({ x: 50, y: 50 });
                }
              }}
              onMouseMove={handleModalMouseMove}
              onClick={() => setIsZoomLocked((prev) => !prev)}
              title={isZoomLocked ? 'Click to unlock hover zoom' : 'Hover to inspect • Click to lock zoom'}
            >
              <SafeImage
                src={product.images?.[selectedImage] || product.images?.[0] || placeholderSvg}
                alt={product.title}
                className="pd-zoom-image"
                style={{
                  transformOrigin: `${modalHoverPos.x}% ${modalHoverPos.y}%`,
                  transform: isModalHovered || isZoomLocked ? `scale(${modalZoomLevel})` : 'scale(1)',
                  cursor: isZoomLocked ? 'zoom-out' : isModalHovered ? 'crosshair' : 'zoom-in'
                }}
              />

              {!isModalHovered && !isZoomLocked && (
                <div className="pd-zoom-floating-tag">
                  🔍 Hover to Zoom ({modalZoomLevel}x)
                </div>
              )}

              {isZoomLocked && (
                <div className="pd-zoom-locked-tag">
                  🔒 Zoom Locked • Click to Unlock
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <button
                type="button"
                className="pd-zoom-nav-btn next"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) => (prev + 1) % product.images.length);
                  setIsModalHovered(false);
                  setIsZoomLocked(false);
                }}
                aria-label="Next Image"
              >
                ›
              </button>
            )}
          </div>

          {/* Bottom Thumbnails */}
          {product.images.length > 1 && (
            <div className="pd-zoom-thumbs">
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`pd-zoom-thumb-item ${selectedImage === idx ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedImage(idx);
                    setIsModalHovered(false);
                    setIsZoomLocked(false);
                  }}
                >
                  <SafeImage src={img} alt={`Thumb ${idx + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
