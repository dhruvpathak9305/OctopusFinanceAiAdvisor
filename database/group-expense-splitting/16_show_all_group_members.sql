-- Migration #16: Show ALL group members in balances (even with zero splits)
-- Purpose: Display complete member list with ₹0.00 for members who have no splits yet
--
-- This ensures the Member Balances section always shows all group members,
-- making it clear who's in the group and who hasn't participated in any expenses yet.

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
  WITH all_group_members AS (
    -- Start with ALL members in the group (registered + guests)
    SELECT DISTINCT
      gm.user_id,
      gm.is_registered_user,
      gm.user_name as member_name,
      gm.user_email as member_email,
      CASE 
        WHEN gm.user_id IS NOT NULL THEN gm.user_id::TEXT
        WHEN gm.is_registered_user = false THEN 
          'guest_' || COALESCE(gm.user_name, 'unknown') || '_' || COALESCE(gm.user_email, 'noemail')
        ELSE 'unknown_' || gm.id::TEXT
      END as participant_key
    FROM public.group_members gm
    WHERE gm.group_id = p_group_id
      AND gm.is_active = true
  ),
  split_participants AS (
    -- Also get any participants from splits who might not be in group_members
    -- (for backward compatibility with old data)
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
  all_participants AS (
    -- Combine group members with split participants
    SELECT 
      COALESCE(agm.user_id, sp.user_id) as user_id,
      COALESCE(agm.is_registered_user, NOT sp.is_guest_user) as is_registered_user,
      COALESCE(agm.member_name, sp.guest_name) as guest_name,
      COALESCE(agm.member_email, sp.guest_email) as guest_email,
      COALESCE(agm.participant_key, sp.participant_key) as participant_key
    FROM all_group_members agm
    FULL OUTER JOIN split_participants sp ON agm.participant_key = sp.participant_key
  ),
  payments_by_participant AS (
    -- Calculate what each person PAID (checking both paid_by and paid_by_guest_*)
    SELECT 
      ap.participant_key,
      ap.user_id,
      ap.guest_name,
      ap.guest_email,
      ap.is_registered_user,
      COALESCE(SUM(
        CASE 
          -- Registered user paid (paid_by matches)
          WHEN ap.user_id IS NOT NULL AND ts.paid_by = ap.user_id THEN t.amount
          
          -- Guest user paid (paid_by is NULL, guest fields match)
          WHEN ap.is_registered_user = false
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
    GROUP BY ap.participant_key, ap.user_id, ap.guest_name, ap.guest_email, ap.is_registered_user
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
      (ap.is_registered_user = false AND ts.is_guest_user = true 
       AND ts.guest_name = ap.guest_name 
       AND COALESCE(ts.guest_email, '') = COALESCE(ap.guest_email, ''))
    ) AND ts.group_id = p_group_id
    GROUP BY ap.participant_key
  )
  SELECT 
    pbp.user_id as user_id,
    -- Get user name with fallback chain
    COALESCE(
      pbp.guest_name,                              -- Guest name from group_members/splits
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
'Get member balances for a group, showing ALL group members (even those with ₹0.00).
- Starts with all members from group_members table
- Calculates paid/owed amounts from transaction_splits
- Shows ₹0.00 for members who haven''t participated in any splits yet
- Supports both registered users and guest users
- Handles guest payers correctly using paid_by_guest_* fields';

-- Test query (commented out - for manual testing)
-- SELECT * FROM get_group_balances('acaf8cbe-5a88-4372-8ee9-6e87a0d252e5');




