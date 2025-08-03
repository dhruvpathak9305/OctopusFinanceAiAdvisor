// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: 'https://fzzbfgnmbchhmqepwmer.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6emJmZ25tYmNoaG1xZXB3bWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDMyMTksImV4cCI6MjA1OTQxOTIxOX0.T47MLWYCH5xIvk9QEAYNpqwOSrm1AiWpBbZjiRmNn0U',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};

// Environment configuration
export const ENV_CONFIG = {
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
  isTest: process.env.NODE_ENV === 'test',
};

// Table configuration
export const TABLE_CONFIG = {
  // Demo tables (for testing/demo mode)
  demo: {
    transactions: 'transactions',
    accounts: 'accounts',
    credit_cards: 'credit_cards',
    budget_categories: 'budget_categories',
    budget_subcategories: 'budget_subcategories',
    upcoming_bills: 'upcoming_bills',
    account_balance_history: 'account_balance_history',
    credit_card_balance_history: 'credit_card_balance_history',
    net_worth_categories: 'net_worth_categories',
    net_worth_subcategories: 'net_worth_subcategories',
    net_worth_entries: 'net_worth_entries',
    net_worth_entry_metadata: 'net_worth_entry_metadata',
    net_worth_snapshots: 'net_worth_snapshots',
    budget_periods: 'budget_periods',
    budget_category_snapshots: 'budget_category_snapshots',
    budget_subcategory_snapshots: 'budget_subcategory_snapshots',
  },
  // Real tables (for production)
  real: {
    transactions: 'transactions_real',
    accounts: 'accounts_real',
    credit_cards: 'credit_cards_real',
    budget_categories: 'budget_categories_real',
    budget_subcategories: 'budget_subcategories_real',
    upcoming_bills: 'upcoming_bills_real',
    account_balance_history: 'account_balance_history_real',
    credit_card_balance_history: 'credit_card_balance_history_real',
    net_worth_categories: 'net_worth_categories_real',
    net_worth_subcategories: 'net_worth_subcategories_real',
    net_worth_entries: 'net_worth_entries_real',
    net_worth_entry_metadata: 'net_worth_entry_metadata_real',
    net_worth_snapshots: 'net_worth_snapshots_real',
    budget_periods: 'budget_periods_real',
    budget_category_snapshots: 'budget_category_snapshots_real',
    budget_subcategory_snapshots: 'budget_subcategory_snapshots_real',
  },
};

// RLS (Row Level Security) policies
export const RLS_POLICIES = {
  enableRLS: true,
  userColumn: 'user_id',
};

// Realtime configuration
export const REALTIME_CONFIG = {
  enabled: true,
  eventsPerSecond: 10,
  heartbeatIntervalMs: 30000,
};

// Storage configuration
export const STORAGE_CONFIG = {
  bucket: 'octopus-finance-assets',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
};

// Auth configuration
export const AUTH_CONFIG = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false,
  flowType: 'pkce' as const,
};

// Error handling configuration
export const ERROR_CONFIG = {
  logErrors: __DEV__,
  showUserFriendlyErrors: true,
  maxRetries: 3,
  retryDelay: 1000,
}; 