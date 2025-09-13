import React, { useState } from "react";
import { Modal, View, ScrollView, StyleSheet } from "react-native";

// Components
import CategoryHeader from "./components/CategoryHeader";
import BudgetSummary from "./components/BudgetSummary";
import SortSection from "./components/SortSection";
import SubcategoryList from "./components/SubcategoryList";
import { SubcategoryForm } from "./components/SubcategoryForm";
import BulkBudgetAllocation from "./components/BulkBudgetAllocation";
import AddCategoryModal from "../AddCategoryModal";

// Hooks and utilities
import { useBudgetModal, ModalView } from "./hooks/useBudgetModal";
import { useThemeColors } from "./hooks/useThemeColors";

// Types
import { BudgetCategory as ModalBudgetCategory } from "./types";
import { BudgetCategory } from "../../../../types/budget";

// Styles
import { commonStyles } from "./components/styles";

export interface BudgetCategoryDetailModalProps {
  visible: boolean;
  onClose: () => void;
  category: ModalBudgetCategory | null;
}

const BudgetCategoryDetailModal: React.FC<BudgetCategoryDetailModalProps> = ({
  visible,
  onClose,
  category,
}) => {
  const colors = useThemeColors();
  const modal = useBudgetModal(visible, category);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState("Monthly");

  // Don't render if no category
  if (!category) {
    return null;
  }

  const renderMainView = () => (
    <>
      {/* Budget Summary Card */}
      <BudgetSummary
        category={category}
        totalSpent={modal.totalSpent}
        totalBudget={modal.totalBudget}
        totalPercentage={modal.totalPercentage}
        colors={colors}
        onAddSubcategory={modal.goToAddSubcategory}
        onEditCategory={() => setShowEditCategoryModal(true)}
        onDurationChange={setSelectedDuration}
        selectedDuration={selectedDuration}
      />

      {/* Sort Section with Dropdown */}
      <SortSection
        sortMode={modal.sortMode}
        showDropdown={modal.showSortDropdown}
        colors={colors}
        onSortModeChange={modal.setSortMode}
        onToggleDropdown={() =>
          modal.setShowSortDropdown(!modal.showSortDropdown)
        }
        onBulkAllocation={modal.goToBulkAllocation}
      />

      {/* Subcategory List/Grid */}
      <SubcategoryList
        subcategories={modal.sortedSubcategories}
        viewMode={modal.viewMode}
        colors={colors}
        onEditSubcategory={modal.goToEditSubcategory}
      />
    </>
  );

  const renderFormView = () => (
    <SubcategoryForm
      category={category}
      subcategory={modal.selectedSubcategory}
      colors={colors}
      onSave={(data) => {
        if (
          modal.currentView === "edit-subcategory" &&
          modal.selectedSubcategory
        ) {
          modal.updateSubcategory(modal.selectedSubcategory.id, data);
        } else {
          modal.addSubcategory(data);
        }
      }}
      onCancel={modal.goToMain}
      onDelete={
        modal.currentView === "edit-subcategory" && modal.selectedSubcategory
          ? () => modal.deleteSubcategory(modal.selectedSubcategory!.id)
          : undefined
      }
    />
  );

  const getHeaderProps = () => {
    const baseProps = {
      colors,
      title: category.name,
    };

    switch (modal.currentView) {
      case "main":
        return {
          ...baseProps,
          title: "Budget Details", // Show only "Budget Details", remove redundant category name
          subtitle: undefined, // Remove subtitle to clean up header
          showViewToggle: true,
          showCloseButton: true,
          viewMode: modal.viewMode,
          onClose,
          onViewModeChange: modal.setViewMode,
        };

      case "add-subcategory":
        return {
          ...baseProps,
          title: "Add Subcategory",
          showBackButton: true,
          onBack: modal.goToMain,
        };

      case "edit-subcategory":
        return {
          ...baseProps,
          title: "Edit Subcategory",
          showBackButton: true,
          onBack: modal.goToMain,
        };

      case "bulk-allocation":
        return {
          ...baseProps,
          title: "", // No title needed, handled by component
          showBackButton: false,
          showCloseButton: false,
        };

      case "edit-category":
        return {
          ...baseProps,
          title: "Edit Category",
          showBackButton: true,
          onBack: modal.goToMain,
        };

      default:
        return baseProps;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={modal.currentView === "main" ? onClose : modal.goToMain}
    >
      <View
        style={[
          commonStyles.fullScreenModal,
          { backgroundColor: colors.background },
        ]}
      >
        {/* Header - Only show for non-bulk-allocation views */}
        {modal.currentView !== "bulk-allocation" && (
          <CategoryHeader {...getHeaderProps()} />
        )}

        {/* Content */}
        {modal.currentView === "main" ? (
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {renderMainView()}
          </ScrollView>
        ) : modal.currentView === "bulk-allocation" ? (
          <View style={{ flex: 1 }}>
            <BulkBudgetAllocation
              subcategories={modal.subcategories}
              categoryBudget={category.budget_limit}
              categoryName={category.name}
              categoryId={category.id}
              colors={colors}
              onSave={modal.bulkUpdateSubcategories}
              onCancel={modal.goToMain}
            />
          </View>
        ) : (
          renderFormView()
        )}
      </View>

      {/* Edit Category Modal */}
      <AddCategoryModal
        visible={showEditCategoryModal}
        onClose={() => setShowEditCategoryModal(false)}
        onCategoryAdded={(updatedCategory) => {
          // Handle category update - this would need to refresh the parent data
          setShowEditCategoryModal(false);
          // You might want to add a callback to refresh the budget data
        }}
        editMode={true}
        categoryToEdit={
          {
            ...category,
            limit: category.budget_limit,
            bgColor: category.bg_color,
            ringColor: category.ring_color,
          } as BudgetCategory
        }
        transactionType={category.category_type as "expense" | "income"}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 40,
  },
});

export default BudgetCategoryDetailModal;
