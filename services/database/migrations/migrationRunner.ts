/**
 * =============================================================================
 * MIGRATION RUNNER - VERSIONED SCHEMA EVOLUTION
 * =============================================================================
 * 
 * Handles versioned migrations for local SQLite database schema evolution.
 * Migrations are applied sequentially based on version numbers.
 */

import * as SQLite from 'expo-sqlite';
import { LocalDB } from '../../localDb';

export interface Migration {
  version: number;
  name: string;
  up: (tx: SQLite.SQLTransaction) => void;
  down?: (tx: SQLite.SQLTransaction) => void; // Optional rollback
}

/**
 * Migration registry - all migrations should be registered here
 */
const migrations: Migration[] = [
  // Future migrations will be added here
  // Example:
  // {
  //   version: 2,
  //   name: 'add_new_column',
  //   up: (tx) => {
  //     tx.executeSql('ALTER TABLE transactions_local ADD COLUMN new_field TEXT;');
  //   }
  // }
];

/**
 * Get the current database version
 */
export function getCurrentVersion(db: LocalDB): Promise<number> {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT MAX(version) as version FROM schema_version;',
          [],
          (_, result) => {
            const version = result.rows.length > 0 
              ? result.rows.item(0).version || 0 
              : 0;
            resolve(version);
          },
          (_, error) => {
            // Schema version table doesn't exist, return 0
            resolve(0);
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
 * Run pending migrations
 */
export async function runMigrations(db: LocalDB, targetVersion?: number): Promise<void> {
  const currentVersion = await getCurrentVersion(db);
  const target = targetVersion || Math.max(...migrations.map(m => m.version), currentVersion);
  
  if (currentVersion >= target) {
    console.log(`Database is already at version ${currentVersion}, no migrations needed`);
    return;
  }

  // Get pending migrations
  const pendingMigrations = migrations
    .filter(m => m.version > currentVersion && m.version <= target)
    .sort((a, b) => a.version - b.version);

  if (pendingMigrations.length === 0) {
    console.log('No pending migrations');
    return;
  }

  console.log(`Running ${pendingMigrations.length} migration(s) from version ${currentVersion} to ${target}`);

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        pendingMigrations.forEach((migration) => {
          try {
            console.log(`Running migration ${migration.version}: ${migration.name}`);
            migration.up(tx);
            
            // Record migration
            tx.executeSql(
              'INSERT INTO schema_version (version, applied_at) VALUES (?, ?);',
              [migration.version, Date.now()],
              () => {
                console.log(`Migration ${migration.version} completed successfully`);
              },
              (_, error) => {
                console.error(`Error recording migration ${migration.version}:`, error);
                throw error;
              }
            );
          } catch (error) {
            console.error(`Error running migration ${migration.version}:`, error);
            throw error;
          }
        });
      },
      (error) => {
        console.error('Migration transaction failed:', error);
        reject(error);
      },
      () => {
        console.log('All migrations completed successfully');
        resolve();
      }
    );
  });
}

/**
 * Rollback migrations (for testing/debugging)
 */
export async function rollbackMigrations(db: LocalDB, targetVersion: number): Promise<void> {
  const currentVersion = await getCurrentVersion(db);
  
  if (currentVersion <= targetVersion) {
    console.log(`Database is already at version ${currentVersion}, cannot rollback to ${targetVersion}`);
    return;
  }

  // Get migrations to rollback (in reverse order)
  const migrationsToRollback = migrations
    .filter(m => m.version > targetVersion && m.version <= currentVersion)
    .sort((a, b) => b.version - a.version);

  if (migrationsToRollback.length === 0) {
    console.log('No migrations to rollback');
    return;
  }

  console.log(`Rolling back ${migrationsToRollback.length} migration(s) from version ${currentVersion} to ${targetVersion}`);

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        migrationsToRollback.forEach((migration) => {
          try {
            if (!migration.down) {
              throw new Error(`Migration ${migration.version} does not support rollback`);
            }
            
            console.log(`Rolling back migration ${migration.version}: ${migration.name}`);
            migration.down!(tx);
            
            // Remove migration record
            tx.executeSql(
              'DELETE FROM schema_version WHERE version = ?;',
              [migration.version],
              () => {
                console.log(`Migration ${migration.version} rolled back successfully`);
              },
              (_, error) => {
                console.error(`Error removing migration ${migration.version} record:`, error);
                throw error;
              }
            );
          } catch (error) {
            console.error(`Error rolling back migration ${migration.version}:`, error);
            throw error;
          }
        });
      },
      (error) => {
        console.error('Rollback transaction failed:', error);
        reject(error);
      },
      () => {
        console.log('All rollbacks completed successfully');
        resolve();
      }
    );
  });
}

/**
 * Register a new migration
 */
export function registerMigration(migration: Migration): void {
  // Check for duplicate versions
  if (migrations.some(m => m.version === migration.version)) {
    throw new Error(`Migration with version ${migration.version} already exists`);
  }
  
  migrations.push(migration);
  // Keep migrations sorted by version
  migrations.sort((a, b) => a.version - b.version);
}

/**
 * Get all registered migrations
 */
export function getRegisteredMigrations(): Migration[] {
  return [...migrations];
}

