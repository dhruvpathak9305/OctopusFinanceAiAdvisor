import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import ErrorBoundary from './ErrorBoundary';

interface Bill {
  id: number;
  name: string;
  amount: string;
  dueDate: string;
  status: 'due' | 'paid' | 'overdue';
  icon: string;
  category: string;
  isRecurring?: boolean;
}

interface UpcomingBillsSectionProps {
  className?: string;
}

const UpcomingBillsSection: React.FC<UpcomingBillsSectionProps> = ({ className }) => {
  const [selectedFilter, setSelectedFilter] = useState('Monthly');
  const [loading, setLoading] = useState(false);

  // Mock bills data - in production this would come from API
  const bills: Bill[] = [
    {
      id: 1,
      name: 'Electricity Bill',
      amount: '$95.50',
      dueDate: 'Jul 31',
      status: 'due',
      icon: '⚡',
      category: 'Utilities',
      isRecurring: true,
    },
    {
      id: 2,
      name: 'Netflix Subscription',
      amount: '$14.99',
      dueDate: 'Jul 31',
      status: 'due',
      icon: '📺',
      category: 'Subscriptions',
      isRecurring: true,
    },
    {
      id: 3,
      name: 'Water Bill',
      amount: '$45.75',
      dueDate: 'Jul 31',
      status: 'paid',
      icon: '💧',
      category: 'Utilities',
      isRecurring: true,
    },
  ];

  const filters = ['Monthly', 'Weekly', 'All Bills'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'due':
        return '#F59E0B';
      case 'paid':
        return '#10B981';
      case 'overdue':
        return '#EF4444';
      default:
        return '#9CA3AF';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'due':
        return 'Due Today';
      case 'paid':
        return 'Paid';
      case 'overdue':
        return 'Overdue';
      default:
        return status;
    }
  };

  const BillItem: React.FC<{ bill: Bill }> = ({ bill }) => (
    <TouchableOpacity style={styles.billItem} activeOpacity={0.8}>
      <View style={styles.billLeft}>
        <View style={[styles.billIcon, { backgroundColor: `${getStatusColor(bill.status)}15` }]}>
          <Text style={styles.billIconText}>{bill.icon}</Text>
        </View>
        <View style={styles.billDetails}>
          <Text style={styles.billName}>{bill.name}</Text>
          <View style={styles.billInfo}>
            <Text style={styles.billDueDate}>Due: {bill.dueDate}</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(bill.status)}20` }]}>
              <Text style={[styles.statusText, { color: getStatusColor(bill.status) }]}>
                {getStatusText(bill.status)}
              </Text>
            </View>
          </View>
          <View style={styles.billTags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{bill.category}</Text>
            </View>
            {bill.isRecurring && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>Monthly</Text>
              </View>
            )}
          </View>
        </View>

      </View>
      <Text style={[styles.billAmount, { color: getStatusColor(bill.status) }]}>{bill.amount}</Text>
    </TouchableOpacity>
  );

  const EmptyState: React.FC = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIconContainer}>
        <Text style={styles.emptyStateIcon}>📅</Text>
      </View>
      <Text style={styles.emptyStateTitle}>No upcoming bills</Text>
      <Text style={styles.emptyStateText}>
        Stay on top of your finances by adding your recurring bills
      </Text>
    </View>
  );

  const groupBillsByDate = () => {
    const today = new Date().toDateString();
    const grouped: { [key: string]: Bill[] } = { Today: [] };
    
    bills.forEach(bill => {
      // For demo purposes, group by "Today" - in production you'd parse actual dates
      if (bill.status === 'due') {
        grouped.Today.push(bill);
      }
    });
    
    return grouped;
  };

  const groupedBills = groupBillsByDate();

  return (
    <ErrorBoundary>
      <View style={[styles.section, className && { marginHorizontal: 0 }]}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Upcoming Bills</Text>
            <View style={styles.headerActions}>
              <View style={styles.filterGroup}>
                {filters.map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterButton,
                      selectedFilter === filter && styles.activeFilter,
                    ]}
                    onPress={() => setSelectedFilter(filter)}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        selectedFilter === filter && styles.activeFilterText,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.cardContent}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#10B981" />
                <Text style={styles.loadingText}>Loading bills...</Text>
              </View>
            ) : bills.length === 0 ? (
              <EmptyState />
            ) : (
              <ScrollView
                style={styles.billsList}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                {Object.entries(groupedBills).map(([date, dateBills]) => (
                  <View key={date}>
                    <View style={styles.dateHeader}>
                      <View style={styles.dateIcon}>
                        <Text style={styles.dateIconText}>📅</Text>
                      </View>
                      <Text style={styles.dateText}>{date}</Text>
                    </View>
                    {dateBills.map((bill) => (
                      <BillItem key={bill.id} bill={bill} />
                    ))}
                  </View>
                ))}
                
                {/* Show all bills */}
                <View style={styles.allBillsSection}>
                  {bills.filter(bill => bill.status === 'paid').map((bill) => (
                    <BillItem key={bill.id} bill={bill} />
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#374151',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  filterGroup: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 2,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeFilter: {
    backgroundColor: '#10B981',
  },
  filterText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  viewAllButton: {
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  billsList: {
    maxHeight: 420,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  dateIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dateIconText: {
    fontSize: 14,
  },
  dateText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#374151',
    borderRadius: 16,
    marginBottom: 12,
  },
  billLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  billIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  billIconText: {
    fontSize: 18,
  },
  billDetails: {
    flex: 1,
  },
  billName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 6,
  },
  billInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  billDueDate: {
    fontSize: 14,
    color: '#9CA3AF',
    marginRight: 12,
    opacity: 0.8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  billTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#1F2937',
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  billAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  allBillsSection: {
    marginTop: 16,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 12,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateIcon: {
    fontSize: 28,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
});

export default UpcomingBillsSection; export default UpcomingBillsSection; 
