import { useState } from 'react';
import {
  SIZE_CHART_PRESETS,
  DEFAULT_SIZE_CHART,
  inchToCm,
  cmToInch,
  syncSizeChartWithSizes
} from '../data/sizeChartPresets';
import './SizeChartEditor.css';

export default function SizeChartEditor({
  sizeChart = DEFAULT_SIZE_CHART,
  onChange,
  productSizes = []
}) {
  const [activeUnit, setActiveUnit] = useState('inch'); // 'inch' or 'cm'
  const [showPreview, setShowPreview] = useState(false);

  const isEnabled = Boolean(sizeChart?.enabled);
  const sections = Array.isArray(sizeChart?.sections) ? sizeChart.sections : [];

  // Toggle master enable
  const handleToggleEnabled = (checked) => {
    onChange({
      ...sizeChart,
      enabled: checked,
      sections: sections.length > 0 ? sections : DEFAULT_SIZE_CHART.sections
    });
  };

  // Change title
  const handleTitleChange = (newTitle) => {
    onChange({
      ...sizeChart,
      title: newTitle
    });
  };

  // Apply a preset template
  const handleApplyPreset = (presetId) => {
    const found = SIZE_CHART_PRESETS.find(p => p.id === presetId);
    if (found) {
      let data = JSON.parse(JSON.stringify(found.data));
      // If product has sizes, sync columns
      if (productSizes.length > 0) {
        data = syncSizeChartWithSizes(data, productSizes);
      }
      onChange({
        ...data,
        enabled: true
      });
    }
  };

  // Sync size columns from product's active sizes
  const handleSyncSizes = () => {
    if (productSizes.length === 0) {
      alert('Please select or add product sizes in the "Available Sizes" section above first.');
      return;
    }
    const synced = syncSizeChartWithSizes(sizeChart, productSizes);
    onChange(synced);
  };

  // Section handlers
  const handleAddSection = () => {
    const newSection = {
      id: `sec-${Date.now()}`,
      title: sections.length === 0 ? 'TOP' : 'BOTTOM',
      sizes: productSizes.length > 0 ? [...productSizes] : ['S', 'M', 'L', 'XL', 'XXL'],
      measurements: [
        {
          id: `m-${Date.now()}-1`,
          label: 'Measurement 1',
          inches: {},
          cms: {}
        }
      ]
    };
    onChange({
      ...sizeChart,
      sections: [...sections, newSection]
    });
  };

  const handleUpdateSectionTitle = (sIdx, newTitle) => {
    const updated = [...sections];
    updated[sIdx] = { ...updated[sIdx], title: newTitle };
    onChange({ ...sizeChart, sections: updated });
  };

  const handleDeleteSection = (sIdx) => {
    const updated = sections.filter((_, idx) => idx !== sIdx);
    onChange({ ...sizeChart, sections: updated });
  };

  // Size Column Handlers
  const handleAddSizeColumn = (sIdx) => {
    const sizeName = prompt('Enter size column name (e.g. 3XL, 46, Free Size):');
    if (!sizeName || !sizeName.trim()) return;
    const clean = sizeName.trim();
    const updated = [...sections];
    const sec = { ...updated[sIdx] };
    if (!sec.sizes.includes(clean)) {
      sec.sizes = [...sec.sizes, clean];
      updated[sIdx] = sec;
      onChange({ ...sizeChart, sections: updated });
    }
  };

  const handleDeleteSizeColumn = (sIdx, szToDelete) => {
    const updated = [...sections];
    const sec = { ...updated[sIdx] };
    sec.sizes = sec.sizes.filter(s => s !== szToDelete);
    updated[sIdx] = sec;
    onChange({ ...sizeChart, sections: updated });
  };

  // Measurement Row Handlers
  const handleAddMeasurementRow = (sIdx) => {
    const updated = [...sections];
    const sec = { ...updated[sIdx] };
    const newM = {
      id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      label: 'New Metric',
      inches: {},
      cms: {}
    };
    sec.measurements = [...sec.measurements, newM];
    updated[sIdx] = sec;
    onChange({ ...sizeChart, sections: updated });
  };

  const handleUpdateMetricLabel = (sIdx, mIdx, newLabel) => {
    const updated = [...sections];
    const sec = { ...updated[sIdx] };
    const measurements = [...sec.measurements];
    measurements[mIdx] = { ...measurements[mIdx], label: newLabel };
    sec.measurements = measurements;
    updated[sIdx] = sec;
    onChange({ ...sizeChart, sections: updated });
  };

  const handleDeleteMeasurementRow = (sIdx, mIdx) => {
    const updated = [...sections];
    const sec = { ...updated[sIdx] };
    sec.measurements = sec.measurements.filter((_, idx) => idx !== mIdx);
    updated[sIdx] = sec;
    onChange({ ...sizeChart, sections: updated });
  };

  // Value Cell Change Handler (auto-converts between inch and cm)
  const handleCellValueChange = (sIdx, mIdx, sz, inputVal) => {
    const updated = [...sections];
    const sec = { ...updated[sIdx] };
    const measurements = [...sec.measurements];
    const row = { ...measurements[mIdx] };
    const inches = { ...(row.inches || {}) };
    const cms = { ...(row.cms || {}) };

    if (activeUnit === 'inch') {
      inches[sz] = inputVal;
      cms[sz] = inputVal ? inchToCm(inputVal) : '';
    } else {
      cms[sz] = inputVal;
      inches[sz] = inputVal ? cmToInch(inputVal) : '';
    }

    row.inches = inches;
    row.cms = cms;
    measurements[mIdx] = row;
    sec.measurements = measurements;
    updated[sIdx] = sec;
    onChange({ ...sizeChart, sections: updated });
  };

  return (
    <div className="size-chart-editor-card">
      {/* Master Toggle Bar */}
      <div className="sce-toggle-header">
        <div className="sce-toggle-info">
          <label className="sce-switch-label">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => handleToggleEnabled(e.target.checked)}
              className="sce-master-checkbox"
            />
            <span className="sce-switch-slider"></span>
            <span className="sce-toggle-text">
              <strong>Enable Size Chart &amp; Body Measurements</strong>
              <small>Customers will be able to click &quot;Size Chart&quot; on the product page to view inch and cm measurements.</small>
            </span>
          </label>
        </div>

        {isEnabled && (
          <div className="sce-top-actions">
            <button
              type="button"
              className="sce-preview-toggle-btn"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? '✏️ Edit Mode' : '👁️ Live Customer Preview'}
            </button>
          </div>
        )}
      </div>

      {isEnabled && (
        <div className="sce-editor-body">
          {/* Quick Preset Toolbar */}
          <div className="sce-presets-bar">
            <div className="sce-presets-left">
              <span className="sce-presets-label">⚡ Quick Templates:</span>
              <div className="sce-preset-buttons-wrap">
                {SIZE_CHART_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="sce-preset-btn"
                    onClick={() => handleApplyPreset(p.id)}
                    title={`Apply ${p.label} template`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sce-presets-right">
              {productSizes.length > 0 && (
                <button
                  type="button"
                  className="sce-sync-sizes-btn"
                  onClick={handleSyncSizes}
                  title="Update columns to match the sizes you selected for this product"
                >
                  🔄 Sync Sizes ({productSizes.join(', ')})
                </button>
              )}
            </div>
          </div>

          {/* Unit Toggle & Title Row */}
          <div className="sce-config-row">
            <div className="sce-title-field">
              <label>Chart Display Title</label>
              <input
                type="text"
                value={sizeChart.title || 'Body Measurement'}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Body Measurement or Garment Dimensions"
                className="sce-title-input"
              />
            </div>

            {/* Active Unit Toggle Switcher */}
            <div className="sce-unit-switch-box">
              <label className="sce-unit-switch-label">Editing &amp; Viewing In:</label>
              <div className="sce-unit-pills">
                <button
                  type="button"
                  className={`sce-unit-pill ${activeUnit === 'inch' ? 'active' : ''}`}
                  onClick={() => setActiveUnit('inch')}
                >
                  ● Inches (in)
                </button>
                <button
                  type="button"
                  className={`sce-unit-pill ${activeUnit === 'cm' ? 'active' : ''}`}
                  onClick={() => setActiveUnit('cm')}
                >
                  ● Centimeters (cm)
                </button>
              </div>
              <span className="sce-auto-convert-note">
                ✨ Auto-converts between <strong>in</strong> and <strong>cm</strong> instantly!
              </span>
            </div>
          </div>

          {/* Table Sections */}
          <div className="sce-sections-container">
            {sections.map((section, sIdx) => {
              const sizes = Array.isArray(section.sizes) ? section.sizes : [];
              const measurements = Array.isArray(section.measurements) ? section.measurements : [];

              return (
                <div key={section.id || `sec-${sIdx}`} className="sce-section-block">
                  {/* Section Title Bar */}
                  <div className="sce-section-header">
                    <div className="sce-section-title-wrap">
                      <span className="sce-sec-num">Table {sIdx + 1}:</span>
                      <input
                        type="text"
                        value={section.title || ''}
                        onChange={(e) => handleUpdateSectionTitle(sIdx, e.target.value)}
                        placeholder="e.g. TOP, BOTTOM, KURTI, BLOUSE"
                        className="sce-sec-title-input"
                      />
                    </div>

                    <div className="sce-sec-header-actions">
                      <button
                        type="button"
                        className="sce-sec-add-sz-btn"
                        onClick={() => handleAddSizeColumn(sIdx)}
                      >
                        + Add Size Column
                      </button>
                      <button
                        type="button"
                        className="sce-sec-delete-btn"
                        onClick={() => handleDeleteSection(sIdx)}
                        title="Delete entire section"
                      >
                        Delete Table
                      </button>
                    </div>
                  </div>

                  {/* Editable Table */}
                  <div className="sce-table-scroll">
                    <table className="sce-editable-table">
                      <thead>
                        <tr>
                          <th className="sce-th-metric-header">
                            Measurement Point ({activeUnit})
                          </th>
                          {sizes.map((sz) => (
                            <th key={sz} className="sce-th-size-header">
                              <div className="sce-size-header-cell">
                                <span>{sz}</span>
                                {sizes.length > 1 && (
                                  <button
                                    type="button"
                                    className="sce-remove-col-btn"
                                    onClick={() => handleDeleteSizeColumn(sIdx, sz)}
                                    title={`Remove ${sz} column`}
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            </th>
                          ))}
                          <th style={{ width: '40px', textAlign: 'center' }}>Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {measurements.map((m, mIdx) => (
                          <tr key={m.id || `m-${mIdx}`}>
                            <td className="sce-td-metric-name">
                              <input
                                type="text"
                                value={m.label || ''}
                                onChange={(e) => handleUpdateMetricLabel(sIdx, mIdx, e.target.value)}
                                placeholder="e.g. Bust, Waist, Across Shoulder..."
                                className="sce-metric-label-input"
                              />
                            </td>
                            {sizes.map((sz) => {
                              const cellVal =
                                activeUnit === 'inch'
                                  ? (m.inches?.[sz] !== undefined ? m.inches[sz] : '')
                                  : (m.cms?.[sz] !== undefined ? m.cms[sz] : (m.inches?.[sz] ? inchToCm(m.inches[sz]) : ''));

                              return (
                                <td key={sz} className="sce-td-val-input">
                                  <input
                                    type="text"
                                    value={cellVal}
                                    onChange={(e) => handleCellValueChange(sIdx, mIdx, sz, e.target.value)}
                                    placeholder={activeUnit === 'inch' ? 'in' : 'cm'}
                                    className="sce-val-input"
                                  />
                                </td>
                              );
                            })}
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className="sce-row-delete-btn"
                                onClick={() => handleDeleteMeasurementRow(sIdx, mIdx)}
                                title="Remove measurement row"
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Row Button */}
                  <div className="sce-add-row-bar">
                    <button
                      type="button"
                      className="sce-add-row-btn"
                      onClick={() => handleAddMeasurementRow(sIdx)}
                    >
                      + Add Measurement Row (e.g. Sleeve Length, Neck Depth...)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Section Button */}
          <div className="sce-bottom-actions">
            <button
              type="button"
              className="sce-add-section-btn"
              onClick={handleAddSection}
            >
              + Add Another Table (e.g. Bottom / Pants / Dupatta)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
