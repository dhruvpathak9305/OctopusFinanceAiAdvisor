import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function WebPlatform() {
  return (
    <ScrollView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>
          🌐 Web Platform
        </Text>
        <Text style={styles.subtitle}>
          Full-featured web experience
        </Text>
      </View>

      {/* Features Grid */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>
          Web Features
        </Text>
        
        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>
              💻 Desktop Optimized
            </Text>
            <Text style={styles.featureDescription}>
              Large screen layouts with advanced data visualization and multi-panel views
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>
              📊 Advanced Analytics
            </Text>
            <Text style={styles.featureDescription}>
              Comprehensive charts, graphs, and detailed financial analysis tools
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>
              🔗 Browser Integration
            </Text>
            <Text style={styles.featureDescription}>
              Seamless integration with browser features, bookmarks, and extensions
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>
              ⚡ Real-time Updates
            </Text>
            <Text style={styles.featureDescription}>
              Live market data, instant notifications, and real-time portfolio tracking
            </Text>
          </View>
        </View>
      </View>

      {/* Demo Section */}
      <View style={styles.demoSection}>
        <Text style={styles.demoTitle}>
          🎯 Demo Dashboard
        </Text>
        <View style={styles.demoStats}>
          <Text style={styles.portfolioValue}>Portfolio Value: $125,430</Text>
          <Text style={styles.todayGain}>Today's Gain: +$2,340 (+1.9%)</Text>
        </View>
        <View style={styles.demoButtons}>
          <View style={styles.demoButton}>
            <Text style={styles.demoButtonText}>Stocks</Text>
            <Text style={styles.demoButtonValue}>65%</Text>
          </View>
          <View style={styles.demoButton}>
            <Text style={styles.demoButtonText}>Bonds</Text>
            <Text style={styles.demoButtonValue}>25%</Text>
          </View>
          <View style={styles.demoButton}>
            <Text style={styles.demoButtonText}>Crypto</Text>
            <Text style={styles.demoButtonValue}>10%</Text>
          </View>
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.navigationSection}>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>
              ← Back to Home
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  header: {
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#a7f3d0',
    textAlign: 'center',
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
  },
  featuresContainer: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  demoSection: {
    marginHorizontal: 24,
    marginBottom: 32,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  demoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  demoStats: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  portfolioValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  todayGain: {
    fontSize: 14,
    color: '#6b7280',
  },
  demoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  demoButton: {
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
  demoButtonValue: {
    fontSize: 14,
    color: '#059669',
  },
  navigationSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  backButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
  },
}); 