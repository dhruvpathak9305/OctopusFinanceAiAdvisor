# 🔌 Portfolio API Integration Guide

**Complete guide to integrating market data APIs for real-time stock, mutual fund, and IPO data**

---

## 🎯 Overview

This guide covers integration with free and paid APIs for Indian market data:
- Stock prices (NSE/BSE)
- Mutual fund NAVs (AMFI)
- IPO data
- Market indices

---

## 📊 Available APIs

### 1. Yahoo Finance (Free) ⭐ Recommended for Stocks

**Pros**: Free, reliable, good coverage
**Cons**: Delayed data (15-20 min for Indian stocks)
**Rate Limit**: No official limit

```typescript
// Base URL
const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance';

// Stock symbols format
// NSE: SYMBOL.NS (e.g., RELIANCE.NS)
// BSE: SYMBOL.BO (e.g., RELIANCE.BO)

// Get stock quote
const getQuote = async (symbol: string) => {
  const url = `${YAHOO_BASE}/chart/${symbol}.NS`;
  const response = await fetch(url);
  return response.json();
};

// Get multiple quotes
const getMultipleQuotes = async (symbols: string[]) => {
  const symbolsParam = symbols.map(s => `${s}.NS`).join(',');
  const url = `${YAHOO_BASE}/quote?symbols=${symbolsParam}`;
  return fetch(url).then(r => r.json());
};
```

### 2. NSE India (Free) ⭐ Most Accurate

**Pros**: Official, real-time, free
**Cons**: Requires headers, can be rate-limited
**Rate Limit**: ~180 requests/minute

```typescript
// Must include headers
const NSE_HEADERS = {
  'User-Agent': 'Mozilla/5.0',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
};

// Get stock quote
const getNSEQuote = async (symbol: string) => {
  const url = `https://www.nseindia.com/api/quote-equity?symbol=${symbol}`;
  const response = await fetch(url, { headers: NSE_HEADERS });
  return response.json();
};

// Get market status
const getMarketStatus = async () => {
  const url = 'https://www.nseindia.com/api/marketStatus';
  return fetch(url, { headers: NSE_HEADERS }).then(r => r.json());
};

// Get all stocks
const getAllStocks = async () => {
  const url = 'https://www.nseindia.com/api/equity-stockIndices?index=SECURITIES%20IN%20F%26O';
  return fetch(url, { headers: NSE_HEADERS }).then(r => r.json());
};
```

### 3. BSE India (Free)

**Pros**: Official BSE data
**Cons**: Limited API, requires scraping
**Rate Limit**: Unknown

```typescript
// BSE uses scrip codes (numeric)
const BSE_BASE = 'https://api.bseindia.com/BseIndiaAPI/api';

const getBSEQuote = async (scripCode: string) => {
  const url = `${BSE_BASE}/ComHeader/w?quotetype=EQ&scripcode=${scripCode}`;
  return fetch(url).then(r => r.json());
};
```

### 4. AMFI India (Free) ⭐ Recommended for Mutual Funds

**Pros**: Official, complete NAV data, free
**Cons**: Text file parsing required
**Update**: Daily after 8 PM

```typescript
const AMFI_NAV_URL = 'https://www.amfiindia.com/spages/NAVAll.txt';

const fetchAMFINAV = async () => {
  const response = await fetch(AMFI_NAV_URL);
  const text = await response.text();
  return parseAMFIData(text);
};

const parseAMFIData = (text: string) => {
  const lines = text.split('\n');
  const funds: MutualFund[] = [];
  let currentFundHouse = '';
  
  lines.forEach(line => {
    if (line.includes('Mutual Fund')) {
      currentFundHouse = line.trim();
    } else {
      const parts = line.split(';');
      if (parts.length === 6) {
        funds.push({
          schemeCode: parts[0],
          isin: parts[1],
          schemeName: parts[3],
          nav: parseFloat(parts[4]),
          date: parts[5],
          fundHouse: currentFundHouse,
        });
      }
    }
  });
  
  return funds;
};
```

### 5. Alpha Vantage (Free Tier)

**Pros**: Good documentation, reliable
**Cons**: 5 calls/minute (free tier), limited Indian stocks
**Rate Limit**: 5 calls/min (free), 500/day

```typescript
const ALPHA_VANTAGE_KEY = 'YOUR_API_KEY'; // Get from alphavantage.co
const ALPHA_BASE = 'https://www.alphavantage.co/query';

const getStockQuote = async (symbol: string) => {
  const url = `${ALPHA_BASE}?function=GLOBAL_QUOTE&symbol=${symbol}.BSE&apikey=${ALPHA_VANTAGE_KEY}`;
  return fetch(url).then(r => r.json());
};

const getIntraday = async (symbol: string) => {
  const url = `${ALPHA_BASE}?function=TIME_SERIES_INTRADAY&symbol=${symbol}.BSE&interval=5min&apikey=${ALPHA_VANTAGE_KEY}`;
  return fetch(url).then(r => r.json());
};
```

### 6. Zerodha Kite Connect (Paid) 💰

**Pros**: Most reliable, trading + data, websockets
**Cons**: Paid (₹2000/month), requires approval
**Rate Limit**: 3 requests/second

```typescript
// Requires KiteConnect SDK
import KiteConnect from 'kiteconnect';

const kite = new KiteConnect({ api_key: 'your_api_key' });

// Login flow required
kite.setAccessToken('access_token');

// Get quote
const quote = await kite.getQuote(['NSE:RELIANCE']);

// Get historical data
const historical = await kite.getHistoricalData(
  'NSE:RELIANCE',
  'day',
  '2025-01-01',
  '2025-11-14'
);
```

### 7. Upstox (Paid) 💰

**Pros**: Lower cost than Zerodha, good API
**Cons**: Paid, requires Upstox account
**Rate Limit**: 2000 requests/day

```typescript
const UPSTOX_API = 'https://api.upstox.com/v2';

// Requires OAuth token
const headers = {
  'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
  'Accept': 'application/json',
};

const getQuote = async (symbol: string) => {
  const url = `${UPSTOX_API}/market-quote/quotes?symbol=NSE_EQ|${symbol}`;
  return fetch(url, { headers }).then(r => r.json());
};
```

---

## 🏗️ Implementation

### Complete Service Implementation

```typescript
// services/stockMarketService.ts
import { supabase } from '../lib/supabase';

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  marketCap: number;
  timestamp: string;
}

export class StockMarketService {
  private static YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance';
  private static NSE_BASE = 'https://www.nseindia.com/api';
  
  /**
   * Get real-time stock quote (Yahoo Finance)
   */
  static async getStockQuote(symbol: string, exchange: 'NSE' | 'BSE' = 'NSE'): Promise<StockQuote> {
    try {
      const suffix = exchange === 'NSE' ? '.NS' : '.BO';
      const yahooSymbol = `${symbol}${suffix}`;
      
      const url = `${this.YAHOO_BASE}/chart/${yahooSymbol}?interval=1d&range=1d`;
      const response = await fetch(url);
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
        changePercent: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100,
        volume: meta.regularMarketVolume,
        previousClose: meta.chartPreviousClose,
        open: quote.open[0],
        high: quote.high[0],
        low: quote.low[0],
        marketCap: meta.marketCap,
        timestamp: new Date(meta.regularMarketTime * 1000).toISOString(),
      };
    } catch (error) {
      console.error('Error fetching stock quote:', error);
      throw error;
    }
  }
  
  /**
   * Get multiple stock quotes in batch
   */
  static async getMultipleQuotes(symbols: string[], exchange: 'NSE' | 'BSE' = 'NSE'): Promise<StockQuote[]> {
    const quotes = await Promise.allSettled(
      symbols.map(symbol => this.getStockQuote(symbol, exchange))
    );
    
    return quotes
      .filter((result): result is PromiseFulfilledResult<StockQuote> => result.status === 'fulfilled')
      .map(result => result.value);
  }
  
  /**
   * Search stocks by name or symbol
   */
  static async searchStocks(query: string): Promise<any[]> {
    try {
      const url = `${this.YAHOO_BASE}/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;
      const response = await fetch(url);
      const data = await response.json();
      
      // Filter for Indian stocks only
      return (data.quotes || []).filter((quote: any) => 
        quote.exchange === 'NSI' || quote.exchange === 'BOM'
      );
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
    period: '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '5Y' = '1M',
    exchange: 'NSE' | 'BSE' = 'NSE'
  ): Promise<any[]> {
    try {
      const suffix = exchange === 'NSE' ? '.NS' : '.BO';
      const yahooSymbol = `${symbol}${suffix}`;
      
      const rangeMap = {
        '1D': '1d',
        '5D': '5d',
        '1M': '1mo',
        '3M': '3mo',
        '6M': '6mo',
        '1Y': '1y',
        '5Y': '5y',
      };
      
      const url = `${this.YAHOO_BASE}/chart/${yahooSymbol}?interval=1d&range=${rangeMap[period]}`;
      const response = await fetch(url);
      const data = await response.json();
      
      const result = data.chart.result[0];
      const timestamps = result.timestamp;
      const quotes = result.indicators.quote[0];
      
      return timestamps.map((timestamp: number, index: number) => ({
        date: new Date(timestamp * 1000).toISOString(),
        open: quotes.open[index],
        high: quotes.high[index],
        low: quotes.low[index],
        close: quotes.close[index],
        volume: quotes.volume[index],
      }));
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return [];
    }
  }
  
  /**
   * Get market status (NSE)
   */
  static async getMarketStatus(): Promise<{ isOpen: boolean; message: string }> {
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      };
      
      const response = await fetch(`${this.NSE_BASE}/marketStatus`, { headers });
      const data = await response.json();
      
      const marketStatus = data.marketState?.[0];
      return {
        isOpen: marketStatus?.marketStatus === 'Open',
        message: marketStatus?.marketStatusMessage || 'Market status unknown',
      };
    } catch (error) {
      console.error('Error fetching market status:', error);
      return { isOpen: false, message: 'Unable to fetch status' };
    }
  }
  
  /**
   * Update cached stock prices in database
   */
  static async updateCachedPrices(symbols: string[]): Promise<void> {
    const quotes = await this.getMultipleQuotes(symbols);
    
    for (const quote of quotes) {
      await supabase
        .from('stocks')
        .upsert({
          symbol: quote.symbol,
          name: quote.name,
          current_price: quote.price,
          change_percent: quote.changePercent,
          volume: quote.volume,
          market_cap: quote.marketCap,
          last_updated: quote.timestamp,
        }, {
          onConflict: 'symbol',
        });
    }
  }
}
```

### Mutual Fund Service

```typescript
// services/mutualFundService.ts
export class MutualFundService {
  private static AMFI_NAV_URL = 'https://www.amfiindia.com/spages/NAVAll.txt';
  
  /**
   * Fetch and parse all mutual fund NAVs from AMFI
   */
  static async fetchAllNAVs(): Promise<MutualFund[]> {
    try {
      const response = await fetch(this.AMFI_NAV_URL);
      const text = await response.text();
      return this.parseAMFIData(text);
    } catch (error) {
      console.error('Error fetching AMFI NAVs:', error);
      throw error;
    }
  }
  
  /**
   * Parse AMFI NAV text file
   */
  private static parseAMFIData(text: string): MutualFund[] {
    const lines = text.split('\n');
    const funds: MutualFund[] = [];
    let currentFundHouse = '';
    
    for (const line of lines) {
      if (line.includes('Mutual Fund')) {
        currentFundHouse = line.trim();
      } else {
        const parts = line.split(';');
        if (parts.length === 6 && parts[0]) {
          funds.push({
            schemeCode: parts[0],
            isin: parts[1],
            isinReinvest: parts[2],
            schemeName: parts[3],
            nav: parseFloat(parts[4]),
            date: parts[5],
            fundHouse: currentFundHouse,
          });
        }
      }
    }
    
    return funds;
  }
  
  /**
   * Get NAV for specific scheme
   */
  static async getSchemeNAV(schemeCode: string): Promise<number | null> {
    const allNAVs = await this.fetchAllNAVs();
    const scheme = allNAVs.find(f => f.schemeCode === schemeCode);
    return scheme?.nav || null;
  }
  
  /**
   * Search mutual funds by name
   */
  static async searchMutualFunds(query: string): Promise<MutualFund[]> {
    const allFunds = await this.fetchAllNAVs();
    const lowerQuery = query.toLowerCase();
    
    return allFunds.filter(fund =>
      fund.schemeName.toLowerCase().includes(lowerQuery) ||
      fund.fundHouse.toLowerCase().includes(lowerQuery)
    ).slice(0, 20); // Limit results
  }
  
  /**
   * Update cached NAVs in database
   */
  static async updateCachedNAVs(): Promise<void> {
    const funds = await this.fetchAllNAVs();
    
    // Batch insert/update
    await supabase
      .from('mutual_funds')
      .upsert(
        funds.map(fund => ({
          scheme_code: fund.schemeCode,
          scheme_name: fund.schemeName,
          fund_house: fund.fundHouse,
          nav: fund.nav,
          nav_date: fund.date,
          last_updated: new Date().toISOString(),
        })),
        { onConflict: 'scheme_code' }
      );
  }
}
```

---

## 🔄 Data Refresh Strategy

### Real-time Updates

```typescript
// hooks/useMarketData.ts
export const useMarketData = (symbols: string[]) => {
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Initial fetch
    fetchQuotes();
    
    // Refresh every 30 seconds during market hours
    const interval = setInterval(fetchQuotes, 30000);
    
    return () => clearInterval(interval);
  }, [symbols]);
  
  const fetchQuotes = async () => {
    try {
      const data = await StockMarketService.getMultipleQuotes(symbols);
      setQuotes(data);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return { quotes, loading, refresh: fetchQuotes };
};
```

### Background Job (Server-side)

```typescript
// supabase/functions/update-market-data/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // Get all unique symbols from holdings
  const { data: holdings } = await supabase
    .from('holdings')
    .select('symbol')
    .eq('asset_type', 'stock');
  
  const symbols = [...new Set(holdings?.map(h => h.symbol) || [])];
  
  // Update prices
  await StockMarketService.updateCachedPrices(symbols);
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

---

## 💡 Best Practices

1. **Cache Aggressively**: Store prices in database, update periodically
2. **Respect Rate Limits**: Use exponential backoff for retries
3. **Fallback Strategy**: If Yahoo fails, try NSE, then cached data
4. **Market Hours**: Only refresh during 9:15 AM - 3:30 PM IST
5. **Batch Requests**: Get multiple quotes in one call when possible
6. **Error Handling**: Gracefully handle API failures
7. **Monitoring**: Track API usage and response times

---

## 🔗 Resources

- [Yahoo Finance API Documentation](https://www.yahoofinanceapi.com/)
- [NSE India API](https://www.nseindia.com/)
- [AMFI India](https://www.amfiindia.com/)
- [Alpha Vantage Docs](https://www.alphavantage.co/documentation/)
- [Zerodha Kite Connect](https://kite.trade/)

---

**Last Updated**: November 14, 2025

