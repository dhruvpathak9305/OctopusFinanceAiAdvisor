-- =====================================================================
-- COMPLETE DATABASE SCHEMA CAPTURE
-- =====================================================================
-- This script captures ALL database objects including triggers, indexes, 
-- RLS policies, and auth schema objects that TypeScript generator misses
-- =====================================================================

-- =====================================================================
-- 1. TRIGGERS
-- =====================================================================
SELECT 
  '=== TRIGGERS ===' as section,
  trigger_name,
  event_manipulation as event_type,
  event_object_schema as schema_name,
  event_object_table as table_name,
  action_timing,
  action_statement,
  action_condition
FROM information_schema.triggers 
WHERE trigger_schema IN ('public', 'auth')
ORDER BY event_object_table, trigger_name;

-- =====================================================================
-- 2. INDEXES
-- =====================================================================
SELECT 
  '=== INDEXES ===' as section,
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname IN ('public', 'auth')
ORDER BY tablename, indexname;

-- =====================================================================
-- 3. ROW LEVEL SECURITY POLICIES
-- =====================================================================
SELECT 
  '=== RLS POLICIES ===' as section,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command_type,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE schemaname IN ('public', 'auth')
ORDER BY tablename, policyname;

-- =====================================================================
-- 4. AUTH SCHEMA TABLES
-- =====================================================================
SELECT 
  '=== AUTH TABLES ===' as section,
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'auth'
ORDER BY table_name, ordinal_position;

-- =====================================================================
-- 5. ALL FUNCTIONS (including those not in TypeScript)
-- =====================================================================
SELECT 
  '=== ALL FUNCTIONS ===' as section,
  routine_schema as schema_name,
  routine_name as function_name,
  routine_type,
  data_type as return_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema IN ('public', 'auth')
ORDER BY routine_schema, routine_name;

-- =====================================================================
-- 6. CONSTRAINTS (Check, Unique, etc.)
-- =====================================================================
SELECT 
  '=== CONSTRAINTS ===' as section,
  constraint_schema,
  table_name,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE constraint_schema IN ('public', 'auth')
ORDER BY table_name, constraint_type;

-- =====================================================================
-- 7. SEQUENCES
-- =====================================================================
SELECT 
  '=== SEQUENCES ===' as section,
  sequence_schema,
  sequence_name,
  data_type,
  start_value,
  minimum_value,
  maximum_value,
  increment
FROM information_schema.sequences 
WHERE sequence_schema IN ('public', 'auth')
ORDER BY sequence_name;

-- =====================================================================
-- 8. EXTENSIONS
-- =====================================================================
SELECT 
  '=== EXTENSIONS ===' as section,
  extname as extension_name,
  extversion as version
FROM pg_extension
ORDER BY extname;
