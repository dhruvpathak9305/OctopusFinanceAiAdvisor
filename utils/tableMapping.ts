/**
 * Centralized Table Mapping System
 *
 * This module provides a single source of truth for table names based on demo mode.
 * It ensures that all related tables in joins/relationships correspond consistently
 * to the same demo or non-demo context.
 */

export interface TableMap {
  // Core transaction tables
  transactions: string;
  accounts: string;
  credit_cards: string;

  // Balance table
  balance_real: string;

  // Budget tables
  budget_categories: string;
  budget_subcategories: string;

  // Bill tables
  upcoming_bills: string;
  bill_payments: string;
  bill_reminders: string;

  // History tables
  account_balance_history: string;
  credit_card_history: string;

  // Net Worth tables
  net_worth_categories: string;
  net_worth_subcategories: string;
  net_worth_entries: string;
  net_worth_entry_metadata: string;
  net_worth_snapshots: string;

  // Fixed Deposits
  fixed_deposits: string;

  // Additional tables as needed
  budget_periods?: string;
  budget_category_snapshots?: string;
  budget_subcategory_snapshots?: string;
}

/**
 * IMPORTANT: Demo vs Real Table Logic
 *
 * The logic is REVERSED from what you might expect:
 * - isDemo = true  → use BASE tables (e.g., 'transactions', 'budget_categories')
 * - isDemo = false → use _real tables (e.g., 'transactions_real', 'budget_categories_real')
 *
 * This is because demo data is stored in the base tables, and real user data
 * is stored in tables with the '_real' suffix.
 */

/**
 * Get the complete table mapping based on demo mode
 * @param isDemo - Whether demo mode is active
 * @returns Object containing all table names for the current mode
 */
export const getTableMap = (isDemo: boolean): TableMap => {
  if (isDemo) {
    // Demo mode: use base tables (demo data)
    return {
      transactions: "transactions",
      accounts: "accounts",
      credit_cards: "credit_cards",
      balance_real: "balance_real", // balance_real table is always the same name
      budget_categories: "budget_categories",
      budget_subcategories: "budget_subcategories",
      upcoming_bills: "upcoming_bills",
      bill_payments: "bill_payments",
      bill_reminders: "bill_reminders",
      account_balance_history: "account_balance_history",
      credit_card_history: "credit_card_history",
      net_worth_categories: "net_worth_categories",
      net_worth_subcategories: "net_worth_subcategories",
      net_worth_entries: "net_worth_entries",
      net_worth_entry_metadata: "net_worth_entry_metadata",
      net_worth_snapshots: "net_worth_snapshots",
      fixed_deposits: "fixed_deposits",
      budget_periods: "budget_periods",
      budget_category_snapshots: "budget_category_snapshots",
      budget_subcategory_snapshots: "budget_subcategory_snapshots",
    };
  } else {
    // Real mode: use _real tables (real user data)
    return {
      transactions: "transactions_real",
      accounts: "accounts_real",
      credit_cards: "credit_cards_real",
      balance_real: "balance_real", // balance_real table is always the same name
      budget_categories: "budget_categories_real",
      budget_subcategories: "budget_subcategories_real",
      upcoming_bills: "upcoming_bills_real",
      bill_payments: "bill_payments_real",
      bill_reminders: "bill_reminders_real",
      account_balance_history: "account_balance_history_real",
      credit_card_history: "credit_card_history_real",
      net_worth_categories: "net_worth_categories_real",
      net_worth_subcategories: "net_worth_subcategories_real",
      net_worth_entries: "net_worth_entries_real",
      net_worth_entry_metadata: "net_worth_entry_metadata_real",
      net_worth_snapshots: "net_worth_snapshots_real",
      fixed_deposits: "fixed_deposits_real",
      budget_periods: "budget_periods_real",
      budget_category_snapshots: "budget_category_snapshots_real",
      budget_subcategory_snapshots: "budget_subcategory_snapshots_real",
    };
  }
};

/**
 * Get a specific table name based on demo mode
 * @param baseTableName - The base table name (without _real suffix)
 * @param isDemo - Whether demo mode is active
 * @returns The resolved table name
 */
export const getTableName = (
  baseTableName: string,
  isDemo: boolean
): string => {
  return isDemo ? baseTableName : `${baseTableName}_real`;
};

/**
 * Generate foreign key relationship names for Supabase joins
 * This ensures consistent relationships between related tables
 */
export const getForeignKeyName = (
  sourceTable: string,
  targetTable: string,
  foreignKeyColumn: string,
  isDemo: boolean
): string => {
  const sourceTableName = getTableName(sourceTable, isDemo);
  const targetTableName = getTableName(targetTable, isDemo);

  // Standard Supabase foreign key naming convention
  return `${sourceTableName}_${foreignKeyColumn}_fkey`;
};

/**
 * Build dynamic Supabase select query with proper table relationships
 * @param tableMap - Table mapping for current mode
 * @param baseTable - The main table to query from
 * @param relationships - Array of relationship definitions
 */
export interface RelationshipDefinition {
  table: keyof TableMap;
  foreignKey: string;
  columns: string;
  alias?: string;
}

export const buildSelectQuery = (
  tableMap: TableMap,
  baseTable: keyof TableMap,
  relationships: RelationshipDefinition[] = []
): string => {
  let selectClause = "*";

  if (relationships.length > 0) {
    const relationshipClauses = relationships.map((rel) => {
      const tableName = tableMap[rel.table];
      const fkName = getForeignKeyName(
        baseTable as string,
        rel.table as string,
        rel.foreignKey,
        false // We'll determine this from the table map
      );

      const alias = rel.alias || (rel.table as string);
      return `${alias}:${tableName}!${fkName}(${rel.columns})`;
    });

    selectClause = `*, ${relationshipClauses.join(", ")}`;
  }

  return selectClause;
};

/**
 * Utility to validate table consistency across demo/real modes
 * This helps catch mismatched table relationships during development
 */
export const validateTableConsistency = (tableMap: TableMap): boolean => {
  const allTables = Object.values(tableMap);
  const hasReal = allTables.some((table) => table.includes("_real"));
  const hasDemo = allTables.some((table) => !table.includes("_real"));

  if (hasReal && hasDemo) {
    console.error(
      "Table mapping inconsistency detected! Mixing demo and real tables:",
      tableMap
    );
    return false;
  }

  return true;
};

/**
 * List of core tables that have demo/real versions
 * Used for validation and migration purposes
 */
export const CORE_TABLES = [
  "transactions",
  "accounts",
  "credit_cards",
  "budget_categories",
  "budget_subcategories",
  "upcoming_bills",
  "bill_payments",
  "bill_reminders",
  "net_worth_categories",
  "net_worth_subcategories",
  "net_worth_entries",
] as const;

/**
 * List of optional tables that may have demo/real versions
 */
export const OPTIONAL_TABLES = [
  "account_balance_history",
  "credit_card_history",
  "budget_periods",
  "budget_category_snapshots",
  "budget_subcategory_snapshots",
  "net_worth_entry_metadata",
  "net_worth_snapshots",
] as const;

export type CoreTableName = (typeof CORE_TABLES)[number];
export type OptionalTableName = (typeof OPTIONAL_TABLES)[number];
export type AllTableName = CoreTableName | OptionalTableName;
