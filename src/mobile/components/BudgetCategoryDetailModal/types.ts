export interface BudgetSubcategory {
  id: string;
  name: string;
  spent: number;
  budget_limit: number;
  color: string;
  icon: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  budget_limit: number;
  ring_color: string;
  bg_color: string;
  percentage?: number;
  category_type: string;
}

export type ViewMode = "grid" | "list";
export type SortMode = "name" | "amount" | "percentage" | "remaining";

export interface SortOption {
  key: SortMode;
  label: string;
  icon: string;
}

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  success: string;
  warning: string;
  error: string;
}
