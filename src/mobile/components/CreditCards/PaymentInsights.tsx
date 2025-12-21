/**
 * =============================================================================
 * PAYMENT INSIGHTS COMPONENT
 * =============================================================================
 * 
 * Shows upcoming due dates, payment calculator, and scheduling options.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useCreditCards } from '../../../../contexts/CreditCardContext';

export const PaymentInsights: React.FC = () => {
  const { isDark } = useTheme();
  const colors = isDark ? require('../../../../contexts/ThemeContext').darkTheme : require('../../../../contexts/ThemeContext').lightTheme;
  const { creditCards } = useCreditCards();
  const [paymentAmount, setPaymentAmount] = useState('');

  // Get cards with upcoming due dates (next 7 days)
  const upcomingCards = creditCards
    .filter(card => {
      if (!card.dueDate) return false;
      const dueDate = new Date(card.dueDate);
      const today = new Date();
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff <= 7;
    })
    .sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  // Calculate minimum payment (typically 5% of balance or ₹500, whichever is higher)
  const calculateMinimumPayment = (balance: number) => {
    return Math.max(balance * 0.05, 500);
  };

  // Calculate interest savings
  const calculateInterestSavings = (balance: number, paymentAmount: number, interestRate: number = 0.03) => {
    const remainingBalance = balance - paymentAmount;
    const monthlyInterest = remainingBalance * interestRate;
    return monthlyInterest;
  };

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>Payment Insights</Text>

        {/* Upcoming Due Dates */}
        {upcomingCards.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Due Dates</Text>
            {upcomingCards.map((card) => {
              const dueDate = new Date(card.dueDate!);
              const today = new Date();
              const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const minPayment = calculateMinimumPayment(card.currentBalance);

              return (
                <View key={card.id} style={[styles.dueDateCard, { backgroundColor: colors.background }]}>
                  <View style={styles.dueDateHeader}>
                    <View>
                      <Text style={[styles.cardName, { color: colors.text }]}>{card.name}</Text>
                      <Text style={[styles.dueDateText, { color: colors.textSecondary }]}>
                        Due: {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                    <View style={[styles.daysBadge, { backgroundColor: daysDiff <= 3 ? '#EF4444' : '#F59E0B' }]}>
                      <Text style={styles.daysBadgeText}>
                        {daysDiff === 0 ? 'Today' : `${daysDiff} days`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.paymentInfo}>
                    <View style={styles.paymentItem}>
                      <Text style={[styles.paymentLabel, { color: colors.textSecondary }]}>Balance</Text>
                      <Text style={[styles.paymentValue, { color: colors.text }]}>
                        ₹{card.currentBalance.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <View style={styles.paymentItem}>
                      <Text style={[styles.paymentLabel, { color: colors.textSecondary }]}>Min Payment</Text>
                      <Text style={[styles.paymentValue, { color: colors.primary }]}>
                        ₹{minPayment.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Payment Calculator */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Calculator</Text>
          <View style={[styles.calculatorCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.calculatorLabel, { color: colors.textSecondary }]}>
              Enter payment amount
            </Text>
            <TextInput
              style={[styles.calculatorInput, { backgroundColor: colors.card, color: colors.text }]}
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              placeholder="₹0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
            {paymentAmount && parseFloat(paymentAmount) > 0 && (
              <View style={styles.calculatorResults}>
                <View style={styles.calculatorResultItem}>
                  <Text style={[styles.calculatorResultLabel, { color: colors.textSecondary }]}>
                    Interest Savings (approx.)
                  </Text>
                  <Text style={[styles.calculatorResultValue, { color: colors.primary }]}>
                    ₹{calculateInterestSavings(
                      creditCards.reduce((sum, c) => sum + c.currentBalance, 0),
                      parseFloat(paymentAmount)
                    ).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Auto-pay Prompt */}
        <View style={styles.section}>
          <View style={[styles.autoPayCard, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="card-outline" size={24} color={colors.primary} />
            <View style={styles.autoPayContent}>
              <Text style={[styles.autoPayTitle, { color: colors.text }]}>
                Set up Auto-pay
              </Text>
              <Text style={[styles.autoPayDescription, { color: colors.textSecondary }]}>
                Never miss a payment. Automatically pay your credit card bills.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.autoPayButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.autoPayButtonText}>Set Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  dueDateCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  dueDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dueDateText: {
    fontSize: 14,
  },
  daysBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  daysBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  paymentItem: {
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  calculatorCard: {
    padding: 16,
    borderRadius: 12,
  },
  calculatorLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  calculatorInput: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  calculatorResults: {
    marginTop: 12,
  },
  calculatorResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  calculatorResultLabel: {
    fontSize: 14,
  },
  calculatorResultValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  autoPayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  autoPayContent: {
    flex: 1,
  },
  autoPayTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  autoPayDescription: {
    fontSize: 12,
  },
  autoPayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  autoPayButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

