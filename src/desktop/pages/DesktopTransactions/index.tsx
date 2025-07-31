import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const DesktopTransactions: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Transactions</Text>
        <Text style={styles.description}>Advanced transaction management with filtering and analytics</Text>
        
        <View style={styles.toolbar}>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Search & Advanced Filters</Text>
          </View>
        </View>
        
        <View style={styles.transactionTable}>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Data Table with Sorting & Pagination</Text>
          </View>
        </View>
        
        <View style={styles.analyticsSection}>
          <View style={styles.leftColumn}>
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Transaction Analytics</Text>
            </View>
          </View>
          
          <View style={styles.rightColumn}>
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Category Breakdown</Text>
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
    padding: 40,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 18,
    color: '#9CA3AF',
    marginBottom: 32,
  },
  toolbar: {
    marginBottom: 24,
  },
  transactionTable: {
    marginBottom: 32,
  },
  analyticsSection: {
    flexDirection: 'row',
    gap: 24,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
  },
  placeholder: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 32,
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 18,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default DesktopTransactions; 