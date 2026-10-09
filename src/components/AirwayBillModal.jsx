import React from 'react';
import './AirwayBillModal.css';

export default function AirwayBillModal({ shipment, onClose }) {
  if (!shipment) return null;

  const handlePrint = () => {
    window.print();
  };

  // Generate simple simulated barcode lines based on tracking number
  const barcodeChars = (shipment.trackingNumber || 'ER948210482MY').split('');

  return (
    <div className="awb-modal-overlay" onClick={onClose}>
      <div className="awb-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Toolbar (hidden during print) */}
        <div className="awb-modal-header no-print">
          <div className="awb-header-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span>Pos Malaysia / SendParcel PRO Consignment Note (AWB)</span>
          </div>
          <div className="awb-header-actions">
            <button className="awb-print-btn" onClick={handlePrint}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Print Airway Bill
            </button>
            <button className="awb-close-btn" onClick={onClose} aria-label="Close modal">✕</button>
          </div>
        </div>

        {/* Printable Airway Bill Body */}
        <div className="awb-printable-sheet" id="printable-awb">
          {/* Header row */}
          <div className="awb-top-row">
            <div className="awb-carrier-branding">
              <div className="pos-badge">POS LAJU</div>
              <div className="sendparcel-badge">SendParcel PRO</div>
            </div>
            <div className="awb-service-type">
              <div className="service-title">{shipment.service?.name || 'DOMESTIC EXPRESS'}</div>
              <div className="account-number">NON-COD • PREPAID MERCHANT</div>
            </div>
            <div className="awb-routing-code">
              <span className="route-label">HUB ROUTING</span>
              <span className="route-val">
                {shipment.receiver?.postcode?.substring(0, 2) || '50'}-{(shipment.receiver?.state || 'KUL').substring(0, 3).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Barcode Section */}
          <div className="awb-barcode-section">
            <div className="awb-barcode-display">
              <div className="barcode-bars">
                {barcodeChars.map((char, i) => (
                  <span
                    key={i}
                    className="barcode-line"
                    style={{
                      width: ((char.charCodeAt(0) % 3) + 2) + 'px',
                      marginRight: ((char.charCodeAt(0) % 2) + 1.5) + 'px'
                    }}
                  />
                ))}
                {barcodeChars.map((char, i) => (
                  <span
                    key={`b-${i}`}
                    className="barcode-line"
                    style={{
                      width: (((char.charCodeAt(0) * 3) % 4) + 1.5) + 'px',
                      marginRight: '2px'
                    }}
                  />
                ))}
              </div>
              <div className="awb-tracking-text">{shipment.trackingNumber}</div>
            </div>
            <div className="awb-qr-box">
              <div className="qr-simulated">
                <div className="qr-pattern"></div>
              </div>
              <span className="qr-sub">Scan for Live Pos Laju Checkpoint</span>
            </div>
          </div>

          {/* Sender & Receiver Dual Column Box */}
          <div className="awb-address-grid">
            {/* Sender */}
            <div className="awb-address-cell sender-cell">
              <div className="cell-header">FROM (PENGIRIM):</div>
              <div className="addr-name">{shipment.sender?.name || 'Chennai Silk Palace'}</div>
              <div className="addr-line">{shipment.sender?.address}</div>
              <div className="addr-line">
                {shipment.sender?.postcode} {shipment.sender?.city}, {shipment.sender?.state}
              </div>
              <div className="addr-line">Malaysia</div>
              <div className="addr-contact">Tel: {shipment.sender?.phone}</div>
            </div>

            {/* Receiver */}
            <div className="awb-address-cell receiver-cell">
              <div className="cell-header">TO (PENERIMA):</div>
              <div className="addr-name">{shipment.receiver?.name}</div>
              <div className="addr-line">{shipment.receiver?.address}</div>
              <div className="addr-line">
                <strong className="postcode-highlight">{shipment.receiver?.postcode}</strong> {shipment.receiver?.city}, {shipment.receiver?.state}
              </div>
              <div className="addr-line">Malaysia</div>
              <div className="addr-contact">Tel: {shipment.receiver?.phone}</div>
              {shipment.receiver?.email && (
                <div className="addr-email">Email: {shipment.receiver?.email}</div>
              )}
            </div>
          </div>

          {/* Package Details & Declaration Grid */}
          <div className="awb-parcel-meta-grid">
            <div className="meta-col">
              <span className="meta-lbl">ORDER REF:</span>
              <span className="meta-val">{shipment.orderReference || 'N/A'}</span>
            </div>
            <div className="meta-col">
              <span className="meta-lbl">ACTUAL WEIGHT:</span>
              <span className="meta-val">{Number(shipment.parcel?.weightKg || 1).toFixed(2)} KG</span>
            </div>
            <div className="meta-col">
              <span className="meta-lbl">DIMENSIONS:</span>
              <span className="meta-val">
                {shipment.parcel?.lengthCm || 30} × {shipment.parcel?.widthCm || 22} × {shipment.parcel?.heightCm || 6} cm
              </span>
            </div>
            <div className="meta-col">
              <span className="meta-lbl">DECLARED VALUE:</span>
              <span className="meta-val">MYR {Number(shipment.parcel?.itemValue || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Item Description & Notes */}
          <div className="awb-content-declaration">
            <div className="decl-row">
              <span className="decl-lbl">Item Description:</span>
              <span className="decl-val">{shipment.parcel?.itemDescription || 'Apparel / Traditional Silk Garments'}</span>
            </div>
            <div className="decl-row">
              <span className="decl-lbl">Service Code:</span>
              <span className="decl-val">{shipment.service?.code || 'POS_LAJU_DOMESTIC'} • SendParcel PRO</span>
            </div>
          </div>

          {/* Signatures and Footer */}
          <div className="awb-footer-signatures">
            <div className="sig-box">
              <span className="sig-title">Sender Signature & Date</span>
              <div className="sig-space">
                <span className="auto-signed">CHENNAI SILK PALACE</span>
                <span className="sig-date">{new Date(shipment.createdAt).toLocaleDateString('en-MY')}</span>
              </div>
            </div>
            <div className="sig-box">
              <span className="sig-title">Recipient Signature / Chop</span>
              <div className="sig-space empty"></div>
            </div>
          </div>

          {/* Fine Print */}
          <div className="awb-fine-print">
            Pos Malaysia Berhad • SendParcel PRO e-Commerce Integration • Standard terms and conditions apply. For inquiries, visit www.pos.com.my or call 1-300-300-300.
          </div>
        </div>
      </div>
    </div>
  );
}
