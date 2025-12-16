/**
 * =============================================================================
 * SYNC QUEUE VIEW - Display Pending Sync Jobs
 * =============================================================================
 * 
 * UI component to show pending sync jobs with ability to retry failed syncs
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLocalDb } from '../../services/localDb';
import syncEngine from '../../services/sync/syncEngine';
import { formatSyncError, getErrorIcon } from '../../services/sync/syncErrorHandler';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface SyncJob {
  id: number;
  table_name: string;
  record_id: string;
  operation: 'create' | 'update' | 'delete';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempt: number;
  max_attempts: number;
  error_message: string | null;
  created_at: number;
  updated_at: number;
}

interface SyncQueueStats {
  pending: number;
  processing: number;
  failed: number;
  completed: number;
}

export const SyncQueueView: React.FC = () => {
  const { user } = useUnifiedAuth();
  const { isDark } = useTheme();
  const [jobs, setJobs] = useState<SyncJob[]>([]);
  const [stats, setStats] = useState<SyncQueueStats>({
    pending: 0,
    processing: 0,
    failed: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [retryingJobId, setRetryingJobId] = useState<number | null>(null);

  const colors = {
    background: isDark ? '#1F2937' : '#FFFFFF',
    card: isDark ? '#374151' : '#F9FAFB',
    text: isDark ? '#FFFFFF' : '#111827',
    textSecondary: isDark ? '#9CA3AF' : '#6B7280',
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    border: isDark ? '#4B5563' : '#E5E7EB',
  };

  useEffect(() => {
    loadSyncQueue();
  }, []);

  const loadSyncQueue = async () => {
    try {
      const db = await getLocalDb();
      
      // Get all sync jobs
      const allJobs = await db.getAllAsync<SyncJob>(
        `SELECT * FROM sync_jobs ORDER BY created_at DESC LIMIT 100`
      );

      // Calculate stats
      const newStats: SyncQueueStats = {
        pending: allJobs.filter(j => j.status === 'pending').length,
        processing: allJobs.filter(j => j.status === 'processing').length,
        failed: allJobs.filter(j => j.status === 'failed').length,
        completed: allJobs.filter(j => j.status === 'completed').length,
      };

      setJobs(allJobs);
      setStats(newStats);
    } catch (error) {
      console.error('Error loading sync queue:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRetry = async (job: SyncJob) => {
    if (!user?.id) {
      Alert.alert('Error', 'Please sign in to retry sync');
      return;
    }

    setRetryingJobId(job.id);

    try {
      // Reset job status to pending
      const db = await getLocalDb();
      await db.runAsync(
        `UPDATE sync_jobs SET status = 'pending', attempt = 0, error_message = NULL, updated_at = ? WHERE id = ?`,
        [Date.now(), job.id]
      );

      // Trigger sync
      await syncEngine.sync(user.id, { tables: [job.table_name] });

      Alert.alert('Success', 'Sync job queued for retry');
      await loadSyncQueue();
    } catch (error: any) {
      const syncError = formatSyncError(error);
      Alert.alert('Retry Failed', syncError.userMessage);
    } finally {
      setRetryingJobId(null);
    }
  };

  const handleRetryAllFailed = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please sign in to retry sync');
      return;
    }

    try {
      const db = await getLocalDb();
      const failedJobs = jobs.filter(j => j.status === 'failed');
      
      // Reset all failed jobs
      for (const job of failedJobs) {
        await db.runAsync(
          `UPDATE sync_jobs SET status = 'pending', attempt = 0, error_message = NULL, updated_at = ? WHERE id = ?`,
          [Date.now(), job.id]
        );
      }

      // Trigger sync
      await syncEngine.sync(user.id);

      Alert.alert('Success', `Queued ${failedJobs.length} jobs for retry`);
      await loadSyncQueue();
    } catch (error: any) {
      const syncError = formatSyncError(error);
      Alert.alert('Retry Failed', syncError.userMessage);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'processing':
        return colors.primary;
      case 'failed':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'pending':
        return 'time-outline';
      case 'processing':
        return 'sync';
      case 'failed':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadSyncQueue} />
      }
    >
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: colors.warning }]}>
            {stats.pending}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Pending
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {stats.processing}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Processing
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: colors.error }]}>
            {stats.failed}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Failed
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: colors.success }]}>
            {stats.completed}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Completed
          </Text>
        </View>
      </View>

      {/* Retry All Failed Button */}
      {stats.failed > 0 && (
        <TouchableOpacity
          style={[styles.retryAllButton, { backgroundColor: colors.error }]}
          onPress={handleRetryAllFailed}
        >
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.retryAllButtonText}>
            Retry All Failed ({stats.failed})
          </Text>
        </TouchableOpacity>
      )}

      {/* Jobs List */}
      <View style={styles.jobsContainer}>
        {jobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No sync jobs
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              All data is synced
            </Text>
          </View>
        ) : (
          jobs.map((job) => (
            <View
              key={job.id}
              style={[styles.jobCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.jobHeader}>
                <View style={styles.jobHeaderLeft}>
                  <Ionicons
                    name={getStatusIcon(job.status)}
                    size={24}
                    color={getStatusColor(job.status)}
                  />
                  <View style={styles.jobInfo}>
                    <Text style={[styles.jobTable, { color: colors.text }]}>
                      {job.table_name.replace('_local', '')}
                    </Text>
                    <Text style={[styles.jobOperation, { color: colors.textSecondary }]}>
                      {job.operation.toUpperCase()} • {formatDate(job.created_at)}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>
                    {job.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {job.error_message && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} />
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {formatSyncError({ message: job.error_message }).userMessage}
                  </Text>
                </View>
              )}

              {job.status === 'failed' && (
                <TouchableOpacity
                  style={[styles.retryButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleRetry(job)}
                  disabled={retryingJobId === job.id}
                >
                  {retryingJobId === job.id ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="refresh" size={16} color="#FFFFFF" />
                      <Text style={styles.retryButtonText}>Retry</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {job.attempt > 0 && (
                <Text style={[styles.attemptText, { color: colors.textSecondary }]}>
                  Attempt {job.attempt}/{job.max_attempts}
                </Text>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  retryAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    gap: 8,
  },
  retryAllButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  jobsContainer: {
    padding: 16,
    gap: 12,
  },
  jobCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTable: {
    fontSize: 16,
    fontWeight: '600',
  },
  jobOperation: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 8,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    gap: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  attemptText: {
    fontSize: 11,
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
});

