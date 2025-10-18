-- =====================================================================
-- CREATE REWARD POINTS TABLE
-- =====================================================================
-- This table stores reward/loyalty points information
-- Supports credit card points, debit card rewards, savings account rewards
-- =====================================================================

CREATE TABLE IF NOT EXISTS reward_points_real (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts_real(id) ON DELETE CASCADE,
  card_id UUID REFERENCES credit_cards_real(id) ON DELETE CASCADE,
  
  -- Program Details
  program_name TEXT NOT NULL, -- e.g., 'My Savings REWARD', 'ICICI PayBack'
  program_type TEXT NOT NULL, -- 'savings_account', 'credit_card', 'debit_card', 'loyalty_program'
  institution TEXT NOT NULL, -- Bank/Institution name
  
  -- Points Balance
  points_balance INTEGER NOT NULL DEFAULT 0, -- Current points balance
  points_value_inr DECIMAL(15, 2), -- Estimated INR value of points
  points_per_rupee DECIMAL(10, 4) DEFAULT 1.0, -- Points earned per INR spent
  rupees_per_point DECIMAL(10, 4) DEFAULT 0.25, -- INR value per point (for redemption)
  
  -- Monthly Tracking
  points_earned_this_month INTEGER DEFAULT 0,
  points_redeemed_this_month INTEGER DEFAULT 0,
  points_expired_this_month INTEGER DEFAULT 0,
  
  -- Lifetime Tracking
  total_points_earned INTEGER DEFAULT 0,
  total_points_redeemed INTEGER DEFAULT 0,
  total_points_expired INTEGER DEFAULT 0,
  total_value_earned_inr DECIMAL(15, 2) DEFAULT 0,
  total_value_redeemed_inr DECIMAL(15, 2) DEFAULT 0,
  
  -- Linked Numbers
  linked_number TEXT, -- Reward card number, PayBack number, etc.
  linked_card_last_4 TEXT, -- Last 4 digits of linked card
  
  -- Expiry & Status
  expiry_date DATE, -- Points expiry date (if applicable)
  days_to_expiry INTEGER, -- Calculated days until expiry
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'suspended', 'closed'
  
  -- Program Features
  has_expiry BOOLEAN DEFAULT false, -- Do points expire?
  expiry_period_months INTEGER, -- Months until points expire
  minimum_redemption_points INTEGER, -- Minimum points for redemption
  maximum_points_cap INTEGER, -- Maximum points that can be accumulated
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional program details
  
  -- Timestamps
  last_points_update TIMESTAMPTZ, -- Last time points were updated
  last_earning_date TIMESTAMPTZ, -- Last time points were earned
  last_redemption_date TIMESTAMPTZ, -- Last time points were redeemed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_program_type CHECK (program_type IN ('savings_account', 'credit_card', 'debit_card', 'loyalty_program')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'suspended', 'closed')),
  CONSTRAINT non_negative_balance CHECK (points_balance >= 0),
  CONSTRAINT non_negative_earned CHECK (total_points_earned >= 0),
  CONSTRAINT non_negative_redeemed CHECK (total_points_redeemed >= 0),
  -- Either account_id or card_id must be set
  CONSTRAINT account_or_card_required CHECK (account_id IS NOT NULL OR card_id IS NOT NULL)
);

-- =====================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================

-- Index on user_id for quick user queries
CREATE INDEX idx_reward_points_real_user_id ON reward_points_real(user_id);

-- Index on account_id for linked account queries
CREATE INDEX idx_reward_points_real_account_id ON reward_points_real(account_id);

-- Index on card_id for linked card queries
CREATE INDEX idx_reward_points_real_card_id ON reward_points_real(card_id);

-- Index on status for filtering active programs
CREATE INDEX idx_reward_points_real_status ON reward_points_real(status);

-- Index on expiry_date for expiry alerts
CREATE INDEX idx_reward_points_real_expiry_date ON reward_points_real(expiry_date);

-- Composite index for user + status queries
CREATE INDEX idx_reward_points_real_user_status ON reward_points_real(user_id, status);

-- Index on program_type for filtering by type
CREATE INDEX idx_reward_points_real_program_type ON reward_points_real(program_type);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================

-- Enable RLS
ALTER TABLE reward_points_real ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own reward points
CREATE POLICY "Users can view their own reward points"
  ON reward_points_real
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own reward points
CREATE POLICY "Users can insert their own reward points"
  ON reward_points_real
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own reward points
CREATE POLICY "Users can update their own reward points"
  ON reward_points_real
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own reward points
CREATE POLICY "Users can delete their own reward points"
  ON reward_points_real
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================================
-- TRIGGER: Update timestamp on modification
-- =====================================================================

CREATE OR REPLACE FUNCTION update_reward_points_real_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reward_points_real_updated_at
  BEFORE UPDATE ON reward_points_real
  FOR EACH ROW
  EXECUTE FUNCTION update_reward_points_real_updated_at();

-- =====================================================================
-- TRIGGER: Calculate points value
-- =====================================================================

CREATE OR REPLACE FUNCTION calculate_points_value()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate INR value of points if not manually set
  IF NEW.rupees_per_point IS NOT NULL AND NEW.rupees_per_point > 0 THEN
    NEW.points_value_inr := NEW.points_balance * NEW.rupees_per_point;
  END IF;
  
  -- Calculate days to expiry
  IF NEW.expiry_date IS NOT NULL THEN
    NEW.days_to_expiry := EXTRACT(DAY FROM (NEW.expiry_date - NOW()::DATE))::INTEGER;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_points_value
  BEFORE INSERT OR UPDATE ON reward_points_real
  FOR EACH ROW
  EXECUTE FUNCTION calculate_points_value();

-- =====================================================================
-- HELPER FUNCTIONS
-- =====================================================================

-- Function to add points
CREATE OR REPLACE FUNCTION add_reward_points(
  p_reward_id UUID,
  p_points INTEGER,
  p_transaction_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_record reward_points_real%ROWTYPE;
BEGIN
  SELECT * INTO current_record FROM reward_points_real WHERE id = p_reward_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward program not found';
  END IF;
  
  -- Update points
  UPDATE reward_points_real
  SET 
    points_balance = points_balance + p_points,
    points_earned_this_month = points_earned_this_month + p_points,
    total_points_earned = total_points_earned + p_points,
    last_earning_date = NOW(),
    last_points_update = NOW()
  WHERE id = p_reward_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to redeem points
CREATE OR REPLACE FUNCTION redeem_reward_points(
  p_reward_id UUID,
  p_points INTEGER,
  p_redemption_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_record reward_points_real%ROWTYPE;
BEGIN
  SELECT * INTO current_record FROM reward_points_real WHERE id = p_reward_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward program not found';
  END IF;
  
  IF current_record.points_balance < p_points THEN
    RAISE EXCEPTION 'Insufficient points balance';
  END IF;
  
  IF current_record.minimum_redemption_points IS NOT NULL 
     AND p_points < current_record.minimum_redemption_points THEN
    RAISE EXCEPTION 'Points below minimum redemption threshold';
  END IF;
  
  -- Update points
  UPDATE reward_points_real
  SET 
    points_balance = points_balance - p_points,
    points_redeemed_this_month = points_redeemed_this_month + p_points,
    total_points_redeemed = total_points_redeemed + p_points,
    last_redemption_date = NOW(),
    last_points_update = NOW()
  WHERE id = p_reward_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get total reward value for user
CREATE OR REPLACE FUNCTION get_user_total_reward_value(
  p_user_id UUID
)
RETURNS DECIMAL AS $$
DECLARE
  total_value DECIMAL;
BEGIN
  SELECT COALESCE(SUM(points_value_inr), 0) INTO total_value
  FROM reward_points_real
  WHERE user_id = p_user_id
    AND status = 'active';
  
  RETURN total_value;
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly counters (run on 1st of each month)
CREATE OR REPLACE FUNCTION reset_monthly_reward_counters()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE reward_points_real
  SET 
    points_earned_this_month = 0,
    points_redeemed_this_month = 0,
    points_expired_this_month = 0
  WHERE status = 'active';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- COMMENTS
-- =====================================================================

COMMENT ON TABLE reward_points_real IS 'Stores reward/loyalty points for credit cards, debit cards, and savings accounts';
COMMENT ON COLUMN reward_points_real.program_name IS 'Name of the reward program (e.g., My Savings REWARD, ICICI PayBack)';
COMMENT ON COLUMN reward_points_real.points_balance IS 'Current balance of reward points';
COMMENT ON COLUMN reward_points_real.points_value_inr IS 'Estimated INR value of current points balance';
COMMENT ON COLUMN reward_points_real.rupees_per_point IS 'Value in INR for each reward point (for redemption)';

-- =====================================================================
-- EXAMPLE USAGE
-- =====================================================================

/*
-- Insert a reward program
INSERT INTO reward_points_real (
  user_id,
  account_id,
  program_name,
  program_type,
  institution,
  points_balance,
  rupees_per_point,
  linked_number,
  status
) VALUES (
  '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9',
  'fd551095-58a9-4f12-b00e-2fd182e68403',
  'My Savings REWARD',
  'savings_account',
  'ICICI Bank',
  0,
  0.25,
  'My Savings REWARD',
  'active'
);

-- Add points
SELECT add_reward_points('REWARD_UUID', 1000, 'Points earned from transaction');

-- Redeem points
SELECT redeem_reward_points('REWARD_UUID', 500, 'Redeemed for cashback');

-- Get total reward value
SELECT get_user_total_reward_value('6679ae58-a6fb-4d2f-8f23-dd7fafe973d9');

-- Get all active reward programs
SELECT * FROM reward_points_real
WHERE user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'
  AND status = 'active'
ORDER BY points_balance DESC;
*/

