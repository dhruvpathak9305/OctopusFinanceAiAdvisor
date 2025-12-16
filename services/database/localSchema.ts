/**
 * =============================================================================
 * LOCAL SQLITE SCHEMA - OFFLINE-FIRST ARCHITECTURE
 * =============================================================================
 * 
 * Complete SQLite schema mirroring Supabase tables with sync metadata.
 * All tables include sync_status, created_offline, updated_offline, deleted_offline,
 * last_synced_at, and server_version columns for conflict resolution.
 * 
 * Timestamps are stored as INTEGER (Unix epoch milliseconds) for SQLite compatibility.
 * JSON fields are stored as TEXT and parsed when needed.
 */

export const LOCAL_SCHEMA_VERSION = 2;

/**
 * Sync status values
 */
export enum SyncStatus {
  PENDING = 'pending',
  SYNCED = 'synced',
  CONFLICT = 'conflict',
  LOCAL_ONLY = 'local_only',
  ERROR = 'error'
}

/**
 * SQL schema definitions for all local tables
 */
export const LOCAL_SCHEMA = {
  // =============================================================================
  // SYNC METADATA TABLE
  // =============================================================================
  sync_metadata: `
    CREATE TABLE IF NOT EXISTS sync_metadata (
      table_name TEXT PRIMARY KEY NOT NULL,
      last_pulled_at INTEGER,
      last_pushed_at INTEGER,
      cursor_token TEXT,
      version INTEGER DEFAULT ${LOCAL_SCHEMA_VERSION}
    );
    
    CREATE INDEX IF NOT EXISTS idx_sync_metadata_table_name 
    ON sync_metadata (table_name);
  `,

  // =============================================================================
  // SYNC JOBS QUEUE
  // =============================================================================
  sync_jobs: `
    CREATE TABLE IF NOT EXISTS sync_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
      payload TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
      attempt INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL DEFAULT 3,
      error_message TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      scheduled_at INTEGER
    );
    
    CREATE INDEX IF NOT EXISTS idx_sync_jobs_status 
    ON sync_jobs (status, scheduled_at);
    
    CREATE INDEX IF NOT EXISTS idx_sync_jobs_table_record 
    ON sync_jobs (table_name, record_id);
  `,

  // =============================================================================
  // PERFORMANCE METRICS TABLE
  // =============================================================================
  performance_metrics: `
    CREATE TABLE IF NOT EXISTS performance_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      metric_type TEXT NOT NULL,
      metric_name TEXT NOT NULL,
      value REAL NOT NULL,
      metadata TEXT,
      timestamp INTEGER NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_performance_metrics_type_time 
    ON performance_metrics (metric_type, timestamp DESC);
    
    CREATE INDEX IF NOT EXISTS idx_performance_metrics_name_time 
    ON performance_metrics (metric_name, timestamp DESC);
  `,

  // =============================================================================
  // TRANSACTIONS TABLE
  // =============================================================================
  transactions_local: `
    CREATE TABLE IF NOT EXISTS transactions_local (
      id TEXT PRIMARY KEY NOT NULL,
      local_id TEXT UNIQUE,
      user_id TEXT NOT NULL,
      
      -- Transaction fields
      name TEXT NOT NULL,
      description TEXT,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer', 'loan', 'loan_repayment', 'debt', 'debt_collection')),
      category_id TEXT,
      subcategory_id TEXT,
      icon TEXT,
      merchant TEXT,
      source_account_id TEXT,
      source_account_type TEXT NOT NULL,
      source_account_name TEXT,
      destination_account_id TEXT,
      destination_account_type TEXT,
      destination_account_name TEXT,
      is_recurring INTEGER DEFAULT 0,
      recurrence_pattern TEXT,
      recurrence_end_date TEXT,
      parent_transaction_id TEXT,
      interest_rate REAL,
      loan_term_months INTEGER,
      metadata TEXT,
      is_credit_card INTEGER DEFAULT 0,
      
      -- Sync metadata
      sync_status TEXT DEFAULT '${SyncStatus.PENDING}' CHECK (sync_status IN ('pending', 'synced', 'conflict', 'local_only', 'error')),
      created_offline INTEGER DEFAULT 0,
      updated_offline INTEGER DEFAULT 0,
      deleted_offline INTEGER DEFAULT 0,
      last_synced_at INTEGER,
      server_version INTEGER DEFAULT 0,
      
      -- Timestamps
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      
      FOREIGN KEY (parent_transaction_id) REFERENCES transactions_local(id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_transactions_local_user_date 
    ON transactions_local (user_id, date DESC);
    
    CREATE INDEX IF NOT EXISTS idx_transactions_local_sync_status 
    ON transactions_local (sync_status);
    
    CREATE INDEX IF NOT EXISTS idx_transactions_local_account 
    ON transactions_local (source_account_id);
    
    CREATE INDEX IF NOT EXISTS idx_transactions_local_category 
    ON transactions_local (category_id);
    
    CREATE INDEX IF NOT EXISTS idx_transactions_local_type 
    ON transactions_local (type);
  `,

  // =============================================================================
  // ACCOUNTS TABLE
  // =============================================================================
  accounts_local: `
    CREATE TABLE IF NOT EXISTS accounts_local (
      id TEXT PRIMARY KEY NOT NULL,
      local_id TEXT UNIQUE,
      user_id TEXT NOT NULL,
      
      -- Account fields
      name TEXT NOT NULL,
      account_number TEXT,
      institution TEXT,
      type TEXT NOT NULL,
      bank_holder_name TEXT,
      branch_address TEXT,
      branch_name TEXT,
      crn TEXT,
      currency TEXT DEFAULT 'INR',
      ifsc_code TEXT,
      micr_code TEXT,
      logo_url TEXT,
      initial_balance REAL DEFAULT 0,
      initial_balance_date TEXT,
      last_sync TEXT,
      last_transaction_date TEXT,
      is_active INTEGER DEFAULT 1,
      current_balance REAL DEFAULT 0,
      total_expenses REAL DEFAULT 0,
      total_income REAL DEFAULT 0,
      transaction_count INTEGER DEFAULT 0,
      
      -- Sync metadata
      sync_status TEXT DEFAULT '${SyncStatus.PENDING}' CHECK (sync_status IN ('pending', 'synced', 'conflict', 'local_only', 'error')),
      created_offline INTEGER DEFAULT 0,
      updated_offline INTEGER DEFAULT 0,
      deleted_offline INTEGER DEFAULT 0,
      last_synced_at INTEGER,
      server_version INTEGER DEFAULT 0,
      
      -- Timestamps
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_accounts_local_user 
    ON accounts_local (user_id);
    
    CREATE INDEX IF NOT EXISTS idx_accounts_local_sync_status 
    ON accounts_local (sync_status);
    
    CREATE INDEX IF NOT EXISTS idx_accounts_local_institution 
    ON accounts_local (institution);
  `,

  // =============================================================================
  // BALANCE TABLE
  // =============================================================================
  balance_local: `
    CREATE TABLE IF NOT EXISTS balance_local (
      id TEXT PRIMARY KEY NOT NULL,
      account_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      
      -- Balance fields
      account_name TEXT NOT NULL,
      account_type TEXT NOT NULL,
      account_number TEXT,
      institution_name TEXT,
      currency TEXT DEFAULT 'INR',
      opening_balance REAL NOT NULL DEFAULT 0,
      current_balance REAL NOT NULL DEFAULT 0,
      last_updated INTEGER NOT NULL,
      
      -- Sync metadata
      sync_status TEXT DEFAULT '${SyncStatus.PENDING}' CHECK (sync_status IN ('pending', 'synced', 'conflict', 'local_only', 'error')),
      created_offline INTEGER DEFAULT 0,
      updated_offline INTEGER DEFAULT 0,
      deleted_offline INTEGER DEFAULT 0,
      last_synced_at INTEGER,
      server_version INTEGER DEFAULT 0,
      
      -- Timestamps
      created_at INTEGER NOT NULL,
      
      FOREIGN KEY (account_id) REFERENCES accounts_local(id) ON DELETE CASCADE,
      UNIQUE (account_id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_balance_local_account 
    ON balance_local (account_id);
    
    CREATE INDEX IF NOT EXISTS idx_balance_local_user 
    ON balance_local (user_id);
  `,

  // =============================================================================
  // CREDIT CARDS TABLE
  // =============================================================================
  credit_cards_local: `
    CREATE TABLE IF NOT EXISTS credit_cards_local (
      id TEXT PRIMARY KEY NOT NULL,
      local_id TEXT UNIQUE,
      user_id TEXT NOT NULL,
      
      -- Credit card fields
      name TEXT NOT NULL,
      institution TEXT NOT NULL,
      last_four_digits INTEGER NOT NULL,
      credit_limit REAL NOT NULL,
      current_balance REAL NOT NULL,
      billing_cycle TEXT,
      due_date TEXT,
      logo_url TEXT,
      
      -- Sync metadata
      sync_status TEXT DEFAULT '${SyncStatus.PENDING}' CHECK (sync_status IN ('pending', 'synced', 'conflict', 'local_only', 'error')),
      created_offline INTEGER DEFAULT 0,
      updated_offline INTEGER DEFAULT 0,
      deleted_offline INTEGER DEFAULT 0,
      last_synced_at INTEGER,
      server_version INTEGER DEFAULT 0,
      
      -- Timestamps
      created_at INTEGER,
      updated_at INTEGER
    );
    
    CREATE INDEX IF NOT EXISTS idx_credit_cards_local_user 
    ON credit_cards_local (user_id);
    
    CREATE INDEX IF NOT EXISTS idx_credit_cards_local_sync_status 
    ON credit_cards_local (sync_status);
  `,

  // =============================================================================
  // BUDGET CATEGORIES TABLE
  // =============================================================================
  budget_categories_local: `
    CREATE TABLE IF NOT EXISTS budget_categories_local (
      id TEXT PRIMARY KEY NOT NULL,
      local_id TEXT UNIQUE,
      user_id TEXT,
      
      -- Budget category fields
      name TEXT NOT NULL,
      budget_limit REAL NOT NULL,
      ring_color TEXT NOT NULL,
      bg_color TEXT NOT NULL,
      category_type TEXT,
      description TEXT,
      display_order INTEGER,
      frequency TEXT,
      start_date TEXT,
      status TEXT,
      strategy TEXT,
      is_active TEXT,
      percentage REAL,
      icon TEXT,
      
      -- Sync metadata
      sync_status TEXT DEFAULT '${SyncStatus.PENDING}' CHECK (sync_status IN ('pending', 'synced', 'conflict', 'local_only', 'error')),
      created_offline INTEGER DEFAULT 0,
      updated_offline INTEGER DEFAULT 0,
      deleted_offline INTEGER DEFAULT 0,
      last_synced_at INTEGER,
      server_version INTEGER DEFAULT 0,
      
      -- Timestamps
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_budget_categories_local_user 
    ON budget_categories_local (user_id);
    
    CREATE INDEX IF NOT EXISTS idx_budget_categories_local_sync_status 
    ON budget_categories_local (sync_status);
    
    CREATE INDEX IF NOT EXISTS idx_budget_categories_local_type 
    ON budget_categories_local (category_type);
  `,

  // =============================================================================
  // BUDGET SUBCATEGORIES TABLE
  // =============================================================================
  budget_subcategories_local: `
    CREATE TABLE IF NOT EXISTS budget_subcategories_local (
      id TEXT PRIMARY KEY NOT NULL,
      local_id TEXT UNIQUE,
      category_id TEXT NOT NULL,
      
      -- Subcategory fields
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      color TEXT NOT NULL,
      icon TEXT NOT NULL,
      budget_limit REAL,
      current_spend REAL,
      description TEXT,
      display_order INTEGER,
      is_active INTEGER DEFAULT 1,
      transaction_category_id TEXT,
      
      -- Sync metadata
      sync_status TEXT DEFAULT '${SyncStatus.PENDING}' CHECK (sync_status IN ('pending', 'synced', 'conflict', 'local_only', 'error')),
      created_offline INTEGER DEFAULT 0,
      updated_offline INTEGER DEFAULT 0,
      deleted_offline INTEGER DEFAULT 0,
      last_synced_at INTEGER,
      server_version INTEGER DEFAULT 0,
      
      -- Timestamps
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      
      FOREIGN KEY (category_id) REFERENCES budget_categories_local(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_budget_subcategories_local_category 
    ON budget_subcategories_local (category_id);
    
    CREATE INDEX IF NOT EXISTS idx_budget_subcategories_local_sync_status 
    ON budget_subcategories_local (sync_status);
  `,

  // =============================================================================
  // NET WORTH CATEGORIES TABLE
  // =============================================================================
  net_worth_categories_local: `
    CREATE TABLE IF NOT EXISTS net_worth_categories_local (
      id TEXT PRIMARY KEY NOT NULL,
      local_id TEXT UNIQUE,
      
      -- Category fields
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('asset', 'liability')),
      color TEXT,
      icon TEXT,
      description TEXT,
      sort_order INTEGER,
      is_active INTEGER DEFAULT 1,
      
      -- Sync metadata
      sync_status TEXT DEFAULT '${SyncStatus.PENDING}' CHECK (sync_status IN ('pending', 'synced', 'conflict', 'local_only', 'error')),
      created_offline INTEGER DEFAULT 0,
      updated_offline INTEGER DEFAULT 0,
      deleted_offline INTEGER DEFAULT 0,
      last_synced_at INTEGER,
      server_version INTEGER DEFAULT 0,
      
      -- Timestamps
      created_at INTEGER,
      updated_at INTEGER
    );
    
    CREATE INDEX IF NOT EXISTS idx_net_worth_categories_local_type 
    ON net_worth_categories_local (type);
    
    CREATE INDEX IF NOT EXISTS idx_net_worth_categories_local_sync_status 
    ON net_worth_categories_local (sync_status);
  `,

  // =============================================================================
  // NET WORTH SUBCATEGORIES TABLE
  // =============================================================================
  net_worth_subcategories_local: `
    CREATE TABLE IF NOT EXISTS net_worth_subcategories_local (
      id TEXT PRIMARY KEY NOT NULL,
      local_id TEXT UNIQUE,
      category_id TEXT NOT NULL,
      
      -- Subcategory fields
      name TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER,
      is_active INTEGER DEFAULT 1,
      
      -- Sync metadata
      sync_status TEXT DEFAULT '${SyncStatus.PENDING}' CHECK (sync_status IN ('pending', 'synced', 'conflict', 'local_only', 'error')),
      created_offline INTEGER DEFAULT 0,
      updated_offline INTEGER DEFAULT 0,
      deleted_offline INTEGER DEFAULT 0,
      last_synced_at INTEGER,
      server_version INTEGER DEFAULT 0,
      
      -- Timestamps
      created_at INTEGER,
      updated_at INTEGER,
      
      FOREIGN KEY (category_id) REFERENCES net_worth_categories_local(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_net_worth_subcategories_local_category 
    ON net_worth_subcategories_local (category_id);
    
    CREATE INDEX IF NOT EXISTS idx_net_worth_subcategories_local_sync_status 
    ON net_worth_subcategories_local (sync_status);
  `,

  // =============================================================================
  // NET WORTH ENTRIES TABLE
  // =============================================================================
  net_worth_entries_local: `
    CREATE TABLE IF NOT EXISTS net_worth_entries_local (
      id TEXT PRIMARY KEY NOT NULL,
      local_id TEXT UNIQUE,
      user_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      subcategory_id TEXT NOT NULL,
      
      -- Entry fields
      asset_name TEXT NOT NULL,
      value REAL NOT NULL,
      quantity REAL,
      market_price REAL,
      date TEXT,
      notes TEXT,
      is_active INTEGER DEFAULT 1,
      is_included_in_net_worth INTEGER DEFAULT 1,
      linked_source_type TEXT CHECK (linked_source_type IN ('account', 'credit_card', 'fixed_deposit', 'portfolio', 'loan')),
      linked_source_id TEXT,
      last_synced_at INTEGER,
      
      -- Sync metadata
      sync_status TEXT DEFAULT '${SyncStatus.PENDING}' CHECK (sync_status IN ('pending', 'synced', 'conflict', 'local_only', 'error')),
      created_offline INTEGER DEFAULT 0,
      updated_offline INTEGER DEFAULT 0,
      deleted_offline INTEGER DEFAULT 0,
      last_synced_at_local INTEGER,
      server_version INTEGER DEFAULT 0,
      
      -- Timestamps
      created_at INTEGER,
      updated_at INTEGER,
      
      FOREIGN KEY (category_id) REFERENCES net_worth_categories_local(id),
      FOREIGN KEY (subcategory_id) REFERENCES net_worth_subcategories_local(id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_net_worth_entries_local_user 
    ON net_worth_entries_local (user_id);
    
    CREATE INDEX IF NOT EXISTS idx_net_worth_entries_local_category 
    ON net_worth_entries_local (category_id);
    
    CREATE INDEX IF NOT EXISTS idx_net_worth_entries_local_sync_status 
    ON net_worth_entries_local (sync_status);
  `,

  // =============================================================================
  // BUDGET PERIODS TABLE
  // =============================================================================
  budget_periods_local: `
    CREATE TABLE IF NOT EXISTS budget_periods_local (
      id TEXT PRIMARY KEY NOT NULL,
      local_id TEXT UNIQUE,
      user_id TEXT,
      
      -- Period fields
      name TEXT,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      total_budget REAL,
      total_spend REAL,
      budget_strategy TEXT,
      budget_set_for_period TEXT,
      apply_to_all_months INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      status TEXT,
      
      -- Sync metadata
      sync_status TEXT DEFAULT '${SyncStatus.PENDING}' CHECK (sync_status IN ('pending', 'synced', 'conflict', 'local_only', 'error')),
      created_offline INTEGER DEFAULT 0,
      updated_offline INTEGER DEFAULT 0,
      deleted_offline INTEGER DEFAULT 0,
      last_synced_at INTEGER,
      server_version INTEGER DEFAULT 0,
      
      -- Timestamps
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_budget_periods_local_user 
    ON budget_periods_local (user_id);
    
    CREATE INDEX IF NOT EXISTS idx_budget_periods_local_period_start 
    ON budget_periods_local (period_start);
  `,
};

/**
 * Get all table creation SQL statements
 */
export function getAllSchemaSQL(): string[] {
  return Object.values(LOCAL_SCHEMA);
}

/**
 * Get schema SQL for a specific table
 */
export function getTableSchemaSQL(tableName: keyof typeof LOCAL_SCHEMA): string {
  return LOCAL_SCHEMA[tableName] || '';
}

