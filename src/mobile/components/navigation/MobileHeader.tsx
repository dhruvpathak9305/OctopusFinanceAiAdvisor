import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, useNavigationState } from '@react-navigation/native';

interface MobileHeaderProps {
  title?: string;
  showSignIn?: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  title = 'OctopusFinancer',
  showSignIn = true 
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get navigation state to determine if we can go back
  const navigationState = useNavigationState(state => state);
  const canGoBack = navigation.canGoBack() && navigationState.index > 0;

  // Get page title and icon based on current route
  const getPageInfo = () => {
    switch (route.name) {
      case 'Dashboard':
        return { title: 'Financial Dashboard', icon: '📊' };
      case 'Portfolio':
        return { title: 'My Portfolio', icon: '📈' };
      case 'Goals':
        return { title: 'Financial Goals', icon: '🎯' };
      case 'Transactions':
        return { title: 'Recent Transactions', icon: '💳' };
      case 'Settings':
        return { title: 'App Settings', icon: '⚙️' };
      case 'Home':
        return { title: 'OctopusFinancer', icon: '🏠' };
      default:
        return { title: 'OctopusFinancer', icon: '📈' };
    }
  };

  const pageInfo = getPageInfo();
  const currentTitle = title || pageInfo.title;

  const handleSignIn = () => {
    // Navigate to Auth screen or show auth modal
    navigation.navigate('Auth' as never);
  };

  const handleSignUp = () => {
    // Navigate to Auth screen with signup mode
    navigation.navigate('Auth' as never);
  };

  const handleBackPress = () => {
    if (canGoBack) {
      navigation.goBack();
    }
  };

  const handleLogoPress = () => {
    // Navigate to Home if not already on Home
    if (route.name !== 'Home') {
      navigation.navigate('Home' as never);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0B1426" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          {/* Left side - Back Button + Logo and Title */}
          <View style={styles.leftSection}>
            {canGoBack && (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleBackPress}
              >
                <Text style={styles.backArrow}>←</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.logoSection}
              onPress={handleLogoPress}
            >
              <Text style={styles.icon}>{pageInfo.icon}</Text>
              <Text style={styles.title} numberOfLines={1}>
                {currentTitle}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Right side - Actions */}
          <View style={styles.rightSection}>
            {/* Theme Toggle Placeholder */}
            <TouchableOpacity style={styles.themeToggle}>
              <Text style={styles.themeIcon}>🌙</Text>
            </TouchableOpacity>

            {showSignIn && (
              <View style={styles.authButtons}>
                <TouchableOpacity 
                  style={styles.loginButton}
                  onPress={handleSignIn}
                >
                  <Text style={styles.loginText}>Login</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.signupButton}
                  onPress={handleSignUp}
                >
                  <Text style={styles.signupText}>Sign up</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#0B1426',
  },
  header: {
    backgroundColor: '#0B1426',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  backArrow: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: '600',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  themeIcon: {
    fontSize: 14,
  },
  authButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  loginButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  loginText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  signupButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#10B981',
  },
  signupText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default MobileHeader; 