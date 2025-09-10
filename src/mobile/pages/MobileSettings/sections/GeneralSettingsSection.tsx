import React from "react";
import { Alert, View, Text, StyleSheet } from "react-native";
import {
  SettingsSection,
  SettingsItem,
  SettingsSeparator,
  SettingsSwitch,
} from "../components";
import { ThemeColors, SettingsHandlers, SettingsState } from "../types";

interface GeneralSettingsSectionProps {
  colors: ThemeColors;
  theme: string;
  handlers: SettingsHandlers;
  settingsState: SettingsState;
  setNotificationsEnabled: (value: boolean) => void;
}

const GeneralSettingsSection: React.FC<GeneralSettingsSectionProps> = ({
  colors,
  theme,
  handlers,
  settingsState,
  setNotificationsEnabled,
}) => {
  return (
    <SettingsSection title="Settings" colors={colors}>
      <SettingsItem
        icon="cloud-upload"
        title="Backup"
        subtitle="Export, Import, A complete reset"
        colors={colors}
        onPress={handlers.handleBackup}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="lock-closed"
        title="Passcode"
        colors={colors}
        rightComponent={
          <View style={styles.passcodeIndicator}>
            <Text style={[styles.passcodeText, { color: colors.error }]}>
              ON
            </Text>
          </View>
        }
        onPress={() => Alert.alert("Passcode", "Passcode settings coming soon")}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="cash"
        title="Main Currency Setting"
        subtitle="INR(₹)"
        colors={colors}
        onPress={() => Alert.alert("Currency", "Currency settings coming soon")}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="card"
        title="Sub Currency Setting"
        colors={colors}
        onPress={() =>
          Alert.alert("Sub Currency", "Sub currency settings coming soon")
        }
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="notifications"
        title="Alarm Setting"
        colors={colors}
        rightComponent={
          <SettingsSwitch
            value={settingsState.notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            colors={colors}
          />
        }
        showArrow={false}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="color-palette"
        title="Style"
        subtitle={`${theme.charAt(0).toUpperCase() + theme.slice(1)} Theme`}
        colors={colors}
        onPress={handlers.handleThemeChange}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="apps"
        title="Application Icon"
        colors={colors}
        onPress={() =>
          Alert.alert("App Icon", "App icon customization coming soon")
        }
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="language"
        title="Language Setting"
        colors={colors}
        onPress={() => Alert.alert("Language", "Language settings coming soon")}
      />
    </SettingsSection>
  );
};

const styles = StyleSheet.create({
  passcodeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  passcodeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default GeneralSettingsSection;
