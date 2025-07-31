import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';

const { width } = Dimensions.get('window');

// Mock financial data
const financialData = {
  netWorth: {
    value: '$42,680',
    change: '+3.6%',
    trend: 'up',
  },
  accounts: {
    value: '$4,000.00',
    change: '+1.0%',
    trend: 'up',
  },
  creditCardDebt: {
    value: '$2,000.00',
    change: '-2.7%',
    trend: 'down',
  },
  monthlyIncome: {
    value: '$4,850.00',
    change: '+3.8%',
    trend: 'up',
  },
  monthlyExpenses: {
    value: '$3,280.45',
    change: '+2.2%',
    trend: 'up',
  },
};

// Mock transactions data
const recentTransactions = [
  { id: 1, category: 'Home Decor', date: 'May 14', amount: '$125.00', type: 'expense' },
  { id: 2, category: 'Healthcare', date: 'May 13', amount: '$220.50', type: 'expense' },
  { id: 3, category: 'Transportation', date: 'May 12', amount: '$45.00', type: 'expense' },
  { id: 4, category: 'Utilities', date: 'May 11', amount: '$157.75', type: 'expense' },
  { id: 5, category: 'Subscriptions', date: 'May 10', amount: '$15.99', type: 'expense' },
];

// Mock bills data
const upcomingBills = [
  { id: 1, name: 'Rent', amount: '$1,050.00', dueDate: 'Apr 30' },
  { id: 2, name: 'Electricity', amount: '$85.32', dueDate: 'Apr 15' },
  { id: 3, name: 'Internet', amount: '$65.99', dueDate: 'Apr 21' },
];

// Financial Summary Card Component
const FinancialCard: React.FC<{
  title: string;
  value: string;
  change: string;
  trend: string;
  icon: string;
}> = ({ title, value, change, trend, icon }) => {
  const isPositive = trend === 'up';
  return (
    <View style={styles.financialCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={[styles.cardChange, { color: isPositive ? '#10B981' : '#EF4444' }]}>
        {isPositive ? '↗ ' : '↘ '}{change}
      </Text>
    </View>
  );
};

// Budget Progress Component
const BudgetProgressSection: React.FC = () => {
  const budgetCategories = [
    { name: 'Needs', percentage: 65, color: '#10B981' },
    { name: 'Wants', percentage: 30, color: '#3B82F6' },
    { name: 'Savings', percentage: 5, color: '#F59E0B' },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Budget Overview</Text>
      {budgetCategories.map((category, index) => (
        <View key={index} style={styles.budgetItem}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetLabel}>{category.name}</Text>
            <Text style={styles.budgetPercentage}>{category.percentage}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${category.percentage}%`,
                  backgroundColor: category.color,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

// Recent Transactions Component
const RecentTransactionsSection: React.FC = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      {recentTransactions.map((transaction) => (
        <View key={transaction.id} style={styles.transactionItem}>
          <View style={styles.transactionLeft}>
            <Text style={styles.transactionCategory}>{transaction.category}</Text>
            <Text style={styles.transactionDate}>{transaction.date}</Text>
          </View>
          <Text style={[styles.transactionAmount, { color: '#EF4444' }]}>
            -{transaction.amount}
          </Text>
        </View>
      ))}
      <TouchableOpacity style={styles.viewAllButton}>
        <Text style={styles.viewAllText}>View All Transactions</Text>
      </TouchableOpacity>
    </View>
  );
};

// Upcoming Bills Component
const UpcomingBillsSection: React.FC = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Upcoming Bills</Text>
      {upcomingBills.map((bill) => (
        <View key={bill.id} style={styles.billItem}>
          <View style={styles.billLeft}>
            <Text style={styles.billName}>{bill.name}</Text>
            <Text style={styles.billDueDate}>Due {bill.dueDate}</Text>
          </View>
          <Text style={styles.billAmount}>{bill.amount}</Text>
        </View>
      ))}
      <TouchableOpacity style={styles.viewAllButton}>
        <Text style={styles.viewAllText}>View All Bills</Text>
      </TouchableOpacity>
    </View>
  );
};

// Tab Component
const TabButton: React.FC<{
  title: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
}> = ({ title, icon, isActive, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
    >
      <Text style={[styles.tabIcon, isActive && styles.activeTabIcon]}>{icon}</Text>
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>{title}</Text>
    </TouchableOpacity>
  );
};

const MobileDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderFinancialCards = () => {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsContainer}>
        <FinancialCard
          title="Net Worth"
          value={financialData.netWorth.value}
          change={financialData.netWorth.change}
          trend={financialData.netWorth.trend}
          icon="💰"
        />
        <FinancialCard
          title="Bank Accounts"
          value={financialData.accounts.value}
          change={financialData.accounts.change}
          trend={financialData.accounts.trend}
          icon="🏦"
        />
        <FinancialCard
          title="Credit Card Debt"
          value={financialData.creditCardDebt.value}
          change={financialData.creditCardDebt.change}
          trend={financialData.creditCardDebt.trend}
          icon="💳"
        />
        <FinancialCard
          title="Monthly Income"
          value={financialData.monthlyIncome.value}
          change={financialData.monthlyIncome.change}
          trend={financialData.monthlyIncome.trend}
          icon="📈"
        />
        <FinancialCard
          title="Monthly Expenses"
          value={financialData.monthlyExpenses.value}
          change={financialData.monthlyExpenses.change}
          trend={financialData.monthlyExpenses.trend}
          icon="📊"
        />
      </ScrollView>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <BudgetProgressSection />
            <RecentTransactionsSection />
            <UpcomingBillsSection />
          </>
        );
      case 'sms':
        return (
          <View style={styles.tabContentPlaceholder}>
            <Text style={styles.tabContentIcon}>💬</Text>
            <Text style={styles.tabContentTitle}>SMS Analysis</Text>
            <Text style={styles.tabContentText}>
              AI-powered analysis of your transaction SMS messages coming soon.
            </Text>
          </View>
        );
      case 'advisor':
        return (
          <View style={styles.tabContentPlaceholder}>
            <Text style={styles.tabContentIcon}>🤖</Text>
            <Text style={styles.tabContentTitle}>Financial Advisor</Text>
            <Text style={styles.tabContentText}>
              Get personalized financial advice from our AI advisor.
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>Track, analyze, and optimize your finances</Text>
        </View>

        {/* Financial Summary Cards */}
        {renderFinancialCards()}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TabButton
            title="Overview"
            icon="📊"
            isActive={activeTab === 'overview'}
            onPress={() => setActiveTab('overview')}
          />
          <TabButton
            title="SMS Analysis"
            icon="💬"
            isActive={activeTab === 'sms'}
            onPress={() => setActiveTab('sms')}
          />
          <TabButton
            title="AI Advisor"
            icon="🤖"
            isActive={activeTab === 'advisor'}
            onPress={() => setActiveTab('advisor')}
          />
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>
      </ScrollView>

      {/* Quick Add Button */}
      <TouchableOpacity style={styles.quickAddButton}>
        <Text style={styles.quickAddIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1426',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '500',
  },
  cardsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  financialCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: width * 0.7,
    borderWidth: 1,
    borderColor: '#374151',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    margin: 20,
    marginBottom: 10,
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#374151',
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  activeTabIcon: {
    // Icon styling when active
  },
  tabText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#10B981',
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  budgetItem: {
    marginBottom: 16,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  budgetPercentage: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  billLeft: {
    flex: 1,
  },
  billName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  billDueDate: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F59E0B',
  },
  viewAllButton: {
    backgroundColor: '#374151',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  viewAllText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  tabContentPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  tabContentIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  tabContentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tabContentText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
  quickAddButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#10B981',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  quickAddIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default MobileDashboard; 