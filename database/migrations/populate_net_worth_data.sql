-- =============================================================================
-- POPULATE NET WORTH CATEGORIES AND SUBCATEGORIES FROM MOBILE APP DATA
-- =============================================================================
-- This script populates the net_worth_categories_real and net_worth_subcategories_real
-- tables with the comprehensive data from the mobile app.

-- First, run the schema update
-- \i database/migrations/update_net_worth_schema.sql

-- Clear existing data (optional - remove if you want to keep existing data)
-- DELETE FROM public.net_worth_subcategories_real;
-- DELETE FROM public.net_worth_categories_real;

-- =============================================================================
-- INSERT ASSET CATEGORIES
-- =============================================================================

-- 1. Cash & Cash Equivalents
INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active
) VALUES (
    'Cash & Cash Equivalents', 'asset', 'cash', '#10B981', 
    'Liquid cash and cash equivalent assets', 1, 170000, 1.6, 3, true
) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value,
    percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count,
    updated_at = NOW();

-- Get the category ID for subcategories
DO $$
DECLARE
    cash_category_id UUID;
BEGIN
    SELECT id INTO cash_category_id FROM public.net_worth_categories_real WHERE name = 'Cash & Cash Equivalents';
    
    -- Insert subcategories
    INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata) VALUES
    (cash_category_id, 'Savings Bank Account', 'card', '#10B981', 1, '{"value": 120000, "percentage": 71}'),
    (cash_category_id, 'Current Account', 'wallet', '#10B981', 2, '{"value": 30000, "percentage": 18}'),
    (cash_category_id, 'Digital Wallets', 'phone-portrait', '#10B981', 3, '{"value": 20000, "percentage": 11}')
    ON CONFLICT (category_id, name) DO UPDATE SET
        icon = EXCLUDED.icon,
        color = EXCLUDED.color,
        sort_order = EXCLUDED.sort_order,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();
END $$;

-- 2. Equity Investments
INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active
) VALUES (
    'Equity Investments', 'asset', 'trending-up', '#3B82F6', 
    'Stock market and equity-based investments', 2, 510000, 4.8, 4, true
) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value,
    percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count,
    updated_at = NOW();

DO $$
DECLARE
    equity_category_id UUID;
BEGIN
    SELECT id INTO equity_category_id FROM public.net_worth_categories_real WHERE name = 'Equity Investments';
    
    INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata) VALUES
    (equity_category_id, 'Direct Stocks/Shares', 'trending-up', '#3B82F6', 1, '{"value": 300000, "percentage": 59}'),
    (equity_category_id, 'Equity Mutual Funds', 'bar-chart', '#3B82F6', 2, '{"value": 150000, "percentage": 29}'),
    (equity_category_id, 'ETFs', 'analytics', '#3B82F6', 3, '{"value": 60000, "percentage": 12}')
    ON CONFLICT (category_id, name) DO UPDATE SET
        icon = EXCLUDED.icon,
        color = EXCLUDED.color,
        sort_order = EXCLUDED.sort_order,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();
END $$;

-- 3. Debt & Fixed Income
INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active
) VALUES (
    'Debt & Fixed Income', 'asset', 'trending-down', '#8B5CF6', 
    'Fixed income and debt instruments', 3, 450000, 4.2, 3, true
) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value,
    percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count,
    updated_at = NOW();

DO $$
DECLARE
    debt_category_id UUID;
BEGIN
    SELECT id INTO debt_category_id FROM public.net_worth_categories_real WHERE name = 'Debt & Fixed Income';
    
    INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata) VALUES
    (debt_category_id, 'Fixed Deposits', 'time', '#8B5CF6', 1, '{"value": 250000, "percentage": 56}'),
    (debt_category_id, 'Government Securities', 'shield', '#8B5CF6', 2, '{"value": 150000, "percentage": 33}'),
    (debt_category_id, 'Corporate Bonds', 'business', '#8B5CF6', 3, '{"value": 50000, "percentage": 11}')
    ON CONFLICT (category_id, name) DO UPDATE SET
        icon = EXCLUDED.icon,
        color = EXCLUDED.color,
        sort_order = EXCLUDED.sort_order,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();
END $$;

-- 4. Retirement & Pension Funds
INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active
) VALUES (
    'Retirement & Pension Funds', 'asset', 'shield-checkmark', '#06B6D4', 
    'Retirement savings and pension funds', 4, 660000, 6.2, 3, true
) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value,
    percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count,
    updated_at = NOW();

DO $$
DECLARE
    retirement_category_id UUID;
BEGIN
    SELECT id INTO retirement_category_id FROM public.net_worth_categories_real WHERE name = 'Retirement & Pension Funds';
    
    INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata) VALUES
    (retirement_category_id, 'Employee Provident Fund', 'shield-checkmark', '#06B6D4', 1, '{"value": 400000, "percentage": 61}'),
    (retirement_category_id, 'Public Provident Fund', 'shield', '#06B6D4', 2, '{"value": 200000, "percentage": 30}'),
    (retirement_category_id, 'National Pension System', 'person', '#06B6D4', 3, '{"value": 60000, "percentage": 9}')
    ON CONFLICT (category_id, name) DO UPDATE SET
        icon = EXCLUDED.icon,
        color = EXCLUDED.color,
        sort_order = EXCLUDED.sort_order,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();
END $$;

-- 5. Insurance (Investment)
INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active
) VALUES (
    'Insurance (Investment)', 'asset', 'shield', '#EC4899', 
    'Investment-linked insurance products', 5, 320000, 3.0, 2, true
) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value,
    percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count,
    updated_at = NOW();

DO $$
DECLARE
    insurance_category_id UUID;
BEGIN
    SELECT id INTO insurance_category_id FROM public.net_worth_categories_real WHERE name = 'Insurance (Investment)';
    
    INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata) VALUES
    (insurance_category_id, 'ULIP Plans', 'shield', '#EC4899', 1, '{"value": 200000, "percentage": 63}'),
    (insurance_category_id, 'Endowment Plans', 'heart', '#EC4899', 2, '{"value": 120000, "percentage": 37}')
    ON CONFLICT (category_id, name) DO UPDATE SET
        icon = EXCLUDED.icon,
        color = EXCLUDED.color,
        sort_order = EXCLUDED.sort_order,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();
END $$;

-- 6. Real Estate
INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active
) VALUES (
    'Real Estate', 'asset', 'home', '#F59E0B', 
    'Property and real estate investments', 6, 4630000, 43.1, 2, true
) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value,
    percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count,
    updated_at = NOW();

DO $$
DECLARE
    realestate_category_id UUID;
BEGIN
    SELECT id INTO realestate_category_id FROM public.net_worth_categories_real WHERE name = 'Real Estate';
    
    INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata) VALUES
    (realestate_category_id, 'Primary Residence', 'home', '#F59E0B', 1, '{"value": 4000000, "percentage": 86}'),
    (realestate_category_id, 'Rental Property', 'business', '#F59E0B', 2, '{"value": 630000, "percentage": 14}')
    ON CONFLICT (category_id, name) DO UPDATE SET
        icon = EXCLUDED.icon,
        color = EXCLUDED.color,
        sort_order = EXCLUDED.sort_order,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();
END $$;

-- 7. Precious Metals & Commodities
INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active
) VALUES (
    'Precious Metals & Commodities', 'asset', 'diamond', '#EAB308', 
    'Gold, silver and other precious metals', 7, 2850000, 26.6, 2, true
) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value,
    percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count,
    updated_at = NOW();

DO $$
DECLARE
    metals_category_id UUID;
BEGIN
    SELECT id INTO metals_category_id FROM public.net_worth_categories_real WHERE name = 'Precious Metals & Commodities';
    
    INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata) VALUES
    (metals_category_id, 'Physical Gold', 'diamond', '#EAB308', 1, '{"value": 1500000, "percentage": 53}'),
    (metals_category_id, 'Gold ETFs', 'trending-up', '#EAB308', 2, '{"value": 1350000, "percentage": 47}')
    ON CONFLICT (category_id, name) DO UPDATE SET
        icon = EXCLUDED.icon,
        color = EXCLUDED.color,
        sort_order = EXCLUDED.sort_order,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();
END $$;

-- 8. Digital & Crypto Assets
INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active
) VALUES (
    'Digital & Crypto Assets', 'asset', 'logo-bitcoin', '#F97316', 
    'Cryptocurrency and digital assets', 8, 180000, 1.7, 2, true
) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value,
    percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count,
    updated_at = NOW();

DO $$
DECLARE
    crypto_category_id UUID;
BEGIN
    SELECT id INTO crypto_category_id FROM public.net_worth_categories_real WHERE name = 'Digital & Crypto Assets';
    
    INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata) VALUES
    (crypto_category_id, 'Bitcoin', 'logo-bitcoin', '#F97316', 1, '{"value": 100000, "percentage": 56}'),
    (crypto_category_id, 'Ethereum', 'logo-bitcoin', '#F97316', 2, '{"value": 80000, "percentage": 44}')
    ON CONFLICT (category_id, name) DO UPDATE SET
        icon = EXCLUDED.icon,
        color = EXCLUDED.color,
        sort_order = EXCLUDED.sort_order,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();
END $$;

-- 9. Business & Entrepreneurial
INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active
) VALUES (
    'Business & Entrepreneurial', 'asset', 'business', '#EF4444', 
    'Business investments and entrepreneurial assets', 9, 800000, 7.4, 2, true
) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value,
    percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count,
    updated_at = NOW();

DO $$
DECLARE
    business_category_id UUID;
BEGIN
    SELECT id INTO business_category_id FROM public.net_worth_categories_real WHERE name = 'Business & Entrepreneurial';
    
    INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata) VALUES
    (business_category_id, 'Private Equity', 'business', '#EF4444', 1, '{"value": 500000, "percentage": 63}'),
    (business_category_id, 'Intellectual Property', 'document-text', '#EF4444', 2, '{"value": 300000, "percentage": 37}')
    ON CONFLICT (category_id, name) DO UPDATE SET
        icon = EXCLUDED.icon,
        color = EXCLUDED.color,
        sort_order = EXCLUDED.sort_order,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();
END $$;

-- 10. Vehicles
INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active
) VALUES (
    'Vehicles', 'asset', 'car', '#84CC16', 
    'Personal and commercial vehicles', 10, 280000, 2.6, 2, true
) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value,
    percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count,
    updated_at = NOW();

DO $$
DECLARE
    vehicles_category_id UUID;
BEGIN
    SELECT id INTO vehicles_category_id FROM public.net_worth_categories_real WHERE name = 'Vehicles';
    
    INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata) VALUES
    (vehicles_category_id, 'Personal Car', 'car', '#84CC16', 1, '{"value": 180000, "percentage": 64}'),
    (vehicles_category_id, 'Two-Wheeler', 'bicycle', '#84CC16', 2, '{"value": 100000, "percentage": 36}')
    ON CONFLICT (category_id, name) DO UPDATE SET
        icon = EXCLUDED.icon,
        color = EXCLUDED.color,
        sort_order = EXCLUDED.sort_order,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();
END $$;

-- 11. Personal Valuables
INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active
) VALUES (
    'Personal Valuables', 'asset', 'diamond', '#A855F7', 
    'Jewelry, art, and personal collectibles', 11, 150000, 1.4, 2, true
) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value,
    percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count,
    updated_at = NOW();

DO $$
DECLARE
    valuables_category_id UUID;
BEGIN
    SELECT id INTO valuables_category_id FROM public.net_worth_categories_real WHERE name = 'Personal Valuables';
    
    INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata) VALUES
    (valuables_category_id, 'Jewelry & Precious Items', 'diamond', '#A855F7', 1, '{"value": 100000, "percentage": 67}'),
    (valuables_category_id, 'Art & Collectibles', 'color-palette', '#A855F7', 2, '{"value": 50000, "percentage": 33}')
    ON CONFLICT (category_id, name) DO UPDATE SET
        icon = EXCLUDED.icon,
        color = EXCLUDED.color,
        sort_order = EXCLUDED.sort_order,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();
END $$;

-- =============================================================================
-- INSERT LIABILITY CATEGORIES
-- =============================================================================

-- 1. Housing Loans
INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active, metadata
) VALUES (
    'Housing Loans', 'liability', 'home', '#EF4444', 
    'Home loans and property-related debt', 1, 1800000, 60, 1, true,
    '{"bank": "HDFC Bank", "emi": 25000, "remaining": 72}'
) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value,
    percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

DO $$
DECLARE
    housing_category_id UUID;
BEGIN
    SELECT id INTO housing_category_id FROM public.net_worth_categories_real WHERE name = 'Housing Loans';
    
    INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order) VALUES
    (housing_category_id, 'Home Loan (Primary Residence)', 1),
    (housing_category_id, 'Home Loan (Second Home)', 2),
    (housing_category_id, 'Plot Purchase Loan', 3),
    (housing_category_id, 'Home Construction Loan', 4),
    (housing_category_id, 'Home Improvement Loan', 5),
    (housing_category_id, 'Home Extension Loan', 6),
    (housing_category_id, 'Loan Against Property (LAP)', 7),
    (housing_category_id, 'Balance Transfer Housing Loan', 8),
    (housing_category_id, 'Top-up Home Loan', 9),
    (housing_category_id, 'Bridge Loan (Real Estate)', 10)
    ON CONFLICT (category_id, name) DO UPDATE SET
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW();
END $$;

-- 2. Vehicle Loans
INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active, metadata
) VALUES (
    'Vehicle Loans', 'liability', 'car', '#F59E0B', 
    'Auto loans and vehicle financing', 2, 450000, 15, 1, true,
    '{"bank": "ICICI Bank", "emi": 12000, "remaining": 36}'
) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value,
    percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

DO $$
DECLARE
    vehicle_category_id UUID;
BEGIN
    SELECT id INTO vehicle_category_id FROM public.net_worth_categories_real WHERE name = 'Vehicle Loans';
    
    INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order) VALUES
    (vehicle_category_id, 'New Car Loan', 1),
    (vehicle_category_id, 'Used Car Loan', 2),
    (vehicle_category_id, 'Two-Wheeler Loan', 3),
    (vehicle_category_id, 'Electric Vehicle Loan', 4),
    (vehicle_category_id, 'Commercial Vehicle Loan', 5),
    (vehicle_category_id, 'Tractor Loan', 6),
    (vehicle_category_id, 'Heavy Equipment Loan', 7),
    (vehicle_category_id, 'Refinanced Vehicle Loan', 8)
    ON CONFLICT (category_id, name) DO UPDATE SET
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW();
END $$;

-- 3. Personal Loans
INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active, metadata
) VALUES (
    'Personal Loans', 'liability', 'person', '#06B6D4', 
    'Unsecured personal loans', 3, 200000, 7, 1, true,
    '{"bank": "Axis Bank", "emi": 8000, "remaining": 30}'
) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value,
    percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

DO $$
DECLARE
    personal_category_id UUID;
BEGIN
    SELECT id INTO personal_category_id FROM public.net_worth_categories_real WHERE name = 'Personal Loans';
    
    INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order) VALUES
    (personal_category_id, 'Unsecured Personal Loan', 1),
    (personal_category_id, 'Wedding Loan', 2),
    (personal_category_id, 'Medical Emergency Loan', 3),
    (personal_category_id, 'Travel/Vacation Loan', 4),
    (personal_category_id, 'Home Renovation Loan (Personal)', 5),
    (personal_category_id, 'Debt Consolidation Loan', 6),
    (personal_category_id, 'Top-up Personal Loan', 7),
    (personal_category_id, 'Instant Personal Loan (App-based)', 8)
    ON CONFLICT (category_id, name) DO UPDATE SET
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW();
END $$;

-- 4. Education Loans
INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active, metadata
) VALUES (
    'Education Loans', 'liability', 'school', '#10B981', 
    'Student loans and education financing', 4, 150000, 5, 1, true,
    '{"bank": "SBI", "emi": 5000, "remaining": 36}'
) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value,
    percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

DO $$
DECLARE
    education_category_id UUID;
BEGIN
    SELECT id INTO education_category_id FROM public.net_worth_categories_real WHERE name = 'Education Loans';
    
    INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order) VALUES
    (education_category_id, 'Higher Education Loan (Domestic)', 1),
    (education_category_id, 'Study Abroad Loan', 2),
    (education_category_id, 'Professional Course Loan (MBA, Medical, etc.)', 3),
    (education_category_id, 'Skill Development Loan', 4),
    (education_category_id, 'Vocational Training Loan', 5),
    (education_category_id, 'Education Loan for Children', 6)
    ON CONFLICT (category_id, name) DO UPDATE SET
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW();
END $$;

-- 5. Credit Card Debt
INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active, metadata
) VALUES (
    'Credit Card Debt', 'liability', 'card', '#8B5CF6', 
    'Credit card outstanding balances', 5, 350000, 12, 1, true,
    '{"bank": "SBI Card", "emi": 15000, "remaining": 24}'
) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value,
    percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

DO $$
DECLARE
    creditcard_category_id UUID;
BEGIN
    SELECT id INTO creditcard_category_id FROM public.net_worth_categories_real WHERE name = 'Credit Card Debt';
    
    INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order) VALUES
    (creditcard_category_id, 'Credit Card Outstanding (Bank 1)', 1),
    (creditcard_category_id, 'Credit Card Outstanding (Bank 2)', 2),
    (creditcard_category_id, 'Credit Card EMI Conversion', 3),
    (creditcard_category_id, 'Store Credit Card Debt', 4),
    (creditcard_category_id, 'Co-branded Credit Card Debt', 5),
    (creditcard_category_id, 'Credit Card Balance Transfer', 6),
    (creditcard_category_id, 'Minimum Due/Revolving Credit', 7)
    ON CONFLICT (category_id, name) DO UPDATE SET
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW();
END $$;

-- 6. Business Loans
INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active, metadata
) VALUES (
    'Business Loans', 'liability', 'business', '#F97316', 
    'Business and commercial loans', 6, 50000, 1, 1, true,
    '{"bank": "Kotak Bank", "emi": 2000, "remaining": 24}'
) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value,
    percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

DO $$
DECLARE
    business_loan_category_id UUID;
BEGIN
    SELECT id INTO business_loan_category_id FROM public.net_worth_categories_real WHERE name = 'Business Loans';
    
    INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order) VALUES
    (business_loan_category_id, 'Business Term Loan', 1),
    (business_loan_category_id, 'Working Capital Loan', 2),
    (business_loan_category_id, 'MSME/SME Loan', 3),
    (business_loan_category_id, 'Mudra Loan (Shishu/Kishore/Tarun)', 4),
    (business_loan_category_id, 'Startup Business Loan', 5),
    (business_loan_category_id, 'Machinery & Equipment Loan', 6),
    (business_loan_category_id, 'Inventory Financing', 7),
    (business_loan_category_id, 'Business Line of Credit', 8),
    (business_loan_category_id, 'Trade Credit/Vendor Credit', 9),
    (business_loan_category_id, 'Invoice Discounting/Factoring', 10),
    (business_loan_category_id, 'Letter of Credit', 11),
    (business_loan_category_id, 'Bank Guarantee (Liability)', 12)
    ON CONFLICT (category_id, name) DO UPDATE SET
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW();
END $$;

-- 7. Loans Against Assets
INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active, metadata
) VALUES (
    'Loans Against Assets', 'liability', 'shield', '#EC4899', 
    'Secured loans against assets', 7, 80000, 3, 1, true,
    '{"bank": "HDFC Bank", "emi": 3000, "remaining": 18}'
) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value,
    percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

DO $$
DECLARE
    asset_loan_category_id UUID;
BEGIN
    SELECT id INTO asset_loan_category_id FROM public.net_worth_categories_real WHERE name = 'Loans Against Assets';
    
    INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order) VALUES
    (asset_loan_category_id, 'Gold Loan', 1),
    (asset_loan_category_id, 'Loan Against Securities (Shares/MF)', 2),
    (asset_loan_category_id, 'Loan Against Fixed Deposit', 3),
    (asset_loan_category_id, 'Loan Against Insurance Policy', 4),
    (asset_loan_category_id, 'Loan Against PPF (Partial)', 5),
    (asset_loan_category_id, 'Loan Against NSC', 6),
    (asset_loan_category_id, 'Loan Against Property (Non-Housing)', 7),
    (asset_loan_category_id, 'Loan Against Salary', 8)
    ON CONFLICT (category_id, name) DO UPDATE SET
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW();
END $$;

-- 8. Short-Term Credit
INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active, metadata
) VALUES (
    'Short-Term Credit', 'liability', 'clock', '#14B8A6', 
    'Short-term and micro credit facilities', 8, 30000, 1, 1, true,
    '{"bank": "Paytm", "emi": 1500, "remaining": 12}'
) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value,
    percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

DO $$
DECLARE
    shortterm_category_id UUID;
BEGIN
    SELECT id INTO shortterm_category_id FROM public.net_worth_categories_real WHERE name = 'Short-Term Credit';
    
    INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order) VALUES
    (shortterm_category_id, 'Payday Loans', 1),
    (shortterm_category_id, 'Cash Advance', 2),
    (shortterm_category_id, 'Salary Advance (Employer)', 3),
    (shortterm_category_id, 'Overdraft Facility (OD)', 4),
    (shortterm_category_id, 'Buy Now Pay Later (BNPL)', 5),
    (shortterm_category_id, 'Consumer Durable EMI', 6),
    (shortterm_category_id, 'Mobile/Electronics Financing', 7),
    (shortterm_category_id, 'Peer-to-Peer (P2P) Loans Taken', 8)
    ON CONFLICT (category_id, name) DO UPDATE SET
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW();
END $$;

-- 9. Tax & Government Dues
INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active, metadata
) VALUES (
    'Tax & Government Dues', 'liability', 'document-text', '#6366F1', 
    'Tax liabilities and government dues', 9, 25000, 1, 1, true,
    '{"bank": "Income Tax", "emi": 0, "remaining": 0}'
) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value,
    percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

DO $$
DECLARE
    tax_category_id UUID;
BEGIN
    SELECT id INTO tax_category_id FROM public.net_worth_categories_real WHERE name = 'Tax & Government Dues';
    
    INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order) VALUES
    (tax_category_id, 'Income Tax Payable', 1),
    (tax_category_id, 'Advance Tax Shortfall', 2),
    (tax_category_id, 'TDS/TCS Shortfall', 3),
    (tax_category_id, 'GST Payable', 4),
    (tax_category_id, 'Property Tax Outstanding', 5),
    (tax_category_id, 'Professional Tax Arrears', 6),
    (tax_category_id, 'Capital Gains Tax Liability', 7),
    (tax_category_id, 'Wealth Tax (if applicable)', 8),
    (tax_category_id, 'Municipal Taxes', 9),
    (tax_category_id, 'Toll Tax/Traffic Fines', 10)
    ON CONFLICT (category_id, name) DO UPDATE SET
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW();
END $$;

-- 10. Utility Bills
INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active, metadata
) VALUES (
    'Utility Bills', 'liability', 'receipt', '#A855F7', 
    'Outstanding utility and service bills', 10, 15000, 1, 1, true,
    '{"bank": "Various", "emi": 500, "remaining": 1}'
) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value,
    percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

DO $$
DECLARE
    utility_category_id UUID;
BEGIN
    SELECT id INTO utility_category_id FROM public.net_worth_categories_real WHERE name = 'Utility Bills';
    
    INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order) VALUES
    (utility_category_id, 'Electricity Bill Outstanding', 1),
    (utility_category_id, 'Water Bill Outstanding', 2),
    (utility_category_id, 'Gas/LPG Bill Outstanding', 3),
    (utility_category_id, 'Internet/Broadband Bill', 4),
    (utility_category_id, 'Mobile Phone Bill', 5),
    (utility_category_id, 'DTH/Cable TV Bill', 6),
    (utility_category_id, 'Society Maintenance Charges', 7),
    (utility_category_id, 'Apartment Association Dues', 8),
    (utility_category_id, 'Property Management Fees', 9)
    ON CONFLICT (category_id, name) DO UPDATE SET
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW();
END $$;

-- 11. Insurance Premiums
INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active, metadata
) VALUES (
    'Insurance Premiums', 'liability', 'shield-checkmark', '#0891B2', 
    'Outstanding insurance premiums', 11, 20000, 1, 1, true,
    '{"bank": "LIC", "emi": 2000, "remaining": 12}'
) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value,
    percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

DO $$
DECLARE
    insurance_premium_category_id UUID;
BEGIN
    SELECT id INTO insurance_premium_category_id FROM public.net_worth_categories_real WHERE name = 'Insurance Premiums';
    
    INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order) VALUES
    (insurance_premium_category_id, 'Life Insurance Premium Due', 1),
    (insurance_premium_category_id, 'Health Insurance Premium Due', 2),
    (insurance_premium_category_id, 'Vehicle Insurance Premium Due', 3),
    (insurance_premium_category_id, 'Home Insurance Premium Due', 4),
    (insurance_premium_category_id, 'Travel Insurance Premium Due', 5),
    (insurance_premium_category_id, 'Professional Indemnity Premium', 6),
    (insurance_premium_category_id, 'Directors & Officers Insurance', 7),
    (insurance_premium_category_id, 'Cyber Insurance Premium', 8)
    ON CONFLICT (category_id, name) DO UPDATE SET
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW();
END $$;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check inserted categories
SELECT 
    name, 
    type, 
    icon, 
    color, 
    total_value, 
    percentage, 
    items_count,
    (SELECT COUNT(*) FROM net_worth_subcategories_real WHERE category_id = nwc.id) as subcategory_count
FROM net_worth_categories_real nwc 
ORDER BY type, sort_order;

-- Check total counts
SELECT 
    type,
    COUNT(*) as category_count,
    SUM(items_count) as total_items,
    SUM(total_value) as total_value
FROM net_worth_categories_real 
GROUP BY type;

-- Check subcategory counts
SELECT 
    nwc.name as category_name,
    COUNT(nws.id) as subcategory_count
FROM net_worth_categories_real nwc
LEFT JOIN net_worth_subcategories_real nws ON nwc.id = nws.category_id
GROUP BY nwc.id, nwc.name
ORDER BY nwc.type, nwc.sort_order;

