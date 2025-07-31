import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const MobilePortfolio: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Portfolio Summary Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Portfolio Summary</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.portfolioValue}>$25,000</Text>
            <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
          </View>
        </View>

        {/* Asset Allocation Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Asset Allocation</Text>
          </View>
          <View style={styles.cardContent}>
            {/* Chart Placeholder */}
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartPlaceholderText}>Chart placeholder</Text>
            </View>
            
            {/* Asset Grid */}
            <View style={styles.assetGrid}>
              <View style={styles.assetItem}>
                <Text style={styles.assetLabel}>Stocks</Text>
                <Text style={styles.assetPercentage}>60%</Text>
              </View>
              <View style={styles.assetItem}>
                <Text style={styles.assetLabel}>Bonds</Text>
                <Text style={styles.assetPercentage}>25%</Text>
              </View>
              <View style={styles.assetItem}>
                <Text style={styles.assetLabel}>Cash</Text>
                <Text style={styles.assetPercentage}>10%</Text>
              </View>
              <View style={styles.assetItem}>
                <Text style={styles.assetLabel}>Other</Text>
                <Text style={styles.assetPercentage}>5%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Performance Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recent Performance</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Today</Text>
              <Text style={[styles.performanceValue, styles.positiveValue]}>+1.2%</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>This Week</Text>
              <Text style={[styles.performanceValue, styles.negativeValue]}>-0.8%</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>This Month</Text>
              <Text style={[styles.performanceValue, styles.positiveValue]}>+3.5%</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.actionGrid}>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Buy/Sell</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Rebalance</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1426',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardContent: {
    padding: 16,
    paddingTop: 8,
  },
  portfolioValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  portfolioLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  chartPlaceholder: {
    height: 160,
    backgroundColor: '#374151',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartPlaceholderText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontStyle: 'italic',
  },
  assetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  assetItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
  },
  assetLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  assetPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  performanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  performanceLabel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  positiveValue: {
    color: '#10B981',
  },
  negativeValue: {
    color: '#EF4444',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MobilePortfolio; 