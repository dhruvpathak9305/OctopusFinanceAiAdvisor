import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
import { NetworkStatusDot } from "../../../../components/common/NetworkStatusDot";

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

  // Get navigation state to determine if we can go back
  const navigationState = useNavigationState((state) => state);
  const canGoBack = navigation.canGoBack() && navigationState.index > 0;

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
              borderBottomColor: theme.border,
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
              <View style={styles.logoWithStatus}>
                <Logo size={52} animated={true} />
                <NetworkStatusDot size={10} />
              </View>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  logoWithStatus: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    // backgroundColor and borderColor will be set dynamically
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  themeIcon: {
    fontSize: 14,
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
