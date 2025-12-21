/**
 * =============================================================================
 * REWARDS TRACKER COMPONENT
 * =============================================================================
 * 
 * Track cashback, points, and rewards redemption.
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

export const RewardsTracker: React.FC = () => {
  const { isDark } = useTheme();
  const colors = isDark ? require('../../../../contexts/ThemeContext').darkTheme : require('../../../../contexts/ThemeContext').lightTheme;

  // Placeholder data - can be enhanced with actual rewards tracking
  const rewardsData = {
    cashbackThisMonth: 0,
    totalPoints: 0,
    availableRewards: [],
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>Rewards & Benefits</Text>
      
      {/* Cashback Summary */}
      <View style={[styles.rewardCard, { backgroundColor: colors.background }]}>
        <View style={styles.rewardHeader}>
          <Ionicons name="cash-outline" size={24} color={colors.primary} />
          <View style={styles.rewardContent}>
            <Text style={[styles.rewardLabel, { color: colors.textSecondary }]}>
              Cashback This Month
            </Text>
            <Text style={[styles.rewardValue, { color: colors.text }]}>
              ₹{rewardsData.cashbackThisMonth.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      </View>

      {/* Points Summary */}
      <View style={[styles.rewardCard, { backgroundColor: colors.background }]}>
        <View style={styles.rewardHeader}>
          <Ionicons name="star-outline" size={24} color={colors.primary} />
          <View style={styles.rewardContent}>
            <Text style={[styles.rewardLabel, { color: colors.textSecondary }]}>
              Total Points
            </Text>
            <Text style={[styles.rewardValue, { color: colors.text }]}>
              {rewardsData.totalPoints.toLocaleString('en-IN')} pts
            </Text>
          </View>
        </View>
      </View>

      {/* Coming Soon */}
      <View style={styles.comingSoonContainer}>
        <Ionicons name="gift-outline" size={32} color={colors.textSecondary} />
        <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
          Rewards tracking coming soon
        </Text>
        <Text style={[styles.comingSoonSubtext, { color: colors.textSecondary }]}>
          We're working on integrating rewards and cashback tracking
        </Text>
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  rewardCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rewardContent: {
    flex: 1,
  },
  rewardLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  rewardValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  comingSoonContainer: {
    alignItems: 'center',
    padding: 32,
  },
  comingSoonText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  comingSoonSubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
});

