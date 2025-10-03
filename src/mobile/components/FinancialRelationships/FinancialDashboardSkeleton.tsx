import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";
import { useTheme } from "../../../../contexts/ThemeContext";

interface FinancialDashboardSkeletonProps {
  isDark?: boolean;
}

const FinancialDashboardSkeleton: React.FC<FinancialDashboardSkeletonProps> = ({
  isDark = true,
}) => {
  const { isDark: themeIsDark } = useTheme();
  const isCurrentlyDark = isDark || themeIsDark;

  // Animation for subtle pulse effect
  const pulseAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, [pulseAnim]);

  // Colors based on the actual FinancialDashboard theme
  const colors = {
    background: isCurrentlyDark ? "#111827" : "#F9FAFB",
    card: isCurrentlyDark ? "#1F2937" : "#FFFFFF",
    cardHighlight: isCurrentlyDark ? "#2D3748" : "#F3F4F6",
    border: isCurrentlyDark ? "#374151" : "#E5E7EB",
    primary: "#10B981",
    skeletonBase: isCurrentlyDark ? "#374151" : "#E5E7EB",
    skeletonHighlight: isCurrentlyDark ? "#4B5563" : "#F3F4F6",
    success: "#10B981",
    danger: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6",
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Financial Summary Section Skeleton */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {/* Section Title */}
        <Animated.View
          style={[
            styles.skeletonText,
            styles.sectionTitle,
            { backgroundColor: colors.skeletonBase, opacity: pulseAnim },
          ]}
        />

        {/* Summary Cards Row */}
        <View style={styles.summaryCardsRow}>
          {/* You are owed Card */}
          <View
            style={[
              styles.summaryCardSkeleton,
              { backgroundColor: colors.cardHighlight },
            ]}
          >
            <View
              style={[
                styles.skeletonIcon,
                styles.summaryIcon,
                { backgroundColor: colors.success + "40" },
              ]}
            />
            <View
              style={[
                styles.skeletonText,
                styles.summaryLabel,
                { backgroundColor: colors.skeletonBase },
              ]}
            />
            <Animated.View
              style={[
                styles.skeletonText,
                styles.summaryValue,
                { backgroundColor: colors.success + "60", opacity: pulseAnim },
              ]}
            />
            <View
              style={[
                styles.skeletonText,
                styles.summarySubtext,
                { backgroundColor: colors.skeletonBase },
              ]}
            />
          </View>

          {/* You owe Card */}
          <View
            style={[
              styles.summaryCardSkeleton,
              { backgroundColor: colors.cardHighlight },
            ]}
          >
            <View
              style={[
                styles.skeletonIcon,
                styles.summaryIcon,
                { backgroundColor: colors.danger + "40" },
              ]}
            />
            <View
              style={[
                styles.skeletonText,
                styles.summaryLabel,
                { backgroundColor: colors.skeletonBase },
              ]}
            />
            <Animated.View
              style={[
                styles.skeletonText,
                styles.summaryValue,
                { backgroundColor: colors.danger + "60", opacity: pulseAnim },
              ]}
            />
            <View
              style={[
                styles.skeletonText,
                styles.summarySubtext,
                { backgroundColor: colors.skeletonBase },
              ]}
            />
          </View>
        </View>

        {/* Net Balance Card */}
        <View
          style={[
            styles.netBalanceCardSkeleton,
            {
              backgroundColor: colors.cardHighlight,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.netBalanceHeader}>
            <View
              style={[
                styles.skeletonText,
                styles.netBalanceTitle,
                { backgroundColor: colors.skeletonBase },
              ]}
            />
            <Animated.View
              style={[
                styles.skeletonText,
                styles.netBalanceValue,
                { backgroundColor: colors.success + "60", opacity: pulseAnim },
              ]}
            />
          </View>

          {/* Balance Indicator Bar */}
          <View style={styles.balanceIndicatorContainer}>
            <View
              style={[
                styles.balanceIndicatorBar,
                { backgroundColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.balanceIndicatorFill,
                  { backgroundColor: colors.success },
                ]}
              />
            </View>
            <View style={styles.balanceLabelsContainer}>
              <View
                style={[
                  styles.skeletonText,
                  styles.balanceLabel,
                  { backgroundColor: colors.skeletonBase },
                ]}
              />
              <View
                style={[
                  styles.skeletonText,
                  styles.balanceLabel,
                  { backgroundColor: colors.skeletonBase },
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions Section Skeleton */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View
          style={[
            styles.skeletonText,
            styles.sectionTitle,
            { backgroundColor: colors.skeletonBase },
          ]}
        />
        <View style={styles.actionButtonsGrid}>
          {/* Loan Button */}
          <View
            style={[
              styles.gridActionButtonSkeleton,
              {
                backgroundColor: isCurrentlyDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.02)",
              },
            ]}
          >
            <View
              style={[
                styles.skeletonCircle,
                styles.actionIcon,
                { backgroundColor: colors.success + "15" },
              ]}
            />
            <View
              style={[
                styles.skeletonText,
                styles.actionText,
                { backgroundColor: colors.skeletonBase },
              ]}
            />
          </View>

          {/* Request Button */}
          <View
            style={[
              styles.gridActionButtonSkeleton,
              {
                backgroundColor: isCurrentlyDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.02)",
              },
            ]}
          >
            <View
              style={[
                styles.skeletonCircle,
                styles.actionIcon,
                { backgroundColor: colors.info + "15" },
              ]}
            />
            <View
              style={[
                styles.skeletonText,
                styles.actionText,
                { backgroundColor: colors.skeletonBase },
              ]}
            />
          </View>

          {/* View All Button */}
          <View
            style={[
              styles.gridActionButtonSkeleton,
              {
                backgroundColor: isCurrentlyDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.02)",
              },
            ]}
          >
            <View
              style={[
                styles.skeletonCircle,
                styles.actionIcon,
                { backgroundColor: colors.warning + "15" },
              ]}
            />
            <View
              style={[
                styles.skeletonText,
                styles.actionText,
                { backgroundColor: colors.skeletonBase },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Recent Activity Section Skeleton */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeaderRow}>
          <View
            style={[
              styles.skeletonText,
              styles.sectionTitle,
              { backgroundColor: colors.skeletonBase },
            ]}
          />
          <View
            style={[
              styles.skeletonText,
              styles.viewAllButton,
              { backgroundColor: colors.primary + "40" },
            ]}
          />
        </View>

        {/* Recent Activity Items */}
        {[1, 2].map((item) => (
          <View
            key={item}
            style={[
              styles.activityItemSkeleton,
              { backgroundColor: colors.cardHighlight },
            ]}
          >
            <View
              style={[
                styles.skeletonCircle,
                styles.activityIcon,
                { backgroundColor: colors.success + "40" },
              ]}
            />
            <View style={styles.activityContent}>
              <View style={styles.activityHeader}>
                <View
                  style={[
                    styles.skeletonText,
                    styles.activityDescription,
                    { backgroundColor: colors.skeletonBase },
                  ]}
                />
                <View
                  style={[
                    styles.skeletonText,
                    styles.activityAmount,
                    { backgroundColor: colors.success + "60" },
                  ]}
                />
              </View>
              <View
                style={[
                  styles.skeletonText,
                  styles.activityDate,
                  { backgroundColor: colors.skeletonBase },
                ]}
              />
            </View>
            <View
              style={[
                styles.skeletonIcon,
                styles.chevronIcon,
                { backgroundColor: colors.skeletonBase },
              ]}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  // Card Base - matches actual dashboard
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Section Title - matches cardTitle style
  sectionTitle: {
    width: 150,
    height: 16,
    marginBottom: 16,
    borderRadius: 4,
  },

  // Summary Cards
  summaryCardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryCardSkeleton: {
    width: "48%",
    borderRadius: 10,
    padding: 12,
    elevation: 1,
    alignItems: "flex-start",
  },
  summaryIcon: {
    width: 24,
    height: 24,
    marginBottom: 8,
  },
  summaryLabel: {
    width: 80,
    height: 12,
    marginBottom: 4,
  },
  summaryValue: {
    width: 60,
    height: 18,
    marginBottom: 4,
  },
  summarySubtext: {
    width: 70,
    height: 11,
  },

  // Net Balance Card
  netBalanceCardSkeleton: {
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
  },
  netBalanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  netBalanceTitle: {
    width: 100,
    height: 14,
  },
  netBalanceValue: {
    width: 80,
    height: 20,
  },
  balanceIndicatorContainer: {
    width: "100%",
  },
  balanceIndicatorBar: {
    height: 6,
    borderRadius: 3,
    width: "100%",
    marginBottom: 8,
  },
  balanceIndicatorFill: {
    height: 6,
    borderRadius: 3,
    width: "35%",
  },
  balanceLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  balanceLabel: {
    width: 80,
    height: 11,
  },

  // Quick Actions - matches actual dashboard
  actionButtonsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 5,
  },
  gridActionButtonSkeleton: {
    width: "31%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionIcon: {
    width: 52,
    height: 52,
    marginBottom: 12,
  },
  actionText: {
    width: 40,
    height: 14,
  },

  // Recent Activity
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllButton: {
    width: 60,
    height: 14,
  },
  activityItemSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  activityDescription: {
    width: 120,
    height: 14,
  },
  activityAmount: {
    width: 60,
    height: 14,
  },
  activityDate: {
    width: 40,
    height: 11,
  },
  chevronIcon: {
    width: 16,
    height: 16,
    marginLeft: 8,
  },

  // Base Skeleton Styles
  skeletonText: {
    borderRadius: 4,
    opacity: 0.7,
  },
  skeletonIcon: {
    borderRadius: 4,
    opacity: 0.7,
  },
  skeletonCircle: {
    borderRadius: 50,
    opacity: 0.7,
  },
});

export default FinancialDashboardSkeleton;
