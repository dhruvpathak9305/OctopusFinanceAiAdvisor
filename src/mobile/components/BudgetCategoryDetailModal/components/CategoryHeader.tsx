import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ViewMode } from "../types";
import { ThemeColors } from "../hooks/useThemeColors";

export interface CategoryHeaderProps {
  title: string;
  subtitle?: string;
  showViewToggle?: boolean;
  showCloseButton?: boolean;
  showBackButton?: boolean;
  viewMode?: ViewMode;
  colors: ThemeColors;
  onClose?: () => void;
  onBack?: () => void;
  onViewModeChange?: (mode: ViewMode) => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  title,
  subtitle,
  showViewToggle = false,
  showCloseButton = false,
  showBackButton = false,
  viewMode = "grid",
  colors,
  onClose,
  onBack,
  onViewModeChange,
}) => {
  const renderLeftButton = () => {
    if (showBackButton && onBack) {
      return (
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      );
    }

    if (showCloseButton && onClose) {
      return (
        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      );
    }

    return <View style={styles.headerButton} />;
  };

  const renderRightButton = () => {
    if (showViewToggle && onViewModeChange) {
      return (
        <View
          style={[styles.viewToggle, { backgroundColor: colors.border + "40" }]}
        >
          <TouchableOpacity
            onPress={() => onViewModeChange("grid")}
            style={[
              styles.toggleButton,
              {
                backgroundColor:
                  viewMode === "grid" ? colors.primary : "transparent",
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="grid"
              size={16}
              color={viewMode === "grid" ? "#FFFFFF" : colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onViewModeChange("list")}
            style={[
              styles.toggleButton,
              {
                backgroundColor:
                  viewMode === "list" ? colors.primary : "transparent",
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="list"
              size={16}
              color={viewMode === "list" ? "#FFFFFF" : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      );
    }

    return <View style={styles.headerButton} />;
  };

  return (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      {renderLeftButton()}

      <View style={styles.headerCenter}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.headerSubtitle, { color: colors.textSecondary }]}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {renderRightButton()}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    minHeight: 100,
  },
  headerButton: {
    padding: 8,
    minWidth: 40,
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 20, // Larger, bold heading
    fontWeight: "800", // Bold like Quick Actions
    textAlign: "center",
    color: "#FFFFFF", // Fixed white for dark theme
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11, // Smaller, uniform subtitle
    color: "#9CA3AF", // Fixed softer gray
    marginTop: 2,
    textAlign: "center",
    fontWeight: "500",
  },
  viewToggle: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 2,
    overflow: "hidden",
  },
  toggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginHorizontal: 1,
    minWidth: 36,
    alignItems: "center",
  },
});

export default CategoryHeader;
