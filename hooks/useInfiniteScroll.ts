/**
 * =============================================================================
 * USE INFINITE SCROLL - React Hook for Infinite Scroll Pattern
 * =============================================================================
 * 
 * React hook for infinite scroll pattern with cursor-based pagination,
 * automatic prefetching, and efficient data accumulation.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface InfiniteScrollOptions<T> {
  fetchNext: (cursor?: string) => Promise<{ data: T[]; nextCursor?: string; hasMore: boolean }>;
  initialCursor?: string;
  pageSize?: number;
  enabled?: boolean;
  prefetchDistance?: number; // Prefetch when N items from bottom
  onError?: (error: Error) => void;
}

export interface InfiniteScrollResult<T> {
  data: T[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isError: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook for infinite scroll pattern
 */
export function useInfiniteScroll<T>(
  options: InfiniteScrollOptions<T>
): InfiniteScrollResult<T> {
  const {
    fetchNext,
    initialCursor,
    pageSize = 50,
    enabled = true,
    prefetchDistance = 10,
    onError,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(initialCursor);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const loadMore = useCallback(async () => {
    if (!enabled || isLoadingMore || !hasMore) {
      return;
    }

    if (isInitialLoad) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    setIsError(false);
    setError(null);

    try {
      const result = await fetchNext(currentCursor);
      setData((prev) => [...prev, ...result.data]);
      setCurrentCursor(result.nextCursor);
      setHasMore(result.hasMore);
      setIsInitialLoad(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setIsError(true);
      setError(error);
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [fetchNext, currentCursor, enabled, isLoadingMore, hasMore, isInitialLoad, onError]);

  useEffect(() => {
    if (enabled && isInitialLoad) {
      loadMore();
    }
  }, [enabled]); // Only run on mount or enabled change

  const refresh = useCallback(async () => {
    setData([]);
    setCurrentCursor(initialCursor);
    setHasMore(true);
    setIsInitialLoad(true);
    await loadMore();
  }, [loadMore, initialCursor]);

  const reset = useCallback(() => {
    setData([]);
    setCurrentCursor(initialCursor);
    setHasMore(true);
    setIsInitialLoad(true);
    setIsError(false);
    setError(null);
  }, [initialCursor]);

  // Prefetch when near bottom
  const handleScroll = useCallback(
    (event: any) => {
      const { scrollTop, scrollHeight, clientHeight } = event.target;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const itemHeight = 50; // Approximate item height
      const itemsFromBottom = Math.floor(distanceFromBottom / itemHeight);

      if (itemsFromBottom <= prefetchDistance && hasMore && !isLoadingMore && !isLoading) {
        loadMore();
      }
    },
    [prefetchDistance, hasMore, isLoadingMore, isLoading, loadMore]
  );

  return {
    data,
    isLoading,
    isLoadingMore,
    isError,
    error,
    hasMore,
    loadMore,
    refresh,
    reset,
    handleScroll, // Expose for manual scroll handling
  };
}

