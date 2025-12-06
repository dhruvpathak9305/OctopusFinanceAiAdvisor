import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../../../../contexts/ThemeContext';

interface UpcomingBillsSectionProps {
  className?: string;
  useTestData?: boolean;
}

// Define bill types
interface Bill {
  id: number | string;
  name: string;
  type: string;
  dueDate: string;
  amount: string;
  category: string;
  subcategory: string;
  description: string;
  icon: string;
  status: 'due_today' | 'due_tomorrow' | 'due_week' | 'paid' | 'overdue';
  isAutoPay: boolean;
  paymentMethod: string;
  tags: string[];
}

// Define grouped bills type
interface GroupedBills {
  [dateKey: string]: {
    dateLabel: string;
    bills: Bill[];
  };
}

// Mock bill data matching the images
const mockBills: Bill[] = [
  // Today - August 6, 2025
  {
    id: 1,
    name: 'Electricity Bill',
    type: 'Utilities',
    dueDate: '2025-08-06',
    amount: '95.50',
    category: 'Utilities',
    subcategory: 'Electricity',
    description: 'Monthly electricity bill',
    icon: 'lightning',
    status: 'due_today',
    isAutoPay: false,
    paymentMethod: 'Manual',
    tags: ['Utilities', 'Electricity'],
  },
  {
    id: 2,
    name: 'Netflix Subscription',
    type: 'Subscriptions',
    dueDate: '2025-08-06',
    amount: '14.99',
    category: 'Subscriptions',
    subcategory: 'Streaming',
    description: 'Monthly streaming subscription',
    icon: 'tv',
    status: 'due_today',
    isAutoPay: true,
    paymentMethod: 'Chase Freedom',
    tags: ['Subscriptions', 'Streaming'],
  },
  {
    id: 3,
    name: 'Water Bill',
    type: 'Utilities',
    dueDate: '2025-08-06',
    amount: '45.70',
    category: 'Utilities',
    subcategory: 'Water',
    description: 'Monthly water utility',
    icon: 'water',
    status: 'paid',
    isAutoPay: false,
    paymentMethod: 'Manual',
    tags: ['Utilities', 'Water'],
  },
  // Tomorrow - August 7, 2025
  {
    id: 4,
    name: 'Phone Bill',
    type: 'Utilities',
    dueDate: '2025-08-07',
    amount: '85.00',
    category: 'Utilities',
    subcategory: 'Phone',
    description: 'Monthly cell phone bill',
    icon: 'phone',
    status: 'due_tomorrow',
    isAutoPay: true,
    paymentMethod: 'Checking Account',
    tags: ['Utilities', 'Phone'],
  },
  // Monday - August 11, 2025
  {
    id: 5,
    name: 'Internet Service',
    type: 'Utilities',
    dueDate: '2025-08-11',
    amount: '65.99',
    category: 'Utilities',
    subcategory: 'Internet',
    description: 'Monthly internet service',
    icon: 'wifi',
    status: 'due_week',
    isAutoPay: false,
    paymentMethod: 'Manual',
    tags: ['Utilities', 'Internet'],
  },
  {
    id: 6,
    name: 'Car Insurance',
    type: 'Insurance',
    dueDate: '2025-08-11',
    amount: '325.00',
    category: 'Insurance',
    subcategory: 'Auto',
    description: 'Quarterly car insurance premium',
    icon: 'document',
    status: 'due_week',
    isAutoPay: true,
    paymentMethod: 'Chase Freedom',
    tags: ['Insurance', 'Auto'],
  },
  // August 31, 2025
  {
    id: 7,
    name: 'Rent',
    type: 'Housing',
    dueDate: '2025-08-31',
    amount: '1450.00',
    category: 'Housing',
    subcategory: 'Rent',
    description: 'Monthly apartment rent',
    icon: 'home',
    status: 'due_week',
    isAutoPay: true,
    paymentMethod: 'Checking Account',
    tags: ['Housing', 'Rent'],
  },
  {
    id: 8,
    name: 'Amazon Prime',
    type: 'Subscriptions',
    dueDate: '2025-08-31',
    amount: '119.00',
    category: 'Subscriptions',
    subcategory: 'Shopping',
    description: 'Annual Amazon Prime membership',
    icon: 'shopping',
    status: 'due_week',
    isAutoPay: true,
    paymentMethod: 'Chase Freedom',
    tags: ['Subscriptions', 'Shopping'],
  },
];

// Group bills by date
const groupBillsByDate = (bills: Bill[]): GroupedBills => {
  const grouped: GroupedBills = {};
  
  bills.forEach(bill => {
    const dueDate = new Date(bill.dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let dateKey = '';
    let dateLabel = '';
    
    if (dueDate.toDateString() === today.toDateString()) {
      dateKey = 'today';
      dateLabel = 'Today';
    } else if (dueDate.toDateString() === tomorrow.toDateString()) {
      dateKey = 'tomorrow';
      dateLabel = 'Tomorrow';
    } else {
      const dayOfWeek = dueDate.toLocaleDateString('en-US', { weekday: 'long' });
      if (dayOfWeek === 'Monday') {
        dateKey = 'monday';
        dateLabel = 'Monday';
      } else {
        dateKey = dueDate.toISOString().split('T')[0];
        // Format date like "Aug, 05, 2025"
        dateLabel = dueDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: '2-digit', 
          year: 'numeric' 
        }).replace(',', ', ');
      }
    }
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        dateLabel,
        bills: [],
      };
    }
    
    grouped[dateKey].bills.push(bill);
  });
  
  // Sort bills within each group by due date
  Object.keys(grouped).forEach(key => {
    grouped[key].bills.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  });
  
  return grouped;
};

// Dropdown Component
const Dropdown: React.FC<{
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
  placeholder?: string;
}> = ({ value, options, onValueChange, placeholder }) => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const colors = isDark ? {
    background: '#374151',
    text: '#FFFFFF',
    border: '#4B5563',
  } : {
    background: '#F3F4F6',
    text: '#111827',
    border: '#D1D5DB',
  };

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={[styles.dropdownButton, { backgroundColor: colors.background, borderColor: colors.border }]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={[styles.dropdownButtonText, { color: colors.text }]}>
          {value || placeholder}
        </Text>
        <Text style={[styles.dropdownArrow, { color: colors.text }]}>
          {isOpen ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>
      
      {isOpen && (
        <View style={[styles.dropdownMenu, { backgroundColor: colors.background, borderColor: colors.border }]}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dropdownItem,
                value === option && { backgroundColor: '#10B98120' }
              ]}
              onPress={() => {
                onValueChange(option);
                setIsOpen(false);
              }}
            >
              <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                {option}
              </Text>
              {value === option && (
                <Text style={styles.dropdownCheckmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// Bill Group Component
const BillGroup: React.FC<{
  dateLabel: string;
  bills: Bill[];
  onEditBill: (id: number | string) => void;
  onDeleteBill: (id: number | string) => void;
}> = ({ dateLabel, bills, onEditBill, onDeleteBill }) => {
  const { isDark } = useTheme();
  
  const colors = isDark ? {
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
    card: '#1F2937',
  } : {
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    card: '#FFFFFF',
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(parseFloat(value));
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'due_today':
        return '#EF4444'; // Red
      case 'due_tomorrow':
        return '#F59E0B'; // Orange
      case 'due_week':
        return '#3B82F6'; // Blue
      case 'paid':
        return '#10B981'; // Green
      case 'overdue':
        return '#DC2626'; // Dark Red
      default:
        return '#6B7280'; // Gray
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'due_today':
        return 'Due Today';
      case 'due_tomorrow':
        return 'Due Tomorrow';
      case 'due_week':
        return '4 days';
      case 'paid':
        return 'Paid';
      case 'overdue':
        return 'Overdue';
      default:
        return '';
    }
  };

  const getIconName = (icon: string) => {
    const iconMap: { [key: string]: string } = {
      'lightning': '⚡',
      'tv': '📺',
      'water': '💧',
      'phone': '📞',
      'wifi': '📶',
      'document': '📄',
      'home': '🏠',
      'shopping': '🛍️',
    };
    return iconMap[icon] || '📄';
  };

  const getIconColor = (icon: string) => {
    const colorMap: { [key: string]: string } = {
      'lightning': '#10B981', // Green
      'tv': '#F59E0B', // Orange
      'water': '#06B6D4', // Teal
      'phone': '#3B82F6', // Blue
      'wifi': '#8B5CF6', // Purple
      'document': '#6B7280', // Gray
      'home': '#10B981', // Green
      'shopping': '#F59E0B', // Orange
    };
    return colorMap[icon] || '#6B7280';
  };

  return (
    <View style={[styles.billGroup, { borderBottomColor: colors.border }]}>
      {/* Date Header */}
      <View style={styles.dateHeader}>
        <Text style={styles.calendarIcon}>📅</Text>
        <Text style={[styles.dateText, { color: colors.text }]}>
          {dateLabel}
        </Text>
      </View>

      {/* Bills */}
      {bills.map((bill) => (
        <TouchableOpacity
          key={bill.id}
          style={[styles.billItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => onEditBill(bill.id)}
          onLongPress={() => {
            Alert.alert(
              'Delete Bill',
              'Are you sure you want to delete this bill?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => onDeleteBill(bill.id) }
              ]
            );
          }}
        >
          <View style={styles.billLeft}>
            <View style={[styles.billIcon, { backgroundColor: `${getIconColor(bill.icon)}20` }]}>
              <Text style={[styles.billIconText, { color: getIconColor(bill.icon) }]}>
                {getIconName(bill.icon)}
              </Text>
            </View>
            <View style={styles.billInfo}>
              <View style={styles.billHeader}>
                <Text style={[styles.billName, { color: colors.text }]}>
                  {bill.name}
                </Text>
                {bill.isAutoPay && (
                  <View style={styles.autoTag}>
                    <Text style={styles.autoTagText}>Auto</Text>
                  </View>
                )}
              </View>
              <View style={styles.billDetails}>
                <View style={styles.billDueDateRow}>
                  <Text style={[styles.billDueDate, { color: colors.textSecondary }]}>
                    Due: {formatDueDate(bill.dueDate)}
                  </Text>
                  <View style={styles.billTags}>
                    <View style={[styles.statusTag, { backgroundColor: getStatusColor(bill.status) }]}>
                      <Text style={styles.statusTagText}>
                        {getStatusText(bill.status)}
                      </Text>
                    </View>
                    {bill.paymentMethod !== 'Manual' && (
                      <View style={[styles.paymentMethodTag, { backgroundColor: colors.border }]}>
                        <Text style={[styles.paymentMethodText, { color: colors.textSecondary }]}>
                          {bill.paymentMethod}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.categoryTags}>
                  {bill.tags.map((tag, index) => (
                    <View key={index} style={[styles.categoryTag, { backgroundColor: colors.border }]}>
                      <Text style={[styles.categoryTagText, { color: colors.textSecondary }]}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
                <Text style={[styles.billDescription, { color: colors.textSecondary }]}>
                  💬 {bill.description.length > 15 ? `${bill.description.substring(0, 15)}...` : bill.description}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.billRight}>
            <Text style={[styles.billAmount, { color: colors.text }]}>
              {formatCurrency(bill.amount)}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const UpcomingBillsSection: React.FC<UpcomingBillsSectionProps> = ({
  className = "",
  useTestData = true,
}) => {
  const { isDark } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState("This Week");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = isDark ? {
    background: '#1F2937',
    card: '#1F2937',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
    filterBackground: '#374151',
  } : {
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    filterBackground: '#F3F4F6',
  };

  // Filter bills based on selected period
  const getFilteredBills = () => {
    const now = new Date();
    const filtered = mockBills.filter(bill => {
      const dueDate = new Date(bill.dueDate);
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (selectedFilter.toLowerCase()) {
        case 'this week':
          return diffDays >= 0 && diffDays <= 7;
        case 'monthly':
          return diffDays >= 0 && diffDays <= 30;
        case 'all bills':
          return true;
        default:
          return true;
      }
    });
    
    return filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const filteredBills = getFilteredBills();
  const groupedBills = groupBillsByDate(filteredBills);

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  const handleEditBill = useCallback((billId: number | string) => {
    // In a real app, this would open an edit dialog
    Alert.alert('Edit Bill', `Edit bill ${billId}`);
  }, []);

  const handleDeleteBill = useCallback(async (billId: number | string) => {
    // In a real app, this would delete from the database
    Alert.alert('Delete Bill', `Bill ${billId} deleted successfully`);
  }, []);

  const handleViewAll = () => {
    // In a real app, this would navigate to bills page
    Alert.alert('View All', 'Navigate to bills page');
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading bills...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: colors.text }]}>Upcoming Bills</Text>
          </View>

          <View style={styles.headerRight}>
            {/* Filter */}
            <Dropdown
              value={selectedFilter}
              options={['This Week', 'Monthly', 'All Bills']}
              onValueChange={handleFilterChange}
              placeholder="Select period"
            />

            {/* View All Button */}
            <TouchableOpacity onPress={handleViewAll}>
              <Text style={[styles.viewAllText, { color: '#10B981' }]}>View all</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: '#EF4444' }]}>{error}</Text>
            </View>
          ) : Object.keys(groupedBills).length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Creative Empty State Icon - Calendar with checkmark */}
              <View style={styles.emptyIconWrapper}>
                <View style={[styles.emptyIconOuter, { backgroundColor: '#10B98115' }]}>
                  <View style={[styles.emptyIconInner, { backgroundColor: '#10B98125' }]}>
                    {/* Calendar shape */}
                    <View style={styles.calendarIcon}>
                      <View style={[styles.calendarTop, { backgroundColor: '#10B981' }]}>
                        <View style={styles.calendarRing} />
                        <View style={styles.calendarRing} />
                      </View>
                      <View style={[styles.calendarBody, { backgroundColor: '#1F2937' }]}>
                        <Text style={styles.checkmark}>✓</Text>
                      </View>
                    </View>
                  </View>
                </View>
                {/* Celebration accents */}
                <View style={[styles.confetti, styles.confetti1, { backgroundColor: '#10B981' }]} />
                <View style={[styles.confetti, styles.confetti2, { backgroundColor: '#34D399' }]} />
                <View style={[styles.confetti, styles.confetti3, { backgroundColor: '#6EE7B7' }]} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>All Clear!</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                You're all caught up with your bills!{'\n'}Enjoy your peace of mind.
              </Text>
            </View>
          ) : (
            <ScrollView 
              style={styles.billsList}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {Object.entries(groupedBills).map(([dateKey, dateData]) => (
                <BillGroup
                  key={dateKey}
                  dateLabel={dateData.dateLabel}
                  bills={dateData.bills}
                  onEditBill={handleEditBill}
                  onDeleteBill={handleDeleteBill}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
  },
  dropdownButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dropdownArrow: {
    fontSize: 10,
    marginLeft: 4,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownItemText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dropdownCheckmark: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyIconWrapper: {
    position: 'relative',
    marginBottom: 20,
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarTop: {
    width: 32,
    height: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: -3,
  },
  calendarRing: {
    width: 4,
    height: 8,
    backgroundColor: '#0D9668',
    borderRadius: 2,
    marginTop: -4,
  },
  calendarBody: {
    width: 32,
    height: 24,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: '#10B981',
  },
  checkmark: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '800',
  },
  confetti: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  confetti1: {
    top: 10,
    right: 15,
    transform: [{ rotate: '45deg' }],
  },
  confetti2: {
    bottom: 18,
    left: 12,
    width: 5,
    height: 5,
  },
  confetti3: {
    top: 30,
    left: 8,
    width: 4,
    height: 4,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B98120',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  billsList: {
    maxHeight: 350, // Reduced from 450
  },
  billGroup: {
    borderBottomWidth: 1,
    paddingBottom: 8, // Reduced from 12
    marginBottom: 8, // Reduced from 12
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6, // Reduced from 8
  },
  calendarIcon: {
    fontSize: 14, // Reduced from 16
    marginRight: 6, // Reduced from 8
  },
  dateText: {
    fontSize: 13, // Reduced from 14
    fontWeight: '600',
  },
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 8, // Reduced from 12
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6, // Reduced from 8
  },
  billLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  billIcon: {
    width: 32, // Reduced from 40
    height: 32, // Reduced from 40
    borderRadius: 16, // Reduced from 20
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8, // Reduced from 12
  },
  billIconText: {
    fontSize: 14, // Reduced from 16
  },
  billInfo: {
    flex: 1,
  },
  billHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  billName: {
    fontSize: 13, // Reduced from 14
    fontWeight: '600',
    marginRight: 6, // Reduced from 8
  },
  autoTag: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 4, // Reduced from 6
    paddingVertical: 1, // Reduced from 2
    borderRadius: 10, // Reduced from 12
  },
  autoTagText: {
    fontSize: 9, // Reduced from 10
    color: '#10B981',
    fontWeight: '600',
  },
  billDetails: {
    flexDirection: 'column',
    gap: 2, // Reduced spacing
  },
  billDueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2, // Reduced from 4
  },
  billDueDate: {
    fontSize: 11, // Reduced from 12
    marginRight: 6, // Reduced from 8
  },
  billTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // Reduced from 6
    marginRight: 6, // Reduced from 8
  },
  statusTag: {
    paddingHorizontal: 6, // Reduced from 8
    paddingVertical: 1, // Reduced from 2
    borderRadius: 10, // Reduced from 12
  },
  statusTagText: {
    fontSize: 9, // Reduced from 10
    color: '#FFFFFF',
    fontWeight: '600',
  },
  paymentMethodTag: {
    paddingHorizontal: 4, // Reduced from 6
    paddingVertical: 1, // Reduced from 2
    borderRadius: 10, // Reduced from 12
  },
  paymentMethodText: {
    fontSize: 9, // Reduced from 10
    fontWeight: '500',
  },
  categoryTags: {
    flexDirection: 'row',
    gap: 3, // Reduced from 4
    marginRight: 6, // Reduced from 8
  },
  categoryTag: {
    paddingHorizontal: 4, // Reduced from 6
    paddingVertical: 1, // Reduced from 2
    borderRadius: 10, // Reduced from 12
  },
  categoryTagText: {
    fontSize: 9, // Reduced from 10
    fontWeight: '500',
  },
  billDescription: {
    fontSize: 10, // Reduced from 11
    lineHeight: 14, // Reduced from 16
    flex: 1,
  },
  billRight: {
    alignItems: 'flex-end',
  },
  billAmount: {
    fontSize: 14, // Reduced from 16
    fontWeight: '700',
  },
});

export default UpcomingBillsSection; 