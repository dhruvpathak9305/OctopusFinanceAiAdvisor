import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useDemoMode } from "../../../../contexts/DemoModeContext";
import { budgetCategoryService } from "../../../../services/budgetCategoryService";
import { BudgetCategory } from "../../../../types/budget";
import { ColorPickerModal } from "../BudgetCategoryDetailModal/components/modals/ColorPickerModal";

interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onCategoryAdded: (category: BudgetCategory) => void;
  transactionType?: "expense" | "income";
  editMode?: boolean;
  categoryToEdit?: BudgetCategory | null;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  visible,
  onClose,
  onCategoryAdded,
  transactionType = "expense",
  editMode = false,
  categoryToEdit = null,
}) => {
  const { isDark } = useTheme();
  const { isDemo } = useDemoMode();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");
  const [selectedColor, setSelectedColor] = useState("#10B981");
  const [selectedRingColor, setSelectedRingColor] = useState("#047857");
  const [frequency, setFrequency] = useState("monthly");
  const [strategy, setStrategy] = useState("zero-based");
  const [loading, setLoading] = useState(false);
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
  const [showStrategyDropdown, setShowStrategyDropdown] = useState(false);
  const [showFrequencyInfo, setShowFrequencyInfo] = useState(false);
  const [showStrategyInfo, setShowStrategyInfo] = useState(false);
  const [showBgColorModal, setShowBgColorModal] = useState(false);
  const [showRingColorModal, setShowRingColorModal] = useState(false);

  // Populate fields when in edit mode
  useEffect(() => {
    if (editMode && categoryToEdit) {
      setName(categoryToEdit.name || "");
      setDescription(""); // Could be populated from database if field exists
      setBudgetLimit(
        categoryToEdit.budget_limit
          ? categoryToEdit.budget_limit.toString()
          : ""
      );
      setSelectedColor(
        categoryToEdit.bg_color || categoryToEdit.bgColor || "#10B981"
      );
      setSelectedRingColor(
        categoryToEdit.ring_color || categoryToEdit.ringColor || "#047857"
      );
      // Use actual values from database if available
      setFrequency(categoryToEdit.frequency || "monthly");
      setStrategy(categoryToEdit.strategy || "zero-based");
    } else {
      // Reset for add mode
      setName("");
      setDescription("");
      setBudgetLimit("");
      setSelectedColor("#10B981");
      setSelectedRingColor("#047857");
      setFrequency("monthly");
      setStrategy("zero-based");
    }
  }, [editMode, categoryToEdit, visible]);

  const colors = isDark
    ? {
        background: "#1F2937",
        card: "#374151",
        text: "#FFFFFF",
        textSecondary: "#9CA3AF",
        border: "#4B5563",
        primary: "#10B981",
        secondary: "#3B82F6",
        accent: "#F59E0B",
        danger: "#EF4444",
      }
    : {
        background: "#FFFFFF",
        card: "#F9FAFB",
        text: "#111827",
        textSecondary: "#6B7280",
        border: "#E5E7EB",
        primary: "#10B981",
        secondary: "#3B82F6",
        accent: "#F59E0B",
        danger: "#EF4444",
      };

  const categoryColors = [
    { bg: "#10B981", ring: "#047857", name: "Emerald" },
    { bg: "#3B82F6", ring: "#1E40AF", name: "Blue" },
    { bg: "#F59E0B", ring: "#D97706", name: "Amber" },
    { bg: "#EF4444", ring: "#DC2626", name: "Red" },
    { bg: "#8B5CF6", ring: "#7C3AED", name: "Violet" },
    { bg: "#EC4899", ring: "#DB2777", name: "Pink" },
    { bg: "#06B6D4", ring: "#0891B2", name: "Cyan" },
    { bg: "#84CC16", ring: "#65A30D", name: "Lime" },
    { bg: "#F97316", ring: "#EA580C", name: "Orange" },
    { bg: "#14B8A6", ring: "#0F766E", name: "Teal" },
    { bg: "#A855F7", ring: "#9333EA", name: "Purple" },
    { bg: "#F43F5E", ring: "#E11D48", name: "Rose" },
  ];

  // Find matching color from database hex values
  const findColorMatch = (hexColor: string) => {
    const match = categoryColors.find(
      (color) =>
        color.bg.toLowerCase() === hexColor.toLowerCase() ||
        color.ring.toLowerCase() === hexColor.toLowerCase()
    );
    return match || categoryColors[0]; // Default to first color if no match
  };

  const frequencies = ["monthly", "quarterly", "annual", "custom"];
  const strategies = ["zero-based", "ai-powered", "envelope", "rolling"];

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    if (!budgetLimit.trim() || isNaN(parseFloat(budgetLimit))) {
      Alert.alert("Error", "Please enter a valid budget limit");
      return;
    }

    setLoading(true);
    try {
      const categoryData: any = {
        name: name.trim(),
        percentage: 0,
        budget_limit: parseFloat(budgetLimit), // Use database field name
        limit: parseFloat(budgetLimit), // Keep for compatibility
        spent: editMode && categoryToEdit ? categoryToEdit.spent || 0 : 0,
        remaining:
          parseFloat(budgetLimit) -
          (editMode && categoryToEdit ? categoryToEdit.spent || 0 : 0),
        bg_color: selectedColor, // Use database field name
        ring_color: selectedRingColor, // Use database field name
        bgColor: selectedColor, // Keep for compatibility
        ringColor: selectedRingColor, // Keep for compatibility
        frequency: frequency, // Include frequency
        strategy: strategy, // Include strategy
        category_type: transactionType, // Include category type
        subcategories:
          editMode && categoryToEdit && categoryToEdit.subcategories
            ? categoryToEdit.subcategories
            : [],
        is_active: true,
        status: "not_set",
        display_order:
          editMode && categoryToEdit ? categoryToEdit.display_order || 0 : 0,
      };

      try {
        if (editMode && categoryToEdit && categoryToEdit.id) {
          // Update existing category
          await budgetCategoryService.updateCategory(
            { ...categoryData, id: categoryToEdit.id },
            isDemo
          );
          // Since updateCategory doesn't return the updated category, we'll create it ourselves
          const updatedCategory: BudgetCategory = {
            ...categoryData,
            id: categoryToEdit.id,
          };
          onCategoryAdded(updatedCategory);
          Alert.alert(
            "Success",
            `${
              transactionType === "income" ? "Income" : "Expense"
            } category updated successfully!`
          );
        } else {
          // Create new category
          const newCategory = await budgetCategoryService.createCategory(
            categoryData,
            isDemo
          );
          onCategoryAdded(newCategory);
          Alert.alert(
            "Success",
            `${
              transactionType === "income" ? "Income" : "Expense"
            } category created successfully!`
          );
        }
      } catch (error) {
        console.error(
          `Error ${editMode ? "updating" : "creating"} category:`,
          error
        );
        throw error;
      }
      handleClose();
    } catch (error) {
      console.error(
        `Error ${editMode ? "updating" : "creating"} category:`,
        error
      );
      Alert.alert(
        "Error",
        `Failed to ${
          editMode ? "update" : "create"
        } category. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setBudgetLimit("");
    setSelectedColor("#10B981");
    setSelectedRingColor("#047857");
    setFrequency("monthly");
    setStrategy("zero-based");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Enhanced Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {editMode ? "Edit" : "Add"} Category
            </Text>
            <Text
              style={[styles.headerSubtitle, { color: colors.textSecondary }]}
            >
              {transactionType === "income" ? "Income" : "Expense"} •{" "}
              {editMode ? "Modify settings" : "Create new"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleSave}
            style={[
              styles.saveHeaderButton,
              {
                backgroundColor:
                  name.trim() && budgetLimit ? colors.primary : colors.border,
                opacity: loading ? 0.7 : 1,
              },
            ]}
            disabled={!name.trim() || !budgetLimit || loading}
          >
            {loading ? (
              <Ionicons name="hourglass" size={18} color="#FFFFFF" />
            ) : (
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Compact Mobile Form */}
          {/* Category Name */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Category Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder={`Enter ${transactionType} category name`}
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              maxLength={50}
            />
          </View>

          {/* Description */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.textInput,
                styles.multilineInput,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Optional description"
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={200}
            />
          </View>

          {/* Budget Limit */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Budget Limit <Text style={styles.required}>*</Text>
            </Text>
            <View
              style={[
                styles.amountContainer,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text
                style={[styles.currencySymbol, { color: colors.textSecondary }]}
              >
                $
              </Text>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                value={budgetLimit}
                onChangeText={(text) => {
                  // Only allow numbers and one decimal point
                  const numericValue = text.replace(/[^0-9.]/g, "");
                  const parts = numericValue.split(".");
                  if (parts.length > 2) {
                    setBudgetLimit(parts[0] + "." + parts.slice(1).join(""));
                  } else {
                    setBudgetLimit(numericValue);
                  }
                }}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Compact Color Selection - Single Row */}
          <View style={styles.compactFieldContainer}>
            <Text style={[styles.compactFieldLabel, { color: colors.text }]}>
              Colors
            </Text>
            
            <View style={styles.singleColorRow}>
              {/* Background Color Button */}
              <TouchableOpacity
                style={[
                  styles.colorSelectorButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => setShowBgColorModal(true)}
              >
                <View style={[styles.colorDot, { backgroundColor: selectedColor }]} />
                <Text style={[styles.colorSelectorText, { color: colors.text }]}>
                  Background
                </Text>
                <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
              </TouchableOpacity>

              {/* Ring Color Button */}
              <TouchableOpacity
                style={[
                  styles.colorSelectorButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => setShowRingColorModal(true)}
              >
                <View style={[styles.colorDot, { backgroundColor: selectedRingColor }]} />
                <Text style={[styles.colorSelectorText, { color: colors.text }]}>
                  Ring
                </Text>
                <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
              </TouchableOpacity>

              {/* Color Preview */}
              <View style={styles.compactPreview}>
                <View
                  style={[
                    styles.previewCircle,
                    { backgroundColor: selectedColor },
                  ]}
                >
                  <View
                    style={[
                      styles.previewRing,
                      { borderColor: selectedRingColor },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Compact Settings Section */}
          <View style={styles.settingsSection}>
            {/* Frequency Dropdown */}
            <View style={styles.compactFieldContainer}>
              <View style={styles.labelWithInfo}>
                <Text
                  style={[styles.compactFieldLabel, { color: colors.text }]}
                >
                  Budget Frequency
                </Text>
                <TouchableOpacity
                  onPress={() => setShowFrequencyInfo(true)}
                  style={styles.infoButton}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[
                  styles.dropdownButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
              >
                <Text style={[styles.dropdownText, { color: colors.text }]}>
                  {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                </Text>
                <Ionicons
                  name={showFrequencyDropdown ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {showFrequencyDropdown && (
                <View
                  style={[
                    styles.dropdownMenu,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {frequencies.map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      style={[
                        styles.dropdownItem,
                        frequency === freq && {
                          backgroundColor: colors.primary + "20",
                        },
                      ]}
                      onPress={() => {
                        setFrequency(freq);
                        setShowFrequencyDropdown(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          {
                            color:
                              frequency === freq ? colors.primary : colors.text,
                          },
                        ]}
                      >
                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </Text>
                      {frequency === freq && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Strategy Dropdown */}
            <View style={styles.compactFieldContainer}>
              <View style={styles.labelWithInfo}>
                <Text
                  style={[styles.compactFieldLabel, { color: colors.text }]}
                >
                  Budget Strategy
                </Text>
                <TouchableOpacity
                  onPress={() => setShowStrategyInfo(true)}
                  style={styles.infoButton}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[
                  styles.dropdownButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => setShowStrategyDropdown(!showStrategyDropdown)}
              >
                <Text style={[styles.dropdownText, { color: colors.text }]}>
                  {strategy
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </Text>
                <Ionicons
                  name={showStrategyDropdown ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {showStrategyDropdown && (
                <View
                  style={[
                    styles.dropdownMenu,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {strategies.map((strat) => (
                    <TouchableOpacity
                      key={strat}
                      style={[
                        styles.dropdownItem,
                        strategy === strat && {
                          backgroundColor: colors.primary + "20",
                        },
                      ]}
                      onPress={() => {
                        setStrategy(strat);
                        setShowStrategyDropdown(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          {
                            color:
                              strategy === strat ? colors.primary : colors.text,
                          },
                        ]}
                      >
                        {strat
                          .split("-")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </Text>
                      {strategy === strat && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={handleClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading
                  ? editMode
                    ? "Updating..."
                    : "Creating..."
                  : editMode
                  ? "Update Category"
                  : "Create Category"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Info Modals */}
        {/* Frequency Info Modal */}
        <Modal
          visible={showFrequencyInfo}
          transparent
          animationType="fade"
          onRequestClose={() => setShowFrequencyInfo(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowFrequencyInfo(false)}>
            <View style={styles.infoModalOverlay}>
              <TouchableWithoutFeedback>
                <View
                  style={[
                    styles.infoModal,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.infoHeader,
                      { borderBottomColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.infoTitle, { color: colors.text }]}>
                      Budget Frequency
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowFrequencyInfo(false)}
                    >
                      <Ionicons
                        name="close"
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.infoContent}>
                    <View style={styles.infoItem}>
                      <Text
                        style={[styles.infoItemTitle, { color: colors.text }]}
                      >
                        📅 Monthly
                      </Text>
                      <Text
                        style={[
                          styles.infoItemDesc,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Budget resets every month. Most common for regular
                        expenses.
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text
                        style={[styles.infoItemTitle, { color: colors.text }]}
                      >
                        📊 Quarterly
                      </Text>
                      <Text
                        style={[
                          styles.infoItemDesc,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Budget resets every 3 months. Good for seasonal
                        expenses.
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text
                        style={[styles.infoItemTitle, { color: colors.text }]}
                      >
                        📈 Annual
                      </Text>
                      <Text
                        style={[
                          styles.infoItemDesc,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Budget resets yearly. Perfect for vacation, insurance,
                        taxes.
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text
                        style={[styles.infoItemTitle, { color: colors.text }]}
                      >
                        ⚙️ Custom
                      </Text>
                      <Text
                        style={[
                          styles.infoItemDesc,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Set your own reset period for unique budgeting needs.
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Strategy Info Modal */}
        <Modal
          visible={showStrategyInfo}
          transparent
          animationType="fade"
          onRequestClose={() => setShowStrategyInfo(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowStrategyInfo(false)}>
            <View style={styles.infoModalOverlay}>
              <TouchableWithoutFeedback>
                <View
                  style={[
                    styles.infoModal,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.infoHeader,
                      { borderBottomColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.infoTitle, { color: colors.text }]}>
                      Budget Strategy
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowStrategyInfo(false)}
                    >
                      <Ionicons
                        name="close"
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.infoContent}>
                    <View style={styles.infoItem}>
                      <Text
                        style={[styles.infoItemTitle, { color: colors.text }]}
                      >
                        🎯 Zero Based
                      </Text>
                      <Text
                        style={[
                          styles.infoItemDesc,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Start from zero each period. Assign every dollar a
                        purpose.
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text
                        style={[styles.infoItemTitle, { color: colors.text }]}
                      >
                        🤖 AI Powered
                      </Text>
                      <Text
                        style={[
                          styles.infoItemDesc,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Let AI suggest budget amounts based on your spending
                        patterns.
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text
                        style={[styles.infoItemTitle, { color: colors.text }]}
                      >
                        📦 Envelope
                      </Text>
                      <Text
                        style={[
                          styles.infoItemDesc,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Allocate fixed amounts to "envelopes" for different
                        purposes.
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text
                        style={[styles.infoItemTitle, { color: colors.text }]}
                      >
                        🔄 Rolling
                      </Text>
                      <Text
                        style={[
                          styles.infoItemDesc,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Unused budget rolls over to the next period
                        automatically.
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Background Color Picker Modal */}
        <ColorPickerModal
          visible={showBgColorModal}
          onClose={() => setShowBgColorModal(false)}
          onSelectColor={(colorHex) => setSelectedColor(colorHex)}
          currentColor={selectedColor}
          colors={colors}
        />

        {/* Ring Color Picker Modal */}
        <ColorPickerModal
          visible={showRingColorModal}
          onClose={() => setShowRingColorModal(false)}
          onSelectColor={(colorHex) => setSelectedRingColor(colorHex)}
          currentColor={selectedRingColor}
          colors={colors}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    paddingTop: 16,
  },
  headerButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
    opacity: 0.8,
  },
  saveHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  formSection: {
    marginBottom: 20,
  },
  compactFieldContainer: {
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  compactFieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  compactTextInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "500",
  },
  compactMultilineInput: {
    height: 60,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  compactAmountContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  required: {
    color: "#EF4444",
    fontWeight: "800",
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: -0.1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  multilineInput: {
    height: 80,
    paddingTop: 14,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "500",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  singleColorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  colorSelectorButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  colorSelectorText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  compactPreview: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
  },
  previewCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  previewRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  settingsSection: {
    marginBottom: 20,
  },
  labelWithInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoButton: {
    padding: 4,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 6,
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: "500",
  },
  dropdownMenu: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 4,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 32,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 2,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  // Info Modal Styles
  infoModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  infoModal: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  infoContent: {
    padding: 16,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoItemTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoItemDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default AddCategoryModal;
