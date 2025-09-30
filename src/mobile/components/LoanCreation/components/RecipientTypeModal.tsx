/**
 * Recipient Type Selection Modal
 * Modal to select between Person, Group, or Bank
 */

import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RecipientType } from "../types";

interface RecipientTypeModalProps {
  visible: boolean;
  onClose: () => void;
  currentType: RecipientType;
  onSelectType: (type: RecipientType) => void;
  allowedTypes?: RecipientType[];
  colors: any;
}

const RECIPIENT_TYPE_OPTIONS: {
  type: RecipientType;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    type: "person",
    label: "Person",
    icon: "person",
    description: "Borrow from or lend to an individual",
  },
  {
    type: "group",
    label: "Group",
    icon: "people",
    description: "Split loan with multiple people",
  },
  {
    type: "bank",
    label: "Bank/Institution",
    icon: "business",
    description: "Borrow from or manage bank loans",
  },
];

export const RecipientTypeModal: React.FC<RecipientTypeModalProps> = ({
  visible,
  onClose,
  currentType,
  onSelectType,
  allowedTypes = ["person", "group", "bank"],
  colors,
}) => {
  const styles = createStyles(colors);

  const handleSelect = (type: RecipientType) => {
    onSelectType(type);
    onClose();
  };

  const filteredOptions = RECIPIENT_TYPE_OPTIONS.filter((option) =>
    allowedTypes.includes(option.type)
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>
              Select Recipient Type
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {filteredOptions.map((option) => {
              const isSelected = currentType === option.type;
              return (
                <TouchableOpacity
                  key={option.type}
                  style={[
                    styles.optionItem,
                    isSelected && styles.optionItemSelected,
                    {
                      backgroundColor: isSelected
                        ? colors.primary + "15"
                        : colors.background,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => handleSelect(option.type)}
                >
                  <View style={styles.optionLeft}>
                    <View
                      style={[
                        styles.iconContainer,
                        {
                          backgroundColor: isSelected
                            ? colors.primary + "20"
                            : colors.card,
                        },
                      ]}
                    >
                      <Ionicons
                        name={option.icon as any}
                        size={24}
                        color={
                          isSelected ? colors.primary : colors.textSecondary
                        }
                      />
                    </View>
                    <View style={styles.optionText}>
                      <Text
                        style={[
                          styles.optionLabel,
                          {
                            color: isSelected ? colors.primary : colors.text,
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                      <Text
                        style={[
                          styles.optionDescription,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {option.description}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    modalContent: {
      width: "100%",
      maxWidth: 400,
      borderRadius: 16,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      flex: 1,
    },
    closeButton: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    optionsContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 12,
    },
    optionItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      borderRadius: 12,
      borderWidth: 1.5,
    },
    optionItemSelected: {
      elevation: 2,
      shadowColor: "#10B981",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    optionLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: 12,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    optionText: {
      flex: 1,
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 4,
    },
    optionDescription: {
      fontSize: 12,
      lineHeight: 16,
    },
  });
