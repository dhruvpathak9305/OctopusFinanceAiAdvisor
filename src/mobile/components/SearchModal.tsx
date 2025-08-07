import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (searchData: SearchData) => void;
}

interface SearchData {
  text: string;
  amount: string;
  category: string;
  date: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SearchModal: React.FC<SearchModalProps> = ({ visible, onClose, onSearch }) => {
  const { isDark } = useTheme();
  const [searchText, setSearchText] = useState("");
  const [searchFilters, setSearchFilters] = useState({
    amount: "",
    category: "",
    date: "",
  });
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const colors = isDark ? {
    background: '#0B1426',
    card: '#1F2937',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
    filterBackground: '#374151',
    accent: '#10B981',
    accentLight: '#10B98120',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  } : {
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    filterBackground: '#F3F4F6',
    accent: '#10B981',
    accentLight: '#10B98120',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  };

  const categories = [
    { name: 'Food & Dining', icon: '🍽️', color: colors.warning },
    { name: 'Shopping', icon: '🛍️', color: colors.info },
    { name: 'Transportation', icon: '🚗', color: colors.danger },
    { name: 'Bills & Utilities', icon: '📄', color: colors.accent },
    { name: 'Entertainment', icon: '🎬', color: '#EC4899' },
    { name: 'Healthcare', icon: '🏥', color: '#8B5CF6' },
    { name: 'Education', icon: '📚', color: '#06B6D4' },
    { name: 'Travel', icon: '✈️', color: '#F59E0B' },
  ];

  const amountRanges = [
    { label: 'Under $50', value: '0-50' },
    { label: '$50 - $200', value: '50-200' },
    { label: '$200 - $500', value: '200-500' },
    { label: '$500 - $1000', value: '500-1000' },
    { label: 'Over $1000', value: '1000+' },
  ];

  const dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Last 3 Months', value: '3months' },
    { label: 'This Year', value: 'year' },
  ];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleSearch = () => {
    const searchData: SearchData = {
      text: searchText,
      amount: searchFilters.amount,
      category: searchFilters.category,
      date: searchFilters.date,
    };
    
    console.log('SearchModal: Search data', searchData);
    onSearch(searchData);
    
    // Reset form
    setSearchText("");
    setSearchFilters({ amount: "", category: "", date: "" });
    setActiveFilter(null);
    onClose();
  };

  const handleClose = () => {
    console.log('SearchModal: Closing modal');
    setSearchText("");
    setSearchFilters({ amount: "", category: "", date: "" });
    setActiveFilter(null);
    onClose();
  };

  const handleClearAll = () => {
    setSearchText("");
    setSearchFilters({ amount: "", category: "", date: "" });
    setActiveFilter(null);
  };

  const FilterChip: React.FC<{ 
    label: string; 
    value: string; 
    isSelected: boolean; 
    onPress: () => void;
    color?: string;
    icon?: string;
  }> = ({ label, value, isSelected, onPress, color = colors.accent, icon }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        { 
          backgroundColor: isSelected ? `${color}20` : colors.filterBackground,
          borderColor: isSelected ? color : colors.border,
        }
      ]}
      onPress={onPress}
    >
      {icon && <Text style={styles.chipIcon}>{icon}</Text>}
      <Text style={[
        styles.filterChipText,
        { color: isSelected ? color : colors.text }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const hasActiveFilters = searchText || searchFilters.amount || searchFilters.category || searchFilters.date;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View 
          style={[styles.overlay, { opacity: opacityAnim }]}
        >
          <TouchableOpacity 
            style={styles.overlayBackground}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        <Animated.View 
          style={[
            styles.modal, 
            { 
              backgroundColor: colors.card,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <Text style={[styles.title, { color: colors.text }]}>Search Transactions</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Find specific transactions quickly
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Main Search */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Search Query</Text>
              <View style={[styles.searchInputContainer, { borderColor: colors.border, backgroundColor: colors.filterBackground }]}>
                <Text style={[styles.searchIcon, { color: colors.accent }]}>🔍</Text>
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Search by description, merchant, or amount..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchText}
                  onChangeText={setSearchText}
                  returnKeyType="search"
                  onSubmitEditing={handleSearch}
                />
                {searchText ? (
                  <TouchableOpacity onPress={() => setSearchText("")}>
                    <Text style={[styles.clearIcon, { color: colors.textSecondary }]}>✕</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Amount Filter */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Amount Range</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterChipsContainer}
              >
                {amountRanges.map((range) => (
                  <FilterChip
                    key={range.value}
                    label={range.label}
                    value={range.value}
                    isSelected={searchFilters.amount === range.value}
                    onPress={() => setSearchFilters({
                      ...searchFilters,
                      amount: searchFilters.amount === range.value ? "" : range.value
                    })}
                    color={colors.accent}
                    icon="💰"
                  />
                ))}
              </ScrollView>
            </View>

            {/* Category Filter */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
              <View style={styles.categoriesGrid}>
                {categories.map((category) => (
                  <FilterChip
                    key={category.name}
                    label={category.name}
                    value={category.name}
                    isSelected={searchFilters.category === category.name}
                    onPress={() => setSearchFilters({
                      ...searchFilters,
                      category: searchFilters.category === category.name ? "" : category.name
                    })}
                    color={category.color}
                    icon={category.icon}
                  />
                ))}
              </View>
            </View>

            {/* Date Filter */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Date Range</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterChipsContainer}
              >
                {dateRanges.map((dateRange) => (
                  <FilterChip
                    key={dateRange.value}
                    label={dateRange.label}
                    value={dateRange.value}
                    isSelected={searchFilters.date === dateRange.value}
                    onPress={() => setSearchFilters({
                      ...searchFilters,
                      date: searchFilters.date === dateRange.value ? "" : dateRange.value
                    })}
                    color={colors.info}
                    icon="📅"
                  />
                ))}
              </ScrollView>
            </View>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <View style={[styles.section, styles.activeFiltersSection, { backgroundColor: colors.accentLight }]}>
                <View style={styles.activeFiltersHeader}>
                  <Text style={[styles.activeFiltersTitle, { color: colors.accent }]}>Active Filters</Text>
                  <TouchableOpacity onPress={handleClearAll}>
                    <Text style={[styles.clearAllText, { color: colors.accent }]}>Clear All</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.activeFiltersList}>
                  {searchText && (
                    <Text style={[styles.activeFilterItem, { color: colors.accent }]}>
                      Query: "{searchText}"
                    </Text>
                  )}
                  {searchFilters.amount && (
                    <Text style={[styles.activeFilterItem, { color: colors.accent }]}>
                      Amount: {amountRanges.find(r => r.value === searchFilters.amount)?.label}
                    </Text>
                  )}
                  {searchFilters.category && (
                    <Text style={[styles.activeFilterItem, { color: colors.accent }]}>
                      Category: {searchFilters.category}
                    </Text>
                  )}
                  {searchFilters.date && (
                    <Text style={[styles.activeFilterItem, { color: colors.accent }]}>
                      Date: {dateRanges.find(d => d.value === searchFilters.date)?.label}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={[styles.actions, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.actionButton, styles.clearButton, { borderColor: colors.border }]}
              onPress={handleClearAll}
            >
              <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.searchButton, { backgroundColor: colors.accent }]}
              onPress={handleSearch}
            >
              <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                Search {hasActiveFilters ? '🔍' : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  closeButton: {
    padding: 4,
    marginLeft: 16,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearIcon: {
    fontSize: 16,
    padding: 4,
  },
  filterChipsContainer: {
    paddingVertical: 4,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activeFiltersSection: {
    borderRadius: 12,
    padding: 16,
  },
  activeFiltersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeFiltersTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeFiltersList: {
    gap: 4,
  },
  activeFilterItem: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButton: {
    borderWidth: 1,
  },
  searchButton: {
    // backgroundColor set dynamically
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SearchModal; 