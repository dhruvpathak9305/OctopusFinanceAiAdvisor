import React from "react";
import { Platform, View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { WebPageLayout } from "../components/layout/WebPageLayout";
import { WebHomeContent } from "../components/pages/WebHomeContent";
import MobileApp from "../src/mobile/MobileApp";
import { UnifiedAuthProvider } from "../contexts/UnifiedAuthContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { DemoModeProvider } from "../contexts/DemoModeContext";
import { AccountsProvider } from "../contexts/AccountsContext";
import { BalanceProvider } from "../contexts/BalanceContext";
import { NetWorthProvider } from "../contexts/NetWorthContext";
import { SubscriptionProvider } from "../contexts/SubscriptionContext";
import { useOfflineFirstInit } from "../hooks/useOfflineFirstInit";
import ErrorBoundary from "../components/common/ErrorBoundary";

// Inner component that uses the initialization hook
function AppContent() {
  const initStatus = useOfflineFirstInit();

  // Show loading screen while initializing offline-first architecture
  if (!initStatus.initialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Initializing...</Text>
        {initStatus.error && (
          <Text style={styles.errorText}>{initStatus.error}</Text>
        )}
      </View>
    );
  }

  // Use different apps for mobile vs web
  if (Platform.OS === "web") {
    return (
      <WebPageLayout>
        <WebHomeContent />
      </WebPageLayout>
    );
  }

  // Use the complete mobile app with React Navigation
  return <MobileApp />;
}

export default function HomePage() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <DemoModeProvider>
          <UnifiedAuthProvider>
            <SubscriptionProvider>
              <AccountsProvider>
                <BalanceProvider>
                  <NetWorthProvider>
                    <AppContent />
                  </NetWorthProvider>
                </BalanceProvider>
              </AccountsProvider>
            </SubscriptionProvider>
          </UnifiedAuthProvider>
        </DemoModeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: "#ef4444",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
