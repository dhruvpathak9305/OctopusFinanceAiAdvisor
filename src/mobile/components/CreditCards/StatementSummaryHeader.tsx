/**
 * =============================================================================
 * STATEMENT SUMMARY HEADER COMPONENT
 * =============================================================================
 * 
 * Cred-inspired header showing statement due count, total amount, and view toggle.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { CreditCard } from '../../../../contexts/CreditCardContext';

interface StatementSummaryHeaderProps {
  cards: CreditCard[];
  onToggleView?: () => void;
  showRecentSpends?: boolean;
}

export const StatementSummaryHeader: React.FC<StatementSummaryHeaderProps> = ({
  cards,
  onToggleView,
  showRecentSpends = false,
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? require('../../../../contexts/ThemeContext').darkTheme : require('../../../../contexts/ThemeContext').lightTheme;
  const [isExpanded, setIsExpanded] = useState(false);
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  // Calculate cards with due dates in next 30 days
  const now = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(now.getDate() + 30);

  const cardsWithDueDates = cards.filter(card => {
    if (!card.dueDate) return false;
    const dueDate = new Date(card.dueDate);
    return dueDate >= now && dueDate <= thirtyDaysLater;
  });

  // Calculate total amount due
  const totalAmountDue = cardsWithDueDates.reduce((sum, card) => {
    return sum + (card.currentBalance || 0);
  }, 0);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.timing(rotateAnim, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  if (cardsWithDueDates.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top badges - optional rewards/percentage indicators */}
      <View style={styles.topBadges}>
        {/* Can add rewards badge here if needed */}
      </View>

      {/* Statement Due Header */}
      <View style={styles.headerSection}>
        <Text style={[styles.statementLabel, { color: colors.textSecondary }]}>
          STATEMENT DUE FOR {cardsWithDueDates.length} {cardsWithDueDates.length === 1 ? 'CARD' : 'CARDS'}
        </Text>
        
        <TouchableOpacity
          style={styles.amountRow}
          onPress={handleExpand}
          activeOpacity={0.7}
        >
          <Text style={[styles.totalAmount, { color: colors.text }]}>
            {formatCurrency(totalAmountDue)}
          </Text>
          <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
            <Ionicons
              name="chevron-down"
              size={20}
              color={colors.textSecondary}
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Expanded breakdown - optional */}
        {isExpanded && (
          <View style={[styles.breakdown, { backgroundColor: colors.card }]}>
            {cardsWithDueDates.map((card, index) => (
              <View key={card.id || index} style={styles.breakdownRow}>
                <Text style={[styles.breakdownCardName, { color: colors.text }]}>
                  {card.name}
                </Text>
                <Text style={[styles.breakdownAmount, { color: colors.text }]}>
                  {formatCurrency(card.currentBalance || 0)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* View Toggle Button */}
      {onToggleView && (
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={onToggleView}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showRecentSpends ? 'card-outline' : 'swap-horizontal'}
            size={16}
            color={colors.primary}
          />
          <Text style={[styles.toggleButtonText, { color: colors.primary }]}>
            {showRecentSpends ? 'switch to statement due' : 'switch to recent spends'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  topBadges: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
    gap: 8,
  },
  headerSection: {
    marginBottom: 12,
  },
  statementLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.4,
    fontFamily: 'system',
  },
  breakdown: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownCardName: {
    fontSize: 14,
    fontWeight: '500',
  },
  breakdownAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'lowercase',
  },
});

