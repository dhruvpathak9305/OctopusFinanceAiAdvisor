-- =============================================================================
-- SUPABASE SQL EDITOR: POPULATE NET WORTH DATA FROM MOBILE APP
-- =============================================================================
-- Run this script in your Supabase SQL Editor to populate the net worth
-- categories and subcategories with data from your mobile app.
--
-- Instructions:
-- 1. Copy and paste this entire script into Supabase SQL Editor
-- 2. Click "Run" to execute
-- 3. Check the results at the bottom for verification
-- =============================================================================

-- First, update the schema to support additional fields
ALTER TABLE public.net_worth_categories_real 
ADD COLUMN IF NOT EXISTS total_value NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS percentage NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS items_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

ALTER TABLE public.net_worth_subcategories_real
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_net_worth_categories_real_type_value 
ON public.net_worth_categories_real(type, total_value DESC);

CREATE INDEX IF NOT EXISTS idx_net_worth_categories_real_percentage 
ON public.net_worth_categories_real(percentage DESC);

-- =============================================================================
-- CLEAR EXISTING DATA (OPTIONAL - UNCOMMENT IF YOU WANT FRESH START)
-- =============================================================================
-- DELETE FROM public.net_worth_subcategories_real;
-- DELETE FROM public.net_worth_categories_real;

-- =============================================================================
-- INSERT ASSET CATEGORIES WITH SUBCATEGORIES
-- =============================================================================

-- 1. Cash & Cash Equivalents
WITH category_insert AS (
  INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active
  ) VALUES (
    'Cash & Cash Equivalents', 'asset', 'cash', '#10B981', 
    'Liquid cash and cash equivalent assets', 1, 170000, 1.6, 3, true
  ) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type, icon = EXCLUDED.icon, color = EXCLUDED.color,
    description = EXCLUDED.description, sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value, percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count, updated_at = NOW()
  RETURNING id
)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT 
  category_insert.id,
  subcategory.name,
  subcategory.icon,
  subcategory.color,
  subcategory.sort_order,
  subcategory.metadata::jsonb
FROM category_insert,
(VALUES 
  ('Savings Bank Account', 'card', '#10B981', 1, '{"value": 120000, "percentage": 71}'),
  ('Current Account', 'wallet', '#10B981', 2, '{"value": 30000, "percentage": 18}'),
  ('Digital Wallets', 'phone-portrait', '#10B981', 3, '{"value": 20000, "percentage": 11}')
) AS subcategory(name, icon, color, sort_order, metadata)
ON CONFLICT (category_id, name) DO UPDATE SET
  icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order,
  metadata = EXCLUDED.metadata, updated_at = NOW();

-- 2. Equity Investments
WITH category_insert AS (
  INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active
  ) VALUES (
    'Equity Investments', 'asset', 'trending-up', '#3B82F6', 
    'Stock market and equity-based investments', 2, 510000, 4.8, 4, true
  ) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type, icon = EXCLUDED.icon, color = EXCLUDED.color,
    description = EXCLUDED.description, sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value, percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count, updated_at = NOW()
  RETURNING id
)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT 
  category_insert.id, subcategory.name, subcategory.icon, subcategory.color, subcategory.sort_order, subcategory.metadata::jsonb
FROM category_insert,
(VALUES 
  ('Direct Stocks/Shares', 'trending-up', '#3B82F6', 1, '{"value": 300000, "percentage": 59}'),
  ('Equity Mutual Funds', 'bar-chart', '#3B82F6', 2, '{"value": 150000, "percentage": 29}'),
  ('ETFs', 'analytics', '#3B82F6', 3, '{"value": 60000, "percentage": 12}')
) AS subcategory(name, icon, color, sort_order, metadata)
ON CONFLICT (category_id, name) DO UPDATE SET
  icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order,
  metadata = EXCLUDED.metadata, updated_at = NOW();

-- 3. Real Estate
WITH category_insert AS (
  INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active
  ) VALUES (
    'Real Estate', 'asset', 'home', '#F59E0B', 
    'Property and real estate investments', 6, 4630000, 43.1, 2, true
  ) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type, icon = EXCLUDED.icon, color = EXCLUDED.color,
    description = EXCLUDED.description, sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value, percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count, updated_at = NOW()
  RETURNING id
)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT 
  category_insert.id, subcategory.name, subcategory.icon, subcategory.color, subcategory.sort_order, subcategory.metadata::jsonb
FROM category_insert,
(VALUES 
  ('Primary Residence', 'home', '#F59E0B', 1, '{"value": 4000000, "percentage": 86}'),
  ('Rental Property', 'business', '#F59E0B', 2, '{"value": 630000, "percentage": 14}')
) AS subcategory(name, icon, color, sort_order, metadata)
ON CONFLICT (category_id, name) DO UPDATE SET
  icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order,
  metadata = EXCLUDED.metadata, updated_at = NOW();

-- 4. Vehicles
WITH category_insert AS (
  INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active
  ) VALUES (
    'Vehicles', 'asset', 'car', '#84CC16', 
    'Personal and commercial vehicles', 10, 280000, 2.6, 2, true
  ) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type, icon = EXCLUDED.icon, color = EXCLUDED.color,
    description = EXCLUDED.description, sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value, percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count, updated_at = NOW()
  RETURNING id
)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT 
  category_insert.id, subcategory.name, subcategory.icon, subcategory.color, subcategory.sort_order, subcategory.metadata::jsonb
FROM category_insert,
(VALUES 
  ('Personal Car', 'car', '#84CC16', 1, '{"value": 180000, "percentage": 64}'),
  ('Two-Wheeler', 'bicycle', '#84CC16', 2, '{"value": 100000, "percentage": 36}')
) AS subcategory(name, icon, color, sort_order, metadata)
ON CONFLICT (category_id, name) DO UPDATE SET
  icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order,
  metadata = EXCLUDED.metadata, updated_at = NOW();

-- =============================================================================
-- INSERT LIABILITY CATEGORIES WITH SUBCATEGORIES
-- =============================================================================

-- 1. Housing Loans
WITH category_insert AS (
  INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active, metadata
  ) VALUES (
    'Housing Loans', 'liability', 'home', '#EF4444', 
    'Home loans and property-related debt', 1, 1800000, 60, 1, true,
    '{"bank": "HDFC Bank", "emi": 25000, "remaining": 72}'::jsonb
  ) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type, icon = EXCLUDED.icon, color = EXCLUDED.color,
    description = EXCLUDED.description, sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value, percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count, metadata = EXCLUDED.metadata, updated_at = NOW()
  RETURNING id
)
INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT 
  category_insert.id, subcategory.name, subcategory.sort_order
FROM category_insert,
(VALUES 
  ('Home Loan (Primary Residence)', 1),
  ('Home Loan (Second Home)', 2),
  ('Plot Purchase Loan', 3),
  ('Home Construction Loan', 4),
  ('Loan Against Property (LAP)', 5)
) AS subcategory(name, sort_order)
ON CONFLICT (category_id, name) DO UPDATE SET
  sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- 2. Vehicle Loans
WITH category_insert AS (
  INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active, metadata
  ) VALUES (
    'Vehicle Loans', 'liability', 'car', '#F59E0B', 
    'Auto loans and vehicle financing', 2, 450000, 15, 1, true,
    '{"bank": "ICICI Bank", "emi": 12000, "remaining": 36}'::jsonb
  ) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type, icon = EXCLUDED.icon, color = EXCLUDED.color,
    description = EXCLUDED.description, sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value, percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count, metadata = EXCLUDED.metadata, updated_at = NOW()
  RETURNING id
)
INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT 
  category_insert.id, subcategory.name, subcategory.sort_order
FROM category_insert,
(VALUES 
  ('New Car Loan', 1),
  ('Used Car Loan', 2),
  ('Two-Wheeler Loan', 3),
  ('Electric Vehicle Loan', 4)
) AS subcategory(name, sort_order)
ON CONFLICT (category_id, name) DO UPDATE SET
  sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- 3. Credit Card Debt
WITH category_insert AS (
  INSERT INTO public.net_worth_categories_real (
    name, type, icon, color, description, sort_order, total_value, percentage, items_count, is_active, metadata
  ) VALUES (
    'Credit Card Debt', 'liability', 'card', '#8B5CF6', 
    'Credit card outstanding balances', 5, 350000, 12, 1, true,
    '{"bank": "SBI Card", "emi": 15000, "remaining": 24}'::jsonb
  ) ON CONFLICT (name) DO UPDATE SET
    type = EXCLUDED.type, icon = EXCLUDED.icon, color = EXCLUDED.color,
    description = EXCLUDED.description, sort_order = EXCLUDED.sort_order,
    total_value = EXCLUDED.total_value, percentage = EXCLUDED.percentage,
    items_count = EXCLUDED.items_count, metadata = EXCLUDED.metadata, updated_at = NOW()
  RETURNING id
)
INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT 
  category_insert.id, subcategory.name, subcategory.sort_order
FROM category_insert,
(VALUES 
  ('Credit Card Outstanding (Bank 1)', 1),
  ('Credit Card Outstanding (Bank 2)', 2),
  ('Credit Card EMI Conversion', 3),
  ('Store Credit Card Debt', 4)
) AS subcategory(name, sort_order)
ON CONFLICT (category_id, name) DO UPDATE SET
  sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- =============================================================================
-- VERIFICATION QUERIES - CHECK RESULTS
-- =============================================================================

-- Show all categories with subcategory counts
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

-- Show sample subcategories
SELECT 
    nwc.name as category_name,
    nws.name as subcategory_name,
    nws.icon,
    nws.color,
    nws.metadata
FROM net_worth_categories_real nwc
JOIN net_worth_subcategories_real nws ON nwc.id = nws.category_id
WHERE nwc.type = 'asset'
ORDER BY nwc.sort_order, nws.sort_order
LIMIT 10;

