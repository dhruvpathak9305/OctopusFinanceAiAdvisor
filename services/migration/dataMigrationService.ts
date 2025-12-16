/**
 * =============================================================================
 * DATA MIGRATION SERVICE - FREE TO PREMIUM MIGRATION
 * =============================================================================
 * 
 * Handles migration of local offline data to Supabase when a free user
 * upgrades to premium and logs in.
 * Supports merge, replace, and selective migration strategies.
 */

import { supabase } from '../../lib/supabase/client';
import { getLocalDb } from '../localDb';
import syncEngine from '../sync/syncEngine';
import offlineAuth from '../auth/offlineAuth';
import subscriptionService from '../subscription/subscriptionService';
import { TransactionsRepository } from '../repositories/transactionsRepository';
import { AccountsRepository } from '../repositories/accountsRepository';
import { BudgetCategoriesRepository } from '../repositories/budgetRepository';
import { NetWorthEntriesRepository } from '../repositories/netWorthRepository';

export type MigrationStrategy = 'merge' | 'replace' | 'selective';

export interface MigrationOptions {
  strategy: MigrationStrategy;
  selectedData?: {
    accounts?: string[];
    transactions?: string[];
    budgets?: string[];
    netWorth?: string[];
  };
}

export interface MigrationPreview {
  accounts: { count: number; total: number };
  transactions: { count: number; total: number };
  budgets: { count: number; total: number };
  netWorth: { count: number; total: number };
  serverDataExists: boolean;
}

export interface MigrationResult {
  success: boolean;
  migrated: {
    accounts: number;
    transactions: number;
    budgets: number;
    netWorth: number;
  };
  conflicts: number;
  errors: string[];
}

class DataMigrationService {
  private static instance: DataMigrationService;

  private constructor() {}

  static getInstance(): DataMigrationService {
    if (!DataMigrationService.instance) {
      DataMigrationService.instance = new DataMigrationService();
    }
    return DataMigrationService.instance;
  }

  /**
   * Get preview of data to be migrated
   */
  async getMigrationPreview(userId: string): Promise<MigrationPreview> {
    const db = getLocalDb();
    const preview: MigrationPreview = {
      accounts: { count: 0, total: 0 },
      transactions: { count: 0, total: 0 },
      budgets: { count: 0, total: 0 },
      netWorth: { count: 0, total: 0 },
      serverDataExists: false,
    };

    // Get local data counts
    preview.accounts = await this.getTableStats(db, 'accounts_local', userId);
    preview.transactions = await this.getTableStats(db, 'transactions_local', userId);
    preview.budgets = await this.getTableStats(db, 'budget_categories_local', userId);
    preview.netWorth = await this.getTableStats(db, 'net_worth_entries_local', userId);

    // Check if server data exists
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data: accounts } = await supabase
          .from('accounts_real')
          .select('id')
          .eq('user_id', session.user.id)
          .limit(1);
        
        preview.serverDataExists = (accounts?.length || 0) > 0;
      }
    } catch (error) {
      console.error('Error checking server data:', error);
    }

    return preview;
  }

  /**
   * Get table statistics
   */
  private async getTableStats(db: any, tableName: string, userId: string): Promise<{ count: number; total: number }> {
    return new Promise((resolve) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            `SELECT COUNT(*) as count, 
                    CASE WHEN ? = 'transactions_local' THEN SUM(amount) 
                         WHEN ? = 'accounts_local' THEN SUM(current_balance)
                         WHEN ? = 'budget_categories_local' THEN SUM(budget_limit)
                         WHEN ? = 'net_worth_entries_local' THEN SUM(value)
                         ELSE 0 END as total
             FROM ${tableName}
             WHERE user_id = ? AND deleted_offline = 0`,
            [tableName, tableName, tableName, tableName, userId],
            (_, result) => {
              const row = result.rows.item(0);
              resolve({
                count: row.count || 0,
                total: row.total || 0,
              });
            },
            () => {
              resolve({ count: 0, total: 0 });
            }
          );
        }
      );
    });
  }

  /**
   * Migrate data from local to Supabase based on strategy
   */
  async migrateToPremium(
    userId: string,
    options: MigrationOptions
  ): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migrated: {
        accounts: 0,
        transactions: 0,
        budgets: 0,
        netWorth: 0,
      },
      conflicts: 0,
      errors: [],
    };

    try {
      // Verify user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('User must be authenticated to migrate data');
      }

      const supabaseUserId = session.user.id;

      // Check subscription status
      const status = await subscriptionService.checkSubscriptionStatus();
      if (!status.isPremium) {
        throw new Error('User must be premium to migrate data');
      }

      // Execute migration based on strategy
      switch (options.strategy) {
        case 'merge':
          await this.migrateMerge(supabaseUserId, userId, result, options);
          break;
        
        case 'replace':
          await this.migrateReplace(supabaseUserId, userId, result, options);
          break;
        
        case 'selective':
          await this.migrateSelective(supabaseUserId, userId, result, options);
          break;
      }

      // Update offline auth to use Supabase user ID
      await offlineAuth.migrateToAuthenticated(supabaseUserId);

      // Trigger initial sync
      await syncEngine.sync(supabaseUserId, { forceFullSync: true });

      result.success = result.errors.length === 0;
    } catch (error: any) {
      console.error('Migration error:', error);
      result.success = false;
      result.errors.push(error.message || 'Unknown migration error');
    }

    return result;
  }

  /**
   * Merge strategy: Upload local data and merge with existing Supabase data
   */
  private async migrateMerge(
    supabaseUserId: string,
    localUserId: string,
    result: MigrationResult,
    options: MigrationOptions
  ): Promise<void> {
    // Migrate accounts
    const accounts = await this.getLocalRecords('accounts_local', localUserId, options.selectedData?.accounts);
    if (accounts.length > 0) {
      try {
        const { error } = await supabase.from('accounts_real').upsert(
          accounts.map(a => ({ ...a, user_id: supabaseUserId }))
        );
        if (error) throw error;
        result.migrated.accounts = accounts.length;
      } catch (error: any) {
        result.errors.push(`Failed to migrate accounts: ${error.message}`);
      }
    }

    // Migrate transactions
    const transactions = await this.getLocalRecords('transactions_local', localUserId, options.selectedData?.transactions);
    if (transactions.length > 0) {
      try {
        const { error } = await supabase.from('transactions_real').upsert(
          transactions.map(t => ({ ...t, user_id: supabaseUserId }))
        );
        if (error) throw error;
        result.migrated.transactions = transactions.length;
      } catch (error: any) {
        result.errors.push(`Failed to migrate transactions: ${error.message}`);
      }
    }

    // Migrate budgets
    const budgets = await this.getLocalRecords('budget_categories_local', localUserId, options.selectedData?.budgets);
    if (budgets.length > 0) {
      try {
        const { error } = await supabase.from('budget_categories_real').upsert(
          budgets.map(b => ({ ...b, user_id: supabaseUserId }))
        );
        if (error) throw error;
        result.migrated.budgets = budgets.length;
      } catch (error: any) {
        result.errors.push(`Failed to migrate budgets: ${error.message}`);
      }
    }

    // Migrate net worth
    const netWorth = await this.getLocalRecords('net_worth_entries_local', localUserId, options.selectedData?.netWorth);
    if (netWorth.length > 0) {
      try {
        const { error } = await supabase.from('net_worth_entries_real').upsert(
          netWorth.map(n => ({ ...n, user_id: supabaseUserId }))
        );
        if (error) throw error;
        result.migrated.netWorth = netWorth.length;
      } catch (error: any) {
        result.errors.push(`Failed to migrate net worth: ${error.message}`);
      }
    }
  }

  /**
   * Replace strategy: Clear Supabase data and upload local data
   */
  private async migrateReplace(
    supabaseUserId: string,
    localUserId: string,
    result: MigrationResult,
    options: MigrationOptions
  ): Promise<void> {
    // Clear existing Supabase data
    try {
      await supabase.from('transactions_real').delete().eq('user_id', supabaseUserId);
      await supabase.from('accounts_real').delete().eq('user_id', supabaseUserId);
      await supabase.from('budget_categories_real').delete().eq('user_id', supabaseUserId);
      await supabase.from('net_worth_entries_real').delete().eq('user_id', supabaseUserId);
    } catch (error: any) {
      result.errors.push(`Failed to clear existing data: ${error.message}`);
    }

    // Migrate local data (same as merge)
    await this.migrateMerge(supabaseUserId, localUserId, result, options);
  }

  /**
   * Selective strategy: Migrate only selected data
   */
  private async migrateSelective(
    supabaseUserId: string,
    localUserId: string,
    result: MigrationResult,
    options: MigrationOptions
  ): Promise<void> {
    if (!options.selectedData) {
      throw new Error('Selected data required for selective migration');
    }

    // Migrate only selected accounts
    if (options.selectedData.accounts && options.selectedData.accounts.length > 0) {
      const accounts = await this.getLocalRecords('accounts_local', localUserId, options.selectedData.accounts);
      if (accounts.length > 0) {
        try {
          const { error } = await supabase.from('accounts_real').upsert(
            accounts.map(a => ({ ...a, user_id: supabaseUserId }))
          );
          if (error) throw error;
          result.migrated.accounts = accounts.length;
        } catch (error: any) {
          result.errors.push(`Failed to migrate selected accounts: ${error.message}`);
        }
      }
    }

    // Migrate only selected transactions
    if (options.selectedData.transactions && options.selectedData.transactions.length > 0) {
      const transactions = await this.getLocalRecords('transactions_local', localUserId, options.selectedData.transactions);
      if (transactions.length > 0) {
        try {
          const { error } = await supabase.from('transactions_real').upsert(
            transactions.map(t => ({ ...t, user_id: supabaseUserId }))
          );
          if (error) throw error;
          result.migrated.transactions = transactions.length;
        } catch (error: any) {
          result.errors.push(`Failed to migrate selected transactions: ${error.message}`);
        }
      }
    }

    // Similar for budgets and net worth...
  }

  /**
   * Get local records from a table
   */
  private async getLocalRecords(
    tableName: string,
    userId: string,
    selectedIds?: string[]
  ): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const db = getLocalDb();
      let sql = `SELECT * FROM ${tableName} WHERE user_id = ? AND deleted_offline = 0`;
      const params: any[] = [userId];

      if (selectedIds && selectedIds.length > 0) {
        sql += ` AND id IN (${selectedIds.map(() => '?').join(', ')})`;
        params.push(...selectedIds);
      }

      db.transaction(
        (tx) => {
          tx.executeSql(
            sql,
            params,
            (_, result) => {
              const records = [];
              for (let i = 0; i < result.rows.length; i++) {
                const row = result.rows.item(i);
                // Remove sync metadata before returning
                const { sync_status, created_offline, updated_offline, deleted_offline, last_synced_at, server_version, local_id, ...clean } = row;
                records.push(clean);
              }
              resolve(records);
            },
            (_, error) => {
              reject(error);
            }
          );
        }
      );
    });
  }
}

export default DataMigrationService.getInstance();

