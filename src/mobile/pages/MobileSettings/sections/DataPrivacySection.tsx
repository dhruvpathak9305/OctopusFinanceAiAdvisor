import React from "react";
import { Alert } from "react-native";
import {
  SettingsSection,
  SettingsItem,
  SettingsSeparator,
  SettingsSwitch,
} from "../components";
import { ThemeColors, SettingsHandlers, SettingsState } from "../types";

interface DataPrivacySectionProps {
  colors: ThemeColors;
  handlers: SettingsHandlers;
  settingsState: SettingsState;
  setBiometricEnabled: (value: boolean) => void;
}

const DataPrivacySection: React.FC<DataPrivacySectionProps> = ({
  colors,
  handlers,
  settingsState,
  setBiometricEnabled,
}) => {
  return (
    <SettingsSection title="Data & Privacy" colors={colors}>
      <SettingsItem
        icon="shield-checkmark"
        title="Data Security"
        subtitle="Encryption, biometric access, privacy settings"
        colors={colors}
        rightComponent={
          <SettingsSwitch
            value={settingsState.biometricEnabled}
            onValueChange={setBiometricEnabled}
            colors={colors}
          />
        }
        showArrow={false}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="eye-off"
        title="Demo Mode"
        subtitle="Use sample data for testing and demos"
        colors={colors}
        onPress={handlers.handleDemoMode}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="download"
        title="Data Export"
        subtitle="Export your financial data"
        colors={colors}
        onPress={handlers.handleDataExport}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="trash"
        title="Clear Data"
        subtitle="Reset all financial data"
        colors={colors}
        onPress={() =>
          Alert.alert(
            "Clear Data",
            "This will permanently delete all your financial data. This action cannot be undone.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Clear All Data",
                style: "destructive",
                onPress: () =>
                  Alert.alert("Cleared", "All data has been cleared."),
              },
            ]
          )
        }
      />
    </SettingsSection>
  );
};

export default DataPrivacySection;
