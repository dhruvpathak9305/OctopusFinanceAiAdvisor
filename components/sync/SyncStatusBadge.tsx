/**
 * =============================================================================
 * SYNC STATUS BADGE - Visual Indicator of Sync Health
 * =============================================================================
 * 
 * Shows sync status with color-coded badge (green = synced, yellow = pending, red = errors)
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLocalDb } from '../../services/localDb';

export type SyncStatus = 'synced' | 'pending' | 'error' | 'syncing' | 'unknown';

interface SyncStatusBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  onPress?: () => void;
  style?: any;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  size = 'medium',
  showText = false,
  onPress,
  style,
}) => {
  const [status, setStatus] = useState<SyncStatus>('unknown');
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSyncStatus();
    
    // Refresh every 10 seconds
    const interval = setInterval(loadSyncStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadSyncStatus = async () => {
    try {
      const db = await getLocalDb();
      
      // Get pending jobs count
      const pendingResult = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM sync_jobs WHERE status = 'pending'`
      );
      const pending = pendingResult?.count || 0;
      
      // Get failed jobs count
      const failedResult = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM sync_jobs WHERE status = 'failed'`
      );
      const failed = failedResult?.count || 0;
      
      setPendingCount(pending);
      setFailedCount(failed);
      
      // Determine overall status
      if (failed > 0) {
        setStatus('error');
      } else if (pending > 0) {
        setStatus('pending');
      } else {
        setStatus('synced');
      }
    } catch (error) {
      console.error('Error loading sync status:', error);
      setStatus('unknown');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (): string => {
    switch (status) {
      case 'synced':
        return '#10B981'; // Green
      case 'pending':
        return '#F59E0B'; // Yellow/Orange
      case 'error':
        return '#EF4444'; // Red
      case 'syncing':
        return '#3B82F6'; // Blue
      default:
        return '#9CA3AF'; // Gray
    }
  };

  const getStatusIcon = (): string => {
    switch (status) {
      case 'synced':
        return 'checkmark-circle';
      case 'pending':
        return 'time-outline';
      case 'error':
        return 'close-circle';
      case 'syncing':
        return 'sync';
      default:
        return 'help-circle-outline';
    }
  };

  const getStatusText = (): string => {
    switch (status) {
      case 'synced':
        return 'Synced';
      case 'pending':
        return `${pendingCount} pending`;
      case 'error':
        return `${failedCount} failed`;
      case 'syncing':
        return 'Syncing...';
      default:
        return 'Unknown';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { dotSize: 8, iconSize: 12, fontSize: 10 };
      case 'large':
        return { dotSize: 12, iconSize: 20, fontSize: 14 };
      default:
        return { dotSize: 10, iconSize: 16, fontSize: 12 };
    }
  };

  const sizeStyles = getSizeStyles();
  const color = getStatusColor();

  const content = (
    <View style={[styles.container, style]}>
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <>
          <View
            style={[
              styles.dot,
              {
                width: sizeStyles.dotSize,
                height: sizeStyles.dotSize,
                borderRadius: sizeStyles.dotSize / 2,
                backgroundColor: color,
              },
            ]}
          />
          {showText && (
            <Text style={[styles.text, { fontSize: sizeStyles.fontSize, color }]}>
              {getStatusText()}
            </Text>
          )}
        </>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  text: {
    fontWeight: '600',
  },
});

