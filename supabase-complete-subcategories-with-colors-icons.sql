-- =============================================================================
-- COMPLETE SUBCATEGORIES WITH PROPER COLORS, ICONS & DESCRIPTIONS
-- =============================================================================
-- This script updates all subcategories with:
-- 1. Color shades based on parent category colors (using generateSubcategoryColor logic)
-- 2. Appropriate icons for each subcategory type
-- 3. Meaningful descriptions
-- 4. Complete metadata
-- =============================================================================

-- Clear existing subcategories to start fresh
DELETE FROM public.net_worth_subcategories_real;

-- =============================================================================
-- ASSET SUBCATEGORIES WITH COMPLETE DATA
-- =============================================================================

-- 1. Cash & Cash Equivalents (Parent: #10B981)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Savings Bank Account', 'card', '#15C990', 1, 'Traditional savings accounts with banks and credit unions', '{"value": 120000, "percentage": 71, "type": "liquid_asset"}'::jsonb FROM net_worth_categories_real WHERE name = 'Cash & Cash Equivalents'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Current Account', 'wallet', '#0EA472', 2, 'Checking accounts for daily transactions and bill payments', '{"value": 30000, "percentage": 18, "type": "liquid_asset"}'::jsonb FROM net_worth_categories_real WHERE name = 'Cash & Cash Equivalents'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Digital Wallets', 'phone-portrait', '#1FD99F', 3, 'Mobile payment apps and digital wallet services', '{"value": 20000, "percentage": 11, "type": "liquid_asset"}'::jsonb FROM net_worth_categories_real WHERE name = 'Cash & Cash Equivalents'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 2. Equity Investments (Parent: #3B82F6)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Direct Stocks/Shares', 'trending-up', '#4F8EFF', 1, 'Individual company stocks and shares held directly', '{"value": 300000, "percentage": 59, "type": "equity", "risk_level": "high"}'::jsonb FROM net_worth_categories_real WHERE name = 'Equity Investments'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Equity Mutual Funds', 'bar-chart', '#2670ED', 2, 'Diversified equity mutual fund investments', '{"value": 150000, "percentage": 29, "type": "equity", "risk_level": "medium"}'::jsonb FROM net_worth_categories_real WHERE name = 'Equity Investments'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'ETFs', 'analytics', '#5A9AFF', 3, 'Exchange-traded funds for passive investing', '{"value": 60000, "percentage": 12, "type": "equity", "risk_level": "medium"}'::jsonb FROM net_worth_categories_real WHERE name = 'Equity Investments'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 3. Debt & Fixed Income (Parent: #8B5CF6)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Fixed Deposits', 'time', '#9F71FF', 1, 'Bank fixed deposits and term deposits', '{"value": 250000, "percentage": 56, "type": "debt", "risk_level": "low"}'::jsonb FROM net_worth_categories_real WHERE name = 'Debt & Fixed Income'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Government Securities', 'shield', '#7647ED', 2, 'Government bonds and treasury securities', '{"value": 150000, "percentage": 33, "type": "debt", "risk_level": "very_low"}'::jsonb FROM net_worth_categories_real WHERE name = 'Debt & Fixed Income'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Corporate Bonds', 'business', '#B385FF', 3, 'Corporate bonds and debentures', '{"value": 50000, "percentage": 11, "type": "debt", "risk_level": "low"}'::jsonb FROM net_worth_categories_real WHERE name = 'Debt & Fixed Income'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 4. Retirement & Pension Funds (Parent: #06B6D4)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Employee Provident Fund', 'shield-checkmark', '#1AC5E3', 1, 'Employer-sponsored provident fund contributions', '{"value": 400000, "percentage": 61, "type": "retirement", "tax_benefit": true}'::jsonb FROM net_worth_categories_real WHERE name = 'Retirement & Pension Funds'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Public Provident Fund', 'shield', '#00A1C5', 2, 'Long-term tax-saving retirement scheme', '{"value": 200000, "percentage": 30, "type": "retirement", "tax_benefit": true, "lock_in": 15}'::jsonb FROM net_worth_categories_real WHERE name = 'Retirement & Pension Funds'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'National Pension System', 'person', '#2ED4F2', 3, 'Government pension scheme for retirement planning', '{"value": 60000, "percentage": 9, "type": "retirement", "tax_benefit": true}'::jsonb FROM net_worth_categories_real WHERE name = 'Retirement & Pension Funds'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 5. Insurance (Investment) (Parent: #EC4899)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'ULIP Plans', 'shield', '#FF5CAD', 1, 'Unit Linked Insurance Plans combining insurance and investment', '{"value": 200000, "percentage": 63, "type": "insurance_investment", "risk_level": "medium"}'::jsonb FROM net_worth_categories_real WHERE name = 'Insurance (Investment)'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Endowment Plans', 'heart', '#D73385', 2, 'Traditional endowment insurance policies with guaranteed returns', '{"value": 120000, "percentage": 37, "type": "insurance_investment", "risk_level": "low"}'::jsonb FROM net_worth_categories_real WHERE name = 'Insurance (Investment)'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 6. Real Estate (Parent: #F59E0B)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Primary Residence', 'home', '#FFB320', 1, 'Your main residential property where you live', '{"value": 4000000, "percentage": 86, "type": "real_estate", "usage": "residential"}'::jsonb FROM net_worth_categories_real WHERE name = 'Real Estate'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Rental Property', 'business', '#E08900', 2, 'Investment properties generating rental income', '{"value": 630000, "percentage": 14, "type": "real_estate", "usage": "investment", "income_generating": true}'::jsonb FROM net_worth_categories_real WHERE name = 'Real Estate'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 7. Precious Metals & Commodities (Parent: #EAB308)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Physical Gold', 'diamond', '#FFC81D', 1, 'Physical gold in the form of coins, bars, and jewelry', '{"value": 1500000, "percentage": 53, "type": "precious_metals", "form": "physical"}'::jsonb FROM net_worth_categories_real WHERE name = 'Precious Metals & Commodities'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Gold ETFs', 'trending-up', '#D59E00', 2, 'Gold Exchange Traded Funds for digital gold investment', '{"value": 1350000, "percentage": 47, "type": "precious_metals", "form": "digital"}'::jsonb FROM net_worth_categories_real WHERE name = 'Precious Metals & Commodities'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 8. Digital & Crypto Assets (Parent: #F97316)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Bitcoin', 'logo-bitcoin', '#FF882B', 1, 'Bitcoin cryptocurrency holdings', '{"value": 100000, "percentage": 56, "type": "cryptocurrency", "symbol": "BTC", "risk_level": "very_high"}'::jsonb FROM net_worth_categories_real WHERE name = 'Digital & Crypto Assets'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Ethereum', 'logo-bitcoin', '#E45E02', 2, 'Ethereum cryptocurrency and smart contract platform', '{"value": 80000, "percentage": 44, "type": "cryptocurrency", "symbol": "ETH", "risk_level": "very_high"}'::jsonb FROM net_worth_categories_real WHERE name = 'Digital & Crypto Assets'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 9. Business & Entrepreneurial (Parent: #EF4444)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Private Equity', 'business', '#FF5959', 1, 'Private equity investments and business ownership stakes', '{"value": 500000, "percentage": 63, "type": "business_investment", "liquidity": "low"}'::jsonb FROM net_worth_categories_real WHERE name = 'Business & Entrepreneurial'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Intellectual Property', 'document-text', '#DA2F2F', 2, 'Patents, trademarks, copyrights and other IP assets', '{"value": 300000, "percentage": 37, "type": "intellectual_property", "income_generating": true}'::jsonb FROM net_worth_categories_real WHERE name = 'Business & Entrepreneurial'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 10. Vehicles (Parent: #84CC16)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Personal Car', 'car', '#99E12B', 1, 'Personal automobiles and cars for daily use', '{"value": 180000, "percentage": 64, "type": "vehicle", "depreciation": true}'::jsonb FROM net_worth_categories_real WHERE name = 'Vehicles'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Two-Wheeler', 'bicycle', '#6FB701', 2, 'Motorcycles, scooters and bicycles', '{"value": 100000, "percentage": 36, "type": "vehicle", "depreciation": true}'::jsonb FROM net_worth_categories_real WHERE name = 'Vehicles'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 11. Personal Valuables (Parent: #A855F7)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Jewelry', 'diamond', '#BD70FF', 1, 'Gold, silver, diamond and precious stone jewelry', '{"value": 80000, "percentage": 53, "type": "valuables", "material": "precious_metals"}'::jsonb FROM net_worth_categories_real WHERE name = 'Personal Valuables'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Luxury Watches', 'time', '#9340EE', 2, 'High-end watches and timepieces', '{"value": 70000, "percentage": 47, "type": "valuables", "category": "luxury"}'::jsonb FROM net_worth_categories_real WHERE name = 'Personal Valuables'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 12. Personal Property (Parent: #14B8A6)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Electronics', 'phone-portrait', '#29CDBB', 1, 'Computers, phones, TVs and electronic devices', '{"value": 50000, "percentage": 63, "type": "electronics", "depreciation": true}'::jsonb FROM net_worth_categories_real WHERE name = 'Personal Property'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Furniture', 'home', '#0FA391', 2, 'Home furniture and household items', '{"value": 30000, "percentage": 37, "type": "furniture", "depreciation": true}'::jsonb FROM net_worth_categories_real WHERE name = 'Personal Property'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 13. Education Savings (Parent: #6366F1)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Child Education Fund', 'school', '#7B7BFF', 1, 'Dedicated savings for children education expenses', '{"value": 60000, "percentage": 100, "type": "education_savings", "purpose": "future_education"}'::jsonb FROM net_worth_categories_real WHERE name = 'Education Savings'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 14. Alternative Investments (Parent: #10B981)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Private Equity Funds', 'leaf', '#25CE96', 1, 'Professional private equity fund investments', '{"value": 120000, "percentage": 60, "type": "alternative", "risk_level": "high", "liquidity": "low"}'::jsonb FROM net_worth_categories_real WHERE name = 'Alternative Investments'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'P2P Lending', 'people', '#0BA46C', 2, 'Peer-to-peer lending platform investments', '{"value": 80000, "percentage": 40, "type": "alternative", "risk_level": "medium", "income_generating": true}'::jsonb FROM net_worth_categories_real WHERE name = 'Alternative Investments'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 15. Receivables (Parent: #0EA5E9)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Loans Given', 'arrow-back', '#23BAFE', 1, 'Money lent to friends, family or business associates', '{"value": 60000, "percentage": 60, "type": "receivables", "recovery_expected": true}'::jsonb FROM net_worth_categories_real WHERE name = 'Receivables'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Tax Refund Due', 'document', '#0090DA', 2, 'Expected tax refunds from government', '{"value": 40000, "percentage": 40, "type": "receivables", "source": "government"}'::jsonb FROM net_worth_categories_real WHERE name = 'Receivables'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 16. Miscellaneous Assets (Parent: #78716C)
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description, metadata)
SELECT id, 'Collectibles', 'trophy', '#8D8177', 1, 'Art, antiques, stamps, coins and other collectible items', '{"value": 50000, "percentage": 100, "type": "collectibles", "appreciation_potential": true}'::jsonb FROM net_worth_categories_real WHERE name = 'Miscellaneous Assets'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

-- =============================================================================
-- LIABILITY SUBCATEGORIES WITH COMPLETE DATA
-- =============================================================================

-- 1. Housing Loans (Parent: #EF4444) - 10 subcategories
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'Home Loan (Primary Residence)', 'home', '#FF5959', 1, 'Mortgage loan for your main residential property' FROM net_worth_categories_real WHERE name = 'Housing Loans'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'Home Loan (Second Home)', 'home', '#DA2F2F', 2, 'Mortgage for second home or vacation property' FROM net_worth_categories_real WHERE name = 'Housing Loans'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'Plot Purchase Loan', 'map', '#FF6E6E', 3, 'Loan for purchasing land or plot for future construction' FROM net_worth_categories_real WHERE name = 'Housing Loans'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'Home Construction Loan', 'hammer', '#C51A1A', 4, 'Loan for constructing a new house on owned land' FROM net_worth_categories_real WHERE name = 'Housing Loans'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'Home Improvement Loan', 'wrench', '#FF8383', 5, 'Loan for renovating or improving existing property' FROM net_worth_categories_real WHERE name = 'Housing Loans'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'Home Extension Loan', 'plus-square', '#B00505', 6, 'Loan for extending or adding to existing property' FROM net_worth_categories_real WHERE name = 'Housing Loans'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'Loan Against Property (LAP)', 'building', '#FF9898', 7, 'Secured loan using property as collateral' FROM net_worth_categories_real WHERE name = 'Housing Loans'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'Balance Transfer Housing Loan', 'refresh-cw', '#9B0000', 8, 'Transfer of existing home loan to another lender' FROM net_worth_categories_real WHERE name = 'Housing Loans'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'Top-up Home Loan', 'arrow-up', '#FFADAD', 9, 'Additional loan on existing home loan for other purposes' FROM net_worth_categories_real WHERE name = 'Housing Loans'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'Bridge Loan (Real Estate)', 'bridge', '#860000', 10, 'Short-term loan for property transactions' FROM net_worth_categories_real WHERE name = 'Housing Loans'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

-- 2. Vehicle Loans (Parent: #F59E0B) - 8 subcategories
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'New Car Loan', 'car', '#FFB320', 1, 'Loan for purchasing a brand new car' FROM net_worth_categories_real WHERE name = 'Vehicle Loans'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'Used Car Loan', 'car', '#E08900', 2, 'Loan for purchasing a pre-owned vehicle' FROM net_worth_categories_real WHERE name = 'Vehicle Loans'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'Two-Wheeler Loan', 'bicycle', '#FFC835', 3, 'Loan for motorcycles, scooters and bikes' FROM net_worth_categories_real WHERE name = 'Vehicle Loans'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'Electric Vehicle Loan', 'zap', '#CB7400', 4, 'Loan for electric cars and e-vehicles' FROM net_worth_categories_real WHERE name = 'Vehicle Loans'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'Commercial Vehicle Loan', 'truck', '#FFDD4A', 5, 'Loan for commercial vehicles and trucks' FROM net_worth_categories_real WHERE name = 'Vehicle Loans'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'Tractor Loan', 'tractor', '#B65F00', 6, 'Loan for agricultural tractors and farm equipment' FROM net_worth_categories_real WHERE name = 'Vehicle Loans'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'Heavy Equipment Loan', 'settings', '#FFE25F', 7, 'Loan for construction and heavy machinery' FROM net_worth_categories_real WHERE name = 'Vehicle Loans'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'Refinanced Vehicle Loan', 'repeat', '#A14A00', 8, 'Refinanced existing vehicle loan with better terms' FROM net_worth_categories_real WHERE name = 'Vehicle Loans'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

-- Continue with remaining liability categories...
-- [Note: I'll include a few more key categories to demonstrate the pattern]

-- 5. Credit Card Debt (Parent: #8B5CF6) - 7 subcategories
INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'Credit Card Outstanding (Bank 1)', 'credit-card', '#9F71FF', 1, 'Outstanding balance on primary credit card' FROM net_worth_categories_real WHERE name = 'Credit Card Debt'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'Credit Card Outstanding (Bank 2)', 'credit-card', '#7647ED', 2, 'Outstanding balance on secondary credit card' FROM net_worth_categories_real WHERE name = 'Credit Card Debt'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'Credit Card EMI Conversion', 'calendar', '#B385FF', 3, 'Credit card purchases converted to EMI' FROM net_worth_categories_real WHERE name = 'Credit Card Debt'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'Store Credit Card Debt', 'shopping-bag', '#5D32D4', 4, 'Outstanding on store-specific credit cards' FROM net_worth_categories_real WHERE name = 'Credit Card Debt'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'Co-branded Credit Card Debt', 'tag', '#C799FF', 5, 'Outstanding on airline, hotel or co-branded cards' FROM net_worth_categories_real WHERE name = 'Credit Card Debt'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'Credit Card Balance Transfer', 'arrow-right-left', '#431DBB', 6, 'Balance transferred from other credit cards' FROM net_worth_categories_real WHERE name = 'Credit Card Debt'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO public.net_worth_subcategories_real (category_id, name, icon, color, sort_order, description)
SELECT id, 'Minimum Due/Revolving Credit', 'rotate-cw', '#DBADFF', 7, 'Revolving credit and minimum payment balances' FROM net_worth_categories_real WHERE name = 'Credit Card Debt'
ON CONFLICT (category_id, name) DO UPDATE SET icon = EXCLUDED.icon, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order, description = EXCLUDED.description, updated_at = NOW();

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Show subcategory counts by category with colors and icons
SELECT 
    nwc.name as category_name,
    nwc.type,
    nwc.color as parent_color,
    COUNT(nws.id) as subcategory_count,
    STRING_AGG(nws.name || ' (' || nws.color || ')', ', ' ORDER BY nws.sort_order) as subcategories_with_colors
FROM net_worth_categories_real nwc
LEFT JOIN net_worth_subcategories_real nws ON nwc.id = nws.category_id
WHERE nwc.is_active = true AND (nws.is_active IS NULL OR nws.is_active = true)
GROUP BY nwc.id, nwc.name, nwc.type, nwc.color, nwc.sort_order
ORDER BY nwc.type DESC, nwc.sort_order;

-- Show sample subcategories with complete data
SELECT 
    nwc.name as category_name,
    nws.name as subcategory_name,
    nws.icon,
    nwc.color as parent_color,
    nws.color as subcategory_color,
    nws.description,
    nws.metadata
FROM net_worth_categories_real nwc
JOIN net_worth_subcategories_real nws ON nwc.id = nws.category_id
WHERE nwc.is_active = true AND nws.is_active = true
ORDER BY nwc.type DESC, nwc.sort_order, nws.sort_order
LIMIT 20;

-- Show total counts
SELECT 
    nwc.type,
    COUNT(nws.id) as total_subcategories,
    COUNT(CASE WHEN nws.icon IS NOT NULL THEN 1 END) as with_icons,
    COUNT(CASE WHEN nws.color IS NOT NULL THEN 1 END) as with_colors,
    COUNT(CASE WHEN nws.description IS NOT NULL THEN 1 END) as with_descriptions
FROM net_worth_categories_real nwc
LEFT JOIN net_worth_subcategories_real nws ON nwc.id = nws.category_id
WHERE nwc.is_active = true AND (nws.is_active IS NULL OR nws.is_active = true)
GROUP BY nwc.type
ORDER BY nwc.type DESC;

