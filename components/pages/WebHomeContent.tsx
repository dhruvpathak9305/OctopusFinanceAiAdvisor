import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export const WebHomeContent: React.FC = () => {
  const handleGetStarted = () => {
    router.push('/(dashboard)');
  };

  return (
    <View style={styles.container}>
      {/* Hero Section with Two Columns */}
      <View style={styles.heroContainer}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroTitle}>Take control of</Text>
          <Text style={styles.heroTitleAccent}>your financial future</Text>
          <Text style={styles.heroSubtitle}>
            OctopusFinancer helps you track, budget, and optimize your finances with powerful AI insights.
          </Text>
          
          {/* Feature List */}
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>→</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Smart Transaction Analysis</Text>
                <Text style={styles.featureDescription}>
                  Automatically categorize and analyze your spending patterns
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>→</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>AI Financial Advisor</Text>
                <Text style={styles.featureDescription}>
                  Get personalized recommendations to improve your financial health
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>→</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Multi-Account Management</Text>
                <Text style={styles.featureDescription}>
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
            
            <TouchableOpacity style={styles.learnMoreButton}>
              <Text style={styles.learnMoreButtonText}>Learn More</Text>
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
        <Text style={styles.featuresTitle}>Powerful Features for Better Finance</Text>
        <Text style={styles.featuresSubtitle}>
          OctopusFinancer combines intelligent automation with powerful insights to help you achieve financial freedom.
        </Text>
        
        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <Text style={styles.cardIcon}>📊</Text>
            <Text style={styles.cardTitle}>Smart Budgeting</Text>
            <Text style={styles.cardDescription}>
              Effortlessly create and manage budgets based on the 50/30/20 rule or customize to fit your financial goals.
            </Text>
          </View>
          
          <View style={styles.featureCard}>
            <Text style={styles.cardIcon}>💬</Text>
            <Text style={styles.cardTitle}>AI-Powered Insights</Text>
            <Text style={styles.cardDescription}>
              Get personalized recommendations and insights powered by advanced AI patterns from your spending data.
            </Text>
          </View>
          
          <View style={styles.featureCard}>
            <Text style={styles.cardIcon}>📈</Text>
            <Text style={styles.cardTitle}>Automatic Categorization</Text>
            <Text style={styles.cardDescription}>
              Transactions are automatically categorized using machine learning, saving you hours of manual work.
            </Text>
          </View>
          
          <View style={styles.featureCard}>
            <Text style={styles.cardIcon}>🛡️</Text>
            <Text style={styles.cardTitle}>Secure & Private</Text>
            <Text style={styles.cardDescription}>
              Bank-level encryption and strict privacy controls ensure your financial data stays safe and secure.
            </Text>
          </View>
          
          <View style={styles.featureCard}>
            <Text style={styles.cardIcon}>💳</Text>
            <Text style={styles.cardTitle}>All Accounts in One Place</Text>
            <Text style={styles.cardDescription}>
              Connect all your financial accounts to get a complete picture of your finances in one dashboard.
            </Text>
          </View>
          
          <View style={styles.featureCard}>
            <Text style={styles.cardIcon}>📈</Text>
            <Text style={styles.cardTitle}>Goal Tracking</Text>
            <Text style={styles.cardDescription}>
              Set savings goals and track your progress with visual indicators and automatic calculations.
            </Text>
          </View>
        </View>
      </View>

      {/* Testimonials */}
      <View style={styles.testimonialsSection}>
        <Text style={styles.testimonialsTitle}>What Our Users Say</Text>
        <Text style={styles.testimonialsSubtitle}>
          Join thousands of people who have transformed their financial habits with OctopusFinancer.
        </Text>
        
        <View style={styles.testimonialGrid}>
          <View style={styles.testimonialCard}>
            <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
            <Text style={styles.testimonialText}>
              "OctopusFinancer helped me save an extra $400 each month by identifying unnecessary subscriptions and expenses."
            </Text>
            <Text style={styles.testimonialAuthor}>Sarah J. Marketing Specialist</Text>
          </View>
          
          <View style={styles.testimonialCard}>
            <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
            <Text style={styles.testimonialText}>
              "The AI categorization is incredibly accurate. I no longer spend hours organizing my expenses manually."
            </Text>
            <Text style={styles.testimonialAuthor}>Michael T. Software Engineer</Text>
          </View>
          
          <View style={styles.testimonialCard}>
            <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
            <Text style={styles.testimonialText}>
              "I've tried many budgeting apps, but this one finally helped me stick to a realistic budget and achieve my goals."
            </Text>
            <Text style={styles.testimonialAuthor}>Ana L. Healthcare Professional</Text>
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Ready to Transform Your Finances?</Text>
        <Text style={styles.ctaSubtitle}>
          Join OctopusFinancer today and start your journey toward financial wellness with AI-powered insights and easy budgeting tools.
        </Text>
        
        <View style={styles.ctaButtons}>
          <TouchableOpacity style={styles.ctaButton} onPress={handleGetStarted}>
            <Text style={styles.ctaButtonText}>Get Started For Free</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.plansButton}>
            <Text style={styles.plansButtonText}>View Plans</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B1426',
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
    color: '#FFFFFF',
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
    color: '#9CA3AF',
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#9CA3AF',
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
    borderColor: '#374151',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    // @ts-ignore - Web-specific style
    cursor: 'pointer',
  },
  learnMoreButtonText: {
    color: '#FFFFFF',
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
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresSubtitle: {
    fontSize: 18,
    color: '#9CA3AF',
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
    backgroundColor: '#1F2937',
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
    color: '#FFFFFF',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#9CA3AF',
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
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  testimonialsSubtitle: {
    fontSize: 18,
    color: '#9CA3AF',
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
    backgroundColor: '#1F2937',
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
    color: '#FFFFFF',
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 20,
  },
  testimonialAuthor: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  ctaSection: {
    backgroundColor: '#1F2937',
    paddingVertical: 80,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  ctaTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaSubtitle: {
    fontSize: 18,
    color: '#9CA3AF',
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
    borderColor: '#374151',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    // @ts-ignore - Web-specific style
    cursor: 'pointer',
  },
  plansButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
}); 