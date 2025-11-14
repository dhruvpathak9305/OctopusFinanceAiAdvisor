-- Fix get_group_balances function to handle missing u.name column
-- Issue: auth.users doesn't have a 'name' column in Supabase
-- Solution: Get name from group_members.user_name or auth.users.raw_user_meta_data

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
    -- Get user name from multiple sources with fallback chain:
    -- 1. group_members.user_name (stored when adding member)
    -- 2. auth.users.raw_user_meta_data->>'name' (from auth signup)
    -- 3. auth.users.raw_user_meta_data->>'full_name' (alternative metadata field)
    -- 4. Email username (fallback if no name available)
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

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.get_group_balances(UUID) TO authenticated;

COMMENT ON FUNCTION public.get_group_balances IS 'Get member balances for a group with proper user name handling from group_members or auth.users metadata';

