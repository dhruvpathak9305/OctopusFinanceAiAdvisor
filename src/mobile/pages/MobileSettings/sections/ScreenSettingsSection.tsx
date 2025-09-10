import React from "react";
import { Alert } from "react-native";
import {
  SettingsSection,
  SettingsItem,
  SettingsSeparator,
} from "../components";
import { ThemeColors, SettingsHandlers } from "../types";

interface ScreenSettingsSectionProps {
  colors: ThemeColors;
  handlers: SettingsHandlers;
}

const ScreenSettingsSection: React.FC<ScreenSettingsSectionProps> = ({
  colors,
  handlers,
}) => {
  return (
    <SettingsSection title="Screen Settings" colors={colors}>
      <SettingsItem
        icon="analytics"
        title="Dashboard Settings"
        subtitle="Cards layout, default view, refresh intervals"
        colors={colors}
        onPress={handlers.handleDashboardSettings}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="bar-chart"
        title="Analytics Settings"
        subtitle="Chart types, time periods, data visualization"
        colors={colors}
        onPress={handlers.handleAnalyticsSettings}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="flag"
        title="Goals Settings"
        subtitle="Goal tracking, progress notifications, milestones"
        colors={colors}
        onPress={handlers.handleGoalsSettings}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="trending-up"
        title="Portfolio Settings"
        subtitle="Investment tracking, performance metrics, alerts"
        colors={colors}
        onPress={() =>
          Alert.alert(
            "Portfolio Settings",
            "Configure investment tracking, performance metrics, price alerts, and portfolio visualization preferences."
          )
        }
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="receipt"
        title="Transactions Settings"
        subtitle="List view, filters, categorization display"
        colors={colors}
        onPress={() =>
          Alert.alert(
            "Transactions Settings",
            "Customize transaction list view, default filters, categorization display, and transaction details preferences."
          )
        }
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="airplane"
        title="Travel Settings"
        subtitle="Budget tracking, currency conversion, trip planning"
        colors={colors}
        onPress={() =>
          Alert.alert(
            "Travel Settings",
            "Configure travel budget tracking, currency conversion preferences, trip planning tools, and expense categorization."
          )
        }
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="card"
        title="Credit & Accounts Settings"
        subtitle="Account display, balance alerts, payment reminders"
        colors={colors}
        onPress={() =>
          Alert.alert(
            "Credit & Accounts Settings",
            "Set up account display preferences, balance alerts, payment reminders, and credit utilization notifications."
          )
        }
      />
    </SettingsSection>
  );
};

export default ScreenSettingsSection;
