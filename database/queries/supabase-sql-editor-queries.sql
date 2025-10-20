-- =====================================================================
-- SUPABASE SQL EDITOR QUERIES
-- =====================================================================
-- Copy and paste these queries one by one into your Supabase SQL Editor
-- Project: fzzbfgnmbchhmqepwmer
-- =====================================================================

-- =====================================================================
-- QUERY 1: 🔥 TRIGGERS
-- =====================================================================
-- Copy this query and run it in Supabase SQL Editor:

SELECT 
  '🔥 TRIGGERS' as section,
  trigger_name,
  event_manipulation as event_type,
  event_object_table as table_name,
  action_timing as timing,
  action_statement as function_call
FROM information_schema.triggers 
WHERE trigger_schema IN ('public', 'auth')
ORDER BY event_object_table, trigger_name;

-- =====================================================================
-- QUERY 2: 📊 INDEXES  
-- =====================================================================
-- Copy this query and run it in Supabase SQL Editor:

SELECT 
  '📊 INDEXES' as section,
  schemaname as schema,
  tablename as table_name,
  indexname as index_name,
  indexdef as definition
FROM pg_indexes 
WHERE schemaname IN ('public', 'auth')
ORDER BY tablename, indexname;

-- =====================================================================
-- QUERY 3: 🔒 RLS POLICIES
-- =====================================================================
-- Copy this query and run it in Supabase SQL Editor:

SELECT 
  '🔒 RLS POLICIES' as section,
  schemaname as schema,
  tablename as table_name,
  policyname as policy_name,
  permissive,
  roles,
  cmd as command_type,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE schemaname IN ('public', 'auth')
ORDER BY tablename, policyname;

-- =====================================================================
-- QUERY 4: 🔐 AUTH SCHEMA TABLES
-- =====================================================================
-- Copy this query and run it in Supabase SQL Editor:

SELECT 
  '🔐 AUTH TABLES' as section,
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'auth'
ORDER BY table_name, ordinal_position;

-- =====================================================================
-- QUERY 5: 🛠️ ALL FUNCTIONS
-- =====================================================================
-- Copy this query and run it in Supabase SQL Editor:

SELECT 
  '🛠️ FUNCTIONS' as section,
  routine_schema as schema,
  routine_name as function_name,
  routine_type as type,
  data_type as return_type,
  external_language as language
FROM information_schema.routines 
WHERE routine_schema IN ('public', 'auth')
ORDER BY routine_schema, routine_name;

-- =====================================================================
-- QUERY 6: 🔗 CONSTRAINTS
-- =====================================================================
-- Copy this query and run it in Supabase SQL Editor:

SELECT 
  '🔗 CONSTRAINTS' as section,
  constraint_schema as schema,
  table_name,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE constraint_schema IN ('public', 'auth')
ORDER BY table_name, constraint_type;

-- =====================================================================
-- QUERY 7: 🧩 EXTENSIONS
-- =====================================================================
-- Copy this query and run it in Supabase SQL Editor:

SELECT 
  '🧩 EXTENSIONS' as section,
  extname as extension_name,
  extversion as version
FROM pg_extension
ORDER BY extname;

-- =====================================================================
-- QUERY 8: 📊 SUMMARY STATISTICS
-- =====================================================================
-- Copy this query and run it in Supabase SQL Editor:

SELECT 
  '📊 DATABASE SUMMARY' as section,
  metric,
  count
FROM (
  SELECT 'Public Tables' as metric, COUNT(*)::text as count
  FROM information_schema.tables WHERE table_schema = 'public'
  UNION ALL
  SELECT 'Auth Tables' as metric, COUNT(*)::text as count
  FROM information_schema.tables WHERE table_schema = 'auth'
  UNION ALL
  SELECT 'Public Functions' as metric, COUNT(*)::text as count
  FROM information_schema.routines WHERE routine_schema = 'public'
  UNION ALL
  SELECT 'Auth Functions' as metric, COUNT(*)::text as count
  FROM information_schema.routines WHERE routine_schema = 'auth'
  UNION ALL
  SELECT 'RLS Policies' as metric, COUNT(*)::text as count
  FROM pg_policies WHERE schemaname IN ('public', 'auth')
  UNION ALL
  SELECT 'Triggers' as metric, COUNT(*)::text as count
  FROM information_schema.triggers WHERE trigger_schema IN ('public', 'auth')
  UNION ALL
  SELECT 'Indexes' as metric, COUNT(*)::text as count
  FROM pg_indexes WHERE schemaname IN ('public', 'auth')
) stats
ORDER BY metric;
