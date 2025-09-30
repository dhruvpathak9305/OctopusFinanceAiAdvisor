/**
 * Interest Rate Configuration Section
 * Toggle to enable/disable interest with type selection and calculations
 */

import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { InterestType } from "../types";

interface InterestRateSectionProps {
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

export const InterestRateSection: React.FC<InterestRateSectionProps> = ({
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

  const calculateInterest = () => {
    if (!totalAmount || !dueDate || !startDate || !interestRate) {
      return { totalInterest: 0, totalRepayment: 0 };
    }

    const principal = totalAmount;
    const rate = parseFloat(interestRate) / 100;
    const start = new Date(startDate);
    const due = new Date(dueDate);
    const daysDiff = Math.max(
      0,
      (due.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const years = daysDiff / 365;

    let totalInterest = 0;

    if (interestType === "simple") {
      // Simple Interest: I = P * R * T
      totalInterest = principal * rate * years;
    } else {
      // Compound Interest: A = P(1 + r)^t - P
      const compounded = principal * Math.pow(1 + rate, years);
      totalInterest = compounded - principal;
    }

    const totalRepayment = principal + totalInterest;

    return {
      totalInterest: Math.max(0, totalInterest),
      totalRepayment: Math.max(principal, totalRepayment),
    };
  };

  const { totalInterest, totalRepayment } = calculateInterest();

  return (
    <View style={[styles.container, style]}>
      {/* Toggle Section */}
      <View style={styles.toggleContainer}>
        <View style={styles.toggleLeft}>
          <Ionicons name="trending-up" size={24} color={colors.primary} />
          <View style={styles.toggleLabels}>
            <Text style={[styles.toggleTitle, { color: colors.text }]}>
              Add Interest Rate
            </Text>
            <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
              Calculate interest on loan amount
            </Text>
          </View>
        </View>
        <Switch
          value={interestEnabled}
          onValueChange={onEnableChange}
          trackColor={{ false: colors.border, true: colors.primary + "80" }}
          thumbColor={interestEnabled ? colors.primary : colors.textSecondary}
        />
      </View>

      {/* Interest Configuration */}
      {interestEnabled && (
        <View style={styles.interestConfig}>
          {/* Interest Rate Input */}
          <View style={styles.rateInputContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Interest Rate <Text style={styles.required}>*</Text>
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="percent"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={interestRate}
                onChangeText={onRateChange}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary + "80"}
                maxLength={5}
              />
              <Text
                style={[styles.inputSuffix, { color: colors.textSecondary }]}
              >
                % per annum
              </Text>
            </View>
          </View>

          {/* Interest Type Selection */}
          <View style={styles.typeContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Interest Type
            </Text>
            <View style={styles.typeButtons}>
              {/* Simple Interest */}
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  interestType === "simple" && styles.typeButtonActive,
                  {
                    backgroundColor:
                      interestType === "simple"
                        ? colors.primary + "20"
                        : colors.card,
                    borderColor:
                      interestType === "simple"
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                onPress={() => onTypeChange("simple")}
              >
                <View style={styles.typeButtonContent}>
                  <Text
                    style={[
                      styles.typeButtonTitle,
                      {
                        color:
                          interestType === "simple"
                            ? colors.primary
                            : colors.text,
                      },
                    ]}
                  >
                    Simple Interest
                  </Text>
                  <Text
                    style={[
                      styles.typeButtonDesc,
                      { color: colors.textSecondary },
                    ]}
                  >
                    I = P × R × T
                  </Text>
                </View>
                {interestType === "simple" && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>

              {/* Compound Interest */}
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  interestType === "compound" && styles.typeButtonActive,
                  {
                    backgroundColor:
                      interestType === "compound"
                        ? colors.primary + "20"
                        : colors.card,
                    borderColor:
                      interestType === "compound"
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                onPress={() => onTypeChange("compound")}
              >
                <View style={styles.typeButtonContent}>
                  <Text
                    style={[
                      styles.typeButtonTitle,
                      {
                        color:
                          interestType === "compound"
                            ? colors.primary
                            : colors.text,
                      },
                    ]}
                  >
                    Compound Interest
                  </Text>
                  <Text
                    style={[
                      styles.typeButtonDesc,
                      { color: colors.textSecondary },
                    ]}
                  >
                    A = P(1 + r)^t
                  </Text>
                </View>
                {interestType === "compound" && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Calculation Display */}
          {totalAmount > 0 && parseFloat(interestRate) > 0 && dueDate && (
            <View
              style={[
                styles.calculationDisplay,
                {
                  backgroundColor: colors.primary + "10",
                  borderColor: colors.primary + "30",
                },
              ]}
            >
              <View style={styles.calculationHeader}>
                <Ionicons name="calculator" size={20} color={colors.primary} />
                <Text
                  style={[styles.calculationHeaderText, { color: colors.text }]}
                >
                  Interest Calculation
                </Text>
              </View>

              <View style={styles.calculationRows}>
                <View style={styles.calculationRow}>
                  <Text
                    style={[
                      styles.calculationLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Principal Amount:
                  </Text>
                  <Text
                    style={[styles.calculationValue, { color: colors.text }]}
                  >
                    ₹{totalAmount.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.calculationRow}>
                  <Text
                    style={[
                      styles.calculationLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Total Interest:
                  </Text>
                  <Text style={[styles.calculationValue, { color: "#F59E0B" }]}>
                    ₹{totalInterest.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.calculationDivider} />

                <View style={styles.calculationRow}>
                  <Text
                    style={[
                      styles.calculationLabel,
                      styles.calculationLabelBold,
                      { color: colors.text },
                    ]}
                  >
                    Total Repayment:
                  </Text>
                  <Text
                    style={[
                      styles.calculationValue,
                      styles.calculationValueBold,
                      { color: colors.primary },
                    ]}
                  >
                    ₹{totalRepayment.toFixed(2)}
                  </Text>
                </View>
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
    toggleContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 2,
    },
    toggleLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: 12,
    },
    toggleLabels: {
      flex: 1,
    },
    toggleTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 2,
    },
    toggleDesc: {
      fontSize: 13,
      lineHeight: 16,
    },
    interestConfig: {
      marginTop: 16,
      gap: 16,
    },
    rateInputContainer: {
      gap: 8,
    },
    fieldLabel: {
      fontSize: 14,
      fontWeight: "600",
    },
    required: {
      color: "#EF4444",
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 8,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 12,
      gap: 8,
    },
    inputIcon: {
      marginRight: 4,
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600",
    },
    inputSuffix: {
      fontSize: 13,
      fontWeight: "500",
    },
    typeContainer: {
      gap: 12,
    },
    typeButtons: {
      gap: 10,
    },
    typeButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 14,
      borderRadius: 10,
      borderWidth: 1.5,
    },
    typeButtonActive: {
      elevation: 2,
      shadowColor: "#10B981",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    typeButtonContent: {
      flex: 1,
    },
    typeButtonTitle: {
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 3,
    },
    typeButtonDesc: {
      fontSize: 12,
      fontFamily: "monospace",
    },
    calculationDisplay: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      gap: 12,
    },
    calculationHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    calculationHeaderText: {
      fontSize: 14,
      fontWeight: "700",
    },
    calculationRows: {
      gap: 10,
    },
    calculationRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    calculationLabel: {
      fontSize: 14,
      fontWeight: "500",
    },
    calculationLabelBold: {
      fontWeight: "700",
      fontSize: 15,
    },
    calculationValue: {
      fontSize: 15,
      fontWeight: "600",
      fontFamily: "monospace",
    },
    calculationValueBold: {
      fontWeight: "800",
      fontSize: 18,
    },
    calculationDivider: {
      height: 1,
      backgroundColor: colors.border + "50",
      marginVertical: 4,
    },
  });
