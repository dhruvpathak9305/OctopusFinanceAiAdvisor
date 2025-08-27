import React from "react";
import { Modal, View, ScrollView, StyleSheet } from "react-native";

// Components
import CategoryHeader from "./components/CategoryHeader";
import BudgetSummary from "./components/BudgetSummary";
import SortSection from "./components/SortSection";
import SubcategoryList from "./components/SubcategoryList";
import { SubcategoryForm } from "./components/SubcategoryForm";

// Hooks and utilities
import { useBudgetModal, ModalView } from "./hooks/useBudgetModal";
import { useThemeColors } from "./hooks/useThemeColors";

// Types
import { BudgetCategory } from "./types";

// Styles
import { commonStyles } from "./components/styles";

export interface BudgetCategoryDetailModalProps {
  visible: boolean;
  onClose: () => void;
  category: BudgetCategory | null;
}

const BudgetCategoryDetailModal: React.FC<BudgetCategoryDetailModalProps> = ({
  visible,
  onClose,
  category,
}) => {
  const colors = useThemeColors();
  const modal = useBudgetModal(visible, category);

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
        {/* Header */}
        <CategoryHeader {...getHeaderProps()} />

        {/* Content */}
        {modal.currentView === "main" ? (
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {renderMainView()}
          </ScrollView>
        ) : (
          renderFormView()
        )}
      </View>
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
