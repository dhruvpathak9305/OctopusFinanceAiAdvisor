import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { renderIconFromName } from "../../../../../utils/subcategoryIcons";
import { BudgetSubcategory, ThemeColors } from "../types";
import { formatCurrency } from "../utils/budgetCalculations";
import { budgetCategoryService } from "../../../../../services/budgetCategoryService";
import { useDemoMode } from "../../../../../contexts/DemoModeContext";

export interface BulkBudgetAllocationProps {
  subcategories: BudgetSubcategory[];
  categoryBudget: number;
  categoryName: string;
  categoryId: string;
  colors: ThemeColors;
  onSave: (updatedSubcategories: BudgetSubcategory[]) => void;
  onCancel: () => void;
}

const { width: screenWidth } = Dimensions.get("window");

const BulkBudgetAllocation: React.FC<BulkBudgetAllocationProps> = ({
  subcategories,
  categoryBudget,
  categoryName,
  categoryId,
  colors,
  onSave,
  onCancel,
}) => {
  const { isDemo } = useDemoMode();
  const [allocations, setAllocations] = useState<{ [key: string]: number }>({});
  const [allocationMode, setAllocationMode] = useState<"percentage" | "amount">(
    "percentage"
  );
  const [saving, setSaving] = useState(false);

  // Initialize allocations from current subcategory budgets
  useEffect(() => {
    const initialAllocations: { [key: string]: number } = {};
    subcategories.forEach((sub) => {
      if (allocationMode === "percentage") {
        initialAllocations[sub.id] =
          categoryBudget > 0
            ? Math.round((sub.amount / categoryBudget) * 100)
            : 0;
      } else {
        initialAllocations[sub.id] = sub.amount;
      }
    });
    setAllocations(initialAllocations);
  }, [subcategories, categoryBudget, allocationMode]);

  // Calculate totals and validation
  const totals = useMemo(() => {
    const totalPercentage = Object.values(allocations).reduce(
      (sum, val) => sum + (val || 0),
      0
    );
    const totalAmount =
      allocationMode === "percentage"
        ? (totalPercentage / 100) * categoryBudget
        : Object.values(allocations).reduce((sum, val) => sum + (val || 0), 0);

    const remaining = categoryBudget - totalAmount;
    const isValid = totalAmount <= categoryBudget;
    const isComplete = Math.abs(remaining) < 1; // Within $1 tolerance

    return {
      totalPercentage:
        allocationMode === "percentage"
          ? totalPercentage
          : (totalAmount / categoryBudget) * 100,
      totalAmount,
      remaining,
      isValid,
      isComplete,
    };
  }, [allocations, categoryBudget, allocationMode]);

  const updateAllocation = (subcategoryId: string, value: number) => {
    setAllocations((prev) => ({
      ...prev,
      [subcategoryId]: Math.max(0, value),
    }));
  };

  const handleAutoAllocate = (method: "equal" | "current" | "zero") => {
    const newAllocations: { [key: string]: number } = {};

    switch (method) {
      case "equal":
        const equalValue =
          allocationMode === "percentage"
            ? Math.floor(100 / subcategories.length)
            : Math.floor(categoryBudget / subcategories.length);
        subcategories.forEach((sub) => {
          newAllocations[sub.id] = equalValue;
        });
        break;

      case "current":
        subcategories.forEach((sub) => {
          if (allocationMode === "percentage") {
            newAllocations[sub.id] =
              categoryBudget > 0
                ? Math.round((sub.amount / categoryBudget) * 100)
                : 0;
          } else {
            newAllocations[sub.id] = sub.amount;
          }
        });
        break;

      case "zero":
        subcategories.forEach((sub) => {
          newAllocations[sub.id] = 0;
        });
        break;
    }

    setAllocations(newAllocations);
  };

  const handleSave = async () => {
    if (!totals.isValid) {
      Alert.alert(
        "Invalid Allocation",
        `Total allocation (${formatCurrency(
          totals.totalAmount
        )}) exceeds category budget (${formatCurrency(
          categoryBudget
        )}). Please adjust your allocations.`
      );
      return;
    }

    try {
      setSaving(true);

      // Prepare subcategory updates for database
      const subcategoryUpdates = subcategories.map((sub) => {
        const allocation = allocations[sub.id] || 0;
        const newAmount =
          allocationMode === "percentage"
            ? (allocation / 100) * categoryBudget
            : allocation;

        return {
          id: sub.id,
          budget_limit: newAmount,
        };
      });

      // Save to database
      await budgetCategoryService.bulkUpdateSubcategoryBudgets(
        categoryId,
        subcategoryUpdates,
        isDemo
      );

      // Update local state
      const updatedSubcategories = subcategories.map((sub) => {
        const allocation = allocations[sub.id] || 0;
        const newAmount =
          allocationMode === "percentage"
            ? (allocation / 100) * categoryBudget
            : allocation;

        return {
          ...sub,
          amount: newAmount,
          budgetLimit: newAmount,
        };
      });

      onSave(updatedSubcategories);

      Alert.alert(
        "Success",
        `Budget allocation saved! Updated ${subcategoryUpdates.length} subcategories.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error saving budget allocation:", error);
      Alert.alert(
        "Error",
        "Failed to save budget allocation. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setSaving(false);
    }
  };

  const renderSubcategoryIcon = (subcategory: BudgetSubcategory) => {
    if (subcategory.icon) {
      return renderIconFromName(
        subcategory.icon,
        20,
        subcategory.color || "#10B981"
      );
    }
    return <Text style={{ fontSize: 20, textAlign: "center" }}>❓</Text>;
  };

  const getStatusColor = () => {
    if (!totals.isValid) return colors.error;
    if (totals.isComplete) return colors.success;
    return colors.warning;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Compact Header with Mode Toggle - Utilizing the empty space */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {categoryName}
            </Text>
            <Text
              style={[styles.headerSubtitle, { color: colors.textSecondary }]}
            >
              Budget Allocation • {formatCurrency(categoryBudget)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleSave}
            style={[
              styles.saveButton,
              {
                backgroundColor:
                  totals.isValid && !saving ? colors.primary : colors.border,
              },
            ]}
            disabled={!totals.isValid || saving}
          >
            {saving ? (
              <Ionicons
                name="hourglass"
                size={18}
                color={colors.textSecondary}
              />
            ) : (
              <Ionicons
                name="checkmark"
                size={18}
                color={totals.isValid ? "#FFFFFF" : colors.textSecondary}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Mode Toggle integrated in header */}
        <View style={[styles.modeToggle, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              allocationMode === "percentage" && {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() => setAllocationMode("percentage")}
          >
            <Text
              style={[
                styles.modeButtonText,
                {
                  color:
                    allocationMode === "percentage" ? "#FFFFFF" : colors.text,
                },
              ]}
            >
              Percentage
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              allocationMode === "amount" && {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() => setAllocationMode("amount")}
          >
            <Text
              style={[
                styles.modeButtonText,
                {
                  color: allocationMode === "amount" ? "#FFFFFF" : colors.text,
                },
              ]}
            >
              Amount
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Compact Mobile Summary */}
      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: colors.card,
            borderColor: getStatusColor() + "30",
          },
        ]}
      >
        {/* Progress Row */}
        <View style={styles.progressRow}>
          <View style={styles.progressItem}>
            <Text
              style={[styles.progressLabel, { color: colors.textSecondary }]}
            >
              Used
            </Text>
            <Text style={[styles.progressValue, { color: getStatusColor() }]}>
              {Math.round(totals.totalPercentage)}%
            </Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressTrack,
                { backgroundColor: colors.border + "40" },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: getStatusColor(),
                    width: `${Math.min(totals.totalPercentage, 100)}%`,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.progressItem}>
            <Text
              style={[styles.progressLabel, { color: colors.textSecondary }]}
            >
              Left
            </Text>
            <Text
              style={[
                styles.progressValue,
                {
                  color: totals.remaining >= 0 ? colors.success : colors.error,
                },
              ]}
            >
              {formatCurrency(Math.abs(totals.remaining), 0)}
            </Text>
          </View>
        </View>

        {/* Status Message */}
        {!totals.isValid && (
          <View
            style={[styles.statusRow, { backgroundColor: colors.error + "10" }]}
          >
            <Ionicons name="warning" size={14} color={colors.error} />
            <Text style={[styles.statusText, { color: colors.error }]}>
              Over budget by {formatCurrency(Math.abs(totals.remaining), 0)}
            </Text>
          </View>
        )}
      </View>

      {/* Refined Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <View style={styles.quickButtonsRow}>
          <TouchableOpacity
            style={[
              styles.quickButton,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => handleAutoAllocate("equal")}
          >
            <Ionicons name="resize" size={16} color={colors.primary} />
            <Text style={[styles.quickButtonText, { color: colors.text }]}>
              Equal Split
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.quickButton,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => handleAutoAllocate("current")}
          >
            <Ionicons name="refresh" size={16} color={colors.primary} />
            <Text style={[styles.quickButtonText, { color: colors.text }]}>
              Reset
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.quickButton,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => handleAutoAllocate("zero")}
          >
            <Ionicons name="trash-outline" size={16} color={colors.primary} />
            <Text style={[styles.quickButtonText, { color: colors.text }]}>
              Clear All
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Subcategory Allocation List */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.allocationList}>
          {subcategories.map((subcategory) => {
            const allocation = allocations[subcategory.id] || 0;
            const calculatedAmount =
              allocationMode === "percentage"
                ? (allocation / 100) * categoryBudget
                : allocation;

            return (
              <View
                key={subcategory.id}
                style={[
                  styles.allocationItem,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                {/* Icon and Name */}
                <View style={styles.itemHeader}>
                  <View
                    style={[
                      styles.itemIcon,
                      { backgroundColor: subcategory.color + "20" },
                    ]}
                  >
                    {renderSubcategoryIcon(subcategory)}
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: colors.text }]}>
                      {subcategory.name}
                    </Text>
                    <Text
                      style={[
                        styles.itemAmount,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {formatCurrency(calculatedAmount)}
                    </Text>
                  </View>
                </View>

                {/* Input */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={allocation.toString()}
                    onChangeText={(text) => {
                      const value = parseFloat(text) || 0;
                      updateAllocation(subcategory.id, value);
                    }}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.inputSuffix,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {allocationMode === "percentage" ? "%" : "$"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 0,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 16,
  },
  cancelButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 1,
    fontWeight: "500",
    opacity: 0.8,
  },
  saveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  modeToggle: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
    backgroundColor: "transparent",
  },
  modeButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 7,
    alignItems: "center",
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  summaryCard: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressItem: {
    alignItems: "center",
    minWidth: 60,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
    opacity: 0.7,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  progressBar: {
    flex: 1,
    marginHorizontal: 16,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    gap: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
  },
  quickActionsContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  quickButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  quickButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  quickButtonText: {
    fontSize: 11,
    fontWeight: "600",
  },
  scrollContainer: {
    flex: 1,
  },
  allocationList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  allocationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 1,
    letterSpacing: -0.1,
  },
  itemAmount: {
    fontSize: 11,
    fontWeight: "500",
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 75,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
    minWidth: 55,
    letterSpacing: -0.2,
  },
  inputSuffix: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
    minWidth: 16,
    opacity: 0.6,
  },
});

export default BulkBudgetAllocation;
