-- =====================================================================
-- FIX autopay_source COLUMN TO BE NULLABLE
-- =====================================================================
-- Migration: 20250117_fix_autopay_source_nullable.sql
-- Description: Make autopay_source nullable in upcoming_bills_real table
--              to allow NULL values when autopay is false
-- =====================================================================

-- Make autopay_source nullable in upcoming_bills_real table
-- This allows NULL values when autopay is false, which is valid according to the CHECK constraint
ALTER TABLE upcoming_bills_real 
  ALTER COLUMN autopay_source DROP NOT NULL;

-- Also ensure upcoming_bills table has nullable autopay_source (if it was set to NOT NULL)
DO $$ 
BEGIN
  -- Check if autopay_source exists and is NOT NULL, then make it nullable
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'upcoming_bills' 
    AND column_name = 'autopay_source'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE upcoming_bills 
      ALTER COLUMN autopay_source DROP NOT NULL;
  END IF;
END $$;

