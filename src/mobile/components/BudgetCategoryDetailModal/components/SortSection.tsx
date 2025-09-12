import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SortMode } from "../types";
import { ThemeColors } from "../hooks/useThemeColors";
import { SORT_OPTIONS } from "../utils/subcategoryHelpers";

export interface SortSectionProps {
  sortMode: SortMode;
  showDropdown: boolean;
  colors: ThemeColors;
  onSortModeChange: (mode: SortMode) => void;
  onToggleDropdown: () => void;
  onBulkAllocation?: () => void;
}

const SortSection: React.FC<SortSectionProps> = ({
  sortMode,
  showDropdown,
  colors,
  onSortModeChange,
  onToggleDropdown,
  onBulkAllocation,
}) => {
  const currentSortOption = SORT_OPTIONS.find(
    (option) => option.key === sortMode
  );

  const handleSortOptionPress = (mode: SortMode) => {
    onSortModeChange(mode);
    onToggleDropdown(); // Close dropdown after selection
  };

  return (
    <View style={styles.sortSection}>
      {/* Single row with title, bulk edit icon, and sort dropdown */}
      <View style={styles.singleRow}>
        <View style={styles.sectionInfo}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Budget Progress
          </Text>
          <Text
            style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
          >
            Individual sub-category breakdown
          </Text>
        </View>

        <View style={styles.rightActions}>
          {onBulkAllocation && (
            <TouchableOpacity
              onPress={onBulkAllocation}
              style={[
                styles.bulkEditButton,
                {
                  backgroundColor: colors.primary + "20",
                  borderColor: colors.primary + "40",
                },
              ]}
              activeOpacity={0.8}
            >
              <Ionicons name="options" size={16} color={colors.primary} />
            </TouchableOpacity>
          )}

          {/* Sort dropdown integrated in the same row */}
          <View style={styles.sortContainer}>
            <TouchableOpacity
              style={[
                styles.sortButton,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  shadowColor: colors.shadow,
                },
              ]}
              onPress={onToggleDropdown}
              activeOpacity={0.7}
            >
              <Ionicons
                name={currentSortOption?.icon as any}
                size={16}
                color={colors.text}
              />
              <Text style={[styles.sortButtonText, { color: colors.text }]}>
                {currentSortOption?.label}
              </Text>
              <Ionicons
                name={showDropdown ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {/* Dropdown overlay */}
            {showDropdown && (
              <>
                {/* Backdrop to close dropdown */}
                <TouchableOpacity
                  style={styles.dropdownBackdrop}
                  onPress={onToggleDropdown}
                  activeOpacity={1}
                />

                {/* Dropdown menu positioned right under button */}
                <View
                  style={[
                    styles.sortDropdown,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      shadowColor: colors.shadow,
                    },
                  ]}
                >
                  {SORT_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.sortOption,
                        {
                          backgroundColor:
                            sortMode === option.key
                              ? colors.primary + "20"
                              : "transparent",
                        },
                      ]}
                      onPress={() => handleSortOptionPress(option.key)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={option.icon as any}
                        size={16}
                        color={
                          sortMode === option.key
                            ? colors.primary
                            : colors.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.sortOptionText,
                          {
                            color:
                              sortMode === option.key
                                ? colors.primary
                                : colors.text,
                            fontWeight: sortMode === option.key ? "600" : "400",
                          },
                        ]}
                      >
                        {`  ${option.label}`}
                      </Text>
                      {sortMode === option.key && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sortSection: {
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  singleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionInfo: {
    flex: 1,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bulkEditButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 15, // Match Quick Actions title size
    fontWeight: "600", // Match Quick Actions title weight
    marginBottom: 5, // Match Quick Actions spacing
    color: "#FFFFFF", // Fixed color for dark theme consistency
  },
  sectionSubtitle: {
    fontSize: 11, // Match Quick Actions subtitle size
    color: "#9CA3AF", // Fixed softer gray color
    lineHeight: 14, // Match Quick Actions line height
  },
  sortContainer: {
    position: "relative", // Container for dropdown positioning
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14, // Increased for better spacing
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    minHeight: 42,
    minWidth: 120, // Ensure minimum width to prevent text breaking
    elevation: 1,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "left",
    flexShrink: 0, // Prevent text from shrinking/breaking
  },
  dropdownBackdrop: {
    position: "absolute",
    top: -1000, // Cover area above
    left: -1000, // Cover area to the left
    right: -1000, // Cover area to the right
    bottom: -1000, // Cover area below
    zIndex: 998, // Just below the dropdown
    backgroundColor: "transparent", // Invisible backdrop
  },
  sortDropdown: {
    position: "absolute",
    top: "100%", // Position right under the button
    right: 0, // Align to right edge of container
    marginTop: 4, // Small gap between button and dropdown
    minWidth: 180, // Wider to prevent "Percentag e" wrapping
    maxWidth: 220,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    zIndex: 999, // Above the backdrop
    elevation: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44, // Compact touch target
    justifyContent: "space-between", // Align checkmark to right
  },
  sortOptionText: {
    fontSize: 13, // Slightly smaller to prevent wrapping
    fontWeight: "500",
    flex: 1,
    marginRight: 8, // Space before checkmark
  },
});

export default SortSection;
