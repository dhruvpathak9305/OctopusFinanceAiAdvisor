import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, usePathname } from 'expo-router';

interface MobilePageLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  showBackButton?: boolean;
  pageTitle?: string;
}

export const MobilePageLayout: React.FC<MobilePageLayoutProps> = ({
  children,
  showBottomNav = true,
  showBackButton,
  pageTitle,
}) => {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  // Auto-detect if we should show back button (not on home page unless explicitly set)
  const shouldShowBackButton = showBackButton !== undefined ? showBackButton : !isHomePage;

  const handleGetStarted = () => {
    router.push('/(dashboard)');
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Fixed Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            {shouldShowBackButton ? (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.logo}>📈 Octopus Organizer</Text>
            )}
          </View>
          
          {pageTitle && (
            <View style={styles.headerCenter}>
              <Text style={styles.pageTitle}>{pageTitle}</Text>
            </View>
          )}
          
          <View style={styles.headerRight}>
            {!shouldShowBackButton && (
              <>
                <TouchableOpacity style={styles.deviceButton}>
                  <Text style={styles.deviceButtonText}>💻</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.loginButton}>
                  <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.signupButton}>
                  <Text style={styles.signupButtonText}>Sign up</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>

      {/* Fixed Bottom Navigation */}
      {showBottomNav && (
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={handleGetStarted}>
            <Text style={styles.navIcon}>🏠</Text>
            <Text style={styles.navLabel}>Dashboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>📊</Text>
            <Text style={styles.navLabel}>Portfolio</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>🎯</Text>
            <Text style={styles.navLabel}>Goals</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>✈️</Text>
            <Text style={styles.navLabel}>Travel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>⚙️</Text>
            <Text style={styles.navLabel}>Settings</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
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
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 56,
  },
  headerLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  logo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
    // Enhanced font rendering
    textShadowColor: 'rgba(16, 185, 129, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    // Enhanced font rendering
    textShadowColor: 'rgba(16, 185, 129, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    // Enhanced font rendering
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  deviceButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceButtonText: {
    fontSize: 16,
  },
  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    // Enhanced font rendering
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  signupButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    // Enhanced font rendering
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0B1426',
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    // Enhanced font rendering
    textShadowColor: 'rgba(156, 163, 175, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
}); 