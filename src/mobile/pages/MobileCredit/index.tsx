import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useTheme,
  darkTheme,
  lightTheme,
} from "../../../../contexts/ThemeContext";
import { useNavigation } from "@react-navigation/native";

interface CreditCard {
  id: string;
  bankName: string;
  cardNumber: string;
  cardType: string;
  limitUsed: number;
  totalLimit: number;
  dueDate: string;
  color: string;
  icon: string;
}

const MobileCredit: React.FC = () => {
  const { isDark } = useTheme();
  const colors = isDark ? darkTheme : lightTheme;
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Sample credit card data
  const creditCards: CreditCard[] = [
    {
      id: "1",
      bankName: "HDFC BANK",
      cardNumber: "1234",
      cardType: "HDFC",
      limitUsed: 1000,
      totalLimit: 2000,
      dueDate: "Apr 12",
      color: "#EF4444",
      icon: "add",
    },
    {
      id: "2",
      bankName: "ICICI BANK",
      cardNumber: "8018",
      cardType: "ICICI",
      limitUsed: 1000,
      totalLimit: 2000,
      dueDate: "Apr 12",
      color: "#F59E0B",
      icon: "information",
    },
  ];

  const filters = ["All", "HDFC Bank", "ICICI Bank", "+ Add Account"];

  const getUsagePercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100);
  };

  const renderFilterButton = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.filterButton,
        {
          backgroundColor:
            selectedFilter === item ? colors.primary : colors.card,
          borderColor: colors.border,
        },
        item === "+ Add Account" && { backgroundColor: colors.primary },
      ]}
      onPress={() => setSelectedFilter(item)}
    >
      {item === "+ Add Account" && (
        <Ionicons
          name="add"
          size={14}
          color="white"
          style={{ marginRight: 4 }}
        />
      )}
      <Text
        style={[
          styles.filterButtonText,
          {
            color:
              selectedFilter === item || item === "+ Add Account"
                ? "white"
                : colors.text,
          },
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderCreditCard = ({ item }: { item: CreditCard }) => (
    <View style={[styles.cardContainer, { backgroundColor: colors.card }]}>
      {/* Bank Name and Manage Card */}
      <View style={styles.cardHeader}>
        <Text style={[styles.bankName, { color: colors.text }]}>
          {item.bankName}
        </Text>
        <TouchableOpacity>
          <Text style={[styles.manageCard, { color: colors.textSecondary }]}>
            Manage card
          </Text>
        </TouchableOpacity>
      </View>

      {/* Credit Card Visual */}
      <View style={[styles.creditCardVisual, { backgroundColor: item.color }]}>
        <View style={styles.cardContent}>
          <Text style={styles.cardType}>{item.cardType}</Text>
          <Text style={styles.cardNumber}>{item.cardNumber}</Text>
        </View>
        <View
          style={[
            styles.cardIcon,
            { backgroundColor: "rgba(255,255,255,0.2)" },
          ]}
        >
          <Ionicons name={item.icon as any} size={20} color="white" />
        </View>
      </View>

      {/* Limit Information */}
      <View style={styles.limitSection}>
        <Text style={[styles.limitLabel, { color: colors.text }]}>
          Limit used
        </Text>

        {/* Progress Bar */}
        <View
          style={[
            styles.progressBarContainer,
            { backgroundColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: colors.primary,
                width: `${getUsagePercentage(
                  item.limitUsed,
                  item.totalLimit
                )}%`,
              },
            ]}
          />
        </View>

        {/* Usage Details */}
        <View style={styles.usageDetails}>
          <View style={styles.usageLeft}>
            <Text style={[styles.usedAmount, { color: colors.text }]}>
              ₹{item.limitUsed.toLocaleString("en-IN")}
            </Text>
            <Text style={[styles.usagePercentage, { color: colors.primary }]}>
              {getUsagePercentage(item.limitUsed, item.totalLimit)}%
            </Text>
          </View>
          <Text style={[styles.totalLimit, { color: colors.textSecondary }]}>
            ₹{item.totalLimit.toLocaleString("en-IN")} limit
          </Text>
        </View>

        {/* Due Date */}
        <Text style={[styles.dueDate, { color: colors.textSecondary }]}>
          Due: {item.dueDate}
        </Text>
      </View>

      {/* View Breakdown Button */}
      <TouchableOpacity
        style={[
          styles.viewBreakdownButton,
          { backgroundColor: colors.background, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.viewBreakdownText, { color: colors.text }]}>
          View breakdown
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Money
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: colors.textSecondary }]}
          >
            Manage your accounts and cards
          </Text>
        </View>
      </View>

      {/* Full Width Navigation Buttons */}
      <View
        style={[
          styles.fullNavContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <View
          style={[styles.fullNavButtonGroup, { backgroundColor: colors.card }]}
        >
          <TouchableOpacity
            style={[styles.fullNavButton]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="wallet" size={16} color={colors.textSecondary} />
            <Text style={[styles.fullNavText, { color: colors.textSecondary }]}>
              Accounts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.fullNavButton,
              styles.activeFullNav,
              { backgroundColor: colors.primary },
            ]}
          >
            <Ionicons name="card" size={16} color="white" />
            <Text style={[styles.fullNavText, { color: "white" }]}>Credit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fullNavButton]}
            onPress={() => (navigation as any).navigate("MobileNetWorth")}
          >
            <Ionicons
              name="trending-up"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={[styles.fullNavText, { color: colors.textSecondary }]}>
              Net
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Horizontal Filter Buttons */}
        <View style={styles.filtersContainer}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>
            Filter by:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
          >
            {filters.map((filter, index) =>
              renderFilterButton({ item: filter, index })
            )}
          </ScrollView>
        </View>

        {/* All Cards Header */}
        <View style={styles.cardsHeader}>
          <View>
            <Text style={[styles.cardsTitle, { color: colors.text }]}>
              All cards
            </Text>
            <Text
              style={[styles.cardsSubtitle, { color: colors.textSecondary }]}
            >
              As of last available statement
            </Text>
          </View>
          <Text style={[styles.cardsCount, { color: colors.textSecondary }]}>
            {creditCards.length} cards
          </Text>
        </View>

        {/* Credit Cards List */}
        <FlatList
          data={creditCards}
          renderItem={renderCreditCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.cardsContainer}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  fullNavContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  fullNavButtonGroup: {
    flexDirection: "row",
    borderRadius: 25,
    padding: 4,
  },
  fullNavButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  activeFullNav: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fullNavText: {
    fontSize: 14,
    fontWeight: "600",
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  filtersScroll: {
    flexDirection: "row",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  cardsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  cardsTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardsSubtitle: {
    fontSize: 14,
  },
  cardsCount: {
    fontSize: 14,
    fontWeight: "500",
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  bankName: {
    fontSize: 16,
    fontWeight: "700",
  },
  manageCard: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
  creditCardVisual: {
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    minHeight: 80,
  },
  cardContent: {
    flex: 1,
  },
  cardType: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  limitSection: {
    marginBottom: 16,
  },
  limitLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  usageDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  usageLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  usedAmount: {
    fontSize: 18,
    fontWeight: "700",
  },
  usagePercentage: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalLimit: {
    fontSize: 16,
    fontWeight: "500",
  },
  dueDate: {
    fontSize: 14,
    fontWeight: "500",
  },
  viewBreakdownButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  viewBreakdownText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MobileCredit;
