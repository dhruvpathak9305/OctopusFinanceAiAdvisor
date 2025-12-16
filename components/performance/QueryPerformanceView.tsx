/**
 * =============================================================================
 * QUERY PERFORMANCE VIEW - Detailed Query Performance Metrics
 * =============================================================================
 * 
 * Lists slow queries, shows query execution times, displays query frequency,
 * and allows filtering by date range.
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
import metricsCollector, { MetricType, PerformanceMetric } from '../../services/performance/metricsCollector';
import { useTheme } from '../../contexts/ThemeContext';

export const QueryPerformanceView: React.FC = () => {
  const { isDark } = useTheme();
  const [queries, setQueries] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

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
    loadQueries();
  }, [timeRange]);

  const getTimeRangeMs = (range: string): number => {
    const now = Date.now();
    switch (range) {
      case '1h':
        return now - 60 * 60 * 1000;
      case '24h':
        return now - 24 * 60 * 60 * 1000;
      case '7d':
        return now - 7 * 24 * 60 * 60 * 1000;
      case '30d':
        return now - 30 * 24 * 60 * 60 * 1000;
      default:
        return now - 24 * 60 * 60 * 1000;
    }
  };

  const loadQueries = async () => {
    try {
      setLoading(true);
      const startTime = getTimeRangeMs(timeRange);
      const metrics = await metricsCollector.getMetrics(MetricType.QUERY, startTime);
      
      // Sort by value (execution time) descending
      const sorted = metrics.sort((a, b) => b.value - a.value);
      setQueries(sorted);
    } catch (error) {
      console.error('Error loading query metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const getPerformanceColor = (duration: number): string => {
    if (duration > 1000) return colors.error;
    if (duration > 500) return colors.warning;
    if (duration > 100) return colors.warning;
    return colors.success;
  };

  if (loading && queries.length === 0) {
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
        <RefreshControl refreshing={refreshing} onRefresh={loadQueries} />
      }
    >
      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        {(['1h', '24h', '7d', '30d'] as const).map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              {
                backgroundColor: timeRange === range ? colors.primary : colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setTimeRange(range)}
          >
            <Text
              style={[
                styles.timeRangeButtonText,
                { color: timeRange === range ? '#FFFFFF' : colors.text },
              ]}
            >
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Query List */}
      <View style={styles.content}>
        {queries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No query metrics found
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Query performance data will appear here
            </Text>
          </View>
        ) : (
          queries.map((query) => (
            <View
              key={query.id}
              style={[styles.queryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.queryHeader}>
                <Text style={[styles.queryName, { color: colors.text }]}>
                  {query.metric_name}
                </Text>
                <View
                  style={[
                    styles.durationBadge,
                    { backgroundColor: getPerformanceColor(query.value) + '20' },
                  ]}
                >
                  <Text
                    style={[styles.durationText, { color: getPerformanceColor(query.value) }]}
                  >
                    {formatDuration(query.value)}
                  </Text>
                </View>
              </View>
              {query.metadata && (
                <View style={styles.metadataContainer}>
                  {query.metadata.table_name && (
                    <Text style={[styles.metadataText, { color: colors.textSecondary }]}>
                      Table: {query.metadata.table_name}
                    </Text>
                  )}
                  {query.metadata.row_count !== undefined && (
                    <Text style={[styles.metadataText, { color: colors.textSecondary }]}>
                      Rows: {query.metadata.row_count}
                    </Text>
                  )}
                </View>
              )}
              <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
                {formatDate(query.timestamp)}
              </Text>
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
  timeRangeContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  timeRangeButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  timeRangeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  queryCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  queryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  queryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  durationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metadataContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metadataText: {
    fontSize: 12,
  },
  timestamp: {
    fontSize: 11,
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

