import React from "react";
import { Platform } from "react-native";
import { WebPageLayout } from "../components/layout/WebPageLayout";
import { WebHomeContent } from "../components/pages/WebHomeContent";
import MobileApp from "../src/mobile/MobileApp";
import { UnifiedAuthProvider } from "../contexts/UnifiedAuthContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { DemoModeProvider } from "../contexts/DemoModeContext";
import { AccountsProvider } from "../contexts/AccountsContext";
import { BalanceProvider } from "../contexts/BalanceContext";
import { NetWorthProvider } from "../contexts/NetWorthContext";
import ErrorBoundary from "../components/common/ErrorBoundary";

export default function HomePage() {
  // Use different apps for mobile vs web
  if (Platform.OS === "web") {
    return (
      <ErrorBoundary>
        <ThemeProvider>
          <DemoModeProvider>
            <UnifiedAuthProvider>
              <AccountsProvider>
                <BalanceProvider>
                  <NetWorthProvider>
                    <WebPageLayout>
                      <WebHomeContent />
                    </WebPageLayout>
                  </NetWorthProvider>
                </BalanceProvider>
              </AccountsProvider>
            </UnifiedAuthProvider>
          </DemoModeProvider>
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  // Use the complete mobile app with React Navigation
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <DemoModeProvider>
          <UnifiedAuthProvider>
            <AccountsProvider>
              <BalanceProvider>
                <NetWorthProvider>
                  <MobileApp />
                </NetWorthProvider>
              </BalanceProvider>
            </AccountsProvider>
          </UnifiedAuthProvider>
        </DemoModeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
