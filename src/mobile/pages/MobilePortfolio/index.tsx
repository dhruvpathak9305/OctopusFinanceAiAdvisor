/**
 * Professional Portfolio Screen - Enterprise Finance UI
 * Design Principles: Trust, Clarity, Data Density, Professional Aesthetics
 * Psychology: Reduce anxiety, increase confidence, enable quick decisions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../../contexts/ThemeContext';
import { usePortfolio } from '../../../../hooks/usePortfolio';
import { useMarketData } from '../../../../hooks/useMarketData';
import { useIPO } from '../../../../hooks/useIPO';
import { StockMarketService } from '../../../../services/stockMarketService';
import AddHoldingModal from './AddHoldingModal';
import ImportCSVModal from './ImportCSVModal';

const { width } = Dimensions.get('window');

export default function EnhancedPortfolioUI() {
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();
  const {
    portfolios,
    currentPortfolio,
    summary,
    holdings,
    assetAllocation,
    topPerformers,
    loading,
    refreshing,
    refreshPrices,
    refreshData,
  } = usePortfolio();

  const stockSymbols = holdings
    .filter(h => h.asset_type === 'stock')
    .map(h => h.symbol);
    
  const { marketStatus } = useMarketData(stockSymbols, stockSymbols.length > 0);
  const { upcomingIPOs } = useIPO();

  const [selectedTab, setSelectedTab] = useState<'overview' | 'holdings' | 'ipos'>('overview');
  const [showAddHolding, setShowAddHolding] = useState(false);
  const [showImportCSV, setShowImportCSV] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'year'>('week');

  // Vibrant Professional Finance UI - Energy + Trust
  const colors = {
    // Backgrounds - Rich but not dark
    background: isDark ? '#0F1419' : '#F5F7FA',
    backgroundSecondary: isDark ? '#1A1F2E' : '#FFFFFF',
    
    // Cards - Elevated with subtle gradients
    card: isDark ? '#1A1F2E' : '#FFFFFF',
    cardElevated: isDark ? '#242936' : '#FFFFFF',
    cardBorder: isDark ? 'rgba(16, 185, 129, 0.15)' : '#E5E7EB',
    
    // Text - Bright and clear
    text: isDark ? '#F9FAFB' : '#111827',
    textPrimary: isDark ? '#FFFFFF' : '#0F172A',
    textSecondary: isDark ? '#B4B9C5' : '#6B7280',
    textTertiary: isDark ? '#8B92A3' : '#9CA3AF',
    textMuted: isDark ? '#6B7280' : '#D1D5DB',
    
    // Primary - Vibrant Emerald (Robinhood-inspired)
    primary: '#00D09C',
    primaryLight: '#34D399',
    primaryDark: '#00B88A',
    primaryGlow: isDark ? 'rgba(0, 208, 156, 0.2)' : 'rgba(0, 208, 156, 0.1)',
    
    // Financial colors - High contrast
    success: '#00D09C',
    successBg: isDark ? 'rgba(0, 208, 156, 0.15)' : 'rgba(0, 208, 156, 0.1)',
    successBorder: isDark ? 'rgba(0, 208, 156, 0.3)' : 'rgba(0, 208, 156, 0.25)',
    
    error: '#FF4757',
    errorBg: isDark ? 'rgba(255, 71, 87, 0.15)' : 'rgba(255, 71, 87, 0.1)',
    errorBorder: isDark ? 'rgba(255, 71, 87, 0.3)' : 'rgba(255, 71, 87, 0.25)',
    
    warning: '#FFA502',
    warningBg: isDark ? 'rgba(255, 165, 2, 0.15)' : 'rgba(255, 165, 2, 0.1)',
    
    info: '#5F81E7',
    infoBg: isDark ? 'rgba(95, 129, 231, 0.15)' : 'rgba(95, 129, 231, 0.1)',
    
    purple: '#8B5CF6',
    purpleBg: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
    
    // UI elements - Subtle accents
    border: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB',
    borderLight: isDark ? 'rgba(255, 255, 255, 0.12)' : '#D1D5DB',
    divider: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F3F4F6',
    
    // Interactive - Vibrant but tasteful
    interactive: '#5F81E7',
    interactiveHover: '#4C6DD9',
    
    // Shadows & glows
    shadow: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.1)',
    glow: isDark ? 'rgba(0, 208, 156, 0.15)' : 'rgba(0, 208, 156, 0.1)',
    
    // Glass morphism - More visible
    glass: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.9)',
    glassBorder: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
  };

  // Generate mock chart data based on period
  const getChartData = () => {
    const totalValue = summary?.current_value || 0;
    const baseValue = totalValue || 50000;
    
    if (chartPeriod === 'week') {
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [
          baseValue * 0.95,
          baseValue * 0.97,
          baseValue * 0.96,
          baseValue * 0.99,
          baseValue * 0.98,
          baseValue * 1.00,
          baseValue,
        ],
      };
    } else if (chartPeriod === 'month') {
      return {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        data: [
          baseValue * 0.90,
          baseValue * 0.95,
          baseValue * 0.97,
          baseValue,
        ],
      };
    } else {
      return {
        labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
        data: [
          baseValue * 0.70,
          baseValue * 0.80,
          baseValue * 0.85,
          baseValue * 0.90,
          baseValue * 0.95,
          baseValue,
        ],
      };
    }
  };

  // Removed - Market status now integrated into portfolio card

  // World-Class Portfolio Card - Psychology + UX Optimized
  const renderPortfolioValue = () => {
    const totalValue = summary?.current_value || 0;
    const totalGain = summary?.total_gain || 0;
    const totalGainPct = summary?.total_gain_pct || 0;
    const totalInvested = summary?.total_invested || 0;
    const isPositive = totalGain >= 0;
    const chartData = getChartData();
    const dayPL = totalGain * 0.1; // Mock day's P&L
    
    // Psychology: Benchmark comparison
    const niftyChange = 2.3; // Mock Nifty 50 change
    const vsNifty = totalGainPct - niftyChange;
    const beatingMarket = vsNifty > 0;
    
    // Psychology: Portfolio health score
    const healthScore = Math.min(100, Math.max(0, 70 + (isPositive ? 20 : -10)));
    const healthColor = healthScore >= 70 ? colors.success : healthScore >= 40 ? colors.warning : colors.error;
    
    // Context: Holdings count
    const holdingsCount = holdings.length || 0;

    return (
      <View style={styles(colors).valueCardWrapper}>
        <LinearGradient
          colors={[
            isPositive 
              ? 'rgba(0, 208, 156, 0.08)' 
              : 'rgba(255, 71, 87, 0.08)',
            colors.card,
            colors.card,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles(colors).valueCardGradient}
        >
          {/* Subtle Glow Effect */}
          {isPositive && totalValue > 0 && (
            <View style={styles(colors).glowEffect} />
          )}
          
          <View style={styles(colors).valueCardContent}>
            {/* Enhanced Header with Context */}
            <View style={styles(colors).cardHeaderNew}>
          <View style={styles(colors).headerTop}>
            <View style={styles(colors).headerLeft}>
              <Text style={styles(colors).metricLabelNew}>Total Value</Text>
              {/* Holdings Count Badge */}
              <View style={styles(colors).holdingsCountBadge}>
                <Text style={styles(colors).holdingsCountText}>{holdingsCount} holdings</Text>
              </View>
            </View>
            
            {/* Market Status + Health Score */}
            <View style={styles(colors).headerRight}>
              <View style={styles(colors).marketStatusBadge}>
                <View style={[
                  styles(colors).marketDot,
                  { backgroundColor: marketStatus?.isOpen ? colors.success : colors.textMuted }
                ]} />
                <Text style={styles(colors).marketStatusText}>
                  {marketStatus?.isOpen ? 'LIVE' : 'CLOSED'}
                </Text>
              </View>
              
              {/* Portfolio Health Score with Label */}
              <View style={styles(colors).healthScoreContainer}>
                <Text style={styles(colors).healthScoreLabel}>Health</Text>
                <View style={[styles(colors).healthScoreBadge, { borderColor: healthColor }]}>
                  <Text style={[styles(colors).healthScoreText, { color: healthColor }]}>
                    {healthScore}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Large Value with Animated Glow */}
          <View style={styles(colors).valueRow}>
            <Text style={styles(colors).metricValueXL}>
              {StockMarketService.formatINR(totalValue)}
            </Text>
            {isPositive && totalValue > 0 && (
              <View style={styles(colors).trendArrowUp}>
                <Text style={styles(colors).trendArrowText}>↗</Text>
              </View>
            )}
          </View>
        </View>

        {/* Progress Bar: Invested vs Current */}
        <View style={styles(colors).progressSection}>
          <View style={styles(colors).progressBar}>
            <View 
              style={[
                styles(colors).progressFill,
                { 
                  width: `${Math.min(100, (totalValue / Math.max(totalInvested, 1)) * 100)}%`,
                  backgroundColor: isPositive ? colors.success : colors.error,
                }
              ]} 
            />
          </View>
          <View style={styles(colors).progressLabels}>
            <Text style={styles(colors).progressLabel}>
              Invested: {StockMarketService.formatINR(totalInvested)}
            </Text>
            <Text style={[styles(colors).progressLabel, { color: isPositive ? colors.success : colors.error }]}>
              Current: {StockMarketService.formatINR(totalValue)}
            </Text>
          </View>
        </View>

        {/* Beautiful Period Selector */}
        <View style={styles(colors).periodSelectorNew}>
          {(['week', 'month', 'year'] as const).map((period) => {
            const isActive = chartPeriod === period;
            return (
              <TouchableOpacity
                key={period}
                style={[
                  styles(colors).periodButtonNew,
                  isActive && styles(colors).periodButtonActiveNew,
                ]}
                onPress={() => setChartPeriod(period)}
                activeOpacity={0.8}
              >
                {isActive && (
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles(colors).periodGradient}
                  />
                )}
                <Text style={[
                  styles(colors).periodTextNew,
                  isActive && styles(colors).periodTextActiveNew,
                ]}>
                  {period === 'week' ? '1W' : period === 'month' ? '1M' : '1Y'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Professional Chart */}
        <View style={styles(colors).chartContainer}>
          <LineChart
            data={{
              labels: chartData.labels,
              datasets: [{ data: chartData.data }],
            }}
            width={width - 64}
            height={150}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              decimalPlaces: 0,
              color: (opacity = 1) => isPositive 
                ? `rgba(16, 185, 129, ${opacity})`
                : `rgba(239, 68, 68, ${opacity})`,
              labelColor: (opacity = 1) => colors.textTertiary,
              style: { borderRadius: 0 },
              propsForDots: {
                r: '3',
                strokeWidth: '2',
                stroke: isPositive ? colors.success : colors.error,
                fill: colors.card,
              },
              propsForBackgroundLines: {
                strokeWidth: 0.5,
                stroke: colors.border,
                strokeDasharray: '0',
                strokeOpacity: 0.3,
              },
            }}
            bezier
            withInnerLines={true}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            withDots={true}
            withShadow={false}
            style={{ marginVertical: 8 }}
            formatYLabel={(value) => {
              const num = parseFloat(value);
              if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
              if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
              return `${num.toFixed(0)}`;
            }}
          />
        </View>

        {/* Data Grid - Financial Metrics with Benchmark */}
        <View style={styles(colors).dataGrid}>
          <View style={styles(colors).dataCell}>
            <Text style={styles(colors).dataCellLabel}>Invested</Text>
            <Text style={styles(colors).dataCellValue}>
              {StockMarketService.formatINR(totalInvested)}
            </Text>
          </View>
          <View style={styles(colors).dataDivider} />
          <View style={styles(colors).dataCell}>
            <Text style={styles(colors).dataCellLabel}>Day's P&L</Text>
            <Text style={[
              styles(colors).dataCellValue,
              { color: dayPL >= 0 ? colors.success : colors.error }
            ]}>
              {dayPL >= 0 ? '+' : ''}{StockMarketService.formatINR(Math.abs(dayPL))}
            </Text>
          </View>
          <View style={styles(colors).dataDivider} />
          <View style={styles(colors).dataCell}>
            <Text style={styles(colors).dataCellLabel}>Returns</Text>
            <Text style={[
              styles(colors).dataCellValue,
              { color: isPositive ? colors.success : colors.error }
            ]}>
              {isPositive ? '+' : ''}{totalGainPct.toFixed(2)}%
            </Text>
          </View>
          <View style={styles(colors).dataDivider} />
          <View style={styles(colors).dataCell}>
            <Text style={styles(colors).dataCellLabel}>vs NIFTY</Text>
            <Text style={[
              styles(colors).dataCellValue,
              { color: beatingMarket ? colors.success : colors.error }
            ]}>
              {beatingMarket ? '+' : ''}{vsNifty.toFixed(1)}%
            </Text>
          </View>
        </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  // Market Movers - Top Gainers & Losers
  const renderMarketMovers = () => {
    // Mock data - replace with real API data
    const gainers = [
      { symbol: 'RELIANCE', name: 'Reliance Ind.', change: 5.2, price: 2450 },
      { symbol: 'TCS', name: 'Tata Consultancy', change: 3.8, price: 3580 },
      { symbol: 'INFY', name: 'Infosys', change: 2.9, price: 1520 },
    ];
    const losers = [
      { symbol: 'HDFC', name: 'HDFC Bank', change: -2.4, price: 1680 },
      { symbol: 'ICICI', name: 'ICICI Bank', change: -1.8, price: 950 },
      { symbol: 'BAJAJ', name: 'Bajaj Finance', change: -1.5, price: 7200 },
    ];

    return (
      <View style={styles(colors).marketMoversContainer}>
        <Text style={styles(colors).sectionTitle}>Market Movers Today</Text>
        
        <View style={styles(colors).moversGrid}>
          {/* Gainers Column */}
          <View style={styles(colors).moverColumn}>
            <View style={styles(colors).moverHeader}>
              <Text style={styles(colors).moverHeaderText}>▲ Top Gainers</Text>
            </View>
            {gainers.map((stock, index) => (
              <TouchableOpacity key={index} style={styles(colors).moverCard} activeOpacity={0.8}>
                <View style={styles(colors).moverInfo}>
                  <Text style={styles(colors).moverSymbol}>{stock.symbol}</Text>
                  <Text style={styles(colors).moverName}>{stock.name}</Text>
                </View>
                <View style={styles(colors).moverStats}>
                  <Text style={[styles(colors).moverChange, { color: colors.success }]}>
                    +{stock.change}%
                  </Text>
                  <Text style={styles(colors).moverPrice}>₹{stock.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Losers Column */}
          <View style={styles(colors).moverColumn}>
            <View style={styles(colors).moverHeader}>
              <Text style={styles(colors).moverHeaderText}>▼ Top Losers</Text>
            </View>
            {losers.map((stock, index) => (
              <TouchableOpacity key={index} style={styles(colors).moverCard} activeOpacity={0.8}>
                <View style={styles(colors).moverInfo}>
                  <Text style={styles(colors).moverSymbol}>{stock.symbol}</Text>
                  <Text style={styles(colors).moverName}>{stock.name}</Text>
                </View>
                <View style={styles(colors).moverStats}>
                  <Text style={[styles(colors).moverChange, { color: colors.error }]}>
                    {stock.change}%
                  </Text>
                  <Text style={styles(colors).moverPrice}>₹{stock.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  // Upcoming IPOs
  const renderIPOs = () => {
    // Mock data
    const ipos = [
      { name: 'ABC Technologies', date: 'Dec 18-20', priceRange: '₹250-270', lot: 50 },
      { name: 'XYZ Pharma', date: 'Dec 22-24', priceRange: '₹180-200', lot: 75 },
    ];

    return (
      <View style={styles(colors).ipoContainer}>
        <View style={styles(colors).sectionHeaderRow}>
          <Text style={styles(colors).sectionTitle}>Upcoming IPOs</Text>
          <TouchableOpacity>
            <Text style={styles(colors).viewAllLink}>View All →</Text>
          </TouchableOpacity>
        </View>

        {ipos.map((ipo, index) => (
          <TouchableOpacity key={index} style={styles(colors).ipoCard} activeOpacity={0.8}>
            <View style={styles(colors).ipoLeft}>
              <Text style={styles(colors).ipoName}>{ipo.name}</Text>
              <Text style={styles(colors).ipoDate}>{ipo.date}</Text>
            </View>
            <View style={styles(colors).ipoRight}>
              <Text style={styles(colors).ipoPriceRange}>{ipo.priceRange}</Text>
              <Text style={styles(colors).ipoLot}>Lot: {ipo.lot}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // AI Insights
  const renderAIInsights = () => {
    // Mock insights
    const insights = [
      { 
        icon: '💡', 
        title: 'Portfolio Diversification', 
        message: 'Consider adding international exposure for better risk management',
        type: 'suggestion'
      },
      { 
        icon: '⚠️', 
        title: 'Market Alert', 
        message: 'High volatility expected this week due to policy announcements',
        type: 'warning'
      },
      { 
        icon: '✨', 
        title: 'Opportunity', 
        message: 'IT sector showing strong momentum, might be good entry point',
        type: 'opportunity'
      },
    ];

    return (
      <View style={styles(colors).aiInsightsContainer}>
        <View style={styles(colors).sectionHeaderRow}>
          <Text style={styles(colors).sectionTitle}>AI Insights</Text>
          <View style={styles(colors).aiPoweredBadge}>
            <Text style={styles(colors).aiPoweredText}>AI</Text>
          </View>
        </View>

        {insights.map((insight, index) => (
          <TouchableOpacity key={index} style={styles(colors).insightCard} activeOpacity={0.8}>
            <View style={styles(colors).insightIcon}>
              <Text style={styles(colors).insightEmoji}>{insight.icon}</Text>
            </View>
            <View style={styles(colors).insightContent}>
              <Text style={styles(colors).insightTitle}>{insight.title}</Text>
              <Text style={styles(colors).insightMessage}>{insight.message}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Professional Action Grid
  const renderQuickActions = () => (
    <View style={styles(colors).actionsContainer}>
      <View style={styles(colors).sectionHeader}>
        <Text style={styles(colors).sectionTitle}>Actions</Text>
      </View>
      
      <View style={styles(colors).actionsGrid}>
        {/* Add Holding */}
        <TouchableOpacity 
          style={styles(colors).actionButton}
          onPress={() => setShowAddHolding(true)}
          activeOpacity={0.8}
        >
          <View style={[styles(colors).actionIconBox, { backgroundColor: colors.successBg }]}>
            <Text style={[styles(colors).actionIcon, { color: colors.success }]}>+</Text>
          </View>
          <Text style={styles(colors).actionLabel}>Add Holding</Text>
        </TouchableOpacity>

        {/* Browse Market */}
        <TouchableOpacity 
          style={styles(colors).actionButton}
          onPress={() => navigation.navigate('MobileStockBrowser')}
          activeOpacity={0.8}
        >
          <View style={[styles(colors).actionIconBox, { backgroundColor: colors.infoBg }]}>
            <Text style={[styles(colors).actionIcon, { color: colors.info }]}>⊞</Text>
          </View>
          <Text style={styles(colors).actionLabel}>Browse</Text>
        </TouchableOpacity>

        {/* Import CSV */}
        <TouchableOpacity 
          style={styles(colors).actionButton}
          onPress={() => setShowImportCSV(true)}
          activeOpacity={0.8}
        >
          <View style={[styles(colors).actionIconBox, { backgroundColor: colors.warningBg }]}>
            <Text style={[styles(colors).actionIcon, { color: colors.warning }]}>↥</Text>
          </View>
          <Text style={styles(colors).actionLabel}>Import</Text>
        </TouchableOpacity>

        {/* Analytics */}
        <TouchableOpacity 
          style={styles(colors).actionButton}
          activeOpacity={0.8}
        >
          <View style={[styles(colors).actionIconBox, { backgroundColor: colors.glass }]}>
            <Text style={[styles(colors).actionIcon, { color: colors.textSecondary }]}>⊟</Text>
          </View>
          <Text style={styles(colors).actionLabel}>Analytics</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Holdings List (Inspired by Kuvera)
  const renderHoldings = () => (
    <View style={styles(colors).holdingsContainer}>
      <View style={styles(colors).sectionHeader}>
        <Text style={styles(colors).sectionTitle}>Your Holdings</Text>
        <TouchableOpacity>
          <Text style={styles(colors).viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      {holdings.length === 0 ? (
        <View style={styles(colors).emptyState}>
          <Text style={styles(colors).emptyIcon}>📊</Text>
          <Text style={styles(colors).emptyTitle}>No holdings yet</Text>
          <Text style={styles(colors).emptySubtext}>
            Start building your portfolio by adding stocks or mutual funds
          </Text>
          <TouchableOpacity 
            style={styles(colors).emptyButton}
            onPress={() => setShowAddHolding(true)}
          >
            <Text style={styles(colors).emptyButtonText}>+ Add First Holding</Text>
          </TouchableOpacity>
        </View>
      ) : (
        holdings.slice(0, 5).map((holding, index) => {
          const isPositive = holding.unrealized_gain >= 0;
          return (
            <TouchableOpacity key={holding.id} style={styles(colors).holdingCard}>
              <View style={styles(colors).holdingHeader}>
                <View style={styles(colors).holdingInfo}>
                  <Text style={styles(colors).holdingName}>{holding.asset_name}</Text>
                  <View style={styles(colors).holdingMeta}>
                    <Text style={styles(colors).holdingSymbol}>{holding.symbol}</Text>
                    <View style={styles(colors).holdingDot} />
                    <Text style={styles(colors).holdingType}>{holding.quantity} shares</Text>
                  </View>
                </View>
                <View style={styles(colors).holdingValues}>
                  <Text style={styles(colors).holdingValue}>
                    {StockMarketService.formatINR(holding.current_value)}
                  </Text>
                  <View style={[
                    styles(colors).holdingGainBadge,
                    { backgroundColor: isPositive ? colors.successBg : colors.errorBg }
                  ]}>
                    <Text style={[
                      styles(colors).holdingGainText,
                      { color: isPositive ? colors.success : colors.error }
                    ]}>
                      {isPositive ? '+' : ''}{holding.unrealized_gain_pct.toFixed(2)}%
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );

  // Render Asset Allocation (Inspired by INDMoney)
  const renderAssetAllocation = () => {
    if (assetAllocation.length === 0) return null;

    return (
      <View style={styles(colors).allocationContainer}>
        <Text style={styles(colors).sectionTitle}>Asset Allocation</Text>
        
        <View style={styles(colors).allocationGrid}>
          {assetAllocation.map((asset, index) => {
            const colors_map: any = {
              stock: colors.primary,
              mutual_fund: colors.accent,
              etf: colors.warning,
              bond: colors.error,
            };
            const assetColor = colors_map[asset.asset_type] || colors.primary;

            return (
              <View key={index} style={styles(colors).allocationCard}>
                <View style={[styles(colors).allocationColorBar, { backgroundColor: assetColor }]} />
                <View style={styles(colors).allocationContent}>
                  <Text style={styles(colors).allocationLabel}>
                    {asset.asset_type.charAt(0).toUpperCase() + asset.asset_type.slice(1).replace('_', ' ')}
                  </Text>
                  <Text style={styles(colors).allocationPercent}>
                    {asset.allocation_pct.toFixed(1)}%
                  </Text>
                  <Text style={styles(colors).allocationValue}>
                    {StockMarketService.formatINR(asset.total_value)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles(colors).container}>
      <ScrollView
        style={styles(colors).scrollView}
        contentContainerStyle={styles(colors).scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={refreshData}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderPortfolioValue()}
        {renderQuickActions()}
        {renderMarketMovers()}
        {renderAIInsights()}
        {renderIPOs()}
        {renderAssetAllocation()}
        {renderHoldings()}
      </ScrollView>

      {/* Modals */}
      <AddHoldingModal
        visible={showAddHolding}
        onClose={() => setShowAddHolding(false)}
        portfolioId={currentPortfolio?.id || ''}
        onSuccess={refreshData}
      />
      <ImportCSVModal
        visible={showImportCSV}
        onClose={() => setShowImportCSV(false)}
        portfolioId={currentPortfolio?.id || ''}
        onSuccess={refreshData}
      />
    </View>
  );
}

const styles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },
    // Beautiful Market Status Badge
    marketStatusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.glass,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      gap: 6,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 3,
    },
    marketDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    marketStatusText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: 0.5,
    },
    // Beautiful Enhanced Portfolio Card
    valueCardWrapper: {
      borderRadius: 24,
      marginBottom: 20,
      overflow: 'hidden',
      shadowColor: colors.success,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 30,
      elevation: 8,
    },
    valueCardGradient: {
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      overflow: 'hidden',
    },
    glowEffect: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 120,
      backgroundColor: colors.primaryGlow,
      opacity: 0.3,
      borderRadius: 24,
    },
    valueCardContent: {
      padding: 24,
      backgroundColor: 'transparent',
    },
    // Enhanced Header
    cardHeaderNew: {
      marginBottom: 20,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    headerLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    metricLabelNew: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    holdingsCountBadge: {
      backgroundColor: colors.glass,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    holdingsCountText: {
      fontSize: 9,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: 0.3,
    },
    healthScoreContainer: {
      alignItems: 'flex-end',
      gap: 4,
    },
    healthScoreLabel: {
      fontSize: 9,
      fontWeight: '600',
      color: colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    healthScoreBadge: {
      backgroundColor: colors.backgroundSecondary,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 24,
      borderWidth: 2,
      minWidth: 48,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    healthScoreText: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    metricValueXL: {
      fontSize: 48,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -2,
      lineHeight: 56,
    },
    trendArrowUp: {
      backgroundColor: colors.successBg,
      borderWidth: 1.5,
      borderColor: colors.successBorder,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    trendArrowText: {
      fontSize: 16,
      color: colors.success,
    },
    // Performance Row
    performanceRow: {
      marginBottom: 20,
    },
    changeBadgeLarge: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1.5,
      gap: 4,
      alignSelf: 'flex-start',
    },
    changeAmountText: {
      fontSize: 18,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
    changePercentText: {
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    // Beautiful Progress Bar
    progressSection: {
      marginBottom: 20,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 20,
      overflow: 'hidden',
      marginBottom: 10,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    progressFill: {
      height: '100%',
      borderRadius: 20,
      shadowColor: colors.success,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
    },
    progressLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    progressLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    // Beautiful Period Selector with Gradient
    periodSelectorNew: {
      flexDirection: 'row',
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 12,
      padding: 4,
      marginBottom: 16,
      gap: 6,
    },
    periodButtonNew: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 10,
      overflow: 'hidden',
    },
    periodButtonActiveNew: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
    },
    periodGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    periodTextNew: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
      zIndex: 1,
    },
    periodTextActiveNew: {
      color: '#FFFFFF',
    },
    chartContainer: {
      marginBottom: 20,
      alignItems: 'center',
    },
    // Data Grid
    dataGrid: {
      flexDirection: 'row',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    dataCell: {
      flex: 1,
      alignItems: 'center',
    },
    dataCellLabel: {
      fontSize: 10,
      fontWeight: '500',
      color: colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    dataCellValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    dataDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginHorizontal: 12,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginHorizontal: 16,
    },
    // Professional Action Grid
    actionsContainer: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    actionsGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      paddingVertical: 16,
      paddingHorizontal: 12,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 1,
    },
    actionIconBox: {
      width: 44,
      height: 44,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    actionIcon: {
      fontSize: 22,
      fontWeight: '600',
    },
    actionLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    // Holdings
    holdingsContainer: {
      marginBottom: 24,
    },
    viewAllText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    holdingCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    holdingHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    holdingInfo: {
      flex: 1,
    },
    holdingName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
    },
    holdingMeta: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    holdingSymbol: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    holdingDot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: colors.textTertiary,
      marginHorizontal: 8,
    },
    holdingType: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    holdingValues: {
      alignItems: 'flex-end',
    },
    holdingValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
    },
    holdingGainBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    holdingGainText: {
      fontSize: 13,
      fontWeight: '700',
    },
    // Asset Allocation
    allocationContainer: {
      marginBottom: 24,
    },
    allocationGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    allocationCard: {
      width: (width - 44) / 2,
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    allocationColorBar: {
      height: 4,
      width: '100%',
    },
    allocationContent: {
      padding: 16,
    },
    allocationLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    allocationPercent: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    allocationValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    // Empty State
    emptyState: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 32,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 20,
    },
    emptyButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    emptyButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    // Market Movers Section
    marketMoversContainer: {
      marginBottom: 24,
    },
    moversGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    moverColumn: {
      flex: 1,
    },
    moverHeader: {
      backgroundColor: colors.glass,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.glassBorder,
    },
    moverHeaderText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    moverCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      marginBottom: 8,
    },
    moverInfo: {
      marginBottom: 6,
    },
    moverSymbol: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 2,
    },
    moverName: {
      fontSize: 10,
      fontWeight: '500',
      color: colors.textTertiary,
    },
    moverStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    moverChange: {
      fontSize: 14,
      fontWeight: '700',
    },
    moverPrice: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    // IPO Section
    ipoContainer: {
      marginBottom: 24,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    viewAllLink: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
    },
    ipoCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    ipoLeft: {
      flex: 1,
    },
    ipoName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    ipoDate: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textTertiary,
    },
    ipoRight: {
      alignItems: 'flex-end',
    },
    ipoPriceRange: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 4,
    },
    ipoLot: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    // AI Insights Section
    aiInsightsContainer: {
      marginBottom: 24,
    },
    aiPoweredBadge: {
      backgroundColor: colors.purpleBg,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.purple + '30',
    },
    aiPoweredText: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.purple,
      letterSpacing: 1,
    },
    insightCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      padding: 14,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    insightIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.glass,
      justifyContent: 'center',
      alignItems: 'center',
    },
    insightEmoji: {
      fontSize: 22,
    },
    insightContent: {
      flex: 1,
    },
    insightTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    insightMessage: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
      lineHeight: 18,
    },
  });

