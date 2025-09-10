import React from "react";
import { Alert } from "react-native";
import {
  SettingsSection,
  SettingsItem,
  SettingsSeparator,
} from "../components";
import { ThemeColors, SettingsHandlers } from "../types";

interface ToolsSupportSectionProps {
  colors: ThemeColors;
  handlers: SettingsHandlers;
}

const ToolsSupportSection: React.FC<ToolsSupportSectionProps> = ({
  colors,
  handlers,
}) => {
  return (
    <SettingsSection title="Tools & Support" colors={colors}>
      <SettingsItem
        icon="calculator"
        title="Financial Calculator"
        subtitle="Loan, investment, and budget calculators"
        colors={colors}
        onPress={handlers.handleCalcBox}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="desktop"
        title="Desktop Sync"
        subtitle="Sync with desktop application"
        colors={colors}
        onPress={handlers.handlePCManager}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="help-circle"
        title="Help & Documentation"
        colors={colors}
        onPress={handlers.handleHelp}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="chatbubble-ellipses"
        title="Feedback & Support"
        colors={colors}
        onPress={handlers.handleFeedback}
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="heart"
        title="Rate OctopusFinancer"
        colors={colors}
        onPress={() => Alert.alert("Rate", "App store rating coming soon")}
      />
    </SettingsSection>
  );
};

export default ToolsSupportSection;
