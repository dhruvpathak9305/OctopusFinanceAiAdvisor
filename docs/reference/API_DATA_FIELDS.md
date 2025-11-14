# 📋 Complete API Data Fields Reference

## Overview
This document lists **ALL data fields** available from various market data APIs integrated into the application. This is a comprehensive reference for what data can be captured and displayed.

---

## 🏢 Stock Market Data APIs

### 1. **NSE India (National Stock Exchange)**
**Source**: https://www.nseindia.com/api/quote-equity

#### Available Fields:

```typescript
{
  // Basic Info
  symbol: string;              // Stock symbol (e.g., "RELIANCE")
  companyName: string;         // Full company name
  industry: string;            // Industry sector
  
  // Price Data
  lastPrice: number;           // Current trading price
  change: number;              // Absolute price change
  pChange: number;             // Percentage change
  previousClose: number;       // Previous day close
  open: number;                // Today's opening price
  dayHigh: number;             // Intraday high
  dayLow: number;              // Intraday low
  
  // 52-Week Data
  high52: number;              // 52-week high
  low52: number;               // 52-week low
  
  // Volume & Value
  totalTradedVolume: number;   // Total shares traded
  totalTradedValue: number;    // Total value traded
  lastUpdateTime: string;      // Last update timestamp
  
  // Market Data
  yearHigh: number;            // Yearly high
  yearLow: number;             // Yearly low
  isinCode: string;            // ISIN identifier
  
  // Additional
  basePrice: number;           // Base price for the day
  intraDayHighLow: {
    min: number;
    max: number;
    value: number;
  };
  
  // Circuit Limits
  upperCircuitLimit: number;   // Upper price limit
  lowerCircuitLimit: number;   // Lower price limit
  
  // Pre-Open Data
  preOpenMarket: {
    preopen: array;            // Pre-market orders
    ato: {
      buy: number;
      sell: number;
    };
    IEP: number;               // Indicative Equilibrium Price
    totalTradedVolume: number;
  };
  
  // Market Depth
  marketDeptOrderBook: {
    totalBuyQuantity: number;
    totalSellQuantity: number;
    bid: array;                // Top 5 buy orders
    ask: array;                // Top 5 sell orders
  };
  
  // Security Info
  securityInfo: {
    boardStatus: string;
    tradingStatus: string;
    tradingSegment: string;
    sessionNo: string;
    slb: string;               // Securities Lending & Borrowing
    classOfShare: string;
    derivatives: string;
    surveillance: {
      surv: string;
      desc: string;
    };
    faceValue: number;
    issuedSize: number;        // Total shares issued
  };
  
  // Corporate Actions
  corporateActions: {
    dividends: array;
    splits: array;
    rights: array;
    bonus: array;
  };
}
```

---

### 2. **BSE India (Bombay Stock Exchange) via Yahoo Finance**
**Source**: https://query1.finance.yahoo.com/v8/finance/chart/

#### Available Fields:

```typescript
{
  // Meta Data
  currency: string;            // Currency (INR)
  symbol: string;              // Yahoo symbol (e.g., "RELIANCE.BO")
  exchangeName: string;        // Exchange name (BOM)
  instrumentType: string;      // EQUITY
  firstTradeDate: number;      // Unix timestamp
  regularMarketTime: number;   // Last update time
  gmtoffset: number;           // Timezone offset
  timezone: string;            // Asia/Kolkata
  exchangeTimezoneName: string;
  
  // Current Price Data
  regularMarketPrice: number;  // Current price
  chartPreviousClose: number;  // Previous close
  previousClose: number;       // Previous close (duplicate)
  scale: number;               // Price scale
  priceHint: number;           // Decimal places
  
  // Trading Range
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  
  // Company Data
  longName: string;            // Full company name
  shortName: string;           // Short name
  marketCap: number;           // Market capitalization
  
  // Quote Data (OHLCV)
  indicators: {
    quote: [{
      open: array;             // Opening prices
      high: array;             // High prices
      low: array;              // Low prices
      close: array;            // Closing prices
      volume: array;           // Volume data
    }];
    adjclose: [{
      adjclose: array;         // Adjusted close prices
    }];
  };
  
  // Time Series
  timestamp: array;            // Unix timestamps for each data point
  
  // Current Session
  currentTradingPeriod: {
    pre: { start, end, gmtoffset, timezone };
    regular: { start, end, gmtoffset, timezone };
    post: { start, end, gmtoffset, timezone };
  };
  
  // Trading Periods
  tradingPeriods: array;       // Historical trading sessions
  
  // Data Granularity
  dataGranularity: string;     // "1d", "1h", etc.
  range: string;               // Data range requested
  
  // Validation
  validRanges: array;          // Valid range options
}
```

---

### 3. **US Stocks - Finnhub API**
**Source**: https://finnhub.io/api/v1/

#### A. Quote Endpoint (`/quote`)
```typescript
{
  c: number;    // Current price
  d: number;    // Change
  dp: number;   // Percent change
  h: number;    // High price of the day
  l: number;    // Low price of the day
  o: number;    // Open price of the day
  pc: number;   // Previous close price
  t: number;    // Unix timestamp
}
```

#### B. Company Profile (`/stock/profile2`)
```typescript
{
  country: string;           // Country of incorporation
  currency: string;          // Trading currency
  exchange: string;          // Stock exchange
  finnhubIndustry: string;   // Industry classification
  ipo: string;               // IPO date
  logo: string;              // Company logo URL
  marketCapitalization: number; // Market cap in millions
  name: string;              // Company name
  phone: string;             // Contact phone
  shareOutstanding: number;  // Outstanding shares
  ticker: string;            // Stock symbol
  weburl: string;            // Company website
}
```

#### C. Financial Metrics (`/stock/metric`)
```typescript
{
  metric: {
    // Valuation Ratios
    priceToEarnings: number;           // P/E ratio
    priceToBook: number;               // P/B ratio
    priceToSales: number;              // P/S ratio
    priceToFreeCashFlow: number;       // P/FCF ratio
    enterpriseValue: number;           // EV
    evToEbitda: number;                // EV/EBITDA
    
    // Profitability
    netMargin: number;                 // Net profit margin
    operatingMargin: number;           // Operating margin
    roaeTTM: number;                   // Return on Average Equity
    roeTTM: number;                    // Return on Equity
    roiTTM: number;                    // Return on Investment
    
    // Growth
    revenueGrowthTTM: number;          // Revenue growth
    epsGrowthTTM: number;              // EPS growth
    
    // Dividends
    dividendYield: number;             // Dividend yield
    dividendPerShare: number;          // Dividend per share
    dividendGrowthRate5Y: number;      // 5Y dividend growth
    payoutRatio: number;               // Payout ratio
    
    // Per Share Data
    bookValuePerShare: number;
    cashPerShare: number;
    earningsPerShare: number;
    revenuePerShare: number;
    
    // 52-Week Data
    52WeekHigh: number;
    52WeekLow: number;
    52WeekHighDate: string;
    52WeekLowDate: string;
    52WeekPriceReturnDaily: number;
    
    // Volume
    averageVolume10Day: number;
    averageVolume3Month: number;
    
    // Beta & Volatility
    beta: number;
    
    // Market Cap
    marketCapitalization: number;
    
    // Shares
    sharesOutstanding: number;
  };
  
  series: {
    annual: {
      // Annual financial data
      currentRatio: array;
      salesPerShare: array;
      netMargin: array;
      // ... many more annual metrics
    };
  };
}
```

#### D. News (`/company-news`)
```typescript
[{
  category: string;          // News category
  datetime: number;          // Unix timestamp
  headline: string;          // News headline
  id: number;                // Unique ID
  image: string;             // Image URL
  related: string;           // Related symbol
  source: string;            // News source
  summary: string;           // Article summary
  url: string;               // Full article URL
}]
```

---

### 4. **Alpha Vantage API**
**Source**: https://www.alphavantage.co/query

#### A. Global Quote
```typescript
{
  "Global Quote": {
    "01. symbol": string;
    "02. open": string;
    "03. high": string;
    "04. low": string;
    "05. price": string;
    "06. volume": string;
    "07. latest trading day": string;
    "08. previous close": string;
    "09. change": string;
    "10. change percent": string;
  }
}
```

#### B. Time Series Data
```typescript
{
  "Meta Data": {
    "1. Information": string;
    "2. Symbol": string;
    "3. Last Refreshed": string;
    "4. Time Zone": string;
  },
  "Time Series (Daily)": {
    "2025-11-14": {
      "1. open": string;
      "2. high": string;
      "3. low": string;
      "4. close": string;
      "5. volume": string;
    },
    // ... more dates
  }
}
```

#### C. Company Overview
```typescript
{
  Symbol: string;
  AssetType: string;
  Name: string;
  Description: string;
  CIK: string;
  Exchange: string;
  Currency: string;
  Country: string;
  Sector: string;
  Industry: string;
  Address: string;
  
  // Financial Metrics
  MarketCapitalization: string;
  EBITDA: string;
  PERatio: string;
  PEGRatio: string;
  BookValue: string;
  DividendPerShare: string;
  DividendYield: string;
  EPS: string;
  RevenuePerShareTTM: string;
  ProfitMargin: string;
  OperatingMarginTTM: string;
  ReturnOnAssetsTTM: string;
  ReturnOnEquityTTM: string;
  RevenueTTM: string;
  GrossProfitTTM: string;
  
  // Share Data
  QuarterlyEarningsGrowthYOY: string;
  QuarterlyRevenueGrowthYOY: string;
  AnalystTargetPrice: string;
  TrailingPE: string;
  ForwardPE: string;
  PriceToSalesRatioTTM: string;
  PriceToBookRatio: string;
  EVToRevenue: string;
  EVToEBITDA: string;
  Beta: string;
  
  // Trading Data
  52WeekHigh: string;
  52WeekLow: string;
  50DayMovingAverage: string;
  200DayMovingAverage: string;
  SharesOutstanding: string;
  
  // Dates
  DividendDate: string;
  ExDividendDate: string;
  LatestQuarter: string;
}
```

---

## 💰 Mutual Fund Data (AMFI)

### **AMFI (Association of Mutual Funds in India)**
**Source**: https://www.amfiindia.com/spages/NAVAll.txt

#### Available Fields:

```typescript
{
  // Scheme Identification
  schemeCode: string;              // Unique AMFI scheme code
  schemeName: string;              // Full scheme name
  isinDivPayout: string;           // ISIN for dividend payout
  isinDivReinvest: string;         // ISIN for dividend reinvest
  isinGrowth: string;              // ISIN for growth option
  
  // Fund House
  fundHouse: string;               // AMC name (e.g., "HDFC Mutual Fund")
  
  // NAV Data
  nav: number;                     // Net Asset Value
  navDate: string;                 // NAV date (DD-MMM-YYYY)
  
  // Category Classification
  schemeType: string;              // Open Ended/Close Ended/Interval
  schemeCategory: string;          // Equity/Debt/Hybrid/etc
  schemeSubCategory: string;       // Large Cap/Mid Cap/etc
  
  // Performance Metrics (from additional sources)
  returns: {
    '1Week': number;               // 1-week returns (%)
    '1Month': number;              // 1-month returns (%)
    '3Month': number;              // 3-month returns (%)
    '6Month': number;              // 6-month returns (%)
    '1Year': number;               // 1-year returns (%)
    '3Year': number;               // 3-year CAGR (%)
    '5Year': number;               // 5-year CAGR (%)
    '10Year': number;              // 10-year CAGR (%)
    sinceInception: number;        // Since inception returns (%)
  };
  
  // Risk Metrics
  standardDeviation: number;       // Volatility measure
  sharpeRatio: number;             // Risk-adjusted returns
  beta: number;                    // Market correlation
  alpha: number;                   // Excess returns
  
  // Fund Details
  aum: number;                     // Assets Under Management (Crores)
  expenseRatio: number;            // Annual fee (%)
  exitLoad: string;                // Exit load structure
  minInvestment: {
    lumpsum: number;               // Minimum lump sum
    sip: number;                   // Minimum SIP amount
  };
  
  // Ratings
  morningstarRating: number;       // Star rating (1-5)
  crsilRating: string;             // CRISIL rank
  valueResearchRating: number;     // VR rating (1-5)
  
  // Portfolio Composition (if available)
  portfolio: {
    equity: number;                // % in equity
    debt: number;                  // % in debt
    cash: number;                  // % in cash
    other: number;                 // % in other assets
  };
  
  // Top Holdings
  topHoldings: [{
    name: string;                  // Security name
    allocation: number;            // % of portfolio
    sector: string;                // Sector classification
  }];
  
  // Fund Manager
  fundManager: {
    name: string;                  // Manager name
    experience: number;            // Years of experience
    qualification: string;         // Educational background
  };
  
  // Benchmarks
  benchmarkIndex: string;          // Comparison benchmark
  benchmarkReturn1Y: number;       // Benchmark 1Y return
  benchmarkReturn3Y: number;       // Benchmark 3Y return
  benchmarkReturn5Y: number;       // Benchmark 5Y return
  
  // Tax Implications
  dividendFrequency: string;       // Dividend payout frequency
  lastDividendDate: string;        // Last dividend date
  dividendAmount: number;          // Dividend per unit
  
  // Plan Details
  plan: string;                    // Direct/Regular
  option: string;                  // Growth/Dividend/IDCW
  
  // Launch Info
  launchDate: string;              // Fund launch date
  maturityDate?: string;           // For close-ended funds
  
  // Investment Style
  investmentStyle: string;         // Value/Growth/Blend
  marketCapFocus: string;          // Large/Mid/Small/Multi Cap
}
```

---

## 🌍 Global Markets

### **Yahoo Finance Search API**
**Source**: https://query1.finance.yahoo.com/v1/finance/search

#### Search Results:
```typescript
{
  explains: array;
  count: number;
  quotes: [{
    exchange: string;            // Exchange code
    shortname: string;           // Short name
    quoteType: string;           // EQUITY/ETF/MUTUALFUND
    symbol: string;              // Ticker symbol
    index: string;               // Market index
    score: number;               // Search relevance
    typeDisp: string;            // Display type
    longname: string;            // Full name
    exchDisp: string;            // Exchange display name
    sector: string;              // Sector
    industry: string;            // Industry
    dispSecIndFlag: boolean;     // Display flag
    isYahooFinance: boolean;     // Yahoo Finance availability
  }];
  news: array;                   // Related news articles
  nav: array;                    // Navigation suggestions
  lists: array;                  // Curated lists
  researchReports: array;        // Analyst reports
  totalTime: number;             // Response time
}
```

---

## 📈 Technical Indicators (Future Integration)

### **From Trading View / Technical Analysis Libraries**
```typescript
{
  // Moving Averages
  sma20: number;                 // 20-day Simple Moving Average
  sma50: number;                 // 50-day SMA
  sma200: number;                // 200-day SMA
  ema12: number;                 // 12-day Exponential Moving Average
  ema26: number;                 // 26-day EMA
  
  // Momentum Indicators
  rsi: number;                   // Relative Strength Index (0-100)
  macd: {
    value: number;               // MACD line
    signal: number;              // Signal line
    histogram: number;           // MACD histogram
  };
  stochastic: {
    k: number;                   // %K value
    d: number;                   // %D value
  };
  
  // Volatility
  bollingerBands: {
    upper: number;               // Upper band
    middle: number;              // Middle band (SMA)
    lower: number;               // Lower band
  };
  atr: number;                   // Average True Range
  
  // Volume Indicators
  obv: number;                   // On-Balance Volume
  vwap: number;                  // Volume Weighted Average Price
  
  // Trend Indicators
  adx: number;                   // Average Directional Index
  cci: number;                   // Commodity Channel Index
}
```

---

## 🎯 IPO Data (Manual/Scraped)

### **IPO Information**
```typescript
{
  // Basic Info
  ipoName: string;               // Company name
  symbol: string;                // Ticker symbol (post-listing)
  
  // Timeline
  openDate: string;              // Application open date
  closeDate: string;             // Application close date
  listingDate: string;           // Expected listing date
  allotmentDate: string;         // Allotment date
  
  // Pricing
  priceRange: {
    min: number;                 // Minimum price
    max: number;                 // Maximum price
  };
  cutOffPrice: number;           // Final issue price
  
  // Lot Details
  lotSize: number;               // Minimum lot size
  minInvestment: number;         // Minimum investment amount
  
  // Subscription Status
  subscription: {
    retail: number;              // Retail subscription (times)
    hni: number;                 // HNI subscription
    qib: number;                 // QIB subscription
    overall: number;             // Overall subscription
  };
  
  // Grey Market
  greyMarketPremium: number;     // GMP (₹)
  gmpPercent: number;            // GMP as % of price
  
  // Company Details
  industry: string;              // Industry sector
  promoterHolding: number;       // Promoter shareholding (%)
  issueSize: number;             // Total issue size (Crores)
  freshIssue: number;            // Fresh issue component
  offerForSale: number;          // OFS component
  
  // Financial Highlights
  faceValue: number;             // Face value per share
  marketCap: number;             // Post-issue market cap
  pe: number;                    // Price-to-Earnings ratio
  revenue: number;               // Annual revenue
  profit: number;                // Annual profit
  
  // Allotment
  allotmentStatus: string;       // Allotted/Not Allotted/Pending
  sharesAllotted: number;        // Number of shares allotted
  
  // Listing Performance
  listingPrice: number;          // Opening price on listing day
  listingGain: number;           // Listing gain/loss (%)
}
```

---

## 💡 Usage Examples

### Displaying All Stock Data
```typescript
const stock = await GlobalMarketService.getQuote('RELIANCE', 'NSE');

console.log(`
  Company: ${stock.name}
  Symbol: ${stock.symbol}
  Exchange: ${stock.exchange}
  
  Current Price: ₹${stock.price}
  Change: ${stock.change} (${stock.changePercent}%)
  
  Day Range: ₹${stock.low} - ₹${stock.high}
  52-Week Range: ₹${stock.week52Low} - ₹${stock.week52High}
  
  Volume: ${stock.volume.toLocaleString()}
  Market Cap: ₹${stock.marketCap.toLocaleString()} Cr
  
  Previous Close: ₹${stock.previousClose}
  Open: ₹${stock.open}
`);
```

### Displaying Mutual Fund Data
```typescript
const fund = await MutualFundService.getFundDetails('HDFC Top 100 Fund');

console.log(`
  Fund: ${fund.schemeName}
  AMC: ${fund.fundHouse}
  Category: ${fund.category}
  
  NAV: ₹${fund.nav}
  
  Returns:
    1Y: ${fund.returns1y}%
    3Y: ${fund.returns3y}%
    5Y: ${fund.returns5y}%
  
  Expense Ratio: ${fund.expenseRatio}%
  AUM: ₹${fund.aum} Crores
  
  Min Investment: ₹${fund.minInvestment.sip} (SIP) / ₹${fund.minInvestment.lumpsum} (Lump Sum)
`);
```

---

## 🔐 API Rate Limits

| API | Free Tier Limit | Paid Tiers |
|-----|----------------|------------|
| **NSE India** | Unlimited (public) | N/A |
| **Yahoo Finance** | Unlimited | N/A |
| **Finnhub** | 60 calls/min | Premium: 300/min |
| **Alpha Vantage** | 5 calls/min, 500/day | Premium: More limits |
| **AMFI** | Unlimited (public data) | N/A |

---

## 📚 Further Reading

- [Stock Browser Documentation](../features/STOCK_BROWSER.md)
- [Market Data API Setup](../guides/MARKET_DATA_API_SETUP.md)
- [NSE API Documentation](https://www.nseindia.com/)
- [Finnhub API Docs](https://finnhub.io/docs/api)
- [Alpha Vantage API Docs](https://www.alphavantage.co/documentation/)
- [AMFI NAV Data](https://www.amfiindia.com/spages/NAVAll.txt)

---

**Last Updated**: November 14, 2025  
**Maintained By**: OctopusFinance Development Team

