import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SettingsSectionProps } from "../types";

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
  colors,
}) => {
  return (
    <View style={styles.section}>
      {title && (
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {title}
        </Text>
      )}
      <View
        style={[styles.sectionContent, { backgroundColor: colors.surface }]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: "hidden",
  },
});

export default SettingsSection;
