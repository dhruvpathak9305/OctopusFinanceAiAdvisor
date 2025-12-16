/**
 * =============================================================================
 * BASE REPOSITORY - UNIFIED DATA ACCESS LAYER
 * =============================================================================
 * 
 * Provides a unified interface for local/remote data operations.
 * Implements offline-first pattern: always read from local, write to local first,
 * then sync to remote if user is premium and online.
 */

import { LocalDB } from '../localDb';
import { SyncStatus } from '../database/localSchema';

/**
 * Base filter interface for queries
 */
export interface BaseFilter {
  user_id?: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

/**
 * Sync metadata for records
 */
export interface SyncMetadata {
  sync_status: SyncStatus;
  created_offline: boolean;
  updated_offline: boolean;
  deleted_offline: boolean;
  last_synced_at?: number;
  server_version: number;
}

/**
 * Base repository interface
 */
export interface IRepository<T, TInsert, TUpdate, TFilter extends BaseFilter> {
  /**
   * Find all records matching the filter
   */
  findAll(filter?: TFilter): Promise<T[]>;

  /**
   * Find a single record by ID
   */
  findById(id: string): Promise<T | null>;

  /**
   * Create a new record
   */
  create(data: TInsert): Promise<T>;

  /**
   * Update an existing record
   */
  update(id: string, data: TUpdate): Promise<T>;

  /**
   * Delete a record (soft delete by default)
   */
  delete(id: string): Promise<void>;

  /**
   * Count records matching the filter
   */
  count(filter?: TFilter): Promise<number>;

  /**
   * Get pending sync records
   */
  getPendingSync(): Promise<T[]>;
}

/**
 * Base repository implementation
 */
export abstract class BaseRepository<T, TInsert, TUpdate, TFilter extends BaseFilter>
  implements IRepository<T, TInsert, TUpdate, TFilter>
{
  protected db: LocalDB | null = null;
  protected tableName: string;
  protected isPremium: boolean;
  protected isOnline: boolean;
  protected userId: string;
  private dbPromise: Promise<LocalDB> | null = null;

  constructor(
    tableName: string,
    userId: string,
    isPremium: boolean = false,
    isOnline: boolean = false
  ) {
    this.tableName = tableName;
    this.userId = userId;
    this.isPremium = isPremium;
    this.isOnline = isOnline;
  }

  /**
   * Get database instance (lazy initialization)
   */
  protected async getDb(): Promise<LocalDB> {
    if (this.db) {
      return this.db;
    }

    if (!this.dbPromise) {
      const { getLocalDb } = await import('../localDb');
      this.dbPromise = getLocalDb();
    }

    this.db = await this.dbPromise;
    return this.db;
  }

  /**
   * Update repository state (for when subscription/network status changes)
   */
  updateState(isPremium: boolean, isOnline: boolean, userId?: string): void {
    this.isPremium = isPremium;
    this.isOnline = isOnline;
    if (userId) {
      this.userId = userId;
    }
  }

  /**
   * Convert database row to entity
   */
  protected abstract rowToEntity(row: any): T;

  /**
   * Convert entity to database row
   */
  protected abstract entityToRow(entity: TInsert | TUpdate): any;

  /**
   * Build WHERE clause from filter
   */
  protected abstract buildWhereClause(filter: TFilter): { sql: string; params: any[] };

  /**
   * Get sync metadata for a record
   */
  protected getSyncMetadata(isNew: boolean = false): Partial<SyncMetadata> {
    const now = Date.now();
    
    if (!this.isPremium) {
      return {
        sync_status: SyncStatus.LOCAL_ONLY,
        created_offline: isNew ? 1 : 0,
        updated_offline: isNew ? 0 : 1,
        deleted_offline: 0,
        server_version: 0,
      };
    }

    return {
      sync_status: SyncStatus.PENDING,
      created_offline: isNew ? 1 : 0,
      updated_offline: isNew ? 0 : 1,
      deleted_offline: 0,
      server_version: 0,
    };
  }

  /**
   * Find all records matching the filter
   */
  async findAll(filter?: TFilter): Promise<T[]> {
    const db = await this.getDb();
    const where = filter ? this.buildWhereClause(filter) : { sql: '', params: [] };
    const orderBy = filter?.orderBy 
      ? `ORDER BY ${filter.orderBy} ${filter.orderDirection || 'ASC'}` 
      : '';
    const limit = filter?.limit ? `LIMIT ${filter.limit}` : '';
    const offset = filter?.offset ? `OFFSET ${filter.offset}` : '';

    const sql = `
      SELECT * FROM ${this.tableName}
      ${where.sql ? `WHERE ${where.sql}` : ''}
      ${orderBy}
      ${limit}
      ${offset}
    `;

    try {
      const result = await db.getAllAsync<any>(sql, where.params);
      const rows = result.map(row => this.rowToEntity(row));
      
      // Trigger background sync if premium and online
      if (this.isPremium && this.isOnline) {
        this.scheduleSync();
      }
      
      return rows;
    } catch (error) {
      console.error(`Error in findAll for ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Find a single record by ID
   */
  async findById(id: string): Promise<T | null> {
    const db = await this.getDb();
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ? LIMIT 1`;

    try {
      const result = await db.getFirstAsync<any>(sql, [id]);
      if (!result) {
        return null;
      }
      return this.rowToEntity(result);
    } catch (error) {
      console.error(`Error in findById for ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Create a new record
   */
  async create(data: TInsert): Promise<T> {
    const db = await this.getDb();
    const row = this.entityToRow(data);
    const syncMeta = this.getSyncMetadata(true);
    const now = Date.now();
    
    // Generate ID if not provided
    if (!row.id) {
      row.id = this.generateId();
    }
    
    // Set sync metadata
    Object.assign(row, syncMeta, {
      created_at: now,
      updated_at: now,
      user_id: this.userId,
    });

    const columns = Object.keys(row);
    const values = Object.values(row);
    const placeholders = columns.map(() => '?').join(', ');

    const sql = `
      INSERT INTO ${this.tableName} (${columns.join(', ')})
      VALUES (${placeholders})
    `;

    try {
      await db.runAsync(sql, values);
      
      // Queue sync job if premium
      if (this.isPremium) {
        await this.enqueueSyncJob('create', row.id, row);
      }
      
      // Fetch and return the created record
      return await this.findById(row.id);
    } catch (error) {
      console.error(`Error in create for ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing record
   */
  async update(id: string, data: TUpdate): Promise<T> {
    const db = await this.getDb();
    const row = this.entityToRow(data);
    const syncMeta = this.getSyncMetadata(false);
    const now = Date.now();
    
    // Set sync metadata
    Object.assign(row, syncMeta, {
      updated_at: now,
    });

    const updates = Object.keys(row)
      .filter(key => key !== 'id')
      .map(key => `${key} = ?`);
    const values = Object.values(row).filter((_, idx) => Object.keys(row)[idx] !== 'id');
    values.push(id);

    const sql = `
      UPDATE ${this.tableName}
      SET ${updates.join(', ')}
      WHERE id = ?
    `;

    try {
      const result = await db.runAsync(sql, values);
      
      if (result.changes === 0) {
        throw new Error(`Record with id ${id} not found`);
      }
      
      // Queue sync job if premium
      if (this.isPremium) {
        await this.enqueueSyncJob('update', id, row);
      }
      
      // Fetch and return the updated record
      return await this.findById(id);
    } catch (error) {
      console.error(`Error in update for ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a record (soft delete by default)
   */
  async delete(id: string): Promise<void> {
    const db = await this.getDb();
    // Soft delete: mark as deleted_offline
    const sql = `
      UPDATE ${this.tableName}
      SET deleted_offline = 1,
          sync_status = ?,
          updated_at = ?
      WHERE id = ?
    `;

    try {
      const result = await db.runAsync(sql, [
        this.isPremium ? SyncStatus.PENDING : SyncStatus.LOCAL_ONLY,
        Date.now(),
        id
      ]);
      
      if (result.changes === 0) {
        throw new Error(`Record with id ${id} not found`);
      }
      
      // Queue sync job if premium
      if (this.isPremium) {
        await this.enqueueSyncJob('delete', id, {});
      }
    } catch (error) {
      console.error(`Error in delete for ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Count records matching the filter
   */
  async count(filter?: TFilter): Promise<number> {
    const db = await this.getDb();
    const where = filter ? this.buildWhereClause(filter) : { sql: '', params: [] };

    const sql = `
      SELECT COUNT(*) as count FROM ${this.tableName}
      ${where.sql ? `WHERE ${where.sql}` : ''}
    `;

    try {
      const result = await db.getFirstAsync<{ count: number }>(sql, where.params);
      return result?.count || 0;
    } catch (error) {
      console.error(`Error in count for ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Get pending sync records
   */
  async getPendingSync(): Promise<T[]> {
    const db = await this.getDb();
    const sql = `
      SELECT * FROM ${this.tableName}
      WHERE sync_status = ? AND deleted_offline = 0
      ORDER BY updated_at ASC
    `;

    try {
      const result = await db.getAllAsync<any>(sql, [SyncStatus.PENDING]);
      return result.map(row => this.rowToEntity(row));
    } catch (error) {
      console.error(`Error in getPendingSync for ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Generate a unique ID for local records
   */
  protected generateId(): string {
    // Generate UUID-like ID for local records
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Enqueue a sync job
   */
  protected async enqueueSyncJob(operation: 'create' | 'update' | 'delete', recordId: string, payload: any): Promise<void> {
    const db = await this.getDb();
    const sql = `
      INSERT INTO sync_jobs (type, table_name, record_id, operation, payload, status, created_at, updated_at, scheduled_at)
      VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)
    `;

    try {
      await db.runAsync(sql, [
        `${this.tableName}_${operation}`,
        this.tableName,
        recordId,
        operation,
        JSON.stringify(payload),
        Date.now(),
        Date.now(),
        Date.now(),
      ]);
    } catch (error) {
      console.error(`Error enqueueing sync job for ${this.tableName}:`, error);
      // Don't throw - sync job failure shouldn't break the main operation
    }
  }

  /**
   * Schedule background sync (to be implemented by sync engine)
   */
  protected scheduleSync(): void {
    // Trigger sync engine to process sync queue
    const syncEngine = require('../sync/syncEngine').default;
    syncEngine.scheduleSync(this.tableName);
  }
}

