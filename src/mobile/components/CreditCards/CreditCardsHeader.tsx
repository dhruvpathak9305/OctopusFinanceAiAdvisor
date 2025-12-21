/**
 * =============================================================================
 * CREDIT CARDS HEADER COMPONENT
 * =============================================================================
 * 
 * Summary header showing total credit limit, utilization, available credit,
 * and quick action buttons.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { CreditCardContextType } from '../../../../contexts/CreditCardContext';

interface CreditCardsHeaderProps {
  summary?: CreditCardContextType['summary'];
  onAddCard?: () => void;
  onPayAll?: () => void;
}

export const CreditCardsHeader: React.FC<CreditCardsHeaderProps> = ({
  summary,
  onAddCard,
  onPayAll,
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? require('../../../../contexts/ThemeContext').darkTheme : require('../../../../contexts/ThemeContext').lightTheme;

  if (!summary) {
    return null;
  }

  const utilizationColor = summary.averageUtilization > 70 
    ? '#EF4444' 
    : summary.averageUtilization > 50 
    ? '#F59E0B' 
    : colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {/* Summary Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total Limit
          </Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            ₹{summary.totalCreditLimit.toLocaleString('en-IN')}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Utilization
          </Text>
          <Text style={[styles.statValue, { color: utilizationColor }]}>
            {summary.averageUtilization.toFixed(1)}%
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Available
          </Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            ₹{summary.totalAvailableCredit.toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      {/* Additional Info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Ionicons name="card" size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {summary.totalCards} {summary.totalCards === 1 ? 'card' : 'cards'}
          </Text>
        </View>
        {summary.highUtilizationCards > 0 && (
          <View style={styles.infoItem}>
            <Ionicons name="warning" size={16} color="#F59E0B" />
            <Text style={[styles.infoText, { color: '#F59E0B' }]}>
              {summary.highUtilizationCards} high utilization
            </Text>
          </View>
        )}
        {summary.upcomingDueDates > 0 && (
          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={16} color="#EF4444" />
            <Text style={[styles.infoText, { color: '#EF4444' }]}>
              {summary.upcomingDueDates} due soon
            </Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={onAddCard}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.actionButtonText}>Add Card</Text>
        </TouchableOpacity>
        {onPayAll && (
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton, { borderColor: colors.border }]}
            onPress={onPayAll}
          >
            <Ionicons name="card-outline" size={20} color={colors.text} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Pay All</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  infoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 8,
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
    fontSize: 14,
    fontWeight: '600',
  },
});

