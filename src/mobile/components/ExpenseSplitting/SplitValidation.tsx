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
  if (validation.is_valid && validation.warnings.length === 0) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${colors.primary}15` },
          ]}
        >
          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[styles.iconContainer, { backgroundColor: `${colors.error}15` }]}
      >
        <Ionicons name="close-circle" size={20} color={colors.error} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SplitValidation;
