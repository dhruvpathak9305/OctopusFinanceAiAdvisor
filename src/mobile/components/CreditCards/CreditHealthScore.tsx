/**
 * =============================================================================
 * CREDIT HEALTH SCORE COMPONENT
 * =============================================================================
 * 
 * Overall credit utilization score and improvement recommendations.
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
import { useCreditCards } from '../../../../contexts/CreditCardContext';

export const CreditHealthScore: React.FC = () => {
  const { isDark } = useTheme();
  const colors = isDark ? require('../../../../contexts/ThemeContext').darkTheme : require('../../../../contexts/ThemeContext').lightTheme;
  const { summary } = useCreditCards();

  if (!summary) {
    return null;
  }

  // Calculate health score (0-100)
  const calculateHealthScore = () => {
    let score = 100;
    
    // Deduct points for high utilization
    if (summary.averageUtilization > 70) {
      score -= 30;
    } else if (summary.averageUtilization > 50) {
      score -= 15;
    } else if (summary.averageUtilization > 30) {
      score -= 5;
    }
    
    // Deduct points for high utilization cards
    if (summary.highUtilizationCards > 0) {
      score -= summary.highUtilizationCards * 5;
    }
    
    // Deduct points for upcoming due dates (potential missed payments)
    if (summary.upcomingDueDates > 0) {
      score -= summary.upcomingDueDates * 2;
    }
    
    return Math.max(0, Math.min(100, score));
  };

  const healthScore = calculateHealthScore();
  const getScoreColor = () => {
    if (healthScore >= 80) return '#10B981';
    if (healthScore >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreLabel = () => {
    if (healthScore >= 80) return 'Excellent';
    if (healthScore >= 60) return 'Good';
    if (healthScore >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getRecommendations = () => {
    const recommendations: string[] = [];
    
    if (summary.averageUtilization > 70) {
      recommendations.push('Reduce credit utilization below 70%');
    }
    if (summary.highUtilizationCards > 0) {
      recommendations.push(`Pay down ${summary.highUtilizationCards} high utilization card(s)`);
    }
    if (summary.upcomingDueDates > 0) {
      recommendations.push(`Set up reminders for ${summary.upcomingDueDates} upcoming payment(s)`);
    }
    if (recommendations.length === 0) {
      recommendations.push('Keep up the good work! Your credit health is excellent.');
    }
    
    return recommendations;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>Credit Health Score</Text>
      
      {/* Score Display */}
      <View style={styles.scoreContainer}>
        <View style={[styles.scoreCircle, { borderColor: getScoreColor() }]}>
          <Text style={[styles.scoreValue, { color: getScoreColor() }]}>
            {healthScore}
          </Text>
          <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
            / 100
          </Text>
        </View>
        <Text style={[styles.scoreStatus, { color: getScoreColor() }]}>
          {getScoreLabel()}
        </Text>
      </View>

      {/* Recommendations */}
      <View style={styles.recommendationsContainer}>
        <Text style={[styles.recommendationsTitle, { color: colors.text }]}>
          Recommendations
        </Text>
        {getRecommendations().map((rec, index) => (
          <View key={index} style={styles.recommendationItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
            <Text style={[styles.recommendationText, { color: colors.text }]}>
              {rec}
            </Text>
          </View>
        ))}
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
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 14,
  },
  scoreStatus: {
    fontSize: 18,
    fontWeight: '600',
  },
  recommendationsContainer: {
    marginTop: 12,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    flex: 1,
  },
});

