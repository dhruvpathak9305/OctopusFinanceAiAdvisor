/**
 * =============================================================================
 * SYNC SUPABASE TO LOCAL - TESTING UTILITY
 * =============================================================================
 * 
 * Utility to sync data from Supabase to local SQLite database for testing offline mode.
 * This allows you to populate local DB with real data for offline testing.
 */

import { supabase } from '../../lib/supabase/client';
import { getLocalDb } from '../localDb';
import { SyncStatus } from '../database/localSchema';

export interface SyncOptions {
  userId?: string;
  tables?: string[];
  limit?: number;
}

/**
 * Sync all data from Supabase to local DB for testing
 */
export async function syncSupabaseToLocal(options: SyncOptions = {}): Promise<{
  synced: Record<string, number>;
  errors: string[];
}> {
  const result: {
    synced: Record<string, number>;
    errors: string[];
  } = {
    synced: {},
    errors: [],
  };

  try {
    // Get user ID
    const { data: { session } } = await supabase.auth.getSession();
    const userId = options.userId || session?.user?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const tables = options.tables || [
      'transactions_real',
      'accounts_real',
      'budget_categories_real',
      'budget_subcategories_real',
      'net_worth_categories_real',
      'net_worth_subcategories_real',
      'net_worth_entries_real',
    ];

    const db = await getLocalDb();

    for (const supabaseTable of tables) {
      try {
        const localTable = supabaseTable.replace('_real', '_local');
        const count = await syncTable(db, supabaseTable, localTable, userId, options.limit);
        result.synced[supabaseTable] = count;
        console.log(`✅ Synced ${count} records from ${supabaseTable} to ${localTable}`);
      } catch (error: any) {
        const errorMsg = `Failed to sync ${supabaseTable}: ${error.message}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    // Update sync metadata for pull operation
    try {
      const now = Date.now();
      for (const supabaseTable of tables) {
        const localTable = supabaseTable.replace('_real', '_local');
        await db.runAsync(
          `INSERT OR REPLACE INTO sync_metadata (table_name, last_pulled_at, version) 
           VALUES (?, ?, ?)`,
          [localTable, now, 1]
        );
      }
    } catch (error) {
      console.error('Error updating sync metadata:', error);
    }

    return result;
  } catch (error: any) {
    result.errors.push(`Sync failed: ${error.message}`);
    return result;
  }
}

/**
 * Define valid columns for each local table (to filter out Supabase columns that don't exist locally)
 */
const VALID_COLUMNS: Record<string, string[]> = {
  transactions_local: [
    'id', 'local_id', 'user_id', 'name', 'description', 'amount', 'date', 'type',
    'category_id', 'subcategory_id', 'icon', 'merchant', 'source_account_id',
    'source_account_type', 'source_account_name', 'destination_account_id',
    'destination_account_type', 'destination_account_name', 'is_recurring',
    'recurrence_pattern', 'recurrence_end_date', 'parent_transaction_id',
    'interest_rate', 'loan_term_months', 'metadata', 'is_credit_card',
    'created_at', 'updated_at'
  ],
  accounts_local: [
    'id', 'local_id', 'user_id', 'name', 'type', 'institution', 'account_number',
    'current_balance', 'initial_balance', 'initial_balance_date', 'currency',
    'is_active', 'logo_url', 'ifsc_code', 'micr_code', 'branch_name',
    'branch_address', 'bank_holder_name', 'crn', 'last_sync', 'last_transaction_date',
    'total_income', 'total_expenses', 'transaction_count', 'created_at', 'updated_at'
  ],
  budget_categories_local: [
    'id', 'local_id', 'user_id', 'name', 'budget_limit', 'ring_color', 'bg_color',
    'category_type', 'description', 'display_order', 'frequency', 'start_date',
    'status', 'strategy', 'is_active', 'percentage', 'icon',
    'created_at', 'updated_at'
  ],
  budget_subcategories_local: [
    'id', 'local_id', 'category_id', 'name', 'amount', 'color', 'icon',
    'budget_limit', 'current_spend', 'description', 'display_order',
    'is_active', 'transaction_category_id', 'created_at', 'updated_at'
  ],
  net_worth_categories_local: [
    'id', 'local_id', 'name', 'icon', 'color', 'type', 'is_system',
    'created_at', 'updated_at'
  ],
  net_worth_subcategories_local: [
    'id', 'local_id', 'category_id', 'name', 'description', 'sort_order',
    'is_active', 'created_at', 'updated_at'
  ],
  net_worth_entries_local: [
    'id', 'local_id', 'user_id', 'category_id', 'subcategory_id', 'asset_name',
    'value', 'quantity', 'market_price', 'date', 'notes', 'is_active',
    'is_included_in_net_worth', 'linked_source_type', 'linked_source_id',
    'last_synced_at', 'created_at', 'updated_at'
  ],
};

/**
 * Tables that don't have user_id column in Supabase
 */
const TABLES_WITHOUT_USER_ID = [
  'budget_subcategories_real',
  'net_worth_categories_real',
  'net_worth_subcategories_real',
];

/**
 * Default values for NOT NULL fields that might be missing
 */
const DEFAULT_VALUES: Record<string, Record<string, any>> = {
  budget_categories_local: {
    budget_limit: 0,
    ring_color: '#3B82F6',
    bg_color: '#EFF6FF',
  },
};

/**
 * Sync a single table from Supabase to local
 */
async function syncTable(
  db: any,
  supabaseTable: string,
  localTable: string,
  userId: string,
  limit?: number
): Promise<number> {
  // Query Supabase
  let query = supabase.from(supabaseTable).select('*');
  
  // Only filter by user_id if the table has that column
  if (!TABLES_WITHOUT_USER_ID.includes(supabaseTable)) {
    query = query.eq('user_id', userId);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    return 0;
  }

  // Get valid columns for this table
  const validColumns = VALID_COLUMNS[localTable] || [];
  
  // Insert into local DB
  let inserted = 0;

  for (const record of data) {
    try {
      // Filter out columns that don't exist in local schema
      const filteredRecord: any = {};
      for (const [key, value] of Object.entries(record)) {
        if (validColumns.includes(key)) {
          filteredRecord[key] = value;
        }
      }

      // Apply default values for NOT NULL fields that might be missing
      const defaults = DEFAULT_VALUES[localTable] || {};
      for (const [key, defaultValue] of Object.entries(defaults)) {
        if (validColumns.includes(key) && (filteredRecord[key] === null || filteredRecord[key] === undefined)) {
          filteredRecord[key] = defaultValue;
        }
      }

      const columns = Object.keys(filteredRecord);
      const values = Object.values(filteredRecord).map((val: any) => {
        // Convert dates to timestamps
        if (val && typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}/)) {
          return new Date(val).getTime();
        }
        // Convert JSON to string
        if (val && typeof val === 'object') {
          return JSON.stringify(val);
        }
        return val;
      });
      
      // Add sync metadata (only if not already present)
      const syncColumns = [...columns];
      const syncValues = [...values];
      
      if (!syncColumns.includes('sync_status')) {
        syncColumns.push('sync_status');
        syncValues.push(SyncStatus.SYNCED);
      }
      if (!syncColumns.includes('created_offline')) {
        syncColumns.push('created_offline');
        syncValues.push(0);
      }
      if (!syncColumns.includes('updated_offline')) {
        syncColumns.push('updated_offline');
        syncValues.push(0);
      }
      if (!syncColumns.includes('deleted_offline')) {
        syncColumns.push('deleted_offline');
        syncValues.push(0);
      }
      if (!syncColumns.includes('last_synced_at')) {
        syncColumns.push('last_synced_at');
        syncValues.push(Date.now());
      }
      if (!syncColumns.includes('server_version')) {
        syncColumns.push('server_version');
        syncValues.push(1);
      }
      
      // Ensure created_at and updated_at exist
      if (!syncColumns.includes('created_at')) {
        syncColumns.push('created_at');
        syncValues.push(record.created_at ? new Date(record.created_at).getTime() : Date.now());
      } else {
        // Update existing created_at value
        const idx = syncColumns.indexOf('created_at');
        syncValues[idx] = record.created_at ? new Date(record.created_at).getTime() : syncValues[idx] || Date.now();
      }
      
      if (!syncColumns.includes('updated_at')) {
        syncColumns.push('updated_at');
        syncValues.push(record.updated_at ? new Date(record.updated_at).getTime() : Date.now());
      } else {
        // Update existing updated_at value
        const idx = syncColumns.indexOf('updated_at');
        syncValues[idx] = record.updated_at ? new Date(record.updated_at).getTime() : syncValues[idx] || Date.now();
      }

      const syncPlaceholders = syncColumns.map(() => '?').join(', ');

      await db.runAsync(
        `INSERT OR REPLACE INTO ${localTable} (${syncColumns.join(', ')}) 
         VALUES (${syncPlaceholders})`,
        syncValues
      );
      
      inserted++;
    } catch (error: any) {
      console.error(`Error inserting record into ${localTable}:`, error.message);
      // Continue with next record instead of failing completely
    }
  }

  return inserted;
}

/**
 * Clear local DB (for testing)
 */
export async function clearLocalDB(): Promise<void> {
  const db = await getLocalDb();
  const tables = [
    'transactions_local',
    'accounts_local',
    'budget_categories_local',
    'budget_subcategories_local',
    'net_worth_categories_local',
    'net_worth_subcategories_local',
    'net_worth_entries_local',
    'sync_jobs',
    'sync_metadata',
  ];

  for (const table of tables) {
    try {
      await db.runAsync(`DELETE FROM ${table}`);
    } catch (error) {
      console.error(`Error clearing table ${table}:`, error);
    }
  }

  console.log('✅ Local DB cleared');
}

