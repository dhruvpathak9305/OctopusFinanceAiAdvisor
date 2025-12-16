/**
 * =============================================================================
 * DEV SYNC MENU - TESTING UTILITIES FOR OFFLINE-FIRST ARCHITECTURE
 * =============================================================================
 * 
 * Development menu for testing sync functionality.
 * Only show in development mode.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { syncSupabaseToLocal, clearLocalDB } from '../../services/testing/syncSupabaseToLocal';
import syncEngine from '../../services/sync/syncEngine';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { getDbStats } from '../../services/localDb';

export const DevSyncMenu: React.FC = () => {
  const { user } = useUnifiedAuth();
  const { isPremium, canSync } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const handleSyncToLocal = async () => {
    setLoading(true);
    try {
      const result = await syncSupabaseToLocal({ limit: 100 });
      Alert.alert(
        'Sync Complete',
        `Synced:\n${Object.entries(result.synced)
          .map(([table, count]) => `${table}: ${count}`)
          .join('\n')}\n\nErrors: ${result.errors.length}`
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLocal = async () => {
    Alert.alert(
      'Clear Local DB',
      'This will delete all local data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await clearLocalDB();
              Alert.alert('Success', 'Local DB cleared');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleManualSync = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    if (!canSync) {
      Alert.alert('Error', 'Cannot sync - not premium or not online');
      return;
    }

    setLoading(true);
    try {
      const result = await syncEngine.sync(user.id, { forceFullSync: true });
      Alert.alert(
        'Sync Complete',
        `Pushed: ${result.pushed}\nPulled: ${result.pulled}\nConflicts: ${result.conflicts}\nErrors: ${result.errors.length}`
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStats = async () => {
    try {
      const dbStats = await getDbStats();
      setStats(dbStats);
      Alert.alert(
        'Local DB Stats',
        `Transactions: ${dbStats.transactionCount}\nAccounts: ${dbStats.accountCount}\nPending Syncs: ${dbStats.pendingSyncCount}`
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (__DEV__ === false) {
    return null; // Only show in development
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dev Sync Menu</Text>
      <Text style={styles.subtitle}>
        Status: {isPremium ? 'Premium' : 'Free'} | Sync: {canSync ? 'Enabled' : 'Disabled'}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSyncToLocal}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sync Supabase → Local DB</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleManualSync}
        disabled={loading || !canSync}
      >
        <Text style={styles.buttonText}>Manual Sync (Local ↔ Supabase)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleViewStats}
        disabled={loading}
      >
        <Text style={styles.buttonText}>View Local DB Stats</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.dangerButton]}
        onPress={handleClearLocal}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Clear Local DB</Text>
      </TouchableOpacity>

      {stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Stats:</Text>
          <Text>Transactions: {stats.transactionCount}</Text>
          <Text>Accounts: {stats.accountCount}</Text>
          <Text>Pending Syncs: {stats.pendingSyncCount}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
});

