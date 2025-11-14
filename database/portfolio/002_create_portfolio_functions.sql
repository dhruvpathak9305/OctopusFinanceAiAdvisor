-- =====================================================
-- PORTFOLIO MANAGEMENT SYSTEM - DATABASE FUNCTIONS
-- =====================================================
-- Functions and triggers for portfolio calculations, updates, and analytics
-- Last Updated: November 14, 2025
-- =====================================================

-- =====================================================
-- FUNCTION 1: Update Holdings After Transaction
-- =====================================================
-- Automatically updates holding quantity and avg price when transaction is added

CREATE OR REPLACE FUNCTION update_holding_from_transaction()
RETURNS TRIGGER AS $$
DECLARE
    current_qty DECIMAL(20, 6);
    current_avg DECIMAL(15, 2);
    new_qty DECIMAL(20, 6);
    new_avg DECIMAL(15, 2);
BEGIN
    -- Get current holding values
    SELECT quantity, avg_purchase_price INTO current_qty, current_avg
    FROM holdings WHERE id = NEW.holding_id;
    
    IF NEW.transaction_type = 'buy' THEN
        -- Calculate new average purchase price (weighted average)
        new_qty := current_qty + NEW.quantity;
        new_avg := ((current_qty * current_avg) + (NEW.quantity * NEW.price_per_unit)) / new_qty;
        
        -- Update holding
        UPDATE holdings
        SET 
            quantity = new_qty,
            avg_purchase_price = new_avg,
            last_transaction_date = NEW.transaction_date,
            updated_at = NOW()
        WHERE id = NEW.holding_id;
        
        -- Set first purchase date if this is the first buy
        UPDATE holdings
        SET first_purchase_date = NEW.transaction_date
        WHERE id = NEW.holding_id AND first_purchase_date IS NULL;
        
    ELSIF NEW.transaction_type = 'sell' THEN
        -- Decrease quantity
        new_qty := current_qty - NEW.quantity;
        
        -- Calculate realized gain
        DECLARE
            realized_gain DECIMAL(20, 2);
        BEGIN
            realized_gain := NEW.quantity * (NEW.price_per_unit - current_avg);
            
            -- Update holding
            UPDATE holdings
            SET 
                quantity = new_qty,
                realized_gain = holdings.realized_gain + realized_gain,
                last_transaction_date = NEW.transaction_date,
                updated_at = NOW(),
                is_active = CASE WHEN new_qty <= 0 THEN false ELSE true END
            WHERE id = NEW.holding_id;
        END;
        
    ELSIF NEW.transaction_type = 'dividend' THEN
        -- Update dividend total
        UPDATE holdings
        SET 
            total_dividends = total_dividends + NEW.total_amount,
            updated_at = NOW()
        WHERE id = NEW.holding_id;
        
    ELSIF NEW.transaction_type = 'bonus' THEN
        -- Increase quantity, adjust average price
        new_qty := current_qty + NEW.quantity;
        new_avg := (current_qty * current_avg) / new_qty;
        
        UPDATE holdings
        SET 
            quantity = new_qty,
            avg_purchase_price = new_avg,
            updated_at = NOW()
        WHERE id = NEW.holding_id;
        
    ELSIF NEW.transaction_type = 'split' THEN
        -- Example: 1:2 split doubles quantity, halves price
        -- NEW.quantity should be the multiplier
        UPDATE holdings
        SET 
            quantity = current_qty * NEW.quantity,
            avg_purchase_price = current_avg / NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.holding_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_holding_from_transaction
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_holding_from_transaction();

COMMENT ON FUNCTION update_holding_from_transaction() IS 'Automatically updates holding after transaction is recorded';

-- =====================================================
-- FUNCTION 2: Update Portfolio Timestamps
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_holdings_updated_at BEFORE UPDATE ON holdings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ipos_updated_at BEFORE UPDATE ON ipos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ipo_applications_updated_at BEFORE UPDATE ON ipo_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTION 3: Get Portfolio Summary
-- =====================================================
-- Returns complete portfolio summary with all metrics

CREATE OR REPLACE FUNCTION get_portfolio_summary(
    p_portfolio_id UUID
)
RETURNS TABLE (
    portfolio_id UUID,
    portfolio_name TEXT,
    total_invested DECIMAL(20, 2),
    current_value DECIMAL(20, 2),
    unrealized_gain DECIMAL(20, 2),
    unrealized_gain_pct DECIMAL(10, 4),
    realized_gain DECIMAL(20, 2),
    total_dividends DECIMAL(20, 2),
    total_gain DECIMAL(20, 2),
    total_gain_pct DECIMAL(10, 4),
    num_holdings INTEGER,
    num_active_holdings INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS portfolio_id,
        p.name AS portfolio_name,
        COALESCE(SUM(h.total_invested), 0) AS total_invested,
        COALESCE(SUM(h.current_value), 0) AS current_value,
        COALESCE(SUM(h.unrealized_gain), 0) AS unrealized_gain,
        CASE 
            WHEN SUM(h.total_invested) > 0 
            THEN (SUM(h.unrealized_gain) / SUM(h.total_invested)) * 100 
            ELSE 0 
        END AS unrealized_gain_pct,
        COALESCE(SUM(h.realized_gain), 0) AS realized_gain,
        COALESCE(SUM(h.total_dividends), 0) AS total_dividends,
        COALESCE(SUM(h.unrealized_gain) + SUM(h.realized_gain) + SUM(h.total_dividends), 0) AS total_gain,
        CASE 
            WHEN SUM(h.total_invested) > 0 
            THEN ((SUM(h.unrealized_gain) + SUM(h.realized_gain) + SUM(h.total_dividends)) / SUM(h.total_invested)) * 100 
            ELSE 0 
        END AS total_gain_pct,
        COUNT(*)::INTEGER AS num_holdings,
        COUNT(*) FILTER (WHERE h.is_active)::INTEGER AS num_active_holdings
    FROM portfolios p
    LEFT JOIN holdings h ON h.portfolio_id = p.id
    WHERE p.id = p_portfolio_id
    GROUP BY p.id, p.name;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_portfolio_summary(UUID) IS 'Get complete portfolio summary with gains, losses, and metrics';

-- =====================================================
-- FUNCTION 4: Calculate XIRR (Extended Internal Rate of Return)
-- =====================================================
-- Calculates XIRR for irregular cash flows (SIPs, lump sum, etc.)

CREATE OR REPLACE FUNCTION calculate_xirr(
    p_holding_id UUID
)
RETURNS DECIMAL(10, 4) AS $$
DECLARE
    xirr_result DECIMAL(10, 4);
    guess DECIMAL := 0.1;
    max_iterations INTEGER := 100;
    tolerance DECIMAL := 0.0001;
BEGIN
    -- This is a simplified XIRR calculation
    -- For production, use a proper Newton-Raphson method
    
    -- For now, return null (will implement complex calculation later)
    -- or integrate with external calculation service
    RETURN NULL;
    
    -- TODO: Implement full Newton-Raphson XIRR calculation
    -- This requires iterative calculation with cash flows and dates
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_xirr(UUID) IS 'Calculate XIRR for a holding (simplified version)';

-- =====================================================
-- FUNCTION 5: Get Holdings with Current Prices
-- =====================================================
-- Returns all holdings with current market data

CREATE OR REPLACE FUNCTION get_holdings_with_prices(
    p_portfolio_id UUID
)
RETURNS TABLE (
    holding_id UUID,
    asset_type TEXT,
    symbol TEXT,
    asset_name TEXT,
    quantity DECIMAL(20, 6),
    avg_purchase_price DECIMAL(15, 2),
    current_price DECIMAL(15, 2),
    total_invested DECIMAL(20, 2),
    current_value DECIMAL(20, 2),
    unrealized_gain DECIMAL(20, 2),
    unrealized_gain_pct DECIMAL(10, 4),
    realized_gain DECIMAL(20, 2),
    total_dividends DECIMAL(20, 2),
    day_change DECIMAL(10, 4),
    allocation_pct DECIMAL(10, 4)
) AS $$
BEGIN
    RETURN QUERY
    WITH portfolio_total AS (
        SELECT SUM(h.current_value) AS total_value
        FROM holdings h
        WHERE h.portfolio_id = p_portfolio_id
        AND h.is_active = true
    )
    SELECT 
        h.id AS holding_id,
        h.asset_type,
        h.symbol,
        h.asset_name,
        h.quantity,
        h.avg_purchase_price,
        h.current_price,
        h.total_invested,
        h.current_value,
        h.unrealized_gain,
        h.unrealized_gain_pct,
        h.realized_gain,
        h.total_dividends,
        CASE 
            WHEN h.asset_type = 'stock' THEN s.change_percent
            ELSE 0
        END AS day_change,
        CASE 
            WHEN pt.total_value > 0 
            THEN (h.current_value / pt.total_value) * 100 
            ELSE 0 
        END AS allocation_pct
    FROM holdings h
    LEFT JOIN stocks s ON h.symbol = s.symbol AND h.asset_type = 'stock'
    CROSS JOIN portfolio_total pt
    WHERE h.portfolio_id = p_portfolio_id
    AND h.is_active = true
    ORDER BY h.current_value DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_holdings_with_prices(UUID) IS 'Get all holdings with current prices and allocation';

-- =====================================================
-- FUNCTION 6: Get Asset Allocation
-- =====================================================
-- Returns portfolio breakdown by asset type

CREATE OR REPLACE FUNCTION get_asset_allocation(
    p_portfolio_id UUID
)
RETURNS TABLE (
    asset_type TEXT,
    total_value DECIMAL(20, 2),
    allocation_pct DECIMAL(10, 4),
    num_holdings INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH portfolio_total AS (
        SELECT SUM(current_value) AS total_value
        FROM holdings
        WHERE portfolio_id = p_portfolio_id
        AND is_active = true
    )
    SELECT 
        h.asset_type,
        SUM(h.current_value) AS total_value,
        CASE 
            WHEN pt.total_value > 0 
            THEN (SUM(h.current_value) / pt.total_value) * 100 
            ELSE 0 
        END AS allocation_pct,
        COUNT(*)::INTEGER AS num_holdings
    FROM holdings h
    CROSS JOIN portfolio_total pt
    WHERE h.portfolio_id = p_portfolio_id
    AND h.is_active = true
    GROUP BY h.asset_type, pt.total_value
    ORDER BY total_value DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_asset_allocation(UUID) IS 'Get portfolio asset allocation breakdown';

-- =====================================================
-- FUNCTION 7: Get Sector Allocation (for stocks)
-- =====================================================

CREATE OR REPLACE FUNCTION get_sector_allocation(
    p_portfolio_id UUID
)
RETURNS TABLE (
    sector TEXT,
    total_value DECIMAL(20, 2),
    allocation_pct DECIMAL(10, 4),
    num_stocks INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH portfolio_stocks_total AS (
        SELECT SUM(current_value) AS total_value
        FROM holdings
        WHERE portfolio_id = p_portfolio_id
        AND asset_type = 'stock'
        AND is_active = true
    )
    SELECT 
        COALESCE(s.sector, 'Unknown') AS sector,
        SUM(h.current_value) AS total_value,
        CASE 
            WHEN pt.total_value > 0 
            THEN (SUM(h.current_value) / pt.total_value) * 100 
            ELSE 0 
        END AS allocation_pct,
        COUNT(*)::INTEGER AS num_stocks
    FROM holdings h
    LEFT JOIN stocks s ON h.symbol = s.symbol
    CROSS JOIN portfolio_stocks_total pt
    WHERE h.portfolio_id = p_portfolio_id
    AND h.asset_type = 'stock'
    AND h.is_active = true
    GROUP BY s.sector, pt.total_value
    ORDER BY total_value DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_sector_allocation(UUID) IS 'Get sector-wise allocation for stocks';

-- =====================================================
-- FUNCTION 8: Get Top Performers
-- =====================================================

CREATE OR REPLACE FUNCTION get_top_performers(
    p_portfolio_id UUID,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    holding_id UUID,
    asset_name TEXT,
    symbol TEXT,
    unrealized_gain DECIMAL(20, 2),
    unrealized_gain_pct DECIMAL(10, 4),
    current_value DECIMAL(20, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id AS holding_id,
        h.asset_name,
        h.symbol,
        h.unrealized_gain,
        h.unrealized_gain_pct,
        h.current_value
    FROM holdings h
    WHERE h.portfolio_id = p_portfolio_id
    AND h.is_active = true
    ORDER BY h.unrealized_gain_pct DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_top_performers(UUID, INTEGER) IS 'Get top performing holdings by gain percentage';

-- =====================================================
-- FUNCTION 9: Get Portfolio Performance History
-- =====================================================

CREATE OR REPLACE FUNCTION get_portfolio_performance_history(
    p_portfolio_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    snapshot_date DATE,
    total_invested DECIMAL(20, 2),
    current_value DECIMAL(20, 2),
    total_gain DECIMAL(20, 2),
    gain_pct DECIMAL(10, 4)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pp.snapshot_date,
        pp.total_invested,
        pp.current_value,
        pp.unrealized_gains + pp.realized_gains + pp.total_dividends AS total_gain,
        CASE 
            WHEN pp.total_invested > 0 
            THEN ((pp.unrealized_gains + pp.realized_gains + pp.total_dividends) / pp.total_invested) * 100 
            ELSE 0 
        END AS gain_pct
    FROM portfolio_performance pp
    WHERE pp.portfolio_id = p_portfolio_id
    AND pp.snapshot_date >= CURRENT_DATE - p_days
    ORDER BY pp.snapshot_date ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_portfolio_performance_history(UUID, INTEGER) IS 'Get historical performance data for charts';

-- =====================================================
-- FUNCTION 10: Calculate Tax on Capital Gains
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_capital_gains_tax(
    p_holding_id UUID,
    p_sell_quantity DECIMAL(20, 6),
    p_sell_price DECIMAL(15, 2),
    p_sell_date DATE
)
RETURNS TABLE (
    holding_period_days INTEGER,
    is_long_term BOOLEAN,
    capital_gain DECIMAL(15, 2),
    tax_rate DECIMAL(5, 2),
    tax_amount DECIMAL(15, 2)
) AS $$
DECLARE
    v_asset_type TEXT;
    v_first_purchase_date DATE;
    v_avg_price DECIMAL(15, 2);
    v_holding_days INTEGER;
    v_is_ltcg BOOLEAN;
    v_gain DECIMAL(15, 2);
    v_tax_rate DECIMAL(5, 2);
    v_tax DECIMAL(15, 2);
BEGIN
    -- Get holding details
    SELECT h.asset_type, h.first_purchase_date, h.avg_purchase_price
    INTO v_asset_type, v_first_purchase_date, v_avg_price
    FROM holdings h
    WHERE h.id = p_holding_id;
    
    -- Calculate holding period
    v_holding_days := p_sell_date - v_first_purchase_date;
    
    -- Calculate gain
    v_gain := p_sell_quantity * (p_sell_price - v_avg_price);
    
    -- Determine if LTCG or STCG based on asset type
    IF v_asset_type IN ('stock', 'etf') THEN
        -- Equity: LTCG if held > 1 year
        v_is_ltcg := v_holding_days > 365;
        v_tax_rate := CASE WHEN v_is_ltcg THEN 10.0 ELSE 15.0 END;
        
        -- LTCG tax only on gains above ₹1 lakh per year
        IF v_is_ltcg AND v_gain <= 100000 THEN
            v_tax := 0;
        ELSE
            v_tax := v_gain * (v_tax_rate / 100);
        END IF;
        
    ELSIF v_asset_type = 'mutual_fund' THEN
        -- MF: LTCG if held > 1 year (equity) or > 3 years (debt)
        -- Simplified: assume equity MF
        v_is_ltcg := v_holding_days > 365;
        v_tax_rate := CASE WHEN v_is_ltcg THEN 10.0 ELSE 15.0 END;
        v_tax := v_gain * (v_tax_rate / 100);
    ELSE
        v_is_ltcg := false;
        v_tax_rate := 0;
        v_tax := 0;
    END IF;
    
    RETURN QUERY SELECT 
        v_holding_days,
        v_is_ltcg,
        v_gain,
        v_tax_rate,
        v_tax;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_capital_gains_tax IS 'Calculate capital gains tax (STCG/LTCG) for Indian market';

-- =====================================================
-- FUNCTION 11: Create Daily Portfolio Snapshot
-- =====================================================
-- Call this daily to save portfolio performance

CREATE OR REPLACE FUNCTION create_portfolio_snapshot(
    p_portfolio_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_summary RECORD;
BEGIN
    -- Get current portfolio summary
    SELECT * INTO v_summary
    FROM get_portfolio_summary(p_portfolio_id);
    
    -- Insert snapshot
    INSERT INTO portfolio_performance (
        portfolio_id,
        snapshot_date,
        total_invested,
        current_value,
        realized_gains,
        unrealized_gains,
        total_dividends,
        num_holdings
    ) VALUES (
        p_portfolio_id,
        CURRENT_DATE,
        v_summary.total_invested,
        v_summary.current_value,
        v_summary.realized_gain,
        v_summary.unrealized_gain,
        v_summary.total_dividends,
        v_summary.num_active_holdings
    )
    ON CONFLICT (portfolio_id, snapshot_date) 
    DO UPDATE SET
        current_value = EXCLUDED.current_value,
        unrealized_gains = EXCLUDED.unrealized_gains,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_portfolio_snapshot(UUID) IS 'Create daily portfolio performance snapshot';

-- =====================================================
-- FUNCTION 12: Check and Trigger Alerts
-- =====================================================

CREATE OR REPLACE FUNCTION check_portfolio_alerts()
RETURNS TABLE (
    alert_id UUID,
    user_id UUID,
    alert_type TEXT,
    message TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH triggered_alerts AS (
        UPDATE portfolio_alerts pa
        SET 
            is_triggered = true,
            triggered_at = NOW(),
            is_active = CASE WHEN is_recurring THEN true ELSE false END
        FROM holdings h
        WHERE pa.holding_id = h.id
        AND pa.is_active = true
        AND pa.is_triggered = false
        AND (
            (pa.alert_type = 'price_above' AND h.current_price >= pa.trigger_value) OR
            (pa.alert_type = 'price_below' AND h.current_price <= pa.trigger_value) OR
            (pa.alert_type = 'percent_gain' AND h.unrealized_gain_pct >= pa.trigger_value) OR
            (pa.alert_type = 'percent_loss' AND h.unrealized_gain_pct <= -pa.trigger_value)
        )
        RETURNING pa.id, pa.user_id, pa.alert_type, pa.message
    )
    SELECT * FROM triggered_alerts;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_portfolio_alerts() IS 'Check and trigger portfolio alerts';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$ 
BEGIN 
    RAISE NOTICE 'Portfolio Management System functions created successfully!';
    RAISE NOTICE 'Functions: update_holding_from_transaction, get_portfolio_summary, get_holdings_with_prices, calculate_capital_gains_tax, and more';
END $$;

