import { useState, useEffect, useRef } from 'react';
import { fetchMetrics, fetchJHistory, getSovereignBackoff } from './api';

export function useMetricData() {
  const [metrics, setMetrics] = useState(null);
  const [jHistory, setJHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastError, setLastError] = useState(null);

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

        if (metricsData && !metricsData.error) {
          setMetrics(metricsData);
        } else if (metricsData?.error) {
          setLastError(metricsData.message || 'Failed to fetch metrics');
        }

        if (historyData && !historyData.error) {
          setJHistory(Array.isArray(historyData.j_history) ? historyData.j_history : []);
        } else if (historyData?.error) {
          setLastError(historyData.message || 'Failed to fetch J-history');
        }

        setIsLoading(false);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Failed to fetch metric data", err);
          setLastError(err.message || 'Failed to fetch metric data');
          setIsLoading(false);
        }
      }
    };
    
    loadData();
    const intervalId = setInterval(loadData, 5000);
    
    return () => {
      abortRef.current?.abort();
      clearInterval(intervalId);
    };
  }, []);

  return { metrics, jHistory, isLoading, lastError };
}
