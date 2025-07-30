import React from 'react';
import { Platform } from 'react-native';
import { MobilePageLayout } from '../../components/layout/MobilePageLayout';
import { WebPageLayout } from '../../components/layout/WebPageLayout';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const DashboardContent = () => {
  return (
    <View style={styles.content}>
      <Text style={styles.title}>📊 Financial Dashboard</Text>
      
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
  );
};

export default function DashboardOverview() {
  if (Platform.OS === 'web') {
    return (
      <WebPageLayout>
        <DashboardContent />
      </WebPageLayout>
    );
  }

  return (
    <MobilePageLayout showBottomNav={false}>
      <DashboardContent />
    </MobilePageLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    backgroundColor: '#0B1426',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  portfolioSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 10,
  },
  portfolioCard: {
    backgroundColor: '#1F2937',
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
    color: '#10B981',
  },
  portfolioChange: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  actionButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: 120,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryAction: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  secondaryActionText: {
    color: '#10B981',
  },
}); 