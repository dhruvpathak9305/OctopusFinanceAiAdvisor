/**
 * ============================================================================
 * GOALS SERVICE
 * ============================================================================
 * Version: 1.0.0
 * Phase: MVP
 * Description: Core service for Goals Management System
 * Handles: CRUD operations, contributions, milestones, analytics
 * ============================================================================
 */

import { supabase } from '../lib/supabase/client';
import type {
  Goal,
  GoalCategory,
  GoalContribution,
  GoalMilestone,
  GoalProgress,
  GoalSummary,
  GoalsOverview,
  CreateGoalInput,
  UpdateGoalInput,
  AddContributionInput,
  GoalsFilterOptions,
  CategoryFilterOptions,
  PaceStatus,
} from '../types/goal-extended';

export class GoalsService {
  // ============================================================================
  // GOAL CRUD OPERATIONS
  // ============================================================================

  /**
   * Fetch all goals for current user with optional filtering
   */
  static async fetchGoals(filters?: GoalsFilterOptions): Promise<GoalSummary[]> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    let query = supabase
      .from('goal_summary')
      .select('*')
      .eq('user_id', user.id);

    // Apply filters
    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters?.timeframe && filters.timeframe.length > 0) {
      query = query.in('timeframe', filters.timeframe);
    }

    if (filters?.priority && filters.priority.length > 0) {
      query = query.in('priority', filters.priority);
    }

    if (filters?.category_id && filters.category_id.length > 0) {
      query = query.in('category_id', filters.category_id);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (!filters?.includeArchived) {
      query = query.is('archived_at', null);
    }

    // Sorting
    const sortBy = filters?.sortBy || 'created_at';
    const sortOrder = filters?.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Calculate progress for each goal
    return (data || []).map(goal => ({
      ...goal,
      progress: this.calculateProgress(goal),
    }));
  }

  /**
   * Fetch single goal by ID
   */
  static async fetchGoalById(goalId: string): Promise<GoalSummary> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('goal_summary')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Goal not found');

    return {
      ...data,
      progress: this.calculateProgress(data),
    };
  }

  /**
   * Create new goal
   */
  static async createGoal(input: CreateGoalInput): Promise<Goal> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    // Prepare goal data
    const newGoal = {
      user_id: user.id,
      name: input.name,
      description: input.description,
      emoji: input.emoji,
      category_id: input.category_id,
      timeframe: input.timeframe,
      priority: input.priority,
      goal_type: input.goal_type,
      target_amount: input.target_amount,
      current_amount: input.current_amount || 0,
      initial_amount: input.current_amount || 0,
      start_date: input.start_date || new Date().toISOString().split('T')[0],
      target_date: input.target_date,
      monthly_target: input.monthly_target,
      notes: input.notes,
      tags: input.tags,
      auto_contribute: input.auto_contribute || false,
      auto_amount: input.auto_amount,
      auto_frequency: input.auto_frequency,
      status: 'active',
      health_score: 50,
    };

    const { data, error } = await supabase
      .from('goals')
      .insert(newGoal)
      .select()
      .single();

    if (error) throw error;

    // Create default milestones
    await this.createDefaultMilestones(data.id, user.id);

    // Update category usage count
    if (input.category_id) {
      await this.incrementCategoryUsage(input.category_id);
    }

    return data;
  }

  /**
   * Update existing goal
   */
  static async updateGoal(goalId: string, updates: UpdateGoalInput): Promise<Goal> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('goals')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Goal not found');

    return data;
  }

  /**
   * Delete goal (soft delete - archive)
   */
  static async deleteGoal(goalId: string): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('goals')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', goalId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  /**
   * Permanently delete goal
   */
  static async permanentlyDeleteGoal(goalId: string): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // ============================================================================
  // CONTRIBUTIONS
  // ============================================================================

  /**
   * Add contribution to goal
   */
  static async addContribution(input: AddContributionInput): Promise<GoalContribution> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    // Get current goal to calculate progress
    const goal = await this.fetchGoalById(input.goal_id);
    const progressBefore = goal.progress_percentage;

    const newContribution = {
      goal_id: input.goal_id,
      user_id: user.id,
      amount: input.amount,
      contribution_type: input.contribution_type || 'manual',
      contribution_source: input.contribution_source,
      linked_account_id: input.linked_account_id,
      contribution_date: input.contribution_date || new Date().toISOString().split('T')[0],
      notes: input.notes,
      tags: input.tags,
      goal_progress_before: progressBefore,
    };

    const { data, error } = await supabase
      .from('goal_contributions')
      .insert(newContribution)
      .select()
      .single();

    if (error) throw error;

    // Trigger will update goal, but we'll update progress_after manually
    const updatedGoal = await this.fetchGoalById(input.goal_id);
    await supabase
      .from('goal_contributions')
      .update({ goal_progress_after: updatedGoal.progress_percentage })
      .eq('id', data.id);

    return data;
  }

  /**
   * Fetch contributions for a goal
   */
  static async fetchContributions(
    goalId: string, 
    options?: { limit?: number; offset?: number }
  ): Promise<GoalContribution[]> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    let query = supabase
      .from('goal_contributions')
      .select('*')
      .eq('goal_id', goalId)
      .eq('user_id', user.id)
      .order('contribution_date', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  /**
   * Delete contribution
   */
  static async deleteContribution(contributionId: string): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    // Get contribution to reverse the amount
    const { data: contribution, error: fetchError } = await supabase
      .from('goal_contributions')
      .select('*')
      .eq('id', contributionId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) throw fetchError;
    if (!contribution) throw new Error('Contribution not found');

    // Delete contribution
    const { error } = await supabase
      .from('goal_contributions')
      .delete()
      .eq('id', contributionId)
      .eq('user_id', user.id);

    if (error) throw error;

    // Manually update goal amount (since trigger only handles INSERT)
    await supabase
      .from('goals')
      .update({
        current_amount: supabase.rpc('subtract_amount', {
          goal_id: contribution.goal_id,
          amount: contribution.amount,
        }),
      })
      .eq('id', contribution.goal_id);
  }

  // ============================================================================
  // MILESTONES
  // ============================================================================

  /**
   * Fetch milestones for a goal
   */
  static async fetchMilestones(goalId: string): Promise<GoalMilestone[]> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('goal_milestones')
      .select('*')
      .eq('goal_id', goalId)
      .eq('user_id', user.id)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Create default milestones for a goal
   */
  static async createDefaultMilestones(goalId: string, userId: string): Promise<void> {
    const defaultMilestones = [
      { percentage: 25, name: 'Great Start!', icon: '🎉', color: '#3B82F6' },
      { percentage: 50, name: 'Halfway There!', icon: '🚀', color: '#8B5CF6' },
      { percentage: 75, name: 'Almost There!', icon: '⭐', color: '#F59E0B' },
      { percentage: 100, name: 'Goal Achieved!', icon: '🏆', color: '#10B981' },
    ];

    const milestones = defaultMilestones.map((m, index) => ({
      goal_id: goalId,
      user_id: userId,
      name: m.name,
      milestone_type: 'percentage' as const,
      trigger_percentage: m.percentage,
      icon: m.icon,
      color: m.color,
      display_order: index + 1,
      is_achieved: false,
      celebration_shown: false,
    }));

    const { error } = await supabase
      .from('goal_milestones')
      .insert(milestones);

    if (error) throw error;
  }

  // ============================================================================
  // CATEGORIES
  // ============================================================================

  /**
   * Fetch all categories
   */
  static async fetchCategories(filters?: CategoryFilterOptions): Promise<GoalCategory[]> {
    let query = supabase
      .from('goal_categories')
      .select('*')
      .eq('is_active', filters?.is_active ?? true);

    if (filters?.parent_category_id !== undefined) {
      if (filters.parent_category_id === null) {
        query = query.is('parent_category_id', null);
      } else {
        query = query.eq('parent_category_id', filters.parent_category_id);
      }
    }

    if (filters?.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured);
    }

    if (filters?.timeframe) {
      query = query.eq('timeframe_default', filters.timeframe);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    query = query.order('display_order', { ascending: true });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  /**
   * Increment category usage count
   */
  private static async incrementCategoryUsage(categoryId: string): Promise<void> {
    await supabase.rpc('increment_category_usage', { category_id: categoryId });
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  /**
   * Calculate detailed progress metrics for a goal
   */
  static calculateProgress(goal: Goal): GoalProgress {
    const currentAmount = goal.current_amount;
    const targetAmount = goal.target_amount;
    const progressPercentage = Math.min(100, (currentAmount / targetAmount) * 100);
    const amountRemaining = Math.max(0, targetAmount - currentAmount);

    const startDate = new Date(goal.start_date);
    const targetDate = new Date(goal.target_date);
    const today = new Date();

    const daysTotal = Math.max(1, Math.floor((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const daysElapsed = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    const timeProgress = Math.min(100, (daysElapsed / daysTotal) * 100);
    const paceDeviation = progressPercentage - timeProgress;

    let paceStatus: PaceStatus;
    if (progressPercentage >= 100) {
      paceStatus = 'ahead'; // Completed
    } else if (paceDeviation > 10) {
      paceStatus = 'ahead';
    } else if (paceDeviation < -10) {
      paceStatus = 'behind';
    } else {
      paceStatus = 'on_track';
    }

    return {
      currentAmount,
      targetAmount,
      progressPercentage,
      amountRemaining,
      daysElapsed,
      daysRemaining,
      daysTotal,
      timeProgress,
      paceStatus,
      paceDeviation,
    };
  }

  /**
   * Get overview statistics for all goals
   */
  static async getGoalsOverview(): Promise<GoalsOverview> {
    const goals = await this.fetchGoals({ includeArchived: false });

    const overview: GoalsOverview = {
      totalGoals: goals.length,
      activeGoals: goals.filter(g => g.status === 'active').length,
      completedGoals: goals.filter(g => g.status === 'completed').length,
      pausedGoals: goals.filter(g => g.status === 'paused').length,
      totalTargetAmount: goals.reduce((sum, g) => sum + g.target_amount, 0),
      totalCurrentAmount: goals.reduce((sum, g) => sum + g.current_amount, 0),
      totalRemaining: goals.reduce((sum, g) => sum + (g.target_amount - g.current_amount), 0),
      overallProgress: 0,
      averageHealthScore: 0,
      onTrackCount: 0,
      behindCount: 0,
      aheadCount: 0,
      thisMonthContributions: 0,
      projectedMonthlyNeeded: 0,
      upcomingMilestones: [],
    };

    // Calculate averages
    if (goals.length > 0) {
      overview.overallProgress = (overview.totalCurrentAmount / overview.totalTargetAmount) * 100;
      overview.averageHealthScore = goals.reduce((sum, g) => sum + g.health_score, 0) / goals.length;

      // Count pace statuses
      goals.forEach(goal => {
        const progress = this.calculateProgress(goal);
        if (progress.paceStatus === 'ahead') overview.aheadCount++;
        else if (progress.paceStatus === 'behind') overview.behindCount++;
        else overview.onTrackCount++;
      });
    }

    // Get upcoming milestones (next 3)
    const allMilestones = await Promise.all(
      goals.map(async g => {
        const milestones = await this.fetchMilestones(g.id);
        return milestones.filter(m => !m.is_achieved).slice(0, 1);
      })
    );
    overview.upcomingMilestones = allMilestones.flat().slice(0, 3);

    return overview;
  }
}

export default GoalsService;

