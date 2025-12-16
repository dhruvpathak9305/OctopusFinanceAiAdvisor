/**
 * =============================================================================
 * BUDGET REPOSITORY - OFFLINE-FIRST BUDGET DATA ACCESS
 * =============================================================================
 * 
 * Implements offline-first budget storage and retrieval using SQLite.
 * Handles budget categories and subcategories.
 */

import { BaseRepository, BaseFilter } from './baseRepository';
import { SyncStatus } from '../database/localSchema';

export interface BudgetCategory {
  id: string;
  user_id?: string | null;
  name: string;
  budget_limit: number;
  ring_color: string;
  bg_color: string;
  category_type?: string;
  description?: string | null;
  display_order?: number | null;
  frequency?: string | null;
  start_date?: string | null;
  status?: string | null;
  strategy?: string | null;
  is_active?: string | null;
  percentage?: number | null;
  icon?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetSubcategory {
  id: string;
  category_id: string;
  name: string;
  amount: number;
  color: string;
  icon: string;
  budget_limit?: number | null;
  current_spend?: number | null;
  description?: string | null;
  display_order?: number | null;
  is_active?: boolean | null;
  transaction_category_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetFilters extends BaseFilter {
  category_type?: string;
  isActive?: boolean;
  searchQuery?: string;
}

export interface BudgetCategoryInsert {
  id?: string;
  user_id?: string | null;
  name: string;
  budget_limit: number;
  ring_color: string;
  bg_color: string;
  category_type?: string;
  description?: string | null;
  display_order?: number | null;
  frequency?: string | null;
  start_date?: string | null;
  status?: string | null;
  strategy?: string | null;
  is_active?: string | null;
  percentage?: number | null;
  icon?: string | null;
}

export interface BudgetCategoryUpdate extends Partial<BudgetCategoryInsert> {
  id: string;
}

export interface BudgetSubcategoryInsert {
  id?: string;
  category_id: string;
  name: string;
  amount: number;
  color: string;
  icon: string;
  budget_limit?: number | null;
  current_spend?: number | null;
  description?: string | null;
  display_order?: number | null;
  is_active?: boolean | null;
  transaction_category_id?: string | null;
}

export interface BudgetSubcategoryUpdate extends Partial<BudgetSubcategoryInsert> {
  id: string;
}

export class BudgetCategoriesRepository extends BaseRepository<
  BudgetCategory,
  BudgetCategoryInsert,
  BudgetCategoryUpdate,
  BudgetFilters
> {
  constructor(userId: string, isPremium: boolean = false, isOnline: boolean = false) {
    super('budget_categories_local', userId, isPremium, isOnline);
  }

  protected rowToEntity(row: any): BudgetCategory {
    return {
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      budget_limit: row.budget_limit,
      ring_color: row.ring_color,
      bg_color: row.bg_color,
      category_type: row.category_type,
      description: row.description,
      display_order: row.display_order,
      frequency: row.frequency,
      start_date: row.start_date,
      status: row.status,
      strategy: row.strategy,
      is_active: row.is_active,
      percentage: row.percentage,
      icon: row.icon,
      created_at: new Date(row.created_at).toISOString(),
      updated_at: new Date(row.updated_at).toISOString(),
    };
  }

  protected entityToRow(entity: BudgetCategoryInsert | BudgetCategoryUpdate): any {
    return {
      id: entity.id,
      user_id: entity.user_id || this.userId || null,
      name: entity.name,
      budget_limit: entity.budget_limit,
      ring_color: entity.ring_color,
      bg_color: entity.bg_color,
      category_type: entity.category_type ?? null,
      description: entity.description ?? null,
      display_order: entity.display_order ?? null,
      frequency: entity.frequency ?? null,
      start_date: entity.start_date ?? null,
      status: entity.status ?? null,
      strategy: entity.strategy ?? null,
      is_active: entity.is_active ?? null,
      percentage: entity.percentage ?? null,
      icon: entity.icon ?? null,
    };
  }

  protected buildWhereClause(filter: BudgetFilters): { sql: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filter.user_id || this.userId) {
      conditions.push('(user_id = ? OR user_id IS NULL)');
      params.push(filter.user_id || this.userId);
    }

    if (filter.category_type) {
      conditions.push('category_type = ?');
      params.push(filter.category_type);
    }

    if (filter.isActive !== undefined) {
      conditions.push('is_active = ?');
      params.push(filter.isActive ? 'true' : 'false');
    }

    if (filter.searchQuery) {
      conditions.push('name LIKE ?');
      params.push(`%${filter.searchQuery}%`);
    }

    conditions.push('deleted_offline = 0');

    return {
      sql: conditions.join(' AND '),
      params,
    };
  }
}

export class BudgetSubcategoriesRepository extends BaseRepository<
  BudgetSubcategory,
  BudgetSubcategoryInsert,
  BudgetSubcategoryUpdate,
  BaseFilter & { category_id?: string }
> {
  constructor(userId: string, isPremium: boolean = false, isOnline: boolean = false) {
    super('budget_subcategories_local', userId, isPremium, isOnline);
  }

  protected rowToEntity(row: any): BudgetSubcategory {
    return {
      id: row.id,
      category_id: row.category_id,
      name: row.name,
      amount: row.amount,
      color: row.color,
      icon: row.icon,
      budget_limit: row.budget_limit,
      current_spend: row.current_spend,
      description: row.description,
      display_order: row.display_order,
      is_active: Boolean(row.is_active),
      transaction_category_id: row.transaction_category_id,
      created_at: new Date(row.created_at).toISOString(),
      updated_at: new Date(row.updated_at).toISOString(),
    };
  }

  protected entityToRow(entity: BudgetSubcategoryInsert | BudgetSubcategoryUpdate): any {
    return {
      id: entity.id,
      category_id: entity.category_id,
      name: entity.name,
      amount: entity.amount,
      color: entity.color,
      icon: entity.icon,
      budget_limit: entity.budget_limit ?? null,
      current_spend: entity.current_spend ?? null,
      description: entity.description ?? null,
      display_order: entity.display_order ?? null,
      is_active: entity.is_active !== undefined ? (entity.is_active ? 1 : 0) : 1,
      transaction_category_id: entity.transaction_category_id ?? null,
    };
  }

  protected buildWhereClause(filter: BaseFilter & { category_id?: string }): { sql: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filter.category_id) {
      conditions.push('category_id = ?');
      params.push(filter.category_id);
    }

    conditions.push('deleted_offline = 0');

    return {
      sql: conditions.join(' AND '),
      params,
    };
  }

  /**
   * Find subcategories by category ID
   */
  async findByCategory(categoryId: string): Promise<BudgetSubcategory[]> {
    return this.findAll({
      category_id: categoryId,
    });
  }
}

