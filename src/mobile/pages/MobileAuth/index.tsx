import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import MobileAuthForm from '../../components/auth/MobileAuthForm';
import { useUnifiedAuth } from '../../../../contexts/UnifiedAuthContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { Logo } from '../../../../components/common/Logo';

const MobileAuth: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { isAuthenticated } = useUnifiedAuth();
  const { isDark } = useTheme();
  
  // Get initial mode from route params
  const initialMode = (route.params as any)?.mode || 'login';

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (isAuthenticated) {
      // Reset navigation stack to Main with Dashboard tab, closing the Auth modal
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'Main',
              params: { initialTab: 'Dashboard' },
            },
          ],
        })
      );
    }
  }, [isAuthenticated, navigation]);

  // Note: We don't show a loading screen here - the form has its own loading indicator

  const colors = isDark ? {
    background: '#0B1426',
    surface: '#1F2937',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
  } : {
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <Logo size={64} animated={true} />
          <Text style={[styles.title, { color: colors.text }]}>Welcome to Octopus Organizer</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your personal finance assistant</Text>
        </View>

        {/* Auth Form Component */}
        <View style={[styles.authCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MobileAuthForm initialMode={initialMode} />
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={[styles.featuresTitle, { color: colors.text }]}>Why Choose Octopus Organizer?</Text>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>📊</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Smart Budget Tracking</Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                Automatically categorize transactions and get insights on your spending habits.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🎯</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Financial Goal Planning</Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                Set savings goals and track your progress with visual dashboards.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🧠</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>AI-Powered Insights</Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
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
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
});

export default MobileAuth; 