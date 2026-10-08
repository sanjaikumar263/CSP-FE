import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SafeImage from '../components/SafeImage';
import placeholderSvg from '../assets/placeholder.svg';
import { useCart } from '../context/CartContext';
import './CartPage.css';

const FREE_SHIPPING_THRESHOLD = 150;

export default function CartPage() {
  const {
    cart,
    cartCount,
    cartSubtotal,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);
  const freeShippingPercent = Math.min(100, Math.round((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <div className="cart-page-container">
      <Header />

      <main className="cart-page-main">
        <div className="container-inner">
          {/* Breadcrumb */}
          <nav className="cart-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">›</span>
            <span className="current">Shopping Bag</span>
          </nav>

          {/* Banner */}
          <div className="cart-page-header-banner">
            <div className="cart-header-left">
              <span className="cart-eyebrow">❖ LUXURY ATTIRE & SILKS ❖</span>
              <h1 className="cart-page-title">My Shopping Bag</h1>
              <p className="cart-page-subtitle">
                {cartCount === 0
                  ? 'Your bag is currently empty'
                  : `You have ${cartCount} ${cartCount === 1 ? 'item' : 'items'} in your shopping bag`}
              </p>
            </div>
            {cartCount > 0 && (
              <button
                type="button"
                className="cart-clear-btn-top"
                onClick={() => {
                  if (window.confirm('Are you sure you want to remove all items from your shopping bag?')) {
                    clearCart();
                  }
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Clear Bag
              </button>
            )}
          </div>

          {/* Empty State */}
          {cartCount === 0 ? (
            <div className="cart-page-empty-box">
              <div className="cart-empty-bag-icon">
                <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <h2 className="empty-heading">Your Shopping Bag is Empty</h2>
              <p className="empty-subtext">
                Browse our hand-loomed pure Kanchipuram silk sarees, festive bridal collections, and contemporary ethnic wear.
              </p>
              <div className="empty-actions-row">
                <Link to="/products" className="empty-shop-now-btn">
                  Explore Collections
                </Link>
                <Link to="/wishlist" className="empty-view-wishlist-btn">
                  View Saved Wishlist
                </Link>
              </div>
            </div>
          ) : (
            <div className="cart-page-layout-grid">
              {/* Left Column: Items Table */}
              <div className="cart-page-items-col">
                {/* Shipping Banner */}
                <div className="cart-page-shipping-banner">
                  <div className="shipping-banner-text-row">
                    <span className="shipping-van-icon">🚚</span>
                    {freeShippingRemaining > 0 ? (
                      <span>
                        Add <strong>MYR {freeShippingRemaining.toFixed(2)}</strong> more to get <strong>Free Express Shipping</strong>!
                      </span>
                    ) : (
                      <span className="free-unlocked-text">
                        🎉 <strong>Congratulations!</strong> You qualify for <strong>Free Express Shipping</strong>.
                      </span>
                    )}
                  </div>
                  <div className="shipping-track-outer">
                    <div
                      className={`shipping-fill-inner ${freeShippingRemaining === 0 ? 'complete' : ''}`}
                      style={{ width: `${freeShippingPercent}%` }}
                    />
                  </div>
                </div>

                {/* Items List */}
                <div className="cart-page-items-table">
                  <div className="items-table-header">
                    <span className="col-product">Product</span>
                    <span className="col-price">Price</span>
                    <span className="col-qty">Quantity</span>
                    <span className="col-total">Total</span>
                    <span className="col-action"></span>
                  </div>

                  {cart.map((item) => (
                    <div key={item.id} className="cart-table-row">
                      {/* Product Thumbnail & Details */}
                      <div className="cart-table-cell col-product">
                        <Link to={`/product/${item.productId}`} className="table-item-img-link">
                          <SafeImage
                            src={item.image || placeholderSvg}
                            alt={item.title}
                            className="table-item-img"
                          />
                        </Link>

                        <div className="table-item-meta">
                          {item.category && <span className="table-item-cat">{item.category}</span>}
                          <Link to={`/product/${item.productId}`} className="table-item-title">
                            {item.title}
                          </Link>

                          {/* EXACT COLOR & SIZE HIGHLIGHT */}
                          <div className="table-item-variant-pills">
                            {item.selectedColor && (
                              <span className="variant-pill-tag color-tag" title={`Color: ${item.selectedColor}`}>
                                <span
                                  className="pill-swatch-dot"
                                  style={{ backgroundColor: item.colorCode || '#0A305D' }}
                                />
                                <span className="pill-key">Color:</span>
                                <strong className="pill-val">{item.selectedColor}</strong>
                              </span>
                            )}

                            {item.selectedSize && (
                              <span className="variant-pill-tag size-tag" title={`Size: ${item.selectedSize}`}>
                                <span className="size-icon-symbol">📏</span>
                                <span className="pill-key">Size:</span>
                                <strong className="pill-val">{item.selectedSize}</strong>
                              </span>
                            )}

                            {item.sku && (
                              <span className="variant-pill-tag sku-tag">
                                <span className="pill-key">SKU:</span>
                                <span className="pill-val">{item.sku}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Unit Price */}
                      <div className="cart-table-cell col-price" data-label="Price:">
                        <span className="price-val">
                          {item.currency || 'MYR'} {typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                        </span>
                        {item.originalPrice && (
                          <span className="orig-price-strike">
                            {item.currency || 'MYR'} {typeof item.originalPrice === 'number' ? item.originalPrice.toFixed(2) : item.originalPrice}
                          </span>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="cart-table-cell col-qty" data-label="Quantity:">
                        <div className="table-stepper-box">
                          <button
                            type="button"
                            className="table-stepper-btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="table-stepper-val">{item.quantity}</span>
                          <button
                            type="button"
                            className="table-stepper-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= (item.stockQuantity || 99)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Subtotal for line */}
                      <div className="cart-table-cell col-total" data-label="Total:">
                        <span className="line-total-price">
                          {item.currency || 'MYR'} {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <div className="cart-table-cell col-action">
                        <button
                          type="button"
                          className="table-remove-btn"
                          onClick={() => removeFromCart(item.id)}
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-table-bottom-nav">
                  <Link to="/products" className="continue-shopping-link">
                    ← Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="cart-page-summary-col">
                <div className="order-summary-card">
                  <h3 className="summary-card-heading">Order Summary</h3>

                  <div className="summary-data-list">
                    <div className="summary-data-row">
                      <span className="data-label">Bag Subtotal</span>
                      <span className="data-val">MYR {cartSubtotal.toFixed(2)}</span>
                    </div>

                    <div className="summary-data-row">
                      <span className="data-label">Estimated Shipping</span>
                      <span className="data-val highlight-free">
                        {cartSubtotal >= FREE_SHIPPING_THRESHOLD ? 'FREE' : 'Calculated at checkout'}
                      </span>
                    </div>

                    <div className="summary-data-row">
                      <span className="data-label">Tax</span>
                      <span className="data-val">Included</span>
                    </div>

                    <div className="summary-data-divider" />

                    <div className="summary-data-row total-row">
                      <span className="total-label">Total Amount</span>
                      <span className="total-val">MYR {cartSubtotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="summary-checkout-btn"
                    onClick={() => {
                      alert(`Thank you for choosing Chennai Silk Palace! Checkout is configured for online payment & express dispatch. (Order Total: MYR ${cartSubtotal.toFixed(2)})`);
                    }}
                  >
                    <span>Proceed to Checkout</span>
                    <span className="summary-btn-arrow">→</span>
                  </button>

                  <div className="summary-trust-perks">
                    <div className="perk-box">
                      <span className="perk-icon">💎</span>
                      <div className="perk-text">
                        <strong>Silk Mark Certified</strong>
                        <span>100% Genuine Handloom Quality</span>
                      </div>
                    </div>

                    <div className="perk-box">
                      <span className="perk-icon">🛡️</span>
                      <div className="perk-text">
                        <strong>Secure Encryption</strong>
                        <span>Safe & Protected Payments</span>
                      </div>
                    </div>

                    <div className="perk-box">
                      <span className="perk-icon">📦</span>
                      <div className="perk-text">
                        <strong>Express Dispatch</strong>
                        <span>Within 48 Business Hours</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
