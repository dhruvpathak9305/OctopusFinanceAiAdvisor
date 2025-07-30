import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AndroidPlatform() {
  return (
    <ScrollView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>🤖 Android Platform</Text>
        <Text style={styles.subtitle}>Native Android experience</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Android Features</Text>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>🏠 Home Screen Widgets</Text>
          <Text style={styles.featureDescription}>
            Live portfolio data right on your home screen
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>🎨 Material You Design</Text>
          <Text style={styles.featureDescription}>
            Dynamic theming that adapts to your wallpaper
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
    backgroundColor: '#fef2f2',
  },
  header: {
    backgroundColor: '#ef4444',
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
    color: '#fecaca',
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
    borderRadius: 8,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
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
    backgroundColor: '#ef4444',
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