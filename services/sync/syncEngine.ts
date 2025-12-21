/**
 * =============================================================================
 * SYNC ENGINE - COMPLETE PUSH/PULL SYNC IMPLEMENTATION
 * =============================================================================
 * 
 * Handles bidirectional sync between local SQLite and Supabase.
 * Implements push (local -> server), pull (server -> local), and conflict resolution.
 */

import { supabase } from '../../lib/supabase/client';
import { getLocalDb, LocalDB } from '../localDb';
import { SyncStatus } from '../database/localSchema';
import conflictResolver from './conflictResolver';
import networkMonitor from './networkMonitor';
import subscriptionService from '../subscription/subscriptionService';
import { TransactionsRepository } from '../repositories/transactionsRepository';
import { AccountsRepository } from '../repositories/accountsRepository';
import { BudgetCategoriesRepository } from '../repositories/budgetRepository';
import { NetWorthEntriesRepository } from '../repositories/netWorthRepository';
import metricsCollector from '../performance/metricsCollector';

export interface SyncResult {
  success: boolean;
  pushed: number;
  pulled: number;
  conflicts: number;
  errors: string[];
}

export interface SyncOptions {
  tables?: string[];
  forceFullSync?: boolean;
  batchSize?: number;
}

class SyncEngine {
  private static instance: SyncEngine;
  private periodicSyncInterval: NodeJS.Timeout | null = null;
  private readonly PERIODIC_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private isSyncing: boolean = false;
  private syncQueue: Set<string> = new Set();
  private batchSize: number = 50;

  private constructor() {
    // Schema initialization is async, will be called explicitly from useOfflineFirstInit
  }

  static getInstance(): SyncEngine {
    if (!SyncEngine.instance) {
      SyncEngine.instance = new SyncEngine();
    }
    return SyncEngine.instance;
  }

  /**
   * Initialize sync schema (sync_jobs table)
   */
  async initSchema() {
    const { getLocalDb } = await import('../localDb');
    const db = await getLocalDb();
    
    await db.execAsync(`
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
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sync_metadata (
        table_name TEXT PRIMARY KEY NOT NULL,
        last_pulled_at INTEGER,
        last_pushed_at INTEGER,
        cursor_token TEXT,
        version INTEGER DEFAULT 1
      );
    `);
  }

  /**
   * Main sync method - pushes local changes and pulls server changes
   */
  async sync(userId: string, options: SyncOptions = {}): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping...');
      return {
        success: false,
        pushed: 0,
        pulled: 0,
        conflicts: 0,
        errors: ['Sync already in progress'],
      };
    }

    // Check if user can sync
    const canSync = await subscriptionService.canSync();
    if (!canSync) {
      console.log('User cannot sync (not premium or not authenticated)');
      return {
        success: false,
        pushed: 0,
        pulled: 0,
        conflicts: 0,
        errors: ['User cannot sync'],
      };
    }

    // Check network connectivity
    const isOnline = networkMonitor.isCurrentlyOnline();
    if (!isOnline) {
      console.log('Device is offline, cannot sync');
      return {
        success: false,
        pushed: 0,
        pulled: 0,
        conflicts: 0,
        errors: ['Device is offline'],
      };
    }

    this.isSyncing = true;
    const syncStartTime = Date.now();
    const result: SyncResult = {
      success: true,
      pushed: 0,
      pulled: 0,
      conflicts: 0,
      errors: [],
    };

    try {
      // Phase 1: Push local changes to server
      const pushStartTime = Date.now();
      const pushResult = await this.pushChanges(userId, options);
      const pushDuration = Date.now() - pushStartTime;
      result.pushed = pushResult.pushed;
      result.errors.push(...pushResult.errors);

      // Record push metrics
      metricsCollector.recordSync('push', pushDuration, {
        records_processed: pushResult.pushed,
      }).catch(() => {});

      // Phase 2: Pull server changes to local
      const pullStartTime = Date.now();
      const pullResult = await this.pullChanges(userId, options);
      const pullDuration = Date.now() - pullStartTime;
      result.pulled = pullResult.pulled;
      result.conflicts = pullResult.conflicts;
      result.errors.push(...pullResult.errors);

      // Record pull metrics
      metricsCollector.recordSync('pull', pullDuration, {
        records_processed: pullResult.pulled,
        conflicts: pullResult.conflicts,
      }).catch(() => {});

      result.success = result.errors.length === 0;

      // Record overall sync metrics
      const totalDuration = Date.now() - syncStartTime;
      metricsCollector.recordSync('complete', totalDuration, {
        records_processed: result.pushed + result.pulled,
        conflicts: result.conflicts,
      }).catch(() => {});
    } catch (error: any) {
      console.error('Sync error:', error);
      result.success = false;
      result.errors.push(error.message || 'Unknown sync error');

      // Record sync error
      const totalDuration = Date.now() - syncStartTime;
      metricsCollector.recordSync('error', totalDuration, {
        records_processed: result.pushed + result.pulled,
      }).catch(() => {});
    } finally {
      this.isSyncing = false;
    }

    return result;
  }

  /**
   * Push local changes to server
   */
  private async pushChanges(userId: string, options: SyncOptions): Promise<{ pushed: number; errors: string[] }> {
    const errors: string[] = [];
    let pushed = 0;

    const tables = options.tables || [
      'transactions_local',
      'accounts_local',
      'budget_categories_local',
      'net_worth_entries_local',
      'credit_cards_local',
    ];

    for (const tableName of tables) {
      try {
        const tablePushed = await this.pushTable(userId, tableName, options.batchSize || this.batchSize);
        pushed += tablePushed;
      } catch (error: any) {
        console.error(`Error pushing ${tableName}:`, error);
        errors.push(`Failed to push ${tableName}: ${error.message}`);
      }
    }

    return { pushed, errors };
  }

  /**
   * Push changes for a specific table
   */
  private async pushTable(userId: string, tableName: string, batchSize: number): Promise<number> {
    const db = await getLocalDb();
    let pushed = 0;

    // Get pending sync jobs for this table
    const pendingJobs = await this.getPendingSyncJobs(tableName, batchSize);

    if (pendingJobs.length === 0) {
      return 0;
  }

    // Group by operation type
    const creates = pendingJobs.filter(j => j.operation === 'create');
    const updates = pendingJobs.filter(j => j.operation === 'update');
    const deletes = pendingJobs.filter(j => j.operation === 'delete');

    // Map to Supabase table name (remove _local suffix)
    const supabaseTableName = tableName.replace('_local', '_real');

    // Process creates
    if (creates.length > 0) {
      const records = await this.getRecordsByIds(tableName, creates.map(j => j.record_id));
      const toInsert = records.map(r => this.prepareForSupabase(r, userId));
      
      try {
        const { error } = await supabase.from(supabaseTableName).upsert(toInsert);
        if (error) throw error;
        
        // Mark as synced
        await this.markRecordsAsSynced(tableName, creates.map(j => j.record_id));
        await this.markJobsAsCompleted(creates.map(j => j.id));
        pushed += creates.length;
      } catch (error: any) {
        await this.markJobsAsFailed(creates.map(j => j.id), error.message);
        // Don't throw - continue with other operations
        console.error(`Error pushing creates for ${tableName}:`, error);
      }
    }

    // Process updates
    if (updates.length > 0) {
      const records = await this.getRecordsByIds(tableName, updates.map(j => j.record_id));
      const toUpdate = records.map(r => this.prepareForSupabase(r, userId));
      
      try {
        const { error } = await supabase.from(supabaseTableName).upsert(toUpdate);
        if (error) throw error;
        
        await this.markRecordsAsSynced(tableName, updates.map(j => j.record_id));
        await this.markJobsAsCompleted(updates.map(j => j.id));
        pushed += updates.length;
      } catch (error: any) {
        await this.markJobsAsFailed(updates.map(j => j.id), error.message);
        // Don't throw - continue with other operations
        console.error(`Error pushing updates for ${tableName}:`, error);
      }
    }

    // Process deletes
    if (deletes.length > 0) {
      const idsToDelete = deletes.map(j => j.record_id);
      
      try {
        const { error } = await supabase.from(supabaseTableName).delete().in('id', idsToDelete);
        if (error) throw error;
        
        await this.markRecordsAsSynced(tableName, idsToDelete);
        await this.markJobsAsCompleted(deletes.map(j => j.id));
        pushed += deletes.length;
      } catch (error: any) {
        await this.markJobsAsFailed(deletes.map(j => j.id), error.message);
        // Don't throw - continue with other operations
        console.error(`Error pushing deletes for ${tableName}:`, error);
      }
    }

    // Update sync metadata
    await this.updateSyncMetadata(tableName, 'push');

    return pushed;
  }

  /**
   * Pull server changes to local
   */
  private async pullChanges(userId: string, options: SyncOptions): Promise<{ pulled: number; conflicts: number; errors: string[] }> {
    const errors: string[] = [];
    let pulled = 0;
    let conflicts = 0;

    const tables = options.tables || [
      'transactions_real',
      'accounts_real',
      'budget_categories_real',
      'net_worth_entries_real',
      'credit_cards_real',
    ];

    for (const supabaseTableName of tables) {
      try {
        const result = await this.pullTable(userId, supabaseTableName, options);
        pulled += result.pulled;
        conflicts += result.conflicts;
      } catch (error: any) {
        console.error(`Error pulling ${supabaseTableName}:`, error);
        errors.push(`Failed to pull ${supabaseTableName}: ${error.message}`);
  }
    }

    return { pulled, conflicts, errors };
  }

  /**
   * Pull changes for a specific table
   */
  private async pullTable(userId: string, supabaseTableName: string, options: SyncOptions): Promise<{ pulled: number; conflicts: number }> {
    const localTableName = supabaseTableName.replace('_real', '_local');
    const metadata = await this.getSyncMetadata(localTableName);
    
    // Get cursor for incremental sync
    const cursor = metadata?.last_pulled_at || (options.forceFullSync ? 0 : Date.now() - 7 * 24 * 60 * 60 * 1000); // Default: last 7 days
    
    // Query Supabase for changes since cursor
    let query = supabase
      .from(supabaseTableName)
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(options.batchSize || this.batchSize);

    // Add cursor filter if not full sync
    if (!options.forceFullSync && cursor > 0) {
      query = query.gte('updated_at', new Date(cursor).toISOString());
    }

    const { data: serverRecords, error } = await query;

    if (error) {
      throw error;
    }

    if (!serverRecords || serverRecords.length === 0) {
      return { pulled: 0, conflicts: 0 };
    }

    let pulled = 0;
    let conflicts = 0;
    let conflictResolutionTime = 0;

    // Process each server record
    for (const serverRecord of serverRecords) {
      try {
        const localRecord = await this.getLocalRecord(localTableName, serverRecord.id);
        
        if (localRecord) {
          // Check for conflicts
          const conflict = conflictResolver.detectConflict(localRecord, serverRecord);
          
          if (conflict) {
            // Resolve conflict
            const conflictStartTime = Date.now();
            const resolved = conflictResolver.autoResolve(conflict, localTableName);
            conflictResolutionTime += Date.now() - conflictStartTime;
            await this.saveRecord(localTableName, resolved.record);
            conflicts++;
          } else {
            // No conflict, update local record
            await this.saveRecord(localTableName, this.prepareForLocal(serverRecord));
          }
        } else {
          // New record from server
          await this.saveRecord(localTableName, this.prepareForLocal(serverRecord));
        }
        
        pulled++;
      } catch (error: any) {
        console.error(`Error processing record ${serverRecord.id}:`, error);
      }
    }

    // Record conflict resolution metrics if conflicts occurred
    if (conflicts > 0) {
      metricsCollector.recordSync('conflict_resolution', conflictResolutionTime, {
        conflicts,
        records_processed: conflicts,
      }).catch(() => {});
    }

    // Update sync metadata
    await this.updateSyncMetadata(localTableName, 'pull');

    return { pulled, conflicts };
  }

  /**
   * Get pending sync jobs
   */
  private async getPendingSyncJobs(tableName: string, limit: number): Promise<any[]> {
    const db = await getLocalDb();
    const sql = `SELECT * FROM sync_jobs 
                 WHERE table_name = ? AND status = 'pending' 
                 ORDER BY created_at ASC 
                 LIMIT ?`;
    
    try {
      const result = await db.getAllAsync<any>(sql, [tableName, limit]);
      return result;
    } catch (error) {
      console.error('Error getting pending sync jobs:', error);
      throw error;
    }
  }

  /**
   * Get records by IDs
   */
  private async getRecordsByIds(tableName: string, ids: string[]): Promise<any[]> {
    const db = await getLocalDb();
    const placeholders = ids.map(() => '?').join(', ');
    const sql = `SELECT * FROM ${tableName} WHERE id IN (${placeholders})`;
    
    try {
      const result = await db.getAllAsync<any>(sql, ids);
      return result;
    } catch (error) {
      console.error(`Error getting records by IDs from ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Get local record by ID
   */
  private async getLocalRecord(tableName: string, id: string): Promise<any | null> {
    const db = await getLocalDb();
    const sql = `SELECT * FROM ${tableName} WHERE id = ? LIMIT 1`;
    
    try {
      const result = await db.getFirstAsync<any>(sql, [id]);
      return result || null;
    } catch (error) {
      console.error(`Error getting local record from ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Save record to local database
   */
  private async saveRecord(tableName: string, record: any): Promise<void> {
    const db = await getLocalDb();
    const columns = Object.keys(record);
    const values = Object.values(record);
    const placeholders = columns.map(() => '?').join(', ');
    const sql = `INSERT OR REPLACE INTO ${tableName} (${columns.join(', ')}) 
                 VALUES (${placeholders})`;

    try {
      await db.runAsync(sql, values);
    } catch (error) {
      console.error(`Error saving record to ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Mark records as synced
   */
  private async markRecordsAsSynced(tableName: string, ids: string[]): Promise<void> {
    const db = await getLocalDb();
    const placeholders = ids.map(() => '?').join(', ');
    const sql = `UPDATE ${tableName} 
                 SET sync_status = ?, last_synced_at = ?, updated_offline = 0, created_offline = 0
                 WHERE id IN (${placeholders})`;

    try {
      await db.runAsync(sql, [SyncStatus.SYNCED, Date.now(), ...ids]);
    } catch (error) {
      console.error(`Error marking records as synced in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Mark sync jobs as completed
   */
  private async markJobsAsCompleted(jobIds: number[]): Promise<void> {
    const db = await getLocalDb();
    const placeholders = jobIds.map(() => '?').join(', ');
    const sql = `UPDATE sync_jobs 
                 SET status = 'completed', updated_at = ?
                 WHERE id IN (${placeholders})`;

    try {
      await db.runAsync(sql, [Date.now(), ...jobIds]);
    } catch (error) {
      console.error('Error marking jobs as completed:', error);
      throw error;
    }
  }

  /**
   * Mark sync jobs as failed
   */
  private async markJobsAsFailed(jobIds: number[], errorMessage: string): Promise<void> {
    const db = await getLocalDb();
    const placeholders = jobIds.map(() => '?').join(', ');
    const sql = `UPDATE sync_jobs 
                 SET status = 'failed', error_message = ?, attempt = attempt + 1, updated_at = ?
                 WHERE id IN (${placeholders})`;

    try {
      await db.runAsync(sql, [errorMessage, Date.now(), ...jobIds]);
    } catch (error) {
      console.error('Error marking jobs as failed:', error);
      throw error;
    }
  }

  /**
   * Get sync metadata for a table
   */
  private async getSyncMetadata(tableName: string): Promise<any | null> {
    const db = await getLocalDb();
    const sql = `SELECT * FROM sync_metadata WHERE table_name = ?`;

    try {
      const result = await db.getFirstAsync<any>(sql, [tableName]);
      return result || null;
    } catch (error) {
      console.error('Error getting sync metadata:', error);
      throw error;
    }
  }

  /**
   * Update sync metadata
   */
  private async updateSyncMetadata(tableName: string, type: 'push' | 'pull'): Promise<void> {
    const db = await getLocalDb();
    const now = Date.now();
    const field = type === 'push' ? 'last_pushed_at' : 'last_pulled_at';
    const sql = `INSERT OR REPLACE INTO sync_metadata (table_name, ${field}, version)
                 VALUES (?, ?, 1)`;

    try {
      await db.runAsync(sql, [tableName, now]);
    } catch (error) {
      console.error('Error updating sync metadata:', error);
      throw error;
    }
  }

  /**
   * Prepare record for Supabase (remove sync metadata)
   */
  private prepareForSupabase(record: any, userId: string): any {
    const { sync_status, created_offline, updated_offline, deleted_offline, last_synced_at, server_version, local_id, ...clean } = record;
    return {
      ...clean,
          user_id: userId,
    };
    }

  /**
   * Prepare server record for local storage (add sync metadata)
   */
  private prepareForLocal(record: any): any {
    return {
      ...record,
      sync_status: SyncStatus.SYNCED,
      created_offline: 0,
      updated_offline: 0,
      deleted_offline: 0,
      last_synced_at: Date.now(),
      server_version: record.server_version || 1,
      created_at: typeof record.created_at === 'string' ? new Date(record.created_at).getTime() : record.created_at,
      updated_at: typeof record.updated_at === 'string' ? new Date(record.updated_at).getTime() : record.updated_at,
    };
  }

  /**
   * Schedule sync (called by repositories)
   */
  scheduleSync(tableName: string): void {
    this.syncQueue.add(tableName);
    
    // Auto-sync after a short delay if online
    if (networkMonitor.isCurrentlyOnline()) {
      setTimeout(() => {
        this.processSyncQueue();
      }, 1000);
    }
  }

  /**
   * Process sync queue
   */
  private async processSyncQueue(): Promise<void> {
    if (this.syncQueue.size === 0 || this.isSyncing) {
      return;
    }

    const tables = Array.from(this.syncQueue);
    this.syncQueue.clear();

    // Get user ID
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
    return;
  }

    await this.sync(session.user.id, { tables });
  }

  /**
   * Enqueue a sync job (called by repositories)
   */
  async enqueueJob(type: string, tableName: string, recordId: string, operation: 'create' | 'update' | 'delete', payload: any): Promise<void> {
    const db = await getLocalDb();
    const sql = `INSERT INTO sync_jobs (type, table_name, record_id, operation, payload, status, created_at, updated_at, scheduled_at)
                 VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)`;

    try {
      await db.runAsync(sql, [
        type,
        tableName,
        recordId,
        operation,
        JSON.stringify(payload),
        Date.now(),
        Date.now(),
        Date.now(),
      ]);
      this.scheduleSync(tableName);
    } catch (error) {
      console.error('Error enqueueing sync job:', error);
      // Don't throw - sync job failure shouldn't break the main operation
    }
  }

  /**
   * Start periodic sync (runs every 5 minutes when online)
   */
  startPeriodicSync(): void {
    if (this.periodicSyncInterval) {
      return; // Already started
    }

    this.periodicSyncInterval = setInterval(async () => {
      if (!networkMonitor.isCurrentlyOnline()) {
        return; // Skip if offline
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          return; // Skip if not authenticated
        }

        // Only sync if user is premium (subscription check)
        try {
          const subscriptionStatus = await subscriptionService.checkSubscriptionStatus();
          if (!subscriptionStatus?.isPremium) {
            return; // Skip if not premium
          }
        } catch (error) {
          console.error('❌ Error checking subscription status:', error);
          // Continue with sync if subscription check fails (fail open)
          // This prevents blocking sync due to subscription service issues
        }

        console.log('🔄 Starting periodic sync...');
        await this.sync(session.user.id, { 
          tables: ['transactions_local', 'accounts_local', 'net_worth_entries_local', 'credit_cards_local'],
          forceFullSync: false, // Incremental sync
        });
        console.log('✅ Periodic sync completed');
      } catch (error) {
        console.error('❌ Periodic sync error:', error);
        // Don't throw - periodic sync failures shouldn't break the app
      }
    }, this.PERIODIC_SYNC_INTERVAL);

    console.log('✅ Periodic sync started (every 5 minutes)');
  }

  /**
   * Stop periodic sync
   */
  stopPeriodicSync(): void {
    if (this.periodicSyncInterval) {
      clearInterval(this.periodicSyncInterval);
      this.periodicSyncInterval = null;
      console.log('⏹️ Periodic sync stopped');
    }
  }
}

export default SyncEngine.getInstance();
