-- Create group_members table for expense splitting
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  CONSTRAINT group_members_pkey PRIMARY KEY (id),
  CONSTRAINT group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups (id) ON DELETE CASCADE,
  CONSTRAINT group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT group_members_role_check CHECK (role IN ('member', 'admin')),
  
  -- Ensure unique user per group
  CONSTRAINT group_members_unique_user_group UNIQUE (group_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members USING btree (group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_active ON public.group_members USING btree (is_active) WHERE is_active = true;

-- Add RLS (Row Level Security)
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see group memberships for groups they belong to
CREATE POLICY "Users can view group memberships" ON public.group_members
  FOR SELECT USING (
    user_id = auth.uid() OR 
    group_id IN (
      SELECT group_id FROM public.group_members 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Group creators and admins can add members
CREATE POLICY "Group creators can manage members" ON public.group_members
  FOR INSERT WITH CHECK (
    group_id IN (
      SELECT id FROM public.groups 
      WHERE created_by = auth.uid()
    ) OR
    group_id IN (
      SELECT group_id FROM public.group_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Users can leave groups (delete their own membership)
CREATE POLICY "Users can leave groups" ON public.group_members
  FOR DELETE USING (user_id = auth.uid());

-- Policy: Group creators and admins can remove members
CREATE POLICY "Group admins can remove members" ON public.group_members
  FOR DELETE USING (
    group_id IN (
      SELECT id FROM public.groups 
      WHERE created_by = auth.uid()
    ) OR
    group_id IN (
      SELECT group_id FROM public.group_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Now add the missing policy to groups table
CREATE POLICY "Users can view groups they belong to" ON public.groups
  FOR SELECT USING (
    created_by = auth.uid() OR 
    id IN (
      SELECT group_id FROM public.group_members 
      WHERE user_id = auth.uid()
    )
  );
