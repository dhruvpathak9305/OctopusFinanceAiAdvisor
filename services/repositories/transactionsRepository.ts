/**
 * =============================================================================
 * TRANSACTIONS REPOSITORY - OFFLINE-FIRST TRANSACTION DATA ACCESS
 * =============================================================================
 * 
 * Implements offline-first transaction storage and retrieval using SQLite.
 * Extends BaseRepository for unified data access pattern.
 */

import { LocalDB } from '../localDb';
import { BaseRepository, BaseFilter } from './baseRepository';
import { Transaction } from '../../types/transactions';
import { SyncStatus } from '../database/localSchema';

export interface TransactionFilters extends BaseFilter {
  type?: 'income' | 'expense' | 'transfer' | 'loan' | 'loan_repayment' | 'debt' | 'debt_collection' | 'all';
  dateRange?: {
    start: Date;
    end: Date;
  };
  amountRange?: {
    min?: number;
    max?: number;
  };
  institution?: string;
  category?: string;
  subcategory?: string;
  accountId?: string;
  destinationAccountId?: string;
  isCreditCard?: boolean;
  searchQuery?: string;
}

export interface TransactionInsert {
  id?: string;
  user_id: string;
  name: string;
  description?: string | null;
  amount: number;
  date: string;
  type: Transaction['type'];
  category_id?: string | null;
  subcategory_id?: string | null;
  icon?: string | null;
  merchant?: string | null;
  source_account_id?: string | null;
  source_account_type: string;
  source_account_name?: string | null;
  destination_account_id?: string | null;
  destination_account_type?: string | null;
  destination_account_name?: string | null;
  is_recurring?: boolean;
  recurrence_pattern?: string | null;
  recurrence_end_date?: string | null;
  parent_transaction_id?: string | null;
  interest_rate?: number | null;
  loan_term_months?: number | null;
  metadata?: Record<string, any> | null;
  is_credit_card?: boolean;
}

export interface TransactionUpdate extends Partial<TransactionInsert> {
  id: string;
}

export type LocalTransaction = Transaction & {
  sync_status?: SyncStatus;
  created_offline?: boolean;
  updated_offline?: boolean;
  deleted_offline?: boolean;
  last_synced_at?: number;
  server_version?: number;
};

export class TransactionsRepository extends BaseRepository<
  Transaction,
  TransactionInsert,
  TransactionUpdate,
  TransactionFilters
> {
  constructor(userId: string, isPremium: boolean = false, isOnline: boolean = false) {
    super('transactions_local', userId, isPremium, isOnline);
  }

  /**
   * Convert database row to Transaction entity
   */
  protected rowToEntity(row: any): Transaction {
    return {
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      description: row.description,
      amount: row.amount,
      date: row.date,
      type: row.type,
      category_id: row.category_id,
      subcategory_id: row.subcategory_id,
      icon: row.icon,
      merchant: row.merchant,
      source_account_id: row.source_account_id,
      source_account_type: row.source_account_type,
      source_account_name: row.source_account_name,
      destination_account_id: row.destination_account_id,
      destination_account_type: row.destination_account_type,
      destination_account_name: row.destination_account_name,
      is_recurring: Boolean(row.is_recurring),
      recurrence_pattern: row.recurrence_pattern,
      recurrence_end_date: row.recurrence_end_date,
      parent_transaction_id: row.parent_transaction_id,
      interest_rate: row.interest_rate,
      loan_term_months: row.loan_term_months,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
      is_credit_card: Boolean(row.is_credit_card),
      created_at: new Date(row.created_at).toISOString(),
    };
  }

  /**
   * Convert Transaction entity to database row
   */
  protected entityToRow(entity: TransactionInsert | TransactionUpdate): any {
    return {
      id: entity.id,
      user_id: entity.user_id || this.userId,
      name: entity.name,
      description: entity.description ?? null,
      amount: entity.amount,
      date: entity.date,
      type: entity.type,
      category_id: entity.category_id ?? null,
      subcategory_id: entity.subcategory_id ?? null,
      icon: entity.icon ?? null,
      merchant: entity.merchant ?? null,
      source_account_id: entity.source_account_id ?? null,
      source_account_type: entity.source_account_type,
      source_account_name: entity.source_account_name ?? null,
      destination_account_id: entity.destination_account_id ?? null,
      destination_account_type: entity.destination_account_type ?? null,
      destination_account_name: entity.destination_account_name ?? null,
      is_recurring: entity.is_recurring ? 1 : 0,
      recurrence_pattern: entity.recurrence_pattern ?? null,
      recurrence_end_date: entity.recurrence_end_date ?? null,
      parent_transaction_id: entity.parent_transaction_id ?? null,
      interest_rate: entity.interest_rate ?? null,
      loan_term_months: entity.loan_term_months ?? null,
      metadata: entity.metadata ? JSON.stringify(entity.metadata) : null,
      is_credit_card: entity.is_credit_card ? 1 : 0,
    };
  }

  /**
   * Build WHERE clause from TransactionFilters
   */
  protected buildWhereClause(filter: TransactionFilters): { sql: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];

    // Always filter by user_id
    if (filter.user_id || this.userId) {
      conditions.push('user_id = ?');
      params.push(filter.user_id || this.userId);
    }

    // Filter by type
    if (filter.type && filter.type !== 'all') {
      conditions.push('type = ?');
      params.push(filter.type);
    }

    // Filter by date range
    if (filter.dateRange) {
      conditions.push('date >= ?');
      params.push(filter.dateRange.start.toISOString().split('T')[0]);
      conditions.push('date <= ?');
      params.push(filter.dateRange.end.toISOString().split('T')[0]);
    }

    // Filter by amount range
    if (filter.amountRange) {
      if (filter.amountRange.min !== undefined) {
        conditions.push('amount >= ?');
        params.push(filter.amountRange.min);
      }
      if (filter.amountRange.max !== undefined) {
        conditions.push('amount <= ?');
        params.push(filter.amountRange.max);
      }
    }

    // Filter by institution (via source_account_name or destination_account_name)
    if (filter.institution) {
      conditions.push('(source_account_name LIKE ? OR destination_account_name LIKE ?)');
      params.push(`%${filter.institution}%`, `%${filter.institution}%`);
    }

    // Filter by category
    if (filter.category) {
      conditions.push('category_id = ?');
      params.push(filter.category);
    }

    // Filter by subcategory
    if (filter.subcategory) {
      conditions.push('subcategory_id = ?');
      params.push(filter.subcategory);
    }

    // Filter by account
    if (filter.accountId) {
      conditions.push('source_account_id = ?');
      params.push(filter.accountId);
    }

    // Filter by destination account
    if (filter.destinationAccountId) {
      conditions.push('destination_account_id = ?');
      params.push(filter.destinationAccountId);
    }

    // Filter by credit card
    if (filter.isCreditCard !== undefined) {
      conditions.push('is_credit_card = ?');
      params.push(filter.isCreditCard ? 1 : 0);
    }

    // Search query (name, description, merchant)
    if (filter.searchQuery) {
      conditions.push('(name LIKE ? OR description LIKE ? OR merchant LIKE ?)');
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
   * Find transactions by account ID (handles both source and destination)
   */
  async findByAccount(accountId: string): Promise<Transaction[]> {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM ${this.tableName}
        WHERE (source_account_id = ? OR destination_account_id = ?)
          AND user_id = ?
          AND deleted_offline = 0
        ORDER BY date DESC
      `;

      this.db.transaction(
        (tx) => {
        tx.executeSql(
            sql,
            [accountId, accountId, this.userId],
          (_, result) => {
            const rows = [];
            for (let i = 0; i < result.rows.length; i++) {
                rows.push(this.rowToEntity(result.rows.item(i)));
              }
              resolve(rows);
            },
            (_, error) => {
              console.error(`Error in findByAccount for ${this.tableName}:`, error);
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
   * Get transactions for a specific date range
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return this.findAll({
      user_id: this.userId,
      dateRange: { start: startDate, end: endDate },
      orderBy: 'date',
      orderDirection: 'DESC',
    });
  }

  /**
   * Get transactions by category
   */
  async findByCategory(categoryId: string): Promise<Transaction[]> {
    return this.findAll({
      user_id: this.userId,
      category: categoryId,
      orderBy: 'date',
      orderDirection: 'DESC',
    });
  }

  /**
   * Get transactions by type
   */
  async findByType(type: Transaction['type']): Promise<Transaction[]> {
    return this.findAll({
      user_id: this.userId,
      type,
      orderBy: 'date',
      orderDirection: 'DESC',
    });
  }

  /**
   * Get total amount for a filter
   */
  async getTotalAmount(filter?: TransactionFilters): Promise<number> {
    const db = await this.getDb();
    const where = filter ? this.buildWhereClause(filter) : { sql: 'user_id = ?', params: [this.userId] };

    const sql = `
      SELECT SUM(amount) as total FROM ${this.tableName}
      WHERE ${where.sql}
    `;

    try {
      const result = await db.getFirstAsync<{ total: number | null }>(sql, where.params);
      return result?.total || 0;
    } catch (error) {
      console.error(`Error in getTotalAmount for ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  static async getPendingSync(): Promise<LocalTransaction[]> {
    // This will be handled by the instance method
    // For now, return empty array
    return [];
  }
}
