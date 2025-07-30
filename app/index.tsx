import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function HomePage() {
  const handleGetStarted = () => {
    router.push('/(dashboard)');
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.title}>
          🐙 Octopus Finance AI Advisor
        </Text>
        <Text style={styles.subtitle}>
          Your intelligent financial companion across all platforms
        </Text>
        
        <View style={styles.heroActions}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={() => console.log('Learn more')}>
            <Text style={styles.secondaryButtonText}>Learn More</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Platform Navigation Cards */}
      <View style={styles.navigationSection}>
        <Text style={styles.sectionTitle}>
          Choose Your Platform
        </Text>
        
        <View style={styles.cardsContainer}>
          <Link href="/web" asChild>
            <TouchableOpacity style={styles.platformCard}>
              <Text style={styles.platformCardText}>🌐 Web Platform - Desktop Experience</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/mobile" asChild>
            <TouchableOpacity style={styles.platformCard}>
              <Text style={styles.platformCardText}>📱 Mobile Platform - Touch Optimized</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/ios" asChild>
            <TouchableOpacity style={styles.platformCard}>
              <Text style={styles.platformCardText}>🍎 iOS Platform - Native Experience</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/android" asChild>
            <TouchableOpacity style={styles.platformCard}>
              <Text style={styles.platformCardText}>🤖 Android Platform - Material Design</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>
          ✨ Key Features
        </Text>
        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🤖</Text>
            <Text style={styles.featureTitle}>AI-Powered Insights</Text>
            <Text style={styles.featureDescription}>
              Get personalized investment recommendations based on market analysis
            </Text>
          </View>
          
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureTitle}>Real-time Analytics</Text>
            <Text style={styles.featureDescription}>
              Track your portfolio performance with live market data
            </Text>
          </View>
          
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🔒</Text>
            <Text style={styles.featureTitle}>Secure & Private</Text>
            <Text style={styles.featureDescription}>
              Bank-level security with end-to-end encryption
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2024 Octopus Finance AI Advisor
        </Text>
        <Text style={styles.footerSubtext}>
          Powered by AI • Built with React Native & Expo
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  heroSection: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#93c5fd',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 600,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  navigationSection: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  cardsContainer: {
    gap: 16,
  },
  platformCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  platformCardText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: '#ffffff',
  },
  featuresGrid: {
    gap: 24,
  },
  featureCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#f3f4f6',
  },
  footerText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
  },
  footerSubtext: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 8,
  },
}); 