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
  Share,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../../contexts/ThemeContext';
import { BillReminderConfig } from '../../components/Bills/BillReminderConfig';
import { RecurrencePatternEditor } from '../../components/Bills/RecurrencePatternEditor';
import { BillPaymentHistory } from '../../components/Bills/BillPaymentHistory';
import { addUpcomingBill, updateUpcomingBill, fetchUpcomingBills, type UpcomingBill } from '../../../../services/upcomingBillsService';
import { addBillPayment } from '../../../../services/billPaymentsService';
import { supabase } from '../../../../lib/supabase/client';

interface UpcomingBillsSectionProps {
  className?: string;
  useTestData?: boolean;
  showSmartDetection?: boolean;
  showBudgetImpact?: boolean;
}

// Bill Reminder Settings
interface BillReminder {
  enabled: boolean;
  daysBefore: number; // 1, 3, 7 days before
  time: string; // HH:mm format
  notificationId?: string;
}

// Bill Split Participant
interface BillSplitParticipant {
  id: string;
  name: string;
  email?: string;
  amount: string;
  isPaid: boolean;
  avatar?: string;
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
  status: 'due_today' | 'due_tomorrow' | 'due_week' | 'paid' | 'overdue' | 'paused' | 'ended';
  isAutoPay: boolean;
  paymentMethod: string;
  autopay_source?: string | null; // Source for autopay: 'account' | 'credit_card' | null
  tags: string[];
  // Bill History fields
  paymentHistory?: PaymentRecord[];
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  // Late Fee fields
  lateFee?: string;
  gracePeriodDays?: number;
  // Bill Splitting fields
  isSplit?: boolean;
  splitParticipants?: BillSplitParticipant[];
  linkedTransactionId?: string | number;
  // Bill Reminder fields
  reminder?: BillReminder;
}

// Payment history record
interface PaymentRecord {
  id: number | string;
  paidDate: string;
  amount: string;
  paymentMethod: string;
  notes?: string;
}

// Bill category with icon and color
interface BillCategory {
  name: string;
  icon: string;
  color: string;
  emoji: string;
}

// Budget category mapping for integration
interface BudgetCategory {
  name: string;
  budget: number;
  spent: number;
  billsTotal: number;
  color: string;
}

// Bill categories configuration
const BILL_CATEGORIES: BillCategory[] = [
  { name: 'All', icon: 'apps', color: '#6B7280', emoji: '📋' },
  { name: 'Utilities', icon: 'flash', color: '#10B981', emoji: '⚡' },
  { name: 'Subscriptions', icon: 'tv', color: '#F59E0B', emoji: '📺' },
  { name: 'Insurance', icon: 'shield', color: '#3B82F6', emoji: '🛡️' },
  { name: 'Housing', icon: 'home', color: '#8B5CF6', emoji: '🏠' },
  { name: 'Loan', icon: 'card', color: '#EF4444', emoji: '💳' },
  { name: 'Other', icon: 'ellipsis-horizontal', color: '#6B7280', emoji: '📄' },
];

// Mock budget data for integration
const MOCK_BUDGETS: BudgetCategory[] = [
  { name: 'Utilities', budget: 500, spent: 150, billsTotal: 0, color: '#10B981' },
  { name: 'Subscriptions', budget: 200, spent: 50, billsTotal: 0, color: '#F59E0B' },
  { name: 'Insurance', budget: 400, spent: 0, billsTotal: 0, color: '#3B82F6' },
  { name: 'Housing', budget: 2000, spent: 0, billsTotal: 0, color: '#8B5CF6' },
  { name: 'Loan', budget: 500, spent: 100, billsTotal: 0, color: '#EF4444' },
];

// Define grouped bills type
interface GroupedBills {
  [dateKey: string]: {
    dateLabel: string;
    bills: Bill[];
  };
}

// Mock bill data matching the images
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

// Budget Integration Component
const BudgetIntegration: React.FC<{
  bills: Bill[];
  onViewBudget?: () => void;
}> = ({ bills, onViewBudget }) => {
  const { isDark } = useTheme();

  const colors = isDark ? {
    background: '#1F2937',
    card: '#374151',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#4B5563',
  } : {
    background: '#FFFFFF',
    card: '#F3F4F6',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  };

  // Calculate bills impact on budget
  const budgetWithBills = useMemo(() => {
    return MOCK_BUDGETS.map(budget => {
      const categoryBills = bills.filter(bill => bill.category === budget.name);
      const billsTotal = categoryBills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0);
      const totalSpent = budget.spent + billsTotal;
      const percentage = (totalSpent / budget.budget) * 100;
      const isOverBudget = totalSpent > budget.budget;
      
      return {
        ...budget,
        billsTotal,
        totalSpent,
        percentage: Math.min(percentage, 100),
        isOverBudget,
        remaining: budget.budget - totalSpent,
        billsCount: categoryBills.length,
      };
    }).filter(b => b.billsTotal > 0 || b.spent > 0);
  }, [bills]);

  const totalBudget = MOCK_BUDGETS.reduce((sum, b) => sum + b.budget, 0);
  const totalBillsAmount = bills.reduce((sum, b) => sum + parseFloat(b.amount), 0);
  const totalSpent = budgetWithBills.reduce((sum, b) => sum + b.totalSpent, 0);
  const budgetHealth = totalSpent <= totalBudget * 0.8 ? 'good' : totalSpent <= totalBudget ? 'warning' : 'danger';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (budgetWithBills.length === 0) return null;

  return (
    <View style={[budgetIntStyles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <View style={budgetIntStyles.header}>
        <View style={budgetIntStyles.headerLeft}>
          <Ionicons name="wallet" size={16} color="#10B981" />
          <Text style={[budgetIntStyles.title, { color: colors.text }]}>Budget Impact</Text>
        </View>
        <TouchableOpacity onPress={onViewBudget} style={budgetIntStyles.viewBudgetBtn}>
          <Text style={budgetIntStyles.viewBudgetText}>View Budget</Text>
          <Ionicons name="chevron-forward" size={14} color="#10B981" />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={[budgetIntStyles.summary, { backgroundColor: `${budgetHealth === 'good' ? '#10B981' : budgetHealth === 'warning' ? '#F59E0B' : '#EF4444'}10` }]}>
        <View style={budgetIntStyles.summaryItem}>
          <Text style={[budgetIntStyles.summaryLabel, { color: colors.textSecondary }]}>Bills This Month</Text>
          <Text style={[budgetIntStyles.summaryValue, { color: colors.text }]}>{formatCurrency(totalBillsAmount)}</Text>
        </View>
        <View style={[budgetIntStyles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={budgetIntStyles.summaryItem}>
          <Text style={[budgetIntStyles.summaryLabel, { color: colors.textSecondary }]}>Budget Used</Text>
          <Text style={[budgetIntStyles.summaryValue, { color: budgetHealth === 'good' ? '#10B981' : budgetHealth === 'warning' ? '#F59E0B' : '#EF4444' }]}>
            {((totalSpent / totalBudget) * 100).toFixed(0)}%
          </Text>
        </View>
      </View>

      {/* Category Breakdown */}
      <View style={budgetIntStyles.categories}>
        {budgetWithBills.slice(0, 3).map((budget) => (
          <View key={budget.name} style={budgetIntStyles.categoryRow}>
            <View style={budgetIntStyles.categoryInfo}>
              <View style={[budgetIntStyles.categoryDot, { backgroundColor: budget.color }]} />
              <Text style={[budgetIntStyles.categoryName, { color: colors.text }]}>{budget.name}</Text>
              {budget.billsCount > 0 && (
                <View style={[budgetIntStyles.billsCountBadge, { backgroundColor: `${budget.color}20` }]}>
                  <Text style={[budgetIntStyles.billsCountText, { color: budget.color }]}>
                    {budget.billsCount} bill{budget.billsCount > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
            <View style={budgetIntStyles.categoryProgress}>
              <View style={[budgetIntStyles.progressTrack, { backgroundColor: colors.border }]}>
                <View 
                  style={[
                    budgetIntStyles.progressFill, 
                    { 
                      width: `${budget.percentage}%`, 
                      backgroundColor: budget.isOverBudget ? '#EF4444' : budget.color 
                    }
                  ]} 
                />
              </View>
              <Text style={[budgetIntStyles.categoryAmount, { color: budget.isOverBudget ? '#EF4444' : colors.textSecondary }]}>
                {formatCurrency(budget.totalSpent)} / {formatCurrency(budget.budget)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Warning if over budget */}
      {budgetWithBills.some(b => b.isOverBudget) && (
        <View style={budgetIntStyles.warningBox}>
          <Ionicons name="warning" size={14} color="#EF4444" />
          <Text style={budgetIntStyles.warningText}>
            Some categories are over budget. Review your bills!
          </Text>
        </View>
      )}
    </View>
  );
};

const budgetIntStyles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewBudgetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewBudgetText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  summary: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    marginHorizontal: 12,
  },
  summaryLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  categories: {
    gap: 10,
  },
  categoryRow: {
    gap: 6,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
  },
  billsCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  billsCountText: {
    fontSize: 9,
    fontWeight: '600',
  },
  categoryProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryAmount: {
    fontSize: 10,
    fontWeight: '500',
    minWidth: 90,
    textAlign: 'right',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF444410',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  warningText: {
    fontSize: 11,
    color: '#EF4444',
    flex: 1,
  },
});

// Export Bills Utility Functions
const generateCSV = (bills: Bill[]): string => {
  const headers = ['Name', 'Category', 'Amount', 'Due Date', 'Status', 'Auto-Pay', 'Recurring', 'Payment Method'];
  const rows = bills.map(bill => [
    bill.name,
    bill.category,
    bill.amount,
    bill.dueDate,
    bill.status,
    bill.isAutoPay ? 'Yes' : 'No',
    bill.isRecurring ? bill.recurringFrequency : 'No',
    bill.paymentMethod,
  ]);
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
};

const generateBillsReport = (bills: Bill[]): string => {
  const now = new Date();
  const totalAmount = bills.reduce((sum, b) => sum + parseFloat(b.amount), 0);
  const paidBills = bills.filter(b => b.status === 'paid');
  const pendingBills = bills.filter(b => b.status !== 'paid');
  const paidAmount = paidBills.reduce((sum, b) => sum + parseFloat(b.amount), 0);
  const pendingAmount = pendingBills.reduce((sum, b) => sum + parseFloat(b.amount), 0);
  
  const categoryBreakdown = bills.reduce((acc, bill) => {
    if (!acc[bill.category]) acc[bill.category] = 0;
    acc[bill.category] += parseFloat(bill.amount);
    return acc;
  }, {} as Record<string, number>);

  let report = `BILLS REPORT\n`;
  report += `Generated: ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n`;
  report += `${'='.repeat(50)}\n\n`;
  
  report += `SUMMARY\n`;
  report += `-`.repeat(30) + '\n';
  report += `Total Bills: ${bills.length}\n`;
  report += `Total Amount: $${totalAmount.toFixed(2)}\n`;
  report += `Paid: ${paidBills.length} ($${paidAmount.toFixed(2)})\n`;
  report += `Pending: ${pendingBills.length} ($${pendingAmount.toFixed(2)})\n\n`;
  
  report += `CATEGORY BREAKDOWN\n`;
  report += `-`.repeat(30) + '\n';
  Object.entries(categoryBreakdown).forEach(([cat, amount]) => {
    report += `${cat}: $${amount.toFixed(2)}\n`;
  });
  report += '\n';
  
  report += `BILL DETAILS\n`;
  report += `-`.repeat(30) + '\n';
  bills.forEach(bill => {
    report += `• ${bill.name}\n`;
    report += `  Amount: $${bill.amount} | Due: ${bill.dueDate} | Status: ${bill.status}\n`;
    if (bill.isAutoPay) report += `  Auto-Pay: ${bill.paymentMethod}\n`;
    report += '\n';
  });
  
  return report;
};

// Export Modal Component
const ExportBillsModal: React.FC<{
  visible: boolean;
  bills: Bill[];
  onClose: () => void;
}> = ({ visible, bills, onClose }) => {
  const { isDark } = useTheme();
  const [exporting, setExporting] = useState(false);

  const colors = isDark ? {
    background: '#1F2937',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
    card: '#374151',
  } : {
    background: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    card: '#F3F4F6',
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const csv = generateCSV(bills);
      await Share.share({
        message: csv,
        title: 'Bills Export (CSV)',
      });
      Alert.alert('Success', 'Bills exported successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to export CSV');
    } finally {
      setExporting(false);
      onClose();
    }
  };

  const handleExportReport = async () => {
    setExporting(true);
    try {
      const report = generateBillsReport(bills);
      await Share.share({
        message: report,
        title: 'Bills Report',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export report');
    } finally {
      setExporting(false);
      onClose();
    }
  };

  const handleShareSummary = async () => {
    const total = bills.reduce((sum, b) => sum + parseFloat(b.amount), 0);
    const pending = bills.filter(b => b.status !== 'paid');
    const pendingAmount = pending.reduce((sum, b) => sum + parseFloat(b.amount), 0);
    
    const message = `📋 My Bills Summary\n\nTotal Bills: ${bills.length}\nTotal: $${total.toFixed(2)}\nPending: ${pending.length} ($${pendingAmount.toFixed(2)})\n\nGenerated with Octopus Finance`;
    
    await Share.share({ message, title: 'Bills Summary' });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={exportModalStyles.overlay}>
        <View style={[exportModalStyles.container, { backgroundColor: colors.background }]}>
          <View style={exportModalStyles.header}>
            <Text style={[exportModalStyles.title, { color: colors.text }]}>Export Bills</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={exportModalStyles.options}>
            <TouchableOpacity
              style={[exportModalStyles.option, { backgroundColor: colors.card }]}
              onPress={handleExportCSV}
              disabled={exporting}
            >
              <View style={[exportModalStyles.optionIcon, { backgroundColor: '#10B98120' }]}>
                <Ionicons name="document-text" size={24} color="#10B981" />
              </View>
              <View style={exportModalStyles.optionInfo}>
                <Text style={[exportModalStyles.optionTitle, { color: colors.text }]}>Export as CSV</Text>
                <Text style={[exportModalStyles.optionDesc, { color: colors.textSecondary }]}>
                  Spreadsheet format for Excel/Sheets
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[exportModalStyles.option, { backgroundColor: colors.card }]}
              onPress={handleExportReport}
              disabled={exporting}
            >
              <View style={[exportModalStyles.optionIcon, { backgroundColor: '#3B82F620' }]}>
                <Ionicons name="document" size={24} color="#3B82F6" />
              </View>
              <View style={exportModalStyles.optionInfo}>
                <Text style={[exportModalStyles.optionTitle, { color: colors.text }]}>Export Report</Text>
                <Text style={[exportModalStyles.optionDesc, { color: colors.textSecondary }]}>
                  Detailed text report with summary
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[exportModalStyles.option, { backgroundColor: colors.card }]}
              onPress={handleShareSummary}
              disabled={exporting}
            >
              <View style={[exportModalStyles.optionIcon, { backgroundColor: '#8B5CF620' }]}>
                <Ionicons name="share-social" size={24} color="#8B5CF6" />
              </View>
              <View style={exportModalStyles.optionInfo}>
                <Text style={[exportModalStyles.optionTitle, { color: colors.text }]}>Share Summary</Text>
                <Text style={[exportModalStyles.optionDesc, { color: colors.textSecondary }]}>
                  Quick summary for messaging apps
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {exporting && (
            <View style={exportModalStyles.loadingOverlay}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={[exportModalStyles.loadingText, { color: colors.text }]}>Exporting...</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const exportModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  options: {
    padding: 20,
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 14,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  optionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
});

// Smart Bill Detection Component
const SmartBillDetection: React.FC<{
  onAddBill: (bill: Partial<Bill>) => void;
  existingBills: Bill[];
}> = ({ onAddBill, existingBills }) => {
  const { isDark } = useTheme();
  const [showSuggestions, setShowSuggestions] = useState(true);

  const colors = isDark ? {
    background: '#1F2937',
    card: '#374151',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#4B5563',
  } : {
    background: '#FFFFFF',
    card: '#F3F4F6',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  };

  // Mock detected recurring transactions (in real app, analyze transaction history)
  const detectedBills = useMemo(() => {
    const suggestions = [
      { name: 'Spotify', amount: '9.99', category: 'Subscriptions', frequency: 'monthly', confidence: 95 },
      { name: 'Gym Membership', amount: '49.99', category: 'Subscriptions', frequency: 'monthly', confidence: 88 },
      { name: 'Cloud Storage', amount: '2.99', category: 'Subscriptions', frequency: 'monthly', confidence: 82 },
    ];
    
    // Filter out already tracked bills
    return suggestions.filter(s => 
      !existingBills.some(b => b.name.toLowerCase().includes(s.name.toLowerCase()))
    );
  }, [existingBills]);

  const handleAddSuggestion = (suggestion: typeof detectedBills[0]) => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);

    onAddBill({
      name: suggestion.name,
      amount: suggestion.amount,
      category: suggestion.category,
      dueDate: nextMonth.toISOString().split('T')[0],
      isRecurring: true,
      recurringFrequency: 'monthly',
      description: `Auto-detected from transactions`,
    });
  };

  if (detectedBills.length === 0 || !showSuggestions) return null;

  return (
    <View style={[smartDetectStyles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={smartDetectStyles.header}>
        <View style={smartDetectStyles.headerLeft}>
          <View style={smartDetectStyles.aiIcon}>
            <Ionicons name="sparkles" size={14} color="#F59E0B" />
          </View>
          <Text style={[smartDetectStyles.title, { color: colors.text }]}>Smart Detection</Text>
        </View>
        <TouchableOpacity onPress={() => setShowSuggestions(false)}>
          <Ionicons name="close" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={[smartDetectStyles.subtitle, { color: colors.textSecondary }]}>
        We found recurring payments in your transactions:
      </Text>

      <View style={smartDetectStyles.suggestions}>
        {detectedBills.map((suggestion, index) => (
          <View key={index} style={[smartDetectStyles.suggestionItem, { borderColor: colors.border }]}>
            <View style={smartDetectStyles.suggestionLeft}>
              <Text style={[smartDetectStyles.suggestionName, { color: colors.text }]}>{suggestion.name}</Text>
              <Text style={[smartDetectStyles.suggestionMeta, { color: colors.textSecondary }]}>
                ${suggestion.amount}/mo • {suggestion.confidence}% match
              </Text>
            </View>
            <TouchableOpacity
              style={smartDetectStyles.addBtn}
              onPress={() => handleAddSuggestion(suggestion)}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const smartDetectStyles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F59E0B20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  suggestions: {
    gap: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  suggestionLeft: {},
  suggestionName: {
    fontSize: 13,
    fontWeight: '600',
  },
  suggestionMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Bill Comparison Component - Track bill changes over time
const BillComparisonCard: React.FC<{
  bills: Bill[];
  onViewDetails?: (billId: number | string) => void;
}> = ({ bills, onViewDetails }) => {
  const { isDark } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const colors = isDark ? {
    background: '#1F2937',
    card: '#374151',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#4B5563',
  } : {
    background: '#FFFFFF',
    card: '#F3F4F6',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  };

  // Generate mock historical data for comparison
  const billComparisons = useMemo(() => {
    return bills
      .filter(bill => bill.isRecurring)
      .slice(0, 4)
      .map(bill => {
        const currentAmount = parseFloat(bill.amount);
        // Simulate historical trend (in real app, this comes from payment history)
        const previousAmount = currentAmount * (0.9 + Math.random() * 0.2);
        const threeMonthsAgo = currentAmount * (0.85 + Math.random() * 0.25);
        const change = currentAmount - previousAmount;
        const changePercent = (change / previousAmount) * 100;
        const trend = change > 1 ? 'up' : change < -1 ? 'down' : 'stable';
        
        return {
          ...bill,
          currentAmount,
          previousAmount,
          threeMonthsAgo,
          change,
          changePercent,
          trend,
          history: [
            { month: 'Jun', amount: threeMonthsAgo },
            { month: 'Jul', amount: previousAmount },
            { month: 'Aug', amount: currentAmount },
          ],
        };
      });
  }, [bills]);

  const increasedBills = billComparisons.filter(b => b.trend === 'up');
  const totalIncrease = increasedBills.reduce((sum, b) => sum + b.change, 0);

  if (billComparisons.length === 0) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <View style={[comparisonStyles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity 
        style={comparisonStyles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={comparisonStyles.headerLeft}>
          <Ionicons name="trending-up" size={16} color="#3B82F6" />
          <Text style={[comparisonStyles.title, { color: colors.text }]}>Bill Trends</Text>
          {increasedBills.length > 0 && (
            <View style={comparisonStyles.alertBadge}>
              <Text style={comparisonStyles.alertBadgeText}>
                +{formatCurrency(totalIncrease)}
              </Text>
            </View>
          )}
        </View>
        <Ionicons 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={18} 
          color={colors.textSecondary} 
        />
      </TouchableOpacity>

      {expanded && (
        <View style={comparisonStyles.content}>
          {billComparisons.map((bill) => (
            <TouchableOpacity 
              key={bill.id}
              style={[comparisonStyles.billRow, { borderBottomColor: colors.border }]}
              onPress={() => onViewDetails?.(bill.id)}
            >
              <View style={comparisonStyles.billInfo}>
                <Text style={[comparisonStyles.billName, { color: colors.text }]}>{bill.name}</Text>
                <Text style={[comparisonStyles.billCategory, { color: colors.textSecondary }]}>
                  {bill.category}
                </Text>
              </View>
              
              {/* Mini Sparkline */}
              <View style={comparisonStyles.sparkline}>
                {bill.history.map((h, i) => (
                  <View key={i} style={comparisonStyles.sparklineBar}>
                    <View 
                      style={[
                        comparisonStyles.sparklineFill,
                        { 
                          height: `${(h.amount / bill.currentAmount) * 100}%`,
                          backgroundColor: i === 2 ? '#3B82F6' : colors.border,
                        }
                      ]} 
                    />
                  </View>
                ))}
              </View>

              <View style={comparisonStyles.billChange}>
                <Text style={[comparisonStyles.currentAmount, { color: colors.text }]}>
                  {formatCurrency(bill.currentAmount)}
                </Text>
                <View style={[
                  comparisonStyles.changeBadge, 
                  { backgroundColor: bill.trend === 'up' ? '#EF444420' : bill.trend === 'down' ? '#10B98120' : `${colors.border}50` }
                ]}>
                  <Ionicons 
                    name={bill.trend === 'up' ? 'arrow-up' : bill.trend === 'down' ? 'arrow-down' : 'remove'} 
                    size={10} 
                    color={bill.trend === 'up' ? '#EF4444' : bill.trend === 'down' ? '#10B981' : colors.textSecondary} 
                  />
                  <Text style={[
                    comparisonStyles.changeText,
                    { color: bill.trend === 'up' ? '#EF4444' : bill.trend === 'down' ? '#10B981' : colors.textSecondary }
                  ]}>
                    {bill.changePercent > 0 ? '+' : ''}{bill.changePercent.toFixed(1)}%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {increasedBills.length > 0 && (
            <View style={[comparisonStyles.insight, { backgroundColor: '#3B82F610' }]}>
              <Ionicons name="bulb" size={14} color="#3B82F6" />
              <Text style={[comparisonStyles.insightText, { color: '#3B82F6' }]}>
                {increasedBills.length} bill{increasedBills.length > 1 ? 's' : ''} increased this month. 
                Consider reviewing your usage.
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const comparisonStyles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertBadge: {
    backgroundColor: '#EF444420',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  alertBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF4444',
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  billInfo: {
    flex: 1,
  },
  billName: {
    fontSize: 13,
    fontWeight: '500',
  },
  billCategory: {
    fontSize: 11,
    marginTop: 2,
  },
  sparkline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 24,
    width: 36,
    gap: 2,
    marginRight: 12,
  },
  sparklineBar: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  sparklineFill: {
    width: '100%',
    borderRadius: 2,
  },
  billChange: {
    alignItems: 'flex-end',
  },
  currentAmount: {
    fontSize: 13,
    fontWeight: '600',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
    gap: 2,
  },
  changeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  insight: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  insightText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
});

// Bill Negotiation Tips Component - AI suggestions to reduce bills
const BillNegotiationTips: React.FC<{
  bills: Bill[];
}> = ({ bills }) => {
  const { isDark } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [dismissedTips, setDismissedTips] = useState<string[]>([]);

  const colors = isDark ? {
    background: '#1F2937',
    card: '#374151',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#4B5563',
  } : {
    background: '#FFFFFF',
    card: '#F3F4F6',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  };

  // Generate AI-powered negotiation tips based on bills
  const negotiationTips = useMemo(() => {
    const tips: Array<{
      id: string;
      title: string;
      description: string;
      potentialSavings: number;
      category: string;
      difficulty: 'easy' | 'medium' | 'hard';
      icon: string;
      actionText: string;
    }> = [];

    // Check for subscription bills
    const subscriptions = bills.filter(b => b.category === 'Subscriptions');
    if (subscriptions.length > 2) {
      tips.push({
        id: 'bundle-subscriptions',
        title: 'Bundle Streaming Services',
        description: `You have ${subscriptions.length} subscriptions. Consider bundling with providers like Disney+/Hulu/ESPN+ to save up to 30%.`,
        potentialSavings: subscriptions.reduce((sum, b) => sum + parseFloat(b.amount), 0) * 0.25,
        category: 'Subscriptions',
        difficulty: 'easy',
        icon: 'film',
        actionText: 'Review Bundles',
      });
    }

    // Check for high utility bills
    const utilities = bills.filter(b => b.category === 'Utilities');
    const highUtility = utilities.find(u => parseFloat(u.amount) > 100);
    if (highUtility) {
      tips.push({
        id: 'negotiate-utility',
        title: `Reduce ${highUtility.name}`,
        description: `Your ${highUtility.name.toLowerCase()} is $${highUtility.amount}. Call your provider to ask about budget billing or energy-saving programs.`,
        potentialSavings: parseFloat(highUtility.amount) * 0.15,
        category: 'Utilities',
        difficulty: 'medium',
        icon: 'flash',
        actionText: 'Get Tips',
      });
    }

    // Check for insurance
    const insurance = bills.find(b => b.category === 'Insurance');
    if (insurance) {
      tips.push({
        id: 'shop-insurance',
        title: 'Shop Insurance Rates',
        description: 'Insurance rates vary significantly. Get quotes from 3+ providers—most people save 10-25% by switching.',
        potentialSavings: parseFloat(insurance.amount) * 0.2,
        category: 'Insurance',
        difficulty: 'medium',
        icon: 'shield',
        actionText: 'Compare Rates',
      });
    }

    // Check for unused subscriptions
    const paidSubscriptions = subscriptions.filter(s => s.status === 'paid');
    if (paidSubscriptions.length > 0) {
      tips.push({
        id: 'cancel-unused',
        title: 'Audit Unused Subscriptions',
        description: 'Review your subscriptions monthly. Cancel services you haven\'t used in 30+ days.',
        potentialSavings: paidSubscriptions[0] ? parseFloat(paidSubscriptions[0].amount) : 15,
        category: 'Subscriptions',
        difficulty: 'easy',
        icon: 'trash',
        actionText: 'Review Now',
      });
    }

    // Check for auto-pay discounts
    const manualBills = bills.filter(b => !b.isAutoPay);
    if (manualBills.length > 2) {
      tips.push({
        id: 'autopay-discount',
        title: 'Enable Auto-Pay Discounts',
        description: `${manualBills.length} bills aren't on auto-pay. Many providers offer 5-10% discounts for automatic payments.`,
        potentialSavings: manualBills.reduce((sum, b) => sum + parseFloat(b.amount), 0) * 0.05,
        category: 'All',
        difficulty: 'easy',
        icon: 'repeat',
        actionText: 'Enable Auto-Pay',
      });
    }

    return tips.filter(t => !dismissedTips.includes(t.id));
  }, [bills, dismissedTips]);

  const totalPotentialSavings = negotiationTips.reduce((sum, t) => sum + t.potentialSavings, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
    }
  };

  if (negotiationTips.length === 0) return null;

  return (
    <View style={[negotiationStyles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity 
        style={negotiationStyles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={negotiationStyles.headerLeft}>
          <View style={negotiationStyles.aiIcon}>
            <Ionicons name="sparkles" size={14} color="#F59E0B" />
          </View>
          <Text style={[negotiationStyles.title, { color: colors.text }]}>Money Saving Tips</Text>
          <View style={negotiationStyles.savingsBadge}>
            <Text style={negotiationStyles.savingsBadgeText}>
              Save {formatCurrency(totalPotentialSavings)}/mo
            </Text>
          </View>
        </View>
        <Ionicons 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={18} 
          color={colors.textSecondary} 
        />
      </TouchableOpacity>

      {expanded && (
        <View style={negotiationStyles.content}>
          {negotiationTips.map((tip) => (
            <View 
              key={tip.id}
              style={[negotiationStyles.tipCard, { backgroundColor: colors.background, borderColor: colors.border }]}
            >
              <View style={negotiationStyles.tipHeader}>
                <View style={[negotiationStyles.tipIcon, { backgroundColor: `${getDifficultyColor(tip.difficulty)}20` }]}>
                  <Ionicons name={tip.icon as any} size={16} color={getDifficultyColor(tip.difficulty)} />
                </View>
                <View style={negotiationStyles.tipInfo}>
                  <Text style={[negotiationStyles.tipTitle, { color: colors.text }]}>{tip.title}</Text>
                  <View style={negotiationStyles.tipMeta}>
                    <View style={[negotiationStyles.difficultyBadge, { backgroundColor: `${getDifficultyColor(tip.difficulty)}20` }]}>
                      <Text style={[negotiationStyles.difficultyText, { color: getDifficultyColor(tip.difficulty) }]}>
                        {tip.difficulty}
                      </Text>
                    </View>
                    <Text style={[negotiationStyles.savingsAmount, { color: '#10B981' }]}>
                      Save ~{formatCurrency(tip.potentialSavings)}/mo
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => setDismissedTips([...dismissedTips, tip.id])}
                  style={negotiationStyles.dismissBtn}
                >
                  <Ionicons name="close" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={[negotiationStyles.tipDescription, { color: colors.textSecondary }]}>
                {tip.description}
              </Text>
              <TouchableOpacity 
                style={negotiationStyles.actionBtn}
                onPress={() => Alert.alert(tip.title, tip.description)}
              >
                <Text style={negotiationStyles.actionBtnText}>{tip.actionText}</Text>
                <Ionicons name="arrow-forward" size={14} color="#10B981" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const negotiationStyles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F59E0B20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  savingsBadge: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  savingsBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 10,
  },
  tipCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  tipInfo: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  tipMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  savingsAmount: {
    fontSize: 11,
    fontWeight: '600',
  },
  dismissBtn: {
    padding: 4,
  },
  tipDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B98115',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
});

// Payment Provider Interface
interface PaymentProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  supported: boolean;
  description: string;
  isPreferred?: boolean;
}

// Household Member Interface
interface HouseholdMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member';
  totalOwed: number;
  totalPaid: number;
  invitedAt?: string;
  joinedAt?: string;
  status?: 'pending' | 'active';
  phoneNumber?: string;
}

// Household Activity
interface HouseholdActivity {
  id: string;
  type: 'bill_assigned' | 'payment_made' | 'member_added' | 'bill_created' | 'reminder_sent';
  memberId: string;
  memberName: string;
  description: string;
  timestamp: string;
  billId?: number | string;
  amount?: number;
}

// Bill Payment Integration Modal
// Payment Receipt Interface
interface PaymentReceipt {
  id: string;
  billId: number | string;
  billName: string;
  amount: string;
  paymentMethod: string;
  transactionId: string;
  paidDate: string;
  status: 'success' | 'pending' | 'failed';
  receiptNumber: string;
}

// Payment Preference Storage
const getPaymentPreference = (): string | null => {
  try {
    // In real app, use AsyncStorage or secure storage
    return null; // Default to null for now
  } catch {
    return null;
  }
};

const savePaymentPreference = (providerId: string) => {
  try {
    // In real app, save to AsyncStorage
    console.log('Saved payment preference:', providerId);
  } catch {
    // Silent fail
  }
};

const BillPaymentModal: React.FC<{
  visible: boolean;
  bill: Bill | null;
  onClose: () => void;
  onPaymentComplete: (billId: number | string, paymentMethod: string, receipt?: PaymentReceipt) => void;
}> = ({ visible, bill, onClose, onPaymentComplete }) => {
  const { isDark } = useTheme();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'select' | 'confirm' | 'success' | 'receipt' | 'error'>('select');
  const [paymentReceipt, setPaymentReceipt] = useState<PaymentReceipt | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);

  const colors = isDark ? {
    background: '#1F2937',
    card: '#374151',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#4B5563',
  } : {
    background: '#FFFFFF',
    card: '#F3F4F6',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  };

  // Check provider availability (in real app, check with payment gateway)
  const checkProviderAvailability = (providerId: string): boolean => {
    // Mock availability check - in real app, this would call an API
    const unavailableProviders: string[] = []; // Add providers that are down
    return !unavailableProviders.includes(providerId);
  };

  // Load saved payment preference
  useEffect(() => {
    if (visible) {
      const savedPreference = getPaymentPreference();
      if (savedPreference && checkProviderAvailability(savedPreference)) {
        setSelectedProvider(savedPreference);
      }
    }
  }, [visible]);

  const paymentProviders: PaymentProvider[] = [
    { id: 'bank', name: 'Bank Transfer', icon: '🏦', color: '#3B82F6', supported: checkProviderAvailability('bank'), description: 'Direct from your bank account' },
    { id: 'upi', name: 'UPI Payment', icon: '📱', color: '#10B981', supported: checkProviderAvailability('upi'), description: 'Pay via UPI apps' },
    { id: 'card', name: 'Credit/Debit Card', icon: '💳', color: '#8B5CF6', supported: checkProviderAvailability('card'), description: 'Visa, Mastercard, Rupay' },
    { id: 'wallet', name: 'Digital Wallet', icon: '👛', color: '#F59E0B', supported: checkProviderAvailability('wallet'), description: 'Paytm, PhonePe, etc.' },
    { id: 'autopay', name: 'Set Auto-Pay', icon: '🔄', color: '#06B6D4', supported: checkProviderAvailability('autopay'), description: 'Never miss a payment' },
  ].map(provider => ({
    ...provider,
    isPreferred: provider.id === getPaymentPreference(),
  }));

  const handleSelectProvider = (providerId: string) => {
    if (!checkProviderAvailability(providerId)) {
      Alert.alert('Provider Unavailable', 'This payment method is currently unavailable. Please try another method.');
      return;
    }
    setSelectedProvider(providerId);
    setStep('confirm');
  };

  const generateReceipt = (): PaymentReceipt => {
    const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    return {
      id: Date.now().toString(),
      billId: bill!.id,
      billName: bill!.name,
      amount: bill!.amount,
      paymentMethod: paymentProviders.find(p => p.id === selectedProvider)?.name || 'Unknown',
      transactionId,
      paidDate: new Date().toISOString(),
      status: 'success',
      receiptNumber,
    };
  };

  const handleConfirmPayment = async () => {
    if (!bill || !selectedProvider) return;
    
    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      // Simulate payment processing with potential failure
      const shouldFail = retryCount < 2 && Math.random() < 0.3; // 30% chance of failure for first 2 retries
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (shouldFail) {
        throw new Error('Payment gateway timeout. Please try again.');
      }
      
      // Payment successful
      const receipt = generateReceipt();
      setPaymentReceipt(receipt);
      
      // Save payment preference
      savePaymentPreference(selectedProvider);
      
      setIsProcessing(false);
      setStep('success');
      
      // Auto close after success
      setTimeout(() => {
        const provider = paymentProviders.find(p => p.id === selectedProvider);
        onPaymentComplete(bill.id, provider?.name || 'Unknown', receipt);
        resetModal();
      }, 1500);
    } catch (error: any) {
      setIsProcessing(false);
      setPaymentError(error.message || 'Payment failed. Please try again.');
      setStep('error');
      setRetryCount(prev => prev + 1);
    }
  };

  const handleRetryPayment = () => {
    setPaymentError(null);
    setStep('confirm');
    handleConfirmPayment();
  };

  const resetModal = () => {
    setSelectedProvider(null);
    setStep('select');
    setIsProcessing(false);
    setPaymentReceipt(null);
    setPaymentError(null);
    setRetryCount(0);
    setScheduleDate(null);
    setShowSchedulePicker(false);
    onClose();
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  if (!bill) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={resetModal}>
      <View style={paymentStyles.overlay}>
        <View style={[paymentStyles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[paymentStyles.header, { borderBottomColor: colors.border }]}>
            <Text style={[paymentStyles.title, { color: colors.text }]}>
              {step === 'select' ? 'Pay Bill' : step === 'confirm' ? 'Confirm Payment' : 'Payment Successful'}
            </Text>
            <TouchableOpacity onPress={resetModal}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Bill Info */}
          <View style={[paymentStyles.billInfo, { backgroundColor: colors.card }]}>
            <Text style={[paymentStyles.billName, { color: colors.text }]}>{bill.name}</Text>
            <Text style={[paymentStyles.billAmount, { color: '#10B981' }]}>{formatCurrency(bill.amount)}</Text>
            <Text style={[paymentStyles.billDue, { color: colors.textSecondary }]}>Due: {bill.dueDate}</Text>
          </View>

          {step === 'select' && (
            <View style={paymentStyles.content}>
              <Text style={[paymentStyles.sectionTitle, { color: colors.text }]}>Select Payment Method</Text>
              <View style={paymentStyles.providersList}>
                {paymentProviders.map((provider) => (
                  <TouchableOpacity
                    key={provider.id}
                    style={[
                      paymentStyles.providerCard,
                      { backgroundColor: colors.card, borderColor: colors.border },
                      !provider.supported && paymentStyles.providerDisabled,
                      provider.isPreferred && { borderColor: provider.color, borderWidth: 2 },
                    ]}
                    onPress={() => provider.supported && handleSelectProvider(provider.id)}
                    disabled={!provider.supported}
                  >
                    <View style={[paymentStyles.providerIcon, { backgroundColor: `${provider.color}20` }]}>
                      <Text style={{ fontSize: 24 }}>{provider.icon}</Text>
                    </View>
                    <View style={paymentStyles.providerInfo}>
                      <View style={paymentStyles.providerNameRow}>
                        <Text style={[paymentStyles.providerName, { color: colors.text }]}>{provider.name}</Text>
                        {provider.isPreferred && (
                          <View style={[paymentStyles.preferredBadge, { backgroundColor: `${provider.color}20` }]}>
                            <Ionicons name="star" size={12} color={provider.color} />
                            <Text style={[paymentStyles.preferredText, { color: provider.color }]}>Preferred</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[paymentStyles.providerDesc, { color: colors.textSecondary }]}>{provider.description}</Text>
                    </View>
                    {provider.supported ? (
                      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    ) : (
                      <View style={paymentStyles.comingSoonBadge}>
                        <Text style={paymentStyles.comingSoonText}>Soon</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Schedule Payment Option */}
              <TouchableOpacity 
                style={[paymentStyles.scheduleOption, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setShowSchedulePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
                <View style={paymentStyles.scheduleInfo}>
                  <Text style={[paymentStyles.scheduleTitle, { color: colors.text }]}>Schedule Payment</Text>
                  <Text style={[paymentStyles.scheduleDesc, { color: colors.textSecondary }]}>
                    Pay later on a specific date
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {step === 'confirm' && (
            <View style={paymentStyles.content}>
              <View style={[paymentStyles.confirmCard, { backgroundColor: colors.card }]}>
                <View style={paymentStyles.confirmRow}>
                  <Text style={[paymentStyles.confirmLabel, { color: colors.textSecondary }]}>Payment Method</Text>
                  <Text style={[paymentStyles.confirmValue, { color: colors.text }]}>
                    {paymentProviders.find(p => p.id === selectedProvider)?.name}
                  </Text>
                </View>
                <View style={paymentStyles.confirmRow}>
                  <Text style={[paymentStyles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
                  <Text style={[paymentStyles.confirmValue, { color: '#10B981' }]}>{formatCurrency(bill.amount)}</Text>
                </View>
                <View style={paymentStyles.confirmRow}>
                  <Text style={[paymentStyles.confirmLabel, { color: colors.textSecondary }]}>Bill</Text>
                  <Text style={[paymentStyles.confirmValue, { color: colors.text }]}>{bill.name}</Text>
                </View>
              </View>

              <View style={paymentStyles.securityNote}>
                <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                <Text style={[paymentStyles.securityText, { color: colors.textSecondary }]}>
                  Your payment is secured with 256-bit encryption
                </Text>
              </View>

              <TouchableOpacity
                style={[paymentStyles.payButton, isProcessing && paymentStyles.payButtonDisabled]}
                onPress={handleConfirmPayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
                    <Text style={paymentStyles.payButtonText}>Confirm & Pay {formatCurrency(bill.amount)}</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={paymentStyles.backButton} onPress={() => setStep('select')}>
                <Text style={[paymentStyles.backButtonText, { color: colors.textSecondary }]}>← Change Payment Method</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Schedule Payment Date Picker */}
          {showSchedulePicker && (
            <Modal visible={showSchedulePicker} transparent animationType="fade" onRequestClose={() => setShowSchedulePicker(false)}>
              <View style={paymentStyles.schedulePickerOverlay}>
                <View style={[paymentStyles.schedulePickerContainer, { backgroundColor: colors.background }]}>
                  <View style={[paymentStyles.schedulePickerHeader, { borderBottomColor: colors.border }]}>
                    <Text style={[paymentStyles.schedulePickerTitle, { color: colors.text }]}>Schedule Payment</Text>
                    <TouchableOpacity onPress={() => setShowSchedulePicker(false)}>
                      <Ionicons name="close" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <View style={paymentStyles.schedulePickerContent}>
                    <Text style={[paymentStyles.schedulePickerLabel, { color: colors.textSecondary }]}>
                      Select payment date
                    </Text>
                    {Platform.OS === 'ios' ? (
                      <DateTimePicker
                        value={scheduleDate || new Date()}
                        mode="date"
                        display="spinner"
                        minimumDate={new Date()}
                        onChange={(event, selectedDate) => {
                          if (selectedDate) {
                            setScheduleDate(selectedDate);
                          }
                        }}
                        style={paymentStyles.datePicker}
                      />
                    ) : (
                      <DateTimePicker
                        value={scheduleDate || new Date()}
                        mode="date"
                        display="default"
                        minimumDate={new Date()}
                        onChange={(event, selectedDate) => {
                          setShowSchedulePicker(false);
                          if (selectedDate) {
                            setScheduleDate(selectedDate);
                            Alert.alert(
                              'Payment Scheduled',
                              `Payment scheduled for ${selectedDate.toLocaleDateString()}. You'll be reminded on that date.`
                            );
                          }
                        }}
                      />
                    )}
                    {Platform.OS === 'ios' && (
                      <View style={paymentStyles.schedulePickerActions}>
                        <TouchableOpacity
                          style={[paymentStyles.scheduleCancelBtn, { borderColor: colors.border }]}
                          onPress={() => setShowSchedulePicker(false)}
                        >
                          <Text style={[paymentStyles.scheduleCancelText, { color: colors.textSecondary }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={paymentStyles.scheduleConfirmBtn}
                          onPress={() => {
                            if (scheduleDate) {
                              Alert.alert(
                                'Payment Scheduled',
                                `Payment scheduled for ${scheduleDate.toLocaleDateString()}. You'll be reminded on that date.`
                              );
                              setShowSchedulePicker(false);
                            }
                          }}
                        >
                          <Text style={paymentStyles.scheduleConfirmText}>Schedule</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </Modal>
          )}

          {step === 'success' && (
            <View style={paymentStyles.content}>
              <View style={paymentStyles.successContent}>
                <View style={paymentStyles.successIcon}>
                  <Ionicons name="checkmark-circle" size={64} color="#10B981" />
                </View>
                <Text style={[paymentStyles.successTitle, { color: colors.text }]}>Payment Successful!</Text>
                <Text style={[paymentStyles.successText, { color: colors.textSecondary }]}>
                  Your payment of {formatCurrency(bill.amount)} for {bill.name} has been processed.
                </Text>
              </View>

              {paymentReceipt && (
                <View style={[paymentStyles.receiptCard, { backgroundColor: colors.card }]}>
                  <View style={paymentStyles.receiptHeader}>
                    <Ionicons name="receipt" size={20} color="#10B981" />
                    <Text style={[paymentStyles.receiptTitle, { color: colors.text }]}>Payment Receipt</Text>
                  </View>
                  <View style={paymentStyles.receiptRow}>
                    <Text style={[paymentStyles.receiptLabel, { color: colors.textSecondary }]}>Receipt #</Text>
                    <Text style={[paymentStyles.receiptValue, { color: colors.text }]}>{paymentReceipt.receiptNumber}</Text>
                  </View>
                  <View style={paymentStyles.receiptRow}>
                    <Text style={[paymentStyles.receiptLabel, { color: colors.textSecondary }]}>Transaction ID</Text>
                    <Text style={[paymentStyles.receiptValue, { color: colors.text }]}>{paymentReceipt.transactionId}</Text>
                  </View>
                  <View style={paymentStyles.receiptRow}>
                    <Text style={[paymentStyles.receiptLabel, { color: colors.textSecondary }]}>Payment Method</Text>
                    <Text style={[paymentStyles.receiptValue, { color: colors.text }]}>{paymentReceipt.paymentMethod}</Text>
                  </View>
                  <View style={paymentStyles.receiptRow}>
                    <Text style={[paymentStyles.receiptLabel, { color: colors.textSecondary }]}>Date</Text>
                    <Text style={[paymentStyles.receiptValue, { color: colors.text }]}>
                      {new Date(paymentReceipt.paidDate).toLocaleString()}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={[paymentStyles.shareReceiptBtn, { borderColor: colors.border }]}
                    onPress={() => {
                      const receiptText = `Payment Receipt\n\nReceipt #: ${paymentReceipt.receiptNumber}\nTransaction ID: ${paymentReceipt.transactionId}\nBill: ${paymentReceipt.billName}\nAmount: ${formatCurrency(paymentReceipt.amount)}\nPayment Method: ${paymentReceipt.paymentMethod}\nDate: ${new Date(paymentReceipt.paidDate).toLocaleString()}`;
                      Share.share({ message: receiptText, title: 'Payment Receipt' });
                    }}
                  >
                    <Ionicons name="share-outline" size={18} color={colors.text} />
                    <Text style={[paymentStyles.shareReceiptText, { color: colors.text }]}>Share Receipt</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {step === 'error' && (
            <View style={paymentStyles.content}>
              <View style={paymentStyles.errorContent}>
                <View style={paymentStyles.errorIcon}>
                  <Ionicons name="close-circle" size={64} color="#EF4444" />
                </View>
                <Text style={[paymentStyles.errorTitle, { color: colors.text }]}>Payment Failed</Text>
                <Text style={[paymentStyles.errorText, { color: colors.textSecondary }]}>
                  {paymentError || 'An error occurred while processing your payment. Please try again.'}
                </Text>
                {retryCount < 3 && (
                  <View style={paymentStyles.errorActions}>
                    <TouchableOpacity 
                      style={[paymentStyles.retryButton, { backgroundColor: '#10B981' }]}
                      onPress={handleRetryPayment}
                    >
                      <Ionicons name="refresh" size={18} color="#FFFFFF" />
                      <Text style={paymentStyles.retryButtonText}>Retry Payment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[paymentStyles.backToSelectButton, { borderColor: colors.border }]}
                      onPress={() => {
                        setPaymentError(null);
                        setStep('select');
                      }}
                    >
                      <Text style={[paymentStyles.backToSelectText, { color: colors.textSecondary }]}>Change Payment Method</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {retryCount >= 3 && (
                  <View style={paymentStyles.errorActions}>
                    <Text style={[paymentStyles.maxRetriesText, { color: colors.textSecondary }]}>
                      Maximum retry attempts reached. Please try a different payment method or contact support.
                    </Text>
                    <TouchableOpacity 
                      style={[paymentStyles.backToSelectButton, { borderColor: colors.border }]}
                      onPress={() => {
                        setPaymentError(null);
                        setRetryCount(0);
                        setStep('select');
                      }}
                    >
                      <Text style={[paymentStyles.backToSelectText, { color: colors.textSecondary }]}>Try Different Method</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const paymentStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  billInfo: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  billName: {
    fontSize: 16,
    fontWeight: '600',
  },
  billAmount: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8,
  },
  billDue: {
    fontSize: 12,
    marginTop: 4,
  },
  content: {
    padding: 16,
    paddingBottom: 34,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  providersList: {
    gap: 10,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  providerDisabled: {
    opacity: 0.5,
  },
  providerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  providerDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  comingSoonBadge: {
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F59E0B',
  },
  confirmCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  confirmLabel: {
    fontSize: 13,
  },
  confirmValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  securityText: {
    fontSize: 11,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 13,
  },
  successContent: {
    alignItems: 'center',
    padding: 40,
    paddingBottom: 60,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  receiptCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#37415150',
  },
  receiptLabel: {
    fontSize: 12,
  },
  receiptValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  shareReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  shareReceiptText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorContent: {
    alignItems: 'center',
    padding: 40,
    paddingBottom: 60,
  },
  errorIcon: {
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  errorActions: {
    width: '100%',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  backToSelectButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  backToSelectText: {
    fontSize: 14,
    fontWeight: '600',
  },
  maxRetriesText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  preferredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  preferredText: {
    fontSize: 10,
    fontWeight: '600',
  },
  scheduleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    gap: 12,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  scheduleDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  schedulePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  schedulePickerContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  schedulePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  schedulePickerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  schedulePickerContent: {
    padding: 20,
  },
  schedulePickerLabel: {
    fontSize: 14,
    marginBottom: 16,
  },
  datePicker: {
    width: '100%',
  },
  schedulePickerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  scheduleCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  scheduleCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scheduleConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  scheduleConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

// OCR Confidence Score Interface
interface OCRConfidence {
  name: number;
  amount: number;
  dueDate: number;
  category: number;
  overall: number;
}

// Scanned Bill with Confidence
interface ScannedBillData extends Partial<Bill> {
  confidence?: OCRConfidence;
  imageUri?: string;
  isEdited?: boolean;
}

// Bill OCR Scanner Modal
const BillOCRScannerModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onBillDetected: (billData: Partial<Bill>) => void;
}> = ({ visible, onClose, onBillDetected }) => {
  const { isDark } = useTheme();
  const [scanStep, setScanStep] = useState<'ready' | 'scanning' | 'processing' | 'review' | 'edit'>('ready');
  const [scannedData, setScannedData] = useState<ScannedBillData | null>(null);
  const [scannedBills, setScannedBills] = useState<ScannedBillData[]>([]); // For multiple bills
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [imageQuality, setImageQuality] = useState<'good' | 'poor' | null>(null);
  const [batchMode, setBatchMode] = useState(false);

  const colors = isDark ? {
    background: '#1F2937',
    card: '#374151',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#4B5563',
  } : {
    background: '#FFFFFF',
    card: '#F3F4F6',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  };

  // Validate image quality (mock - in real app, analyze image)
  const validateImageQuality = (): 'good' | 'poor' => {
    // Mock quality check - in real app, analyze brightness, contrast, blur
    const quality = Math.random() > 0.2 ? 'good' : 'poor';
    setImageQuality(quality);
    return quality;
  };

  // Generate OCR confidence scores
  const generateConfidenceScores = (): OCRConfidence => {
    return {
      name: 85 + Math.floor(Math.random() * 15),
      amount: 92 + Math.floor(Math.random() * 8),
      dueDate: 78 + Math.floor(Math.random() * 20),
      category: 70 + Math.floor(Math.random() * 25),
      overall: 85 + Math.floor(Math.random() * 10),
    };
  };

  const handleStartScan = () => {
    setScanStep('scanning');
    
    // Simulate scanning with quality check
    setTimeout(() => {
      const quality = validateImageQuality();
      
      if (quality === 'poor') {
        Alert.alert(
          'Poor Image Quality',
          'The image quality is low. Please ensure good lighting and hold the camera steady.',
          [
            { text: 'Rescan', onPress: () => setScanStep('ready') },
            { text: 'Continue Anyway', onPress: () => processOCR() },
          ]
        );
        return;
      }
      
      setScanStep('processing');
      processOCR();
    }, 1500);
  };

  const processOCR = () => {
    // Simulate OCR processing
    setTimeout(() => {
      const confidence = generateConfidenceScores();
      
      // Simulate multiple bill detection (30% chance)
      if (batchMode && Math.random() < 0.3) {
        const bills: ScannedBillData[] = [
          {
            name: 'Electric Bill - PG&E',
            amount: '127.50',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            category: 'Utilities',
            description: 'Monthly electricity bill',
            confidence,
            imageUri: `scan_${Date.now()}_1.jpg`,
          },
          {
            name: 'Water Bill - City Water',
            amount: '45.20',
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            category: 'Utilities',
            description: 'Monthly water bill',
            confidence: generateConfidenceScores(),
            imageUri: `scan_${Date.now()}_2.jpg`,
          },
        ];
        setScannedBills(bills);
        setScanStep('review');
      } else {
        // Single bill detection
        const bill: ScannedBillData = {
          name: 'Electric Bill - PG&E',
          amount: '127.50',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          category: 'Utilities',
          description: 'Monthly electricity bill',
          confidence,
          imageUri: `scan_${Date.now()}.jpg`,
        };
        setScannedData(bill);
        setScanStep('review');
      }
    }, 2000);
  };

  const handleEditField = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
    setScanStep('edit');
  };

  const handleSaveEdit = () => {
    if (!scannedData || !editingField) return;
    
    setScannedData({
      ...scannedData,
      [editingField]: editValue,
      isEdited: true,
    });
    setEditingField(null);
    setEditValue('');
    setScanStep('review');
  };

  const handleConfirmBill = (bill?: ScannedBillData) => {
    const billToAdd = bill || scannedData;
    if (billToAdd) {
      // Save image reference (in real app, save to storage)
      console.log('Saving scanned image:', billToAdd.imageUri);
      
      onBillDetected(billToAdd);
      
      if (batchMode && scannedBills.length > 0) {
        // Handle next bill in batch
        const remainingBills = scannedBills.filter(b => b.name !== billToAdd.name);
        if (remainingBills.length > 0) {
          setScannedBills(remainingBills);
          setScannedData(remainingBills[0]);
        } else {
          resetScanner();
        }
      } else {
        resetScanner();
      }
    }
  };

  const handleConfirmAllBills = () => {
    scannedBills.forEach(bill => {
      onBillDetected(bill);
    });
    resetScanner();
    Alert.alert('Success', `${scannedBills.length} bills have been added.`);
  };

  const resetScanner = () => {
    setScanStep('ready');
    setScannedData(null);
    setScannedBills([]);
    setEditingField(null);
    setEditValue('');
    setImageQuality(null);
    setBatchMode(false);
    onClose();
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return '#10B981';
    if (score >= 75) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={resetScanner}>
      <View style={ocrStyles.overlay}>
        <View style={[ocrStyles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[ocrStyles.header, { borderBottomColor: colors.border }]}>
            <Text style={[ocrStyles.title, { color: colors.text }]}>Scan Bill</Text>
            <TouchableOpacity onPress={resetScanner}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {scanStep === 'ready' && (
            <View style={ocrStyles.content}>
              <View style={ocrStyles.scanArea}>
                <View style={[ocrStyles.cameraPreview, { backgroundColor: colors.card }]}>
                  <Ionicons name="camera" size={64} color={colors.textSecondary} />
                  <Text style={[ocrStyles.cameraText, { color: colors.textSecondary }]}>
                    Camera preview will appear here
                  </Text>
                </View>
                <View style={ocrStyles.scanFrame}>
                  <View style={[ocrStyles.cornerTL, { borderColor: '#10B981' }]} />
                  <View style={[ocrStyles.cornerTR, { borderColor: '#10B981' }]} />
                  <View style={[ocrStyles.cornerBL, { borderColor: '#10B981' }]} />
                  <View style={[ocrStyles.cornerBR, { borderColor: '#10B981' }]} />
                </View>
              </View>

              <View style={ocrStyles.instructions}>
                <View style={ocrStyles.instructionItem}>
                  <Ionicons name="document-text" size={20} color="#3B82F6" />
                  <Text style={[ocrStyles.instructionText, { color: colors.textSecondary }]}>
                    Position the bill within the frame
                  </Text>
                </View>
                <View style={ocrStyles.instructionItem}>
                  <Ionicons name="sunny" size={20} color="#F59E0B" />
                  <Text style={[ocrStyles.instructionText, { color: colors.textSecondary }]}>
                    Ensure good lighting
                  </Text>
                </View>
                <View style={ocrStyles.instructionItem}>
                  <Ionicons name="hand-left" size={20} color="#8B5CF6" />
                  <Text style={[ocrStyles.instructionText, { color: colors.textSecondary }]}>
                    Hold steady while scanning
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={ocrStyles.scanButton} onPress={handleStartScan}>
                <Ionicons name="scan" size={24} color="#FFFFFF" />
                <Text style={ocrStyles.scanButtonText}>Scan Bill</Text>
              </TouchableOpacity>

              <TouchableOpacity style={ocrStyles.galleryButton}>
                <Ionicons name="images" size={18} color="#10B981" />
                <Text style={ocrStyles.galleryButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>

              {/* Batch Scan Toggle */}
              <TouchableOpacity 
                style={[ocrStyles.batchToggle, { backgroundColor: batchMode ? '#3B82F620' : colors.card, borderColor: colors.border }]}
                onPress={() => setBatchMode(!batchMode)}
              >
                <Ionicons name="layers" size={18} color={batchMode ? '#3B82F6' : colors.textSecondary} />
                <Text style={[ocrStyles.batchToggleText, { color: batchMode ? '#3B82F6' : colors.textSecondary }]}>
                  {batchMode ? 'Batch Mode: ON' : 'Batch Mode: OFF'}
                </Text>
                {batchMode && (
                  <Text style={[ocrStyles.batchToggleDesc, { color: colors.textSecondary }]}>
                    Scan multiple bills at once
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {scanStep === 'edit' && scannedData && editingField && (
            <View style={ocrStyles.content}>
              <View style={[ocrStyles.editCard, { backgroundColor: colors.card }]}>
                <Text style={[ocrStyles.editTitle, { color: colors.text }]}>
                  Edit {editingField.charAt(0).toUpperCase() + editingField.slice(1)}
                </Text>
                <TextInput
                  style={[ocrStyles.editInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={editValue}
                  onChangeText={setEditValue}
                  placeholder={`Enter ${editingField}`}
                  placeholderTextColor={colors.textSecondary}
                  autoFocus
                />
                <View style={ocrStyles.editActions}>
                  <TouchableOpacity
                    style={[ocrStyles.editCancelBtn, { borderColor: colors.border }]}
                    onPress={() => {
                      setEditingField(null);
                      setEditValue('');
                      setScanStep('review');
                    }}
                  >
                    <Text style={[ocrStyles.editCancelText, { color: colors.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={ocrStyles.editSaveBtn}
                    onPress={handleSaveEdit}
                  >
                    <Text style={ocrStyles.editSaveText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {scanStep === 'scanning' && (
            <View style={ocrStyles.processingContent}>
              <View style={[ocrStyles.scanAnimation, { borderColor: '#10B981' }]}>
                <View style={ocrStyles.scanLine} />
              </View>
              <Text style={[ocrStyles.processingText, { color: colors.text }]}>Scanning...</Text>
              <Text style={[ocrStyles.processingSubtext, { color: colors.textSecondary }]}>
                Hold the camera steady
              </Text>
            </View>
          )}

          {scanStep === 'processing' && (
            <View style={ocrStyles.processingContent}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={[ocrStyles.processingText, { color: colors.text }]}>Processing...</Text>
              <Text style={[ocrStyles.processingSubtext, { color: colors.textSecondary }]}>
                Extracting bill details with AI
              </Text>
            </View>
          )}

          {scanStep === 'review' && (scannedData || scannedBills.length > 0) && (
            <ScrollView style={ocrStyles.content} showsVerticalScrollIndicator={false}>
              {scannedBills.length > 0 ? (
                // Multiple bills detected
                <>
                  <View style={ocrStyles.successBadge}>
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    <Text style={ocrStyles.successBadgeText}>{scannedBills.length} Bills Detected!</Text>
                  </View>
                  
                  {scannedBills.map((bill, index) => (
                    <View key={index} style={[ocrStyles.reviewCard, { backgroundColor: colors.card, marginBottom: 16 }]}>
                      <View style={ocrStyles.billHeader}>
                        <Text style={[ocrStyles.billNumber, { color: colors.textSecondary }]}>Bill {index + 1}</Text>
                        {bill.confidence && (
                          <View style={[ocrStyles.confidenceBadge, { backgroundColor: `${getConfidenceColor(bill.confidence.overall)}20` }]}>
                            <Text style={[ocrStyles.confidenceText, { color: getConfidenceColor(bill.confidence.overall) }]}>
                              {bill.confidence.overall}% confidence
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      <TouchableOpacity 
                        style={ocrStyles.reviewRow}
                        onPress={() => handleEditField('name', bill.name || '')}
                      >
                        <View style={ocrStyles.reviewRowLeft}>
                          <Text style={[ocrStyles.reviewLabel, { color: colors.textSecondary }]}>Bill Name</Text>
                          {bill.confidence && (
                            <View style={[ocrStyles.fieldConfidence, { backgroundColor: `${getConfidenceColor(bill.confidence.name)}15` }]}>
                              <Text style={[ocrStyles.fieldConfidenceText, { color: getConfidenceColor(bill.confidence.name) }]}>
                                {bill.confidence.name}%
                              </Text>
                            </View>
                          )}
                        </View>
                        <View style={ocrStyles.reviewRowRight}>
                          <Text style={[ocrStyles.reviewValue, { color: colors.text }]}>{bill.name}</Text>
                          <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
                        </View>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={ocrStyles.reviewRow}
                        onPress={() => handleEditField('amount', bill.amount || '')}
                      >
                        <View style={ocrStyles.reviewRowLeft}>
                          <Text style={[ocrStyles.reviewLabel, { color: colors.textSecondary }]}>Amount</Text>
                          {bill.confidence && (
                            <View style={[ocrStyles.fieldConfidence, { backgroundColor: `${getConfidenceColor(bill.confidence.amount)}15` }]}>
                              <Text style={[ocrStyles.fieldConfidenceText, { color: getConfidenceColor(bill.confidence.amount) }]}>
                                {bill.confidence.amount}%
                              </Text>
                            </View>
                          )}
                        </View>
                        <View style={ocrStyles.reviewRowRight}>
                          <Text style={[ocrStyles.reviewValue, { color: '#10B981' }]}>${bill.amount}</Text>
                          <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
                        </View>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={ocrStyles.reviewRow}
                        onPress={() => handleEditField('dueDate', bill.dueDate || '')}
                      >
                        <View style={ocrStyles.reviewRowLeft}>
                          <Text style={[ocrStyles.reviewLabel, { color: colors.textSecondary }]}>Due Date</Text>
                          {bill.confidence && (
                            <View style={[ocrStyles.fieldConfidence, { backgroundColor: `${getConfidenceColor(bill.confidence.dueDate)}15` }]}>
                              <Text style={[ocrStyles.fieldConfidenceText, { color: getConfidenceColor(bill.confidence.dueDate) }]}>
                                {bill.confidence.dueDate}%
                              </Text>
                            </View>
                          )}
                        </View>
                        <View style={ocrStyles.reviewRowRight}>
                          <Text style={[ocrStyles.reviewValue, { color: colors.text }]}>{bill.dueDate}</Text>
                          <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
                        </View>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={ocrStyles.reviewRow}
                        onPress={() => handleEditField('category', bill.category || '')}
                      >
                        <View style={ocrStyles.reviewRowLeft}>
                          <Text style={[ocrStyles.reviewLabel, { color: colors.textSecondary }]}>Category</Text>
                          {bill.confidence && (
                            <View style={[ocrStyles.fieldConfidence, { backgroundColor: `${getConfidenceColor(bill.confidence.category)}15` }]}>
                              <Text style={[ocrStyles.fieldConfidenceText, { color: getConfidenceColor(bill.confidence.category) }]}>
                                {bill.confidence.category}%
                              </Text>
                            </View>
                          )}
                        </View>
                        <View style={ocrStyles.reviewRowRight}>
                          <Text style={[ocrStyles.reviewValue, { color: colors.text }]}>{bill.category}</Text>
                          <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
                        </View>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={ocrStyles.addSingleBillBtn}
                        onPress={() => handleConfirmBill(bill)}
                      >
                        <Ionicons name="add-circle" size={18} color="#FFFFFF" />
                        <Text style={ocrStyles.addSingleBillText}>Add This Bill</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  
                  <TouchableOpacity 
                    style={ocrStyles.confirmAllButton}
                    onPress={handleConfirmAllBills}
                  >
                    <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
                    <Text style={ocrStyles.confirmAllButtonText}>Add All Bills</Text>
                  </TouchableOpacity>
                </>
              ) : scannedData ? (
                // Single bill detected
                <>
                  <View style={ocrStyles.successBadge}>
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    <Text style={ocrStyles.successBadgeText}>Bill Detected!</Text>
                    {scannedData.confidence && (
                      <View style={[ocrStyles.overallConfidence, { backgroundColor: `${getConfidenceColor(scannedData.confidence.overall)}20` }]}>
                        <Text style={[ocrStyles.overallConfidenceText, { color: getConfidenceColor(scannedData.confidence.overall) }]}>
                          {scannedData.confidence.overall}% Overall Confidence
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={[ocrStyles.reviewCard, { backgroundColor: colors.card }]}>
                    <TouchableOpacity 
                      style={ocrStyles.reviewRow}
                      onPress={() => handleEditField('name', scannedData.name || '')}
                    >
                      <View style={ocrStyles.reviewRowLeft}>
                        <Text style={[ocrStyles.reviewLabel, { color: colors.textSecondary }]}>Bill Name</Text>
                        {scannedData.confidence && (
                          <View style={[ocrStyles.fieldConfidence, { backgroundColor: `${getConfidenceColor(scannedData.confidence.name)}15` }]}>
                            <Text style={[ocrStyles.fieldConfidenceText, { color: getConfidenceColor(scannedData.confidence.name) }]}>
                              {scannedData.confidence.name}%
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={ocrStyles.reviewRowRight}>
                        <Text style={[ocrStyles.reviewValue, { color: colors.text }]}>{scannedData.name}</Text>
                        <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={ocrStyles.reviewRow}
                      onPress={() => handleEditField('amount', scannedData.amount || '')}
                    >
                      <View style={ocrStyles.reviewRowLeft}>
                        <Text style={[ocrStyles.reviewLabel, { color: colors.textSecondary }]}>Amount</Text>
                        {scannedData.confidence && (
                          <View style={[ocrStyles.fieldConfidence, { backgroundColor: `${getConfidenceColor(scannedData.confidence.amount)}15` }]}>
                            <Text style={[ocrStyles.fieldConfidenceText, { color: getConfidenceColor(scannedData.confidence.amount) }]}>
                              {scannedData.confidence.amount}%
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={ocrStyles.reviewRowRight}>
                        <Text style={[ocrStyles.reviewValue, { color: '#10B981' }]}>${scannedData.amount}</Text>
                        <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={ocrStyles.reviewRow}
                      onPress={() => handleEditField('dueDate', scannedData.dueDate || '')}
                    >
                      <View style={ocrStyles.reviewRowLeft}>
                        <Text style={[ocrStyles.reviewLabel, { color: colors.textSecondary }]}>Due Date</Text>
                        {scannedData.confidence && (
                          <View style={[ocrStyles.fieldConfidence, { backgroundColor: `${getConfidenceColor(scannedData.confidence.dueDate)}15` }]}>
                            <Text style={[ocrStyles.fieldConfidenceText, { color: getConfidenceColor(scannedData.confidence.dueDate) }]}>
                              {scannedData.confidence.dueDate}%
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={ocrStyles.reviewRowRight}>
                        <Text style={[ocrStyles.reviewValue, { color: colors.text }]}>{scannedData.dueDate}</Text>
                        <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={ocrStyles.reviewRow}
                      onPress={() => handleEditField('category', scannedData.category || '')}
                    >
                      <View style={ocrStyles.reviewRowLeft}>
                        <Text style={[ocrStyles.reviewLabel, { color: colors.textSecondary }]}>Category</Text>
                        {scannedData.confidence && (
                          <View style={[ocrStyles.fieldConfidence, { backgroundColor: `${getConfidenceColor(scannedData.confidence.category)}15` }]}>
                            <Text style={[ocrStyles.fieldConfidenceText, { color: getConfidenceColor(scannedData.confidence.category) }]}>
                              {scannedData.confidence.category}%
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={ocrStyles.reviewRowRight}>
                        <Text style={[ocrStyles.reviewValue, { color: colors.text }]}>{scannedData.category}</Text>
                        <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
                      </View>
                    </TouchableOpacity>
                    
                    {scannedData.isEdited && (
                      <View style={ocrStyles.editedBadge}>
                        <Ionicons name="pencil" size={12} color="#3B82F6" />
                        <Text style={ocrStyles.editedText}>Manually edited</Text>
                      </View>
                    )}
                  </View>

                  <View style={ocrStyles.reviewActions}>
                    <TouchableOpacity 
                      style={[ocrStyles.retryButton, { borderColor: colors.border }]}
                      onPress={() => setScanStep('ready')}
                    >
                      <Ionicons name="refresh" size={18} color={colors.textSecondary} />
                      <Text style={[ocrStyles.retryButtonText, { color: colors.textSecondary }]}>Rescan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={ocrStyles.confirmButton} onPress={() => handleConfirmBill()}>
                      <Ionicons name="add-circle" size={18} color="#FFFFFF" />
                      <Text style={ocrStyles.confirmButtonText}>Add Bill</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : null}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const ocrStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  scanArea: {
    position: 'relative',
    aspectRatio: 4 / 3,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cameraPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  cameraText: {
    marginTop: 12,
    fontSize: 14,
  },
  scanFrame: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  instructions: {
    gap: 12,
    marginBottom: 24,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructionText: {
    fontSize: 13,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    marginBottom: 12,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  galleryButtonText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '500',
  },
  processingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  scanAnimation: {
    width: 200,
    height: 150,
    borderWidth: 2,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 24,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#10B981',
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  processingSubtext: {
    fontSize: 13,
    marginTop: 8,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B98120',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
  },
  successBadgeText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  reviewLabel: {
    fontSize: 13,
  },
  reviewValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  batchToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    gap: 8,
  },
  batchToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  batchToggleDesc: {
    fontSize: 11,
    marginLeft: 'auto',
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  billNumber: {
    fontSize: 12,
    fontWeight: '600',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  overallConfidence: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  overallConfidenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reviewRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldConfidence: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fieldConfidenceText: {
    fontSize: 9,
    fontWeight: '600',
  },
  editedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#37415150',
  },
  editedText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '500',
  },
  addSingleBillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 12,
  },
  addSingleBillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  confirmAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 20,
  },
  confirmAllButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  editCard: {
    padding: 20,
    borderRadius: 12,
  },
  editTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  editInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
    marginBottom: 20,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  editCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editSaveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  editSaveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

// Household Mode Component
const HouseholdModeModal: React.FC<{
  visible: boolean;
  bills: Bill[];
  onClose: () => void;
  onAssignBill: (billId: number | string, memberId: string) => void;
}> = ({ visible, bills, onClose, onAssignBill }) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'members' | 'shared' | 'summary' | 'activity' | 'reports'>('members');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [inviteMethod, setInviteMethod] = useState<'email' | 'sms'>('email');
  const [showAssignBill, setShowAssignBill] = useState(false);
  const [selectedBillForAssignment, setSelectedBillForAssignment] = useState<Bill | null>(null);
  const [activities, setActivities] = useState<HouseholdActivity[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'member'>('admin');

  const colors = isDark ? {
    background: '#1F2937',
    card: '#374151',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#4B5563',
  } : {
    background: '#FFFFFF',
    card: '#F3F4F6',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  };

  // Mock household members with status
  const [members, setMembers] = useState<HouseholdMember[]>([
    { id: '1', name: 'You', email: 'you@email.com', role: 'admin', totalOwed: 450, totalPaid: 800, status: 'active', joinedAt: new Date().toISOString() },
    { id: '2', name: 'Partner', email: 'partner@email.com', role: 'member', totalOwed: 350, totalPaid: 600, status: 'active', joinedAt: new Date().toISOString() },
    { id: '3', name: 'Roommate', email: 'roommate@email.com', role: 'member', totalOwed: 200, totalPaid: 150, status: 'active', joinedAt: new Date().toISOString() },
    { id: '4', name: 'Friend', email: 'friend@email.com', role: 'member', totalOwed: 0, totalPaid: 0, status: 'pending', invitedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  ]);

  // Initialize activities
  useEffect(() => {
    const mockActivities: HouseholdActivity[] = [
      { id: '1', type: 'bill_assigned', memberId: '2', memberName: 'Partner', description: 'Rent bill assigned', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), billId: 7, amount: 1450 },
      { id: '2', type: 'payment_made', memberId: '2', memberName: 'Partner', description: 'Paid utility bill', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), billId: 1, amount: 150 },
      { id: '3', type: 'member_added', memberId: '4', memberName: 'Friend', description: 'New member invited', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '4', type: 'reminder_sent', memberId: '3', memberName: 'Roommate', description: 'Payment reminder sent', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), billId: 5 },
    ];
    setActivities(mockActivities);
  }, []);

  // Shared bills (split bills)
  const sharedBills = bills.filter(b => b.isSplit);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleInviteMember = () => {
    if (!newMemberName.trim()) return;
    if (inviteMethod === 'email' && !newMemberEmail.trim()) {
      Alert.alert('Email Required', 'Please enter an email address to send the invitation.');
      return;
    }
    if (inviteMethod === 'sms' && !newMemberPhone.trim()) {
      Alert.alert('Phone Required', 'Please enter a phone number to send the invitation.');
      return;
    }
    
    const newMember: HouseholdMember = {
      id: Date.now().toString(),
      name: newMemberName,
      email: newMemberEmail,
      phoneNumber: newMemberPhone,
      role: 'member',
      totalOwed: 0,
      totalPaid: 0,
      status: 'pending',
      invitedAt: new Date().toISOString(),
    };
    
    setMembers([...members, newMember]);
    
    // Add activity
    const activity: HouseholdActivity = {
      id: Date.now().toString(),
      type: 'member_added',
      memberId: newMember.id,
      memberName: newMemberName,
      description: `Invited via ${inviteMethod === 'email' ? 'email' : 'SMS'}`,
      timestamp: new Date().toISOString(),
    };
    setActivities([activity, ...activities]);
    
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberPhone('');
    setShowAddMember(false);
    
    // Simulate sending invitation
    Alert.alert(
      'Invitation Sent',
      `An invitation has been sent to ${newMemberName} via ${inviteMethod === 'email' ? 'email' : 'SMS'}. They will be added once they accept.`
    );
  };

  const handleAssignBill = (bill: Bill, memberId: string) => {
    onAssignBill(bill.id, memberId);
    const member = members.find(m => m.id === memberId);
    
    // Add activity
    const activity: HouseholdActivity = {
      id: Date.now().toString(),
      type: 'bill_assigned',
      memberId,
      memberName: member?.name || 'Unknown',
      description: `${bill.name} assigned`,
      timestamp: new Date().toISOString(),
      billId: bill.id,
      amount: parseFloat(bill.amount),
    };
    setActivities([activity, ...activities]);
    
    // Send notification (mock)
    Alert.alert(
      'Bill Assigned',
      `${bill.name} has been assigned to ${member?.name}. They will receive a notification.`
    );
    
    setShowAssignBill(false);
    setSelectedBillForAssignment(null);
  };

  const handleSendReminder = (memberId: string, billId: number | string) => {
    const member = members.find(m => m.id === memberId);
    const bill = bills.find(b => b.id === billId);
    
    // Add activity
    const activity: HouseholdActivity = {
      id: Date.now().toString(),
      type: 'reminder_sent',
      memberId,
      memberName: member?.name || 'Unknown',
      description: `Payment reminder for ${bill?.name || 'bill'}`,
      timestamp: new Date().toISOString(),
      billId,
    };
    setActivities([activity, ...activities]);
    
    Alert.alert('Reminder Sent', `Payment reminder sent to ${member?.name} for ${bill?.name}.`);
  };

  const canManageMembers = currentUserRole === 'admin';
  const canAssignBills = currentUserRole === 'admin';

  const handleRemoveMember = (memberId: string) => {
    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this member?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setMembers(members.filter(m => m.id !== memberId)),
        },
      ]
    );
  };

  const totalHouseholdOwed = members.reduce((sum, m) => sum + m.totalOwed, 0);
  const totalHouseholdPaid = members.reduce((sum, m) => sum + m.totalPaid, 0);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={householdStyles.overlay}
      >
        <View style={[householdStyles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[householdStyles.header, { borderBottomColor: colors.border }]}>
            <View style={householdStyles.headerLeft}>
              <Ionicons name="people" size={22} color="#8B5CF6" />
              <Text style={[householdStyles.title, { color: colors.text }]}>Household</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={householdStyles.tabsScroll}
            contentContainerStyle={householdStyles.tabsContainer}
          >
            <View style={[householdStyles.tabs, { backgroundColor: colors.card }]}>
              {(['members', 'shared', 'summary', 'activity', 'reports'] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[householdStyles.tab, activeTab === tab && householdStyles.tabActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[
                    householdStyles.tabText,
                    { color: activeTab === tab ? '#8B5CF6' : colors.textSecondary }
                  ]}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <ScrollView style={householdStyles.content} showsVerticalScrollIndicator={false}>
            {activeTab === 'members' && (
              <View style={householdStyles.membersSection}>
                {/* Add Member Button - Only for admins */}
                {canManageMembers && (
                  <TouchableOpacity
                    style={[householdStyles.addMemberBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => setShowAddMember(true)}
                  >
                    <Ionicons name="person-add" size={20} color="#8B5CF6" />
                    <Text style={[householdStyles.addMemberText, { color: colors.text }]}>Invite Member</Text>
                  </TouchableOpacity>
                )}

                {/* Members List */}
                {members.map((member) => (
                  <View 
                    key={member.id} 
                    style={[householdStyles.memberCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <View style={householdStyles.memberInfo}>
                      <View style={[householdStyles.memberAvatar, { backgroundColor: '#8B5CF620' }]}>
                        <Text style={householdStyles.memberAvatarText}>
                          {member.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={householdStyles.memberDetails}>
                        <View style={householdStyles.memberNameRow}>
                          <Text style={[householdStyles.memberName, { color: colors.text }]}>{member.name}</Text>
                          {member.role === 'admin' && (
                            <View style={householdStyles.adminBadge}>
                              <Text style={householdStyles.adminBadgeText}>Admin</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[householdStyles.memberEmail, { color: colors.textSecondary }]}>{member.email}</Text>
                      </View>
                    </View>
                    <View style={householdStyles.memberStats}>
                      <View style={householdStyles.memberStat}>
                        <Text style={[householdStyles.memberStatLabel, { color: colors.textSecondary }]}>Owes</Text>
                        <Text style={[householdStyles.memberStatValue, { color: '#EF4444' }]}>
                          {formatCurrency(member.totalOwed)}
                        </Text>
                      </View>
                      <View style={householdStyles.memberStat}>
                        <Text style={[householdStyles.memberStatLabel, { color: colors.textSecondary }]}>Paid</Text>
                        <Text style={[householdStyles.memberStatValue, { color: '#10B981' }]}>
                          {formatCurrency(member.totalPaid)}
                        </Text>
                      </View>
                    </View>
                    <View style={householdStyles.memberActions}>
                      {member.status === 'pending' && (
                        <View style={[householdStyles.pendingBadge, { backgroundColor: '#F59E0B20' }]}>
                          <Text style={[householdStyles.pendingText, { color: '#F59E0B' }]}>Pending</Text>
                        </View>
                      )}
                      {canAssignBills && member.status === 'active' && (
                        <TouchableOpacity
                          style={[householdStyles.assignBillBtn, { backgroundColor: '#3B82F620' }]}
                          onPress={() => {
                            if (bills.length > 0) {
                              setSelectedBillForAssignment(bills[0]);
                              setShowAssignBill(true);
                            }
                          }}
                        >
                          <Ionicons name="document-text" size={14} color="#3B82F6" />
                          <Text style={[householdStyles.assignBillText, { color: '#3B82F6' }]}>Assign Bill</Text>
                        </TouchableOpacity>
                      )}
                      {canManageMembers && member.role !== 'admin' && (
                        <TouchableOpacity 
                          style={householdStyles.removeMemberBtn}
                          onPress={() => handleRemoveMember(member.id)}
                        >
                          <Ionicons name="close-circle" size={20} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {activeTab === 'activity' && (
              <View style={householdStyles.activitySection}>
                <Text style={[householdStyles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
                {activities.length === 0 ? (
                  <View style={[householdStyles.emptyState, { backgroundColor: colors.card }]}>
                    <Ionicons name="time-outline" size={48} color={colors.textSecondary} />
                    <Text style={[householdStyles.emptyTitle, { color: colors.text }]}>No Activity Yet</Text>
                    <Text style={[householdStyles.emptyText, { color: colors.textSecondary }]}>
                      Activity will appear here as members interact with bills
                    </Text>
                  </View>
                ) : (
                  activities.map((activity) => {
                    const member = members.find(m => m.id === activity.memberId);
                    const getActivityIcon = () => {
                      switch (activity.type) {
                        case 'bill_assigned': return 'document-text';
                        case 'payment_made': return 'checkmark-circle';
                        case 'member_added': return 'person-add';
                        case 'bill_created': return 'add-circle';
                        case 'reminder_sent': return 'notifications';
                        default: return 'ellipse';
                      }
                    };
                    const getActivityColor = () => {
                      switch (activity.type) {
                        case 'bill_assigned': return '#3B82F6';
                        case 'payment_made': return '#10B981';
                        case 'member_added': return '#8B5CF6';
                        case 'bill_created': return '#F59E0B';
                        case 'reminder_sent': return '#EF4444';
                        default: return colors.textSecondary;
                      }
                    };
                    
                    return (
                      <View key={activity.id} style={[householdStyles.activityItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[householdStyles.activityIcon, { backgroundColor: `${getActivityColor()}20` }]}>
                          <Ionicons name={getActivityIcon() as any} size={18} color={getActivityColor()} />
                        </View>
                        <View style={householdStyles.activityContent}>
                          <Text style={[householdStyles.activityDescription, { color: colors.text }]}>
                            {activity.description}
                          </Text>
                          <Text style={[householdStyles.activityMeta, { color: colors.textSecondary }]}>
                            {activity.memberName} • {new Date(activity.timestamp).toLocaleDateString()}
                          </Text>
                          {activity.amount && (
                            <Text style={[householdStyles.activityAmount, { color: '#10B981' }]}>
                              {formatCurrency(activity.amount)}
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {activeTab === 'reports' && (
              <View style={householdStyles.reportsSection}>
                <Text style={[householdStyles.sectionTitle, { color: colors.text }]}>Household Reports</Text>
                
                {/* Monthly Expense Report */}
                <View style={[householdStyles.reportCard, { backgroundColor: colors.card }]}>
                  <View style={householdStyles.reportHeader}>
                    <Ionicons name="bar-chart" size={20} color="#3B82F6" />
                    <Text style={[householdStyles.reportTitle, { color: colors.text }]}>Monthly Expenses</Text>
                  </View>
                  <View style={householdStyles.reportContent}>
                    <View style={householdStyles.reportRow}>
                      <Text style={[householdStyles.reportLabel, { color: colors.textSecondary }]}>Total Household Bills</Text>
                      <Text style={[householdStyles.reportValue, { color: colors.text }]}>
                        {formatCurrency(sharedBills.reduce((sum, b) => sum + parseFloat(b.amount), 0))}
                      </Text>
                    </View>
                    <View style={householdStyles.reportRow}>
                      <Text style={[householdStyles.reportLabel, { color: colors.textSecondary }]}>Per Member Average</Text>
                      <Text style={[householdStyles.reportValue, { color: colors.text }]}>
                        {formatCurrency(sharedBills.reduce((sum, b) => sum + parseFloat(b.amount), 0) / Math.max(members.filter(m => m.status === 'active').length, 1))}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[householdStyles.exportReportBtn, { borderColor: colors.border }]}
                    onPress={() => {
                      const report = `HOUSEHOLD EXPENSE REPORT\n\nTotal Members: ${members.length}\nActive Members: ${members.filter(m => m.status === 'active').length}\nTotal Bills: ${sharedBills.length}\nTotal Amount: ${formatCurrency(sharedBills.reduce((sum, b) => sum + parseFloat(b.amount), 0))}\n\nPer Member Breakdown:\n${members.map(m => `${m.name}: ${formatCurrency(m.totalOwed + m.totalPaid)}`).join('\n')}`;
                      Share.share({ message: report, title: 'Household Expense Report' });
                    }}
                  >
                    <Ionicons name="download-outline" size={18} color={colors.text} />
                    <Text style={[householdStyles.exportReportText, { color: colors.text }]}>Export Report</Text>
                  </TouchableOpacity>
                </View>

                {/* Payment Status Report */}
                <View style={[householdStyles.reportCard, { backgroundColor: colors.card }]}>
                  <View style={householdStyles.reportHeader}>
                    <Ionicons name="wallet" size={20} color="#10B981" />
                    <Text style={[householdStyles.reportTitle, { color: colors.text }]}>Payment Status</Text>
                  </View>
                  <View style={householdStyles.reportContent}>
                    {members.map((member) => (
                      <View key={member.id} style={householdStyles.memberReportRow}>
                        <Text style={[householdStyles.memberReportName, { color: colors.text }]}>{member.name}</Text>
                        <View style={householdStyles.memberReportStats}>
                          <Text style={[householdStyles.memberReportOwed, { color: '#EF4444' }]}>
                            Owed: {formatCurrency(member.totalOwed)}
                          </Text>
                          <Text style={[householdStyles.memberReportPaid, { color: '#10B981' }]}>
                            Paid: {formatCurrency(member.totalPaid)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'shared' && (
              <View style={householdStyles.sharedSection}>
                {sharedBills.length === 0 ? (
                  <View style={[householdStyles.emptyState, { backgroundColor: colors.card }]}>
                    <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
                    <Text style={[householdStyles.emptyTitle, { color: colors.text }]}>No Shared Bills</Text>
                    <Text style={[householdStyles.emptyText, { color: colors.textSecondary }]}>
                      Split bills with household members to see them here
                    </Text>
                  </View>
                ) : (
                  sharedBills.map((bill) => (
                    <View key={bill.id} style={[householdStyles.sharedBillCard, { backgroundColor: colors.card }]}>
                      <Text style={[householdStyles.sharedBillName, { color: colors.text }]}>{bill.name}</Text>
                      <Text style={[householdStyles.sharedBillAmount, { color: '#10B981' }]}>${bill.amount}</Text>
                      <View style={householdStyles.participants}>
                        {bill.splitParticipants?.map((p) => (
                          <View key={p.id} style={householdStyles.participantChip}>
                            <Text style={householdStyles.participantText}>{p.name}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {activeTab === 'summary' && (
              <View style={householdStyles.summarySection}>
                <View style={[householdStyles.summaryCard, { backgroundColor: colors.card }]}>
                  <Text style={[householdStyles.summaryTitle, { color: colors.text }]}>Household Summary</Text>
                  <View style={householdStyles.summaryRow}>
                    <Text style={[householdStyles.summaryLabel, { color: colors.textSecondary }]}>Total Members</Text>
                    <Text style={[householdStyles.summaryValue, { color: colors.text }]}>{members.length}</Text>
                  </View>
                  <View style={householdStyles.summaryRow}>
                    <Text style={[householdStyles.summaryLabel, { color: colors.textSecondary }]}>Total Owed</Text>
                    <Text style={[householdStyles.summaryValue, { color: '#EF4444' }]}>{formatCurrency(totalHouseholdOwed)}</Text>
                  </View>
                  <View style={householdStyles.summaryRow}>
                    <Text style={[householdStyles.summaryLabel, { color: colors.textSecondary }]}>Total Paid</Text>
                    <Text style={[householdStyles.summaryValue, { color: '#10B981' }]}>{formatCurrency(totalHouseholdPaid)}</Text>
                  </View>
                  <View style={householdStyles.summaryRow}>
                    <Text style={[householdStyles.summaryLabel, { color: colors.textSecondary }]}>Shared Bills</Text>
                    <Text style={[householdStyles.summaryValue, { color: colors.text }]}>{sharedBills.length}</Text>
                  </View>
                </View>

                {/* Per Member Breakdown */}
                <Text style={[householdStyles.breakdownTitle, { color: colors.text }]}>Member Breakdown</Text>
                {members.map((member) => (
                  <View key={member.id} style={[householdStyles.breakdownCard, { backgroundColor: colors.card }]}>
                    <Text style={[householdStyles.breakdownName, { color: colors.text }]}>{member.name}</Text>
                    <View style={householdStyles.breakdownBar}>
                      <View 
                        style={[
                          householdStyles.breakdownFill, 
                          { width: `${(member.totalPaid / (member.totalPaid + member.totalOwed || 1)) * 100}%` }
                        ]} 
                      />
                    </View>
                    <Text style={[householdStyles.breakdownPercent, { color: colors.textSecondary }]}>
                      {((member.totalPaid / (member.totalPaid + member.totalOwed || 1)) * 100).toFixed(0)}% paid
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Add Member Form */}
          {showAddMember && (
            <View style={[householdStyles.addMemberForm, { backgroundColor: colors.card }]}>
              <View style={householdStyles.addMemberFormHeader}>
                <Text style={[householdStyles.addMemberFormTitle, { color: colors.text }]}>Invite Member</Text>
                <TouchableOpacity onPress={() => setShowAddMember(false)}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={[householdStyles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Name"
                placeholderTextColor={colors.textSecondary}
                value={newMemberName}
                onChangeText={setNewMemberName}
              />
              
              {/* Invitation Method Selection */}
              <View style={householdStyles.inviteMethodRow}>
                <TouchableOpacity
                  style={[
                    householdStyles.inviteMethodBtn,
                    { backgroundColor: inviteMethod === 'email' ? '#3B82F620' : colors.background, borderColor: colors.border }
                  ]}
                  onPress={() => setInviteMethod('email')}
                >
                  <Ionicons name="mail" size={18} color={inviteMethod === 'email' ? '#3B82F6' : colors.textSecondary} />
                  <Text style={[householdStyles.inviteMethodText, { color: inviteMethod === 'email' ? '#3B82F6' : colors.textSecondary }]}>
                    Email
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    householdStyles.inviteMethodBtn,
                    { backgroundColor: inviteMethod === 'sms' ? '#10B98120' : colors.background, borderColor: colors.border }
                  ]}
                  onPress={() => setInviteMethod('sms')}
                >
                  <Ionicons name="chatbubble" size={18} color={inviteMethod === 'sms' ? '#10B981' : colors.textSecondary} />
                  <Text style={[householdStyles.inviteMethodText, { color: inviteMethod === 'sms' ? '#10B981' : colors.textSecondary }]}>
                    SMS
                  </Text>
                </TouchableOpacity>
              </View>
              
              {inviteMethod === 'email' ? (
                <TextInput
                  style={[householdStyles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="Email"
                  placeholderTextColor={colors.textSecondary}
                  value={newMemberEmail}
                  onChangeText={setNewMemberEmail}
                  keyboardType="email-address"
                />
              ) : (
                <TextInput
                  style={[householdStyles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="Phone Number"
                  placeholderTextColor={colors.textSecondary}
                  value={newMemberPhone}
                  onChangeText={setNewMemberPhone}
                  keyboardType="phone-pad"
                />
              )}
              
              <View style={householdStyles.addMemberActions}>
                <TouchableOpacity 
                  style={[householdStyles.cancelBtn, { borderColor: colors.border }]}
                  onPress={() => {
                    setShowAddMember(false);
                    setNewMemberName('');
                    setNewMemberEmail('');
                    setNewMemberPhone('');
                  }}
                >
                  <Text style={[householdStyles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={householdStyles.addBtn} onPress={handleInviteMember}>
                  <Ionicons name="send" size={16} color="#FFFFFF" />
                  <Text style={householdStyles.addBtnText}>Send Invitation</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Bill Assignment Modal */}
          {showAssignBill && (
            <Modal visible={showAssignBill} transparent animationType="fade" onRequestClose={() => setShowAssignBill(false)}>
              <View style={householdStyles.assignBillOverlay}>
                <View style={[householdStyles.assignBillContainer, { backgroundColor: colors.background }]}>
                  <View style={[householdStyles.assignBillHeader, { borderBottomColor: colors.border }]}>
                    <Text style={[householdStyles.assignBillTitle, { color: colors.text }]}>Assign Bill</Text>
                    <TouchableOpacity onPress={() => setShowAssignBill(false)}>
                      <Ionicons name="close" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={householdStyles.assignBillContent}>
                    {bills.filter(b => b.status !== 'paid').map((bill) => (
                      <TouchableOpacity
                        key={bill.id}
                        style={[householdStyles.assignBillItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => {
                          if (members.length > 1) {
                            Alert.alert(
                              'Select Member',
                              'Choose a member to assign this bill to:',
                              [
                                ...members
                                  .filter(m => m.role !== 'admin' && m.status === 'active')
                                  .map(m => ({
                                    text: m.name,
                                    onPress: () => handleAssignBill(bill, m.id),
                                  })),
                                { text: 'Cancel', style: 'cancel' as const },
                              ]
                            );
                          }
                        }}
                      >
                        <View style={householdStyles.assignBillInfo}>
                          <Text style={[householdStyles.assignBillName, { color: colors.text }]}>{bill.name}</Text>
                          <Text style={[householdStyles.assignBillAmount, { color: '#10B981' }]}>${bill.amount}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const householdStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    margin: 16,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#8B5CF620',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 34,
  },
  membersSection: {
    gap: 12,
  },
  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 8,
  },
  addMemberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  memberCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    position: 'relative',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  memberDetails: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
  },
  adminBadge: {
    backgroundColor: '#8B5CF620',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  memberEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  memberStats: {
    flexDirection: 'row',
    gap: 24,
  },
  memberStat: {},
  memberStatLabel: {
    fontSize: 10,
  },
  memberStatValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  removeMemberBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  sharedSection: {
    gap: 12,
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  sharedBillCard: {
    padding: 14,
    borderRadius: 12,
  },
  sharedBillName: {
    fontSize: 14,
    fontWeight: '600',
  },
  sharedBillAmount: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  participants: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  participantChip: {
    backgroundColor: '#8B5CF620',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  participantText: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  summarySection: {
    gap: 16,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  breakdownCard: {
    padding: 12,
    borderRadius: 10,
  },
  breakdownName: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  breakdownBar: {
    height: 6,
    backgroundColor: '#EF444420',
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  breakdownPercent: {
    fontSize: 11,
    marginTop: 4,
  },
  addMemberForm: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  addMemberFormTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
    marginBottom: 12,
  },
  addMemberActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tabsScroll: {
    maxHeight: 60,
  },
  tabsContainer: {
    paddingHorizontal: 16,
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  pendingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pendingText: {
    fontSize: 10,
    fontWeight: '600',
  },
  assignBillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  assignBillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  activitySection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityMeta: {
    fontSize: 12,
  },
  activityAmount: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  reportsSection: {
    gap: 16,
  },
  reportCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  reportContent: {
    gap: 12,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  reportLabel: {
    fontSize: 13,
  },
  reportValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  exportReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  exportReportText: {
    fontSize: 14,
    fontWeight: '600',
  },
  memberReportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#37415150',
  },
  memberReportName: {
    fontSize: 13,
    fontWeight: '600',
  },
  memberReportStats: {
    alignItems: 'flex-end',
    gap: 4,
  },
  memberReportOwed: {
    fontSize: 12,
    fontWeight: '500',
  },
  memberReportPaid: {
    fontSize: 12,
    fontWeight: '500',
  },
  addMemberFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inviteMethodRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  inviteMethodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  inviteMethodText: {
    fontSize: 13,
    fontWeight: '600',
  },
  assignBillOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assignBillContainer: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  assignBillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  assignBillTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  assignBillContent: {
    padding: 16,
    maxHeight: 400,
  },
  assignBillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  assignBillInfo: {
    flex: 1,
  },
  assignBillName: {
    fontSize: 14,
    fontWeight: '600',
  },
  assignBillAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
});

// Late Fee Alert Component
const LateFeeAlert: React.FC<{
  bills: Bill[];
}> = ({ bills }) => {
  const { isDark } = useTheme();

  const colors = isDark ? {
    background: '#7F1D1D',
    text: '#FEE2E2',
    border: '#991B1B',
  } : {
    background: '#FEF2F2',
    text: '#991B1B',
    border: '#FECACA',
  };

  // Get bills with potential late fees
  const now = new Date();
  const billsWithLateFeeRisk = bills.filter(bill => {
    if (bill.status === 'paid') return false;
    const dueDate = new Date(bill.dueDate);
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    // Show warning for bills due within 2 days or overdue
    return diffDays <= 2 && bill.lateFee;
  });

  if (billsWithLateFeeRisk.length === 0) return null;

  const totalLateFees = billsWithLateFeeRisk.reduce(
    (sum, bill) => sum + parseFloat(bill.lateFee || '0'),
    0
  );

  return (
    <View style={[lateFeeStyles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={lateFeeStyles.iconContainer}>
        <Ionicons name="warning" size={20} color="#EF4444" />
      </View>
      <View style={lateFeeStyles.content}>
        <Text style={[lateFeeStyles.title, { color: colors.text }]}>
          ⚠️ Late Fee Alert
        </Text>
        <Text style={[lateFeeStyles.description, { color: colors.text }]}>
          {billsWithLateFeeRisk.length} bill{billsWithLateFeeRisk.length > 1 ? 's' : ''} may incur late fees totaling ${totalLateFees.toFixed(2)}
        </Text>
        <View style={lateFeeStyles.billsList}>
          {billsWithLateFeeRisk.slice(0, 2).map(bill => (
            <Text key={bill.id} style={[lateFeeStyles.billName, { color: colors.text }]}>
              • {bill.name}: ${bill.lateFee} fee
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const lateFeeStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 10,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  description: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 4,
  },
  billsList: {
    marginTop: 2,
  },
  billName: {
    fontSize: 10,
    lineHeight: 14,
  },
});

// Bill Split Modal Component
const BillSplitModal: React.FC<{
  visible: boolean;
  bill: Bill | null;
  onClose: () => void;
  onSave: (bill: Bill) => void;
}> = ({ visible, bill, onClose, onSave }) => {
  const { isDark } = useTheme();
  const [participants, setParticipants] = useState<BillSplitParticipant[]>([]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [splitEvenly, setSplitEvenly] = useState(true);

  const colors = isDark ? {
    background: '#1F2937',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
    inputBg: '#374151',
  } : {
    background: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    inputBg: '#F3F4F6',
  };

  // Initialize with bill's existing participants or default to user
  useEffect(() => {
    if (bill) {
      if (bill.splitParticipants && bill.splitParticipants.length > 0) {
        setParticipants(bill.splitParticipants);
      } else {
        // Default: just the user
        setParticipants([
          {
            id: 'user',
            name: 'You',
            amount: bill.amount,
            isPaid: false,
            avatar: '👤',
          },
        ]);
      }
    }
  }, [bill]);

  // Recalculate split when participants change
  useEffect(() => {
    if (splitEvenly && bill && participants.length > 0) {
      const splitAmount = (parseFloat(bill.amount) / participants.length).toFixed(2);
      setParticipants(prev =>
        prev.map(p => ({ ...p, amount: splitAmount }))
      );
    }
  }, [participants.length, splitEvenly, bill]);

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(parseFloat(value));
  };

  const addParticipant = () => {
    if (!newParticipantName.trim()) return;
    
    const newParticipant: BillSplitParticipant = {
      id: Date.now().toString(),
      name: newParticipantName.trim(),
      amount: '0',
      isPaid: false,
      avatar: '👤',
    };
    
    setParticipants([...participants, newParticipant]);
    setNewParticipantName('');
  };

  const removeParticipant = (id: string) => {
    if (id === 'user') return; // Can't remove yourself
    setParticipants(participants.filter(p => p.id !== id));
  };

  const toggleParticipantPaid = (id: string) => {
    setParticipants(
      participants.map(p =>
        p.id === id ? { ...p, isPaid: !p.isPaid } : p
      )
    );
  };

  const updateParticipantAmount = (id: string, amount: string) => {
    setSplitEvenly(false);
    setParticipants(
      participants.map(p =>
        p.id === id ? { ...p, amount } : p
      )
    );
  };

  const handleSave = () => {
    if (bill) {
      onSave({
        ...bill,
        isSplit: participants.length > 1,
        splitParticipants: participants,
      });
    }
    onClose();
  };

  if (!bill) return null;

  const totalSplit = participants.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
  const billAmount = parseFloat(bill.amount);
  const isBalanced = Math.abs(totalSplit - billAmount) < 0.01;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={splitModalStyles.overlay}>
        <View style={[splitModalStyles.container, { backgroundColor: colors.background }]}>
          <View style={splitModalStyles.header}>
            <Text style={[splitModalStyles.title, { color: colors.text }]}>
              Split Bill
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Bill Summary */}
          <View style={[splitModalStyles.billSummary, { borderBottomColor: colors.border }]}>
            <Text style={[splitModalStyles.billName, { color: colors.text }]}>{bill.name}</Text>
            <Text style={[splitModalStyles.billTotal, { color: '#10B981' }]}>
              {formatCurrency(bill.amount)}
            </Text>
          </View>

          {/* Split Evenly Toggle */}
          <TouchableOpacity
            style={splitModalStyles.evenlyToggle}
            onPress={() => setSplitEvenly(!splitEvenly)}
          >
            <Ionicons
              name={splitEvenly ? 'checkbox' : 'square-outline'}
              size={20}
              color="#10B981"
            />
            <Text style={[splitModalStyles.evenlyText, { color: colors.text }]}>
              Split evenly
            </Text>
          </TouchableOpacity>

          {/* Participants List */}
          <ScrollView style={splitModalStyles.participantsList}>
            {participants.map((participant) => (
              <View
                key={participant.id}
                style={[splitModalStyles.participantRow, { borderBottomColor: colors.border }]}
              >
                <View style={splitModalStyles.participantLeft}>
                  <Text style={splitModalStyles.participantAvatar}>
                    {participant.avatar || '👤'}
                  </Text>
                  <View>
                    <Text style={[splitModalStyles.participantName, { color: colors.text }]}>
                      {participant.name}
                    </Text>
                    {participant.isPaid && (
                      <Text style={splitModalStyles.paidLabel}>Paid ✓</Text>
                    )}
                  </View>
                </View>
                <View style={splitModalStyles.participantRight}>
                  <TextInput
                    style={[
                      splitModalStyles.amountInput,
                      { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border },
                    ]}
                    value={participant.amount}
                    onChangeText={(text) => updateParticipantAmount(participant.id, text)}
                    keyboardType="decimal-pad"
                    editable={!splitEvenly}
                  />
                  <View style={splitModalStyles.participantActions}>
                    <TouchableOpacity
                      onPress={() => toggleParticipantPaid(participant.id)}
                      style={[
                        splitModalStyles.actionButton,
                        participant.isPaid && { backgroundColor: '#10B98120' },
                      ]}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={participant.isPaid ? '#10B981' : colors.textSecondary}
                      />
                    </TouchableOpacity>
                    {participant.id !== 'user' && (
                      <TouchableOpacity
                        onPress={() => removeParticipant(participant.id)}
                        style={splitModalStyles.actionButton}
                      >
                        <Ionicons name="trash" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Add Participant */}
          <View style={splitModalStyles.addParticipant}>
            <TextInput
              style={[
                splitModalStyles.addInput,
                { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Add person..."
              placeholderTextColor={colors.textSecondary}
              value={newParticipantName}
              onChangeText={setNewParticipantName}
            />
            <TouchableOpacity
              style={splitModalStyles.addButton}
              onPress={addParticipant}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Balance Check */}
          <View style={[splitModalStyles.balanceRow, { borderTopColor: colors.border }]}>
            <Text style={[splitModalStyles.balanceLabel, { color: colors.textSecondary }]}>
              Total Split:
            </Text>
            <Text
              style={[
                splitModalStyles.balanceValue,
                { color: isBalanced ? '#10B981' : '#EF4444' },
              ]}
            >
              {formatCurrency(totalSplit.toString())} / {formatCurrency(bill.amount)}
              {!isBalanced && ' ⚠️'}
            </Text>
          </View>

          {/* Actions */}
          <View style={splitModalStyles.actions}>
            <TouchableOpacity
              style={[splitModalStyles.cancelButton, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[splitModalStyles.cancelText, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[splitModalStyles.saveButton, !isBalanced && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={!isBalanced}
            >
              <Text style={splitModalStyles.saveText}>Save Split</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Link to Transaction Modal Component
const LinkTransactionModal: React.FC<{
  visible: boolean;
  bill: Bill | null;
  onClose: () => void;
  onLink: (billId: number | string, transactionId: string) => void;
}> = ({ visible, bill, onClose, onLink }) => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const colors = isDark ? {
    background: '#1F2937',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
    inputBg: '#374151',
  } : {
    background: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    inputBg: '#F3F4F6',
  };

  // Mock transactions for linking
  const mockTransactions = [
    { id: 'txn-001', name: 'Electricity Payment', amount: '95.50', date: '2025-08-05', category: 'Utilities' },
    { id: 'txn-002', name: 'Netflix', amount: '14.99', date: '2025-08-06', category: 'Subscriptions' },
    { id: 'txn-003', name: 'Water Bill Payment', amount: '45.70', date: '2025-08-04', category: 'Utilities' },
    { id: 'txn-004', name: 'Phone Bill', amount: '85.00', date: '2025-08-07', category: 'Utilities' },
    { id: 'txn-005', name: 'Internet Service', amount: '65.99', date: '2025-08-10', category: 'Utilities' },
  ];

  const filteredTransactions = mockTransactions.filter(txn =>
    txn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    txn.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(parseFloat(value));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!bill) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={linkModalStyles.overlay}>
        <View style={[linkModalStyles.container, { backgroundColor: colors.background }]}>
          <View style={linkModalStyles.header}>
            <Text style={[linkModalStyles.title, { color: colors.text }]}>
              Link to Transaction
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Bill Info */}
          <View style={[linkModalStyles.billInfo, { borderBottomColor: colors.border }]}>
            <Text style={[linkModalStyles.billName, { color: colors.text }]}>
              {bill.name}
            </Text>
            <Text style={[linkModalStyles.billAmount, { color: '#10B981' }]}>
              {formatCurrency(bill.amount)}
            </Text>
          </View>

          {/* Search */}
          <View style={linkModalStyles.searchContainer}>
            <View style={[linkModalStyles.searchBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Ionicons name="search" size={18} color={colors.textSecondary} />
              <TextInput
                style={[linkModalStyles.searchInput, { color: colors.text }]}
                placeholder="Search transactions..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Transactions List */}
          <ScrollView style={linkModalStyles.transactionsList}>
            {filteredTransactions.length === 0 ? (
              <View style={linkModalStyles.emptyState}>
                <Ionicons name="receipt-outline" size={40} color={colors.textSecondary} />
                <Text style={[linkModalStyles.emptyText, { color: colors.textSecondary }]}>
                  No matching transactions found
                </Text>
              </View>
            ) : (
              filteredTransactions.map((txn) => {
                const isAmountMatch = Math.abs(parseFloat(txn.amount) - parseFloat(bill.amount)) < 0.01;
                return (
                  <TouchableOpacity
                    key={txn.id}
                    style={[linkModalStyles.transactionItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      onLink(bill.id, txn.id);
                      onClose();
                    }}
                  >
                    <View style={linkModalStyles.transactionLeft}>
                      <View style={[linkModalStyles.transactionIcon, { backgroundColor: '#10B98120' }]}>
                        <Ionicons name="receipt" size={18} color="#10B981" />
                      </View>
                      <View>
                        <Text style={[linkModalStyles.transactionName, { color: colors.text }]}>
                          {txn.name}
                        </Text>
                        <Text style={[linkModalStyles.transactionMeta, { color: colors.textSecondary }]}>
                          {formatDate(txn.date)} • {txn.category}
                        </Text>
                      </View>
                    </View>
                    <View style={linkModalStyles.transactionRight}>
                      <Text style={[linkModalStyles.transactionAmount, { color: colors.text }]}>
                        {formatCurrency(txn.amount)}
                      </Text>
                      {isAmountMatch && (
                        <View style={linkModalStyles.matchBadge}>
                          <Text style={linkModalStyles.matchText}>Match</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* Info */}
          <View style={[linkModalStyles.infoBox, { backgroundColor: colors.inputBg }]}>
            <Ionicons name="information-circle" size={16} color={colors.textSecondary} />
            <Text style={[linkModalStyles.infoText, { color: colors.textSecondary }]}>
              Linking helps track bill payments in your transaction history
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Bill Reminder Modal Component
const BillReminderModal: React.FC<{
  visible: boolean;
  bill: Bill | null;
  onClose: () => void;
  onSave: (billId: number | string, reminder: BillReminder) => void;
}> = ({ visible, bill, onClose, onSave }) => {
  const { isDark } = useTheme();
  const [enabled, setEnabled] = useState(true);
  const [daysBefore, setDaysBefore] = useState(1);
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [useCustomDays, setUseCustomDays] = useState(false);
  const [customDays, setCustomDays] = useState('1');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState('09:00');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hourInput, setHourInput] = useState('09');
  const [minuteInput, setMinuteInput] = useState('00');

  const colors = isDark ? {
    background: '#1F2937',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
    inputBg: '#374151',
  } : {
    background: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    inputBg: '#F3F4F6',
  };

  // Initialize with bill's existing reminder
  useEffect(() => {
    if (bill?.reminder) {
      setEnabled(bill.reminder.enabled);
      const reminderDays = bill.reminder.daysBefore;
      // Check if days is a preset value
      const presetDays = dayOptions.find(d => d.value === reminderDays);
      if (presetDays) {
        setDaysBefore(reminderDays);
        setUseCustomDays(false);
      } else {
        setCustomDays(reminderDays.toString());
        setUseCustomDays(true);
      }
      
      const reminderTime = bill.reminder.time || '09:00';
      const presetTime = timeOptions.find(t => t.value === reminderTime);
      if (presetTime) {
        setSelectedTime(reminderTime);
        setUseCustomTime(false);
      } else {
        setCustomTime(reminderTime);
        setUseCustomTime(true);
        // Initialize hour and minute inputs
        const [hour, minute] = reminderTime.split(':');
        setHourInput(hour || '09');
        setMinuteInput(minute || '00');
      }
    } else {
      setEnabled(true);
      setDaysBefore(1);
      setSelectedTime('09:00');
      setUseCustomDays(false);
      setUseCustomTime(false);
      setCustomDays('1');
      setCustomTime('09:00');
      setHourInput('09');
      setMinuteInput('00');
    }
  }, [bill]);

  // Update hour and minute inputs when customTime changes externally
  useEffect(() => {
    if (useCustomTime) {
      const [hour, minute] = customTime.split(':');
      setHourInput(hour || '09');
      setMinuteInput(minute || '00');
    }
  }, [customTime, useCustomTime]);

  const dayOptions = [
    { value: 1, label: '1 day before' },
    { value: 3, label: '3 days before' },
    { value: 7, label: '1 week before' },
  ];

  const timeOptions = [
    { value: '08:00', label: '8:00 AM' },
    { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '18:00', label: '6:00 PM' },
    { value: '20:00', label: '8:00 PM' },
  ];

  const handleSave = () => {
    if (bill) {
      const finalDaysBefore = useCustomDays ? parseInt(customDays) || 1 : daysBefore;
      const finalTime = useCustomTime ? customTime : selectedTime;
      
      // Validate
      if (enabled && (finalDaysBefore < 0 || finalDaysBefore > 365)) {
        Alert.alert('Invalid Input', 'Days before must be between 0 and 365');
        return;
      }
      
      onSave(bill.id, {
        enabled,
        daysBefore: finalDaysBefore,
        time: finalTime,
      });
    }
    onClose();
  };

  // Format time for display
  const formatTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const min = minutes || '00';
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${min} ${period}`;
    } catch {
      return timeStr;
    }
  };

  // Get final values for preview
  const getFinalDaysBefore = () => useCustomDays ? parseInt(customDays) || 1 : daysBefore;
  const getFinalTime = () => useCustomTime ? customTime : selectedTime;

  if (!bill) return null;

  return (
    <>
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={reminderModalStyles.overlay}>
        <View style={[reminderModalStyles.container, { backgroundColor: colors.background }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
          <View style={reminderModalStyles.header}>
            <Text style={[reminderModalStyles.title, { color: colors.text }]}>
              Set Reminder
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Bill Info */}
          <View style={[reminderModalStyles.billInfo, { borderBottomColor: colors.border }]}>
            <Ionicons name="notifications" size={24} color="#10B981" />
            <View style={reminderModalStyles.billDetails}>
              <Text style={[reminderModalStyles.billName, { color: colors.text }]}>
                {bill.name}
              </Text>
              <Text style={[reminderModalStyles.billDue, { color: colors.textSecondary }]}>
                Due: {new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
          </View>

          {/* Enable Toggle */}
          <TouchableOpacity
            style={[reminderModalStyles.toggleRow, { borderBottomColor: colors.border }]}
            onPress={() => setEnabled(!enabled)}
          >
            <View style={reminderModalStyles.toggleLeft}>
              <Ionicons name="alarm" size={20} color="#10B981" />
              <Text style={[reminderModalStyles.toggleLabel, { color: colors.text }]}>
                Enable Reminder
              </Text>
            </View>
            <View style={[reminderModalStyles.toggleSwitch, enabled && { backgroundColor: '#10B981' }]}>
              <View style={[reminderModalStyles.toggleKnob, enabled && { alignSelf: 'flex-end' }]} />
            </View>
          </TouchableOpacity>

          {enabled && (
            <>
              {/* Days Before Selection */}
              <View style={reminderModalStyles.optionSection}>
                <View style={reminderModalStyles.optionHeader}>
                <Text style={[reminderModalStyles.optionLabel, { color: colors.text }]}>
                  Remind me
                </Text>
                  <TouchableOpacity
                    onPress={() => setUseCustomDays(!useCustomDays)}
                    style={reminderModalStyles.customToggle}
                  >
                    <Text style={[reminderModalStyles.customToggleText, { color: useCustomDays ? '#10B981' : colors.textSecondary }]}>
                      {useCustomDays ? 'Preset' : 'Custom'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {!useCustomDays ? (
                <View style={reminderModalStyles.optionsRow}>
                  {dayOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        reminderModalStyles.optionPill,
                        { borderColor: colors.border },
                        daysBefore === option.value && { backgroundColor: '#10B981', borderColor: '#10B981' },
                      ]}
                      onPress={() => setDaysBefore(option.value)}
                    >
                      <Text
                        style={[
                          reminderModalStyles.optionText,
                          { color: colors.textSecondary },
                          daysBefore === option.value && { color: '#FFFFFF' },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                ) : (
                  <View style={reminderModalStyles.customInputContainer}>
                    <TextInput
                      style={[reminderModalStyles.customInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                      placeholder="Enter days (0-365)"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="number-pad"
                      value={customDays}
                      onChangeText={(text) => {
                        const num = parseInt(text);
                        if (text === '' || (!isNaN(num) && num >= 0 && num <= 365)) {
                          setCustomDays(text);
                        }
                      }}
                    />
                    <Text style={[reminderModalStyles.customInputLabel, { color: colors.textSecondary }]}>
                      days before due date
                    </Text>
                  </View>
                )}
              </View>

              {/* Time Selection */}
              <View style={reminderModalStyles.optionSection}>
                <View style={reminderModalStyles.optionHeader}>
                <Text style={[reminderModalStyles.optionLabel, { color: colors.text }]}>
                  At
                </Text>
                  <TouchableOpacity
                    onPress={() => setUseCustomTime(!useCustomTime)}
                    style={reminderModalStyles.customToggle}
                  >
                    <Text style={[reminderModalStyles.customToggleText, { color: useCustomTime ? '#10B981' : colors.textSecondary }]}>
                      {useCustomTime ? 'Preset' : 'Custom'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {!useCustomTime ? (
                <View style={reminderModalStyles.optionsRow}>
                  {timeOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        reminderModalStyles.optionPill,
                        { borderColor: colors.border },
                        selectedTime === option.value && { backgroundColor: '#10B981', borderColor: '#10B981' },
                      ]}
                      onPress={() => setSelectedTime(option.value)}
                    >
                      <Text
                        style={[
                          reminderModalStyles.optionText,
                          { color: colors.textSecondary },
                          selectedTime === option.value && { color: '#FFFFFF' },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                ) : (
                  <View style={reminderModalStyles.customInputContainer}>
                    <TouchableOpacity
                      style={[reminderModalStyles.timePickerButton, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
                      onPress={() => {
                        // Initialize inputs when opening picker
                        const [hour, minute] = customTime.split(':');
                        setHourInput(hour || '09');
                        setMinuteInput(minute || '00');
                        setShowTimePicker(true);
                      }}
                    >
                      <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                      <Text style={[reminderModalStyles.timePickerText, { color: colors.text }]}>
                        {formatTime(customTime)}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Preview */}
              <View style={[reminderModalStyles.previewBox, { backgroundColor: colors.inputBg }]}>
                <Ionicons name="notifications-outline" size={18} color="#10B981" />
                <Text style={[reminderModalStyles.previewText, { color: colors.text }]}>
                  You'll be reminded on{' '}
                  <Text style={{ fontWeight: '600' }}>
                    {new Date(new Date(bill.dueDate).getTime() - getFinalDaysBefore() * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                  {' '}at{' '}
                  <Text style={{ fontWeight: '600' }}>
                    {useCustomTime ? formatTime(getFinalTime()) : timeOptions.find(t => t.value === selectedTime)?.label}
                  </Text>
                </Text>
              </View>
            </>
          )}

          {/* Info */}
          <View style={[reminderModalStyles.infoBox, { backgroundColor: '#3B82F620' }]}>
            <Ionicons name="information-circle" size={16} color="#3B82F6" />
            <Text style={[reminderModalStyles.infoText, { color: '#3B82F6' }]}>
              Reminders require notification permissions. Enable them in Settings.
            </Text>
          </View>

          </ScrollView>

          {/* Actions */}
          <View style={reminderModalStyles.actions}>
            <TouchableOpacity
              style={[reminderModalStyles.cancelButton, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[reminderModalStyles.cancelText, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={reminderModalStyles.saveButton}
              onPress={handleSave}
            >
              <Ionicons name="notifications" size={16} color="#FFFFFF" />
              <Text style={reminderModalStyles.saveText}>
                {enabled ? 'Set Reminder' : 'Remove Reminder'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </Modal>
      
      {/* Time Picker Modal - Outside main modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <TouchableOpacity 
          style={reminderModalStyles.timePickerOverlay}
          activeOpacity={1}
          onPress={() => setShowTimePicker(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <TouchableOpacity 
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={[reminderModalStyles.timePickerModal, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={reminderModalStyles.timePickerHeader}>
                  <Text style={[reminderModalStyles.timePickerTitle, { color: colors.text }]}>Select Time</Text>
                  <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <View style={reminderModalStyles.timeInputRow}>
                  <View style={reminderModalStyles.timeInputGroup}>
                    <Text style={[reminderModalStyles.timeInputLabel, { color: colors.textSecondary }]}>Hour</Text>
                    <TextInput
                      style={[reminderModalStyles.timeInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                      keyboardType="number-pad"
                      maxLength={2}
                      value={hourInput}
                      onChangeText={(text) => {
                        // Allow empty string for better UX
                        if (text === '') {
                          setHourInput('');
                          return;
                        }
                        // Only allow numbers
                        const numericText = text.replace(/[^0-9]/g, '');
                        if (numericText === '') {
                          setHourInput('');
                          return;
                        }
                        const hour = parseInt(numericText);
                        // Validate hour range (0-23)
                        if (!isNaN(hour) && hour >= 0 && hour <= 23) {
                          setHourInput(numericText);
                        } else if (hour > 23) {
                          // If user types 24+, cap at 23
                          setHourInput('23');
                        }
                      }}
                      placeholder="00"
                      placeholderTextColor={colors.textSecondary}
                      editable={true}
                      selectTextOnFocus={true}
                    />
                  </View>
                  <Text style={[reminderModalStyles.timeSeparator, { color: colors.text }]}>:</Text>
                  <View style={reminderModalStyles.timeInputGroup}>
                    <Text style={[reminderModalStyles.timeInputLabel, { color: colors.textSecondary }]}>Minute</Text>
                    <TextInput
                      style={[reminderModalStyles.timeInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                      keyboardType="number-pad"
                      maxLength={2}
                      value={minuteInput}
                      onChangeText={(text) => {
                        // Allow empty string for better UX
                        if (text === '') {
                          setMinuteInput('');
                          return;
                        }
                        // Only allow numbers
                        const numericText = text.replace(/[^0-9]/g, '');
                        if (numericText === '') {
                          setMinuteInput('');
                          return;
                        }
                        const min = parseInt(numericText);
                        // Validate minute range (0-59)
                        if (!isNaN(min) && min >= 0 && min <= 59) {
                          setMinuteInput(numericText);
                        } else if (min > 59) {
                          // If user types 60+, cap at 59
                          setMinuteInput('59');
                        }
                      }}
                      placeholder="00"
                      placeholderTextColor={colors.textSecondary}
                      editable={true}
                      selectTextOnFocus={true}
                    />
                  </View>
                </View>
                <TouchableOpacity
                  style={reminderModalStyles.timePickerSaveButton}
                  onPress={() => {
                    // Format and save the time
                    const hour = hourInput === '' ? '00' : String(parseInt(hourInput) || 0).padStart(2, '0');
                    const minute = minuteInput === '' ? '00' : String(parseInt(minuteInput) || 0).padStart(2, '0');
                    const formattedTime = `${hour}:${minute}`;
                    setCustomTime(formattedTime);
                    setShowTimePicker(false);
                  }}
                >
                  <Text style={reminderModalStyles.timePickerSaveText}>Done</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const reminderModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  billInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  billDetails: {
    flex: 1,
  },
  billName: {
    fontSize: 16,
    fontWeight: '600',
  },
  billDue: {
    fontSize: 13,
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#374151',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  optionSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  previewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  previewText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 4,
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  customToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  customToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  customInputContainer: {
    marginTop: 8,
  },
  customInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
    marginBottom: 6,
  },
  customInputLabel: {
    fontSize: 12,
    marginLeft: 4,
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  timePickerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  timePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerModal: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  timePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  timeInputGroup: {
    alignItems: 'center',
    gap: 8,
  },
  timeInputLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  timeInput: {
    width: 60,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 20,
  },
  timePickerSaveButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  timePickerSaveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

const linkModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  billInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  billName: {
    fontSize: 15,
    fontWeight: '600',
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  transactionsList: {
    maxHeight: 250,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionName: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  matchBadge: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  matchText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
});

const splitModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  billSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  billName: {
    fontSize: 15,
    fontWeight: '600',
  },
  billTotal: {
    fontSize: 18,
    fontWeight: '700',
  },
  evenlyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  evenlyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  participantsList: {
    maxHeight: 200,
    paddingHorizontal: 20,
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  participantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  participantAvatar: {
    fontSize: 24,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '500',
  },
  paidLabel: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
  },
  participantRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountInput: {
    width: 80,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
  },
  participantActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    padding: 6,
    borderRadius: 8,
  },
  addParticipant: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  addInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  balanceLabel: {
    fontSize: 13,
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

// Category Filter Component
const CategoryFilter: React.FC<{
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}> = ({ selectedCategory, onCategoryChange }) => {
  const { isDark } = useTheme();

  const colors = isDark ? {
    background: '#374151',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
  } : {
    background: '#F3F4F6',
    text: '#111827',
    textSecondary: '#6B7280',
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={categoryFilterStyles.container}
      contentContainerStyle={categoryFilterStyles.contentContainer}
    >
      {BILL_CATEGORIES.map((category) => {
        const isSelected = selectedCategory === category.name;
        return (
          <TouchableOpacity
            key={category.name}
            style={[
              categoryFilterStyles.categoryPill,
              { 
                backgroundColor: isSelected ? category.color : colors.background,
                borderColor: category.color,
              },
            ]}
            onPress={() => onCategoryChange(category.name)}
          >
            <Text style={categoryFilterStyles.categoryEmoji}>{category.emoji}</Text>
            <Text
              style={[
                categoryFilterStyles.categoryText,
                { color: isSelected ? '#FFFFFF' : colors.text },
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const categoryFilterStyles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  contentContainer: {
    paddingHorizontal: 4,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

// Bill Analytics Component
const BillAnalytics: React.FC<{
  bills: Bill[];
}> = ({ bills }) => {
  const { isDark } = useTheme();

  const colors = isDark ? {
    card: '#1F2937',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
  } : {
    card: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  };

  // Calculate analytics
  const totalBills = bills.length;
  const totalAmount = bills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0);
  const paidBills = bills.filter(b => b.status === 'paid');
  const paidAmount = paidBills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0);
  const pendingBills = bills.filter(b => b.status !== 'paid');
  const pendingAmount = pendingBills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0);
  const autoPayBills = bills.filter(b => b.isAutoPay);
  const overdueBills = bills.filter(b => b.status === 'overdue');

  // Category breakdown
  const categoryBreakdown = bills.reduce((acc, bill) => {
    const cat = bill.category;
    if (!acc[cat]) {
      acc[cat] = { count: 0, amount: 0 };
    }
    acc[cat].count += 1;
    acc[cat].amount += parseFloat(bill.amount);
    return acc;
  }, {} as Record<string, { count: number; amount: number }>);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <View style={[analyticsStyles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Summary Stats */}
      <View style={analyticsStyles.statsRow}>
        <View style={analyticsStyles.statItem}>
          <Text style={[analyticsStyles.statValue, { color: '#10B981' }]}>
            {formatCurrency(paidAmount)}
          </Text>
          <Text style={[analyticsStyles.statLabel, { color: colors.textSecondary }]}>
            Paid ({paidBills.length})
          </Text>
        </View>
        <View style={[analyticsStyles.statDivider, { backgroundColor: colors.border }]} />
        <View style={analyticsStyles.statItem}>
          <Text style={[analyticsStyles.statValue, { color: '#F59E0B' }]}>
            {formatCurrency(pendingAmount)}
          </Text>
          <Text style={[analyticsStyles.statLabel, { color: colors.textSecondary }]}>
            Pending ({pendingBills.length})
          </Text>
        </View>
        <View style={[analyticsStyles.statDivider, { backgroundColor: colors.border }]} />
        <View style={analyticsStyles.statItem}>
          <Text style={[analyticsStyles.statValue, { color: colors.text }]}>
            {formatCurrency(totalAmount)}
          </Text>
          <Text style={[analyticsStyles.statLabel, { color: colors.textSecondary }]}>
            Total ({totalBills})
          </Text>
        </View>
      </View>

      {/* Quick Stats Badges */}
      <View style={analyticsStyles.badgesRow}>
        {autoPayBills.length > 0 && (
          <View style={[analyticsStyles.badge, { backgroundColor: '#3B82F620' }]}>
            <Ionicons name="repeat" size={12} color="#3B82F6" />
            <Text style={[analyticsStyles.badgeText, { color: '#3B82F6' }]}>
              {autoPayBills.length} Auto-Pay
            </Text>
          </View>
        )}
        {overdueBills.length > 0 && (
          <View style={[analyticsStyles.badge, { backgroundColor: '#EF444420' }]}>
            <Ionicons name="alert-circle" size={12} color="#EF4444" />
            <Text style={[analyticsStyles.badgeText, { color: '#EF4444' }]}>
              {overdueBills.length} Overdue
            </Text>
          </View>
        )}
      </View>

      {/* Category Breakdown Progress Bars */}
      <View style={analyticsStyles.categoryBreakdown}>
        {Object.entries(categoryBreakdown)
          .sort((a, b) => b[1].amount - a[1].amount)
          .slice(0, 3)
          .map(([category, data]) => {
            const percentage = totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0;
            const categoryConfig = BILL_CATEGORIES.find(c => c.name === category);
            const color = categoryConfig?.color || '#6B7280';
            
            return (
              <View key={category} style={analyticsStyles.categoryRow}>
                <View style={analyticsStyles.categoryInfo}>
                  <Text style={[analyticsStyles.categoryName, { color: colors.text }]}>
                    {categoryConfig?.emoji} {category}
                  </Text>
                  <Text style={[analyticsStyles.categoryAmount, { color: colors.textSecondary }]}>
                    {formatCurrency(data.amount)}
                  </Text>
                </View>
                <View style={[analyticsStyles.progressBar, { backgroundColor: colors.border }]}>
                  <View 
                    style={[
                      analyticsStyles.progressFill, 
                      { width: `${percentage}%`, backgroundColor: color }
                    ]} 
                  />
                </View>
              </View>
            );
          })}
      </View>
    </View>
  );
};

const analyticsStyles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  categoryBreakdown: {
    gap: 8,
  },
  categoryRow: {
    gap: 4,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

// Bill History Modal Component
const BillHistoryModal: React.FC<{
  visible: boolean;
  bill: Bill | null;
  onClose: () => void;
}> = ({ visible, bill, onClose }) => {
  const { isDark } = useTheme();

  const colors = isDark ? {
    background: '#1F2937',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
  } : {
    background: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(parseFloat(value));
  };

  if (!bill) return null;

  const history = bill.paymentHistory || [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={historyModalStyles.overlay}>
        <View style={[historyModalStyles.container, { backgroundColor: colors.background }]}>
          <View style={historyModalStyles.header}>
            <Text style={[historyModalStyles.title, { color: colors.text }]}>
              Payment History
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={historyModalStyles.billInfo}>
            <Text style={[historyModalStyles.billName, { color: colors.text }]}>
              {bill.name}
            </Text>
            <Text style={[historyModalStyles.billCategory, { color: colors.textSecondary }]}>
              {bill.category} • {bill.isRecurring ? `Recurring ${bill.recurringFrequency}` : 'One-time'}
            </Text>
          </View>

          <ScrollView style={historyModalStyles.historyList}>
            {history.length === 0 ? (
              <View style={historyModalStyles.emptyHistory}>
                <Ionicons name="receipt-outline" size={40} color={colors.textSecondary} />
                <Text style={[historyModalStyles.emptyText, { color: colors.textSecondary }]}>
                  No payment history yet
                </Text>
              </View>
            ) : (
              history.map((record) => (
                <View 
                  key={record.id} 
                  style={[historyModalStyles.historyItem, { borderBottomColor: colors.border }]}
                >
                  <View style={historyModalStyles.historyLeft}>
                    <View style={historyModalStyles.historyIcon}>
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    </View>
                    <View>
                      <Text style={[historyModalStyles.historyDate, { color: colors.text }]}>
                        {formatDate(record.paidDate)}
                      </Text>
                      <Text style={[historyModalStyles.historyMethod, { color: colors.textSecondary }]}>
                        {record.paymentMethod}
                      </Text>
                    </View>
                  </View>
                  <Text style={[historyModalStyles.historyAmount, { color: '#10B981' }]}>
                    {formatCurrency(record.amount)}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const historyModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  billInfo: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  billName: {
    fontSize: 16,
    fontWeight: '600',
  },
  billCategory: {
    fontSize: 13,
    marginTop: 2,
  },
  historyList: {
    paddingHorizontal: 20,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B98120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  historyMethod: {
    fontSize: 12,
  },
  historyAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
});

// Calendar View Component
const CalendarView: React.FC<{
  bills: Bill[];
  onSelectBill: (bill: Bill) => void;
}> = ({ bills, onSelectBill }) => {
  const { isDark } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const colors = isDark ? {
    background: '#1F2937',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
    today: '#10B981',
  } : {
    background: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    today: '#10B981',
  };

  // Get calendar data
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Get bills for a specific date
  const getBillsForDate = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bills.filter(bill => bill.dueDate === dateStr);
  };

  // Navigate months
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Check if day is today
  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  // Generate calendar grid
  const renderCalendar = () => {
    const days = [];
    const totalCells = Math.ceil((daysInMonth + startingDay) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - startingDay + 1;
      const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
      const dayBills = isValidDay ? getBillsForDate(dayNumber) : [];
      const hasBills = dayBills.length > 0;
      const hasOverdue = dayBills.some(b => b.status === 'overdue');
      const hasPaid = dayBills.every(b => b.status === 'paid') && hasBills;

      days.push(
        <TouchableOpacity
          key={i}
          style={[
            calendarStyles.dayCell,
            isToday(dayNumber) && calendarStyles.todayCell,
            !isValidDay && calendarStyles.emptyCell,
          ]}
          onPress={() => {
            if (hasBills) {
              onSelectBill(dayBills[0]);
            }
          }}
          disabled={!hasBills}
        >
          {isValidDay && (
            <>
              <Text
                style={[
                  calendarStyles.dayText,
                  { color: isToday(dayNumber) ? '#FFFFFF' : colors.text },
                  !isValidDay && { color: colors.textSecondary },
                ]}
              >
                {dayNumber}
              </Text>
              {hasBills && (
                <View style={calendarStyles.billDots}>
                  {dayBills.slice(0, 3).map((bill, idx) => (
                    <View
                      key={idx}
                      style={[
                        calendarStyles.billDot,
                        {
                          backgroundColor: hasOverdue 
                            ? '#EF4444' 
                            : hasPaid 
                              ? '#10B981' 
                              : '#F59E0B'
                        },
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </TouchableOpacity>
      );
    }

    return days;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={[calendarStyles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      {/* Header */}
      <View style={calendarStyles.header}>
        <TouchableOpacity onPress={prevMonth} style={calendarStyles.navButton}>
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[calendarStyles.monthTitle, { color: colors.text }]}>{monthYear}</Text>
        <TouchableOpacity onPress={nextMonth} style={calendarStyles.navButton}>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Week Days Header */}
      <View style={calendarStyles.weekDaysRow}>
        {weekDays.map(day => (
          <Text key={day} style={[calendarStyles.weekDayText, { color: colors.textSecondary }]}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={calendarStyles.grid}>
        {renderCalendar()}
      </View>

      {/* Legend */}
      <View style={calendarStyles.legend}>
        <View style={calendarStyles.legendItem}>
          <View style={[calendarStyles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={[calendarStyles.legendText, { color: colors.textSecondary }]}>Due</Text>
        </View>
        <View style={calendarStyles.legendItem}>
          <View style={[calendarStyles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={[calendarStyles.legendText, { color: colors.textSecondary }]}>Paid</Text>
        </View>
        <View style={calendarStyles.legendItem}>
          <View style={[calendarStyles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={[calendarStyles.legendText, { color: colors.textSecondary }]}>Overdue</Text>
        </View>
      </View>
    </View>
  );
};

const calendarStyles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navButton: {
    padding: 4,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayText: {
    fontSize: 11,
    fontWeight: '600',
    width: 36,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  todayCell: {
    backgroundColor: '#10B981',
    borderRadius: 20,
  },
  emptyCell: {
    opacity: 0,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
  },
  billDots: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  billDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#37415130',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '500',
  },
});

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

// Bill Item Action Menu
const BillActionMenu: React.FC<{
  visible: boolean;
  bill: Bill;
  onClose: () => void;
  onEditBill: () => void;
  onDeleteBill: () => void;
  onMarkAsPaid: () => void;
  onViewHistory: () => void;
  onSplitBill: () => void;
  onLinkTransaction: () => void;
  onSetReminder: () => void;
  onPauseBill?: () => void;
  onEndBill?: () => void;
  onResumeBill?: () => void;
}> = ({ visible, bill, onClose, onEditBill, onDeleteBill, onMarkAsPaid, onViewHistory, onSplitBill, onLinkTransaction, onSetReminder, onPauseBill, onEndBill, onResumeBill }) => {
  const { isDark } = useTheme();
  
  const colors = isDark ? {
    background: '#1F2937',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
  } : {
    background: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  };

  const menuItems = [
    { icon: 'create-outline', label: 'Edit Bill', onPress: onEditBill, color: '#3B82F6' },
    ...(bill.status !== 'paid' && bill.status !== 'paused' && bill.status !== 'ended' ? [
      { icon: 'checkmark-circle-outline', label: 'Mark as Paid', onPress: onMarkAsPaid, color: '#10B981' },
      { icon: 'notifications-outline', label: bill.reminder?.enabled ? 'Edit Reminder' : 'Set Reminder', onPress: onSetReminder, color: '#F59E0B' },
    ] : []),
    ...(bill.status === 'paused' && onResumeBill ? [
      { icon: 'play-outline', label: 'Resume Bill', onPress: onResumeBill, color: '#10B981' },
    ] : []),
    ...(bill.status === 'ended' && onResumeBill ? [
      { icon: 'refresh-outline', label: 'Reactivate Bill', onPress: onResumeBill, color: '#10B981' },
    ] : []),
    ...(bill.status !== 'paused' && bill.status !== 'ended' && bill.status !== 'paid' && onPauseBill ? [
      { icon: 'pause-outline', label: 'Pause Bill', onPress: onPauseBill, color: '#F59E0B' },
    ] : []),
    ...(bill.status !== 'ended' && bill.status !== 'paid' && onEndBill ? [
      { icon: 'stop-outline', label: 'End Bill', onPress: onEndBill, color: '#EF4444' },
    ] : []),
    ...(bill.status === 'paid' ? [
      { icon: 'close-circle-outline', label: 'Unmark as Paid', onPress: onMarkAsPaid, color: '#6B7280' },
      { icon: 'link-outline', label: 'Link Transaction', onPress: onLinkTransaction, color: '#F59E0B' },
    ] : []),
    { icon: 'people-outline', label: bill.isSplit ? 'Edit Split' : 'Split Bill', onPress: onSplitBill, color: '#8B5CF6' },
    ...(bill.paymentHistory && bill.paymentHistory.length > 0 ? [
      { icon: 'time-outline', label: 'Payment History', onPress: onViewHistory, color: '#6B7280' },
    ] : []),
    { icon: 'trash-outline', label: 'Delete Bill', onPress: onDeleteBill, color: '#EF4444' },
  ];

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={actionMenuStyles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={[actionMenuStyles.menu, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={actionMenuStyles.header}>
            <Text style={[actionMenuStyles.title, { color: colors.text }]}>{bill.name}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[actionMenuStyles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => {
                onClose();
                item.onPress();
              }}
            >
              <Ionicons name={item.icon as any} size={18} color={item.color} />
              <Text style={[actionMenuStyles.menuLabel, { color: item.color === '#EF4444' ? '#EF4444' : colors.text }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const actionMenuStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    width: '80%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});

// Enhanced icon mapping functions - shared across components
const getIconName = (icon: string, category?: string): string => {
  // Map icon names to Ionicons
  const iconMap: { [key: string]: string } = {
    'lightning': 'flash',
    'tv': 'tv',
    'water': 'water',
    'phone': 'call',
    'wifi': 'wifi',
    'document': 'document-text',
    'home': 'home',
    'shopping': 'cart',
    'shield': 'shield',
    'card': 'card',
    'car': 'car',
    'medical': 'medical',
    'school': 'school',
    'restaurant': 'restaurant',
    'fitness': 'fitness',
    'gas': 'car-sport',
  };
  
  // If icon not found, try to infer from category
  if (!iconMap[icon] && category) {
    const categoryMap: { [key: string]: string } = {
      'Utilities': 'flash',
      'Subscriptions': 'tv',
      'Insurance': 'shield',
      'Housing': 'home',
      'Loan': 'card',
      'Phone': 'call',
      'Internet': 'wifi',
      'Water': 'water',
      'Electricity': 'flash',
      'Gas': 'car-sport',
      'Medical': 'medical',
      'Education': 'school',
      'Food': 'restaurant',
      'Fitness': 'fitness',
      'Shopping': 'cart',
    };
    return categoryMap[category] || 'document-text';
  }
  
  return iconMap[icon] || 'document-text';
};

const getIconColor = (icon: string, category?: string) => {
  const colorMap: { [key: string]: string } = {
    'lightning': '#10B981',
    'tv': '#F59E0B',
    'water': '#06B6D4',
    'phone': '#3B82F6',
    'call': '#3B82F6',
    'wifi': '#8B5CF6',
    'document': '#6B7280',
    'document-text': '#6B7280',
    'home': '#10B981',
    'shopping': '#F59E0B',
    'cart': '#F59E0B',
    'shield': '#3B82F6',
    'card': '#EF4444',
    'car': '#8B5CF6',
    'medical': '#EF4444',
    'school': '#8B5CF6',
    'restaurant': '#F59E0B',
    'fitness': '#10B981',
    'car-sport': '#06B6D4',
  };
  
  // If icon not found, try to infer from category
  if (!colorMap[icon] && category) {
    const categoryColorMap: { [key: string]: string } = {
      'Utilities': '#10B981',
      'Subscriptions': '#F59E0B',
      'Insurance': '#3B82F6',
      'Housing': '#8B5CF6',
      'Loan': '#EF4444',
      'Phone': '#3B82F6',
      'Internet': '#8B5CF6',
      'Water': '#06B6D4',
      'Electricity': '#10B981',
      'Gas': '#06B6D4',
      'Medical': '#EF4444',
      'Education': '#8B5CF6',
      'Food': '#F59E0B',
      'Fitness': '#10B981',
      'Shopping': '#F59E0B',
    };
    return categoryColorMap[category] || '#6B7280';
  }
  
  return colorMap[icon] || '#6B7280';
};

// Bill Group Component
const BillGroup: React.FC<{
  dateLabel: string;
  bills: Bill[];
  onEditBill: (id: number | string) => void;
  onDeleteBill: (id: number | string) => void;
  onMarkAsPaid: (id: number | string) => void;
  onViewHistory: (id: number | string) => void;
  onSplitBill: (id: number | string) => void;
  onLinkTransaction: (id: number | string) => void;
  onSetReminder: (id: number | string) => void;
  onToggleAutoPay?: (id: number | string) => void;
  onPauseBill?: (id: number | string) => void;
  onEndBill?: (id: number | string) => void;
  onResumeBill?: (id: number | string) => void;
}> = ({ dateLabel, bills, onEditBill, onDeleteBill, onMarkAsPaid, onViewHistory, onSplitBill, onLinkTransaction, onSetReminder, onToggleAutoPay, onPauseBill, onEndBill, onResumeBill }) => {
  const { isDark } = useTheme();
  const [menuBill, setMenuBill] = useState<Bill | null>(null);
  
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
      maximumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'due_today':
        return '#EF4444';
      case 'due_tomorrow':
        return '#F59E0B';
      case 'due_week':
        return '#3B82F6';
      case 'paid':
        return '#10B981';
      case 'overdue':
        return '#DC2626';
      case 'paused':
        return '#F59E0B';
      case 'ended':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'due_today': return 'Today';
      case 'due_tomorrow': return 'Tomorrow';
      case 'due_week': return 'This Week';
      case 'paid': return 'Paid';
      case 'overdue': return 'Overdue';
      case 'paused': return 'Paused';
      case 'ended': return 'Ended';
      default: return '';
    }
  };

  // Get status indicator icon for bill icon overlay
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'paid':
        return { icon: 'checkmark-circle', color: '#10B981' };
      case 'paused':
        return { icon: 'pause-circle', color: '#F59E0B' };
      case 'ended':
        return { icon: 'stop-circle', color: '#6B7280' };
      default:
        return null;
    }
  };

  return (
    <View style={[styles.billGroup, { borderBottomColor: colors.border }]}>
      {/* Date Header */}
      <View style={styles.dateHeader}>
        <Text style={[styles.dateText, { color: colors.text }]}>{dateLabel}</Text>
      </View>

      {/* Bills */}
      {bills.map((bill, index) => (
        <View key={bill.id}>
        {index > 0 && (
          <View style={[styles.billDivider, { backgroundColor: colors.border }]} />
        )}
        <TouchableOpacity
          style={[styles.billItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => onEditBill(bill.id)}
            onLongPress={() => setMenuBill(bill)}
          activeOpacity={0.7}
          >
            {/* Left: Icon + Info */}
          <View style={styles.billLeft}>
            <View style={[styles.billIcon, { backgroundColor: `${getIconColor(bill.icon, bill.category)}15`, borderColor: `${getIconColor(bill.icon, bill.category)}30` }]}>
              <Ionicons 
                name={getIconName(bill.icon, bill.category) as any} 
                size={18} 
                color={getIconColor(bill.icon, bill.category)} 
              />
              {/* Status Indicator Overlay */}
              {getStatusIndicator(bill.status) && (
                <View style={styles.statusIndicatorOverlay}>
                  <Ionicons 
                    name={getStatusIndicator(bill.status)?.icon as any} 
                    size={12} 
                    color={getStatusIndicator(bill.status)?.color} 
                  />
                </View>
              )}
            </View>
            <View style={styles.billInfo}>
                {/* Bill Name + Badges */}
              <View style={styles.billHeader}>
                  <Text style={[styles.billName, { color: colors.text }]} numberOfLines={1}>
                  {bill.name}
                </Text>
                  {/* Compact badges */}
                  <View style={styles.compactBadges}>
                    {bill.isAutoPay && (
                      <View style={[styles.miniBadge, { backgroundColor: bill.autopay_source ? '#10B98120' : '#EF444420' }]}>
                        <Ionicons name={bill.autopay_source ? "sync" : "warning"} size={9} color={bill.autopay_source ? "#10B981" : "#EF4444"} />
                      </View>
                    )}
                    {bill.reminder?.enabled && (
                      <View style={[styles.miniBadge, { backgroundColor: '#F59E0B20' }]}>
                        <Ionicons name="notifications" size={9} color="#F59E0B" />
                      </View>
                    )}
                    {bill.isSplit && (
                      <View style={[styles.miniBadge, { backgroundColor: '#8B5CF620' }]}>
                        <Ionicons name="people" size={9} color="#8B5CF6" />
                      </View>
                    )}
                  </View>
                </View>
                {/* Category + Status */}
                <View style={styles.billMeta}>
                  <Text style={[styles.billCategory, { color: colors.textSecondary }]}>
                    {bill.category}
                      </Text>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(bill.status) }]} />
                  <Text style={[styles.statusLabel, { color: getStatusColor(bill.status) }]}>
                    {getStatusText(bill.status)}
                </Text>
              </View>
            </View>
          </View>
          
            {/* Right: Amount + Action */}
          <View style={styles.billRight}>
            <Text style={[styles.billAmount, { color: colors.text }]}>
              {formatCurrency(bill.amount)}
            </Text>
            <View style={styles.billActions}>
              {bill.status === 'paid' ? (
                <TouchableOpacity
                  style={[styles.payButton, { backgroundColor: '#10B98120' }]}
                  onPress={() => onMarkAsPaid(bill.id)}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.payButton, { backgroundColor: '#6B728015' }]}
                  onPress={() => onMarkAsPaid(bill.id)}
                >
                  <Ionicons name="ellipse-outline" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.payButton, { backgroundColor: '#3B82F620', marginLeft: 6 }]}
                onPress={(e) => {
                  e.stopPropagation();
                  onViewHistory(bill.id);
                }}
              >
                <Ionicons name="receipt-outline" size={16} color="#3B82F6" />
              </TouchableOpacity>
              {bill.isAutoPay ? (
                <TouchableOpacity
                  style={[styles.autoPayButton, { backgroundColor: '#10B98120' }]}
                  onPress={() => {
                    if (onToggleAutoPay) {
                      onToggleAutoPay(bill.id);
                    }
                  }}
                >
                  <Ionicons name="sync-circle" size={16} color="#10B981" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.autoPayButton, { backgroundColor: '#6B728015' }]}
                  onPress={() => {
                    if (onToggleAutoPay) {
                      onToggleAutoPay(bill.id);
                    }
                  }}
                >
                  <Ionicons name="sync-outline" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            </View>

            {/* More Options */}
            <TouchableOpacity 
              style={styles.moreButton}
              onPress={() => setMenuBill(bill)}
            >
            <Ionicons name="ellipsis-vertical" size={14} color={colors.textSecondary} />
        </TouchableOpacity>
          </TouchableOpacity>

          {/* Action Menu Modal */}
          {menuBill?.id === bill.id && (
            <BillActionMenu
              visible={true}
              bill={bill}
              onClose={() => setMenuBill(null)}
              onEditBill={() => onEditBill(bill.id)}
              onDeleteBill={() => onDeleteBill(bill.id)}
              onMarkAsPaid={() => onMarkAsPaid(bill.id)}
              onViewHistory={() => onViewHistory(bill.id)}
              onSplitBill={() => onSplitBill(bill.id)}
              onLinkTransaction={() => onLinkTransaction(bill.id)}
              onSetReminder={() => {
                setMenuBill(null);
                onSetReminder(bill.id);
              }}
              onPauseBill={onPauseBill ? () => onPauseBill(bill.id) : undefined}
              onEndBill={onEndBill ? () => onEndBill(bill.id) : undefined}
              onResumeBill={onResumeBill ? () => onResumeBill(bill.id) : undefined}
            />
          )}
        </View>
      ))}
    </View>
  );
};

const UpcomingBillsSection: React.FC<UpcomingBillsSectionProps> = ({
  className = "",
  useTestData = false,
  showSmartDetection = true,
  showBudgetImpact = true,
}) => {
  const { isDark } = useTheme();
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [showBudgetIntegration, setShowBudgetIntegration] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [formData, setFormData] = useState({
    // Core MVP Fields
    name: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    category: 'Utilities',
    billingFrequency: 'monthly' as 'one-time' | 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'semi-annually' | 'yearly',
    paymentStatus: 'upcoming' as 'upcoming' | 'paid' | 'skipped',
    isAutoPay: false,
    // Important Fields
    reminders: [] as ('same-day' | '1-day' | '3-days' | '7-days')[],
    paymentMethod: '' as '' | 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Cash' | 'Wallet',
    linkedAccount: '',
    // Advanced Fields
    startDate: '',
    endDate: '',
    hasEndDate: false,
    isVariableAmount: false,
    lastPaidAmount: '',
    description: '',
    serviceProvider: '',
    consumerId: '',
    lateFee: '',
    hasTax: false,
    priority: 'medium' as 'high' | 'medium' | 'low',
    // New Enhanced Fields
    tags: [] as string[],
    notes: '',
    reminderDaysBefore: [7, 3, 1] as number[],
    reminderEnabled: true,
    recurrencePattern: null as any,
    recurrenceCount: null as number | null,
    recurrenceEndDate: null as string | null,
    nextDueDate: null as string | null,
    isIncludedInBudget: true,
    budgetPeriod: 'monthly' as 'monthly' | 'quarterly' | 'yearly' | null,
    // UI State
    showAdvanced: false,
  });
  
  // Payment history modal state
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [selectedBillForHistory, setSelectedBillForHistory] = useState<{ id: string; name: string } | null>(null);
  
  // Dashboard bill menu state
  const [dashboardMenuBill, setDashboardMenuBill] = useState<Bill | null>(null);
  
  // Reminder modal state
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedBillForReminder, setSelectedBillForReminder] = useState<Bill | null>(null);

  // Populate formData when editing a bill
  useEffect(() => {
    if (editingBill) {
      setFormData({
        name: editingBill.name || '',
        amount: editingBill.amount || '',
        dueDate: editingBill.dueDate || new Date().toISOString().split('T')[0],
        category: editingBill.category || 'Utilities',
        billingFrequency: (editingBill.recurringFrequency || 'monthly') as any,
        paymentStatus: editingBill.status === 'paid' ? 'paid' : 'upcoming',
        isAutoPay: editingBill.isAutoPay || false,
        reminders: [],
        paymentMethod: (editingBill.paymentMethod || '') as any,
        linkedAccount: '',
        startDate: '',
        endDate: '',
        hasEndDate: false,
        isVariableAmount: false,
        lastPaidAmount: '',
        description: editingBill.description || '',
        serviceProvider: '',
        consumerId: '',
        lateFee: editingBill.lateFee || '',
        hasTax: false,
        priority: 'medium',
        // New Enhanced Fields
        tags: editingBill.tags || [],
        notes: '',
        reminderDaysBefore: [7, 3, 1],
        reminderEnabled: true,
        recurrencePattern: null,
        recurrenceCount: null,
        recurrenceEndDate: null,
        nextDueDate: null,
        isIncludedInBudget: true,
        budgetPeriod: 'monthly',
        showAdvanced: false,
      });
      setShowAddModal(true);
    }
  }, [editingBill]);

  // Helper function to transform database bill to UI Bill format
  const transformDatabaseBillToBill = (dbBill: UpcomingBill): Bill => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dbBill.due_date);
    dueDate.setHours(0, 0, 0, 0);
    
    let status: Bill['status'] = 'due_week'; // Default to due_week
    const daysDiff = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dbBill.status === 'paid') {
      status = 'paid';
    } else if (dbBill.status === 'cancelled') {
      // Check metadata to distinguish between paused and ended
      const metadata = dbBill.metadata as any;
      if (metadata && metadata.ui_status === 'ended') {
        status = 'ended';
      } else {
        // Default to 'paused' if metadata doesn't specify (for backwards compatibility)
        status = 'paused';
      }
    } else if (daysDiff < 0) {
      status = 'overdue';
    } else if (daysDiff === 0) {
      status = 'due_today';
    } else if (daysDiff === 1) {
      status = 'due_tomorrow';
    } else if (daysDiff <= 7) {
      status = 'due_week';
    } else {
      status = 'due_week'; // For bills due more than a week away, still show as due_week
    }

    // Derive category from tags (first tag is usually the category) or use default
    const tags = dbBill.tags || [];
    const category = tags.length > 0 && BILL_CATEGORIES.find(cat => cat.name === tags[0]) 
      ? tags[0] 
      : (tags.length > 0 ? tags[0] : 'Other');
    const subcategory = tags.length > 1 ? tags[1] : '';

    // Get icon based on category
    const categoryConfig = BILL_CATEGORIES.find(cat => cat.name === category) || BILL_CATEGORIES[0];
    const icon = categoryConfig.icon;

    return {
      id: dbBill.id,
      name: dbBill.name,
      type: category,
      dueDate: dbBill.due_date,
      amount: dbBill.amount?.toString() || '0',
      category: category,
      subcategory: subcategory,
      description: dbBill.description || '',
      icon: icon,
      status: status,
      isAutoPay: dbBill.autopay || false,
      paymentMethod: dbBill.autopay ? (dbBill.account_name || dbBill.credit_card_name || 'Auto') : 'Manual',
      autopay_source: dbBill.autopay_source || null,
      tags: tags,
      isRecurring: dbBill.frequency !== 'one-time',
      recurringFrequency: dbBill.frequency as any,
      reminder: dbBill.reminder_enabled ? {
        enabled: dbBill.reminder_enabled,
        daysBefore: dbBill.reminder_days_before || [],
        time: '09:00', // Default reminder time
      } : undefined,
    };
  };

  // Fetch bills from database
  useEffect(() => {
    const loadBills = async () => {
      try {
        setLoading(true);
        setError(null);

        const fetchedBills = await fetchUpcomingBills({}, false); // isDemo = false for real table
        const transformedBills = fetchedBills.map(transformDatabaseBillToBill);
        
        setBills(transformedBills);
        console.log(`✅ Loaded ${transformedBills.length} bills from database`);
      } catch (err: any) {
        console.error('Error fetching bills:', err);
        setError(err.message || 'Failed to load bills');
        // Fallback to empty array on error
        setBills([]);
      } finally {
        setLoading(false);
      }
    };

    loadBills();
  }, []);

  // Note: Auto-seeding of mock bills has been disabled
  // Users should add bills manually or import them

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

  // Get most urgent bills for dashboard (show all bills with status indicators)
  const getUpcomingBills = () => {
    const now = new Date();
    const filtered = bills
      .filter(bill => {
        // Category filter
        if (selectedCategory !== 'All' && bill.category !== selectedCategory) {
          return false;
        }
        // Show all bills including paid, paused, and ended ones (they'll have status indicators)
        return true; // Don't filter out any bills
      })
      .sort((a, b) => {
        // Sort by urgency: due_today > due_tomorrow > overdue > due_week > paused > paid > ended
        const statusOrder: { [key: string]: number } = { 
          'due_today': 1, 
          'due_tomorrow': 2, 
          'overdue': 3, 
          'due_week': 4, 
          'paused': 5,
          'paid': 6,
          'ended': 7
        };
        const aOrder = statusOrder[a.status] || 7;
        const bOrder = statusOrder[b.status] || 7;
        if (aOrder !== bOrder) return aOrder - bOrder;
        // Then by due date
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    
    // Separate bills by status for better display control
    const activeBills = filtered.filter(b => b.status !== 'paid' && b.status !== 'paused' && b.status !== 'ended');
    const pausedBills = filtered.filter(b => b.status === 'paused');
    const paidBills = filtered.filter(b => b.status === 'paid');
    const endedBills = filtered.filter(b => b.status === 'ended');
    
    // Show up to 5 active (unpaid) bills, then all paused bills, then paid bills (up to 3), then all ended bills
    // This ensures paused, paid, and ended bills are always visible
    const activeToShow = activeBills.slice(0, 5);
    const pausedToShow = pausedBills; // Show all paused bills
    const paidToShow = paidBills.slice(0, 3);
    const endedToShow = endedBills; // Show all ended bills (so users can reactivate them)
    
    return [...activeToShow, ...pausedToShow, ...paidToShow, ...endedToShow];
  };

  const upcomingBills = getUpcomingBills();
  const groupedBills = groupBillsByDate(upcomingBills);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleNavigateToBills = () => {
    navigation.navigate('Bills');
  };


  // Mark bill as paid (with persistence to Supabase)
  const handleMarkAsPaid = useCallback(async (billId: number | string) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    if (bill.status === 'paid') {
      // Toggle back to unpaid
      Alert.alert(
        'Unmark as Paid',
        'Are you sure you want to unmark this bill as paid?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unmark',
            onPress: async () => {
              try {
                const dueDate = new Date(bill.dueDate);
                const today = new Date();
                const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                let newStatus: 'due_today' | 'due_tomorrow' | 'due_week' | 'paid' | 'overdue';
                if (diffDays < 0) {
                  newStatus = 'overdue';
                } else if (diffDays === 0) {
                  newStatus = 'due_today';
                } else if (diffDays === 1) {
                  newStatus = 'due_tomorrow';
                } else {
                  newStatus = 'due_week';
                }

                // Update in Supabase if bill has string ID
                if (typeof billId === 'string') {
                  // Map UI status to database status
                  const dbStatus = mapStatusToDatabase(newStatus);
                  await updateUpcomingBill(billId, { status: dbStatus as any }, false);
                }

                // Update local state - this will trigger re-render and bill will appear in unpaid section
                setBills(prevBills =>
                  prevBills.map(b => b.id === billId ? { ...b, status: newStatus } : b)
                );
              } catch (error: any) {
                console.error('Error unmarking bill as paid:', error);
                Alert.alert('Error', error.message || 'Failed to unmark bill as paid. Please try again.');
              }
            },
          },
        ]
      );
      return;
    } else {
      // Mark as paid
    Alert.alert(
      'Mark as Paid',
      'Are you sure you want to mark this bill as paid?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Paid',
            onPress: async () => {
              try {
                // Update bill status in Supabase
                if (typeof billId === 'string') {
                  const today = new Date().toISOString().split('T')[0];
                  await updateUpcomingBill(billId, { 
                    status: 'paid' as any,
                    last_paid_date: today,
                    last_paid_amount: parseFloat(bill.amount),
                  }, false);
                  
                  // Create payment record
                  await addBillPayment({
                    bill_id: billId,
                    payment_date: today,
                    amount: parseFloat(bill.amount),
                    payment_method: bill.paymentMethod === 'Auto Pay' ? 'account' : 'other',
                    status: 'completed',
                  }, false);
                }

                // Update local state
                  const paymentRecord: PaymentRecord = {
                    id: Date.now(),
                    paidDate: new Date().toISOString().split('T')[0],
                  amount: bill.amount,
                  paymentMethod: bill.paymentMethod || 'Manual',
                  };

                setBills(prevBills =>
                  prevBills.map(b =>
                    b.id === billId
                      ? {
                      ...b,
                    status: 'paid' as const,
                      paymentHistory: [...(b.paymentHistory || []), paymentRecord],
                }
                      : b
                  )
            );
              } catch (error: any) {
                console.error('Error marking bill as paid:', error);
                Alert.alert('Error', error.message || 'Failed to mark bill as paid. Please try again.');
              }
          },
        },
      ]
      );
    }
  }, [bills]);

  // Toggle auto pay
  const handleToggleAutoPay = useCallback((billId: number | string) => {
    setBills((prevBills: Bill[]) =>
      prevBills.map((bill: Bill) => {
        if (bill.id === billId) {
          return {
            ...bill,
            isAutoPay: !bill.isAutoPay,
            paymentMethod: !bill.isAutoPay ? 'Auto Pay' : 'Manual',
          };
        }
        return bill;
      })
    );
  }, []);

  // Map UI status to database status
  const mapStatusToDatabase = (uiStatus: string): string => {
    // Database uses: 'upcoming', 'pending', 'paid', 'overdue', 'cancelled', 'skipped', 'partial'
    // UI uses: 'due_today', 'due_tomorrow', 'due_week', 'paid', 'overdue', 'paused', 'ended'
    switch (uiStatus) {
      case 'due_today':
      case 'due_tomorrow':
      case 'due_week':
        return 'upcoming';
      case 'paid':
      case 'overdue':
        return uiStatus;
      case 'paused':
        return 'cancelled'; // Map paused to cancelled in DB (use is_active flag to distinguish)
      case 'ended':
        return 'cancelled'; // Map ended to cancelled in DB
      default:
        return 'upcoming';
    }
  };

  // Map database status to UI status
  const mapStatusFromDatabase = (dbStatus: string, dueDate: string): string => {
    // If status is 'upcoming', determine UI status based on due date
    if (dbStatus === 'upcoming') {
      const due = new Date(dueDate);
      const today = new Date();
      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'overdue';
      if (diffDays === 0) return 'due_today';
      if (diffDays === 1) return 'due_tomorrow';
      return 'due_week';
    }
    
    // Map other statuses
    if (dbStatus === 'cancelled') return 'ended';
    return dbStatus; // 'paid', 'overdue', 'paused' map directly
  };

  // Handle pause bill (with persistence to Supabase)
  const handlePauseBill = useCallback(async (billId: number | string) => {
    Alert.alert(
      'Pause Bill',
      'Are you sure you want to pause this bill? It will stop generating reminders and due dates.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pause',
          onPress: async () => {
            try {
              // Update in Supabase if bill has string ID
              if (typeof billId === 'string') {
                // Use 'cancelled' status (valid database value)
                // Store original UI status in metadata to distinguish paused from ended
                const bill = bills.find(b => b.id === billId);
                const currentMetadata = bill ? (typeof bill === 'object' && 'metadata' in bill ? (bill as any).metadata : {}) : {};
                await updateUpcomingBill(billId, { 
                  status: 'cancelled' as any, 
                  metadata: { ...currentMetadata, ui_status: 'paused' } as any
                }, false);
              }

              // Reload bills to get updated data from database
              const fetchedBills = await fetchUpcomingBills({}, false);
              const transformedBills = fetchedBills.map(transformDatabaseBillToBill);
              setBills(transformedBills);
            } catch (error: any) {
              console.error('Error pausing bill:', error);
              Alert.alert('Error', error.message || 'Failed to pause bill. Please try again.');
            }
          },
        },
      ]
    );
  }, []);

  // Handle end bill (with persistence to Supabase)
  const handleEndBill = useCallback(async (billId: number | string) => {
    Alert.alert(
      'End Bill',
      'Are you sure you want to end this bill? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Bill',
          style: 'destructive',
          onPress: async () => {
            try {
              // Update in Supabase if bill has string ID
              if (typeof billId === 'string') {
                // Map 'ended' to 'cancelled' in database
                // Store original UI status in metadata to distinguish ended from paused
                const bill = bills.find(b => b.id === billId);
                const currentMetadata = bill ? (typeof bill === 'object' && 'metadata' in bill ? (bill as any).metadata : {}) : {};
                await updateUpcomingBill(billId, { 
                  status: 'cancelled' as any, 
                  metadata: { ...currentMetadata, ui_status: 'ended' } as any
                }, false);
              }

              // Update local state (keep as 'ended' for UI)
              setBills(prevBills =>
                prevBills.map(bill =>
                  bill.id === billId ? { ...bill, status: 'ended' as const } : bill
                )
              );
            } catch (error: any) {
              console.error('Error ending bill:', error);
              Alert.alert('Error', error.message || 'Failed to end bill. Please try again.');
            }
          },
        },
      ]
    );
  }, []);

  // Handle resume/reactivate bill (works for both paused and ended bills)
  const handleResumeBill = useCallback(async (billId: number | string) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    const actionText = bill.status === 'ended' ? 'Reactivate' : 'Resume';
    Alert.alert(
      `${actionText} Bill`,
      `Are you sure you want to ${actionText.toLowerCase()} this bill?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText,
          onPress: async () => {
            try {
              // Determine appropriate status based on due date
              const dueDate = new Date(bill.dueDate);
              const today = new Date();
              const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              
              let newStatus: 'due_today' | 'due_tomorrow' | 'due_week' | 'paid' | 'overdue';
              if (diffDays < 0) {
                newStatus = 'overdue';
              } else if (diffDays === 0) {
                newStatus = 'due_today';
              } else if (diffDays === 1) {
                newStatus = 'due_tomorrow';
              } else {
                newStatus = 'due_week';
              }

              // Update in Supabase if bill has string ID
              if (typeof billId === 'string') {
                // Map UI status to database status
                const dbStatus = mapStatusToDatabase(newStatus);
                // Clear ui_status from metadata when resuming
                const bill = bills.find(b => b.id === billId);
                const currentMetadata = bill ? (typeof bill === 'object' && 'metadata' in bill ? (bill as any).metadata : {}) : {};
                const { ui_status, ...restMetadata } = currentMetadata;
                await updateUpcomingBill(billId, { 
                  status: dbStatus as any,
                  metadata: restMetadata as any
                }, false);
              }

              // Update local state
              setBills(prevBills =>
                prevBills.map(b =>
                  b.id === billId ? { ...b, status: newStatus } : b
                )
              );
            } catch (error: any) {
              console.error(`Error ${actionText.toLowerCase()}ing bill:`, error);
              Alert.alert('Error', error.message || `Failed to ${actionText.toLowerCase()} bill. Please try again.`);
            }
          },
        },
      ]
    );
  }, [bills]);

  // Get status indicator icon for bill icon overlay
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'paid':
        return { icon: 'checkmark-circle', color: '#10B981' };
      case 'paused':
        return { icon: 'pause-circle', color: '#F59E0B' };
      case 'ended':
        return { icon: 'stop-circle', color: '#6B7280' };
      default:
        return null;
    }
  };

  // Quick action menu handler
  const handleQuickAction = useCallback((billId: number | string, action: 'paid' | 'unpaid' | 'autopay') => {
    if (action === 'paid' || action === 'unpaid') {
      handleMarkAsPaid(billId);
    } else if (action === 'autopay') {
      handleToggleAutoPay(billId);
    }
  }, [handleMarkAsPaid, handleToggleAutoPay]);

  // Handle view payment history
  const handleViewHistory = useCallback((billId: number | string) => {
    const bill = bills.find(b => b.id === billId);
    if (bill) {
      setSelectedBillForHistory({
        id: typeof billId === 'string' ? billId : billId.toString(),
        name: bill.name,
      });
      setShowPaymentHistory(true);
    }
  }, [bills]);

  // Handle set reminder
  const handleSetReminder = useCallback((billId: number | string) => {
    const bill = bills.find(b => b.id === billId);
    if (bill) {
      setSelectedBillForReminder(bill);
      setShowReminderModal(true);
    }
  }, [bills]);

  // Handle save reminder
  const handleSaveReminder = useCallback(async (billId: number | string, reminder: BillReminder) => {
    try {
      if (typeof billId === 'string') {
        // Update bill with reminder settings
        const reminderDaysBefore = reminder.enabled ? [reminder.daysBefore] : null;
        await updateUpcomingBill(billId, {
          reminder_enabled: reminder.enabled,
          reminder_days_before: reminderDaysBefore,
        }, false);

        // Create reminders in bill_reminders table if enabled
        if (reminder.enabled && reminder.daysBefore) {
          const bill = bills.find(b => b.id === billId);
          if (bill) {
            const { createRemindersForBill } = await import('../../../../services/billRemindersService');
            await createRemindersForBill(billId, bill.dueDate, [reminder.daysBefore], false);
          }
        }
      }

      // Update local state with reminder including time
      setBills(prevBills =>
        prevBills.map(b =>
          b.id === billId
            ? {
                ...b,
                reminder: {
                  enabled: reminder.enabled,
                  daysBefore: reminder.daysBefore,
                  time: reminder.time || '09:00', // Ensure time is saved
                },
              }
            : b
        )
      );

      Alert.alert('Success', reminder.enabled ? 'Reminder set successfully' : 'Reminder removed');
      setShowReminderModal(false);
      setSelectedBillForReminder(null);
    } catch (error: any) {
      console.error('Error saving reminder:', error);
      Alert.alert('Error', error.message || 'Failed to save reminder. Please try again.');
    }
  }, [bills]);

  // Handle edit bill
  const handleEditBill = useCallback((billId: number | string) => {
    const bill = bills.find(b => b.id === billId);
    if (bill) {
      setEditingBill(bill);
    }
  }, [bills]);

  // Handle add bill
  const handleAddBill = useCallback(() => {
    setEditingBill(null);
    setFormData({
      name: '',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0],
      category: 'Utilities',
      billingFrequency: 'monthly',
      paymentStatus: 'upcoming',
      isAutoPay: false,
      reminders: [],
      paymentMethod: '',
      linkedAccount: '',
      startDate: '',
      endDate: '',
      hasEndDate: false,
      isVariableAmount: false,
      lastPaidAmount: '',
      description: '',
      serviceProvider: '',
      consumerId: '',
      lateFee: '',
      hasTax: false,
      priority: 'medium',
      // New Enhanced Fields
      tags: [],
      notes: '',
      reminderDaysBefore: [7, 3, 1],
      reminderEnabled: true,
      recurrencePattern: null,
      recurrenceCount: null,
      recurrenceEndDate: null,
      nextDueDate: null,
      isIncludedInBudget: true,
      budgetPeriod: 'monthly',
      showAdvanced: false,
    });
    setShowAddModal(true);
  }, []);

  // Get category icon helper
  const getCategoryIcon = (category: string): string => {
    const iconMap: { [key: string]: string } = {
      'Utilities': 'lightning',
      'Subscriptions': 'tv',
      'Insurance': 'shield',
      'Housing': 'home',
      'Loan': 'card',
      'Other': 'document',
    };
    return iconMap[category] || 'document';
  };

  // Handle save bill
  const handleSaveBill = useCallback(async () => {
    if (!formData.name || !formData.amount) {
      Alert.alert('Error', 'Please fill in bill name and amount');
      return;
    }

    try {
      // Map billing frequency - handle half-yearly
      const frequency = formData.billingFrequency === 'half-yearly' ? 'semi-annually' : formData.billingFrequency;

      const billData: any = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        due_date: formData.dueDate,
        frequency: frequency,
        description: formData.description || null,
        // New enhanced fields
        tags: (formData.tags && formData.tags.length > 0) ? formData.tags : null,
        notes: formData.notes || null,
        reminder_days_before: formData.reminderEnabled && formData.reminderDaysBefore.length > 0 
          ? formData.reminderDaysBefore 
          : null,
        reminder_enabled: formData.reminderEnabled,
        recurrence_pattern: formData.recurrencePattern,
        recurrence_count: formData.recurrenceCount,
        recurrence_end_date: formData.recurrenceEndDate,
        next_due_date: formData.nextDueDate,
        is_included_in_budget: formData.isIncludedInBudget,
        budget_period: formData.budgetPeriod,
        autopay: formData.isAutoPay,
        status: formData.paymentStatus === 'paid' ? 'paid' : 'upcoming',
      };

      if (editingBill && typeof editingBill.id === 'string') {
        await updateUpcomingBill(editingBill.id, billData, false);
        Alert.alert('Success', 'Bill updated successfully');
    } else {
        await addUpcomingBill(billData, false);
        Alert.alert('Success', 'Bill added successfully');
      }

      // Refresh bills list (you may want to use a hook or service to fetch bills)
      // For now, we'll keep the local state update for UI responsiveness
      const billStatus: 'due_today' | 'due_tomorrow' | 'due_week' | 'paid' | 'overdue' = 
        formData.paymentStatus === 'paid' ? 'paid' : 'due_week';

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
                status: billStatus,
                  tags: (formData.tags && formData.tags.length > 0) ? formData.tags : [formData.category],
              }
            : bill
        )
      );
    } else {
      const newBill: Bill = {
          id: Date.now().toString(),
        name: formData.name,
        type: formData.category,
        dueDate: formData.dueDate,
        amount: formData.amount,
        category: formData.category,
        subcategory: formData.category,
        description: formData.description || `${formData.name} payment`,
        icon: getCategoryIcon(formData.category),
        status: billStatus,
        isAutoPay: formData.isAutoPay,
        paymentMethod: formData.paymentMethod || (formData.isAutoPay ? 'Auto Pay' : 'Manual'),
          tags: formData.tags.length > 0 ? formData.tags : [formData.category],
      };
      setBills(prevBills => [...prevBills, newBill]);
    }

    setShowAddModal(false);
      setEditingBill(null);
    } catch (error: any) {
      console.error('Error saving bill:', error);
      Alert.alert('Error', error.message || 'Failed to save bill. Please try again.');
    }
    setEditingBill(null);
  }, [formData, editingBill]);

  // Add bill from smart detection (quick add on dashboard)
  const handleAddDetectedBill = useCallback((partialBill: Partial<Bill>) => {
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

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'due_today': return '#EF4444';
      case 'due_tomorrow': return '#F59E0B';
      case 'due_week': return '#3B82F6';
      case 'paid': return '#10B981';
      case 'overdue': return '#DC2626';
      case 'paused': return '#F59E0B';
      case 'ended': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'due_today': return 'Today';
      case 'due_tomorrow': return 'Tomorrow';
      case 'due_week': return 'This Week';
      case 'paid': return 'Paid';
      case 'overdue': return 'Overdue';
      case 'paused': return 'Paused';
      case 'ended': return 'Ended';
      default: return '';
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      activeOpacity={0.7}
      onPress={handleNavigateToBills}
    >
      <View style={[styles.card, { borderColor: colors.border }]}>
        <View style={[styles.cardBackground, { backgroundColor: colors.card }]}>
        {/* Header - Enhanced */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.titleIconContainer, { backgroundColor: '#10B98115' }]}>
              <Ionicons name="receipt" size={18} color="#10B981" />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Upcoming Bills</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleNavigateToBills();
              }}
              style={[styles.viewAllButton, { backgroundColor: colors.filterBackground }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.viewAllText, { color: '#10B981' }]}>View All</Text>
              <Ionicons name="chevron-forward" size={14} color="#10B981" />
            </TouchableOpacity>
            {/* Add Bill Button */}
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleAddBill();
              }}
              style={[styles.addBillHeaderButton, { backgroundColor: '#10B98120' }]}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle" size={20} color="#10B981" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Filter - Quick filter only */}
        <View style={styles.sectionWrapper}>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </View>

        {/* Smart Bill Detection - Collapsible suggestions */}
        {showSmartDetection && (
        <View style={styles.sectionWrapper}>
          <SmartBillDetection 
            existingBills={bills} 
            onAddBill={handleAddDetectedBill} 
          />
        </View>
        )}

        {/* Late Fee Alert - Only if critical */}
        {bills.some(b => {
          const dueDate = new Date(b.dueDate);
          const today = new Date();
          const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return b.status !== 'paid' && diffDays <= 3 && diffDays >= 0;
        }) && (
          <View style={styles.sectionWrapper}>
            <LateFeeAlert bills={bills} />
          </View>
        )}

        {/* Budget Impact Summary - Compact */}
        {showBudgetImpact && showBudgetIntegration && bills.length > 0 && (
          <View style={styles.sectionWrapper}>
            <BudgetIntegration 
              bills={bills} 
              onViewBudget={() => handleNavigateToBills()} 
            />
          </View>
        )}

        {/* Bills List - Max 5 most urgent */}
        <View style={styles.content}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: '#EF4444' }]}>{error}</Text>
            </View>
          ) : upcomingBills.length === 0 ? (
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
                You're all caught up with your bills!
              </Text>
            </View>
          ) : (
            <ScrollView 
              style={styles.billsList}
              contentContainerStyle={styles.billsListContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {upcomingBills.slice(0, 5).map((bill, index) => {
                const statusColor = getStatusColor(bill.status);
                const statusText = getStatusText(bill.status);
                const dueDate = new Date(bill.dueDate);
                const today = new Date();
                const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const unpaidCount = bills.filter(b => b.status !== 'paid' && b.status !== 'ended').length;
                const paidCount = bills.filter(b => b.status === 'paid').length;
                const isLast = index === upcomingBills.length - 1 && unpaidCount <= 5 && paidCount <= 3;
                
                return (
                  <View key={bill.id}>
                    {index > 0 && (
                      <View style={[styles.billDivider, { backgroundColor: colors.border }]} />
                    )}
                  <TouchableOpacity
                    key={bill.id}
                    style={[
                      styles.dashboardBillItem, 
                      { backgroundColor: 'transparent' },
                      isLast && styles.dashboardBillItemLast
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleNavigateToBills();
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dashboardBillLeft}>
                      <View style={[styles.dashboardBillIcon, { backgroundColor: `${getIconColor(bill.icon, bill.category)}15`, borderColor: `${getIconColor(bill.icon, bill.category)}30` }]}>
                        <Ionicons 
                          name={getIconName(bill.icon, bill.category) as any} 
                          size={16} 
                          color={getIconColor(bill.icon, bill.category)} 
                        />
                        {/* Status Indicator Overlay */}
                        {getStatusIndicator(bill.status) && (
                          <View style={styles.statusIndicatorOverlay}>
                            <Ionicons 
                              name={getStatusIndicator(bill.status)?.icon as any} 
                              size={10} 
                              color={getStatusIndicator(bill.status)?.color} 
                            />
                          </View>
                        )}
                      </View>
                      <View style={styles.dashboardBillInfo}>
                        <View style={styles.dashboardBillHeader}>
                          <View style={styles.dashboardBillNameContainer}>
                          <Text style={[styles.dashboardBillName, { color: colors.text }]} numberOfLines={1}>
                            {bill.name}
                          </Text>
                            {bill.isAutoPay && (
                              <View style={[styles.autoPayBadge, { backgroundColor: bill.autopay_source ? '#10B98115' : '#EF444415' }]}>
                                <Ionicons name={bill.autopay_source ? "sync" : "warning"} size={10} color={bill.autopay_source ? "#10B981" : "#EF4444"} />
                                <Text style={[styles.autoPayBadgeText, { color: bill.autopay_source ? "#10B981" : "#EF4444" }]}>
                                  {bill.autopay_source ? 'Auto' : 'Setup'}
                                </Text>
                              </View>
                            )}
                          </View>
                          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                            <Text style={[styles.statusText, { color: statusColor }]}>
                              {statusText}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.dashboardBillMeta}>
                          <Text style={[styles.dashboardBillAmount, { color: colors.text }]}>
                            {formatCurrency(bill.amount)}
                          </Text>
                          <Text style={[styles.dashboardBillDueDate, { color: colors.textSecondary }]}>
                            {diffDays === 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : diffDays < 0 ? `${Math.abs(diffDays)}d ago` : `${diffDays}d`}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {/* Three Dots Menu Button */}
                      <TouchableOpacity
                      style={styles.dashboardMoreButton}
                        onPress={(e) => {
                          e.stopPropagation();
                        setDashboardMenuBill(bill);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="ellipsis-vertical" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                  
                  {/* Action Menu Modal for Dashboard Bills */}
                  {dashboardMenuBill?.id === bill.id && (
                    <BillActionMenu
                      visible={true}
                      bill={bill}
                      onClose={() => setDashboardMenuBill(null)}
                      onEditBill={() => {
                        setDashboardMenuBill(null);
                        handleEditBill(bill.id);
                      }}
                      onDeleteBill={() => {
                        setDashboardMenuBill(null);
                          Alert.alert(
                          'Delete Bill',
                          'Are you sure you want to delete this bill?',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                              text: 'Delete',
                              style: 'destructive',
                              onPress: () => {
                                setBills(prevBills => prevBills.filter(b => b.id !== bill.id));
                              },
                              },
                            ]
                          );
                      }}
                      onMarkAsPaid={() => {
                        setDashboardMenuBill(null);
                          handleMarkAsPaid(bill.id);
                      }}
                      onViewHistory={() => {
                        setDashboardMenuBill(null);
                        handleViewHistory(bill.id);
                      }}
                      onSplitBill={() => {
                        setDashboardMenuBill(null);
                        // Navigate to full bills page for split functionality
                        handleNavigateToBills();
                      }}
                      onLinkTransaction={() => {
                        setDashboardMenuBill(null);
                        // Navigate to full bills page for link functionality
                        handleNavigateToBills();
                      }}
                      onSetReminder={() => {
                        setDashboardMenuBill(null);
                        handleSetReminder(bill.id);
                      }}
                      onPauseBill={handlePauseBill ? () => {
                        setDashboardMenuBill(null);
                        handlePauseBill(bill.id);
                      } : undefined}
                      onEndBill={handleEndBill ? () => {
                        setDashboardMenuBill(null);
                        handleEndBill(bill.id);
                      } : undefined}
                      onResumeBill={handleResumeBill ? () => {
                        setDashboardMenuBill(null);
                        handleResumeBill(bill.id);
                      } : undefined}
                    />
                  )}
                  </View>
                );
              })}
              
              {(() => {
                const unpaidCount = bills.filter(b => b.status !== 'paid' && b.status !== 'ended').length;
                const paidCount = bills.filter(b => b.status === 'paid').length;
                const unpaidHidden = Math.max(0, unpaidCount - 5);
                const paidHidden = Math.max(0, paidCount - 3);
                const totalHidden = unpaidHidden + paidHidden;
                
                return totalHidden > 0 && (
                <TouchableOpacity
                  style={[styles.viewMoreButton, { borderColor: colors.border, backgroundColor: 'transparent' }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleNavigateToBills();
                  }}
                >
                  <Text style={[styles.viewMoreText, { color: colors.textSecondary }]}>
                      View {totalHidden} more bill{totalHidden !== 1 ? 's' : ''}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
                );
              })()}
            </ScrollView>
          )}
        </View>
        </View>
      </View>

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
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.modalHeaderLeft}>
                <View style={[styles.modalIconContainer, { backgroundColor: '#10B98115' }]}>
                  <Ionicons name="receipt" size={24} color="#10B981" />
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    {editingBill ? 'Edit Bill' : 'Add New Bill'}
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                    {editingBill ? 'Update bill details' : 'Fill in the bill information'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.closeButton, { backgroundColor: colors.filterBackground }]}
                onPress={() => setShowAddModal(false)}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Section 1: Basic Info */}
              <View style={styles.modalSection}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIconContainer, { backgroundColor: '#3B82F615' }]}>
                    <Ionicons name="document-text" size={18} color="#3B82F6" />
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Information</Text>
                </View>
                
                <View style={styles.formGroup}>
                  <View style={styles.labelRow}>
                    <Ionicons name="pricetag" size={16} color={colors.textSecondary} />
                    <Text style={[styles.formLabel, { color: colors.text }]}>Bill Name *</Text>
                  </View>
                  <View style={[styles.inputContainer, { backgroundColor: colors.filterBackground, borderColor: colors.border }]}>
                    <Ionicons name="receipt-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.formInput, { color: colors.text }]}
                      placeholder="e.g., Electricity – BESCOM"
                      placeholderTextColor={colors.textSecondary}
                      value={formData.name}
                      onChangeText={(text) => setFormData({ ...formData, name: text })}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <View style={styles.labelRow}>
                    <Ionicons name="grid" size={16} color={colors.textSecondary} />
                    <Text style={[styles.formLabel, { color: colors.text }]}>Category *</Text>
                  </View>
                  <View style={styles.categoryButtons}>
                    {['Utilities', 'Subscriptions', 'Insurance', 'Housing', 'Loan', 'Credit Card', 'Internet', 'Mobile', 'Other'].map((cat) => {
                      const categoryIcons: { [key: string]: string } = {
                        'Utilities': 'flash',
                        'Subscriptions': 'tv',
                        'Insurance': 'shield-checkmark',
                        'Housing': 'home',
                        'Loan': 'card',
                        'Credit Card': 'card-outline',
                        'Internet': 'wifi',
                        'Mobile': 'phone-portrait',
                        'Other': 'ellipse',
                      };
                      const isActive = formData.category === cat;
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.categoryButton,
                            { borderColor: colors.border },
                            isActive && styles.categoryButtonActive,
                          ]}
                          onPress={() => setFormData({ ...formData, category: cat })}
                        >
                          <Ionicons 
                            name={categoryIcons[cat] as any} 
                            size={14} 
                            color={isActive ? '#FFFFFF' : colors.textSecondary} 
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            style={[
                              styles.categoryButtonText,
                              { color: isActive ? '#FFFFFF' : colors.textSecondary },
                            ]}
                          >
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <View style={styles.labelRow}>
                    <Ionicons name="cash" size={16} color={colors.textSecondary} />
                    <Text style={[styles.formLabel, { color: colors.text }]}>Amount Due ($) *</Text>
                  </View>
                  <View style={[styles.inputContainer, { backgroundColor: colors.filterBackground, borderColor: colors.border }]}>
                    <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>$</Text>
                    <TextInput
                      style={[styles.formInput, { color: colors.text }]}
                      placeholder="0.00"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="decimal-pad"
                      value={formData.amount}
                      onChangeText={(text) => setFormData({ ...formData, amount: text })}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <View style={styles.labelRow}>
                    <Ionicons name="calendar" size={16} color={colors.textSecondary} />
                    <Text style={[styles.formLabel, { color: colors.text }]}>Due Date *</Text>
                  </View>
                  <View style={[styles.inputContainer, { backgroundColor: colors.filterBackground, borderColor: colors.border }]}>
                    <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.formInput, { color: colors.text }]}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.textSecondary}
                      value={formData.dueDate}
                      onChangeText={(text) => setFormData({ ...formData, dueDate: text })}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <View style={styles.labelRow}>
                    <Ionicons name="repeat" size={16} color={colors.textSecondary} />
                    <Text style={[styles.formLabel, { color: colors.text }]}>Billing Frequency *</Text>
                  </View>
                  <View style={styles.categoryButtons}>
                    {(['one-time', 'monthly', 'quarterly', 'half-yearly', 'yearly'] as const).map((freq) => {
                      const isActive = formData.billingFrequency === freq;
                      return (
                        <TouchableOpacity
                          key={freq}
                          style={[
                            styles.categoryButton,
                            { borderColor: colors.border },
                            isActive && { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
                          ]}
                          onPress={() => setFormData({ ...formData, billingFrequency: freq })}
                        >
                          <Ionicons 
                            name="time-outline" 
                            size={14} 
                            color={isActive ? '#FFFFFF' : colors.textSecondary} 
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            style={[
                              styles.categoryButtonText,
                              { color: isActive ? '#FFFFFF' : colors.textSecondary },
                            ]}
                          >
                            {freq === 'one-time' ? 'One-time' : freq.charAt(0).toUpperCase() + freq.slice(1).replace('-', ' ')}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Payment Status</Text>
                  <View style={styles.categoryButtons}>
                    {(['upcoming', 'paid', 'skipped'] as const).map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.categoryButton,
                          { borderColor: colors.border },
                          formData.paymentStatus === status && { backgroundColor: status === 'paid' ? '#10B981' : status === 'skipped' ? '#EF4444' : '#3B82F6', borderColor: status === 'paid' ? '#10B981' : status === 'skipped' ? '#EF4444' : '#3B82F6' },
                        ]}
                        onPress={() => setFormData({ ...formData, paymentStatus: status })}
                      >
                        <Text
                          style={[
                            styles.categoryButtonText,
                            { color: colors.textSecondary },
                            formData.paymentStatus === status && { color: '#FFFFFF' },
                          ]}
                        >
                          {status === 'upcoming' ? 'Upcoming' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={[styles.toggleCard, { backgroundColor: colors.filterBackground, borderColor: colors.border }]}>
                  <TouchableOpacity
                    style={styles.toggleRow}
                    onPress={() => setFormData({ ...formData, isAutoPay: !formData.isAutoPay })}
                  >
                    <View style={styles.toggleRowLeft}>
                      <View style={[styles.toggleIconContainer, { backgroundColor: formData.isAutoPay ? '#10B98120' : '#6B728020' }]}>
                        <Ionicons name="repeat" size={20} color={formData.isAutoPay ? "#10B981" : colors.textSecondary} />
                      </View>
                      <View>
                        <Text style={[styles.toggleLabel, { color: colors.text }]}>Auto-Pay Enabled</Text>
                        <Text style={[styles.toggleSubtext, { color: colors.textSecondary }]}>Automatically pay this bill</Text>
                      </View>
                    </View>
                    <View style={[styles.toggleSwitch, formData.isAutoPay && styles.toggleSwitchActive]}>
                      <View style={[styles.toggleKnob, formData.isAutoPay && styles.toggleKnobActive]} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Section 2: Schedule & Reminders */}
              <View style={styles.modalSection}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIconContainer, { backgroundColor: '#F59E0B15' }]}>
                    <Ionicons name="notifications" size={18} color="#F59E0B" />
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Reminders & Notifications</Text>
                </View>
                
                <BillReminderConfig
                  reminderDaysBefore={formData.reminderDaysBefore}
                  reminderEnabled={formData.reminderEnabled}
                  onUpdate={(daysBefore, enabled) => {
                          setFormData({
                            ...formData,
                      reminderDaysBefore: daysBefore,
                      reminderEnabled: enabled,
                          });
                        }}
                />
                        </View>

              {/* Section 2.5: Recurrence Pattern */}
              {formData.billingFrequency !== 'one-time' && (
                <View style={styles.modalSection}>
                  <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIconContainer, { backgroundColor: '#10B98115' }]}>
                      <Ionicons name="repeat" size={18} color="#10B981" />
                    </View>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Recurrence Pattern</Text>
                  </View>
                  <RecurrencePatternEditor
                    frequency={formData.billingFrequency}
                    recurrencePattern={formData.recurrencePattern}
                    recurrenceCount={formData.recurrenceCount}
                    recurrenceEndDate={formData.recurrenceEndDate}
                    dueDate={formData.dueDate}
                    onUpdate={(pattern) => {
                      setFormData({
                        ...formData,
                        billingFrequency: pattern.frequency as any,
                        recurrencePattern: pattern.recurrencePattern,
                        recurrenceCount: pattern.recurrenceCount,
                        recurrenceEndDate: pattern.recurrenceEndDate,
                        nextDueDate: pattern.nextDueDate,
                      });
                    }}
                  />
              </View>
              )}

              {/* Section 3: Payment Method */}
              <View style={styles.modalSection}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIconContainer, { backgroundColor: '#8B5CF615' }]}>
                    <Ionicons name="wallet" size={18} color="#8B5CF6" />
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method (Optional)</Text>
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Payment Method</Text>
                  <View style={styles.categoryButtons}>
                    {(['', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash', 'Wallet'] as const).map((method) => (
                      <TouchableOpacity
                        key={method || 'none'}
                        style={[
                          styles.categoryButton,
                          { borderColor: colors.border },
                          formData.paymentMethod === method && styles.categoryButtonActive,
                        ]}
                        onPress={() => setFormData({ ...formData, paymentMethod: method })}
                      >
                        <Text
                          style={[
                            styles.categoryButtonText,
                            { color: colors.textSecondary },
                            formData.paymentMethod === method && styles.categoryButtonTextActive,
                          ]}
                        >
                          {method || 'None'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {formData.paymentMethod && (
                  <View style={styles.formGroup}>
                    <View style={styles.labelRow}>
                      <Ionicons name="card" size={16} color={colors.textSecondary} />
                      <Text style={[styles.formLabel, { color: colors.text }]}>Linked Account / Card</Text>
                    </View>
                    <View style={[styles.inputContainer, { backgroundColor: colors.filterBackground, borderColor: colors.border }]}>
                      <Ionicons name="card-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.formInput, { color: colors.text }]}
                        placeholder="e.g., **** 1234"
                        placeholderTextColor={colors.textSecondary}
                        value={formData.linkedAccount}
                        onChangeText={(text) => setFormData({ ...formData, linkedAccount: text })}
                      />
                    </View>
                  </View>
                )}

                <View style={styles.formGroup}>
                  <View style={styles.labelRow}>
                    <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.formLabel, { color: colors.text }]}>Description</Text>
                  </View>
                  <View style={[styles.inputContainer, styles.inputContainerMultiline, { backgroundColor: colors.filterBackground, borderColor: colors.border }]}>
                    <TextInput
                      style={[styles.formInput, styles.formInputMultiline, { color: colors.text }]}
                      placeholder="Optional description"
                      placeholderTextColor={colors.textSecondary}
                      multiline
                      numberOfLines={3}
                      value={formData.description}
                      onChangeText={(text) => setFormData({ ...formData, description: text })}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <View style={styles.labelRow}>
                    <Ionicons name="pricetag-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.formLabel, { color: colors.text }]}>Tags</Text>
                  </View>
                  <View style={[styles.inputContainer, { backgroundColor: colors.filterBackground, borderColor: colors.border }]}>
                    <Ionicons name="pricetag" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.formInput, { color: colors.text }]}
                      placeholder="Enter tags separated by commas (e.g., utilities, monthly)"
                      placeholderTextColor={colors.textSecondary}
                      value={(formData.tags || []).join(', ')}
                      onChangeText={(text) => {
                        setFormData({
                          ...formData,
                          tags: text.split(',').map(t => t.trim()).filter(t => t.length > 0),
                        });
                      }}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <View style={styles.labelRow}>
                    <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.formLabel, { color: colors.text }]}>Notes</Text>
                  </View>
                  <View style={[styles.inputContainer, styles.inputContainerMultiline, { backgroundColor: colors.filterBackground, borderColor: colors.border }]}>
                    <TextInput
                      style={[styles.formInput, styles.formInputMultiline, { color: colors.text }]}
                      placeholder="Additional notes (optional)"
                      placeholderTextColor={colors.textSecondary}
                      multiline
                      numberOfLines={2}
                      value={formData.notes}
                      onChangeText={(text) => setFormData({ ...formData, notes: text })}
                    />
                  </View>
                </View>
              </View>

              {/* Advanced Options - Collapsible */}
              <TouchableOpacity
                style={[styles.advancedHeader, { borderTopColor: colors.border }]}
                onPress={() => setFormData({ ...formData, showAdvanced: !formData.showAdvanced })}
              >
                <View style={styles.advancedHeaderLeft}>
                  <View style={[styles.sectionIconContainer, { backgroundColor: '#6B728015' }]}>
                    <Ionicons name="settings" size={18} color={colors.textSecondary} />
                  </View>
                  <Text style={[styles.advancedTitle, { color: colors.text }]}>Advanced Options</Text>
                </View>
                <Ionicons 
                  name={formData.showAdvanced ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>

              {formData.showAdvanced && (
                <View style={styles.modalSection}>
                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: colors.text }]}>Service Provider</Text>
                    <TextInput
                      style={[styles.formInput, { backgroundColor: colors.filterBackground, color: colors.text, borderColor: colors.border }]}
                      placeholder="e.g., BESCOM, Airtel"
                      placeholderTextColor={colors.textSecondary}
                      value={formData.serviceProvider}
                      onChangeText={(text) => setFormData({ ...formData, serviceProvider: text })}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: colors.text }]}>Consumer / Customer ID</Text>
                    <TextInput
                      style={[styles.formInput, { backgroundColor: colors.filterBackground, color: colors.text, borderColor: colors.border }]}
                      placeholder="Optional"
                      placeholderTextColor={colors.textSecondary}
                      value={formData.consumerId}
                      onChangeText={(text) => setFormData({ ...formData, consumerId: text })}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: colors.text }]}>Late Fee / Penalty</Text>
                    <TextInput
                      style={[styles.formInput, { backgroundColor: colors.filterBackground, color: colors.text, borderColor: colors.border }]}
                      placeholder="0.00"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="decimal-pad"
                      value={formData.lateFee}
                      onChangeText={(text) => setFormData({ ...formData, lateFee: text })}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.toggleRow}
                    onPress={() => setFormData({ ...formData, isVariableAmount: !formData.isVariableAmount })}
                  >
                    <View style={styles.toggleRowLeft}>
                      <Ionicons name="swap-horizontal" size={20} color="#F59E0B" />
                      <View>
                        <Text style={[styles.toggleLabel, { color: colors.text }]}>Variable Amount</Text>
                        <Text style={[styles.toggleSubtext, { color: colors.textSecondary }]}>For utility bills with varying amounts</Text>
                      </View>
                    </View>
                    <View style={[styles.toggleSwitch, formData.isVariableAmount && { backgroundColor: '#F59E0B' }]}>
                      <View style={[styles.toggleKnob, formData.isVariableAmount && styles.toggleKnobActive]} />
                    </View>
                  </TouchableOpacity>

                  {formData.isVariableAmount && (
                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, { color: colors.text }]}>Last Paid Amount (Estimate)</Text>
                      <TextInput
                        style={[styles.formInput, { backgroundColor: colors.filterBackground, color: colors.text, borderColor: colors.border }]}
                        placeholder="0.00"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="decimal-pad"
                        value={formData.lastPaidAmount}
                        onChangeText={(text) => setFormData({ ...formData, lastPaidAmount: text })}
                      />
                    </View>
                  )}

                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: colors.text }]}>Priority</Text>
                    <View style={styles.categoryButtons}>
                      {(['high', 'medium', 'low'] as const).map((priority) => (
                        <TouchableOpacity
                          key={priority}
                          style={[
                            styles.categoryButton,
                            { borderColor: colors.border },
                            formData.priority === priority && { 
                              backgroundColor: priority === 'high' ? '#EF4444' : priority === 'medium' ? '#F59E0B' : '#10B981', 
                              borderColor: priority === 'high' ? '#EF4444' : priority === 'medium' ? '#F59E0B' : '#10B981' 
                            },
                          ]}
                          onPress={() => setFormData({ ...formData, priority })}
                        >
                          <Text
                            style={[
                              styles.categoryButtonText,
                              { color: colors.textSecondary },
                              formData.priority === priority && { color: '#FFFFFF' },
                            ]}
                          >
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {formData.billingFrequency !== 'one-time' && (
                    <>
                      <View style={styles.formGroup}>
                        <Text style={[styles.formLabel, { color: colors.text }]}>Start Date</Text>
                        <TextInput
                          style={[styles.formInput, { backgroundColor: colors.filterBackground, color: colors.text, borderColor: colors.border }]}
                          placeholder="YYYY-MM-DD"
                          placeholderTextColor={colors.textSecondary}
                          value={formData.startDate}
                          onChangeText={(text) => setFormData({ ...formData, startDate: text })}
                        />
                      </View>

                      <TouchableOpacity
                        style={styles.toggleRow}
                        onPress={() => setFormData({ ...formData, hasEndDate: !formData.hasEndDate })}
                      >
                        <View style={styles.toggleRowLeft}>
                          <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
                          <Text style={[styles.toggleLabel, { color: colors.text }]}>Set End Date</Text>
                        </View>
                        <View style={[styles.toggleSwitch, formData.hasEndDate && { backgroundColor: '#3B82F6' }]}>
                          <View style={[styles.toggleKnob, formData.hasEndDate && styles.toggleKnobActive]} />
                        </View>
                      </TouchableOpacity>

                      {formData.hasEndDate && (
                        <View style={styles.formGroup}>
                          <Text style={[styles.formLabel, { color: colors.text }]}>End Date</Text>
                          <TextInput
                            style={[styles.formInput, { backgroundColor: colors.filterBackground, color: colors.text, borderColor: colors.border }]}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={colors.textSecondary}
                            value={formData.endDate}
                            onChangeText={(text) => setFormData({ ...formData, endDate: text })}
                          />
                        </View>
                      )}
                    </>
                  )}

                  <TouchableOpacity
                    style={styles.toggleRow}
                    onPress={() => setFormData({ ...formData, hasTax: !formData.hasTax })}
                  >
                    <View style={styles.toggleRowLeft}>
                      <Ionicons name="receipt" size={20} color="#8B5CF6" />
                      <Text style={[styles.toggleLabel, { color: colors.text }]}>Tax / GST Included</Text>
                    </View>
                    <View style={[styles.toggleSwitch, formData.hasTax && { backgroundColor: '#8B5CF6' }]}>
                      <View style={[styles.toggleKnob, formData.hasTax && styles.toggleKnobActive]} />
                    </View>
                  </TouchableOpacity>

                  {/* Budget Integration */}
                  <View style={[styles.toggleCard, { backgroundColor: colors.filterBackground, borderColor: colors.border }]}>
                    <TouchableOpacity
                      style={styles.toggleRow}
                      onPress={() => setFormData({ ...formData, isIncludedInBudget: !formData.isIncludedInBudget })}
                    >
                      <View style={styles.toggleRowLeft}>
                        <View style={[styles.toggleIconContainer, { backgroundColor: formData.isIncludedInBudget ? '#10B98120' : '#6B728020' }]}>
                          <Ionicons name="pie-chart" size={20} color={formData.isIncludedInBudget ? "#10B981" : colors.textSecondary} />
                        </View>
                        <View>
                          <Text style={[styles.toggleLabel, { color: colors.text }]}>Include in Budget</Text>
                          <Text style={[styles.toggleSubtext, { color: colors.textSecondary }]}>
                            Include this bill in budget calculations
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.toggleSwitch, formData.isIncludedInBudget && styles.toggleSwitchActive]}>
                        <View style={[styles.toggleKnob, formData.isIncludedInBudget && styles.toggleKnobActive]} />
                      </View>
                    </TouchableOpacity>
                  </View>

                  {formData.isIncludedInBudget && (
                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, { color: colors.text }]}>Budget Period</Text>
                      <View style={styles.categoryButtons}>
                        {(['monthly', 'quarterly', 'yearly'] as const).map((period) => (
                          <TouchableOpacity
                            key={period}
                            style={[
                              styles.categoryButton,
                              { borderColor: colors.border },
                              formData.budgetPeriod === period && { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
                            ]}
                            onPress={() => setFormData({ ...formData, budgetPeriod: period })}
                          >
                            <Text
                              style={[
                                styles.categoryButtonText,
                                { color: formData.budgetPeriod === period ? '#FFFFFF' : colors.textSecondary },
                              ]}
                            >
                              {period.charAt(0).toUpperCase() + period.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            <View style={[styles.modalActions, { borderTopColor: colors.border }]}>
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
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.modalButtonTextSave}>
                  {editingBill ? 'Save Changes' : 'Add Bill'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Payment History Modal */}
      {selectedBillForHistory && (
        <BillPaymentHistory
          visible={showPaymentHistory}
          billId={selectedBillForHistory.id}
          billName={selectedBillForHistory.name}
          onClose={() => {
            setShowPaymentHistory(false);
            setSelectedBillForHistory(null);
          }}
          isDemo={false}
        />
      )}

      {/* Reminder Modal */}
      {selectedBillForReminder && (
        <BillReminderModal
          visible={showReminderModal}
          bill={selectedBillForReminder}
          onClose={() => {
            setShowReminderModal(false);
            setSelectedBillForReminder(null);
          }}
          onSave={handleSaveReminder}
        />
      )}
    </TouchableOpacity>
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
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'transparent',
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    marginBottom: 6,
  },
  cardBackground: {
    borderRadius: 16,
    overflow: 'hidden',
    flex: 1,
  },
  sectionWrapper: {
    paddingHorizontal: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 10,
    marginRight: 8,
  },
  titleIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBillHeaderButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#10B98130',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    flexShrink: 1,
    letterSpacing: -0.3,
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
    paddingBottom: 0,
    paddingTop: 2,
    overflow: 'hidden',
  },
  billsList: {
    maxHeight: 350, // Max height for ~5 items (each item ~60-70px)
    paddingBottom: 4,
  },
  billsListContent: {
    gap: 0,
    paddingBottom: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingBottom: 16,
    marginTop: 8,
    marginBottom: 0,
    borderRadius: 0,
    borderWidth: 0,
    borderStyle: 'dashed',
    gap: 6,
  },
  viewMoreText: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  markPaidButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardMoreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  autoPayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Simplified dashboard styles
  dashboardBillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 0,
    borderRadius: 0,
    borderWidth: 0,
  },
  dashboardBillItemLast: {
    marginBottom: 0,
  },
  dashboardBillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  dashboardBillIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dashboardBillInfo: {
    flex: 1,
    gap: 3,
  },
  dashboardBillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  dashboardBillNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  dashboardBillName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  autoPayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  autoPayBadgeText: {
    fontSize: 9,
    color: '#10B981',
    fontWeight: '600',
  },
  dashboardBillMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dashboardBillAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  dashboardBillDueDate: {
    fontSize: 11,
    fontWeight: '500',
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
    paddingBottom: 32,
    alignItems: 'center',
    borderRadius: 0,
    borderWidth: 0,
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
  billGroup: {
    marginBottom: 12,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 4,
  },
  dateCalendarIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  billLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  billIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    position: 'relative',
  },
  statusIndicatorOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#1F2937',
  },
  billDivider: {
    height: 1,
    marginLeft: 56,
    marginRight: 10,
    marginVertical: 4,
  },
  billIconText: {
    fontSize: 18,
  },
  billInfo: {
    flex: 1,
  },
  billHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  billName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  compactBadges: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 6,
  },
  miniBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  billCategory: {
    fontSize: 11,
    fontWeight: '500',
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  autoTag: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  autoTagText: {
    fontSize: 9,
    color: '#10B981',
    fontWeight: '600',
  },
  billDetails: {
    flexDirection: 'column',
    gap: 2,
  },
  billDueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  billDueDate: {
    fontSize: 11,
    marginRight: 6,
  },
  billTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 6,
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusTagText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  paymentMethodTag: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 10,
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
    fontSize: 10,
    lineHeight: 14,
    flex: 1,
  },
  billRight: {
    alignItems: 'flex-end',
    marginRight: 6,
    gap: 6,
  },
  billAmount: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  billActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6B728020',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  paidBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paidBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  moreButton: {
    padding: 6,
    marginLeft: 4,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSection: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  inputContainerMultiline: {
    alignItems: 'flex-start',
    paddingTop: 12,
    minHeight: 100,
  },
  inputIcon: {
    marginRight: 10,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  toggleCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 8,
  },
  toggleIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  toggleRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  toggleSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#374151',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#10B981',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  toggleKnobActive: {
    transform: [{ translateX: 22 }],
  },
  checkboxContainer: {
    gap: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  advancedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
    borderTopWidth: 1,
  },
  advancedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  advancedTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  autoPayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  autoPayLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
    borderTopWidth: 1,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    borderWidth: 1,
  },
  modalButtonSave: {
    backgroundColor: '#10B981',
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalButtonTextSave: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

// Export types for reuse in full Bills page
export type {
  Bill,
  BillReminder,
  PaymentRecord,
  BillSplitParticipant,
  BillCategory,
  BudgetCategory,
  GroupedBills,
};

// Export PaymentReceipt type (defined later in file)
export type { PaymentReceipt };

// Named exports for reuse in full Bills page
export {
  BudgetIntegration,
  SmartBillDetection,
  LateFeeAlert,
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
  BILL_CATEGORIES,
  MOCK_BUDGETS,
};

// Default export - must come last
export default UpcomingBillsSection;
