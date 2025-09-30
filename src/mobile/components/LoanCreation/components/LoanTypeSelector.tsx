/**
 * Reusable Loan Type Selector Component
 * Handles the Give Loan / Take Loan selection with slim modern design
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../../../contexts/ThemeContext";
import { LoanType } from "../types";

interface LoanTypeSelectorProps {
  selectedType: LoanType;
  onTypeChange: (type: LoanType) => void;
  colors: any;
  style?: any;
}

export const LoanTypeSelector: React.FC<LoanTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
  colors,
  style,
}) => {
  const { isDark } = useTheme();

  const styles = createStyles(colors, isDark);

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Loan Type
      </Text>

      <View style={styles.loanTypeCards}>
        {/* Take Loan Card */}
        <TouchableOpacity
          style={[
            styles.loanTypeCard,
            {
              backgroundColor:
                selectedType === "take" ? "#F59E0B" : colors.card,
              borderColor:
                selectedType === "take" ? "#F59E0B" : "rgba(245,158,11,0.3)",
              shadowColor: selectedType === "take" ? "#F59E0B" : "#000",
              shadowOpacity: selectedType === "take" ? 0.3 : 0.15,
            },
          ]}
          onPress={() => onTypeChange("take")}
          activeOpacity={0.8}
        >
          <View style={styles.slimLoanContent}>
            <View style={styles.slimIconContainer}>
              <Ionicons
                name="arrow-down-circle-outline"
                size={20}
                color={selectedType === "take" ? "#FFFFFF" : "#F59E0B"}
              />
            </View>
            <View style={styles.slimTextContainer}>
              <Text
                style={[
                  styles.slimLoanTitle,
                  {
                    color: selectedType === "take" ? "#FFFFFF" : colors.text,
                  },
                ]}
              >
                Take Loan
              </Text>
              <Text
                style={[
                  styles.slimLoanDescription,
                  {
                    color:
                      selectedType === "take"
                        ? "rgba(255,255,255,0.7)"
                        : colors.textSecondary,
                  },
                ]}
              >
                Borrow money
              </Text>
            </View>
            {selectedType === "take" && (
              <View style={styles.slimSelectedIndicator}>
                <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Give Loan Card */}
        <TouchableOpacity
          style={[
            styles.loanTypeCard,
            {
              backgroundColor:
                selectedType === "give" ? "#10B981" : colors.card,
              borderColor:
                selectedType === "give" ? "#10B981" : "rgba(16,185,129,0.3)",
              shadowColor: selectedType === "give" ? "#10B981" : "#000",
              shadowOpacity: selectedType === "give" ? 0.3 : 0.15,
            },
          ]}
          onPress={() => onTypeChange("give")}
          activeOpacity={0.8}
        >
          <View style={styles.slimLoanContent}>
            <View style={styles.slimIconContainer}>
              <Ionicons
                name="arrow-up-circle-outline"
                size={20}
                color={selectedType === "give" ? "#FFFFFF" : "#10B981"}
              />
            </View>
            <View style={styles.slimTextContainer}>
              <Text
                style={[
                  styles.slimLoanTitle,
                  {
                    color: selectedType === "give" ? "#FFFFFF" : colors.text,
                  },
                ]}
              >
                Give Loan
              </Text>
              <Text
                style={[
                  styles.slimLoanDescription,
                  {
                    color:
                      selectedType === "give"
                        ? "rgba(255,255,255,0.7)"
                        : colors.textSecondary,
                  },
                ]}
              >
                Lend money
              </Text>
            </View>
            {selectedType === "give" && (
              <View style={styles.slimSelectedIndicator}>
                <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (colors: any, isDark: boolean) =>
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
    loanTypeCards: {
      flexDirection: "row",
      gap: 12,
    },
    loanTypeCard: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: "center",
      minHeight: 60,
      justifyContent: "center",
      backgroundColor: "#1F2937",
      elevation: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    slimLoanContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    slimIconContainer: {
      marginRight: 12,
      padding: 4,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.1)",
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    slimTextContainer: {
      flex: 1,
      alignItems: "flex-start",
    },
    slimLoanTitle: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 2,
      letterSpacing: -0.1,
    },
    slimLoanDescription: {
      fontSize: 10,
      fontWeight: "500",
      opacity: 0.7,
      lineHeight: 12,
    },
    slimSelectedIndicator: {
      marginLeft: 8,
      padding: 2,
      borderRadius: 12,
      backgroundColor: "rgba(255,255,255,0.2)",
    },
  });
