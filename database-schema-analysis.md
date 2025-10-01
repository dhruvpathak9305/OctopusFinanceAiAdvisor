# Complete Database Schema Analysis

## Overview

This document captures ALL database objects from your Supabase database that the TypeScript generator doesn't include.

## Method

Since direct SQL execution via CLI isn't available, we'll document the queries you can run in your Supabase SQL Editor to capture these objects.

---

## 🔥 TRIGGERS

**Query to run in Supabase SQL Editor:**

```sql
SELECT
  trigger_name,
  event_manipulation as event_type,
  event_object_table as table_name,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

**Expected Results:** Database triggers that automatically execute on INSERT/UPDATE/DELETE operations.

---

## 📊 INDEXES

**Query to run in Supabase SQL Editor:**

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Expected Results:** All database indexes for performance optimization.

---

## 🔒 ROW LEVEL SECURITY (RLS) POLICIES

**Query to run in Supabase SQL Editor:**

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command_type,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected Results:** All RLS policies that control data access at the row level.

---

## 🔐 AUTH SCHEMA OBJECTS

**Query to run in Supabase SQL Editor:**

```sql
-- Auth Tables Structure
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'auth'
ORDER BY table_name, ordinal_position;

-- Auth Functions
SELECT
  routine_name as function_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'auth'
ORDER BY routine_name;
```

**Expected Results:** Supabase's built-in authentication tables and functions.

---

## 🛠️ ALL FUNCTIONS (Complete List)

**Query to run in Supabase SQL Editor:**

```sql
SELECT
  routine_name as function_name,
  routine_type,
  data_type as return_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

**Expected Results:** All stored procedures and functions (including trigger functions).

---

## 🔗 CONSTRAINTS

**Query to run in Supabase SQL Editor:**

```sql
SELECT
  table_name,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE constraint_schema = 'public'
ORDER BY table_name, constraint_type;
```

**Expected Results:** Check constraints, unique constraints, foreign keys, etc.

---

## 🔢 SEQUENCES

**Query to run in Supabase SQL Editor:**

```sql
SELECT
  sequence_name,
  data_type,
  start_value,
  minimum_value,
  maximum_value,
  increment
FROM information_schema.sequences
WHERE sequence_schema = 'public'
ORDER BY sequence_name;
```

**Expected Results:** Auto-increment sequences used by your tables.

---

## 🧩 EXTENSIONS

**Query to run in Supabase SQL Editor:**

```sql
SELECT
  extname as extension_name,
  extversion as version
FROM pg_extension
ORDER BY extname;
```

**Expected Results:** PostgreSQL extensions enabled in your database.

---

## 📋 How to Execute

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/fzzbfgnmbchhmqepwmer)
2. Navigate to **SQL Editor**
3. Copy and paste each query above
4. Run them one by one
5. Export/save the results

This will give you a complete picture of your database beyond what the TypeScript generator captures.
