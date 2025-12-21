/**
 * =============================================================================
 * SPENDING INSIGHTS COMPONENT
 * =============================================================================
 * 
 * Displays spending trends, category breakdown, top merchants, and utilization heatmap.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useUnifiedAuth } from '../../../../contexts/UnifiedAuthContext';
import { useSubscription } from '../../../../contexts/SubscriptionContext';
import * as analyticsService from '../../../../services/creditCardAnalyticsService';
import { networkMonitor } from '../../../../services/sync/networkMonitor';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 40;

export const SpendingInsights: React.FC = () => {
  const { isDark } = useTheme();
  const colors = isDark ? require('../../../../contexts/ThemeContext').darkTheme : require('../../../../contexts/ThemeContext').lightTheme;
  const { user } = useUnifiedAuth();
  const { isPremium } = useSubscription();
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<analyticsService.CreditCardAnalytics | null>(null);

  useEffect(() => {
    const updateNetworkStatus = async () => {
      const status = await networkMonitor.getStatus();
      setIsOnline(status === 'online');
    };
    updateNetworkStatus();
    const unsubscribe = networkMonitor.addListener((status) => {
      setIsOnline(status === 'online');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getCreditCardAnalytics(
          user.id,
          6,
          isPremium,
          isOnline
        );
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching spending insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?.id, isPremium, isOnline]);

  if (loading || !analytics) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>Loading insights...</Text>
      </View>
    );
  }

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(${isDark ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(${isDark ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>Spending Insights</Text>

        {/* Spending Trends */}
        {analytics.spendingTrends.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Spending</Text>
            <LineChart
              data={{
                labels: analytics.spendingTrends.map(t => t.month),
                datasets: [{
                  data: analytics.spendingTrends.map(t => t.amount),
                }],
              }}
              width={CHART_WIDTH}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {/* Category Breakdown */}
        {analytics.categoryBreakdown.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Category Breakdown</Text>
            <PieChart
              data={analytics.categoryBreakdown.slice(0, 5).map((cat, index) => ({
                name: cat.category,
                population: cat.amount,
                color: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'][index % 5],
                legendFontColor: colors.text,
                legendFontSize: 12,
              }))}
              width={CHART_WIDTH}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </View>
        )}

        {/* Top Merchants */}
        {analytics.topMerchants.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Merchants</Text>
            {analytics.topMerchants.map((merchant, index) => (
              <View key={index} style={styles.merchantItem}>
                <View style={styles.merchantInfo}>
                  <Text style={[styles.merchantName, { color: colors.text }]}>
                    {merchant.merchant}
                  </Text>
                  <Text style={[styles.merchantAmount, { color: colors.textSecondary }]}>
                    ₹{merchant.amount.toLocaleString('en-IN')} ({merchant.percentage.toFixed(1)}%)
                  </Text>
                </View>
                <Text style={[styles.merchantCount, { color: colors.textSecondary }]}>
                  {merchant.transactionCount} transactions
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Spending Velocity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Spending Velocity</Text>
          <View style={styles.velocityCard}>
            <Text style={[styles.velocityText, { color: colors.text }]}>
              {analytics.spendingVelocity === Infinity
                ? 'No spending data'
                : `Days until limit reached: ${analytics.spendingVelocity}`}
            </Text>
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  merchantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  merchantAmount: {
    fontSize: 12,
  },
  merchantCount: {
    fontSize: 12,
  },
  velocityCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  velocityText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

