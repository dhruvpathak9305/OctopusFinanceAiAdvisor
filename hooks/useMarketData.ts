/**
 * useMarketData Hook
 * Manages real-time market data and updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { StockMarketService } from '../services/stockMarketService';
import type { StockQuote, MarketStatus } from '../types/portfolio-extended';

export interface UseMarketDataReturn {
  quotes: StockQuote[];
  marketStatus: MarketStatus | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useMarketData = (symbols: string[], enabled: boolean = true): UseMarketDataReturn => {
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to track if initial fetch is done
  const initialFetchDone = useRef(false);
  
  // Serialize symbols to avoid array reference changes
  const symbolsKey = symbols.join(',');

  // Fetch quotes
  const fetchQuotes = useCallback(async () => {
    if (!enabled || symbols.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await StockMarketService.getMultipleQuotes(symbols);
      setQuotes(data);
    } catch (err) {
      console.error('Error fetching quotes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch quotes');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolsKey, enabled]); // Use symbolsKey instead of symbols array

  // Fetch market status
  const fetchMarketStatus = useCallback(async () => {
    try {
      const status = await StockMarketService.getMarketStatus();
      setMarketStatus(status);
    } catch (err) {
      console.error('Error fetching market status:', err);
    }
  }, []);

  // Refresh all data
  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchQuotes(), fetchMarketStatus()]);
  }, [fetchQuotes, fetchMarketStatus]);

  // Initial fetch - only run once
  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchQuotes();
      fetchMarketStatus();
      initialFetchDone.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - run only once

  // Auto-refresh during market hours (every 30 seconds)
  useEffect(() => {
    if (!enabled || !marketStatus?.isOpen) return;

    const interval = setInterval(() => {
      fetchQuotes();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [enabled, marketStatus?.isOpen, fetchQuotes]);

  return {
    quotes,
    marketStatus,
    loading,
    error,
    refresh,
  };
};

