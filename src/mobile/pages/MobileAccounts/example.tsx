import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import AccountTrendChart from "../../components/AccountTrendChart";
import {
  useAccountData,
  ACCOUNT_BALANCE_TREND,
  ACCOUNT_BALANCE_LABELS,
  getLastUpdatedString,
} from "./utils";

/**
 * Example component showing how to use the extracted logic and components
 * This is not meant to be used in production, just as a demonstration
 */
const MobileAccountsExample: React.FC = () => {
  const { isDark } = useTheme();
  const colors = isDark ? darkTheme : lightTheme;

  // Use the extracted hook for account data and state management
  const {
    totalBalanceL,
    monthlyChange,
    setSelectedDataPoint,
    setTooltipPosition,
  } = useAccountData();

  // Handle data point click in the chart
  const handlePointClick = (index: number, x: number, y: number) => {
    setSelectedDataPoint(index);
    setTooltipPosition({ x, y });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {/* Use the reusable AccountTrendChart component */}
          <AccountTrendChart
            data={ACCOUNT_BALANCE_TREND}
            labels={ACCOUNT_BALANCE_LABELS}
            totalBalance={totalBalanceL}
            percentageChange={monthlyChange}
            lastUpdated={getLastUpdatedString()}
            onPointClick={handlePointClick}
            color="#22C55E"
            backgroundColor={colors.card}
            textColor={colors.text}
            secondaryTextColor={colors.textSecondary}
            borderColor={colors.border}
          />
        </View>
      </ScrollView>
    </View>
  );
};

// Theme colors
const darkTheme = {
  background: "#121D2A",
  card: "#1E293B",
  text: "#FFFFFF",
  textSecondary: "#94A3B8",
  border: "#334155",
  primary: "#22C55E",
};

const lightTheme = {
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  primary: "#22C55E",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
});

export default MobileAccountsExample;
