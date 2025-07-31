import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const DesktopHome: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Desktop Home</Text>
        <Text style={styles.description}>
          Comprehensive financial dashboard with multi-column layout
        </Text>
        
        {/* Main Dashboard Grid */}
        <View style={styles.dashboardGrid}>
          {/* Left Column */}
          <View style={styles.leftColumn}>
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Financial Summary</Text>
            </View>
            
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Portfolio Overview</Text>
            </View>
          </View>
          
          {/* Right Column */}
          <View style={styles.rightColumn}>
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Recent Transactions</Text>
            </View>
            
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Financial Charts</Text>
            </View>
          </View>
        </View>
        
        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Financial Insights & Goals</Text>
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
  dashboardGrid: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  leftColumn: {
    flex: 1,
    gap: 20,
  },
  rightColumn: {
    flex: 1,
    gap: 20,
  },
  bottomSection: {
    marginTop: 20,
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

export default DesktopHome; 