/**
 * =============================================================================
 * CREDIT CARD DETAIL MODAL
 * =============================================================================
 * 
 * Full card information, transaction history, and settings.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { CreditCard } from '../../../../contexts/CreditCardContext';
import { AnimatedCreditCard } from './AnimatedCreditCard';
import { CreditCardTransactionHistory } from './CreditCardTransactionHistory';

interface CreditCardDetailModalProps {
  visible: boolean;
  card: CreditCard | null;
  onClose: () => void;
}

export const CreditCardDetailModal: React.FC<CreditCardDetailModalProps> = ({
  visible,
  card,
  onClose,
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? require('../../../../contexts/ThemeContext').darkTheme : require('../../../../contexts/ThemeContext').lightTheme;

  if (!card) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Card Details</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Card Display */}
          <View style={styles.cardContainer}>
            <AnimatedCreditCard card={card} />
          </View>

          {/* Card Information */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Card Information</Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Card Name</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{card.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Bank</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{card.bank}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Card Number</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                •••• •••• •••• {card.lastFourDigits}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Credit Limit</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                ₹{card.creditLimit.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Current Balance</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                ₹{card.currentBalance.toLocaleString('en-IN')}
              </Text>
            </View>
            {card.dueDate && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Due Date</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {new Date(card.dueDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
              <Ionicons name="card-outline" size={20} color="white" />
              <Text style={styles.actionButtonText}>Make Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.secondaryButton, { borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.text} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Freeze Card</Text>
            </TouchableOpacity>
          </View>

          {/* Transaction History */}
          {card.id && (
            <CreditCardTransactionHistory
              cardId={card.id}
              cardName={card.name}
              limit={100}
            />
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  cardContainer: {
    padding: 20,
  },
  section: {
    padding: 24,
    marginBottom: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginBottom: 12,
    gap: 10,
    minHeight: 48,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

