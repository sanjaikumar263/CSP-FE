import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SafeImage from '../components/SafeImage';
import placeholderSvg from '../assets/placeholder.svg';
import { useCart } from '../context/CartContext';
import { sendParcelService, resolveMalaysiaPostcode, MALAYSIA_STATES } from '../services/sendParcelService';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartSubtotal, clearCart } = useCart();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    postcode: '',
    city: '',
    state: 'Selangor',
    notes: '',
    paymentMethod: 'COD' // 'COD' | 'ONLINE_BANKING'
  });

  // Shipping Calculation State
  const [receiverPostcodeMeta, setReceiverPostcodeMeta] = useState(null);
  const [shippingQuote, setShippingQuote] = useState(null);
  const [selectedServiceCode, setSelectedServiceCode] = useState('POS_LAJU_DOM');
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [formError, setFormError] = useState('');

  // Redirect if cart is empty and not viewing success
  useEffect(() => {
    if (cart.length === 0 && !orderSuccess) {
      // Allow viewing if order was just placed
    }
  }, [cart, orderSuccess]);

  // Handle Postcode change with live SendParcel PRO rate calculation
  const handlePostcodeChange = async (val) => {
    const cleanPostcode = val.replace(/\D/g, '').slice(0, 5);
    setFormData(prev => ({ ...prev, postcode: cleanPostcode }));

    if (cleanPostcode.length >= 4) {
      const resolved = resolveMalaysiaPostcode(cleanPostcode);
      if (resolved) {
        setReceiverPostcodeMeta(resolved);
        setFormData(prev => ({
          ...prev,
          state: resolved.state,
          city: prev.city || (resolved.stateCode === 'KUL' ? 'Kuala Lumpur' : resolved.state)
        }));

        try {
          setCalculatingShipping(true);
          const quote = await sendParcelService.calculateRates({
            senderPostcode: '41000', // Klang Warehouse
            receiverPostcode: cleanPostcode,
            weightKg: Math.max(0.8, cart.reduce((sum, item) => sum + (item.quantity * 0.75), 0)),
            itemValue: cartSubtotal
          });
          setShippingQuote(quote);
        } catch (err) {
          console.warn('Shipping rate calculation error:', err);
        } finally {
          setCalculatingShipping(false);
        }
      }
    } else {
      setReceiverPostcodeMeta(null);
      setShippingQuote(null);
    }
  };

  // Determine Selected Shipping Fee
  const selectedService = shippingQuote?.services?.find(s => s.code === selectedServiceCode) || {
    name: 'Pos Laju Domestic Standard',
    rate: cartSubtotal >= 150 ? 0.00 : 8.50,
    finalRate: cartSubtotal >= 150 ? 0.00 : 8.50,
    transitTime: receiverPostcodeMeta?.isEastMalaysia ? '3-5 Working Days' : '1-2 Working Days'
  };

  const shippingCost = selectedService.finalRate !== undefined ? selectedService.finalRate : (cartSubtotal >= 150 ? 0.00 : 8.50);
  const grandTotal = Number((cartSubtotal + shippingCost).toFixed(2));

  // Handle Order Submit (Cash on Delivery)
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Please enter your full recipient name.');
      return;
    }
    if (!formData.phone.trim()) {
      setFormError('Please enter your Malaysian mobile contact number (+60).');
      return;
    }
    if (!formData.address.trim()) {
      setFormError('Please provide your complete delivery street address.');
      return;
    }
    if (!formData.postcode.trim() || formData.postcode.length < 5) {
      setFormError('Please enter a valid 5-digit Malaysian postcode (e.g. 50000, 41000, 93350).');
      return;
    }

    setSubmitting(true);

    try {
      const orderRef = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

      // Create SendParcel PRO shipment with Pos Laju Tracking Number
      const shipment = await sendParcelService.createShipment({
        orderReference: orderRef,
        sender: {
          name: 'Chennai Silk Palace (Main Warehouse)',
          phone: '+60 3 3372 7272',
          address: 'No. 1, Jalan Istana',
          city: 'Klang',
          postcode: '41000',
          state: 'Selangor'
        },
        receiver: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          postcode: formData.postcode,
          state: formData.state
        },
        parcel: {
          itemDescription: cart.map(i => `${i.title || i.name} (${i.selectedSize || 'Free Size'})`).join(', '),
          weightKg: Math.max(0.8, cart.reduce((sum, item) => sum + (item.quantity * 0.75), 0)),
          itemValue: grandTotal,
          itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
        },
        service: {
          name: selectedService.name || 'Pos Laju Domestic Express',
          code: selectedServiceCode,
          rate: shippingCost,
          currency: 'MYR'
        }
      });

      // Assemble full order object
      const completedOrder = {
        orderId: orderRef,
        trackingNumber: shipment.trackingNumber,
        placedAt: new Date().toISOString(),
        paymentMethod: 'Cash on Delivery (COD)',
        paymentStatus: 'PAY_ON_DELIVERY',
        items: [...cart],
        subtotal: cartSubtotal,
        shippingFee: shippingCost,
        grandTotal: grandTotal,
        customer: { ...formData },
        shipment: shipment
      };

      // Save order in local storage for order history / tracking
      try {
        const storedOrders = JSON.parse(localStorage.getItem('csp_customer_orders') || '[]');
        storedOrders.unshift(completedOrder);
        localStorage.setItem('csp_customer_orders', JSON.stringify(storedOrders));
      } catch (err) {
        console.warn('Error persisting customer order:', err);
      }

      // Clear Cart
      clearCart();
      setOrderSuccess(completedOrder);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setFormError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ORDER SUCCESS CONFIRMATION VIEW
  if (orderSuccess) {
    return (
      <div className="checkout-page-container">
        <Header />
        <main className="checkout-main-content">
          <div className="container-inner">
            <div className="order-success-card">
              <div className="success-icon-badge">
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>

              <span className="success-eyebrow">ORDER CONFIRMED • CASH ON DELIVERY</span>
              <h1 className="success-main-title">Thank You For Your Order!</h1>
              <p className="success-desc">
                Your order <strong>{orderSuccess.orderId}</strong> has been registered with <strong>Pos Malaysia SendParcel PRO</strong>. Our dispatch team is preparing your package for courier collection.
              </p>

              {/* Pos Laju Tracking Banner */}
              <div className="pos-tracking-alert-box">
                <div className="pos-badge-col">
                  <span className="pos-tag">POS LAJU</span>
                  <span className="carrier-sub">SendParcel PRO</span>
                </div>
                <div className="tracking-num-col">
                  <span className="lbl">Tracking / Consignment Number:</span>
                  <strong className="tracking-id">{orderSuccess.trackingNumber}</strong>
                </div>
                <div className="track-action-col">
                  <Link to={`/track-order?tracking=${orderSuccess.trackingNumber}`} className="track-now-btn">
                    Track Parcel Live →
                  </Link>
                </div>
              </div>

              {/* Order Breakdown Grid */}
              <div className="order-receipt-grid">
                <div className="receipt-col">
                  <h3>Delivery Address</h3>
                  <div className="receipt-details-box">
                    <strong>{orderSuccess.customer.name}</strong>
                    <p>{orderSuccess.customer.address}</p>
                    <p>{orderSuccess.customer.postcode} {orderSuccess.customer.city}, {orderSuccess.customer.state}</p>
                    <p>Phone: {orderSuccess.customer.phone}</p>
                    <p>Email: {orderSuccess.customer.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="receipt-col">
                  <h3>Payment &amp; Instructions</h3>
                  <div className="receipt-details-box">
                    <div className="cod-badge-row">
                      <span className="cod-pill">💵 Cash on Delivery (COD)</span>
                    </div>
                    <p className="cod-instruction">
                      Please prepare <strong>MYR {orderSuccess.grandTotal.toFixed(2)}</strong> in exact cash for the Pos Laju dispatch rider upon package handover.
                    </p>
                    <p className="cod-sub">
                      You will receive an SMS delivery notification from Pos Malaysia prior to dispatch.
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Summary */}
              <div className="receipt-items-card">
                <h3>Ordered Items ({orderSuccess.items.length})</h3>
                <div className="receipt-items-list">
                  {orderSuccess.items.map((item, idx) => (
                    <div key={idx} className="receipt-item-row">
                      <SafeImage
                        src={item.image || item.images?.[0] || placeholderSvg}
                        alt={item.title || item.name}
                        className="receipt-item-img"
                      />
                      <div className="receipt-item-info">
                        <strong>{item.title || item.name}</strong>
                        <span className="item-meta-txt">
                          Qty: {item.quantity} • Size: {item.selectedSize || 'Free Size'} {item.selectedColor ? `• Color: ${item.selectedColor}` : ''}
                        </span>
                      </div>
                      <div className="receipt-item-price">
                        MYR {(Number(item.price || 0) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="receipt-totals-bar">
                  <div className="total-line">
                    <span>Subtotal:</span>
                    <span>MYR {orderSuccess.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="total-line">
                    <span>Pos Laju Shipping:</span>
                    <span>{orderSuccess.shippingFee === 0 ? 'FREE' : `MYR ${orderSuccess.shippingFee.toFixed(2)}`}</span>
                  </div>
                  <div className="total-line grand-total-line">
                    <strong>Total Due on Delivery (MYR):</strong>
                    <strong>MYR {orderSuccess.grandTotal.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {/* Next Step Actions */}
              <div className="success-bottom-actions">
                <Link to="/products" className="continue-shopping-btn">
                  Continue Shopping
                </Link>
                <a
                  href={`https://wa.me/60123456789?text=${encodeURIComponent(`Hi Chennai Silk Palace, I have a question regarding my COD Order ${orderSuccess.orderId} (Tracking: ${orderSuccess.trackingNumber}).`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-order-btn"
                >
                  WhatsApp Support
                </a>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // EMPTY CART CHECK
  if (cart.length === 0) {
    return (
      <div className="checkout-page-container">
        <Header />
        <main className="checkout-main-content">
          <div className="container-inner">
            <div className="empty-checkout-box">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <h2>Your shopping bag is empty</h2>
              <p>Add exquisite sarees and traditional attire to your cart to proceed with checkout.</p>
              <Link to="/products" className="primary-checkout-btn">
                Browse Collections
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ACTIVE CHECKOUT FORM
  return (
    <div className="checkout-page-container">
      <Header />

      <main className="checkout-main-content">
        <div className="container-inner">
          {/* Breadcrumb Navigation */}
          <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
            <Link to="/cart">Cart</Link>
            <span className="sep">›</span>
            <span className="current">Shipping &amp; Cash on Delivery</span>
          </nav>

          <h1 className="checkout-page-title">Secure Checkout (Malaysia)</h1>

          {formError && (
            <div className="checkout-error-banner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{formError}</span>
            </div>
          )}

          <div className="checkout-layout-grid">
            {/* Left Column: Delivery Form & Payment */}
            <form onSubmit={handlePlaceOrder} className="checkout-form-column">
              {/* Section 1: Customer Contact */}
              <div className="checkout-card-section">
                <div className="section-head">
                  <span className="step-num">1</span>
                  <h2>Contact Information</h2>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Radhika Menon / Mohd Faizal"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Mobile Contact Number (+60) *</label>
                    <input
                      type="tel"
                      placeholder="e.g. 0123456789 or +60123456789"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label>Email Address (For Order Tracking Receipt)</label>
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Section 2: Delivery Address */}
              <div className="checkout-card-section">
                <div className="section-head">
                  <span className="step-num">2</span>
                  <h2>Delivery Address (Malaysia)</h2>
                </div>

                <div className="form-group">
                  <label>House / Unit No, Street &amp; Building Address *</label>
                  <textarea
                    rows="2"
                    placeholder="e.g. No. 12, Jalan Sultan Ismail, Bangsar Baru"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid-3col" style={{ marginTop: '12px' }}>
                  <div className="form-group">
                    <label>Postcode *</label>
                    <input
                      type="text"
                      maxLength="5"
                      placeholder="e.g. 50000"
                      value={formData.postcode}
                      onChange={(e) => handlePostcodeChange(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      placeholder="e.g. Kuala Lumpur"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>State *</label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    >
                      {MALAYSIA_STATES.map(st => (
                        <option key={st.code} value={st.name}>{st.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {receiverPostcodeMeta && (
                  <div className="resolved-zone-tag">
                    ✓ Verified Zone: <strong>{receiverPostcodeMeta.state}</strong> ({receiverPostcodeMeta.region})
                  </div>
                )}
              </div>

              {/* Section 3: Shipping Method Selection (SendParcel PRO) */}
              <div className="checkout-card-section">
                <div className="section-head">
                  <span className="step-num">3</span>
                  <h2>Shipping Method (Pos Malaysia SendParcel PRO)</h2>
                </div>

                <div className="shipping-options-list">
                  <label
                    className={`shipping-method-card ${selectedServiceCode === 'POS_LAJU_DOM' ? 'selected' : ''}`}
                    onClick={() => setSelectedServiceCode('POS_LAJU_DOM')}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="POS_LAJU_DOM"
                      checked={selectedServiceCode === 'POS_LAJU_DOM'}
                      onChange={() => setSelectedServiceCode('POS_LAJU_DOM')}
                    />
                    <div className="method-info">
                      <strong>Pos Laju Domestic Standard</strong>
                      <span>⏱ {receiverPostcodeMeta?.isEastMalaysia ? '3-5 Working Days' : '1-2 Working Days'} • Doorstep Courier</span>
                    </div>
                    <div className="method-cost">
                      {cartSubtotal >= 150 ? (
                        <>
                          <span className="strike-cost">MYR 8.50</span>
                          <span className="free-badge">FREE</span>
                        </>
                      ) : (
                        <span>MYR 8.50</span>
                      )}
                    </div>
                  </label>

                  <label
                    className={`shipping-method-card ${selectedServiceCode === 'POS_LAJU_NEXTDAY' ? 'selected' : ''}`}
                    onClick={() => setSelectedServiceCode('POS_LAJU_NEXTDAY')}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="POS_LAJU_NEXTDAY"
                      checked={selectedServiceCode === 'POS_LAJU_NEXTDAY'}
                      onChange={() => setSelectedServiceCode('POS_LAJU_NEXTDAY')}
                    />
                    <div className="method-info">
                      <strong>Pos Laju Priority Next-Day Express</strong>
                      <span>⏱ Next Working Day • Priority Hub Handling</span>
                    </div>
                    <div className="method-cost">
                      <span>MYR 12.00</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Section 4: Payment Method Selection */}
              <div className="checkout-card-section">
                <div className="section-head">
                  <span className="step-num">4</span>
                  <h2>Payment Method</h2>
                </div>

                <div className="payment-options-container">
                  {/* Option 1: Cash on Delivery (ACTIVE) */}
                  <div className="payment-method-card active-cod">
                    <div className="payment-head-row">
                      <input
                        type="radio"
                        id="pay-cod"
                        name="paymentMethod"
                        value="COD"
                        checked={formData.paymentMethod === 'COD'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                      />
                      <label htmlFor="pay-cod" className="pay-title">
                        💵 Cash on Delivery (COD)
                        <span className="active-pill">AVAILABLE NOW</span>
                      </label>
                    </div>
                    <div className="payment-body-desc">
                      <p>
                        Pay in cash directly to the Pos Laju courier driver upon delivery of your parcel at your doorstep in Malaysia.
                      </p>
                      <div className="cod-highlight-box">
                        <span>Total Due on Handover:</span>
                        <strong>MYR {grandTotal.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Online Banking / FPX / Cards (NEXT PHASE) */}
                  <div className="payment-method-card disabled-option">
                    <div className="payment-head-row">
                      <input type="radio" id="pay-online" name="paymentMethod" disabled />
                      <label htmlFor="pay-online" className="pay-title muted">
                        💳 Online Banking (FPX) / Cards / E-Wallet
                        <span className="coming-soon-pill">COMING NEXT</span>
                      </label>
                    </div>
                    <div className="payment-body-desc">
                      <p className="text-muted">
                        Online payment gateway (FPX, Maybank2u, CIMB, Touch 'n Go, DuitNow QR, Visa/Mastercard) integration is scheduled for the next release.
                      </p>
                      <div className="bank-icons-row">
                        <span className="bank-tag">FPX</span>
                        <span className="bank-tag">Maybank2u</span>
                        <span className="bank-tag">CIMB</span>
                        <span className="bank-tag">Touch 'n Go</span>
                        <span className="bank-tag">DuitNow</span>
                        <span className="bank-tag">Visa / MC</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Instructions (Optional) */}
              <div className="checkout-card-section">
                <div className="form-group">
                  <label>Special Instructions / Guardhouse Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Leave with security guard if not available."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              {/* Submit Order Action Button */}
              <button
                type="submit"
                className="place-order-submit-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <span>Registering Order &amp; Pos Laju Consignment...</span>
                ) : (
                  <>
                    <span>Place Order • Cash on Delivery (MYR {grandTotal.toFixed(2)})</span>
                    <span className="btn-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            {/* Right Column: Order Summary */}
            <aside className="checkout-summary-column">
              <div className="summary-sticky-card">
                <h3>Order Summary ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</h3>

                <div className="summary-items-list">
                  {cart.map((item, index) => (
                    <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}-${index}`} className="checkout-summary-item">
                      <div className="item-thumb-wrapper">
                        <SafeImage
                          src={item.image || item.images?.[0] || placeholderSvg}
                          alt={item.title || item.name}
                          className="thumb-img"
                        />
                        <span className="item-qty-badge">{item.quantity}</span>
                      </div>
                      <div className="item-meta-col">
                        <span className="item-title">{item.title || item.name}</span>
                        <span className="item-specs">
                          {item.selectedSize || 'Free Size'} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                        </span>
                      </div>
                      <div className="item-price-col">
                        MYR {(Number(item.price || 0) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Costs Breakdown */}
                <div className="summary-calc-section">
                  <div className="calc-row">
                    <span>Subtotal:</span>
                    <span>MYR {cartSubtotal.toFixed(2)}</span>
                  </div>

                  <div className="calc-row">
                    <span>Pos Laju Shipping:</span>
                    <span>
                      {calculatingShipping ? (
                        'Estimating...'
                      ) : shippingCost === 0 ? (
                        <strong className="text-emerald">FREE</strong>
                      ) : (
                        `MYR ${shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  {cartSubtotal >= 150 && (
                    <div className="free-shipping-applied-badge">
                      ✓ Free Express Shipping Applied (Orders &gt; MYR 150)
                    </div>
                  )}

                  <div className="calc-row grand-total-row">
                    <span>Total Amount (COD):</span>
                    <span className="grand-amount">MYR {grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Trust Highlights */}
                <div className="checkout-trust-perks">
                  <div className="trust-perk">
                    <span className="perk-icon">🛡</span>
                    <span>100% Authentic Pure Silk &amp; Handcrafted Apparel</span>
                  </div>
                  <div className="trust-perk">
                    <span className="perk-icon">📦</span>
                    <span>Official Pos Malaysia SendParcel PRO Dispatch</span>
                  </div>
                  <div className="trust-perk">
                    <span className="perk-icon">💵</span>
                    <span>No Advance Payment Required (Pay on Delivery)</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
