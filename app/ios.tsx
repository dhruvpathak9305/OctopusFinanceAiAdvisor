import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function IOSPlatform() {
  return (
    <ScrollView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>🍎 iOS Platform</Text>
        <Text style={styles.subtitle}>Native iPhone & iPad experience</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>iOS Features</Text>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>🎯 Siri Integration</Text>
          <Text style={styles.featureDescription}>
            "Hey Siri, show my portfolio performance" - Voice commands for quick access
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>⌚ Apple Watch Support</Text>
          <Text style={styles.featureDescription}>
            Quick portfolio glances, market alerts, and complication widgets
          </Text>
        </View>
      </View>

      <View style={styles.navigationSection}>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to Home</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#8b5cf6',
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
    color: '#c4b5fd',
    textAlign: 'center',
  },
  content: {
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
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
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
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
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