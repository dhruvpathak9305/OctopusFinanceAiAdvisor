/**
 * =============================================================================
 * PERFORMANCE DASHBOARD - Performance Metrics Display
 * =============================================================================
 * 
 * Displays query performance stats, sync performance metrics,
 * database size, cache hit rates, and allows exporting metrics.
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import metricsCollector, { MetricType } from '../../services/performance/metricsCollector';
import { getQueryCache } from '../../services/repositories/queryCache';
import { getLocalDb } from '../../services/localDb';
import { useTheme } from '../../contexts/ThemeContext';

interface PerformanceStats {
  queryAvg: number;
  queryMax: number;
  queryCount: number;
  syncAvg: number;
  syncMax: number;
  syncCount: number;
  cacheHitRate: number;
  databaseSize: number;
}

export const PerformanceDashboard: React.FC = () => {
  const { isDark } = useTheme();
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Get query metrics (last 24 hours)
      const queryMetrics = await metricsCollector.getAggregatedMetrics(
        MetricType.QUERY,
        'transactions_local.findAll',
        Date.now() - 24 * 60 * 60 * 1000
      );

      // Get sync metrics (last 24 hours) - use total_sync metric name
      const syncMetrics = await metricsCollector.getAggregatedMetrics(
        MetricType.SYNC,
        'sync.total_sync',
        Date.now() - 24 * 60 * 60 * 1000
      );

      // Get cache stats
      const cache = getQueryCache();
      const cacheStats = cache.getStats();

      // Get database size (approximate)
      const db = await getLocalDb();
      const dbSizeResult = await db.getFirstAsync<{ size: number }>(
        `SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()`
      );
      const databaseSize = dbSizeResult?.size || 0;

      setStats({
        queryAvg: queryMetrics.avg || 0,
        queryMax: queryMetrics.max || 0,
        queryCount: queryMetrics.count || 0,
        syncAvg: syncMetrics.avg || 0,
        syncMax: syncMetrics.max || 0,
        syncCount: syncMetrics.count || 0,
        cacheHitRate: cacheStats.hitRate, // Now using actual hit rate from cache
        databaseSize: databaseSize / 1024 / 1024, // Convert to MB
      });
    } catch (error) {
      console.error('Error loading performance stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatSize = (mb: number): string => {
    if (mb < 1) return `${(mb * 1024).toFixed(2)} KB`;
    return `${mb.toFixed(2)} MB`;
  };

  if (loading && !stats) {
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
        <RefreshControl refreshing={refreshing} onRefresh={loadStats} />
      }
    >
      <View style={styles.content}>
        {/* Query Performance */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="speedometer" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Query Performance</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Average Time</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatDuration(stats?.queryAvg || 0)}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Max Time</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatDuration(stats?.queryMax || 0)}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Queries</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats?.queryCount || 0}
            </Text>
          </View>
        </View>

        {/* Sync Performance */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="sync" size={24} color={colors.success} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Sync Performance</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Average Duration</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatDuration(stats?.syncAvg || 0)}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Max Duration</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatDuration(stats?.syncMax || 0)}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Syncs</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats?.syncCount || 0}
            </Text>
          </View>
        </View>

        {/* Cache Stats */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="layers" size={24} color={colors.warning} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Cache Statistics</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Cache Size</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {getQueryCache().getStats().size} entries
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Max Size</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {getQueryCache().getStats().maxSize} entries
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Hit Rate</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats?.cacheHitRate.toFixed(1) || '0.0'}%
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Hits / Misses</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {getQueryCache().getStats().hits} / {getQueryCache().getStats().misses}
            </Text>
          </View>
        </View>

        {/* Database Size */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="server" size={24} color={colors.error} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Database Size</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Size</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatSize(stats?.databaseSize || 0)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={async () => {
            await metricsCollector.clearAll();
            await loadStats();
          }}
        >
          <Ionicons name="trash" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Clear Metrics</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

