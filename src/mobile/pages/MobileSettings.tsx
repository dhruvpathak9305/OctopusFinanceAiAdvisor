import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const MobileSettings: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.description}>Manage your preferences</Text>
        
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Account Settings</Text>
        </View>
        
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Notification Preferences</Text>
        </View>
        
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Security & Privacy</Text>
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  placeholder: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default MobileSettings; 