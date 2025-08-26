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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useDemoMode } from "../../../../contexts/DemoModeContext";
import { addSubCategoryToDB } from "../../../../services/budgetSubcategoryService";
import { BudgetCategory, SubCategory } from "../../../../types/budget";

interface AddSubcategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSubcategoryAdded: (subcategory: SubCategory) => void;
  parentCategory: BudgetCategory | null;
  editMode?: boolean;
  subcategoryToEdit?: any; // BudgetSubcategory from the detail modal
}

const AddSubcategoryModal: React.FC<AddSubcategoryModalProps> = ({
  visible,
  onClose,
  onSubcategoryAdded,
  parentCategory,
  editMode = false,
  subcategoryToEdit,
}) => {
  const { isDark } = useTheme();
  const { isDemo } = useDemoMode();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");
  const [selectedColor, setSelectedColor] = useState("#10B981");
  const [selectedIcon, setSelectedIcon] = useState("💰");
  const [loading, setLoading] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      console.log("🔄 AddSubcategoryModal closed, resetting form");
      setTimeout(() => {
        if (!editMode) {
          setName("");
          setDescription("");
          setBudgetLimit("");
          setSelectedColor("#10B981");
          setSelectedIcon("💰");
        }
      }, 200);
    }
  }, [visible, editMode]);

  // Populate fields when editing
  useEffect(() => {
    console.log(
      "AddSubcategoryModal useEffect - editMode:",
      editMode,
      "subcategoryToEdit:",
      subcategoryToEdit?.name
    );
    if (editMode && subcategoryToEdit && visible) {
      console.log("Populating fields for editing:", subcategoryToEdit);
      setName(subcategoryToEdit.name || "");
      setDescription(subcategoryToEdit.description || "");
      setBudgetLimit(subcategoryToEdit.budget_limit?.toString() || "");
      setSelectedColor(subcategoryToEdit.color || "#10B981");
      setSelectedIcon(subcategoryToEdit.icon || "💰");
    }
  }, [editMode, subcategoryToEdit, visible]);

  // Debug modal visibility
  useEffect(() => {
    console.log("🎯 AddSubcategoryModal visibility changed to:", visible);
    console.log("🎯 EditMode:", editMode);
    console.log("🎯 SubcategoryToEdit:", subcategoryToEdit?.name || null);
    console.log("🎯 ParentCategory:", parentCategory?.name || null);
    if (visible) {
      console.log("✅ AddSubcategoryModal should be showing now!");
    }
  }, [visible, editMode, subcategoryToEdit, parentCategory]);

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

  const subcategoryColors = [
    "#10B981",
    "#3B82F6",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#84CC16",
  ];

  const subcategoryIcons = [
    "💰",
    "🛒",
    "🍽️",
    "🚗",
    "🏠",
    "💊",
    "🎓",
    "✈️",
    "🎬",
    "👕",
    "📱",
    "⚡",
    "🎯",
    "💳",
    "🎵",
    "🏋️",
  ];

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a subcategory name");
      return;
    }

    if (!budgetLimit.trim() || isNaN(parseFloat(budgetLimit))) {
      Alert.alert("Error", "Please enter a valid budget limit");
      return;
    }

    if (!parentCategory?.id) {
      Alert.alert("Error", "Parent category is required");
      return;
    }

    setLoading(true);
    try {
      if (editMode && subcategoryToEdit) {
        // Edit mode - update existing subcategory
        const updatedSubcategory = {
          ...subcategoryToEdit,
          name: name.trim(),
          budget_limit: parseFloat(budgetLimit),
          color: selectedColor,
          icon: selectedIcon,
        };

        // TODO: Call update API instead of add
        // await updateSubCategoryInDB(subcategoryToEdit.id, updatedSubcategory, isDemo);

        onSubcategoryAdded(updatedSubcategory);
        handleClose();

        Alert.alert("Success", "Subcategory updated successfully!");
      } else {
        // Add mode - create new subcategory
        const newSubcategory: SubCategory = {
          name: name.trim(),
          amount: parseFloat(budgetLimit),
          color: selectedColor,
          icon: selectedIcon,
        };

        await addSubCategoryToDB(parentCategory.id, newSubcategory, isDemo);

        // Create the full subcategory object to return
        const createdSubcategory = {
          ...newSubcategory,
          id: Date.now().toString(), // Temporary ID - in real app this would come from DB
          category_id: parentCategory.id,
          budget_limit: parseFloat(budgetLimit),
          current_spend: 0,
          is_active: true,
          display_order: 0,
        };

        onSubcategoryAdded(createdSubcategory);
        handleClose();

        Alert.alert("Success", "Subcategory created successfully!");
      }
    } catch (error) {
      console.error(
        `Error ${editMode ? "updating" : "creating"} subcategory:`,
        error
      );
      Alert.alert(
        "Error",
        `Failed to ${
          editMode ? "update" : "create"
        } subcategory. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editMode || !subcategoryToEdit) return;

    Alert.alert(
      "Delete Subcategory",
      "Are you sure you want to delete this subcategory? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              // TODO: Call delete API
              // await deleteSubCategoryFromDB(subcategoryToEdit.id, isDemo);

              // For now, just call the callback to indicate deletion
              onSubcategoryAdded({ ...subcategoryToEdit, _deleted: true });
              handleClose();

              Alert.alert("Success", "Subcategory deleted successfully!");
            } catch (error) {
              console.error("Error deleting subcategory:", error);
              Alert.alert(
                "Error",
                "Failed to delete subcategory. Please try again."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setBudgetLimit("");
    setSelectedColor("#10B981");
    setSelectedIcon("💰");
    onClose();
  };

  // Force re-render key for modal consistency
  const modalKey = `modal-${editMode ? "edit" : "add"}-${
    subcategoryToEdit?.id || "new"
  }-${visible}`;

  if (!visible) {
    return null;
  }

  return (
    <Modal
      key={modalKey}
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {editMode ? "Edit Subcategory" : "Add Subcategory"}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Parent Category Info */}
          {parentCategory && (
            <View
              style={[
                styles.parentCategoryContainer,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.categoryColorIndicator,
                  { backgroundColor: parentCategory.bgColor },
                ]}
              />
              <View style={styles.parentCategoryInfo}>
                <Text
                  style={[
                    styles.parentCategoryLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Parent Category
                </Text>
                <Text
                  style={[styles.parentCategoryName, { color: colors.text }]}
                >
                  {parentCategory.name}
                </Text>
              </View>
            </View>
          )}

          {/* Subcategory Name */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Subcategory Name <Text style={styles.required}>*</Text>
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
              placeholder="Enter subcategory name"
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

          {/* Icon Selection */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Icon
            </Text>
            <View style={styles.iconGrid}>
              {subcategoryIcons.map((icon, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.iconOption,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                    selectedIcon === icon && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Text style={styles.iconText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Selection */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Color
            </Text>
            <View style={styles.colorGrid}>
              {subcategoryColors.map((colorOption, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorOption,
                    { backgroundColor: colorOption },
                    selectedColor === colorOption && styles.selectedColorOption,
                  ]}
                  onPress={() => setSelectedColor(colorOption)}
                >
                  {selectedColor === colorOption && (
                    <Ionicons name="checkmark" size={20} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {editMode ? (
              <>
                <TouchableOpacity
                  style={[
                    styles.deleteButton,
                    { backgroundColor: colors.danger },
                  ]}
                  onPress={handleDelete}
                  disabled={loading}
                >
                  <Text style={styles.deleteButtonText}>
                    {loading ? "Deleting..." : "Delete"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? "Updating..." : "Update"}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={handleClose}
                >
                  <Text
                    style={[styles.cancelButtonText, { color: colors.text }]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? "Creating..." : "Create Subcategory"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  parentCategoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  categoryColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  parentCategoryInfo: {
    flex: 1,
  },
  parentCategoryLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  parentCategoryName: {
    fontSize: 16,
    fontWeight: "600",
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  required: {
    color: "#EF4444",
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
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
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  iconText: {
    fontSize: 20,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
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
  deleteButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginRight: 12,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});

export default AddSubcategoryModal;
