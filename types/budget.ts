export type BudgetPeriod = 'monthly' | 'quarterly' | 'yearly';
export type BudgetStrategy = 'zero-based' | 'ai-powered' | 'envelope' | 'rolling';
export type BudgetStatus = 'under_budget' | 'on_budget' | 'over_budget' | 'not_set';

export interface SubCategory {
  id?: string;
  name: string;
  amount: number;
  spent?: number;
  remaining?: number;
  color?: string;
  icon?: string;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetCategory {
  id?: string;
  name: string;
  percentage: number;
  limit: number;
  spent?: number;
  remaining?: number;
  bgColor: string;
  ringColor: string;
  subcategories?: SubCategory[];
  is_active?: boolean;
  status?: BudgetStatus;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  allocation: {
    [key: string]: number;
  };
  popular?: boolean;
}

export type BudgetingMethod = "traditional" | "zero-based" | "envelope" | "rolling";

export interface EnvelopeAllocation {
  categoryId: string;
  envelopes: {
    name: string;
    amount: number;
    spent: number;
    remaining: number;
  }[];
}

export interface RollingBudgetHistory {
  month: string;
  planned: number;
  actual: number;
  adjustment: number;
}

export interface BudgetSettings {
  type: BudgetPeriod;
  strategy: BudgetStrategy;
  amount: number;
  categories: BudgetCategory[];
  applyToAllMonths: boolean;
}
