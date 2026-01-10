import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme as useNavTheme } from "@react-navigation/native";
import {
  useTheme,
  darkTheme,
  lightTheme,
} from "../../../../contexts/ThemeContext";
import { FinancialRelationshipService } from "../../../../services/financialRelationshipService";
import { LoanManagementService } from "../../../../services/loanManagementService";
import { UserFinancialSummary } from "../../../../types/financial-relationships";
import FinancialDashboardSkeleton from "./FinancialDashboardSkeleton";

interface FinancialDashboardProps {
  userId: string;
  onCreateLoan?: () => void;
  onRequestPayment?: () => void;
  onViewRelationships?: () => void;
}

interface RecentActivity {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: "payment" | "loan" | "split";
  relatedUserId: string;
  relatedUserName?: string;
}

interface UpcomingPayment {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  daysRemaining: number;
  type: "incoming" | "outgoing";
  relatedUserId: string;
  relatedUserName?: string;
}

// Animated Activity Item Component
const AnimatedActivityItem: React.FC<{
  activity: RecentActivity;
  index: number;
  colors: any;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}> = ({ activity, index, colors, formatCurrency, formatDate }) => {
  const itemAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(itemAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 100,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: itemAnim,
        transform: [
          {
            translateX: itemAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0],
            }),
          },
          {
            scale: itemAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        style={[
          styles.activityItem,
          { 
            backgroundColor: colors.cardHighlight,
            borderWidth: colors.isDark ? 0 : 1,
            borderColor: colors.borderLight,
          },
        ]}
        onPress={() => console.log(`View activity details: ${activity.id}`)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.activityIconContainer,
            {
              backgroundColor:
                activity.type === "payment"
                  ? colors.isDark
                    ? "rgba(16,185,129,0.2)"
                    : "rgba(16,185,129,0.15)"
                  : activity.type === "loan"
                  ? colors.isDark
                    ? "rgba(239,68,68,0.2)"
                    : "rgba(239,68,68,0.15)"
                  : colors.isDark
                  ? "rgba(59,130,246,0.2)"
                  : "rgba(59,130,246,0.15)",
            },
          ]}
        >
          <Ionicons
            name={
              activity.type === "payment"
                ? "cash-outline"
                : activity.type === "loan"
                ? "wallet-outline"
                : "people-outline"
            }
            size={24}
            color={
              activity.type === "payment"
                ? "#10B981"
                : activity.type === "loan"
                ? "#EF4444"
                : "#3B82F6"
            }
          />
        </View>
        <View style={styles.activityContent}>
          <View style={styles.activityHeader}>
            <Text
              style={[
                styles.activityDescription,
                { color: colors.text },
              ]}
            >
              {activity.type === "payment"
                ? `${activity.relatedUserName} paid you`
                : activity.type === "loan"
                ? `You loaned to ${activity.relatedUserName}`
                : `Split with ${activity.relatedUserName}`}
            </Text>
            <Text
              style={[
                styles.activityAmount,
                {
                  color:
                    activity.type === "loan"
                      ? "#EF4444"
                      : colors.success,
                  fontWeight: "600",
                },
              ]}
            >
              {formatCurrency(activity.amount)}
            </Text>
          </View>
          <View style={styles.activitySubheader}>
            <Text
              style={[
                styles.activityDate,
                { color: colors.textSecondary },
              ]}
            >
              {formatDate(activity.date)}
            </Text>
            <TouchableOpacity>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Animated Upcoming Item Component
const AnimatedUpcomingItem: React.FC<{
  payment: UpcomingPayment;
  index: number;
  colors: any;
  formatCurrency: (amount: number) => string;
  formatDaysRemaining: (days: number) => string;
}> = ({ payment, index, colors, formatCurrency, formatDaysRemaining }) => {
  const itemAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(itemAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 100,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: itemAnim,
        transform: [
          {
            translateX: itemAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0],
            }),
          },
          {
            scale: itemAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        style={[
          styles.upcomingItem,
          { 
            backgroundColor: colors.cardHighlight,
            borderWidth: colors.isDark ? 0 : 1,
            borderColor: colors.borderLight,
          },
        ]}
        onPress={() => console.log(`View payment details: ${payment.id}`)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.upcomingIconContainer,
            {
              backgroundColor:
                payment.type === "incoming"
                  ? colors.isDark
                    ? "rgba(16,185,129,0.2)"
                    : "rgba(16,185,129,0.15)"
                  : colors.isDark
                  ? "rgba(239,68,68,0.2)"
                  : "rgba(239,68,68,0.15)",
            },
          ]}
        >
          <Ionicons
            name={
              payment.type === "incoming"
                ? "arrow-down-outline"
                : "arrow-up-outline"
            }
            size={24}
            color={payment.type === "incoming" ? "#10B981" : "#EF4444"}
          />
        </View>

        <View style={styles.upcomingContent}>
          <View style={styles.upcomingHeader}>
            <View>
              <Text
                style={[styles.upcomingTitle, { color: colors.text }]}
              >
                {payment.type === "incoming"
                  ? `${payment.relatedUserName}'s payment due`
                  : `Your payment to ${payment.relatedUserName}`}
              </Text>
              <Text
                style={[
                  styles.upcomingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {payment.description}
              </Text>
            </View>
            <Text
              style={[
                styles.upcomingAmount,
                {
                  color:
                    payment.type === "incoming" ? "#10B981" : "#EF4444",
                  fontWeight: "600",
                },
              ]}
            >
              {formatCurrency(payment.amount)}
            </Text>
          </View>

          <View style={styles.upcomingFooter}>
            <View style={styles.upcomingDateContainer}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={
                  payment.daysRemaining <= 1
                    ? "#EF4444"
                    : colors.textSecondary
                }
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.upcomingDate,
                  {
                    color:
                      payment.daysRemaining <= 1
                        ? "#EF4444"
                        : colors.textSecondary,
                    fontWeight:
                      payment.daysRemaining <= 1 ? "600" : "400",
                  },
                ]}
              >
                {formatDaysRemaining(payment.daysRemaining)}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.upcomingActionButton,
                {
                  backgroundColor:
                    payment.type === "incoming" ? "#10B981" : "#3B82F6",
                },
              ]}
              onPress={() =>
                console.log(`Action for payment ${payment.id}`)
              }
            >
              <Text style={styles.upcomingActionText}>
                {payment.type === "incoming"
                  ? "Record Payment"
                  : "Make Payment"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  userId,
  onCreateLoan,
  onRequestPayment,
  onViewRelationships,
}) => {
  const { isDark } = useTheme();
  const navTheme = useNavTheme();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<UserFinancialSummary | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>(
    []
  );
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [createLoanModalVisible, setCreateLoanModalVisible] = useState(false);
  const [requestPaymentModalVisible, setRequestPaymentModalVisible] =
    useState(false);
  const [viewAllModalVisible, setViewAllModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [groupMembers, setGroupMembers] = useState<
    { id: string; name: string; role: string }[]
  >([]);

  // Form states
  const [selectedContact, setSelectedContact] = useState("");
  const [recipientType, setRecipientType] = useState<
    "person" | "group" | "bank"
  >("person");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [interestRate, setInterestRate] = useState("0");
  const [contacts, setContacts] = useState<{ id: string; name: string }[]>([]);
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [banks, setBanks] = useState<{ id: string; name: string }[]>([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const balanceBarAnim = useRef(new Animated.Value(0)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const netBalanceAnim = useRef(new Animated.Value(0)).current;

  // Dynamic theme colors based on isDark - Enhanced for better accessibility
  const currentTheme = isDark ? darkTheme : lightTheme;
  const colors = {
    ...navTheme.colors,
    ...currentTheme,
    primary: "#10B981", // Green primary color for buttons and accents
    success: "#10B981", // Green success color
    // Card highlight colors - better contrast for both themes
    cardHighlight: isDark ? "#2D3748" : "#F3F4F6",
    // Text colors with better contrast
    text: currentTheme.text,
    textSecondary: currentTheme.textSecondary,
    // Border colors with better visibility
    border: currentTheme.border,
    borderLight: isDark ? "rgba(255,255,255,0.1)" : "#D1D5DB",
    // Card background
    card: currentTheme.card,
    // Shadow colors for better elevation in light theme
    shadow: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)",
    // Background for balance indicator
    balanceBarBg: isDark ? "#374151" : "#E5E7EB",
    // Add isDark for use in child components
    isDark,
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Load financial summary
        await loadFinancialSummary();

        // Load recent activity
        await loadRecentActivity();

        // Load upcoming payments
        await loadUpcomingPayments();

        // Load contacts
        await loadContacts();
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
        
        // Start animations after data loads
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(card1Anim, {
            toValue: 1,
            duration: 500,
            delay: 100,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(card2Anim, {
            toValue: 1,
            duration: 500,
            delay: 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(netBalanceAnim, {
            toValue: 1,
            duration: 600,
            delay: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();

        // Animate balance bar
        const balancePercent = Math.min(
          Math.abs((summary?.netBalance || 0) / 5000) * 100,
          100
        );
        Animated.timing(balanceBarAnim, {
          toValue: balancePercent,
          duration: 1000,
          delay: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start();
      }
    };

    loadDashboardData();
  }, [userId]);

  // Update balance bar animation when summary changes
  useEffect(() => {
    if (summary) {
      const balancePercent = Math.min(
        Math.abs((summary.netBalance || 0) / 5000) * 100,
        100
      );
      Animated.timing(balanceBarAnim, {
        toValue: balancePercent,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
  }, [summary?.netBalance]);

  // Load user's contacts, groups and banks for modals
  const loadContacts = async () => {
    try {
      // In a real implementation, we would fetch from individual_contacts table
      // For now, we'll create some sample data
      const mockContacts = [
        { id: "contact1", name: "Rahul Kumar" },
        { id: "contact2", name: "Priya Sharma" },
        { id: "contact3", name: "Vikram Singh" },
        { id: "contact4", name: "Neha Gupta" },
        { id: "contact5", name: "Amit Patel" },
      ];

      // Mock groups data with member information
      const mockGroups = [
        { id: "group1", name: "Family" },
        { id: "group2", name: "Weekend Trip" },
        { id: "group3", name: "Office Team" },
        { id: "group4", name: "Roommates" },
      ];

      // Mock banks data
      const mockBanks = [
        { id: "bank1", name: "HDFC Bank" },
        { id: "bank2", name: "SBI" },
        { id: "bank3", name: "ICICI Bank" },
        { id: "bank4", name: "Axis Bank" },
      ];

      setContacts(mockContacts);
      setGroups(mockGroups);
      setBanks(mockBanks);
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  // Function to load group members
  const loadGroupMembers = (groupId: string, groupName: string) => {
    // In a real implementation, this would fetch from a database
    // Mock member data for each group
    let mockMembers: { id: string; name: string; role: string }[] = [];

    switch (groupId) {
      case "group1": // Family
        mockMembers = [
          { id: "member1", name: "Rahul Kumar", role: "admin" },
          { id: "member2", name: "Priya Sharma", role: "member" },
          { id: "member3", name: "Anil Kumar", role: "member" },
          { id: "member4", name: "Sneha Patel", role: "member" },
        ];
        break;
      case "group2": // Weekend Trip
        mockMembers = [
          { id: "member5", name: "Vikram Singh", role: "admin" },
          { id: "member6", name: "Neha Gupta", role: "member" },
          { id: "member7", name: "Arjun Mehta", role: "member" },
          { id: "member8", name: "Divya Shah", role: "member" },
        ];
        break;
      case "group3": // Office Team
        mockMembers = [
          { id: "member9", name: "Amit Patel", role: "admin" },
          { id: "member10", name: "Ravi Sharma", role: "member" },
          { id: "member11", name: "Pooja Verma", role: "member" },
          { id: "member12", name: "Sandeep Rao", role: "member" },
          { id: "member13", name: "Tanvi Mishra", role: "member" },
        ];
        break;
      case "group4": // Roommates
        mockMembers = [
          { id: "member14", name: "Karan Singh", role: "admin" },
          { id: "member15", name: "Nisha Joshi", role: "member" },
          { id: "member16", name: "Rohit Kumar", role: "member" },
        ];
        break;
      default:
        mockMembers = [];
    }

    setGroupMembers(mockMembers);
    setSelectedGroup({ id: groupId, name: groupName });
  };

  const loadFinancialSummary = async () => {
    try {
      // Get all relationships
      const relationships =
        await FinancialRelationshipService.getRelationships();

      // Calculate totals
      let totalOwed = 0;
      let totalOwing = 0;

      relationships.forEach((rel) => {
        if (rel.total_amount > 0) {
          totalOwed += rel.total_amount;
        } else {
          totalOwing += Math.abs(rel.total_amount);
        }
      });

      // Get active loans count
      const loans = await LoanManagementService.getLoans({
        role: "lender",
        status: "active",
      });

      // Get unpaid splits count
      const splits = await FinancialRelationshipService.getRelationships();
      let unpaidSplitCount = 0;

      // In a real implementation, we would count actual unpaid splits
      // For now, we'll just use the relationships count as a placeholder
      unpaidSplitCount = relationships.length;

      setSummary({
        totalOwed,
        totalOwing,
        netBalance: totalOwed - totalOwing,
        activeLoanCount: loans.length,
        unpaidSplitCount,
        currency: "INR", // Default currency, could be made dynamic
      });
    } catch (error) {
      console.error("Error loading financial summary:", error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      // In a real implementation, we would fetch actual recent activity
      // For now, we'll create some sample data
      const mockActivity: RecentActivity[] = [
        {
          id: "1",
          description: "Payment received",
          amount: 500,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          type: "payment",
          relatedUserId: "user1",
          relatedUserName: "Dhruv",
        },
        {
          id: "2",
          description: "Loan created",
          amount: 2000,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          type: "loan",
          relatedUserId: "user2",
          relatedUserName: "Rahul",
        },
        {
          id: "3",
          description: "Split expense",
          amount: 1500,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          type: "split",
          relatedUserId: "user3",
          relatedUserName: "Priya",
        },
      ];

      setRecentActivity(mockActivity);
    } catch (error) {
      console.error("Error loading recent activity:", error);
    }
  };

  const loadUpcomingPayments = async () => {
    try {
      // In a real implementation, we would fetch actual upcoming payments
      // For now, we'll create some sample data
      const mockUpcoming: UpcomingPayment[] = [
        {
          id: "1",
          description: "Loan payment due",
          amount: 2000,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          daysRemaining: 3,
          type: "incoming",
          relatedUserId: "user2",
          relatedUserName: "Rahul",
        },
        {
          id: "2",
          description: "Split expense payment",
          amount: 800,
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          daysRemaining: 1,
          type: "outgoing",
          relatedUserId: "user4",
          relatedUserName: "Amit",
        },
      ];

      setUpcomingPayments(mockUpcoming);
    } catch (error) {
      console.error("Error loading upcoming payments:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)}w ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatDaysRemaining = (days: number) => {
    if (days === 0) {
      return "Today";
    } else if (days === 1) {
      return "Tomorrow";
    } else {
      return `${days}d remaining`;
    }
  };

  // Handle form submissions
  const handleCreateLoan = () => {
    // Validate form
    if (!selectedContact) {
      Alert.alert("Error", "Please select a contact");
      return;
    }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    if (!description) {
      Alert.alert("Error", "Please provide a description");
      return;
    }
    if (!dueDate) {
      Alert.alert("Error", "Please provide a due date");
      return;
    }

    // Create loan (in real implementation, this would call LoanManagementService)
    Alert.alert(
      "Success",
      `Loan created successfully!\n\nAmount: ₹${amount}\nFor: ${description}\nDue by: ${dueDate}`,
      [
        {
          text: "OK",
          onPress: () => {
            // Reset form and close modal
            setSelectedContact("");
            setAmount("");
            setDescription("");
            setDueDate("");
            setInterestRate("0");
            setCreateLoanModalVisible(false);

            // Refresh data
            loadFinancialSummary();
            loadRecentActivity();
            loadUpcomingPayments();
          },
        },
      ]
    );

    if (onCreateLoan) {
      onCreateLoan();
    }
  };

  const handleRequestPayment = () => {
    // Validate form
    if (!selectedContact) {
      Alert.alert("Error", "Please select a contact");
      return;
    }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    if (!description) {
      Alert.alert("Error", "Please provide a description");
      return;
    }

    // Send payment request (in real implementation, this would use a service)
    Alert.alert(
      "Success",
      `Payment request sent successfully!\n\nAmount: ₹${amount}\nFor: ${description}${
        dueDate ? `\nDue by: ${dueDate}` : ""
      }`,
      [
        {
          text: "OK",
          onPress: () => {
            // Reset form and close modal
            setSelectedContact("");
            setAmount("");
            setDescription("");
            setDueDate("");
            setRequestPaymentModalVisible(false);

            // Refresh data
            loadFinancialSummary();
            loadRecentActivity();
            loadUpcomingPayments();
          },
        },
      ]
    );

    if (onRequestPayment) {
      onRequestPayment();
    }
  };

  if (loading) {
    return <FinancialDashboardSkeleton isDark={isDark} />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
        }}
      >
        {/* Financial Summary */}
        <View style={[
          styles.card, 
          { 
            backgroundColor: colors.card,
            borderWidth: isDark ? 0 : 1,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          }
        ]}>
          {/* Summary Cards in a Row */}
          <View style={styles.summaryCardsRow}>
            <Animated.View
              style={{
                flex: 1,
                opacity: card1Anim,
                transform: [
                  {
                    translateX: card1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-30, 0],
                    }),
                  },
                  {
                    scale: card1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              }}
            >
              <TouchableOpacity
                style={styles.summaryCard}
                onPress={() => console.log("View all owed")}
                activeOpacity={0.8}
              >
            <LinearGradient
              colors={isDark 
                ? ['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.08)', 'rgba(16, 185, 129, 0.12)']
                : ['rgba(16, 185, 129, 0.12)', 'rgba(16, 185, 129, 0.06)', 'rgba(16, 185, 129, 0.10)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.summaryCardGradient}
            >
              <View style={styles.summaryCardContent}>
                <Ionicons
                  name="arrow-down-circle"
                  size={20}
                  color={colors.success}
                  style={styles.summaryIcon}
                />
                <Text
                  style={[
                    styles.summaryCardLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  You are owed
                </Text>
                <Text
                  style={[styles.summaryCardValue, { color: colors.success }]}
                >
                  {formatCurrency(summary?.totalOwed || 0)}
                </Text>
                <Text
                  style={[
                    styles.summaryCardSubtext,
                    { color: colors.textSecondary },
                  ]}
                >
                  From {recentActivity.length || 0} people
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={{
                flex: 1,
                opacity: card2Anim,
                transform: [
                  {
                    translateX: card2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                  {
                    scale: card2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              }}
            >
              <TouchableOpacity
                style={styles.summaryCard}
                onPress={() => console.log("View all owing")}
                activeOpacity={0.8}
              >
            <LinearGradient
              colors={isDark 
                ? ['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.08)', 'rgba(239, 68, 68, 0.12)']
                : ['rgba(239, 68, 68, 0.12)', 'rgba(239, 68, 68, 0.06)', 'rgba(239, 68, 68, 0.10)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.summaryCardGradient}
            >
              <View style={styles.summaryCardContent}>
                <Ionicons
                  name="arrow-up-circle"
                  size={20}
                  color="#EF4444"
                  style={styles.summaryIcon}
                />
                <Text
                  style={[
                    styles.summaryCardLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  You owe
                </Text>
                <Text style={[styles.summaryCardValue, { color: "#EF4444" }]}>
                  {formatCurrency(summary?.totalOwing || 0)}
                </Text>
                <Text
                  style={[
                    styles.summaryCardSubtext,
                    { color: colors.textSecondary },
                  ]}
                >
                  To {upcomingPayments.length || 0} people
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Net Balance with Animation */}
          <Animated.View
            style={[
              styles.netBalanceContainer,
              {
                backgroundColor: colors.cardHighlight,
                borderColor: colors.border,
                borderWidth: isDark ? 1 : 1.5,
                opacity: netBalanceAnim,
                transform: [
                  {
                    translateY: netBalanceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                  {
                    scale: netBalanceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.netBalanceContent}>
              <Text style={[styles.netBalanceLabel, { color: colors.text }]}>
                NET BALANCE
              </Text>
              <Animated.Text
                style={[
                  styles.netBalanceValue,
                  {
                    color:
                      (summary?.netBalance || 0) > 0
                        ? colors.success
                        : (summary?.netBalance || 0) < 0
                        ? "#EF4444"
                        : colors.text,
                    transform: [
                      {
                        scale: netBalanceAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0.8, 1.1, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {formatCurrency(summary?.netBalance || 0)}
              </Animated.Text>
            </View>

            <View style={styles.balanceIndicatorContainer}>
              <View
                style={[
                  styles.balanceIndicatorBar,
                  { backgroundColor: colors.balanceBarBg },
                ]}
              >
                <Animated.View
                  style={[
                    styles.balanceIndicatorFill,
                    {
                      backgroundColor:
                        (summary?.netBalance || 0) >= 0
                          ? colors.success
                          : "#EF4444",
                      width: balanceBarAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      }),
                      alignSelf:
                        (summary?.netBalance || 0) >= 0
                          ? "flex-start"
                          : "flex-end",
                    },
                  ]}
                >
                  <View style={styles.balanceIndicatorGlow} />
                </Animated.View>
              </View>
              <View style={styles.balanceLabelsContainer}>
                <Text
                  style={[
                    styles.balanceIndicatorLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  You owe others
                </Text>
                <Text
                  style={[
                    styles.balanceIndicatorLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Others owe you
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View
        style={[
          styles.card, 
          { 
            backgroundColor: colors.card,
            borderWidth: isDark ? 0 : 1,
            borderColor: colors.border,
            shadowColor: colors.shadow,
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          }
        ]}
      >
        <View style={styles.actionButtonsGrid}>
          <Animated.View
            style={{
              flex: 1,
              opacity: fadeAnim,
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            }}
          >
            <TouchableOpacity
              style={[
                styles.gridActionButton,
                {
                  backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#FFFFFF",
                  borderWidth: isDark ? 0 : 1,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => setCreateLoanModalVisible(true)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.gridIconContainer,
                  { 
                    backgroundColor: isDark 
                      ? "rgba(16,185,129,0.15)" 
                      : "rgba(16,185,129,0.1)" 
                  },
                ]}
              >
                <Ionicons name="cash-outline" size={26} color="#10B981" />
              </View>
              <Text style={[styles.gridActionText, { color: colors.text }]}>Loan</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={{
              flex: 1,
              opacity: fadeAnim,
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            }}
          >
            <TouchableOpacity
              style={[
                styles.gridActionButton,
                {
                  backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#FFFFFF",
                  borderWidth: isDark ? 0 : 1,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => setRequestPaymentModalVisible(true)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.gridIconContainer,
                  { 
                    backgroundColor: isDark 
                      ? "rgba(59,130,246,0.15)" 
                      : "rgba(59,130,246,0.1)" 
                  },
                ]}
              >
                <Ionicons name="arrow-down-circle" size={26} color="#3B82F6" />
              </View>
              <Text style={[styles.gridActionText, { color: colors.text }]}>Request</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={{
              flex: 1,
              opacity: fadeAnim,
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            }}
          >
            <TouchableOpacity
              style={[
                styles.gridActionButton,
                {
                  backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#FFFFFF",
                  borderWidth: isDark ? 0 : 1,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => setViewAllModalVisible(true)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.gridIconContainer,
                  { 
                    backgroundColor: isDark 
                      ? "rgba(245,158,11,0.15)" 
                      : "rgba(245,158,11,0.1)" 
                  },
                ]}
              >
                <Ionicons name="people" size={26} color="#F59E0B" />
              </View>
              <Text style={[styles.gridActionText, { color: colors.text }]}>View All</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Recent Activity */}
      <Animated.View
        style={[
          styles.card, 
          { 
            backgroundColor: colors.card,
            borderWidth: isDark ? 0 : 1,
            borderColor: colors.border,
            shadowColor: colors.shadow,
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                }),
              },
            ],
          }
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            RECENT ACTIVITY
          </Text>
          <TouchableOpacity
            onPress={() => setShowAllActivity(!showAllActivity)}
            activeOpacity={0.7}
          >
            <Text style={[styles.viewAllText, { color: colors.primary }]}>
              {showAllActivity ? "Show Less" : "View All"}
            </Text>
          </TouchableOpacity>
        </View>

        {recentActivity.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No recent activity
          </Text>
        ) : (
          <>
            {(showAllActivity
              ? recentActivity
              : recentActivity.slice(0, 3)
            ).map((activity, index) => (
              <AnimatedActivityItem
                key={activity.id}
                activity={activity}
                index={index}
                colors={colors}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            ))}

            {!showAllActivity && recentActivity.length > 3 && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => setShowAllActivity(true)}
              >
                <Text style={[styles.showMoreText, { color: colors.primary }]}>
                  Show {recentActivity.length - 3} More
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={colors.primary}
                />
              </TouchableOpacity>
            )}
          </>
        )}
      </Animated.View>

      {/* Upcoming */}
      <Animated.View
        style={[
          styles.card, 
          { 
            backgroundColor: colors.card,
            borderWidth: isDark ? 0 : 1,
            borderColor: colors.border,
            shadowColor: colors.shadow,
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          }
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Upcoming
          </Text>
          <TouchableOpacity
            onPress={() => setShowAllUpcoming(!showAllUpcoming)}
            activeOpacity={0.7}
          >
            <Text style={[styles.viewAllText, { color: colors.primary }]}>
              {showAllUpcoming ? "Show Less" : "View All"}
            </Text>
          </TouchableOpacity>
        </View>

        {upcomingPayments.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No upcoming payments
          </Text>
        ) : (
          <>
            {(showAllUpcoming
              ? upcomingPayments
              : upcomingPayments.slice(0, 2)
            ).map((payment, index) => (
              <AnimatedUpcomingItem
                key={payment.id}
                payment={payment}
                index={index}
                colors={colors}
                formatCurrency={formatCurrency}
                formatDaysRemaining={formatDaysRemaining}
              />
            ))}

            {!showAllUpcoming && upcomingPayments.length > 2 && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => setShowAllUpcoming(true)}
              >
                <Text style={[styles.showMoreText, { color: colors.primary }]}>
                  Show {upcomingPayments.length - 2} More
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={colors.primary}
                />
              </TouchableOpacity>
            )}
          </>
        )}
      </Animated.View>

      {/* Create Loan Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createLoanModalVisible}
        onRequestClose={() => setCreateLoanModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.modalContainer, 
              { 
                backgroundColor: colors.card,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Create Loan
              </Text>
              <TouchableOpacity
                onPress={() => setCreateLoanModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <ScrollView style={styles.formContainer}>
              {/* Recipient Type Tabs */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Select Recipient
              </Text>
              <View style={[styles.recipientTypeTabs, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }]}>
                <TouchableOpacity
                  style={[
                    styles.recipientTypeTab,
                    recipientType === "person" && [styles.activeRecipientTab, { backgroundColor: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)" }],
                  ]}
                  onPress={() => setRecipientType("person")}
                >
                  <Ionicons
                    name="person"
                    size={18}
                    color={
                      recipientType === "person"
                        ? "#10B981"
                        : colors.textSecondary
                    }
                    style={styles.recipientTabIcon}
                  />
                  <Text
                    style={[
                      styles.recipientTabText,
                      {
                        color:
                          recipientType === "person"
                            ? "#10B981"
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    Person
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.recipientTypeTab,
                    recipientType === "group" && [styles.activeRecipientTab, { backgroundColor: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)" }],
                  ]}
                  onPress={() => setRecipientType("group")}
                >
                  <Ionicons
                    name="people"
                    size={18}
                    color={
                      recipientType === "group"
                        ? "#10B981"
                        : colors.textSecondary
                    }
                    style={styles.recipientTabIcon}
                  />
                  <Text
                    style={[
                      styles.recipientTabText,
                      {
                        color:
                          recipientType === "group"
                            ? "#10B981"
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    Group
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.recipientTypeTab,
                    recipientType === "bank" && [styles.activeRecipientTab, { backgroundColor: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)" }],
                  ]}
                  onPress={() => setRecipientType("bank")}
                >
                  <Ionicons
                    name="business"
                    size={18}
                    color={
                      recipientType === "bank"
                        ? "#10B981"
                        : colors.textSecondary
                    }
                    style={styles.recipientTabIcon}
                  />
                  <Text
                    style={[
                      styles.recipientTabText,
                      {
                        color:
                          recipientType === "bank"
                            ? "#10B981"
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    Bank
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Contact/Group/Bank Picker */}
              <View
                style={[
                  styles.pickerContainer,
                  {
                    backgroundColor: colors.cardHighlight,
                    borderColor: colors.border,
                    borderWidth: isDark ? 1 : 1.5,
                  },
                ]}
              >
                <Ionicons
                  name={
                    recipientType === "person"
                      ? "person"
                      : recipientType === "group"
                      ? "people"
                      : "business"
                  }
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />

                {recipientType === "person" && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.contactPicker}
                  >
                    {contacts.map((contact) => (
                      <TouchableOpacity
                        key={contact.id}
                        style={[
                          styles.contactChip,
                          {
                            backgroundColor:
                              selectedContact === contact.id
                                ? colors.primary
                                : isDark
                                ? "rgba(255,255,255,0.1)"
                                : "rgba(0,0,0,0.05)",
                            borderColor:
                              selectedContact === contact.id
                                ? colors.primary
                                : colors.border,
                          },
                        ]}
                        onPress={() => setSelectedContact(contact.id)}
                      >
                        <Text
                          style={[
                            styles.contactChipText,
                            {
                              color:
                                selectedContact === contact.id
                                  ? "#FFFFFF"
                                  : colors.textSecondary,
                            },
                          ]}
                        >
                          {contact.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {recipientType === "group" && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.contactPicker}
                  >
                    {groups.map((group) => (
                      <TouchableOpacity
                        key={group.id}
                        style={[
                          styles.contactChip,
                          {
                            backgroundColor:
                              selectedContact === group.id
                                ? colors.primary
                                : isDark
                                ? "rgba(255,255,255,0.1)"
                                : "rgba(0,0,0,0.05)",
                            borderColor:
                              selectedContact === group.id
                                ? colors.primary
                                : colors.border,
                          },
                        ]}
                        onPress={() => setSelectedContact(group.id)}
                      >
                        <Text
                          style={[
                            styles.contactChipText,
                            {
                              color:
                                selectedContact === group.id
                                  ? "#FFFFFF"
                                  : colors.textSecondary,
                            },
                          ]}
                        >
                          {group.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {recipientType === "bank" && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.contactPicker}
                  >
                    {banks.map((bank) => (
                      <TouchableOpacity
                        key={bank.id}
                        style={[
                          styles.contactChip,
                          {
                            backgroundColor:
                              selectedContact === bank.id
                                ? colors.primary
                                : isDark
                                ? "rgba(255,255,255,0.1)"
                                : "rgba(0,0,0,0.05)",
                            borderColor:
                              selectedContact === bank.id
                                ? colors.primary
                                : colors.border,
                          },
                        ]}
                        onPress={() => setSelectedContact(bank.id)}
                      >
                        <Text
                          style={[
                            styles.contactChipText,
                            {
                              color:
                                selectedContact === bank.id
                                  ? "#FFFFFF"
                                  : colors.textSecondary,
                            },
                          ]}
                        >
                          {bank.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* Amount Field */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Amount
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.cardHighlight,
                    borderColor: colors.border,
                    borderWidth: isDark ? 1 : 1.5,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.currencySymbol,
                    { color: colors.textSecondary },
                  ]}
                >
                  ₹
                </Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter amount"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              {/* Description Field */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Description
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.cardHighlight,
                    borderColor: colors.border,
                    borderWidth: isDark ? 1 : 1.5,
                  },
                ]}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="E.g., Home renovation, Education, etc."
                  placeholderTextColor={colors.textSecondary}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              {/* Due Date Field */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Due Date
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.cardHighlight,
                    borderColor: colors.border,
                    borderWidth: isDark ? 1 : 1.5,
                  },
                ]}
              >
                <Ionicons
                  name="calendar"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={colors.textSecondary}
                  value={dueDate}
                  onChangeText={setDueDate}
                />
              </View>

              {/* Interest Rate Field */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Interest Rate (%)
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.cardHighlight,
                    borderColor: colors.border,
                    borderWidth: isDark ? 1 : 1.5,
                  },
                ]}
              >
                <Ionicons
                  name="trending-up"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={interestRate}
                  onChangeText={setInterestRate}
                />
              </View>
            </ScrollView>

            {/* Form Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setCreateLoanModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleCreateLoan}
              >
                <Text style={styles.submitButtonText}>Create Loan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Request Payment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={requestPaymentModalVisible}
        onRequestClose={() => setRequestPaymentModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.modalContainer, 
              { 
                backgroundColor: colors.card,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Request Payment
              </Text>
              <TouchableOpacity
                onPress={() => setRequestPaymentModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <ScrollView style={styles.formContainer}>
              {/* Recipient Type Tabs */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Select Recipient
              </Text>
              <View style={[styles.recipientTypeTabs, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }]}>
                <TouchableOpacity
                  style={[
                    styles.recipientTypeTab,
                    recipientType === "person" && [styles.activeRecipientTab, { backgroundColor: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)" }],
                  ]}
                  onPress={() => setRecipientType("person")}
                >
                  <Ionicons
                    name="person"
                    size={18}
                    color={
                      recipientType === "person"
                        ? "#10B981"
                        : colors.textSecondary
                    }
                    style={styles.recipientTabIcon}
                  />
                  <Text
                    style={[
                      styles.recipientTabText,
                      {
                        color:
                          recipientType === "person"
                            ? "#10B981"
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    Person
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.recipientTypeTab,
                    recipientType === "group" && [styles.activeRecipientTab, { backgroundColor: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)" }],
                  ]}
                  onPress={() => setRecipientType("group")}
                >
                  <Ionicons
                    name="people"
                    size={18}
                    color={
                      recipientType === "group"
                        ? "#10B981"
                        : colors.textSecondary
                    }
                    style={styles.recipientTabIcon}
                  />
                  <Text
                    style={[
                      styles.recipientTabText,
                      {
                        color:
                          recipientType === "group"
                            ? "#10B981"
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    Group
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.recipientTypeTab,
                    recipientType === "bank" && [styles.activeRecipientTab, { backgroundColor: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)" }],
                  ]}
                  onPress={() => setRecipientType("bank")}
                >
                  <Ionicons
                    name="business"
                    size={18}
                    color={
                      recipientType === "bank"
                        ? "#10B981"
                        : colors.textSecondary
                    }
                    style={styles.recipientTabIcon}
                  />
                  <Text
                    style={[
                      styles.recipientTabText,
                      {
                        color:
                          recipientType === "bank"
                            ? "#10B981"
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    Bank
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Contact/Group/Bank Picker */}
              <View
                style={[
                  styles.pickerContainer,
                  {
                    backgroundColor: colors.cardHighlight,
                    borderColor: colors.border,
                    borderWidth: isDark ? 1 : 1.5,
                  },
                ]}
              >
                <Ionicons
                  name={
                    recipientType === "person"
                      ? "person"
                      : recipientType === "group"
                      ? "people"
                      : "business"
                  }
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />

                {recipientType === "person" && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.contactPicker}
                  >
                    {contacts.map((contact) => (
                      <TouchableOpacity
                        key={contact.id}
                        style={[
                          styles.contactChip,
                          {
                            backgroundColor:
                              selectedContact === contact.id
                                ? colors.primary
                                : isDark
                                ? "rgba(255,255,255,0.1)"
                                : "rgba(0,0,0,0.05)",
                            borderColor:
                              selectedContact === contact.id
                                ? colors.primary
                                : colors.border,
                          },
                        ]}
                        onPress={() => setSelectedContact(contact.id)}
                      >
                        <Text
                          style={[
                            styles.contactChipText,
                            {
                              color:
                                selectedContact === contact.id
                                  ? "#FFFFFF"
                                  : colors.textSecondary,
                            },
                          ]}
                        >
                          {contact.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {recipientType === "group" && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.contactPicker}
                  >
                    {groups.map((group) => (
                      <TouchableOpacity
                        key={group.id}
                        style={[
                          styles.contactChip,
                          {
                            backgroundColor:
                              selectedContact === group.id
                                ? colors.primary
                                : isDark
                                ? "rgba(255,255,255,0.1)"
                                : "rgba(0,0,0,0.05)",
                            borderColor:
                              selectedContact === group.id
                                ? colors.primary
                                : colors.border,
                          },
                        ]}
                        onPress={() => setSelectedContact(group.id)}
                      >
                        <Text
                          style={[
                            styles.contactChipText,
                            {
                              color:
                                selectedContact === group.id
                                  ? "#FFFFFF"
                                  : colors.textSecondary,
                            },
                          ]}
                        >
                          {group.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {recipientType === "bank" && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.contactPicker}
                  >
                    {banks.map((bank) => (
                      <TouchableOpacity
                        key={bank.id}
                        style={[
                          styles.contactChip,
                          {
                            backgroundColor:
                              selectedContact === bank.id
                                ? colors.primary
                                : isDark
                                ? "rgba(255,255,255,0.1)"
                                : "rgba(0,0,0,0.05)",
                            borderColor:
                              selectedContact === bank.id
                                ? colors.primary
                                : colors.border,
                          },
                        ]}
                        onPress={() => setSelectedContact(bank.id)}
                      >
                        <Text
                          style={[
                            styles.contactChipText,
                            {
                              color:
                                selectedContact === bank.id
                                  ? "#FFFFFF"
                                  : colors.textSecondary,
                            },
                          ]}
                        >
                          {bank.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* Amount Field */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Amount
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.cardHighlight,
                    borderColor: colors.border,
                    borderWidth: isDark ? 1 : 1.5,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.currencySymbol,
                    { color: colors.textSecondary },
                  ]}
                >
                  ₹
                </Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter amount"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              {/* Description Field */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Description
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.cardHighlight,
                    borderColor: colors.border,
                    borderWidth: isDark ? 1 : 1.5,
                  },
                ]}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="What is this payment for?"
                  placeholderTextColor={colors.textSecondary}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              {/* Due Date Field */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Due By
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.cardHighlight,
                    borderColor: colors.border,
                    borderWidth: isDark ? 1 : 1.5,
                  },
                ]}
              >
                <Ionicons
                  name="calendar"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={colors.textSecondary}
                  value={dueDate}
                  onChangeText={setDueDate}
                />
              </View>
            </ScrollView>

            {/* Form Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setRequestPaymentModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleRequestPayment}
              >
                <Text style={styles.submitButtonText}>Send Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* View All Relationships Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={viewAllModalVisible}
        onRequestClose={() => {
          setSelectedGroup(null);
          setViewAllModalVisible(false);
        }}
      >
        <View
          style={[
            styles.fullScreenModalOverlay,
            { backgroundColor: currentTheme.background },
          ]}
        >
          {selectedGroup ? (
            // Group Members View
            <>
              <View style={[styles.enhancedModalHeader, { borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }]}>
                <View style={styles.headerLeftSection}>
                  <TouchableOpacity
                    onPress={() => setSelectedGroup(null)}
                    style={[styles.backButton, { backgroundColor: isDark ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.15)" }]}
                  >
                    <Ionicons name="arrow-back" size={24} color="#10B981" />
                  </TouchableOpacity>
                </View>
                <Text
                  style={[styles.enhancedModalTitle, { color: colors.text }]}
                >
                  {selectedGroup.name} Members
                </Text>
                <View style={styles.headerRightSection}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedGroup(null);
                      setViewAllModalVisible(false);
                    }}
                    style={[styles.closeButtonContainer, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }]}
                  >
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView style={styles.relationshipsList}>
                {groupMembers.map((member) => (
                  <TouchableOpacity
                    key={member.id}
                    style={[
                      styles.relationshipItem,
                      { backgroundColor: colors.card },
                    ]}
                    onPress={() => {
                      // Handle member selection if needed
                    }}
                  >
                    <View style={[styles.contactAvatar, { backgroundColor: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)" }]}>
                      <Ionicons name="person" size={24} color="#10B981" />
                    </View>
                    <View style={styles.contactDetails}>
                      <Text
                        style={[styles.contactName, { color: colors.text }]}
                      >
                        {member.name}
                      </Text>
                      <View style={styles.roleContainer}>
                        <Text
                          style={[
                            styles.contactInfo,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {member.role === "admin" ? "" : "Member"}
                        </Text>
                        {member.role === "admin" && (
                          <View style={[styles.adminBadge, { backgroundColor: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)" }]}>
                            <Ionicons
                              name="shield-checkmark"
                              size={12}
                              color="#10B981"
                              style={{ marginRight: 4 }}
                            />
                            <Text style={styles.adminBadgeText}>Admin</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : (
            // Main Relationships View
            <>
              <View style={[styles.enhancedModalHeader, { borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }]}>
                <View style={styles.headerLeftSection}>
                  {/* Empty view for alignment */}
                </View>
                <Text
                  style={[styles.enhancedModalTitle, { color: colors.text }]}
                >
                  All Relationships
                </Text>
                <View style={styles.headerRightSection}>
                  <TouchableOpacity
                    onPress={() => setViewAllModalVisible(false)}
                    style={[styles.closeButtonContainer, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }]}
                  >
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Tabs for Individuals and Groups with counts */}
              <View style={[styles.tabContainer, { borderBottomColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }]}>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    recipientType === "person" && {
                      borderBottomColor: "#10B981",
                      borderBottomWidth: 2,
                    },
                  ]}
                  onPress={() => setRecipientType("person")}
                >
                  <View style={styles.tabContent}>
                    <Ionicons
                      name="person"
                      size={18}
                      color={
                        recipientType === "person"
                          ? "#10B981"
                          : colors.textSecondary
                      }
                      style={styles.tabIcon}
                    />
                    <Text
                      style={[
                        styles.tabText,
                        {
                          color:
                            recipientType === "person"
                              ? "#10B981"
                              : colors.textSecondary,
                        },
                      ]}
                    >
                      Individuals
                    </Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>
                        {contacts.length}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tab,
                    recipientType === "group" && {
                      borderBottomColor: "#10B981",
                      borderBottomWidth: 2,
                    },
                  ]}
                  onPress={() => setRecipientType("group")}
                >
                  <View style={styles.tabContent}>
                    <Ionicons
                      name="people"
                      size={18}
                      color={
                        recipientType === "group"
                          ? "#10B981"
                          : colors.textSecondary
                      }
                      style={styles.tabIcon}
                    />
                    <Text
                      style={[
                        styles.tabText,
                        {
                          color:
                            recipientType === "group"
                              ? "#10B981"
                              : colors.textSecondary,
                        },
                      ]}
                    >
                      Groups
                    </Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{groups.length}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Individuals List */}
              {recipientType === "person" && (
                <ScrollView style={styles.relationshipsList}>
                  {contacts.map((contact) => (
                    <TouchableOpacity
                      key={contact.id}
                      style={[
                        styles.relationshipItem,
                        { backgroundColor: colors.card },
                      ]}
                      onPress={() => {
                        setViewAllModalVisible(false);
                        if (onViewRelationships) {
                          onViewRelationships();
                        }
                      }}
                    >
                      <View style={styles.contactAvatar}>
                        <Ionicons name="person" size={24} color="#10B981" />
                      </View>
                      <View style={styles.contactDetails}>
                        <Text
                          style={[styles.contactName, { color: colors.text }]}
                        >
                          {contact.name}
                        </Text>
                        <Text
                          style={[
                            styles.contactInfo,
                            { color: colors.textSecondary },
                          ]}
                        >
                          Individual
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Groups List */}
              {recipientType === "group" && (
                <ScrollView style={styles.relationshipsList}>
                  {groups.map((group) => (
                    <TouchableOpacity
                      key={group.id}
                      style={[
                        styles.relationshipItem,
                        { backgroundColor: colors.card },
                      ]}
                      onPress={() => loadGroupMembers(group.id, group.name)}
                    >
                      <View
                        style={[
                          styles.contactAvatar,
                          { backgroundColor: isDark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.1)" },
                        ]}
                      >
                        <Ionicons name="people" size={24} color="#3B82F6" />
                      </View>
                      <View style={styles.contactDetails}>
                        <Text
                          style={[styles.contactName, { color: colors.text }]}
                        >
                          {group.name}
                        </Text>
                        <Text
                          style={[
                            styles.contactInfo,
                            { color: colors.textSecondary },
                          ]}
                        >
                          Group
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  fullScreenModalOverlay: {
    flex: 1,
    padding: 16,
    paddingTop: 30,
  },
  // Enhanced header styles
  enhancedModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    marginBottom: 10,
    borderBottomWidth: 1,
    // Border color will be set dynamically
  },
  headerLeftSection: {
    width: 44,
    alignItems: "flex-start",
  },
  headerRightSection: {
    width: 44,
    alignItems: "flex-end",
  },
  enhancedModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },
  closeButtonContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    // Background color will be set dynamically
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    // Background color will be set dynamically
  },
  closeButton: {
    padding: 4,
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  formContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  pickerContainer: {
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "500",
    marginRight: 8,
  },
  contactPicker: {
    flex: 1,
  },
  contactChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  contactChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    flex: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // Financial Summary Section
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  summaryCardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryCardGradient: {
    borderRadius: 14,
    padding: 12,
    minHeight: 110,
    justifyContent: "center",
  },
  summaryCardContent: {
    alignItems: "flex-start",
  },
  summaryIcon: {
    marginBottom: 6,
  },
  summaryCardLabel: {
    fontSize: 11,
    marginBottom: 4,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryCardValue: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
    marginTop: 2,
  },
  summaryCardSubtext: {
    fontSize: 10,
    marginTop: 2,
  },
  netBalanceContainer: {
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
  },
  netBalanceContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  netBalanceLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  netBalanceValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  balanceIndicatorContainer: {
    width: "100%",
  },
  balanceIndicatorBar: {
    height: 6,
    borderRadius: 3,
    width: "100%",
    marginBottom: 8,
  },
  balanceIndicatorFill: {
    height: 6,
    borderRadius: 3,
  },
  balanceIndicatorGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  balanceLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  balanceIndicatorLabel: {
    fontSize: 11,
  },

  // Quick Actions
  actionButtonsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  gridActionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    borderRadius: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: 100,
  },
  gridIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  gridActionText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  recipientTypeTabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    borderRadius: 10,
    padding: 4,
  },
  recipientTypeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeRecipientTab: {
    // Will be set dynamically based on theme
  },
  recipientTabIcon: {
    marginRight: 6,
  },
  recipientTabText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // Recent Activity
  activityItem: {
    flexDirection: "row",
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activitySubheader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  activityDescription: {
    fontSize: 15,
    fontWeight: "600",
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  activityDate: {
    fontSize: 12,
    marginTop: 2,
  },

  // Upcoming Payments
  upcomingItem: {
    flexDirection: "row",
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
  },
  upcomingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    alignSelf: "flex-start",
  },
  upcomingContent: {
    flex: 1,
  },
  upcomingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  upcomingTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  upcomingDescription: {
    fontSize: 12,
  },
  upcomingAmount: {
    fontSize: 18,
    fontWeight: "600",
  },
  upcomingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  upcomingDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  upcomingDate: {
    fontSize: 12,
  },
  upcomingActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  upcomingActionText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },

  // Show More Button
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  showMoreText: {
    fontSize: 14,
    marginRight: 4,
    fontWeight: "500",
  },

  emptyText: {
    textAlign: "center",
    fontStyle: "italic",
    fontSize: 14,
  },
  relationshipsList: {
    flex: 1,
    marginTop: 16,
  },
  relationshipItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    // Background color will be set dynamically
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: 13,
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  adminBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 0,
    flexDirection: "row",
    alignItems: "center",
    // Background color will be set dynamically
  },
  adminBadgeText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "700",
  },
  tabContainer: {
    flexDirection: "row",
    marginVertical: 10,
    borderBottomWidth: 1,
    // Border color will be set dynamically
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  tabIcon: {
    marginRight: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "700",
    marginRight: 5,
  },
  countBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});

export default FinancialDashboard;
