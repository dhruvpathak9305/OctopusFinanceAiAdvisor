/**
 * Stock & Mutual Fund Browser Screen
 * Browse, search, and filter Indian & International stocks/MFs with real API data
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useTheme } from '../../../../contexts/ThemeContext';
import { GlobalMarketService } from '../../../../services/globalMarketService';
import { MutualFundService } from '../../../../services/mutualFundService';

type AssetType = 'stocks' | 'mutualfunds';
type Market = 'indian' | 'us' | 'global';
type SortBy = 'name' | 'price' | 'change' | 'volume' | 'marketcap';
type SortOrder = 'asc' | 'desc';

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
  sector?: string;
  industry?: string;
  pe?: number;
  week52High?: number;
  week52Low?: number;
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
  expenseRatio?: number;
  aum?: number;
}

export default function MobileStockBrowser() {
  const { isDark } = useTheme();
  const [assetType, setAssetType] = useState<AssetType>('stocks');
  const [market, setMarket] = useState<Market>('indian');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [mutualFunds, setMutualFunds] = useState<MFData[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Popular Indian stocks for initial display
  const popularIndianStocks = [
    'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK',
    'HINDUNILVR', 'ITC', 'SBIN', 'BHARTIARTL', 'KOTAKBANK',
    'LT', 'ASIANPAINT', 'AXISBANK', 'MARUTI', 'TITAN',
    'BAJFINANCE', 'WIPRO', 'ULTRACEMCO', 'NESTLEIND', 'HCLTECH'
  ];

  // Popular US stocks
  const popularUSStocks = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA',
    'META', 'NVDA', 'JPM', 'V', 'WMT',
    'DIS', 'NFLX', 'INTC', 'CSCO', 'AMD'
  ];

  // Available sectors
  const sectors = [
    'Financial Services', 'Information Technology', 'Consumer Goods',
    'Healthcare', 'Energy', 'Automobiles', 'Telecommunications',
    'Real Estate', 'Manufacturing', 'Utilities'
  ];

  // MF Categories
  const mfCategories = [
    'Equity', 'Debt', 'Hybrid', 'Index', 'ETF',
    'Large Cap', 'Mid Cap', 'Small Cap', 'Multi Cap',
    'Liquid', 'Ultra Short Duration', 'Balanced'
  ];

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
    inputBg: isDark ? '#374151' : '#F3F4F6',
  };

  // Load data on mount and when filters change
  useEffect(() => {
    loadData();
  }, [assetType, market]);

  // Apply filters and search
  useEffect(() => {
    applyFiltersAndSort();
  }, [stocks, mutualFunds, searchQuery, sortBy, sortOrder, priceMin, priceMax, selectedSectors, selectedCategories]);

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
        console.error(`Error fetching ${symbol}:`, error);
        return null;
      }
    });

    const results = await Promise.all(stockPromises);
    // Filter out null results and stocks with invalid data
    const validStocks = results.filter(s => 
      s !== null && 
      s.symbol != null && 
      s.symbol !== '' && 
      s.price != null && 
      !isNaN(s.price) &&
      s.price > 0
    ) as StockData[];
    setStocks(validStocks);
  };

  const loadMutualFunds = async () => {
    try {
      // Search for popular fund houses to get sample data
      const fundHouses = ['HDFC', 'ICICI', 'SBI', 'Axis', 'Nippon'];
      let allFunds: any[] = [];

      for (const house of fundHouses) {
        const funds = await MutualFundService.searchMutualFunds(house);
        allFunds = [...allFunds, ...funds.slice(0, 5)]; // Take top 5 from each
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
          expenseRatio: fund.expense_ratio,
          aum: fund.aum,
        }))
        .filter(fund => fund.schemeCode && fund.schemeName);

      setMutualFunds(mfData);
    } catch (error) {
      console.error('Error loading mutual funds:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length >= 2) {
      setLoading(true);
      try {
        if (assetType === 'stocks') {
          const results = await GlobalMarketService.searchStocks(
            query,
            market === 'indian' ? 'IN' : market === 'us' ? 'US' : 'GLOBAL'
          );
          
          // Fetch detailed quotes for search results
          const detailedStocks = await Promise.all(
            results.slice(0, 10).map(async (result: any) => {
              try {
                const quote = await GlobalMarketService.getQuote(
                  result.symbol.replace('.NS', '').replace('.BO', ''),
                  market === 'indian' ? 'NSE' : 'US'
                );
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
              } catch {
                return null;
              }
            })
          );
          
          // Filter out null results and stocks with invalid data
          const validSearchStocks = detailedStocks.filter(s => 
            s !== null && 
            s.symbol != null && 
            s.symbol !== '' && 
            s.price != null && 
            !isNaN(s.price) &&
            s.price > 0
          ) as StockData[];
          setStocks(validSearchStocks);
        } else {
          const funds = await MutualFundService.searchMutualFunds(query);
          const mfData: MFData[] = funds
            .slice(0, 20)
            .map(fund => ({
              schemeCode: fund.scheme_code,
              schemeName: fund.scheme_name,
              fundHouse: fund.fund_house,
              nav: fund.nav || 0,
              category: fund.category,
              returns1y: fund.returns_1y,
              returns3y: fund.returns_3y,
              returns5y: fund.returns_5y,
              expenseRatio: fund.expense_ratio,
              aum: fund.aum,
            }))
            .filter(fund => fund.schemeCode && fund.schemeName);
          setMutualFunds(mfData);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const applyFiltersAndSort = () => {
    let data = assetType === 'stocks' ? [...stocks] : [...mutualFunds];

    // Apply search filter
    if (searchQuery) {
      data = data.filter((item: any) => {
        const searchFields = assetType === 'stocks'
          ? [item.symbol, item.name].join(' ').toLowerCase()
          : [item.schemeCode, item.schemeName, item.fundHouse].join(' ').toLowerCase();
        return searchFields.includes(searchQuery.toLowerCase());
      });
    }

    // Apply price filter for stocks
    if (assetType === 'stocks' && (priceMin || priceMax)) {
      data = data.filter((item: any) => {
        const price = item.price;
        const min = priceMin ? parseFloat(priceMin) : 0;
        const max = priceMax ? parseFloat(priceMax) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Apply sector filter
    if (selectedSectors.length > 0 && assetType === 'stocks') {
      data = data.filter((item: any) => 
        item.sector && selectedSectors.includes(item.sector)
      );
    }

    // Apply category filter for MFs
    if (selectedCategories.length > 0 && assetType === 'mutualfunds') {
      data = data.filter((item: any) => 
        item.category && selectedCategories.some(cat => 
          item.category.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }

    // Apply sorting
    data.sort((a: any, b: any) => {
      let aVal, bVal;

      if (assetType === 'stocks') {
        switch (sortBy) {
          case 'name':
            aVal = a.name;
            bVal = b.name;
            break;
          case 'price':
            aVal = a.price;
            bVal = b.price;
            break;
          case 'change':
            aVal = a.changePercent;
            bVal = b.changePercent;
            break;
          case 'volume':
            aVal = a.volume;
            bVal = b.volume;
            break;
          case 'marketcap':
            aVal = a.marketCap || 0;
            bVal = b.marketCap || 0;
            break;
          default:
            aVal = a.name;
            bVal = b.name;
        }
      } else {
        switch (sortBy) {
          case 'name':
            aVal = a.schemeName;
            bVal = b.schemeName;
            break;
          case 'price':
            aVal = a.nav;
            bVal = b.nav;
            break;
          default:
            aVal = a.schemeName;
            bVal = b.schemeName;
        }
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
    });

    setFilteredData(data);
  };

  const formatNumber = (num: number, currency: string = 'INR'): string => {
    if (currency === 'INR') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
      }).format(num);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }).format(num);
    }
  };

  const formatLargeNumber = (num: number): string => {
    if (num >= 1e12) return `₹${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `₹${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e7) return `₹${(num / 1e7).toFixed(2)}Cr`;
    if (num >= 1e5) return `₹${(num / 1e5).toFixed(2)}L`;
    return `₹${num.toFixed(0)}`;
  };

  const renderStockCard = ({ item }: { item: StockData }) => {
    // Add safety checks for undefined values
    const change = item.change ?? 0;
    const changePercent = item.changePercent ?? 0;
    const price = item.price ?? 0;
    const open = item.open ?? price;
    const high = item.high ?? price;
    const low = item.low ?? price;
    const previousClose = item.previousClose ?? price;
    const volume = item.volume ?? 0;
    
    return (
      <TouchableOpacity style={styles(colors).stockCard}>
        <View style={styles(colors).stockHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles(colors).stockSymbol}>{item.symbol || 'N/A'}</Text>
            <Text style={styles(colors).stockName} numberOfLines={1}>
              {item.name || item.symbol || 'Unknown'}
            </Text>
            <Text style={styles(colors).stockExchange}>{item.exchange || 'N/A'}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles(colors).stockPrice}>
              {formatNumber(price, item.currency || 'INR')}
            </Text>
            <Text
              style={[
                styles(colors).stockChange,
                { color: change >= 0 ? colors.success : colors.error },
              ]}
            >
              {change >= 0 ? '+' : ''}
              {change.toFixed(2)} ({changePercent.toFixed(2)}%)
            </Text>
          </View>
        </View>

        <View style={styles(colors).stockDetails}>
          <View style={styles(colors).detailItem}>
            <Text style={styles(colors).detailLabel}>Open</Text>
            <Text style={styles(colors).detailValue}>
              {formatNumber(open, item.currency || 'INR')}
            </Text>
          </View>
          <View style={styles(colors).detailItem}>
            <Text style={styles(colors).detailLabel}>High</Text>
            <Text style={styles(colors).detailValue}>
              {formatNumber(high, item.currency || 'INR')}
            </Text>
          </View>
          <View style={styles(colors).detailItem}>
            <Text style={styles(colors).detailLabel}>Low</Text>
            <Text style={styles(colors).detailValue}>
              {formatNumber(low, item.currency || 'INR')}
            </Text>
          </View>
          <View style={styles(colors).detailItem}>
            <Text style={styles(colors).detailLabel}>Prev Close</Text>
            <Text style={styles(colors).detailValue}>
              {formatNumber(previousClose, item.currency || 'INR')}
            </Text>
          </View>
        </View>

        <View style={styles(colors).stockFooter}>
          <View style={styles(colors).footerItem}>
            <Text style={styles(colors).footerLabel}>Volume</Text>
            <Text style={styles(colors).footerValue}>
              {volume > 0 ? (volume / 1000000).toFixed(2) + 'M' : 'N/A'}
            </Text>
          </View>
          {item.marketCap && item.marketCap > 0 && (
            <View style={styles(colors).footerItem}>
              <Text style={styles(colors).footerLabel}>Market Cap</Text>
              <Text style={styles(colors).footerValue}>
                {formatLargeNumber(item.marketCap)}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles(colors).addButton}>
            <Text style={styles(colors).addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMFCard = ({ item }: { item: MFData }) => {
    // Add safety checks for undefined values
    const nav = item.nav ?? 0;
    const returns1y = item.returns1y;
    const returns3y = item.returns3y;
    const returns5y = item.returns5y;
    
    return (
      <TouchableOpacity style={styles(colors).stockCard}>
        <View style={styles(colors).stockHeader}>
          <View style={{ flex: 1 }}>
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
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles(colors).mfNav}>₹{nav.toFixed(4)}</Text>
            <Text style={styles(colors).navLabel}>NAV</Text>
          </View>
        </View>

        {(returns1y != null || returns3y != null || returns5y != null) && (
          <View style={styles(colors).returnsSection}>
            <Text style={styles(colors).returnsTitle}>Returns</Text>
            <View style={styles(colors).returnsRow}>
              {returns1y != null && (
                <View style={styles(colors).returnItem}>
                  <Text style={styles(colors).returnLabel}>1Y</Text>
                  <Text
                    style={[
                      styles(colors).returnValue,
                      { color: returns1y >= 0 ? colors.success : colors.error },
                    ]}
                  >
                    {returns1y.toFixed(2)}%
                  </Text>
                </View>
              )}
              {returns3y != null && (
                <View style={styles(colors).returnItem}>
                  <Text style={styles(colors).returnLabel}>3Y</Text>
                  <Text
                    style={[
                      styles(colors).returnValue,
                      { color: returns3y >= 0 ? colors.success : colors.error },
                    ]}
                  >
                    {returns3y.toFixed(2)}%
                  </Text>
                </View>
              )}
              {returns5y != null && (
                <View style={styles(colors).returnItem}>
                  <Text style={styles(colors).returnLabel}>5Y</Text>
                  <Text
                    style={[
                      styles(colors).returnValue,
                      { color: returns5y >= 0 ? colors.success : colors.error },
                    ]}
                  >
                    {returns5y.toFixed(2)}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles(colors).mfFooter}>
          {item.expenseRatio != null && (
            <View style={styles(colors).mfFooterItem}>
              <Text style={styles(colors).footerLabel}>Expense Ratio</Text>
              <Text style={styles(colors).footerValue}>{item.expenseRatio}%</Text>
            </View>
          )}
          {item.aum != null && (
            <View style={styles(colors).mfFooterItem}>
              <Text style={styles(colors).footerLabel}>AUM</Text>
              <Text style={styles(colors).footerValue}>
                ₹{item.aum}Cr
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles(colors).addButton}>
            <Text style={styles(colors).addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles(colors).modalOverlay}>
        <View style={styles(colors).modalContent}>
          <View style={styles(colors).modalHeader}>
            <Text style={styles(colors).modalTitle}>Filters & Sort</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={styles(colors).closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles(colors).modalScroll}>
            {/* Sort Options */}
            <Text style={styles(colors).filterSectionTitle}>Sort By</Text>
            <View style={styles(colors).sortOptions}>
              {(['name', 'price', 'change', 'volume', 'marketcap'] as SortBy[]).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles(colors).sortOption,
                    sortBy === option && styles(colors).sortOptionActive,
                  ]}
                  onPress={() => setSortBy(option)}
                >
                  <Text
                    style={[
                      styles(colors).sortOptionText,
                      sortBy === option && styles(colors).sortOptionTextActive,
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort Order */}
            <View style={styles(colors).sortOrderRow}>
              <TouchableOpacity
                style={[
                  styles(colors).sortOrderButton,
                  sortOrder === 'asc' && styles(colors).sortOrderActive,
                ]}
                onPress={() => setSortOrder('asc')}
              >
                <Text style={styles(colors).sortOrderText}>↑ Ascending</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles(colors).sortOrderButton,
                  sortOrder === 'desc' && styles(colors).sortOrderActive,
                ]}
                onPress={() => setSortOrder('desc')}
              >
                <Text style={styles(colors).sortOrderText}>↓ Descending</Text>
              </TouchableOpacity>
            </View>

            {/* Price Range Filter (for stocks) */}
            {assetType === 'stocks' && (
              <>
                <Text style={styles(colors).filterSectionTitle}>Price Range</Text>
                <View style={styles(colors).priceRangeRow}>
                  <TextInput
                    style={styles(colors).priceInput}
                    placeholder="Min"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={priceMin}
                    onChangeText={setPriceMin}
                  />
                  <Text style={styles(colors).priceRangeSeparator}>to</Text>
                  <TextInput
                    style={styles(colors).priceInput}
                    placeholder="Max"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={priceMax}
                    onChangeText={setPriceMax}
                  />
                </View>
              </>
            )}

            {/* Apply/Reset Buttons */}
            <View style={styles(colors).filterActions}>
              <TouchableOpacity
                style={styles(colors).resetButton}
                onPress={() => {
                  setSortBy('name');
                  setSortOrder('asc');
                  setPriceMin('');
                  setPriceMax('');
                  setSelectedSectors([]);
                  setSelectedCategories([]);
                }}
              >
                <Text style={styles(colors).resetButtonText}>Reset All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles(colors).applyButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles(colors).applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles(colors).container}>
      {/* Header */}
      <View style={styles(colors).header}>
        {/* Asset Type Toggle */}
        <View style={styles(colors).assetToggle}>
          <TouchableOpacity
            style={[
              styles(colors).assetButton,
              assetType === 'stocks' && styles(colors).assetButtonActive,
            ]}
            onPress={() => setAssetType('stocks')}
          >
            <Text
              style={[
                styles(colors).assetButtonText,
                assetType === 'stocks' && styles(colors).assetButtonTextActive,
              ]}
            >
              Stocks
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles(colors).assetButton,
              assetType === 'mutualfunds' && styles(colors).assetButtonActive,
            ]}
            onPress={() => setAssetType('mutualfunds')}
          >
            <Text
              style={[
                styles(colors).assetButtonText,
                assetType === 'mutualfunds' && styles(colors).assetButtonTextActive,
              ]}
            >
              Mutual Funds
            </Text>
          </TouchableOpacity>
        </View>

        {/* Market Toggle (for stocks) */}
        {assetType === 'stocks' && (
          <View style={styles(colors).marketToggle}>
            <TouchableOpacity
              style={[
                styles(colors).marketButton,
                market === 'indian' && styles(colors).marketButtonActive,
              ]}
              onPress={() => setMarket('indian')}
            >
              <Text style={styles(colors).marketButtonText}>Indian</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles(colors).marketButton,
                market === 'us' && styles(colors).marketButtonActive,
              ]}
              onPress={() => setMarket('us')}
            >
              <Text style={styles(colors).marketButtonText}>US</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles(colors).marketButton,
                market === 'global' && styles(colors).marketButtonActive,
              ]}
              onPress={() => setMarket('global')}
            >
              <Text style={styles(colors).marketButtonText}>Global</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles(colors).searchContainer}>
          <TextInput
            style={styles(colors).searchInput}
            placeholder={`Search ${assetType === 'stocks' ? 'stocks' : 'mutual funds'}...`}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <TouchableOpacity
            style={styles(colors).filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Text style={styles(colors).filterButtonText}>⚙️ Filters</Text>
          </TouchableOpacity>
        </View>

        {/* Results Count */}
        <View style={styles(colors).resultsHeader}>
          <Text style={styles(colors).resultsText}>
            {loading ? 'Loading...' : `${filteredData.length} results`}
          </Text>
          <TouchableOpacity onPress={loadData}>
            <Text style={styles(colors).refreshText}>🔄 Refresh</Text>
          </TouchableOpacity>
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
          data={filteredData}
          renderItem={assetType === 'stocks' ? renderStockCard : renderMFCard}
          keyExtractor={(item, index) => {
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
              <Text style={styles(colors).emptyText}>
                {searchQuery
                  ? 'No results found. Try a different search.'
                  : 'Start searching to discover stocks and mutual funds'}
              </Text>
            </View>
          }
        />
      )}

      {/* Filters Modal */}
      {renderFiltersModal()}
    </View>
  );
}

const styles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 16,
      paddingTop: 8,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
    },
    assetToggle: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 4,
      marginBottom: 12,
    },
    assetButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 8,
    },
    assetButtonActive: {
      backgroundColor: colors.primary,
    },
    assetButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    assetButtonTextActive: {
      color: '#FFFFFF',
    },
    marketToggle: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    marketButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.card,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    marketButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    marketButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    searchContainer: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      backgroundColor: colors.inputBg,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.text,
    },
    filterButton: {
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    filterButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
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
    listContent: {
      padding: 16,
      paddingTop: 8,
    },
    stockCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    stockHeader: {
      flexDirection: 'row',
      marginBottom: 12,
    },
    stockSymbol: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    stockName: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    stockExchange: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    stockPrice: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    stockChange: {
      fontSize: 14,
      fontWeight: '600',
      marginTop: 2,
    },
    stockDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.cardBorder,
      marginBottom: 12,
    },
    detailItem: {
      alignItems: 'center',
    },
    detailLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    detailValue: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    stockFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    footerItem: {
      flex: 1,
    },
    footerLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    footerValue: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    addButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    mfNav: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    navLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    categoryBadge: {
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      alignSelf: 'flex-start',
      marginTop: 4,
    },
    categoryText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.primary,
    },
    returnsSection: {
      paddingVertical: 12,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.cardBorder,
      marginBottom: 12,
    },
    returnsTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    returnsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    returnItem: {
      alignItems: 'center',
    },
    returnLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    returnValue: {
      fontSize: 14,
      fontWeight: '700',
    },
    mfFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    mfFooterItem: {
      flex: 1,
    },
    emptyState: {
      paddingVertical: 60,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    closeButton: {
      fontSize: 24,
      color: colors.textSecondary,
    },
    modalScroll: {
      padding: 20,
    },
    filterSectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
      marginTop: 8,
    },
    sortOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    sortOption: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.inputBg,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    sortOptionActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    sortOptionText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    sortOptionTextActive: {
      color: '#FFFFFF',
    },
    sortOrderRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    sortOrderButton: {
      flex: 1,
      paddingVertical: 12,
      backgroundColor: colors.inputBg,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    sortOrderActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    sortOrderText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    priceRangeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    priceInput: {
      flex: 1,
      backgroundColor: colors.inputBg,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.text,
    },
    priceRangeSeparator: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    filterActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
    },
    resetButton: {
      flex: 1,
      paddingVertical: 14,
      backgroundColor: colors.inputBg,
      borderRadius: 12,
      alignItems: 'center',
    },
    resetButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    applyButton: {
      flex: 1,
      paddingVertical: 14,
      backgroundColor: colors.primary,
      borderRadius: 12,
      alignItems: 'center',
    },
    applyButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });

