import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BudgetCategory, BudgetSubcategory } from "../types";
import { ThemeColors } from "../hooks/useThemeColors";
import { useSubcategoryForm } from "../hooks/useSubcategoryForm";
import { AVAILABLE_COLORS } from "../utils/subcategoryHelpers";
import { ALL_IONICONS } from "../utils/allIonicons";
import { IconPickerModal } from "./modals/IconPickerModal";
import { ColorPickerModal } from "./modals/ColorPickerModal";

export interface SubCategoryFormProps {
  category: BudgetCategory;
  subcategory?: BudgetSubcategory | null; // null for add, object for edit
  colors: ThemeColors;
  onSave: (data: Omit<BudgetSubcategory, "id">) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export const SubcategoryForm: React.FC<SubCategoryFormProps> = ({
  category,
  subcategory,
  colors,
  onSave,
  onCancel,
  onDelete,
}) => {
  const isEditMode = !!subcategory;
  const form = useSubcategoryForm();
  const [showIconModal, setShowIconModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);

  // Helper function to get current icon display info
  const getCurrentIcon = () => {
    const iconOption = ALL_IONICONS.find((icon) => icon.name === form.icon);
    return iconOption || { name: form.icon, displayName: form.icon };
  };

  // Helper function to get current color display info
  const getCurrentColor = () => {
    const colorOption = AVAILABLE_COLORS.find(
      (color) => color.hex === form.color
    );
    return colorOption || { hex: form.color, name: "Custom" };
  };

  // Load existing subcategory data for editing
  useEffect(() => {
    if (subcategory) {
      form.loadFromSubcategory(subcategory);
    } else {
      form.resetForm();
    }
  }, [subcategory]);

  const handleSave = () => {
    form.handleSubmit(onSave);
  };

  const handleDelete = () => {
    if (onDelete) {
      Alert.alert(
        "Delete Subcategory",
        `Are you sure you want to delete "${subcategory?.name}"?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: onDelete },
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Main Form Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {/* Name Field */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
                form.errors.name && styles.inputError,
              ]}
              value={form.name}
              onChangeText={form.updateName}
              placeholder="Enter subcategory name"
              placeholderTextColor={colors.textSecondary}
              returnKeyType="next"
            />
            {form.errors.name && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {form.errors.name}
              </Text>
            )}
          </View>

          {/* Description Field */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={form.description}
              onChangeText={form.updateDescription}
              placeholder="Optional description"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Budget Amount Field */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Budget Amount <Text style={styles.required}>*</Text>
            </Text>
            <View
              style={[
                styles.currencyContainer,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
                form.errors.amount && styles.inputError,
              ]}
            >
              <Text style={[styles.currencySymbol, { color: colors.text }]}>
                $
              </Text>
              <TextInput
                style={[styles.currencyInput, { color: colors.text }]}
                value={form.amount}
                onChangeText={form.updateAmount}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>
            {form.errors.amount && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {form.errors.amount}
              </Text>
            )}
          </View>

          {/* Current Spend & Budget Limit Row */}
          <View style={styles.row}>
            {/* Current Spend */}
            <View style={[styles.fieldGroup, styles.halfWidth]}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Current Spend
              </Text>
              <View
                style={[
                  styles.currencyContainer,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.currencySymbol, { color: colors.text }]}>
                  $
                </Text>
                <TextInput
                  style={[styles.currencyInput, { color: colors.text }]}
                  value={form.currentSpend}
                  onChangeText={form.updateCurrentSpend}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Budget Limit */}
            <View style={[styles.fieldGroup, styles.halfWidth]}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Warning Limit
              </Text>
              <View
                style={[
                  styles.currencyContainer,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.currencySymbol, { color: colors.text }]}>
                  $
                </Text>
                <TextInput
                  style={[styles.currencyInput, { color: colors.text }]}
                  value={form.budgetLimit}
                  onChangeText={form.updateBudgetLimit}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          {/* Icon & Color Selection Row */}
          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.halfWidth]}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Icon <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.selectorButton,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowIconModal(true)}
                activeOpacity={0.7}
              >
                <View style={styles.selectedIconContainer}>
                  <Ionicons
                    name={getCurrentIcon().name as any}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <Text style={[styles.selectorText, { color: colors.text }]}>
                  {getCurrentIcon().displayName || "Choose Icon"}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.fieldGroup, styles.halfWidth]}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Color <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.selectorButton,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowColorModal(true)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.colorPreview,
                    { backgroundColor: getCurrentColor().hex },
                  ]}
                />
                <Text style={[styles.selectorText, { color: colors.text }]}>
                  {getCurrentColor().name || "Choose Color"}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Settings Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>
            Settings
          </Text>

          <View style={styles.settingsContainer}>
            {/* Display Order & Active Status Row */}
            <View style={styles.settingsRow}>
              <View style={styles.settingsField}>
                <Text
                  style={[
                    styles.settingsFieldLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Order
                </Text>
                <TextInput
                  style={[
                    styles.settingsFieldInput,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={form.displayOrder}
                  onChangeText={form.updateDisplayOrder}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.settingsField}>
                <Text
                  style={[
                    styles.settingsFieldLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Status
                </Text>
                <View style={styles.settingsToggleContainer}>
                  <Switch
                    value={form.isActive}
                    onValueChange={form.updateIsActive}
                    trackColor={{
                      false: colors.border,
                      true: colors.primary + "60",
                    }}
                    thumbColor={
                      form.isActive ? colors.primary : colors.textSecondary
                    }
                    style={styles.settingsToggle}
                  />
                  <Text
                    style={[
                      styles.settingsToggleLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {form.isActive ? "On" : "Off"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Transaction Category ID */}
            <View style={styles.settingsFieldFull}>
              <Text
                style={[
                  styles.settingsFieldLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Transaction Category ID
              </Text>
              <TextInput
                style={[
                  styles.settingsFieldInput,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={form.transactionCategoryId}
                onChangeText={form.updateTransactionCategoryId}
                placeholder="Optional..."
                placeholderTextColor={colors.textSecondary}
                returnKeyType="done"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer with Action Buttons */}
      <View
        style={[
          styles.footer,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              !isEditMode && styles.saveButtonFull,
              {
                backgroundColor: colors.primary, // Always use primary color
                opacity: form.isSubmitting ? 0.7 : 1, // Only dim when submitting
              },
            ]}
            onPress={handleSave}
            disabled={form.isSubmitting} // Only disable when submitting
            activeOpacity={0.7}
          >
            <Text style={styles.saveButtonText}>
              {isEditMode ? "Update" : "Add"}
            </Text>
          </TouchableOpacity>

          {/* Delete button for edit mode */}
          {isEditMode && onDelete && (
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: colors.error }]}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Modals */}
      <IconPickerModal
        visible={showIconModal}
        onClose={() => setShowIconModal(false)}
        onSelectIcon={(iconName) => {
          form.updateIcon(iconName);
        }}
        currentIcon={form.icon}
        colors={colors}
      />

      <ColorPickerModal
        visible={showColorModal}
        onClose={() => setShowColorModal(false)}
        onSelectColor={(colorHex) => {
          form.updateColor(colorHex);
        }}
        currentColor={form.color}
        colors={colors}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 12, // Reduced from 16
    paddingTop: 16, // Add top padding between header and form
  },
  header: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16, // Reduced from 20
    marginBottom: 12, // Reduced from 16
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldGroup: {
    marginBottom: 16, // Reduced from 20
  },
  fieldLabel: {
    fontSize: 14, // Reduced from 16
    fontWeight: "600",
    marginBottom: 6, // Reduced from 8
  },
  required: {
    color: "#EF4444",
  },
  textInput: {
    paddingHorizontal: 14, // Reduced from 16
    paddingVertical: 12, // Reduced from 14
    borderRadius: 10, // Reduced from 12
    borderWidth: 1,
    fontSize: 14, // Reduced from 16
    minHeight: 44, // Reduced from 50
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  currencyContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10, // Reduced from 12
    borderWidth: 1,
    paddingLeft: 14, // Reduced from 16
    minHeight: 44, // Reduced from 50
  },
  currencySymbol: {
    fontSize: 14, // Reduced from 16
    fontWeight: "600",
    marginRight: 6, // Reduced from 8
  },
  currencyInput: {
    flex: 1,
    paddingVertical: 12, // Reduced from 14
    paddingRight: 14, // Reduced from 16
    fontSize: 14, // Reduced from 16
  },
  row: {
    flexDirection: "row",
    gap: 10, // Reduced from 12
  },
  halfWidth: {
    flex: 1,
  },
  selectorButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14, // Reduced from 16
    paddingVertical: 10, // Reduced from 12
    borderRadius: 10, // Reduced from 12
    borderWidth: 1,
    gap: 10, // Reduced from 12
    minHeight: 44, // Reduced from 50
  },
  selectedIconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  selectorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  settingsSectionTitle: {
    fontSize: 16, // Reduced from 18
    fontWeight: "700",
    marginBottom: 12, // Reduced from 16
  },
  settingsContainer: {
    gap: 12, // Reduced from 16
  },
  settingsRow: {
    flexDirection: "row",
    gap: 12, // Reduced from 16
  },
  settingsField: {
    flex: 1,
  },
  settingsFieldFull: {
    width: "100%",
  },
  settingsFieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  settingsFieldInput: {
    paddingHorizontal: 10, // Reduced from 12
    paddingVertical: 8, // Reduced from 10
    borderRadius: 6, // Reduced from 8
    borderWidth: 1,
    fontSize: 13, // Reduced from 14
  },
  settingsToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingsToggle: {
    transform: [{ scale: 0.8 }],
  },
  settingsToggleLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 12, // Reduced from 16
    paddingTop: 12, // Reduced from 16
    paddingBottom: 20, // Reduced from 32
    borderTopWidth: 1,
    marginTop: 6, // Reduced from 8
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10, // Reduced from 12
  },
  saveButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  saveButtonFull: {
    flex: 1, // Only affects flex, doesn't override background color
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
});
