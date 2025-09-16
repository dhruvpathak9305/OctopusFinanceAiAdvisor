import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CircularProgress from "../../common/CircularProgress";
import { BudgetCategory } from "../types";
import { ThemeColors } from "../hooks/useThemeColors";
import { renderIconFromName } from "../../../../../utils/subcategoryIcons";
import {
  formatCurrency,
  formatPercentage,
  getProgressColor,
} from "../utils/budgetCalculations";

export interface BudgetSummaryProps {
  category: BudgetCategory;
  totalSpent: number;
  totalBudget: number;
  totalPercentage: number;
  colors: ThemeColors;
  onAddSubcategory: () => void;
  onEditCategory?: () => void;
  onDurationChange?: (duration: string) => void;
  selectedDuration?: string;
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  category,
  totalSpent,
  totalBudget,
  totalPercentage,
  colors,
  onAddSubcategory,
  onEditCategory,
  onDurationChange,
  selectedDuration = "Monthly",
}) => {
  const progressColor = getProgressColor(totalSpent, totalBudget, colors);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Duration Dropdown Component with auto-close functionality
  const DurationDropdown: React.FC = () => {
    const durationOptions = ["Monthly", "Quarterly", "Yearly"];

    return (
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={[
            styles.dropdownButton,
            {
              backgroundColor: colors.primary + "20",
              borderColor: colors.primary + "40",
            },
          ]}
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          activeOpacity={0.8}
        >
          <Text style={[styles.dropdownButtonText, { color: colors.text }]}>
            {selectedDuration}
          </Text>
          <Text style={[styles.dropdownArrow, { color: colors.text }]}>
            {isDropdownOpen ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>

        {isDropdownOpen && (
          <View
            style={[
              styles.dropdownMenu,
              {
                backgroundColor: colors.card,
                borderColor: colors.primary + "40",
              },
            ]}
          >
            {durationOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dropdownItem,
                  selectedDuration === option && {
                    backgroundColor: "#10B98120",
                  },
                ]}
                onPress={() => {
                  onDurationChange?.(option);
                  setIsDropdownOpen(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                  {option}
                </Text>
                {selectedDuration === option && (
                  <Text style={styles.dropdownCheckmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Map database icon names to Lucide React icon names
  const mapIconNameToLucide = (iconName: string): string => {
    const iconMap: { [key: string]: string } = {
      // Expense icons
      home: "Home",
      heart: "Heart",
      "piggy-bank": "PiggyBank",
      wallet: "Wallet",

      // Income icons
      briefcase: "Briefcase",
      "trending-up": "TrendingUp",
      building: "Building",
      gift: "Gift",
      receipt: "Receipt",
      "dollar-sign": "DollarSign",

      // Fallback
      circle: "Circle",
    };

    return iconMap[iconName] || "Circle";
  };

  const renderCategoryIcon = () => {
    if (category.icon) {
      const lucideIconName = mapIconNameToLucide(category.icon);
      return renderIconFromName(lucideIconName, 22, category.ring_color);
    }
    // Fallback to emoji for backward compatibility
    return <Text style={styles.categoryIconText}>🏠</Text>;
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (isDropdownOpen) {
          setIsDropdownOpen(false);
        }
      }}
    >
      <View
        style={[
          styles.summaryCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {/* Header with category info and add button */}
        <View style={styles.summaryHeader}>
          <View
            style={[
              styles.categoryIcon,
              { backgroundColor: category.ring_color + "15" }, // 15% opacity like Quick Actions
            ]}
          >
            {renderCategoryIcon()}
          </View>

          <View style={styles.summaryInfo}>
            <View style={styles.titleRow}>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>
                {category.name}
              </Text>
              <View style={styles.actionButtons}>
                {onDurationChange && <DurationDropdown />}
                {onEditCategory && (
                  <TouchableOpacity
                    onPress={onEditCategory}
                    style={[
                      styles.editButton,
                      {
                        backgroundColor: colors.primary + "20",
                        borderColor: colors.primary + "40",
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="pencil" size={16} color={colors.primary} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={onAddSubcategory}
                  style={[
                    styles.addButton,
                    { backgroundColor: colors.primary },
                  ]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
            <Text
              style={[styles.summarySubtitle, { color: colors.textSecondary }]}
            >
              Budget breakdown and progress
            </Text>
          </View>
        </View>

        {/* Metrics with circular progress */}
        <View style={styles.summaryMetrics}>
          {/* Spent amount */}
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              SPENT
            </Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {formatCurrency(totalSpent)}
            </Text>
          </View>

          {/* Central circular progress with pending amount */}
          <View style={styles.progressContainer}>
            <CircularProgress
              percentage={Math.min(totalPercentage, 100)}
              size={80}
              strokeWidth={4} // Consistent stroke thickness across all progress circles
              color={progressColor}
              backgroundColor={colors.border + "30"}
            />
            <Text
              style={[
                styles.pendingAmount,
                {
                  color: progressColor, // Match the circular progress bar color
                },
              ]}
            >
              {formatCurrency(Math.abs(totalBudget - totalSpent), 0)}{" "}
              {totalBudget - totalSpent >= 0 ? "left" : "over"}
            </Text>
          </View>

          {/* Budget limit */}
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              LIMIT
            </Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {formatCurrency(totalBudget)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
    marginHorizontal: 16,
    // Quick Actions card styling
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16, // Reduced from 20
  },
  categoryIcon: {
    // Bigger icon container for better visual impact
    width: 45,
    height: 45,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    // Background will be set dynamically with 15% opacity like Quick Actions
  },
  categoryIconText: {
    fontSize: 18, // Bigger icon for better visibility
  },
  summaryInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryTitle: {
    fontSize: 20, // Match FinancialSummaryCard value size
    fontWeight: "800", // Match FinancialSummaryCard bold style
    letterSpacing: -0.8, // Match FinancialSummaryCard letter spacing
    flex: 1, // Allow title to take available space
  },
  summarySubtitle: {
    fontSize: 12, // Match FinancialSummaryCard title size
    color: "#9CA3AF", // Fixed color - softer gray for subtitles
    fontWeight: "600", // Match FinancialSummaryCard title weight
    opacity: 1, // Remove opacity, use fixed color instead
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    // Smaller size for better card fit
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addButton: {
    // Smaller size for better card fit
    width: 32,
    height: 32,
    borderRadius: 16, // Circular
    justifyContent: "center",
    alignItems: "center",
    // Reduced shadow for smaller size
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  summaryMetrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // Removed marginBottom since no status section
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricLabel: {
    fontSize: 10, // Smaller, uniform labels
    marginBottom: 6,
    color: "#9CA3AF", // Fixed softer gray color
    fontWeight: "500",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "800", // Bold values matching Quick Actions
    letterSpacing: -0.2,
    color: "#FFFFFF", // Fixed white for dark theme
  },
  progressContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  progressOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    fontSize: 15, // Slightly smaller for better balance
    fontWeight: "800", // Bold like Quick Actions
    letterSpacing: -0.3,
    color: "#FFFFFF", // Fixed white for better contrast
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  pendingAmount: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  // Dropdown styles
  dropdownContainer: {
    position: "relative",
    zIndex: 1000,
    minWidth: 90,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    height: 32, // Match reduced button heights
    borderRadius: 16, // Match button border radius for consistency
    borderWidth: 2, // Match edit button border width
    minWidth: 90,
    // Reduced shadow to match smaller buttons
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dropdownButtonText: {
    fontSize: 11,
    fontWeight: "600",
  },
  dropdownArrow: {
    fontSize: 10,
    marginLeft: 4,
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    left: 0,
    borderRadius: 12, // Slightly less rounded for smaller design
    borderWidth: 2, // Match button border width
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4, // Match reduced button elevation
    zIndex: 1001,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownItemText: {
    fontSize: 12,
    fontWeight: "500",
  },
  dropdownCheckmark: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "bold",
  },
  // Removed status-related styles as per requirements
});

export default BudgetSummary;
