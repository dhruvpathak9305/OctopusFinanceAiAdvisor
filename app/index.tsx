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

// Global error handler to suppress network errors
// ErrorUtils is a global object in React Native, not imported
declare const ErrorUtils: {
  getGlobalHandler: () => ((error: Error, isFatal?: boolean) => void) | null;
  setGlobalHandler: (handler: (error: Error, isFatal?: boolean) => void) => void;
};

// Helper function to check if an error is a network error
const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  
  const message = error?.message || error?.toString() || "";
  const stack = error?.stack || "";
  
  return (
    message.includes("Network request failed") ||
    message.includes("Failed to fetch") ||
    error?.name === "TypeError" ||
    message.includes("network") ||
    (stack.includes("fetch.umd.js") && message.includes("Network request failed"))
  );
};

// Override console.error to filter ONLY network errors (not React errors)
const originalConsoleError = console.error;
let lastNetworkErrorLog = 0;

console.error = (...args: any[]) => {
  // Convert all args to strings for checking
  const errorString = args.map(arg => {
    if (arg instanceof Error) {
      return `${arg.name}: ${arg.message} ${arg.stack || ''}`;
    }
    return String(arg);
  }).join(' ');

  // Check if this is a React error - NEVER suppress these
  const isReactError = 
    errorString.includes("React has detected") ||
    errorString.includes("Rules of Hooks") ||
    errorString.includes("Internal React error") ||
    errorString.includes("Expected static flag") ||
    errorString.includes("React") && errorString.includes("error");

  // If it's a React error, always log it
  if (isReactError) {
    originalConsoleError.apply(console, args);
    return;
  }

  // Check if any argument is a network error
  const hasNetworkError = args.some(arg => {
    if (arg instanceof Error) {
      return isNetworkError(arg);
    }
    if (typeof arg === "string") {
      return arg.includes("Network request failed") || 
             arg.includes("Failed to fetch") ||
             (arg.includes("TypeError") && arg.includes("Network"));
    }
    return false;
  });

  // Also check the error string for network patterns
  const isNetworkErrorInString = 
    errorString.includes("Network request failed") ||
    errorString.includes("Failed to fetch") ||
    (errorString.includes("TypeError") && errorString.includes("Network")) ||
    (errorString.includes("fetch.umd.js") && errorString.includes("Network request failed"));

  if (hasNetworkError || isNetworkErrorInString) {
    // Suppress network errors - only log in dev mode with throttling
    if (__DEV__) {
      const now = Date.now();
      if (now - lastNetworkErrorLog > 5000) {
        console.warn("⚠️ Network error suppressed (will not show again for 5s)");
        lastNetworkErrorLog = now;
      }
    }
    return; // Don't log network errors
  }

  // For all other errors (including React errors), use the original console.error
  originalConsoleError.apply(console, args);
};

// Set up ErrorUtils global handler if available
if (typeof ErrorUtils !== "undefined" && ErrorUtils.getGlobalHandler) {
  const originalErrorHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    if (isNetworkError(error)) {
      // Suppress network errors
      if (__DEV__) {
        const now = Date.now();
        if (now - lastNetworkErrorLog > 5000) {
          console.warn("⚠️ Network error suppressed (will not show again for 5s)");
          lastNetworkErrorLog = now;
        }
      }
      return; // Don't call original handler for network errors
    }

    // For non-network errors, use the original handler
    if (originalErrorHandler) {
      originalErrorHandler(error, isFatal);
    }
  });
}

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
