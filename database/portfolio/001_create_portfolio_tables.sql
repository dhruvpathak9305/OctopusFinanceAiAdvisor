-- =====================================================
-- PORTFOLIO MANAGEMENT SYSTEM - DATABASE SCHEMA
-- =====================================================
-- Creates tables for tracking stocks, mutual funds, ETFs, and IPOs
-- Supports real-time market data, performance analytics, and tax reporting
-- Last Updated: November 14, 2025
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PORTFOLIOS TABLE
-- =====================================================
-- Containers for organizing different investment strategies
-- Examples: "Trading Portfolio", "Long-term", "Retirement"

CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    portfolio_type TEXT DEFAULT 'mixed' CHECK (portfolio_type IN ('stocks', 'mutual_funds', 'mixed', 'retirement')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, name)
);

COMMENT ON TABLE portfolios IS 'User investment portfolio containers';
COMMENT ON COLUMN portfolios.portfolio_type IS 'Type of portfolio: stocks, mutual_funds, mixed, retirement';

-- =====================================================
-- 2. STOCKS MASTER TABLE
-- =====================================================
-- Master data for all stocks (NSE/BSE)

CREATE TABLE IF NOT EXISTS stocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    exchange TEXT NOT NULL CHECK (exchange IN ('NSE', 'BSE')),
    sector TEXT,
    industry TEXT,
    market_cap BIGINT,
    current_price DECIMAL(15, 2),
    change_percent DECIMAL(10, 4),
    volume BIGINT,
    pe_ratio DECIMAL(10, 2),
    eps DECIMAL(10, 2),
    dividend_yield DECIMAL(10, 4),
    week_52_high DECIMAL(15, 2),
    week_52_low DECIMAL(15, 2),
    last_updated TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE stocks IS 'Master stock data for NSE/BSE listed companies';
COMMENT ON COLUMN stocks.symbol IS 'Stock ticker symbol (e.g., RELIANCE, TCS)';
COMMENT ON COLUMN stocks.market_cap IS 'Market capitalization in rupees';

CREATE INDEX idx_stocks_symbol ON stocks(symbol);
CREATE INDEX idx_stocks_exchange ON stocks(exchange);
CREATE INDEX idx_stocks_sector ON stocks(sector);

-- =====================================================
-- 3. MUTUAL FUNDS MASTER TABLE
-- =====================================================
-- Master data for all mutual funds (from AMFI)

CREATE TABLE IF NOT EXISTS mutual_funds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_code TEXT NOT NULL UNIQUE,
    scheme_name TEXT NOT NULL,
    fund_house TEXT NOT NULL,
    category TEXT,
    subcategory TEXT,
    isin TEXT,
    nav DECIMAL(15, 4),
    nav_date DATE,
    expense_ratio DECIMAL(5, 2),
    aum BIGINT, -- Assets Under Management
    min_investment DECIMAL(15, 2),
    min_sip DECIMAL(15, 2),
    exit_load TEXT,
    fund_manager TEXT,
    benchmark TEXT,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'very_high')),
    returns_1y DECIMAL(10, 2),
    returns_3y DECIMAL(10, 2),
    returns_5y DECIMAL(10, 2),
    last_updated TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE mutual_funds IS 'Master mutual fund data from AMFI';
COMMENT ON COLUMN mutual_funds.scheme_code IS 'AMFI scheme code (unique identifier)';
COMMENT ON COLUMN mutual_funds.nav IS 'Net Asset Value';
COMMENT ON COLUMN mutual_funds.aum IS 'Assets Under Management in crores';

CREATE INDEX idx_mutual_funds_scheme_code ON mutual_funds(scheme_code);
CREATE INDEX idx_mutual_funds_fund_house ON mutual_funds(fund_house);
CREATE INDEX idx_mutual_funds_category ON mutual_funds(category);

-- =====================================================
-- 4. HOLDINGS TABLE
-- =====================================================
-- User's actual stock/MF positions

CREATE TABLE IF NOT EXISTS holdings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('stock', 'mutual_fund', 'etf', 'bond', 'gold')),
    symbol TEXT NOT NULL, -- Stock symbol or MF scheme code
    asset_name TEXT NOT NULL,
    quantity DECIMAL(20, 6) NOT NULL DEFAULT 0,
    avg_purchase_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    current_price DECIMAL(15, 2) DEFAULT 0,
    
    -- Calculated fields (updated by triggers)
    total_invested DECIMAL(20, 2) GENERATED ALWAYS AS (quantity * avg_purchase_price) STORED,
    current_value DECIMAL(20, 2) GENERATED ALWAYS AS (quantity * current_price) STORED,
    unrealized_gain DECIMAL(20, 2) GENERATED ALWAYS AS (quantity * (current_price - avg_purchase_price)) STORED,
    unrealized_gain_pct DECIMAL(10, 4) GENERATED ALWAYS AS (
        CASE 
            WHEN avg_purchase_price > 0 
            THEN ((current_price - avg_purchase_price) / avg_purchase_price) * 100 
            ELSE 0 
        END
    ) STORED,
    
    realized_gain DECIMAL(20, 2) DEFAULT 0,
    total_dividends DECIMAL(20, 2) DEFAULT 0,
    
    first_purchase_date TIMESTAMP WITH TIME ZONE,
    last_transaction_date TIMESTAMP WITH TIME ZONE,
    
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(portfolio_id, symbol)
);

COMMENT ON TABLE holdings IS 'User portfolio holdings (stocks, mutual funds, ETFs)';
COMMENT ON COLUMN holdings.quantity IS 'Number of shares/units held';
COMMENT ON COLUMN holdings.avg_purchase_price IS 'Average purchase price (updated with each buy)';
COMMENT ON COLUMN holdings.realized_gain IS 'Total gains from sold positions';

CREATE INDEX idx_holdings_portfolio_id ON holdings(portfolio_id);
CREATE INDEX idx_holdings_symbol ON holdings(symbol);
CREATE INDEX idx_holdings_asset_type ON holdings(asset_type);
CREATE INDEX idx_holdings_portfolio_symbol ON holdings(portfolio_id, symbol);

-- =====================================================
-- 5. TRANSACTIONS TABLE
-- =====================================================
-- All buy/sell/dividend transactions

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    holding_id UUID NOT NULL REFERENCES holdings(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell', 'dividend', 'bonus', 'split', 'merger')),
    quantity DECIMAL(20, 6) NOT NULL,
    price_per_unit DECIMAL(15, 2) NOT NULL,
    total_amount DECIMAL(20, 2) NOT NULL,
    fees DECIMAL(15, 2) DEFAULT 0,
    tax DECIMAL(15, 2) DEFAULT 0,
    net_amount DECIMAL(20, 2) GENERATED ALWAYS AS (total_amount + fees + tax) STORED,
    
    transaction_date DATE NOT NULL,
    notes TEXT,
    
    -- For tax calculation
    is_taxable BOOLEAN DEFAULT true,
    tax_year TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE transactions IS 'All portfolio transactions (buy, sell, dividend, etc.)';
COMMENT ON COLUMN transactions.net_amount IS 'Total amount including fees and taxes';

CREATE INDEX idx_transactions_holding_id ON transactions(holding_id);
CREATE INDEX idx_transactions_transaction_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_transaction_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_tax_year ON transactions(tax_year);

-- =====================================================
-- 6. IPOS TABLE
-- =====================================================
-- Upcoming and historical IPO data

CREATE TABLE IF NOT EXISTS ipos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    symbol TEXT,
    exchange TEXT,
    issue_size BIGINT,
    price_band_min DECIMAL(10, 2),
    price_band_max DECIMAL(10, 2),
    lot_size INTEGER,
    min_investment DECIMAL(15, 2),
    
    open_date DATE,
    close_date DATE,
    basis_of_allotment_date DATE,
    initiation_of_refunds_date DATE,
    credit_of_shares_date DATE,
    listing_date DATE,
    
    subscription_retail DECIMAL(10, 2),
    subscription_hni DECIMAL(10, 2),
    subscription_qib DECIMAL(10, 2),
    subscription_total DECIMAL(10, 2),
    
    grey_market_premium DECIMAL(10, 2),
    listing_price DECIMAL(10, 2),
    listing_gain_pct DECIMAL(10, 2),
    
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'open', 'closed', 'allotted', 'listed')),
    
    lead_managers TEXT[],
    registrar TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE ipos IS 'IPO master data (upcoming and historical)';
COMMENT ON COLUMN ipos.grey_market_premium IS 'Grey market premium per share';
COMMENT ON COLUMN ipos.subscription_retail IS 'Retail subscription multiple (e.g., 2.5x)';

CREATE INDEX idx_ipos_status ON ipos(status);
CREATE INDEX idx_ipos_open_date ON ipos(open_date);
CREATE INDEX idx_ipos_close_date ON ipos(close_date);
CREATE INDEX idx_ipos_listing_date ON ipos(listing_date);

-- =====================================================
-- 7. IPO APPLICATIONS TABLE
-- =====================================================
-- User IPO applications tracking

CREATE TABLE IF NOT EXISTS ipo_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ipo_id UUID NOT NULL REFERENCES ipos(id) ON DELETE CASCADE,
    
    application_number TEXT,
    num_lots INTEGER NOT NULL,
    bid_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    
    upi_id TEXT,
    bank_account TEXT,
    dp_id TEXT,
    client_id TEXT,
    
    application_date DATE NOT NULL,
    application_category TEXT CHECK (application_category IN ('retail', 'hni', 'shn')),
    
    allotment_status TEXT DEFAULT 'pending' CHECK (allotment_status IN ('pending', 'allotted', 'not_allotted', 'partially_allotted')),
    allotted_shares INTEGER DEFAULT 0,
    refund_amount DECIMAL(15, 2) DEFAULT 0,
    
    listing_gain DECIMAL(15, 2),
    listing_gain_pct DECIMAL(10, 2),
    
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, ipo_id)
);

COMMENT ON TABLE ipo_applications IS 'User IPO applications and allotment tracking';
COMMENT ON COLUMN ipo_applications.application_category IS 'retail (<2L), hni (2L-10L), shn (>10L)';

CREATE INDEX idx_ipo_applications_user_id ON ipo_applications(user_id);
CREATE INDEX idx_ipo_applications_ipo_id ON ipo_applications(ipo_id);
CREATE INDEX idx_ipo_applications_allotment_status ON ipo_applications(allotment_status);

-- =====================================================
-- 8. ALERTS TABLE
-- =====================================================
-- Price and event alerts

CREATE TABLE IF NOT EXISTS portfolio_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    holding_id UUID REFERENCES holdings(id) ON DELETE CASCADE,
    
    alert_type TEXT NOT NULL CHECK (alert_type IN (
        'price_above', 'price_below', 
        'percent_gain', 'percent_loss',
        'volume_spike', 'sip_reminder',
        'dividend', 'corporate_action', 'news'
    )),
    
    trigger_value DECIMAL(15, 2),
    current_value DECIMAL(15, 2),
    
    message TEXT,
    
    is_triggered BOOLEAN DEFAULT false,
    triggered_at TIMESTAMP WITH TIME ZONE,
    
    is_active BOOLEAN DEFAULT true,
    is_recurring BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE portfolio_alerts IS 'Price and event alerts for portfolio holdings';

CREATE INDEX idx_portfolio_alerts_user_id ON portfolio_alerts(user_id);
CREATE INDEX idx_portfolio_alerts_holding_id ON portfolio_alerts(holding_id);
CREATE INDEX idx_portfolio_alerts_is_active ON portfolio_alerts(is_active);
CREATE INDEX idx_portfolio_alerts_is_triggered ON portfolio_alerts(is_triggered);

-- =====================================================
-- 9. DIVIDENDS TABLE
-- =====================================================
-- Dividend income tracking

CREATE TABLE IF NOT EXISTS dividends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    holding_id UUID NOT NULL REFERENCES holdings(id) ON DELETE CASCADE,
    
    dividend_per_share DECIMAL(10, 2) NOT NULL,
    total_shares DECIMAL(20, 6) NOT NULL,
    gross_amount DECIMAL(15, 2) NOT NULL,
    tds_amount DECIMAL(15, 2) DEFAULT 0,
    net_amount DECIMAL(15, 2) GENERATED ALWAYS AS (gross_amount - tds_amount) STORED,
    
    ex_date DATE NOT NULL,
    record_date DATE,
    payment_date DATE,
    
    financial_year TEXT NOT NULL,
    quarter TEXT,
    
    is_interim BOOLEAN DEFAULT false,
    is_final BOOLEAN DEFAULT false,
    is_special BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE dividends IS 'Dividend income tracking with TDS';
COMMENT ON COLUMN dividends.tds_amount IS 'Tax Deducted at Source';

CREATE INDEX idx_dividends_holding_id ON dividends(holding_id);
CREATE INDEX idx_dividends_ex_date ON dividends(ex_date);
CREATE INDEX idx_dividends_financial_year ON dividends(financial_year);

-- =====================================================
-- 10. PORTFOLIO PERFORMANCE TABLE
-- =====================================================
-- Historical performance snapshots

CREATE TABLE IF NOT EXISTS portfolio_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    
    snapshot_date DATE NOT NULL,
    
    total_invested DECIMAL(20, 2) NOT NULL,
    current_value DECIMAL(20, 2) NOT NULL,
    realized_gains DECIMAL(20, 2) DEFAULT 0,
    unrealized_gains DECIMAL(20, 2) NOT NULL,
    total_dividends DECIMAL(20, 2) DEFAULT 0,
    
    day_change DECIMAL(20, 2),
    day_change_pct DECIMAL(10, 4),
    
    xirr DECIMAL(10, 4),
    cagr DECIMAL(10, 4),
    
    num_holdings INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(portfolio_id, snapshot_date)
);

COMMENT ON TABLE portfolio_performance IS 'Daily portfolio performance snapshots for historical charts';

CREATE INDEX idx_portfolio_performance_portfolio_id ON portfolio_performance(portfolio_id);
CREATE INDEX idx_portfolio_performance_snapshot_date ON portfolio_performance(snapshot_date);

-- =====================================================
-- 11. SIP (Systematic Investment Plan) TABLE
-- =====================================================
-- Track recurring mutual fund investments

CREATE TABLE IF NOT EXISTS sips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    holding_id UUID NOT NULL REFERENCES holdings(id) ON DELETE CASCADE,
    
    amount DECIMAL(15, 2) NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'weekly')),
    start_date DATE NOT NULL,
    end_date DATE,
    
    payment_date INTEGER NOT NULL CHECK (payment_date BETWEEN 1 AND 28),
    
    is_active BOOLEAN DEFAULT true,
    auto_debit BOOLEAN DEFAULT false,
    
    bank_account TEXT,
    mandate_id TEXT,
    
    total_invested DECIMAL(20, 2) DEFAULT 0,
    total_installments INTEGER DEFAULT 0,
    
    next_payment_date DATE,
    last_payment_date DATE,
    
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE sips IS 'Systematic Investment Plans (recurring MF investments)';

CREATE INDEX idx_sips_holding_id ON sips(holding_id);
CREATE INDEX idx_sips_is_active ON sips(is_active);
CREATE INDEX idx_sips_next_payment_date ON sips(next_payment_date);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipo_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE sips ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portfolios
CREATE POLICY "Users can view their own portfolios"
    ON portfolios FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolios"
    ON portfolios FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios"
    ON portfolios FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios"
    ON portfolios FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for holdings (through portfolio ownership)
CREATE POLICY "Users can view holdings in their portfolios"
    ON holdings FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM portfolios 
        WHERE portfolios.id = holdings.portfolio_id 
        AND portfolios.user_id = auth.uid()
    ));

CREATE POLICY "Users can create holdings in their portfolios"
    ON holdings FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM portfolios 
        WHERE portfolios.id = holdings.portfolio_id 
        AND portfolios.user_id = auth.uid()
    ));

CREATE POLICY "Users can update holdings in their portfolios"
    ON holdings FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM portfolios 
        WHERE portfolios.id = holdings.portfolio_id 
        AND portfolios.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete holdings in their portfolios"
    ON holdings FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM portfolios 
        WHERE portfolios.id = holdings.portfolio_id 
        AND portfolios.user_id = auth.uid()
    ));

-- Similar RLS policies for other tables...
-- (transactions, ipo_applications, etc.)

-- =====================================================
-- GRANTS
-- =====================================================

GRANT ALL ON portfolios TO authenticated;
GRANT ALL ON holdings TO authenticated;
GRANT ALL ON transactions TO authenticated;
GRANT ALL ON ipo_applications TO authenticated;
GRANT ALL ON portfolio_alerts TO authenticated;
GRANT ALL ON dividends TO authenticated;
GRANT ALL ON portfolio_performance TO authenticated;
GRANT ALL ON sips TO authenticated;

-- Master tables (read-only for users)
GRANT SELECT ON stocks TO authenticated;
GRANT SELECT ON mutual_funds TO authenticated;
GRANT SELECT ON ipos TO authenticated;

-- =====================================================
-- COMPLETION
-- =====================================================

-- Add helpful comment
COMMENT ON SCHEMA public IS 'Portfolio Management System v1.0 - Complete schema for tracking stocks, mutual funds, ETFs, and IPOs';

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Portfolio Management System tables created successfully!';
    RAISE NOTICE 'Tables: portfolios, holdings, transactions, stocks, mutual_funds, ipos, ipo_applications, portfolio_alerts, dividends, portfolio_performance, sips';
END $$;

