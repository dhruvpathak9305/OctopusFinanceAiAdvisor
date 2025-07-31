import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const DesktopSidebar: React.FC = () => {
  const navItems = [
    { key: 'home', icon: '🏠', label: 'Home', active: true },
    { key: 'dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'transactions', icon: '💳', label: 'Transactions' },
    { key: 'portfolio', icon: '📈', label: 'Portfolio' },
    { key: 'goals', icon: '🎯', label: 'Goals' },
    { key: 'travel', icon: '✈️', label: 'Travel' },
    { key: 'money', icon: '💰', label: 'Money' },
    { key: 'reports', icon: '📋', label: 'Reports' },
    { key: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.sidebar}>
        <View style={styles.navigation}>
          <Text style={styles.sectionTitle}>Navigation</Text>
          
          {navItems.map((item) => (
            <TouchableOpacity 
              key={item.key} 
              style={[styles.navItem, item.active && styles.navItemActive]}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text style={[styles.navLabel, item.active && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionLabel}>Add Transaction</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🎯</Text>
            <Text style={styles.actionLabel}>New Goal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionLabel}>Generate Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: '#0B1426',
    borderRightWidth: 1,
    borderRightColor: '#1F2937',
  },
  sidebar: {
    flex: 1,
  },
  navigation: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginBottom: 16,
    letterSpacing: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: '#10B981',
  },
  navIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 20,
    textAlign: 'center',
  },
  navLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  quickActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#1F2937',
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
    textAlign: 'center',
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default DesktopSidebar; 