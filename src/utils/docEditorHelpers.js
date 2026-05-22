export function uid() {
  return `el-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Collect overlay nodes (images / text blocks / watermark) into export HTML */
export function mergeOverlaysIntoHtml(bodyHtml, overlays) {
  const watermark = overlays.find((o) => o.type === 'watermark');
  const others = overlays.filter((o) => o.type !== 'watermark');

  let html = bodyHtml;

  if (watermark) {
    const wmColor = watermark.color || '#9ca3af';
    const wmOpacity = watermark.opacity ?? 0.28;
    const wmStyle = [
      'text-align:center',
      `color:${wmColor}`,
      `opacity:${wmOpacity}`,
      `font-size:${watermark.fontSize || 72}px`,
      `font-family:${watermark.fontFamily || 'Times New Roman'}`,
      'font-weight:bold',
      'letter-spacing:0.15em',
      'margin:2rem 0',
      `transform:rotate(${watermark.rotation || -35}deg)`,
    ].join(';');
    html = `<div class="doc-watermark" data-editor-overlay="watermark" style="${wmStyle}">${escapeHtml(watermark.text)}</div>${html}`;
  }

  const blocks = others
    .map((o) => {
      const style = [
        'position:relative',
        'display:block',
        'margin:12px 0',
        `transform:rotate(${o.rotation || 0}deg)`,
        'transform-origin:center center',
      ].join(';');

      if (o.type === 'image') {
        return `<div class="editor-overlay-block" data-editor-overlay="image" style="${style}"><img src="${o.src}" alt="" style="width:${o.width}px;height:auto;max-width:100%;" /></div>`;
      }
      const textStyle = [
        `font-size:${o.fontSize || 16}px`,
        `color:${o.color || '#1a1a1a'}`,
        `font-family:${o.fontFamily || 'Times New Roman'}`,
        o.underline ? 'text-decoration:underline' : '',
        'margin:0',
      ]
        .filter(Boolean)
        .join(';');
      return `<div class="editor-overlay-block" data-editor-overlay="text" style="${style}"><p style="${textStyle}">${escapeHtml(o.text)}</p></div>`;
    })
    .join('');

  return blocks + html;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const RESIZE_HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

export function applyResize(handle, start, clientX, clientY, minSize = 40) {
  const dx = clientX - start.x;
  const dy = clientY - start.y;
  let { width, height, x, y } = start;

  if (handle.includes('e')) width = Math.max(minSize, start.width + dx);
  if (handle.includes('w')) {
    width = Math.max(minSize, start.width - dx);
    x = start.left + (start.width - width);
  }
  if (handle.includes('s')) height = Math.max(minSize, start.height + dy);
  if (handle.includes('n')) {
    height = Math.max(minSize, start.height - dy);
    y = start.top + (start.height - height);
  }

  return { width, height, x, y };
}
