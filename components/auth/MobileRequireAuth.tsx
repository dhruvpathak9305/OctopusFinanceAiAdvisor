import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';

interface MobileRequireAuthProps {
  children: React.ReactNode;
}

export default function MobileRequireAuth({ children }: MobileRequireAuthProps) {
  const { user, loading, isAuthenticated } = useUnifiedAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigation.navigate('Auth' as never);
    }
  }, [isAuthenticated, loading, navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B1426',
  },
  loadingText: {
    marginTop: 16,
    color: '#9CA3AF',
    fontSize: 16,
  },
}); 