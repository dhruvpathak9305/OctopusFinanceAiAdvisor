import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useFinancialData } from "../../hooks/useFinancialData";
import { ChatContainer } from "../../components/Chat";

// Import components
import Header from "./Header";
import BudgetProgressSection from "./BudgetProgressSection";
import RecentTransactionsSection from "./RecentTransactionsSection";
import RecentTransactionsErrorBoundary from "./RecentTransactionsErrorBoundary";
import UpcomingBillsSection from "./UpcomingBillsSection";
import QuickAddButton from "../../components/QuickAddButton";

// Import Financial Summary cards
import {
  NetWorthCard,
  AccountsCard,
  CreditCardCard,
  MonthlyIncomeCard,
  MonthlyExpenseCard,
  FinancialDashboardCompact,
} from "../../components/FinancialSummary";

// Card background images - using placeholder URLs
const cardBackgroundImages = {
  netWorth:
    "https://readdy.ai/api/search-image?query=abstract%20financial%20chart%20with%20green%20upward%20trend%20line%20on%20soft%20white%20background%2C%20minimalist%20design%2C%20clean%20professional%20look%2C%20subtle%20grid%20pattern%2C%20financial%20data%20visualization%2C%20centered%20composition%2C%20high%20quality%20rendering&width=300&height=150&seq=1&orientation=landscape",
  accounts:
    "https://readdy.ai/api/search-image?query=abstract%20banking%20chart%20with%20blue%20line%20graph%20on%20clean%20white%20background%2C%20minimalist%20financial%20data%20visualization%2C%20subtle%20grid%20pattern%2C%20professional%20look%2C%20centered%20composition%2C%20high%20quality%20rendering%2C%20soft%20gradients&width=300&height=150&seq=2&orientation=landscape",
  creditCard:
    "https://readdy.ai/api/search-image?query=abstract%20credit%20card%20debt%20visualization%20with%20red%20downward%20trend%20line%20on%20clean%20white%20background%2C%20minimalist%20financial%20chart%2C%20subtle%20grid%20pattern%2C%20professional%20look%2C%20centered%20composition%2C%20high%20quality%20rendering&width=300&height=150&seq=3&orientation=landscape",
  income:
    "https://readdy.ai/api/search-image?query=abstract%20income%20chart%20with%20green%20upward%20trend%20line%20on%20clean%20white%20background%2C%20minimalist%20financial%20visualization%2C%20subtle%20grid%20pattern%2C%20professional%20look%2C%20centered%20composition%2C%20high%20quality%20rendering%2C%20monthly%20data%20points&width=300&height=150&seq=4&orientation=landscape",
  expenses:
    "https://readdy.ai/api/search-image?query=abstract%20expense%20chart%20with%20orange%20trend%20line%20on%20clean%20white%20background%2C%20minimalist%20financial%20visualization%2C%20subtle%20grid%20pattern%2C%20professional%20look%2C%20centered%20composition%2C%20high%20quality%20rendering%2C%20monthly%20spending%20visualization&width=300&height=150&seq=5&orientation=landscape",
};

// Tab Component
const TabButton: React.FC<{
  title: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    tabBackground: string;
    activeTab: string;
  };
}> = ({ title, icon, isActive, onPress, colors }) => {
  return (
    <TouchableOpacity
      style={[
        styles.tabButton,
        { backgroundColor: isActive ? colors.activeTab : "transparent" },
      ]}
      onPress={onPress}
    >
      <Text
        style={[styles.tabIcon, { color: isActive ? "#FFFFFF" : colors.text }]}
      >
        {icon}
      </Text>
      <Text
        style={[styles.tabText, { color: isActive ? "#FFFFFF" : colors.text }]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default function MobileDashboard() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("overview");
  const [useTestData, setUseTestData] = useState(true);
  const [isExpandedView, setIsExpandedView] = useState(true);
  const financialData = useFinancialData();

  const colors = isDark
    ? {
        background: "#0B1426",
        card: "#1F2937",
        text: "#FFFFFF",
        textSecondary: "#9CA3AF",
        border: "#374151",
        tabBackground: "#374151",
        activeTab: "#10B981",
      }
    : {
        background: "#FFFFFF",
        card: "#FFFFFF",
        text: "#111827",
        textSecondary: "#6B7280",
        border: "#E5E7EB",
        tabBackground: "#F3F4F6",
        activeTab: "#10B981",
      };

  const renderFinancialCards = () => {
    if (isExpandedView) {
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cardsContainer}
          contentContainerStyle={styles.cardsContent}
        >
          <NetWorthCard backgroundImage={cardBackgroundImages.netWorth} />
          <AccountsCard backgroundImage={cardBackgroundImages.accounts} />
          <CreditCardCard backgroundImage={cardBackgroundImages.creditCard} />
          <MonthlyIncomeCard backgroundImage={cardBackgroundImages.income} />
          <MonthlyExpenseCard backgroundImage={cardBackgroundImages.expenses} />
        </ScrollView>
      );
    } else {
      return (
        <FinancialDashboardCompact
          netWorthData={financialData.netWorth}
          accountsData={financialData.accounts}
          creditCardData={financialData.creditCards}
          incomeData={financialData.income}
          expensesData={financialData.expenses}
        />
      );
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            <BudgetProgressSection />
            <RecentTransactionsErrorBoundary>
              <RecentTransactionsSection />
            </RecentTransactionsErrorBoundary>
            <UpcomingBillsSection useTestData={useTestData} />
          </>
        );
      case "sms":
        return (
          <View
            style={[
              styles.tabContentPlaceholder,
              { backgroundColor: colors.card },
            ]}
          >
            <Text style={styles.tabContentIcon}>💬</Text>
            <Text style={[styles.tabContentTitle, { color: colors.text }]}>
              SMS Analysis
            </Text>
            <Text
              style={[styles.tabContentText, { color: colors.textSecondary }]}
            >
              AI-powered analysis of your transaction SMS messages coming soon.
            </Text>
          </View>
        );
      case "advisor":
        return (
          <View style={styles.chatContainer}>
            <ChatContainer colors={colors} isDark={isDark} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Header
          isExpandedView={isExpandedView}
          onToggleView={() => setIsExpandedView(!isExpandedView)}
        />

        {/* Financial Summary Cards */}
        {renderFinancialCards()}

        {/* Tabs */}
        <View
          style={[
            styles.tabsContainer,
            {
              backgroundColor: colors.tabBackground,
              borderColor: colors.border,
            },
          ]}
        >
          <TabButton
            title="Overview"
            icon="📊"
            isActive={activeTab === "overview"}
            onPress={() => setActiveTab("overview")}
            colors={colors}
          />
          <TabButton
            title="SMS Analysis"
            icon="💬"
            isActive={activeTab === "sms"}
            onPress={() => setActiveTab("sms")}
            colors={colors}
          />
          <TabButton
            title="AI Advisor"
            icon="🤖"
            isActive={activeTab === "advisor"}
            onPress={() => setActiveTab("advisor")}
            colors={colors}
          />
        </View>

        {/* Tab Content */}
        <View
          style={[styles.tabContent, { backgroundColor: colors.background }]}
        >
          {renderTabContent()}
        </View>
      </ScrollView>

      {/* Quick Add Button - Only show when not on advisor tab */}
      {activeTab !== "advisor" && <QuickAddButton />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  cardsContainer: {
    marginBottom: 20,
  },
  cardsContent: {
    paddingHorizontal: 20,
  },
  tabsContainer: {
    flexDirection: "row",
    margin: 20,
    marginBottom: 10,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  tabText: {
    fontSize: 11,
    fontWeight: "600",
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  tabContentPlaceholder: {
    alignItems: "center",
    paddingVertical: 40,
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tabContentIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  tabContentTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  tabContentText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  chatContainer: {
    flex: 1,
    height: 600, // Adjust as needed for your design
    marginBottom: 20,
    marginTop: 0,
    borderRadius: 12,
    overflow: "hidden",
  },
});
