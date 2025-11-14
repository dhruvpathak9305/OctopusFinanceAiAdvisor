-- Migration #14: Add guest payer tracking columns
-- Purpose: Fully support guest users as payers with accurate balance tracking
-- 
-- This adds columns to track which guest paid for a transaction when paid_by is NULL
-- Allows accurate balance calculations when guests are the payers

-- Add guest payer tracking columns
ALTER TABLE public.transaction_splits
  ADD COLUMN IF NOT EXISTS paid_by_guest_name TEXT,
  ADD COLUMN IF NOT EXISTS paid_by_guest_email TEXT,
  ADD COLUMN IF NOT EXISTS paid_by_guest_mobile TEXT;

-- Migrate existing data: For rows where paid_by is NULL (Phase 1 guest payers),
-- populate guest payer fields from the guest_name/guest_email columns
-- This handles transactions created during Phase 1 where guest was selected as payer
UPDATE public.transaction_splits
SET 
  paid_by_guest_name = COALESCE(guest_name, 'Unknown Guest'),
  paid_by_guest_email = COALESCE(guest_email, 'unknown@guest.local'),
  paid_by_guest_mobile = guest_mobile
WHERE paid_by IS NULL 
  AND paid_by_guest_name IS NULL
  AND is_guest_user = false; -- Only update registered user splits that have NULL paid_by

-- For guest user splits where paid_by is NULL, also populate the payer fields
-- (Assuming the guest themselves paid, which is common)
UPDATE public.transaction_splits
SET 
  paid_by_guest_name = guest_name,
  paid_by_guest_email = guest_email,
  paid_by_guest_mobile = guest_mobile
WHERE paid_by IS NULL 
  AND paid_by_guest_name IS NULL
  AND is_guest_user = true;

-- For any remaining rows where both paid_by and guest payer fields are NULL,
-- set paid_by to the transaction creator (safest fallback)
UPDATE public.transaction_splits ts
SET paid_by = t.user_id
FROM public.transactions_real t
WHERE ts.transaction_id = t.id
  AND ts.paid_by IS NULL
  AND ts.paid_by_guest_name IS NULL;

-- Add constraint: Either registered user paid OR guest user paid (not both, not neither)
ALTER TABLE public.transaction_splits
  DROP CONSTRAINT IF EXISTS transaction_splits_payer_check;

ALTER TABLE public.transaction_splits
  ADD CONSTRAINT transaction_splits_payer_check
  CHECK (
    -- Option 1: Registered user paid (paid_by exists, guest payer fields NULL)
    (paid_by IS NOT NULL AND paid_by_guest_name IS NULL AND paid_by_guest_email IS NULL) OR
    -- Option 2: Guest user paid (paid_by NULL, guest payer fields exist)
    (paid_by IS NULL AND paid_by_guest_name IS NOT NULL AND paid_by_guest_email IS NOT NULL)
  );

-- Create indexes for guest payer lookups
CREATE INDEX IF NOT EXISTS idx_transaction_splits_paid_by_guest_email
  ON public.transaction_splits (paid_by_guest_email)
  WHERE paid_by IS NULL AND paid_by_guest_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transaction_splits_paid_by_guest_name
  ON public.transaction_splits (paid_by_guest_name)
  WHERE paid_by IS NULL AND paid_by_guest_name IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.transaction_splits.paid_by_guest_name IS 'Name of guest user who paid (required if paid_by is NULL)';
COMMENT ON COLUMN public.transaction_splits.paid_by_guest_email IS 'Email of guest user who paid (required if paid_by is NULL)';
COMMENT ON COLUMN public.transaction_splits.paid_by_guest_mobile IS 'Mobile number of guest user who paid (optional)';

-- Update the create_transaction_with_splits function to handle guest payers
CREATE OR REPLACE FUNCTION public.create_transaction_with_splits(
  p_transaction_data JSONB,
  p_splits JSONB[]
) RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_split JSONB;
  v_total_splits NUMERIC := 0;
  v_transaction_amount NUMERIC;
BEGIN
  -- Extract transaction amount
  v_transaction_amount := (p_transaction_data->>'amount')::NUMERIC;
  
  -- Validate splits total
  FOREACH v_split IN ARRAY p_splits
  LOOP
    v_total_splits := v_total_splits + (v_split->>'share_amount')::NUMERIC;
  END LOOP;
  
  -- Check if splits total matches transaction amount (allow 1 paise difference for rounding)
  IF ABS(v_total_splits - v_transaction_amount) > 0.01 THEN
    RAISE EXCEPTION 'Split amounts (%) do not match transaction amount (%)', v_total_splits, v_transaction_amount;
  END IF;
  
  -- Create the transaction
  INSERT INTO public.transactions_real (
    user_id, name, description, amount, date, type,
    merchant, 
    source_account_id, source_account_type, source_account_name,
    destination_account_id, destination_account_type, destination_account_name,
    category_id, subcategory_id,
    is_recurring, recurrence_pattern, recurrence_end_date,
    metadata
  ) VALUES (
    auth.uid(),
    p_transaction_data->>'name',
    p_transaction_data->>'description',
    v_transaction_amount,
    (p_transaction_data->>'date')::TIMESTAMP WITH TIME ZONE,
    p_transaction_data->>'type',
    p_transaction_data->>'merchant',
    CASE WHEN p_transaction_data->>'source_account_id' != '' AND p_transaction_data->>'source_account_id' IS NOT NULL 
         THEN (p_transaction_data->>'source_account_id')::UUID 
         ELSE NULL 
    END,
    p_transaction_data->>'source_account_type',
    p_transaction_data->>'source_account_name',
    CASE WHEN p_transaction_data->>'destination_account_id' != '' AND p_transaction_data->>'destination_account_id' IS NOT NULL 
         THEN (p_transaction_data->>'destination_account_id')::UUID 
         ELSE NULL 
    END,
    p_transaction_data->>'destination_account_type',
    p_transaction_data->>'destination_account_name',
    CASE WHEN p_transaction_data->>'category_id' != '' AND p_transaction_data->>'category_id' IS NOT NULL 
         THEN (p_transaction_data->>'category_id')::UUID 
         ELSE NULL 
    END,
    CASE WHEN p_transaction_data->>'subcategory_id' != '' AND p_transaction_data->>'subcategory_id' IS NOT NULL 
         THEN (p_transaction_data->>'subcategory_id')::UUID 
         ELSE NULL 
    END,
    COALESCE((p_transaction_data->>'is_recurring')::BOOLEAN, false),
    p_transaction_data->>'recurrence_pattern',
    CASE WHEN p_transaction_data->>'recurrence_end_date' != '' AND p_transaction_data->>'recurrence_end_date' IS NOT NULL 
         THEN (p_transaction_data->>'recurrence_end_date')::TIMESTAMP WITH TIME ZONE 
         ELSE NULL 
    END,
    COALESCE(p_transaction_data->'metadata', '{}'::JSONB) || jsonb_build_object('has_splits', true, 'split_count', array_length(p_splits, 1))
  ) RETURNING id INTO v_transaction_id;
  
  -- Create the splits (supports both registered and guest users as participants AND payers)
  FOREACH v_split IN ARRAY p_splits
  LOOP
    -- Check if this is a guest user split
    IF (v_split->>'is_guest')::BOOLEAN = TRUE THEN
      -- Insert guest user split
      INSERT INTO public.transaction_splits (
        transaction_id, is_guest_user, guest_name, guest_email, 
        guest_mobile, guest_relationship, group_id,
        share_amount, share_percentage, split_type, 
        paid_by, paid_by_guest_name, paid_by_guest_email, paid_by_guest_mobile,
        notes
      ) VALUES (
        v_transaction_id,
        TRUE,
        v_split->>'user_name',
        v_split->>'user_email',
        v_split->>'mobile_number',
        v_split->>'relationship',
        CASE WHEN v_split->>'group_id' != '' AND v_split->>'group_id' IS NOT NULL 
          THEN (v_split->>'group_id')::UUID ELSE NULL END,
        (v_split->>'share_amount')::NUMERIC,
        CASE WHEN v_split->>'share_percentage' != '' AND v_split->>'share_percentage' IS NOT NULL 
          THEN (v_split->>'share_percentage')::NUMERIC ELSE NULL END,
        COALESCE(v_split->>'split_type', 'equal'),
        -- paid_by: Use if provided and not empty, otherwise NULL
        CASE WHEN v_split->>'paid_by' != '' AND v_split->>'paid_by' IS NOT NULL 
          THEN (v_split->>'paid_by')::UUID ELSE NULL END,
        -- Guest payer fields: Extract from paid_by_guest_* fields
        v_split->>'paid_by_guest_name',
        v_split->>'paid_by_guest_email',
        v_split->>'paid_by_guest_mobile',
        v_split->>'notes'
      );
    ELSE
      -- Insert registered user split
      INSERT INTO public.transaction_splits (
        transaction_id, user_id, is_guest_user, group_id,
        share_amount, share_percentage, split_type, 
        paid_by, paid_by_guest_name, paid_by_guest_email, paid_by_guest_mobile,
        notes
      ) VALUES (
        v_transaction_id,
        (v_split->>'user_id')::UUID,
        FALSE,
        CASE WHEN v_split->>'group_id' != '' AND v_split->>'group_id' IS NOT NULL 
          THEN (v_split->>'group_id')::UUID ELSE NULL END,
        (v_split->>'share_amount')::NUMERIC,
        CASE WHEN v_split->>'share_percentage' != '' AND v_split->>'share_percentage' IS NOT NULL 
          THEN (v_split->>'share_percentage')::NUMERIC ELSE NULL END,
        COALESCE(v_split->>'split_type', 'equal'),
        -- paid_by logic:
        -- 1. If paid_by is provided → use it
        -- 2. If guest payer fields provided → NULL (guest is payer)
        -- 3. Otherwise → current user is payer
        CASE 
          WHEN v_split->>'paid_by' != '' AND v_split->>'paid_by' IS NOT NULL 
            THEN (v_split->>'paid_by')::UUID
          WHEN v_split->>'paid_by_guest_name' IS NOT NULL AND v_split->>'paid_by_guest_email' IS NOT NULL
            THEN NULL
          ELSE auth.uid()
        END,
        -- Guest payer fields: Extract from paid_by_guest_* fields
        v_split->>'paid_by_guest_name',
        v_split->>'paid_by_guest_email',
        v_split->>'paid_by_guest_mobile',
        v_split->>'notes'
      );
    END IF;
  END LOOP;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.create_transaction_with_splits(JSONB, JSONB[]) TO authenticated;

COMMENT ON FUNCTION public.create_transaction_with_splits IS 
'Create a transaction with splits, supporting both registered and guest users as participants AND payers.
When paid_by is NULL, paid_by_guest_* fields identify which guest paid.';

