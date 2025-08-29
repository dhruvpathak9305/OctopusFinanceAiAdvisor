import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SelectFieldProps } from "../types";

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onPress,
  placeholder,
  required = false,
  error,
  showAddButton = false,
  onAddPress,
  colors,
  styles,
}) => {
  return (
    <View style={styles.fieldContainer}>
      <View style={styles.labelWithAction}>
        <Text style={[styles.fieldLabel, { color: colors.text }]}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        {showAddButton && onAddPress && (
          <TouchableOpacity
            onPress={onAddPress}
            style={[styles.addButton, { borderColor: colors.primary }]}
          >
            <Ionicons name="add" size={12} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={[
          styles.selectButton,
          {
            backgroundColor: colors.card,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
        onPress={onPress}
      >
        <Text
          style={[
            styles.selectText,
            { color: value ? colors.text : colors.textSecondary },
          ]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
      </TouchableOpacity>
      {error ? (
        <Text style={[styles.errorText, { color: colors.danger }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};
