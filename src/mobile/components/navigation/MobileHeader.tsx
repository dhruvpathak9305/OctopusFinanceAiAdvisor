import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  useNavigationState,
} from "@react-navigation/native";
import { useUnifiedAuth } from "../../../../contexts/UnifiedAuthContext";
import {
  useTheme,
  darkTheme,
  lightTheme,
} from "../../../../contexts/ThemeContext";
import { Logo } from "../../../../components/common/Logo";
import networkMonitor, { NetworkStatus } from "../../../../services/sync/networkMonitor";

interface MobileHeaderProps {
  title?: string;
  showSignIn?: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title = "OctopusFinancer",
  showSignIn = true,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { isAuthenticated, signOut } = useUnifiedAuth();
  const { isDark, toggleTheme } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  
  // Network status state
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('unknown');
  const [forceOffline, setForceOffline] = useState(false);
  
  // Notifications state
  const [notificationCount, setNotificationCount] = useState(0);

  // Get navigation state to determine if we can go back
  const navigationState = useNavigationState((state) => state);
  const canGoBack = navigation.canGoBack() && navigationState.index > 0;

  // Monitor network status
  useEffect(() => {
    // Get initial status
    networkMonitor.getStatus().then((status) => {
      setNetworkStatus(status);
    });

    // Listen for status changes
    const unsubscribe = networkMonitor.addListener((status) => {
      setNetworkStatus(status);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Determine display status (force offline takes precedence)
  const displayStatus = forceOffline ? 'offline' : networkStatus;

  // Get page title and icon based on current route
  const getPageInfo = () => {
    switch (route.name) {
      case "Dashboard":
        return { title: "Financial Dashboard", icon: "📊" };
      case "Portfolio":
        return { title: "My Portfolio", icon: "📈" };
      case "Goals":
        return { title: "Financial Goals", icon: "🎯" };
      case "Transactions":
        return { title: "Recent Transactions", icon: "💳" };
      case "Settings":
        return { title: "App Settings", icon: "⚙️" };
      case "Home":
        return { title: "OctopusFinancer", icon: "🏠" };
      default:
        return { title: "OctopusFinancer", icon: "📈" };
    }
  };

  const pageInfo = getPageInfo();
  const currentTitle = title || pageInfo.title;

  const handleSignIn = () => {
    // Navigate to Auth screen or show auth modal
    navigation.navigate("Auth" as never);
  };

  const handleSignUp = () => {
    // Navigate to Auth screen with signup mode
    navigation.navigate("Auth" as never);
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  const handleBackPress = () => {
    if (canGoBack) {
      navigation.goBack();
    }
  };

  const handleLogoPress = () => {
    // Logo press handler - can be used for future features
    // Navigation is handled by the bottom tab navigator
    // No action needed for now
  };

  const handleNetworkToggle = () => {
    // Toggle force offline mode
    const newForceOffline = !forceOffline;
    setForceOffline(newForceOffline);
    
    // Show alert to inform user
    Alert.alert(
      newForceOffline ? "Offline Mode Enabled" : "Online Mode Enabled",
      newForceOffline 
        ? "App will work in offline mode. Data will be synced when you go back online."
        : "App will sync with server when network is available.",
      [{ text: "OK" }]
    );
  };

  const handleNotificationsPress = () => {
    // Navigate to notifications screen or show notifications modal
    // For now, show an alert - can be replaced with navigation later
    if (notificationCount > 0) {
      Alert.alert(
        "Notifications",
        `You have ${notificationCount} unread notification${notificationCount > 1 ? 's' : ''}`,
        [{ text: "OK" }]
      );
    } else {
      Alert.alert("Notifications", "No new notifications", [{ text: "OK" }]);
    }
  };

  const getNetworkIcon = () => {
    if (displayStatus === 'online') {
      return 'wifi';
    } else if (displayStatus === 'offline') {
      return 'cloud-offline';
    } else {
      return 'help-circle';
    }
  };

  const getNetworkColor = () => {
    if (displayStatus === 'online') {
      return '#10b981'; // green
    } else if (displayStatus === 'offline') {
      return '#ef4444'; // red
    } else {
      return '#6b7280'; // gray
    }
  };

  return (
    <>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />
      <SafeAreaView
        edges={["top"]}
        style={[styles.safeArea, { backgroundColor: theme.background }]}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.background,
              borderBottomWidth: 0, // Remove bottom border to reduce visual separation
            },
          ]}
        >
          {/* Left side - Back Button + Logo and Title */}
          <View style={styles.leftSection}>
            {canGoBack && (
              <TouchableOpacity
                style={[
                  styles.backButton,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
                onPress={handleBackPress}
              >
                <Text style={[styles.backArrow, { color: theme.primary }]}>
                  ←
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.logoSection}
              onPress={handleLogoPress}
            >
              <Logo size={28} animated={true} />
              <Text
                style={[styles.title, { color: theme.primary }]}
                numberOfLines={1}
              >
                {currentTitle}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Right side - Actions */}
          <View style={styles.rightSection}>
            {/* Network Toggle */}
            <TouchableOpacity
              style={[
                styles.themeToggle,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={handleNetworkToggle}
            >
              <Ionicons 
                name={getNetworkIcon()} 
                size={14} 
                color={getNetworkColor()} 
              />
            </TouchableOpacity>

            {/* Notifications Icon */}
            <TouchableOpacity
              style={[
                styles.notificationButton,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={handleNotificationsPress}
            >
              <Ionicons 
                name="notifications-outline" 
                size={16} 
                color={theme.textSecondary} 
              />
              {notificationCount > 0 && (
                <View style={[styles.notificationBadge, { backgroundColor: '#EF4444', borderColor: theme.background }]}>
                  <Text style={styles.notificationBadgeText}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Theme Toggle */}
            <TouchableOpacity
              style={[
                styles.themeToggle,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={toggleTheme}
            >
              <Text style={styles.themeIcon}>{isDark ? "☀️" : "🌙"}</Text>
            </TouchableOpacity>

            {isAuthenticated ? (
              <TouchableOpacity
                style={styles.signupButton}
                onPress={handleSignOut}
              >
                <Text style={[styles.signupText, { color: theme.text }]}>
                  Sign out
                </Text>
              </TouchableOpacity>
            ) : (
              showSignIn && (
                <View style={styles.authButtons}>
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleSignIn}
                  >
                    <Text
                      style={[styles.loginText, { color: theme.textSecondary }]}
                    >
                      Login
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.signupButton}
                    onPress={handleSignUp}
                  >
                    <Text style={[styles.signupText, { color: theme.text }]}>
                      Sign up
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            )}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    // backgroundColor will be set dynamically
  },
  header: {
    // backgroundColor and borderBottomColor will be set dynamically
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 6, // Further reduced vertical padding
    borderBottomWidth: 0, // Removed border to eliminate visual separation
    elevation: 0, // Removed elevation shadow
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    // backgroundColor and borderColor will be set dynamically
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
  },
  backArrow: {
    fontSize: 18,
    // color will be set dynamically
    fontWeight: "600",
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    // color will be set dynamically
    flex: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  themeToggle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    // backgroundColor and borderColor will be set dynamically
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  themeIcon: {
    fontSize: 12,
  },
  notificationButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    // backgroundColor and borderColor will be set dynamically
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  authButtons: {
    flexDirection: "row",
    gap: 6,
  },
  loginButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  loginText: {
    fontSize: 12,
    // color will be set dynamically
    fontWeight: "600",
  },
  signupButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#10B981", // Keep primary color consistent
  },
  signupText: {
    fontSize: 12,
    // color will be set dynamically
    fontWeight: "600",
  },
});

export default MobileHeader;
