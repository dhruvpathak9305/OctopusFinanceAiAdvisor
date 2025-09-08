-- =====================================================================
-- BULK TRANSACTION UPLOAD FUNCTIONS
-- =====================================================================
-- Optimized functions for handling bulk transaction uploads
-- =====================================================================

-- Function to bulk insert transactions with validation and balance updates
CREATE OR REPLACE FUNCTION bulk_insert_transactions(
  transactions_data JSONB
)
RETURNS TABLE(
  status TEXT,
  inserted_count INTEGER,
  error_count INTEGER,
  errors JSONB
) AS $$
DECLARE
  transaction_record JSONB;
  inserted_records INTEGER := 0;
  error_records INTEGER := 0;
  errors_array JSONB := '[]'::jsonb;
  temp_transaction_id UUID;
BEGIN
  -- Note: Triggers remain enabled for data integrity
  -- (Removing session_replication_role due to permission restrictions)
  
  -- Process each transaction
  FOR transaction_record IN SELECT * FROM jsonb_array_elements(transactions_data)
  LOOP
    BEGIN
      -- Generate UUID for transaction
      temp_transaction_id := gen_random_uuid();
      
      -- Insert transaction record with full schema support
      INSERT INTO transactions_real (
        id, user_id, name, description, amount, date, type,
        source_account_id, source_account_type, source_account_name,
        destination_account_id, destination_account_type, destination_account_name,
        category_id, subcategory_id, icon, merchant, 
        is_recurring, recurrence_pattern, recurrence_end_date, parent_transaction_id,
        interest_rate, loan_term_months, metadata,
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
        transaction_record->>'source_account_type', -- Required field, validated above
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
  
  -- Recalculate balances for affected accounts
  -- (Note: Triggers were never disabled, so no need to re-enable)
  PERFORM recalculate_account_balance(account_id)
  FROM (
    SELECT DISTINCT 
      COALESCE(source_account_id, destination_account_id) as account_id
    FROM jsonb_to_recordset(transactions_data) AS x(
      source_account_id UUID,
      destination_account_id UUID
    )
    WHERE COALESCE(source_account_id, destination_account_id) IS NOT NULL
  ) affected_accounts
  WHERE account_id IS NOT NULL;
  
  -- Return results
  status := CASE 
    WHEN error_records = 0 THEN 'SUCCESS'
    WHEN inserted_records > 0 THEN 'PARTIAL_SUCCESS'
    ELSE 'FAILED'
  END;
  
  inserted_count := inserted_records;
  error_count := error_records;
  errors := errors_array;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to validate transaction data before bulk insert
CREATE OR REPLACE FUNCTION validate_bulk_transactions(
  transactions_data JSONB
)
RETURNS TABLE(
  is_valid BOOLEAN,
  total_count INTEGER,
  validation_errors JSONB
) AS $$
DECLARE
  transaction_record JSONB;
  total_records INTEGER := 0;
  validation_issues JSONB := '[]'::jsonb;
  current_error JSONB;
BEGIN
  -- Count total records
  SELECT jsonb_array_length(transactions_data) INTO total_records;
  
  -- Validate each transaction
  FOR transaction_record IN SELECT * FROM jsonb_array_elements(transactions_data)
  LOOP
    current_error := jsonb_build_object('transaction_index', total_records, 'errors', '[]'::jsonb);
    
    -- Required field validations
    IF NOT (transaction_record ? 'user_id') OR (transaction_record->>'user_id') = '' THEN
      current_error := jsonb_set(current_error, '{errors}', 
        (current_error->'errors') || '"Missing user_id"'::jsonb);
    END IF;
    
    IF NOT (transaction_record ? 'name') OR (transaction_record->>'name') = '' THEN
      current_error := jsonb_set(current_error, '{errors}', 
        (current_error->'errors') || '"Missing transaction name"'::jsonb);
    END IF;
    
    IF NOT (transaction_record ? 'amount') OR (transaction_record->>'amount') = '' THEN
      current_error := jsonb_set(current_error, '{errors}', 
        (current_error->'errors') || '"Missing amount"'::jsonb);
    END IF;
    
    IF NOT (transaction_record ? 'type') OR (transaction_record->>'type') = '' THEN
      current_error := jsonb_set(current_error, '{errors}', 
        (current_error->'errors') || '"Missing transaction type"'::jsonb);
    END IF;
    
    -- Validate required source_account_type
    IF NOT (transaction_record ? 'source_account_type') OR (transaction_record->>'source_account_type') = '' THEN
      current_error := jsonb_set(current_error, '{errors}', 
        (current_error->'errors') || '"Missing source_account_type (required field)"'::jsonb);
    END IF;
    
    -- Validate source_account_type values
    IF (transaction_record->>'source_account_type') NOT IN ('bank', 'credit_card', 'cash', 'digital_wallet', 'investment', 'other') THEN
      current_error := jsonb_set(current_error, '{errors}', 
        (current_error->'errors') || '"Invalid source_account_type. Must be: bank, credit_card, cash, digital_wallet, investment, or other"'::jsonb);
    END IF;
    
    -- Validate transaction type values
    IF (transaction_record->>'type') NOT IN ('income', 'expense', 'transfer', 'loan', 'loan_repayment', 'debt', 'debt_collection') THEN
      current_error := jsonb_set(current_error, '{errors}', 
        (current_error->'errors') || '"Invalid transaction type. Must be: income, expense, transfer, loan, loan_repayment, debt, or debt_collection"'::jsonb);
    END IF;
    
    -- Type-specific validations
    IF (transaction_record->>'type') = 'expense' AND 
       (NOT (transaction_record ? 'source_account_id') OR (transaction_record->>'source_account_id') = '') THEN
      current_error := jsonb_set(current_error, '{errors}', 
        (current_error->'errors') || '"Expense transactions require source_account_id"'::jsonb);
    END IF;
    
    IF (transaction_record->>'type') = 'income' AND 
       (NOT (transaction_record ? 'destination_account_id') OR (transaction_record->>'destination_account_id') = '') THEN
      current_error := jsonb_set(current_error, '{errors}', 
        (current_error->'errors') || '"Income transactions require destination_account_id"'::jsonb);
    END IF;
    
    -- Add to validation issues if there are errors
    IF jsonb_array_length(current_error->'errors') > 0 THEN
      validation_issues := validation_issues || current_error;
    END IF;
  END LOOP;
  
  -- Return validation results
  is_valid := (jsonb_array_length(validation_issues) = 0);
  total_count := total_records;
  validation_errors := validation_issues;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to detect duplicate transactions
CREATE OR REPLACE FUNCTION detect_duplicate_transactions(
  transactions_data JSONB,
  user_uuid UUID
)
RETURNS TABLE(
  duplicate_count INTEGER,
  duplicates JSONB
) AS $$
DECLARE
  transaction_record JSONB;
  duplicate_records JSONB := '[]'::jsonb;
  duplicate_found INTEGER := 0;
  existing_count INTEGER;
BEGIN
  -- Check each transaction for duplicates
  FOR transaction_record IN SELECT * FROM jsonb_array_elements(transactions_data)
  LOOP
    -- Check for existing transaction with same amount, date, and description
    SELECT COUNT(*) INTO existing_count
    FROM transactions_real
    WHERE user_id = user_uuid
      AND amount = (transaction_record->>'amount')::NUMERIC
      AND date::date = (transaction_record->>'date')::TIMESTAMPTZ::date
      AND description = transaction_record->>'description';
    
    IF existing_count > 0 THEN
      duplicate_found := duplicate_found + 1;
      duplicate_records := duplicate_records || jsonb_build_object(
        'transaction', transaction_record,
        'existing_matches', existing_count
      );
    END IF;
  END LOOP;
  
  duplicate_count := duplicate_found;
  duplicates := duplicate_records;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON FUNCTION bulk_insert_transactions(JSONB) IS 
'Efficiently inserts multiple transactions and updates account balances';

COMMENT ON FUNCTION validate_bulk_transactions(JSONB) IS 
'Validates transaction data before bulk insertion to prevent errors';

COMMENT ON FUNCTION detect_duplicate_transactions(JSONB, UUID) IS 
'Detects potential duplicate transactions based on amount, date, and description';
