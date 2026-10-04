import { useState, useEffect } from 'react';
import { inchToCm } from '../data/sizeChartPresets';
import './SizeChartModal.css';

export default function SizeChartModal({
  isOpen,
  onClose,
  sizeChart,
  productTitle = 'Product',
  selectedSize = ''
}) {
  const [unit, setUnit] = useState('inch'); // 'inch' or 'cm'

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !sizeChart) return null;

  const sections = Array.isArray(sizeChart.sections) ? sizeChart.sections : [];

  return (
    <div className="scm-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="scm-modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Top Header Row */}
        <div className="scm-header-row">
          <div className="scm-header-left">
            <span className="scm-badge-pill">Size Guide</span>
            <h2 className="scm-modal-title">{sizeChart.title || 'Body Measurement'}</h2>
            {productTitle && <div className="scm-product-sub">{productTitle}</div>}
          </div>

          <button
            type="button"
            className="scm-close-btn"
            onClick={onClose}
            aria-label="Close Size Chart"
          >
            ×
          </button>
        </div>

        {/* Unit Switcher Bar (Exact styling matching reference image) */}
        <div className="scm-unit-bar-wrap">
          <div className="scm-unit-pill-container">
            <span className="scm-unit-pill-title">Body Measurement</span>
            <div className="scm-unit-radio-group">
              <label className={`scm-unit-radio-label ${unit === 'inch' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="scmUnit"
                  value="inch"
                  checked={unit === 'inch'}
                  onChange={() => setUnit('inch')}
                />
                <span className="scm-radio-dot"></span>
                <span>inch</span>
              </label>

              <label className={`scm-unit-radio-label ${unit === 'cm' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="scmUnit"
                  value="cm"
                  checked={unit === 'cm'}
                  onChange={() => setUnit('cm')}
                />
                <span className="scm-radio-dot"></span>
                <span>cm</span>
              </label>
            </div>
          </div>
        </div>

        {/* Measurement Tables */}
        <div className="scm-body-content">
          {sections.length > 0 ? (
            <div className={`scm-tables-grid ${sections.length > 1 ? 'multi-col' : 'single-col'}`}>
              {sections.map((section, sIdx) => {
                const sizes = Array.isArray(section.sizes) ? section.sizes : [];
                const measurements = Array.isArray(section.measurements) ? section.measurements : [];

                return (
                  <div key={section.id || `sec-${sIdx}`} className="scm-section-card">
                    {section.title && (
                      <div className="scm-section-header-title">
                        {section.title}
                      </div>
                    )}

                    <div className="scm-table-scroll-wrapper">
                      <table className="scm-measurement-table">
                        <thead>
                          <tr>
                            <th className="scm-th-metric">
                              {section.title ? `${section.title} Size` : 'Size'}
                            </th>
                            {sizes.map((sz) => {
                              const isHighlight =
                                selectedSize &&
                                sz.toLowerCase() === selectedSize.toLowerCase();
                              return (
                                <th
                                  key={sz}
                                  className={`scm-th-size ${isHighlight ? 'active-col-header' : ''}`}
                                >
                                  {sz}
                                  {isHighlight && (
                                    <span className="scm-active-size-tag">Selected</span>
                                  )}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {measurements.map((m, mIdx) => (
                            <tr key={m.id || `m-${mIdx}`}>
                              <td className="scm-td-label">{m.label}</td>
                              {sizes.map((sz) => {
                                const isHighlight =
                                  selectedSize &&
                                  sz.toLowerCase() === selectedSize.toLowerCase();
                                
                                let displayVal = '';
                                if (unit === 'inch') {
                                  displayVal = m.inches?.[sz] !== undefined ? m.inches[sz] : '';
                                } else {
                                  if (m.cms?.[sz] !== undefined && m.cms[sz] !== '') {
                                    displayVal = m.cms[sz];
                                  } else if (m.inches?.[sz] !== undefined && m.inches[sz] !== '') {
                                    displayVal = inchToCm(m.inches[sz]);
                                  }
                                }

                                return (
                                  <td
                                    key={sz}
                                    className={`scm-td-val ${isHighlight ? 'active-col-cell' : ''}`}
                                  >
                                    {displayVal || '—'}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="scm-empty-notice">
              No detailed size chart specifications are available for this product.
            </div>
          )}

          {/* Measuring Guide Tips & Info */}
          <div className="scm-how-to-measure-card">
            <div className="scm-htm-title">
              <span className="scm-htm-icon">📏</span>
              <span>How to Measure Your Body</span>
            </div>
            <div className="scm-htm-grid">
              <div className="scm-htm-item">
                <strong>Across Shoulder:</strong>
                <span>Measure from the outer edge of one shoulder bone straight across the back to the other shoulder.</span>
              </div>
              <div className="scm-htm-item">
                <strong>Bust / Chest:</strong>
                <span>Measure around the fullest part of your chest, keeping the tape parallel to the floor under your arms.</span>
              </div>
              <div className="scm-htm-item">
                <strong>Waist:</strong>
                <span>Measure around your natural waistline (narrowest part of the torso, above the belly button).</span>
              </div>
              <div className="scm-htm-item">
                <strong>Hips:</strong>
                <span>Stand with feet together and measure around the fullest part of your hips and buttocks.</span>
              </div>
              <div className="scm-htm-item">
                <strong>Front / Garment Length:</strong>
                <span>Measure vertically from highest point of the shoulder down to the hem.</span>
              </div>
              <div className="scm-htm-item">
                <strong>Inseam / Outseam:</strong>
                <span>Inseam is from the crotch point down to the ankle; Outseam is from the waist down to the hem.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="scm-footer-row">
          <div className="scm-footer-note">
            💡 All measurements are in <strong>{unit}</strong>. If you are between sizes, we recommend sizing up for traditional ethnic wear.
          </div>
          <button type="button" className="scm-got-it-btn" onClick={onClose}>
            Close Size Guide
          </button>
        </div>

      </div>
    </div>
  );
}
