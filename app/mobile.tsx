import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function MobilePlatform() {
  return (
    <ScrollView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>
          📱 Mobile Platform
        </Text>
        <Text style={styles.subtitle}>
          Universal mobile experience
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>
          📈 Quick Portfolio Overview
        </Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>$89.2K</Text>
            <Text style={styles.statLabel}>Total Value</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>+5.7%</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Holdings</Text>
          </View>
        </View>
      </View>

      {/* Mobile Features */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>
          Mobile Features
        </Text>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>
            👆 Touch-Optimized
          </Text>
          <Text style={styles.featureDescription}>
            Intuitive gestures, swipe actions, and touch-friendly interface design
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>
            📲 Push Notifications
          </Text>
          <Text style={styles.featureDescription}>
            Instant alerts for market changes, portfolio updates, and AI recommendations
          </Text>
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
    backgroundColor: '#fef3c7',
  },
  header: {
    backgroundColor: '#f59e0b',
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
    color: '#fde68a',
    textAlign: 'center',
  },
  statsSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
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
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  navigationSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  backButton: {
    backgroundColor: '#f59e0b',
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