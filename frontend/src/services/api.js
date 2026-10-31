import {
  DEMO_STARTUP_PROFILE,
  DEMO_MATCHES,
  DEMO_BRIEFS,
  DEMO_GRAPH,
} from './demoData';

export const API_BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : import.meta.env.PROD
    ? ''
    : 'http://127.0.0.1:8000';

/**
 * Helper to parse FastAPI error format: {"detail": "human readable message"}
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.detail) {
        errorDetail =
          typeof errJson.detail === 'string'
            ? errJson.detail
            : JSON.stringify(errJson.detail);
      }
    } catch {
      // Ignore JSON parse failure
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * GET /health -> {"status":"ok"}
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: data?.status === 'ok', data };
  } catch {
    return { online: false };
  }
}

/**
 * POST /api/pitch/analyze (multipart file "image") -> StartupProfile
 */
export async function analyzePitchImage(file, { allowOfflineFallback = true } = {}) {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch(`${API_BASE_URL}/api/pitch/analyze`, {
      method: 'POST',
      body: formData,
    });
    const data = await handleResponse(res);
    return { data, source: 'backend' };
  } catch (err) {
    if (allowOfflineFallback && (err.name === 'TypeError' || err.message.includes('Failed to fetch'))) {
      await delay(1400); // Simulate Gemma 4 vision latency
      return {
        data: structuredClone(DEMO_STARTUP_PROFILE),
        source: 'mock-fallback',
      };
    }
    throw err;
  }
}

/**
 * POST /api/matches (body: StartupProfile) -> {"matches":[PartnerMatch x3]}
 */
export async function findPartnerMatches(startupProfile, { allowOfflineFallback = true } = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(startupProfile),
    });
    const data = await handleResponse(res);
    return { data: data.matches || [], source: 'backend' };
  } catch (err) {
    if (allowOfflineFallback && (err.name === 'TypeError' || err.message.includes('Failed to fetch'))) {
      await delay(1100);
      return {
        data: structuredClone(DEMO_MATCHES),
        source: 'mock-fallback',
      };
    }
    throw err;
  }
}

/**
 * POST /api/partnership/brief (body: {"startup":StartupProfile,"partner_id":str}) -> PartnershipBrief
 */
export async function generatePartnershipBrief(
  startupProfile,
  partnerId,
  partnerMatch = null,
  { allowOfflineFallback = true } = {}
) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/partnership/brief`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startup: startupProfile,
        partner_id: partnerId,
      }),
    });
    const data = await handleResponse(res);
    return { data, source: 'backend' };
  } catch (err) {
    if (allowOfflineFallback && (err.name === 'TypeError' || err.message.includes('Failed to fetch'))) {
      await delay(1600); // Simulate Gemma 4 brief generation latency
      const preset = DEMO_BRIEFS[partnerId];
      if (preset) {
        return { data: structuredClone(preset), source: 'mock-fallback' };
      }
      const pName = partnerMatch?.partner_name || partnerId;
      const pCountry = partnerMatch?.country || 'Vietnam';
      return {
        data: {
          objective: `Launch a 30-day cross-border Proof of Concept between ${startupProfile.company_name} (${startupProfile.country}) and ${pName} (${pCountry}) to validate ${startupProfile.sector} deployment in ${pCountry}.`,
          collaboration_concept: `${startupProfile.company_name} provides core technology (${startupProfile.capabilities.slice(0, 2).join(', ')}); ${pName} provides local market access, regulatory sandbox support, and operational infrastructure.`,
          proposed_poc:
            partnerMatch?.opportunity ||
            `Deploy an initial pilot across selected test sites in ${pCountry} with shared telemetry and weekly outcome checkpoints.`,
          timeline: [
            `Week 1 — Alignment & Scope: Sign illustrative POC memorandum, define site parameters with ${pName}, and localize technical interfaces.`,
            `Week 2 — Sandbox Deployment: Configure and deploy pilot units/software in ${pCountry} test environment; integrate partner data streams.`,
            'Week 3 — Live Pilot & Telemetry Audit: Run active pilot operations, monitor KPIs, and tune model/hardware performance with field operators.',
            'Week 4 — Outcome Conversion & Next Steps: Evaluate 30-day metrics against baseline and draft Phase 2 commercial expansion proposal.',
          ],
          success_metrics: [
            '100% completion of technical integration within 10 days of kickoff',
            '>85% pilot user/operator satisfaction score across field test sites',
            'Validated quantitative ROI / efficiency improvement over local baseline',
            'Joint decision memo for post-POC commercial scale-up across ASEAN',
          ],
        },
        source: 'mock-fallback',
      };
    }
    throw err;
  }
}

/**
 * GET /api/ecosystem/graph -> {"nodes":[{id,label,type,country}],"edges":[{source,target,relation,weight}]}
 */
export async function getEcosystemGraph({ allowOfflineFallback = true } = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ecosystem/graph`);
    const data = await handleResponse(res);
    return { data, source: 'backend' };
  } catch (err) {
    if (allowOfflineFallback && (err.name === 'TypeError' || err.message.includes('Failed to fetch'))) {
      return { data: structuredClone(DEMO_GRAPH), source: 'mock-fallback' };
    }
    throw err;
  }
}
