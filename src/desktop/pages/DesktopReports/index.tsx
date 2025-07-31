import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const DesktopReports: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.description}>Advanced financial reporting and analytics</Text>
        
        <View style={styles.reportGrid}>
          <View style={styles.leftColumn}>
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Income vs Expense Report</Text>
            </View>
            
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Budget Performance Report</Text>
            </View>
          </View>
          
          <View style={styles.rightColumn}>
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Portfolio Performance Report</Text>
            </View>
            
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Tax Summary Report</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.exportSection}>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Export & Print Options</Text>
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
  reportGrid: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 32,
  },
  leftColumn: {
    flex: 1,
    gap: 20,
  },
  rightColumn: {
    flex: 1,
    gap: 20,
  },
  exportSection: {
    marginTop: 20,
  },
  placeholder: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 32,
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
    minHeight: 250,
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

export default DesktopReports; 