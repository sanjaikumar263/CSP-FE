import { useShop } from '../context/ShopContext';
import SafeImage from './SafeImage';
import placeholderSvg from '../assets/placeholder.svg';
import './CartDrawerModal.css';

export default function CartDrawerModal() {
  const {
    isCartDrawerOpen,
    closeCartDrawer,
    isWishlistDrawerOpen,
    closeWishlistDrawer,
    cartItems,
    cartSubtotal,
    removeFromCart,
    updateCartQty,
    clearCart,
    wishlistItems,
    toggleWishlist,
    addToCart,
    showToast
  } = useShop();

  const isOpen = isCartDrawerOpen || isWishlistDrawerOpen;
  const isCart = isCartDrawerOpen;

  if (!isOpen) return null;

  const handleClose = () => {
    closeCartDrawer();
    closeWishlistDrawer();
  };

  const handleCheckout = () => {
    showToast('🚀 Proceeding to Checkout...', 'success');
    closeCartDrawer();
  };

  return (
    <div className="drawer-overlay" onClick={handleClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <h3>{isCart ? '🛍️ Your Shopping Cart' : '❤️ Your Wishlist'}</h3>
            <span className="drawer-count-badge">
              {isCart ? cartItems.length : wishlistItems.length} {isCart ? 'item(s)' : 'saved'}
            </span>
          </div>
          <button className="drawer-close-btn" onClick={handleClose} aria-label="Close drawer">✕</button>
        </div>

        {/* Content Body */}
        <div className="drawer-body">
          {isCart ? (
            cartItems.length > 0 ? (
              <div className="drawer-items-list">
                {cartItems.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="drawer-item-card">
                    <div className="item-img-box">
                      <SafeImage src={item.image || placeholderSvg} alt={item.title} />
                    </div>
                    <div className="item-details">
                      <h4 className="item-title">{item.title}</h4>
                      <div className="item-meta">
                        {item.selectedSize && <span className="meta-pill">{item.selectedSize}</span>}
                        {item.category && <span className="meta-pill">{item.category}</span>}
                      </div>
                      <div className="item-price-row">
                        <span className="item-price">{item.currency || 'MYR'} {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      <div className="item-stepper-row">
                        <div className="stepper-box">
                          <button onClick={() => updateCartQty(item.id, item.selectedSize, -1)}>−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateCartQty(item.id, item.selectedSize, 1)}>+</button>
                        </div>
                        <button
                          className="item-remove-btn"
                          onClick={() => removeFromCart(item.id, item.selectedSize)}
                          title="Remove item"
                        >
                          Remove 🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="drawer-empty-box">
                <div className="empty-icon">🛍️</div>
                <h4>Your cart is empty</h4>
                <p>Explore our silk sarees, lehengas & traditional collections!</p>
              </div>
            )
          ) : (
            wishlistItems.length > 0 ? (
              <div className="drawer-items-list">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="drawer-item-card">
                    <div className="item-img-box">
                      <SafeImage src={item.image || placeholderSvg} alt={item.title} />
                    </div>
                    <div className="item-details">
                      <h4 className="item-title">{item.title}</h4>
                      <div className="item-price-row">
                        <span className="item-price">{item.currency || 'MYR'} {item.price.toFixed(2)}</span>
                      </div>
                      <div className="wishlist-actions">
                        <button
                          className="wishlist-add-cart-btn"
                          onClick={() => {
                            addToCart(item, 1);
                          }}
                        >
                          Add to Cart 🛒
                        </button>
                        <button
                          className="item-remove-btn"
                          onClick={() => toggleWishlist(item)}
                          title="Remove from wishlist"
                        >
                          Remove ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="drawer-empty-box">
                <div className="empty-icon">❤️</div>
                <h4>Your wishlist is empty</h4>
                <p>Click the heart icon on any product to save it to your wishlist!</p>
              </div>
            )
          )}
        </div>

        {/* Footer Subtotal & Checkout */}
        {isCart && cartItems.length > 0 && (
          <div className="drawer-footer">
            <div className="subtotal-row">
              <span>Subtotal:</span>
              <span className="subtotal-amount">MYR {cartSubtotal.toFixed(2)}</span>
            </div>
            <p className="shipping-note">Shipping & taxes calculated at checkout</p>
            <div className="footer-actions">
              <button className="clear-cart-btn" onClick={clearCart}>Clear All</button>
              <button className="checkout-btn" onClick={handleCheckout}>CHECKOUT NOW →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
