# 📊 Portfolio Management System

**Complete guide to the investment portfolio tracking feature**

---

## 🎯 Overview

The Portfolio Management System enables users to track stocks, mutual funds, ETFs, and IPOs with real-time market data, analytics, and tax reporting.

### Key Features
- **Multi-asset Support**: Stocks, Mutual Funds, ETFs, Bonds, IPOs
- **Real-time Market Data**: NSE/BSE integration with live prices
- **Performance Analytics**: XIRR, CAGR, gains/losses, benchmarking
- **Tax Reporting**: Capital gains calculator with STCG/LTCG
- **IPO Tracking**: Upcoming IPOs, application tracking, allotment status
- **Smart Alerts**: Price targets, SIP reminders, corporate actions

---

## 📁 Architecture

### Database Tables
```
portfolios/              → User portfolio containers
holdings/                → Individual stock/MF positions
transactions/            → Buy/sell/dividend records
stocks/                  → Stock master data
mutual_funds/            → Mutual fund master data
ipos/                    → IPO master data
ipo_applications/        → User IPO applications
alerts/                  → Price & event alerts
dividends/               → Dividend income tracking
portfolio_performance/   → Historical performance snapshots
```

### Code Structure
```
types/portfolio.ts                    → TypeScript interfaces
services/portfolioService.ts          → Portfolio CRUD operations
services/stockMarketService.ts        → Market data API integration
services/mutualFundService.ts         → AMFI NAV data
services/ipoService.ts                → IPO data management
hooks/usePortfolio.ts                 → Portfolio data hooks
hooks/useMarketData.ts                → Real-time price updates
components/Portfolio/                 → Portfolio UI components
  ├── StockCard.tsx
  ├── MutualFundCard.tsx
  ├── IPOCard.tsx
  ├── PerformanceChart.tsx
  ├── AssetAllocationChart.tsx
  └── HoldingsList.tsx
```

---

## 🎨 Design System

### Color Palette
```typescript
Primary Green: #10B981     → Gains, success, buy actions
Red: #EF4444               → Losses, sell actions
Amber: #F59E0B             → Warnings, alerts
Teal: #14B8A6              → Mutual funds
Blue: #3B82F6              → Stocks, info
Purple: #9333EA            → IPOs, premium features
Gold: #FBBF24              → Gold ETFs, bonds
```

### Card Types
- **Summary Card**: Portfolio overview with total value
- **Holding Card**: Individual stock/MF with live price
- **Performance Card**: Returns analysis with charts
- **IPO Card**: IPO details with subscription status
- **News Card**: Market news and insights
- **Action Card**: Quick buy/sell/rebalance

---

## 💾 Database Schema

### Core Tables

#### 1. portfolios
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES auth.users
name            TEXT (e.g., "Trading", "Long-term", "Retirement")
description     TEXT
type            TEXT (default: "stocks", "mutual_funds", "mixed")
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### 2. holdings
```sql
id                UUID PRIMARY KEY
portfolio_id      UUID REFERENCES portfolios
asset_type        TEXT (stock, mutual_fund, etf, bond)
symbol            TEXT (stock ticker or scheme code)
quantity          DECIMAL
avg_purchase_price DECIMAL
current_price     DECIMAL (cached, updated periodically)
total_invested    DECIMAL (calculated)
current_value     DECIMAL (calculated)
unrealized_gain   DECIMAL (calculated)
unrealized_gain_pct DECIMAL (calculated)
first_purchase_date TIMESTAMP
last_transaction_date TIMESTAMP
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

#### 3. transactions
```sql
id                UUID PRIMARY KEY
holding_id        UUID REFERENCES holdings
transaction_type  TEXT (buy, sell, dividend, bonus, split)
quantity          DECIMAL
price_per_unit    DECIMAL
total_amount      DECIMAL
fees              DECIMAL
tax               DECIMAL
transaction_date  DATE
notes             TEXT
created_at        TIMESTAMP
```

#### 4. stocks
```sql
id                UUID PRIMARY KEY
symbol            TEXT UNIQUE (e.g., "RELIANCE", "TCS")
name              TEXT
exchange          TEXT (NSE, BSE)
sector            TEXT
industry          TEXT
market_cap        BIGINT
pe_ratio          DECIMAL
eps               DECIMAL
dividend_yield    DECIMAL
week_52_high      DECIMAL
week_52_low       DECIMAL
last_updated      TIMESTAMP
```

#### 5. mutual_funds
```sql
id                UUID PRIMARY KEY
scheme_code       TEXT UNIQUE (AMFI code)
scheme_name       TEXT
fund_house        TEXT (e.g., "HDFC", "ICICI Prudential")
category          TEXT (equity, debt, hybrid, etc.)
subcategory       TEXT (large cap, mid cap, etc.)
nav               DECIMAL
nav_date          DATE
expense_ratio     DECIMAL
aum               BIGINT (assets under management)
min_investment    DECIMAL
exit_load         TEXT
last_updated      TIMESTAMP
```

#### 6. ipos
```sql
id                UUID PRIMARY KEY
company_name      TEXT
symbol            TEXT
exchange          TEXT
issue_size        BIGINT
price_band_min    DECIMAL
price_band_max    DECIMAL
lot_size          INTEGER
open_date         DATE
close_date        DATE
allotment_date    DATE
listing_date      DATE
subscription_retail DECIMAL
subscription_hni  DECIMAL
subscription_qib  DECIMAL
grey_market_premium DECIMAL
status            TEXT (upcoming, open, closed, listed)
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

#### 7. ipo_applications
```sql
id                UUID PRIMARY KEY
user_id           UUID REFERENCES auth.users
ipo_id            UUID REFERENCES ipos
application_number TEXT
num_lots          INTEGER
bid_price         DECIMAL
total_amount      DECIMAL
upi_id            TEXT
application_date  DATE
allotment_status  TEXT (pending, allotted, not_allotted)
allotted_shares   INTEGER
listing_gain      DECIMAL (calculated after listing)
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

#### 8. alerts
```sql
id                UUID PRIMARY KEY
user_id           UUID REFERENCES auth.users
holding_id        UUID REFERENCES holdings (nullable)
alert_type        TEXT (price_above, price_below, volume_spike, news)
trigger_value     DECIMAL
current_value     DECIMAL
is_triggered      BOOLEAN
triggered_at      TIMESTAMP
is_active         BOOLEAN
created_at        TIMESTAMP
```

#### 9. dividends
```sql
id                UUID PRIMARY KEY
holding_id        UUID REFERENCES holdings
dividend_per_share DECIMAL
total_shares      DECIMAL
gross_amount      DECIMAL
tds_amount        DECIMAL
net_amount        DECIMAL
ex_date           DATE
payment_date      DATE
financial_year    TEXT
created_at        TIMESTAMP
```

#### 10. portfolio_performance
```sql
id                UUID PRIMARY KEY
portfolio_id      UUID REFERENCES portfolios
snapshot_date     DATE
total_invested    DECIMAL
current_value     DECIMAL
realized_gains    DECIMAL
unrealized_gains  DECIMAL
xirr              DECIMAL
cagr              DECIMAL
created_at        TIMESTAMP
```

---

## 🔌 API Integration

### Free Market Data APIs

#### 1. Yahoo Finance (Free)
```typescript
// Stock quotes, historical data
const API_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart/';
// Example: RELIANCE.NS for NSE, RELIANCE.BO for BSE
```

#### 2. Alpha Vantage (Free tier: 5 calls/min)
```typescript
const API_KEY = 'YOUR_API_KEY';
const API_BASE = 'https://www.alphavantage.co/query';
// Global quotes, intraday data
```

#### 3. NSE India (Official - Free)
```typescript
const NSE_API = 'https://www.nseindia.com/api/';
// Real NSE data, requires headers
```

#### 4. AMFI India (Mutual Funds - Free)
```typescript
const AMFI_NAV_URL = 'https://www.amfiindia.com/spages/NAVAll.txt';
// Daily NAV for all mutual funds
```

#### 5. Zerodha Kite (Paid)
```typescript
// Most reliable for Indian markets
// Trading + market data
```

### API Service Structure
```typescript
// services/stockMarketService.ts
export class StockMarketService {
  static async getStockQuote(symbol: string): Promise<StockQuote>
  static async getHistoricalData(symbol: string, period: string): Promise<HistoricalData[]>
  static async searchStocks(query: string): Promise<Stock[]>
  static async getMarketStatus(): Promise<MarketStatus>
}

// services/mutualFundService.ts
export class MutualFundService {
  static async getMFNav(schemeCode: string): Promise<NAV>
  static async searchMutualFunds(query: string): Promise<MutualFund[]>
  static async getMFPerformance(schemeCode: string): Promise<Performance>
}
```

---

## 📊 Analytics & Calculations

### 1. Returns Calculations

#### XIRR (Extended Internal Rate of Return)
```typescript
// For irregular cash flows (SIPs, lump sum)
function calculateXIRR(cashflows: CashFlow[]): number
```

#### CAGR (Compound Annual Growth Rate)
```typescript
// For simple A to B growth
CAGR = ((Final Value / Initial Value) ^ (1 / Years)) - 1
```

#### Absolute Returns
```typescript
Absolute Return = ((Current Value - Invested Amount) / Invested Amount) * 100
```

### 2. Risk Metrics

#### Portfolio Beta
```typescript
// Volatility relative to benchmark (Nifty 50)
Beta = Covariance(Portfolio, Benchmark) / Variance(Benchmark)
```

#### Sharpe Ratio
```typescript
Sharpe Ratio = (Portfolio Return - Risk Free Rate) / Standard Deviation
```

#### Maximum Drawdown
```typescript
// Largest peak-to-trough decline
Max Drawdown = (Trough Value - Peak Value) / Peak Value
```

### 3. Tax Calculations

#### Short-term Capital Gains (STCG)
- **Equity/Equity MF**: Held < 1 year, taxed at 15%
- **Debt MF**: Held < 3 years, taxed at slab rate

#### Long-term Capital Gains (LTCG)
- **Equity/Equity MF**: Held ≥ 1 year, 10% tax above ₹1 lakh
- **Debt MF**: Held ≥ 3 years, 20% with indexation

```typescript
function calculateCapitalGains(
  purchasePrice: number,
  sellPrice: number,
  holdingPeriod: number,
  assetType: 'equity' | 'debt'
): CapitalGains
```

---

## 🎯 MVP Features (Priority Order)

### Phase 1: Core Holdings (Week 1-2)
- ✅ Add stock/MF holdings manually
- ✅ Record buy/sell transactions
- ✅ Calculate portfolio value
- ✅ Basic gains/loss display
- ✅ Asset allocation chart

### Phase 2: Market Data (Week 3)
- ✅ Real-time stock prices (NSE/BSE)
- ✅ Mutual fund NAV updates (AMFI)
- ✅ Auto-refresh current values
- ✅ Search stocks/MFs

### Phase 3: Analytics (Week 4)
- ✅ XIRR/CAGR calculations
- ✅ Performance timeline chart
- ✅ Sector allocation
- ✅ Top performers/laggards

### Phase 4: IPO Tracker (Week 5)
- ✅ Upcoming IPOs list
- ✅ Apply for IPO tracking
- ✅ Allotment status
- ✅ Listing gain calculation

### Phase 5: Alerts & Tax (Week 6)
- ✅ Price target alerts
- ✅ SIP payment reminders
- ✅ Capital gains calculator
- ✅ Dividend income tracker

---

## 🎨 UI Components

### 1. Portfolio Summary Card
```typescript
<PortfolioSummaryCard
  totalValue={250000}
  totalInvested={200000}
  totalGains={50000}
  gainsPercentage={25}
  xirr={18.5}
/>
```

### 2. Stock Card
```typescript
<StockCard
  symbol="RELIANCE"
  name="Reliance Industries"
  quantity={50}
  avgPrice={2450}
  currentPrice={2680}
  gain={11500}
  gainPercentage={9.39}
  dayChange={1.2}
/>
```

### 3. Mutual Fund Card
```typescript
<MutualFundCard
  schemeName="HDFC Balanced Advantage Fund"
  nav={345.67}
  units={289.45}
  invested={85000}
  currentValue={100034}
  sipAmount={5000}
  sipDate={5}
/>
```

### 4. IPO Card
```typescript
<IPOCard
  companyName="XYZ Limited"
  priceRange="300-320"
  lotSize={46}
  openDate="2025-11-20"
  closeDate="2025-11-22"
  subscriptionRetail={12.5}
  greyMarketPremium={45}
  status="open"
/>
```

### 5. Performance Chart
```typescript
<PerformanceChart
  data={historicalData}
  period="1Y"
  showBenchmark={true}
  benchmarkData={niftyData}
/>
```

---

## 🔔 Alerts System

### Alert Types
1. **Price Alerts**
   - Target price reached (high/low)
   - % change threshold
   - 52-week high/low

2. **SIP Reminders**
   - Payment due date (T-2 days)
   - Auto-debit confirmation

3. **Corporate Actions**
   - Dividend announcements
   - Bonus/split declarations
   - Rights issue
   - AGM/EGM dates

4. **Market Events**
   - Market opens/closes
   - Circuit breakers hit
   - Sector rotation

---

## 🚀 Getting Started

### 1. Database Setup
```bash
# Run migrations
psql -h your-db-host -U postgres -d your-db -f database/portfolio/001_create_portfolio_tables.sql
psql -h your-db-host -U postgres -d your-db -f database/portfolio/002_create_portfolio_functions.sql
```

### 2. API Setup
```typescript
// config/portfolio-api.ts
export const MARKET_DATA_CONFIG = {
  yahoo: {
    enabled: true,
    baseUrl: 'https://query1.finance.yahoo.com',
  },
  amfi: {
    enabled: true,
    navUrl: 'https://www.amfiindia.com/spages/NAVAll.txt',
  },
};
```

### 3. Add Portfolio Page
```typescript
// Navigate to Portfolio tab
// Add holdings via "+" button
// View real-time updates
```

---

## 📈 Roadmap

### Current: MVP (Q4 2025)
- Basic holdings management
- Real-time market data
- Performance analytics
- IPO tracking

### Q1 2026: Advanced Features
- Tax harvesting recommendations
- Rebalancing suggestions
- News integration
- Social features

### Q2 2026: Premium Features
- Advanced analytics (Sharpe, Beta)
- Backtesting
- AI-powered insights
- Portfolio optimization

---

## 🔗 Related Documentation
- [Database Schema Reference](../reference/PORTFOLIO_DATABASE.md)
- [API Integration Guide](../guides/PORTFOLIO_API_INTEGRATION.md)
- [Component Library](../reference/PORTFOLIO_COMPONENTS.md)
- [Tax Calculation Guide](../guides/TAX_CALCULATION.md)

---

**Last Updated**: November 14, 2025
**Status**: ✅ Ready for Development

