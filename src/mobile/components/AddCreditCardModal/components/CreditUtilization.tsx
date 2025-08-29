import React from "react";
import { View, Text } from "react-native";
import { CreditUtilizationProps } from "../types";

export const CreditUtilization: React.FC<CreditUtilizationProps> = ({
  currentBalance,
  creditLimit,
  colors,
  styles,
}) => {
  const balance = parseFloat(currentBalance) || 0;
  const limit = parseFloat(creditLimit) || 1;
  const utilizationPercentage = Math.min((balance / limit) * 100, 100);

  const getUtilizationColor = (percentage: number) => {
    if (percentage < 30) return colors.success;
    if (percentage < 70) return colors.accent;
    return colors.danger;
  };

  if (!currentBalance || !creditLimit || balance === 0 || limit === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.utilizationContainer,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.utilizationTitle, { color: colors.text }]}>
        Credit Utilization
      </Text>
      <View style={styles.utilizationRow}>
        <Text style={[styles.utilizationPercentage, { color: colors.text }]}>
          {utilizationPercentage.toFixed(1)}%
        </Text>
        <Text
          style={[styles.utilizationAmount, { color: colors.textSecondary }]}
        >
          ₹{balance.toLocaleString("en-IN")} / ₹{limit.toLocaleString("en-IN")}
        </Text>
      </View>
      <View style={[styles.utilizationBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.utilizationFill,
            {
              backgroundColor: getUtilizationColor(utilizationPercentage),
              width: `${Math.min(utilizationPercentage, 100)}%`,
            },
          ]}
        />
      </View>
    </View>
  );
};
