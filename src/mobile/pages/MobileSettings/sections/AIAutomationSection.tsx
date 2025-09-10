import React from "react";
import { Alert } from "react-native";
import {
  SettingsSection,
  SettingsItem,
  SettingsSeparator,
  SettingsSwitch,
} from "../components";
import { ThemeColors, SettingsState } from "../types";

interface AIAutomationSectionProps {
  colors: ThemeColors;
  settingsState: SettingsState;
  setAutoBackup: (value: boolean) => void;
}

const AIAutomationSection: React.FC<AIAutomationSectionProps> = ({
  colors,
  settingsState,
  setAutoBackup,
}) => {
  return (
    <SettingsSection title="AI & Automation" colors={colors}>
      <SettingsItem
        icon="brain"
        title="AI Insights"
        subtitle="Personalized financial recommendations"
        colors={colors}
        onPress={() =>
          Alert.alert(
            "AI Insights",
            "Configure AI-powered spending insights, budget recommendations, and financial goal suggestions."
          )
        }
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="refresh"
        title="Auto-Categorization"
        subtitle="Machine learning transaction categorization"
        colors={colors}
        rightComponent={
          <SettingsSwitch
            value={settingsState.autoBackup}
            onValueChange={setAutoBackup}
            colors={colors}
          />
        }
        showArrow={false}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="calendar"
        title="Recurring Bills"
        subtitle="Automatic bill tracking and reminders"
        colors={colors}
        onPress={() =>
          Alert.alert(
            "Recurring Bills",
            "Set up automatic bill detection, payment reminders, and autopay management."
          )
        }
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="document-text"
        title="Bank Statement Parser"
        subtitle="CSV import and automatic processing"
        colors={colors}
        onPress={() =>
          Alert.alert(
            "Bank Statements",
            "Configure CSV import settings, bank-specific parsers, and automatic transaction processing."
          )
        }
      />
    </SettingsSection>
  );
};

export default AIAutomationSection;
