/**
 * ============================================================================
 * GOALS MANAGEMENT SYSTEM - TYPESCRIPT TYPES
 * ============================================================================
 * Version: 1.0.0
 * Phase: MVP
 * Description: Complete TypeScript type definitions for Goals system
 * ============================================================================
 */

// ============================================================================
// ENUMS & LITERALS
// ============================================================================

export type GoalTimeframe = 'short' | 'medium' | 'long';
export type GoalPriority = 'low' | 'medium' | 'high' | 'critical';
export type GoalType = 'savings' | 'debt_payoff' | 'investment' | 'purchase' | 'experience';
export type GoalStatus = 'active' | 'paused' | 'completed' | 'abandoned';
export type ContributionType = 
  | 'manual' 
  | 'automatic' 
  | 'windfall' 
  | 'budget_surplus' 
  | 'investment_gain' 
  | 'refund' 
  | 'bonus';
export type MilestoneType = 'percentage' | 'amount' | 'time' | 'custom';
export type AutoFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';
export type PaceStatus = 'ahead' | 'on_track' | 'behind';

// ============================================================================
// DATABASE MODELS
// ============================================================================

/**
 * Goal Category
 * Pre-defined or custom categories for organizing goals
 */
export interface GoalCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  parent_category_id?: string;
  timeframe_default?: GoalTimeframe;
  priority_default?: GoalPriority;
  goal_type_default?: GoalType;
  suggested_amount_min?: number;
  suggested_amount_max?: number;
  common_duration_days?: number;
  usage_count: number;
  is_featured: boolean;
  is_active: boolean;
  display_order?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Goal (Main Model)
 * Core goal entity with all tracking information
 */
export interface Goal {
  id: string;
  user_id: string;
  
  // Basic Information
  name: string;
  description?: string;
  emoji?: string;
  cover_image_url?: string;
  
  // Classification
  category_id?: string;
  timeframe: GoalTimeframe;
  priority: GoalPriority;
  goal_type: GoalType;
  
  // Financial Details
  target_amount: number;
  current_amount: number;
  initial_amount: number;
  
  // Timeline
  start_date: string;
  target_date: string;
  expected_completion?: string;
  actual_completion?: string;
  
  // Contribution Strategy
  monthly_target?: number;
  recommended_monthly?: number;
  actual_monthly_avg?: number;
  
  // Progress (Generated)
  progress_percentage: number;
  
  // Status
  status: GoalStatus;
  health_score: number;
  
  // Linked Resources
  linked_account_id?: string;
  linked_budget_id?: string;
  
  // Automation
  auto_contribute: boolean;
  auto_amount?: number;
  auto_frequency?: AutoFrequency;
  
  // Metadata
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  archived_at?: string;
}

/**
 * Goal Contribution
 * Tracks all contributions made to a goal
 */
export interface GoalContribution {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  contribution_type: ContributionType;
  contribution_source?: string;
  linked_transaction_id?: string;
  linked_account_id?: string;
  goal_progress_before?: number;
  goal_progress_after?: number;
  contribution_date: string;
  notes?: string;
  tags?: string[];
  created_at: string;
}

/**
 * Goal Milestone
 * Achievement milestones for gamification
 */
export interface GoalMilestone {
  id: string;
  goal_id: string;
  user_id: string;
  name: string;
  description?: string;
  milestone_type: MilestoneType;
  trigger_percentage?: number;
  trigger_amount?: number;
  trigger_date?: string;
  is_achieved: boolean;
  achieved_at?: string;
  achievement_message?: string;
  reward_type?: string;
  reward_value?: number;
  celebration_shown: boolean;
  display_order?: number;
  icon?: string;
  color?: string;
  created_at: string;
}

// ============================================================================
// ANALYTICS & COMPUTED TYPES
// ============================================================================

/**
 * Goal Progress Analysis
 * Real-time progress metrics with pace analysis
 */
export interface GoalProgress {
  currentAmount: number;
  targetAmount: number;
  progressPercentage: number;
  amountRemaining: number;
  daysElapsed: number;
  daysRemaining: number;
  daysTotal: number;
  timeProgress: number; // % of time elapsed
  paceStatus: PaceStatus;
  paceDeviation: number; // % ahead or behind
}

/**
 * Goal Summary with Extended Data
 * Includes category info and contribution stats
 */
export interface GoalSummary extends Goal {
  category_name?: string;
  category_icon?: string;
  amount_remaining: number;
  days_remaining: number;
  days_elapsed: number;
  days_total: number;
  milestones_achieved: number;
  milestones_total: number;
  total_contributions: number;
  total_contributed: number;
  progress: GoalProgress;
}

/**
 * Goals Overview Statistics
 * Aggregate statistics for all goals
 */
export interface GoalsOverview {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  pausedGoals: number;
  totalTargetAmount: number;
  totalCurrentAmount: number;
  totalRemaining: number;
  overallProgress: number;
  averageHealthScore: number;
  onTrackCount: number;
  behindCount: number;
  aheadCount: number;
  thisMonthContributions: number;
  projectedMonthlyNeeded: number;
  upcomingMilestones: GoalMilestone[];
}

/**
 * Contribution History Item
 * Extended contribution info with goal context
 */
export interface ContributionHistoryItem extends GoalContribution {
  goal_name: string;
  goal_emoji?: string;
  progress_change: number; // Difference between before and after
}

/**
 * Milestone Achievement Notification
 * Data for displaying milestone celebrations
 */
export interface MilestoneAchievement {
  milestone: GoalMilestone;
  goal: Goal;
  celebration_type: 'confetti' | 'fireworks' | 'starburst' | 'epic';
  message: string;
  next_milestone?: GoalMilestone;
}

// ============================================================================
// INPUT/FORM TYPES
// ============================================================================

/**
 * Create Goal Input
 * Required fields for creating a new goal
 */
export interface CreateGoalInput {
  name: string;
  description?: string;
  emoji?: string;
  category_id?: string;
  timeframe: GoalTimeframe;
  priority: GoalPriority;
  goal_type: GoalType;
  target_amount: number;
  current_amount?: number;
  start_date?: string;
  target_date: string;
  monthly_target?: number;
  notes?: string;
  tags?: string[];
  auto_contribute?: boolean;
  auto_amount?: number;
  auto_frequency?: AutoFrequency;
}

/**
 * Update Goal Input
 * Partial update for existing goal
 */
export interface UpdateGoalInput {
  name?: string;
  description?: string;
  emoji?: string;
  category_id?: string;
  timeframe?: GoalTimeframe;
  priority?: GoalPriority;
  target_amount?: number;
  target_date?: string;
  monthly_target?: number;
  status?: GoalStatus;
  notes?: string;
  tags?: string[];
  auto_contribute?: boolean;
  auto_amount?: number;
  auto_frequency?: AutoFrequency;
}

/**
 * Add Contribution Input
 * Required fields for adding a contribution
 */
export interface AddContributionInput {
  goal_id: string;
  amount: number;
  contribution_type?: ContributionType;
  contribution_source?: string;
  linked_account_id?: string;
  contribution_date?: string;
  notes?: string;
  tags?: string[];
}

// ============================================================================
// FILTER & QUERY TYPES
// ============================================================================

/**
 * Goals Filter Options
 * For filtering and sorting goal lists
 */
export interface GoalsFilterOptions {
  status?: GoalStatus[];
  timeframe?: GoalTimeframe[];
  priority?: GoalPriority[];
  category_id?: string[];
  search?: string;
  includeArchived?: boolean;
  sortBy?: 'created_at' | 'target_date' | 'priority' | 'progress' | 'name';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Category Filter Options
 * For browsing and searching categories
 */
export interface CategoryFilterOptions {
  parent_category_id?: string;
  is_featured?: boolean;
  is_active?: boolean;
  timeframe?: GoalTimeframe;
  search?: string;
  limit?: number;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

/**
 * Goal Card Display Props
 * Data needed for rendering a goal card
 */
export interface GoalCardData {
  goal: Goal;
  progress: GoalProgress;
  category?: GoalCategory;
  nextMilestone?: GoalMilestone;
  recentContributions?: GoalContribution[];
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  showInsights?: boolean;
}

/**
 * Goal Creation State
 * Wizard state for multi-step goal creation
 */
export interface GoalCreationState {
  step: 1 | 2 | 3 | 4;
  categorySelected?: GoalCategory;
  formData: Partial<CreateGoalInput>;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

/**
 * Contribution Modal State
 * State for contribution modal
 */
export interface ContributionModalState {
  isOpen: boolean;
  goal?: Goal;
  amount: string;
  source?: string;
  notes?: string;
  isSubmitting: boolean;
  error?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * API Success Response
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string>;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Date Range
 */
export interface DateRange {
  start: string;
  end: string;
}

/**
 * Amount Range
 */
export interface AmountRange {
  min: number;
  max: number;
}

/**
 * Color Scheme for Goal Status
 */
export const GOAL_STATUS_COLORS = {
  active: '#10B981',    // Green
  paused: '#F59E0B',    // Amber
  completed: '#3B82F6', // Blue
  abandoned: '#6B7280', // Gray
} as const;

/**
 * Color Scheme for Priority
 */
export const GOAL_PRIORITY_COLORS = {
  low: '#64748b',       // Slate
  medium: '#f59e0b',    // Amber
  high: '#ef4444',      // Red
  critical: '#dc2626',  // Dark Red
} as const;

/**
 * Color Scheme for Timeframe
 */
export const GOAL_TIMEFRAME_COLORS = {
  short: '#0F766E',     // Teal
  medium: '#F59E0B',    // Amber
  long: '#10B981',      // Green
} as const;

/**
 * Health Score Thresholds
 */
export const HEALTH_SCORE_THRESHOLDS = {
  excellent: 80,
  good: 60,
  fair: 40,
  poor: 0,
} as const;

// ============================================================================
// CONSTANTS
// ============================================================================

export const DEFAULT_MILESTONES = [
  { percentage: 25, name: 'Great Start!', icon: '🎉', color: '#3B82F6' },
  { percentage: 50, name: 'Halfway There!', icon: '🚀', color: '#8B5CF6' },
  { percentage: 75, name: 'Almost There!', icon: '⭐', color: '#F59E0B' },
  { percentage: 100, name: 'Goal Achieved!', icon: '🏆', color: '#10B981' },
] as const;

export const TIMEFRAME_DEFINITIONS = {
  short: { label: 'Short-term', maxDays: 365, description: '< 1 year' },
  medium: { label: 'Medium-term', maxDays: 1825, description: '1-5 years' },
  long: { label: 'Long-term', maxDays: Infinity, description: '5+ years' },
} as const;

export const AUTO_FREQUENCIES = {
  daily: { label: 'Daily', days: 1 },
  weekly: { label: 'Weekly', days: 7 },
  biweekly: { label: 'Bi-weekly', days: 14 },
  monthly: { label: 'Monthly', days: 30 },
} as const;

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isGoal(obj: any): obj is Goal {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.target_amount === 'number'
  );
}

export function isGoalContribution(obj: any): obj is GoalContribution {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.goal_id === 'string' &&
    typeof obj.amount === 'number'
  );
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export type {
  Goal,
  GoalCategory,
  GoalContribution,
  GoalMilestone,
  GoalProgress,
  GoalSummary,
  GoalsOverview,
  ContributionHistoryItem,
  MilestoneAchievement,
  CreateGoalInput,
  UpdateGoalInput,
  AddContributionInput,
  GoalsFilterOptions,
  CategoryFilterOptions,
  GoalCardData,
  GoalCreationState,
  ContributionModalState,
  ApiResponse,
  ApiErrorResponse,
  PaginatedResponse,
  DateRange,
  AmountRange,
};

