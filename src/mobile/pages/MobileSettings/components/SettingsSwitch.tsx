import React from "react";
import { Switch } from "react-native";
import { ThemeColors } from "../types";

interface SettingsSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  colors: ThemeColors;
}

const SettingsSwitch: React.FC<SettingsSwitchProps> = ({
  value,
  onValueChange,
  colors,
}) => {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{
        false: colors.border,
        true: colors.primary + "40",
      }}
      thumbColor={value ? colors.primary : colors.textSecondary}
    />
  );
};

export default SettingsSwitch;
