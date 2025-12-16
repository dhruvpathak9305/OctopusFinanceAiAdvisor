/**
 * =============================================================================
 * ONLINE STATUS INDICATOR - CONNECTIVITY STATUS UI COMPONENT
 * =============================================================================
 * 
 * Displays online/offline status indicator in the UI.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import networkMonitor from '../../services/sync/networkMonitor';
import { NetworkStatus } from '../../services/sync/networkMonitor';

interface OnlineStatusIndicatorProps {
  showLabel?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  onPress?: () => void;
}

export const OnlineStatusIndicator: React.FC<OnlineStatusIndicatorProps> = ({
  showLabel = true,
  position = 'top-right',
  onPress,
}) => {
  const [status, setStatus] = useState<NetworkStatus>('unknown');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Get initial status
    networkMonitor.getStatus().then(setStatus);

    // Listen for status changes
    const unsubscribe = networkMonitor.addListener((newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return '#10b981'; // green
      case 'offline':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const getPositionStyle = () => {
    switch (position) {
      case 'top-right':
        return { top: 10, right: 10 };
      case 'top-left':
        return { top: 10, left: 10 };
      case 'bottom-right':
        return { bottom: 10, right: 10 };
      case 'bottom-left':
        return { bottom: 10, left: 10 };
      default:
        return { top: 10, right: 10 };
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, getPositionStyle()]}
      onPress={() => {
        setIsExpanded(!isExpanded);
        onPress?.();
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.indicator, { backgroundColor: getStatusColor() }]} />
      {showLabel && (
        <Text style={styles.label}>{getStatusText()}</Text>
      )}
      {isExpanded && (
        <View style={styles.details}>
          <Text style={styles.detailsText}>
            Status: {getStatusText()}
          </Text>
          <Text style={styles.detailsText}>
            Network: {status === 'online' ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  details: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 4,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 150,
  },
  detailsText: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
  },
});

