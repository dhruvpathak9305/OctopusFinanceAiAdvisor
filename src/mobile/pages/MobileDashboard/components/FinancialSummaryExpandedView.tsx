import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const { width, height } = Dimensions.get('window');

interface FinancialSummaryExpandedViewProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  chartData: number[];
  accentColor: string;
  backgroundColor: string;
}

const FinancialSummaryExpandedView: React.FC<FinancialSummaryExpandedViewProps> = ({
  visible,
  onClose,
  title,
  value,
  change,
  trend,
  icon,
  chartData,
  accentColor,
  backgroundColor,
}) => {
  const isPositive = trend === 'up';
  const changeColor = isPositive ? '#10B981' : '#EF4444';

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: backgroundColor,
    backgroundGradientTo: backgroundColor,
    decimalPlaces: 0,
    color: (opacity = 1) => `${accentColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    strokeWidth: 3,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: accentColor,
    },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: '#374151',
    },
    fillShadowGradient: accentColor,
    fillShadowGradientOpacity: 0.1,
  };

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        data: chartData,
        color: () => accentColor,
        strokeWidth: 3,
      },
    ],
  };

  // Mock detailed data - in production this would come from API
  const getDetailedData = () => {
    switch (title) {
      case 'Credit Card Debt':
        return [
          { name: 'Chase Freedom', amount: '$8,574', limit: '$15,000' },
          { name: 'Bank of America', amount: '$6,000', limit: '$10,000' },
          { name: 'Capital One', amount: '$5,000', limit: '$8,000' },
        ];
      case 'Bank Accounts':
        return [
          { name: 'Checking Account', amount: '$3,459', type: 'Checking' },
          { name: 'Savings Account', amount: '$5,000', type: 'Savings' },
        ];
      case 'Monthly Income':
        return [
          { name: 'Salary', amount: '$4,200', type: 'Primary' },
          { name: 'Freelance', amount: '$650', type: 'Secondary' },
        ];
      case 'Monthly Expenses':
        return [
          { name: 'Rent', amount: '$1,200', category: 'Housing' },
          { name: 'Groceries', amount: '$480', category: 'Food' },
          { name: 'Utilities', amount: '$280', category: 'Bills' },
          { name: 'Transportation', amount: '$320', category: 'Transport' },
          { name: 'Entertainment', amount: '$200', category: 'Leisure' },
        ];
      case 'Net Worth':
        return [
          { name: 'Assets', amount: '$50,680', type: 'Assets' },
          { name: 'Liabilities', amount: '$8,000', type: 'Liabilities' },
        ];
      default:
        return [];
    }
  };

  const detailedData = getDetailedData();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: '#0B1426' }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor, borderBottomColor: accentColor }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: `${accentColor}20` }]}>
              <Text style={styles.headerIconText}>{icon}</Text>
            </View>
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Main Value Section */}
          <View style={[styles.valueCard, { backgroundColor }]}>
            <Text style={styles.mainValue}>{value}</Text>
            <View style={styles.changeSection}>
              <View style={[styles.trendIcon, { backgroundColor: `${changeColor}15` }]}>
                <Text style={[styles.trendArrow, { color: changeColor }]}>
                  {isPositive ? '↗' : '↘'}
                </Text>
              </View>
              <Text style={[styles.changeText, { color: changeColor }]}>
                {change} from last month
              </Text>
            </View>
          </View>

          {/* Enhanced Chart */}
          <View style={[styles.chartCard, { backgroundColor }]}>
            <Text style={styles.chartTitle}>7-Month Trend</Text>
            <LineChart
              data={data}
              width={width - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withDots={true}
              withInnerLines={true}
              withOuterLines={false}
              withYAxisLabel={true}
              withXAxisLabel={true}
              transparent={false}
            />
          </View>

          {/* Detailed Breakdown */}
          <View style={[styles.detailsCard, { backgroundColor }]}>
            <Text style={styles.detailsTitle}>Breakdown</Text>
            {detailedData.map((item, index) => (
              <View key={index} style={styles.detailItem}>
                <View style={styles.detailLeft}>
                  <View style={[styles.detailDot, { backgroundColor: accentColor }]} />
                  <View>
                    <Text style={styles.detailName}>{item.name}</Text>
                    <Text style={styles.detailType}>
                      {item.type || item.category || 'Details'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.detailAmount}>{item.amount}</Text>
                {item.limit && (
                  <Text style={styles.detailLimit}>/ {item.limit}</Text>
                )}
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: `${accentColor}20` }]}
            >
              <Text style={[styles.actionButtonText, { color: accentColor }]}>
                Add New
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: `${accentColor}20` }]}
            >
              <Text style={[styles.actionButtonText, { color: accentColor }]}>
                View History
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIconText: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  valueCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  mainValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -1.5,
  },
  changeSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  trendArrow: {
    fontSize: 14,
    fontWeight: '700',
  },
  changeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  chartCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
  },
  detailsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  detailName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  detailType: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  detailAmount: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  detailLimit: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FinancialSummaryExpandedView; 