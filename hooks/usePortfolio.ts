/**
 * usePortfolio Hook
 * Manages portfolio data, holdings, and analytics
 */

import { useState, useEffect, useCallback } from 'react';
import { PortfolioService } from '../services/portfolioService';
import { StockMarketService } from '../services/stockMarketService';
import { MutualFundService } from '../services/mutualFundService';
import type {
  Portfolio,
  PortfolioSummary,
  HoldingWithPrice,
  AddPortfolioInput,
  AddHoldingInput,
  AssetAllocationItem,
  SectorAllocationItem,
  TopPerformer,
} from '../types/portfolio-extended';

export interface UsePortfolioReturn {
  // Data
  portfolios: Portfolio[];
  currentPortfolio: Portfolio | null;
  summary: PortfolioSummary | null;
  holdings: HoldingWithPrice[];
  assetAllocation: AssetAllocationItem[];
  sectorAllocation: SectorAllocationItem[];
  topPerformers: TopPerformer[];
  
  // Loading states
  loading: boolean;
  refreshing: boolean;
  
  // Error
  error: string | null;
  
  // Actions
  fetchPortfolios: () => Promise<void>;
  selectPortfolio: (portfolioId: string) => Promise<void>;
  createPortfolio: (input: AddPortfolioInput) => Promise<Portfolio | null>;
  addHolding: (input: AddHoldingInput) => Promise<void>;
  refreshPrices: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export const usePortfolio = (): UsePortfolioReturn => {
  // State
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [currentPortfolio, setCurrentPortfolio] = useState<Portfolio | null>(null);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [holdings, setHoldings] = useState<HoldingWithPrice[]>([]);
  const [assetAllocation, setAssetAllocation] = useState<AssetAllocationItem[]>([]);
  const [sectorAllocation, setSectorAllocation] = useState<SectorAllocationItem[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all portfolios
  const fetchPortfolios = useCallback(async () => {
    try {
      setError(null);
      const data = await PortfolioService.getUserPortfolios();
      setPortfolios(data);

      // Auto-select first portfolio if none selected
      if (data.length > 0 && !currentPortfolio) {
        await selectPortfolio(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching portfolios:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolios');
    } finally {
      setLoading(false);
    }
  }, [currentPortfolio]);

  // Select a portfolio
  const selectPortfolio = useCallback(async (portfolioId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Get portfolio
      const portfolio = await PortfolioService.getPortfolio(portfolioId);
      setCurrentPortfolio(portfolio);

      if (!portfolio) return;

      // Fetch portfolio data in parallel
      const [summaryData, holdingsData, assetAllocData, sectorAllocData, topPerformersData] = await Promise.all([
        PortfolioService.getPortfolioSummary(portfolioId),
        PortfolioService.getHoldings(portfolioId),
        PortfolioService.getAssetAllocation(portfolioId),
        PortfolioService.getSectorAllocation(portfolioId),
        PortfolioService.getTopPerformers(portfolioId),
      ]);

      setSummary(summaryData);
      setHoldings(holdingsData);
      setAssetAllocation(assetAllocData);
      setSectorAllocation(sectorAllocData);
      setTopPerformers(topPerformersData);
    } catch (err) {
      console.error('Error selecting portfolio:', err);
      setError(err instanceof Error ? err.message : 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new portfolio
  const createPortfolio = useCallback(async (input: AddPortfolioInput): Promise<Portfolio | null> => {
    try {
      setError(null);
      const newPortfolio = await PortfolioService.createPortfolio(input);
      
      // Refresh portfolios list
      await fetchPortfolios();
      
      // Auto-select new portfolio
      await selectPortfolio(newPortfolio.id);
      
      return newPortfolio;
    } catch (err) {
      console.error('Error creating portfolio:', err);
      setError(err instanceof Error ? err.message : 'Failed to create portfolio');
      return null;
    }
  }, [fetchPortfolios, selectPortfolio]);

  // Add holding to current portfolio
  const addHolding = useCallback(async (input: AddHoldingInput) => {
    try {
      if (!currentPortfolio) {
        throw new Error('No portfolio selected');
      }

      setError(null);
      await PortfolioService.addHolding(input);
      
      // Refresh portfolio data
      await selectPortfolio(currentPortfolio.id);
    } catch (err) {
      console.error('Error adding holding:', err);
      setError(err instanceof Error ? err.message : 'Failed to add holding');
    }
  }, [currentPortfolio, selectPortfolio]);

  // Refresh prices for all holdings
  const refreshPrices = useCallback(async () => {
    try {
      if (!currentPortfolio || holdings.length === 0) return;

      setRefreshing(true);

      // Separate stock and mutual fund holdings
      const stockHoldings = holdings.filter(h => h.asset_type === 'stock');
      const mfHoldings = holdings.filter(h => h.asset_type === 'mutual_fund');

      // Update stock prices
      if (stockHoldings.length > 0) {
        await StockMarketService.updateHoldingsPrices(stockHoldings.map(h => h.id));
      }

      // Update mutual fund NAVs
      if (mfHoldings.length > 0) {
        await MutualFundService.updateMutualFundHoldingsPrices(mfHoldings.map(h => h.id));
      }

      // Refresh portfolio data
      await selectPortfolio(currentPortfolio.id);
    } catch (err) {
      console.error('Error refreshing prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh prices');
    } finally {
      setRefreshing(false);
    }
  }, [currentPortfolio, holdings, selectPortfolio]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    if (currentPortfolio) {
      await selectPortfolio(currentPortfolio.id);
    } else {
      await fetchPortfolios();
    }
  }, [currentPortfolio, fetchPortfolios, selectPortfolio]);

  // Initial load
  useEffect(() => {
    fetchPortfolios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return {
    // Data
    portfolios,
    currentPortfolio,
    summary,
    holdings,
    assetAllocation,
    sectorAllocation,
    topPerformers,
    
    // Loading states
    loading,
    refreshing,
    
    // Error
    error,
    
    // Actions
    fetchPortfolios,
    selectPortfolio,
    createPortfolio,
    addHolding,
    refreshPrices,
    refreshData,
  };
};

