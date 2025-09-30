/**
 * Compact Interest Rate Section
 * More visual and interesting design with all options
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { InterestType } from "../types";

interface CompactInterestSectionProps {
  interestEnabled: boolean;
  interestRate: string;
  interestType: InterestType;
  onEnableChange: (enabled: boolean) => void;
  onRateChange: (rate: string) => void;
  onTypeChange: (type: InterestType) => void;

  // For calculations
  totalAmount: number;
  dueDate: string;
  startDate: string;

  colors: any;
  style?: any;
}

export const CompactInterestSection: React.FC<CompactInterestSectionProps> = ({
  interestEnabled,
  interestRate,
  interestType,
  onEnableChange,
  onRateChange,
  onTypeChange,
  totalAmount,
  dueDate,
  startDate,
  colors,
  style,
}) => {
  const styles = createStyles(colors);

  // Calculate interest
  const calculateInterest = () => {
    // Return zero values if essential data is missing
    if (!interestRate || !totalAmount || totalAmount <= 0 || !dueDate) {
      return {
        totalInterest: 0,
        totalRepayment: totalAmount || 0,
        duration: 0,
      };
    }

    const rate = parseFloat(interestRate) / 100;

    // Validate rate
    if (isNaN(rate) || rate <= 0) {
      return {
        totalInterest: 0,
        totalRepayment: totalAmount,
        duration: 0,
      };
    }

    // Use startDate if provided, otherwise use current date
    const start = startDate ? new Date(startDate) : new Date();
    const due = new Date(dueDate);

    // Calculate days difference
    const daysDiff = Math.max(
      0,
      (due.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    // If no days difference (same day or past date), return zero interest
    if (daysDiff <= 0) {
      return {
        totalInterest: 0,
        totalRepayment: totalAmount,
        duration: 0,
      };
    }

    const years = daysDiff / 365;

    let totalInterest = 0;

    if (interestType === "simple") {
      // Simple Interest: I = P × R × T
      totalInterest = totalAmount * rate * years;
    } else {
      // Compound Interest: A = P(1 + R)^T, Interest = A - P
      totalInterest = totalAmount * Math.pow(1 + rate, years) - totalAmount;
    }

    return {
      totalInterest: Math.max(0, totalInterest),
      totalRepayment: totalAmount + Math.max(0, totalInterest),
      duration: Math.round(daysDiff),
    };
  };

  const { totalInterest, totalRepayment, duration } = calculateInterest();

  return (
    <View
      style={[
        styles.container,
        styles.cardContainer,
        {
          backgroundColor: colors.card,
          borderColor: interestEnabled ? colors.primary + "30" : colors.border,
        },
        style,
      ]}
    >
      {/* Header with Toggle */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Ionicons name="trending-up" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Interest</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {interestEnabled ? "Enabled" : "Optional"}
            </Text>
          </View>
        </View>
        <Switch
          value={interestEnabled}
          onValueChange={onEnableChange}
          trackColor={{ false: colors.border, true: colors.primary + "50" }}
          thumbColor={interestEnabled ? colors.primary : colors.textSecondary}
        />
      </View>

      {/* Expanded Configuration */}
      {interestEnabled && (
        <View style={styles.content}>
          {/* Rate Input & Type Toggle */}
          <View style={styles.configRow}>
            {/* Rate Input */}
            <View style={styles.rateField}>
              <Text
                style={[styles.fieldLabel, { color: colors.textSecondary }]}
              >
                Rate (%)
              </Text>
              <View
                style={[
                  styles.rateInput,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Ionicons
                  name="percent"
                  size={16}
                  color={colors.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  value={interestRate}
                  onChangeText={onRateChange}
                  placeholder="12.5"
                  placeholderTextColor={colors.textSecondary + "80"}
                  keyboardType="decimal-pad"
                  maxLength={5}
                />
              </View>
            </View>

            {/* Type Toggle */}
            <View style={styles.typeField}>
              <Text
                style={[styles.fieldLabel, { color: colors.textSecondary }]}
              >
                Type
              </Text>
              <View style={styles.typeToggle}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    interestType === "simple" && styles.typeButtonActive,
                    {
                      backgroundColor:
                        interestType === "simple"
                          ? colors.primary
                          : colors.card,
                      borderColor:
                        interestType === "simple"
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  onPress={() => onTypeChange("simple")}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      {
                        color:
                          interestType === "simple" ? "#FFFFFF" : colors.text,
                      },
                    ]}
                  >
                    Simple
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    interestType === "compound" && styles.typeButtonActive,
                    {
                      backgroundColor:
                        interestType === "compound"
                          ? colors.primary
                          : colors.card,
                      borderColor:
                        interestType === "compound"
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  onPress={() => onTypeChange("compound")}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      {
                        color:
                          interestType === "compound" ? "#FFFFFF" : colors.text,
                      },
                    ]}
                  >
                    Compound
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Calculations Display */}
          {interestRate && totalAmount > 0 && (
            <View
              style={[
                styles.calculationCard,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Duration */}
              {duration > 0 && (
                <View style={styles.durationBadge}>
                  <Ionicons
                    name="time"
                    size={12}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.durationText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {duration} days
                  </Text>
                </View>
              )}

              <View style={styles.calcGrid}>
                {/* Principal */}
                <View style={styles.calcItem}>
                  <View style={styles.calcIconWrapper}>
                    <Ionicons name="cash" size={14} color="#6366F1" />
                  </View>
                  <Text
                    style={[styles.calcLabel, { color: colors.textSecondary }]}
                  >
                    Principal
                  </Text>
                  <Text style={[styles.calcValue, { color: colors.text }]}>
                    ₹
                    {totalAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </View>

                {/* Interest */}
                <View style={styles.calcItem}>
                  <View style={styles.calcIconWrapper}>
                    <Ionicons name="trending-up" size={14} color="#F59E0B" />
                  </View>
                  <Text
                    style={[styles.calcLabel, { color: colors.textSecondary }]}
                  >
                    Interest
                  </Text>
                  <Text style={[styles.calcValue, { color: "#F59E0B" }]}>
                    +₹
                    {totalInterest.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </View>

                {/* Total */}
                <View style={[styles.calcItem, styles.calcItemHighlight]}>
                  <View
                    style={[
                      styles.calcIconWrapper,
                      { backgroundColor: colors.primary + "20" },
                    ]}
                  >
                    <Ionicons name="wallet" size={14} color={colors.primary} />
                  </View>
                  <Text
                    style={[styles.calcLabel, { color: colors.textSecondary }]}
                  >
                    Total
                  </Text>
                  <Text
                    style={[styles.calcValueLarge, { color: colors.primary }]}
                  >
                    ₹
                    {totalRepayment.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </View>
              </View>

              {/* Formula Info */}
              <View
                style={[styles.formulaInfo, { backgroundColor: colors.card }]}
              >
                <Ionicons
                  name="information-circle"
                  size={14}
                  color={colors.primary}
                />
                <Text
                  style={[styles.formulaText, { color: colors.textSecondary }]}
                >
                  {interestType === "simple"
                    ? "Simple: I = P × R × T"
                    : "Compound: A = P(1 + r)^t"}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    cardContainer: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      elevation: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 2,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 11,
      fontWeight: "500",
    },
    content: {
      marginTop: 12,
      gap: 12,
    },
    configRow: {
      flexDirection: "row",
      gap: 10,
    },
    rateField: {
      flex: 1,
    },
    typeField: {
      flex: 1,
    },
    fieldLabel: {
      fontSize: 11,
      fontWeight: "600",
      marginBottom: 6,
    },
    rateInput: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      gap: 8,
    },
    inputIcon: {
      marginRight: 2,
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600",
    },
    typeToggle: {
      flexDirection: "row",
      gap: 4,
    },
    typeButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 4,
      borderRadius: 8,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 70,
      maxWidth: 80,
    },
    typeButtonActive: {
      elevation: 3,
      shadowColor: "#10B981",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    typeButtonText: {
      fontSize: 11,
      fontWeight: "700",
      textAlign: "center",
      numberOfLines: 1,
      flexShrink: 0,
    },
    calculationCard: {
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      gap: 10,
    },
    durationBadge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: "rgba(255,255,255,0.05)",
    },
    durationText: {
      fontSize: 10,
      fontWeight: "600",
    },
    calcGrid: {
      flexDirection: "row",
      gap: 8,
    },
    calcItem: {
      flex: 1,
      alignItems: "center",
      gap: 6,
    },
    calcItemHighlight: {
      backgroundColor: "rgba(16,185,129,0.05)",
      paddingVertical: 8,
      borderRadius: 10,
    },
    calcIconWrapper: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: "rgba(255,255,255,0.05)",
      alignItems: "center",
      justifyContent: "center",
    },
    calcLabel: {
      fontSize: 10,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    calcValue: {
      fontSize: 13,
      fontWeight: "700",
    },
    calcValueLarge: {
      fontSize: 15,
      fontWeight: "800",
    },
    formulaInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      padding: 8,
      borderRadius: 8,
    },
    formulaText: {
      fontSize: 11,
      fontFamily: "monospace",
      fontWeight: "500",
    },
  });
