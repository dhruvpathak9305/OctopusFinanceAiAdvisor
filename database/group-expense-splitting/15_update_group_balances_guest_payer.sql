-- Migration #15: Update get_group_balances to handle guest payers
-- Purpose: Calculate balances correctly when guests are the payers
--
-- This updates the balance calculation to check both:
-- 1. paid_by column (for registered user payers)
-- 2. paid_by_guest_* columns (for guest user payers)

CREATE OR REPLACE FUNCTION public.get_group_balances(p_group_id UUID)
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
  WITH all_participants AS (
    -- Get all unique participants (registered + guests)
    SELECT DISTINCT
      ts.user_id,
      ts.is_guest_user,
      ts.guest_name,
      ts.guest_email,
      CASE 
        WHEN ts.user_id IS NOT NULL THEN ts.user_id::TEXT
        WHEN ts.is_guest_user = true THEN 
          'guest_' || COALESCE(ts.guest_name, 'unknown') || '_' || COALESCE(ts.guest_email, 'noemail')
        ELSE 'unknown_' || ts.id::TEXT
      END as participant_key
    FROM public.transaction_splits ts
    WHERE ts.group_id = p_group_id
  ),
  payments_by_participant AS (
    -- Calculate what each person PAID (checking both paid_by and paid_by_guest_*)
    SELECT 
      ap.participant_key,
      ap.user_id,
      ap.guest_name,
      ap.guest_email,
      ap.is_guest_user,
      COALESCE(SUM(
        CASE 
          -- Registered user paid (paid_by matches)
          WHEN ap.user_id IS NOT NULL AND ts.paid_by = ap.user_id THEN t.amount
          
          -- Guest user paid (paid_by is NULL, guest fields match)
          WHEN ap.is_guest_user = true 
               AND ts.paid_by IS NULL
               AND ts.paid_by_guest_name = ap.guest_name 
               AND COALESCE(ts.paid_by_guest_email, '') = COALESCE(ap.guest_email, '')
               THEN t.amount
          
          ELSE 0
        END
      ), 0) as total_paid
    FROM all_participants ap
    LEFT JOIN public.transaction_splits ts ON ts.group_id = p_group_id
    LEFT JOIN public.transactions_real t ON t.id = ts.transaction_id
    GROUP BY ap.participant_key, ap.user_id, ap.guest_name, ap.guest_email, ap.is_guest_user
  ),
  shares_by_participant AS (
    -- Calculate what each person OWES (their share)
    SELECT 
      ap.participant_key,
      COALESCE(SUM(ts.share_amount), 0) as total_owed
    FROM all_participants ap
    LEFT JOIN public.transaction_splits ts ON (
      (ap.user_id IS NOT NULL AND ts.user_id = ap.user_id)
      OR 
      (ap.is_guest_user = true AND ts.is_guest_user = true 
       AND ts.guest_name = ap.guest_name 
       AND COALESCE(ts.guest_email, '') = COALESCE(ap.guest_email, ''))
    ) AND ts.group_id = p_group_id
    GROUP BY ap.participant_key
  )
  SELECT 
    pbp.user_id as user_id,
    -- Get user name with fallback chain
    COALESCE(
      pbp.guest_name,                              -- Guest name from splits
      gm.user_name,                                 -- Name from group_members
      u.raw_user_meta_data->>'name',               -- Name from auth metadata
      u.raw_user_meta_data->>'full_name',          -- Alternative auth field
      split_part(COALESCE(pbp.guest_email, gm.user_email, u.email, 'unknown'), '@', 1)  -- Email username
    ) as user_name,
    COALESCE(pbp.guest_email, gm.user_email, u.email) as user_email,
    pbp.total_paid,
    COALESCE(sbp.total_owed, 0) as total_owed,
    pbp.total_paid - COALESCE(sbp.total_owed, 0) as net_balance
  FROM payments_by_participant pbp
  LEFT JOIN shares_by_participant sbp ON pbp.participant_key = sbp.participant_key
  LEFT JOIN auth.users u ON pbp.user_id = u.id
  LEFT JOIN public.group_members gm ON gm.user_id = pbp.user_id AND gm.group_id = p_group_id
  ORDER BY net_balance DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.get_group_balances(UUID) TO authenticated;

COMMENT ON FUNCTION public.get_group_balances IS 
'Get member balances for a group with full guest payer support.
Checks both paid_by (registered users) and paid_by_guest_* (guest users) to correctly calculate who paid.
Returns who paid what, who owes what, and net balance for each participant (registered + guests).
Positive net_balance = others owe them, Negative = they owe others.';

-- Test query (commented out - for manual testing)
-- SELECT * FROM get_group_balances('your-group-id-here');

