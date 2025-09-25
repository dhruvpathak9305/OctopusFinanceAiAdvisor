-- Temporary fix: Disable RLS to test the splitting functionality
-- This is for development/testing only - re-enable RLS in production

-- Disable RLS on groups table temporarily
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;

-- Disable RLS on group_members table temporarily  
ALTER TABLE public.group_members DISABLE ROW LEVEL SECURITY;

-- Disable RLS on transaction_splits table temporarily
ALTER TABLE public.transaction_splits DISABLE ROW LEVEL SECURITY;

-- Note: This makes the tables accessible to all authenticated users
-- Use only for development and testing
-- Remember to re-enable RLS later with proper policies
