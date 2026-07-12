import { useState, useEffect, useCallback, useRef } from 'react';
import axiosClient from '../api/axiosClient';

/**
 * Data fetching hook with caching (#14).
 * Caches API responses in memory to avoid refetching on navigation.
 * Cache is keyed by endpoint URL.
 */
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useApi(url, options = {}) {
  const { enabled = true, cache: useCache = true, ttl = CACHE_TTL } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (force = false) => {
    if (!url || !enabled) return;

    // Check cache
    const cacheKey = url;
    if (useCache && !force && cache.has(cacheKey)) {
      const { data: cachedData, timestamp } = cache.get(cacheKey);
      if (Date.now() - timestamp < ttl) {
        if (mountedRef.current) {
          setData(cachedData);
          setLoading(false);
        }
        return;
      }
      cache.delete(cacheKey);
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get(url);
      if (mountedRef.current) {
        setData(res.data);
        if (useCache) {
          cache.set(cacheKey, { data: res.data, timestamp: Date.now() });
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.response?.data?.message || 'Failed to load data');
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [url, enabled, useCache, ttl]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  const refetch = () => fetchData(true);
  const invalidate = () => { if (url) cache.delete(url); };

  return { data, loading, error, refetch, invalidate };
}

/**
 * Clears the entire API cache. Use after mutations.
 */
export function clearApiCache() {
  cache.clear();
}

/**
 * Invalidates cache entries matching a prefix.
 */
export function invalidateCache(prefix) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}
