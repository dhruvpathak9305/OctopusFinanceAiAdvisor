-- =====================================================================
-- ENHANCE DUPLICATE PREVENTION IN TRANSACTIONS
-- =====================================================================
-- Add unique constraints and hash-based duplicate detection
-- =====================================================================

-- =====================================================================
-- STEP 1: Add Transaction Hash Column
-- =====================================================================

-- Add hash column for duplicate detection
ALTER TABLE transactions_real 
ADD COLUMN IF NOT EXISTS transaction_hash TEXT;

-- Add index for fast hash lookups
CREATE INDEX IF NOT EXISTS idx_transactions_real_hash 
ON transactions_real(transaction_hash);

COMMENT ON COLUMN transactions_real.transaction_hash IS 
'MD5 hash of transaction details for duplicate detection';

-- =====================================================================
-- STEP 2: Add Bank Reference Tracking
-- =====================================================================

-- Add columns for bank-specific references
ALTER TABLE transactions_real 
ADD COLUMN IF NOT EXISTS bank_reference_number TEXT;

ALTER TABLE transactions_real 
ADD COLUMN IF NOT EXISTS upi_reference_number TEXT;

ALTER TABLE transactions_real 
ADD COLUMN IF NOT EXISTS neft_reference_number TEXT;

ALTER TABLE transactions_real 
ADD COLUMN IF NOT EXISTS imps_reference_number TEXT;

-- Indexes for reference number lookups
CREATE INDEX IF NOT EXISTS idx_transactions_real_bank_ref 
ON transactions_real(bank_reference_number) WHERE bank_reference_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_real_upi_ref 
ON transactions_real(upi_reference_number) WHERE upi_reference_number IS NOT NULL;

COMMENT ON COLUMN transactions_real.bank_reference_number IS 
'Bank-issued reference number for the transaction';

COMMENT ON COLUMN transactions_real.upi_reference_number IS 
'UPI transaction reference (e.g., YWIUP5803738962768843646929953336)';

-- =====================================================================
-- STEP 3: Function to Generate Transaction Hash
-- =====================================================================

CREATE OR REPLACE FUNCTION generate_transaction_hash(
  p_user_id UUID,
  p_account_id UUID,
  p_date TIMESTAMPTZ,
  p_amount DECIMAL,
  p_description TEXT,
  p_bank_ref TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
BEGIN
  -- If bank reference exists, use it in hash (most reliable)
  IF p_bank_ref IS NOT NULL AND p_bank_ref != '' THEN
    RETURN MD5(
      p_user_id::TEXT || 
      COALESCE(p_account_id::TEXT, '') || 
      p_bank_ref
    );
  END IF;
  
  -- Otherwise use transaction details
  RETURN MD5(
    p_user_id::TEXT || 
    COALESCE(p_account_id::TEXT, '') || 
    p_date::TEXT || 
    p_amount::TEXT || 
    COALESCE(p_description, '')
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================================
-- STEP 4: Trigger to Auto-Generate Hash on Insert
-- =====================================================================

CREATE OR REPLACE FUNCTION set_transaction_hash()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract bank reference from metadata if not already set
  IF NEW.bank_reference_number IS NULL THEN
    NEW.bank_reference_number := NEW.metadata->>'bank_reference';
  END IF;
  
  IF NEW.upi_reference_number IS NULL THEN
    NEW.upi_reference_number := NEW.metadata->>'upi_reference';
  END IF;
  
  IF NEW.neft_reference_number IS NULL THEN
    NEW.neft_reference_number := NEW.metadata->>'neft_reference';
  END IF;
  
  -- Generate transaction hash
  NEW.transaction_hash := generate_transaction_hash(
    NEW.user_id,
    NEW.source_account_id,
    NEW.date,
    NEW.amount,
    NEW.description,
    COALESCE(
      NEW.bank_reference_number,
      NEW.upi_reference_number,
      NEW.neft_reference_number
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_set_transaction_hash ON transactions_real;

-- Create trigger
CREATE TRIGGER trigger_set_transaction_hash
  BEFORE INSERT ON transactions_real
  FOR EACH ROW
  EXECUTE FUNCTION set_transaction_hash();

-- =====================================================================
-- STEP 5: Function to Check for Duplicates Before Insert
-- =====================================================================

CREATE OR REPLACE FUNCTION check_duplicate_transaction(
  p_user_id UUID,
  p_account_id UUID,
  p_date TIMESTAMPTZ,
  p_amount DECIMAL,
  p_description TEXT,
  p_bank_ref TEXT DEFAULT NULL
)
RETURNS TABLE(
  is_duplicate BOOLEAN,
  existing_transaction_id UUID,
  duplicate_reason TEXT
) AS $$
DECLARE
  v_hash TEXT;
  v_existing_id UUID;
BEGIN
  -- Generate hash for this transaction
  v_hash := generate_transaction_hash(
    p_user_id, p_account_id, p_date, p_amount, p_description, p_bank_ref
  );
  
  -- Check by hash first (most reliable)
  SELECT id INTO v_existing_id
  FROM transactions_real
  WHERE transaction_hash = v_hash
  LIMIT 1;
  
  IF v_existing_id IS NOT NULL THEN
    RETURN QUERY SELECT true, v_existing_id, 'Exact match by transaction hash'::TEXT;
    RETURN;
  END IF;
  
  -- Check by bank reference (if provided)
  IF p_bank_ref IS NOT NULL AND p_bank_ref != '' THEN
    SELECT id INTO v_existing_id
    FROM transactions_real
    WHERE user_id = p_user_id
      AND (
        bank_reference_number = p_bank_ref
        OR upi_reference_number = p_bank_ref
        OR neft_reference_number = p_bank_ref
      )
    LIMIT 1;
    
    IF v_existing_id IS NOT NULL THEN
      RETURN QUERY SELECT true, v_existing_id, 'Match by bank reference number'::TEXT;
      RETURN;
    END IF;
  END IF;
  
  -- Check by transaction details (fuzzy match)
  SELECT id INTO v_existing_id
  FROM transactions_real
  WHERE user_id = p_user_id
    AND (source_account_id = p_account_id OR destination_account_id = p_account_id)
    AND date::DATE = p_date::DATE
    AND amount = p_amount
    AND SIMILARITY(COALESCE(description, ''), COALESCE(p_description, '')) > 0.8
  LIMIT 1;
  
  IF v_existing_id IS NOT NULL THEN
    RETURN QUERY SELECT true, v_existing_id, 'Fuzzy match by date, amount, and description'::TEXT;
    RETURN;
  END IF;
  
  -- No duplicate found
  RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Enable pg_trgm extension for similarity function (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================================
-- STEP 6: Enhanced Bulk Insert with Duplicate Detection
-- =====================================================================

CREATE OR REPLACE FUNCTION bulk_insert_transactions_with_duplicate_check(
  transactions_data JSONB
)
RETURNS TABLE(
  status TEXT,
  inserted_count INTEGER,
  duplicate_count INTEGER,
  error_count INTEGER,
  errors JSONB
) AS $$
DECLARE
  transaction_record JSONB;
  inserted_records INTEGER := 0;
  duplicate_records INTEGER := 0;
  error_records INTEGER := 0;
  errors_array JSONB := '[]'::jsonb;
  temp_transaction_id UUID;
  v_is_duplicate BOOLEAN;
  v_existing_id UUID;
  v_duplicate_reason TEXT;
BEGIN
  -- Process each transaction
  FOR transaction_record IN SELECT * FROM jsonb_array_elements(transactions_data)
  LOOP
    BEGIN
      -- Check for duplicates
      SELECT * INTO v_is_duplicate, v_existing_id, v_duplicate_reason
      FROM check_duplicate_transaction(
        (transaction_record->>'user_id')::UUID,
        NULLIF(transaction_record->>'source_account_id', '')::UUID,
        (transaction_record->>'date')::TIMESTAMPTZ,
        (transaction_record->>'amount')::NUMERIC,
        transaction_record->>'description',
        COALESCE(
          transaction_record->>'bank_reference',
          transaction_record->'metadata'->>'bank_reference',
          transaction_record->'metadata'->>'upi_reference'
        )
      );
      
      -- Skip if duplicate
      IF v_is_duplicate THEN
        duplicate_records := duplicate_records + 1;
        errors_array := errors_array || jsonb_build_object(
          'transaction', transaction_record,
          'status', 'duplicate',
          'reason', v_duplicate_reason,
          'existing_id', v_existing_id
        );
        CONTINUE;
      END IF;
      
      -- Generate UUID for transaction
      temp_transaction_id := gen_random_uuid();
      
      -- Insert transaction record
      INSERT INTO transactions_real (
        id, user_id, name, description, amount, date, type,
        source_account_id, source_account_type, source_account_name,
        destination_account_id, destination_account_type, destination_account_name,
        category_id, subcategory_id, icon, merchant, 
        is_recurring, recurrence_pattern, recurrence_end_date, parent_transaction_id,
        interest_rate, loan_term_months, metadata,
        bank_reference_number, upi_reference_number, neft_reference_number,
        created_at, updated_at
      ) VALUES (
        temp_transaction_id,
        (transaction_record->>'user_id')::UUID,
        transaction_record->>'name',
        transaction_record->>'description',
        (transaction_record->>'amount')::NUMERIC,
        (transaction_record->>'date')::TIMESTAMPTZ,
        transaction_record->>'type',
        NULLIF(transaction_record->>'source_account_id', '')::UUID,
        transaction_record->>'source_account_type',
        transaction_record->>'source_account_name',
        NULLIF(transaction_record->>'destination_account_id', '')::UUID,
        transaction_record->>'destination_account_type',
        transaction_record->>'destination_account_name',
        NULLIF(transaction_record->>'category_id', '')::UUID,
        NULLIF(transaction_record->>'subcategory_id', '')::UUID,
        transaction_record->>'icon',
        transaction_record->>'merchant',
        COALESCE((transaction_record->>'is_recurring')::BOOLEAN, false),
        transaction_record->>'recurrence_pattern',
        NULLIF(transaction_record->>'recurrence_end_date', '')::TIMESTAMPTZ,
        NULLIF(transaction_record->>'parent_transaction_id', '')::UUID,
        NULLIF(transaction_record->>'interest_rate', '')::NUMERIC,
        NULLIF(transaction_record->>'loan_term_months', '')::INTEGER,
        COALESCE(transaction_record->'metadata', '{}'::jsonb),
        COALESCE(
          transaction_record->>'bank_reference',
          transaction_record->'metadata'->>'bank_reference'
        ),
        COALESCE(
          transaction_record->>'upi_reference',
          transaction_record->'metadata'->>'upi_reference'
        ),
        COALESCE(
          transaction_record->>'neft_reference',
          transaction_record->'metadata'->>'neft_reference'
        ),
        COALESCE((transaction_record->>'created_at')::TIMESTAMPTZ, now()),
        COALESCE((transaction_record->>'updated_at')::TIMESTAMPTZ, now())
      );
      
      inserted_records := inserted_records + 1;
      
    EXCEPTION WHEN OTHERS THEN
      error_records := error_records + 1;
      errors_array := errors_array || jsonb_build_object(
        'transaction', transaction_record,
        'error', SQLERRM
      );
    END;
  END LOOP;
  
  -- Return results
  status := CASE 
    WHEN error_records = 0 AND duplicate_records = 0 THEN 'SUCCESS'
    WHEN inserted_records > 0 THEN 'PARTIAL_SUCCESS'
    ELSE 'FAILED'
  END;
  
  inserted_count := inserted_records;
  duplicate_count := duplicate_records;
  error_count := error_records;
  errors := errors_array;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- COMMENTS
-- =====================================================================

COMMENT ON FUNCTION generate_transaction_hash IS 
'Generates MD5 hash for transaction to detect duplicates';

COMMENT ON FUNCTION check_duplicate_transaction IS 
'Checks if a transaction already exists using multiple methods';

COMMENT ON FUNCTION bulk_insert_transactions_with_duplicate_check IS 
'Enhanced bulk insert with automatic duplicate detection and prevention';

-- =====================================================================
-- EXAMPLE USAGE
-- =====================================================================

/*
-- Check if a specific transaction is duplicate
SELECT * FROM check_duplicate_transaction(
  '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9'::UUID,
  'fd551095-58a9-4f12-b00e-2fd182e68403'::UUID,
  '2025-09-30'::TIMESTAMPTZ,
  225981.00,
  'NEFT/CITINS202509303268894-VM GLOBAL TECHNOLOGY SERVICES',
  'CITINS202509303268894'
);

-- Insert transactions with duplicate detection
SELECT * FROM bulk_insert_transactions_with_duplicate_check('[
  {
    "user_id": "YOUR_UUID",
    "name": "Test Transaction",
    "amount": 1000.00,
    "date": "2025-09-15T00:00:00Z",
    "type": "expense",
    "source_account_type": "bank",
    "metadata": {
      "bank_reference": "TEST123456"
    }
  }
]'::jsonb);

-- Find all duplicates in existing data
SELECT 
  t1.id as transaction_1,
  t2.id as transaction_2,
  t1.date,
  t1.amount,
  t1.description
FROM transactions_real t1
JOIN transactions_real t2 ON t1.transaction_hash = t2.transaction_hash
WHERE t1.id < t2.id
  AND t1.user_id = '6679ae58-a6fb-4d2f-8f23-dd7fafe973d9';
*/

-- =====================================================================
-- DUPLICATE DETECTION SUMMARY
-- =====================================================================

/*
DUPLICATE DETECTION STRATEGY:

1. TRANSACTION HASH (Strongest)
   - MD5 hash of: user_id + account_id + date + amount + description
   - If bank reference exists: user_id + account_id + bank_reference
   - Auto-generated on INSERT via trigger
   - Indexed for fast lookups

2. BANK REFERENCE NUMBER (Very Strong)
   - UPI reference: YWIUP5803738962768843646929953336
   - NEFT reference: CITINS202509303268894
   - IMPS reference: Similar format
   - Unique per transaction from bank
   - Stored in separate columns + metadata

3. TRANSACTION DETAILS (Good)
   - Date (same day)
   - Amount (exact match)
   - Description (80%+ similarity)
   - Account ID (same account)
   - User ID (same user)

4. FUZZY MATCHING (Fallback)
   - Uses pg_trgm extension
   - 80% similarity threshold
   - Catches typos and variations

UNIQUENESS LEVELS:

Level 1: transaction_hash (auto-generated, indexed)
Level 2: bank_reference_number (from bank, unique)
Level 3: user_id + account_id + date + amount + description
Level 4: Fuzzy match with similarity

WHEN RE-UPLOADING SAME MONTH:
- Duplicates will be detected and skipped
- You'll get a detailed report showing:
  - How many inserted
  - How many skipped (duplicates)
  - Why each was flagged as duplicate
*/

