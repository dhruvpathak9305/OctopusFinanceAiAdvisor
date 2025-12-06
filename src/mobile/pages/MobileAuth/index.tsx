import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MobileAuthForm from '../../components/auth/MobileAuthForm';
import { useUnifiedAuth } from '../../../../contexts/UnifiedAuthContext';

const MobileAuth: React.FC = () => {
  const navigation = useNavigation();
  const { isAuthenticated } = useUnifiedAuth();

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigation.navigate('Main' as never);
    }
  }, [isAuthenticated, navigation]);

  // Note: We don't show a loading screen here - the form has its own loading indicator

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>📈</Text>
          </View>
          <Text style={styles.title}>Welcome to Octopus Financer</Text>
          <Text style={styles.subtitle}>Your personal finance assistant</Text>
        </View>

        {/* Auth Form Component */}
        <View style={styles.authCard}>
          <MobileAuthForm />
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Why Choose OctopusFinancer?</Text>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>📊</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Smart Budget Tracking</Text>
              <Text style={styles.featureDescription}>
                Automatically categorize transactions and get insights on your spending habits.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🎯</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Financial Goal Planning</Text>
              <Text style={styles.featureDescription}>
                Set savings goals and track your progress with visual dashboards.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🧠</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>AI-Powered Insights</Text>
              <Text style={styles.featureDescription}>
                Get personalized recommendations to optimize your financial decisions.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1426',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#9CA3AF',
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#10B981',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 18,
    color: '#000000',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  authCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  featureIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureIcon: {
    fontSize: 12,
    color: '#10B981',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
  },
});

export default MobileAuth; 