/**
 * =============================================================================
 * STATEMENT DUE VIEW COMPONENT
 * =============================================================================
 * 
 * Main view showing stacked cards with statement due information.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { CreditCard } from '../../../../contexts/CreditCardContext';
import { StackedCreditCard } from './StackedCreditCard';
import { StatementBanner } from './StatementBanner';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = 220;
const STACK_OFFSET = 20;

interface StatementDueViewProps {
  cards: CreditCard[];
  selectedCardId?: string | null;
  onCardPress?: (card: CreditCard) => void;
  onCardLongPress?: (card: CreditCard) => void;
  onPayNow?: (card: CreditCard) => void;
  onStatementPress?: (card: CreditCard) => void;
}

export const StatementDueView: React.FC<StatementDueViewProps> = ({
  cards,
  selectedCardId,
  onCardPress,
  onCardLongPress,
  onPayNow,
  onStatementPress,
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? require('../../../../contexts/ThemeContext').darkTheme : require('../../../../contexts/ThemeContext').lightTheme;

  // Filter cards with due dates in next 30 days
  const now = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(now.getDate() + 30);

  const cardsWithDueDates = useMemo(() => {
    return cards
      .filter(card => {
        if (!card.dueDate) return false;
        const dueDate = new Date(card.dueDate);
        return dueDate >= now && dueDate <= thirtyDaysLater;
      })
      .sort((a, b) => {
        // Sort by due date (earliest first)
        const dateA = new Date(a.dueDate || 0).getTime();
        const dateB = new Date(b.dueDate || 0).getTime();
        return dateA - dateB;
      });
  }, [cards]);

  // If a specific card is selected, show only that card
  const displayCards = selectedCardId && selectedCardId !== 'all'
    ? cardsWithDueDates.filter(card => card.id === selectedCardId)
    : cardsWithDueDates;

  // Calculate container height based on number of cards
  const containerHeight = Math.max(
    SCREEN_HEIGHT * 0.5,
    displayCards.length * (CARD_HEIGHT - STACK_OFFSET * 2) + STACK_OFFSET * 2 + 100
  );

  if (displayCards.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.emptyIconContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="checkmark-circle" size={64} color={colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          All Caught Up!
        </Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No statements due in the next 30 days
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { height: containerHeight, backgroundColor: colors.background },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.cardsContainer}>
        {displayCards.map((card, index) => (
          <View key={card.id || index} style={styles.cardWrapper}>
            <StackedCreditCard
              card={card}
              index={index}
              totalCards={displayCards.length}
              onPress={() => onCardPress?.(card)}
              onLongPress={() => onCardLongPress?.(card)}
              onPayNow={() => onPayNow?.(card)}
            />
            
            {/* Statement Banner */}
            <StatementBanner
              month={new Date(card.dueDate || '').toLocaleDateString('en-US', { month: 'long' })}
              onPress={() => onStatementPress?.(card)}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100, // Space for card selector
  },
  cardsContainer: {
    alignItems: 'center',
  },
  cardWrapper: {
    width: '100%',
    marginBottom: 50,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

