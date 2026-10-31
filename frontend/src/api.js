// api.js — all backend calls go through this module
const BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : import.meta.env.PROD
    ? ''
    : 'http://127.0.0.1:8000';

let _graphCachePromise = null;
const _briefCachePromises = new Map();

function _briefCacheKey(startup, partner_id) {
  return `${partner_id}::${JSON.stringify(startup)}`;
}

/** Throw a descriptive error for non-2xx responses */
async function handleResponse(res) {
  if (!res.ok) {
    let message = res.statusText;
    try {
      const text = await res.text();
      try {
        const parsed = JSON.parse(text);
        message = parsed.detail || text;
      } catch {
        message = text || res.statusText;
      }
    } catch {
      // ignore
    }
    throw new Error(`API ${res.status}: ${message}`);
  }
  return res.json();
}

/**
 * analyzePitch(files: File | File[], options: { notes?, goal?, target_country? }): Promise<StartupProfile>
 * Sends multiple files (PDF, DOCX, PPTX, CSV, TXT, PNG, JPG, WEBP) + optional founder prompt & goals for AI analysis.
 */
export async function analyzePitch(files, options = {}) {
  const form = new FormData();
  if (Array.isArray(files)) {
    files.forEach((f) => form.append('files', f));
  } else if (files) {
    form.append('files', files);
  }
  if (options.notes) form.append('notes', options.notes);
  if (options.goal) form.append('goal', options.goal);
  if (options.target_country) form.append('target_country', options.target_country);

  const res = await fetch(`${BASE}/api/pitch/analyze`, {
    method: 'POST',
    body: form,
  });
  return handleResponse(res);
}

/**
 * getMatches(profile: StartupProfile): Promise<{matches: PartnerMatch[]}>
 * Returns top 3 partner matches for a given startup profile.
 */
export async function getMatches(profile) {
  const res = await fetch(`${BASE}/api/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  return handleResponse(res);
}

/**
 * getGraph(): Promise<{nodes, edges}>
 * Returns the ASEAN ecosystem network graph data (cached across step transitions).
 */
export async function getGraph() {
  if (!_graphCachePromise) {
    _graphCachePromise = fetch(`${BASE}/api/ecosystem/graph`)
      .then(handleResponse)
      .catch((err) => {
        _graphCachePromise = null;
        throw err;
      });
  }
  return _graphCachePromise;
}

/**
 * getBrief(startup: StartupProfile, partner_id: string): Promise<PartnershipBrief>
 * Generates a partnership brief and 30-day POC plan, deduplicating in-flight/cached requests.
 */
export async function getBrief(startup, partner_id) {
  const key = _briefCacheKey(startup, partner_id);
  if (_briefCachePromises.has(key)) {
    return _briefCachePromises.get(key);
  }
  const promise = fetch(`${BASE}/api/partnership/brief`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ startup, partner_id }),
  })
    .then(handleResponse)
    .catch((err) => {
      _briefCachePromises.delete(key);
      throw err;
    });
  _briefCachePromises.set(key, promise);
  return promise;
}

/**
 * prefetchBrief(startup: StartupProfile, partner_id: string): void
 * Warms up the brief cache on hover so clicking "Generate Partnership Brief" feels near-instant.
 */
export function prefetchBrief(startup, partner_id) {
  if (!startup || !partner_id) return;
  getBrief(startup, partner_id).catch(() => {});
}

/**
 * healthCheck(): Promise<{status: string, mock_mode?: boolean}>
 * Confirms the backend is reachable.
 */
export async function healthCheck() {
  const res = await fetch(`${BASE}/health`);
  return handleResponse(res);
}
