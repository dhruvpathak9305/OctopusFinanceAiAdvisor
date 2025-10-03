-- =============================================================================
-- COMPLETE NET WORTH DATA POPULATION FROM MOBILE APP
-- =============================================================================
-- This script includes ALL categories and subcategories from your mobile app
-- Run this in Supabase SQL Editor for complete data population
-- =============================================================================

-- Update schema first
ALTER TABLE public.net_worth_categories_real 
ADD COLUMN IF NOT EXISTS total_value NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS percentage NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS items_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

ALTER TABLE public.net_worth_subcategories_real
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- =============================================================================
-- ALL ASSET CATEGORIES
-- =============================================================================

-- Cash & Cash Equivalents
INSERT INTO public.net_worth_categories_real (name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active) 
VALUES ('Cash & Cash Equivalents', 'asset', 'cash', '#10B981', 'Liquid cash and cash equivalent assets', 1, 170000, 1.6, 3, true) 
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, icon = EXCLUDED.icon, color = EXCLUDED.color, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, total_value = EXCLUDED.total_value, percentage = EXCLUDED.percentage, items_count = EXCLUDED.items_count, updated_at = NOW();

-- Equity Investments
INSERT INTO public.net_worth_categories_real (name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active) 
VALUES ('Equity Investments', 'asset', 'trending-up', '#3B82F6', 'Stock market and equity-based investments', 2, 510000, 4.8, 4, true) 
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, icon = EXCLUDED.icon, color = EXCLUDED.color, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, total_value = EXCLUDED.total_value, percentage = EXCLUDED.percentage, items_count = EXCLUDED.items_count, updated_at = NOW();

-- Debt & Fixed Income
INSERT INTO public.net_worth_categories_real (name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active) 
VALUES ('Debt & Fixed Income', 'asset', 'trending-down', '#8B5CF6', 'Fixed income and debt instruments', 3, 450000, 4.2, 3, true) 
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, icon = EXCLUDED.icon, color = EXCLUDED.color, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, total_value = EXCLUDED.total_value, percentage = EXCLUDED.percentage, items_count = EXCLUDED.items_count, updated_at = NOW();

-- Retirement & Pension Funds
INSERT INTO public.net_worth_categories_real (name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active) 
VALUES ('Retirement & Pension Funds', 'asset', 'shield-checkmark', '#06B6D4', 'Retirement savings and pension funds', 4, 660000, 6.2, 3, true) 
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, icon = EXCLUDED.icon, color = EXCLUDED.color, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, total_value = EXCLUDED.total_value, percentage = EXCLUDED.percentage, items_count = EXCLUDED.items_count, updated_at = NOW();

-- Insurance (Investment)
INSERT INTO public.net_worth_categories_real (name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active) 
VALUES ('Insurance (Investment)', 'asset', 'shield', '#EC4899', 'Investment-linked insurance products', 5, 320000, 3.0, 2, true) 
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, icon = EXCLUDED.icon, color = EXCLUDED.color, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, total_value = EXCLUDED.total_value, percentage = EXCLUDED.percentage, items_count = EXCLUDED.items_count, updated_at = NOW();

-- Real Estate
INSERT INTO public.net_worth_categories_real (name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active) 
VALUES ('Real Estate', 'asset', 'home', '#F59E0B', 'Property and real estate investments', 6, 4630000, 43.1, 2, true) 
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, icon = EXCLUDED.icon, color = EXCLUDED.color, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, total_value = EXCLUDED.total_value, percentage = EXCLUDED.percentage, items_count = EXCLUDED.items_count, updated_at = NOW();

-- Precious Metals & Commodities
INSERT INTO public.net_worth_categories_real (name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active) 
VALUES ('Precious Metals & Commodities', 'asset', 'diamond', '#EAB308', 'Gold, silver and other precious metals', 7, 2850000, 26.6, 2, true) 
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, icon = EXCLUDED.icon, color = EXCLUDED.color, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, total_value = EXCLUDED.total_value, percentage = EXCLUDED.percentage, items_count = EXCLUDED.items_count, updated_at = NOW();

-- Digital & Crypto Assets
INSERT INTO public.net_worth_categories_real (name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active) 
VALUES ('Digital & Crypto Assets', 'asset', 'logo-bitcoin', '#F97316', 'Cryptocurrency and digital assets', 8, 180000, 1.7, 2, true) 
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, icon = EXCLUDED.icon, color = EXCLUDED.color, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, total_value = EXCLUDED.total_value, percentage = EXCLUDED.percentage, items_count = EXCLUDED.items_count, updated_at = NOW();

-- Business & Entrepreneurial
INSERT INTO public.net_worth_categories_real (name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active) 
VALUES ('Business & Entrepreneurial', 'asset', 'business', '#EF4444', 'Business investments and entrepreneurial assets', 9, 800000, 7.4, 2, true) 
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, icon = EXCLUDED.icon, color = EXCLUDED.color, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, total_value = EXCLUDED.total_value, percentage = EXCLUDED.percentage, items_count = EXCLUDED.items_count, updated_at = NOW();

-- Vehicles
INSERT INTO public.net_worth_categories_real (name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active) 
VALUES ('Vehicles', 'asset', 'car', '#84CC16', 'Personal and commercial vehicles', 10, 280000, 2.6, 2, true) 
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, icon = EXCLUDED.icon, color = EXCLUDED.color, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, total_value = EXCLUDED.total_value, percentage = EXCLUDED.percentage, items_count = EXCLUDED.items_count, updated_at = NOW();

-- Personal Valuables
INSERT INTO public.net_worth_categories_real (name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active) 
VALUES ('Personal Valuables', 'asset', 'diamond', '#A855F7', 'Jewelry, art, and personal collectibles', 11, 150000, 1.4, 2, true) 
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, icon = EXCLUDED.icon, color = EXCLUDED.color, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, total_value = EXCLUDED.total_value, percentage = EXCLUDED.percentage, items_count = EXCLUDED.items_count, updated_at = NOW();

-- =============================================================================
-- ALL LIABILITY CATEGORIES
-- =============================================================================

-- Housing Loans
INSERT INTO public.net_worth_categories_real (name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active, metadata) 
VALUES ('Housing Loans', 'liability', 'home', '#EF4444', 'Home loans and property-related debt', 1, 1800000, 60, 1, true, '{"bank": "HDFC Bank", "emi": 25000, "remaining": 72}'::jsonb) 
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, icon = EXCLUDED.icon, color = EXCLUDED.color, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, total_value = EXCLUDED.total_value, percentage = EXCLUDED.percentage, items_count = EXCLUDED.items_count, metadata = EXCLUDED.metadata, updated_at = NOW();

-- Vehicle Loans
INSERT INTO public.net_worth_categories_real (name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active, metadata) 
VALUES ('Vehicle Loans', 'liability', 'car', '#F59E0B', 'Auto loans and vehicle financing', 2, 450000, 15, 1, true, '{"bank": "ICICI Bank", "emi": 12000, "remaining": 36}'::jsonb) 
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, icon = EXCLUDED.icon, color = EXCLUDED.color, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, total_value = EXCLUDED.total_value, percentage = EXCLUDED.percentage, items_count = EXCLUDED.items_count, metadata = EXCLUDED.metadata, updated_at = NOW();

-- Personal Loans
INSERT INTO public.net_worth_categories_real (name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active, metadata) 
VALUES ('Personal Loans', 'liability', 'person', '#06B6D4', 'Unsecured personal loans', 3, 200000, 7, 1, true, '{"bank": "Axis Bank", "emi": 8000, "remaining": 30}'::jsonb) 
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, icon = EXCLUDED.icon, color = EXCLUDED.color, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, total_value = EXCLUDED.total_value, percentage = EXCLUDED.percentage, items_count = EXCLUDED.items_count, metadata = EXCLUDED.metadata, updated_at = NOW();

-- Education Loans
INSERT INTO public.net_worth_categories_real (name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active, metadata) 
VALUES ('Education Loans', 'liability', 'school', '#10B981', 'Student loans and education financing', 4, 150000, 5, 1, true, '{"bank": "SBI", "emi": 5000, "remaining": 36}'::jsonb) 
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, icon = EXCLUDED.icon, color = EXCLUDED.color, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, total_value = EXCLUDED.total_value, percentage = EXCLUDED.percentage, items_count = EXCLUDED.items_count, metadata = EXCLUDED.metadata, updated_at = NOW();

-- Credit Card Debt
INSERT INTO public.net_worth_categories_real (name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active, metadata) 
VALUES ('Credit Card Debt', 'liability', 'card', '#8B5CF6', 'Credit card outstanding balances', 5, 350000, 12, 1, true, '{"bank": "SBI Card", "emi": 15000, "remaining": 24}'::jsonb) 
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, icon = EXCLUDED.icon, color = EXCLUDED.color, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, total_value = EXCLUDED.total_value, percentage = EXCLUDED.percentage, items_count = EXCLUDED.items_count, metadata = EXCLUDED.metadata, updated_at = NOW();

-- Business Loans
INSERT INTO public.net_worth_categories_real (name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active, metadata) 
VALUES ('Business Loans', 'liability', 'business', '#F97316', 'Business and commercial loans', 6, 50000, 1, 1, true, '{"bank": "Kotak Bank", "emi": 2000, "remaining": 24}'::jsonb) 
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, icon = EXCLUDED.icon, color = EXCLUDED.color, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, total_value = EXCLUDED.total_value, percentage = EXCLUDED.percentage, items_count = EXCLUDED.items_count, metadata = EXCLUDED.metadata, updated_at = NOW();

-- =============================================================================
-- ASSET SUBCATEGORIES
-- =============================================================================

-- Cash & Cash Equivalents subcategories
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Savings Bank Account', 'card', '#10B981', 1, '{"value": 120000, "percentage": 71}'::jsonb FROM net_worth_categories_real WHERE name = 'Cash & Cash Equivalents'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Current Account', 'wallet', '#10B981', 2, '{"value": 30000, "percentage": 18}'::jsonb FROM net_worth_categories_real WHERE name = 'Cash & Cash Equivalents'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Digital Wallets', 'phone-portrait', '#10B981', 3, '{"value": 20000, "percentage": 11}'::jsonb FROM net_worth_categories_real WHERE name = 'Cash & Cash Equivalents'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

-- Equity Investments subcategories
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Direct Stocks/Shares', 'trending-up', '#3B82F6', 1, '{"value": 300000, "percentage": 59}'::jsonb FROM net_worth_categories_real WHERE name = 'Equity Investments'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Equity Mutual Funds', 'bar-chart', '#3B82F6', 2, '{"value": 150000, "percentage": 29}'::jsonb FROM net_worth_categories_real WHERE name = 'Equity Investments'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'ETFs', 'analytics', '#3B82F6', 3, '{"value": 60000, "percentage": 12}'::jsonb FROM net_worth_categories_real WHERE name = 'Equity Investments'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

-- Real Estate subcategories
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Primary Residence', 'home', '#F59E0B', 1, '{"value": 4000000, "percentage": 86}'::jsonb FROM net_worth_categories_real WHERE name = 'Real Estate'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Rental Property', 'business', '#F59E0B', 2, '{"value": 630000, "percentage": 14}'::jsonb FROM net_worth_categories_real WHERE name = 'Real Estate'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

-- Vehicles subcategories
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Personal Car', 'car', '#84CC16', 1, '{"value": 180000, "percentage": 64}'::jsonb FROM net_worth_categories_real WHERE name = 'Vehicles'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Two-Wheeler', 'bicycle', '#84CC16', 2, '{"value": 100000, "percentage": 36}'::jsonb FROM net_worth_categories_real WHERE name = 'Vehicles'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

-- =============================================================================
-- LIABILITY SUBCATEGORIES
-- =============================================================================

-- Housing Loans subcategories
INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Home Loan (Primary Residence)', 1 FROM net_worth_categories_real WHERE name = 'Housing Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Home Loan (Second Home)', 2 FROM net_worth_categories_real WHERE name = 'Housing Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Plot Purchase Loan', 3 FROM net_worth_categories_real WHERE name = 'Housing Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Home Construction Loan', 4 FROM net_worth_categories_real WHERE name = 'Housing Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Loan Against Property (LAP)', 5 FROM net_worth_categories_real WHERE name = 'Housing Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- Vehicle Loans subcategories
INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'New Car Loan', 1 FROM net_worth_categories_real WHERE name = 'Vehicle Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Used Car Loan', 2 FROM net_worth_categories_real WHERE name = 'Vehicle Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Two-Wheeler Loan', 3 FROM net_worth_categories_real WHERE name = 'Vehicle Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- Credit Card Debt subcategories
INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Credit Card Outstanding (Bank 1)', 1 FROM net_worth_categories_real WHERE name = 'Credit Card Debt'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Credit Card Outstanding (Bank 2)', 2 FROM net_worth_categories_real WHERE name = 'Credit Card Debt'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Credit Card EMI Conversion', 3 FROM net_worth_categories_real WHERE name = 'Credit Card Debt'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Show all categories with counts
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
ORDER BY type DESC, sort_order;

-- Show summary by type
SELECT 
    type,
    COUNT(*) as category_count,
    SUM(items_count) as total_items,
    SUM(total_value) as total_value,
    ROUND(SUM(percentage), 2) as total_percentage
FROM net_worth_categories_real 
WHERE is_active = true
GROUP BY type
ORDER BY type DESC;

-- Show total subcategories
SELECT COUNT(*) as total_subcategories FROM net_worth_subcategories_real;

