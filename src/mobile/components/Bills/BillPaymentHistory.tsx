import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useBillPayments } from '../../../../hooks/useBillPayments';
import { format } from 'date-fns';

interface BillPaymentHistoryProps {
  visible: boolean;
  billId: string;
  billName: string;
  onClose: () => void;
  isDemo?: boolean;
}

export const BillPaymentHistory: React.FC<BillPaymentHistoryProps> = ({
  visible,
  billId,
  billName,
  onClose,
  isDemo = false,
}) => {
  const { isDark } = useTheme();
  const { payments, loading, error, stats } = useBillPayments({ billId, isDemo });

  const colors = isDark
    ? {
        background: '#1F2937',
        card: '#1F2937',
        text: '#FFFFFF',
        textSecondary: '#9CA3AF',
        border: '#374151',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      }
    : {
        background: '#FFFFFF',
        card: '#FFFFFF',
        text: '#111827',
        textSecondary: '#6B7280',
        border: '#E5E7EB',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'failed':
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'pending':
        return 'time-outline';
      case 'failed':
        return 'close-circle';
      case 'cancelled':
        return 'ban-outline';
      default:
        return 'help-circle-outline';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Payment History</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{billName}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Stats Summary */}
          {stats && (
            <View style={[styles.statsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Paid</Text>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {formatCurrency(stats.totalAmount || 0)}
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Payments</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stats.totalCount || 0}
                </Text>
              </View>
            </View>
          )}

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Loading payments...
                </Text>
              </View>
            ) : error ? (
              <View style={styles.centerContainer}>
                <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
                <Text style={[styles.emptyText, { color: colors.error }]}>{error}</Text>
              </View>
            ) : payments.length === 0 ? (
              <View style={styles.centerContainer}>
                <Ionicons name="receipt-outline" size={40} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No payment history yet
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                  Payments will appear here once you make a payment
                </Text>
              </View>
            ) : (
              payments.map((payment) => (
                <View
                  key={payment.id}
                  style={[styles.paymentItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.paymentLeft}>
                    <View
                      style={[
                        styles.statusIcon,
                        { backgroundColor: getStatusColor(payment.status) + '20' },
                      ]}
                    >
                      <Ionicons
                        name={getStatusIcon(payment.status) as any}
                        size={20}
                        color={getStatusColor(payment.status)}
                      />
                    </View>
                    <View style={styles.paymentInfo}>
                      <Text style={[styles.paymentDate, { color: colors.text }]}>
                        {formatDate(payment.payment_date)}
                      </Text>
                      <View style={styles.paymentMeta}>
                        {payment.payment_method && (
                          <Text style={[styles.paymentMethod, { color: colors.textSecondary }]}>
                            {payment.payment_method}
                          </Text>
                        )}
                        {payment.account_name && (
                          <Text style={[styles.paymentMethod, { color: colors.textSecondary }]}>
                            • {payment.account_name}
                          </Text>
                        )}
                        {payment.credit_card_name && (
                          <Text style={[styles.paymentMethod, { color: colors.textSecondary }]}>
                            • {payment.credit_card_name}
                          </Text>
                        )}
                      </View>
                      {payment.reference_number && (
                        <Text style={[styles.referenceNumber, { color: colors.textSecondary }]}>
                          Ref: {payment.reference_number}
                        </Text>
                      )}
                      {payment.notes && (
                        <Text style={[styles.notes, { color: colors.textSecondary }]} numberOfLines={2}>
                          {payment.notes}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.paymentRight}>
                    <Text style={[styles.paymentAmount, { color: colors.success }]}>
                      {formatCurrency(payment.amount)}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(payment.status) + '20' },
                      ]}
                    >
                      <Text
                        style={[styles.statusText, { color: getStatusColor(payment.status) }]}
                      >
                        {payment.status}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    marginHorizontal: 15,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  paymentLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  paymentMethod: {
    fontSize: 13,
    marginRight: 4,
  },
  referenceNumber: {
    fontSize: 12,
    marginTop: 4,
  },
  notes: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

