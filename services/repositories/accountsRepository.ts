/**
 * =============================================================================
 * ACCOUNTS REPOSITORY - OFFLINE-FIRST ACCOUNT DATA ACCESS
 * =============================================================================
 * 
 * Implements offline-first account storage and retrieval using SQLite.
 * Extends BaseRepository for unified data access pattern.
 */

import { BaseRepository, BaseFilter } from './baseRepository';
import { SyncStatus } from '../database/localSchema';

export interface Account {
  id: string;
  user_id?: string;
  name: string;
  type: string;
  balance?: number;
  institution: string | null;
  last_sync?: string | null;
  created_at?: string;
  updated_at?: string;
  account_number?: string | null;
  logo_url?: string | null;
  bank_holder_name?: string | null;
  branch_address?: string | null;
  branch_name?: string | null;
  crn?: string | null;
  currency?: string | null;
  ifsc_code?: string | null;
  micr_code?: string | null;
  initial_balance?: number;
  initial_balance_date?: string | null;
  last_transaction_date?: string | null;
  is_active?: boolean;
  current_balance?: number;
  total_expenses?: number;
  total_income?: number;
  transaction_count?: number;
}

export interface AccountFilters extends BaseFilter {
  type?: string;
  institution?: string;
  isActive?: boolean;
  searchQuery?: string;
}

export interface AccountInsert {
  id?: string;
  user_id: string;
  name: string;
  type: string;
  institution?: string | null;
  account_number?: string | null;
  logo_url?: string | null;
  bank_holder_name?: string | null;
  branch_address?: string | null;
  branch_name?: string | null;
  crn?: string | null;
  currency?: string | null;
  ifsc_code?: string | null;
  micr_code?: string | null;
  initial_balance?: number;
  initial_balance_date?: string | null;
  last_sync?: string | null;
  last_transaction_date?: string | null;
  is_active?: boolean;
  current_balance?: number;
  total_expenses?: number;
  total_income?: number;
  transaction_count?: number;
}

export interface AccountUpdate extends Partial<AccountInsert> {
  id: string;
}

export class AccountsRepository extends BaseRepository<
  Account,
  AccountInsert,
  AccountUpdate,
  AccountFilters
> {
  constructor(userId: string, isPremium: boolean = false, isOnline: boolean = false) {
    super('accounts_local', userId, isPremium, isOnline);
  }

  /**
   * Convert database row to Account entity
   */
  protected rowToEntity(row: any): Account {
    return {
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      type: row.type,
      balance: row.current_balance || row.initial_balance || 0,
      institution: row.institution,
      last_sync: row.last_sync,
      created_at: new Date(row.created_at).toISOString(),
      updated_at: new Date(row.updated_at).toISOString(),
      account_number: row.account_number,
      logo_url: row.logo_url,
      bank_holder_name: row.bank_holder_name,
      branch_address: row.branch_address,
      branch_name: row.branch_name,
      crn: row.crn,
      currency: row.currency,
      ifsc_code: row.ifsc_code,
      micr_code: row.micr_code,
      initial_balance: row.initial_balance,
      initial_balance_date: row.initial_balance_date,
      last_transaction_date: row.last_transaction_date,
      is_active: Boolean(row.is_active),
      current_balance: row.current_balance,
      total_expenses: row.total_expenses,
      total_income: row.total_income,
      transaction_count: row.transaction_count,
    };
  }

  /**
   * Convert Account entity to database row
   */
  protected entityToRow(entity: AccountInsert | AccountUpdate): any {
    return {
      id: entity.id,
      user_id: entity.user_id || this.userId,
      name: entity.name,
      type: entity.type,
      institution: entity.institution ?? null,
      account_number: entity.account_number ?? null,
      logo_url: entity.logo_url ?? null,
      bank_holder_name: entity.bank_holder_name ?? null,
      branch_address: entity.branch_address ?? null,
      branch_name: entity.branch_name ?? null,
      crn: entity.crn ?? null,
      currency: entity.currency ?? 'INR',
      ifsc_code: entity.ifsc_code ?? null,
      micr_code: entity.micr_code ?? null,
      initial_balance: entity.initial_balance ?? 0,
      initial_balance_date: entity.initial_balance_date ?? null,
      last_sync: entity.last_sync ?? null,
      last_transaction_date: entity.last_transaction_date ?? null,
      is_active: entity.is_active !== undefined ? (entity.is_active ? 1 : 0) : 1,
      current_balance: entity.current_balance ?? 0,
      total_expenses: entity.total_expenses ?? 0,
      total_income: entity.total_income ?? 0,
      transaction_count: entity.transaction_count ?? 0,
    };
  }

  /**
   * Build WHERE clause from AccountFilters
   */
  protected buildWhereClause(filter: AccountFilters): { sql: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];

    // Always filter by user_id
    if (filter.user_id || this.userId) {
      conditions.push('user_id = ?');
      params.push(filter.user_id || this.userId);
    }

    // Filter by type
    if (filter.type) {
      conditions.push('type = ?');
      params.push(filter.type);
    }

    // Filter by institution
    if (filter.institution) {
      conditions.push('institution = ?');
      params.push(filter.institution);
    }

    // Filter by active status
    if (filter.isActive !== undefined) {
      conditions.push('is_active = ?');
      params.push(filter.isActive ? 1 : 0);
    }

    // Search query (name, account_number, institution)
    if (filter.searchQuery) {
      conditions.push('(name LIKE ? OR account_number LIKE ? OR institution LIKE ?)');
      const searchTerm = `%${filter.searchQuery}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Exclude deleted records
    conditions.push('deleted_offline = 0');

    return {
      sql: conditions.join(' AND '),
      params,
    };
  }

  /**
   * Find accounts by institution
   */
  async findByInstitution(institution: string): Promise<Account[]> {
    return this.findAll({
      user_id: this.userId,
      institution,
    });
  }

  /**
   * Find accounts by type
   */
  async findByType(type: string): Promise<Account[]> {
    return this.findAll({
      user_id: this.userId,
      type,
    });
  }

  /**
   * Get active accounts only
   */
  async findActive(): Promise<Account[]> {
    return this.findAll({
      user_id: this.userId,
      isActive: true,
    });
  }

  /**
   * Update account balance
   */
  async updateBalance(accountId: string, balance: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE ${this.tableName}
        SET current_balance = ?,
            updated_at = ?,
            updated_offline = 1,
            sync_status = ?
        WHERE id = ? AND user_id = ?
      `;

      this.db.transaction(
        (tx) => {
          tx.executeSql(
            sql,
            [
              balance,
              Date.now(),
              this.isPremium ? SyncStatus.PENDING : SyncStatus.LOCAL_ONLY,
              accountId,
              this.userId,
            ],
            (_, result) => {
              if (result.rowsAffected === 0) {
                reject(new Error(`Account with id ${accountId} not found`));
                return;
              }
              
              // Queue sync job if premium
              if (this.isPremium) {
                this.enqueueSyncJob('update', accountId, { current_balance: balance });
              }
              
              resolve();
            },
            (_, error) => {
              console.error(`Error updating balance for ${this.tableName}:`, error);
              reject(error);
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  /**
   * Get total balance across all accounts
   */
  async getTotalBalance(): Promise<number> {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT SUM(current_balance) as total FROM ${this.tableName}
        WHERE user_id = ? AND deleted_offline = 0 AND is_active = 1
      `;

      this.db.transaction(
        (tx) => {
          tx.executeSql(
            sql,
            [this.userId],
            (_, result) => {
              const total = result.rows.item(0).total || 0;
              resolve(total);
            },
            (_, error) => {
              console.error(`Error in getTotalBalance for ${this.tableName}:`, error);
              reject(error);
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  }
}

