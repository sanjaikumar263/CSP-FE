import React from 'react';
import './TrackingDetailsModal.css';

export default function TrackingDetailsModal({ shipment, onClose }) {
  if (!shipment) return null;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'DELIVERED': return 'status-delivered';
      case 'OUT_FOR_DELIVERY': return 'status-out';
      case 'IN_TRANSIT': return 'status-transit';
      case 'PICKUP_REQUESTED':
      case 'PICKED_UP': return 'status-picked';
      case 'LABEL_GENERATED': return 'status-label';
      default: return 'status-default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'DELIVERED': return 'Delivered';
      case 'OUT_FOR_DELIVERY': return 'Out for Delivery';
      case 'IN_TRANSIT': return 'In Transit';
      case 'PICKUP_REQUESTED': return 'Pickup Requested';
      case 'PICKED_UP': return 'Collected by Pos Laju';
      case 'LABEL_GENERATED': return 'AWB Generated';
      default: return status;
    }
  };

  // 4 Main Milestones
  const milestones = [
    { key: 'CREATED', label: 'Order Confirmed', completed: true },
    {
      key: 'PICKED_UP',
      label: 'Pos Laju Collected',
      completed: ['PICKUP_REQUESTED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(shipment.status)
    },
    {
      key: 'IN_TRANSIT',
      label: 'In Transit / Hub',
      completed: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(shipment.status)
    },
    {
      key: 'DELIVERED',
      label: 'Delivered',
      completed: shipment.status === 'DELIVERED'
    }
  ];

  return (
    <div className="track-modal-overlay" onClick={onClose}>
      <div className="track-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="track-modal-header">
          <div className="track-title-box">
            <div className="track-carrier-tag">POS LAJU • SendParcel PRO</div>
            <h2>Consignment Tracking</h2>
            <div className="tracking-number-row">
              <span className="tn-label">Tracking Number:</span>
              <span className="tn-value">{shipment.trackingNumber}</span>
              <button
                className="copy-tn-btn"
                onClick={() => {
                  navigator.clipboard.writeText(shipment.trackingNumber);
                  alert('Tracking number copied to clipboard!');
                }}
                title="Copy tracking number"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
          <button className="track-close-btn" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        {/* Milestone Visual Progress Bar */}
        <div className="track-milestones-card">
          <div className="current-status-banner">
            <span className="cs-label">Status:</span>
            <span className={`status-pill ${getStatusBadgeClass(shipment.status)}`}>
              {getStatusLabel(shipment.status)}
            </span>
            <span className="cs-ref">Ref: {shipment.orderReference}</span>
          </div>

          <div className="milestones-track">
            {milestones.map((m, idx) => (
              <div key={m.key} className={`milestone-node ${m.completed ? 'completed' : ''}`}>
                <div className="node-indicator">
                  {m.completed ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <div className="node-label">{m.label}</div>
                {idx < milestones.length - 1 && (
                  <div className={`node-connector ${milestones[idx + 1].completed ? 'completed' : ''}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Origin & Destination Summary */}
        <div className="track-route-summary">
          <div className="route-point">
            <div className="point-icon origin">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div className="point-info">
              <span className="point-type">ORIGIN</span>
              <strong>{shipment.sender?.city || 'Klang'}, {shipment.sender?.state || 'Selangor'}</strong>
              <span>{shipment.sender?.postcode} Malaysia</span>
            </div>
          </div>

          <div className="route-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>

          <div className="route-point">
            <div className="point-icon dest">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div className="point-info">
              <span className="point-type">DESTINATION</span>
              <strong>{shipment.receiver?.city || 'Kuala Lumpur'}, {shipment.receiver?.state || 'Kuala Lumpur'}</strong>
              <span>{shipment.receiver?.postcode} Malaysia</span>
            </div>
          </div>
        </div>

        {/* Checkpoint Activity Logs */}
        <div className="track-history-section">
          <h3>Activity History & Checkpoints</h3>
          <div className="history-timeline">
            {(shipment.trackingHistory || []).length > 0 ? (
              shipment.trackingHistory.map((event, idx) => (
                <div key={idx} className="timeline-event">
                  <div className="event-bullet"></div>
                  <div className="event-content">
                    <div className="event-meta">
                      <span className="event-date">
                        {new Date(event.timestamp).toLocaleDateString('en-MY', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })} • {new Date(event.timestamp).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="event-location">{event.location}</span>
                    </div>
                    <div className="event-desc">{event.description}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-events">No tracking milestones recorded yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
