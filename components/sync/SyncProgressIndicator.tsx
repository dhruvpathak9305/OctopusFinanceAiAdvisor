/**
 * =============================================================================
 * SYNC PROGRESS INDICATOR - Real-time Sync Progress Display
 * =============================================================================
 * 
 * Shows real-time progress during sync operations with progress bar and status
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import syncEngine from '../../services/sync/syncEngine';
import networkMonitor from '../../services/sync/networkMonitor';

interface SyncProgress {
  isActive: boolean;
  progress: number; // 0-100
  currentTable?: string;
  recordsProcessed: number;
  totalRecords: number;
  status: 'pushing' | 'pulling' | 'idle';
  error?: string;
}

export const SyncProgressIndicator: React.FC = () => {
  const { isDark } = useTheme();
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    isActive: false,
    progress: 0,
    recordsProcessed: 0,
    totalRecords: 0,
    status: 'idle',
  });
  const [animatedProgress] = useState(new Animated.Value(0));

  useEffect(() => {
    // Listen for sync events
    const checkSyncStatus = async () => {
      const isOnline = networkMonitor.isCurrentlyOnline();
      
      if (!isOnline) {
        setSyncProgress(prev => ({ ...prev, isActive: false, status: 'idle' }));
        return;
      }

      // Check if sync is in progress (this would need to be implemented in syncEngine)
      // For now, we'll use a simple polling approach
    };

    const interval = setInterval(checkSyncStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Animate progress bar
    Animated.timing(animatedProgress, {
      toValue: syncProgress.progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [syncProgress.progress]);

  const colors = {
    background: isDark ? '#1F2937' : '#FFFFFF',
    card: isDark ? '#374151' : '#F9FAFB',
    text: isDark ? '#FFFFFF' : '#111827',
    textSecondary: isDark ? '#9CA3AF' : '#6B7280',
    primary: '#3B82F6',
    success: '#10B981',
    error: '#EF4444',
    border: isDark ? '#4B5563' : '#E5E7EB',
  };

  if (!syncProgress.isActive) {
    return null;
  }

  const progressWidth = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal
      transparent
      visible={syncProgress.isActive}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Ionicons
              name={syncProgress.status === 'pushing' ? 'cloud-upload' : 'cloud-download'}
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.title, { color: colors.text }]}>
              {syncProgress.status === 'pushing' ? 'Syncing to Server' : 'Syncing from Server'}
            </Text>
          </View>

          {syncProgress.error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="close-circle" size={20} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>
                {syncProgress.error}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: progressWidth,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                  {syncProgress.progress.toFixed(0)}%
                </Text>
              </View>

              {syncProgress.currentTable && (
                <Text style={[styles.tableText, { color: colors.textSecondary }]}>
                  Syncing: {syncProgress.currentTable}
                </Text>
              )}

              {syncProgress.totalRecords > 0 && (
                <Text style={[styles.recordsText, { color: colors.textSecondary }]}>
                  {syncProgress.recordsProcessed} / {syncProgress.totalRecords} records
                </Text>
              )}
            </>
          )}

          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.loader}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 45,
  },
  tableText: {
    fontSize: 12,
    marginBottom: 4,
  },
  recordsText: {
    fontSize: 12,
    marginBottom: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  loader: {
    marginTop: 8,
  },
});


