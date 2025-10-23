-- Add mobile_number and relationship fields to group_members table
-- This allows storing contact information and relationships for group members

-- Add the new columns
ALTER TABLE public.group_members 
  ADD COLUMN IF NOT EXISTS mobile_number TEXT,
  ADD COLUMN IF NOT EXISTS relationship TEXT;

-- Add a check constraint for mobile_number format (optional but recommended)
-- This allows various international formats
ALTER TABLE public.group_members
  ADD CONSTRAINT group_members_mobile_number_check 
  CHECK (mobile_number IS NULL OR char_length(mobile_number) >= 10);

-- Add index for mobile number searches (if needed for future features)
CREATE INDEX IF NOT EXISTS idx_group_members_mobile_number 
  ON public.group_members USING btree (mobile_number) 
  WHERE mobile_number IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.group_members.mobile_number IS 'Contact phone number for the group member';
COMMENT ON COLUMN public.group_members.relationship IS 'Relationship to the user (e.g., friend, family, colleague, roommate)';

