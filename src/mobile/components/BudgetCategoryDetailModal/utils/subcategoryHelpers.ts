import { BudgetSubcategory, SortMode } from "../types";

/**
 * Available icons for subcategories
 */
export const AVAILABLE_ICONS = [
  "💰",
  "🛒",
  "🍽️",
  "🚗",
  "🏠",
  "💊",
  "🎓",
  "✈️",
  "🎬",
  "👕",
  "🧮",
  "⚡",
  "🎯",
  "💳",
  "🎵",
  "🏆",
  "🏥",
  "🚌",
  "🎮",
  "📚",
  "☕",
  "💡",
  "🎨",
  "🏃",
];

/**
 * Available colors for subcategories
 */
export const AVAILABLE_COLORS = [
  "#10B981", // Green
  "#3B82F6", // Blue
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
  "#6366F1", // Indigo
  "#14B8A6", // Teal
  "#A855F7", // Violet
];

/**
 * Sort options configuration
 */
export const SORT_OPTIONS = [
  { key: "name" as SortMode, label: "Name", icon: "text" },
  { key: "amount" as SortMode, label: "Amount", icon: "cash" },
  { key: "percentage" as SortMode, label: "Percentage", icon: "pie-chart" },
  { key: "remaining" as SortMode, label: "Remaining", icon: "trending-up" },
];

/**
 * Sort subcategories based on selected mode
 */
export const sortSubcategories = (
  subcategories: BudgetSubcategory[],
  sortMode: SortMode
): BudgetSubcategory[] => {
  return [...subcategories].sort((a, b) => {
    switch (sortMode) {
      case "name":
        return a.name.localeCompare(b.name);

      case "amount":
        return b.spent - a.spent;

      case "percentage":
        const percentA =
          a.budget_limit > 0 ? (a.spent / a.budget_limit) * 100 : 0;
        const percentB =
          b.budget_limit > 0 ? (b.spent / b.budget_limit) * 100 : 0;
        return percentB - percentA;

      case "remaining":
        const remainingA = a.budget_limit - a.spent;
        const remainingB = b.budget_limit - b.spent;
        return remainingA - remainingB;

      default:
        return 0;
    }
  });
};

/**
 * Create a new subcategory with default values
 */
export const createNewSubcategory = (
  name: string,
  budgetLimit: number,
  spent: number = 0,
  icon: string = AVAILABLE_ICONS[0],
  color: string = AVAILABLE_COLORS[0]
): Omit<BudgetSubcategory, "id"> => ({
  name: name.trim(),
  budget_limit: budgetLimit,
  spent,
  icon,
  color,
});

/**
 * Update existing subcategory
 */
export const updateSubcategory = (
  subcategory: BudgetSubcategory,
  updates: Partial<Omit<BudgetSubcategory, "id">>
): BudgetSubcategory => ({
  ...subcategory,
  ...updates,
  name: updates.name ? updates.name.trim() : subcategory.name,
});

/**
 * Generate unique ID for new subcategory
 */
export const generateSubcategoryId = (): string => {
  return `subcategory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if subcategory is over budget
 */
export const isOverBudget = (subcategory: BudgetSubcategory): boolean => {
  return subcategory.spent > subcategory.budget_limit;
};

/**
 * Get subcategory status
 */
export const getSubcategoryStatus = (
  subcategory: BudgetSubcategory
): "safe" | "warning" | "danger" | "over" => {
  const percentage =
    subcategory.budget_limit > 0
      ? (subcategory.spent / subcategory.budget_limit) * 100
      : 0;

  if (percentage > 100) return "over";
  if (percentage > 90) return "danger";
  if (percentage > 70) return "warning";
  return "safe";
};

/**
 * Mock subcategories data for development
 */
export const getMockSubcategories = (): BudgetSubcategory[] => [
  {
    id: "1",
    name: "Rent/Mortgage",
    spent: 1500.0,
    budget_limit: 1500.0,
    color: "#10B981",
    icon: "🏠",
  },
  {
    id: "2",
    name: "Utilities",
    spent: 145.75,
    budget_limit: 200.0,
    color: "#3B82F6",
    icon: "⚡",
  },
  {
    id: "3",
    name: "Groceries",
    spent: 130.5,
    budget_limit: 400.0,
    color: "#F59E0B",
    icon: "🛒",
  },
  {
    id: "4",
    name: "Transportation",
    spent: 89.25,
    budget_limit: 150.0,
    color: "#8B5CF6",
    icon: "🚗",
  },
  {
    id: "5",
    name: "Insurance",
    spent: 0,
    budget_limit: 300.0,
    color: "#EC4899",
    icon: "🛡️",
  },
  {
    id: "6",
    name: "Healthcare",
    spent: 45.0,
    budget_limit: 200.0,
    color: "#06B6D4",
    icon: "🏥",
  },
];
