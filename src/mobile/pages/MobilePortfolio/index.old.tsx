/**
 * Enhanced Portfolio Screen
 * Complete investment tracking with stocks, mutual funds, ETFs, and IPOs
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../../contexts/ThemeContext';
import { usePortfolio } from '../../../../hooks/usePortfolio';
import { useMarketData } from '../../../../hooks/useMarketData';
import { useIPO } from '../../../../hooks/useIPO';
import { StockMarketService } from '../../../../services/stockMarketService';
import AddHoldingModal from './AddHoldingModal';
import ImportCSVModal from './ImportCSVModal';

const { width } = Dimensions.get('window');

export default function EnhancedMobilePortfolio() {
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();
  const {
    portfolios,
    currentPortfolio,
    summary,
    holdings,
    assetAllocation,
    sectorAllocation,
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

  // Theme colors
  const colors = {
    background: isDark ? '#0B1426' : '#FFFFFF',
    card: isDark ? '#1F2937' : '#F9FAFB',
    cardBorder: isDark ? '#374151' : '#E5E7EB',
    text: isDark ? '#FFFFFF' : '#111827',
    textSecondary: isDark ? '#9CA3AF' : '#6B7280',
    primary: '#10B981',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 16,
    },
    // Market Status Banner
    marketBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    marketStatusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 8,
    },
    marketStatusText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    // Portfolio Summary Card
    summaryCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    summaryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    portfolioName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    portfolioValue: {
      fontSize: 36,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 4,
    },
    portfolioLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
    },
    summaryStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statItem: {
      flex: 1,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    // Quick Actions
    quickActions: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    actionButton: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
    },
    actionButtonSecondary: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '600',
    },
    actionButtonTextSecondary: {
      color: colors.text,
    },
    importButton: {
      backgroundColor: colors.card,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary,
      alignItems: 'center',
      marginTop: 12,
    },
    importButtonText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: '600',
    },
    // Tabs
    tabsContainer: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 4,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 8,
    },
    tabActive: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    tabTextActive: {
      color: '#FFFFFF',
    },
    // Section Header
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    viewAllText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    // Asset Allocation
    allocationContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    allocationGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    allocationItem: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: isDark ? '#374151' : '#F3F4F6',
      padding: 12,
      borderRadius: 8,
    },
    allocationLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    allocationValue: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primary,
    },
    // Holdings List
    holdingCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    holdingHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    holdingName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    holdingSymbol: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    holdingStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.cardBorder,
    },
    holdingStatItem: {
      flex: 1,
    },
    holdingStatLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    holdingStatValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    gainValue: {
      fontSize: 14,
      fontWeight: '700',
    },
    positiveGain: {
      color: colors.success,
    },
    negativeGain: {
      color: colors.error,
    },
    // IPO Card
    ipoCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    ipoName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    ipoDate: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    ipoDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    ipoDetailItem: {
      flex: 1,
    },
    ipoDetailLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    ipoDetailValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    applyButton: {
      backgroundColor: colors.primary,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    applyButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    // Empty State
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    emptyStateText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 12,
    },
  });

  // Render Market Status Banner
  const renderMarketBanner = () => (
    <View style={styles.marketBanner}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={[
            styles.marketStatusDot,
            {
              backgroundColor: marketStatus?.isOpen ? colors.success : colors.error,
            },
          ]}
        />
        <Text style={styles.marketStatusText}>
          {marketStatus?.message || 'Market Status Unknown'}
        </Text>
      </View>
      <TouchableOpacity onPress={refreshPrices}>
        <Text style={{ color: colors.primary, fontWeight: '600' }}>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render Portfolio Summary
  const renderSummary = () => (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <Text style={styles.portfolioName}>
          {currentPortfolio?.name || 'Portfolio'}
        </Text>
      </View>

      <Text style={styles.portfolioValue}>
        {StockMarketService.formatINR(summary?.current_value || 0)}
      </Text>
      <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>

      <View style={styles.summaryStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Invested</Text>
          <Text style={styles.statValue}>
            {StockMarketService.formatINR(summary?.total_invested || 0)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Gain</Text>
          <Text style={[
            styles.statValue,
            { color: (summary?.total_gain || 0) >= 0 ? colors.success : colors.error }
          ]}>
            {StockMarketService.formatINR(summary?.total_gain || 0)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Returns</Text>
          <Text style={[
            styles.statValue,
            { color: (summary?.total_gain_pct || 0) >= 0 ? colors.success : colors.error }
          ]}>
            {StockMarketService.formatPercent(summary?.total_gain_pct || 0)}
          </Text>
        </View>
      </View>
    </View>
  );

  // Render Quick Actions
  const renderQuickActions = () => (
    <>
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowAddHolding(true)}
        >
          <Text style={styles.actionButtonText}>+ Add Holding</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={() => navigation.navigate('MobileStockBrowser')}
        >
          <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
            Browse Stocks
          </Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.importButton}
        onPress={() => setShowImportCSV(true)}
      >
        <Text style={styles.importButtonText}>📄 Import from CSV</Text>
      </TouchableOpacity>
    </>
  );

  // Render Tabs
  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'overview' && styles.tabActive]}
        onPress={() => setSelectedTab('overview')}
      >
        <Text style={[styles.tabText, selectedTab === 'overview' && styles.tabTextActive]}>
          Overview
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'holdings' && styles.tabActive]}
        onPress={() => setSelectedTab('holdings')}
      >
        <Text style={[styles.tabText, selectedTab === 'holdings' && styles.tabTextActive]}>
          Holdings
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'ipos' && styles.tabActive]}
        onPress={() => setSelectedTab('ipos')}
      >
        <Text style={[styles.tabText, selectedTab === 'ipos' && styles.tabTextActive]}>
          IPOs
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render Asset Allocation
  const renderAssetAllocation = () => (
    <View style={styles.allocationContainer}>
      <Text style={styles.sectionTitle}>Asset Allocation</Text>
      <View style={styles.allocationGrid}>
        {assetAllocation.map((asset, index) => (
          <View key={index} style={styles.allocationItem}>
            <Text style={styles.allocationLabel}>
              {asset.asset_type.charAt(0).toUpperCase() + asset.asset_type.slice(1)}
            </Text>
            <Text style={[styles.allocationValue, { color: asset.color }]}>
              {asset.allocation_pct.toFixed(1)}%
            </Text>
            <Text style={[styles.statLabel, { marginTop: 4 }]}>
              {StockMarketService.formatINR(asset.total_value)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  // Render Holdings List
  const renderHoldings = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Holdings ({holdings.length})</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      {holdings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No holdings yet</Text>
          <Text style={[styles.emptyStateText, { fontSize: 14, marginTop: 4 }]}>
            Add your first investment
          </Text>
        </View>
      ) : (
        holdings.slice(0, 5).map((holding) => (
          <View key={holding.id} style={styles.holdingCard}>
            <View style={styles.holdingHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.holdingName}>{holding.asset_name}</Text>
                <Text style={styles.holdingSymbol}>
                  {holding.symbol} • {holding.asset_type.toUpperCase()}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.holdingStatValue}>
                  {StockMarketService.formatINR(holding.current_value)}
                </Text>
                <Text
                  style={[
                    styles.gainValue,
                    holding.unrealized_gain >= 0 ? styles.positiveGain : styles.negativeGain,
                  ]}
                >
                  {StockMarketService.formatPercent(holding.unrealized_gain_pct)}
                </Text>
              </View>
            </View>
            <View style={styles.holdingStats}>
              <View style={styles.holdingStatItem}>
                <Text style={styles.holdingStatLabel}>Qty</Text>
                <Text style={styles.holdingStatValue}>{holding.quantity}</Text>
              </View>
              <View style={styles.holdingStatItem}>
                <Text style={styles.holdingStatLabel}>Avg Price</Text>
                <Text style={styles.holdingStatValue}>
                  ₹{holding.avg_purchase_price.toFixed(2)}
                </Text>
              </View>
              <View style={styles.holdingStatItem}>
                <Text style={styles.holdingStatLabel}>Current</Text>
                <Text style={styles.holdingStatValue}>
                  ₹{holding.current_price.toFixed(2)}
                </Text>
              </View>
              <View style={styles.holdingStatItem}>
                <Text style={styles.holdingStatLabel}>Gain/Loss</Text>
                <Text
                  style={[
                    styles.holdingStatValue,
                    { color: holding.unrealized_gain >= 0 ? colors.success : colors.error },
                  ]}
                >
                  {StockMarketService.formatINR(holding.unrealized_gain)}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );

  // Render IPOs
  const renderIPOs = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming IPOs</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      {upcomingIPOs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No upcoming IPOs</Text>
        </View>
      ) : (
        upcomingIPOs.slice(0, 3).map((ipo) => (
          <View key={ipo.id} style={styles.ipoCard}>
            <Text style={styles.ipoName}>{ipo.company_name}</Text>
            <Text style={styles.ipoDate}>
              {ipo.open_date} - {ipo.close_date}
            </Text>
            <View style={styles.ipoDetails}>
              <View style={styles.ipoDetailItem}>
                <Text style={styles.ipoDetailLabel}>Price Band</Text>
                <Text style={styles.ipoDetailValue}>
                  ₹{ipo.price_band_min} - ₹{ipo.price_band_max}
                </Text>
              </View>
              <View style={styles.ipoDetailItem}>
                <Text style={styles.ipoDetailLabel}>Lot Size</Text>
                <Text style={styles.ipoDetailValue}>{ipo.lot_size}</Text>
              </View>
              <View style={styles.ipoDetailItem}>
                <Text style={styles.ipoDetailLabel}>Min Investment</Text>
                <Text style={styles.ipoDetailValue}>
                  {StockMarketService.formatINR(ipo.min_investment || 0)}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Apply Now</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
        }
      >
        {renderMarketBanner()}
        {renderSummary()}
        {renderQuickActions()}
        {renderTabs()}
        
        {selectedTab === 'overview' && (
          <>
            {renderAssetAllocation()}
            {renderHoldings()}
          </>
        )}
        
        {selectedTab === 'holdings' && renderHoldings()}
        
        {selectedTab === 'ipos' && renderIPOs()}
      </ScrollView>

      {/* Add Holding Modal */}
      <AddHoldingModal
        visible={showAddHolding}
        onClose={() => setShowAddHolding(false)}
        portfolioId={currentPortfolio?.id || ''}
        onSuccess={refreshData}
      />

      {/* Import CSV Modal */}
      <ImportCSVModal
        visible={showImportCSV}
        onClose={() => setShowImportCSV(false)}
        portfolioId={currentPortfolio?.id || ''}
        onSuccess={refreshData}
      />
    </View>
  );
}

