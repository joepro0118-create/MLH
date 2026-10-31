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
 * analyzePitch(file: File): Promise<StartupProfile>
 * Sends the pitch deck image for AI analysis.
 */
export async function analyzePitch(file) {
  const form = new FormData();
  form.append('image', file);
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
