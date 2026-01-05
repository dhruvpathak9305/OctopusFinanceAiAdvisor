import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { Logo } from '../common/Logo';

export const WebHomeContent: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  
  const handleGetStarted = () => {
    router.push('/(dashboard)');
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Theme Toggle */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <Logo size={56} showText={true} animated={true} />
          <TouchableOpacity 
            style={[styles.themeToggle, { backgroundColor: colors.surface, borderColor: colors.border }]} 
            onPress={toggleTheme}
          >
            <Text style={styles.themeIcon}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Section with Two Columns */}
      <View style={styles.heroContainer}>
        <View style={styles.heroLeft}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Take control of</Text>
          <Text style={styles.heroTitleAccent}>your financial future</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Octopus Organizer helps you track, budget, and optimize your finances with powerful AI insights.
          </Text>
          
          {/* Feature List */}
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>→</Text>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>Smart Transaction Analysis</Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  Automatically categorize and analyze your spending patterns
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>→</Text>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>AI Financial Advisor</Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  Get personalized recommendations to improve your financial health
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>→</Text>
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
              <Text style={styles.tryDemoButtonText}>Try Demo Dashboard →</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.learnMoreButton, { borderColor: colors.border }]}>
              <Text style={[styles.learnMoreButtonText, { color: colors.text }]}>Learn More</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dashboard Preview - Right Side */}
        <View style={styles.heroRight}>
          <View style={styles.dashboardPreview}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Dashboard Preview</Text>
              <Text style={styles.previewSubtitle}>Get immediate insights into your financial health</Text>
            </View>
            
            <View style={styles.budgetBreakdown}>
              <View style={styles.budgetCard}>
                <Text style={styles.budgetLabel}>Needs</Text>
                <Text style={styles.budgetPercentage}>65% of budget</Text>
                <View style={styles.budgetBar}>
                  <View style={[styles.budgetProgress, { width: '65%' }]} />
                </View>
              </View>
              
              <View style={styles.budgetCard}>
                <Text style={styles.budgetLabel}>Wants</Text>
                <Text style={styles.budgetPercentage}>40% of budget</Text>
                <View style={styles.budgetBar}>
                  <View style={[styles.budgetProgress, { width: '40%' }]} />
                </View>
              </View>
              
              <View style={styles.budgetCard}>
                <Text style={styles.budgetLabel}>Save</Text>
                <Text style={styles.budgetPercentage}>25% of budget</Text>
                <View style={styles.budgetBar}>
                  <View style={[styles.budgetProgress, { width: '25%' }]} />
                </View>
              </View>
            </View>
            
            <TouchableOpacity style={styles.dashboardButton} onPress={handleGetStarted}>
              <Text style={styles.dashboardButtonText}>Go to Dashboard →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Powerful Features Section */}
      <View style={styles.featuresSection}>
        <Text style={[styles.featuresTitle, { color: colors.text }]}>Powerful Features for Better Finance</Text>
        <Text style={[styles.featuresSubtitle, { color: colors.textSecondary }]}>
          Octopus Organizer combines intelligent automation with powerful insights to help you achieve financial freedom.
        </Text>
        
        <View style={styles.featureGrid}>
          <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
            <Text style={styles.cardIcon}>📊</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Smart Budgeting</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Effortlessly create and manage budgets based on the 50/30/20 rule or customize to fit your financial goals.
            </Text>
          </View>
          
          <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
            <Text style={styles.cardIcon}>💬</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>AI-Powered Insights</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Get personalized recommendations and insights powered by advanced AI patterns from your spending data.
            </Text>
          </View>
          
          <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
            <Text style={styles.cardIcon}>📈</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Automatic Categorization</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Transactions are automatically categorized using machine learning, saving you hours of manual work.
            </Text>
          </View>
          
          <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
            <Text style={styles.cardIcon}>🛡️</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Secure & Private</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Bank-level encryption and strict privacy controls ensure your financial data stays safe and secure.
            </Text>
          </View>
          
          <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
            <Text style={styles.cardIcon}>💳</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>All Accounts in One Place</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Connect all your financial accounts to get a complete picture of your finances in one dashboard.
            </Text>
          </View>
          
          <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
            <Text style={styles.cardIcon}>📈</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Goal Tracking</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Set savings goals and track your progress with visual indicators and automatic calculations.
            </Text>
          </View>
        </View>
      </View>

      {/* Testimonials */}
      <View style={styles.testimonialsSection}>
        <Text style={[styles.testimonialsTitle, { color: colors.text }]}>What Our Users Say</Text>
        <Text style={[styles.testimonialsSubtitle, { color: colors.textSecondary }]}>
          Join thousands of people who have transformed their financial habits with Octopus Organizer.
        </Text>
        
        <View style={styles.testimonialGrid}>
          <View style={[styles.testimonialCard, { backgroundColor: colors.card }]}>
            <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
            <Text style={[styles.testimonialText, { color: colors.text }]}>
              "Octopus Organizer helped me save an extra $400 each month by identifying unnecessary subscriptions and expenses."
            </Text>
            <Text style={[styles.testimonialAuthor, { color: colors.textSecondary }]}>Sarah J. Marketing Specialist</Text>
          </View>
          
          <View style={[styles.testimonialCard, { backgroundColor: colors.card }]}>
            <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
            <Text style={[styles.testimonialText, { color: colors.text }]}>
              "The AI categorization is incredibly accurate. I no longer spend hours organizing my expenses manually."
            </Text>
            <Text style={[styles.testimonialAuthor, { color: colors.textSecondary }]}>Michael T. Software Engineer</Text>
          </View>
          
          <View style={[styles.testimonialCard, { backgroundColor: colors.card }]}>
            <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
            <Text style={[styles.testimonialText, { color: colors.text }]}>
              "I've tried many budgeting apps, but this one finally helped me stick to a realistic budget and achieve my goals."
            </Text>
            <Text style={[styles.testimonialAuthor, { color: colors.textSecondary }]}>Ana L. Healthcare Professional</Text>
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <View style={[styles.ctaSection, { backgroundColor: colors.surface }]}>
        <Text style={[styles.ctaTitle, { color: colors.text }]}>Ready to Transform Your Finances?</Text>
        <Text style={[styles.ctaSubtitle, { color: colors.textSecondary }]}>
          Join Octopus Organizer today and start your journey toward financial wellness with AI-powered insights and easy budgeting tools.
        </Text>
        
        <View style={styles.ctaButtons}>
          <TouchableOpacity style={styles.ctaButton} onPress={handleGetStarted}>
            <Text style={styles.ctaButtonText}>Get Started For Free</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.plansButton, { borderColor: colors.border }]}>
            <Text style={[styles.plansButtonText, { color: colors.text }]}>View Plans</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor will be set dynamically
  },
  header: {
    borderBottomWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 40,
  },
  headerContent: {
    maxWidth: 1400,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  themeIcon: {
    fontSize: 18,
  },
  heroContainer: {
    flexDirection: 'row',
    maxWidth: 1400,
    alignSelf: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    gap: 60,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 20,
  },
  heroRight: {
    flex: 1,
    paddingLeft: 20,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 56,
  },
  heroTitleAccent: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10B981',
    lineHeight: 56,
    marginBottom: 24,
  },
  heroSubtitle: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 40,
    maxWidth: 500,
  },
  featureList: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  featureIcon: {
    fontSize: 16,
    color: '#10B981',
    marginRight: 16,
    marginTop: 4,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 16,
  },
  tryDemoButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    // @ts-ignore - Web-specific style
    cursor: 'pointer',
  },
  tryDemoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  learnMoreButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    // @ts-ignore - Web-specific style
    cursor: 'pointer',
  },
  learnMoreButtonText: {
    fontSize: 16,
  },
  dashboardPreview: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 24,
  },
  previewHeader: {
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  previewSubtitle: {
    fontSize: 14,
    color: '#065F46',
  },
  budgetBreakdown: {
    gap: 16,
    marginBottom: 24,
  },
  budgetCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    padding: 16,
  },
  budgetLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  budgetPercentage: {
    fontSize: 12,
    color: '#065F46',
    marginBottom: 12,
  },
  budgetBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
  },
  budgetProgress: {
    height: 6,
    backgroundColor: '#34D399',
    borderRadius: 3,
  },
  dashboardButton: {
    backgroundColor: '#065F46',
    paddingVertical: 12,
    borderRadius: 8,
    // @ts-ignore - Web-specific style
    cursor: 'pointer',
  },
  dashboardButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  featuresSection: {
    maxWidth: 1400,
    alignSelf: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  featuresTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 60,
    maxWidth: 800,
    alignSelf: 'center',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'space-between',
  },
  featureCard: {
    borderRadius: 12,
    padding: 32,
    width: '30%',
    minWidth: 300,
    // @ts-ignore - Web-specific style
    boxSizing: 'border-box',
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 22,
  },
  testimonialsSection: {
    maxWidth: 1400,
    alignSelf: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  testimonialsTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  testimonialsSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 60,
    maxWidth: 800,
    alignSelf: 'center',
  },
  testimonialGrid: {
    flexDirection: 'row',
    gap: 32,
    justifyContent: 'space-between',
  },
  testimonialCard: {
    borderRadius: 12,
    padding: 32,
    flex: 1,
  },
  stars: {
    fontSize: 18,
    marginBottom: 16,
  },
  testimonialText: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 20,
  },
  testimonialAuthor: {
    fontSize: 14,
    fontWeight: '600',
  },
  ctaSection: {
    paddingVertical: 80,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  ctaTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    maxWidth: 600,
    lineHeight: 28,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  ctaButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    // @ts-ignore - Web-specific style
    cursor: 'pointer',
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  plansButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    // @ts-ignore - Web-specific style
    cursor: 'pointer',
  },
  plansButtonText: {
    fontSize: 16,
  },
}); 