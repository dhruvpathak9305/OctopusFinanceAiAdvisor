/**
 * Migration 002: Add Performance Indexes
 * 
 * Adds composite indexes for common query patterns to improve query performance:
 * - (user_id, date DESC, sync_status) for transactions
 * - (user_id, updated_at DESC) for efficient sync queries
 * - (date DESC) for date-range queries without user filter
 * - (sync_status, updated_at) for sync job processing
 */

import { LocalDB } from '../../localDb';

export const migration002 = {
  version: 2,
  name: 'add_performance_indexes',
  up: async (db: LocalDB) => {
    console.log('Running migration 002: Add Performance Indexes');

    // Composite index for transactions: user_id + date + sync_status
    // Optimizes queries filtering by user and date range with sync status
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_transactions_local_user_date_sync 
      ON transactions_local (user_id, date DESC, sync_status);
    `);

    // Composite index for efficient sync queries: user_id + updated_at
    // Optimizes queries that need to find recently updated records for sync
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_transactions_local_user_updated 
      ON transactions_local (user_id, updated_at DESC);
    `);

    // Index for date-range queries without user filter
    // Useful for admin queries or date-based analytics
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_transactions_local_date_desc 
      ON transactions_local (date DESC);
    `);

    // Composite index for sync job processing: sync_status + updated_at
    // Optimizes queries that fetch pending sync jobs ordered by creation time
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
  },
  down: async (db: LocalDB) => {
    console.log('Rolling back migration 002: Remove Performance Indexes');

    await db.execAsync(`DROP INDEX IF EXISTS idx_transactions_local_user_date_sync;`);
    await db.execAsync(`DROP INDEX IF EXISTS idx_transactions_local_user_updated;`);
    await db.execAsync(`DROP INDEX IF EXISTS idx_transactions_local_date_desc;`);
    await db.execAsync(`DROP INDEX IF EXISTS idx_sync_jobs_status_updated;`);
    await db.execAsync(`DROP INDEX IF EXISTS idx_accounts_local_user_updated;`);
    await db.execAsync(`DROP INDEX IF EXISTS idx_budget_categories_local_user_updated;`);
    await db.execAsync(`DROP INDEX IF EXISTS idx_net_worth_entries_local_user_updated;`);

    console.log('Migration 002 rollback completed');
  },
};

