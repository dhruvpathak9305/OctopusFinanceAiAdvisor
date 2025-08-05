import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';

const MobileHome: React.FC = () => {
  const navigation = useNavigation();
  const { isDark, toggleTheme } = useTheme();

  const handleGetStarted = () => {
    // Navigate to Dashboard within the mobile app
    navigation.navigate('Dashboard' as never);
  };

  // Get theme colors
  const colors = isDark ? {
    background: '#0B1426',
    surface: '#1F2937',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
    card: '#1F2937',
  } : {
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    card: '#FFFFFF',
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={[styles.heroTitle, { color: colors.text }]}>Take control of</Text>
        <Text style={styles.heroTitleAccent}>your financial future</Text>
        <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
          OctopusFinancer helps you track, budget, and optimize your finances with powerful AI insights.
        </Text>
        
        {/* Feature List */}
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📈</Text>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Smart Transaction Analysis</Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                Automatically categorize and analyze your spending patterns
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🤖</Text>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>AI Financial Advisor</Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                Get personalized recommendations to improve your financial health
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🏛️</Text>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Multi-Account Management</Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                Connect and manage all your financial accounts in one place
              </Text>
            </View>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.heroActions}>
          <TouchableOpacity style={styles.tryDemoButton} onPress={handleGetStarted}>
            <Text style={styles.tryDemoButtonText}>Try Demo →</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.learnMoreButton, { borderColor: colors.border }]}>
            <Text style={[styles.learnMoreButtonText, { color: colors.text }]}>Learn More</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dashboard Preview */}
      <View style={styles.dashboardPreview}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle}>Dashboard Preview</Text>
          <Text style={styles.previewSubtitle}>Get instant insights into your financial health</Text>
        </View>
        
        <View style={styles.budgetBreakdown}>
          <View style={styles.budgetCard}>
            <Text style={styles.budgetLabel}>Needs</Text>
            <Text style={styles.budgetPercentage}>65% of budget</Text>
            <View style={styles.budgetBar}>
              <View style={[styles.budgetProgress, { width: '65%', backgroundColor: '#34D399' }]} />
            </View>
          </View>
          
          <View style={styles.budgetCard}>
            <Text style={styles.budgetLabel}>Wants</Text>
            <Text style={styles.budgetPercentage}>30% of budget</Text>
            <View style={styles.budgetBar}>
              <View style={[styles.budgetProgress, { width: '30%', backgroundColor: '#34D399' }]} />
            </View>
          </View>
          
          <View style={styles.budgetCard}>
            <Text style={styles.budgetLabel}>Save</Text>
            <Text style={styles.budgetPercentage}>5% of budget</Text>
            <View style={styles.budgetBar}>
              <View style={[styles.budgetProgress, { width: '5%', backgroundColor: '#34D399' }]} />
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.dashboardButton} onPress={handleGetStarted}>
          <Text style={styles.dashboardButtonText}>Go to Dashboard →</Text>
        </TouchableOpacity>
      </View>

      {/* Powerful Features Section */}
      <View style={styles.featuresSection}>
        <Text style={[styles.featuresTitle, { color: colors.text }]}>Powerful Features for Better Finance</Text>
        <Text style={[styles.featuresSubtitle, { color: colors.textSecondary }]}>
          OctopusFinancer combines smart app automation with powerful insights.
        </Text>
        
        <View style={styles.featureCards}>
          <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
            <Text style={styles.cardIcon}>📊</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Smart Budgeting</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Effortlessly create and manage budgets based on the 50/30/20 rule or customize to fit your financial goals.
            </Text>
          </View>
          
          <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
            <Text style={styles.cardIcon}>🧠</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>AI-Powered Insights</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Get personalized recommendations and insights powered by advanced AI patterns from your spending data.
            </Text>
          </View>
          
          <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
            <Text style={styles.cardIcon}>🏷️</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Automatic Categorization</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Transactions are automatically categorized using machine learning, saving you hours of manual work.
            </Text>
          </View>
        </View>
      </View>

      {/* Testimonials */}
      <View style={styles.testimonialsSection}>
        <Text style={[styles.testimonialsTitle, { color: colors.text }]}>What Our Users Say</Text>
        <Text style={[styles.testimonialsSubtitle, { color: colors.textSecondary }]}>
          Join thousands who've transformed their finances with OctopusFinancer.
        </Text>
        
        <View style={styles.testimonialCards}>
          <View style={[styles.testimonialCard, { backgroundColor: colors.card }]}>
            <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
            <Text style={[styles.testimonialText, { color: colors.text }]}>
              "OctopusFinancer helped me save an extra $470 each month by identifying unnecessary subscriptions."
            </Text>
            <Text style={[styles.testimonialAuthor, { color: colors.textSecondary }]}>Sarah J. Marketing Specialist</Text>
          </View>
          
          <View style={[styles.testimonialCard, { backgroundColor: colors.card }]}>
            <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
            <Text style={[styles.testimonialText, { color: colors.text }]}>
              "The AI categorization is incredibly accurate. I no longer spend hours organizing expenses."
            </Text>
            <Text style={[styles.testimonialAuthor, { color: colors.textSecondary }]}>Michael T. Software Engineer</Text>
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <View style={[styles.ctaSection, { backgroundColor: colors.surface }]}>
        <Text style={[styles.ctaTitle, { color: colors.text }]}>Ready to Transform Your Finances?</Text>
        <Text style={[styles.ctaSubtitle, { color: colors.textSecondary }]}>
          Join OctopusFinancer today and start your journey toward financial wellness with AI-powered insights.
        </Text>
        
        <TouchableOpacity style={styles.ctaButton} onPress={handleGetStarted}>
          <Text style={styles.ctaButtonText}>Get Started For Free</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.plansButton, { borderColor: colors.border }]}>
          <Text style={[styles.plansButtonText, { color: colors.text }]}>View Plans</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor will be set dynamically
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 46,
    letterSpacing: -0.5,
    // Enhanced font rendering for crispness
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroTitleAccent: {
    fontSize: 38,
    fontWeight: '800',
    color: '#10B981',
    lineHeight: 46,
    letterSpacing: -0.5,
    marginBottom: 20,
    // Enhanced font rendering for crispness
    textShadowColor: 'rgba(16, 185, 129, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroSubtitle: {
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 40,
    fontWeight: '500',
    letterSpacing: 0.2,
    // Enhanced font rendering
    textShadowColor: 'rgba(156, 163, 175, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  featureList: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.1,
    // Enhanced font rendering
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  featureDescription: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    letterSpacing: 0.1,
    // Enhanced font rendering
    textShadowColor: 'rgba(156, 163, 175, 0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 16,
  },
  tryDemoButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
    flex: 1,
    elevation: 3,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tryDemoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
    // Enhanced font rendering
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  learnMoreButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
    flex: 1,
  },
  learnMoreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.1,
    // Enhanced font rendering
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  dashboardPreview: {
    backgroundColor: '#10B981',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
    elevation: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  previewHeader: {
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 6,
    letterSpacing: 0.1,
    // Enhanced font rendering
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  previewSubtitle: {
    fontSize: 15,
    color: '#065F46',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  budgetBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  budgetCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    padding: 14,
  },
  budgetLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  budgetPercentage: {
    fontSize: 13,
    color: '#065F46',
    marginBottom: 10,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  budgetBar: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 3,
  },
  budgetProgress: {
    height: 5,
    borderRadius: 3,
  },
  dashboardButton: {
    backgroundColor: '#065F46',
    paddingVertical: 14,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#065F46',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dashboardButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
    // Enhanced font rendering
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  featuresSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.3,
    // Enhanced font rendering
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuresSubtitle: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 26,
    fontWeight: '500',
    letterSpacing: 0.1,
    // Enhanced font rendering
    textShadowColor: 'rgba(156, 163, 175, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  featureCards: {
    gap: 20,
  },
  featureCard: {
    borderRadius: 14,
    padding: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.1,
    // Enhanced font rendering
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  cardDescription: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '500',
    letterSpacing: 0.1,
    // Enhanced font rendering
    textShadowColor: 'rgba(156, 163, 175, 0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  testimonialsSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  testimonialsTitle: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.3,
    // Enhanced font rendering
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  testimonialsSubtitle: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 26,
    fontWeight: '500',
    letterSpacing: 0.1,
    // Enhanced font rendering
    textShadowColor: 'rgba(156, 163, 175, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  testimonialCards: {
    gap: 20,
  },
  testimonialCard: {
    borderRadius: 14,
    padding: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stars: {
    fontSize: 18,
    marginBottom: 16,
  },
  testimonialText: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 16,
    fontWeight: '500',
    letterSpacing: 0.1,
    // Enhanced font rendering
    textShadowColor: 'rgba(255, 255, 255, 0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  testimonialAuthor: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
    // Enhanced font rendering
    textShadowColor: 'rgba(156, 163, 175, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  ctaSection: {
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 28,
    marginBottom: 40,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  ctaTitle: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.2,
    // Enhanced font rendering
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ctaSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0.1,
    // Enhanced font rendering
    textShadowColor: 'rgba(156, 163, 175, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  ctaButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
    // Enhanced font rendering
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  plansButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
  },
  plansButtonText: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.1,
    // Enhanced font rendering
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});

export default MobileHome; 