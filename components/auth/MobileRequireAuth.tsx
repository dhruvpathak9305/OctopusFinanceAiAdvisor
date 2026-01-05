import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Logo } from '../common/Logo';

interface MobileRequireAuthProps {
  children: React.ReactNode;
}

export default function MobileRequireAuth({ children }: MobileRequireAuthProps) {
  const { loading, isAuthenticated } = useUnifiedAuth();
  const { isDark } = useTheme();
  const navigation = useNavigation();

  const colors = isDark ? {
    background: '#0B1426',
    surface: '#1F2937',
    card: '#1F2937',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
    primary: '#10B981',
  } : {
    background: '#FFFFFF',
    surface: '#F9FAFB',
    card: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    primary: '#10B981',
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
      </View>
    );
  }

  // If not authenticated, show a prompt to login instead of blank screen
  if (!isAuthenticated) {
    return (
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Logo and Icon Section */}
          <View style={styles.iconSection}>
            <View style={styles.logoWrapper}>
              <View style={[styles.logoContainer, { borderColor: colors.border }]}>
                <Logo size={100} animated={true} />
              </View>
              <View style={[styles.lockBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="lock-closed" size={20} color={colors.primary} />
              </View>
            </View>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.text }]}>Sign in Required</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Please sign in or create an account to access this feature
            </Text>
          </View>

          {/* Benefits Card */}
          <View style={[styles.benefitsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.benefitsTitle, { color: colors.text }]}>What you'll get:</Text>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                Track all your financial transactions
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                Manage budgets and goals
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                Get AI-powered insights
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            <TouchableOpacity 
              style={styles.buttonBase}
              onPress={() => navigation.navigate('Auth' as never)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Sign In</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.buttonBase, styles.outlineButton, { borderColor: colors.border }]}
              onPress={() => {
                (navigation as any).navigate('Auth', { mode: 'signup' });
              }}
              activeOpacity={0.7}
            >
              <View style={styles.outlineButtonContent}>
                <Ionicons name="person-add-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
                  Sign Up
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  lockBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  benefitsCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  benefitText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  actionsSection: {
    width: '100%',
    maxWidth: 340,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
  },
  buttonBase: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    paddingHorizontal: 24,
    gap: 8,
  },
  outlineButton: {
    borderWidth: 2,
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  outlineButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    paddingHorizontal: 24,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
