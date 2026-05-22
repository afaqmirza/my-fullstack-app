/** Unified API client — all document tools use POST /api/execute with a task name. */
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function executeTool(task, formData, fetchOptions = {}) {
  const body = formData instanceof FormData ? formData : new FormData();
  if (!body.has('task')) {
    body.append('task', task);
  }

  return fetch(`${API_BASE}/api/execute`, {
    method: 'POST',
    body,
    ...fetchOptions,
  });
}

export async function qrDecode(formData) {
  return fetch(`${API_BASE}/api/qr/decode`, { method: 'POST', body: formData });
}

export async function qrGenerate(payload) {
  return fetch(`${API_BASE}/api/qr/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function sendContactMessage({ name, email, subject, message }) {
  return fetch(`${API_BASE}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, subject, message }),
  });
}
