import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, darkTheme, lightTheme } from '../../../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

interface BankAccount {
  id: string;
  name: string;
  balance: number;
  percentage: number;
  color: string;
  icon: string;
}

interface ChartDataPoint {
  date: string;
  spend: number;
  invested: number;
  income: number;
}

const MobileAccounts: React.FC = () => {
  const { isDark } = useTheme();
  const colors = isDark ? darkTheme : lightTheme;
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isDistributionExpanded, setIsDistributionExpanded] = useState(false);
  const [activeChart, setActiveChart] = useState<'spend' | 'invested' | 'income'>('spend');
  const [selectedDataPoint, setSelectedDataPoint] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'monthly'>('daily');

  const screenWidth = Dimensions.get('window').width;

  // Sample data
  const accounts: BankAccount[] = [
    { id: '1', name: 'Axis Bank', balance: 100000, percentage: 20, color: '#8B5CF6', icon: 'trending-up' },
    { id: '2', name: 'HDFC Bank', balance: 300000, percentage: 60, color: '#F59E0B', icon: 'add' },
    { id: '3', name: 'ICICI Bank', balance: 100000, percentage: 20, color: '#EF4444', icon: 'information' },
  ];

  const filters = ['All', 'Axis Bank', 'HDFC Bank', 'ICICI Bank', 'Add Account'];

  // 30 days of daily data
  const dailyChartData: ChartDataPoint[] = [
    { date: '1', spend: 2700, invested: 900, income: 0 },
    { date: '2', spend: 1800, invested: 1200, income: 0 },
    { date: '3', spend: 3200, invested: 3600, income: 50000 },
    { date: '4', spend: 2100, invested: 800, income: 0 },
    { date: '5', spend: 2500, invested: 900, income: 0 },
    { date: '6', spend: 3800, invested: 1500, income: 0 },
    { date: '7', spend: 4200, invested: 2700, income: 0 },
    { date: '8', spend: 1900, invested: 1100, income: 0 },
    { date: '9', spend: 3800, invested: 2400, income: 0 },
    { date: '10', spend: 2200, invested: 1800, income: 0 },
    { date: '11', spend: 1500, invested: 3200, income: 0 },
    { date: '12', spend: 3400, invested: 1600, income: 0 },
    { date: '13', spend: 4500, invested: 900, income: 0 },
    { date: '14', spend: 2800, invested: 2100, income: 0 },
    { date: '15', spend: 1200, invested: 1400, income: 0 },
    { date: '16', spend: 3600, invested: 1900, income: 0 },
    { date: '17', spend: 5200, invested: 3600, income: 0 },
    { date: '18', spend: 2900, invested: 1300, income: 0 },
    { date: '19', spend: 4800, invested: 2900, income: 0 },
    { date: '20', spend: 2100, invested: 1700, income: 0 },
    { date: '21', spend: 3300, invested: 2200, income: 0 },
    { date: '22', spend: 3000, invested: 1800, income: 0 },
    { date: '23', spend: 4100, invested: 2500, income: 0 },
    { date: '24', spend: 1700, invested: 1000, income: 0 },
    { date: '25', spend: 2400, invested: 2700, income: 0 },
    { date: '26', spend: 3900, invested: 1400, income: 0 },
    { date: '27', spend: 2600, invested: 1900, income: 0 },
    { date: '28', spend: 4200, invested: 3100, income: 0 },
    { date: '29', spend: 3100, invested: 2300, income: 0 },
    { date: '30', spend: 1800, invested: 3000, income: 0 },
  ];

  // 12 months of monthly data
  const monthlyChartData: ChartDataPoint[] = [
    { date: 'Oct 24', spend: 62000, invested: 55000, income: 0 },
    { date: 'Nov 24', spend: 45000, invested: 48000, income: 0 },
    { date: 'Dec 24', spend: 52000, invested: 42000, income: 0 },
    { date: 'Jan', spend: 48000, invested: 51000, income: 0 },
    { date: 'Feb', spend: 35000, invested: 63000, income: 0 },
    { date: 'Mar', spend: 58000, invested: 39000, income: 0 },
    { date: 'Apr', spend: 41000, invested: 67000, income: 0 },
    { date: 'May', spend: 55000, invested: 44000, income: 0 },
    { date: 'Jun', spend: 73000, invested: 71000, income: 0 },
    { date: 'Jul', spend: 67000, invested: 52000, income: 0 },
    { date: 'Aug', spend: 62000, invested: 64000, income: 68100 },
  ];

  const getCurrentChartData = () => {
    return chartPeriod === 'daily' ? dailyChartData : monthlyChartData;
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const getChartColor = () => {
    const chartColors = {
      spend: '#EF4444',
      invested: '#3B82F6',
      income: '#22C55E',
    };
    return chartColors[activeChart];
  };

  const handleDataPointPress = (index: number, x: number, y: number) => {
    setSelectedDataPoint(index);
    setTooltipPosition({ x, y });
  };

  const CustomChart = () => {
    const chartWidth = screenWidth - 80;
    const chartHeight = 200;
    const padding = 40;
    const currentData = getCurrentChartData();
    const dataPoints = currentData.map(point => point[activeChart]);
    const maxValue = Math.max(...dataPoints);
    const minValue = Math.min(...dataPoints);
    const range = maxValue - minValue || 1;

    return (
      <View style={[styles.customChart, { width: chartWidth, height: chartHeight, backgroundColor: colors.card }]}>
        {/* Grid Lines */}
        {[0, 1, 2, 3, 4].map((line) => (
          <View
            key={line}
            style={[
              styles.gridLine,
              {
                top: (chartHeight - padding * 2) * (line / 4) + padding,
                backgroundColor: colors.border,
              }
            ]}
          />
        ))}

        {/* Data Points and Lines */}
        <View style={styles.chartContent}>
          {dataPoints.map((value, index) => {
            const x = (chartWidth - padding * 2) * (index / (dataPoints.length - 1)) + padding;
            const y = chartHeight - padding - ((value - minValue) / range) * (chartHeight - padding * 2);
            
            return (
              <View key={index}>
                {/* Line to next point */}
                {index < dataPoints.length - 1 && (
                  <View
                    style={[
                      styles.chartLine,
                      {
                        position: 'absolute',
                        left: x,
                        top: y,
                        width: Math.sqrt(
                          Math.pow((chartWidth - padding * 2) / (dataPoints.length - 1), 2) +
                          Math.pow(((dataPoints[index + 1] - minValue) / range - (value - minValue) / range) * (chartHeight - padding * 2), 2)
                        ),
                        backgroundColor: getChartColor(),
                        transform: [
                          {
                            rotate: `${Math.atan2(
                              ((dataPoints[index + 1] - minValue) / range - (value - minValue) / range) * (chartHeight - padding * 2),
                              (chartWidth - padding * 2) / (dataPoints.length - 1)
                            )}rad`
                          }
                        ],
                      }
                    ]}
                  />
                )}
                
                {/* Data Point */}
                <TouchableOpacity
                  style={[
                    styles.dataPoint,
                    {
                      position: 'absolute',
                      left: x - 6,
                      top: y - 6,
                      backgroundColor: getChartColor(),
                      borderColor: colors.background,
                    }
                  ]}
                  onPress={() => handleDataPointPress(index, x, y)}
                />
              </View>
            );
          })}
        </View>

        {/* X-axis Labels */}
        <View style={styles.xAxisLabels}>
          {currentData.filter((_, index) => {
            if (chartPeriod === 'daily') {
              return index % 5 === 0; // Show every 5th day
            } else {
              return index % 2 === 0; // Show every other month
            }
          }).map((point, index) => (
            <Text
              key={index}
              style={[styles.axisLabel, { color: colors.textSecondary }]}
            >
              {point.date}
            </Text>
          ))}
        </View>

        {/* Y-axis Labels */}
        <View style={styles.yAxisLabels}>
          {[0, 1, 2, 3, 4].map((line) => (
            <Text
              key={line}
              style={[
                styles.axisLabel,
                {
                  color: colors.textSecondary,
                  position: 'absolute',
                  top: (chartHeight - padding * 2) * ((4 - line) / 4) + padding - 8,
                  left: 5,
                }
              ]}
            >
              ₹{chartPeriod === 'daily' 
                ? ((minValue + (range * line / 4)) / 1000).toFixed(1) + 'K'
                : ((minValue + (range * line / 4)) / 1000).toFixed(0) + 'K'
              }
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const renderFilterButton = ({ item, index }: { item: string, index: number }) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.filterButton,
        {
          backgroundColor: selectedFilter === item ? colors.primary : colors.card,
          borderColor: colors.border,
        },
        item === 'Add Account' && { backgroundColor: colors.primary }
      ]}
      onPress={() => setSelectedFilter(item)}
    >
      {item === 'Add Account' && <Ionicons name="add" size={14} color="white" style={{ marginRight: 4 }} />}
      <Text style={[
        styles.filterButtonText,
        {
          color: (selectedFilter === item || item === 'Add Account') ? 'white' : colors.text
        }
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderAccountItem = ({ item }: { item: BankAccount }) => (
    <View style={styles.accountItem}>
      <View style={[styles.accountIcon, { backgroundColor: `${item.color}20` }]}>
        <Ionicons name={item.icon as any} size={20} color={item.color} />
      </View>
      <View style={styles.accountInfo}>
        <Text style={[styles.accountName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.accountBalance, { color: colors.textSecondary }]}>
          ₹{(item.balance / 1000).toFixed(1)}K • {item.percentage}%
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Money
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Manage your accounts and cards
          </Text>
        </View>
      </View>

      {/* Full Width Navigation Buttons */}
      <View style={[styles.fullNavContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.fullNavButtonGroup, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={[styles.fullNavButton, styles.activeFullNav, { backgroundColor: colors.primary }]}>
            <Ionicons name="wallet" size={16} color="white" />
            <Text style={[styles.fullNavText, { color: "white" }]}>Accounts</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.fullNavButton]}
            onPress={() => (navigation as any).navigate('MobileCredit')}
          >
            <Ionicons name="card" size={16} color={colors.textSecondary} />
            <Text style={[styles.fullNavText, { color: colors.textSecondary }]}>Credit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.fullNavButton]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="trending-up" size={16} color={colors.textSecondary} />
            <Text style={[styles.fullNavText, { color: colors.textSecondary }]}>Net</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Horizontal Filter Buttons */}
        <View style={styles.filtersContainer}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>Filter by:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            {filters.map((filter, index) => renderFilterButton({ item: filter, index }))}
          </ScrollView>
        </View>

        {/* Combined Balance and Distribution Card */}
        <View style={[styles.combinedCard, { backgroundColor: colors.card }]}>
          {/* Total Balance Header */}
          <View style={styles.balanceHeader}>
            <View>
              <View style={styles.balanceTitleRow}>
                <Text style={[styles.balanceTitle, { color: colors.text }]}>Total Balance</Text>
                <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
              </View>
              <Text style={[styles.balanceAmount, { color: colors.primary }]}>
                ₹{(totalBalance / 100000).toFixed(1)}L
              </Text>
              <View style={styles.balanceTime}>
                <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                <Text style={[styles.balanceTimeText, { color: colors.textSecondary }]}>
                  Just now • 4:57 pm
                </Text>
              </View>
            </View>
            <View style={styles.chartPreview}>
              <View style={[styles.chartRing, { borderColor: colors.primary }]}>
                <View style={[styles.chartSegment, { backgroundColor: '#F59E0B', width: '60%' }]} />
                <View style={[styles.chartSegment, { backgroundColor: '#8B5CF6', width: '20%' }]} />
                <View style={[styles.chartSegment, { backgroundColor: '#EF4444', width: '20%' }]} />
              </View>
              <Text style={[styles.accountCount, { color: colors.textSecondary }]}>3 accounts</Text>
            </View>
          </View>

          {/* Account Distribution Section */}
          <TouchableOpacity
            style={styles.distributionHeader}
            onPress={() => setIsDistributionExpanded(!isDistributionExpanded)}
          >
            <Text style={[styles.distributionTitle, { color: colors.text }]}>Account Distribution</Text>
            <Ionicons
              name={isDistributionExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {isDistributionExpanded && (
            <View style={styles.distributionContent}>
              {/* Large Donut Chart */}
              <View style={styles.donutContainer}>
                <View style={styles.donutChart}>
                  <View style={[styles.donutSegment, { backgroundColor: '#F59E0B', height: '60%' }]} />
                  <View style={[styles.donutSegment, { backgroundColor: '#8B5CF6', height: '20%' }]} />
                  <View style={[styles.donutSegment, { backgroundColor: '#EF4444', height: '20%' }]} />
                  <View style={styles.donutCenter}>
                    <Text style={[styles.donutCenterAmount, { color: colors.text }]}>₹5.0K</Text>
                    <Text style={[styles.donutCenterLabel, { color: colors.textSecondary }]}>Total Balance</Text>
                  </View>
                </View>
              </View>

              {/* Account List */}
              <FlatList
                data={accounts}
                renderItem={renderAccountItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                style={styles.accountsList}
              />
            </View>
          )}
        </View>

        {/* Clickable Account Icons */}
        <View style={styles.accountIconsRow}>
          {accounts.map((account) => (
            <TouchableOpacity 
              key={account.id} 
              style={[
                styles.accountIconItem,
                selectedBank === account.name && { backgroundColor: colors.border, borderRadius: 12, padding: 8 }
              ]}
              onPress={() => setSelectedBank(selectedBank === account.name ? null : account.name)}
            >
              <View style={[styles.accountIconCircle, { backgroundColor: account.color }]}>
                <Ionicons name={account.icon as any} size={20} color="white" />
              </View>
              <Text style={[styles.accountIconBalance, { color: colors.text }]}>
                ₹{(account.balance / 1000).toFixed(1)}K
              </Text>
              <Text style={[styles.accountIconName, { color: colors.textSecondary }]}>
                {account.name}
              </Text>
              {selectedBank === account.name && (
                <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Month Navigation */}
        <View style={[styles.monthCard, { backgroundColor: colors.card }]}>
          <View style={styles.monthHeader}>
            <TouchableOpacity>
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.monthTitle, { color: colors.text }]}>August 2025</Text>
            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Chart Type Buttons */}
          <View style={styles.chartTypeContainer}>
            <TouchableOpacity
              style={[
                styles.chartTypeButton,
                activeChart === 'spend' && { backgroundColor: '#EF4444' }
              ]}
              onPress={() => setActiveChart('spend')}
            >
              <Ionicons name="trending-down" size={16} color={activeChart === 'spend' ? 'white' : colors.text} />
              <Text style={[
                styles.chartTypeText,
                { color: activeChart === 'spend' ? 'white' : colors.text }
              ]}>
                Spend
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.chartTypeButton,
                activeChart === 'invested' && { backgroundColor: '#3B82F6' }
              ]}
              onPress={() => setActiveChart('invested')}
            >
              <Ionicons name="trending-up" size={16} color={activeChart === 'invested' ? 'white' : colors.text} />
              <Text style={[
                styles.chartTypeText,
                { color: activeChart === 'invested' ? 'white' : colors.text }
              ]}>
                Invested
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.chartTypeButton,
                activeChart === 'income' && { backgroundColor: '#22C55E' }
              ]}
              onPress={() => setActiveChart('income')}
            >
              <Ionicons name="cash" size={16} color={activeChart === 'income' ? 'white' : colors.text} />
              <Text style={[
                styles.chartTypeText,
                { color: activeChart === 'income' ? 'white' : colors.text }
              ]}>
                Income
              </Text>
            </TouchableOpacity>
          </View>

          {/* Month Summary */}
          <View style={styles.monthSummary}>
            <View style={styles.summaryLeft}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>This month so far</Text>
              <View style={styles.summaryAmountRow}>
                <Text style={[styles.summaryAmount, { 
                  color: activeChart === 'spend' ? '#EF4444' : 
                        activeChart === 'invested' ? '#3B82F6' : '#22C55E' 
                }]}>
                  ₹{activeChart === 'spend' ? '1.2L' : activeChart === 'invested' ? '64.5K' : '68.1K'}
                </Text>
                <Text style={[styles.summaryBudget, { color: colors.textSecondary }]}>
                  {activeChart === 'spend' ? '/ ₹91.0K' : ''}
                </Text>
                <Ionicons name="pencil" size={12} color={colors.textSecondary} />
              </View>
              <Text style={[styles.summaryChange, { 
                color: activeChart === 'income' ? '#22C55E' : '#EF4444' 
              }]}>
                {activeChart === 'income' ? '↗ 7.0% increase' : '↘ 7.7% decrease'} from last month
              </Text>
            </View>
            <View style={styles.summaryRight}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Last month</Text>
              <Text style={[styles.lastMonthAmount, { color: colors.text }]}>
                ₹{activeChart === 'spend' ? '1.1L' : activeChart === 'invested' ? '68.6K' : '63.6K'}
              </Text>
            </View>
          </View>

          {/* Interactive Chart */}
          <View style={styles.chartContainer}>
            <CustomChart />
            
            {/* Tooltip */}
            {selectedDataPoint !== null && (
              <View style={[
                styles.tooltip,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  left: Math.min(Math.max(tooltipPosition.x - 50, 10), screenWidth - 120),
                  top: tooltipPosition.y - 80,
                }
              ]}>
                <Text style={[styles.tooltipTitle, { color: colors.text }]}>
                  {chartPeriod === 'daily' ? `Day ${getCurrentChartData()[selectedDataPoint].date}` : getCurrentChartData()[selectedDataPoint].date}
                </Text>
                <Text style={[styles.tooltipAmount, { 
                  color: activeChart === 'spend' ? '#EF4444' : 
                        activeChart === 'invested' ? '#3B82F6' : '#22C55E' 
                }]}>
                  Amount: ₹{chartPeriod === 'daily' 
                    ? (getCurrentChartData()[selectedDataPoint][activeChart] / 1000).toFixed(1) + 'K'
                    : (getCurrentChartData()[selectedDataPoint][activeChart] / 1000).toFixed(0) + 'K'
                  }
                </Text>
                {activeChart === 'spend' && chartPeriod === 'daily' && (
                  <Text style={[styles.tooltipBudget, { color: colors.textSecondary }]}>
                    Budget: ₹3.0K
                  </Text>
                )}
                {selectedBank && (
                  <Text style={[styles.tooltipBank, { color: colors.textSecondary }]}>
                    Bank: {selectedBank}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Chart Period Toggle */}
          <View style={styles.periodToggle}>
            <TouchableOpacity 
              style={[
                styles.periodButton, 
                chartPeriod === 'daily' && { backgroundColor: colors.text }
              ]}
              onPress={() => setChartPeriod('daily')}
            >
              <Text style={[
                styles.periodButtonText, 
                { color: chartPeriod === 'daily' ? colors.background : colors.textSecondary }
              ]}>
                Daily
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.periodButton,
                chartPeriod === 'monthly' && { backgroundColor: colors.text }
              ]}
              onPress={() => setChartPeriod('monthly')}
            >
              <Text style={[
                styles.periodButtonText, 
                { color: chartPeriod === 'monthly' ? colors.background : colors.textSecondary }
              ]}>
                Monthly
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  fullNavContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  fullNavButtonGroup: {
    flexDirection: 'row',
    borderRadius: 25,
    padding: 4,
  },
  fullNavButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  activeFullNav: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fullNavText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filtersScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  combinedCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  balanceTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  balanceTimeText: {
    fontSize: 12,
  },
  chartPreview: {
    alignItems: 'center',
  },
  chartRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartSegment: {
    height: 4,
    borderRadius: 2,
    marginVertical: 1,
  },
  accountCount: {
    fontSize: 12,
  },
  distributionCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
  },
  distributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  distributionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  distributionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  donutContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  donutChart: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F59E0B',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutSegment: {
    position: 'absolute',
    width: '100%',
    borderRadius: 100,
  },
  donutCenter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutCenterAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  donutCenterLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  accountsList: {
    marginTop: 20,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  accountIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountBalance: {
    fontSize: 14,
  },
  accountIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  accountIconItem: {
    alignItems: 'center',
    flex: 1,
  },
  accountIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  accountIconBalance: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountIconName: {
    fontSize: 12,
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  monthCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  chartTypeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  chartTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  chartTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  monthSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryLeft: {
    flex: 1,
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  summaryBudget: {
    fontSize: 16,
  },
  summaryChange: {
    fontSize: 14,
    fontWeight: '500',
  },
  lastMonthAmount: {
    fontSize: 20,
    fontWeight: '600',
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 20,
  },
  customChart: {
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
    left: 40,
    right: 40,
    height: 1,
    opacity: 0.3,
  },
  chartContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  chartLine: {
    height: 3,
    borderRadius: 1.5,
    transformOrigin: '0 50%',
  },
  dataPoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  xAxisLabels: {
    position: 'absolute',
    bottom: 10,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  yAxisLabels: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 35,
  },
  axisLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tooltipTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  tooltipAmount: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  tooltipBudget: {
    fontSize: 12,
  },
  tooltipBank: {
    fontSize: 12,
    fontWeight: '500',
  },
  periodToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MobileAccounts;
