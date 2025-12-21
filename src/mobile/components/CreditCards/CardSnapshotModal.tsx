/**
 * =============================================================================
 * CARD SNAPSHOT MODAL COMPONENT
 * =============================================================================
 * 
 * Full-screen modal showing detailed card snapshot on long press.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { CreditCard } from '../../../../contexts/CreditCardContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CardSnapshotModalProps {
  visible: boolean;
  card: CreditCard | null;
  onClose: () => void;
}

/**
 * Get bank-specific gradient colors
 */
const getBankGradient = (bankName: string): string[] => {
  const bankUpper = (bankName || '').toUpperCase();
  
  if (bankUpper.includes('HDFC')) {
    return ['#FF6B6B', '#4ECDC4', '#95E1D3'];
  } else if (bankUpper.includes('AXIS')) {
    return ['#667EEA', '#764BA2', '#F093FB'];
  } else if (bankUpper.includes('ICICI')) {
    return ['#F093FB', '#F5576C'];
  } else if (bankUpper.includes('SBI')) {
    return ['#4FACFE', '#00F2FE'];
  } else {
    return ['#6366F1', '#8B5CF6', '#A78BFA'];
  }
};

export const CardSnapshotModal: React.FC<CardSnapshotModalProps> = ({
  visible,
  card,
  onClose,
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? require('../../../../contexts/ThemeContext').darkTheme : require('../../../../contexts/ThemeContext').lightTheme;

  if (!card || !visible) {
    return null;
  }

  const gradientColors = getBankGradient(card.bank || card.institution || '');

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate utilization
  const utilization = card.creditLimit > 0
    ? ((card.currentBalance || 0) / card.creditLimit) * 100
    : 0;

  const availableCredit = card.creditLimit - (card.currentBalance || 0);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Card Snapshot
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Card Preview */}
            <View style={styles.cardPreview}>
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                <View style={styles.cardPreviewContent}>
                  <View style={styles.cardPreviewHeader}>
                    <Text style={styles.cardPreviewBank}>
                      {card.bank || card.institution || 'Credit Card'}
                    </Text>
                    <Text style={styles.cardPreviewType}>VISA</Text>
                  </View>
                  <Text style={styles.cardPreviewNumber}>
                    •••• •••• •••• {card.lastFourDigits}
                  </Text>
                  <Text style={styles.cardPreviewName}>
                    {card.name.toUpperCase()}
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Quick Stats */}
            <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Credit Limit
                  </Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {formatCurrency(card.creditLimit)}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Current Balance
                  </Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {formatCurrency(card.currentBalance || 0)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Available Credit
                  </Text>
                  <Text style={[styles.statValue, { color: colors.primary }]}>
                    {formatCurrency(availableCredit)}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Utilization
                  </Text>
                  <Text
                    style={[
                      styles.statValue,
                      {
                        color:
                          utilization > 70
                            ? '#EF4444'
                            : utilization > 50
                            ? '#F59E0B'
                            : colors.primary,
                      },
                    ]}
                  >
                    {utilization.toFixed(1)}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Due Date Info */}
            {card.dueDate && (
              <View style={[styles.dueDateCard, { backgroundColor: colors.card }]}>
                <View style={styles.dueDateHeader}>
                  <Ionicons name="calendar" size={20} color={colors.primary} />
                  <Text style={[styles.dueDateTitle, { color: colors.text }]}>
                    Payment Due
                  </Text>
                </View>
                <Text style={[styles.dueDateValue, { color: colors.text }]}>
                  {new Date(card.dueDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={[styles.dueDateAmount, { color: colors.text }]}>
                  {formatCurrency(card.currentBalance || 0)}
                </Text>
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={onClose}
              >
                <Ionicons name="card-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>Pay Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.secondaryButton,
                  { borderColor: colors.border },
                ]}
                onPress={onClose}
              >
                <Ionicons name="eye-outline" size={20} color={colors.text} />
                <Text style={[styles.actionButtonText, { color: colors.text }]}>
                  View Details
                </Text>
              </TouchableOpacity>
            </View>
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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    height: SCREEN_HEIGHT * 0.85,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  cardPreview: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardGradient: {
    width: '100%',
    height: '100%',
  },
  cardPreviewContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPreviewBank: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  cardPreviewType: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cardPreviewNumber: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 3,
  },
  cardPreviewName: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 1,
  },
  statsContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  dueDateCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  dueDateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dueDateTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  dueDateValue: {
    fontSize: 14,
    marginBottom: 8,
  },
  dueDateAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
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
});


