/**
 * Compact Network Status Dot Component
 * Shows green dot for online, red dot for offline
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import networkMonitor from '../../services/sync/networkMonitor';

interface NetworkStatusDotProps {
  size?: number;
}

export const NetworkStatusDot: React.FC<NetworkStatusDotProps> = ({ size = 8 }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Get initial status
    networkMonitor.getStatus().then((status) => {
      setIsOnline(status === 'online');
    });

    // Listen for status changes
    const unsubscribe = networkMonitor.addListener((newStatus) => {
      setIsOnline(newStatus === 'online');
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isOnline ? '#10b981' : '#ef4444', // green : red
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  dot: {
    marginLeft: 6,
  },
});

