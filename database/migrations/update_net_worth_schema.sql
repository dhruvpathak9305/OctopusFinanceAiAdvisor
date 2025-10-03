-- =============================================================================
-- NET WORTH SCHEMA UPDATES FOR MOBILE DATA COMPATIBILITY
-- =============================================================================
-- This migration updates the net worth schema to accommodate the rich data
-- structure from the mobile app including financial metrics and metadata.

-- Update net_worth_categories_real table to include additional fields
ALTER TABLE public.net_worth_categories_real 
ADD COLUMN IF NOT EXISTS total_value NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS percentage NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS items_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Update net_worth_subcategories_real table to include additional fields  
ALTER TABLE public.net_worth_subcategories_real
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_net_worth_categories_real_type_value 
ON public.net_worth_categories_real(type, total_value DESC);

CREATE INDEX IF NOT EXISTS idx_net_worth_categories_real_percentage 
ON public.net_worth_categories_real(percentage DESC);

CREATE INDEX IF NOT EXISTS idx_net_worth_subcategories_real_metadata 
ON public.net_worth_subcategories_real USING GIN(metadata);

-- Add comments for documentation
COMMENT ON COLUMN public.net_worth_categories_real.total_value IS 'Total value of all assets/liabilities in this category';
COMMENT ON COLUMN public.net_worth_categories_real.percentage IS 'Percentage of total net worth this category represents';
COMMENT ON COLUMN public.net_worth_categories_real.items_count IS 'Number of individual items/entries in this category';
COMMENT ON COLUMN public.net_worth_categories_real.metadata IS 'Additional category metadata (bank info, EMI details, etc.)';
COMMENT ON COLUMN public.net_worth_subcategories_real.metadata IS 'Additional subcategory metadata (value, percentage, bank details, etc.)';

