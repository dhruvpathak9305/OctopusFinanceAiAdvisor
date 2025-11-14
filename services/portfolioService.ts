/**
 * Portfolio Service
 * Handles all portfolio CRUD operations and analytics
 */

import { supabase } from '../lib/supabase/client';
import type {
  Portfolio,
  PortfolioSummary,
  Holding,
  HoldingWithPrice,
  Transaction,
  TransactionInput,
  AddPortfolioInput,
  AddHoldingInput,
  AssetAllocationItem,
  SectorAllocationItem,
  TopPerformer,
  PortfolioPerformance,
  PortfolioAnalytics,
} from '../types/portfolio-extended';

export class PortfolioService {
  // =====================================================
  // PORTFOLIO CRUD OPERATIONS
  // =====================================================

  /**
   * Get all portfolios for a user
   */
  static async getUserPortfolios(userId?: string): Promise<Portfolio[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      throw error;
    }
  }

  /**
   * Get a single portfolio by ID
   */
  static async getPortfolio(portfolioId: string): Promise<Portfolio | null> {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', portfolioId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      return null;
    }
  }

  /**
   * Create a new portfolio
   */
  static async createPortfolio(input: AddPortfolioInput): Promise<Portfolio> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('portfolios')
        .insert({
          user_id: user.id,
          name: input.name,
          description: input.description,
          portfolio_type: input.portfolio_type,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating portfolio:', error);
      throw error;
    }
  }

  /**
   * Update portfolio
   */
  static async updatePortfolio(
    portfolioId: string,
    updates: Partial<AddPortfolioInput>
  ): Promise<Portfolio> {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .update(updates)
        .eq('id', portfolioId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating portfolio:', error);
      throw error;
    }
  }

  /**
   * Delete portfolio (soft delete)
   */
  static async deletePortfolio(portfolioId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('portfolios')
        .update({ is_active: false })
        .eq('id', portfolioId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      throw error;
    }
  }

  // =====================================================
  // PORTFOLIO SUMMARY & ANALYTICS
  // =====================================================

  /**
   * Get portfolio summary with all metrics
   */
  static async getPortfolioSummary(portfolioId: string): Promise<PortfolioSummary | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_portfolio_summary', { p_portfolio_id: portfolioId });

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error fetching portfolio summary:', error);
      return null;
    }
  }

  /**
   * Get complete portfolio analytics
   */
  static async getPortfolioAnalytics(portfolioId: string): Promise<PortfolioAnalytics | null> {
    try {
      const [summary, assetAllocation, sectorAllocation, topPerformers, performanceHistory] = await Promise.all([
        this.getPortfolioSummary(portfolioId),
        this.getAssetAllocation(portfolioId),
        this.getSectorAllocation(portfolioId),
        this.getTopPerformers(portfolioId),
        this.getPerformanceHistory(portfolioId, 30),
      ]);

      if (!summary) return null;

      return {
        summary,
        asset_allocation: assetAllocation,
        sector_allocation: sectorAllocation,
        top_performers: topPerformers,
        performance_history: {
          portfolio: performanceHistory.map(p => ({
            date: p.snapshot_date,
            value: p.current_value,
          })),
        },
        metrics: {
          returns_today: 0, // TODO: Calculate from performance history
          returns_today_pct: 0,
          returns_week: 0,
          returns_week_pct: 0,
          returns_month: 0,
          returns_month_pct: 0,
          returns_year: 0,
          returns_year_pct: 0,
        },
      };
    } catch (error) {
      console.error('Error fetching portfolio analytics:', error);
      return null;
    }
  }

  /**
   * Get asset allocation breakdown
   */
  static async getAssetAllocation(portfolioId: string): Promise<AssetAllocationItem[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_asset_allocation', { p_portfolio_id: portfolioId });

      if (error) throw error;
      
      // Add colors for each asset type
      const colors = {
        stock: '#3B82F6', // Blue
        mutual_fund: '#10B981', // Green
        etf: '#14B8A6', // Teal
        bond: '#F59E0B', // Amber
        gold: '#FBBF24', // Gold
      };

      return (data || []).map((item: AssetAllocationItem) => ({
        ...item,
        color: colors[item.asset_type as keyof typeof colors] || '#6B7280',
      }));
    } catch (error) {
      console.error('Error fetching asset allocation:', error);
      return [];
    }
  }

  /**
   * Get sector allocation (for stocks)
   */
  static async getSectorAllocation(portfolioId: string): Promise<SectorAllocationItem[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_sector_allocation', { p_portfolio_id: portfolioId });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sector allocation:', error);
      return [];
    }
  }

  /**
   * Get top performers
   */
  static async getTopPerformers(portfolioId: string, limit: number = 5): Promise<TopPerformer[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_top_performers', {
          p_portfolio_id: portfolioId,
          p_limit: limit,
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching top performers:', error);
      return [];
    }
  }

  /**
   * Get portfolio performance history
   */
  static async getPerformanceHistory(
    portfolioId: string,
    days: number = 30
  ): Promise<PortfolioPerformance[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_portfolio_performance_history', {
          p_portfolio_id: portfolioId,
          p_days: days,
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching performance history:', error);
      return [];
    }
  }

  // =====================================================
  // HOLDINGS OPERATIONS
  // =====================================================

  /**
   * Get all holdings for a portfolio
   */
  static async getHoldings(portfolioId: string): Promise<HoldingWithPrice[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_holdings_with_prices', { p_portfolio_id: portfolioId });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching holdings:', error);
      return [];
    }
  }

  /**
   * Get a single holding
   */
  static async getHolding(holdingId: string): Promise<Holding | null> {
    try {
      const { data, error } = await supabase
        .from('holdings')
        .select('*')
        .eq('id', holdingId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching holding:', error);
      return null;
    }
  }

  /**
   * Add a new holding
   */
  static async addHolding(input: AddHoldingInput): Promise<Holding> {
    try {
      // First create the holding
      const { data: holding, error: holdingError } = await supabase
        .from('holdings')
        .insert({
          portfolio_id: input.portfolio_id,
          asset_type: input.asset_type,
          symbol: input.symbol,
          asset_name: input.asset_name,
          quantity: input.quantity,
          avg_purchase_price: input.avg_purchase_price,
          current_price: input.avg_purchase_price, // Initial price
          first_purchase_date: input.transaction_date,
          last_transaction_date: input.transaction_date,
          notes: input.notes,
        })
        .select()
        .single();

      if (holdingError) throw holdingError;

      // Create initial buy transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          holding_id: holding.id,
          transaction_type: 'buy',
          quantity: input.quantity,
          price_per_unit: input.avg_purchase_price,
          total_amount: input.quantity * input.avg_purchase_price,
          transaction_date: input.transaction_date,
        });

      if (transactionError) throw transactionError;

      return holding;
    } catch (error) {
      console.error('Error adding holding:', error);
      throw error;
    }
  }

  /**
   * Update holding current price
   */
  static async updateHoldingPrice(holdingId: string, currentPrice: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('holdings')
        .update({ current_price: currentPrice })
        .eq('id', holdingId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating holding price:', error);
      throw error;
    }
  }

  /**
   * Delete holding (soft delete)
   */
  static async deleteHolding(holdingId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('holdings')
        .update({ is_active: false })
        .eq('id', holdingId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting holding:', error);
      throw error;
    }
  }

  // =====================================================
  // TRANSACTION OPERATIONS
  // =====================================================

  /**
   * Get all transactions for a holding
   */
  static async getTransactions(holdingId: string): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('holding_id', holdingId)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  /**
   * Add a transaction (buy, sell, dividend, etc.)
   */
  static async addTransaction(input: TransactionInput): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          holding_id: input.holding_id,
          transaction_type: input.transaction_type,
          quantity: input.quantity,
          price_per_unit: input.price_per_unit,
          total_amount: input.total_amount,
          fees: input.fees || 0,
          tax: input.tax || 0,
          transaction_date: input.transaction_date,
          notes: input.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  // =====================================================
  // SNAPSHOT & UPDATES
  // =====================================================

  /**
   * Create daily portfolio snapshot
   */
  static async createSnapshot(portfolioId: string): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('create_portfolio_snapshot', { p_portfolio_id: portfolioId });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating snapshot:', error);
      throw error;
    }
  }

  /**
   * Update all holdings prices for a portfolio
   */
  static async updatePortfolioPrices(portfolioId: string): Promise<void> {
    try {
      // This will be implemented with market data service
      // Get all holdings, fetch current prices, update each holding
      const holdings = await this.getHoldings(portfolioId);
      
      // TODO: Integrate with StockMarketService to fetch current prices
      console.log(`Need to update prices for ${holdings.length} holdings`);
    } catch (error) {
      console.error('Error updating portfolio prices:', error);
      throw error;
    }
  }
}

