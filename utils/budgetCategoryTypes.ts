import { Database } from '../types/supabase';

// Extract budget category types from Supabase schema
export type BudgetCategory = Database['public']['Tables']['budget_categories']['Row'];
export type BudgetCategoryInsert = Database['public']['Tables']['budget_categories']['Insert'];
export type BudgetCategoryUpdate = Database['public']['Tables']['budget_categories']['Update'];

// Define the category type based on the database schema
// Note: In the database, category_type is a string, so we need to define our own union for type safety
export type BudgetCategoryType = 'expense' | 'income' | 'all';

// Since the database uses string for category_type, we need to map our types to database values
export const CATEGORY_TYPE_DB_MAPPING = {
  expense: 'expense',
  income: 'income',
  all: 'all'
} as const;

// Expense categories (Needs, Wants, Save)
export const EXPENSE_CATEGORIES = [
  'Needs',
  'NEEDS', 
  'Wants',
  'WANTS',
  'Save',
  'SAVE'
];

// Income categories
export const INCOME_CATEGORIES = [
  'Earned Income',
  'EARNED INCOME',
  'Passive Income', 
  'PASSIVE INCOME',
  'Government & Benefits',
  'GOVERNMENT & BENEFITS',
  'Windfall Income',
  'WINDFALL INCOME', 
  'Side Income',
  'SIDE INCOME',
  'Reimbursement',
  'REIMBURSEMENT',
  'Reimbursements',
  'REIMBURSEMENTS'
];

/**
 * Determines if a category is an expense, income, or other type
 * This function can work with either name-based categorization (for backward compatibility)
 * or database category_type field when available
 */
export function getCategoryType(
  categoryName: string, 
  databaseCategoryType?: string | null
): BudgetCategoryType {
  // If we have database category_type, use it (preferred approach)
  if (databaseCategoryType) {
    switch (databaseCategoryType.toLowerCase()) {
      case 'income':
        return 'income';
      case 'expense':
        return 'expense';
      default:
        // Fall back to name-based categorization
        break;
    }
  }
  
  // Fallback to name-based categorization for backward compatibility
  if (EXPENSE_CATEGORIES.includes(categoryName)) {
    return 'expense';
  }
  if (INCOME_CATEGORIES.includes(categoryName)) {
    return 'income';
  }
  return 'expense'; // Default to expense for backward compatibility
}

/**
 * Filters budget categories based on the selected type
 * Enhanced to use database category_type when available
 */
export function filterCategoriesByType<T extends { 
  name: string; 
  category_type?: string | null;
}>(
  categories: T[], 
  selectedType: BudgetCategoryType
): T[] {
  if (selectedType === 'all') {
    return categories;
  }
  
  return categories.filter(category => {
    const categoryType = getCategoryType(category.name, category.category_type);
    return categoryType === selectedType;
  });
}

/**
 * Gets display name for budget type
 */
export function getBudgetTypeDisplayName(type: BudgetCategoryType): string {
  switch (type) {
    case 'expense':
      return 'Expense';
    case 'income':
      return 'Income';
    case 'all':
      return 'All';
    default:
      return 'Expense';
  }
}

/**
 * Maps frontend category type to database category_type value
 */
export function mapCategoryTypeToDatabase(type: BudgetCategoryType): string {
  return CATEGORY_TYPE_DB_MAPPING[type] || 'expense';
}

/**
 * Validates if a string is a valid budget category type
 */
export function isValidBudgetCategoryType(type: string): type is BudgetCategoryType {
  return ['expense', 'income', 'all'].includes(type);
} 