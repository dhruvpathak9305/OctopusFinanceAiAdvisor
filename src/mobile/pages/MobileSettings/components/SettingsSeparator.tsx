import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemeColors } from "../types";

interface SettingsSeparatorProps {
  colors: ThemeColors;
}

const SettingsSeparator: React.FC<SettingsSeparatorProps> = ({ colors }) => {
  return (
    <View style={[styles.separator, { backgroundColor: colors.border }]} />
  );
};

const styles = StyleSheet.create({
  separator: {
    height: 1,
    marginLeft: 60,
  },
});

export default SettingsSeparator;
