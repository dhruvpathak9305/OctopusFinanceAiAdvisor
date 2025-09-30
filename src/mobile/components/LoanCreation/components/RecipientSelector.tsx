/**
 * Reusable Recipient Selector Component
 * Handles Person, Group, Bank selection with recipient lists
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RecipientType, LoanRecipient, LoanType } from "../types";
import { RecipientTypeModal } from "./RecipientTypeModal";

interface RecipientSelectorProps {
  loanType: LoanType;
  recipientType: RecipientType;
  selectedRecipient: string;
  recipients: {
    persons: LoanRecipient[];
    groups: LoanRecipient[];
    banks: LoanRecipient[];
  };
  allowedTypes?: RecipientType[];
  onRecipientTypeChange: (type: RecipientType) => void;
  onRecipientSelect: (recipientId: string) => void;
  onAddNew?: () => void;
  colors: any;
  style?: any;
}

export const RecipientSelector: React.FC<RecipientSelectorProps> = ({
  loanType,
  recipientType,
  selectedRecipient,
  recipients,
  allowedTypes = ["person", "group", "bank"],
  onRecipientTypeChange,
  onRecipientSelect,
  onAddNew,
  colors,
  style,
}) => {
  const [showTypeModal, setShowTypeModal] = useState(false);
  const styles = createStyles(colors);

  const sectionTitle = loanType === "give" ? "Lend To" : "Borrow From";

  const getRecipientIcon = (type: RecipientType) => {
    switch (type) {
      case "person":
        return "person";
      case "group":
        return "people";
      case "bank":
        return "business";
      default:
        return "person";
    }
  };

  const getCurrentRecipients = () => {
    switch (recipientType) {
      case "person":
        return recipients.persons;
      case "group":
        return recipients.groups;
      case "bank":
        return recipients.banks;
      default:
        return [];
    }
  };

  const renderRecipientItem = (recipient: LoanRecipient) => {
    const isSelected = selectedRecipient === recipient.id;

    return (
      <TouchableOpacity
        key={recipient.id}
        style={[
          styles.recipientItem,
          isSelected && styles.selectedRecipientItem,
          { borderColor: isSelected ? "#10B981" : colors.border },
        ]}
        onPress={() => onRecipientSelect(recipient.id)}
        activeOpacity={0.7}
      >
        <View style={styles.recipientInfo}>
          <View
            style={[
              styles.recipientAvatar,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Text style={[styles.recipientInitial, { color: colors.primary }]}>
              {recipient.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.recipientDetails}>
            <Text style={[styles.recipientName, { color: colors.text }]}>
              {recipient.name}
            </Text>
            {recipient.email && (
              <Text
                style={[styles.recipientEmail, { color: colors.textSecondary }]}
              >
                {recipient.email}
              </Text>
            )}
            {recipient.balance !== undefined && (
              <Text
                style={[
                  styles.recipientBalance,
                  { color: recipient.balance >= 0 ? "#10B981" : "#EF4444" },
                ]}
              >
                {recipient.balance >= 0 ? "+" : ""}₹
                {Math.abs(recipient.balance).toLocaleString()}
              </Text>
            )}
          </View>
        </View>

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {sectionTitle}
      </Text>

      {/* Recipient Type Dropdown */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.dropdownButton,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => setShowTypeModal(true)}
        >
          <Ionicons
            name={getRecipientIcon(recipientType)}
            size={18}
            color={colors.primary}
            style={styles.dropdownIcon}
          />
          <Text style={[styles.dropdownText, { color: colors.text }]}>
            {recipientType.charAt(0).toUpperCase() + recipientType.slice(1)}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Add New Button */}
        {onAddNew && (
          <TouchableOpacity
            style={[
              styles.addNewButton,
              { borderColor: colors.primary + "30" },
            ]}
            onPress={onAddNew}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={16} color={colors.primary} />
            <Text style={[styles.addNewText, { color: colors.primary }]}>
              Add New
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Recipients List */}
      <ScrollView
        style={styles.recipientsList}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {getCurrentRecipients().length > 0 ? (
          getCurrentRecipients().map(renderRecipientItem)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name={getRecipientIcon(recipientType)}
              size={48}
              color={colors.textSecondary + "50"}
            />
            <Text
              style={[styles.emptyStateText, { color: colors.textSecondary }]}
            >
              No {recipientType}s found
            </Text>
            {onAddNew && (
              <TouchableOpacity
                style={[
                  styles.emptyStateButton,
                  { borderColor: colors.primary },
                ]}
                onPress={onAddNew}
              >
                <Text
                  style={[
                    styles.emptyStateButtonText,
                    { color: colors.primary },
                  ]}
                >
                  Add{" "}
                  {recipientType.charAt(0).toUpperCase() +
                    recipientType.slice(1)}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Recipient Type Modal */}
      <RecipientTypeModal
        visible={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        currentType={recipientType}
        onSelectType={onRecipientTypeChange}
        allowedTypes={allowedTypes}
        colors={colors}
      />
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 12,
      letterSpacing: -0.1,
    },
    tabsContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    dropdownButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      flex: 1,
      marginRight: 8,
    },
    dropdownIcon: {
      marginRight: 8,
    },
    dropdownText: {
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
    },
    recipientTypeTabs: {
      flexDirection: "row",
      flex: 1,
      gap: 8,
    },
    recipientTypeTab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderBottomWidth: 3,
      gap: 6,
    },
    activeRecipientTab: {
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    tabIcon: {
      marginRight: 4,
    },
    tabText: {
      fontSize: 13,
      fontWeight: "600",
    },
    addNewButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      backgroundColor: "rgba(16,185,129,0.05)",
      marginLeft: 8,
    },
    addNewText: {
      fontSize: 12,
      fontWeight: "600",
    },
    recipientsList: {
      maxHeight: 160,
    },
    recipientItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      marginBottom: 8,
      backgroundColor: "rgba(255,255,255,0.02)",
    },
    selectedRecipientItem: {
      backgroundColor: "rgba(16,185,129,0.1)",
      elevation: 2,
      shadowColor: "#10B981",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    recipientInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    recipientAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    recipientInitial: {
      fontSize: 16,
      fontWeight: "700",
    },
    recipientDetails: {
      flex: 1,
    },
    recipientName: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 2,
    },
    recipientEmail: {
      fontSize: 12,
      opacity: 0.8,
      marginBottom: 2,
    },
    recipientBalance: {
      fontSize: 11,
      fontWeight: "600",
    },
    selectedIndicator: {
      marginLeft: 8,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 32,
      paddingHorizontal: 16,
    },
    emptyStateText: {
      fontSize: 14,
      marginTop: 12,
      marginBottom: 16,
      textAlign: "center",
    },
    emptyStateButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
    },
    emptyStateButtonText: {
      fontSize: 12,
      fontWeight: "600",
    },
  });
