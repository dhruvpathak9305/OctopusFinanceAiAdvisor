/**
 * Stock Market Service
 * Integrates with Yahoo Finance, NSE, and other APIs for real-time market data
 */

import { supabase } from '../lib/supabase/client';
import type {
  StockQuote,
  Stock,
  HistoricalData,
  MarketStatus,
  ChartPeriod,
} from '../types/portfolio-extended';

export class StockMarketService {
  private static YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance';
  private static NSE_BASE = 'https://www.nseindia.com/api';

  private static NSE_HEADERS = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    Accept: 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
  };

  // =====================================================
  // STOCK QUOTE OPERATIONS
  // =====================================================

  /**
   * Get real-time stock quote (Yahoo Finance)
   */
  static async getStockQuote(
    symbol: string,
    exchange: 'NSE' | 'BSE' = 'NSE'
  ): Promise<StockQuote> {
    try {
      const suffix = exchange === 'NSE' ? '.NS' : '.BO';
      const yahooSymbol = `${symbol}${suffix}`;

      const url = `${this.YAHOO_BASE}/chart/${yahooSymbol}?interval=1d&range=1d`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.chart?.result?.[0]) {
        throw new Error('Invalid response from Yahoo Finance');
      }

      const result = data.chart.result[0];
      const meta = result.meta;
      const quote = result.indicators.quote[0];

      return {
        symbol: symbol,
        name: meta.longName || symbol,
        price: meta.regularMarketPrice,
        change: meta.regularMarketPrice - meta.chartPreviousClose,
        changePercent:
          ((meta.regularMarketPrice - meta.chartPreviousClose) /
            meta.chartPreviousClose) *
          100,
        volume: meta.regularMarketVolume,
        previousClose: meta.chartPreviousClose,
        open: quote.open?.[0] || meta.regularMarketPrice,
        high: quote.high?.[0] || meta.regularMarketPrice,
        low: quote.low?.[0] || meta.regularMarketPrice,
        marketCap: meta.marketCap,
        timestamp: new Date(meta.regularMarketTime * 1000).toISOString(),
      };
    } catch (error) {
      console.error(`Error fetching stock quote for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Get multiple stock quotes in batch
   */
  static async getMultipleQuotes(
    symbols: string[],
    exchange: 'NSE' | 'BSE' = 'NSE'
  ): Promise<StockQuote[]> {
    const quotes = await Promise.allSettled(
      symbols.map(symbol => this.getStockQuote(symbol, exchange))
    );

    return quotes
      .filter(
        (result): result is PromiseFulfilledResult<StockQuote> =>
          result.status === 'fulfilled'
      )
      .map(result => result.value);
  }

  /**
   * Search stocks by name or symbol
   */
  static async searchStocks(query: string): Promise<Stock[]> {
    try {
      const url = `${this.YAHOO_BASE}/search?q=${encodeURIComponent(query)}&quotesCount=20&newsCount=0`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Filter for Indian stocks only (NSE/BSE)
      const indianStocks = (data.quotes || []).filter(
        (quote: any) => quote.exchange === 'NSI' || quote.exchange === 'BOM'
      );

      return indianStocks.map((quote: any) => ({
        id: quote.symbol,
        symbol: quote.symbol.replace('.NS', '').replace('.BO', ''),
        name: quote.longname || quote.shortname || quote.symbol,
        exchange: quote.exchange === 'NSI' ? 'NSE' : 'BSE',
        sector: quote.sector,
        industry: quote.industry,
        market_cap: quote.marketCap,
        current_price: quote.regularMarketPrice,
        created_at: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error searching stocks:', error);
      return [];
    }
  }

  /**
   * Get historical data for charts
   */
  static async getHistoricalData(
    symbol: string,
    period: ChartPeriod = '1M',
    exchange: 'NSE' | 'BSE' = 'NSE'
  ): Promise<HistoricalData[]> {
    try {
      const suffix = exchange === 'NSE' ? '.NS' : '.BO';
      const yahooSymbol = `${symbol}${suffix}`;

      const rangeMap: Record<ChartPeriod, string> = {
        '1D': '1d',
        '5D': '5d',
        '1M': '1mo',
        '3M': '3mo',
        '6M': '6mo',
        '1Y': '1y',
        '3Y': '3y',
        '5Y': '5y',
        ALL: '10y',
      };

      const url = `${this.YAHOO_BASE}/chart/${yahooSymbol}?interval=1d&range=${rangeMap[period]}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const result = data.chart.result[0];
      const timestamps = result.timestamp;
      const quotes = result.indicators.quote[0];

      return timestamps.map((timestamp: number, index: number) => ({
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        open: quotes.open[index] || 0,
        high: quotes.high[index] || 0,
        low: quotes.low[index] || 0,
        close: quotes.close[index] || 0,
        volume: quotes.volume[index] || 0,
      }));
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return [];
    }
  }

  // =====================================================
  // MARKET STATUS
  // =====================================================

  /**
   * Get market status (NSE)
   */
  static async getMarketStatus(): Promise<MarketStatus> {
    try {
      // Check if current time is within market hours (9:15 AM - 3:30 PM IST)
      const now = new Date();
      const istTime = new Date(
        now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      );

      const hours = istTime.getHours();
      const minutes = istTime.getMinutes();
      const day = istTime.getDay();

      // Check if it's a weekend
      if (day === 0 || day === 6) {
        return {
          isOpen: false,
          message: 'Market Closed (Weekend)',
        };
      }

      // Check if within market hours
      const marketStartMinutes = 9 * 60 + 15; // 9:15 AM
      const marketEndMinutes = 15 * 60 + 30; // 3:30 PM
      const currentMinutes = hours * 60 + minutes;

      if (
        currentMinutes >= marketStartMinutes &&
        currentMinutes <= marketEndMinutes
      ) {
        return {
          isOpen: true,
          message: 'Market Open',
        };
      } else if (currentMinutes < marketStartMinutes) {
        return {
          isOpen: false,
          message: 'Market Opens at 9:15 AM IST',
        };
      } else {
        return {
          isOpen: false,
          message: 'Market Closed',
        };
      }
    } catch (error) {
      console.error('Error fetching market status:', error);
      return {
        isOpen: false,
        message: 'Unable to fetch market status',
      };
    }
  }

  // =====================================================
  // DATABASE OPERATIONS
  // =====================================================

  /**
   * Update cached stock prices in database
   */
  static async updateCachedPrices(symbols: string[]): Promise<void> {
    try {
      const quotes = await this.getMultipleQuotes(symbols);

      for (const quote of quotes) {
        await supabase
          .from('stocks')
          .upsert(
            {
              symbol: quote.symbol,
              name: quote.name,
              exchange: 'NSE',
              current_price: quote.price,
              change_percent: quote.changePercent,
              volume: quote.volume,
              market_cap: quote.marketCap,
              last_updated: quote.timestamp,
            },
            {
              onConflict: 'symbol',
            }
          );
      }

      console.log(`Updated ${quotes.length} stock prices in database`);
    } catch (error) {
      console.error('Error updating cached prices:', error);
      throw error;
    }
  }

  /**
   * Get stock from database (cached)
   */
  static async getStockFromDB(symbol: string): Promise<Stock | null> {
    try {
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .eq('symbol', symbol)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching stock from database:', error);
      return null;
    }
  }

  /**
   * Search stocks in database
   */
  static async searchStocksInDB(query: string): Promise<Stock[]> {
    try {
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .or(`symbol.ilike.%${query}%,name.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching stocks in database:', error);
      return [];
    }
  }

  // =====================================================
  // PORTFOLIO INTEGRATION
  // =====================================================

  /**
   * Update prices for all holdings in a portfolio
   */
  static async updateHoldingsPrices(holdingIds: string[]): Promise<void> {
    try {
      // Get all holdings
      const { data: holdings, error } = await supabase
        .from('holdings')
        .select('id, symbol, asset_type')
        .in('id', holdingIds)
        .eq('asset_type', 'stock');

      if (error) throw error;

      if (!holdings || holdings.length === 0) return;

      // Get unique symbols
      const symbols = [...new Set(holdings.map(h => h.symbol))];

      // Fetch current prices
      const quotes = await this.getMultipleQuotes(symbols);

      // Create a map of symbol to price
      const priceMap = new Map<string, number>();
      quotes.forEach(quote => {
        priceMap.set(quote.symbol, quote.price);
      });

      // Update each holding
      for (const holding of holdings) {
        const currentPrice = priceMap.get(holding.symbol);
        if (currentPrice) {
          await supabase
            .from('holdings')
            .update({ current_price: currentPrice })
            .eq('id', holding.id);
        }
      }

      console.log(`Updated prices for ${holdings.length} holdings`);
    } catch (error) {
      console.error('Error updating holdings prices:', error);
      throw error;
    }
  }

  // =====================================================
  // UTILITIES
  // =====================================================

  /**
   * Format currency in Indian Rupees
   */
  static formatINR(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format percentage
   */
  static formatPercent(value: number, decimals: number = 2): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
  }

  /**
   * Get color for change value
   */
  static getChangeColor(value: number): string {
    if (value > 0) return '#10B981'; // Green
    if (value < 0) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  }
}

