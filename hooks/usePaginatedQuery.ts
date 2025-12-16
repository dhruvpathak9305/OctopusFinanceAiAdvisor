/**
 * =============================================================================
 * USE PAGINATED QUERY - React Hook for Paginated Data Fetching
 * =============================================================================
 * 
 * React hook for fetching paginated data with automatic page loading,
 * loading states, error handling, and cache management integration.
 */

import { useState, useEffect, useCallback } from 'react';
import { PaginationResult } from '../services/repositories/baseRepository';

export interface UsePaginatedQueryOptions<T> {
  fetchPage: (page: number, pageSize: number) => Promise<PaginationResult<T>>;
  pageSize?: number;
  initialPage?: number;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export interface UsePaginatedQueryResult<T> {
  data: T[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  currentPage: number;
  totalPages: number;
  total: number;
  hasMore: boolean;
  goToPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook for paginated data fetching
 */
export function usePaginatedQuery<T>(
  options: UsePaginatedQueryOptions<T>
): UsePaginatedQueryResult<T> {
  const {
    fetchPage,
    pageSize = 50,
    initialPage = 1,
    enabled = true,
    onError,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const loadPage = useCallback(
    async (page: number) => {
      if (!enabled) {
        return;
      }

      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const result = await fetchPage(page, pageSize);
        setData(result.data);
        setCurrentPage(result.page);
        setTotalPages(result.totalPages);
        setTotal(result.total);
        setHasMore(result.hasMore);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setIsError(true);
        setError(error);
        if (onError) {
          onError(error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [fetchPage, pageSize, enabled, onError]
  );

  useEffect(() => {
    if (enabled) {
      loadPage(initialPage);
    }
  }, [initialPage, enabled, loadPage]); // Include loadPage but it's memoized with fetchPage

  const goToPage = useCallback(
    async (page: number) => {
      if (page < 1 || page > totalPages) {
        return;
      }
      await loadPage(page);
    },
    [loadPage, totalPages]
  );

  const nextPage = useCallback(async () => {
    if (hasMore && currentPage < totalPages) {
      await goToPage(currentPage + 1);
    }
  }, [hasMore, currentPage, totalPages, goToPage]);

  const previousPage = useCallback(async () => {
    if (currentPage > 1) {
      await goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  const refresh = useCallback(async () => {
    await loadPage(currentPage);
  }, [loadPage, currentPage]);

  return {
    data,
    isLoading,
    isError,
    error,
    currentPage,
    totalPages,
    total,
    hasMore,
    goToPage,
    nextPage,
    previousPage,
    refresh,
  };
}

