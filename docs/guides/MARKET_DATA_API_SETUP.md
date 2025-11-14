# 🌐 Market Data API Setup Guide

**Complete guide to integrate Indian and Global stock market APIs**

---

## 🎯 Quick Start (All Free!)

Your app already has these working **without any API keys**:

✅ **Indian Stocks** - NSE Official API (Real-time)  
✅ **Indian Stocks** - BSE via Yahoo Finance (15-min delay)  
✅ **Global Stocks** - Yahoo Finance (15-min delay)  
✅ **Mutual Funds** - AMFI Official (Daily NAV)

**No setup needed! Just use the services already in your code.**

---

## 🚀 Current Implementation (Already Working)

### Indian Stocks
```typescript
import { GlobalMarketService } from '../services/globalMarketService';

// NSE - Real-time (No API key needed!)
const quote = await GlobalMarketService.getQuote('RELIANCE', 'NSE');
const quote = await GlobalMarketService.getQuote('TCS', 'NSE');

// BSE - 15-min delay (No API key needed!)
const quote = await GlobalMarketService.getQuote('RELIANCE', 'BSE');
```

### Global Stocks
```typescript
// US Stocks (No API key needed!)
const apple = await GlobalMarketService.getQuote('AAPL', 'US');
const tesla = await GlobalMarketService.getQuote('TSLA', 'US');
const google = await GlobalMarketService.getQuote('GOOGL', 'US');

// Search stocks
const results = await GlobalMarketService.searchStocks('apple', 'US');
const results = await GlobalMarketService.searchStocks('reliance', 'IN');
```

---

## 🔑 Optional: Add API Keys for Better Data

### 1. Alpha Vantage (Free - 500 calls/day)

**Get Your Free API Key:**
1. Go to https://www.alphavantage.co/support/#api-key
2. Enter your email
3. Get instant API key

**Add to your project:**

```bash
# Add to .env file
echo "ALPHA_VANTAGE_API_KEY=YOUR_API_KEY_HERE" >> .env
```

**Usage:**
```typescript
// Automatically uses Alpha Vantage if key is set
const quote = await GlobalMarketService.getQuote('AAPL', 'GLOBAL');
```

### 2. Finnhub (Free - 60 calls/min)

**Get Your Free API Key:**
1. Go to https://finnhub.io/register
2. Sign up (free)
3. Get API key from dashboard

**Add to your project:**

```bash
# Add to .env file
echo "FINNHUB_API_KEY=YOUR_API_KEY_HERE" >> .env
```

**Usage:**
```typescript
// Automatically uses Finnhub for US stocks if key is set
const quote = await GlobalMarketService.getQuote('AAPL', 'US');
```

---

## 📊 API Comparison

| API | Markets | Free Tier | Real-time? | API Key? |
|-----|---------|-----------|------------|----------|
| **NSE India** | Indian (NSE) | Unlimited* | ✅ Yes | ❌ No |
| **Yahoo Finance** | All | Unlimited* | ⚠️ 15-min delay | ❌ No |
| **AMFI** | Indian MF | Unlimited | ✅ Daily NAV | ❌ No |
| **Alpha Vantage** | Global | 500/day | ⚠️ Delayed | ✅ Yes |
| **Finnhub** | Global | 60/min | ✅ Yes | ✅ Yes |
| **Zerodha Kite** | Indian | ₹2000/mo | ✅ Yes | ✅ Yes |

*Rate limited but generous

---

## 🎯 Recommended Setup

### For Most Users (Free)
```
✅ Indian Stocks → NSE API (real-time, free)
✅ Global Stocks → Yahoo Finance (delayed, free)
✅ Mutual Funds → AMFI (daily, free)
```

### For Power Users (Better Real-time)
```
✅ Indian Stocks → NSE API (real-time, free)
✅ US Stocks → Finnhub (real-time, 60/min free)
✅ Global Stocks → Alpha Vantage (delayed, 500/day free)
✅ Mutual Funds → AMFI (daily, free)
```

### For Professional Trading (Paid)
```
💰 Indian Stocks → Zerodha Kite (₹2000/month)
💰 US Stocks → IEX Cloud ($9/month) or Polygon.io ($29/month)
✅ Mutual Funds → AMFI (free)
```

---

## 💻 Complete Usage Examples

### Example 1: Track Indian Portfolio
```typescript
import { GlobalMarketService } from '../services/globalMarketService';

// Get quotes for Indian stocks
const indianStocks = [
  { symbol: 'RELIANCE', market: 'NSE' as const },
  { symbol: 'TCS', market: 'NSE' as const },
  { symbol: 'INFY', market: 'NSE' as const },
  { symbol: 'HDFC', market: 'NSE' as const },
];

const quotes = await GlobalMarketService.getMultipleQuotes(indianStocks);

quotes.forEach(quote => {
  console.log(`${quote.name}: ₹${quote.price} (${quote.changePercent.toFixed(2)}%)`);
});
```

### Example 2: Track Global Portfolio
```typescript
// Mix of Indian and US stocks
const globalPortfolio = [
  { symbol: 'RELIANCE', market: 'NSE' as const },
  { symbol: 'AAPL', market: 'US' as const },
  { symbol: 'GOOGL', market: 'US' as const },
  { symbol: 'TSLA', market: 'US' as const },
];

const quotes = await GlobalMarketService.getMultipleQuotes(globalPortfolio);

quotes.forEach(quote => {
  const formatted = GlobalMarketService.formatPrice(quote.price, quote.currency);
  console.log(`${quote.name}: ${formatted} (${quote.changePercent.toFixed(2)}%)`);
});
```

### Example 3: Search and Add Stock
```typescript
// Search for stocks
const searchResults = await GlobalMarketService.searchStocks('tesla', 'US');

console.log('Search Results:');
searchResults.forEach(result => {
  console.log(`${result.symbol} - ${result.longname || result.shortname}`);
});

// Get detailed quote
if (searchResults.length > 0) {
  const symbol = searchResults[0].symbol;
  const quote = await GlobalMarketService.getQuote(symbol, 'US');
  console.log(`Current Price: ${quote.price}`);
}
```

### Example 4: Real-time Updates
```typescript
// Update portfolio prices every 30 seconds
const updatePrices = async () => {
  const stocks = [
    { symbol: 'RELIANCE', market: 'NSE' as const },
    { symbol: 'TCS', market: 'NSE' as const },
  ];

  try {
    const quotes = await GlobalMarketService.getMultipleQuotes(stocks);
    
    // Update UI with new prices
    quotes.forEach(quote => {
      updateHoldingPrice(quote.symbol, quote.price);
    });
  } catch (error) {
    console.error('Error updating prices:', error);
  }
};

// Run every 30 seconds during market hours
const interval = setInterval(updatePrices, 30000);
```

---

## 🔧 Environment Setup

### 1. Create .env file

```bash
cd /Users/d0p0c9t/Desktop/OctopusFinanceAiAdvisor

# Create .env file if it doesn't exist
cat > .env << EOF
# Market Data APIs (All Optional)
ALPHA_VANTAGE_API_KEY=
FINNHUB_API_KEY=

# Add your keys here when you get them
# ALPHA_VANTAGE_API_KEY=YOUR_KEY_HERE
# FINNHUB_API_KEY=YOUR_KEY_HERE
EOF
```

### 2. Load environment variables

Already configured in your app! The services automatically check for API keys.

---

## 🌍 Supported Markets

### Indian Markets
```typescript
// NSE (National Stock Exchange)
GlobalMarketService.getQuote('RELIANCE', 'NSE');
GlobalMarketService.getQuote('TCS', 'NSE');
GlobalMarketService.getQuote('INFY', 'NSE');

// BSE (Bombay Stock Exchange)
GlobalMarketService.getQuote('RELIANCE', 'BSE');
GlobalMarketService.getQuote('TCS', 'BSE');
```

### US Markets
```typescript
// Major US stocks
GlobalMarketService.getQuote('AAPL', 'US');    // Apple
GlobalMarketService.getQuote('MSFT', 'US');    // Microsoft
GlobalMarketService.getQuote('GOOGL', 'US');   // Google
GlobalMarketService.getQuote('AMZN', 'US');    // Amazon
GlobalMarketService.getQuote('TSLA', 'US');    // Tesla
GlobalMarketService.getQuote('META', 'US');    // Meta
GlobalMarketService.getQuote('NVDA', 'US');    // Nvidia
```

### Global Markets (via Yahoo Finance)
```typescript
// UK
GlobalMarketService.getYahooQuote('VOD', 'UK');    // Vodafone
GlobalMarketService.getYahooQuote('BP', 'UK');     // BP

// Japan
GlobalMarketService.getYahooQuote('7203', 'JP');   // Toyota
GlobalMarketService.getYahooQuote('9984', 'JP');   // SoftBank

// Hong Kong
GlobalMarketService.getYahooQuote('0700', 'HK');   // Tencent
GlobalMarketService.getYahooQuote('0941', 'HK');   // China Mobile
```

---

## 🚨 Rate Limits & Best Practices

### NSE India
- **Limit**: ~180 requests/minute
- **Best Practice**: Cache responses for 15-30 seconds
- **Retry**: Exponential backoff on failures

### Yahoo Finance
- **Limit**: Generous, no official limit
- **Best Practice**: Don't abuse, respect fair use
- **Retry**: Wait 1-2 seconds between retries

### Alpha Vantage (Free)
- **Limit**: 5 requests/minute, 500/day
- **Best Practice**: Cache aggressively, update only when needed
- **Retry**: Wait 60 seconds if limit reached

### Finnhub (Free)
- **Limit**: 60 requests/minute
- **Best Practice**: Batch requests when possible
- **Retry**: Wait 60 seconds if limit reached

---

## 🎯 Integration with Your App

### Update stockMarketService.ts

Your existing `StockMarketService` can be enhanced:

```typescript
import { GlobalMarketService } from './globalMarketService';

// Use GlobalMarketService for better coverage
export class StockMarketService {
  static async getStockQuote(symbol: string, exchange: 'NSE' | 'BSE' = 'NSE') {
    return await GlobalMarketService.getQuote(symbol, exchange);
  }
  
  // Keep all your existing methods...
}
```

### Update Your Portfolio Screen

```typescript
// In EnhancedIndex.tsx or useMarketData hook
import { GlobalMarketService } from '../../../services/globalMarketService';

// Fetch mixed portfolio (Indian + US stocks)
const portfolioStocks = [
  { symbol: 'RELIANCE', market: 'NSE' as const },
  { symbol: 'AAPL', market: 'US' as const },
  { symbol: 'GOOGL', market: 'US' as const },
];

const quotes = await GlobalMarketService.getMultipleQuotes(portfolioStocks);
```

---

## ✅ Testing Your Setup

### Test 1: Indian Stocks
```typescript
const testIndianStocks = async () => {
  try {
    console.log('Testing NSE API...');
    const reliance = await GlobalMarketService.getQuote('RELIANCE', 'NSE');
    console.log('✅ NSE Working:', reliance.price);
  } catch (error) {
    console.error('❌ NSE Failed:', error);
  }
};
```

### Test 2: US Stocks
```typescript
const testUSStocks = async () => {
  try {
    console.log('Testing US Stocks...');
    const apple = await GlobalMarketService.getQuote('AAPL', 'US');
    console.log('✅ US Stocks Working:', apple.price);
  } catch (error) {
    console.error('❌ US Stocks Failed:', error);
  }
};
```

### Test 3: Search
```typescript
const testSearch = async () => {
  try {
    console.log('Testing Search...');
    const results = await GlobalMarketService.searchStocks('tesla', 'US');
    console.log('✅ Search Working:', results.length, 'results');
  } catch (error) {
    console.error('❌ Search Failed:', error);
  }
};
```

---

## 🎉 You're Ready!

Your app now supports:
- ✅ Real-time Indian stocks (NSE)
- ✅ Indian stocks (BSE)
- ✅ US stocks
- ✅ Global stocks (with API keys)
- ✅ Stock search
- ✅ Multi-market portfolios

**All working out of the box with free APIs!** 🚀

---

**Need Help?** Check the main documentation or API integration guide.

**Last Updated:** November 14, 2025

