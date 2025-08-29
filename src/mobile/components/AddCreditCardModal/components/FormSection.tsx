import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  FormField,
  SelectField,
  DatePicker,
  LogoUpload,
  CreditUtilization,
} from "./index";
import { CreditCardFormData } from "../types";

interface FormSectionProps {
  formData: CreditCardFormData;
  updateField: (field: string, value: string | Date) => void;
  errors: Record<string, string>;
  clearError: (field: string) => void;
  handleLogoUpload: () => void;
  handleRemoveLogo: () => void;
  formatLastFourDigits: (text: string) => string;
  formatDate: (date: Date) => string;
  onInstitutionPress: () => void;
  onCustomInstitutionPress: () => void;
  onBillingCyclePress: () => void;
  onDueDatePress: () => void;
  allInstitutions: string[];
  billingCycles: Array<{ label: string; value: string }>;
  colors: any;
  styles: any;
}

export const FormSection: React.FC<FormSectionProps> = ({
  formData,
  updateField,
  errors,
  clearError,
  handleLogoUpload,
  handleRemoveLogo,
  formatLastFourDigits,
  formatDate,
  onInstitutionPress,
  onCustomInstitutionPress,
  onBillingCyclePress,
  onDueDatePress,
  allInstitutions,
  billingCycles,
  colors,
  styles,
}) => {
  return (
    <View>
      {/* Card Name */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Card Name <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <FormField
          value={formData.name}
          onChangeText={(text: string) => {
            updateField("name", text);
            clearError("name");
          }}
          placeholder="My Rewards Card"
          error={errors.name}
          colors={colors}
          styles={styles}
        />
      </View>

      {/* Card Issuer and Last 4 Digits Row */}
      <View style={styles.rowContainer}>
        <View style={[styles.halfWidth, { marginRight: 8 }]}>
          <View style={styles.labelWithAction}>
            <Text style={[styles.label, { color: colors.text }]}>
              Card Issuer <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <TouchableOpacity onPress={onCustomInstitutionPress}>
              <View
                style={[styles.plusIcon, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="add" size={14} color="white" />
              </View>
            </TouchableOpacity>
            <View style={{ width: 20 }} />
          </View>
          <SelectField
            value={formData.institution}
            onPress={onInstitutionPress}
            placeholder="Select Issuer"
            error={errors.institution}
            colors={colors}
            styles={styles}
            hasAction={true}
          />
        </View>

        <View style={[styles.halfWidth, { marginLeft: 8 }]}>
          <View style={styles.labelWithAction}>
            <Text style={[styles.label, { color: colors.text }]}>
              Last 4 Digits <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <View style={{ width: 20 }} />
          </View>
          <View
            style={[
              styles.cardNumberContainer,
              {
                borderColor: errors.lastFourDigits
                  ? colors.error
                  : colors.border,
              },
            ]}
          >
            <Text
              style={[styles.cardNumberPrefix, { color: colors.textSecondary }]}
            >
              ••••
            </Text>
            <TextInput
              style={[styles.cardNumberInput, { color: colors.text }]}
              value={formData.lastFourDigits}
              onChangeText={(text: string) => {
                const formatted = formatLastFourDigits(text);
                updateField("lastFourDigits", formatted);
                clearError("lastFourDigits");
              }}
              placeholder="1234"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
          {errors.lastFourDigits ? (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errors.lastFourDigits}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Credit Limit and Current Balance */}
      <View style={styles.rowContainer}>
        <View style={[styles.halfWidth, { marginRight: 8 }]}>
          <Text style={[styles.label, { color: colors.text }]}>
            Credit Limit <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <View
            style={[
              styles.amountContainer,
              {
                borderColor: errors.creditLimit ? colors.error : colors.border,
              },
            ]}
          >
            <Text
              style={[styles.currencySymbol, { color: colors.textSecondary }]}
            >
              ₹
            </Text>
            <TextInput
              style={[styles.amountInput, { color: colors.text }]}
              value={formData.creditLimit}
              onChangeText={(text: string) => {
                updateField("creditLimit", text);
                clearError("creditLimit");
              }}
              placeholder="100000"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
          {errors.creditLimit ? (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errors.creditLimit}
            </Text>
          ) : null}
        </View>

        <View style={[styles.halfWidth, { marginLeft: 8 }]}>
          <Text style={[styles.label, { color: colors.text }]}>
            Current Balance <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <View
            style={[
              styles.amountContainer,
              {
                borderColor: errors.currentBalance
                  ? colors.error
                  : colors.border,
              },
            ]}
          >
            <Text
              style={[styles.currencySymbol, { color: colors.textSecondary }]}
            >
              ₹
            </Text>
            <TextInput
              style={[styles.amountInput, { color: colors.text }]}
              value={formData.currentBalance}
              onChangeText={(text: string) => {
                updateField("currentBalance", text);
                clearError("currentBalance");
              }}
              placeholder="25000"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
          {errors.currentBalance ? (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errors.currentBalance}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Due Date and Billing Cycle Row */}
      <View style={styles.rowContainer}>
        <View style={[styles.halfWidth, { marginRight: 8 }]}>
          <View style={styles.labelWithAction}>
            <Text style={[styles.label, { color: colors.text }]}>Due Date</Text>
            <View style={{ width: 20 }} />
          </View>
          <TouchableOpacity
            style={[styles.dateButton, { borderColor: colors.border }]}
            onPress={onDueDatePress}
          >
            <Text style={[styles.dateText, { color: colors.text }]}>
              {formData.dueDate ? formatDate(formData.dueDate) : "Select Date"}
            </Text>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.halfWidth, { marginLeft: 8 }]}>
          <SelectField
            label="Billing Cycle"
            value={formData.billingCycle || ""}
            onPress={onBillingCyclePress}
            placeholder="Select Cycle"
            colors={colors}
            styles={styles}
            hasAction={false}
          />
        </View>
      </View>

      {/* Logo Upload */}
      <View style={styles.inputGroup}>
        <LogoUpload
          logoUri={formData.logoUri}
          onUpload={handleLogoUpload}
          onRemove={handleRemoveLogo}
          colors={colors}
          styles={styles}
        />
      </View>

      {/* Credit Utilization */}
      <CreditUtilization
        creditLimit={formData.creditLimit}
        currentBalance={formData.currentBalance}
        colors={colors}
        styles={styles}
      />
    </View>
  );
};
