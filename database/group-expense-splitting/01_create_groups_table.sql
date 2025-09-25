-- Create groups table for expense splitting (Splitwise-style)
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  group_image_url TEXT, -- Optional group avatar/image
  
  CONSTRAINT groups_pkey PRIMARY KEY (id),
  CONSTRAINT groups_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT groups_name_check CHECK (char_length(name) >= 1 AND char_length(name) <= 100)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON public.groups USING btree (created_by);
CREATE INDEX IF NOT EXISTS idx_groups_active ON public.groups USING btree (is_active) WHERE is_active = true;

-- Add RLS (Row Level Security)
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Note: Group membership policy will be added after group_members table is created

-- Policy: Users can create groups
CREATE POLICY "Users can create groups" ON public.groups
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Policy: Group creators can update their groups
CREATE POLICY "Group creators can update groups" ON public.groups
  FOR UPDATE USING (created_by = auth.uid());

-- Policy: Group creators can delete their groups
CREATE POLICY "Group creators can delete groups" ON public.groups
  FOR DELETE USING (created_by = auth.uid());
