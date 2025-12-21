/**
 * =============================================================================
 * CREDIT CARDS REPOSITORY - OFFLINE-FIRST CREDIT CARD DATA ACCESS
 * =============================================================================
 * 
 * Implements offline-first credit card storage and retrieval using SQLite.
 * Extends BaseRepository for unified data access pattern.
 */

import { BaseRepository, BaseFilter, DEFAULT_PAGE_SIZE } from './baseRepository';
import { SyncStatus } from '../database/localSchema';

export interface CreditCard {
  id: string;
  user_id: string;
  name: string;
  institution: string;
  last_four_digits: number;
  credit_limit: number;
  current_balance: number;
  billing_cycle?: string | null;
  due_date?: string | null;
  logo_url?: string | null;
  sync_status?: SyncStatus;
  created_offline?: boolean;
  updated_offline?: boolean;
  deleted_offline?: boolean;
  last_synced_at?: number;
  server_version?: number;
  created_at?: number;
  updated_at?: number;
}

export interface CreditCardFilters extends BaseFilter {
  institution?: string;
  minUtilization?: number;
  maxUtilization?: number;
  dueDateBefore?: string; // ISO date string
  dueDateAfter?: string; // ISO date string
  searchQuery?: string;
}

export interface CreditCardInsert {
  id?: string;
  user_id: string;
  name: string;
  institution: string;
  last_four_digits: number;
  credit_limit: number;
  current_balance: number;
  billing_cycle?: string | null;
  due_date?: string | null;
  logo_url?: string | null;
}

export interface CreditCardUpdate extends Partial<CreditCardInsert> {
  id: string;
}

export class CreditCardsRepository extends BaseRepository<
  CreditCard,
  CreditCardInsert,
  CreditCardUpdate,
  CreditCardFilters
> {
  constructor(userId: string, isPremium: boolean = false, isOnline: boolean = false) {
    super('credit_cards_local', userId, isPremium, isOnline);
  }

  /**
   * Convert database row to CreditCard entity
   */
  protected rowToEntity(row: any): CreditCard {
    return {
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      institution: row.institution,
      last_four_digits: row.last_four_digits,
      credit_limit: row.credit_limit,
      current_balance: row.current_balance,
      billing_cycle: row.billing_cycle,
      due_date: row.due_date,
      logo_url: row.logo_url,
      sync_status: row.sync_status as SyncStatus,
      created_offline: Boolean(row.created_offline),
      updated_offline: Boolean(row.updated_offline),
      deleted_offline: Boolean(row.deleted_offline),
      last_synced_at: row.last_synced_at,
      server_version: row.server_version,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  /**
   * Convert CreditCard entity to database row
   */
  protected entityToRow(entity: CreditCardInsert | CreditCardUpdate): any {
    const row: any = {
      id: entity.id,
      user_id: entity.user_id || this.userId,
      name: entity.name,
      institution: entity.institution,
      last_four_digits: entity.last_four_digits,
      credit_limit: entity.credit_limit,
      current_balance: entity.current_balance,
      billing_cycle: entity.billing_cycle ?? null,
      due_date: entity.due_date ?? null,
      logo_url: entity.logo_url ?? null,
    };

    // Remove undefined values
    Object.keys(row).forEach(key => {
      if (row[key] === undefined) {
        delete row[key];
      }
    });

    return row;
  }

  /**
   * Build WHERE clause from filter
   */
  protected buildWhereClause(filter: CreditCardFilters): { sql: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];

    // Always filter by user_id
    if (filter.user_id) {
      conditions.push('user_id = ?');
      params.push(filter.user_id);
    } else {
      conditions.push('user_id = ?');
      params.push(this.userId);
    }

    // Filter out deleted records
    conditions.push('deleted_offline = 0');

    // Institution filter
    if (filter.institution) {
      conditions.push('institution = ?');
      params.push(filter.institution);
    }

    // Utilization filters (calculated from current_balance / credit_limit)
    if (filter.minUtilization !== undefined || filter.maxUtilization !== undefined) {
      const utilizationCondition = '(CAST(current_balance AS REAL) / NULLIF(credit_limit, 0)) * 100';
      
      if (filter.minUtilization !== undefined && filter.maxUtilization !== undefined) {
        conditions.push(`${utilizationCondition} BETWEEN ? AND ?`);
        params.push(filter.minUtilization, filter.maxUtilization);
      } else if (filter.minUtilization !== undefined) {
        conditions.push(`${utilizationCondition} >= ?`);
        params.push(filter.minUtilization);
      } else if (filter.maxUtilization !== undefined) {
        conditions.push(`${utilizationCondition} <= ?`);
        params.push(filter.maxUtilization);
      }
    }

    // Due date filters
    if (filter.dueDateBefore) {
      conditions.push('due_date <= ?');
      params.push(filter.dueDateBefore);
    }
    if (filter.dueDateAfter) {
      conditions.push('due_date >= ?');
      params.push(filter.dueDateAfter);
    }

    // Search query (name or institution)
    if (filter.searchQuery) {
      conditions.push('(name LIKE ? OR institution LIKE ?)');
      const searchPattern = `%${filter.searchQuery}%`;
      params.push(searchPattern, searchPattern);
    }

    return {
      sql: conditions.join(' AND '),
      params,
    };
  }

  /**
   * Get credit cards with high utilization (>70%)
   */
  async findHighUtilization(threshold: number = 70): Promise<CreditCard[]> {
    return this.findAll({
      minUtilization: threshold,
      orderBy: 'credit_limit',
      orderDirection: 'DESC',
    });
  }

  /**
   * Get credit cards with upcoming due dates (next N days)
   */
  async findUpcomingDueDates(days: number = 7): Promise<CreditCard[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    return this.findAll({
      dueDateAfter: today.toISOString().split('T')[0],
      dueDateBefore: futureDate.toISOString().split('T')[0],
      orderBy: 'due_date',
      orderDirection: 'ASC',
    });
  }

  /**
   * Calculate total credit limit across all cards
   */
  async getTotalCreditLimit(): Promise<number> {
    const db = await this.getDb();
    const sql = `
      SELECT SUM(credit_limit) as total
      FROM ${this.tableName}
      WHERE user_id = ? AND deleted_offline = 0
    `;

    try {
      const result = await db.getFirstAsync<{ total: number | null }>(sql, [this.userId]);
      return result?.total || 0;
    } catch (error) {
      console.error('Error calculating total credit limit:', error);
      return 0;
    }
  }

  /**
   * Calculate total current balance across all cards
   */
  async getTotalCurrentBalance(): Promise<number> {
    const db = await this.getDb();
    const sql = `
      SELECT SUM(current_balance) as total
      FROM ${this.tableName}
      WHERE user_id = ? AND deleted_offline = 0
    `;

    try {
      const result = await db.getFirstAsync<{ total: number | null }>(sql, [this.userId]);
      return result?.total || 0;
    } catch (error) {
      console.error('Error calculating total current balance:', error);
      return 0;
    }
  }

  /**
   * Calculate average utilization across all cards
   */
  async getAverageUtilization(): Promise<number> {
    const db = await this.getDb();
    const sql = `
      SELECT 
        AVG(CAST(current_balance AS REAL) / NULLIF(credit_limit, 0)) * 100 as avg_utilization
      FROM ${this.tableName}
      WHERE user_id = ? AND deleted_offline = 0 AND credit_limit > 0
    `;

    try {
      const result = await db.getFirstAsync<{ avg_utilization: number | null }>(sql, [this.userId]);
      return result?.avg_utilization || 0;
    } catch (error) {
      console.error('Error calculating average utilization:', error);
      return 0;
    }
  }
}


