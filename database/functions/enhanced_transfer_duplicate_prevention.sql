-- ============================================================================
-- Enhanced Transfer Duplicate Prevention
-- ============================================================================
-- Created: 2025-10-20
-- Purpose: Prevent duplicate transfer transactions when uploading statements
--          from different banks that reference the same transfer
-- ============================================================================

-- ============================================================================
-- Function: check_transfer_duplicate
-- ============================================================================
-- Specifically checks for transfer duplicates using:
-- 1. UPI/Bank reference numbers
-- 2. Date + Amount + Account pair matching
-- 3. Single-entry transfer system rules
-- ============================================================================

CREATE OR REPLACE FUNCTION check_transfer_duplicate(
    p_user_id UUID,
    p_date TIMESTAMPTZ,
    p_amount NUMERIC,
    p_type TEXT,
    p_source_account_id UUID DEFAULT NULL,
    p_destination_account_id UUID DEFAULT NULL,
    p_upi_reference TEXT DEFAULT NULL,
    p_bank_reference TEXT DEFAULT NULL,
    p_neft_reference TEXT DEFAULT NULL
)
RETURNS TABLE(
    is_duplicate BOOLEAN,
    existing_transaction_id UUID,
    duplicate_reason TEXT,
    match_details JSONB
) AS $$
DECLARE
    v_existing_id UUID;
    v_existing_record RECORD;
BEGIN
    -- Only check for duplicates if this is a transfer
    IF p_type != 'transfer' THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::JSONB;
        RETURN;
    END IF;

    -- ========================================================================
    -- CHECK 1: UPI Reference Match
    -- ========================================================================
    -- Most reliable: Same UPI reference = same transfer
    IF p_upi_reference IS NOT NULL AND p_upi_reference != '' THEN
        SELECT 
            t.id,
            t.source_account_id,
            t.destination_account_id,
            t.amount,
            t.date,
            t.upi_reference_number
        INTO v_existing_record
        FROM transactions_real t
        WHERE t.user_id = p_user_id
          AND t.type = 'transfer'
          AND t.upi_reference_number = p_upi_reference
        LIMIT 1;

        IF v_existing_record.id IS NOT NULL THEN
            RETURN QUERY SELECT 
                true,
                v_existing_record.id,
                'Duplicate transfer: Same UPI reference found',
                jsonb_build_object(
                    'match_type', 'upi_reference',
                    'upi_reference', p_upi_reference,
                    'existing_source', v_existing_record.source_account_id,
                    'existing_destination', v_existing_record.destination_account_id,
                    'new_source', p_source_account_id,
                    'new_destination', p_destination_account_id
                );
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- CHECK 2: Bank Reference Match
    -- ========================================================================
    IF p_bank_reference IS NOT NULL AND p_bank_reference != '' THEN
        SELECT 
            t.id,
            t.source_account_id,
            t.destination_account_id,
            t.amount,
            t.date,
            t.bank_reference_number
        INTO v_existing_record
        FROM transactions_real t
        WHERE t.user_id = p_user_id
          AND t.type = 'transfer'
          AND t.bank_reference_number = p_bank_reference
        LIMIT 1;

        IF v_existing_record.id IS NOT NULL THEN
            RETURN QUERY SELECT 
                true,
                v_existing_record.id,
                'Duplicate transfer: Same bank reference found',
                jsonb_build_object(
                    'match_type', 'bank_reference',
                    'bank_reference', p_bank_reference,
                    'existing_source', v_existing_record.source_account_id,
                    'existing_destination', v_existing_record.destination_account_id
                );
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- CHECK 3: NEFT Reference Match
    -- ========================================================================
    IF p_neft_reference IS NOT NULL AND p_neft_reference != '' THEN
        SELECT 
            t.id,
            t.source_account_id,
            t.destination_account_id,
            t.amount,
            t.date,
            t.neft_reference_number
        INTO v_existing_record
        FROM transactions_real t
        WHERE t.user_id = p_user_id
          AND t.type = 'transfer'
          AND t.neft_reference_number = p_neft_reference
        LIMIT 1;

        IF v_existing_record.id IS NOT NULL THEN
            RETURN QUERY SELECT 
                true,
                v_existing_record.id,
                'Duplicate transfer: Same NEFT reference found',
                jsonb_build_object(
                    'match_type', 'neft_reference',
                    'neft_reference', p_neft_reference
                );
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- CHECK 4: Date + Amount + Account Pair Match
    -- ========================================================================
    -- Check if a transfer with same date, amount, and account pair exists
    -- This catches transfers even without reference numbers
    IF p_source_account_id IS NOT NULL AND p_destination_account_id IS NOT NULL THEN
        SELECT t.id
        INTO v_existing_id
        FROM transactions_real t
        WHERE t.user_id = p_user_id
          AND t.type = 'transfer'
          AND t.date::DATE = p_date::DATE
          AND t.amount = p_amount
          AND (
              -- Exact match: same source and destination
              (t.source_account_id = p_source_account_id 
               AND t.destination_account_id = p_destination_account_id)
              OR
              -- Reverse match: this is the other side of the transfer
              (t.source_account_id = p_destination_account_id 
               AND t.destination_account_id = p_source_account_id)
          )
        LIMIT 1;

        IF v_existing_id IS NOT NULL THEN
            RETURN QUERY SELECT 
                true,
                v_existing_id,
                'Duplicate transfer: Same date, amount, and account pair',
                jsonb_build_object(
                    'match_type', 'account_pair',
                    'date', p_date::DATE,
                    'amount', p_amount
                );
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- CHECK 5: Same Account + Date + Amount (Single Account Match)
    -- ========================================================================
    -- Check if a transfer already exists involving one of these accounts
    -- This is important for single-entry transfer system
    IF p_source_account_id IS NOT NULL OR p_destination_account_id IS NOT NULL THEN
        SELECT t.id
        INTO v_existing_id
        FROM transactions_real t
        WHERE t.user_id = p_user_id
          AND t.type = 'transfer'
          AND t.date::DATE = p_date::DATE
          AND t.amount = p_amount
          AND (
              t.source_account_id = p_source_account_id
              OR t.destination_account_id = p_destination_account_id
              OR t.source_account_id = p_destination_account_id
              OR t.destination_account_id = p_source_account_id
          )
        LIMIT 1;

        IF v_existing_id IS NOT NULL THEN
            RETURN QUERY SELECT 
                true,
                v_existing_id,
                'Duplicate transfer: Same date, amount, and account match (likely other side of transfer)',
                jsonb_build_object(
                    'match_type', 'single_account',
                    'date', p_date::DATE,
                    'amount', p_amount,
                    'note', 'This transfer already exists. Do not insert the destination side.'
                );
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- No duplicate found
    -- ========================================================================
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::JSONB;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION check_transfer_duplicate IS 
'Enhanced duplicate detection specifically for transfer transactions. Checks UPI/bank references, account pairs, and single-entry system rules.';

-- ============================================================================
-- Function: enhanced_bulk_insert_with_transfer_check
-- ============================================================================
-- Enhanced version of bulk insert that uses the new transfer duplicate check
-- ============================================================================

CREATE OR REPLACE FUNCTION enhanced_bulk_insert_with_transfer_check(
    transactions_data JSONB
)
RETURNS TABLE(
    status TEXT,
    inserted_count INTEGER,
    duplicate_count INTEGER,
    skipped_transfers INTEGER,
    error_count INTEGER,
    details JSONB
) AS $$
DECLARE
    transaction_record JSONB;
    inserted_records INTEGER := 0;
    duplicate_records INTEGER := 0;
    skipped_transfer_records INTEGER := 0;
    error_records INTEGER := 0;
    results_array JSONB := '[]'::jsonb;
    temp_transaction_id UUID;
    v_is_duplicate BOOLEAN;
    v_existing_id UUID;
    v_duplicate_reason TEXT;
    v_match_details JSONB;
    v_type TEXT;
BEGIN
    -- Process each transaction
    FOR transaction_record IN SELECT * FROM jsonb_array_elements(transactions_data)
    LOOP
        BEGIN
            v_type := transaction_record->>'type';

            -- Special handling for transfers
            IF v_type = 'transfer' THEN
                -- Use enhanced transfer duplicate check
                SELECT * INTO v_is_duplicate, v_existing_id, v_duplicate_reason, v_match_details
                FROM check_transfer_duplicate(
                    (transaction_record->>'user_id')::UUID,
                    (transaction_record->>'date')::TIMESTAMPTZ,
                    (transaction_record->>'amount')::NUMERIC,
                    v_type,
                    NULLIF(transaction_record->>'source_account_id', '')::UUID,
                    NULLIF(transaction_record->>'destination_account_id', '')::UUID,
                    COALESCE(
                        transaction_record->>'upi_reference',
                        transaction_record->'metadata'->>'upi_reference'
                    ),
                    COALESCE(
                        transaction_record->>'bank_reference',
                        transaction_record->'metadata'->>'bank_reference'
                    ),
                    COALESCE(
                        transaction_record->>'neft_reference',
                        transaction_record->'metadata'->>'neft_reference'
                    )
                );

                IF v_is_duplicate THEN
                    skipped_transfer_records := skipped_transfer_records + 1;
                    results_array := results_array || jsonb_build_object(
                        'status', 'skipped_duplicate_transfer',
                        'reason', v_duplicate_reason,
                        'existing_id', v_existing_id,
                        'match_details', v_match_details,
                        'transaction_name', transaction_record->>'name'
                    );
                    CONTINUE;
                END IF;
            ELSE
                -- Use standard duplicate check for non-transfers
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

                IF v_is_duplicate THEN
                    duplicate_records := duplicate_records + 1;
                    results_array := results_array || jsonb_build_object(
                        'status', 'skipped_duplicate',
                        'reason', v_duplicate_reason,
                        'existing_id', v_existing_id,
                        'transaction_name', transaction_record->>'name'
                    );
                    CONTINUE;
                END IF;
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
                NOW(),
                NOW()
            );

            inserted_records := inserted_records + 1;
            results_array := results_array || jsonb_build_object(
                'status', 'inserted',
                'id', temp_transaction_id,
                'transaction_name', transaction_record->>'name'
            );

        EXCEPTION WHEN OTHERS THEN
            error_records := error_records + 1;
            results_array := results_array || jsonb_build_object(
                'status', 'error',
                'error', SQLERRM,
                'transaction_name', transaction_record->>'name'
            );
        END;
    END LOOP;

    -- Return summary
    RETURN QUERY SELECT
        'completed'::TEXT,
        inserted_records,
        duplicate_records,
        skipped_transfer_records,
        error_records,
        results_array;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION enhanced_bulk_insert_with_transfer_check IS 
'Enhanced bulk insert that uses transfer-specific duplicate detection to prevent duplicate transfers from different bank statements.';

-- ============================================================================
-- Grant Permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION check_transfer_duplicate TO authenticated;
GRANT EXECUTE ON FUNCTION enhanced_bulk_insert_with_transfer_check TO authenticated;

-- ============================================================================
-- Usage Examples
-- ============================================================================

-- Example 1: Check if a specific transfer is a duplicate
/*
SELECT * FROM check_transfer_duplicate(
    'user-uuid',
    '2025-09-08'::TIMESTAMPTZ,
    50000,
    'transfer',
    'icici-account-uuid',
    'idfc-account-uuid',
    'AXIIUP59037399627697688436492955336',  -- UPI reference
    NULL,
    NULL
);
*/

-- Example 2: Bulk insert with enhanced transfer checking
/*
SELECT * FROM enhanced_bulk_insert_with_transfer_check('[
    {
        "user_id": "user-uuid",
        "name": "Transfer to IDFC",
        "description": "UPI/...",
        "amount": 50000,
        "date": "2025-09-08",
        "type": "transfer",
        "source_account_id": "icici-uuid",
        "destination_account_id": "idfc-uuid",
        "source_account_type": "bank",
        "metadata": {
            "upi_reference": "AXIIUP59037399627697688436492955336"
        }
    }
]'::jsonb);
*/

