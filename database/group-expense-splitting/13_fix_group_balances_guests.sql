-- Fix get_group_balances to properly handle guest users
-- Issue: Guest users with NULL user_id get grouped together into "Unknown Member"
-- Solution: Use transaction_splits.id or guest info to distinguish between different guests

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
  WITH group_splits AS (
    -- Get all splits for this group with guest info
    SELECT 
      ts.user_id,
      ts.guest_name,
      ts.guest_email,
      ts.transaction_id,
      ts.share_amount,
      ts.is_guest_user,
      -- Create a unique identifier for each participant (registered or guest)
      CASE 
        WHEN ts.user_id IS NOT NULL THEN ts.user_id::TEXT
        ELSE 'guest_' || ts.guest_email || '_' || ts.guest_name
      END as participant_key
    FROM public.transaction_splits ts
    WHERE ts.group_id = p_group_id
  ),
  user_payments AS (
    SELECT 
      gs.participant_key,
      gs.user_id,
      gs.guest_name,
      gs.guest_email,
      gs.is_guest_user,
      COALESCE(SUM(t.amount), 0) as total_paid
    FROM group_splits gs
    INNER JOIN public.transactions_real t ON t.id = gs.transaction_id
    WHERE t.user_id = gs.user_id OR (gs.is_guest_user = true AND t.user_id IS NOT NULL)
    GROUP BY gs.participant_key, gs.user_id, gs.guest_name, gs.guest_email, gs.is_guest_user
  ),
  user_shares AS (
    SELECT 
      gs.participant_key,
      gs.user_id,
      gs.guest_name,
      gs.guest_email,
      gs.is_guest_user,
      COALESCE(SUM(gs.share_amount), 0) as total_owed
    FROM group_splits gs
    GROUP BY gs.participant_key, gs.user_id, gs.guest_name, gs.guest_email, gs.is_guest_user
  )
  SELECT 
    COALESCE(up.user_id, us.user_id) as user_id,
    -- Get name from multiple sources with proper guest handling
    COALESCE(
      up.guest_name,
      us.guest_name,
      gm.user_name, 
      u.raw_user_meta_data->>'name',
      u.raw_user_meta_data->>'full_name',
      split_part(COALESCE(up.guest_email, us.guest_email, gm.user_email, u.email), '@', 1)
    ) as user_name,
    COALESCE(
      up.guest_email,
      us.guest_email,
      gm.user_email, 
      u.email
    ) as user_email,
    COALESCE(up.total_paid, 0) as total_paid,
    COALESCE(us.total_owed, 0) as total_owed,
    COALESCE(up.total_paid, 0) - COALESCE(us.total_owed, 0) as net_balance
  FROM user_payments up
  FULL OUTER JOIN user_shares us ON up.participant_key = us.participant_key
  LEFT JOIN auth.users u ON COALESCE(up.user_id, us.user_id) = u.id
  LEFT JOIN public.group_members gm ON gm.user_id = COALESCE(up.user_id, us.user_id) 
                                    AND gm.group_id = p_group_id
  ORDER BY net_balance DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.get_group_balances(UUID) TO authenticated;

COMMENT ON FUNCTION public.get_group_balances IS 'Get member balances for a group with proper guest user handling - each guest shown separately';

