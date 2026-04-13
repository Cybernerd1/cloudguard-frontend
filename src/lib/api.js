/**
 * CLOUDGUARD-B — REST API CLIENT
 * ================================
 * Centralized API client for the CloudGuard-B Sovereign Backend.
 *
 * Endpoints Mapped:
 *   GET  /api/v2/simulation/metrics    — Simulation state + J-Score
 *   GET  /api/v2/simulation/j-history  — J score history for charting
 *   GET  /api/v2/events                — Drain event queue (poll)
 *   GET  /api/v2/events/stats          — Event bus statistics
 *   GET  /api/v2/health                — Health check (all subsystems)
 *   POST /api/v2/math/j                — Calculate J-Equilibrium
 *   POST /api/v2/math/rosi             — Calculate ROSI
 *   GET  /ws/status                    — War Room WebSocket status
 *   GET  /ws/war-room/test-emit        — Dev: inject synthetic event
 *
 * Sovereign Backoff:
 *   If the backend returns HTTP 429, the client enters a "Sovereign Backoff"
 *   state with exponential retry instead of a spinning loader.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

// ── Sovereign Backoff State ────────────────────────────────────────────────
let _backoffUntil = 0;     // timestamp (ms) until which we refuse requests
let _backoffReason = "";

export function getSovereignBackoff() {
  if (Date.now() < _backoffUntil) {
    return { active: true, reason: _backoffReason, retryAt: _backoffUntil };
  }
  return { active: false, reason: "", retryAt: 0 };
}

function _extractErrorMessage(err) {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  return String(err);
}

async function _safeParseResponse(res) {
  const contentType = res.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }

  const text = await res.text().catch(() => "");
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

// ── Core fetch wrapper ─────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  // Check backoff
  if (Date.now() < _backoffUntil) {
    return {
      error: true,
      status: 429,
      message: `Sovereign Backoff active: ${_backoffReason}`,
      retryAt: _backoffUntil,
    };
  }

  const url = `${API_BASE}${path}`;

  try {
    const { headers: customHeaders = {}, ...restOptions } = options;

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...customHeaders,
      },
      ...restOptions,
    });

    // Handle 429 Rate Limit — Sovereign Backoff
    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get("Retry-After") || "60", 10);
      _backoffUntil = Date.now() + retryAfter * 1000;
      _backoffReason = `Backend Swarm rate limited. Retry after ${retryAfter}s.`;
      return {
        error: true,
        status: 429,
        message: _backoffReason,
        retryAt: _backoffUntil,
      };
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { error: true, status: res.status, message: body || res.statusText };
    }

    return await _safeParseResponse(res);
  } catch (err) {
    return { error: true, status: 0, message: _extractErrorMessage(err) };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// REST ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

/** Health check — returns subsystem liveness + war room stats */
export async function fetchHealth(options = {}) {
  return apiFetch("/api/v2/health", options);
}

/** Simulation metrics — current J-Score, tick, resource counts */
export async function fetchMetrics(options = {}) {
  return apiFetch("/api/v2/simulation/metrics", options);
}

/** J-Score history for time-series charting */
export async function fetchJHistory(options = {}) {
  return apiFetch("/api/v2/simulation/j-history", options);
}

/** Drain queued events (polling fallback when WS is down) */
export async function fetchEvents(maxItems = 50, options = {}) {
  return apiFetch(`/api/v2/events?max_items=${maxItems}`, options);
}

/** Event bus stats (published/failed/queue depth) */
export async function fetchEventStats(options = {}) {
  return apiFetch("/api/v2/events/stats", options);
}

/** Fetch collision manager stats (alias for event stats for now, or specific stats endpoint) */
export async function fetchCollisionStatus(options = {}) {
  return apiFetch("/api/v2/events/stats", options);
}

/** Fetch forecast data (from metrics or dedicated endpoint per plan) */
export async function fetchForecastData(options = {}) {
  return apiFetch("/api/v2/simulation/metrics", options);
}

/** War Room WebSocket status */
export async function fetchWSStatus(options = {}) {
  return apiFetch("/ws/status", options);
}

/** Calculate J-Equilibrium (Stochastic J-Function) */
export async function calculateJ(resources, wRisk = 0.6, wCost = 0.4) {
  return apiFetch("/api/v2/math/j", {
    method: "POST",
    body: JSON.stringify({ resources, w_risk: wRisk, w_cost: wCost }),
  });
}

/** Calculate ROSI for a remediation */
export async function calculateROSI(aleBefore, aleAfter, remediationCost) {
  return apiFetch("/api/v2/math/rosi", {
    method: "POST",
    body: JSON.stringify({
      ale_before: aleBefore,
      ale_after: aleAfter,
      remediation_cost: remediationCost,
    }),
  });
}

/** Initialize simulation */
export async function initSimulation(seed = 42, wRisk = 0.6, wCost = 0.4, options = {}) {
  return apiFetch("/api/v2/simulation/init", {
    method: "POST",
    body: JSON.stringify({ seed, w_risk: wRisk, w_cost: wCost }),
    ...options,
  });
}

/** Step simulation by N ticks */
export async function stepSimulation(nTicks = 1, options = {}) {
  return apiFetch(`/api/v2/simulation/step/${nTicks}`, { method: "POST", ...options });
}

/** Dev: inject synthetic event for pipeline testing */
export async function testEmit(options = {}) {
  return apiFetch("/ws/war-room/test-emit", options);
}

/** Fetch NIST Sovereign Audit Report (from v2 events/SIEM) */
export async function fetchAuditReport(options = {}) {
  return apiFetch("/api/v2/events/siem?max_items=100", options);
}

/** Manually trigger Audit Surgeon Veto */
export async function triggerAuditVeto(resourceId, reason = "") {
  return apiFetch("/api/v2/simulation/step", {
    method: "POST",
    body: JSON.stringify({
      veto_override: true,
      target_resource_id: resourceId,
      reason,
    }),
  });
}

export { API_BASE };
