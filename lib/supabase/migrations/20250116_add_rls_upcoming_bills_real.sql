-- =====================================================================
-- ADD RLS POLICIES FOR upcoming_bills_real TABLE
-- =====================================================================
-- Migration: 20250116_add_rls_upcoming_bills_real.sql
-- Description: Add Row Level Security policies for upcoming_bills_real table
--              to allow authenticated users to manage their own bills
-- =====================================================================

-- Enable Row Level Security on upcoming_bills_real if not already enabled
ALTER TABLE upcoming_bills_real ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view their own upcoming bills real" ON upcoming_bills_real;
DROP POLICY IF EXISTS "Users can insert their own upcoming bills real" ON upcoming_bills_real;
DROP POLICY IF EXISTS "Users can update their own upcoming bills real" ON upcoming_bills_real;
DROP POLICY IF EXISTS "Users can delete their own upcoming bills real" ON upcoming_bills_real;

-- Create RLS policies for upcoming_bills_real
-- SELECT: Users can view their own bills
CREATE POLICY "Users can view their own upcoming bills real" ON upcoming_bills_real
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT: Users can insert their own bills
CREATE POLICY "Users can insert their own upcoming bills real" ON upcoming_bills_real
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own bills
CREATE POLICY "Users can update their own upcoming bills real" ON upcoming_bills_real
  FOR UPDATE USING (auth.uid() = user_id);

-- DELETE: Users can delete their own bills
CREATE POLICY "Users can delete their own upcoming bills real" ON upcoming_bills_real
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================================
-- COMMENTS
-- =====================================================================
COMMENT ON POLICY "Users can view their own upcoming bills real" ON upcoming_bills_real IS 
  'Allows authenticated users to view only their own upcoming bills';
COMMENT ON POLICY "Users can insert their own upcoming bills real" ON upcoming_bills_real IS 
  'Allows authenticated users to insert bills with their own user_id';
COMMENT ON POLICY "Users can update their own upcoming bills real" ON upcoming_bills_real IS 
  'Allows authenticated users to update only their own upcoming bills';
COMMENT ON POLICY "Users can delete their own upcoming bills real" ON upcoming_bills_real IS 
  'Allows authenticated users to delete only their own upcoming bills';

