import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, Theme } from "../../../../contexts/ThemeContext";

interface ThemeSelectorProps {
  colors: any;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ colors }) => {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { key: "light" as Theme, label: "Light", icon: "sunny" },
    { key: "dark" as Theme, label: "Dark", icon: "moon" },
    { key: "system" as Theme, label: "System", icon: "phone-portrait" },
  ];

  const handleThemeSelect = () => {
    Alert.alert(
      "Theme Settings",
      "Choose your preferred theme",
      themeOptions
        .map((option) => ({
          text: option.label,
          onPress: () => setTheme(option.key),
        }))
        .concat([{ text: "Cancel", style: "cancel" }])
    );
  };

  const getCurrentThemeLabel = () => {
    const current = themeOptions.find((option) => option.key === theme);
    return current ? current.label : "System";
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={handleThemeSelect}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.primary + "20" },
          ]}
        >
          <Ionicons name="color-palette" size={20} color={colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Theme</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {getCurrentThemeLabel()} Mode
          </Text>
        </View>
      </View>
      <View style={styles.right}>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default ThemeSelector;
