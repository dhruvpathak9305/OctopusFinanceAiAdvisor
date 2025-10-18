-- =====================================================================
-- CREATE ACCOUNT STATEMENTS TABLE
-- =====================================================================
-- This table tracks uploaded bank statements for audit and duplicate detection
-- Stores statement metadata and links to processed transactions
-- =====================================================================

CREATE TABLE IF NOT EXISTS account_statements_real (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts_real(id) ON DELETE CASCADE,
  
  -- Statement Period
  statement_period_start DATE NOT NULL,
  statement_period_end DATE NOT NULL,
  statement_month INTEGER, -- Extracted month (1-12)
  statement_year INTEGER, -- Extracted year
  
  -- Statement Type
  statement_type TEXT NOT NULL, -- 'savings', 'current', 'credit_card', 'loan'
  statement_format TEXT, -- 'pdf', 'excel', 'csv', 'image'
  
  -- Financial Summary
  opening_balance DECIMAL(15, 2) NOT NULL,
  closing_balance DECIMAL(15, 2) NOT NULL,
  total_deposits DECIMAL(15, 2) DEFAULT 0,
  total_withdrawals DECIMAL(15, 2) DEFAULT 0,
  total_credits DECIMAL(15, 2) DEFAULT 0,
  total_debits DECIMAL(15, 2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  
  -- File Information
  file_name TEXT, -- Original filename
  file_path TEXT, -- Storage path (if stored)
  file_size_bytes INTEGER, -- File size
  file_hash TEXT, -- Hash for duplicate detection
  
  -- Processing Status
  upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_date TIMESTAMPTZ, -- When processing completed
  status TEXT NOT NULL DEFAULT 'uploaded', -- 'uploaded', 'processing', 'processed', 'error', 'duplicate'
  processing_method TEXT DEFAULT 'manual', -- 'manual', 'chatgpt', 'automated', 'ocr'
  
  -- Processing Results
  transactions_inserted INTEGER DEFAULT 0, -- Number of transactions created
  transactions_failed INTEGER DEFAULT 0, -- Number that failed
  validation_errors JSONB DEFAULT '[]'::jsonb, -- Validation error details
  duplicate_transactions INTEGER DEFAULT 0, -- Number of duplicates found
  
  -- Statement Details (from bank)
  bank_statement_number TEXT, -- Bank's statement number
  institution TEXT NOT NULL, -- Bank name
  account_number TEXT, -- Account number from statement
  account_type TEXT, -- Account type from statement
  customer_id TEXT, -- Customer ID from statement
  
  -- Additional Information
  interest_earned DECIMAL(15, 2), -- Interest credited in this period
  fees_charged DECIMAL(15, 2), -- Fees/charges in this period
  fixed_deposits_linked DECIMAL(15, 2), -- FD value linked to account
  reward_points_earned INTEGER, -- Points earned in this period
  
  -- Notes & Tags
  notes TEXT, -- User notes about this statement
  tags TEXT[], -- Tags for organization
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional details
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_statement_type CHECK (statement_type IN ('savings', 'current', 'credit_card', 'loan', 'fixed_deposit')),
  CONSTRAINT valid_status CHECK (status IN ('uploaded', 'processing', 'processed', 'error', 'duplicate', 'archived')),
  CONSTRAINT valid_period CHECK (statement_period_end >= statement_period_start),
  CONSTRAINT non_negative_transactions CHECK (transaction_count >= 0),
  -- Unique constraint to prevent duplicate statement uploads
  CONSTRAINT unique_statement_period UNIQUE (user_id, account_id, statement_period_start, statement_period_end)
);

-- =====================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================

-- Index on user_id for quick user queries
CREATE INDEX idx_account_statements_real_user_id ON account_statements_real(user_id);

-- Index on account_id for account-specific queries
CREATE INDEX idx_account_statements_real_account_id ON account_statements_real(account_id);

-- Index on statement period for date range queries
CREATE INDEX idx_account_statements_real_period ON account_statements_real(statement_period_start, statement_period_end);

-- Index on status for filtering
CREATE INDEX idx_account_statements_real_status ON account_statements_real(status);

-- Index on upload_date for recent statements
CREATE INDEX idx_account_statements_real_upload_date ON account_statements_real(upload_date DESC);

-- Composite index for user + account + period
CREATE INDEX idx_account_statements_real_user_account_period 
  ON account_statements_real(user_id, account_id, statement_period_start);

-- Index on file_hash for duplicate detection
CREATE INDEX idx_account_statements_real_file_hash ON account_statements_real(file_hash);

-- Index on month/year for monthly queries
CREATE INDEX idx_account_statements_real_month_year ON account_statements_real(statement_year, statement_month);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================

-- Enable RLS
ALTER TABLE account_statements_real ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own statements
CREATE POLICY "Users can view their own statements"
  ON account_statements_real
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own statements
CREATE POLICY "Users can insert their own statements"
  ON account_statements_real
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own statements
CREATE POLICY "Users can update their own statements"
  ON account_statements_real
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own statements
CREATE POLICY "Users can delete their own statements"
  ON account_statements_real
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================================
-- TRIGGER: Update timestamp on modification
-- =====================================================================

CREATE OR REPLACE FUNCTION update_account_statements_real_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_account_statements_real_updated_at
  BEFORE UPDATE ON account_statements_real
  FOR EACH ROW
  EXECUTE FUNCTION update_account_statements_real_updated_at();

-- =====================================================================
-- TRIGGER: Extract month and year
-- =====================================================================

CREATE OR REPLACE FUNCTION extract_statement_month_year()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract month and year from statement_period_end
  NEW.statement_month := EXTRACT(MONTH FROM NEW.statement_period_end)::INTEGER;
  NEW.statement_year := EXTRACT(YEAR FROM NEW.statement_period_end)::INTEGER;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_extract_statement_month_year
  BEFORE INSERT OR UPDATE ON account_statements_real
  FOR EACH ROW
  EXECUTE FUNCTION extract_statement_month_year();

-- =====================================================================
-- HELPER FUNCTIONS
-- =====================================================================

-- Function to check if statement already uploaded
CREATE OR REPLACE FUNCTION check_statement_duplicate(
  p_user_id UUID,
  p_account_id UUID,
  p_period_start DATE,
  p_period_end DATE
)
RETURNS BOOLEAN AS $$
DECLARE
  existing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO existing_count
  FROM account_statements_real
  WHERE user_id = p_user_id
    AND account_id = p_account_id
    AND statement_period_start = p_period_start
    AND statement_period_end = p_period_end
    AND status != 'error';
  
  RETURN existing_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to create statement record from bulk upload
CREATE OR REPLACE FUNCTION create_statement_from_upload(
  p_user_id UUID,
  p_account_id UUID,
  p_period_start DATE,
  p_period_end DATE,
  p_transactions_data JSONB
)
RETURNS UUID AS $$
DECLARE
  v_statement_id UUID;
  v_opening_balance DECIMAL;
  v_closing_balance DECIMAL;
  v_transaction_count INTEGER;
  v_total_deposits DECIMAL;
  v_total_withdrawals DECIMAL;
BEGIN
  -- Calculate summary from transactions
  SELECT 
    COUNT(*),
    SUM(CASE WHEN (t->>'type') IN ('income', 'transfer') AND (t->>'amount')::DECIMAL > 0 THEN (t->>'amount')::DECIMAL ELSE 0 END),
    SUM(CASE WHEN (t->>'type') = 'expense' AND (t->>'amount')::DECIMAL > 0 THEN (t->>'amount')::DECIMAL ELSE 0 END)
  INTO v_transaction_count, v_total_deposits, v_total_withdrawals
  FROM jsonb_array_elements(p_transactions_data) t;
  
  -- Get opening and closing balances (if available in metadata)
  v_opening_balance := COALESCE(
    (p_transactions_data->0->'metadata'->>'opening_balance')::DECIMAL, 
    0
  );
  v_closing_balance := COALESCE(
    (p_transactions_data->(jsonb_array_length(p_transactions_data)-1)->'metadata'->>'balance_after_transaction')::DECIMAL,
    0
  );
  
  -- Create statement record
  INSERT INTO account_statements_real (
    user_id,
    account_id,
    statement_period_start,
    statement_period_end,
    statement_type,
    opening_balance,
    closing_balance,
    total_deposits,
    total_withdrawals,
    transaction_count,
    status,
    processing_method,
    processed_date
  ) VALUES (
    p_user_id,
    p_account_id,
    p_period_start,
    p_period_end,
    'savings',
    v_opening_balance,
    v_closing_balance,
    COALESCE(v_total_deposits, 0),
    COALESCE(v_total_withdrawals, 0),
    v_transaction_count,
    'processed',
    'chatgpt',
    NOW()
  )
  RETURNING id INTO v_statement_id;
  
  RETURN v_statement_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get statement summary for user
CREATE OR REPLACE FUNCTION get_user_statements_summary(
  p_user_id UUID,
  p_months INTEGER DEFAULT 6
)
RETURNS TABLE(
  account_name TEXT,
  statements_count BIGINT,
  latest_statement_date DATE,
  total_transactions INTEGER,
  oldest_statement_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.name as account_name,
    COUNT(s.id) as statements_count,
    MAX(s.statement_period_end) as latest_statement_date,
    SUM(s.transaction_count)::INTEGER as total_transactions,
    MIN(s.statement_period_start) as oldest_statement_date
  FROM account_statements_real s
  JOIN accounts_real a ON s.account_id = a.id
  WHERE s.user_id = p_user_id
    AND s.statement_period_end >= (NOW() - INTERVAL '1 month' * p_months)::DATE
    AND s.status = 'processed'
  GROUP BY a.name
  ORDER BY latest_statement_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get missing statements
CREATE OR REPLACE FUNCTION get_missing_statements(
  p_user_id UUID,
  p_account_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(
  missing_month TEXT,
  expected_start DATE,
  expected_end DATE
) AS $$
DECLARE
  current_month DATE;
BEGIN
  -- Generate series of months
  FOR current_month IN
    SELECT date_trunc('month', d)::DATE
    FROM generate_series(p_start_date, p_end_date, '1 month'::interval) d
  LOOP
    -- Check if statement exists for this month
    IF NOT EXISTS (
      SELECT 1 FROM account_statements_real
      WHERE user_id = p_user_id
        AND account_id = p_account_id
        AND statement_period_start >= current_month
        AND statement_period_end < (current_month + INTERVAL '1 month')::DATE
        AND status = 'processed'
    ) THEN
      RETURN QUERY
      SELECT 
        TO_CHAR(current_month, 'Month YYYY'),
        current_month,
        (current_month + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- COMMENTS
-- =====================================================================

COMMENT ON TABLE account_statements_real IS 'Tracks uploaded bank statements for audit trail and duplicate detection';
COMMENT ON COLUMN account_statements_real.file_hash IS 'MD5/SHA hash of uploaded file for duplicate detection';
COMMENT ON COLUMN account_statements_real.processing_method IS 'How the statement was processed (manual, chatgpt, automated, ocr)';
COMMENT ON COLUMN account_statements_real.validation_errors IS 'JSON array of validation errors encountered during processing';

-- =====================================================================
-- EXAMPLE USAGE
-- =====================================================================

/*
-- Insert a statement record
INSERT INTO account_statements_real (
  user_id,
  account_id,
  statement_period_start,
  statement_period_end,
  statement_type,
  opening_balance,
  closing_balance,
  total_deposits,
  total_withdrawals,
  transaction_count,
  institution,
  status,
  processing_method
) VALUES (
  '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9',
  'fd551095-58a9-4f12-b00e-2fd182e68403',
  '2025-09-01',
  '2025-09-30',
  'savings',
  5361584.77,
  5525174.67,
  292579.63,
  98220.00,
  11,
  'ICICI Bank',
  'processed',
  'chatgpt'
);

-- Check if statement already uploaded
SELECT check_statement_duplicate(
  '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9',
  'fd551095-58a9-4f12-b00e-2fd182e68403',
  '2025-09-01',
  '2025-09-30'
);

-- Get statements summary
SELECT * FROM get_user_statements_summary('6679ae58-a6fb-4d2f-8f23-dd7fafe973d9', 12);

-- Get missing statements
SELECT * FROM get_missing_statements(
  '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9',
  'fd551095-58a9-4f12-b00e-2fd182e68403',
  '2024-01-01',
  '2025-12-31'
);

-- Get all statements for last 6 months
SELECT * FROM account_statements_real
WHERE user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
  AND statement_period_end >= (NOW() - INTERVAL '6 months')::DATE
ORDER BY statement_period_end DESC;
*/

