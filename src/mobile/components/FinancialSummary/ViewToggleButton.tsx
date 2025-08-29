import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { useTheme } from "../../../../contexts/ThemeContext";

interface ViewToggleButtonProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const ViewToggleButton: React.FC<ViewToggleButtonProps> = ({
  isExpanded,
  onToggle,
}) => {
  const { isDark } = useTheme();

  const colors = isDark
    ? {
        background: "#1F2937",
        text: "#FFFFFF",
        textSecondary: "#9CA3AF",
        border: "#374151",
        primary: "#10B981",
      }
    : {
        background: "#FFFFFF",
        text: "#111827",
        textSecondary: "#6B7280",
        border: "#E5E7EB",
        primary: "#10B981",
      };

  return (
    <TouchableOpacity
      style={[
        styles.toggleButton,
        {
          backgroundColor: colors.primary + "20",
          borderColor: colors.primary + "40",
        },
      ]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <Text style={[styles.toggleIcon, { color: colors.primary }]}>
        {isExpanded ? "⊟" : "⊞"}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleIcon: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ViewToggleButton;
