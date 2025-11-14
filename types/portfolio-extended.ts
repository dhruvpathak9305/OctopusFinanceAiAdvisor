/**
 * Portfolio Management System - TypeScript Types
 * Extended types for stocks, mutual funds, ETFs, and IPOs
 * Last Updated: November 14, 2025
 */

// Re-export existing portfolio types
export * from './portfolio';

// =====================================================
// CORE PORTFOLIO TYPES
// =====================================================

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  portfolio_type: 'stocks' | 'mutual_funds' | 'mixed' | 'retirement';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortfolioSummary {
  portfolio_id: string;
  portfolio_name: string;
  total_invested: number;
  current_value: number;
  unrealized_gain: number;
  unrealized_gain_pct: number;
  realized_gain: number;
  total_dividends: number;
  total_gain: number;
  total_gain_pct: number;
  num_holdings: number;
  num_active_holdings: number;
}

// =====================================================
// STOCK TYPES
// =====================================================

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  sector?: string;
  industry?: string;
  market_cap?: number;
  current_price?: number;
  change_percent?: number;
  volume?: number;
  pe_ratio?: number;
  eps?: number;
  dividend_yield?: number;
  week_52_high?: number;
  week_52_low?: number;
  last_updated?: string;
  created_at: string;
}

export interface StockQuote {
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
  marketCap?: number;
  timestamp: string;
}

export interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// =====================================================
// MUTUAL FUND TYPES
// =====================================================

export interface MutualFund {
  id: string;
  scheme_code: string;
  scheme_name: string;
  fund_house: string;
  category?: string;
  subcategory?: string;
  isin?: string;
  nav?: number;
  nav_date?: string;
  expense_ratio?: number;
  aum?: number; // Assets Under Management
  min_investment?: number;
  min_sip?: number;
  exit_load?: string;
  fund_manager?: string;
  benchmark?: string;
  risk_level?: 'low' | 'medium' | 'high' | 'very_high';
  returns_1y?: number;
  returns_3y?: number;
  returns_5y?: number;
  last_updated?: string;
  created_at: string;
}

export interface MutualFundNAV {
  schemeCode: string;
  isin?: string;
  schemeName: string;
  nav: number;
  date: string;
  fundHouse: string;
}

// =====================================================
// HOLDING TYPES
// =====================================================

export interface Holding {
  id: string;
  portfolio_id: string;
  asset_type: 'stock' | 'mutual_fund' | 'etf' | 'bond' | 'gold';
  symbol: string;
  asset_name: string;
  quantity: number;
  avg_purchase_price: number;
  current_price: number;
  total_invested: number;
  current_value: number;
  unrealized_gain: number;
  unrealized_gain_pct: number;
  realized_gain: number;
  total_dividends: number;
  first_purchase_date?: string;
  last_transaction_date?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HoldingWithPrice extends Holding {
  day_change?: number;
  allocation_pct?: number;
  sector?: string; // For stocks
  fund_house?: string; // For mutual funds
}

// =====================================================
// TRANSACTION TYPES
// =====================================================

export type TransactionType = 'buy' | 'sell' | 'dividend' | 'bonus' | 'split' | 'merger';

export interface Transaction {
  id: string;
  holding_id: string;
  transaction_type: TransactionType;
  quantity: number;
  price_per_unit: number;
  total_amount: number;
  fees: number;
  tax: number;
  net_amount: number;
  transaction_date: string;
  notes?: string;
  is_taxable: boolean;
  tax_year?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionInput {
  holding_id: string;
  transaction_type: TransactionType;
  quantity: number;
  price_per_unit: number;
  total_amount: number;
  fees?: number;
  tax?: number;
  transaction_date: string;
  notes?: string;
}

// =====================================================
// IPO TYPES
// =====================================================

export type IPOStatus = 'upcoming' | 'open' | 'closed' | 'allotted' | 'listed';

export interface IPO {
  id: string;
  company_name: string;
  symbol?: string;
  exchange?: string;
  issue_size?: number;
  price_band_min?: number;
  price_band_max?: number;
  lot_size?: number;
  min_investment?: number;
  open_date?: string;
  close_date?: string;
  basis_of_allotment_date?: string;
  initiation_of_refunds_date?: string;
  credit_of_shares_date?: string;
  listing_date?: string;
  subscription_retail?: number;
  subscription_hni?: number;
  subscription_qib?: number;
  subscription_total?: number;
  grey_market_premium?: number;
  listing_price?: number;
  listing_gain_pct?: number;
  status: IPOStatus;
  lead_managers?: string[];
  registrar?: string;
  created_at: string;
  updated_at: string;
}

export type IPOApplicationCategory = 'retail' | 'hni' | 'shn';
export type IPOAllotmentStatus = 'pending' | 'allotted' | 'not_allotted' | 'partially_allotted';

export interface IPOApplication {
  id: string;
  user_id: string;
  ipo_id: string;
  application_number?: string;
  num_lots: number;
  bid_price: number;
  total_amount: number;
  upi_id?: string;
  bank_account?: string;
  dp_id?: string;
  client_id?: string;
  application_date: string;
  application_category?: IPOApplicationCategory;
  allotment_status: IPOAllotmentStatus;
  allotted_shares: number;
  refund_amount: number;
  listing_gain?: number;
  listing_gain_pct?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface IPOApplicationInput {
  ipo_id: string;
  num_lots: number;
  bid_price: number;
  upi_id?: string;
  application_category?: IPOApplicationCategory;
  notes?: string;
}

// =====================================================
// ALERT TYPES
// =====================================================

export type AlertType =
  | 'price_above'
  | 'price_below'
  | 'percent_gain'
  | 'percent_loss'
  | 'volume_spike'
  | 'sip_reminder'
  | 'dividend'
  | 'corporate_action'
  | 'news';

export interface PortfolioAlert {
  id: string;
  user_id: string;
  holding_id?: string;
  alert_type: AlertType;
  trigger_value?: number;
  current_value?: number;
  message?: string;
  is_triggered: boolean;
  triggered_at?: string;
  is_active: boolean;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlertInput {
  holding_id?: string;
  alert_type: AlertType;
  trigger_value: number;
  message?: string;
  is_recurring?: boolean;
}

// =====================================================
// DIVIDEND TYPES
// =====================================================

export interface Dividend {
  id: string;
  holding_id: string;
  dividend_per_share: number;
  total_shares: number;
  gross_amount: number;
  tds_amount: number;
  net_amount: number;
  ex_date: string;
  record_date?: string;
  payment_date?: string;
  financial_year: string;
  quarter?: string;
  is_interim: boolean;
  is_final: boolean;
  is_special: boolean;
  created_at: string;
  updated_at: string;
}

// =====================================================
// SIP TYPES
// =====================================================

export type SIPFrequency = 'monthly' | 'quarterly' | 'weekly';

export interface SIP {
  id: string;
  holding_id: string;
  amount: number;
  frequency: SIPFrequency;
  start_date: string;
  end_date?: string;
  payment_date: number; // Day of month (1-28)
  is_active: boolean;
  auto_debit: boolean;
  bank_account?: string;
  mandate_id?: string;
  total_invested: number;
  total_installments: number;
  next_payment_date?: string;
  last_payment_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SIPInput {
  holding_id: string;
  amount: number;
  frequency: SIPFrequency;
  start_date: string;
  payment_date: number;
  auto_debit?: boolean;
  bank_account?: string;
}

// =====================================================
// PERFORMANCE TYPES
// =====================================================

export interface PortfolioPerformance {
  id: string;
  portfolio_id: string;
  snapshot_date: string;
  total_invested: number;
  current_value: number;
  realized_gains: number;
  unrealized_gains: number;
  total_dividends: number;
  day_change?: number;
  day_change_pct?: number;
  xirr?: number;
  cagr?: number;
  num_holdings: number;
  created_at: string;
}

export interface PerformanceMetrics {
  returns_today: number;
  returns_today_pct: number;
  returns_week: number;
  returns_week_pct: number;
  returns_month: number;
  returns_month_pct: number;
  returns_year: number;
  returns_year_pct: number;
  xirr?: number;
  cagr?: number;
}

// =====================================================
// ALLOCATION TYPES
// =====================================================

export interface AssetAllocationItem {
  asset_type: string;
  total_value: number;
  allocation_pct: number;
  num_holdings: number;
  color?: string;
}

export interface SectorAllocationItem {
  sector: string;
  total_value: number;
  allocation_pct: number;
  num_stocks: number;
  color?: string;
}

// =====================================================
// TAX TYPES
// =====================================================

export interface CapitalGainsTax {
  holding_period_days: number;
  is_long_term: boolean;
  capital_gain: number;
  tax_rate: number;
  tax_amount: number;
}

export interface TaxSummary {
  financial_year: string;
  short_term_gains: number;
  long_term_gains: number;
  dividend_income: number;
  total_tds: number;
  estimated_tax: number;
}

// =====================================================
// MARKET STATUS TYPES
// =====================================================

export interface MarketStatus {
  isOpen: boolean;
  message: string;
  nextOpen?: string;
  nextClose?: string;
}

// =====================================================
// CHART DATA TYPES
// =====================================================

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface PerformanceChartData {
  portfolio: ChartDataPoint[];
  benchmark?: ChartDataPoint[];
}

export type ChartPeriod = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' | 'ALL';

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface APIResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// =====================================================
// FILTER & SORT TYPES
// =====================================================

export type HoldingSortField = 
  | 'name'
  | 'value'
  | 'gain'
  | 'gain_pct'
  | 'allocation';

export type SortDirection = 'asc' | 'desc';

export interface HoldingFilters {
  asset_type?: ('stock' | 'mutual_fund' | 'etf' | 'bond' | 'gold')[];
  min_value?: number;
  max_value?: number;
  min_gain_pct?: number;
  max_gain_pct?: number;
  search?: string;
}

export interface HoldingSort {
  field: HoldingSortField;
  direction: SortDirection;
}

// =====================================================
// FORM INPUT TYPES
// =====================================================

export interface AddHoldingInput {
  portfolio_id: string;
  asset_type: 'stock' | 'mutual_fund' | 'etf' | 'bond' | 'gold';
  symbol: string;
  asset_name: string;
  quantity: number;
  avg_purchase_price: number;
  transaction_date: string;
  notes?: string;
}

export interface AddPortfolioInput {
  name: string;
  description?: string;
  portfolio_type: 'stocks' | 'mutual_funds' | 'mixed' | 'retirement';
}

// =====================================================
// ANALYTICS TYPES
// =====================================================

export interface TopPerformer {
  holding_id: string;
  asset_name: string;
  symbol: string;
  unrealized_gain: number;
  unrealized_gain_pct: number;
  current_value: number;
}

export interface PortfolioAnalytics {
  summary: PortfolioSummary;
  asset_allocation: AssetAllocationItem[];
  sector_allocation: SectorAllocationItem[];
  top_performers: TopPerformer[];
  performance_history: PerformanceChartData;
  metrics: PerformanceMetrics;
}

// =====================================================
// EXPORT HELPERS
// =====================================================

export interface PortfolioExport {
  portfolio: Portfolio;
  holdings: Holding[];
  transactions: Transaction[];
  dividends: Dividend[];
  generated_at: string;
}

