/**
 * Reusable Loan Form Fields Component
 * Handles amount, description, dates, and other loan details
 */

import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LoanFormData, LoanFormErrors, QUICK_LOAN_PRESETS } from "../types";

interface LoanFormFieldsProps {
  formData: LoanFormData;
  errors: LoanFormErrors;
  onFieldChange: (field: keyof LoanFormData, value: any) => void;
  onFieldFocus?: (field: string) => void;
  onFieldBlur?: (field: string) => void;
  focusedField?: string | null;
  enableAdvancedOptions?: boolean;
  colors: any;
  style?: any;
}

export const LoanFormFields: React.FC<LoanFormFieldsProps> = ({
  formData,
  errors,
  onFieldChange,
  onFieldFocus,
  onFieldBlur,
  focusedField,
  enableAdvancedOptions = false,
  colors,
  style,
}) => {
  const styles = createStyles(colors);

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
    } = {}
  ) => {
    const isFocused = focusedField === field;
    const hasError = !!errors[field];
    const hasValue =
      formData[field] && formData[field].toString().trim() !== "";

    return (
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: colors.text }]}>
          {label}
          {["amount", "selectedRecipient", "description", "dueDate"].includes(
            field
          ) && <Text style={styles.required}> *</Text>}
        </Text>

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

          {field === "dueDate" ? (
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => {
                // Open date picker
                // Here you would open a date picker modal
              }}
            >
              <Text
                style={[
                  styles.datePickerText,
                  {
                    color: formData[field]
                      ? colors.text
                      : colors.textSecondary + "80",
                  },
                ]}
              >
                {formData[field] || placeholder}
              </Text>
              <Ionicons
                name="calendar"
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ) : field === "repaymentFrequency" ? (
            <TouchableOpacity
              style={styles.dropdownPickerButton}
              onPress={() => {
                // Open repayment frequency picker
                // Here you would open a dropdown with options: Monthly, Quarterly, Yearly
              }}
            >
              <Text
                style={[
                  styles.dropdownPickerText,
                  {
                    color: formData[field]
                      ? colors.text
                      : colors.textSecondary + "80",
                  },
                ]}
              >
                {formData[field] || placeholder}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ) : field === "numberOfInstallments" ? (
            <TouchableOpacity
              style={styles.dropdownPickerButton}
              onPress={() => {
                // Open installments picker
                // Here you would open a dropdown with options: 1, 3, 6, 12, 24, 36, etc.
              }}
            >
              <Text
                style={[
                  styles.dropdownPickerText,
                  {
                    color: formData[field]
                      ? colors.text
                      : colors.textSecondary + "80",
                  },
                ]}
              >
                {formData[field]
                  ? `${formData[field]} installments`
                  : placeholder}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ) : (
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
          )}

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
      {/* Amount Section */}
      <View style={styles.section}>
        {renderInputField("amount", "Amount", "Enter loan amount", {
          icon: "cash",
          keyboardType: "numeric",
          prefix: "₹",
        })}

        {/* Quick Amount Buttons */}
        <View style={styles.quickAmountContainer}>
          <Text
            style={[styles.quickAmountLabel, { color: colors.textSecondary }]}
          >
            Quick amounts:
          </Text>
          <View style={styles.quickAmountButtons}>
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
                  if (!formData.description) {
                    onFieldChange("description", preset.description);
                  }
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
          </View>
        </View>
      </View>

      {/* Description Section */}
      <View style={styles.section}>
        {renderInputField(
          "description",
          "Description",
          "Purpose of the loan (e.g., Home renovation, Education, etc.)",
          {
            icon: "document-text",
            multiline: true,
            numberOfLines: 3,
            maxLength: 200,
          }
        )}
      </View>

      {/* Date Fields */}
      <View style={styles.section}>
        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            {renderInputField("dueDate", "Due Date", "DD/MM/YYYY", {
              icon: "calendar",
              keyboardType: "numeric",
            })}
          </View>

          <View style={styles.dateField}>
            {renderInputField("interestRate", "Interest Rate", "0", {
              icon: "trending-up",
              keyboardType: "numeric",
              suffix: "%",
            })}
          </View>
        </View>
      </View>

      {/* Advanced Options */}
      {enableAdvancedOptions && (
        <>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Advanced Options
            </Text>

            <View style={styles.advancedRow}>
              <View style={styles.advancedField}>
                {renderInputField(
                  "repaymentFrequency",
                  "Repayment",
                  "Monthly",
                  {
                    icon: "repeat",
                  }
                )}
              </View>

              <View style={styles.advancedField}>
                {renderInputField(
                  "numberOfInstallments",
                  "Installments",
                  "12",
                  {
                    icon: "list",
                    keyboardType: "numeric",
                  }
                )}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            {renderInputField(
              "notes",
              "Additional Notes",
              "Any additional terms or conditions",
              {
                icon: "chatbubble-ellipses",
                multiline: true,
                numberOfLines: 2,
                maxLength: 500,
              }
            )}
          </View>
        </>
      )}
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 12,
      letterSpacing: -0.1,
    },
    fieldContainer: {
      marginBottom: 16,
    },
    fieldLabel: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
      letterSpacing: -0.1,
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
      transition: "all 0.2s ease",
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
      marginTop: 12,
    },
    quickAmountLabel: {
      fontSize: 12,
      fontWeight: "500",
      marginBottom: 8,
    },
    quickAmountButtons: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    quickAmountButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      borderWidth: 1,
      minWidth: 50,
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
      fontWeight: "600",
    },
    dateRow: {
      flexDirection: "row",
      gap: 12,
    },
    dateField: {
      flex: 1,
    },
    advancedRow: {
      flexDirection: "row",
      gap: 12,
    },
    advancedField: {
      flex: 1,
    },
    datePickerButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 2,
    },
    datePickerText: {
      flex: 1,
      fontSize: 16,
      fontWeight: "500",
    },
    dropdownPickerButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 2,
    },
    dropdownPickerText: {
      flex: 1,
      fontSize: 16,
      fontWeight: "500",
    },
  });
