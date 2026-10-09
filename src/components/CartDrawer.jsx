import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import SafeImage from './SafeImage';
import placeholderSvg from '../assets/placeholder.svg';
import './CartDrawer.css';

const FREE_SHIPPING_THRESHOLD = 150;

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    cart,
    cartCount,
    cartSubtotal,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  // Close drawer on Escape key and disable body scroll when open
  useEffect(() => {
    if (!isCartOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeCart();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);
  const freeShippingPercent = Math.min(100, Math.round((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <div className="cart-drawer-portal">
      {/* Backdrop */}
      <div className="cart-drawer-backdrop" onClick={closeCart} aria-hidden="true" />

      {/* Drawer Container */}
      <aside className="cart-drawer-panel" role="dialog" aria-modal="true" aria-label="Shopping Bag">
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-title-group">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <h2 className="cart-drawer-title">Shopping Bag</h2>
            <span className="cart-drawer-badge">{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
          </div>

          <button
            type="button"
            className="cart-drawer-close-btn"
            onClick={closeCart}
            aria-label="Close Shopping Bag"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="cart-drawer-shipping-meter">
          {freeShippingRemaining > 0 ? (
            <p className="shipping-meter-text">
              Add <strong>MYR {freeShippingRemaining.toFixed(2)}</strong> more for <strong>Free Express Shipping</strong>!
            </p>
          ) : (
            <p className="shipping-meter-text free-unlocked">
              🎉 <strong>Free Express Shipping</strong> unlocked!
            </p>
          )}
          <div className="shipping-progress-track">
            <div
              className={`shipping-progress-fill ${freeShippingRemaining === 0 ? 'complete' : ''}`}
              style={{ width: `${freeShippingPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Items List or Empty State */}
        {cart.length === 0 ? (
          <div className="cart-drawer-empty">
            <div className="empty-cart-icon-wrap">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <h3 className="empty-cart-title">Your shopping bag is empty</h3>
            <p className="empty-cart-desc">
              Discover our latest collections of pure Kanchipuram silk sarees, designer kurtas, and regal attire.
            </p>
            <Link
              to="/products"
              className="empty-cart-shop-btn"
              onClick={closeCart}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-drawer-items-list">
            {cart.map((item) => (
              <div key={item.id} className="cart-item-row">
                {/* Thumbnail with color-matching photo */}
                <Link
                  to={`/product/${item.productId}`}
                  className="cart-item-thumb-link"
                  onClick={closeCart}
                >
                  <SafeImage
                    src={item.image || placeholderSvg}
                    alt={item.title}
                    className="cart-item-thumb-img"
                  />
                </Link>

                {/* Details */}
                <div className="cart-item-details">
                  <div className="cart-item-top-line">
                    <Link
                      to={`/product/${item.productId}`}
                      className="cart-item-name"
                      onClick={closeCart}
                    >
                      {item.title}
                    </Link>
                    <button
                      type="button"
                      className="cart-item-remove-btn"
                      onClick={() => removeFromCart(item.id)}
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>

                  {/* EXACT SELECTED COLOR AND SIZE HIGHLIGHT */}
                  <div className="cart-item-variant-pills">
                    {item.selectedColor && (
                      <span className="cart-variant-pill color-pill" title={`Selected Color: ${item.selectedColor}`}>
                        <span
                          className="cart-color-dot"
                          style={{ backgroundColor: item.colorCode || '#0A305D' }}
                        />
                        <span className="cart-pill-label">Color:</span>
                        <strong className="cart-pill-val">{item.selectedColor}</strong>
                      </span>
                    )}

                    {item.selectedSize && (
                      <span className="cart-variant-pill size-pill" title={`Selected Size: ${item.selectedSize}`}>
                        <span className="cart-size-icon">📏</span>
                        <span className="cart-pill-label">Size:</span>
                        <strong className="cart-pill-val">{item.selectedSize}</strong>
                      </span>
                    )}

                    {item.sku && (
                      <span className="cart-variant-pill sku-pill" title={`SKU: ${item.sku}`}>
                        <span className="cart-pill-label">SKU:</span>
                        <span className="cart-pill-val">{item.sku}</span>
                      </span>
                    )}
                  </div>

                  {/* Price & Quantity Stepper */}
                  <div className="cart-item-bottom-bar">
                    <div className="cart-item-price-wrap">
                      <span className="cart-item-current-price">
                        {item.currency || 'MYR'} {typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                      </span>
                      {item.originalPrice && (
                        <span className="cart-item-orig-price">
                          {item.currency || 'MYR'} {typeof item.originalPrice === 'number' ? item.originalPrice.toFixed(2) : item.originalPrice}
                        </span>
                      )}
                    </div>

                    <div className="cart-stepper-control">
                      <button
                        type="button"
                        className="cart-stepper-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="cart-stepper-qty">{item.quantity}</span>
                      <button
                        type="button"
                        className="cart-stepper-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= (item.stockQuantity || 99)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer with Subtotal & Checkout */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-line subtotal-line">
              <span className="summary-label">Subtotal</span>
              <span className="summary-value">MYR {cartSubtotal.toFixed(2)}</span>
            </div>

            <div className="cart-summary-line shipping-line">
              <span className="summary-label">Shipping</span>
              <span className="summary-value highlight-shipping">
                {cartSubtotal >= FREE_SHIPPING_THRESHOLD ? 'FREE' : 'Calculated at checkout'}
              </span>
            </div>

            <p className="cart-tax-notice">Taxes included. Discounts applied at checkout.</p>

            <div className="cart-drawer-btn-stack">
              <button
                type="button"
                className="cart-checkout-btn"
                onClick={() => {
                  closeCart();
                  navigate('/checkout');
                }}
              >
                <span>Proceed to Checkout</span>
                <span className="checkout-btn-arrow">→</span>
              </button>

              <button
                type="button"
                className="cart-continue-btn"
                onClick={closeCart}
              >
                Continue Shopping
              </button>
            </div>

            {/* Quick Clear Option */}
            <div className="cart-bottom-clear-wrap">
              <button
                type="button"
                className="cart-clear-link"
                onClick={() => {
                  if (window.confirm('Are you sure you want to empty your shopping bag?')) {
                    clearCart();
                  }
                }}
              >
                Clear Shopping Bag
              </button>
            </div>

            {/* Trust Badges */}
            <div className="cart-trust-ribbon">
              <div className="trust-item">
                <span>🛡️</span>
                <span>100% Authentic Silk</span>
              </div>
              <div className="trust-item">
                <span>🔒</span>
                <span>Secure Checkout</span>
              </div>
              <div className="trust-item">
                <span>⚡</span>
                <span>Express Dispatch</span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
