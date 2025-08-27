import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CircularProgress from "../../common/CircularProgress";
import { BudgetSubcategory, ViewMode } from "../types";
import { ThemeColors } from "../hooks/useThemeColors";
import {
  formatCurrency,
  calculatePercentage,
  calculateRemaining,
  getProgressColor,
} from "../utils/budgetCalculations";

export interface SubCategoryCardProps {
  subcategory: BudgetSubcategory;
  viewMode: ViewMode;
  colors: ThemeColors;
  onEdit: () => void;
}

const { width: screenWidth } = Dimensions.get("window");
const cardWidth = (screenWidth - 48) / 3; // 3 cards per row with 16px margin on each side and 8px gap between cards

const SubCategoryCard: React.FC<SubCategoryCardProps> = ({
  subcategory,
  viewMode,
  colors,
  onEdit,
}) => {
  const percentage = calculatePercentage(
    subcategory.current_spend || 0,
    subcategory.amount
  );
  const remaining = calculateRemaining(
    subcategory.current_spend || 0,
    subcategory.amount
  );
  const progressColor = getProgressColor(
    subcategory.current_spend || 0,
    subcategory.amount,
    colors
  );

  if (viewMode === "grid") {
    return (
      <TouchableOpacity
        style={[
          styles.gridCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            width: cardWidth,
          },
        ]}
        onPress={onEdit}
        activeOpacity={0.85}
        delayPressIn={0}
        delayPressOut={50}
      >
        {/* Subtle edit button - top right */}
        <View
          style={[
            styles.editButton,
            { backgroundColor: colors.border + "60" }, // More subtle background
          ]}
        >
          <Ionicons name="pencil" size={8} color={colors.textSecondary} />
        </View>

        {/* Icon - prominent placement with Ionicons support */}
        {subcategory.icon.length === 1 || /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(subcategory.icon) ? (
          <Text style={styles.gridIcon}>{subcategory.icon}</Text>
        ) : (
          <Ionicons 
            name={subcategory.icon as any} 
            size={24} 
            color={subcategory.color || "#10B981"}
            style={styles.gridIconIon}
          />
        )}

        {/* Name - clear hierarchy */}
        <Text
          style={[styles.gridName, { color: colors.text }]}
          numberOfLines={2}
        >
          {subcategory.name}
        </Text>

        {/* Circular progress with percentage inside only */}
        <View style={styles.progressContainer}>
          <CircularProgress
            percentage={Math.min(percentage, 100)}
            size={55}
            strokeWidth={4} // Consistent stroke thickness across all cards
            color={progressColor}
            backgroundColor={colors.border + "30"}
          />
        </View>

        {/* Supporting budget text */}
        <Text
          style={[styles.gridAmount, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {formatCurrency(subcategory.current_spend || 0, 0)} / {formatCurrency(subcategory.amount, 0)}
        </Text>
      </TouchableOpacity>
    );
  }

  // List view
  return (
    <TouchableOpacity
      style={[
        styles.listCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={onEdit}
      activeOpacity={0.85}
      delayPressIn={0}
      delayPressOut={50}
    >
      {/* Header row */}
      <View style={styles.listHeader}>
        {/* Icon container */}
        <View
          style={[
            styles.listIconContainer,
            { backgroundColor: subcategory.color + "20" }, // 20% opacity like Quick Actions
          ]}
        >
          {subcategory.icon.length === 1 || /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(subcategory.icon) ? (
            <Text style={styles.listIcon}>{subcategory.icon}</Text>
          ) : (
            <Ionicons 
              name={subcategory.icon as any} 
              size={20} 
              color={subcategory.color || "#10B981"}
              style={styles.listIconIon}
            />
          )}
        </View>

        {/* Info section */}
        <View style={styles.listInfo}>
          <Text style={[styles.listName, { color: colors.text }]}>
            {subcategory.name}
          </Text>
          <Text style={[styles.listAmount, { color: colors.textSecondary }]}>
            {formatCurrency(subcategory.current_spend || 0)} /{" "}
            {formatCurrency(subcategory.amount)}({Math.round(percentage)}
            %)
          </Text>
        </View>

        {/* Actions section - only edit button, no circular progress */}
        <View style={styles.listActions}>
          <TouchableOpacity
            style={[
              styles.listEditButton,
              { backgroundColor: colors.primary + "20" },
            ]}
            onPress={onEdit}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[styles.progressTrack, { backgroundColor: colors.border }]}
        >
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: progressColor,
                width: `${Math.min(percentage, 100)}%`,
              },
            ]}
          />
        </View>
        <Text
          style={[
            styles.remainingText,
            {
              color: remaining >= 0 ? colors.success : colors.error,
            },
          ]}
        >
          {formatCurrency(Math.abs(remaining), 0)}{" "}
          {remaining >= 0 ? "left" : "over"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Grid styles matching Quick Actions cards - more compact
  gridCard: {
    padding: 12, // Reduced for tighter, more compact grid
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    position: "relative",
    minHeight: 130, // Slightly reduced height
    justifyContent: "space-between",
    // Quick Actions card styling
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  editButton: {
    position: "absolute",
    top: 6,
    right: 6,
    padding: 3, // Even smaller for maximum subtlety
    borderRadius: 6,
    zIndex: 1,
    opacity: 0.8, // Slightly transparent for subtlety
  },
  progressContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6, // Reduced spacing
  },
  progressOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  gridIcon: {
    fontSize: 18, // Slightly smaller for compact layout
    marginBottom: 6, // Reduced spacing for compactness
  },
  gridIconIon: {
    marginBottom: 6,
  },
  gridName: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 6, // More compact spacing
    minHeight: 24, // Reduced for compactness
    lineHeight: 14,
  },
  gridAmount: {
    fontSize: 10,
    fontWeight: "400", // Lighter supporting text
    textAlign: "center",
    opacity: 0.8,
    letterSpacing: 0.2,
  },

  // List styles matching Quick Actions cards
  listCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    // Quick Actions card styling
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  listIconContainer: {
    width: 32, // Smaller to match Quick Actions style
    height: 32,
    borderRadius: 8, // Less rounded for modern look
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    // Background will be set with 20% opacity like Quick Actions
  },
  listIcon: {
    fontSize: 16, // Smaller icon to match container
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 15, // Match Quick Actions action title
    fontWeight: "600",
    marginBottom: 5, // Match Quick Actions spacing
  },
  listAmount: {
    fontSize: 11, // Match Quick Actions action subtitle
    opacity: 0.8,
    lineHeight: 14, // Match Quick Actions line height
  },
  listActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", // Align edit button to the right
  },
  listEditButton: {
    padding: 8,
    borderRadius: 10,
    minWidth: 32,
    minHeight: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  remainingText: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 70,
    textAlign: "right",
  },
});

export default SubCategoryCard;
