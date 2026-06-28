// hooks/useApi.ts
import { useState, useEffect, useCallback } from 'react';

interface UseApiOptions<T> {
  initialData?: T;
  enabled?: boolean;
}

export function useApi<T>(
  fetchFn: () => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const { initialData, enabled = true } = options;
  
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    if (enabled) {
      fetch();
    }
  }, [enabled, fetch]);

  return { data, loading, error, refetch: fetch };
}

// Usage di component:
// const { data: users, loading, error, refetch } = useApi(() => api.getUsers());
