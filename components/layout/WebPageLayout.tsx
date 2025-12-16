import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Logo } from '../common/Logo';

interface WebPageLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export const WebPageLayout: React.FC<WebPageLayoutProps> = ({
  children,
  showHeader = true,
  showFooter = false,
}) => {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Fixed Header for Web */}
      {showHeader && (
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Logo size={52} showText={true} animated={true} />
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.loadingButton}>
                <Text style={styles.loadingButtonText}>Loading...</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Scrollable Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>

      {/* Optional Footer */}
      {showFooter && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 OctopusFinancer. All rights reserved.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1426',
  },
  header: {
    backgroundColor: '#0B1426',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    // @ts-ignore - Web-specific style
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  headerLeft: {
    flex: 1,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingButton: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    // @ts-ignore - Web-specific style
    cursor: 'not-allowed',
  },
  loadingButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  footer: {
    backgroundColor: '#1F2937',
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
}); 