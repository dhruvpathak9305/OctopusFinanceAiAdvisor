-- =============================================================================
-- INSERT ALL REAL SUBCATEGORIES FROM MOBILE APP DATA
-- =============================================================================
-- This script removes sample subcategories and inserts ALL real subcategories
-- from your mobile app for both assets and liabilities.
-- =============================================================================

-- STEP 1: Clear existing sample subcategories (optional)
-- DELETE FROM public.net_worth_subcategories_real;

-- =============================================================================
-- ASSET SUBCATEGORIES - ALL 16 CATEGORIES
-- =============================================================================

-- 1. Cash & Cash Equivalents (3 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Savings Bank Account', 'card', '#10B981', 1, '{"value": 120000, "percentage": 71}'::jsonb FROM net_worth_categories_real WHERE name = 'Cash & Cash Equivalents'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Current Account', 'wallet', '#10B981', 2, '{"value": 30000, "percentage": 18}'::jsonb FROM net_worth_categories_real WHERE name = 'Cash & Cash Equivalents'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Digital Wallets', 'phone-portrait', '#10B981', 3, '{"value": 20000, "percentage": 11}'::jsonb FROM net_worth_categories_real WHERE name = 'Cash & Cash Equivalents'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 2. Equity Investments (3 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Direct Stocks/Shares', 'trending-up', '#3B82F6', 1, '{"value": 300000, "percentage": 59}'::jsonb FROM net_worth_categories_real WHERE name = 'Equity Investments'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Equity Mutual Funds', 'bar-chart', '#3B82F6', 2, '{"value": 150000, "percentage": 29}'::jsonb FROM net_worth_categories_real WHERE name = 'Equity Investments'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'ETFs', 'analytics', '#3B82F6', 3, '{"value": 60000, "percentage": 12}'::jsonb FROM net_worth_categories_real WHERE name = 'Equity Investments'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 3. Debt & Fixed Income (3 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Fixed Deposits', 'time', '#8B5CF6', 1, '{"value": 250000, "percentage": 56}'::jsonb FROM net_worth_categories_real WHERE name = 'Debt & Fixed Income'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Government Securities', 'shield', '#8B5CF6', 2, '{"value": 150000, "percentage": 33}'::jsonb FROM net_worth_categories_real WHERE name = 'Debt & Fixed Income'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Corporate Bonds', 'business', '#8B5CF6', 3, '{"value": 50000, "percentage": 11}'::jsonb FROM net_worth_categories_real WHERE name = 'Debt & Fixed Income'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 4. Retirement & Pension Funds (3 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Employee Provident Fund', 'shield-checkmark', '#06B6D4', 1, '{"value": 400000, "percentage": 61}'::jsonb FROM net_worth_categories_real WHERE name = 'Retirement & Pension Funds'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Public Provident Fund', 'shield', '#06B6D4', 2, '{"value": 200000, "percentage": 30}'::jsonb FROM net_worth_categories_real WHERE name = 'Retirement & Pension Funds'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'National Pension System', 'person', '#06B6D4', 3, '{"value": 60000, "percentage": 9}'::jsonb FROM net_worth_categories_real WHERE name = 'Retirement & Pension Funds'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 5. Insurance (Investment) (2 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'ULIP Plans', 'shield', '#EC4899', 1, '{"value": 200000, "percentage": 63}'::jsonb FROM net_worth_categories_real WHERE name = 'Insurance (Investment)'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Endowment Plans', 'heart', '#EC4899', 2, '{"value": 120000, "percentage": 37}'::jsonb FROM net_worth_categories_real WHERE name = 'Insurance (Investment)'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 6. Real Estate (2 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Primary Residence', 'home', '#F59E0B', 1, '{"value": 4000000, "percentage": 86}'::jsonb FROM net_worth_categories_real WHERE name = 'Real Estate'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Rental Property', 'business', '#F59E0B', 2, '{"value": 630000, "percentage": 14}'::jsonb FROM net_worth_categories_real WHERE name = 'Real Estate'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 7. Precious Metals & Commodities (2 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Physical Gold', 'diamond', '#EAB308', 1, '{"value": 1500000, "percentage": 53}'::jsonb FROM net_worth_categories_real WHERE name = 'Precious Metals & Commodities'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Gold ETFs', 'trending-up', '#EAB308', 2, '{"value": 1350000, "percentage": 47}'::jsonb FROM net_worth_categories_real WHERE name = 'Precious Metals & Commodities'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 8. Digital & Crypto Assets (2 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Bitcoin', 'logo-bitcoin', '#F97316', 1, '{"value": 100000, "percentage": 56}'::jsonb FROM net_worth_categories_real WHERE name = 'Digital & Crypto Assets'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Ethereum', 'logo-bitcoin', '#F97316', 2, '{"value": 80000, "percentage": 44}'::jsonb FROM net_worth_categories_real WHERE name = 'Digital & Crypto Assets'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 9. Business & Entrepreneurial (2 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Private Equity', 'business', '#EF4444', 1, '{"value": 500000, "percentage": 63}'::jsonb FROM net_worth_categories_real WHERE name = 'Business & Entrepreneurial'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Intellectual Property', 'document-text', '#EF4444', 2, '{"value": 300000, "percentage": 37}'::jsonb FROM net_worth_categories_real WHERE name = 'Business & Entrepreneurial'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 10. Vehicles (2 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Personal Car', 'car', '#84CC16', 1, '{"value": 180000, "percentage": 64}'::jsonb FROM net_worth_categories_real WHERE name = 'Vehicles'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Two-Wheeler', 'bicycle', '#84CC16', 2, '{"value": 100000, "percentage": 36}'::jsonb FROM net_worth_categories_real WHERE name = 'Vehicles'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 11. Personal Valuables (2 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Jewelry', 'diamond', '#A855F7', 1, '{"value": 80000, "percentage": 53}'::jsonb FROM net_worth_categories_real WHERE name = 'Personal Valuables'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Luxury Watches', 'time', '#A855F7', 2, '{"value": 70000, "percentage": 47}'::jsonb FROM net_worth_categories_real WHERE name = 'Personal Valuables'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 12. Personal Property (2 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Electronics', 'phone-portrait', '#14B8A6', 1, '{"value": 50000, "percentage": 63}'::jsonb FROM net_worth_categories_real WHERE name = 'Personal Property'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Furniture', 'home', '#14B8A6', 2, '{"value": 30000, "percentage": 37}'::jsonb FROM net_worth_categories_real WHERE name = 'Personal Property'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 13. Education Savings (1 subcategory)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Child Education Fund', 'school', '#6366F1', 1, '{"value": 60000, "percentage": 100}'::jsonb FROM net_worth_categories_real WHERE name = 'Education Savings'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 14. Alternative Investments (2 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Private Equity Funds', 'leaf', '#10B981', 1, '{"value": 120000, "percentage": 60}'::jsonb FROM net_worth_categories_real WHERE name = 'Alternative Investments'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'P2P Lending', 'people', '#10B981', 2, '{"value": 80000, "percentage": 40}'::jsonb FROM net_worth_categories_real WHERE name = 'Alternative Investments'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 15. Receivables (2 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Loans Given', 'arrow-back', '#0EA5E9', 1, '{"value": 60000, "percentage": 60}'::jsonb FROM net_worth_categories_real WHERE name = 'Receivables'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Tax Refund Due', 'document', '#0EA5E9', 2, '{"value": 40000, "percentage": 40}'::jsonb FROM net_worth_categories_real WHERE name = 'Receivables'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 16. Miscellaneous Assets (1 subcategory)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, metadata)
SELECT id, 'Collectibles', 'trophy', '#78716C', 1, '{"value": 50000, "percentage": 100}'::jsonb FROM net_worth_categories_real WHERE name = 'Miscellaneous Assets'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, metadata = EXCLUDED.metadata, updated_at = NOW();

-- =============================================================================
-- LIABILITY SUBCATEGORIES - ALL 16 CATEGORIES
-- =============================================================================

-- 1. Housing Loans (10 subcategories)
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
SELECT id, 'Home Improvement Loan', 5 FROM net_worth_categories_real WHERE name = 'Housing Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Home Extension Loan', 6 FROM net_worth_categories_real WHERE name = 'Housing Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Loan Against Property (LAP)', 7 FROM net_worth_categories_real WHERE name = 'Housing Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Balance Transfer Housing Loan', 8 FROM net_worth_categories_real WHERE name = 'Housing Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Top-up Home Loan', 9 FROM net_worth_categories_real WHERE name = 'Housing Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Bridge Loan (Real Estate)', 10 FROM net_worth_categories_real WHERE name = 'Housing Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- 2. Vehicle Loans (8 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'New Car Loan', 1 FROM net_worth_categories_real WHERE name = 'Vehicle Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Used Car Loan', 2 FROM net_worth_categories_real WHERE name = 'Vehicle Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Two-Wheeler Loan', 3 FROM net_worth_categories_real WHERE name = 'Vehicle Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Electric Vehicle Loan', 4 FROM net_worth_categories_real WHERE name = 'Vehicle Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Commercial Vehicle Loan', 5 FROM net_worth_categories_real WHERE name = 'Vehicle Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Tractor Loan', 6 FROM net_worth_categories_real WHERE name = 'Vehicle Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Heavy Equipment Loan', 7 FROM net_worth_categories_real WHERE name = 'Vehicle Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Refinanced Vehicle Loan', 8 FROM net_worth_categories_real WHERE name = 'Vehicle Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- 3. Personal Loans (8 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Unsecured Personal Loan', 1 FROM net_worth_categories_real WHERE name = 'Personal Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Wedding Loan', 2 FROM net_worth_categories_real WHERE name = 'Personal Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Medical Emergency Loan', 3 FROM net_worth_categories_real WHERE name = 'Personal Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Travel/Vacation Loan', 4 FROM net_worth_categories_real WHERE name = 'Personal Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Home Renovation Loan (Personal)', 5 FROM net_worth_categories_real WHERE name = 'Personal Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Debt Consolidation Loan', 6 FROM net_worth_categories_real WHERE name = 'Personal Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Top-up Personal Loan', 7 FROM net_worth_categories_real WHERE name = 'Personal Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Instant Personal Loan (App-based)', 8 FROM net_worth_categories_real WHERE name = 'Personal Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- 4. Education Loans (6 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Higher Education Loan (Domestic)', 1 FROM net_worth_categories_real WHERE name = 'Education Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Study Abroad Loan', 2 FROM net_worth_categories_real WHERE name = 'Education Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Professional Course Loan (MBA, Medical, etc.)', 3 FROM net_worth_categories_real WHERE name = 'Education Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Skill Development Loan', 4 FROM net_worth_categories_real WHERE name = 'Education Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Vocational Training Loan', 5 FROM net_worth_categories_real WHERE name = 'Education Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Education Loan for Children', 6 FROM net_worth_categories_real WHERE name = 'Education Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- 5. Credit Card Debt (7 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Credit Card Outstanding (Bank 1)', 1 FROM net_worth_categories_real WHERE name = 'Credit Card Debt'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Credit Card Outstanding (Bank 2)', 2 FROM net_worth_categories_real WHERE name = 'Credit Card Debt'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Credit Card EMI Conversion', 3 FROM net_worth_categories_real WHERE name = 'Credit Card Debt'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Store Credit Card Debt', 4 FROM net_worth_categories_real WHERE name = 'Credit Card Debt'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Co-branded Credit Card Debt', 5 FROM net_worth_categories_real WHERE name = 'Credit Card Debt'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Credit Card Balance Transfer', 6 FROM net_worth_categories_real WHERE name = 'Credit Card Debt'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Minimum Due/Revolving Credit', 7 FROM net_worth_categories_real WHERE name = 'Credit Card Debt'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- 6. Business Loans (12 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Business Term Loan', 1 FROM net_worth_categories_real WHERE name = 'Business Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Working Capital Loan', 2 FROM net_worth_categories_real WHERE name = 'Business Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'MSME/SME Loan', 3 FROM net_worth_categories_real WHERE name = 'Business Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Mudra Loan (Shishu/Kishore/Tarun)', 4 FROM net_worth_categories_real WHERE name = 'Business Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Startup Business Loan', 5 FROM net_worth_categories_real WHERE name = 'Business Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Machinery & Equipment Loan', 6 FROM net_worth_categories_real WHERE name = 'Business Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Inventory Financing', 7 FROM net_worth_categories_real WHERE name = 'Business Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Business Line of Credit', 8 FROM net_worth_categories_real WHERE name = 'Business Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Trade Credit/Vendor Credit', 9 FROM net_worth_categories_real WHERE name = 'Business Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Invoice Discounting/Factoring', 10 FROM net_worth_categories_real WHERE name = 'Business Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Letter of Credit', 11 FROM net_worth_categories_real WHERE name = 'Business Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Bank Guarantee (Liability)', 12 FROM net_worth_categories_real WHERE name = 'Business Loans'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- 7. Loans Against Assets (8 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Gold Loan', 1 FROM net_worth_categories_real WHERE name = 'Loans Against Assets'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Loan Against Securities (Shares/MF)', 2 FROM net_worth_categories_real WHERE name = 'Loans Against Assets'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Loan Against Fixed Deposit', 3 FROM net_worth_categories_real WHERE name = 'Loans Against Assets'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Loan Against Insurance Policy', 4 FROM net_worth_categories_real WHERE name = 'Loans Against Assets'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Loan Against PPF (Partial)', 5 FROM net_worth_categories_real WHERE name = 'Loans Against Assets'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Loan Against NSC', 6 FROM net_worth_categories_real WHERE name = 'Loans Against Assets'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Loan Against Property (Non-Housing)', 7 FROM net_worth_categories_real WHERE name = 'Loans Against Assets'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Loan Against Salary', 8 FROM net_worth_categories_real WHERE name = 'Loans Against Assets'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- 8. Short-Term Credit (8 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Payday Loans', 1 FROM net_worth_categories_real WHERE name = 'Short-Term Credit'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Cash Advance', 2 FROM net_worth_categories_real WHERE name = 'Short-Term Credit'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Salary Advance (Employer)', 3 FROM net_worth_categories_real WHERE name = 'Short-Term Credit'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Overdraft Facility (OD)', 4 FROM net_worth_categories_real WHERE name = 'Short-Term Credit'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Buy Now Pay Later (BNPL)', 5 FROM net_worth_categories_real WHERE name = 'Short-Term Credit'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Consumer Durable EMI', 6 FROM net_worth_categories_real WHERE name = 'Short-Term Credit'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Mobile/Electronics Financing', 7 FROM net_worth_categories_real WHERE name = 'Short-Term Credit'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Peer-to-Peer (P2P) Loans Taken', 8 FROM net_worth_categories_real WHERE name = 'Short-Term Credit'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- 9. Tax & Government Dues (10 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Income Tax Payable', 1 FROM net_worth_categories_real WHERE name = 'Tax & Government Dues'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Advance Tax Shortfall', 2 FROM net_worth_categories_real WHERE name = 'Tax & Government Dues'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'TDS/TCS Shortfall', 3 FROM net_worth_categories_real WHERE name = 'Tax & Government Dues'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'GST Payable', 4 FROM net_worth_categories_real WHERE name = 'Tax & Government Dues'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Property Tax Outstanding', 5 FROM net_worth_categories_real WHERE name = 'Tax & Government Dues'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Professional Tax Arrears', 6 FROM net_worth_categories_real WHERE name = 'Tax & Government Dues'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Capital Gains Tax Liability', 7 FROM net_worth_categories_real WHERE name = 'Tax & Government Dues'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Wealth Tax (if applicable)', 8 FROM net_worth_categories_real WHERE name = 'Tax & Government Dues'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Municipal Taxes', 9 FROM net_worth_categories_real WHERE name = 'Tax & Government Dues'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Toll Tax/Traffic Fines', 10 FROM net_worth_categories_real WHERE name = 'Tax & Government Dues'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- 10. Utility Bills (9 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Electricity Bill Outstanding', 1 FROM net_worth_categories_real WHERE name = 'Utility Bills'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Water Bill Outstanding', 2 FROM net_worth_categories_real WHERE name = 'Utility Bills'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Gas/LPG Bill Outstanding', 3 FROM net_worth_categories_real WHERE name = 'Utility Bills'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Internet/Broadband Bill', 4 FROM net_worth_categories_real WHERE name = 'Utility Bills'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Mobile Phone Bill', 5 FROM net_worth_categories_real WHERE name = 'Utility Bills'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'DTH/Cable TV Bill', 6 FROM net_worth_categories_real WHERE name = 'Utility Bills'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Society Maintenance Charges', 7 FROM net_worth_categories_real WHERE name = 'Utility Bills'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Apartment Association Dues', 8 FROM net_worth_categories_real WHERE name = 'Utility Bills'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Property Management Fees', 9 FROM net_worth_categories_real WHERE name = 'Utility Bills'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- 11. Insurance Premiums (8 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Life Insurance Premium Due', 1 FROM net_worth_categories_real WHERE name = 'Insurance Premiums'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Health Insurance Premium Due', 2 FROM net_worth_categories_real WHERE name = 'Insurance Premiums'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Vehicle Insurance Premium Due', 3 FROM net_worth_categories_real WHERE name = 'Insurance Premiums'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Home Insurance Premium Due', 4 FROM net_worth_categories_real WHERE name = 'Insurance Premiums'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Travel Insurance Premium Due', 5 FROM net_worth_categories_real WHERE name = 'Insurance Premiums'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Professional Indemnity Premium', 6 FROM net_worth_categories_real WHERE name = 'Insurance Premiums'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Directors & Officers Insurance', 7 FROM net_worth_categories_real WHERE name = 'Insurance Premiums'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Cyber Insurance Premium', 8 FROM net_worth_categories_real WHERE name = 'Insurance Premiums'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- 12. Legal Obligations (7 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Alimony Payments', 1 FROM net_worth_categories_real WHERE name = 'Legal Obligations'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Child Support Payments', 2 FROM net_worth_categories_real WHERE name = 'Legal Obligations'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Legal Settlement Obligations', 3 FROM net_worth_categories_real WHERE name = 'Legal Obligations'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Court-ordered Compensation', 4 FROM net_worth_categories_real WHERE name = 'Legal Obligations'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Lawsuit Liabilities', 5 FROM net_worth_categories_real WHERE name = 'Legal Obligations'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Arbitration Awards Payable', 6 FROM net_worth_categories_real WHERE name = 'Legal Obligations'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Penalty/Fine Payments', 7 FROM net_worth_categories_real WHERE name = 'Legal Obligations'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- 13. Personal Borrowings (9 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Money Borrowed from Parents', 1 FROM net_worth_categories_real WHERE name = 'Personal Borrowings'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Money Borrowed from Siblings', 2 FROM net_worth_categories_real WHERE name = 'Personal Borrowings'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Money Borrowed from Friends', 3 FROM net_worth_categories_real WHERE name = 'Personal Borrowings'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Money Borrowed from Relatives', 4 FROM net_worth_categories_real WHERE name = 'Personal Borrowings'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Chit Fund Installments', 5 FROM net_worth_categories_real WHERE name = 'Personal Borrowings'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Community Group Loans', 6 FROM net_worth_categories_real WHERE name = 'Personal Borrowings'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Informal/Undocumented Loans', 7 FROM net_worth_categories_real WHERE name = 'Personal Borrowings'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Business Partner Payables', 8 FROM net_worth_categories_real WHERE name = 'Personal Borrowings'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Joint Family Financial Obligations', 9 FROM net_worth_categories_real WHERE name = 'Personal Borrowings'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- 14. Subscriptions (10 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'OTT Subscriptions (Netflix, Prime, etc.)', 1 FROM net_worth_categories_real WHERE name = 'Subscriptions'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Software Subscriptions (Office, Adobe, etc.)', 2 FROM net_worth_categories_real WHERE name = 'Subscriptions'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Cloud Storage Subscriptions', 3 FROM net_worth_categories_real WHERE name = 'Subscriptions'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Music Streaming (Spotify, Apple Music)', 4 FROM net_worth_categories_real WHERE name = 'Subscriptions'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Gym/Fitness Membership', 5 FROM net_worth_categories_real WHERE name = 'Subscriptions'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Club Membership Fees', 6 FROM net_worth_categories_real WHERE name = 'Subscriptions'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Professional Association Fees', 7 FROM net_worth_categories_real WHERE name = 'Subscriptions'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Magazine/Newspaper Subscriptions', 8 FROM net_worth_categories_real WHERE name = 'Subscriptions'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Annual Maintenance Contracts (AMC)', 9 FROM net_worth_categories_real WHERE name = 'Subscriptions'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Domain & Hosting Renewals', 10 FROM net_worth_categories_real WHERE name = 'Subscriptions'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- 15. Trading Liabilities (9 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Margin Trading Facility (MTF)', 1 FROM net_worth_categories_real WHERE name = 'Trading Liabilities'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Futures & Options (Mark-to-Market Loss)', 2 FROM net_worth_categories_real WHERE name = 'Trading Liabilities'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Short Selling Liability', 3 FROM net_worth_categories_real WHERE name = 'Trading Liabilities'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Securities Borrowing', 4 FROM net_worth_categories_real WHERE name = 'Trading Liabilities'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Broker Financing', 5 FROM net_worth_categories_real WHERE name = 'Trading Liabilities'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Demat Account Charges Due', 6 FROM net_worth_categories_real WHERE name = 'Trading Liabilities'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Exchange Transaction Fees Due', 7 FROM net_worth_categories_real WHERE name = 'Trading Liabilities'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Crypto Exchange Debt', 8 FROM net_worth_categories_real WHERE name = 'Trading Liabilities'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Margin Call Obligations', 9 FROM net_worth_categories_real WHERE name = 'Trading Liabilities'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- 16. Miscellaneous Liabilities (11 subcategories)
INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Advance Received (Goods/Services Pending)', 1 FROM net_worth_categories_real WHERE name = 'Miscellaneous Liabilities'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Security Deposit Received (To be Returned)', 2 FROM net_worth_categories_real WHERE name = 'Miscellaneous Liabilities'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Rent Deposit (Landlord - To Tenant)', 3 FROM net_worth_categories_real WHERE name = 'Miscellaneous Liabilities'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Pre-paid Services (Unused)', 4 FROM net_worth_categories_real WHERE name = 'Miscellaneous Liabilities'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Gift Cards/Vouchers Issued', 5 FROM net_worth_categories_real WHERE name = 'Miscellaneous Liabilities'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Pending Warranty Claims', 6 FROM net_worth_categories_real WHERE name = 'Miscellaneous Liabilities'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Post-dated Cheques Issued', 7 FROM net_worth_categories_real WHERE name = 'Miscellaneous Liabilities'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Contractor Payments Pending', 8 FROM net_worth_categories_real WHERE name = 'Miscellaneous Liabilities'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Vendor Payables', 9 FROM net_worth_categories_real WHERE name = 'Miscellaneous Liabilities'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Accrued Expenses (Unpaid)', 10 FROM net_worth_categories_real WHERE name = 'Miscellaneous Liabilities'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, sort_order)
SELECT id, 'Deferred Payment Obligations', 11 FROM net_worth_categories_real WHERE name = 'Miscellaneous Liabilities'
ON CONFLICT (category_id, name) DO UPDATE SET sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Show subcategory counts by category
SELECT 
    nwc.name as category_name,
    nwc.type,
    COUNT(nws.id) as subcategory_count,
    nwc.total_value,
    nwc.percentage
FROM net_worth_categories_real nwc
LEFT JOIN net_worth_subcategories_real nws ON nwc.id = nws.category_id
WHERE nwc.is_active = true AND (nws.is_active IS NULL OR nws.is_active = true)
GROUP BY nwc.id, nwc.name, nwc.type, nwc.total_value, nwc.percentage, nwc.sort_order
ORDER BY nwc.type DESC, nwc.sort_order;

-- Show total subcategory counts
SELECT 
    nwc.type,
    COUNT(nws.id) as total_subcategories
FROM net_worth_categories_real nwc
LEFT JOIN net_worth_subcategories_real nws ON nwc.id = nws.category_id
WHERE nwc.is_active = true AND (nws.is_active IS NULL OR nws.is_active = true)
GROUP BY nwc.type
ORDER BY nwc.type DESC;

-- Show grand total
SELECT COUNT(*) as total_subcategories 
FROM net_worth_subcategories_real 
WHERE is_active = true;

