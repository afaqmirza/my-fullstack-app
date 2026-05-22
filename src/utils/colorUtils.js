export function hexToRgba(hex, alpha = 1) {
  const h = String(hex).replace('#', '');
  if (h.length !== 6) return `rgba(120,120,120,${alpha})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
