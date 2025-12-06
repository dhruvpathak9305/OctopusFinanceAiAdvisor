import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';

interface MobileRequireAuthProps {
  children: React.ReactNode;
}

export default function MobileRequireAuth({ children }: MobileRequireAuthProps) {
  const { loading, isAuthenticated } = useUnifiedAuth();
  const navigation = useNavigation();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If not authenticated, show a prompt to login instead of blank screen
  if (!isAuthenticated) {
    return (
      <View style={styles.unauthContainer}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.unauthTitle}>Sign in Required</Text>
        <Text style={styles.unauthSubtitle}>
          Please sign in or create an account to access this feature
        </Text>
        <TouchableOpacity 
          style={styles.signInButton}
          onPress={() => navigation.navigate('Auth' as never)}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.exploreButton}
          onPress={() => {
            // Navigate to Home tab - this requires parent to handle
            // For now, just dismiss or go back
          }}
        >
          <Text style={styles.exploreButtonText}>Explore First</Text>
        </TouchableOpacity>
      </View>
    );
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
  unauthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B1426',
    padding: 32,
  },
  lockIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  unauthTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  unauthSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  signInButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    maxWidth: 280,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  exploreButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#374151',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    maxWidth: 280,
  },
  exploreButtonText: {
    color: '#9CA3AF',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 