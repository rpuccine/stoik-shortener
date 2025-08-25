const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';

export async function shorten(url: string, expiresInDays?: number) {
  const res = await fetch(`${API_BASE}/api/shorten`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, expiresInDays })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export async function getStats(slug: string) {
  const res = await fetch(`${API_BASE}/api/stats/${encodeURIComponent(slug)}`);
  if (!res.ok) {
    throw new Error('Stats not found');
  }
  return res.json();
}
