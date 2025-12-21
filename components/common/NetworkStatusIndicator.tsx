/**
 * Network Status Indicator Component
 * Shows WiFi icon for online, sync icon for offline, with better visual feedback
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import networkMonitor from '../../services/sync/networkMonitor';
import { NetworkStatus } from '../../services/sync/networkMonitor';

interface NetworkStatusIndicatorProps {
  size?: number;
  showTooltip?: boolean;
  onPress?: () => void;
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({ 
  size = 18,
  showTooltip = false,
  onPress,
}) => {
  const [status, setStatus] = useState<NetworkStatus>('unknown');
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    // Get initial status
    networkMonitor.getStatus().then((newStatus) => {
      setStatus(newStatus);
      setIsPulsing(newStatus === 'online');
    });

    // Listen for status changes
    const unsubscribe = networkMonitor.addListener((newStatus) => {
      setStatus(newStatus);
      setIsPulsing(newStatus === 'online');
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const getIconName = () => {
    switch (status) {
      case 'online':
        return 'wifi';
      case 'offline':
        return 'cloud-offline';
      default:
        return 'help-circle';
    }
  };

  const getIconColor = () => {
    switch (status) {
      case 'online':
        return '#10b981'; // green
      case 'offline':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[
        styles.container,
        isPulsing && styles.pulsing,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={getIconName()}
        size={size}
        color={getIconColor()}
      />
      {showTooltip && (
        <View style={styles.tooltip}>
          <View style={styles.tooltipContent}>
            <Ionicons
              name={getIconName()}
              size={14}
              color={getIconColor()}
            />
            <View style={styles.tooltipText}>
              <Text style={styles.tooltipTitle}>
                {status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : 'Unknown'}
              </Text>
              <Text style={styles.tooltipSubtitle}>
                {status === 'online' 
                  ? 'Connected to Supabase' 
                  : status === 'offline' 
                  ? 'Working offline' 
                  : 'Checking connection...'}
              </Text>
            </View>
          </View>
        </View>
      )}
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulsing: {
    // Subtle pulse animation - handled by opacity changes
    opacity: 1,
  },
  tooltip: {
    position: 'absolute',
    top: -50,
    right: -20,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 8,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  tooltipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tooltipText: {
    flex: 1,
  },
  tooltipTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tooltipSubtitle: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 2,
  },
});

