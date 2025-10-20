-- 🗑️ Clean up all Net Worth entries and metadata
-- Run this in your Supabase SQL Editor to remove all sample data

-- Delete metadata first (due to foreign key constraint)
DELETE FROM net_worth_entry_metadata_real;

-- Delete all entries 
DELETE FROM net_worth_entries_real;

-- Verify cleanup
SELECT 'Entries remaining:' as info, COUNT(*) as count FROM net_worth_entries_real
UNION ALL
SELECT 'Metadata remaining:' as info, COUNT(*) as count FROM net_worth_entry_metadata_real;

-- The result should show 0 for both
