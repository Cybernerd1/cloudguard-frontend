import { useState, useEffect, useRef } from 'react';
import { fetchMetrics, fetchJHistory, getSovereignBackoff } from './api';

// Fallback mock data used when the backend v2 simulation routes are not yet
// available (e.g. during a deploy window, or when running main:app instead of
// cloudguard.app:app). This keeps charts populated instead of blank.
const FALLBACK_METRICS = {
  status: "fallback",
  tick: 0,
  j_score: 0.72,
  j_percentage: 72,
  total_resources: 47,
  compliant_resources: 34,
  drifted_resources: 13,
  remediated_count: 8,
  w_risk: 0.6,
  w_cost: 0.4,
};

const FALLBACK_J_HISTORY = [62, 64, 66, 65, 69, 71, 72];

export function useMetricData() {
  const [metrics, setMetrics] = useState(FALLBACK_METRICS);
  const [jHistory, setJHistory] = useState(FALLBACK_J_HISTORY);
  const [isLoading, setIsLoading] = useState(true);
  const [lastError, setLastError] = useState(null);
  // track whether we've ever succeeded so we stop spamming errors in logs
  const hasLiveDataRef = useRef(false);

  const abortRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      const backoff = getSovereignBackoff();
      if (backoff.active) {
        setIsLoading(false);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const [metricsData, historyData] = await Promise.all([
          fetchMetrics({ signal: controller.signal }),
          fetchJHistory({ signal: controller.signal }),
        ]);

        // If both return 404 / error, silently use fallback — don't flood console
        const metricsOk = metricsData && !metricsData.error;
        const historyOk = historyData && !historyData.error;

        if (metricsOk) {
          setMetrics(metricsData);
          hasLiveDataRef.current = true;
        } else if (!hasLiveDataRef.current) {
          // Only log once until we get live data
          setLastError(metricsData?.message || 'Backend v2 routes not yet available — using fallback data');
        }

        if (historyOk) {
          setJHistory(Array.isArray(historyData.j_history) ? historyData.j_history : FALLBACK_J_HISTORY);
          hasLiveDataRef.current = true;
        }

        setIsLoading(false);
      } catch (err) {
        if (err.name !== 'AbortError') {
          if (!hasLiveDataRef.current) {
            setLastError(err.message || 'Failed to fetch metric data');
          }
          setIsLoading(false);
        }
      }
    };

    loadData();
    const intervalId = setInterval(loadData, 10000); // reduced from 5s → 10s

    return () => {
      abortRef.current?.abort();
      clearInterval(intervalId);
    };
  }, []);

  return { metrics, jHistory, isLoading, lastError };
}
