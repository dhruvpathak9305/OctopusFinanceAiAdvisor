/**
 * =============================================================================
 * SPENDING ANALYSIS COMPONENT
 * =============================================================================
 * 
 * Detailed spending analysis with trends, patterns, and category breakdown.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../../../contexts/ThemeContext';
import { SpendingInsights } from './SpendingInsights';

export const SpendingAnalysis: React.FC = () => {
  const { isDark } = useTheme();
  const colors = isDark ? require('../../../../contexts/ThemeContext').darkTheme : require('../../../../contexts/ThemeContext').lightTheme;

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>Spending Analysis</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Detailed insights into your credit card spending patterns
        </Text>
        
        {/* Reuse SpendingInsights component */}
        <SpendingInsights />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
});



