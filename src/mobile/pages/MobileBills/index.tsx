import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../../contexts/ThemeContext';

// Import all bill components from UpcomingBillsSection
// These are exported from UpcomingBillsSection for reuse
import {
  SmartBillDetection,
  LateFeeAlert,
  BudgetIntegration,
  BillComparisonCard,
  BillNegotiationTips,
  CalendarView,
  BillHistoryModal,
  BillSplitModal,
  LinkTransactionModal,
  BillReminderModal,
  ExportBillsModal,
  BillPaymentModal,
  BillOCRScannerModal,
  HouseholdModeModal,
  CategoryFilter,
  BillAnalytics,
  BillGroup,
  groupBillsByDate,
} from '../MobileDashboard/UpcomingBillsSection';

// Import types
import type {
  Bill,
  BillReminder,
  PaymentRecord,
  PaymentReceipt,
} from '../MobileDashboard/UpcomingBillsSection';

interface MobileBillsProps {
  className?: string;
}

// Mock bill data - in real app, fetch from service
const mockBills: Bill[] = [
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
    lateFee: '15.00',
    gracePeriodDays: 5,
    isRecurring: true,
    recurringFrequency: 'monthly',
  },
  {
    id: 2,
    name: 'Phone Bill',
    type: 'Utilities',
    dueDate: '2025-08-07',
    amount: '75.00',
    category: 'Utilities',
    subcategory: 'Phone',
    description: 'Monthly phone service',
    icon: 'call',
    status: 'due_tomorrow',
    isAutoPay: false,
    paymentMethod: 'Manual',
    tags: ['Utilities', 'Phone'],
    lateFee: '10.00',
    gracePeriodDays: 3,
  },
  {
    id: 3,
    name: 'Netflix',
    type: 'Subscriptions',
    dueDate: '2025-08-10',
    amount: '15.99',
    category: 'Subscriptions',
    subcategory: 'Entertainment',
    description: 'Monthly Netflix subscription',
    icon: 'tv',
    status: 'due_week',
    isAutoPay: true,
    paymentMethod: 'Chase Freedom',
    tags: ['Subscriptions', 'Entertainment'],
    isRecurring: true,
    recurringFrequency: 'monthly',
  },
  {
    id: 4,
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
    isRecurring: true,
    recurringFrequency: 'monthly',
  },
];

// groupBillsByDate is imported from UpcomingBillsSection

const MobileBills: React.FC<MobileBillsProps> = ({ className = "" }) => {
  const { isDark } = useTheme();
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState("This Week");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyBill, setHistoryBill] = useState<Bill | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitBill, setSplitBill] = useState<Bill | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkBill, setLinkBill] = useState<Bill | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderBill, setReminderBill] = useState<Bill | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBudgetIntegration, setShowBudgetIntegration] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentBill, setPaymentBill] = useState<Bill | null>(null);
  const [showOCRScanner, setShowOCRScanner] = useState(false);
  const [showHouseholdModal, setShowHouseholdModal] = useState(false);
  
  // Form state for Add/Edit modal
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    category: 'Utilities',
    description: '',
    isAutoPay: false,
    isRecurring: false,
    recurringFrequency: 'monthly' as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
  });

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

  // Filter bills based on selected period and category
  const getFilteredBills = () => {
    const now = new Date();
    const filtered = bills.filter(bill => {
      if (selectedCategory !== 'All' && bill.category !== selectedCategory) {
        return false;
      }

      const dueDate = new Date(bill.dueDate);
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (selectedFilter.toLowerCase()) {
        case 'this week':
          return diffDays >= -7 && diffDays <= 7;
        case 'monthly':
          return diffDays >= -30 && diffDays <= 30;
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

  // All handler functions - same as dashboard but for full page
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleViewHistory = useCallback((billId: number | string) => {
    const bill = bills.find(b => b.id === billId);
    if (bill) {
      setHistoryBill(bill);
      setShowHistoryModal(true);
    }
  }, [bills]);

  const handleMarkAsPaid = useCallback((billId: number | string) => {
    Alert.alert(
      'Mark as Paid',
      'Are you sure you want to mark this bill as paid?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Paid',
          onPress: () => {
            setBills(prevBills =>
              prevBills.map(bill => {
                if (bill.id === billId) {
                  const paymentRecord: PaymentRecord = {
                    id: Date.now(),
                    paidDate: new Date().toISOString().split('T')[0],
                    amount: bill.amount,
                    paymentMethod: bill.paymentMethod || 'Manual',
                  };

                  return {
                    ...bill,
                    status: 'paid' as const,
                    paymentHistory: [...(bill.paymentHistory || []), paymentRecord],
                  };
                }
                return bill;
              })
            );
          },
        },
      ]
    );
  }, []);

  const handleEditBill = useCallback((billId: number | string) => {
    const bill = bills.find(b => b.id === billId);
    if (bill) {
      setEditingBill(bill);
      setFormData({
        name: bill.name,
        amount: bill.amount,
        dueDate: bill.dueDate,
        category: bill.category,
        description: bill.description,
        isAutoPay: bill.isAutoPay,
        isRecurring: bill.isRecurring || false,
        recurringFrequency: bill.recurringFrequency || 'monthly',
      });
      setShowAddModal(true);
    }
  }, [bills]);

  const handleDeleteBill = useCallback((billId: number | string) => {
    Alert.alert(
      'Delete Bill',
      'Are you sure you want to delete this bill?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setBills(prevBills => prevBills.filter(bill => bill.id !== billId)),
        },
      ]
    );
  }, []);

  const handleAddBill = () => {
    setEditingBill(null);
    setFormData({
      name: '',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0],
      category: 'Utilities',
      description: '',
      isAutoPay: false,
      isRecurring: false,
      recurringFrequency: 'monthly',
    });
    setShowAddModal(true);
  };

  const getCategoryIcon = (category: string): string => {
    const iconMap: { [key: string]: string } = {
      'Utilities': 'lightning',
      'Subscriptions': 'tv',
      'Insurance': 'document',
      'Rent': 'home',
      'Loan': 'document',
      'Other': 'document',
    };
    return iconMap[category] || 'document';
  };

  const handleSaveBill = () => {
    if (!formData.name || !formData.amount) {
      Alert.alert('Error', 'Please fill in bill name and amount');
      return;
    }

    if (editingBill) {
      setBills(prevBills =>
        prevBills.map(bill =>
          bill.id === editingBill.id
            ? {
                ...bill,
                name: formData.name,
                amount: formData.amount,
                dueDate: formData.dueDate,
                category: formData.category,
                type: formData.category,
                description: formData.description,
                isAutoPay: formData.isAutoPay,
                isRecurring: formData.isRecurring,
                recurringFrequency: formData.recurringFrequency,
                tags: [formData.category],
              }
            : bill
        )
      );
    } else {
      const newBill: Bill = {
        id: Date.now(),
        name: formData.name,
        type: formData.category,
        dueDate: formData.dueDate,
        amount: formData.amount,
        category: formData.category,
        subcategory: formData.category,
        description: formData.description || `${formData.name} payment`,
        icon: getCategoryIcon(formData.category),
        status: 'due_week',
        isAutoPay: formData.isAutoPay,
        paymentMethod: formData.isAutoPay ? 'Auto Pay' : 'Manual',
        tags: [formData.category],
        isRecurring: formData.isRecurring,
        recurringFrequency: formData.recurringFrequency,
        paymentHistory: [],
      };
      setBills(prevBills => [...prevBills, newBill]);
    }

    setShowAddModal(false);
    setEditingBill(null);
  };

  const handleSplitBill = useCallback((billId: number | string) => {
    const bill = bills.find(b => b.id === billId);
    if (bill) {
      setSplitBill(bill);
      setShowSplitModal(true);
    }
  }, [bills]);

  const handleSaveSplit = useCallback((updatedBill: Bill) => {
    setBills(prevBills =>
      prevBills.map(bill =>
        bill.id === updatedBill.id ? updatedBill : bill
      )
    );
    setShowSplitModal(false);
    setSplitBill(null);
  }, []);

  const handleOpenLinkModal = useCallback((billId: number | string) => {
    const bill = bills.find(b => b.id === billId);
    if (bill) {
      setLinkBill(bill);
      setShowLinkModal(true);
    }
  }, [bills]);

  const handleLinkTransaction = useCallback((billId: number | string, transactionId: string) => {
    setBills(prevBills =>
      prevBills.map(bill =>
        bill.id === billId
          ? { ...bill, linkedTransactionId: transactionId }
          : bill
      )
    );
    Alert.alert('Linked!', 'Bill has been linked to the transaction.');
    setShowLinkModal(false);
    setLinkBill(null);
  }, []);

  const handleOpenReminderModal = useCallback((billId: number | string) => {
    const bill = bills.find(b => b.id === billId);
    if (bill) {
      setReminderBill(bill);
      setShowReminderModal(true);
    }
  }, [bills]);

  const handleSaveReminder = useCallback((billId: number | string, reminder: BillReminder) => {
    setBills(prevBills =>
      prevBills.map(bill =>
        bill.id === billId
          ? { ...bill, reminder }
          : bill
      )
    );
    if (reminder.enabled) {
      Alert.alert('Reminder Set!', `You'll be notified ${reminder.daysBefore} day${reminder.daysBefore > 1 ? 's' : ''} before this bill is due.`);
    } else {
      Alert.alert('Reminder Removed', 'The reminder for this bill has been disabled.');
    }
    setShowReminderModal(false);
    setReminderBill(null);
  }, []);

  const handleAddDetectedBill = useCallback((partialBill: Partial<Bill>) => {
    const newBill: Bill = {
      id: Date.now(),
      name: partialBill.name || 'New Bill',
      type: partialBill.category || 'Other',
      dueDate: partialBill.dueDate || new Date().toISOString().split('T')[0],
      amount: partialBill.amount || '0',
      category: partialBill.category || 'Other',
      subcategory: partialBill.category || 'Other',
      description: partialBill.description || '',
      icon: getCategoryIcon(partialBill.category || 'Other'),
      status: 'due_week',
      isAutoPay: false,
      paymentMethod: 'Manual',
      tags: [partialBill.category || 'Other'],
      isRecurring: partialBill.isRecurring,
      recurringFrequency: partialBill.recurringFrequency,
      paymentHistory: [],
    };
    setBills(prevBills => [...prevBills, newBill]);
    Alert.alert('Bill Added', `${newBill.name} has been added to your bills.`);
  }, []);

  const handleOpenPayment = useCallback((billId: number | string) => {
    const bill = bills.find(b => b.id === billId);
    if (bill) {
      setPaymentBill(bill);
      setShowPaymentModal(true);
    }
  }, [bills]);

  const handlePaymentComplete = useCallback((billId: number | string, paymentMethod: string, receipt?: PaymentReceipt) => {
    setBills(prevBills =>
      prevBills.map(bill =>
        bill.id === billId
          ? {
              ...bill,
              status: 'paid' as const,
              paymentMethod,
              paymentHistory: [
                ...(bill.paymentHistory || []),
                {
                  id: receipt?.id || Date.now().toString(),
                  paidDate: receipt?.paidDate || new Date().toISOString().split('T')[0],
                  amount: bill.amount,
                  paymentMethod,
                  notes: receipt 
                    ? `Paid via ${paymentMethod} - Receipt: ${receipt.receiptNumber}` 
                    : `Paid via ${paymentMethod}`,
                },
              ],
            }
          : bill
      )
    );
    setShowPaymentModal(false);
    setPaymentBill(null);
    if (receipt) {
      Alert.alert('Payment Successful', `Receipt #${receipt.receiptNumber} has been saved.`);
    }
  }, []);

  const handleOCRBillDetected = useCallback((billData: Partial<Bill>) => {
    const newBill: Bill = {
      id: Date.now(),
      name: billData.name || 'Scanned Bill',
      type: billData.category || 'Other',
      dueDate: billData.dueDate || new Date().toISOString().split('T')[0],
      amount: billData.amount || '0',
      category: billData.category || 'Other',
      subcategory: billData.category || 'Other',
      description: billData.description || 'Bill added via OCR scan',
      icon: getCategoryIcon(billData.category || 'Other'),
      status: 'due_week',
      isAutoPay: false,
      paymentMethod: 'Manual',
      tags: [billData.category || 'Other'],
      paymentHistory: [],
    };
    setBills(prevBills => [...prevBills, newBill]);
    Alert.alert('Bill Added', `${newBill.name} has been added from scan.`);
  }, []);

  const handleAssignBill = useCallback((billId: number | string, memberId: string) => {
    Alert.alert('Bill Assigned', `Bill assigned to household member.`);
  }, []);

  // Dropdown Component
  const Dropdown: React.FC<{
    value: string;
    options: string[];
    onValueChange: (value: string) => void;
    placeholder?: string;
  }> = ({ value, options, onValueChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={[styles.dropdownButton, { backgroundColor: colors.filterBackground, borderColor: colors.border }]}
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
          <View style={[styles.dropdownMenu, { backgroundColor: colors.filterBackground, borderColor: colors.border }]}>
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

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading bills...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom', 'left', 'right']}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.title, { color: colors.text }]}>Upcoming Bills</Text>
              {/* Add Bill Button */}
              <TouchableOpacity
                style={styles.addBillButton}
                onPress={handleAddBill}
              >
                <Ionicons name="add" size={16} color="#10B981" />
              </TouchableOpacity>
              {/* OCR Scanner Button */}
              <TouchableOpacity
                style={[styles.addBillButton, { backgroundColor: '#3B82F620' }]}
                onPress={() => setShowOCRScanner(true)}
              >
                <Ionicons name="scan" size={14} color="#3B82F6" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.headerRightScroll}
              contentContainerStyle={styles.headerRight}
            >
              {/* Household Mode Button */}
              <TouchableOpacity
                style={[styles.addBillButton, { backgroundColor: '#8B5CF620' }]}
                onPress={() => setShowHouseholdModal(true)}
              >
                <Ionicons name="people" size={14} color="#8B5CF6" />
              </TouchableOpacity>
              {/* Payment Button */}
              <TouchableOpacity
                style={[styles.addBillButton, { backgroundColor: '#10B98120' }]}
                onPress={() => {
                  if (bills.length > 0 && bills.filter(b => b.status !== 'paid').length > 0) {
                    setPaymentBill(bills.filter(b => b.status !== 'paid')[0]);
                    setShowPaymentModal(true);
                  }
                }}
              >
                <Ionicons name="card" size={14} color="#10B981" />
              </TouchableOpacity>
              {/* Export Button */}
              <TouchableOpacity
                style={[styles.addBillButton, { backgroundColor: colors.filterBackground }]}
                onPress={() => setShowExportModal(true)}
              >
                <Ionicons name="download-outline" size={14} color={colors.textSecondary} />
              </TouchableOpacity>
              {/* Calendar/List Toggle */}
              <TouchableOpacity
                style={[styles.addBillButton, { backgroundColor: viewMode === 'calendar' ? '#F59E0B20' : colors.filterBackground }]}
                onPress={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
              >
                <Ionicons 
                  name={viewMode === 'calendar' ? 'list' : 'calendar'} 
                  size={14} 
                  color={viewMode === 'calendar' ? '#F59E0B' : colors.textSecondary} 
                />
              </TouchableOpacity>
              {/* Filter */}
              <View style={styles.dropdownWrapper}>
                <Dropdown
                  value={selectedFilter}
                  options={['This Week', 'Monthly', 'All Bills']}
                  onValueChange={handleFilterChange}
                  placeholder="Select period"
                />
              </View>
            </ScrollView>
          </View>

          {/* Category Filter */}
          <View style={{ paddingHorizontal: 16 }}>
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </View>

          {/* Smart Bill Detection */}
          <View style={{ paddingHorizontal: 16 }}>
            <SmartBillDetection 
              existingBills={bills} 
              onAddBill={handleAddDetectedBill} 
            />
          </View>

          {/* Late Fee Alert */}
          <View style={{ paddingHorizontal: 16 }}>
            <LateFeeAlert bills={bills} />
          </View>

          {/* Budget Integration */}
          {showBudgetIntegration && bills.length > 0 && (
            <View style={{ paddingHorizontal: 16 }}>
              <BudgetIntegration 
                bills={bills} 
                onViewBudget={() => Alert.alert('Budget', 'Navigate to budget page')} 
              />
            </View>
          )}

          {/* Bill Comparison - Track trends */}
          {bills.length > 0 && (
            <View style={{ paddingHorizontal: 16 }}>
              <BillComparisonCard 
                bills={bills} 
                onViewDetails={(billId) => handleEditBill(billId)} 
              />
            </View>
          )}

          {/* Bill Negotiation Tips */}
          {bills.length > 0 && (
            <View style={{ paddingHorizontal: 16 }}>
              <BillNegotiationTips bills={bills} />
            </View>
          )}

          {/* Bill Analytics Toggle */}
          {bills.length > 0 && (
            <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
              <TouchableOpacity
                style={[styles.analyticsToggle, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setShowAnalytics(!showAnalytics)}
              >
                <Ionicons name="analytics" size={16} color="#3B82F6" />
                <Text style={[styles.analyticsToggleText, { color: colors.text }]}>
                  {showAnalytics ? 'Hide' : 'Show'} Analytics
                </Text>
                <Ionicons 
                  name={showAnalytics ? 'chevron-up' : 'chevron-down'} 
                  size={16} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Bill Analytics */}
          {showAnalytics && bills.length > 0 && (
            <View style={{ paddingHorizontal: 16 }}>
              <BillAnalytics bills={bills} />
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: '#EF4444' }]}>{error}</Text>
              </View>
            ) : viewMode === 'calendar' ? (
              <CalendarView 
                bills={bills} 
                onSelectBill={(bill) => handleEditBill(bill.id)} 
              />
            ) : Object.keys(groupedBills).length === 0 ? (
              <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.emptyIconWrapper}>
                  <View style={[styles.emptyIconOuter, { backgroundColor: '#10B98115' }]}>
                    <View style={[styles.emptyIconInner, { backgroundColor: '#10B98125' }]}>
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
                    onMarkAsPaid={handleMarkAsPaid}
                    onViewHistory={handleViewHistory}
                    onSplitBill={handleSplitBill}
                    onLinkTransaction={handleOpenLinkModal}
                    onSetReminder={handleOpenReminderModal}
                    onToggleAutoPay={(billId) => {
                      setBills(prevBills =>
                        prevBills.map(bill =>
                          bill.id === billId
                            ? { ...bill, isAutoPay: !bill.isAutoPay, paymentMethod: !bill.isAutoPay ? 'Auto Pay' : 'Manual' }
                            : bill
                        )
                      );
                    }}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </ScrollView>

      {/* All Modals - Same as dashboard but full featured */}
      {/* Add/Edit Bill Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingBill ? 'Edit Bill' : 'Add New Bill'}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Bill Name *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.filterBackground, color: colors.text, borderColor: colors.border }]}
                  placeholder="e.g., Electricity Bill"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Amount (₹) *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.filterBackground, color: colors.text, borderColor: colors.border }]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                  value={formData.amount}
                  onChangeText={(text) => setFormData({ ...formData, amount: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Due Date</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.filterBackground, color: colors.text, borderColor: colors.border }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.dueDate}
                  onChangeText={(text) => setFormData({ ...formData, dueDate: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Category</Text>
                <View style={styles.categoryButtons}>
                  {['Utilities', 'Subscriptions', 'Insurance', 'Rent', 'Loan', 'Other'].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryButton,
                        { borderColor: colors.border },
                        formData.category === cat && styles.categoryButtonActive,
                      ]}
                      onPress={() => setFormData({ ...formData, category: cat })}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          { color: colors.textSecondary },
                          formData.category === cat && styles.categoryButtonTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.formInputMultiline, { backgroundColor: colors.filterBackground, color: colors.text, borderColor: colors.border }]}
                  placeholder="Optional notes..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                />
              </View>

              <TouchableOpacity
                style={styles.autoPayRow}
                onPress={() => setFormData({ ...formData, isAutoPay: !formData.isAutoPay })}
              >
                <View style={styles.autoPayLeft}>
                  <Ionicons name="repeat" size={20} color="#10B981" />
                  <Text style={[styles.autoPayLabel, { color: colors.text }]}>Auto Pay</Text>
                </View>
                <View style={[styles.toggleSwitch, formData.isAutoPay && styles.toggleSwitchActive]}>
                  <View style={[styles.toggleKnob, formData.isAutoPay && styles.toggleKnobActive]} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.autoPayRow}
                onPress={() => setFormData({ ...formData, isRecurring: !formData.isRecurring })}
              >
                <View style={styles.autoPayLeft}>
                  <Ionicons name="calendar" size={20} color="#3B82F6" />
                  <Text style={[styles.autoPayLabel, { color: colors.text }]}>Recurring Bill</Text>
                </View>
                <View style={[styles.toggleSwitch, formData.isRecurring && { backgroundColor: '#3B82F6' }]}>
                  <View style={[styles.toggleKnob, formData.isRecurring && styles.toggleKnobActive]} />
                </View>
              </TouchableOpacity>

              {formData.isRecurring && (
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Frequency</Text>
                  <View style={styles.categoryButtons}>
                    {(['weekly', 'monthly', 'quarterly', 'yearly'] as const).map((freq) => (
                      <TouchableOpacity
                        key={freq}
                        style={[
                          styles.categoryButton,
                          { borderColor: colors.border },
                          formData.recurringFrequency === freq && { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
                        ]}
                        onPress={() => setFormData({ ...formData, recurringFrequency: freq })}
                      >
                        <Text
                          style={[
                            styles.categoryButtonText,
                            { color: colors.textSecondary },
                            formData.recurringFrequency === freq && { color: '#FFFFFF' },
                          ]}
                        >
                          {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel, { borderColor: colors.border }]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSaveBill}
              >
                <Text style={styles.modalButtonTextSave}>
                  {editingBill ? 'Save Changes' : 'Add Bill'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* All Other Modals */}
      <BillHistoryModal
        visible={showHistoryModal}
        bill={historyBill}
        onClose={() => {
          setShowHistoryModal(false);
          setHistoryBill(null);
        }}
      />

      <BillSplitModal
        visible={showSplitModal}
        bill={splitBill}
        onClose={() => {
          setShowSplitModal(false);
          setSplitBill(null);
        }}
        onSave={handleSaveSplit}
      />

      <LinkTransactionModal
        visible={showLinkModal}
        bill={linkBill}
        onClose={() => {
          setShowLinkModal(false);
          setLinkBill(null);
        }}
        onLink={handleLinkTransaction}
      />

      <BillReminderModal
        visible={showReminderModal}
        bill={reminderBill}
        onClose={() => {
          setShowReminderModal(false);
          setReminderBill(null);
        }}
        onSave={handleSaveReminder}
      />

      <ExportBillsModal
        visible={showExportModal}
        bills={bills}
        onClose={() => setShowExportModal(false)}
      />

      <BillPaymentModal
        visible={showPaymentModal}
        bill={paymentBill}
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentBill(null);
        }}
        onPaymentComplete={handlePaymentComplete}
      />

      <BillOCRScannerModal
        visible={showOCRScanner}
        onClose={() => setShowOCRScanner(false)}
        onBillDetected={handleOCRBillDetected}
      />

      <HouseholdModeModal
        visible={showHouseholdModal}
        bills={bills}
        onClose={() => setShowHouseholdModal(false)}
        onAssignBill={handleAssignBill}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    margin: 16,
    marginBottom: 0,
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
    minHeight: 50,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 8,
    marginRight: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    flexShrink: 1,
  },
  headerRightScroll: {
    flex: 1,
    maxHeight: 40,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 4,
  },
  dropdownWrapper: {
    minWidth: 100,
    zIndex: 1000,
  },
  addBillButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B98120',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
    fontSize: 16,
    color: '#10B981',
    fontWeight: 'bold',
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
    maxHeight: 600,
  },
  analyticsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  analyticsToggleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalContent: {
    padding: 20,
    maxHeight: 500,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  formInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
  },
  formInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  categoryButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  autoPayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 12,
  },
  autoPayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  autoPayLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#374151',
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#10B981',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    borderWidth: 1,
  },
  modalButtonSave: {
    backgroundColor: '#10B981',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtonTextSave: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default MobileBills;

