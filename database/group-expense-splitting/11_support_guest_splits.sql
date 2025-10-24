-- Support guest (non-registered) users in transaction splits
-- This allows splitting expenses with people who don't have app accounts

-- Add columns to transaction_splits for guest user support
ALTER TABLE public.transaction_splits
  ADD COLUMN IF NOT EXISTS is_guest_user BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS guest_name TEXT,
  ADD COLUMN IF NOT EXISTS guest_email TEXT,
  ADD COLUMN IF NOT EXISTS guest_mobile TEXT,
  ADD COLUMN IF NOT EXISTS guest_relationship TEXT;

-- Drop the existing foreign key constraint that requires registered users
ALTER TABLE public.transaction_splits
  DROP CONSTRAINT IF EXISTS transaction_splits_user_id_fkey;

-- Make user_id nullable to support guest users
ALTER TABLE public.transaction_splits
  ALTER COLUMN user_id DROP NOT NULL;

-- Add conditional constraint: either registered user OR guest user (not both)
ALTER TABLE public.transaction_splits
  ADD CONSTRAINT transaction_splits_user_guest_check
  CHECK (
    -- Either it's a registered user (user_id exists, guest fields NULL)
    (is_guest_user = FALSE AND user_id IS NOT NULL AND guest_name IS NULL AND guest_email IS NULL) OR
    -- Or it's a guest user (guest fields exist, user_id NULL)
    (is_guest_user = TRUE AND user_id IS NULL AND guest_name IS NOT NULL AND guest_email IS NOT NULL)
  );

-- Create index for guest users
CREATE INDEX IF NOT EXISTS idx_transaction_splits_guest_email
  ON public.transaction_splits (guest_email)
  WHERE is_guest_user = TRUE;

CREATE INDEX IF NOT EXISTS idx_transaction_splits_is_guest
  ON public.transaction_splits (is_guest_user);

-- Add comments for documentation
COMMENT ON COLUMN public.transaction_splits.is_guest_user IS 'Whether this split is for a non-registered user (TRUE) or registered user (FALSE)';
COMMENT ON COLUMN public.transaction_splits.guest_name IS 'Name of guest user (required if is_guest_user = TRUE)';
COMMENT ON COLUMN public.transaction_splits.guest_email IS 'Email of guest user (required if is_guest_user = TRUE)';
COMMENT ON COLUMN public.transaction_splits.guest_mobile IS 'Mobile number of guest user (optional)';
COMMENT ON COLUMN public.transaction_splits.guest_relationship IS 'Relationship to transaction owner (optional, e.g., Friend, Family)';

-- Update the create_transaction_with_splits function to handle guest users
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
  
  -- Check if splits total matches transaction amount (allow 1 paisa difference for rounding)
  IF ABS(v_total_splits - v_transaction_amount) > 0.01 THEN
    RAISE EXCEPTION 'Split amounts (%) do not match transaction amount (%)', v_total_splits, v_transaction_amount;
  END IF;
  
  -- Create the transaction
  INSERT INTO public.transactions_real (
    user_id, name, description, amount, date, type,
    merchant, source_account_type, source_account_name,
    source_account_id, destination_account_id, category, subcategory,
    metadata
  ) VALUES (
    auth.uid(),
    p_transaction_data->>'name',
    p_transaction_data->>'description',
    v_transaction_amount,
    (p_transaction_data->>'date')::TIMESTAMP WITH TIME ZONE,
    p_transaction_data->>'type',
    p_transaction_data->>'merchant',
    p_transaction_data->>'source_account_type',
    p_transaction_data->>'source_account_name',
    CASE WHEN p_transaction_data->>'source_account_id' != '' THEN (p_transaction_data->>'source_account_id')::UUID ELSE NULL END,
    CASE WHEN p_transaction_data->>'destination_account_id' != '' THEN (p_transaction_data->>'destination_account_id')::UUID ELSE NULL END,
    p_transaction_data->>'category',
    p_transaction_data->>'subcategory',
    COALESCE(p_transaction_data->'metadata', '{}'::JSONB) || jsonb_build_object(
      'has_splits', true, 
      'split_count', array_length(p_splits, 1),
      'split_type', p_transaction_data->>'split_type'
    )
  ) RETURNING id INTO v_transaction_id;
  
  -- Create the splits
  FOREACH v_split IN ARRAY p_splits
  LOOP
    -- Check if this is a guest user split
    IF (v_split->>'is_guest')::BOOLEAN = TRUE THEN
      -- Insert guest user split
      INSERT INTO public.transaction_splits (
        transaction_id, is_guest_user, guest_name, guest_email, 
        guest_mobile, guest_relationship, group_id,
        share_amount, share_percentage, split_type, paid_by, notes
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
        CASE WHEN v_split->>'paid_by' != '' AND v_split->>'paid_by' IS NOT NULL 
          THEN (v_split->>'paid_by')::UUID ELSE auth.uid() END,
        v_split->>'notes'
      );
    ELSE
      -- Insert registered user split
      INSERT INTO public.transaction_splits (
        transaction_id, user_id, is_guest_user, group_id,
        share_amount, share_percentage, split_type, paid_by, notes
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
        CASE WHEN v_split->>'paid_by' != '' AND v_split->>'paid_by' IS NOT NULL 
          THEN (v_split->>'paid_by')::UUID ELSE auth.uid() END,
        v_split->>'notes'
      );
    END IF;
  END LOOP;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_transaction_with_splits(JSONB, JSONB[]) TO authenticated;

-- Update the get_user_unsettled_splits function to include guest users
CREATE OR REPLACE FUNCTION public.get_user_unsettled_splits(p_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  split_id UUID,
  transaction_id UUID,
  transaction_name TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE,
  share_amount NUMERIC,
  group_name TEXT,
  paid_by_name TEXT,
  is_guest_user BOOLEAN,
  participant_name TEXT,
  participant_email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ts.id as split_id,
    ts.transaction_id,
    t.name as transaction_name,
    t.date as transaction_date,
    ts.share_amount,
    g.name as group_name,
    payer.email as paid_by_name,
    ts.is_guest_user,
    COALESCE(ts.guest_name, u.email) as participant_name,
    COALESCE(ts.guest_email, u.email) as participant_email
  FROM public.transaction_splits ts
  INNER JOIN public.transactions_real t ON ts.transaction_id = t.id
  LEFT JOIN public.groups g ON ts.group_id = g.id
  LEFT JOIN auth.users payer ON ts.paid_by = payer.id
  LEFT JOIN auth.users u ON ts.user_id = u.id
  WHERE (ts.user_id = p_user_id OR (ts.is_guest_user = TRUE AND t.user_id = p_user_id))
    AND ts.is_paid = false
  ORDER BY t.date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_user_unsettled_splits(UUID) TO authenticated;

