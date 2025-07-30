import React from 'react';
import { Platform } from 'react-native';
import { MobilePageLayout } from '../components/layout/MobilePageLayout';
import { WebPageLayout } from '../components/layout/WebPageLayout';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const WebDemoContent = () => {
  const handleGetStarted = () => {
    router.push('/(dashboard)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🌐 Web Platform Demo</Text>
        <Text style={styles.subtitle}>Desktop-Optimized Experience</Text>
        
        <View style={styles.featureSection}>
          <Text style={styles.sectionTitle}>Web Features</Text>
          
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>💻</Text>
            <Text style={styles.featureTitle}>Large Screen Support</Text>
            <Text style={styles.featureDescription}>
              Optimized for desktop and laptop screens with multi-column layouts
            </Text>
          </View>
          
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🖱️</Text>
            <Text style={styles.featureTitle}>Mouse Interactions</Text>
            <Text style={styles.featureDescription}>
              Hover effects, right-click menus, and precise cursor interactions
            </Text>
          </View>
          
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>⌨️</Text>
            <Text style={styles.featureTitle}>Keyboard Shortcuts</Text>
            <Text style={styles.featureDescription}>
              Full keyboard navigation and productivity shortcuts
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.demoButton} onPress={handleGetStarted}>
          <Text style={styles.demoButtonText}>Try Dashboard →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function WebPlatformPage() {
  if (Platform.OS === 'web') {
    return (
      <WebPageLayout>
        <WebDemoContent />
      </WebPageLayout>
    );
  }

  return (
    <MobilePageLayout pageTitle="Web Platform" showBottomNav={false}>
      <WebDemoContent />
    </MobilePageLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B1426',
    minHeight: '100%',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
    // Enhanced font rendering
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 18,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '500',
    letterSpacing: 0.1,
    // Enhanced font rendering
    textShadowColor: 'rgba(156, 163, 175, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  featureSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.1,
    // Enhanced font rendering
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  featureCard: {
    backgroundColor: '#1F2937',
    borderRadius: 14,
    padding: 24,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 12,
    textAlign: 'center',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.1,
    // Enhanced font rendering
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  featureDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.1,
    // Enhanced font rendering
    textShadowColor: 'rgba(156, 163, 175, 0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  demoButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignSelf: 'center',
    elevation: 3,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
    // Enhanced font rendering
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
}); 