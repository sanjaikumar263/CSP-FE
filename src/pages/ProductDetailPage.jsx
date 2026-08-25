import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import SafeImage from '../components/SafeImage';
import placeholderSvg from '../assets/placeholder.svg';
import { API_BASE_URL } from '../config';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [apiProduct, setApiProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

            <div className="pd-main-image-wrapper">
              <SafeImage
                src={product.images?.[selectedImage] || product.images?.[0] || placeholderSvg}
                alt={product.title}
                className="pd-main-image"
              />
              <button className="pd-zoom-btn" aria-label="Zoom Image">
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
            {/* Category Badges / Tags */}
            {(product.tags.length > 0 ? product.tags : (product.category ? [product.category] : [])).length > 0 && (
              <div className="pd-badge-row">
                {(product.tags.length > 0 ? product.tags : [product.category]).map((tag, i) => (
                  <span key={i} className="pd-tag-pill">{tag}</span>
                ))}
              </div>
            )}

            {/* Product Title */}
            <h1 className="pd-title">{product.title}</h1>

            {/* Stock Status */}
            <div className="pd-rating-stock-row">
              <div className="pd-stock-status">
                <span className={`green-dot ${product.inStock && product.stockQuantity > 0 ? '' : 'red-dot'}`}></span>
                {product.inStock && product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
              </div>
            </div>

            {/* Price */}
            <div className="pd-price-box">
              <div className="pd-price-amount">
                MYR {product.price.toFixed(2)}
                {product.salePrice && (
                  <span className="pd-sale-price-strike"> MYR {product.salePrice.toFixed(2)}</span>
                )}
              </div>
              <div className="pd-tax-note">Inclusive of all taxes</div>
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

            {/* Delivery Info Banner */}
            <div className="pd-delivery-card">
              <div className="delivery-col">
                <span className="del-icon">🚚</span>
                <div>
                  <div className="del-title">Delivery</div>
                  <div className="del-sub">2 - 4 Working Days</div>
                </div>
              </div>
              <div className="delivery-col">
                <span className="del-icon">📦</span>
                <div>
                  <div className="del-title">Free Shipping</div>
                  <div className="del-sub">On orders above MYR 100</div>
                </div>
              </div>
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

            {/* Action Buttons */}
            <div className="pd-actions-row">
              <button className="pd-buy-now-btn disabled-action-btn" disabled title="Coming Soon">⚡ BUY NOW</button>
              <button className="pd-add-to-cart-btn disabled-action-btn" disabled title="Coming Soon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                ADD TO CART
              </button>
              <button
                className={`pd-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? '#0a305d' : 'none'} stroke={isWishlisted ? '#0a305d' : '#555'} strokeWidth="1.8">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                WISHLIST
              </button>
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
                const relImg = rel.image || (Array.isArray(rel.images) && rel.images.length > 0 ? rel.images[0] : placeholderSvg);

                return (
                  <div key={relId} className="pd-rel-card">
                    <Link to={`/product/${relId}`} onClick={() => window.scrollTo(0, 0)}>
                      <div className="rel-img-wrapper">
                        <SafeImage src={relImg} alt={rel.name || rel.title} />
                      </div>
                      <div className="rel-info">
                        <div className="rel-name">{rel.name || rel.title}</div>
                        <div className="rel-price">MYR {relPrice.toFixed(2)}</div>
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
    </div>
  );
}
