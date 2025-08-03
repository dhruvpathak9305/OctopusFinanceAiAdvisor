/**
 * Demo utilities (DEPRECATED - use tableMapping.ts instead)
 * 
 * This file is kept for backward compatibility.
 * New code should use the centralized table mapping system in tableMapping.ts
 */

import { getTableName as getTableNameNew } from './tableMapping';

/**
 * @deprecated Use getTableName from tableMapping.ts instead
 * Resolves the table name based on the current demo mode
 * @param baseName - The base table name (e.g., "transactions")
 * @param isDemo - Whether demo mode is active
 * @returns The resolved table name ("transactions" or "transactions_real")
 */
export const getTableName = (baseName: string, isDemo: boolean): string => {
  console.warn('getTableName from demoUtils.ts is deprecated. Use getTableName from tableMapping.ts instead.');
  return getTableNameNew(baseName, isDemo);
};

/**
 * @deprecated Use CORE_TABLES and OPTIONAL_TABLES from tableMapping.ts instead
 * List of tables that have demo/real versions
 */
export const DEMO_TABLES = [
  'transactions',
  'budget_categories',
  'budget_subcategories',
  'accounts',
  'credit_cards',
  'upcoming_bills'
]; 