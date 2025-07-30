import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function DashboardOverview() {
  return (
    <ScrollView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.content}>
        <Text style={styles.title}>
          📊 Financial Dashboard
        </Text>
        
        <View style={styles.portfolioSection}>
          <Text style={styles.sectionTitle}>Portfolio Overview</Text>
          <View style={styles.portfolioCard}>
            <Text style={styles.portfolioValue}>Total Value: $125,430</Text>
            <Text style={styles.portfolioChange}>Today's Change: +$2,340 (+1.9%)</Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={() => console.log('Holdings pressed')}>
            <Text style={styles.actionButtonText}>View Holdings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.secondaryAction]} onPress={() => console.log('Investment pressed')}>
            <Text style={[styles.actionButtonText, styles.secondaryActionText]}>Add Investment</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  portfolioSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  portfolioCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  portfolioValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  portfolioChange: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: 120,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryAction: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  secondaryActionText: {
    color: '#3b82f6',
  },
}); 