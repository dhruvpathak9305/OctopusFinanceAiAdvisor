-- =====================================================================
-- TRIGGERS - UTILITY TRIGGERS
-- =====================================================================
-- General utility triggers for automatic field updates and maintenance
-- =====================================================================

-- =====================================================================
-- UPDATE_UPDATED_AT_COLUMN (Trigger Function)
-- =====================================================================
-- Purpose: Automatically update updated_at timestamp on record changes
-- Triggers: Multiple triggers on various tables
-- Event: BEFORE UPDATE on multiple tables
-- =====================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Create triggers for net worth tables
CREATE TRIGGER update_net_worth_categories_updated_at
  BEFORE UPDATE ON net_worth_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_net_worth_categories_real_updated_at
  BEFORE UPDATE ON net_worth_categories_real
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_net_worth_entries_updated_at
  BEFORE UPDATE ON net_worth_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_net_worth_entries_real_updated_at
  BEFORE UPDATE ON net_worth_entries_real
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_net_worth_subcategories_updated_at
  BEFORE UPDATE ON net_worth_subcategories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_net_worth_subcategories_real_updated_at
  BEFORE UPDATE ON net_worth_subcategories_real
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- UPDATE_SUBCATEGORY_BUDGET_LIMITS (Trigger Function)
-- =====================================================================
-- Purpose: Update subcategory budget limits when parent category changes
-- Trigger: update_subcategory_budgets
-- Event: AFTER UPDATE on budget_categories_real
-- =====================================================================

CREATE OR REPLACE FUNCTION update_subcategory_budget_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update all subcategories related to the category
  -- using NEW.percentage from the parent category
  UPDATE public.budget_subcategories
  SET budget_limit = (NEW.percentage / 100.0) * 100000
  WHERE category_id = NEW.id;

  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER update_subcategory_budgets
  AFTER UPDATE ON budget_categories_real
  FOR EACH ROW
  EXECUTE FUNCTION update_subcategory_budget_limits();

-- =====================================================================
-- UPDATE_BUDGET_CATEGORIES_FROM_PERIOD (Trigger Function)
-- =====================================================================
-- Purpose: Update budget categories when budget period changes
-- Trigger: update_budget_categories_from_period_trigger
-- Event: AFTER UPDATE on budget_periods
-- =====================================================================

CREATE OR REPLACE FUNCTION update_budget_categories_from_period()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update related budget categories when budget period is updated
    UPDATE public.budget_categories
    SET 
        budget_limit = (NEW.total_budget * percentage / 100),
        updated_at = NOW()
    WHERE budget_period_id = NEW.id;
    
    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER update_budget_categories_from_period_trigger
  AFTER UPDATE ON budget_periods
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_categories_from_period();

-- =====================================================================
-- TRIGGER SUMMARY
-- =====================================================================

/*
Active Utility Triggers in Database:

1. UPDATED_AT TRIGGERS (6 triggers):
   - update_net_worth_categories_updated_at
   - update_net_worth_categories_real_updated_at
   - update_net_worth_entries_updated_at
   - update_net_worth_entries_real_updated_at
   - update_net_worth_subcategories_updated_at
   - update_net_worth_subcategories_real_updated_at

2. BUDGET MANAGEMENT TRIGGERS (2 triggers):
   - update_subcategory_budgets
   - update_budget_categories_from_period_trigger

Purpose: These triggers ensure data consistency and automatic field updates
without requiring manual intervention in application code.
*/

-- =====================================================================
-- USAGE EXAMPLES
-- =====================================================================

/*
-- Example: Update net worth category (triggers updated_at update)
UPDATE net_worth_categories_real 
SET name = 'Updated Category Name'
WHERE id = 'category-uuid';
-- → Automatically sets updated_at = NOW()

-- Example: Update budget category percentage (triggers subcategory updates)
UPDATE budget_categories_real 
SET percentage = 25.0
WHERE id = 'category-uuid';
-- → Automatically updates all related subcategory budget limits

-- Example: Update budget period total (triggers category updates)
UPDATE budget_periods 
SET total_budget = 5000.00
WHERE id = 'period-uuid';
-- → Automatically recalculates all category budget limits

-- Check all utility triggers:
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE action_statement LIKE '%update_updated_at_column%'
   OR action_statement LIKE '%update_subcategory_budget_limits%'
   OR action_statement LIKE '%update_budget_categories_from_period%'
ORDER BY event_object_table, trigger_name;
*/
