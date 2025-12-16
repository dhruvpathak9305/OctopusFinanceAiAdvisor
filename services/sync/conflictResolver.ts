/**
 * =============================================================================
 * CONFLICT RESOLVER - SYNC CONFLICT RESOLUTION
 * =============================================================================
 * 
 * Handles conflict resolution between local and server data.
 * Implements last-write-wins and field-level merge strategies.
 */

export interface ConflictResolutionStrategy {
  type: 'last-write-wins' | 'field-level-merge' | 'server-wins' | 'local-wins';
  mergeFields?: string[]; // Fields to merge for field-level-merge strategy
}

export interface ConflictRecord {
  id: string;
  localRecord: any;
  serverRecord: any;
  conflictFields: string[];
  localUpdatedAt: number;
  serverUpdatedAt: number;
}

export interface ResolvedRecord {
  record: any;
  resolutionStrategy: string;
  conflictsResolved: string[];
}

class ConflictResolver {
  private static instance: ConflictResolver;

  private constructor() {}

  static getInstance(): ConflictResolver {
    if (!ConflictResolver.instance) {
      ConflictResolver.instance = new ConflictResolver();
    }
    return ConflictResolver.instance;
  }

  /**
   * Detect conflicts between local and server records
   */
  detectConflict(localRecord: any, serverRecord: any): ConflictRecord | null {
    if (!localRecord || !serverRecord) {
      return null;
    }

    // Check server_version mismatch
    const localVersion = localRecord.server_version || 0;
    const serverVersion = serverRecord.server_version || 0;

    if (localVersion === serverVersion) {
      // No conflict - versions match
      return null;
    }

    // Check timestamp mismatch
    const localUpdatedAt = localRecord.updated_at || localRecord.updatedAt || 0;
    const serverUpdatedAt = serverRecord.updated_at || serverRecord.updatedAt || 0;

    // Find conflicting fields (fields that differ)
    const conflictFields: string[] = [];
    const allKeys = new Set([...Object.keys(localRecord), ...Object.keys(serverRecord)]);

    for (const key of allKeys) {
      // Skip sync metadata fields
      if (key.startsWith('sync_') || 
          key === 'server_version' || 
          key === 'last_synced_at' ||
          key === 'created_offline' ||
          key === 'updated_offline' ||
          key === 'deleted_offline') {
        continue;
      }

      const localValue = localRecord[key];
      const serverValue = serverRecord[key];

      // Compare values (handle dates, numbers, strings, objects)
      if (JSON.stringify(localValue) !== JSON.stringify(serverValue)) {
        conflictFields.push(key);
      }
    }

    if (conflictFields.length === 0) {
      return null;
    }

    return {
      id: localRecord.id || serverRecord.id,
      localRecord,
      serverRecord,
      conflictFields,
      localUpdatedAt: typeof localUpdatedAt === 'string' ? new Date(localUpdatedAt).getTime() : localUpdatedAt,
      serverUpdatedAt: typeof serverUpdatedAt === 'string' ? new Date(serverUpdatedAt).getTime() : serverUpdatedAt,
    };
  }

  /**
   * Resolve conflict using specified strategy
   */
  resolve(
    conflict: ConflictRecord,
    strategy: ConflictResolutionStrategy = { type: 'last-write-wins' }
  ): ResolvedRecord {
    switch (strategy.type) {
      case 'last-write-wins':
        return this.resolveLastWriteWins(conflict);
      
      case 'field-level-merge':
        return this.resolveFieldLevelMerge(conflict, strategy.mergeFields || []);
      
      case 'server-wins':
        return this.resolveServerWins(conflict);
      
      case 'local-wins':
        return this.resolveLocalWins(conflict);
      
      default:
        return this.resolveLastWriteWins(conflict);
    }
  }

  /**
   * Last-write-wins: Use the record with the most recent updated_at timestamp
   */
  private resolveLastWriteWins(conflict: ConflictRecord): ResolvedRecord {
    const useLocal = conflict.localUpdatedAt > conflict.serverUpdatedAt;
    const winner = useLocal ? conflict.localRecord : conflict.serverRecord;
    
    return {
      record: {
        ...winner,
        server_version: conflict.serverRecord.server_version || 0,
      },
      resolutionStrategy: 'last-write-wins',
      conflictsResolved: conflict.conflictFields,
    };
  }

  /**
   * Field-level merge: Merge specific fields from both records
   */
  private resolveFieldLevelMerge(
    conflict: ConflictRecord,
    mergeFields: string[]
  ): ResolvedRecord {
    const resolved: any = { ...conflict.serverRecord };
    
    // Merge specified fields from local record
    mergeFields.forEach((field) => {
      if (conflict.localRecord[field] !== undefined) {
        // Special handling for array fields (e.g., tags, notes)
        if (Array.isArray(resolved[field]) && Array.isArray(conflict.localRecord[field])) {
          resolved[field] = [...new Set([...resolved[field], ...conflict.localRecord[field]])];
        } else if (typeof resolved[field] === 'object' && typeof conflict.localRecord[field] === 'object') {
          resolved[field] = { ...resolved[field], ...conflict.localRecord[field] };
        } else {
          resolved[field] = conflict.localRecord[field] || resolved[field];
        }
      }
    });

    // Use local updated_at if it's more recent
    if (conflict.localUpdatedAt > conflict.serverUpdatedAt) {
      resolved.updated_at = conflict.localRecord.updated_at;
    }

    return {
      record: {
        ...resolved,
        server_version: conflict.serverRecord.server_version || 0,
      },
      resolutionStrategy: 'field-level-merge',
      conflictsResolved: mergeFields.filter(f => conflict.conflictFields.includes(f)),
    };
  }

  /**
   * Server wins: Always use server record
   */
  private resolveServerWins(conflict: ConflictRecord): ResolvedRecord {
    return {
      record: {
        ...conflict.serverRecord,
        server_version: conflict.serverRecord.server_version || 0,
      },
      resolutionStrategy: 'server-wins',
      conflictsResolved: conflict.conflictFields,
    };
  }

  /**
   * Local wins: Always use local record
   */
  private resolveLocalWins(conflict: ConflictRecord): ResolvedRecord {
    return {
      record: {
        ...conflict.localRecord,
        server_version: conflict.serverRecord.server_version || 0,
      },
      resolutionStrategy: 'local-wins',
      conflictsResolved: conflict.conflictFields,
    };
  }

  /**
   * Get default merge fields for a table type
   */
  getDefaultMergeFields(tableName: string): string[] {
    const mergeFieldsMap: Record<string, string[]> = {
      transactions_local: ['notes', 'metadata', 'description'],
      accounts_local: ['notes', 'metadata'],
      budget_categories_local: ['description', 'notes'],
      net_worth_entries_local: ['notes', 'metadata'],
    };

    return mergeFieldsMap[tableName] || [];
  }

  /**
   * Auto-resolve conflict with smart defaults
   */
  autoResolve(conflict: ConflictRecord, tableName: string): ResolvedRecord {
    // Default to last-write-wins, but use field-level merge for specific tables
    const mergeFields = this.getDefaultMergeFields(tableName);
    
    if (mergeFields.length > 0) {
      return this.resolve(conflict, {
        type: 'field-level-merge',
        mergeFields,
      });
    }

    return this.resolve(conflict, { type: 'last-write-wins' });
  }
}

export default ConflictResolver.getInstance();

