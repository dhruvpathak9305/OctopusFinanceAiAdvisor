-- =====================================================================
-- CREATE FIXED DEPOSITS TABLE
-- =====================================================================
-- This table stores fixed deposit (FD) information for user accounts
-- Fixed deposits are time deposits with fixed interest rates
-- =====================================================================

CREATE TABLE IF NOT EXISTS fixed_deposits_real (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts_real(id) ON DELETE CASCADE,
  
  -- FD Identification
  deposit_number TEXT NOT NULL, -- Bank's FD number (e.g., 388113000000011)
  deposit_name TEXT, -- Optional custom name for the FD
  
  -- Financial Details
  principal_amount DECIMAL(15, 2) NOT NULL, -- Initial deposit amount
  interest_rate DECIMAL(5, 2) NOT NULL, -- Annual interest rate (e.g., 7.25)
  interest_type TEXT DEFAULT 'simple', -- 'simple' or 'compound'
  interest_payout_frequency TEXT DEFAULT 'maturity', -- 'monthly', 'quarterly', 'yearly', 'maturity'
  
  -- Term Details
  period_months INTEGER NOT NULL, -- Term in months (e.g., 15)
  opening_date DATE NOT NULL, -- FD opening date
  maturity_date DATE NOT NULL, -- FD maturity date
  
  -- Maturity & Current Value
  maturity_amount DECIMAL(15, 2) NOT NULL, -- Amount at maturity
  current_value DECIMAL(15, 2) NOT NULL, -- Current value (with accrued interest)
  interest_accrued DECIMAL(15, 2) DEFAULT 0, -- Interest accrued so far
  
  -- Status & Settings
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'matured', 'closed', 'premature_closed'
  auto_renewal BOOLEAN DEFAULT false, -- Auto-renew on maturity
  nomination_status TEXT DEFAULT 'not_registered', -- 'registered', 'not_registered'
  nominee_name TEXT, -- Nominee name if registered
  nominee_relationship TEXT, -- Relationship to nominee
  
  -- Bank Details
  institution TEXT NOT NULL, -- Bank name (e.g., 'ICICI Bank')
  branch_name TEXT, -- Branch where FD was opened
  linked_account_number TEXT, -- Linked savings account number
  
  -- Penalties & Fees
  premature_withdrawal_penalty DECIMAL(5, 2), -- Penalty % for early withdrawal
  tds_applicable BOOLEAN DEFAULT true, -- Is TDS applicable
  tds_deducted DECIMAL(15, 2) DEFAULT 0, -- TDS deducted so far
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional data
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT positive_principal CHECK (principal_amount > 0),
  CONSTRAINT positive_interest_rate CHECK (interest_rate >= 0),
  CONSTRAINT positive_period CHECK (period_months > 0),
  CONSTRAINT valid_status CHECK (status IN ('active', 'matured', 'closed', 'premature_closed')),
  CONSTRAINT valid_interest_type CHECK (interest_type IN ('simple', 'compound')),
  CONSTRAINT valid_payout_frequency CHECK (interest_payout_frequency IN ('monthly', 'quarterly', 'yearly', 'maturity')),
  CONSTRAINT valid_nomination CHECK (nomination_status IN ('registered', 'not_registered')),
  CONSTRAINT maturity_after_opening CHECK (maturity_date > opening_date)
);

-- =====================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================

-- Index on user_id for quick user queries
CREATE INDEX idx_fixed_deposits_real_user_id ON fixed_deposits_real(user_id);

-- Index on account_id for linked account queries
CREATE INDEX idx_fixed_deposits_real_account_id ON fixed_deposits_real(account_id);

-- Index on status for filtering active/matured FDs
CREATE INDEX idx_fixed_deposits_real_status ON fixed_deposits_real(status);

-- Index on maturity_date for upcoming maturity alerts
CREATE INDEX idx_fixed_deposits_real_maturity_date ON fixed_deposits_real(maturity_date);

-- Composite index for user + status queries
CREATE INDEX idx_fixed_deposits_real_user_status ON fixed_deposits_real(user_id, status);

-- Index on deposit_number for unique lookups
CREATE INDEX idx_fixed_deposits_real_deposit_number ON fixed_deposits_real(deposit_number);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================

-- Enable RLS
ALTER TABLE fixed_deposits_real ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own FDs
CREATE POLICY "Users can view their own fixed deposits"
  ON fixed_deposits_real
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own FDs
CREATE POLICY "Users can insert their own fixed deposits"
  ON fixed_deposits_real
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own FDs
CREATE POLICY "Users can update their own fixed deposits"
  ON fixed_deposits_real
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own FDs
CREATE POLICY "Users can delete their own fixed deposits"
  ON fixed_deposits_real
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================================
-- TRIGGER: Update timestamp on modification
-- =====================================================================

CREATE OR REPLACE FUNCTION update_fixed_deposits_real_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_fixed_deposits_real_updated_at
  BEFORE UPDATE ON fixed_deposits_real
  FOR EACH ROW
  EXECUTE FUNCTION update_fixed_deposits_real_updated_at();

-- =====================================================================
-- HELPER FUNCTIONS
-- =====================================================================

-- Function to calculate current value of FD
CREATE OR REPLACE FUNCTION calculate_fd_current_value(
  fd_id UUID
)
RETURNS DECIMAL AS $$
DECLARE
  fd_record fixed_deposits_real%ROWTYPE;
  days_elapsed INTEGER;
  total_days INTEGER;
  interest_earned DECIMAL;
BEGIN
  SELECT * INTO fd_record FROM fixed_deposits_real WHERE id = fd_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Calculate days
  days_elapsed := EXTRACT(DAY FROM (NOW()::DATE - fd_record.opening_date));
  total_days := EXTRACT(DAY FROM (fd_record.maturity_date - fd_record.opening_date));
  
  -- Simple interest calculation (can be enhanced for compound)
  IF fd_record.interest_type = 'simple' THEN
    interest_earned := (fd_record.principal_amount * fd_record.interest_rate * days_elapsed) / (100 * 365);
  ELSE
    -- Compound interest calculation
    interest_earned := fd_record.principal_amount * POWER((1 + fd_record.interest_rate/100), days_elapsed/365.0) - fd_record.principal_amount;
  END IF;
  
  RETURN fd_record.principal_amount + interest_earned;
END;
$$ LANGUAGE plpgsql;

-- Function to get all FDs with calculated current values
CREATE OR REPLACE FUNCTION get_user_fixed_deposits(
  p_user_id UUID
)
RETURNS TABLE(
  id UUID,
  deposit_number TEXT,
  principal_amount DECIMAL,
  interest_rate DECIMAL,
  maturity_date DATE,
  maturity_amount DECIMAL,
  calculated_current_value DECIMAL,
  days_to_maturity INTEGER,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fd.id,
    fd.deposit_number,
    fd.principal_amount,
    fd.interest_rate,
    fd.maturity_date,
    fd.maturity_amount,
    calculate_fd_current_value(fd.id) as calculated_current_value,
    EXTRACT(DAY FROM (fd.maturity_date - NOW()::DATE))::INTEGER as days_to_maturity,
    fd.status
  FROM fixed_deposits_real fd
  WHERE fd.user_id = p_user_id
  ORDER BY fd.maturity_date;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- COMMENTS
-- =====================================================================

COMMENT ON TABLE fixed_deposits_real IS 'Stores fixed deposit information for user bank accounts';
COMMENT ON COLUMN fixed_deposits_real.deposit_number IS 'Bank-issued FD number (unique identifier from bank)';
COMMENT ON COLUMN fixed_deposits_real.interest_rate IS 'Annual interest rate in percentage (e.g., 7.25 for 7.25%)';
COMMENT ON COLUMN fixed_deposits_real.period_months IS 'FD term in months (e.g., 12 for 1 year, 15 for 15 months)';
COMMENT ON COLUMN fixed_deposits_real.current_value IS 'Current value including accrued interest';
COMMENT ON COLUMN fixed_deposits_real.auto_renewal IS 'Whether FD will auto-renew on maturity';
COMMENT ON COLUMN fixed_deposits_real.premature_withdrawal_penalty IS 'Penalty percentage for early withdrawal';

-- =====================================================================
-- EXAMPLE USAGE
-- =====================================================================

/*
-- Insert a fixed deposit
INSERT INTO fixed_deposits_real (
  user_id,
  account_id,
  deposit_number,
  principal_amount,
  interest_rate,
  period_months,
  opening_date,
  maturity_date,
  maturity_amount,
  current_value,
  status,
  institution,
  linked_account_number
) VALUES (
  '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9',
  'fd551095-58a9-4f12-b00e-2fd182e68403',
  '388113000000011',
  500000.00,
  7.25,
  15,
  '2024-08-09',
  '2025-08-12',
  546985.00,
  520714.00,
  'active',
  'ICICI Bank',
  '388101502899'
);

-- Get all FDs for a user
SELECT * FROM get_user_fixed_deposits('6679ae58-a6fb-4d2f-8f23-dd7fafe973d9');

-- Calculate current value of a specific FD
SELECT calculate_fd_current_value('FD_UUID');

-- Get FDs maturing in next 30 days
SELECT * FROM fixed_deposits_real
WHERE user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
  AND status = 'active'
  AND maturity_date BETWEEN NOW()::DATE AND (NOW()::DATE + INTERVAL '30 days');
*/

-- =====================================================================
-- GRANT PERMISSIONS
-- =====================================================================

-- Grant appropriate permissions (adjust as needed for your setup)
-- GRANT ALL ON fixed_deposits_real TO authenticated;
-- GRANT USAGE ON SEQUENCE fixed_deposits_real_id_seq TO authenticated;

