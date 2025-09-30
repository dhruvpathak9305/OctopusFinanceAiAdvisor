/**
 * Repayment Method Selector Component
 * Handles lump sum vs installment selection with configuration
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  RepaymentMethod,
  InstallmentFrequency,
  InstallmentSchedule,
} from "../types";

interface RepaymentMethodSelectorProps {
  repaymentMethod: RepaymentMethod;
  onMethodChange: (method: RepaymentMethod) => void;

  // Installment configuration
  numberOfInstallments: string;
  installmentFrequency: InstallmentFrequency;
  firstPaymentDate: string;
  onInstallmentsChange: (count: string) => void;
  onFrequencyChange: (frequency: InstallmentFrequency) => void;
  onFirstPaymentDateChange: (date: string) => void;

  // For calculations
  totalAmount: number;
  dueDate: string;

  colors: any;
  style?: any;
}

const INSTALLMENT_OPTIONS = [2, 3, 4, 6, 9, 12, 18, 24];

const FREQUENCY_OPTIONS: {
  value: InstallmentFrequency;
  label: string;
  icon: string;
}[] = [
  { value: "weekly", label: "Weekly", icon: "calendar" },
  { value: "biweekly", label: "Bi-weekly", icon: "calendar-outline" },
  { value: "monthly", label: "Monthly", icon: "calendar-sharp" },
  { value: "quarterly", label: "Quarterly", icon: "calendar-number" },
];

export const RepaymentMethodSelector: React.FC<
  RepaymentMethodSelectorProps
> = ({
  repaymentMethod,
  onMethodChange,
  numberOfInstallments,
  installmentFrequency,
  firstPaymentDate,
  onInstallmentsChange,
  onFrequencyChange,
  onFirstPaymentDateChange,
  totalAmount,
  dueDate,
  colors,
  style,
}) => {
  const styles = createStyles(colors);

  const calculateInstallmentAmount = () => {
    const count = parseInt(numberOfInstallments) || 1;
    return (totalAmount / count).toFixed(2);
  };

  const generateInstallmentSchedule = (): InstallmentSchedule[] => {
    const count = parseInt(numberOfInstallments) || 3;
    const amount = totalAmount / count;
    const schedule: InstallmentSchedule[] = [];

    let startDate = firstPaymentDate ? new Date(firstPaymentDate) : new Date();

    for (let i = 0; i < count; i++) {
      const dueDate = new Date(startDate);

      // Calculate next due date based on frequency
      switch (installmentFrequency) {
        case "weekly":
          dueDate.setDate(startDate.getDate() + i * 7);
          break;
        case "biweekly":
          dueDate.setDate(startDate.getDate() + i * 14);
          break;
        case "monthly":
          dueDate.setMonth(startDate.getMonth() + i);
          break;
        case "quarterly":
          dueDate.setMonth(startDate.getMonth() + i * 3);
          break;
      }

      schedule.push({
        installmentNumber: i + 1,
        dueDate: dueDate.toISOString().split("T")[0],
        amount: amount,
        status: "pending",
      });
    }

    return schedule;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Repayment
      </Text>

      {/* Method Selection */}
      <View style={styles.methodButtons}>
        {/* Lump Sum */}
        <TouchableOpacity
          style={[
            styles.methodButton,
            repaymentMethod === "lump_sum" && styles.methodButtonActive,
            {
              backgroundColor:
                repaymentMethod === "lump_sum"
                  ? colors.primary + "20"
                  : colors.card,
              borderColor:
                repaymentMethod === "lump_sum" ? colors.primary : colors.border,
            },
          ]}
          onPress={() => onMethodChange("lump_sum")}
        >
          <View style={styles.methodButtonIcon}>
            <Ionicons
              name="cash"
              size={24}
              color={
                repaymentMethod === "lump_sum"
                  ? colors.primary
                  : colors.textSecondary
              }
            />
          </View>
          <View style={styles.methodButtonContent}>
            <Text
              style={[
                styles.methodButtonTitle,
                {
                  color:
                    repaymentMethod === "lump_sum"
                      ? colors.primary
                      : colors.text,
                },
              ]}
            >
              Lump Sum
            </Text>
            <Text
              style={[styles.methodButtonDesc, { color: colors.textSecondary }]}
            >
              {dueDate
                ? `Full amount due on ${formatDate(dueDate)}`
                : "Single payment on due date"}
            </Text>
          </View>
          {repaymentMethod === "lump_sum" && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={colors.primary}
            />
          )}
        </TouchableOpacity>

        {/* Installments */}
        <TouchableOpacity
          style={[
            styles.methodButton,
            repaymentMethod === "installments" && styles.methodButtonActive,
            {
              backgroundColor:
                repaymentMethod === "installments"
                  ? colors.primary + "20"
                  : colors.card,
              borderColor:
                repaymentMethod === "installments"
                  ? colors.primary
                  : colors.border,
            },
          ]}
          onPress={() => onMethodChange("installments")}
        >
          <View style={styles.methodButtonIcon}>
            <Ionicons
              name="stats-chart"
              size={24}
              color={
                repaymentMethod === "installments"
                  ? colors.primary
                  : colors.textSecondary
              }
            />
          </View>
          <View style={styles.methodButtonContent}>
            <Text
              style={[
                styles.methodButtonTitle,
                {
                  color:
                    repaymentMethod === "installments"
                      ? colors.primary
                      : colors.text,
                },
              ]}
            >
              Installments
            </Text>
            <Text
              style={[styles.methodButtonDesc, { color: colors.textSecondary }]}
            >
              Split into multiple payments
            </Text>
          </View>
          {repaymentMethod === "installments" && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={colors.primary}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Installment Configuration */}
      {repaymentMethod === "installments" && (
        <View style={styles.installmentConfig}>
          {/* Number of Installments */}
          <View style={styles.configSection}>
            <Text style={[styles.configLabel, { color: colors.text }]}>
              Number of Installments
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.installmentOptionsScroll}
            >
              {INSTALLMENT_OPTIONS.map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.installmentOption,
                    numberOfInstallments === count.toString() &&
                      styles.installmentOptionActive,
                    {
                      backgroundColor:
                        numberOfInstallments === count.toString()
                          ? colors.primary
                          : colors.card,
                      borderColor:
                        numberOfInstallments === count.toString()
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  onPress={() => onInstallmentsChange(count.toString())}
                >
                  <Text
                    style={[
                      styles.installmentOptionText,
                      {
                        color:
                          numberOfInstallments === count.toString()
                            ? "#FFFFFF"
                            : colors.text,
                      },
                    ]}
                  >
                    {count}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Frequency */}
          <View style={styles.configSection}>
            <Text style={[styles.configLabel, { color: colors.text }]}>
              Frequency
            </Text>
            <View style={styles.frequencyOptions}>
              {FREQUENCY_OPTIONS.map((freq) => (
                <TouchableOpacity
                  key={freq.value}
                  style={[
                    styles.frequencyOption,
                    installmentFrequency === freq.value &&
                      styles.frequencyOptionActive,
                    {
                      backgroundColor:
                        installmentFrequency === freq.value
                          ? colors.primary + "20"
                          : colors.card,
                      borderColor:
                        installmentFrequency === freq.value
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  onPress={() => onFrequencyChange(freq.value)}
                >
                  <Ionicons
                    name={freq.icon as any}
                    size={16}
                    color={
                      installmentFrequency === freq.value
                        ? colors.primary
                        : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.frequencyOptionText,
                      {
                        color:
                          installmentFrequency === freq.value
                            ? colors.primary
                            : colors.text,
                      },
                    ]}
                  >
                    {freq.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Amount per Installment */}
          {totalAmount > 0 && numberOfInstallments && (
            <View
              style={[
                styles.installmentSummary,
                {
                  backgroundColor: colors.primary + "10",
                  borderColor: colors.primary + "30",
                },
              ]}
            >
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>
                  Per {installmentFrequency} payment:
                </Text>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>
                  ₹{calculateInstallmentAmount()}
                </Text>
              </View>
            </View>
          )}

          {/* Installment Schedule Preview */}
          {totalAmount > 0 && numberOfInstallments && firstPaymentDate && (
            <View style={styles.schedulePreview}>
              <Text style={[styles.configLabel, { color: colors.text }]}>
                Payment Schedule Preview
              </Text>
              <View style={styles.scheduleTable}>
                {generateInstallmentSchedule()
                  .slice(0, 3)
                  .map((item) => (
                    <View
                      key={item.installmentNumber}
                      style={[
                        styles.scheduleRow,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View style={styles.scheduleRowLeft}>
                        <Text
                          style={[
                            styles.scheduleNumber,
                            { color: colors.text },
                          ]}
                        >
                          #{item.installmentNumber}
                        </Text>
                        <Text
                          style={[
                            styles.scheduleDate,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {formatDate(item.dueDate)}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.scheduleAmount,
                          { color: colors.primary },
                        ]}
                      >
                        ₹{item.amount.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                {parseInt(numberOfInstallments) > 3 && (
                  <Text
                    style={[
                      styles.scheduleMore,
                      { color: colors.textSecondary },
                    ]}
                  >
                    +{parseInt(numberOfInstallments) - 3} more payments
                  </Text>
                )}
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
    sectionTitle: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 10,
      letterSpacing: -0.1,
    },
    methodButtons: {
      gap: 10,
    },
    methodButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 10,
      borderWidth: 1.5,
      gap: 10,
    },
    methodButtonActive: {
      elevation: 2,
      shadowColor: "#10B981",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    methodButtonIcon: {
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 24,
      backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
    methodButtonContent: {
      flex: 1,
    },
    methodButtonTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 4,
    },
    methodButtonDesc: {
      fontSize: 13,
      lineHeight: 18,
    },
    installmentConfig: {
      marginTop: 20,
      gap: 20,
    },
    configSection: {
      gap: 12,
    },
    configLabel: {
      fontSize: 14,
      fontWeight: "600",
    },
    installmentOptionsScroll: {
      flexGrow: 0,
    },
    installmentOption: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1.5,
      marginRight: 8,
      minWidth: 60,
      alignItems: "center",
    },
    installmentOptionActive: {
      elevation: 2,
    },
    installmentOptionText: {
      fontSize: 16,
      fontWeight: "700",
    },
    frequencyOptions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    frequencyOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1.5,
      gap: 6,
    },
    frequencyOptionActive: {
      elevation: 1,
    },
    frequencyOptionText: {
      fontSize: 14,
      fontWeight: "600",
    },
    installmentSummary: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    summaryLabel: {
      fontSize: 14,
      fontWeight: "600",
    },
    summaryValue: {
      fontSize: 20,
      fontWeight: "800",
    },
    schedulePreview: {
      gap: 12,
    },
    scheduleTable: {
      gap: 8,
    },
    scheduleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
    },
    scheduleRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    scheduleNumber: {
      fontSize: 14,
      fontWeight: "700",
      width: 32,
    },
    scheduleDate: {
      fontSize: 13,
    },
    scheduleAmount: {
      fontSize: 15,
      fontWeight: "700",
    },
    scheduleMore: {
      fontSize: 12,
      textAlign: "center",
      paddingVertical: 8,
      fontStyle: "italic",
    },
  });
