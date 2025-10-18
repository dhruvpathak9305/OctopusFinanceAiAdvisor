-- =====================================================================
-- CREATE MERCHANTS TABLE
-- =====================================================================
-- Master data table for merchants/vendors
-- Provides consistent merchant information and categorization
-- =====================================================================

CREATE TABLE IF NOT EXISTS merchants_real (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Merchant Identification
  merchant_name TEXT NOT NULL UNIQUE, -- Canonical name
  merchant_name_variations TEXT[], -- Common variations/aliases
  merchant_display_name TEXT, -- User-friendly display name
  
  -- Merchant Details
  merchant_type TEXT, -- 'online', 'retail', 'service', 'subscription', 'utility', 'government'
  merchant_category TEXT, -- 'shopping', 'food', 'bills', 'entertainment', etc.
  industry TEXT, -- 'e-commerce', 'food_delivery', 'streaming', 'telecom', etc.
  
  -- Default Categorization
  default_category_id UUID REFERENCES budget_categories_real(id) ON DELETE SET NULL,
  default_subcategory_id UUID REFERENCES budget_subcategories_real(id) ON DELETE SET NULL,
  
  -- Merchant Branding
  logo_url TEXT, -- URL to merchant logo
  brand_color TEXT, -- Hex color code for merchant brand
  website TEXT, -- Merchant website
  
  -- Contact Information
  customer_support_number TEXT,
  customer_support_email TEXT,
  merchant_address TEXT,
  
  -- Transaction Patterns
  is_recurring_merchant BOOLEAN DEFAULT false, -- Subscriptions (Netflix, Spotify)
  typical_transaction_frequency TEXT, -- 'daily', 'weekly', 'monthly', 'yearly'
  average_transaction_amount DECIMAL(15, 2), -- Calculated from transactions
  transaction_count INTEGER DEFAULT 0, -- Total transactions with this merchant
  
  -- Identification Patterns
  upi_vpa_patterns TEXT[], -- UPI VPA patterns (e.g., [@]paytm, [@]amazonpay)
  description_patterns TEXT[], -- Common description patterns from bank
  merchant_codes TEXT[], -- MCC codes or bank-specific codes
  
  -- User Preferences
  user_notes TEXT, -- User notes about this merchant
  is_favorite BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false, -- Hide from lists
  
  -- Statistics
  total_spent DECIMAL(15, 2) DEFAULT 0, -- Total amount spent at merchant
  last_transaction_date TIMESTAMPTZ, -- Most recent transaction
  first_transaction_date TIMESTAMPTZ, -- First transaction
  
  -- System Fields
  is_verified BOOLEAN DEFAULT false, -- Verified by admin/system
  is_user_created BOOLEAN DEFAULT false, -- Created by user vs system
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_merchant_type CHECK (
    merchant_type IN ('online', 'retail', 'service', 'subscription', 'utility', 'government', 'other')
  ),
  CONSTRAINT valid_frequency CHECK (
    typical_transaction_frequency IS NULL OR 
    typical_transaction_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'occasional')
  )
);

-- =====================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================

-- Index on merchant_name for quick lookups
CREATE INDEX idx_merchants_real_name ON merchants_real(merchant_name);

-- Index on merchant_category
CREATE INDEX idx_merchants_real_category ON merchants_real(merchant_category);

-- Index on merchant_type
CREATE INDEX idx_merchants_real_type ON merchants_real(merchant_type);

-- Index on is_recurring for subscription tracking
CREATE INDEX idx_merchants_real_recurring ON merchants_real(is_recurring_merchant) 
WHERE is_recurring_merchant = true;

-- GIN index for array searches (patterns)
CREATE INDEX idx_merchants_real_name_variations ON merchants_real USING GIN(merchant_name_variations);
CREATE INDEX idx_merchants_real_description_patterns ON merchants_real USING GIN(description_patterns);
CREATE INDEX idx_merchants_real_upi_patterns ON merchants_real USING GIN(upi_vpa_patterns);

-- Full-text search index
CREATE INDEX idx_merchants_real_name_fts ON merchants_real USING GIN(to_tsvector('english', merchant_name));

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================

-- Enable RLS
ALTER TABLE merchants_real ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view verified merchants
CREATE POLICY "Everyone can view verified merchants"
  ON merchants_real
  FOR SELECT
  USING (is_verified = true OR created_by_user_id = auth.uid());

-- Policy: Users can insert their own merchants
CREATE POLICY "Users can create their own merchants"
  ON merchants_real
  FOR INSERT
  WITH CHECK (created_by_user_id = auth.uid() AND is_user_created = true);

-- Policy: Users can update their own merchants
CREATE POLICY "Users can update their own merchants"
  ON merchants_real
  FOR UPDATE
  USING (created_by_user_id = auth.uid())
  WITH CHECK (created_by_user_id = auth.uid());

-- =====================================================================
-- TRIGGER: Update timestamp on modification
-- =====================================================================

CREATE OR REPLACE FUNCTION update_merchants_real_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_merchants_real_updated_at
  BEFORE UPDATE ON merchants_real
  FOR EACH ROW
  EXECUTE FUNCTION update_merchants_real_updated_at();

-- =====================================================================
-- HELPER FUNCTIONS
-- =====================================================================

-- Function to find or create merchant
CREATE OR REPLACE FUNCTION find_or_create_merchant(
  p_merchant_name TEXT,
  p_category TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_merchant_id UUID;
  normalized_name TEXT;
BEGIN
  -- Normalize merchant name (trim, lowercase)
  normalized_name := LOWER(TRIM(p_merchant_name));
  
  -- Try to find existing merchant
  SELECT id INTO v_merchant_id
  FROM merchants_real
  WHERE LOWER(merchant_name) = normalized_name
    OR normalized_name = ANY(SELECT LOWER(unnest(merchant_name_variations)))
  LIMIT 1;
  
  -- If found, return existing
  IF v_merchant_id IS NOT NULL THEN
    RETURN v_merchant_id;
  END IF;
  
  -- Create new merchant
  INSERT INTO merchants_real (
    merchant_name,
    merchant_category,
    is_user_created,
    created_by_user_id
  ) VALUES (
    p_merchant_name,
    p_category,
    p_user_id IS NOT NULL,
    p_user_id
  )
  RETURNING id INTO v_merchant_id;
  
  RETURN v_merchant_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update merchant statistics
CREATE OR REPLACE FUNCTION update_merchant_stats(
  p_merchant_name TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE merchants_real m
  SET 
    transaction_count = (
      SELECT COUNT(*)
      FROM transactions_real
      WHERE merchant = p_merchant_name
    ),
    total_spent = (
      SELECT COALESCE(SUM(amount), 0)
      FROM transactions_real
      WHERE merchant = p_merchant_name
        AND type = 'expense'
    ),
    average_transaction_amount = (
      SELECT COALESCE(AVG(amount), 0)
      FROM transactions_real
      WHERE merchant = p_merchant_name
        AND type = 'expense'
    ),
    last_transaction_date = (
      SELECT MAX(date)
      FROM transactions_real
      WHERE merchant = p_merchant_name
    ),
    first_transaction_date = (
      SELECT MIN(date)
      FROM transactions_real
      WHERE merchant = p_merchant_name
    ),
    updated_at = NOW()
  WHERE merchant_name = p_merchant_name;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to search merchants
CREATE OR REPLACE FUNCTION search_merchants(
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
  merchant_id UUID,
  merchant_name TEXT,
  merchant_category TEXT,
  transaction_count INTEGER,
  total_spent DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    merchants_real.merchant_name,
    merchant_category,
    merchants_real.transaction_count,
    merchants_real.total_spent
  FROM merchants_real
  WHERE 
    merchant_name ILIKE '%' || p_search_term || '%'
    OR p_search_term = ANY(merchant_name_variations)
    OR to_tsvector('english', merchant_name) @@ plainto_tsquery('english', p_search_term)
  ORDER BY transaction_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- SEED DATA: Common Merchants
-- =====================================================================

INSERT INTO merchants_real (
  merchant_name, 
  merchant_name_variations,
  merchant_display_name,
  merchant_type, 
  merchant_category,
  industry,
  is_recurring_merchant,
  typical_transaction_frequency,
  upi_vpa_patterns,
  description_patterns,
  is_verified
) VALUES
-- E-commerce
('Amazon', ARRAY['Amazon.in', 'Amazon Pay', 'AMAZON'], 'Amazon', 'online', 'shopping', 'e-commerce', false, 'weekly', ARRAY['amazon@', '@amazonpay'], ARRAY['AMAZON', 'AMZN'], true),
('Flipkart', ARRAY['Flipkart.com', 'FLIPKART'], 'Flipkart', 'online', 'shopping', 'e-commerce', false, 'weekly', ARRAY['flipkart@', '@fkaxis'], ARRAY['FLIPKART', 'FLP'], true),

-- Food Delivery
('Swiggy', ARRAY['SWIGGY'], 'Swiggy', 'online', 'food', 'food_delivery', false, 'weekly', ARRAY['swiggy@', '@swiggy'], ARRAY['SWIGGY'], true),
('Zomato', ARRAY['ZOMATO'], 'Zomato', 'online', 'food', 'food_delivery', false, 'weekly', ARRAY['zomato@', '@zomato'], ARRAY['ZOMATO'], true),

-- Subscriptions
('Netflix', ARRAY['NETFLIX.COM'], 'Netflix', 'subscription', 'entertainment', 'streaming', true, 'monthly', NULL, ARRAY['NETFLIX'], true),
('Amazon Prime', ARRAY['Prime Video', 'AMAZON PRIME'], 'Amazon Prime', 'subscription', 'entertainment', 'streaming', true, 'yearly', NULL, ARRAY['PRIME VIDEO'], true),
('Spotify', ARRAY['SPOTIFY'], 'Spotify', 'subscription', 'entertainment', 'streaming', true, 'monthly', NULL, ARRAY['SPOTIFY'], true),
('Apple Services', ARRAY['Apple', 'APPLE.COM'], 'Apple', 'subscription', 'entertainment', 'digital_services', true, 'monthly', ARRAY['@apple'], ARRAY['APPLE'], true),

-- Insurance
('PolicyBazaar', ARRAY['Policy Bazaar', 'POLICYBAZAAR'], 'PolicyBazaar', 'online', 'insurance', 'insurance', false, 'yearly', ARRAY['policybazaar@'], ARRAY['POLICY BAZAR', 'POLICYBAZAR'], true),

-- Utilities
('BESCOM', ARRAY['Bangalore Electricity'], 'BESCOM', 'utility', 'bills', 'electricity', true, 'monthly', ARRAY['bescom@'], ARRAY['BESCOM'], true)

ON CONFLICT (merchant_name) DO NOTHING;

-- =====================================================================
-- COMMENTS
-- =====================================================================

COMMENT ON TABLE merchants_real IS 
'Master data table for merchants with categorization and statistics';

COMMENT ON COLUMN merchants_real.merchant_name_variations IS 
'Array of common name variations for fuzzy matching';

COMMENT ON COLUMN merchants_real.upi_vpa_patterns IS 
'UPI VPA patterns like [@]paytm, [@]amazonpay for identification';

COMMENT ON COLUMN merchants_real.description_patterns IS 
'Common patterns found in bank transaction descriptions';

-- =====================================================================
-- EXAMPLE USAGE
-- =====================================================================

/*
-- Find or create merchant
SELECT find_or_create_merchant('Amazon', 'shopping', '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9');

-- Update merchant statistics
SELECT update_merchant_stats('Amazon');

-- Search merchants
SELECT * FROM search_merchants('amazon', 5);

-- Get top merchants by spending
SELECT 
  merchant_name,
  transaction_count,
  total_spent,
  average_transaction_amount
FROM merchants_real
WHERE is_verified = true
ORDER BY total_spent DESC
LIMIT 10;

-- Link transactions to merchants
UPDATE transactions_real t
SET merchant = m.merchant_name
FROM merchants_real m
WHERE t.description ILIKE '%' || ANY(m.description_patterns) || '%'
  AND t.merchant IS NULL;
*/

-- =====================================================================
-- WHY MERCHANTS TABLE IS USEFUL
-- =====================================================================

/*
BENEFITS:

1. CONSISTENT NAMING
   - "Amazon", "AMAZON", "Amazon.in" all map to same merchant
   - Standardized display names

2. AUTO-CATEGORIZATION
   - New Amazon transaction → auto-categorized as Shopping
   - Netflix → auto-categorized as Entertainment

3. SPENDING ANALYTICS
   - Total spent at each merchant
   - Average transaction amounts
   - Transaction frequency patterns

4. RECURRING IDENTIFICATION
   - Mark subscriptions (Netflix, Spotify)
   - Track monthly/yearly billings

5. SEARCH & DISCOVERY
   - Fast merchant search
   - Find similar merchants
   - Fuzzy matching for variations

6. BRANDING & UX
   - Show merchant logos in UI
   - Consistent brand colors
   - Better user experience

WHEN TO USE:

- ✅ If you want consistent merchant names across transactions
- ✅ If you want auto-categorization by merchant
- ✅ If you want spending analytics by merchant
- ✅ If you want beautiful UI with merchant logos
- ⚠️  Skip if you just want basic transaction tracking
*/

