import React from "react";
import { View, Text, TextInput } from "react-native";
import { FormFieldProps } from "../types";

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  required = false,
  error,
  keyboardType = "default",
  maxLength,
  multiline = false,
  colors,
  styles,
}) => {
  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[
          styles.textInput,
          {
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: error ? colors.danger : colors.border,
          },
          multiline && { minHeight: 80, textAlignVertical: "top" },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
      />
      {error ? (
        <Text style={[styles.errorText, { color: colors.danger }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};
