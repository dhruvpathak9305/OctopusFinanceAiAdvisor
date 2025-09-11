export interface BudgetSubcategory {
  id: string;
  category_id: string;
  name: string;
  amount: number; // Main budget amount
  color: string;
  icon: string;
  created_at?: string;
  updated_at?: string;
  display_order?: number;
  is_active?: boolean;
  description?: string;
  current_spend?: number; // Current spending
  budget_limit?: number; // Warning/alert limit
  transaction_category_id?: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  budget_limit: number;
  ring_color: string;
  bg_color: string;
  percentage?: number;
  category_type: string;
  icon?: string;
  subcategories?: any[]; // Real subcategories from the database
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
