import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SafeImage from '../components/SafeImage';
import placeholderSvg from '../assets/placeholder.svg';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import './WishlistPage.css';

export default function WishlistPage() {
  const { wishlist, wishlistCount, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCartFromWishlist = (item) => {
    addToCart(item, {
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
      colorCode: item.colorCode,
      image: item.image,
      sku: item.sku,
      quantity: 1,
      stockQuantity: item.stockQuantity || 99
    });
  };

  return (
    <div className="wishlist-page-container">
      <Header />

      <main className="wishlist-main-content">
        <div className="container-inner">
          {/* Breadcrumb */}
          <nav className="wishlist-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">›</span>
            <span className="current">Wishlist</span>
          </nav>

          {/* Page Header */}
          <div className="wishlist-header-banner">
            <div className="wishlist-header-left">
              <span className="wishlist-eyebrow">❖ SAVED STYLES ❖</span>
              <h1 className="wishlist-title">My Wishlist</h1>
              <p className="wishlist-subtitle">
                {wishlistCount === 0
                  ? 'No items saved yet'
                  : `You have ${wishlistCount} ${wishlistCount === 1 ? 'item' : 'items'} in your wishlist`}
              </p>
            </div>
            {wishlistCount > 0 && (
              <div className="wishlist-header-actions">
                <button
                  type="button"
                  className="wishlist-clear-all-btn"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
                      clearWishlist();
                    }
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Clear Wishlist
                </button>
              </div>
            )}
          </div>

          {/* Main Content: Empty State or Grid */}
          {wishlistCount === 0 ? (
            <div className="wishlist-empty-card">
              <div className="empty-heart-circle">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <h2 className="empty-title">Your Wishlist is Empty</h2>
              <p className="empty-text">
                Explore our exquisite silk collections, designer sarees, and regal outfits, then tap the heart icon to save your favorites!
              </p>
              <div className="empty-action-row">
                <Link to="/products" className="empty-browse-btn">
                  Explore All Collections
                </Link>
                <Link to="/" className="empty-home-btn">
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="wishlist-grid">
              {wishlist.map((item) => {
                const targetProdId = item.productId || item.id;
                return (
                  <div key={item.id} className="wishlist-card">
                    <div className="wishlist-card-media">
                      {item.isNew && <span className="wishlist-tag-badge">NEW</span>}

                      {/* Remove Heart Button */}
                      <button
                        type="button"
                        className="wishlist-remove-icon-btn"
                        onClick={() => removeFromWishlist(item.id)}
                        title="Remove from Wishlist"
                        aria-label="Remove from Wishlist"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#b91c1c" stroke="#b91c1c" strokeWidth="2">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>

                      <Link to={`/product/${targetProdId}`} className="wishlist-img-link">
                        <SafeImage
                          src={item.image || placeholderSvg}
                          alt={item.name || item.title}
                          className="wishlist-card-img"
                        />
                      </Link>
                    </div>

                    <div className="wishlist-card-info">
                      {item.category && (
                        <span className="wishlist-card-cat">{item.category}</span>
                      )}

                      <Link to={`/product/${targetProdId}`} className="wishlist-card-title-link">
                        <h3 className="wishlist-card-title">{item.name || item.title}</h3>
                      </Link>

                      {/* EXACT SELECTED COLOR AND SIZE HIGHLIGHT */}
                      {(item.selectedColor || item.selectedSize) && (
                        <div className="wishlist-card-variant-box">
                          {item.selectedColor && (
                            <span className="wishlist-pill color-pill" title={`Color: ${item.selectedColor}`}>
                              <span
                                className="pill-dot"
                                style={{ backgroundColor: item.colorCode || '#0A305D' }}
                              />
                              <span className="pill-lbl">Color:</span>
                              <strong className="pill-val">{item.selectedColor}</strong>
                            </span>
                          )}

                          {item.selectedSize && (
                            <span className="wishlist-pill size-pill" title={`Size: ${item.selectedSize}`}>
                              <span className="pill-size-icon">📏</span>
                              <span className="pill-lbl">Size:</span>
                              <strong className="pill-val">{item.selectedSize}</strong>
                            </span>
                          )}
                        </div>
                      )}

                      <div className="wishlist-card-price-row">
                        <span className="price-current">
                          {item.currency || 'MYR'} {typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                        </span>
                        {item.originalPrice && (
                          <span className="price-original">
                            {item.currency || 'MYR'} {typeof item.originalPrice === 'number' ? item.originalPrice.toFixed(2) : item.originalPrice}
                          </span>
                        )}
                      </div>

                      <div className="wishlist-card-actions">
                        <button
                          type="button"
                          className="wishlist-add-cart-btn active-cart-btn"
                          onClick={() => handleAddToCartFromWishlist(item)}
                          title="Move to Shopping Bag"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                          </svg>
                          Add to Cart
                        </button>

                        <button
                          type="button"
                          className="wishlist-quick-remove-btn"
                          onClick={() => removeFromWishlist(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
