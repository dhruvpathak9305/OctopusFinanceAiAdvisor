import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, darkTheme, lightTheme } from '../../../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

interface TravelExpense {
  id: string;
  destination: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  icon: string;
  color: string;
}

const MobileTravel: React.FC = () => {
  const { isDark } = useTheme();
  const colors = isDark ? darkTheme : lightTheme;
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Sample travel expense data
  const travelExpenses: TravelExpense[] = [
    {
      id: '1',
      destination: 'Goa Trip',
      category: 'Accommodation',
      amount: 15000,
      date: 'Aug 15, 2025',
      description: 'Beach resort booking',
      icon: 'bed',
      color: '#3B82F6',
    },
    {
      id: '2',
      destination: 'Mumbai Business',
      category: 'Transportation',
      amount: 8500,
      date: 'Aug 12, 2025',
      description: 'Flight tickets',
      icon: 'airplane',
      color: '#8B5CF6',
    },
    {
      id: '3',
      destination: 'Delhi Conference',
      category: 'Food & Dining',
      amount: 3200,
      date: 'Aug 10, 2025',
      description: 'Restaurant expenses',
      icon: 'restaurant',
      color: '#F59E0B',
    },
    {
      id: '4',
      destination: 'Goa Trip',
      category: 'Activities',
      amount: 5600,
      date: 'Aug 16, 2025',
      description: 'Water sports and tours',
      icon: 'boat',
      color: '#10B981',
    },
  ];

  const filters = ['All', 'Accommodation', 'Transportation', 'Food & Dining', 'Activities'];
  const totalAmount = travelExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const renderFilterButton = (filter: string) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterButton,
        {
          backgroundColor: selectedFilter === filter ? colors.primary : colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          {
            color: selectedFilter === filter ? 'white' : colors.text,
          },
        ]}
      >
        {filter}
      </Text>
    </TouchableOpacity>
  );

  const renderExpenseItem = ({ item }: { item: TravelExpense }) => (
    <TouchableOpacity style={[styles.expenseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.expenseIcon, { backgroundColor: `${item.color}20` }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <View style={styles.expenseDetails}>
        <Text style={[styles.destination, { color: colors.text }]}>{item.destination}</Text>
        <Text style={[styles.category, { color: colors.textSecondary }]}>{item.category}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>{item.date}</Text>
      </View>
      <Text style={[styles.amount, { color: item.color }]}>
        ₹{item.amount.toLocaleString('en-IN')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Travel Expenses
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Track your travel spending
          </Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <View style={styles.summaryHeader}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>Total Travel Spend</Text>
            <Text style={[styles.summaryAmount, { color: colors.primary }]}>
              ₹{totalAmount.toLocaleString('en-IN')}
            </Text>
          </View>
          <Text style={[styles.summarySubtitle, { color: colors.textSecondary }]}>
            This month • {travelExpenses.length} expenses
          </Text>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            {filters.map(renderFilterButton)}
          </ScrollView>
        </View>

        {/* Expenses List */}
        <View style={styles.expensesContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Expenses</Text>
          <FlatList
            data={travelExpenses.filter(expense => 
              selectedFilter === 'All' || expense.category === selectedFilter
            )}
            renderItem={renderExpenseItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>

      {/* Add Expense Button */}
      <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  summaryCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  summarySubtitle: {
    fontSize: 14,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filtersScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  expensesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  expenseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  expenseDetails: {
    flex: 1,
  },
  destination: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  category: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
});

export default MobileTravel;
