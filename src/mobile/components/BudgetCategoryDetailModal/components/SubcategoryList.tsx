import React from "react";
import { View, Text, StyleSheet } from "react-native";
import SubcategoryCard from "./SubcategoryCard";
import { BudgetSubcategory, ViewMode } from "../types";
import { ThemeColors } from "../hooks/useThemeColors";

export interface SubCategoryListProps {
  subcategories: BudgetSubcategory[];
  viewMode: ViewMode;
  colors: ThemeColors;
  onEditSubcategory: (subcategory: BudgetSubcategory) => void;
}

const SubCategoryList: React.FC<SubCategoryListProps> = ({
  subcategories,
  viewMode,
  colors,
  onEditSubcategory,
}) => {
  if (subcategories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.emptyIcon, { color: colors.textSecondary }]}>
            📊
          </Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Subcategories
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Add your first subcategory to start tracking your budget
          </Text>
        </View>
      </View>
    );
  }

  const containerStyle =
    viewMode === "grid" ? styles.gridContainer : styles.listContainer;

  return (
    <View style={containerStyle}>
      {subcategories.map((subcategory) => (
        <SubcategoryCard
          key={subcategory.id}
          subcategory={subcategory}
          viewMode={viewMode}
          colors={colors}
          onEdit={() => onEditSubcategory(subcategory)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 6, // Tighter grid spacing
    paddingBottom: 40,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    borderStyle: "dashed",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.8,
  },
});

export default SubCategoryList;
