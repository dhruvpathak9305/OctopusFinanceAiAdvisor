/**
 * ============================================================================
 * USE GOALS HOOK
 * ============================================================================
 * Version: 1.0.0
 * Phase: MVP
 * Description: React hook for Goals Management System
 * Provides: Easy-to-use API for goals, contributions, categories
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { GoalsService } from '../services/goalsService';
import type {
  Goal,
  GoalCategory,
  GoalContribution,
  GoalMilestone,
  GoalSummary,
  GoalsOverview,
  CreateGoalInput,
  UpdateGoalInput,
  AddContributionInput,
  GoalsFilterOptions,
  CategoryFilterOptions,
} from '../types/goal-extended';

interface UseGoalsResult {
  // Data
  goals: GoalSummary[];
  overview: GoalsOverview | null;
  loading: boolean;
  error: string | null;

  // Actions
  createGoal: (input: CreateGoalInput) => Promise<Goal>;
  updateGoal: (goalId: string, updates: UpdateGoalInput) => Promise<Goal>;
  deleteGoal: (goalId: string) => Promise<void>;
  addContribution: (input: AddContributionInput) => Promise<GoalContribution>;
  refresh: () => Promise<void>;

  // Filters
  setFilters: (filters: GoalsFilterOptions) => void;
  filters: GoalsFilterOptions;
}

/**
 * Main hook for Goals Management
 */
export function useGoals(initialFilters?: GoalsFilterOptions): UseGoalsResult {
  const [goals, setGoals] = useState<GoalSummary[]>([]);
  const [overview, setOverview] = useState<GoalsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GoalsFilterOptions>(initialFilters || {});

  // Load goals
  const loadGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [goalsData, overviewData] = await Promise.all([
        GoalsService.fetchGoals(filters),
        GoalsService.getGoalsOverview(),
      ]);
      
      setGoals(goalsData);
      setOverview(overviewData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goals');
      console.error('Error loading goals:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load on mount and when filters change
  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  // Create goal
  const createGoal = useCallback(async (input: CreateGoalInput): Promise<Goal> => {
    try {
      const newGoal = await GoalsService.createGoal(input);
      await loadGoals(); // Refresh list
      return newGoal;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create goal';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadGoals]);

  // Update goal
  const updateGoal = useCallback(async (goalId: string, updates: UpdateGoalInput): Promise<Goal> => {
    try {
      const updatedGoal = await GoalsService.updateGoal(goalId, updates);
      await loadGoals(); // Refresh list
      return updatedGoal;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update goal';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadGoals]);

  // Delete goal
  const deleteGoal = useCallback(async (goalId: string): Promise<void> => {
    try {
      await GoalsService.deleteGoal(goalId);
      await loadGoals(); // Refresh list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete goal';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadGoals]);

  // Add contribution
  const addContribution = useCallback(async (input: AddContributionInput): Promise<GoalContribution> => {
    try {
      const contribution = await GoalsService.addContribution(input);
      await loadGoals(); // Refresh list to update progress
      return contribution;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add contribution';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadGoals]);

  return {
    goals,
    overview,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    refresh: loadGoals,
    setFilters,
    filters,
  };
}

/**
 * Hook for single goal details
 */
export function useGoalDetails(goalId: string) {
  const [goal, setGoal] = useState<GoalSummary | null>(null);
  const [contributions, setContributions] = useState<GoalContribution[]>([]);
  const [milestones, setMilestones] = useState<GoalMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGoalDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [goalData, contributionsData, milestonesData] = await Promise.all([
        GoalsService.fetchGoalById(goalId),
        GoalsService.fetchContributions(goalId, { limit: 10 }),
        GoalsService.fetchMilestones(goalId),
      ]);

      setGoal(goalData);
      setContributions(contributionsData);
      setMilestones(milestonesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goal details');
      console.error('Error loading goal details:', err);
    } finally {
      setLoading(false);
    }
  }, [goalId]);

  useEffect(() => {
    if (goalId) {
      loadGoalDetails();
    }
  }, [goalId, loadGoalDetails]);

  return {
    goal,
    contributions,
    milestones,
    loading,
    error,
    refresh: loadGoalDetails,
  };
}

/**
 * Hook for goal categories
 */
export function useGoalCategories(filters?: CategoryFilterOptions) {
  const [categories, setCategories] = useState<GoalCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await GoalsService.fetchCategories(filters);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    refresh: loadCategories,
  };
}

/**
 * Hook for featured/popular categories
 */
export function useFeaturedCategories() {
  return useGoalCategories({ is_featured: true, limit: 10 });
}

/**
 * Hook for goal contributions
 */
export function useGoalContributions(goalId: string, limit = 20) {
  const [contributions, setContributions] = useState<GoalContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContributions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await GoalsService.fetchContributions(goalId, { limit });
      setContributions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contributions');
      console.error('Error loading contributions:', err);
    } finally {
      setLoading(false);
    }
  }, [goalId, limit]);

  useEffect(() => {
    if (goalId) {
      loadContributions();
    }
  }, [goalId, loadContributions]);

  return {
    contributions,
    loading,
    error,
    refresh: loadContributions,
  };
}

export default useGoals;

