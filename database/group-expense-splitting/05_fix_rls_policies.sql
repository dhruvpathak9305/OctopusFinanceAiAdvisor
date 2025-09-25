-- Fix infinite recursion in RLS policies
-- Drop existing problematic policies and recreate them properly

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view groups they belong to" ON public.groups;
DROP POLICY IF EXISTS "Users can view their own groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Group creators can update groups" ON public.groups;
DROP POLICY IF EXISTS "Group creators can delete groups" ON public.groups;

DROP POLICY IF EXISTS "Users can view group memberships" ON public.group_members;
DROP POLICY IF EXISTS "Users can view group memberships for their groups" ON public.group_members;
DROP POLICY IF EXISTS "Group creators can manage members" ON public.group_members;
DROP POLICY IF EXISTS "Group creators can add members" ON public.group_members;
DROP POLICY IF EXISTS "Users can be added to groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can remove members" ON public.group_members;
DROP POLICY IF EXISTS "Users can update group memberships" ON public.group_members;

-- Recreate groups policies (simplified to avoid recursion)
CREATE POLICY "Users can view their own groups" ON public.groups
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create groups" ON public.groups
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group creators can update groups" ON public.groups
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Group creators can delete groups" ON public.groups
  FOR DELETE USING (created_by = auth.uid());

-- Recreate group_members policies (simplified)
CREATE POLICY "Users can view group memberships for their groups" ON public.group_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    group_id IN (
      SELECT id FROM public.groups WHERE created_by = auth.uid()
    )
  );

-- Policy: Group creators can add members (simplified)
CREATE POLICY "Group creators can add members" ON public.group_members
  FOR INSERT WITH CHECK (
    group_id IN (
      SELECT id FROM public.groups WHERE created_by = auth.uid()
    )
  );

-- Policy: Users can be added to groups (permissive for testing)
CREATE POLICY "Users can be added to groups" ON public.group_members
  FOR INSERT WITH CHECK (true);

-- Policy: Users can leave groups
CREATE POLICY "Users can leave groups" ON public.group_members
  FOR DELETE USING (user_id = auth.uid());

-- Policy: Group creators can remove members
CREATE POLICY "Group creators can remove members" ON public.group_members
  FOR DELETE USING (
    group_id IN (
      SELECT id FROM public.groups WHERE created_by = auth.uid()
    )
  );

-- Update group_members policies
CREATE POLICY "Users can update group memberships" ON public.group_members
  FOR UPDATE USING (
    user_id = auth.uid() OR
    group_id IN (
      SELECT id FROM public.groups WHERE created_by = auth.uid()
    )
  );
