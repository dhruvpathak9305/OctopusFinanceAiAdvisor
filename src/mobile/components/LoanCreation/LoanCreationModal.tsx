/**
 * Main Reusable Loan Creation Modal Component
 * Combines all sub-components into a complete loan creation interface
 */

import React, { forwardRef, useImperativeHandle } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../../contexts/ThemeContext";

// Components
import { LoanTypeSelector } from "./components/LoanTypeSelector";
import { RecipientSelector } from "./components/RecipientSelector";
import { EnhancedLoanFormFields } from "./components/EnhancedLoanFormFields";

// Hooks and types
import { useLoanForm } from "./hooks/useLoanForm";
import { useLoanRecipients } from "./hooks/useLoanRecipients";
import { LoanCreationProps, LoanCreationRef } from "./types";

export const LoanCreationModal = forwardRef<LoanCreationRef, LoanCreationProps>(
  (props, ref) => {
    const { isDark } = useTheme();
    const colors = isDark
      ? {
          background: "#0B1426",
          card: "#1F2937",
          border: "#374151",
          text: "#F9FAFB",
          textSecondary: "#D1D5DB",
          primary: "#10B981",
          error: "#EF4444",
          success: "#10B981",
        }
      : {
          background: "#FFFFFF",
          card: "#F9FAFB",
          border: "#E5E7EB",
          text: "#111827",
          textSecondary: "#6B7280",
          primary: "#10B981",
          error: "#EF4444",
          success: "#10B981",
        };

    // Fetch real recipients from database
    const {
      recipients: fetchedRecipients,
      loading: recipientsLoading,
      error: recipientsError,
      refreshRecipients,
    } = useLoanRecipients();

    // Use provided recipients or fetched ones
    const recipients = props.recipients || fetchedRecipients;

    const {
      formData,
      updateField,
      setFieldValue,
      resetForm,
      validation,
      loading,
      formProgress,
      submitForm,
      isFormValid,
    } = useLoanForm(props);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      resetForm,
      submitForm,
      validateForm: () => validation.isValid,
      setFieldValue,
    }));

    const styles = createStyles(colors);

    const handleClose = () => {
      resetForm();
      props.onClose();
    };

    const handleSubmit = async () => {
      await submitForm();
    };

    const getHeaderTitle = () => {
      if (props.title) return props.title;

      if (formData.loanType === "give") {
        return "Give Loan";
      } else if (formData.loanType === "take") {
        return "Take Loan";
      }

      return "Create Loan";
    };

    const renderHeader = () => {
      const headerStyle = props.headerStyle || "clean";

      if (headerStyle === "clean") {
        return (
          <View style={styles.cleanHeader}>
            <TouchableOpacity style={styles.headerButton} onPress={handleClose}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>

            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {getHeaderTitle()}
            </Text>

            <TouchableOpacity style={styles.headerButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        );
      }

      // Standard header
      return (
        <View style={styles.standardHeader}>
          <View style={styles.headerContent}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {getHeaderTitle()}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {props.enableProgress && (
            <View style={styles.progressContainer}>
              <Text
                style={[styles.progressText, { color: colors.textSecondary }]}
              >
                {Math.round(formProgress)}% complete
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${formProgress}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </View>
      );
    };

    const renderActionButtons = () => (
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: colors.border }]}
          onPress={handleClose}
          disabled={loading}
        >
          <Text
            style={[styles.cancelButtonText, { color: colors.textSecondary }]}
          >
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: colors.primary },
            (!isFormValid() || loading) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons
                name={
                  formData.loanType === "give"
                    ? "arrow-up-circle"
                    : "arrow-down-circle"
                }
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.submitButtonText}>
                {formData.loanType === "give" ? "Give Loan" : "Take Loan"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );

    if (!props.visible) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={props.visible}
        onRequestClose={handleClose}
        statusBarTranslucent={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: colors.background },
            ]}
          >
            {renderHeader()}

            <ScrollView
              style={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.formContainer}>
                {/* Loan Type Selection */}
                {props.showLoanTypeSelection !== false && (
                  <LoanTypeSelector
                    selectedType={formData.loanType}
                    onTypeChange={(type) => updateField("loanType", type)}
                    colors={colors}
                    style={styles.section}
                  />
                )}

                {/* Recipient Selection */}
                <RecipientSelector
                  loanType={formData.loanType}
                  recipientType={formData.recipientType}
                  selectedRecipient={formData.selectedRecipient}
                  recipients={recipients}
                  allowedTypes={props.allowedRecipientTypes}
                  onRecipientTypeChange={(type) =>
                    updateField("recipientType", type)
                  }
                  onRecipientSelect={(id) =>
                    updateField("selectedRecipient", id)
                  }
                  onAddNew={() => {
                    // Handle add new recipient
                  }}
                  colors={colors}
                  style={styles.section}
                />

                {/* Enhanced Form Fields */}
                <EnhancedLoanFormFields
                  formData={formData}
                  errors={validation.errors}
                  onFieldChange={updateField}
                  onFieldFocus={() => {}}
                  onFieldBlur={() => {}}
                  colors={colors}
                  style={styles.section}
                />
              </View>
            </ScrollView>

            {renderActionButtons()}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }
);

const createStyles = (colors: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
      flex: 1,
      marginTop: 0,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
    },
    cleanHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 50,
      paddingBottom: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + "50",
    },
    standardHeader: {
      paddingTop: 50,
      paddingBottom: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    headerButton: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 22,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      textAlign: "center",
      flex: 1,
      letterSpacing: -0.2,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      flex: 1,
    },
    progressContainer: {
      marginTop: 8,
    },
    progressText: {
      fontSize: 12,
      fontWeight: "500",
      marginBottom: 4,
    },
    progressBar: {
      height: 3,
      backgroundColor: colors.border,
      borderRadius: 2,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 2,
    },
    scrollContainer: {
      flex: 1,
    },
    formContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    section: {
      marginBottom: 24,
    },
    actionButtons: {
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingVertical: 16,
      paddingBottom: 32,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border + "30",
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: "600",
    },
    submitButton: {
      flex: 2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 8,
      gap: 8,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    submitButtonDisabled: {
      opacity: 0.5,
      elevation: 0,
    },
    submitButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.1,
    },
    loadingBanner: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: "rgba(16,185,129,0.1)",
      borderBottomWidth: 1,
      borderBottomColor: "rgba(16,185,129,0.2)",
      gap: 10,
    },
    loadingText: {
      fontSize: 13,
      fontWeight: "500",
    },
    errorBanner: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: "rgba(239,68,68,0.1)",
      borderBottomWidth: 1,
      borderBottomColor: "rgba(239,68,68,0.2)",
      gap: 10,
    },
    errorText: {
      flex: 1,
      fontSize: 13,
      fontWeight: "500",
    },
    retryButton: {
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    retryText: {
      fontSize: 13,
      fontWeight: "700",
      textDecorationLine: "underline",
    },
  });

LoanCreationModal.displayName = "LoanCreationModal";
