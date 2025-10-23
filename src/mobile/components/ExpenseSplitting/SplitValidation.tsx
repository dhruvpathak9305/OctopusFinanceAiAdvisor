import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SplitValidation as SplitValidationType } from "../../../types/splitting";

interface SplitValidationProps {
  validation: SplitValidationType;
  colors: {
    text: string;
    textSecondary: string;
    primary: string;
    error: string;
    surface: string;
  };
}

const SplitValidation: React.FC<SplitValidationProps> = ({
  validation,
  colors,
}) => {
  // Only show validation indicator if there are errors or warnings
  // Don't show the checkmark when everything is valid - it looks cleaner
  if (validation.is_valid && validation.warnings.length === 0) {
    return null; // Hide validation icon when everything is valid
  }

  // Show error indicator only if there are actual errors
  if (!validation.is_valid && validation.errors.length > 0) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${colors.error}15` },
          ]}
        >
          <Ionicons name="close-circle" size={20} color={colors.error} />
        </View>
        <Text style={[styles.errorText, { color: colors.error }]}>
          {validation.errors[0]}
        </Text>
      </View>
    );
  }

  // Show warning indicator if there are warnings
  if (validation.warnings.length > 0) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${colors.textSecondary}15` },
          ]}
        >
          <Ionicons
            name="alert-circle"
            size={20}
            color={colors.textSecondary}
          />
        </View>
        <Text style={[styles.warningText, { color: colors.textSecondary }]}>
          {validation.warnings[0]}
        </Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  warningText: {
    fontSize: 14,
    flex: 1,
    fontStyle: "italic",
  },
});

export default SplitValidation;
