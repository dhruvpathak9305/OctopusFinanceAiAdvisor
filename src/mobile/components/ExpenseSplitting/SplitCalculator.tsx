import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Group,
  GroupMember,
  SplitCalculation,
  SplitValidation,
  SPLIT_TYPES,
} from "../../../types/splitting";
import { ExpenseSplittingService } from "../../../../services/expenseSplittingService";

interface SplitCalculatorProps {
  totalAmount: number;
  selectedGroup?: Group;
  onSplitsChange: (
    splits: SplitCalculation[],
    validation: SplitValidation
  ) => void;
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    surface: string;
    error: string;
  };
}

const SplitCalculator: React.FC<SplitCalculatorProps> = ({
  totalAmount,
  selectedGroup,
  onSplitsChange,
  colors,
}) => {
  const [splitType, setSplitType] = useState<"equal" | "percentage" | "custom">(
    "equal"
  );
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [splits, setSplits] = useState<SplitCalculation[]>([]);
  const [loading, setLoading] = useState(false);

  // Load group members when group changes
  useEffect(() => {
    if (selectedGroup) {
      loadGroupMembers();
    } else {
      // For individual splitting, create a default split for current user
      const currentUserSplit: SplitCalculation = {
        user_id: "current_user", // This should be replaced with actual user ID
        user_name: "You",
        share_amount: totalAmount,
        share_percentage: 100,
        is_paid: false,
      };
      setSplits([currentUserSplit]);
      calculateSplits([currentUserSplit]);
    }
  }, [selectedGroup]);

  // Recalculate splits when amount or type changes
  useEffect(() => {
    if (groupMembers.length > 0) {
      recalculateSplits();
    }
  }, [totalAmount, splitType, groupMembers]);

  const loadGroupMembers = async () => {
    if (!selectedGroup) return;

    try {
      setLoading(true);
      const members = await ExpenseSplittingService.getGroupMembers(
        selectedGroup.id
      );
      setGroupMembers(members);

      // Create initial equal splits
      const participants = members.map((member) => ({
        user_id: member.user_id,
        user_name: member.user_name || member.user_email || "Unknown",
      }));

      const initialSplits = ExpenseSplittingService.calculateEqualSplits(
        totalAmount,
        participants
      );

      setSplits(initialSplits);
      calculateSplits(initialSplits);
    } catch (error) {
      console.error("Failed to load group members:", error);
      Alert.alert("Error", "Failed to load group members");
    } finally {
      setLoading(false);
    }
  };

  const recalculateSplits = () => {
    if (groupMembers.length === 0) return;

    const participants = groupMembers.map((member) => ({
      user_id: member.user_id,
      user_name: member.user_name || member.user_email || "Unknown",
    }));

    let newSplits: SplitCalculation[];

    switch (splitType) {
      case "equal":
        newSplits = ExpenseSplittingService.calculateEqualSplits(
          totalAmount,
          participants
        );
        break;
      case "percentage":
        // Keep existing percentages or default to equal
        newSplits =
          splits.length > 0
            ? ExpenseSplittingService.calculatePercentageSplits(
                totalAmount,
                splits.map((split) => ({
                  user_id: split.user_id,
                  user_name: split.user_name,
                  percentage: split.share_percentage,
                }))
              )
            : ExpenseSplittingService.calculateEqualSplits(
                totalAmount,
                participants
              );
        break;
      case "custom":
        // Keep existing custom amounts or default to equal
        newSplits =
          splits.length > 0
            ? splits
            : ExpenseSplittingService.calculateEqualSplits(
                totalAmount,
                participants
              );
        break;
      default:
        newSplits = ExpenseSplittingService.calculateEqualSplits(
          totalAmount,
          participants
        );
    }

    setSplits(newSplits);
    calculateSplits(newSplits);
  };

  const calculateSplits = (currentSplits: SplitCalculation[]) => {
    const validation = ExpenseSplittingService.validateSplits(
      totalAmount,
      currentSplits
    );
    onSplitsChange(currentSplits, validation);
  };

  const updateSplitAmount = (userId: string, amount: number) => {
    const updatedSplits = splits.map((split) =>
      split.user_id === userId
        ? {
            ...split,
            share_amount: amount,
            share_percentage: (amount / totalAmount) * 100,
          }
        : split
    );
    setSplits(updatedSplits);
    calculateSplits(updatedSplits);
  };

  const updateSplitPercentage = (userId: string, percentage: number) => {
    const updatedSplits = splits.map((split) =>
      split.user_id === userId
        ? {
            ...split,
            share_percentage: percentage,
            share_amount: (totalAmount * percentage) / 100,
          }
        : split
    );
    setSplits(updatedSplits);
    calculateSplits(updatedSplits);
  };

  if (!selectedGroup) {
    return (
      <View style={styles.noGroupContainer}>
        <Text style={[styles.noGroupText, { color: colors.textSecondary }]}>
          Select a group to split this expense
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Split Type Selector */}
      <View style={styles.splitTypeContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Split Type
        </Text>
        <View style={styles.splitTypeButtons}>
          {[
            { key: "equal", label: "Equal", icon: "people" },
            { key: "percentage", label: "%", icon: "pie-chart" },
            { key: "custom", label: "Custom", icon: "calculator" },
          ].map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.splitTypeButton,
                {
                  backgroundColor:
                    splitType === type.key ? colors.primary : colors.card,
                  borderColor:
                    splitType === type.key ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSplitType(type.key as any)}
            >
              <Ionicons
                name={type.icon as any}
                size={16}
                color={splitType === type.key ? "white" : colors.textSecondary}
              />
              <Text
                style={[
                  styles.splitTypeText,
                  {
                    color: splitType === type.key ? "white" : colors.text,
                  },
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Participants List */}
      <View style={styles.participantsContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Participants ({splits.length})
        </Text>

        <ScrollView
          style={styles.participantsList}
          showsVerticalScrollIndicator={false}
        >
          {splits.map((split) => (
            <View
              key={split.user_id}
              style={[
                styles.participantItem,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.participantInfo}>
                <Ionicons
                  name="person-circle"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.participantName, { color: colors.text }]}>
                  {split.user_name}
                </Text>
              </View>

              <View style={styles.participantInputs}>
                {splitType === "percentage" && (
                  <View style={styles.inputGroup}>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: colors.text,
                          borderColor: colors.border,
                        },
                      ]}
                      value={split.share_percentage.toFixed(1)}
                      onChangeText={(text) => {
                        const percentage = parseFloat(text) || 0;
                        updateSplitPercentage(split.user_id, percentage);
                      }}
                      keyboardType="numeric"
                      placeholder="0.0"
                      placeholderTextColor={colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.inputSuffix,
                        { color: colors.textSecondary },
                      ]}
                    >
                      %
                    </Text>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text
                    style={[
                      styles.currencySymbol,
                      { color: colors.textSecondary },
                    ]}
                  >
                    ₹
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={split.share_amount.toFixed(2)}
                    onChangeText={(text) => {
                      if (splitType === "custom") {
                        const amount = parseFloat(text) || 0;
                        updateSplitAmount(split.user_id, amount);
                      }
                    }}
                    keyboardType="numeric"
                    editable={splitType === "custom"}
                    placeholder="0.00"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Split Summary */}
      <View
        style={[
          styles.summaryContainer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Total Amount:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            ₹{totalAmount.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Split Total:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            ₹
            {splits
              .reduce((sum, split) => sum + split.share_amount, 0)
              .toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Per Person:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            ₹
            {splits.length > 0
              ? (totalAmount / splits.length).toFixed(2)
              : "0.00"}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  noGroupContainer: {
    padding: 20,
    alignItems: "center",
  },
  noGroupText: {
    fontSize: 16,
    textAlign: "center",
  },
  splitTypeContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  splitTypeButtons: {
    flexDirection: "row",
    gap: 8,
  },
  splitTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  splitTypeText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  participantsContainer: {
    marginBottom: 16,
  },
  participantsList: {
    maxHeight: 200,
  },
  participantItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  participantInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  participantInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    minWidth: 60,
    textAlign: "right",
  },
  inputSuffix: {
    fontSize: 14,
    marginLeft: 4,
  },
  currencySymbol: {
    fontSize: 14,
    marginRight: 4,
  },
  summaryContainer: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default SplitCalculator;
