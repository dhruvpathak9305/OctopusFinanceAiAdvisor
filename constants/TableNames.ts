/**
 * Centralized Database Table Names
 * 
 * This file contains all database table names used throughout the application.
 * If any table name needs to be changed, update it here and it will be reflected
 * across the entire application.
 * 
 * Usage:
 * import { TABLE_NAMES } from '../constants/TableNames';
 * const { ACCOUNTS, TRANSACTIONS } = TABLE_NAMES;
 */

export const TABLE_NAMES = {
  // Core Tables (Demo versions - without _real suffix)
  DEMO: {
    ACCOUNT_BALANCE_HISTORY: 'account_balance_history',
    ACCOUNTS: 'accounts',
    AI_SPENDING_PATTERNS: 'ai_spending_patterns',
    BUDGET_CATEGORIES: 'budget_categories',
    BUDGET_PERIODS: 'budget_periods',
    BUDGET_SUBCATEGORIES: 'budget_subcategories',
    CREDIT_CARD_BALANCE_HISTORY: 'credit_card_balance_history',
    CREDIT_CARDS: 'credit_cards',
    ENVELOPE_BUDGETS: 'envelope_budgets',
    NET_WORTH_CATEGORIES: 'net_worth_categories',
    NET_WORTH_ENTRIES: 'net_worth_entries',
    NET_WORTH_SUBCATEGORIES: 'net_worth_subcategories',
    ROLLING_BUDGET_ADJUSTMENTS: 'rolling_budget_adjustments',
    TRANSACTIONS: 'transactions',
    UPCOMING_BILLS: 'upcoming_bills',
    ZERO_BASED_BUDGETS: 'zero_based_budgets',
  },
  
  // Real User Tables (with _real suffix)
  REAL: {
    ACCOUNT_BALANCE_HISTORY: 'account_balance_history_real',
    ACCOUNTS: 'accounts_real',
    BUDGET_CATEGORIES: 'budget_categories_real',
    BUDGET_PERIODS: 'budget_periods_real',
    BUDGET_SUBCATEGORIES: 'budget_subcategories_real',
    CREDIT_CARD_BALANCE_HISTORY: 'credit_card_balance_history_real',
    CREDIT_CARDS: 'credit_cards_real',
    ENVELOPE_BUDGETS: 'envelope_budgets_real',
    NET_WORTH_ENTRIES: 'net_worth_entries_real',
    NET_WORTH_CATEGORIES: 'net_worth_categories_real',
    NET_WORTH_SUBCATEGORIES: 'net_worth_subcategories_real',
    ROLLING_BUDGET_ADJUSTMENTS: 'rolling_budget_adjustments_real',
    TRANSACTIONS: 'transactions_real',
    UPCOMING_BILLS: 'upcoming_bills_real',
    USER_NET_WORTH_SUMMARY: 'user_net_worth_summary_real',
    ZERO_BASED_BUDGETS: 'zero_based_budgets_real',
  },
  
  // Snapshot and History Tables (appear to be shared)
  BUDGET_CATEGORY_SNAPSHOTS: 'budget_category_snapshots',
  BUDGET_SUBCATEGORY_SNAPSHOTS: 'budget_subcategory_snapshots',
  NET_WORTH_ENTRIES_DETAILED: 'net_worth_entries_detailed',
  NET_WORTH_ENTRIES_DETAILED_REAL: 'net_worth_entries_detailed_real',
  NET_WORTH_ENTRY_METADATA: 'net_worth_entry_metadata',
  NET_WORTH_ENTRY_METADATA_REAL: 'net_worth_entry_metadata_real',
  NET_WORTH_HISTORY: 'net_worth_history',
  NET_WORTH_SNAPSHOTS: 'net_worth_snapshots',
  NET_WORTH_SNAPSHOTS_REAL: 'net_worth_snapshots_real',
  USER_NET_WORTH_SUMMARY: 'user_net_worth_summary',
  
  // Legacy aliases for backward compatibility (use getTableName helper instead)
  ACCOUNTS: 'accounts_real',
  TRANSACTIONS: 'transactions_real',
  BUDGET_CATEGORIES: 'budget_categories_real',
  BUDGET_SUBCATEGORIES: 'budget_subcategories_real',
  CREDIT_CARDS: 'credit_cards_real',
  UPCOMING_BILLS: 'upcoming_bills_real',
  NET_WORTH: 'net_worth_entries_real',
} as const;

/**
 * Table Name Groups for easier management
 */
export const TABLE_GROUPS = {
  CORE: [
    'ACCOUNTS',
    'TRANSACTIONS',
  ],
  
  BUDGET: [
    'BUDGET_CATEGORIES',
    'BUDGET_SUBCATEGORIES',
    'BUDGET_PERIODS',
    'ENVELOPE_BUDGETS',
    'ZERO_BASED_BUDGETS',
    'ROLLING_BUDGET_ADJUSTMENTS',
  ],
  
  CREDIT: [
    'CREDIT_CARDS',
    'CREDIT_CARD_BALANCE_HISTORY',
  ],
  
  BILLS: [
    'UPCOMING_BILLS',
  ],
  
  NET_WORTH: [
    'NET_WORTH_ENTRIES',
    'NET_WORTH_CATEGORIES',
    'NET_WORTH_SUBCATEGORIES',
  ],
  
  HISTORY: [
    'ACCOUNT_BALANCE_HISTORY',
    'CREDIT_CARD_BALANCE_HISTORY',
    'NET_WORTH_HISTORY',
    'NET_WORTH_SNAPSHOTS',
  ],
} as const;

/**
 * Helper function to get the correct table name based on demo mode
 * @param tableName - The base table name (e.g., 'ACCOUNTS', 'TRANSACTIONS')
 * @param isDemo - Whether demo mode is active
 * @returns The appropriate table name for the current mode
 */
export const getTableName = (tableName: keyof typeof TABLE_NAMES.DEMO, isDemo: boolean): string => {
  if (isDemo) {
    return TABLE_NAMES.DEMO[tableName];
  } else {
    // Check if table exists in REAL, otherwise fall back to DEMO
    const realTable = TABLE_NAMES.REAL[tableName as keyof typeof TABLE_NAMES.REAL];
    return realTable || TABLE_NAMES.DEMO[tableName];
  }
};

/**
 * Helper function to get all table names as an array
 */
export const getAllTableNames = (): string[] => {
  return [
    ...Object.values(TABLE_NAMES.DEMO),
    ...Object.values(TABLE_NAMES.REAL),
    ...Object.values(TABLE_NAMES).filter(val => typeof val === 'string')
  ];
};

/**
 * Helper function to get table names by group
 */
export const getTableNamesByGroup = (group: keyof typeof TABLE_GROUPS, isDemo: boolean = false): string[] => {
  return TABLE_GROUPS[group].map(tableName => getTableName(tableName as keyof typeof TABLE_NAMES.DEMO, isDemo));
};

/**
 * Type definitions for better TypeScript support
 */
export type TableName = typeof TABLE_NAMES[keyof typeof TABLE_NAMES];
export type TableGroup = keyof typeof TABLE_GROUPS;

export default TABLE_NAMES;
