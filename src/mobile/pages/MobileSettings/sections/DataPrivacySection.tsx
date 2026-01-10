import React from "react";
import { Alert } from "react-native";
import {
  SettingsSection,
  SettingsItem,
  SettingsSeparator,
  SettingsSwitch,
} from "../components";
import { ThemeColors, SettingsHandlers, SettingsState } from "../types";
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";
import { useSecurity } from "@/contexts/SecurityContext";

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
  const { deleteAccount } = useUnifiedAuth();
  const { isAppLockEnabled, setAppLockEnabled } = useSecurity();
  
  return (
    <SettingsSection title="Data & Privacy" colors={colors}>
      <SettingsItem
        icon="scan-outline"
        title="Biometric App Lock"
        subtitle="Require FaceID/TouchID to open"
        colors={colors}
        showArrow={false}
        rightComponent={
          <SettingsSwitch
            value={isAppLockEnabled}
            onValueChange={setAppLockEnabled}
            colors={colors}
          />
        }
      />
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
        icon="trash-bin" 
        title="Delete Account"
        subtitle="Permanently delete your account and data"
        colors={colors}
        titleStyle={{ color: colors.error }}
        onPress={() =>
          Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account? This will permanently erase all your data from our servers. This action CANNOT be undone.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete Forever",
                style: "destructive",
                onPress: () => deleteAccount(),
              },
            ]
          )
        }
      />
    </SettingsSection>
  );
};

export default DataPrivacySection;
