import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  SplitToggle,
  GroupSelector,
  SplitCalculator,
  SplitValidation,
  IndividualSplitting,
} from "./index";
import {
  Group,
  SplitCalculation,
  SplitValidation as SplitValidationType,
} from "../../../types/splitting";

interface ExpenseSplittingInterfaceProps {
  transactionAmount: number;
  onSplitChange: (
    isEnabled: boolean,
    splits?: SplitCalculation[],
    group?: Group
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
  isDark?: boolean;
  disabled?: boolean;
  // Initial split state for edit mode
  initialSplitEnabled?: boolean;
  initialSplits?: SplitCalculation[];
  initialGroup?: Group;
}

const ExpenseSplittingInterface: React.FC<ExpenseSplittingInterfaceProps> = ({
  transactionAmount,
  onSplitChange,
  colors,
  isDark = false,
  disabled = false,
  initialSplitEnabled = false,
  initialSplits = [],
  initialGroup = null,
}) => {
  const [isSplitEnabled, setIsSplitEnabled] = useState(initialSplitEnabled);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(initialGroup);
  const [splits, setSplits] = useState<SplitCalculation[]>(initialSplits);
  const [individualPeople, setIndividualPeople] = useState<any[]>([]);
  const [splitMode, setSplitMode] = useState<"group" | "individual">("group");
  const [validation, setValidation] = useState<SplitValidationType>({
    is_valid: true,
    total_shares: 0,
    expected_total: transactionAmount,
    difference: 0,
    errors: [],
    warnings: [],
  });

  // Track initialization state
  const hasInitialized = React.useRef(false);
  const isInitializing = React.useRef(false);
  
  // Update state when initial props change (for edit mode) - run only once
  useEffect(() => {
    console.log("🔄 ExpenseSplittingInterface - Init useEffect called:", {
      hasInitialized: hasInitialized.current,
      initialSplitEnabled,
      initialSplitsCount: initialSplits?.length,
      initialGroupName: initialGroup?.name,
      initialGroupId: initialGroup?.id,
    });

    // Only initialize once when component mounts with initial data
    if (hasInitialized.current) {
      console.log("⏭️ Already initialized, skipping...");
      return;
    }

    // Wait for ALL data to be ready before initializing
    if (initialSplitEnabled && initialSplits && initialSplits.length > 0 && initialGroup) {
      console.log("✅ All initial data ready! Initializing...");
      console.log("📥 ExpenseSplittingInterface - Setting initial split state:", {
        initialSplitEnabled,
        initialSplitsCount: initialSplits?.length,
        initialGroupName: initialGroup?.name,
        initialGroupId: initialGroup?.id,
      });
      
      isInitializing.current = true; // Mark as initializing
      hasInitialized.current = true;
      
      setIsSplitEnabled(initialSplitEnabled);
      setSplits(initialSplits);
      setSelectedGroup(initialGroup); // Always set the group
      setSplitMode("group");
      
      console.log("🎯 State updates queued - group, splits, enabled");
      
      // Reset initializing flag after state updates
      setTimeout(() => {
        isInitializing.current = false;
        console.log("🏁 Initialization complete!");
      }, 0);
    } else {
      console.log("⏳ Waiting for all initial data...", {
        needsEnabled: !initialSplitEnabled,
        needsSplits: !initialSplits || initialSplits.length === 0,
        needsGroup: !initialGroup,
      });
    }
  }, [initialSplitEnabled, initialSplits, initialGroup]);

  // Handle individual people updates
  const handleIndividualPeopleUpdate = (people: any[]) => {
    setIndividualPeople(people);
    if (people.length > 0) {
      const individualSplits = people.map((person) => ({
        user_id: person.id,
        user_name: person.name,
        share_amount: person.share_amount,
        share_percentage: person.share_percentage,
        is_paid: false,
      }));
      setSplits(individualSplits);
      setSelectedGroup(null);
      setSplitMode("individual");
    } else {
      setSplits([]);
    }
  };

  // Update parent when split state changes (but not during initialization)
  useEffect(() => {
    // Skip notifying parent during initialization to prevent infinite loop
    if (isInitializing.current) {
      return;
    }
    onSplitChange(isSplitEnabled, splits, selectedGroup || undefined);
  }, [isSplitEnabled, splits, selectedGroup, onSplitChange]);

  // Reset validation when amount changes
  useEffect(() => {
    if (splits.length > 0) {
      // Recalculate splits for new amount
      const updatedSplits = splits.map((split) => ({
        ...split,
        share_amount: (transactionAmount * split.share_percentage) / 100,
      }));
      setSplits(updatedSplits);
    }
  }, [transactionAmount]);

  const handleSplitToggle = (enabled: boolean) => {
    console.log("Split toggle changed:", enabled);
    setIsSplitEnabled(enabled);

    if (!enabled) {
      // Reset everything when disabled
      setSelectedGroup(null);
      setSplits([]);
      setValidation({
        is_valid: true,
        total_shares: 0,
        expected_total: transactionAmount,
        difference: 0,
        errors: [],
        warnings: [],
      });
    }
  };

  const handleGroupSelect = (group: Group | null) => {
    setSelectedGroup(group);
    // Splits will be calculated by SplitCalculator when group changes
  };

  const handleSplitsChange = (
    newSplits: SplitCalculation[],
    newValidation: SplitValidationType
  ) => {
    setSplits(newSplits);
    setValidation(newValidation);
  };

  console.log(
    "ExpenseSplittingInterface render - isSplitEnabled:",
    isSplitEnabled
  );
  console.log(
    "ExpenseSplittingInterface render - transactionAmount:",
    transactionAmount
  );
  console.log("ExpenseSplittingInterface render - disabled:", disabled);

  if (!isSplitEnabled) {
    console.log("Rendering only toggle (disabled state)");
    return (
      <SplitToggle
        isEnabled={false}
        onToggle={handleSplitToggle}
        colors={colors}
        disabled={disabled}
      />
    );
  }

  console.log("Rendering full splitting interface - enabled state");
  console.log("🔍 UI DEBUG:", {
    splitMode,
    hasSelectedGroup: !!selectedGroup,
    selectedGroupName: selectedGroup?.name,
    splitsCount: splits.length,
    splits: splits,
  });
  
  return (
    <View style={styles.container}>
      {console.log("Full interface container rendered") || null}
      {/* Split Toggle */}
      <SplitToggle
        isEnabled={true}
        onToggle={handleSplitToggle}
        colors={colors}
        disabled={disabled}
      />

      {/* Split Mode Selector */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Split Mode
        </Text>
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              {
                backgroundColor:
                  splitMode === "group" ? colors.primary : colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => {
              setSplitMode("group");
              setIndividualPeople([]);
              setSplits([]);
            }}
          >
            <Ionicons
              name="people"
              size={16}
              color={splitMode === "group" ? "white" : colors.text}
            />
            <Text
              style={[
                styles.modeButtonText,
                {
                  color: splitMode === "group" ? "white" : colors.text,
                },
              ]}
            >
              Group
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              {
                backgroundColor:
                  splitMode === "individual" ? colors.primary : colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => {
              setSplitMode("individual");
              setSelectedGroup(null);
              setSplits([]);
            }}
          >
            <Ionicons
              name="person-add"
              size={16}
              color={splitMode === "individual" ? "white" : colors.text}
            />
            <Text
              style={[
                styles.modeButtonText,
                {
                  color: splitMode === "individual" ? "white" : colors.text,
                },
              ]}
            >
              Individuals
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {splitMode === "group" ? (
        <>
          {/* Group Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Choose Group
            </Text>
            <GroupSelector
              selectedGroup={selectedGroup || undefined}
              onSelectGroup={handleGroupSelect}
              colors={colors}
              isDark={isDark}
            />
          </View>

          {/* Split Calculator */}
          {selectedGroup && (
            <View style={styles.section}>
              <SplitCalculator
                totalAmount={transactionAmount}
                selectedGroup={selectedGroup}
                onSplitsChange={handleSplitsChange}
                colors={colors}
                initialSplits={splits.length > 0 ? splits : undefined}
              />
            </View>
          )}
        </>
      ) : (
        /* Individual Splitting */
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Choose Individual
          </Text>
          <IndividualSplitting
            totalAmount={transactionAmount}
            onPeopleUpdate={handleIndividualPeopleUpdate}
            colors={colors}
            isDark={isDark}
          />
        </View>
      )}

      {/* Validation - Only show for group splitting */}
      {splitMode === "group" && splits.length > 0 && (
        <SplitValidation validation={validation} colors={colors} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  modeSelector: {
    flexDirection: "row",
    gap: 8,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ExpenseSplittingInterface;
