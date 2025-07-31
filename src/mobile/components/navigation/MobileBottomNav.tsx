import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MobileBottomNav: React.FC = () => {
  const navItems = [
    { key: 'home', icon: '🏠', label: 'Home' },
    { key: 'dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'transactions', icon: '💳', label: 'Transactions' },
    { key: 'portfolio', icon: '📈', label: 'Portfolio' },
    { key: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.bottomNav}>
        {navItems.map((item) => (
          <TouchableOpacity key={item.key} style={styles.navItem}>
            <Text style={styles.navIcon}>{item.icon}</Text>
            <Text style={styles.navLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B1426',
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  bottomNav: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});

export default MobileBottomNav; 