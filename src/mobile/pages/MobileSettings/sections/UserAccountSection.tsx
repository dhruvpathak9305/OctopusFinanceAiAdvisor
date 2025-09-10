import React from "react";
import { Alert } from "react-native";
import {
  SettingsSection,
  SettingsItem,
  SettingsSeparator,
} from "../components";
import { ThemeColors, SettingsHandlers } from "../types";

interface UserAccountSectionProps {
  colors: ThemeColors;
  handlers: SettingsHandlers;
  user: any; // User type from auth context
}

const UserAccountSection: React.FC<UserAccountSectionProps> = ({
  colors,
  handlers,
  user,
}) => {
  if (!user) return null;

  return (
    <SettingsSection colors={colors}>
      <SettingsItem
        icon="person-circle"
        title="Account"
        subtitle={user.email || "User Account"}
        colors={colors}
        onPress={() => Alert.alert("Account", "Account details coming soon")}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="log-out"
        title="Sign Out"
        colors={colors}
        onPress={handlers.handleSignOut}
        showArrow={false}
      />
    </SettingsSection>
  );
};

export default UserAccountSection;
