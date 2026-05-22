import React, { useState, useRef, useEffect, useCallback } from 'react';
import mammoth from 'mammoth';
import {
  Type,
  ImageIcon,
  Droplets,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Trash2,
  MousePointer2,
  Underline,
  Palette,
} from 'lucide-react';
import StepperControl from './StepperControl';
import {
  uid,
  readFileAsArrayBuffer,
  readFileAsDataUrl,
  mergeOverlaysIntoHtml,
  RESIZE_HANDLES,
  applyResize,
} from '../utils/docEditorHelpers';
import { hexToRgba } from '../utils/colorUtils';

const FONT_OPTIONS = [
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Calibri', label: 'Calibri' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
];

const DEFAULT_OVERLAY = {
  type: 'text',
  text: 'Edit this text',
  fontSize: 18,
  color: '#1a1a1a',
  fontFamily: 'Times New Roman',
  underline: false,
  width: 200,
  height: 48,
  rotation: 0,
  x: 80,
  y: 120,
};

export default function LiveDocEditor({ docxBlob, onExportHtml, exportLabel = 'Save as PDF' }) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [overlays, setOverlays] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkColor, setWatermarkColor] = useState('#9ca3af');
  const [watermarkOpacity, setWatermarkOpacity] = useState(28);
  const [textColor, setTextColor] = useState('#1a1a1a');
  const [fontFamily, setFontFamily] = useState('Times New Roman');
  const [zoom, setZoom] = useState(120);

  const docBodyRef = useRef(null);
  const canvasRef = useRef(null);
  const imgInputRef = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDocx() {
      setLoading(true);
      setLoadError('');
      try {
        const buffer = await readFileAsArrayBuffer(docxBlob);
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
        if (cancelled) return;
        setBodyHtml(result.value || '<p>Document loaded. Select text here to change color, font, or underline.</p>');
      } catch (err) {
        if (!cancelled) setLoadError(err.message || 'Could not load document.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDocx();
    return () => { cancelled = true; };
  }, [docxBlob]);

  useEffect(() => {
    if (!docBodyRef.current || loading) return;
    if (docBodyRef.current.dataset.initialized) return;
    docBodyRef.current.innerHTML = bodyHtml;
    docBodyRef.current.dataset.initialized = 'true';
  }, [bodyHtml, loading]);

  const selected = overlays.find((o) => o.id === selectedId);
  const editingOverlayText = selected?.type === 'text';
  const editingWatermark = selected?.type === 'watermark';

  const updateOverlay = useCallback((id, patch) => {
    setOverlays((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }, []);

  const focusDocBody = () => {
    docBodyRef.current?.focus();
  };

  const applyToDocument = (command, value = null) => {
    focusDocBody();
    try {
      document.execCommand(command, false, value);
    } catch {
      /* ignore */
    }
  };

  const applyFontToDocument = (font) => {
    setFontFamily(font);
    applyToDocument('fontName', font);
  };

  const applyColorToDocument = (color) => {
    setTextColor(color);
    applyToDocument('foreColor', color);
  };

  const toggleUnderlineDocument = () => {
    applyToDocument('underline');
  };

  const applyFontToOverlay = (font) => {
    if (!selectedId || !editingOverlayText) return;
    setFontFamily(font);
    updateOverlay(selectedId, { fontFamily: font });
  };

  const applyColorToOverlay = (color) => {
    if (editingWatermark && selectedId) {
      setWatermarkColor(color);
      updateOverlay(selectedId, { color });
      return;
    }
    if (!selectedId || !editingOverlayText) {
      applyColorToDocument(color);
      return;
    }
    setTextColor(color);
    updateOverlay(selectedId, { color });
  };

  const toggleUnderlineOverlay = () => {
    if (!selectedId || !editingOverlayText) {
      toggleUnderlineDocument();
      return;
    }
    updateOverlay(selectedId, { underline: !selected.underline });
  };

  const addTextBlock = () => {
    const id = uid();
    setOverlays((prev) => [
      ...prev,
      {
        ...DEFAULT_OVERLAY,
        id,
        type: 'text',
        color: textColor,
        fontFamily,
      },
    ]);
    setSelectedId(id);
  };

  const addImage = async (file) => {
    if (!file) return;
    const src = await readFileAsDataUrl(file);
    const id = uid();
    setOverlays((prev) => [
      ...prev,
      {
        id,
        type: 'image',
        src,
        width: 220,
        height: 160,
        rotation: 0,
        x: 100,
        y: 180,
      },
    ]);
    setSelectedId(id);
  };

  const addWatermark = () => {
    const opacity = watermarkOpacity / 100;
    const existing = overlays.find((o) => o.type === 'watermark');
    if (existing) {
      updateOverlay(existing.id, {
        text: watermarkText,
        color: watermarkColor,
        opacity,
      });
      setSelectedId(existing.id);
      return;
    }
    const id = uid();
    setOverlays((prev) => [
      ...prev,
      {
        id,
        type: 'watermark',
        text: watermarkText,
        fontSize: 64,
        rotation: -35,
        color: watermarkColor,
        opacity,
        fontFamily: 'Times New Roman',
        x: 200,
        y: 420,
      },
    ]);
    setSelectedId(id);
  };

  const removeSelected = () => {
    if (!selectedId) return;
    setOverlays((prev) => prev.filter((o) => o.id !== selectedId));
    setSelectedId(null);
  };

  const rotateSelected = () => {
    if (!selected) return;
    if (selected.type === 'watermark' || selected.type === 'text' || selected.type === 'image') {
      updateOverlay(selected.id, { rotation: ((selected.rotation || 0) + 15) % 360 });
    }
  };

  const sizeUp = () => {
    if (!selected) return;
    if (selected.type === 'text' || selected.type === 'watermark') {
      updateOverlay(selected.id, { fontSize: (selected.fontSize || 16) + 4 });
    } else if (selected.type === 'image') {
      updateOverlay(selected.id, {
        width: Math.round((selected.width || 200) * 1.12),
        height: Math.round((selected.height || 150) * 1.12),
      });
    }
  };

  const sizeDown = () => {
    if (!selected) return;
    if (selected.type === 'text' || selected.type === 'watermark') {
      updateOverlay(selected.id, { fontSize: Math.max(10, (selected.fontSize || 16) - 4) });
    } else if (selected.type === 'image') {
      updateOverlay(selected.id, {
        width: Math.max(48, Math.round((selected.width || 200) * 0.88)),
        height: Math.max(36, Math.round((selected.height || 150) * 0.88)),
      });
    }
  };

  const onPointerDownOverlay = (e, id) => {
    e.stopPropagation();
    setSelectedId(id);
    const item = overlays.find((o) => o.id === id);
    if (!item) return;
    dragRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      origX: item.x,
      origY: item.y,
    };
  };

  const onPointerDownResize = (e, id, handle) => {
    e.stopPropagation();
    const item = overlays.find((o) => o.id === id);
    if (!item) return;
    resizeRef.current = {
      id,
      handle,
      x: e.clientX,
      y: e.clientY,
      width: item.width || 200,
      height: item.height || 120,
      left: item.x,
      top: item.y,
    };
  };

  useEffect(() => {
    const onMove = (e) => {
      if (dragRef.current) {
        const { id, startX, startY, origX, origY } = dragRef.current;
        updateOverlay(id, {
          x: origX + (e.clientX - startX),
          y: origY + (e.clientY - startY),
        });
      }
      if (resizeRef.current) {
        const { id, handle, x, y, width, height, left, top } = resizeRef.current;
        const next = applyResize(handle, { x, y, width, height, left, top }, e.clientX, e.clientY);
        updateOverlay(id, {
          width: Math.round(next.width),
          height: Math.round(next.height),
          x: Math.round(next.x),
          y: Math.round(next.y),
        });
      }
    };

    const onUp = () => {
      dragRef.current = null;
      resizeRef.current = null;
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [updateOverlay]);

  const handleExport = () => {
    const editedBody = docBodyRef.current?.innerHTML || bodyHtml;
    const fullHtml = mergeOverlaysIntoHtml(editedBody, overlays);
    onExportHtml(fullHtml);
  };

  const formatHint = editingOverlayText
    ? 'Formatting applies to selected text box'
    : editingWatermark
      ? 'Formatting applies to watermark'
      : 'Select text in the document, then set font, color, or underline';

  if (loading) {
    return (
      <div className="doc-editor-loading">
        <div className="processing-loader" />
        <p>Loading document for editing…</p>
      </div>
    );
  }

  if (loadError) {
    return <div className="doc-editor-error">{loadError}</div>;
  }

  return (
    <div className="live-doc-editor live-doc-editor-large">
      <aside className="doc-editor-toolbar">
        <p className="toolbar-label">Text style</p>
        <div className="format-row">
          <label htmlFor="doc-font">Font</label>
          <select
            id="doc-font"
            value={editingOverlayText ? selected?.fontFamily || fontFamily : fontFamily}
            onChange={(e) => {
              if (editingOverlayText) applyFontToOverlay(e.target.value);
              else applyFontToDocument(e.target.value);
            }}
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div className="format-row format-color">
          <Palette size={16} />
          <label htmlFor="doc-color">Color</label>
          <input
            id="doc-color"
            type="color"
            value={editingWatermark ? selected?.color || watermarkColor : editingOverlayText ? selected?.color || textColor : textColor}
            onChange={(e) => applyColorToOverlay(e.target.value)}
          />
        </div>

        <button
          type="button"
          className={`tool-btn format-toggle ${editingOverlayText && selected?.underline ? 'active' : ''}`}
          onClick={toggleUnderlineOverlay}
          title="Underline"
        >
          <Underline size={18} /> Underline
        </button>

        <p className="toolbar-format-hint">{formatHint}</p>

        <p className="toolbar-label">Insert</p>
        <button type="button" className="tool-btn" onClick={addTextBlock} title="Add text">
          <Type size={18} /> Add text
        </button>
        <button type="button" className="tool-btn" onClick={() => imgInputRef.current?.click()} title="Add image">
          <ImageIcon size={18} /> Add image
        </button>
        <input
          type="file"
          ref={imgInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            addImage(e.target.files?.[0]);
            e.target.value = '';
          }}
        />

        <p className="toolbar-label">Watermark</p>
        <div className="watermark-row">
          <Droplets size={16} />
          <input
            type="text"
            value={watermarkText}
            onChange={(e) => setWatermarkText(e.target.value)}
            placeholder="Watermark text"
          />
        </div>
        <div className="format-row format-color">
          <label htmlFor="wm-color">Watermark color</label>
          <input
            id="wm-color"
            type="color"
            value={editingWatermark ? selected?.color || watermarkColor : watermarkColor}
            onChange={(e) => {
              setWatermarkColor(e.target.value);
              if (editingWatermark && selectedId) updateOverlay(selectedId, { color: e.target.value });
            }}
          />
        </div>
        <div className="opacity-slider-row">
          <label htmlFor="wm-opacity">
            Transparency {editingWatermark ? Math.round((selected?.opacity ?? watermarkOpacity / 100) * 100) : watermarkOpacity}%
          </label>
          <input
            id="wm-opacity"
            type="range"
            min={5}
            max={80}
            value={
              editingWatermark
                ? Math.round((selected?.opacity ?? 0.28) * 100)
                : watermarkOpacity
            }
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              setWatermarkOpacity(v);
              if (editingWatermark && selectedId) {
                updateOverlay(selectedId, { opacity: v / 100 });
              }
            }}
          />
        </div>
        <button type="button" className="tool-btn" onClick={addWatermark}>
          <Droplets size={18} /> Add / update watermark
        </button>
        <p className="toolbar-format-hint">Drag the watermark on the page to reposition it.</p>

        <p className="toolbar-label">Size &amp; rotate</p>
        <button type="button" className="tool-btn adjust-btn-lg" onClick={rotateSelected} disabled={!selected}>
          <RotateCw size={20} /> Rotate
        </button>
        <button type="button" className="tool-btn adjust-btn-lg" onClick={sizeUp} disabled={!selected}>
          <ZoomIn size={20} /> Bigger
        </button>
        <button type="button" className="tool-btn adjust-btn-lg" onClick={sizeDown} disabled={!selected}>
          <ZoomOut size={20} /> Smaller
        </button>
        <button type="button" className="tool-btn danger" onClick={removeSelected} disabled={!selected}>
          <Trash2 size={18} /> Remove
        </button>

        <p className="toolbar-hint">
          <MousePointer2 size={14} /> Click document text to edit. Drag images/text boxes; use dots to resize images.
        </p>

        <p className="toolbar-label">Page zoom</p>
        <StepperControl
          large
          value={zoom}
          onChange={setZoom}
          min={70}
          max={200}
          step={10}
        />
        <button type="button" className="tool-btn compact" onClick={() => setZoom(120)}>
          Reset view (120%)
        </button>

        <button type="button" className="btn btn-primary btn-large export-btn" onClick={handleExport}>
          {exportLabel}
        </button>
      </aside>

      <div className="doc-editor-main">
        <div className="doc-format-bar doc-format-bar-rich">
          <span className="format-bar-title">Live document</span>
          <select
            className="format-bar-select"
            value={fontFamily}
            onChange={(e) => applyFontToDocument(e.target.value)}
            aria-label="Font family"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <input
            type="color"
            className="format-bar-color"
            value={textColor}
            onChange={(e) => applyColorToDocument(e.target.value)}
            title="Text color"
          />
          <button type="button" className="format-bar-btn" onClick={toggleUnderlineDocument} title="Underline">
            <Underline size={18} />
          </button>
          <span className="format-bar-tip">Select text in the page, then pick font &amp; color</span>
        </div>

        <div className="doc-editor-stage" ref={canvasRef} onClick={() => setSelectedId(null)}>
          <div
            className="doc-page-view doc-page-view-large"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            {overlays
              .filter((o) => o.type === 'watermark')
              .map((o) => (
                <div
                  key={o.id}
                  className={`doc-watermark-layer ${selectedId === o.id ? 'selected' : ''}`}
                  style={{
                    left: o.x ?? 200,
                    top: o.y ?? 420,
                    fontSize: `${o.fontSize}px`,
                    color: hexToRgba(o.color || watermarkColor, o.opacity ?? 0.28),
                    fontFamily: o.fontFamily || 'Times New Roman',
                    transform: `rotate(${o.rotation}deg)`,
                  }}
                  onPointerDown={(e) => onPointerDownOverlay(e, o.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(o.id);
                  }}
                >
                  {o.text}
                </div>
              ))}

            <div
              ref={docBodyRef}
              className="doc-body contenteditable"
              contentEditable
              suppressContentEditableWarning
              onClick={(e) => e.stopPropagation()}
              style={{ fontFamily: 'Times New Roman' }}
            />

            {overlays
              .filter((o) => o.type !== 'watermark')
              .map((o) => (
                <div
                  key={o.id}
                  className={`doc-overlay-item ${selectedId === o.id ? 'selected' : ''}`}
                  style={{
                    left: o.x,
                    top: o.y,
                    width: o.type === 'image' ? o.width : 'auto',
                    transform: `rotate(${o.rotation || 0}deg)`,
                  }}
                  onPointerDown={(e) => onPointerDownOverlay(e, o.id)}
                  onClick={(e) => e.stopPropagation()}
                >
                  {o.type === 'image' ? (
                    <img src={o.src} alt="" draggable={false} style={{ width: '100%', height: 'auto' }} />
                  ) : (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="overlay-text"
                      style={{
                        fontSize: `${o.fontSize}px`,
                        color: o.color || textColor,
                        fontFamily: o.fontFamily || fontFamily,
                        textDecoration: o.underline ? 'underline' : 'none',
                      }}
                      onInput={(e) => updateOverlay(o.id, { text: e.currentTarget.textContent })}
                    >
                      {o.text}
                    </div>
                  )}

                  {selectedId === o.id && o.type === 'image' &&
                    RESIZE_HANDLES.map((h) => (
                      <span
                        key={h}
                        className={`resize-dot resize-${h}`}
                        onPointerDown={(e) => onPointerDownResize(e, o.id, h)}
                      />
                    ))}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
