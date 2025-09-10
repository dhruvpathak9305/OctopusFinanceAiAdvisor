import { useState } from "react";
import { SettingsState } from "../types";

/**
 * Custom hook for managing settings state
 */
export const useSettingsState = (): [
  SettingsState,
  {
    setNotificationsEnabled: (value: boolean) => void;
    setBiometricEnabled: (value: boolean) => void;
    setAutoBackup: (value: boolean) => void;
    setDashboardCompactView: (value: boolean) => void;
    setAnalyticsAutoRefresh: (value: boolean) => void;
    setGoalNotifications: (value: boolean) => void;
  }
] => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [dashboardCompactView, setDashboardCompactView] = useState(false);
  const [analyticsAutoRefresh, setAnalyticsAutoRefresh] = useState(true);
  const [goalNotifications, setGoalNotifications] = useState(true);

  const state: SettingsState = {
    notificationsEnabled,
    biometricEnabled,
    autoBackup,
    dashboardCompactView,
    analyticsAutoRefresh,
    goalNotifications,
  };

  const setters = {
    setNotificationsEnabled,
    setBiometricEnabled,
    setAutoBackup,
    setDashboardCompactView,
    setAnalyticsAutoRefresh,
    setGoalNotifications,
  };

  return [state, setters];
};
