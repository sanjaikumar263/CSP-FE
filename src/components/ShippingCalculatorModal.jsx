import React, { useState } from 'react';
import { sendParcelService, resolveMalaysiaPostcode } from '../services/sendParcelService';
import './ShippingCalculatorModal.css';

export default function ShippingCalculatorModal({ isOpen, onClose, defaultWeight = 0.95, defaultItemValue = 120 }) {
  const [postcode, setPostcode] = useState('');
  const [weightKg, setWeightKg] = useState(defaultWeight);
  const [ratesResult, setRatesResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCalculate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setRatesResult(null);

    if (!postcode || postcode.trim().length < 4) {
      setErrorMsg('Please enter a valid 5-digit Malaysian postcode.');
      return;
    }

    setLoading(true);
    try {
      const quote = await sendParcelService.calculateRates({
        senderPostcode: '41000', // Klang Showroom Hub
        receiverPostcode: postcode.trim(),
        weightKg: Number(weightKg) || 1.0,
        itemValue: Number(defaultItemValue) || 100
      });
      setRatesResult(quote);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to calculate rates for this postcode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shipping-calc-overlay" onClick={onClose}>
      <div className="shipping-calc-card" onClick={(e) => e.stopPropagation()}>
        <div className="shipping-calc-header">
          <div className="calc-header-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            <span>Pos Laju Malaysia Shipping Estimator</span>
          </div>
          <button className="calc-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="shipping-calc-body">
          <p className="calc-intro">
            Check real-time delivery estimates and shipping fees across Peninsular Malaysia, Sabah &amp; Sarawak powered by <strong>SendParcel PRO</strong>.
          </p>

          <form onSubmit={handleCalculate} className="calc-modal-form">
            <div className="calc-input-group">
              <label>Enter Delivery Postcode</label>
              <div className="postcode-input-box">
                <input
                  type="text"
                  maxLength="5"
                  placeholder="e.g. 50000, 10200, 93350"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                />
                <button type="submit" className="calc-go-btn" disabled={loading}>
                  {loading ? '...' : 'Estimate'}
                </button>
              </div>
            </div>
          </form>

          {errorMsg && (
            <div className="calc-err-alert">
              ⚠️ {errorMsg}
            </div>
          )}

          {ratesResult && (
            <div className="calc-modal-results">
              <div className="dest-tag-row">
                <span>📍 Destination: <strong>{ratesResult.destination.state}</strong> ({ratesResult.destination.region})</span>
                {ratesResult.isFreeShippingEligible && (
                  <span className="free-tag">✓ FREE SHIPPING</span>
                )}
              </div>

              <div className="services-estimate-list">
                {ratesResult.services.map((srv) => (
                  <div key={srv.code} className="srv-estimate-item">
                    <div className="srv-estimate-info">
                      <strong>{srv.name}</strong>
                      <span className="srv-transit">⏱ Estimated: {srv.transitTime}</span>
                    </div>
                    <div className="srv-estimate-price">
                      {ratesResult.isFreeShippingEligible && srv.finalRate === 0 ? (
                        <>
                          <span className="strike-orig">MYR {srv.rate.toFixed(2)}</span>
                          <span className="free-text">FREE</span>
                        </>
                      ) : (
                        <span className="price-bold">MYR {srv.rate.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="free-shipping-notice">
                ✨ Free express shipping applies on all Malaysia orders above <strong>MYR {ratesResult.freeShippingThreshold.toFixed(2)}</strong>!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
