-- Modify group_members table to support non-user members
-- This allows adding members who don't have accounts in the system

-- First, drop the foreign key constraint that requires user_id to be in auth.users
ALTER TABLE public.group_members DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;

-- Add columns for storing non-user member information
ALTER TABLE public.group_members 
  ADD COLUMN IF NOT EXISTS user_name TEXT,
  ADD COLUMN IF NOT EXISTS user_email TEXT,
  ADD COLUMN IF NOT EXISTS is_registered_user BOOLEAN DEFAULT TRUE;

-- Create function to add any member (user or non-user) to a group
CREATE OR REPLACE FUNCTION public.add_group_member(
  p_group_id UUID,
  p_email TEXT,
  p_name TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'member'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_member_id UUID;
  v_user_name TEXT;
  v_is_registered BOOLEAN := TRUE;
BEGIN
  -- Check if user exists in auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  -- If user exists, use their ID
  IF v_user_id IS NOT NULL THEN
    -- Get user's name if available
    SELECT COALESCE(raw_user_meta_data->>'name', email) INTO v_user_name
    FROM auth.users
    WHERE id = v_user_id;
    
    -- Check if user is already in the group
    IF EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = p_group_id AND user_id = v_user_id
    ) THEN
      RAISE EXCEPTION 'User is already a member of this group';
    END IF;
  ELSE
    -- For non-registered users, generate a placeholder UUID
    v_user_id := gen_random_uuid();
    v_user_name := COALESCE(p_name, split_part(p_email, '@', 1));
    v_is_registered := FALSE;
  END IF;
  
  -- Insert the member
  INSERT INTO public.group_members (
    group_id, 
    user_id, 
    role, 
    user_name, 
    user_email, 
    is_registered_user
  ) VALUES (
    p_group_id,
    v_user_id,
    p_role,
    v_user_name,
    p_email,
    v_is_registered
  )
  RETURNING id INTO v_member_id;
  
  RETURN v_member_id;
END;
$$;

-- Update RLS policies to work with non-user members
DROP POLICY IF EXISTS "Users can view group memberships" ON public.group_members;
CREATE POLICY "Users can view group memberships" ON public.group_members
  FOR SELECT USING (
    (is_registered_user = TRUE AND user_id = auth.uid()) OR 
    group_id IN (
      SELECT group_id FROM public.group_members 
      WHERE is_registered_user = TRUE AND user_id = auth.uid()
    )
  );
