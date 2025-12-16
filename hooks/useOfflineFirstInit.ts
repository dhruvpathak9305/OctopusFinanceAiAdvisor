/**
 * =============================================================================
 * OFFLINE-FIRST INITIALIZATION HOOK
 * =============================================================================
 * 
 * Initializes offline-first architecture on app startup.
 * - Initializes local database
 * - Sets up network monitoring
 * - Configures sync engine
 * - Handles subscription changes
 */

import { useEffect, useState } from 'react';
import { initializeLocalDb } from '../services/localDb';
import 'react-native-get-random-values'; // Must be imported before uuid
import networkMonitor from '../services/sync/networkMonitor';
import syncEngine from '../services/sync/syncEngine';
import subscriptionSyncHandler from '../services/subscription/subscriptionSyncHandler';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useUnifiedAuth } from '../contexts/UnifiedAuthContext';

export interface OfflineFirstInitStatus {
  initialized: boolean;
  error: string | null;
  dbReady: boolean;
  networkReady: boolean;
}

export function useOfflineFirstInit(): OfflineFirstInitStatus {
  const [status, setStatus] = useState<OfflineFirstInitStatus>({
    initialized: false,
    error: null,
    dbReady: false,
    networkReady: false,
  });

  const { isPremium, canSync } = useSubscription();
  const { isAuthenticated, user } = useUnifiedAuth();

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        console.log('🚀 Initializing offline-first architecture...');

        // 1. Initialize local database
        try {
          await initializeLocalDb();
          if (mounted) {
            setStatus((prev) => ({ ...prev, dbReady: true }));
            console.log('✅ Local database initialized');
          }
        } catch (error: any) {
          console.error('❌ Failed to initialize local database:', error);
          if (mounted) {
            setStatus((prev) => ({
              ...prev,
              error: `Database init failed: ${error.message}`,
            }));
          }
          return;
        }

        // 2. Initialize network monitoring
        try {
          const networkStatus = await networkMonitor.getStatus();
          if (mounted) {
            setStatus((prev) => ({
              ...prev,
              networkReady: true,
            }));
            console.log(`✅ Network monitoring initialized: ${networkStatus}`);
          }

          // Listen for network changes and trigger sync if premium
          networkMonitor.addListener(async (newStatus) => {
            if (newStatus === 'online' && canSync && user?.id) {
              console.log('🌐 Network online - triggering sync');
              try {
                await syncEngine.sync(user.id);
              } catch (error) {
                console.error('Error syncing after network reconnect:', error);
              }
            }
          });
        } catch (error: any) {
          console.error('❌ Failed to initialize network monitoring:', error);
        }

        // 3. Initialize sync engine schema
        try {
          syncEngine.initSchema();
          console.log('✅ Sync engine initialized');
        } catch (error: any) {
          console.error('❌ Failed to initialize sync engine:', error);
        }

        // 4. Initialize subscription sync handler
        try {
          await subscriptionSyncHandler.checkAndHandleSubscriptionChange();
          console.log('✅ Subscription sync handler initialized');
        } catch (error: any) {
          console.error('❌ Failed to initialize subscription handler:', error);
        }

        if (mounted) {
          setStatus({
            initialized: true,
            error: null,
            dbReady: true,
            networkReady: true,
          });
          console.log('✅ Offline-first architecture fully initialized');
        }
      } catch (error: any) {
        console.error('❌ Failed to initialize offline-first architecture:', error);
        if (mounted) {
          setStatus({
            initialized: false,
            error: error.message || 'Initialization failed',
            dbReady: false,
            networkReady: false,
          });
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  // Trigger sync when user becomes premium and online
  useEffect(() => {
    if (status.initialized && isPremium && canSync && user?.id) {
      const networkStatus = networkMonitor.isCurrentlyOnline();
      if (networkStatus) {
        console.log('🔄 User is premium and online - triggering sync');
        syncEngine.sync(user.id).catch((error) => {
          console.error('Error syncing after premium upgrade:', error);
        });
      }
    }
  }, [status.initialized, isPremium, canSync, user?.id]);

  return status;
}

