/**
 * =============================================================================
 * SUBSCRIPTION SYNC HANDLER - HANDLE SUBSCRIPTION STATUS CHANGES
 * =============================================================================
 * 
 * Handles sync behavior when subscription status changes (premium to free, etc.)
 * - Premium → Free: Stop syncing, mark all pending syncs as local_only
 * - Free → Premium: Enable syncing, trigger initial sync
 */

import subscriptionService from './subscriptionService';
import syncEngine from '../sync/syncEngine';
import { getLocalDb } from '../localDb';
import { SyncStatus } from '../database/localSchema';

class SubscriptionSyncHandler {
  private static instance: SubscriptionSyncHandler;
  private lastSubscriptionStatus: boolean = false;

  private constructor() {
    this.initialize();
  }

  static getInstance(): SubscriptionSyncHandler {
    if (!SubscriptionSyncHandler.instance) {
      SubscriptionSyncHandler.instance = new SubscriptionSyncHandler();
    }
    return SubscriptionSyncHandler.instance;
  }

  /**
   * Initialize subscription monitoring
   */
  private async initialize(): Promise<void> {
    const status = await subscriptionService.checkSubscriptionStatus();
    this.lastSubscriptionStatus = status.isPremium;

    // Monitor subscription changes
    setInterval(async () => {
      await this.checkSubscriptionChange();
    }, 60000); // Check every minute
  }

  /**
   * Check if subscription status has changed
   */
  private async checkSubscriptionChange(): Promise<void> {
    const status = await subscriptionService.checkSubscriptionStatus();
    const currentIsPremium = status.isPremium;

    if (this.lastSubscriptionStatus !== currentIsPremium) {
      console.log(`Subscription status changed: ${this.lastSubscriptionStatus ? 'Premium' : 'Free'} → ${currentIsPremium ? 'Premium' : 'Free'}`);
      
      if (this.lastSubscriptionStatus && !currentIsPremium) {
        // Premium → Free: Stop syncing
        await this.handleDowngradeToFree();
      } else if (!this.lastSubscriptionStatus && currentIsPremium) {
        // Free → Premium: Enable syncing
        await this.handleUpgradeToPremium();
      }

      this.lastSubscriptionStatus = currentIsPremium;
    }
  }

  /**
   * Handle downgrade from premium to free
   */
  private async handleDowngradeToFree(): Promise<void> {
    console.log('Handling downgrade to free - stopping sync and marking pending items as local_only');
    
    const db = getLocalDb();
    
    // Mark all pending sync jobs as local_only
    db.transaction((tx) => {
      // Update sync_status for all pending records
      const tables = [
        'transactions_local',
        'accounts_local',
        'budget_categories_local',
        'net_worth_entries_local',
      ];

      tables.forEach((table) => {
        tx.executeSql(
          `UPDATE ${table} 
           SET sync_status = ?, updated_at = ?
           WHERE sync_status = ?`,
          [SyncStatus.LOCAL_ONLY, Date.now(), SyncStatus.PENDING],
          () => {
            console.log(`Marked pending ${table} records as local_only`);
          },
          (_, error) => {
            console.error(`Error updating ${table}:`, error);
          }
        );
      });

      // Cancel all pending sync jobs
      tx.executeSql(
        `UPDATE sync_jobs 
         SET status = 'failed', error_message = ?, updated_at = ?
         WHERE status = 'pending' OR status = 'processing'`,
        ['Subscription downgraded to free - sync disabled', Date.now()],
        () => {
          console.log('Cancelled pending sync jobs');
        },
        (_, error) => {
          console.error('Error cancelling sync jobs:', error);
        }
      );
    });
  }

  /**
   * Handle upgrade from free to premium
   */
  private async handleUpgradeToPremium(): Promise<void> {
    console.log('Handling upgrade to premium - enabling sync and triggering initial sync');
    
    const { data: { session } } = await (await import('../../lib/supabase/client')).supabase.auth.getSession();
    if (!session?.user?.id) {
      console.log('User not authenticated, cannot sync');
      return;
    }

    // Mark local_only records as pending for sync
    const db = getLocalDb();
    
    db.transaction((tx) => {
      const tables = [
        'transactions_local',
        'accounts_local',
        'budget_categories_local',
        'net_worth_entries_local',
      ];

      tables.forEach((table) => {
        tx.executeSql(
          `UPDATE ${table} 
           SET sync_status = ?, updated_at = ?
           WHERE sync_status = ? AND (created_offline = 1 OR updated_offline = 1)`,
          [SyncStatus.PENDING, Date.now(), SyncStatus.LOCAL_ONLY],
          () => {
            console.log(`Marked ${table} local_only records as pending for sync`);
          },
          (_, error) => {
            console.error(`Error updating ${table}:`, error);
          }
        );
      });
    });

    // Trigger initial sync
    setTimeout(async () => {
      try {
        await syncEngine.sync(session.user.id, { forceFullSync: true });
        console.log('Initial sync completed after upgrade');
      } catch (error) {
        console.error('Error during initial sync after upgrade:', error);
      }
    }, 2000); // Wait 2 seconds for DB updates to complete
  }

  /**
   * Manually trigger subscription change check
   */
  async checkAndHandleSubscriptionChange(): Promise<void> {
    await this.checkSubscriptionChange();
  }
}

export default SubscriptionSyncHandler.getInstance();

