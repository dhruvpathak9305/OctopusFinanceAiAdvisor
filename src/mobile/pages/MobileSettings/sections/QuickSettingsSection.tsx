import React from "react";
import {
  SettingsSection,
  SettingsItem,
  SettingsSeparator,
  SettingsSwitch,
} from "../components";
import { ThemeColors, SettingsState } from "../types";

interface QuickSettingsSectionProps {
  colors: ThemeColors;
  settingsState: SettingsState;
  setDashboardCompactView: (value: boolean) => void;
  setAnalyticsAutoRefresh: (value: boolean) => void;
  setGoalNotifications: (value: boolean) => void;
}

const QuickSettingsSection: React.FC<QuickSettingsSectionProps> = ({
  colors,
  settingsState,
  setDashboardCompactView,
  setAnalyticsAutoRefresh,
  setGoalNotifications,
}) => {
  return (
    <SettingsSection title="Quick Settings" colors={colors}>
      <SettingsItem
        icon="eye"
        title="Dashboard Compact View"
        subtitle="Show condensed dashboard layout"
        colors={colors}
        rightComponent={
          <SettingsSwitch
            value={settingsState.dashboardCompactView}
            onValueChange={setDashboardCompactView}
            colors={colors}
          />
        }
        showArrow={false}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="refresh-circle"
        title="Analytics Auto-Refresh"
        subtitle="Automatically update charts and data"
        colors={colors}
        rightComponent={
          <SettingsSwitch
            value={settingsState.analyticsAutoRefresh}
            onValueChange={setAnalyticsAutoRefresh}
            colors={colors}
          />
        }
        showArrow={false}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="trophy"
        title="Goal Progress Notifications"
        subtitle="Get notified when reaching milestones"
        colors={colors}
        rightComponent={
          <SettingsSwitch
            value={settingsState.goalNotifications}
            onValueChange={setGoalNotifications}
            colors={colors}
          />
        }
        showArrow={false}
      />
    </SettingsSection>
  );
};

export default QuickSettingsSection;
