import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ThemeColors } from "../types";

interface SettingsHeaderProps {
  colors: ThemeColors;
  appVersion: string;
}

const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  colors,
  appVersion,
}) => {
  return (
    <View style={styles.header}>
      <View>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Manage your preferences
        </Text>
      </View>
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          {appVersion}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
  },
  versionContainer: {
    alignItems: "flex-end",
  },
  versionText: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.7,
  },
});

export default SettingsHeader;
