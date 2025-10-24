import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity, Animated, LayoutAnimation, Platform, UIManager } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
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
  
  // Collapsible state
  const [isExpanded, setIsExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

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
      setIsExpanded(true); // Auto-expand when editing
      
      // Animate chevron to expanded state
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 0,
        useNativeDriver: true,
      }).start();
      
      console.log("🎯 State updates queued - group, splits, enabled, expanded");
      
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

  // Toggle expansion with animation
  const toggleExpansion = () => {
    if (!isSplitEnabled) return; // Don't allow expansion if split is disabled
    
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    // Animate the chevron rotation
    Animated.timing(rotateAnim, {
      toValue: newExpandedState ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleSplitToggle = (enabled: boolean) => {
    console.log("Split toggle changed:", enabled);
    setIsSplitEnabled(enabled);

    if (!enabled) {
      // Reset everything when disabled
      setSelectedGroup(null);
      setSplits([]);
      setIsExpanded(false);
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }).start();
      setValidation({
        is_valid: true,
        total_shares: 0,
        expected_total: transactionAmount,
        difference: 0,
        errors: [],
        warnings: [],
      });
    } else {
      // Auto-expand when enabled
      setIsExpanded(true);
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
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

  // Calculate summary info
  const participantCount = splits.length;
  const averageAmount = participantCount > 0 ? transactionAmount / participantCount : 0;
  
  // Get chevron rotation interpolation
  const chevronRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  
  return (
    <View style={styles.container}>
      {/* Beautiful Collapsible Split Card */}
      <LinearGradient
        colors={
          isDark
            ? ['rgba(16, 185, 129, 0.15)', 'rgba(20, 184, 166, 0.12)']
            : ['rgba(16, 185, 129, 0.08)', 'rgba(20, 184, 166, 0.05)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.splitCard,
          {
            borderColor: isDark
              ? 'rgba(16, 185, 129, 0.3)'
              : 'rgba(16, 185, 129, 0.25)',
          },
        ]}
      >
        {/* Collapsible Header */}
        <TouchableOpacity
          onPress={toggleExpansion}
          activeOpacity={0.7}
          style={styles.headerTouchable}
          disabled={!isSplitEnabled}
        >
          <View style={styles.headerContent}>
            {/* Icon Container */}
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: isDark
                    ? 'rgba(16, 185, 129, 0.25)'
                    : 'rgba(16, 185, 129, 0.2)',
                },
              ]}
            >
              <Ionicons name="people" size={22} color="#10B981" />
            </View>

            {/* Title & Summary */}
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Split Expense
              </Text>
              <Text
                style={[styles.headerSubtitle, { color: colors.textSecondary }]}
              >
                {isSplitEnabled
                  ? participantCount > 0
                    ? `Dividing among ${participantCount} ${participantCount === 1 ? 'person' : 'people'}`
                    : 'Configure split settings'
                  : 'Tap to enable splitting'}
              </Text>
            </View>

            {/* Toggle Switch & Chevron */}
            <View style={styles.headerRight}>
              <View style={styles.switchContainer}>
                <TouchableOpacity
                  onPress={() => handleSplitToggle(!isSplitEnabled)}
                  activeOpacity={0.8}
                  disabled={disabled}
                  style={[
                    styles.switchTrack,
                    {
                      backgroundColor: isSplitEnabled
                        ? '#10B981'
                        : isDark
                        ? '#374151'
                        : '#D1D5DB',
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.switchThumb,
                      {
                        transform: [
                          {
                            translateX: isSplitEnabled ? 20 : 0,
                          },
                        ],
                      },
                    ]}
                  />
                </TouchableOpacity>
              </View>
              
              {isSplitEnabled && (
                <Animated.View
                  style={{ transform: [{ rotate: chevronRotation }] }}
                >
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color="#10B981"
                  />
                </Animated.View>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Expandable Content */}
        {isSplitEnabled && isExpanded && (
          <View style={[styles.expandedContent, { borderTopColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)' }]}>
            {/* Split Mode Selector */}
            <View style={styles.section}>
              <Text
                style={[styles.sectionLabel, { color: colors.text }]}
              >
                Split Mode
              </Text>
              <View style={styles.modeSelector}>
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    splitMode === "group" && styles.modeButtonActive,
                    {
                      backgroundColor:
                        splitMode === "group"
                          ? '#10B981'
                          : isDark
                          ? '#374151'
                          : '#F3F4F6',
                      borderColor:
                        splitMode === "group"
                          ? '#10B981'
                          : 'transparent',
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
                    size={18}
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
                    splitMode === "individual" && styles.modeButtonActive,
                    {
                      backgroundColor:
                        splitMode === "individual"
                          ? '#10B981'
                          : isDark
                          ? '#374151'
                          : '#F3F4F6',
                      borderColor:
                        splitMode === "individual"
                          ? '#10B981'
                          : 'transparent',
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
                    size={18}
                    color={splitMode === "individual" ? "white" : colors.text}
                  />
                  <Text
                    style={[
                      styles.modeButtonText,
                      {
                        color:
                          splitMode === "individual" ? "white" : colors.text,
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
                  <Text
                    style={[styles.sectionLabel, { color: colors.text }]}
                  >
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
                <Text
                  style={[styles.sectionLabel, { color: colors.text }]}
                >
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
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  splitCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTouchable: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchContainer: {
    justifyContent: 'center',
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  expandedContent: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  modeSelector: {
    flexDirection: "row",
    gap: 10,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  modeButtonActive: {
    shadowColor: '#10B981',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  modeButtonText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});

export default ExpenseSplittingInterface;
