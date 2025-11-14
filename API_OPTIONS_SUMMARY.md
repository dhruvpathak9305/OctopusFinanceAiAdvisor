# 🌐 Stock Market APIs - Quick Reference

## ✅ Already Working (No Setup Needed!)

### Indian Markets
```typescript
import { GlobalMarketService } from './services/globalMarketService';

// NSE - Real-time, Free, No API Key! ⭐
const reliance = await GlobalMarketService.getQuote('RELIANCE', 'NSE');
const tcs = await GlobalMarketService.getQuote('TCS', 'NSE');

// BSE - 15-min delay, Free, No API Key!
const relianceBse = await GlobalMarketService.getQuote('RELIANCE', 'BSE');
```

### Global Markets  
```typescript
// US Stocks - Free, No API Key! ⭐
const apple = await GlobalMarketService.getQuote('AAPL', 'US');
const tesla = await GlobalMarketService.getQuote('TSLA', 'US');
const google = await GlobalMarketService.getQuote('GOOGL', 'US');
```

---

## 🆓 Free APIs (Recommended)

| API | Coverage | Rate Limit | Real-time? | Setup |
|-----|----------|------------|------------|-------|
| **NSE India** ⭐ | Indian stocks | 180/min | ✅ Yes | No API key |
| **Yahoo Finance** ⭐ | All markets | Generous | ⚠️ 15-min delay | No API key |
| **AMFI** ⭐ | Indian MF | Unlimited | ✅ Daily NAV | No API key |
| **Finnhub** | All markets | 60/min | ✅ Yes | Free signup |
| **Alpha Vantage** | All markets | 500/day | ⚠️ Delayed | Free signup |

---

## 💰 Paid APIs (For Professionals)

| API | Coverage | Cost | Real-time? | Trading? |
|-----|----------|------|------------|----------|
| **Zerodha Kite** | Indian | ₹2000/mo | ✅ Yes | ✅ Yes |
| **IEX Cloud** | US | $9/mo | ✅ Yes | ❌ No |
| **Polygon.io** | US | $29/mo | ✅ Yes | ❌ No |
| **Upstox** | Indian | Paid | ✅ Yes | ✅ Yes |

---

## 🎯 Best Combination (All Free!)

```
Indian Stocks → NSE API (real-time) ✅
US Stocks → Yahoo Finance (delayed) ✅  
Mutual Funds → AMFI (daily) ✅
Search → Yahoo Finance ✅
```

**Total Cost:** ₹0 🎉

---

## 🚀 Quick Start

### Step 1: Already Done!
```typescript
// Indian stock - works now!
const quote = await GlobalMarketService.getQuote('RELIANCE', 'NSE');
console.log(`Price: ₹${quote.price}`);
```

### Step 2: Optional - Add Free API Keys for Better Data

**Finnhub (60 calls/min):**
1. Sign up: https://finnhub.io/register
2. Get API key
3. Add to `.env`: `FINNHUB_API_KEY=your_key`

**Alpha Vantage (500 calls/day):**
1. Get key: https://www.alphavantage.co/support/#api-key
2. Add to `.env`: `ALPHA_VANTAGE_API_KEY=your_key`

---

## 📊 Market Coverage

### Indian Markets ✅
- NSE (National Stock Exchange) - Real-time
- BSE (Bombay Stock Exchange) - 15-min delay
- 3000+ Indian stocks

### US Markets ✅
- NYSE, NASDAQ - Real-time with Finnhub
- 8000+ US stocks

### Global Markets ✅
- UK, Japan, Hong Kong, Germany, etc.
- Via Yahoo Finance

---

## 💡 Usage Examples

### Example 1: Track Multiple Markets
```typescript
const portfolio = [
  { symbol: 'RELIANCE', market: 'NSE' as const },
  { symbol: 'AAPL', market: 'US' as const },
  { symbol: 'GOOGL', market: 'US' as const },
];

const quotes = await GlobalMarketService.getMultipleQuotes(portfolio);
```

### Example 2: Search Stocks
```typescript
const results = await GlobalMarketService.searchStocks('apple', 'US');
const results = await GlobalMarketService.searchStocks('reliance', 'IN');
```

### Example 3: Format Prices
```typescript
const formatted = GlobalMarketService.formatPrice(quote.price, quote.currency);
// Indian: ₹2,680.50
// US: $180.25
```

---

## 📚 Full Documentation

- **Setup Guide:** `docs/guides/MARKET_DATA_API_SETUP.md`
- **API Integration:** `docs/guides/PORTFOLIO_API_INTEGRATION.md`
- **Service Code:** `services/globalMarketService.ts`

---

## ✅ Summary

**You already have:**
- ✅ Real-time Indian stocks (NSE)
- ✅ Delayed global stocks (Yahoo)
- ✅ Mutual fund NAVs (AMFI)
- ✅ Stock search
- ✅ Multi-currency support

**All working without any API keys or setup!** 🎉

**Want better real-time data?**
- Add Finnhub key (free, 60/min)
- Add Alpha Vantage key (free, 500/day)

**That's it! Your global portfolio tracking is ready.** 🚀

