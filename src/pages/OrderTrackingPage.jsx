import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { sendParcelService } from '../services/sendParcelService';
import './OrderTrackingPage.css';

export default function OrderTrackingPage() {
  const [searchParams] = useSearchParams();
  const initialTrackingNo = searchParams.get('tracking') || searchParams.get('order') || '';
  const [queryInput, setQueryInput] = useState(initialTrackingNo);
  const [trackingResult, setTrackingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialTrackingNo) {
      handleSearch(initialTrackingNo);
    }
  }, [initialTrackingNo]);

  const handleSearch = async (codeToSearch) => {
    const code = (codeToSearch || queryInput).trim();
    if (!code) {
      setErrorMsg('Please enter your tracking number (e.g. ER948210482MY) or Order ID.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setTrackingResult(null);

    try {
      const res = await sendParcelService.trackParcel(code);
      if (res.found) {
        setTrackingResult(res.shipment);
      } else {
        setErrorMsg(res.message || `No parcel found matching "${code}".`);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error connecting to SendParcel PRO tracking gateway.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStepClass = (stepKey, currentStatus) => {
    const statusOrder = ['LABEL_GENERATED', 'PICKUP_REQUESTED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIdx = statusOrder.indexOf(currentStatus);

    if (stepKey === 'ORDER_PLACED') return 'step-done';
    if (stepKey === 'PICKED_UP') return currentIdx >= 2 ? 'step-done' : (currentIdx >= 1 ? 'step-active' : 'step-pending');
    if (stepKey === 'IN_TRANSIT') return currentIdx >= 3 ? 'step-done' : (currentIdx >= 2 ? 'step-active' : 'step-pending');
    if (stepKey === 'OUT_FOR_DELIVERY') return currentIdx >= 4 ? 'step-done' : (currentIdx >= 3 ? 'step-active' : 'step-pending');
    if (stepKey === 'DELIVERED') return currentIdx >= 5 ? 'step-done' : 'step-pending';
    return 'step-pending';
  };

  return (
    <div className="tracking-page-wrapper">
      <Header />

      <main className="tracking-main-content">
        {/* Hero Section */}
        <section className="tracking-hero-banner">
          <div className="container-inner">
            <div className="tracking-hero-badge">POS MALAYSIA • SENDPARCEL PRO</div>
            <h1 className="tracking-hero-title">Track Your Order &amp; Delivery</h1>
            <p className="tracking-hero-sub">
              Enter your Pos Laju Consignment Number or Order Reference for real-time Malaysia delivery status.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="tracking-search-form"
            >
              <div className="tracking-input-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Enter Tracking No (e.g. ER948210482MY) or Order Ref..."
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                />
                {queryInput && (
                  <button type="button" className="clear-track-btn" onClick={() => setQueryInput('')}>✕</button>
                )}
              </div>
              <button type="submit" className="track-submit-btn" disabled={loading}>
                {loading ? 'Locating...' : 'Track Parcel'}
              </button>
            </form>

            <div className="quick-sample-codes">
              <span>Sample Tracking Numbers:</span>
              <button type="button" onClick={() => { setQueryInput('ER948210482MY'); handleSearch('ER948210482MY'); }}>
                ER948210482MY (In Transit)
              </button>
              <button type="button" onClick={() => { setQueryInput('ER948210480MY'); handleSearch('ER948210480MY'); }}>
                ER948210480MY (Delivered)
              </button>
              <button type="button" onClick={() => { setQueryInput('ER948210483MY'); handleSearch('ER948210483MY'); }}>
                ER948210483MY (Sarawak)
              </button>
            </div>
          </div>
        </section>

        {/* Error Notification */}
        {errorMsg && (
          <div className="container-inner">
            <div className="track-error-card">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Tracking Details Results */}
        {trackingResult && (
          <section className="tracking-results-section">
            <div className="container-inner">
              <div className="track-result-card">
                {/* Result Top Row */}
                <div className="track-card-header">
                  <div className="header-left">
                    <div className="carrier-brand-badge">
                      <span className="pos-dot"></span>
                      <span>Pos Laju Domestic Express (SendParcel PRO)</span>
                    </div>
                    <h2 className="tracking-code-heading">{trackingResult.trackingNumber}</h2>
                    <span className="order-link-sub">Order Reference: <strong>{trackingResult.orderReference}</strong></span>
                  </div>

                  <div className="header-right">
                    <span className={`tracking-status-pill ${trackingResult.status.toLowerCase()}`}>
                      {trackingResult.status.replace(/_/g, ' ')}
                    </span>
                    <span className="dispatch-date">
                      Dispatched on: {new Date(trackingResult.createdAt).toLocaleDateString('en-MY', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Visual Step Progress */}
                <div className="visual-stepper-container">
                  <div className={`step-item ${getStatusStepClass('ORDER_PLACED', trackingResult.status)}`}>
                    <div className="step-circle">✓</div>
                    <div className="step-text">
                      <strong>Manifest Created</strong>
                      <span>AWB Generated</span>
                    </div>
                  </div>

                  <div className={`step-connector ${getStatusStepClass('PICKED_UP', trackingResult.status)}`} />

                  <div className={`step-item ${getStatusStepClass('PICKED_UP', trackingResult.status)}`}>
                    <div className="step-circle">🚚</div>
                    <div className="step-text">
                      <strong>Picked Up</strong>
                      <span>Pos Laju Hub</span>
                    </div>
                  </div>

                  <div className={`step-connector ${getStatusStepClass('IN_TRANSIT', trackingResult.status)}`} />

                  <div className={`step-item ${getStatusStepClass('IN_TRANSIT', trackingResult.status)}`}>
                    <div className="step-circle">✈️</div>
                    <div className="step-text">
                      <strong>In Transit</strong>
                      <span>Regional Facility</span>
                    </div>
                  </div>

                  <div className={`step-connector ${getStatusStepClass('OUT_FOR_DELIVERY', trackingResult.status)}`} />

                  <div className={`step-item ${getStatusStepClass('OUT_FOR_DELIVERY', trackingResult.status)}`}>
                    <div className="step-circle">🛵</div>
                    <div className="step-text">
                      <strong>Out For Delivery</strong>
                      <span>With Courier</span>
                    </div>
                  </div>

                  <div className={`step-connector ${getStatusStepClass('DELIVERED', trackingResult.status)}`} />

                  <div className={`step-item ${getStatusStepClass('DELIVERED', trackingResult.status)}`}>
                    <div className="step-circle">🏡</div>
                    <div className="step-text">
                      <strong>Delivered</strong>
                      <span>Package Received</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Information Grid */}
                <div className="delivery-info-grid">
                  <div className="info-block">
                    <span className="info-lbl">ORIGIN WAREHOUSE</span>
                    <strong>{trackingResult.sender?.name || 'Chennai Silk Palace Showroom'}</strong>
                    <p>{trackingResult.sender?.city}, {trackingResult.sender?.state} ({trackingResult.sender?.postcode})</p>
                  </div>

                  <div className="info-block">
                    <span className="info-lbl">DESTINATION RECIPIENT</span>
                    <strong>{trackingResult.receiver?.name}</strong>
                    <p>{trackingResult.receiver?.city}, {trackingResult.receiver?.state} ({trackingResult.receiver?.postcode})</p>
                  </div>

                  <div className="info-block">
                    <span className="info-lbl">PARCEL SUMMARY</span>
                    <strong>{trackingResult.parcel?.itemDescription || 'Pure Silk Apparel'}</strong>
                    <p>Weight: {Number(trackingResult.parcel?.weightKg || 1).toFixed(2)} KG</p>
                  </div>
                </div>

                {/* Checkpoint Timeline */}
                <div className="checkpoint-timeline-container">
                  <h3 className="timeline-title">Live Tracking Checkpoints</h3>
                  <div className="customer-timeline">
                    {(trackingResult.trackingHistory || []).map((checkpoint, idx) => (
                      <div key={idx} className="timeline-checkpoint-row">
                        <div className="checkpoint-time">
                          <strong>
                            {new Date(checkpoint.timestamp).toLocaleDateString('en-MY', { day: '2-digit', month: 'short' })}
                          </strong>
                          <span>
                            {new Date(checkpoint.timestamp).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="checkpoint-bullet-line">
                          <div className="bullet-node"></div>
                          {idx < (trackingResult.trackingHistory.length - 1) && <div className="connector-line"></div>}
                        </div>
                        <div className="checkpoint-details">
                          <span className="checkpoint-loc">{checkpoint.location}</span>
                          <p className="checkpoint-desc">{checkpoint.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Support Banner */}
                <div className="tracking-help-banner">
                  <div className="help-text">
                    <strong>Need assistance with your delivery?</strong>
                    <span>Our customer care team in Malaysia is available daily from 10:00 AM to 9:30 PM.</span>
                  </div>
                  <div className="help-actions">
                    <a href="https://wa.me/60123456789" target="_blank" rel="noopener noreferrer" className="wa-help-btn">
                      WhatsApp Support
                    </a>
                    <Link to="/about" className="contact-help-btn">
                      Contact Showroom
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
