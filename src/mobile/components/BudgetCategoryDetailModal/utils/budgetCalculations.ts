import { BudgetSubcategory } from "../types";

/**
 * Calculate total spent amount across all subcategories
 */
export const calculateTotalSpent = (
  subcategories: BudgetSubcategory[]
): number => {
  return subcategories.reduce((sum, sub) => sum + sub.spent, 0);
};

/**
 * Calculate total budget across all subcategories
 */
export const calculateTotalBudget = (
  subcategories: BudgetSubcategory[]
): number => {
  return subcategories.reduce((sum, sub) => sum + sub.budget_limit, 0);
};

/**
 * Calculate percentage spent vs budget
 */
export const calculatePercentage = (spent: number, budget: number): number => {
  return budget > 0 ? (spent / budget) * 100 : 0;
};

/**
 * Calculate remaining budget amount
 */
export const calculateRemaining = (spent: number, budget: number): number => {
  return budget - spent;
};

/**
 * Get vibrant progress colors matching Quick Actions palette
 * Uses saturated, modern colors consistent with Financial Summary Cards
 */
export const getProgressColor = (
  spent: number,
  limit: number,
  colors: { success: string; warning: string; error: string }
): string => {
  const percentage = calculatePercentage(spent, limit);

  // Simplified Quick Actions palette (3 colors as specified)
  if (percentage > 100) return "#EF4444"; // 🔴 Red - Over Budget
  if (percentage >= 70) return "#F59E0B"; // 🟡 Yellow - Warning (70-100%)
  return "#10B981"; // 🟢 Green - Safe (<70%)
};

/**
 * Format currency with proper decimals
 */
export const formatCurrency = (
  amount: number,
  decimals: number = 2
): string => {
  return `$${amount.toFixed(decimals)}`;
};

/**
 * Format percentage with rounding
 */
export const formatPercentage = (percentage: number): string => {
  return `${Math.round(percentage)}%`;
};
