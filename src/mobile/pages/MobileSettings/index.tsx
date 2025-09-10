import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  useTheme,
  lightTheme,
  darkTheme,
} from "../../../../contexts/ThemeContext";
import { useUnifiedAuth } from "../../../../contexts/UnifiedAuthContext";

// Components
import SettingsHeader from "./components/SettingsHeader";

// Sections
import {
  FinancialManagementSection,
  GeneralSettingsSection,
  ScreenSettingsSection,
  QuickSettingsSection,
  AIAutomationSection,
  ToolsSupportSection,
  DataPrivacySection,
  UserAccountSection,
} from "./sections";

// Hooks and handlers
import { useSettingsState } from "./hooks/useSettingsState";
import { createSettingsHandlers } from "./handlers/settingsHandlers";

// Config
import { settingsConfig } from "./config/settingsConfig";

/**
 * Main Settings Screen Component
 *
 * This is the refactored, modular version of the settings screen.
 * It uses a composition pattern with individual section components
 * for better maintainability and reusability.
 */
const MobileSettings: React.FC = () => {
  const { theme, isDark, setTheme } = useTheme();
  const { signOut, user } = useUnifiedAuth();
  const colors = isDark ? darkTheme : lightTheme;

  // Settings state management
  const [settingsState, setters] = useSettingsState();

  // Settings handlers
  const handlers = createSettingsHandlers({
    signOut,
    setTheme,
    supportEmail: settingsConfig.supportEmail,
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        {/* Header */}
        <SettingsHeader
          colors={colors}
          appVersion={settingsConfig.appVersion}
        />

        {/* Financial Management Section */}
        <FinancialManagementSection colors={colors} />

        {/* General Settings Section */}
        <GeneralSettingsSection
          colors={colors}
          theme={theme}
          handlers={handlers}
          settingsState={settingsState}
          setNotificationsEnabled={setters.setNotificationsEnabled}
        />

        {/* Screen Settings Section */}
        <ScreenSettingsSection colors={colors} handlers={handlers} />

        {/* Quick Settings Section */}
        <QuickSettingsSection
          colors={colors}
          settingsState={settingsState}
          setDashboardCompactView={setters.setDashboardCompactView}
          setAnalyticsAutoRefresh={setters.setAnalyticsAutoRefresh}
          setGoalNotifications={setters.setGoalNotifications}
        />

        {/* AI & Automation Section */}
        <AIAutomationSection
          colors={colors}
          settingsState={settingsState}
          setAutoBackup={setters.setAutoBackup}
        />

        {/* Tools & Support Section */}
        <ToolsSupportSection colors={colors} handlers={handlers} />

        {/* Data & Privacy Section */}
        <DataPrivacySection
          colors={colors}
          handlers={handlers}
          settingsState={settingsState}
          setBiometricEnabled={setters.setBiometricEnabled}
        />

        {/* User Account Section */}
        <UserAccountSection colors={colors} handlers={handlers} user={user} />

        <View style={styles.bottomSpacing} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default MobileSettings;
