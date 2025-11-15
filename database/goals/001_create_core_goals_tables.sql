-- ============================================================================
-- GOALS MANAGEMENT SYSTEM - CORE TABLES MIGRATION
-- ============================================================================
-- Version: 1.0.0
-- Phase: MVP (Weeks 1-2)
-- Description: Core tables for Goals Management System
-- Tables: goals, goal_contributions, goal_milestones, goal_categories
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE 1: goal_categories
-- ============================================================================
-- Pre-defined and custom goal categories
-- Includes 395+ pre-loaded categories covering all life goals
-- ============================================================================

CREATE TABLE IF NOT EXISTS goal_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(10), -- Emoji icon
  parent_category_id UUID REFERENCES goal_categories(id) ON DELETE SET NULL,
  
  -- Default settings for this category
  timeframe_default VARCHAR(20) CHECK (timeframe_default IN ('short', 'medium', 'long')),
  priority_default VARCHAR(20) CHECK (priority_default IN ('low', 'medium', 'high', 'critical')),
  goal_type_default VARCHAR(50) CHECK (goal_type_default IN ('savings', 'debt_payoff', 'investment', 'purchase', 'experience')),
  
  -- Suggested amounts (for guidance)
  suggested_amount_min DECIMAL(15, 2),
  suggested_amount_max DECIMAL(15, 2),
  common_duration_days INTEGER,
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for categories
CREATE INDEX idx_goal_categories_parent ON goal_categories(parent_category_id);
CREATE INDEX idx_goal_categories_featured ON goal_categories(is_featured) WHERE is_active = true;
CREATE INDEX idx_goal_categories_active ON goal_categories(is_active);
CREATE INDEX idx_goal_categories_order ON goal_categories(display_order);

-- ============================================================================
-- TABLE 2: goals (Main Table)
-- ============================================================================
-- Core goals table with all essential fields for MVP
-- ============================================================================

CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  emoji VARCHAR(10),
  cover_image_url TEXT,
  
  -- Goal Classification
  category_id UUID REFERENCES goal_categories(id) ON DELETE SET NULL,
  timeframe VARCHAR(20) NOT NULL CHECK (timeframe IN ('short', 'medium', 'long')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  goal_type VARCHAR(50) NOT NULL DEFAULT 'savings' CHECK (goal_type IN ('savings', 'debt_payoff', 'investment', 'purchase', 'experience')),
  
  -- Financial Details
  target_amount DECIMAL(15, 2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(15, 2) DEFAULT 0 CHECK (current_amount >= 0),
  initial_amount DECIMAL(15, 2) DEFAULT 0 CHECK (initial_amount >= 0),
  
  -- Timeline
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_date DATE NOT NULL,
  expected_completion DATE, -- AI-predicted completion date
  actual_completion DATE,
  
  -- Contribution Strategy
  monthly_target DECIMAL(15, 2),
  recommended_monthly DECIMAL(15, 2), -- AI recommendation
  actual_monthly_avg DECIMAL(15, 2), -- Calculated from contributions
  
  -- Progress Tracking (Generated Column)
  progress_percentage DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE 
      WHEN target_amount > 0 THEN LEAST(100, (current_amount / target_amount * 100))
      ELSE 0 
    END
  ) STORED,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  health_score INTEGER DEFAULT 50 CHECK (health_score BETWEEN 0 AND 100),
  
  -- Linked Resources (for future integration)
  linked_account_id UUID, -- Link to accounts table
  linked_budget_id UUID,  -- Link to budgets table
  
  -- Automation (Basic for MVP)
  auto_contribute BOOLEAN DEFAULT false,
  auto_amount DECIMAL(15, 2),
  auto_frequency VARCHAR(20), -- 'daily', 'weekly', 'biweekly', 'monthly'
  
  -- Metadata
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  archived_at TIMESTAMP,
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (target_date >= start_date),
  CONSTRAINT positive_amounts CHECK (target_amount > 0 AND current_amount >= 0)
);

-- Indexes for goals
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_target_date ON goals(target_date);
CREATE INDEX idx_goals_category ON goals(category_id);
CREATE INDEX idx_goals_timeframe ON goals(timeframe);
CREATE INDEX idx_goals_priority ON goals(priority);
CREATE INDEX idx_goals_archived ON goals(archived_at) WHERE archived_at IS NULL;
CREATE INDEX idx_goals_user_active ON goals(user_id, status) WHERE archived_at IS NULL;

-- ============================================================================
-- TABLE 3: goal_contributions
-- ============================================================================
-- Track all contributions to goals (manual and automatic)
-- ============================================================================

CREATE TABLE IF NOT EXISTS goal_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contribution Details
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  contribution_type VARCHAR(50) DEFAULT 'manual' CHECK (contribution_type IN ('manual', 'automatic', 'windfall', 'budget_surplus', 'investment_gain', 'refund', 'bonus')),
  contribution_source VARCHAR(100), -- 'account_transfer', 'cash', 'investment_sale', etc.
  
  -- Linked Resources
  linked_transaction_id UUID, -- Link to transactions table
  linked_account_id UUID,     -- Link to accounts table
  
  -- Progress Tracking
  goal_progress_before DECIMAL(5, 2), -- Progress % before this contribution
  goal_progress_after DECIMAL(5, 2),  -- Progress % after this contribution
  
  -- Metadata
  contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT positive_contribution CHECK (amount > 0)
);

-- Indexes for contributions
CREATE INDEX idx_contributions_goal ON goal_contributions(goal_id, contribution_date DESC);
CREATE INDEX idx_contributions_user ON goal_contributions(user_id);
CREATE INDEX idx_contributions_date ON goal_contributions(contribution_date DESC);
CREATE INDEX idx_contributions_type ON goal_contributions(contribution_type);

-- ============================================================================
-- TABLE 4: goal_milestones
-- ============================================================================
-- Track milestone achievements (25%, 50%, 75%, 100%, custom)
-- ============================================================================

CREATE TABLE IF NOT EXISTS goal_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Milestone Details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  milestone_type VARCHAR(20) NOT NULL DEFAULT 'percentage' CHECK (milestone_type IN ('percentage', 'amount', 'time', 'custom')),
  
  -- Trigger Conditions
  trigger_percentage DECIMAL(5, 2), -- e.g., 25, 50, 75, 100
  trigger_amount DECIMAL(15, 2),
  trigger_date DATE,
  
  -- Achievement Tracking
  is_achieved BOOLEAN DEFAULT false,
  achieved_at TIMESTAMP,
  achievement_message TEXT,
  
  -- Rewards & Celebration (for gamification)
  reward_type VARCHAR(50), -- 'badge', 'points', 'message', 'animation'
  reward_value INTEGER,
  celebration_shown BOOLEAN DEFAULT false,
  
  -- Display
  display_order INTEGER,
  icon VARCHAR(50),
  color VARCHAR(7), -- Hex color code
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for milestones
CREATE INDEX idx_milestones_goal ON goal_milestones(goal_id, display_order);
CREATE INDEX idx_milestones_achieved ON goal_milestones(is_achieved, achieved_at DESC);
CREATE INDEX idx_milestones_user ON goal_milestones(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE goal_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;

-- Categories: Public read, admin write
CREATE POLICY "Anyone can view goal categories" 
  ON goal_categories FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage categories" 
  ON goal_categories FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin');

-- Goals: Users can only see their own goals
CREATE POLICY "Users can view own goals" 
  ON goals FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals" 
  ON goals FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" 
  ON goals FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" 
  ON goals FOR DELETE 
  USING (auth.uid() = user_id);

-- Contributions: Users can only see their own contributions
CREATE POLICY "Users can view own contributions" 
  ON goal_contributions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own contributions" 
  ON goal_contributions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contributions" 
  ON goal_contributions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contributions" 
  ON goal_contributions FOR DELETE 
  USING (auth.uid() = user_id);

-- Milestones: Users can only see their own milestones
CREATE POLICY "Users can view own milestones" 
  ON goal_milestones FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own milestones" 
  ON goal_milestones FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones" 
  ON goal_milestones FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own milestones" 
  ON goal_milestones FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Update goal's current_amount when contribution is added
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the goal's current amount
  UPDATE goals
  SET 
    current_amount = current_amount + NEW.amount,
    updated_at = NOW()
  WHERE id = NEW.goal_id;
  
  -- Check if goal is now completed
  UPDATE goals
  SET 
    status = 'completed',
    actual_completion = CURRENT_DATE
  WHERE id = NEW.goal_id 
    AND current_amount >= target_amount
    AND status != 'completed';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_goal_progress
AFTER INSERT ON goal_contributions
FOR EACH ROW
EXECUTE FUNCTION update_goal_progress();

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_goals_updated_at
BEFORE UPDATE ON goals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_categories_updated_at
BEFORE UPDATE ON goal_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Check and mark milestone achievements
CREATE OR REPLACE FUNCTION check_milestone_achievements(p_goal_id UUID)
RETURNS void AS $$
DECLARE
  v_progress DECIMAL(5, 2);
  v_current_amount DECIMAL(15, 2);
BEGIN
  -- Get current goal progress
  SELECT progress_percentage, current_amount 
  INTO v_progress, v_current_amount
  FROM goals 
  WHERE id = p_goal_id;
  
  -- Mark percentage-based milestones as achieved
  UPDATE goal_milestones
  SET 
    is_achieved = true,
    achieved_at = NOW(),
    achievement_message = 'Congratulations! You reached ' || trigger_percentage || '% of your goal!'
  WHERE goal_id = p_goal_id
    AND milestone_type = 'percentage'
    AND trigger_percentage <= v_progress
    AND is_achieved = false;
  
  -- Mark amount-based milestones as achieved
  UPDATE goal_milestones
  SET 
    is_achieved = true,
    achieved_at = NOW(),
    achievement_message = 'Congratulations! You reached $' || trigger_amount || '!'
  WHERE goal_id = p_goal_id
    AND milestone_type = 'amount'
    AND trigger_amount <= v_current_amount
    AND is_achieved = false;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Check milestones after contribution
CREATE OR REPLACE FUNCTION check_milestones_trigger()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_milestone_achievements(NEW.goal_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_milestones
AFTER INSERT ON goal_contributions
FOR EACH ROW
EXECUTE FUNCTION check_milestones_trigger();

-- Function: Create default milestones for a goal
CREATE OR REPLACE FUNCTION create_default_milestones(p_goal_id UUID, p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO goal_milestones (goal_id, user_id, name, milestone_type, trigger_percentage, icon, color, display_order)
  VALUES
    (p_goal_id, p_user_id, 'Great Start!', 'percentage', 25, '🎉', '#3B82F6', 1),
    (p_goal_id, p_user_id, 'Halfway There!', 'percentage', 50, '🚀', '#8B5CF6', 2),
    (p_goal_id, p_user_id, 'Almost There!', 'percentage', 75, '⭐', '#F59E0B', 3),
    (p_goal_id, p_user_id, 'Goal Achieved!', 'percentage', 100, '🏆', '#10B981', 4);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS (Helpful for queries)
-- ============================================================================

-- View: Goal summary with additional calculated fields
CREATE OR REPLACE VIEW goal_summary AS
SELECT 
  g.*,
  g.target_amount - g.current_amount AS amount_remaining,
  (g.target_date - CURRENT_DATE) AS days_remaining,
  (CURRENT_DATE - g.start_date) AS days_elapsed,
  (g.target_date - g.start_date) AS days_total,
  gc.name AS category_name,
  gc.icon AS category_icon,
  COUNT(DISTINCT gm.id) FILTER (WHERE gm.is_achieved = true) AS milestones_achieved,
  COUNT(DISTINCT gm.id) AS milestones_total,
  COUNT(DISTINCT gc2.id) AS total_contributions,
  COALESCE(SUM(gc2.amount), 0) AS total_contributed
FROM goals g
LEFT JOIN goal_categories gc ON g.category_id = gc.id
LEFT JOIN goal_milestones gm ON g.id = gm.goal_id
LEFT JOIN goal_contributions gc2 ON g.id = gc2.goal_id
WHERE g.archived_at IS NULL
GROUP BY g.id, gc.name, gc.icon;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE goals IS 'Core goals table with financial targets and tracking';
COMMENT ON TABLE goal_contributions IS 'All contributions made toward goals';
COMMENT ON TABLE goal_milestones IS 'Milestone achievements for gamification';
COMMENT ON TABLE goal_categories IS 'Pre-defined and custom goal categories';

COMMENT ON COLUMN goals.progress_percentage IS 'Auto-calculated: (current_amount / target_amount * 100)';
COMMENT ON COLUMN goals.health_score IS 'AI-calculated health score (0-100) based on progress, time, consistency';
COMMENT ON COLUMN goals.expected_completion IS 'AI-predicted completion date based on contribution patterns';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

-- Verify tables were created
DO $$
BEGIN
  RAISE NOTICE 'Goals tables created successfully!';
  RAISE NOTICE '✅ goal_categories';
  RAISE NOTICE '✅ goals';
  RAISE NOTICE '✅ goal_contributions';
  RAISE NOTICE '✅ goal_milestones';
  RAISE NOTICE '✅ RLS policies enabled';
  RAISE NOTICE '✅ Triggers created';
  RAISE NOTICE '✅ Helper functions ready';
  RAISE NOTICE '';
  RAISE NOTICE '📌 Next Step: Load sample categories using 002_load_sample_categories.sql';
END $$;

