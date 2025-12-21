/**
 * =============================================================================
 * NET WORTH REPOSITORY - OFFLINE-FIRST NET WORTH DATA ACCESS
 * =============================================================================
 * 
 * Implements offline-first net worth storage and retrieval using SQLite.
 * Handles categories, subcategories, and entries.
 */

import { BaseRepository, BaseFilter } from './baseRepository';
import { SyncStatus } from '../database/localSchema';
import type { NetWorthType, LinkedSourceType } from '../../types/netWorth';

export interface NetWorthCategory {
  id: string;
  name: string;
  type: NetWorthType;
  color?: string | null;
  icon?: string | null;
  description?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface NetWorthSubcategory {
  id: string;
  category_id: string;
  name: string;
  description?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface NetWorthEntry {
  id: string;
  user_id: string;
  category_id: string;
  subcategory_id: string;
  asset_name: string;
  value: number;
  quantity?: number | null;
  market_price?: number | null;
  date?: string | null;
  notes?: string | null;
  is_active?: boolean | null;
  is_included_in_net_worth?: boolean | null;
  linked_source_type?: LinkedSourceType | null;
  linked_source_id?: string | null;
  last_synced_at?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface NetWorthFilters extends BaseFilter {
  type?: NetWorthType | 'all';
  category_id?: string;
  subcategory_id?: string;
  isActive?: boolean;
  searchQuery?: string;
}

export interface NetWorthCategoryInsert {
  id?: string;
  name: string;
  type: NetWorthType;
  color?: string | null;
  icon?: string | null;
  description?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
}

export interface NetWorthCategoryUpdate extends Partial<NetWorthCategoryInsert> {
  id: string;
}

export interface NetWorthSubcategoryInsert {
  id?: string;
  category_id: string;
  name: string;
  description?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
}

export interface NetWorthSubcategoryUpdate extends Partial<NetWorthSubcategoryInsert> {
  id: string;
}

export interface NetWorthEntryInsert {
  id?: string;
  user_id: string;
  category_id: string;
  subcategory_id: string;
  asset_name: string;
  value: number;
  quantity?: number | null;
  market_price?: number | null;
  date?: string | null;
  notes?: string | null;
  is_active?: boolean | null;
  is_included_in_net_worth?: boolean | null;
  linked_source_type?: LinkedSourceType | null;
  linked_source_id?: string | null;
}

export interface NetWorthEntryUpdate extends Partial<NetWorthEntryInsert> {
  id: string;
}

export class NetWorthCategoriesRepository extends BaseRepository<
  NetWorthCategory,
  NetWorthCategoryInsert,
  NetWorthCategoryUpdate,
  BaseFilter & { type?: NetWorthType }
> {
  constructor(userId: string, isPremium: boolean = false, isOnline: boolean = false) {
    super('net_worth_categories_local', userId, isPremium, isOnline);
  }

  protected rowToEntity(row: any): NetWorthCategory {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      color: row.color,
      icon: row.icon,
      description: row.description,
      sort_order: row.sort_order,
      is_active: Boolean(row.is_active),
      created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    };
  }

  protected entityToRow(entity: NetWorthCategoryInsert | NetWorthCategoryUpdate): any {
    return {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      color: entity.color ?? null,
      icon: entity.icon ?? null,
      description: entity.description ?? null,
      sort_order: entity.sort_order ?? null,
      is_active: entity.is_active !== undefined ? (entity.is_active ? 1 : 0) : 1,
    };
  }

  protected buildWhereClause(filter: BaseFilter & { type?: NetWorthType | 'all' }): { sql: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filter.type && filter.type !== 'all') {
      conditions.push('type = ?');
      params.push(filter.type);
    }

    conditions.push('deleted_offline = 0');

    return {
      sql: conditions.join(' AND '),
      params,
    };
  }

  async findByType(type: NetWorthType): Promise<NetWorthCategory[]> {
    return this.findAll({ type });
  }
}

export class NetWorthSubcategoriesRepository extends BaseRepository<
  NetWorthSubcategory,
  NetWorthSubcategoryInsert,
  NetWorthSubcategoryUpdate,
  BaseFilter & { category_id?: string }
> {
  constructor(userId: string, isPremium: boolean = false, isOnline: boolean = false) {
    super('net_worth_subcategories_local', userId, isPremium, isOnline);
  }

  protected rowToEntity(row: any): NetWorthSubcategory {
    return {
      id: row.id,
      category_id: row.category_id,
      name: row.name,
      description: row.description,
      sort_order: row.sort_order,
      is_active: Boolean(row.is_active),
      created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    };
  }

  protected entityToRow(entity: NetWorthSubcategoryInsert | NetWorthSubcategoryUpdate): any {
    return {
      id: entity.id,
      category_id: entity.category_id,
      name: entity.name,
      description: entity.description ?? null,
      sort_order: entity.sort_order ?? null,
      is_active: entity.is_active !== undefined ? (entity.is_active ? 1 : 0) : 1,
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

  async findByCategory(categoryId: string): Promise<NetWorthSubcategory[]> {
    return this.findAll({ category_id: categoryId });
  }
}

export class NetWorthEntriesRepository extends BaseRepository<
  NetWorthEntry,
  NetWorthEntryInsert,
  NetWorthEntryUpdate,
  NetWorthFilters
> {
  constructor(userId: string, isPremium: boolean = false, isOnline: boolean = false) {
    super('net_worth_entries_local', userId, isPremium, isOnline);
  }

  protected rowToEntity(row: any): NetWorthEntry {
    return {
      id: row.id,
      user_id: row.user_id,
      category_id: row.category_id,
      subcategory_id: row.subcategory_id,
      asset_name: row.asset_name,
      value: row.value,
      quantity: row.quantity,
      market_price: row.market_price,
      date: row.date,
      notes: row.notes,
      is_active: Boolean(row.is_active),
      is_included_in_net_worth: Boolean(row.is_included_in_net_worth),
      linked_source_type: row.linked_source_type,
      linked_source_id: row.linked_source_id,
      last_synced_at: row.last_synced_at_local,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    };
  }

  protected entityToRow(entity: NetWorthEntryInsert | NetWorthEntryUpdate): any {
    return {
      id: entity.id,
      user_id: entity.user_id || this.userId,
      category_id: entity.category_id,
      subcategory_id: entity.subcategory_id,
      asset_name: entity.asset_name,
      value: entity.value,
      quantity: entity.quantity ?? null,
      market_price: entity.market_price ?? null,
      date: entity.date ?? null,
      notes: entity.notes ?? null,
      is_active: entity.is_active !== undefined ? (entity.is_active ? 1 : 0) : 1,
      is_included_in_net_worth: entity.is_included_in_net_worth !== undefined ? (entity.is_included_in_net_worth ? 1 : 0) : 1,
      linked_source_type: entity.linked_source_type ?? null,
      linked_source_id: entity.linked_source_id ?? null,
    };
  }

  protected buildWhereClause(filter: NetWorthFilters): { sql: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filter.user_id || this.userId) {
      conditions.push('user_id = ?');
      params.push(filter.user_id || this.userId);
    }

    if (filter.category_id) {
      conditions.push('category_id = ?');
      params.push(filter.category_id);
    }

    if (filter.subcategory_id) {
      conditions.push('subcategory_id = ?');
      params.push(filter.subcategory_id);
    }

    if (filter.isActive !== undefined) {
      conditions.push('is_active = ?');
      params.push(filter.isActive ? 1 : 0);
    }

    if (filter.searchQuery) {
      conditions.push('asset_name LIKE ?');
      params.push(`%${filter.searchQuery}%`);
    }

    conditions.push('deleted_offline = 0');

    return {
      sql: conditions.join(' AND '),
      params,
    };
  }

  async findByCategory(categoryId: string): Promise<NetWorthEntry[]> {
    return this.findAll({
      user_id: this.userId,
      category_id: categoryId,
    });
  }

  async findBySubcategory(subcategoryId: string): Promise<NetWorthEntry[]> {
    return this.findAll({
      user_id: this.userId,
      subcategory_id: subcategoryId,
    });
  }

  async getTotalValue(filter?: NetWorthFilters): Promise<number> {
    const db = await this.getDb();
    const where = filter ? this.buildWhereClause(filter) : { sql: 'user_id = ? AND is_included_in_net_worth = 1', params: [this.userId] };

    const sql = `
      SELECT SUM(value) as total FROM ${this.tableName}
      WHERE ${where.sql}
    `;

    try {
      const result = await db.getFirstAsync<{ total: number }>(sql, where.params);
      return result?.total || 0;
    } catch (error) {
      console.error(`Error in getTotalValue for ${this.tableName}:`, error);
      throw error;
    }
  }
}

