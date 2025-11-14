# 📊 Stock & Mutual Fund Browser

## Overview

The **Stock Browser** screen provides a comprehensive interface to discover, search, filter, and analyze Indian and international stocks and mutual funds with **real-time market data** from multiple APIs.

---

## ✨ Features

### 1. **Dual Asset Type Support**
- **Stocks**: Browse Indian (NSE/BSE) and US/Global equities
- **Mutual Funds**: Search and analyze Indian mutual funds

### 2. **Multi-Market Coverage**
- **Indian Market**: NSE and BSE stocks
- **US Market**: NASDAQ, NYSE stocks
- **Global**: Access to international stocks

### 3. **Real-Time Data Display**

#### Stock Cards Show:
- **Price Information**:
  - Current price
  - Change (₹ and %)
  - Previous close
  - Open, High, Low
- **Volume**: Trading volume
- **Market Cap**: Company valuation
- **Exchange**: NSE/BSE/US

#### Mutual Fund Cards Show:
- **NAV**: Current Net Asset Value
- **Fund Details**: Fund house, category
- **Returns**: 1Y, 3Y, 5Y historical returns
- **Expense Ratio**: Annual fee percentage
- **AUM**: Assets Under Management

### 4. **Advanced Search**
- Real-time search across 1000s of stocks/MFs
- Auto-complete suggestions
- Search by:
  - Symbol (e.g., RELIANCE, AAPL)
  - Company name
  - Fund name
  - Fund house

### 5. **Comprehensive Filtering**

#### Sort Options:
- **Name**: Alphabetical
- **Price**: By current price
- **Change**: By % gain/loss
- **Volume**: By trading activity
- **Market Cap**: By company size

#### Price Range Filter:
- Set minimum and maximum price
- Quick filtering for value/growth stocks

#### Sector Filter (Coming Soon):
- Financial Services
- IT
- Healthcare
- Consumer Goods
- And more...

#### Category Filter (Mutual Funds):
- Equity/Debt/Hybrid
- Large/Mid/Small Cap
- Index Funds
- ETFs

### 6. **Quick Actions**
- **+ Add Button**: Add stock/MF to your portfolio
- **Refresh**: Update prices manually
- **View Details**: Navigate to detailed analysis (coming soon)

---

## 🎨 UI Design

### Theme Integration
- **Dark Mode**: Navy background (#0B1426), Gray cards (#1F2937)
- **Color Coding**:
  - 🟢 Green (#10B981): Positive gains, buy actions
  - 🔴 Red (#EF4444): Losses
  - 🟡 Amber (#F59E0B): Warnings
  - 🔵 Blue (#3B82F6): Info

### Card Layout
```
┌──────────────────────────────────────┐
│ RELIANCE               ₹2,450.75     │
│ Reliance Industries Ltd   +12.50     │
│ NSE                       (+0.51%)   │
├──────────────────────────────────────┤
│ Open    High     Low    Prev Close   │
│ ₹2,438  ₹2,465  ₹2,435   ₹2,438     │
├──────────────────────────────────────┤
│ Volume: 5.2M   Market Cap: ₹16.5L Cr│
│                          [+ Add]     │
└──────────────────────────────────────┘
```

---

## 📡 API Integration

### Data Sources

#### 1. **NSE India (National Stock Exchange)**
- **Source**: NSE Official API
- **Cost**: Free
- **Coverage**: 2000+ NSE-listed stocks
- **Data**: Real-time quotes, market depth
- **Rate Limit**: No official limit

**Implementation**:
```typescript
const quote = await GlobalMarketService.getQuote('RELIANCE', 'NSE');
```

#### 2. **BSE India (Bombay Stock Exchange)**
- **Source**: Yahoo Finance API
- **Cost**: Free
- **Coverage**: 5000+ BSE-listed stocks
- **Data**: Delayed 15-20 minutes

#### 3. **US Stocks**
- **Primary**: Finnhub.io (Free tier: 60 API calls/min)
- **Fallback**: Yahoo Finance (unlimited, 15-min delay)
- **Coverage**: NYSE, NASDAQ, AMEX

#### 4. **Mutual Funds**
- **Source**: AMFI (Association of Mutual Funds in India)
- **Cost**: Free
- **Coverage**: 10,000+ schemes
- **Data**: Daily NAV, returns, expense ratio

**Implementation**:
```typescript
const funds = await MutualFundService.searchMutualFunds('HDFC');
```

#### 5. **Search API**
- **Source**: Yahoo Finance Search
- **Cost**: Free
- **Coverage**: Global stocks and funds

---

## 🔧 Technical Architecture

### File Structure
```
src/mobile/pages/MobileStockBrowser/
├── index.tsx                    # Main screen component
└── components/                  # Future: Sub-components

services/
├── globalMarketService.ts       # Stock market data
├── mutualFundService.ts         # Mutual fund data
└── portfolioService.ts          # Add to portfolio

hooks/
└── useMarketData.ts            # Real-time price updates
```

### Data Flow

```
User Search/Filter
       ↓
StockBrowser Component
       ↓
GlobalMarketService.searchStocks()
       ↓
Yahoo Finance API (Search)
       ↓
GlobalMarketService.getQuote()
       ↓
NSE/Yahoo/Finnhub API (Detailed Quote)
       ↓
Display in Card List
```

### State Management

```typescript
// Asset type: stocks vs mutual funds
const [assetType, setAssetType] = useState<'stocks' | 'mutualfunds'>('stocks');

// Market selection
const [market, setMarket] = useState<'indian' | 'us' | 'global'>('indian');

// Search query
const [searchQuery, setSearchQuery] = useState('');

// Fetched data
const [stocks, setStocks] = useState<StockData[]>([]);
const [mutualFunds, setMutualFunds] = useState<MFData[]>([]);

// Filtered and sorted data
const [filteredData, setFilteredData] = useState<any[]>([]);

// Filters
const [sortBy, setSortBy] = useState<SortBy>('name');
const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
const [priceMin, setPriceMin] = useState('');
const [priceMax, setPriceMax] = useState('');
```

---

## 📊 Data Captured from APIs

### Stock Quote Data
```typescript
interface StockData {
  symbol: string;           // Ticker symbol (e.g., RELIANCE)
  name: string;             // Full company name
  exchange: string;         // NSE/BSE/NASDAQ/NYSE
  price: number;            // Current trading price
  change: number;           // Absolute price change
  changePercent: number;    // Percentage change
  volume: number;           // Trading volume
  previousClose: number;    // Yesterday's closing price
  open: number;             // Today's opening price
  high: number;             // Intraday high
  low: number;              // Intraday low
  marketCap?: number;       // Company market capitalization
  currency: string;         // INR/USD/etc
  
  // Additional (if available)
  sector?: string;          // Industry sector
  industry?: string;        // Specific industry
  pe?: number;              // Price-to-Earnings ratio
  week52High?: number;      // 52-week high price
  week52Low?: number;       // 52-week low price
}
```

### Mutual Fund Data
```typescript
interface MFData {
  schemeCode: string;       // AMFI scheme code
  schemeName: string;       // Full fund name
  fundHouse: string;        // AMC name (e.g., HDFC MF)
  nav: number;              // Net Asset Value
  category?: string;        // Equity/Debt/Hybrid/etc
  returns1y?: number;       // 1-year returns (%)
  returns3y?: number;       // 3-year returns (%)
  returns5y?: number;       // 5-year returns (%)
  expenseRatio?: number;    // Annual fee (%)
  aum?: number;             // Assets Under Management (Crores)
  
  // Additional (if available)
  rating?: number;          // Star rating (1-5)
  riskLevel?: string;       // Low/Medium/High
  exitLoad?: string;        // Exit penalty details
  minInvestment?: number;   // Minimum SIP/lump sum
}
```

---

## 🚀 Usage Examples

### 1. **Searching for Stocks**
```typescript
// User types "HDFC" in search box
handleSearch("HDFC");

// Results:
// - HDFCBANK (NSE)
// - HDFC (NSE)
// - HDFCLIFE (NSE)
// - etc.
```

### 2. **Filtering by Price**
```typescript
// Set price range: ₹100 - ₹500
setPriceMin("100");
setPriceMax("500");

// Only stocks within this range are displayed
```

### 3. **Sorting by Performance**
```typescript
// Sort by highest % change
setSortBy("change");
setSortOrder("desc");

// Top gainers appear first
```

### 4. **Adding to Portfolio**
```typescript
// User clicks "+ Add" on RELIANCE card
onAddStock(stock);

// Opens modal to:
// 1. Enter quantity
// 2. Enter purchase price
// 3. Select portfolio
// 4. Add notes
```

---

## 🔄 Real-Time Updates

### Auto-Refresh Strategy
- **Initial Load**: Popular stocks (top 20)
- **Search Results**: Fetch on user query
- **Manual Refresh**: "🔄 Refresh" button
- **Future**: WebSocket for live updates during market hours

### Performance Optimization
- **Batch API Calls**: Fetch multiple stocks in parallel
- **Caching**: Store recent quotes (5-minute cache)
- **Lazy Loading**: Load more stocks on scroll
- **Debounced Search**: Wait 500ms after user stops typing

---

## 🎯 Future Enhancements

### Phase 1: Enhanced Filtering
- [ ] Sector/Industry filters
- [ ] Market cap ranges (Large/Mid/Small cap)
- [ ] P/E ratio filter
- [ ] Volume filters (high/low activity)
- [ ] Dividend yield filter

### Phase 2: Advanced Analytics
- [ ] Technical indicators (RSI, MACD, Moving Averages)
- [ ] Price charts (1D, 1W, 1M, 1Y)
- [ ] Comparison tool (compare 2-4 stocks side-by-side)
- [ ] Analyst ratings and target prices
- [ ] News feed integration

### Phase 3: Personalization
- [ ] Watchlist creation
- [ ] Price alerts
- [ ] Saved filters/searches
- [ ] Recently viewed stocks
- [ ] Recommendation engine

### Phase 4: Social Features
- [ ] Community sentiment
- [ ] Top trending stocks
- [ ] Expert portfolios to follow
- [ ] Discussion forums

---

## 📱 Navigation

### Access Point
```
Dashboard → Portfolio Tab → "Browse Stocks" Button
```

### Navigation Routes
```typescript
// Navigate to Stock Browser
navigation.navigate('StockBrowser');

// Navigate to Stock Detail (future)
navigation.navigate('StockDetail', { symbol: 'RELIANCE', exchange: 'NSE' });
```

---

## 🛠️ Setup Instructions

### 1. **Install Dependencies**
```bash
# All required packages are already installed
# No additional setup needed for basic functionality
```

### 2. **API Keys (Optional for Enhanced Data)**
```bash
# Create .env file
ALPHA_VANTAGE_API_KEY=your_key_here
FINNHUB_API_KEY=your_key_here
```

### 3. **Test the Screen**
```bash
# Run the app
pnpm start

# Navigate to Portfolio → Browse Stocks
```

---

## 🐛 Troubleshooting

### Issue: "No results found"
**Solution**: 
- Check internet connection
- Verify API endpoints are not blocked by firewall
- Try different search terms

### Issue: "Loading takes too long"
**Solution**:
- Some APIs have rate limits (60 calls/min for Finnhub)
- Use Yahoo Finance fallback (unlimited but delayed)
- Implement caching for frequently accessed stocks

### Issue: "Prices not updating"
**Solution**:
- Market may be closed (NSE: 9:15 AM - 3:30 PM IST)
- Click "🔄 Refresh" manually
- Check API response in console logs

---

## 📖 Related Documentation

- [Portfolio Management System](./PORTFOLIO_MANAGEMENT_SYSTEM.md)
- [Market Data API Setup](../guides/MARKET_DATA_API_SETUP.md)
- [Global Market Service](../../services/globalMarketService.ts)
- [Mutual Fund Service](../../services/mutualFundService.ts)

---

## 🎉 Ready to Use!

The Stock Browser is **fully functional** with real-time data from:
- ✅ NSE India (2000+ stocks)
- ✅ BSE India (5000+ stocks via Yahoo Finance)
- ✅ US Markets (NASDAQ, NYSE via Finnhub/Yahoo)
- ✅ Indian Mutual Funds (10,000+ schemes via AMFI)

**No mock data** - all information is fetched live from market APIs!

---

**Last Updated**: November 14, 2025
**Version**: 1.0.0

