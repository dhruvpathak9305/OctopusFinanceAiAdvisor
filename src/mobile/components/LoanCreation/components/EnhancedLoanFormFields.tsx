/**
 * Enhanced Loan Form Fields Component
 * Integrates all new components: DatePicker, RepaymentMethod, InterestRate
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  LoanFormData,
  LoanFormErrors,
  QUICK_LOAN_PRESETS,
  LOAN_DESCRIPTION_SUGGESTIONS,
} from "../types";
import { DatePickerModal } from "./DatePickerModal";
import { CompactRepaymentSelector } from "./CompactRepaymentSelector";
import { CompactInterestSection } from "./CompactInterestSection";

interface EnhancedLoanFormFieldsProps {
  formData: LoanFormData;
  errors: LoanFormErrors;
  onFieldChange: (field: keyof LoanFormData, value: any) => void;
  onFieldFocus?: (field: string) => void;
  onFieldBlur?: (field: string) => void;
  focusedField?: string | null;
  colors: any;
  style?: any;
}

export const EnhancedLoanFormFields: React.FC<EnhancedLoanFormFieldsProps> = ({
  formData,
  errors,
  onFieldChange,
  onFieldFocus,
  onFieldBlur,
  focusedField,
  colors,
  style,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFirstPaymentDatePicker, setShowFirstPaymentDatePicker] =
    useState(false);

  const styles = createStyles(colors);

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderInputField = (
    field: keyof LoanFormData,
    label: string,
    placeholder: string,
    options: {
      icon?: string;
      keyboardType?: "default" | "numeric" | "email-address";
      multiline?: boolean;
      numberOfLines?: number;
      maxLength?: number;
      prefix?: string;
      suffix?: string;
      required?: boolean;
    } = {}
  ) => {
    const isFocused = focusedField === field;
    const hasError = !!errors[field];
    const hasValue =
      formData[field] && formData[field].toString().trim() !== "";

    return (
      <View style={styles.fieldContainer}>
        <View style={styles.labelRow}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            {label}
            {options.required && <Text style={styles.required}> *</Text>}
          </Text>
          {field === "description" && formData.description && (
            <Text style={[styles.charCounter, { color: colors.textSecondary }]}>
              {formData.description.length}/500
            </Text>
          )}
        </View>

        <View
          style={[
            styles.inputContainer,
            isFocused && styles.inputContainerFocused,
            hasError && styles.inputContainerError,
            hasValue && styles.inputContainerWithValue,
            {
              backgroundColor: colors.card,
              borderColor: hasError
                ? "#EF4444"
                : isFocused
                ? colors.primary
                : colors.border,
            },
          ]}
        >
          {options.icon && (
            <Ionicons
              name={options.icon as any}
              size={20}
              color={isFocused ? colors.primary : colors.textSecondary}
              style={styles.inputIcon}
            />
          )}

          {options.prefix && (
            <Text style={[styles.inputPrefix, { color: colors.text }]}>
              {options.prefix}
            </Text>
          )}

          <TextInput
            style={[
              styles.textInput,
              { color: colors.text },
              options.multiline && styles.multilineInput,
            ]}
            value={formData[field]?.toString() || ""}
            onChangeText={(value) => onFieldChange(field, value)}
            onFocus={() => onFieldFocus?.(field)}
            onBlur={() => onFieldBlur?.(field)}
            placeholder={isFocused ? "" : placeholder}
            placeholderTextColor={colors.textSecondary + "80"}
            keyboardType={options.keyboardType || "default"}
            multiline={options.multiline}
            numberOfLines={options.numberOfLines}
            maxLength={options.maxLength}
          />

          {options.suffix && (
            <Text style={[styles.inputSuffix, { color: colors.textSecondary }]}>
              {options.suffix}
            </Text>
          )}
        </View>

        {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Amount Section - Enhanced */}
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.sectionHeader}>
          <View
            style={[
              styles.sectionIconCircle,
              { backgroundColor: "#F59E0B" + "20" },
            ]}
          >
            <Ionicons name="cash" size={18} color="#F59E0B" />
          </View>
          <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>
            Loan Amount
          </Text>
        </View>

        {renderInputField("amount", "Amount", "Enter loan amount", {
          icon: "cash",
          keyboardType: "numeric",
          prefix: "₹",
          required: true,
        })}

        {/* Quick Amount Buttons */}
        <View style={styles.quickAmountContainer}>
          <Text
            style={[styles.quickAmountLabel, { color: colors.textSecondary }]}
          >
            Quick:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickAmountScroll}
            contentContainerStyle={styles.quickAmountButtons}
          >
            {QUICK_LOAN_PRESETS.slice(0, 6).map((preset) => (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.quickAmountButton,
                  formData.amount === preset.amount &&
                    styles.selectedQuickAmount,
                  {
                    backgroundColor:
                      formData.amount === preset.amount
                        ? colors.primary + "20"
                        : colors.card,
                    borderColor:
                      formData.amount === preset.amount
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                onPress={() => {
                  onFieldChange("amount", preset.amount);
                }}
              >
                <Text
                  style={[
                    styles.quickAmountText,
                    {
                      color:
                        formData.amount === preset.amount
                          ? colors.primary
                          : colors.text,
                    },
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Payment Dates Section - Enhanced */}
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.sectionHeader}>
          <View
            style={[
              styles.sectionIconCircle,
              { backgroundColor: "#6366F1" + "20" },
            ]}
          >
            <Ionicons name="calendar-sharp" size={18} color="#6366F1" />
          </View>
          <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>
            Payment Dates
          </Text>
        </View>

        <View style={styles.dateRow}>
          {/* Due Date */}
          <View style={styles.dateField}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Due Date <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.datePickerButton,
                {
                  backgroundColor: formData.dueDate
                    ? "#6366F1" + "10"
                    : colors.background,
                  borderColor: formData.dueDate ? "#6366F1" : colors.border,
                },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons
                name="calendar"
                size={18}
                color={formData.dueDate ? "#6366F1" : colors.textSecondary}
              />
              <Text
                style={[
                  styles.datePickerText,
                  {
                    color: formData.dueDate
                      ? colors.text
                      : colors.textSecondary,
                  },
                ]}
              >
                {formData.dueDate
                  ? formatDisplayDate(formData.dueDate)
                  : "Select"}
              </Text>
            </TouchableOpacity>
            {errors.dueDate && (
              <Text style={styles.errorText}>{errors.dueDate}</Text>
            )}
          </View>

          {/* First Payment Date (if installments) */}
          {formData.repaymentMethod === "installments" && (
            <View style={styles.dateField}>
              <Text
                style={[styles.fieldLabel, { color: colors.textSecondary }]}
              >
                First Payment <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.datePickerButton,
                  {
                    backgroundColor: formData.firstPaymentDate
                      ? "#6366F1" + "10"
                      : colors.background,
                    borderColor: formData.firstPaymentDate
                      ? "#6366F1"
                      : colors.border,
                  },
                ]}
                onPress={() => setShowFirstPaymentDatePicker(true)}
              >
                <Ionicons
                  name="calendar"
                  size={18}
                  color={
                    formData.firstPaymentDate ? "#6366F1" : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.datePickerText,
                    {
                      color: formData.firstPaymentDate
                        ? colors.text
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {formData.firstPaymentDate
                    ? formatDisplayDate(formData.firstPaymentDate)
                    : "Select"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Compact Repayment Method Section */}
      <CompactRepaymentSelector
        repaymentMethod={formData.repaymentMethod}
        onMethodChange={(method) => onFieldChange("repaymentMethod", method)}
        numberOfInstallments={formData.numberOfInstallments}
        installmentFrequency={formData.installmentFrequency}
        firstPaymentDate={formData.firstPaymentDate}
        onInstallmentsChange={(count) =>
          onFieldChange("numberOfInstallments", count)
        }
        onFrequencyChange={(freq) =>
          onFieldChange("installmentFrequency", freq)
        }
        onFirstPaymentDateChange={(date) =>
          onFieldChange("firstPaymentDate", date)
        }
        totalAmount={parseFloat(formData.amount) || 0}
        dueDate={formData.dueDate}
        colors={colors}
      />

      {/* Compact Interest Rate Section */}
      <CompactInterestSection
        interestEnabled={formData.interestEnabled}
        interestRate={formData.interestRate}
        interestType={formData.interestType}
        onEnableChange={(enabled) => onFieldChange("interestEnabled", enabled)}
        onRateChange={(rate) => onFieldChange("interestRate", rate)}
        onTypeChange={(type) => onFieldChange("interestType", type)}
        totalAmount={parseFloat(formData.amount) || 0}
        dueDate={formData.dueDate}
        startDate={formData.startDate}
        colors={colors}
      />

      {/* Description Section - Enhanced */}
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.sectionHeader}>
          <View
            style={[
              styles.sectionIconCircle,
              { backgroundColor: "#8B5CF6" + "20" },
            ]}
          >
            <Ionicons name="document-text" size={18} color="#8B5CF6" />
          </View>
          <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>
            Loan Details
          </Text>
        </View>

        {renderInputField(
          "description",
          "Description",
          "Purpose of the loan (e.g., Home renovation, Education, etc.)",
          {
            icon: "document-text",
            multiline: true,
            numberOfLines: 3,
            maxLength: 500,
            required: true,
          }
        )}

        {/* Description Suggestions */}
        <View style={styles.suggestionsContainer}>
          <Text
            style={[styles.suggestionsLabel, { color: colors.textSecondary }]}
          >
            Suggestions:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionChips}
          >
            {LOAN_DESCRIPTION_SUGGESTIONS.slice(0, 6).map((suggestion) => (
              <TouchableOpacity
                key={suggestion}
                style={[
                  styles.suggestionChip,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => onFieldChange("description", suggestion)}
              >
                <Text style={[styles.suggestionText, { color: colors.text }]}>
                  {suggestion}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Date Picker Modals */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={(date) => onFieldChange("dueDate", date)}
        selectedDate={formData.dueDate}
        minDate={new Date()}
        colors={colors}
        title="Select Due Date"
      />

      <DatePickerModal
        visible={showFirstPaymentDatePicker}
        onClose={() => setShowFirstPaymentDatePicker(false)}
        onSelectDate={(date) => onFieldChange("firstPaymentDate", date)}
        selectedDate={formData.firstPaymentDate}
        minDate={new Date()}
        colors={colors}
        title="Select First Payment Date"
      />
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    section: {
      marginBottom: 16,
    },
    sectionCard: {
      marginBottom: 16,
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
      marginBottom: 14,
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
    fieldContainer: {
      marginBottom: 12,
    },
    dateRow: {
      flexDirection: "row",
      gap: 10,
    },
    dateField: {
      flex: 1,
    },
    labelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    fieldLabel: {
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: -0.1,
      marginBottom: 6,
    },
    charCounter: {
      fontSize: 12,
      fontWeight: "500",
    },
    required: {
      color: "#EF4444",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 8,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 12,
      minHeight: 48,
    },
    inputContainerFocused: {
      borderWidth: 2,
      elevation: 2,
      shadowColor: "#10B981",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    inputContainerError: {
      borderColor: "#EF4444",
      backgroundColor: "rgba(239, 68, 68, 0.05)",
    },
    inputContainerWithValue: {
      borderColor: "rgba(16,185,129,0.3)",
    },
    inputIcon: {
      marginRight: 8,
    },
    inputPrefix: {
      fontSize: 16,
      fontWeight: "600",
      marginRight: 8,
    },
    inputSuffix: {
      fontSize: 14,
      fontWeight: "500",
      marginLeft: 8,
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      fontWeight: "500",
      textAlignVertical: "top",
    },
    multilineInput: {
      minHeight: 80,
      paddingTop: 8,
    },
    errorText: {
      fontSize: 12,
      color: "#EF4444",
      marginTop: 4,
      fontWeight: "500",
    },
    quickAmountContainer: {
      marginTop: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    quickAmountLabel: {
      fontSize: 11,
      fontWeight: "600",
      minWidth: 40,
    },
    quickAmountScroll: {
      flex: 1,
    },
    quickAmountButtons: {
      flexDirection: "row",
      gap: 6,
      paddingRight: 8,
    },
    quickAmountButton: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 6,
      borderWidth: 1,
      minWidth: 52,
      alignItems: "center",
    },
    selectedQuickAmount: {
      transform: [{ scale: 1.05 }],
      elevation: 2,
      shadowColor: "#10B981",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    quickAmountText: {
      fontSize: 12,
      fontWeight: "700",
    },
    datePickerButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      gap: 6,
    },
    datePickerText: {
      flex: 1,
      fontSize: 13,
      fontWeight: "600",
    },
    suggestionsContainer: {
      marginTop: 8,
    },
    suggestionsLabel: {
      fontSize: 11,
      fontWeight: "600",
      marginBottom: 6,
    },
    suggestionChips: {
      flexDirection: "row",
      gap: 6,
      paddingRight: 8,
    },
    suggestionChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      borderWidth: 1,
    },
    suggestionText: {
      fontSize: 11,
      fontWeight: "600",
    },
  });
