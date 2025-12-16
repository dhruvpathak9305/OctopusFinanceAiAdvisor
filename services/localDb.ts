import * as SQLite from 'expo-sqlite';
import { getAllSchemaSQL, LOCAL_SCHEMA_VERSION } from './database/localSchema';

export type LocalDB = SQLite.SQLiteDatabase;

let dbInstance: LocalDB | null = null;
let isInitialized = false;
let dbPromise: Promise<LocalDB> | null = null;

/**
 * Get or create the local database instance
 * Uses async API for expo-sqlite v16+
 */
export async function getLocalDb(): Promise<LocalDB> {
  if (dbInstance) {
    return dbInstance;
  }

  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('octopus_finance_offline.db');
  }

  dbInstance = await dbPromise;
  return dbInstance;
}

/**
 * Synchronous version for backward compatibility
 * @deprecated Use getLocalDb() async version instead
 */
export function getLocalDbSync(): LocalDB {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call getLocalDb() first.');
  }
  return dbInstance;
}

/**
 * Initialize the local database with all schema tables
 * This should be called once when the app starts
 */
export async function initializeLocalDb(): Promise<void> {
  if (isInitialized) {
    return;
  }

  const db = await getLocalDb();
  
  try {
    // Check current schema version
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY,
        applied_at INTEGER NOT NULL
      );
    `);

    // Get current version
    const versionResult = await db.getFirstAsync<{ version: number | null }>(
      'SELECT MAX(version) as version FROM schema_version;'
    );
    
    const currentVersion = versionResult?.version || 0;

    // If schema needs update, run migrations
    if (currentVersion < LOCAL_SCHEMA_VERSION) {
      console.log(`Updating schema from version ${currentVersion} to ${LOCAL_SCHEMA_VERSION}`);
      await runMigrationsAsync(db, currentVersion);
    } else {
      // Ensure all tables exist (for first-time setup)
      await ensureAllTablesExistAsync(db);
    }

    // Update schema version
    await db.runAsync(
      'INSERT OR REPLACE INTO schema_version (version, applied_at) VALUES (?, ?);',
      [LOCAL_SCHEMA_VERSION, Date.now()]
    );

    isInitialized = true;
    console.log('Local database initialized successfully');
  } catch (error) {
    console.error('Error initializing local database:', error);
    throw error;
  }
}

/**
 * Run migrations from current version to target version (async)
 */
async function runMigrationsAsync(db: LocalDB, fromVersion: number): Promise<void> {
  console.log(`Running migrations from version ${fromVersion} to ${LOCAL_SCHEMA_VERSION}`);
  
  // Run version-specific migrations
  if (fromVersion < 2 && LOCAL_SCHEMA_VERSION >= 2) {
    console.log('Running migration 002: Add Performance Indexes');
    await runMigration002(db);
  }
  
  // Get all schema SQL statements
  const schemaStatements = getAllSchemaSQL();
  
  // Execute all schema creation statements
  for (const sql of schemaStatements) {
    try {
      // Split by semicolon to handle multiple statements
      const statements = sql.split(';').filter(s => s.trim().length > 0);
      for (const statement of statements) {
        const trimmed = statement.trim();
        if (trimmed) {
          try {
            await db.execAsync(trimmed + ';');
          } catch (error: any) {
            // Ignore "already exists" errors
            if (!error.message?.includes('already exists') && !error.message?.includes('duplicate')) {
              console.warn('Schema execution warning:', error.message);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error executing schema statement:', error);
    }
  }
}

/**
 * Migration 002: Add Performance Indexes
 */
async function runMigration002(db: LocalDB): Promise<void> {
  try {
    // Composite index for transactions: user_id + date + sync_status
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_transactions_local_user_date_sync 
      ON transactions_local (user_id, date DESC, sync_status);
    `);

    // Composite index for efficient sync queries: user_id + updated_at
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_transactions_local_user_updated 
      ON transactions_local (user_id, updated_at DESC);
    `);

    // Index for date-range queries without user filter
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_transactions_local_date_desc 
      ON transactions_local (date DESC);
    `);

    // Composite index for sync job processing: sync_status + updated_at
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_sync_jobs_status_updated 
      ON sync_jobs (status, updated_at DESC);
    `);

    // Similar indexes for accounts table
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_accounts_local_user_updated 
      ON accounts_local (user_id, updated_at DESC);
    `);

    // Similar indexes for budget categories
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_budget_categories_local_user_updated 
      ON budget_categories_local (user_id, updated_at DESC);
    `);

    // Similar indexes for net worth entries
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_net_worth_entries_local_user_updated 
      ON net_worth_entries_local (user_id, updated_at DESC);
    `);

    console.log('Migration 002 completed: Performance indexes added');
  } catch (error: any) {
    console.error('Error running migration 002:', error);
    // Don't throw - indexes are optional optimizations
  }
}

/**
 * Ensure all tables exist (for first-time setup or recovery) - async
 */
async function ensureAllTablesExistAsync(db: LocalDB): Promise<void> {
  const schemaStatements = getAllSchemaSQL();
  for (const sql of schemaStatements) {
    const statements = sql.split(';').filter(s => s.trim().length > 0);
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (trimmed) {
        try {
          await db.execAsync(trimmed + ';');
        } catch (error: any) {
          if (!error.message?.includes('already exists') && !error.message?.includes('duplicate')) {
            console.warn('Table creation warning:', error.message);
          }
        }
      }
    }
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use initializeLocalDb() instead
 */
export function runMigrationsLegacy() {
  initializeLocalDb().catch((error) => {
    console.error('Error running migrations:', error);
  });
}

/**
 * Reset the database (for testing/debugging)
 * WARNING: This will delete all local data!
 */
export async function resetLocalDb(): Promise<void> {
  const db = await getLocalDb();
  
  try {
    // Drop all tables
    const tables = [
      'transactions_local',
      'accounts_local',
      'balance_local',
      'credit_cards_local',
      'budget_categories_local',
      'budget_subcategories_local',
      'budget_periods_local',
      'net_worth_categories_local',
      'net_worth_subcategories_local',
      'net_worth_entries_local',
      'sync_metadata',
      'sync_jobs',
      'schema_version'
    ];
    
    for (const table of tables) {
      await db.execAsync(`DROP TABLE IF EXISTS ${table};`);
    }
    
    isInitialized = false;
    await initializeLocalDb();
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}

/**
 * Get database statistics
 */
export async function getDbStats(): Promise<{
  transactionCount: number;
  accountCount: number;
  pendingSyncCount: number;
}> {
  const db = await getLocalDb();
  const results: any = {};

  try {
    const transactionResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM transactions_local;'
    );
    results.transactionCount = transactionResult?.count || 0;
  } catch (error) {
    console.error('Error getting transactionCount:', error);
    results.transactionCount = 0;
  }

  try {
    const accountResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM accounts_local;'
    );
    results.accountCount = accountResult?.count || 0;
  } catch (error) {
    console.error('Error getting accountCount:', error);
    results.accountCount = 0;
  }

  try {
    const syncResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM sync_jobs WHERE status = "pending";'
    );
    results.pendingSyncCount = syncResult?.count || 0;
  } catch (error) {
    console.error('Error getting pendingSyncCount:', error);
    results.pendingSyncCount = 0;
  }

  return results;
}


