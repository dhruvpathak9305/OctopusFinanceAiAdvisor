-- Add simple policies without dropping existing ones
-- Use CREATE OR REPLACE where possible

-- Simple policy for groups - users can see groups they created
DO $$
BEGIN
  -- Try to create the policy, ignore if it exists
  BEGIN
    EXECUTE 'CREATE POLICY "simple_groups_select" ON public.groups FOR SELECT USING (created_by = auth.uid())';
  EXCEPTION WHEN duplicate_object THEN
    -- Policy already exists, that's fine
    NULL;
  END;
END $$;

-- Simple policy for group_members - users can see their own memberships
DO $$
BEGIN
  BEGIN
    EXECUTE 'CREATE POLICY "simple_members_select" ON public.group_members FOR SELECT USING (user_id = auth.uid())';
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- Simple policy for group creation
DO $$
BEGIN
  BEGIN
    EXECUTE 'CREATE POLICY "simple_groups_insert" ON public.groups FOR INSERT WITH CHECK (created_by = auth.uid())';
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- Simple policy for adding group members
DO $$
BEGIN
  BEGIN
    EXECUTE 'CREATE POLICY "simple_members_insert" ON public.group_members FOR INSERT WITH CHECK (true)';
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
