/**
 * Types and interfaces for the Settings module
 */
import React from "react";

export interface SettingsItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightComponent?: React.ReactNode;
  colors: ThemeColors;
}

export interface SettingsSectionProps {
  title?: string;
  children: React.ReactNode;
  colors: ThemeColors;
}

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  card: string;
  tabBar: string;
  tabBarBorder: string;
}

export interface SettingsState {
  notificationsEnabled: boolean;
  biometricEnabled: boolean;
  autoBackup: boolean;
  dashboardCompactView: boolean;
  analyticsAutoRefresh: boolean;
  goalNotifications: boolean;
}

export interface SettingsHandlers {
  handleSignOut: () => void;
  handleThemeChange: () => void;
  handleBackup: () => void;
  handleFeedback: () => void;
  handleHelp: () => void;
  handlePCManager: () => void;
  handleCalcBox: () => void;
  handleDemoMode: () => void;
  handleDataExport: () => void;
  handleDashboardSettings: () => void;
  handleAnalyticsSettings: () => void;
  handleGoalsSettings: () => void;
  handleSyncQueue?: () => void;
}

export interface SettingsConfig {
  appVersion: string;
  supportEmail: string;
  features: {
    biometricAuth: boolean;
    dataExport: boolean;
    demoMode: boolean;
    aiInsights: boolean;
  };
}
