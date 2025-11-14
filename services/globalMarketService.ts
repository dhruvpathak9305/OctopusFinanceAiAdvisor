/**
 * Global Market Service
 * Unified service for Indian and Global stock market data
 */

interface GlobalQuote {
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  marketCap?: number;
  timestamp: string;
  currency: string;
}

export class GlobalMarketService {
  // API Configuration
  private static ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';
  private static FINNHUB_KEY = process.env.FINNHUB_API_KEY || '';

  /**
   * Get NSE India Real-time Quote (Free, No API Key)
   */
  static async getNSEQuote(symbol: string): Promise<GlobalQuote> {
    try {
      const headers = {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      };

      const url = `https://www.nseindia.com/api/quote-equity?symbol=${symbol}`;
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`NSE API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Ultra-safe: Check if data and priceInfo exist
      if (!data || typeof data !== 'object') {
        console.warn(`Invalid NSE response for ${symbol}`);
        throw new Error('Invalid NSE API response');
      }

      const priceInfo = data.priceInfo || {};

      // Provide safe defaults if priceInfo is missing
      const lastPrice = priceInfo?.lastPrice ?? 0;
      const change = priceInfo?.change ?? 0;
      const changePercent = priceInfo?.pChange ?? 0;
      const previousClose = priceInfo?.previousClose ?? lastPrice;
      const open = priceInfo?.open ?? lastPrice;
      const high = priceInfo?.intraDayHighLow?.max ?? lastPrice;
      const low = priceInfo?.intraDayHighLow?.min ?? lastPrice;

      return {
        symbol: symbol,
        name: data.info?.companyName || symbol,
        exchange: 'NSE',
        price: lastPrice,
        change: change,
        changePercent: changePercent,
        volume: data.preOpenMarket?.totalTradedVolume || 0,
        previousClose: previousClose,
        open: open,
        high: high,
        low: low,
        timestamp: new Date().toISOString(),
        currency: 'INR',
      };
    } catch (error) {
      console.error('Error fetching NSE quote:', error);
      throw error;
    }
  }

  /**
   * Get BSE India Quote (via Yahoo Finance)
   */
  static async getBSEQuote(symbol: string): Promise<GlobalQuote> {
    try {
      const yahooSymbol = `${symbol}.BO`;
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`;
      
      const response = await fetch(url);
      const data = await response.json();

      // Safely access nested properties with defaults
      const result = data.chart?.result?.[0] || {};
      const meta = result.meta || {};
      const quote = result.indicators?.quote?.[0] || {};

      const price = meta.regularMarketPrice ?? 0;
      const previousClose = meta.chartPreviousClose ?? price;
      const change = price - previousClose;
      const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

      return {
        symbol: symbol,
        name: meta.longName || symbol,
        exchange: 'BSE',
        price: price,
        change: change,
        changePercent: changePercent,
        volume: meta.regularMarketVolume ?? 0,
        previousClose: previousClose,
        open: quote.open?.[0] ?? price,
        high: quote.high?.[0] ?? price,
        low: quote.low?.[0] ?? price,
        marketCap: meta.marketCap,
        timestamp: meta.regularMarketTime 
          ? new Date(meta.regularMarketTime * 1000).toISOString()
          : new Date().toISOString(),
        currency: 'INR',
      };
    } catch (error) {
      console.error('Error fetching BSE quote:', error);
      throw error;
    }
  }

  /**
   * Get US Stock Quote (Finnhub - Free)
   */
  static async getUSQuote(symbol: string): Promise<GlobalQuote> {
    if (!this.FINNHUB_KEY) {
      console.warn('Finnhub API key not set, falling back to Yahoo Finance');
      return this.getYahooQuote(symbol, 'US');
    }

    try {
      const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${this.FINNHUB_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      // Get company profile for name
      const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${this.FINNHUB_KEY}`;
      const profileResponse = await fetch(profileUrl);
      const profile = await profileResponse.json();

      // Safely access properties with defaults
      const price = data.c ?? 0;
      const change = data.d ?? 0;
      const changePercent = data.dp ?? 0;
      const previousClose = data.pc ?? price;
      
      return {
        symbol: symbol,
        name: profile?.name || symbol,
        exchange: profile?.exchange || 'US',
        price: price,
        change: change,
        changePercent: changePercent,
        volume: 0, // Not provided in quote endpoint
        previousClose: previousClose,
        open: data.o ?? price,
        high: data.h ?? price,
        low: data.l ?? price,
        marketCap: profile?.marketCapitalization
          ? profile.marketCapitalization * 1000000
          : undefined,
        timestamp: data.t ? new Date(data.t * 1000).toISOString() : new Date().toISOString(),
        currency: 'USD',
      };
    } catch (error) {
      console.error('Error fetching US quote from Finnhub:', error);
      // Fallback to Yahoo Finance
      return this.getYahooQuote(symbol, 'US');
    }
  }

  /**
   * Get Global Quote (Alpha Vantage - Free)
   */
  static async getAlphaVantageQuote(symbol: string): Promise<GlobalQuote> {
    if (!this.ALPHA_VANTAGE_KEY) {
      console.warn('Alpha Vantage API key not set');
      throw new Error('Alpha Vantage API key required');
    }

    try {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.ALPHA_VANTAGE_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      const quote = data['Global Quote'];

      if (!quote) {
        throw new Error('Invalid response from Alpha Vantage');
      }

      return {
        symbol: quote['01. symbol'],
        name: quote['01. symbol'],
        exchange: 'GLOBAL',
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        previousClose: parseFloat(quote['08. previous close']),
        open: parseFloat(quote['02. open']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        timestamp: quote['07. latest trading day'],
        currency: 'USD',
      };
    } catch (error) {
      console.error('Error fetching Alpha Vantage quote:', error);
      throw error;
    }
  }

  /**
   * Get Yahoo Finance Quote (Fallback - Free, No API Key)
   */
  static async getYahooQuote(
    symbol: string,
    market: 'US' | 'IN' | 'UK' | 'JP' | 'HK' = 'US'
  ): Promise<GlobalQuote> {
    try {
      // Add appropriate suffix based on market
      const suffixMap = {
        US: '', // No suffix for US
        IN: '.NS', // NSE India
        UK: '.L', // London
        JP: '.T', // Tokyo
        HK: '.HK', // Hong Kong
      };

      const yahooSymbol = symbol + (suffixMap[market] || '');
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`;

      const response = await fetch(url);
      const data = await response.json();

      // Safely access nested properties with defaults
      const result = data.chart?.result?.[0] || {};
      const meta = result.meta || {};
      const quote = result.indicators?.quote?.[0] || {};

      const price = meta.regularMarketPrice ?? 0;
      const previousClose = meta.chartPreviousClose ?? price;
      const change = price - previousClose;
      const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

      return {
        symbol: symbol,
        name: meta.longName || meta.symbol || symbol,
        exchange: meta.exchangeName || market,
        price: price,
        change: change,
        changePercent: changePercent,
        volume: meta.regularMarketVolume ?? 0,
        previousClose: previousClose,
        open: quote.open?.[0] ?? price,
        high: quote.high?.[0] ?? price,
        low: quote.low?.[0] ?? price,
        marketCap: meta.marketCap,
        timestamp: meta.regularMarketTime 
          ? new Date(meta.regularMarketTime * 1000).toISOString()
          : new Date().toISOString(),
        currency: meta.currency || 'USD',
      };
    } catch (error) {
      console.error('Error fetching Yahoo quote:', error);
      throw error;
    }
  }

  /**
   * Unified Quote Fetcher - Automatically selects best API
   */
  static async getQuote(
    symbol: string,
    market: 'NSE' | 'BSE' | 'US' | 'GLOBAL' = 'NSE'
  ): Promise<GlobalQuote> {
    try {
      switch (market) {
        case 'NSE':
          return await this.getNSEQuote(symbol);

        case 'BSE':
          return await this.getBSEQuote(symbol);

        case 'US':
          return await this.getUSQuote(symbol);

        case 'GLOBAL':
          if (this.ALPHA_VANTAGE_KEY) {
            return await this.getAlphaVantageQuote(symbol);
          } else {
            return await this.getYahooQuote(symbol, 'US');
          }

        default:
          return await this.getNSEQuote(symbol);
      }
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Get multiple quotes in batch
   */
  static async getMultipleQuotes(
    symbols: Array<{ symbol: string; market: 'NSE' | 'BSE' | 'US' | 'GLOBAL' }>
  ): Promise<GlobalQuote[]> {
    const quotes = await Promise.allSettled(
      symbols.map(({ symbol, market }) => this.getQuote(symbol, market))
    );

    return quotes
      .filter(
        (result): result is PromiseFulfilledResult<GlobalQuote> =>
          result.status === 'fulfilled'
      )
      .map(result => result.value);
  }

  /**
   * Search stocks across markets
   */
  static async searchStocks(
    query: string,
    market: 'IN' | 'US' | 'GLOBAL' = 'IN'
  ): Promise<any[]> {
    try {
      // Use Yahoo Finance search (free, no API key)
      const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=20&newsCount=0`;
      const response = await fetch(url);
      const data = await response.json();

      console.log(`🔍 Search API results for "${query}":`, data.quotes?.length || 0);

      if (market === 'IN') {
        // Log all exchanges to debug
        if (data.quotes && data.quotes.length > 0) {
          console.log(`📊 Sample exchanges found:`, data.quotes.slice(0, 3).map((q: any) => ({
            symbol: q.symbol,
            exchange: q.exchange,
            name: q.shortname || q.longname
          })));
        }

        // Filter for Indian stocks - More flexible filtering
        const indianResults = (data.quotes || []).filter(
          (quote: any) => {
            const exchange = quote.exchange || '';
            const symbol = quote.symbol || '';
            const quoteType = quote.quoteType || '';
            
            // Check for Indian exchanges or symbols ending with .NS/.BO
            const isIndian = exchange === 'NSI' || 
                   exchange === 'BOM' || 
                   exchange === 'NSE' ||
                   exchange === 'BSE' ||
                   symbol.endsWith('.NS') || 
                   symbol.endsWith('.BO') ||
                   (exchange === 'IND' && quoteType === 'EQUITY'); // Yahoo sometimes uses 'IND'
            
            if (isIndian) {
              console.log(`✅ Indian stock matched: ${symbol} (${exchange})`);
            }
            
            return isIndian;
          }
        );
        console.log(`🇮🇳 Indian stocks found: ${indianResults.length}`);
        return indianResults;
      } else if (market === 'US') {
        // Filter for US stocks
        const usResults = (data.quotes || []).filter(
          (quote: any) =>
            quote.exchange === 'NMS' ||
            quote.exchange === 'NYQ' ||
            quote.exchange === 'PCX' ||
            quote.exchange === 'NASDAQ' ||
            quote.exchange === 'NYSE'
        );
        console.log(`🇺🇸 US stocks found: ${usResults.length}`);
        return usResults;
      } else {
        // Return all results
        console.log(`🌍 Global stocks found: ${(data.quotes || []).length}`);
        return data.quotes || [];
      }
    } catch (error) {
      console.error('Error searching stocks:', error);
      return [];
    }
  }

  /**
   * Format currency based on market
   */
  static formatPrice(price: number, currency: string): string {
    if (currency === 'INR') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
      }).format(price);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        maximumFractionDigits: 2,
      }).format(price);
    }
  }
}

