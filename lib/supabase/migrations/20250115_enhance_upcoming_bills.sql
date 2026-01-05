-- =====================================================================
-- ENHANCE UPCOMING BILLS TABLE - PHASE 1
-- =====================================================================
-- Migration: 20250115_enhance_upcoming_bills.sql
-- Description: Enhance upcoming_bills table with payment tracking, 
--              reminders, recurrence management, and budget integration
-- =====================================================================

-- =====================================================================
-- STEP 1: Add new columns to existing upcoming_bills table
-- =====================================================================
-- All new columns are nullable to ensure non-breaking migration

-- Recurrence enhancements
ALTER TABLE upcoming_bills 
  ADD COLUMN IF NOT EXISTS next_due_date DATE,
  ADD COLUMN IF NOT EXISTS recurrence_pattern JSONB,
  ADD COLUMN IF NOT EXISTS recurrence_count INTEGER,
  ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;

-- Also add to upcoming_bills_real table (for non-demo mode)
ALTER TABLE upcoming_bills_real 
  ADD COLUMN IF NOT EXISTS next_due_date DATE,
  ADD COLUMN IF NOT EXISTS recurrence_pattern JSONB,
  ADD COLUMN IF NOT EXISTS recurrence_count INTEGER,
  ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;

-- Payment tracking
ALTER TABLE upcoming_bills 
  ADD COLUMN IF NOT EXISTS last_paid_date DATE,
  ADD COLUMN IF NOT EXISTS last_paid_amount DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS total_paid_amount DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_count INTEGER DEFAULT 0;

-- Also add to upcoming_bills_real table
ALTER TABLE upcoming_bills_real 
  ADD COLUMN IF NOT EXISTS last_paid_date DATE,
  ADD COLUMN IF NOT EXISTS last_paid_amount DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS total_paid_amount DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_count INTEGER DEFAULT 0;

-- Reminders
ALTER TABLE upcoming_bills 
  ADD COLUMN IF NOT EXISTS reminder_days_before INTEGER[],
  ADD COLUMN IF NOT EXISTS last_reminder_sent DATE,
  ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT true;

-- Also add to upcoming_bills_real table
ALTER TABLE upcoming_bills_real 
  ADD COLUMN IF NOT EXISTS reminder_days_before INTEGER[],
  ADD COLUMN IF NOT EXISTS last_reminder_sent DATE,
  ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT true;

-- Budget integration
ALTER TABLE upcoming_bills 
  ADD COLUMN IF NOT EXISTS is_included_in_budget BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS budget_period VARCHAR(20) CHECK (budget_period IN ('monthly', 'quarterly', 'yearly'));

-- Also add to upcoming_bills_real table (for non-demo mode)
ALTER TABLE upcoming_bills_real 
  ADD COLUMN IF NOT EXISTS is_included_in_budget BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS budget_period VARCHAR(20) CHECK (budget_period IN ('monthly', 'quarterly', 'yearly'));

-- Metadata
ALTER TABLE upcoming_bills 
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Also add metadata columns to upcoming_bills_real
ALTER TABLE upcoming_bills_real 
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Update frequency enum to include more options
-- Note: PostgreSQL doesn't support ALTER CHECK constraint easily, 
-- so we'll handle this in application layer or create a new constraint
-- For now, we'll keep the existing constraint and add validation in application

-- Update status to include more options
-- Similar to frequency, we'll handle this in application layer

-- Add missing foreign key columns if they don't exist
DO $$ 
BEGIN
  -- Add subcategory_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'upcoming_bills' AND column_name = 'subcategory_id'
  ) THEN
    ALTER TABLE upcoming_bills ADD COLUMN subcategory_id UUID REFERENCES budget_subcategories(id) ON DELETE SET NULL;
  END IF;

  -- Add credit_card_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'upcoming_bills' AND column_name = 'credit_card_id'
  ) THEN
    ALTER TABLE upcoming_bills ADD COLUMN credit_card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL;
  END IF;

  -- Add transaction_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'upcoming_bills' AND column_name = 'transaction_id'
  ) THEN
    ALTER TABLE upcoming_bills ADD COLUMN transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL;
  END IF;

  -- Add status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'upcoming_bills' AND column_name = 'status'
  ) THEN
    ALTER TABLE upcoming_bills ADD COLUMN status VARCHAR(20) DEFAULT 'upcoming';
  END IF;

  -- Add description if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'upcoming_bills' AND column_name = 'description'
  ) THEN
    ALTER TABLE upcoming_bills ADD COLUMN description TEXT;
  END IF;

  -- Add end_date if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'upcoming_bills' AND column_name = 'end_date'
  ) THEN
    ALTER TABLE upcoming_bills ADD COLUMN end_date DATE;
  END IF;

  -- Add autopay_source if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'upcoming_bills' AND column_name = 'autopay_source'
  ) THEN
    ALTER TABLE upcoming_bills ADD COLUMN autopay_source VARCHAR(20);
  END IF;

  -- Rename is_autopay to autopay if needed (for consistency)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'upcoming_bills' AND column_name = 'is_autopay'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'upcoming_bills' AND column_name = 'autopay'
  ) THEN
    ALTER TABLE upcoming_bills RENAME COLUMN is_autopay TO autopay;
  END IF;

  -- Add autopay_account_id if it doesn't exist (separate from account_id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'upcoming_bills' AND column_name = 'autopay_account_id'
  ) THEN
    ALTER TABLE upcoming_bills ADD COLUMN autopay_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL;
  END IF;

  -- Add autopay_credit_card_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'upcoming_bills' AND column_name = 'autopay_credit_card_id'
  ) THEN
    ALTER TABLE upcoming_bills ADD COLUMN autopay_credit_card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =====================================================================
-- STEP 2: Add constraints
-- =====================================================================

-- Add CHECK constraint for amount (must be positive)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'upcoming_bills_amount_positive' 
    AND table_name = 'upcoming_bills'
  ) THEN
    ALTER TABLE upcoming_bills ADD CONSTRAINT upcoming_bills_amount_positive 
      CHECK (amount > 0);
  END IF;
END $$;

-- Add CHECK constraint for valid payment source
-- First, clean up existing data that violates the constraint (if both are set, clear credit_card_id)
DO $$ 
BEGIN
  -- Fix rows where both account_id and credit_card_id are set (keep account_id, clear credit_card_id)
  UPDATE upcoming_bills 
  SET credit_card_id = NULL 
  WHERE account_id IS NOT NULL 
    AND credit_card_id IS NOT NULL;
  
  -- Now add the constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'upcoming_bills_valid_payment_source' 
    AND table_name = 'upcoming_bills'
  ) THEN
    ALTER TABLE upcoming_bills ADD CONSTRAINT upcoming_bills_valid_payment_source 
      CHECK (
        (account_id IS NOT NULL AND credit_card_id IS NULL) OR
        (account_id IS NULL AND credit_card_id IS NOT NULL) OR
        (account_id IS NULL AND credit_card_id IS NULL)
      );
  END IF;
END $$;

-- Add CHECK constraint for valid autopay source
-- First, clean up existing data that violates the constraint
DO $$ 
BEGIN
  -- Fix rows where autopay = true but autopay_source is NULL
  UPDATE upcoming_bills 
  SET autopay = false 
  WHERE autopay = true 
    AND (autopay_source IS NULL 
         OR (autopay_source = 'account' AND autopay_account_id IS NULL)
         OR (autopay_source = 'credit_card' AND autopay_credit_card_id IS NULL));
  
  -- Now add the constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'upcoming_bills_valid_autopay_source' 
    AND table_name = 'upcoming_bills'
  ) THEN
    ALTER TABLE upcoming_bills ADD CONSTRAINT upcoming_bills_valid_autopay_source 
      CHECK (
        (autopay = false) OR
        (autopay = true AND autopay_source IS NOT NULL AND (
          (autopay_source = 'account' AND autopay_account_id IS NOT NULL) OR
          (autopay_source = 'credit_card' AND autopay_credit_card_id IS NOT NULL)
        ))
      );
  END IF;
END $$;

-- Add CHECK constraint for end_date
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'upcoming_bills_valid_end_date' 
    AND table_name = 'upcoming_bills'
  ) THEN
    ALTER TABLE upcoming_bills ADD CONSTRAINT upcoming_bills_valid_end_date 
      CHECK (end_date IS NULL OR end_date >= due_date);
  END IF;
END $$;

-- Add CHECK constraint for next_due_date
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'upcoming_bills_valid_next_due_date' 
    AND table_name = 'upcoming_bills'
  ) THEN
    ALTER TABLE upcoming_bills ADD CONSTRAINT upcoming_bills_valid_next_due_date 
      CHECK (next_due_date IS NULL OR next_due_date >= due_date);
  END IF;
END $$;

-- =====================================================================
-- STEP 3: Create indexes for performance
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_upcoming_bills_next_due_date 
  ON upcoming_bills(next_due_date);

CREATE INDEX IF NOT EXISTS idx_upcoming_bills_category 
  ON upcoming_bills(category_id) WHERE category_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_upcoming_bills_subcategory 
  ON upcoming_bills(subcategory_id) WHERE subcategory_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_upcoming_bills_account 
  ON upcoming_bills(account_id) WHERE account_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_upcoming_bills_credit_card 
  ON upcoming_bills(credit_card_id) WHERE credit_card_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_upcoming_bills_transaction 
  ON upcoming_bills(transaction_id) WHERE transaction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_upcoming_bills_user_status_due 
  ON upcoming_bills(user_id, status, due_date);

CREATE INDEX IF NOT EXISTS idx_upcoming_bills_tags 
  ON upcoming_bills USING GIN(tags) WHERE tags IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_upcoming_bills_metadata 
  ON upcoming_bills USING GIN(metadata);

-- =====================================================================
-- STEP 4: Create bill_payments table
-- =====================================================================

CREATE TABLE IF NOT EXISTS bill_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES upcoming_bills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Payment Details
  payment_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  payment_method VARCHAR(20) CHECK (payment_method IN ('account', 'credit_card', 'cash', 'other')),
  
  -- Transaction Link
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  
  -- Payment Source
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  credit_card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN (
    'pending', 'completed', 'failed', 'cancelled', 'refunded'
  )),
  
  -- Metadata
  reference_number VARCHAR(255), -- Payment reference/confirmation
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT bill_payments_valid_payment_method_source CHECK (
    (payment_method = 'account' AND account_id IS NOT NULL) OR
    (payment_method = 'credit_card' AND credit_card_id IS NOT NULL) OR
    (payment_method IN ('cash', 'other'))
  )
);

-- Indexes for bill_payments
CREATE INDEX IF NOT EXISTS idx_bill_payments_bill_id 
  ON bill_payments(bill_id);

CREATE INDEX IF NOT EXISTS idx_bill_payments_user_id 
  ON bill_payments(user_id);

CREATE INDEX IF NOT EXISTS idx_bill_payments_transaction_id 
  ON bill_payments(transaction_id) WHERE transaction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bill_payments_payment_date 
  ON bill_payments(payment_date);

CREATE INDEX IF NOT EXISTS idx_bill_payments_status 
  ON bill_payments(status);

-- =====================================================================
-- STEP 5: Create bill_reminders table
-- =====================================================================

CREATE TABLE IF NOT EXISTS bill_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES upcoming_bills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Reminder Details
  reminder_date DATE NOT NULL,
  reminder_type VARCHAR(20) CHECK (reminder_type IN (
    'due_date', 'days_before', 'overdue', 'custom'
  )),
  days_before INTEGER, -- Days before due date (if applicable)
  
  -- Delivery
  sent_at TIMESTAMP WITH TIME ZONE,
  delivery_method VARCHAR(20) CHECK (delivery_method IN (
    'push', 'email', 'sms', 'in_app'
  )),
  delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN (
    'pending', 'sent', 'failed', 'cancelled'
  )),
  
  -- Metadata
  message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for bill_reminders
CREATE INDEX IF NOT EXISTS idx_bill_reminders_bill_id 
  ON bill_reminders(bill_id);

CREATE INDEX IF NOT EXISTS idx_bill_reminders_user_id 
  ON bill_reminders(user_id);

CREATE INDEX IF NOT EXISTS idx_bill_reminders_reminder_date 
  ON bill_reminders(reminder_date);

CREATE INDEX IF NOT EXISTS idx_bill_reminders_delivery_status 
  ON bill_reminders(delivery_status);

-- =====================================================================
-- STEP 6: Enable Row Level Security (RLS)
-- =====================================================================

ALTER TABLE bill_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bill_payments
-- Drop policies if they exist, then recreate them
DROP POLICY IF EXISTS "Users can view their own bill payments" ON bill_payments;
CREATE POLICY "Users can view their own bill payments" ON bill_payments
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own bill payments" ON bill_payments;
CREATE POLICY "Users can insert their own bill payments" ON bill_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own bill payments" ON bill_payments;
CREATE POLICY "Users can update their own bill payments" ON bill_payments
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bill payments" ON bill_payments;
CREATE POLICY "Users can delete their own bill payments" ON bill_payments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for bill_reminders
-- Drop policies if they exist, then recreate them
DROP POLICY IF EXISTS "Users can view their own bill reminders" ON bill_reminders;
CREATE POLICY "Users can view their own bill reminders" ON bill_reminders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own bill reminders" ON bill_reminders;
CREATE POLICY "Users can insert their own bill reminders" ON bill_reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own bill reminders" ON bill_reminders;
CREATE POLICY "Users can update their own bill reminders" ON bill_reminders
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bill reminders" ON bill_reminders;
CREATE POLICY "Users can delete their own bill reminders" ON bill_reminders
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================================
-- STEP 7: Create triggers for updated_at
-- =====================================================================

-- Drop triggers if they exist, then recreate them
DROP TRIGGER IF EXISTS update_bill_payments_updated_at ON bill_payments;
CREATE TRIGGER update_bill_payments_updated_at 
  BEFORE UPDATE ON bill_payments
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bill_reminders_updated_at ON bill_reminders;
CREATE TRIGGER update_bill_reminders_updated_at 
  BEFORE UPDATE ON bill_reminders
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- STEP 8: Create helper functions
-- =====================================================================

-- Function to calculate next due date for recurring bills
CREATE OR REPLACE FUNCTION calculate_next_due_date(
  current_due_date DATE,
  frequency VARCHAR(20),
  recurrence_pattern JSONB DEFAULT NULL
) RETURNS DATE AS $$
DECLARE
  next_date DATE;
BEGIN
  CASE frequency
    WHEN 'daily' THEN
      next_date := current_due_date + INTERVAL '1 day';
    WHEN 'weekly' THEN
      next_date := current_due_date + INTERVAL '1 week';
    WHEN 'bi-weekly' THEN
      next_date := current_due_date + INTERVAL '2 weeks';
    WHEN 'monthly' THEN
      next_date := current_due_date + INTERVAL '1 month';
    WHEN 'quarterly' THEN
      next_date := current_due_date + INTERVAL '3 months';
    WHEN 'semi-annually' THEN
      next_date := current_due_date + INTERVAL '6 months';
    WHEN 'yearly' THEN
      next_date := current_due_date + INTERVAL '1 year';
    ELSE
      next_date := NULL; -- one-time bills
  END CASE;
  
  RETURN next_date;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- STEP 9: Comments for documentation
-- =====================================================================

COMMENT ON TABLE upcoming_bills IS 'Enhanced table for tracking upcoming bills with payment history, reminders, and budget integration';
COMMENT ON TABLE bill_payments IS 'Payment history for bills, tracking individual payments and linking to transactions';
COMMENT ON TABLE bill_reminders IS 'Reminder history and scheduling for bill notifications';

COMMENT ON COLUMN upcoming_bills.next_due_date IS 'Calculated next occurrence date for recurring bills';
COMMENT ON COLUMN upcoming_bills.recurrence_pattern IS 'JSONB pattern for complex recurrence rules (e.g., last Friday of month)';
COMMENT ON COLUMN upcoming_bills.total_paid_amount IS 'Total amount paid across all payments for this bill';
COMMENT ON COLUMN upcoming_bills.payment_count IS 'Number of times this bill has been paid';
COMMENT ON COLUMN upcoming_bills.reminder_days_before IS 'Array of days before due date to send reminders (e.g., [7, 3, 1])';
COMMENT ON COLUMN upcoming_bills.is_included_in_budget IS 'Whether this bill should be included in budget calculations';

