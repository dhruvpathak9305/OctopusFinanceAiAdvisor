/**
 * =============================================================================
 * METRICS COLLECTOR - Performance Metrics Collection Service
 * =============================================================================
 * 
 * Collects and stores performance metrics for queries, sync operations,
 * database size, and other performance-related data.
 */

import { getLocalDb } from '../localDb';

export enum MetricType {
  QUERY = 'query',
  SYNC = 'sync',
  CACHE = 'cache',
  DATABASE = 'database',
  MEMORY = 'memory',
}

export interface PerformanceMetric {
  id?: number;
  metric_type: MetricType;
  metric_name: string;
  value: number;
  metadata?: Record<string, any>;
  timestamp: number;
}

export interface QueryMetric extends PerformanceMetric {
  metric_type: MetricType.QUERY;
  metric_name: string; // e.g., 'transactions_local.findAll'
  value: number; // Execution time in milliseconds
  metadata?: {
    table_name: string;
    filter?: any;
    row_count?: number;
  };
}

export interface SyncMetric extends PerformanceMetric {
  metric_type: MetricType.SYNC;
  metric_name: string; // e.g., 'sync.push', 'sync.pull', 'sync.conflict_resolution'
  value: number; // Duration in milliseconds
  metadata?: {
    table_name?: string;
    records_processed?: number;
    records_per_second?: number;
    conflicts?: number;
  };
}

export interface CacheMetric extends PerformanceMetric {
  metric_type: MetricType.CACHE;
  metric_name: string; // e.g., 'cache.hit', 'cache.miss', 'cache.size'
  value: number;
  metadata?: {
    cache_key?: string;
    table_name?: string;
  };
}

/**
 * Metrics Collector Service
 */
class MetricsCollector {
  private static instance: MetricsCollector;
  private enabled: boolean = true;
  private maxMetrics: number = 10000; // Maximum metrics to keep
  private cleanupInterval: number = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    // Start cleanup interval
    this.startCleanupInterval();
  }

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  /**
   * Record a performance metric
   */
  async record(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      const db = await getLocalDb();
      const timestamp = Date.now();

      await db.runAsync(
        `INSERT INTO performance_metrics (metric_type, metric_name, value, metadata, timestamp)
         VALUES (?, ?, ?, ?, ?)`,
        [
          metric.metric_type,
          metric.metric_name,
          metric.value,
          metric.metadata ? JSON.stringify(metric.metadata) : null,
          timestamp,
        ]
      );

      // Cleanup old metrics periodically
      await this.cleanupOldMetrics();
    } catch (error) {
      console.error('Error recording metric:', error);
      // Don't throw - metrics collection failure shouldn't break the app
    }
  }

  /**
   * Record query execution time
   */
  async recordQuery(
    tableName: string,
    operation: string,
    duration: number,
    metadata?: { filter?: any; row_count?: number }
  ): Promise<void> {
    await this.record({
      metric_type: MetricType.QUERY,
      metric_name: `${tableName}.${operation}`,
      value: duration,
      metadata: {
        table_name: tableName,
        ...metadata,
      },
    });
  }

  /**
   * Record sync operation metrics
   */
  async recordSync(
    operation: string,
    duration: number,
    metadata?: {
      table_name?: string;
      records_processed?: number;
      conflicts?: number;
    }
  ): Promise<void> {
    const recordsPerSecond = metadata?.records_processed && duration > 0
      ? (metadata.records_processed / duration) * 1000
      : undefined;

    await this.record({
      metric_type: MetricType.SYNC,
      metric_name: `sync.${operation}`,
      value: duration,
      metadata: {
        ...metadata,
        records_per_second: recordsPerSecond,
      },
    });
  }

  /**
   * Record cache metrics
   */
  async recordCache(
    event: 'hit' | 'miss' | 'size',
    value: number,
    metadata?: { cache_key?: string; table_name?: string }
  ): Promise<void> {
    await this.record({
      metric_type: MetricType.CACHE,
      metric_name: `cache.${event}`,
      value,
      metadata,
    });
  }

  /**
   * Get metrics for a specific type and time range
   */
  async getMetrics(
    type: MetricType,
    startTime?: number,
    endTime?: number,
    limit: number = 1000
  ): Promise<PerformanceMetric[]> {
    try {
      const db = await getLocalDb();
      let sql = `SELECT * FROM performance_metrics WHERE metric_type = ?`;
      const params: any[] = [type];

      if (startTime) {
        sql += ` AND timestamp >= ?`;
        params.push(startTime);
      }

      if (endTime) {
        sql += ` AND timestamp <= ?`;
        params.push(endTime);
      }

      sql += ` ORDER BY timestamp DESC LIMIT ?`;
      params.push(limit);

      const results = await db.getAllAsync<any>(sql, params);

      return results.map((row) => ({
        id: row.id,
        metric_type: row.metric_type,
        metric_name: row.metric_name,
        value: row.value,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        timestamp: row.timestamp,
      }));
    } catch (error) {
      console.error('Error getting metrics:', error);
      return [];
    }
  }

  /**
   * Get aggregated metrics (average, min, max, count)
   */
  async getAggregatedMetrics(
    type: MetricType,
    metricName: string,
    startTime?: number,
    endTime?: number
  ): Promise<{
    count: number;
    avg: number;
    min: number;
    max: number;
    sum: number;
  }> {
    try {
      const db = await getLocalDb();
      let sql = `
        SELECT 
          COUNT(*) as count,
          AVG(value) as avg,
          MIN(value) as min,
          MAX(value) as max,
          SUM(value) as sum
        FROM performance_metrics
        WHERE metric_type = ? AND metric_name = ?
      `;
      const params: any[] = [type, metricName];

      if (startTime) {
        sql += ` AND timestamp >= ?`;
        params.push(startTime);
      }

      if (endTime) {
        sql += ` AND timestamp <= ?`;
        params.push(endTime);
      }

      const result = await db.getFirstAsync<{
        count: number;
        avg: number;
        min: number;
        max: number;
        sum: number;
      }>(sql, params);

      return result || { count: 0, avg: 0, min: 0, max: 0, sum: 0 };
    } catch (error) {
      console.error('Error getting aggregated metrics:', error);
      return { count: 0, avg: 0, min: 0, max: 0, sum: 0 };
    }
  }

  /**
   * Cleanup old metrics
   */
  private async cleanupOldMetrics(): Promise<void> {
    try {
      const db = await getLocalDb();

      // Get total count
      const countResult = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM performance_metrics'
      );
      const count = countResult?.count || 0;

      if (count > this.maxMetrics) {
        // Delete oldest metrics
        const toDelete = count - this.maxMetrics;
        await db.runAsync(
          `DELETE FROM performance_metrics 
           WHERE id IN (
             SELECT id FROM performance_metrics 
             ORDER BY timestamp ASC 
             LIMIT ?
           )`,
          [toDelete]
        );
      }
    } catch (error) {
      console.error('Error cleaning up old metrics:', error);
    }
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupOldMetrics();
    }, this.cleanupInterval);
  }

  /**
   * Enable/disable metrics collection
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Clear all metrics
   */
  async clearAll(): Promise<void> {
    try {
      const db = await getLocalDb();
      await db.runAsync('DELETE FROM performance_metrics');
    } catch (error) {
      console.error('Error clearing metrics:', error);
    }
  }
}

export default MetricsCollector.getInstance();

