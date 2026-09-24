import { useState, useRef, useEffect, useCallback } from 'react';
import './ImageCropperModal.css';

const ASPECT_RATIOS = [
  { label: 'Hero Slide', ratio: 4 / 3, desc: '4:3 (Split Grid)' },
  { label: 'Widescreen', ratio: 16 / 9, desc: '16:9 (Standard)' },
  { label: 'Ultra-Wide', ratio: 21 / 9, desc: '21:9 (Panorama)' },
  { label: 'Square', ratio: 1 / 1, desc: '1:1 (Card)' },
  { label: 'Freeform', ratio: null, desc: 'Custom' }
];

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  isProcessing = false
}) {
  const [activeRatioIndex, setActiveRatioIndex] = useState(0); // Default 4:3 Hero Slide
  const [imgNaturalSize, setImgNaturalSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  
  // Crop box in display coordinates { x, y, width, height }
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 150 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);

  const [previewDataUrl, setPreviewDataUrl] = useState('');
  const [exportDimensions, setExportDimensions] = useState({ width: 0, height: 0 });

  const stageInnerRef = useRef(null);
  const imgRef = useRef(null);
  const dragRef = useRef({
    active: false,
    mode: null, // 'MOVE' or handle name: 'tl','tr','bl','br','tm','bm','lm','rm'
    startX: 0,
    startY: 0,
    startCrop: { x: 0, y: 0, width: 0, height: 0 }
  });

  const activeRatio = ASPECT_RATIOS[activeRatioIndex]?.ratio;

  // Initialize crop box to fit aspect ratio
  const initCropBox = useCallback((dispW, dispH, ratio) => {
    if (!dispW || !dispH) return;

    let w, h;
    if (ratio) {
      if (dispW / dispH > ratio) {
        h = Math.round(dispH * 0.85);
        w = Math.round(h * ratio);
      } else {
        w = Math.round(dispW * 0.85);
        h = Math.round(w / ratio);
      }
    } else {
      w = Math.round(dispW * 0.85);
      h = Math.round(dispH * 0.85);
    }

    // Ensure within bounds
    w = Math.min(w, dispW);
    h = Math.min(h, dispH);
    const x = Math.max(0, Math.round((dispW - w) / 2));
    const y = Math.max(0, Math.round((dispH - h) / 2));

    setCrop({ x, y, width: w, height: h });
  }, []);

  // When image loads or source changes
  const handleImageLoad = () => {
    if (!imgRef.current) return;
    const nw = imgRef.current.naturalWidth || 800;
    const nh = imgRef.current.naturalHeight || 600;
    setImgNaturalSize({ width: nw, height: nh });

    const dw = imgRef.current.clientWidth;
    const dh = imgRef.current.clientHeight;
    setDisplaySize({ width: dw, height: dh });

    initCropBox(dw, dh, activeRatio);
  };

  // Recalculate on ratio change
  const handleRatioChange = (idx) => {
    setActiveRatioIndex(idx);
    const newRatio = ASPECT_RATIOS[idx].ratio;
    if (displaySize.width && displaySize.height) {
      initCropBox(displaySize.width, displaySize.height, newRatio);
    }
  };

  // Generate live preview thumbnail
  useEffect(() => {
    if (!imgRef.current || !displaySize.width || !displaySize.height || !crop.width || !crop.height) return;

    try {
      const scaleX = imgNaturalSize.width / displaySize.width;
      const scaleY = imgNaturalSize.height / displaySize.height;

      const sourceX = Math.max(0, crop.x * scaleX);
      const sourceY = Math.max(0, crop.y * scaleY);
      const sourceW = Math.min(imgNaturalSize.width - sourceX, crop.width * scaleX);
      const sourceH = Math.min(imgNaturalSize.height - sourceY, crop.height * scaleY);

      if (sourceW <= 0 || sourceH <= 0) return;

      const previewCanvas = document.createElement('canvas');
      const maxDim = 600;
      let outW = Math.round(sourceW);
      let outH = Math.round(sourceH);
      if (outW > maxDim || outH > maxDim) {
        if (outW > outH) {
          outH = Math.round((outH * maxDim) / outW);
          outW = maxDim;
        } else {
          outW = Math.round((outW * maxDim) / outH);
          outH = maxDim;
        }
      }

      previewCanvas.width = outW;
      previewCanvas.height = outH;
      const pctx = previewCanvas.getContext('2d');
      if (pctx) {
        pctx.imageSmoothingEnabled = true;
        pctx.imageSmoothingQuality = 'high';

        pctx.save();
        pctx.translate(outW / 2, outH / 2);
        if (rotation) pctx.rotate((rotation * Math.PI) / 180);
        if (flipH) pctx.scale(-1, 1);
        pctx.translate(-outW / 2, -outH / 2);

        pctx.drawImage(imgRef.current, sourceX, sourceY, sourceW, sourceH, 0, 0, outW, outH);
        pctx.restore();

        setPreviewDataUrl(previewCanvas.toDataURL('image/jpeg', 0.85));
        setExportDimensions({
          width: Math.round(crop.width * scaleX),
          height: Math.round(crop.height * scaleY)
        });
      }
    } catch {
      // Ignore preview errors (e.g. CORS if external image)
    }
  }, [crop, displaySize, imgNaturalSize, rotation, flipH]);

  // Pointer drag & resize handlers
  const handlePointerDown = (e, mode) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = {
      active: true,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...crop }
    };
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!dragRef.current.active) return;
      e.preventDefault();

      const { mode, startX, startY, startCrop } = dragRef.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const dw = displaySize.width;
      const dh = displaySize.height;

      if (mode === 'MOVE') {
        const nextX = Math.max(0, Math.min(dw - startCrop.width, startCrop.x + dx));
        const nextY = Math.max(0, Math.min(dh - startCrop.height, startCrop.y + dy));
        setCrop(prev => ({ ...prev, x: nextX, y: nextY }));
        return;
      }

      // Handle corner and edge resizing
      let { x, y, width, height } = startCrop;

      if (mode.includes('r')) {
        width = Math.max(50, Math.min(dw - x, startCrop.width + dx));
        if (activeRatio) height = Math.round(width / activeRatio);
      }
      if (mode.includes('l')) {
        const proposedW = Math.max(50, startCrop.width - dx);
        const maxW = startCrop.x + startCrop.width;
        width = Math.min(proposedW, maxW);
        x = startCrop.x + (startCrop.width - width);
        if (activeRatio) height = Math.round(width / activeRatio);
      }
      if (mode.includes('b')) {
        height = Math.max(50, Math.min(dh - y, startCrop.height + dy));
        if (activeRatio) width = Math.round(height * activeRatio);
      }
      if (mode.includes('t')) {
        const proposedH = Math.max(50, startCrop.height - dy);
        const maxH = startCrop.y + startCrop.height;
        height = Math.min(proposedH, maxH);
        y = startCrop.y + (startCrop.height - height);
        if (activeRatio) width = Math.round(height * activeRatio);
      }

      // Keep inside bounds
      if (x + width > dw) width = dw - x;
      if (y + height > dh) height = dh - y;
      if (x < 0) { width += x; x = 0; }
      if (y < 0) { height += y; y = 0; }

      setCrop({
        x: Math.round(x),
        y: Math.round(y),
        width: Math.max(40, Math.round(width)),
        height: Math.max(40, Math.round(height))
      });
    };

    const handlePointerUp = () => {
      dragRef.current.active = false;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [displaySize, activeRatio]);

  // Apply final crop and export file
  const handleApplyCrop = () => {
    if (!imgRef.current) return;

    try {
      const scaleX = imgNaturalSize.width / displaySize.width;
      const scaleY = imgNaturalSize.height / displaySize.height;

      const sourceX = Math.max(0, crop.x * scaleX);
      const sourceY = Math.max(0, crop.y * scaleY);
      const sourceW = Math.min(imgNaturalSize.width - sourceX, crop.width * scaleX);
      const sourceH = Math.min(imgNaturalSize.height - sourceY, crop.height * scaleY);

      // Desired export resolution (maintain crisp high-res up to 2560px)
      const exportCanvas = document.createElement('canvas');
      const maxExportW = 2560;
      let outW = Math.round(sourceW);
      let outH = Math.round(sourceH);

      if (outW > maxExportW) {
        outH = Math.round((outH * maxExportW) / outW);
        outW = maxExportW;
      }

      exportCanvas.width = outW;
      exportCanvas.height = outH;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.save();
      ctx.translate(outW / 2, outH / 2);
      if (rotation) ctx.rotate((rotation * Math.PI) / 180);
      if (flipH) ctx.scale(-1, 1);
      ctx.translate(-outW / 2, -outH / 2);

      ctx.drawImage(imgRef.current, sourceX, sourceY, sourceW, sourceH, 0, 0, outW, outH);
      ctx.restore();

      exportCanvas.toBlob(
        (blob) => {
          if (!blob) {
            alert('Failed to generate cropped image.');
            return;
          }
          const file = new File([blob], 'banner-cropped.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          onCropComplete(blob, file);
        },
        'image/jpeg',
        0.92
      );
    } catch (err) {
      console.error('Error cropping image:', err);
      alert('Error cropping image. If loading from external URL, please upload file directly.');
    }
  };

  const handleResetCrop = () => {
    setRotation(0);
    setFlipH(false);
    setZoom(1);
    if (displaySize.width && displaySize.height) {
      initCropBox(displaySize.width, displaySize.height, activeRatio);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="cropper-modal-overlay">
      <div className="cropper-modal-window">
        {/* Header */}
        <div className="cropper-modal-header">
          <div className="cropper-title-area">
            <span className="cropper-icon">📐</span>
            <div>
              <h3>Crop & Fit Banner Image</h3>
              <p>Drag or resize the crop box to frame your hero banner perfectly</p>
            </div>
          </div>
          <button className="cropper-close-btn" onClick={onClose} title="Close">
            &times;
          </button>
        </div>

        {/* Aspect Ratio Selector Bar */}
        <div className="cropper-ratios-bar">
          <span className="ratio-label">Fit Aspect Ratio:</span>
          {ASPECT_RATIOS.map((item, idx) => (
            <button
              key={item.label}
              type="button"
              className={`ratio-btn ${activeRatioIndex === idx ? 'active' : ''}`}
              onClick={() => handleRatioChange(idx)}
            >
              <span>{item.label}</span>
              <span className="ratio-tag">({item.desc})</span>
            </button>
          ))}
        </div>

        {/* Main Workspace */}
        <div className="cropper-workspace">
          {/* Canvas Stage */}
          <div className="cropper-canvas-stage">
            <div className="cropper-stage-inner" ref={stageInnerRef}>
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop Target"
                className="cropper-source-img"
                crossOrigin="anonymous"
                onLoad={handleImageLoad}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
                  transition: 'transform 0.2s ease-out'
                }}
              />

              {/* Crop Box */}
              {displaySize.width > 0 && (
                <div
                  className="cropper-crop-box"
                  style={{
                    left: `${crop.x}px`,
                    top: `${crop.y}px`,
                    width: `${crop.width}px`,
                    height: `${crop.height}px`
                  }}
                  onPointerDown={(e) => handlePointerDown(e, 'MOVE')}
                >
                  {/* Rule of Thirds Grid */}
                  <div className="cropper-grid-lines">
                    <div className="grid-line-h1"></div>
                    <div className="grid-line-h2"></div>
                    <div className="grid-line-v1"></div>
                    <div className="grid-line-v2"></div>
                  </div>

                  {/* Corner Handles */}
                  <div className="crop-handle handle-tl" onPointerDown={(e) => handlePointerDown(e, 'tl')}></div>
                  <div className="crop-handle handle-tr" onPointerDown={(e) => handlePointerDown(e, 'tr')}></div>
                  <div className="crop-handle handle-bl" onPointerDown={(e) => handlePointerDown(e, 'bl')}></div>
                  <div className="crop-handle handle-br" onPointerDown={(e) => handlePointerDown(e, 'br')}></div>

                  {/* Edge Handles */}
                  <div className="crop-handle handle-tm" onPointerDown={(e) => handlePointerDown(e, 'tm')}></div>
                  <div className="crop-handle handle-bm" onPointerDown={(e) => handlePointerDown(e, 'bm')}></div>
                  <div className="crop-handle handle-lm" onPointerDown={(e) => handlePointerDown(e, 'lm')}></div>
                  <div className="crop-handle handle-rm" onPointerDown={(e) => handlePointerDown(e, 'rm')}></div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Controls & Live Preview */}
          <div className="cropper-sidebar">
            {/* Live Preview */}
            <div>
              <div className="sidebar-section-title">Live Banner Preview</div>
              <div className="cropper-preview-card">
                <div
                  className="preview-aspect-container"
                  style={{ aspectRatio: activeRatio ? `${activeRatio}` : '16/9' }}
                >
                  {previewDataUrl ? (
                    <img src={previewDataUrl} alt="Live Crop Preview" className="preview-canvas-render" />
                  ) : (
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Generating preview...</span>
                  )}
                </div>
                <div className="preview-meta">
                  <span>Output Resolution:</span>
                  <span className="preview-dim">{exportDimensions.width} × {exportDimensions.height} px</span>
                </div>
              </div>
            </div>

            {/* Zoom Slider */}
            <div>
              <div className="sidebar-section-title">Image Scaling</div>
              <div className="zoom-slider-box">
                <div className="zoom-slider-header">
                  <span>Zoom Level</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <div className="zoom-slider-controls">
                  <button
                    type="button"
                    className="zoom-step-btn"
                    onClick={() => setZoom(prev => Math.max(0.6, Number((prev - 0.1).toFixed(1))))}
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="0.6"
                    max="2.5"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="zoom-input-range"
                  />
                  <button
                    type="button"
                    className="zoom-step-btn"
                    onClick={() => setZoom(prev => Math.min(2.5, Number((prev + 0.1).toFixed(1))))}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Transform Actions */}
            <div>
              <div className="sidebar-section-title">Orientation Tools</div>
              <div className="cropper-tool-row">
                <button
                  type="button"
                  className="tool-btn"
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  title="Rotate 90 degrees clockwise"
                >
                  <span>↻</span> Rotate 90°
                </button>
                <button
                  type="button"
                  className="tool-btn"
                  onClick={() => setFlipH(f => !f)}
                  title="Flip horizontally"
                >
                  <span>⇄</span> Flip
                </button>
                <button
                  type="button"
                  className="tool-btn"
                  onClick={handleResetCrop}
                  title="Reset all adjustments"
                >
                  <span>↺</span> Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="cropper-modal-footer">
          <div className="footer-hint">
            <span>💡</span>
            <span>Drag the gold box to reposition • Drag corner handles to resize</span>
          </div>
          <div className="footer-actions">
            <button type="button" className="btn-cropper-cancel" onClick={onClose} disabled={isProcessing}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-cropper-apply"
              onClick={handleApplyCrop}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="cropper-spinner"></div>
                  <span>Uploading Cropped Image...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>Save & Fit to Banner</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
