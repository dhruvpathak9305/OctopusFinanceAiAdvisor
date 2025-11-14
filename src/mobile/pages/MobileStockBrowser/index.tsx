/**
 * Enhanced Stock Browser - Inspired by Groww, Paytm Money, INDMoney
 * Beautiful, modern UI with smooth animations and better visual hierarchy
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../../contexts/ThemeContext';
import { GlobalMarketService } from '../../../../services/globalMarketService';
import { MutualFundService } from '../../../../services/mutualFundService';

const { width } = Dimensions.get('window');

type AssetType = 'stocks' | 'mutualfunds';
type Market = 'indian' | 'us' | 'global';

interface StockData {
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  marketCap?: number;
  currency: string;
}

interface MFData {
  schemeCode: string;
  schemeName: string;
  fundHouse: string;
  nav: number;
  category?: string;
  returns1y?: number;
  returns3y?: number;
  returns5y?: number;
}

export default function EnhancedStockBrowser() {
  const { isDark } = useTheme();
  const [assetType, setAssetType] = useState<AssetType>('stocks');
  const [market, setMarket] = useState<Market>('indian');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [mutualFunds, setMutualFunds] = useState<MFData[]>([]);
  const [filteredData, setFilteredData] = useState<(StockData | MFData)[]>([]);

  // Enhanced color palette
  const colors = {
    background: isDark ? '#0B1426' : '#F8FAFC',
    card: isDark ? '#1E293B' : '#FFFFFF',
    text: isDark ? '#F8FAFC' : '#0F172A',
    textSecondary: isDark ? '#94A3B8' : '#64748B',
    textTertiary: isDark ? '#64748B' : '#94A3B8',
    primary: '#00D09C',
    primaryDark: '#00B88A',
    primaryGlow: 'rgba(0, 208, 156, 0.15)',
    success: '#00D09C',
    successBg: isDark ? '#00D09C15' : '#00D09C10',
    successBorder: isDark ? '#00D09C30' : '#00D09C20',
    error: '#FF4B4B',
    errorBg: isDark ? '#FF4B4B15' : '#FF4B4B10',
    errorBorder: isDark ? '#FF4B4B30' : '#FF4B4B20',
    accent: '#7C3AED',
    warning: '#FFB020',
    inputBg: isDark ? '#334155' : '#F1F5F9',
    border: isDark ? '#334155' : '#E2E8F0',
    glass: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    glassBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
    backgroundSecondary: isDark ? '#1E293B' : '#F1F5F9',
    shadow: isDark ? '#00000050' : '#00000010',
  };

  // Popular stocks - Extended list with pharmaceutical and healthcare
  const popularIndianStocks = [
    'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK',
    'HINDUNILVR', 'ITC', 'SBIN', 'BHARTIARTL', 'KOTAKBANK', 
    'LT', 'ASIANPAINT', 'AXISBANK', 'MARUTI', 'TITAN', 
    'BAJFINANCE', 'WIPRO', 'ULTRACEMCO',
    // Pharma & Healthcare
    'DRREDDY', 'APOLLOHOSP', 'SUNPHARMA', 'CIPLA', 'DIVISLAB',
    // Others
    'TATAMOTORS', 'TATASTEEL', 'ADANIPORTS', 'ONGC', 'POWERGRID',
    'NTPC', 'TECHM', 'HCLTECH', 'HEROMOTOCO', 'NESTLEIND'
  ];

  const popularUSStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 
    'NVDA', 'JPM', 'V', 'WMT', 'DIS', 'NFLX'];

  useEffect(() => {
    loadData();
  }, [assetType, market]);

  useEffect(() => {
    applyFilters();
  }, [stocks, mutualFunds, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (assetType === 'stocks') {
        await loadStocks();
      } else {
        await loadMutualFunds();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStocks = async () => {
    const symbolsToFetch = market === 'indian' ? popularIndianStocks : popularUSStocks;
    const marketType = market === 'indian' ? 'NSE' : 'US';

    const stockPromises = symbolsToFetch.map(async (symbol) => {
      try {
        const quote = await GlobalMarketService.getQuote(symbol, marketType as any);
        return {
          symbol: quote.symbol,
          name: quote.name,
          exchange: quote.exchange,
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          volume: quote.volume,
          previousClose: quote.previousClose,
          open: quote.open,
          high: quote.high,
          low: quote.low,
          marketCap: quote.marketCap,
          currency: quote.currency,
        };
      } catch (error) {
        return null;
      }
    });

    const results = await Promise.all(stockPromises);
    const validStocks = results.filter(s => 
      s !== null && s.symbol && s.price != null && !isNaN(s.price) && s.price > 0
    ) as StockData[];
    setStocks(validStocks);
  };

  const loadMutualFunds = async () => {
    try {
      const fundHouses = ['HDFC', 'ICICI', 'SBI', 'Axis'];
      let allFunds: any[] = [];

      for (const house of fundHouses) {
        const funds = await MutualFundService.searchMutualFunds(house);
        allFunds = [...allFunds, ...funds.slice(0, 5)];
      }

      const mfData: MFData[] = allFunds
        .map(fund => ({
          schemeCode: fund.scheme_code,
          schemeName: fund.scheme_name,
          fundHouse: fund.fund_house,
          nav: fund.nav || 0,
          category: fund.category,
          returns1y: fund.returns_1y,
          returns3y: fund.returns_3y,
          returns5y: fund.returns_5y,
        }))
        .filter(fund => fund.schemeCode && fund.schemeName);

      setMutualFunds(mfData);
    } catch (error) {
      console.error('Error loading mutual funds:', error);
    }
  };

  const applyFilters = () => {
    let data: (StockData | MFData)[] = assetType === 'stocks' ? [...stocks] : [...mutualFunds];

    if (searchQuery) {
      data = data.filter((item: any) => {
        const searchFields = assetType === 'stocks'
          ? [item.symbol, item.name].join(' ').toLowerCase()
          : [item.schemeCode, item.schemeName, item.fundHouse].join(' ').toLowerCase();
        return searchFields.includes(searchQuery.toLowerCase());
      });
    }

    setFilteredData(data);
  };

  // Search stocks dynamically from API
  const searchStocksFromAPI = async (query: string) => {
    if (!query || query.length < 2) {
      applyFilters();
      return;
    }

    setLoading(true);
    try {
      const marketParam = market === 'indian' ? 'IN' : market === 'us' ? 'US' : 'GLOBAL';
      // Make query uppercase for better stock symbol matching
      const searchResults = await GlobalMarketService.searchStocks(query.toUpperCase(), marketParam as any);
      
      console.log(`📋 Processing ${searchResults.length} search results for "${query}"`);
      
      if (assetType === 'stocks' && searchResults.length > 0) {
        const stockPromises = searchResults.slice(0, 20).map(async (result: any) => {
          try {
            // Try to get detailed quote
            const quote = await GlobalMarketService.getQuote(
              result.symbol, 
              market === 'indian' ? 'NSE' : 'US' as any
            );
            console.log(`✅ Got quote for ${result.symbol}:`, quote.price);
            return {
              symbol: quote.symbol,
              name: quote.name || result.longname || result.shortname,
              exchange: quote.exchange,
              price: quote.price,
              change: quote.change,
              changePercent: quote.changePercent,
              volume: quote.volume,
              previousClose: quote.previousClose,
              open: quote.open,
              high: quote.high,
              low: quote.low,
              marketCap: quote.marketCap,
              currency: quote.currency,
            };
          } catch (error) {
            // Quote fetch failed - use search result data as fallback
            console.log(`⚠️ Quote failed for ${result.symbol}, using search data`);
            
            // Create stock from search result data (even if incomplete)
            if (result.symbol && (result.regularMarketPrice || result.preMarketPrice)) {
              const price = result.regularMarketPrice || result.preMarketPrice || 0;
              return {
                symbol: result.symbol,
                name: result.longname || result.shortname || result.symbol,
                exchange: result.exchange || (market === 'indian' ? 'NSE' : 'US'),
                price: price,
                change: result.regularMarketChange || 0,
                changePercent: result.regularMarketChangePercent || 0,
                volume: result.regularMarketVolume || 0,
                previousClose: result.regularMarketPreviousClose || price,
                open: result.regularMarketOpen || price,
                high: result.regularMarketDayHigh || price,
                low: result.regularMarketDayLow || price,
                marketCap: result.marketCap,
                currency: market === 'indian' ? 'INR' : 'USD',
              };
            }
            return null;
          }
        });

        const results = await Promise.all(stockPromises);
        // Less strict filtering - accept stocks with any price data
        const validStocks = results.filter(s => 
          s !== null && s.symbol && s.price != null && !isNaN(s.price)
        ) as StockData[];
        
        console.log(`📊 Final results: ${validStocks.length} valid stocks`);
        setFilteredData(validStocks);
      } else {
        console.log(`⚠️ No search results found for "${query}"`);
        applyFilters();
      }
    } catch (error) {
      console.error('Error searching stocks:', error);
      applyFilters();
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    if (assetType === 'stocks' && searchQuery && searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        searchStocksFromAPI(searchQuery);
      }, 800);
      return () => clearTimeout(timeoutId);
    } else {
      applyFilters();
    }
  }, [searchQuery]);

  const formatNumber = (num: number, currency: string = 'INR'): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency === 'INR' ? 'INR' : 'USD',
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Enhanced Stock Card (Inspired by Groww)
  const renderStockCard = ({ item }: { item: StockData }) => {
    const change = item.change ?? 0;
    const changePercent = item.changePercent ?? 0;
    const price = item.price ?? 0;
    const isPositive = change >= 0;

    return (
      <View style={styles(colors).stockCardWrapper}>
        <LinearGradient
          colors={[
            isPositive 
              ? 'rgba(0, 208, 156, 0.05)' 
              : 'rgba(255, 71, 87, 0.05)',
            colors.card,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles(colors).stockCardGradient}
        >
      <TouchableOpacity style={styles(colors).stockCardContent}>
        {/* Header Row */}
        <View style={styles(colors).stockHeader}>
          <View style={styles(colors).stockInfo}>
            <Text style={styles(colors).stockSymbol}>{item.symbol || 'N/A'}</Text>
            <Text style={styles(colors).stockName} numberOfLines={1}>
              {item.name || item.symbol || 'Unknown'}
            </Text>
            <View style={styles(colors).stockMeta}>
              <Text style={styles(colors).stockExchange}>{item.exchange || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles(colors).stockPriceSection}>
            <Text style={styles(colors).stockPrice}>
              {formatNumber(price, item.currency || 'INR')}
            </Text>
            <View style={[
              styles(colors).stockChangeBadge,
              { backgroundColor: isPositive ? colors.successBg : colors.errorBg }
            ]}>
              <Text style={[
                styles(colors).stockChangeText,
                { color: isPositive ? colors.success : colors.error }
              ]}>
                {isPositive ? '↑' : '↓'} {Math.abs(changePercent).toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats Row */}
        <View style={styles(colors).statsGrid}>
          <View style={styles(colors).statBox}>
            <Text style={styles(colors).statLabel}>Open</Text>
            <Text style={styles(colors).statValue}>
              ₹{(item.open ?? price).toFixed(2)}
            </Text>
          </View>
          <View style={styles(colors).statBox}>
            <Text style={styles(colors).statLabel}>High</Text>
            <Text style={styles(colors).statValue}>
              ₹{(item.high ?? price).toFixed(2)}
            </Text>
          </View>
          <View style={styles(colors).statBox}>
            <Text style={styles(colors).statLabel}>Low</Text>
            <Text style={styles(colors).statValue}>
              ₹{(item.low ?? price).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Add Button - Icon Only */}
        <TouchableOpacity style={styles(colors).addButtonIcon}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles(colors).addIconGradient}
          >
            <Text style={styles(colors).addIconText}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  // Enhanced MF Card
  const renderMFCard = ({ item }: { item: MFData }) => {
    const nav = item.nav ?? 0;
    const returns1y = item.returns1y;
    const isPositive = (returns1y ?? 0) >= 0;
    
    return (
      <View style={styles(colors).stockCardWrapper}>
        <LinearGradient
          colors={[
            isPositive 
              ? 'rgba(0, 208, 156, 0.05)' 
              : 'rgba(255, 71, 87, 0.05)',
            colors.card,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles(colors).stockCardGradient}
        >
      <TouchableOpacity style={styles(colors).stockCardContent}>
        <View style={styles(colors).stockHeader}>
          <View style={styles(colors).stockInfo}>
            <Text style={styles(colors).stockName} numberOfLines={2}>
              {item.schemeName || 'Unknown Fund'}
            </Text>
            <Text style={styles(colors).stockExchange}>{item.fundHouse || 'N/A'}</Text>
            {item.category && (
              <View style={styles(colors).categoryBadge}>
                <Text style={styles(colors).categoryText}>{item.category}</Text>
              </View>
            )}
          </View>
          
          <View style={styles(colors).stockPriceSection}>
            <Text style={styles(colors).mfNavLabel}>NAV</Text>
            <Text style={styles(colors).stockPrice}>₹{nav.toFixed(2)}</Text>
          </View>
        </View>

        {returns1y != null && (
          <View style={styles(colors).returnsRow}>
            <Text style={styles(colors).returnsLabel}>1Y Returns:</Text>
            <Text style={[
              styles(colors).returnsValue,
              { color: returns1y >= 0 ? colors.success : colors.error }
            ]}>
              {returns1y >= 0 ? '+' : ''}{returns1y.toFixed(2)}%
            </Text>
          </View>
        )}

        {/* Add Button - Icon Only */}
        <TouchableOpacity style={styles(colors).addButtonIcon}>
          <LinearGradient
            colors={[colors.accent, colors.accent + 'DD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles(colors).addIconGradient}
          >
            <Text style={styles(colors).addIconText}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles(colors).container}>
      {/* Compact Header - All in One Row */}
      <View style={styles(colors).compactHeader}>
        {/* Pills Row: Asset Type + Market */}
        <View style={styles(colors).pillsRow}>
          {/* Asset Type */}
          <TouchableOpacity
            style={[
              styles(colors).textPill,
              assetType === 'stocks' && styles(colors).textPillActive,
            ]}
            onPress={() => setAssetType('stocks')}
          >
            <Text style={[
              styles(colors).textPillLabel,
              assetType === 'stocks' && styles(colors).textPillLabelActive,
            ]}>
              Stocks
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles(colors).textPill,
              assetType === 'mutualfunds' && styles(colors).textPillActive,
            ]}
            onPress={() => setAssetType('mutualfunds')}
          >
            <Text style={[
              styles(colors).textPillLabel,
              assetType === 'mutualfunds' && styles(colors).textPillLabelActive,
            ]}>
              Funds
            </Text>
          </TouchableOpacity>

          {/* Market Pills (only for stocks) */}
          {assetType === 'stocks' && (
            <>
              <View style={styles(colors).pillDivider} />
              {(['indian', 'us', 'global'] as Market[]).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles(colors).textPill,
                    market === m && styles(colors).textPillActive,
                  ]}
                  onPress={() => setMarket(m)}
                >
                  <Text style={[
                    styles(colors).textPillLabel,
                    market === m && styles(colors).textPillLabelActive,
                  ]}>
                    {m === 'indian' ? 'IN' : m === 'us' ? 'US' : 'Global'}
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>

        {/* Compact Search Bar with Results */}
        <View style={styles(colors).searchBarRow}>
          <View style={styles(colors).compactSearchBar}>
            <Text style={styles(colors).searchIcon}>🔍</Text>
            <TextInput
              style={styles(colors).compactSearchInput}
              placeholder={assetType === 'stocks' ? 'Search any stock...' : 'Search funds...'}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles(colors).clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Subtle Results Badge + Refresh */}
          <View style={styles(colors).rightControls}>
            <View style={styles(colors).resultsBadge}>
              <Text style={styles(colors).resultsBadgeText}>
                {loading ? '...' : filteredData.length}
              </Text>
            </View>
            <TouchableOpacity onPress={loadData} style={styles(colors).refreshButton}>
              <Text style={styles(colors).refreshIcon}>🔄</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles(colors).loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles(colors).loadingText}>Loading market data...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData as any[]}
          renderItem={(assetType === 'stocks' ? renderStockCard : renderMFCard) as any}
          keyExtractor={(item: any, index: number) => {
            if (assetType === 'stocks') {
              const stock = item as StockData;
              return `stock-${stock.symbol || 'unknown'}-${index}`;
            } else {
              const mf = item as MFData;
              return `mf-${mf.schemeCode || 'unknown'}-${index}`;
            }
          }}
          contentContainerStyle={styles(colors).listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles(colors).emptyState}>
              <Text style={styles(colors).emptyIcon}>📊</Text>
              <Text style={styles(colors).emptyTitle}>No results found</Text>
              <Text style={styles(colors).emptySubtext}>
                Try searching with a different term
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    // New Compact Header
    compactHeader: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    pillsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    // Text-based filter pills (intuitive!)
    textPill: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1.5,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    textPillActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    textPillLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    textPillLabelActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    pillDivider: {
      width: 1,
      height: 24,
      backgroundColor: colors.border,
      marginHorizontal: 4,
    },
    searchBarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    compactSearchBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 28,
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderWidth: 2,
      borderColor: colors.border,
      gap: 10,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 4,
    },
    compactSearchInput: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
      padding: 0,
    },
    clearIcon: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '700',
      paddingHorizontal: 4,
    },
    rightControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    resultsBadge: {
      minWidth: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.glass,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 8,
    },
    resultsBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'center',
    },
    refreshButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.glass,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      justifyContent: 'center',
      alignItems: 'center',
    },
    refreshIcon: {
      fontSize: 16,
      color: colors.primary,
    },
    header: {
      padding: 16,
      paddingTop: 8,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    // Toggle
    toggleContainer: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 4,
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 8,
    },
    toggleButtonActive: {
      backgroundColor: colors.primary,
    },
    toggleText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    toggleTextActive: {
      color: '#FFFFFF',
    },
    // Market
    marketRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    marketChip: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: colors.card,
      borderRadius: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    marketChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    marketChipText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    marketChipTextActive: {
      color: '#FFFFFF',
    },
    // Search
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBg,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 16,
    },
    searchIcon: {
      fontSize: 18,
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
    },
    // Results
    resultsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    resultsText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    refreshText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    // List
    listContent: {
      padding: 16,
    },
    // Beautiful Stock Card with Gradient
    stockCardWrapper: {
      borderRadius: 16,
      marginBottom: 12,
      overflow: 'hidden',
      shadowColor: colors.success,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 3,
    },
    stockCardGradient: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      overflow: 'hidden',
    },
    stockCardContent: {
      padding: 14,
      backgroundColor: 'transparent',
    },
    stockHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    stockInfo: {
      flex: 1,
      marginRight: 12,
    },
    stockSymbol: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 3,
      letterSpacing: 0.2,
    },
    stockName: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    stockMeta: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    stockExchange: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      backgroundColor: colors.glass,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      letterSpacing: 0.5,
    },
    stockPriceSection: {
      alignItems: 'flex-end',
    },
    stockPrice: {
      fontSize: 19,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 5,
      letterSpacing: -0.3,
    },
    stockChangeBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    stockChangeText: {
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
    // Beautiful Stats Grid
    statsGrid: {
      flexDirection: 'row',
      marginBottom: 16,
      backgroundColor: colors.glass,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
    },
    statBox: {
      flex: 1,
      alignItems: 'center',
    },
    statLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    // Add Button
    // Smaller Icon Button (36x36)
    addButtonIcon: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      width: 36,
      height: 36,
      borderRadius: 18,
      overflow: 'hidden',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 5,
    },
    addIconGradient: {
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addIconText: {
      fontSize: 20,
      fontWeight: '600',
      color: '#FFFFFF',
      marginTop: -1,
    },
    // MF Specific
    mfNavLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 2,
    },
    categoryBadge: {
      backgroundColor: colors.accent + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      alignSelf: 'flex-start',
      marginTop: 6,
    },
    categoryText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.accent,
    },
    returnsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.inputBg,
      borderRadius: 8,
    },
    returnsLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    returnsValue: {
      fontSize: 15,
      fontWeight: '700',
    },
    // Loading
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: colors.textSecondary,
    },
    // Empty State
    emptyState: {
      paddingVertical: 60,
      alignItems: 'center',
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
    },
  });

