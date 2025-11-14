-- Database functions for expense splitting operations

-- Function to create a group with initial members
CREATE OR REPLACE FUNCTION create_group_with_members(
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_member_emails TEXT[] DEFAULT ARRAY[]::TEXT[]
) RETURNS UUID AS $$
DECLARE
  v_group_id UUID;
  v_member_email TEXT;
  v_user_id UUID;
BEGIN
  -- Create the group
  INSERT INTO public.groups (name, description, created_by)
  VALUES (p_name, p_description, auth.uid())
  RETURNING id INTO v_group_id;
  
  -- Add creator as admin
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (v_group_id, auth.uid(), 'admin');
  
  -- Add other members
  FOREACH v_member_email IN ARRAY p_member_emails
  LOOP
    -- Find user by email
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = v_member_email;
    
    -- Add member if user exists and not already in group
    IF v_user_id IS NOT NULL THEN
      INSERT INTO public.group_members (group_id, user_id, role)
      VALUES (v_group_id, v_user_id, 'member')
      ON CONFLICT (group_id, user_id) DO NOTHING;
    END IF;
  END LOOP;
  
  RETURN v_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create transaction with splits
CREATE OR REPLACE FUNCTION create_transaction_with_splits(
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
  
  -- Create the splits (supports both registered and guest users)
  FOREACH v_split IN ARRAY p_splits
  LOOP
    INSERT INTO public.transaction_splits (
      transaction_id, 
      user_id, 
      is_guest_user,
      guest_name,
      guest_email,
      guest_mobile,
      guest_relationship,
      group_id, 
      share_amount, 
      share_percentage,
      split_type, 
      paid_by, 
      notes
    ) VALUES (
      v_transaction_id,
      CASE WHEN COALESCE(v_split->>'is_guest', 'false')::BOOLEAN = false 
           THEN (v_split->>'user_id')::UUID 
           ELSE NULL 
      END,
      COALESCE((v_split->>'is_guest')::BOOLEAN, false),
      v_split->>'user_name',
      v_split->>'user_email',
      v_split->>'mobile_number',
      v_split->>'relationship',
      CASE WHEN v_split->>'group_id' != '' AND v_split->>'group_id' IS NOT NULL 
           THEN (v_split->>'group_id')::UUID 
           ELSE NULL 
      END,
      (v_split->>'share_amount')::NUMERIC,
      CASE WHEN v_split->>'share_percentage' != '' AND v_split->>'share_percentage' IS NOT NULL 
           THEN (v_split->>'share_percentage')::NUMERIC 
           ELSE NULL 
      END,
      COALESCE(v_split->>'split_type', 'equal'),
      CASE WHEN v_split->>'paid_by' != '' AND v_split->>'paid_by' IS NOT NULL 
           THEN (v_split->>'paid_by')::UUID 
           ELSE NULL 
      END,
      v_split->>'notes'
    );
  END LOOP;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate group balances
CREATE OR REPLACE FUNCTION get_group_balances(p_group_id UUID)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  total_paid NUMERIC,
  total_owed NUMERIC,
  net_balance NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH group_transactions AS (
    SELECT DISTINCT ts.transaction_id
    FROM public.transaction_splits ts
    WHERE ts.group_id = p_group_id
  ),
  user_payments AS (
    SELECT 
      t.user_id,
      COALESCE(SUM(t.amount), 0) as total_paid
    FROM public.transactions_real t
    INNER JOIN group_transactions gt ON t.id = gt.transaction_id
    GROUP BY t.user_id
  ),
  user_shares AS (
    SELECT 
      ts.user_id,
      COALESCE(SUM(ts.share_amount), 0) as total_owed
    FROM public.transaction_splits ts
    WHERE ts.group_id = p_group_id
    GROUP BY ts.user_id
  )
  SELECT 
    COALESCE(up.user_id, us.user_id) as user_id,
    COALESCE(
      gm.user_name, 
      u.raw_user_meta_data->>'name',
      u.raw_user_meta_data->>'full_name',
      split_part(u.email, '@', 1)
    ) as user_name,
    COALESCE(gm.user_email, u.email) as user_email,
    COALESCE(up.total_paid, 0) as total_paid,
    COALESCE(us.total_owed, 0) as total_owed,
    COALESCE(up.total_paid, 0) - COALESCE(us.total_owed, 0) as net_balance
  FROM user_payments up
  FULL OUTER JOIN user_shares us ON up.user_id = us.user_id
  LEFT JOIN auth.users u ON COALESCE(up.user_id, us.user_id) = u.id
  LEFT JOIN public.group_members gm ON gm.user_id = COALESCE(up.user_id, us.user_id) AND gm.group_id = p_group_id
  ORDER BY net_balance DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to settle a split
CREATE OR REPLACE FUNCTION settle_transaction_split(
  p_split_id UUID,
  p_settlement_method TEXT DEFAULT 'other',
  p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.transaction_splits
  SET 
    is_paid = true,
    settled_at = NOW(),
    settlement_method = p_settlement_method,
    notes = COALESCE(p_notes, notes),
    updated_at = NOW()
  WHERE id = p_split_id
    AND user_id = auth.uid(); -- Only user can settle their own split
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unsettled splits for a user
CREATE OR REPLACE FUNCTION get_user_unsettled_splits(p_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  split_id UUID,
  transaction_id UUID,
  transaction_name TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE,
  share_amount NUMERIC,
  group_name TEXT,
  paid_by_name TEXT
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
    payer.name as paid_by_name
  FROM public.transaction_splits ts
  INNER JOIN public.transactions_real t ON ts.transaction_id = t.id
  LEFT JOIN public.groups g ON ts.group_id = g.id
  LEFT JOIN auth.users payer ON ts.paid_by = payer.id
  WHERE ts.user_id = p_user_id
    AND ts.is_paid = false
  ORDER BY t.date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
