// api.js — all backend calls go through this module
const BASE = 'http://localhost:8000';

/** Throw a descriptive error for non-2xx responses */
async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

/**
 * analyzePitch(files: File | File[], options: { notes?, goal?, target_country? }): Promise<StartupProfile>
 * Sends 1 to 3 pitch deck / flyer images + optional founder note & goals for AI analysis.
 */
export async function analyzePitch(files, options = {}) {
  const form = new FormData();
  if (Array.isArray(files)) {
    files.forEach((f) => form.append('images', f));
  } else if (files) {
    form.append('image', files);
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
 * Returns the ASEAN ecosystem network graph data.
 */
export async function getGraph() {
  const res = await fetch(`${BASE}/api/ecosystem/graph`);
  return handleResponse(res);
}

/**
 * getBrief(startup: StartupProfile, partner_id: string): Promise<PartnershipBrief>
 * Generates a partnership brief and 30-day POC plan.
 */
export async function getBrief(startup, partner_id) {
  const res = await fetch(`${BASE}/api/partnership/brief`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ startup, partner_id }),
  });
  return handleResponse(res);
}

/**
 * healthCheck(): Promise<{status: string}>
 * Confirms the backend is reachable.
 */
export async function healthCheck() {
  const res = await fetch(`${BASE}/health`);
  return handleResponse(res);
}
