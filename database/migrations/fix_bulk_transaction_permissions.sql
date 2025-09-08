-- =====================================================================
-- FIX BULK TRANSACTION PERMISSIONS ERROR
-- =====================================================================
-- This migration removes the session_replication_role setting that
-- causes permission errors in hosted PostgreSQL environments like Supabase
-- =====================================================================

-- Drop and recreate the bulk_insert_transactions function without permission-restricted commands
DROP FUNCTION IF EXISTS bulk_insert_transactions(JSONB);

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
        NOW(),
        NOW()
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
  ) affected_accounts;
  
  -- Return results
  IF error_records = 0 THEN
    status := 'SUCCESS';
  ELSIF inserted_records > 0 THEN
    status := 'PARTIAL';
  ELSE
    status := 'FAILED';
  END IF;
  
  inserted_count := inserted_records;
  error_count := error_records;
  errors := errors_array;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comment
COMMENT ON FUNCTION bulk_insert_transactions(JSONB) IS 
'Fixed version - efficiently inserts multiple transactions without permission-restricted commands';
