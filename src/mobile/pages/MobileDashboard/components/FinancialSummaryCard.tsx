import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface FinancialSummaryCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  chartData?: number[];
  onPress?: () => void;
  onViewAll?: () => void;
  onAddNew?: () => void;
  loading?: boolean;
  backgroundColor?: string;
  accentColor?: string;
}

const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({
  title,
  value,
  change,
  trend,
  icon,
  chartData = [65, 59, 80, 81, 56, 55, 40],
  onPress,
  onViewAll,
  onAddNew,
  loading = false,
  backgroundColor = '#1F2937',
  accentColor,
}) => {
  const isPositive = trend === 'up';
  const changeColor = isPositive ? '#10B981' : '#EF4444';
  const chartColor = accentColor || (isPositive ? '#10B981' : '#EF4444');

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: backgroundColor,
    backgroundGradientTo: backgroundColor,
    decimalPlaces: 0,
    color: (opacity = 1) => `${chartColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    strokeWidth: 2.5,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: '0',
    },
    propsForBackgroundLines: {
      strokeWidth: 0,
    },
    fillShadowGradient: chartColor,
    fillShadowGradientOpacity: 0.08,
  };

  const data = {
    labels: [],
    datasets: [
      {
        data: chartData,
        color: () => chartColor,
        strokeWidth: 2.5,
      },
    ],
  };

  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#10B981" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor }]} 
      onPress={onPress}
      activeOpacity={0.95}
    >
      {/* Header with title and actions */}
      <View style={styles.cardHeader}>
        <View style={styles.titleSection}>
          <View style={[styles.iconContainer, { backgroundColor: `${chartColor}15` }]}>
            <Text style={styles.cardIcon}>{icon}</Text>
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onViewAll}
          >
            <Text style={[styles.actionText, { color: chartColor }]}>View All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: `${chartColor}20` }]}
            onPress={onAddNew}
          >
            <Text style={[styles.addButtonText, { color: chartColor }]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Value and change */}
      <View style={styles.valueSection}>
        <Text style={styles.cardValue}>{value}</Text>
        <View style={styles.changeContainer}>
          <View style={[styles.trendIcon, { backgroundColor: `${changeColor}15` }]}>
            <Text style={[styles.trendArrow, { color: changeColor }]}>
              {isPositive ? '↗' : '↘'}
            </Text>
          </View>
          <Text style={[styles.cardChange, { color: changeColor }]}>
            {change} from last month
          </Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={data}
          width={width * 0.68}
          height={50}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withDots={false}
          withInnerLines={false}
          withOuterLines={false}
          withYAxisLabel={false}
          withXAxisLabel={false}
          transparent={true}
          paddingLeft={0}
          paddingRight={0}
        />
      </View>

      {/* Bottom indicator */}
      <View style={styles.bottomIndicator}>
        <View style={[styles.indicatorDot, { backgroundColor: chartColor }]} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    width: width * 0.75,
    minHeight: 160,
    borderWidth: 1,
    borderColor: '#374151',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardIcon: {
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
    flex: 1,
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionButton: {
    paddingHorizontal: 0,
    paddingVertical: 2,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 18,
  },
  valueSection: {
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  trendArrow: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  chart: {
    marginVertical: 0,
    borderRadius: 0,
  },
  bottomIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default FinancialSummaryCard; 