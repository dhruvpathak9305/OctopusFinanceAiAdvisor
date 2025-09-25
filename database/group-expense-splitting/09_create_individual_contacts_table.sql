-- Create individual_contacts table for storing individual contacts used in expense splitting
CREATE TABLE IF NOT EXISTS public.individual_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- The user who added this contact
  contact_name TEXT,
  contact_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  CONSTRAINT individual_contacts_pkey PRIMARY KEY (id),
  CONSTRAINT individual_contacts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  
  -- Ensure unique contact per user
  CONSTRAINT individual_contacts_unique_user_email UNIQUE (user_id, contact_email)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_individual_contacts_user_id ON public.individual_contacts USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_individual_contacts_email ON public.individual_contacts USING btree (contact_email);
CREATE INDEX IF NOT EXISTS idx_individual_contacts_active ON public.individual_contacts USING btree (is_active) WHERE is_active = true;

-- Add RLS (Row Level Security)
ALTER TABLE public.individual_contacts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own contacts
CREATE POLICY "Users can view their own contacts" ON public.individual_contacts
  FOR SELECT USING (user_id = auth.uid());

-- Policy: Users can create their own contacts
CREATE POLICY "Users can create their own contacts" ON public.individual_contacts
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own contacts
CREATE POLICY "Users can update their own contacts" ON public.individual_contacts
  FOR UPDATE USING (user_id = auth.uid());

-- Policy: Users can delete their own contacts
CREATE POLICY "Users can delete their own contacts" ON public.individual_contacts
  FOR DELETE USING (user_id = auth.uid());

-- Create function to add or get individual contact
CREATE OR REPLACE FUNCTION public.add_or_get_individual_contact(
  p_contact_email TEXT,
  p_contact_name TEXT DEFAULT NULL
) RETURNS UUID
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
