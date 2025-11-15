# 🎯 Goals Management System - Database Setup

**Quick start guide for setting up the Goals database**

---

## 📋 Files in This Directory

| File | Purpose | Run Order |
|------|---------|-----------|
| `001_create_core_goals_tables.sql` | Create 4 core tables, RLS, triggers, functions | 1st |
| `002_load_popular_categories.sql` | Load 50 popular goal categories | 2nd |

---

## 🚀 Quick Setup (5 Minutes)

### Option 1: Supabase Dashboard (Recommended)

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to your project → SQL Editor
3. Copy and paste `001_create_core_goals_tables.sql`
4. Click **Run**
5. Wait for success message
6. Copy and paste `002_load_popular_categories.sql`
7. Click **Run**
8. ✅ Done!

### Option 2: Command Line

```bash
# Navigate to project root
cd /Users/d0p0c9t/Desktop/OctopusFinanceAiAdvisor

# Connect to your Supabase database
psql -h your-project-ref.supabase.co -U postgres -d postgres

# Run migrations
\i database/goals/001_create_core_goals_tables.sql
\i database/goals/002_load_popular_categories.sql

# Verify
SELECT COUNT(*) FROM goals;
SELECT COUNT(*) FROM goal_categories;
```

---

## ✅ What Gets Created

### Tables (4)
- ✅ `goal_categories` - 50 pre-loaded categories
- ✅ `goals` - Main goals table
- ✅ `goal_contributions` - Contribution history
- ✅ `goal_milestones` - Achievement milestones

### Security
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Policies: Users can only see their own data
- ✅ Admin-only access for categories

### Automation
- ✅ Trigger: Auto-update goal progress on contribution
- ✅ Trigger: Auto-complete goal when target reached
- ✅ Trigger: Auto-check milestone achievements
- ✅ Function: Create default milestones (25%, 50%, 75%, 100%)

### Indexes
- ✅ 15+ optimized indexes for fast queries
- ✅ Compound indexes for common queries
- ✅ Partial indexes for active records

### Views
- ✅ `goal_summary` - Pre-joined view with all goal info

---

## 🧪 Test Your Setup

Run this SQL to test:

```sql
-- Check tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE 'goal%';

-- Check categories loaded
SELECT COUNT(*) as category_count, COUNT(*) FILTER (WHERE is_featured = true) as featured_count
FROM goal_categories;

-- Expected output: 50 categories, ~10 featured

-- Check RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE 'goal%';

-- Expected: All should show 't' (true)
```

---

## 📊 Sample Data (Optional)

Want to see the system in action? Run this to create test goals:

```sql
-- Test Goal 1: Emergency Fund
INSERT INTO goals (
  user_id, name, emoji, category_id, timeframe, priority, goal_type,
  target_amount, current_amount, start_date, target_date, monthly_target
)
SELECT 
  auth.uid(),
  'Emergency Fund',
  '🛡️',
  id,
  'short',
  'critical',
  'savings',
  10000,
  7500,
  CURRENT_DATE - INTERVAL '6 months',
  CURRENT_DATE + INTERVAL '3 months',
  500
FROM goal_categories
WHERE name = 'Emergency Fund'
LIMIT 1;

-- This will automatically:
-- ✅ Create 4 default milestones
-- ✅ Calculate progress (75%)
-- ✅ Set health score (50)
```

---

## 🔄 Next Steps

1. ✅ Database setup complete
2. ➡️ **Use TypeScript types**: `types/goal-extended.ts`
3. ➡️ **Use service layer**: `services/goalsService.ts`
4. ➡️ **Use React hook**: `hooks/useGoals.ts`
5. ➡️ **Build UI components**: Start with GoalCard

---

## 📚 Documentation

- **Main Docs**: `docs/features/GOALS_MANAGEMENT_SYSTEM.md`
- **Quick Start**: `docs/features/GOALS_QUICK_START.md`
- **Implementation Plan**: `docs/features/GOALS_IMPLEMENTATION_PLAN.md`

---

## 🆘 Troubleshooting

### Issue: "permission denied"
**Solution**: Make sure you're logged in as admin/postgres user

### Issue: "relation already exists"
**Solution**: Tables already created. Safe to skip.

### Issue: "auth.uid() does not exist"
**Solution**: RLS policies work when users are authenticated. Test with actual user login.

### Issue: No categories showing
**Solution**: Run `002_load_popular_categories.sql` again

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ All 4 tables created successfully
- ✅ 50 categories loaded
- ✅ RLS enabled on all tables
- ✅ Triggers are active
- ✅ Views are accessible
- ✅ No error messages

---

**Ready to build!** 🚀

Next: Open `types/goal-extended.ts` and `services/goalsService.ts`

