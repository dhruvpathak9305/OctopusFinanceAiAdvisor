import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, darkTheme, lightTheme } from '../../../../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';

interface AssetItem {
  id: string;
  name: string;
  category: string;
  value: number;
  percentage: number;
  icon: string;
  color: string;
  items?: number;
  date?: string;
}

interface AssetCategory {
  id: string;
  name: string;
  value: number;
  percentage: number;
  items: number;
  icon: string;
  color: string;
  assets: AssetItem[];
}

const MobileNetWorth: React.FC = () => {
  const { isDark } = useTheme();
  const colors = isDark ? darkTheme : lightTheme;
  const navigation = useNavigation();
  const route = useRoute();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [sortOrder, setSortOrder] = useState<'largest' | 'smallest' | 'newest' | 'oldest'>('largest');
  const [showSortModal, setShowSortModal] = useState(false);

  // Handle route params to show add asset modal
  useEffect(() => {
    if (route.params && (route.params as any).showAddAssetModal) {
      setShowAddAssetModal(true);
    }
  }, [route.params]);

  // Sample data - in real app this would come from context/API
  const assetCategories: AssetCategory[] = [
    {
      id: '1',
      name: 'Liquid Assets',
      value: 170000,
      percentage: 1.6,
      items: 3,
      icon: 'cash',
      color: '#10B981',
      assets: [
        { id: '1a', name: 'HDFC Savings', category: 'Bank Account', value: 85000, percentage: 50, icon: 'card', color: '#10B981' },
        { id: '1b', name: 'ICICI Current', category: 'Bank Account', value: 65000, percentage: 38, icon: 'card', color: '#10B981' },
        { id: '1c', name: 'Cash in Hand', category: 'Cash', value: 20000, percentage: 12, icon: 'cash', color: '#10B981' },
      ]
    },
    {
      id: '2',
      name: 'Investments - Equity',
      value: 510000,
      percentage: 4.8,
      items: 4,
      icon: 'trending-up',
      color: '#3B82F6',
      assets: [
        { id: '2a', name: 'Zerodha Portfolio', category: 'Stocks', value: 285000, percentage: 56, icon: 'trending-up', color: '#3B82F6' },
        { id: '2b', name: 'Groww SIP', category: 'Mutual Funds', value: 125000, percentage: 24, icon: 'pie-chart', color: '#3B82F6' },
        { id: '2c', name: 'ELSS Funds', category: 'Tax Saving', value: 75000, percentage: 15, icon: 'shield', color: '#3B82F6' },
        { id: '2d', name: 'Direct Equity', category: 'Stocks', value: 25000, percentage: 5, icon: 'trending-up', color: '#3B82F6' },
      ]
    },
    {
      id: '3',
      name: 'Real Estate',
      value: 4630000,
      percentage: 43.1,
      items: 2,
      icon: 'home',
      color: '#F59E0B',
      assets: [
        { id: '3a', name: '2BHK Flat - Pune', category: 'Residential Property', value: 4500000, percentage: 97, icon: 'home', color: '#F59E0B', date: '6/8/2025' },
        { id: '3b', name: 'Embassy REIT', category: 'REITs & Real Estate Funds', value: 130000, percentage: 3, icon: 'business', color: '#F59E0B' },
      ]
    },
    {
      id: '4',
      name: 'Generational Wealth',
      value: 2850000,
      percentage: 26.6,
      items: 2,
      icon: 'heart',
      color: '#8B5CF6',
      assets: [
        { id: '4a', name: 'Gold Jewelry', category: 'Physical Gold', value: 1850000, percentage: 65, icon: 'diamond', color: '#8B5CF6' },
        { id: '4b', name: 'Family Heirloom', category: 'Antiques', value: 1000000, percentage: 35, icon: 'trophy', color: '#8B5CF6' },
      ]
    },
    {
      id: '5',
      name: 'Retirement & Long-term Savings',
      value: 660000,
      percentage: 6.2,
      items: 3,
      icon: 'shield-checkmark',
      color: '#06B6D4',
      assets: [
        { id: '5a', name: 'PPF Account', category: 'Tax Saving', value: 350000, percentage: 53, icon: 'shield', color: '#06B6D4' },
        { id: '5b', name: 'EPF Balance', category: 'Retirement', value: 210000, percentage: 32, icon: 'briefcase', color: '#06B6D4' },
        { id: '5c', name: 'NPS Tier 1', category: 'Pension', value: 100000, percentage: 15, icon: 'shield-checkmark', color: '#06B6D4' },
      ]
    },
  ];

  const totalAssets = assetCategories.reduce((sum, cat) => sum + cat.value, 0);

  const renderGridItem = ({ item, index }: { item: AssetCategory, index: number }) => {
    const isLastRow = index >= Math.floor(assetCategories.length / 3) * 3;
    const itemsInLastRow = assetCategories.length % 3;
    const shouldUseFlexBasis = isLastRow && itemsInLastRow > 0;
    
    return (
      <TouchableOpacity 
        style={[
          styles.gridItem, 
          { 
            backgroundColor: colors.card, 
            borderColor: colors.border,
            width: shouldUseFlexBasis ? `${100 / itemsInLastRow}%` : '33.33%'
          }
        ]}
        onPress={() => setSelectedCategory(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
          <Ionicons name={item.icon as any} size={24} color={item.color} />
        </View>
        <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.categoryValue, { color: item.color }]}>
          ₹{(item.value / 100000).toFixed(1)}L
        </Text>
        <Text style={[styles.categoryPercentage, { color: colors.textSecondary }]}>
          {item.percentage}%
        </Text>
        <Text style={[styles.categoryItems, { color: colors.textSecondary }]}>
          {item.items} items
        </Text>
      </TouchableOpacity>
    );
  };

  const renderListItem = ({ item }: { item: AssetCategory }) => (
    <TouchableOpacity 
      style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => setSelectedCategory(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <View style={styles.listItemContent}>
        <Text style={[styles.categoryName, { color: colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.categoryItems, { color: colors.textSecondary }]}>
          {item.items} items
        </Text>
      </View>
      <View style={styles.listItemRight}>
        <Text style={[styles.categoryValue, { color: item.color }]}>
          ₹{(item.value / 100000).toFixed(1)}L
        </Text>
        <Text style={[styles.categoryPercentage, { color: colors.textSecondary }]}>
          {item.percentage}%
        </Text>
      </View>
      <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderAssetDetail = ({ item }: { item: AssetItem }) => (
    <View style={[styles.assetDetailItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.assetDetailContent}>
        <Text style={[styles.assetName, { color: colors.text }]}>
          {item.name}
        </Text>
        {item.date && (
          <Text style={[styles.assetDate, { color: colors.textSecondary }]}>
            {item.date}
          </Text>
        )}
      </View>
      <View style={styles.assetDetailRight}>
        <Text style={[styles.assetValue, { color: colors.text }]}>
          ₹{(item.value / 100000).toFixed(2)}L
        </Text>
        <View style={styles.assetActions}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.background }]}>
            <Ionicons name="eye" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.background }]}>
            <Ionicons name="pencil" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.background }]}>
            <Ionicons name="trash" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (selectedCategory) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => setSelectedCategory(null)}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {selectedCategory.name}
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.primary }]}>
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.background }]}>
              <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Summary */}
        <View style={[styles.categorySummary, { backgroundColor: colors.card }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              {selectedCategory.name}
            </Text>
            <View style={styles.summaryRight}>
              <Text style={[styles.summaryValue, { color: selectedCategory.color }]}>
                ₹{(selectedCategory.value / 100000).toFixed(2)}L
              </Text>
              <Ionicons name="chevron-up" size={16} color={colors.textSecondary} />
            </View>
          </View>
          <Text style={[styles.summarySubtext, { color: colors.textSecondary }]}>
            {selectedCategory.items} assets • {selectedCategory.percentage}%
          </Text>
        </View>

        {/* Asset Details */}
        <ScrollView style={styles.assetDetails}>
          {selectedCategory.assets.map((asset) => (
            <View key={asset.id}>
              {renderAssetDetail({ item: asset })}
            </View>
          ))}
        </ScrollView>

        {/* Financial Summary */}
        <View style={[styles.financialSummary, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            Financial Summary
          </Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: colors.primary }]}>10</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Asset Classes</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: colors.primary }]}>27</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Assets</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#F59E0B' }]}>₹46.3L</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Largest Asset</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#8B5CF6' }]}>43.1%</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Top Allocation</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

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
          <TouchableOpacity 
            style={[styles.fullNavButton]}
            onPress={() => (navigation as any).navigate('MobileAccounts')}
          >
            <Ionicons name="wallet" size={16} color={colors.textSecondary} />
            <Text style={[styles.fullNavText, { color: colors.textSecondary }]}>Accounts</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.fullNavButton]}
            onPress={() => (navigation as any).navigate('MobileCredit')}
          >
            <Ionicons name="card" size={16} color={colors.textSecondary} />
            <Text style={[styles.fullNavText, { color: colors.textSecondary }]}>Credit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.fullNavButton, styles.activeFullNav, { backgroundColor: colors.primary }]}>
            <Ionicons name="trending-up" size={16} color="white" />
            <Text style={[styles.fullNavText, { color: "white" }]}>Net</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Net Worth Summary */}
      <View style={[styles.netWorthCard, { backgroundColor: colors.card }]}>
        <View style={styles.netWorthHeader}>
          <Text style={[styles.netWorthTitle, { color: colors.textSecondary }]}>
            Net Worth
          </Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.background }]}
            onPress={() => setShowAddAssetModal(true)}
          >
            <Ionicons name="add" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.netWorthValue, { color: colors.primary }]}>
          ₹77,17,500
        </Text>
        <View style={styles.netWorthChange}>
          <Ionicons name="trending-up" size={16} color={colors.primary} />
          <Text style={[styles.changeText, { color: colors.primary }]}>
            +8.5% since last month
          </Text>
        </View>
        
        <View style={styles.assetsLiabilities}>
          <View style={styles.assetLiabilityItem}>
            <Text style={[styles.alLabel, { color: colors.textSecondary }]}>Total Assets</Text>
            <Text style={[styles.alValue, { color: colors.primary }]}>₹1.1Cr</Text>
          </View>
          <View style={styles.assetLiabilityItem}>
            <Text style={[styles.alLabel, { color: colors.textSecondary }]}>Total Liabilities</Text>
            <Text style={[styles.alValue, { color: '#EF4444' }]}>₹30.1L</Text>
          </View>
        </View>
        
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.primary }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Assets</Text>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Liabilities</Text>
        </View>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <Text style={[styles.generationText, { color: colors.textSecondary }]}>
          Generation
        </Text>
        <Ionicons name="eye" size={16} color={colors.textSecondary} />
        
        <View style={styles.toggleButtons}>
          <TouchableOpacity 
            style={[
              styles.toggleButton, 
              { backgroundColor: viewMode === 'list' ? colors.primary : colors.card }
            ]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list" size={16} color={viewMode === 'list' ? 'white' : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.toggleButton, 
              { backgroundColor: viewMode === 'grid' ? colors.primary : colors.card }
            ]}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons name="grid" size={16} color={viewMode === 'grid' ? 'white' : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, { backgroundColor: colors.card }]}
            onPress={() => setShowSortModal(true)}
          >
            <Ionicons name="swap-vertical" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Asset Categories with Financial Summary */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          data={assetCategories}
          renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 3 : 1}
          key={viewMode}
          contentContainerStyle={styles.categoriesContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => (
            <View style={[styles.financialSummary, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>
                Financial Summary
              </Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNumber, { color: colors.primary }]}>10</Text>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Asset Classes</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNumber, { color: colors.primary }]}>27</Text>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Assets</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNumber, { color: '#F59E0B' }]}>₹46.3L</Text>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Largest Asset</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNumber, { color: '#8B5CF6' }]}>43.1%</Text>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Top Allocation</Text>
                </View>
              </View>
            </View>
          )}
        />
      </View>

      {/* Add Asset Modal */}
      {showAddAssetModal && (
        <Modal visible={showAddAssetModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.addAssetModal, { backgroundColor: colors.background }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Asset Class</Text>
                <TouchableOpacity onPress={() => setShowAddAssetModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalContent}>
                <View style={styles.formField}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Category Name *</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                    placeholder="e.g., Custom Investment Category"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Category *</Text>
                  <View style={styles.formFieldRow}>
                    <TouchableOpacity style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Text style={[styles.dropdownText, { color: colors.textSecondary }]}>Select category</Text>
                      <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Ionicons name="add" size={16} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formField}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Subcategory *</Text>
                  <View style={styles.formFieldRow}>
                    <TouchableOpacity style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Text style={[styles.dropdownText, { color: colors.textSecondary }]}>Select subcategory</Text>
                      <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Ionicons name="add" size={16} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formField}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Value (₹) *</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                    placeholder="Enter amount in rupees"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Notes (Optional)</Text>
                  <TextInput
                    style={[styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                    placeholder="Additional details about this asset..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.toggleField}>
                  <View>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>Include in Net Worth</Text>
                    <Text style={[styles.fieldSubtext, { color: colors.textSecondary }]}>
                      Whether to include this asset in net worth calculations
                    </Text>
                  </View>
                  <View style={[styles.toggle, { backgroundColor: colors.primary }]}>
                    <View style={[styles.toggleThumb, { backgroundColor: 'white' }]} />
                  </View>
                </View>

                <View style={styles.toggleField}>
                  <View>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>Active Asset</Text>
                    <Text style={[styles.fieldSubtext, { color: colors.textSecondary }]}>
                      Whether this asset is currently active/held
                    </Text>
                  </View>
                  <View style={[styles.toggle, { backgroundColor: colors.primary }]}>
                    <View style={[styles.toggleThumb, { backgroundColor: 'white' }]} />
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.createButton, { backgroundColor: colors.primary }]}
                  onPress={() => setShowAddAssetModal(false)}
                >
                  <Text style={styles.createButtonText}>Create Category</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.cancelButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => setShowAddAssetModal(false)}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Sort Modal */}
      {showSortModal && (
        <Modal visible={showSortModal} transparent animationType="fade">
          <TouchableOpacity 
            style={styles.sortModalOverlay}
            onPress={() => setShowSortModal(false)}
          >
            <View style={[styles.sortModal, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity 
                style={styles.sortOption}
                onPress={() => {
                  setSortOrder('largest');
                  setShowSortModal(false);
                }}
              >
                <Text style={[styles.sortOptionText, { color: colors.text }]}>Largest First</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.sortOption}
                onPress={() => {
                  setSortOrder('smallest');
                  setShowSortModal(false);
                }}
              >
                <Text style={[styles.sortOptionText, { color: colors.text }]}>Smallest First</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.sortOption}
                onPress={() => {
                  setSortOrder('newest');
                  setShowSortModal(false);
                }}
              >
                <Text style={[styles.sortOptionText, { color: colors.text }]}>Recently Updated</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.sortOption}
                onPress={() => {
                  setSortOrder('oldest');
                  setShowSortModal(false);
                }}
              >
                <Text style={[styles.sortOptionText, { color: colors.text }]}>Oldest First</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 'auto',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  netWorthCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  netWorthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  netWorthTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  netWorthValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  netWorthChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 24,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  assetsLiabilities: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  assetLiabilityItem: {
    alignItems: 'center',
  },
  alLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  alValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    width: '78%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
  },
  viewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  generationText: {
    fontSize: 16,
    fontWeight: '500',
  },
  toggleButtons: {
    flexDirection: 'row',
    marginLeft: 'auto',
    gap: 4,
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesWrapper: {
    flex: 1,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  gridItem: {
    margin: 4,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    minHeight: 32,
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: 12,
    marginBottom: 2,
  },
  categoryItems: {
    fontSize: 11,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  listItemRight: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  categorySummary: {
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  summarySubtext: {
    fontSize: 13,
  },
  assetDetails: {
    flex: 1,
    paddingHorizontal: 20,
  },
  assetDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  assetDetailContent: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  assetDate: {
    fontSize: 12,
  },
  assetDetailRight: {
    alignItems: 'flex-end',
  },
  assetValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  assetActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  financialSummary: {
    margin: 20,
    marginTop: 30,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  addAssetModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalContent: {
    padding: 20,
  },
  formField: {
    marginBottom: 20,
  },
  formFieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  fieldSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dropdown: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 16,
  },
  addButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignSelf: 'flex-end',
  },
  modalButtons: {
    padding: 20,
    gap: 12,
  },
  createButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Sort modal styles
  sortModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortModal: {
    marginHorizontal: 40,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sortOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sortOptionText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default MobileNetWorth;
