import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Keyboard,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BudgetCategory, BudgetSubcategory } from "../types";
import { ThemeColors } from "../hooks/useThemeColors";
import { useSubcategoryForm } from "../hooks/useSubcategoryForm";
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from "../utils/subcategoryHelpers";

export interface SubCategoryFormProps {
  category: BudgetCategory;
  subcategory?: BudgetSubcategory | null; // null for add, object for edit
  colors: ThemeColors;
  onSave: (data: Omit<BudgetSubcategory, "id">) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const { height: screenHeight } = Dimensions.get("window");
const isSmallScreen = screenHeight < 700;

const SubCategoryForm: React.FC<SubCategoryFormProps> = ({
  category,
  subcategory,
  colors,
  onSave,
  onCancel,
  onDelete,
}) => {
  const isEditMode = !!subcategory;
  const [currentStep, setCurrentStep] = useState(1);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const form = useSubcategoryForm();

  // Load existing subcategory data for editing
  useEffect(() => {
    if (subcategory) {
      form.loadFromSubcategory(subcategory);
    } else {
      form.resetForm();
    }
  }, [subcategory]);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

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

  const canProceedToStep2 =
    form.name.trim().length >= 2 && parseFloat(form.budgetLimit) > 0;

  const renderStep1 = () => (
    <>
      {/* Parent category indicator (only for add mode) */}
      {!isEditMode && (
        <View
          style={[
            styles.parentCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.parentRow}>
            <View
              style={[styles.parentDot, { backgroundColor: colors.primary }]}
            />
            <View style={styles.parentInfo}>
              <Text
                style={[styles.parentLabel, { color: colors.textSecondary }]}
              >
                Parent Category
              </Text>
              <Text style={[styles.parentName, { color: colors.text }]}>
                {category.name}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Form fields */}
      <View style={styles.formContainer}>
        {/* Name field */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.textInput,
              form.errors.name && styles.inputError,
              {
                backgroundColor: colors.card,
                borderColor: form.errors.name ? colors.error : colors.border,
                color: colors.text,
              },
            ]}
            value={form.name}
            onChangeText={form.updateName}
            placeholder="e.g., Groceries, Gas, Internet"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="words"
            returnKeyType="next"
          />
          {form.errors.name && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {form.errors.name}
            </Text>
          )}
        </View>

        {/* Budget limit field */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            Budget Limit <Text style={styles.required}>*</Text>
          </Text>
          <View
            style={[
              styles.currencyContainer,
              form.errors.budgetLimit && styles.inputError,
              {
                backgroundColor: colors.card,
                borderColor: form.errors.budgetLimit
                  ? colors.error
                  : colors.border,
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
              returnKeyType="next"
            />
          </View>
          {form.errors.budgetLimit && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {form.errors.budgetLimit}
            </Text>
          )}
        </View>
      </View>
    </>
  );

  const renderStep2 = () => (
    <View style={styles.formContainer}>
      {/* Icon selection */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: colors.text }]}>
          Choose Icon
        </Text>
        <View style={styles.iconGrid}>
          {AVAILABLE_ICONS.slice(0, 12).map((icon) => (
            <TouchableOpacity
              key={icon}
              style={[
                styles.iconButton,
                {
                  backgroundColor:
                    form.icon === icon ? colors.primary : colors.card,
                  borderColor:
                    form.icon === icon ? colors.primary : colors.border,
                },
              ]}
              onPress={() => form.updateIcon(icon)}
              activeOpacity={0.7}
            >
              <Text style={styles.iconText}>{icon}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Color selection */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: colors.text }]}>
          Choose Color
        </Text>
        <View style={styles.colorGrid}>
          {AVAILABLE_COLORS.slice(0, 8).map((color) => (
            <TouchableOpacity
              key={color}
              style={[styles.colorButton, { backgroundColor: color }]}
              onPress={() => form.updateColor(color)}
              activeOpacity={0.8}
            >
              {form.color === color && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderNavigation = () => {
    if (keyboardVisible && isSmallScreen) return null;

    return (
      <View style={styles.navigationContainer}>
        {/* Step indicators */}
        <View style={styles.stepIndicators}>
          <View
            style={[
              styles.stepDot,
              {
                backgroundColor:
                  currentStep >= 1 ? colors.primary : colors.border,
              },
            ]}
          />
          <View
            style={[
              styles.stepLine,
              {
                backgroundColor:
                  currentStep >= 2 ? colors.primary : colors.border,
              },
            ]}
          />
          <View
            style={[
              styles.stepDot,
              {
                backgroundColor:
                  currentStep >= 2 ? colors.primary : colors.border,
              },
            ]}
          />
        </View>

        {/* Action buttons */}
        <View style={styles.buttonRow}>
          {currentStep === 1 ? (
            <>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  {
                    backgroundColor: canProceedToStep2
                      ? colors.primary
                      : colors.border,
                    opacity: canProceedToStep2 ? 1 : 0.5,
                  },
                ]}
                onPress={() => canProceedToStep2 && setCurrentStep(2)}
                disabled={!canProceedToStep2}
                activeOpacity={0.7}
              >
                <Text style={styles.nextButtonText}>Next</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.backButton, { borderColor: colors.border }]}
                onPress={() => setCurrentStep(1)}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={16} color={colors.text} />
                <Text style={[styles.backButtonText, { color: colors.text }]}>
                  Back
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  {
                    backgroundColor: form.isValid
                      ? colors.primary
                      : colors.border,
                    opacity: form.isValid ? 1 : 0.5,
                  },
                ]}
                onPress={handleSave}
                disabled={!form.isValid || form.isSubmitting}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>
                  {isEditMode ? "Update" : "Create"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Delete button for edit mode */}
        {isEditMode && onDelete && currentStep === 2 && (
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
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {currentStep === 1 ? renderStep1() : renderStep2()}
      </View>
      {renderNavigation()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  parentCard: {
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  parentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  parentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  parentInfo: {
    flex: 1,
  },
  parentLabel: {
    fontSize: 12,
    marginBottom: 2,
    opacity: 0.7,
  },
  parentName: {
    fontSize: 16,
    fontWeight: "600",
  },
  formContainer: {
    flex: 1,
    paddingTop: 16,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  required: {
    color: "#EF4444",
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  currencyContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  currencyInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 20,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  navigationContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 16,
  },
  stepIndicators: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default SubCategoryForm;
