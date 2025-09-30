/**
 * Compact Repayment Method Selector
 * Single-line toggle with dropdowns for installment configuration
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  RepaymentMethod,
  InstallmentFrequency,
  InstallmentSchedule,
} from "../types";

interface CompactRepaymentSelectorProps {
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

export const CompactRepaymentSelector: React.FC<
  CompactRepaymentSelectorProps
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
  const [showInstallmentsModal, setShowInstallmentsModal] = useState(false);
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);

  const styles = createStyles(colors);

  const calculateInstallmentAmount = () => {
    if (!numberOfInstallments || !totalAmount) return "0.00";
    const count = parseInt(numberOfInstallments);
    const amount = totalAmount / count;
    return amount.toFixed(2);
  };

  const getFrequencyLabel = () => {
    const option = FREQUENCY_OPTIONS.find(
      (opt) => opt.value === installmentFrequency
    );
    return option?.label || "Monthly";
  };

  const generateInstallmentSchedule = (): InstallmentSchedule[] => {
    if (!numberOfInstallments || !totalAmount) return [];

    const count = parseInt(numberOfInstallments);
    const amount = totalAmount / count;
    const schedule: InstallmentSchedule[] = [];

    let startDate = firstPaymentDate ? new Date(firstPaymentDate) : new Date();

    for (let i = 0; i < count; i++) {
      const dueDate = new Date(startDate);

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

  return (
    <View
      style={[
        styles.container,
        styles.cardContainer,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <View style={styles.sectionHeader}>
        <View
          style={[
            styles.sectionIconCircle,
            { backgroundColor: colors.primary + "20" },
          ]}
        >
          <Ionicons name="wallet" size={18} color={colors.primary} />
        </View>
        <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>
          Repayment
        </Text>
      </View>

      {/* Single Line Toggle */}
      <View style={styles.toggleRow}>
        {/* Lump Sum */}
        <TouchableOpacity
          style={[
            styles.toggleButton,
            repaymentMethod === "lump_sum" && styles.toggleButtonActive,
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
          <Ionicons
            name="cash"
            size={16}
            color={
              repaymentMethod === "lump_sum"
                ? colors.primary
                : colors.textSecondary
            }
          />
          <Text
            style={[
              styles.toggleButtonText,
              {
                color:
                  repaymentMethod === "lump_sum" ? colors.primary : colors.text,
              },
            ]}
          >
            Lump Sum
          </Text>
          {repaymentMethod === "lump_sum" && (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={colors.primary}
            />
          )}
        </TouchableOpacity>

        {/* Installments */}
        <TouchableOpacity
          style={[
            styles.toggleButton,
            repaymentMethod === "installments" && styles.toggleButtonActive,
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
          <Ionicons
            name="stats-chart"
            size={16}
            color={
              repaymentMethod === "installments"
                ? colors.primary
                : colors.textSecondary
            }
          />
          <Text
            style={[
              styles.toggleButtonText,
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
          {repaymentMethod === "installments" && (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={colors.primary}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Installment Configuration */}
      {repaymentMethod === "installments" && (
        <View style={styles.installmentConfig}>
          {/* Number & Frequency Row */}
          <View style={styles.configRow}>
            {/* Number of Installments Dropdown */}
            <View style={styles.configField}>
              <Text
                style={[styles.configLabel, { color: colors.textSecondary }]}
              >
                Installments
              </Text>
              <TouchableOpacity
                style={[
                  styles.dropdown,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => setShowInstallmentsModal(true)}
              >
                <Text style={[styles.dropdownText, { color: colors.text }]}>
                  {numberOfInstallments || "6"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Frequency Dropdown */}
            <View style={styles.configField}>
              <Text
                style={[styles.configLabel, { color: colors.textSecondary }]}
              >
                Frequency
              </Text>
              <TouchableOpacity
                style={[
                  styles.dropdown,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => setShowFrequencyModal(true)}
              >
                <Text style={[styles.dropdownText, { color: colors.text }]}>
                  {getFrequencyLabel()}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment Amount Display */}
          <View
            style={[
              styles.paymentSummary,
              {
                backgroundColor: colors.primary + "10",
                borderColor: colors.primary + "30",
              },
            ]}
          >
            <View style={styles.summaryRow}>
              <Ionicons name="wallet" size={16} color={colors.primary} />
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Per {installmentFrequency} payment:
              </Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>
                ₹{calculateInstallmentAmount()}
              </Text>
            </View>
          </View>

          {/* Schedule Preview */}
          {numberOfInstallments && totalAmount > 0 && (
            <View style={styles.schedulePreview}>
              <Text
                style={[styles.previewLabel, { color: colors.textSecondary }]}
              >
                Payment schedule (first 3):
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
                          {new Date(item.dueDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                          })}
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
              </View>
              {parseInt(numberOfInstallments) > 3 && (
                <Text
                  style={[styles.moreText, { color: colors.textSecondary }]}
                >
                  +{parseInt(numberOfInstallments) - 3} more payments
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* Number of Installments Modal */}
      <Modal
        visible={showInstallmentsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInstallmentsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowInstallmentsModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View
              style={[styles.modalHeader, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Number of Installments
              </Text>
              <TouchableOpacity
                onPress={() => setShowInstallmentsModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalOptions}>
              {INSTALLMENT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.modalOption,
                    numberOfInstallments === option.toString() &&
                      styles.modalOptionActive,
                    {
                      backgroundColor:
                        numberOfInstallments === option.toString()
                          ? colors.primary + "15"
                          : colors.background,
                      borderColor:
                        numberOfInstallments === option.toString()
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  onPress={() => {
                    onInstallmentsChange(option.toString());
                    setShowInstallmentsModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      {
                        color:
                          numberOfInstallments === option.toString()
                            ? colors.primary
                            : colors.text,
                      },
                    ]}
                  >
                    {option} installments
                  </Text>
                  {numberOfInstallments === option.toString() && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Frequency Modal */}
      <Modal
        visible={showFrequencyModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFrequencyModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFrequencyModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View
              style={[styles.modalHeader, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Payment Frequency
              </Text>
              <TouchableOpacity
                onPress={() => setShowFrequencyModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalOptions}>
              {FREQUENCY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    installmentFrequency === option.value &&
                      styles.modalOptionActive,
                    {
                      backgroundColor:
                        installmentFrequency === option.value
                          ? colors.primary + "15"
                          : colors.background,
                      borderColor:
                        installmentFrequency === option.value
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  onPress={() => {
                    onFrequencyChange(option.value);
                    setShowFrequencyModal(false);
                  }}
                >
                  <View style={styles.modalOptionLeft}>
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={
                        installmentFrequency === option.value
                          ? colors.primary
                          : colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.modalOptionText,
                        {
                          color:
                            installmentFrequency === option.value
                              ? colors.primary
                              : colors.text,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </View>
                  {installmentFrequency === option.value && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      gap: 10,
    },
    sectionIconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    sectionHeaderTitle: {
      fontSize: 15,
      fontWeight: "700",
      letterSpacing: -0.2,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 10,
      letterSpacing: -0.1,
    },
    toggleRow: {
      flexDirection: "row",
      gap: 8,
    },
    toggleButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1.5,
      gap: 6,
    },
    toggleButtonActive: {
      elevation: 2,
      shadowColor: "#10B981",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    toggleButtonText: {
      fontSize: 13,
      fontWeight: "700",
    },
    installmentConfig: {
      marginTop: 12,
      gap: 10,
    },
    configRow: {
      flexDirection: "row",
      gap: 10,
    },
    configField: {
      flex: 1,
    },
    configLabel: {
      fontSize: 11,
      fontWeight: "600",
      marginBottom: 6,
    },
    dropdown: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
    },
    dropdownText: {
      fontSize: 14,
      fontWeight: "600",
    },
    paymentSummary: {
      padding: 10,
      borderRadius: 8,
      borderWidth: 1,
    },
    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    summaryLabel: {
      flex: 1,
      fontSize: 12,
      fontWeight: "500",
    },
    summaryValue: {
      fontSize: 16,
      fontWeight: "700",
    },
    schedulePreview: {
      gap: 8,
    },
    previewLabel: {
      fontSize: 11,
      fontWeight: "600",
    },
    scheduleTable: {
      gap: 6,
    },
    scheduleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 8,
      borderRadius: 6,
      borderWidth: 1,
    },
    scheduleRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    scheduleNumber: {
      fontSize: 12,
      fontWeight: "700",
      minWidth: 24,
    },
    scheduleDate: {
      fontSize: 11,
    },
    scheduleAmount: {
      fontSize: 13,
      fontWeight: "700",
    },
    moreText: {
      fontSize: 11,
      fontStyle: "italic",
      textAlign: "center",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    modalContent: {
      width: "100%",
      maxWidth: 360,
      maxHeight: "70%",
      borderRadius: 16,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: "700",
      flex: 1,
    },
    closeButton: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    modalOptions: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    modalOption: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 14,
      borderRadius: 10,
      borderWidth: 1.5,
      marginBottom: 8,
    },
    modalOptionActive: {
      elevation: 2,
      shadowColor: "#10B981",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    modalOptionLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    modalOptionText: {
      fontSize: 15,
      fontWeight: "600",
    },
  });
