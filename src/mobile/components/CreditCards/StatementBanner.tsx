/**
 * =============================================================================
 * STATEMENT BANNER COMPONENT
 * =============================================================================
 * 
 * Info banner showing statement generation notification.
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

interface StatementBannerProps {
  month?: string;
  onPress?: () => void;
}

export const StatementBanner: React.FC<StatementBannerProps> = ({
  month,
  onPress,
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? require('../../../../contexts/ThemeContext').darkTheme : require('../../../../contexts/ThemeContext').lightTheme;

  // Get current month name
  const currentMonth = month || new Date().toLocaleDateString('en-US', { month: 'long' });
  const monthLower = currentMonth.toLowerCase();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name="information-circle" size={16} color={colors.textSecondary} />
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        {monthLower} statement generated {'>'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 22,
    marginTop: 16,
    marginBottom: 12,
    gap: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    textTransform: 'lowercase',
  },
});

