import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const DesktopHeader: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <Text style={styles.logo}>📈 OctopusFinancer</Text>
          
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbText}>Dashboard</Text>
          </View>
        </View>
        
        <View style={styles.centerSection}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchPlaceholder}>🔍 Search transactions, goals...</Text>
          </View>
        </View>
        
        <View style={styles.rightSection}>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileIcon}>👤</Text>
            <Text style={styles.profileName}>John Doe</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B1426',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 16,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
    marginRight: 32,
  },
  breadcrumb: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  breadcrumbText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  centerSection: {
    flex: 2,
    paddingHorizontal: 32,
  },
  searchContainer: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchPlaceholder: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
    justifyContent: 'flex-end',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: {
    fontSize: 18,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 18,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  profileIcon: {
    fontSize: 18,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DesktopHeader; 