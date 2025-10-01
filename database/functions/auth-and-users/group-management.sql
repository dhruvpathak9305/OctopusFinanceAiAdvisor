-- =====================================================================
-- AUTH & USERS - GROUP MANAGEMENT FUNCTIONS
-- =====================================================================
-- Functions for managing user groups, memberships, and contacts
-- =====================================================================

-- =====================================================================
-- ADD_GROUP_MEMBER
-- =====================================================================
-- Purpose: Add a member to an expense-sharing group
-- Parameters:
--   p_group_id: UUID - The group to add member to
--   p_email: TEXT - Email address of the member
--   p_name: TEXT (optional) - Display name for the member
--   p_role: TEXT (optional) - Role in group (default: 'member')
-- Returns: UUID - The member ID
-- =====================================================================

CREATE OR REPLACE FUNCTION add_group_member(
  p_group_id UUID,
  p_email TEXT,
  p_name TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'member'
)
RETURNS UUID
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

-- =====================================================================
-- CREATE_GROUP_WITH_MEMBERS
-- =====================================================================
-- Purpose: Create a new group and add initial members
-- Parameters:
--   p_name: TEXT - Group name
--   p_description: TEXT (optional) - Group description
--   p_member_emails: TEXT[] (optional) - Array of member email addresses
-- Returns: UUID - The created group ID
-- =====================================================================

CREATE OR REPLACE FUNCTION create_group_with_members(
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_member_emails TEXT[] DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- =====================================================================
-- ADD_OR_GET_INDIVIDUAL_CONTACT
-- =====================================================================
-- Purpose: Add or retrieve an individual contact for expense splitting
-- Parameters:
--   p_contact_email: TEXT - Contact's email address
--   p_contact_name: TEXT (optional) - Contact's display name
-- Returns: UUID - The contact ID
-- =====================================================================

CREATE OR REPLACE FUNCTION add_or_get_individual_contact(
  p_contact_email TEXT,
  p_contact_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_contact_id UUID;
  v_user_id UUID;
  v_contact_name TEXT;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Set contact name
  v_contact_name := COALESCE(p_contact_name, split_part(p_contact_email, '@', 1));
  
  -- Try to get existing contact
  SELECT id INTO v_contact_id
  FROM public.individual_contacts
  WHERE user_id = v_user_id AND contact_email = p_contact_email AND is_active = true;
  
  -- If contact doesn't exist, create it
  IF v_contact_id IS NULL THEN
    INSERT INTO public.individual_contacts (
      user_id,
      contact_name,
      contact_email
    ) VALUES (
      v_user_id,
      v_contact_name,
      p_contact_email
    )
    RETURNING id INTO v_contact_id;
  END IF;
  
  RETURN v_contact_id;
END;
$$;

-- =====================================================================
-- CREATE_TEST_CONTACTS
-- =====================================================================
-- Purpose: Create test contacts for development/testing
-- Parameters: None
-- Returns: VOID
-- =====================================================================

CREATE OR REPLACE FUNCTION create_test_contacts()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN 
  INSERT INTO public.individual_contacts (user_id, contact_name, contact_email) 
  SELECT auth.uid(), 'Test Contact', 'test@example.com' 
  WHERE NOT EXISTS (
    SELECT 1 FROM public.individual_contacts 
    WHERE user_id = auth.uid() AND contact_email = 'test@example.com'
  ); 
END;
$$;
