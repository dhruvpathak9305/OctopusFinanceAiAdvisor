import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import {
  MonthlyChart,
  LineChart,
  ChartSummary,
  ChartTooltip,
  MonthHeader,
  ChartTypeSelector,
  PeriodToggle,
} from "../../components/charts";
import AccountTrendChart from "../../components/AccountTrendChart";
import {
  DAILY_CHART_DATA,
  MONTHLY_CHART_DATA,
  ACCOUNT_BALANCE_TREND,
  ACCOUNT_BALANCE_LABELS,
  getLastUpdatedString,
} from "./utils";

/**
 * Example component showing how to use the extracted chart components
 */
const MobileAccountsChartExample: React.FC = () => {
  const { isDark } = useTheme();
  const colors = isDark ? darkTheme : lightTheme;

  // State for the interactive charts
  const [activeChart, setActiveChart] = useState<
    "spend" | "invested" | "income"
  >("spend");
  const [chartPeriod, setChartPeriod] = useState<"daily" | "monthly">("daily");
  const [selectedDataPoint, setSelectedDataPoint] = useState<number | null>(
    null
  );
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Prepare data for the MonthlyChart component
  const chartData = {
    spend:
      chartPeriod === "daily"
        ? DAILY_CHART_DATA.map((d) => d.spend / 1000)
        : MONTHLY_CHART_DATA.map((d) => d.spend / 1000),
    invested:
      chartPeriod === "daily"
        ? DAILY_CHART_DATA.map((d) => d.invested / 1000)
        : MONTHLY_CHART_DATA.map((d) => d.invested / 1000),
    income:
      chartPeriod === "daily"
        ? DAILY_CHART_DATA.map((d) => d.income / 1000)
        : MONTHLY_CHART_DATA.map((d) => d.income / 1000),
  };

  // Labels for the chart
  const chartLabels =
    chartPeriod === "daily"
      ? DAILY_CHART_DATA.map((d) => d.date)
      : MONTHLY_CHART_DATA.map((d) => d.date);

  // Handle data point click in the chart
  const handlePointClick = (index: number, x: number, y: number) => {
    setSelectedDataPoint(index);
    setTooltipPosition({ x, y });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Original AccountTrendChart
        </Text>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <AccountTrendChart
            data={ACCOUNT_BALANCE_TREND}
            labels={ACCOUNT_BALANCE_LABELS}
            totalBalance="5.0"
            percentageChange={2.8}
            lastUpdated={getLastUpdatedString()}
            onPointClick={handlePointClick}
            color="#22C55E"
            backgroundColor={colors.card}
            textColor={colors.text}
            secondaryTextColor={colors.textSecondary}
            borderColor={colors.border}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          New MonthlyChart Component
        </Text>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <MonthlyChart
            data={chartData}
            labels={chartLabels}
            activeChart={activeChart}
            chartPeriod={chartPeriod}
            title="August 2025"
            backgroundColor={colors.card}
            textColor={colors.text}
            secondaryTextColor={colors.textSecondary}
            borderColor={colors.border}
            onDataPointClick={handlePointClick}
            onChartTypeChange={setActiveChart}
            onPeriodChange={setChartPeriod}
            onMonthChange={(direction) => {
              console.log(`Month changed: ${direction}`);
              // In a real app, this would update the current month
            }}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Individual Components Demo
        </Text>

        <View
          style={[styles.card, { backgroundColor: colors.card, padding: 16 }]}
        >
          <Text style={[styles.componentTitle, { color: colors.text }]}>
            MonthHeader
          </Text>
          <MonthHeader
            title="August 2025"
            onPrevMonth={() => console.log("Previous month")}
            onNextMonth={() => console.log("Next month")}
            textColor={colors.text}
          />

          <Text
            style={[
              styles.componentTitle,
              { color: colors.text, marginTop: 20 },
            ]}
          >
            ChartTypeSelector
          </Text>
          <ChartTypeSelector
            activeChart={activeChart}
            onChange={setActiveChart}
            colors={{
              spend: "#EF4444",
              invested: "#3B82F6",
              income: "#22C55E",
              text: colors.text,
              background: colors.card,
            }}
          />

          <Text
            style={[
              styles.componentTitle,
              { color: colors.text, marginTop: 20 },
            ]}
          >
            ChartSummary
          </Text>
          <ChartSummary
            activeChart={activeChart}
            currentValue={
              activeChart === "spend"
                ? "₹1.2L"
                : activeChart === "invested"
                ? "₹64.5K"
                : "₹68.1K"
            }
            previousValue={
              activeChart === "spend"
                ? "₹1.1L"
                : activeChart === "invested"
                ? "₹68.6K"
                : "₹63.6K"
            }
            percentageChange={activeChart === "income" ? 7.0 : -7.7}
            budgetValue={activeChart === "spend" ? "₹91.0K" : undefined}
            textColor={colors.text}
            secondaryTextColor={colors.textSecondary}
            chartColors={{
              spend: "#EF4444",
              invested: "#3B82F6",
              income: "#22C55E",
            }}
          />

          <Text
            style={[
              styles.componentTitle,
              { color: colors.text, marginTop: 20 },
            ]}
          >
            LineChart
          </Text>
          <View style={{ position: "relative" }}>
            <LineChart
              data={chartData[activeChart]}
              labels={chartLabels}
              color={
                activeChart === "spend"
                  ? "#EF4444"
                  : activeChart === "invested"
                  ? "#3B82F6"
                  : "#22C55E"
              }
              backgroundColor={colors.card}
              textColor={colors.text}
              secondaryTextColor={colors.textSecondary}
              borderColor={colors.border}
              onPointClick={handlePointClick}
              formatYLabel={(v) => `₹${v}K`}
            />

            {selectedDataPoint !== null && (
              <ChartTooltip
                x={tooltipPosition.x}
                y={tooltipPosition.y}
                value={chartData[activeChart][selectedDataPoint]}
                label={chartLabels[selectedDataPoint]}
                color={
                  activeChart === "spend"
                    ? "#EF4444"
                    : activeChart === "invested"
                    ? "#3B82F6"
                    : "#22C55E"
                }
                backgroundColor={colors.card}
                textColor={colors.text}
                borderColor={colors.border}
                prefix="₹"
                suffix="K"
              />
            )}
          </View>

          <Text
            style={[
              styles.componentTitle,
              { color: colors.text, marginTop: 20 },
            ]}
          >
            PeriodToggle
          </Text>
          <PeriodToggle
            activePeriod={chartPeriod}
            onChange={setChartPeriod}
            textColor={colors.text}
            backgroundColor={colors.card}
            secondaryTextColor={colors.textSecondary}
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
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  componentTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
});

export default MobileAccountsChartExample;
