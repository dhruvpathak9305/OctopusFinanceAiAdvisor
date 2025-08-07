import React, { useState, useMemo, useEffect } from 'react';
import { useAccounts } from '@/contexts/AccountsContext';
import { useCreditCards } from '@/contexts/CreditCardContext';
import { useNetWorthContext, useNetWorthData, useNetWorthActions } from '@/contexts/NetWorthContext';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '@/common/providers/ThemeProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff,
  TrendingUp,
  TrendingDown,
  Banknote,
  Building,
  Home,
  Coins,
  Shield,
  Briefcase,
  Car,
  Heart,
  Gift,
  AlertTriangle,
  Plus
} from 'lucide-react';
import AddAssetModal from './AddAssetModal';
import ErrorBoundary from '@/components/common/ErrorBoundary';

// Import modular components
import AssetClassGridView from './NetWorth/AssetClassGridView';
import AssetClassScrollableView from './NetWorth/AssetClassScrollableView';
import FinancialSummary from './NetWorth/FinancialSummary';
import AssetDetailsPanel from './NetWorth/AssetDetailsPanel';
import ListGridToggleBar from './NetWorth/ListGridToggleBar';
import AddAssetCTA from './NetWorth/AddAssetCTA';

// Asset interface
export interface Asset {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  value: number;
  lastUpdated: string;
  isActive: boolean;
  includeInNetWorth: boolean;
  notes?: string;
  marketPrice?: number;
  quantity?: number;
}

// Icon mapping for categories (fallback when database icon is not found)
const ICON_MAPPING: Record<string, any> = {
  'Banknote': Banknote,
  'TrendingUp': TrendingUp,
  'Building': Building,
  'Home': Home,
  'Coins': Coins,
  'Shield': Shield,
  'Briefcase': Briefcase,
  'Car': Car,
  'Heart': Heart,
  'Gift': Gift,
  'AlertTriangle': AlertTriangle,
  // Default fallback
  'default': Banknote
};

type SortOption = 'largest' | 'smallest' | 'recent' | 'oldest';

// NetWorth Section Content Component (wrapped by error boundary)
const NetWorthSectionContent: React.FC = () => {
  // NetWorth context hooks
  const { 
    entries, 
    categories, 
    subcategories, 
    summary, 
    categorySummary, 
    loading, 
    categoriesLoading, 
    error,
    isInitialized
  } = useNetWorthData();
  const { 
    addEntry, 
    updateEntry, 
    deleteEntry, 
    toggleVisibility,
    fetchEntries,
    fetchCategories,
    fetchSummary,
    fetchCategorySummary
  } = useNetWorthActions();
  
  const [searchParams] = useSearchParams();
  
  // State management
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['liquid', 'equity']));
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const [includeGenerational, setIncludeGenerational] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [assetDetailViewMode, setAssetDetailViewMode] = useState<'list' | 'grid'>('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalCategory, setAddModalCategory] = useState<string>('liquid');
  const [addModalMode, setAddModalMode] = useState<'asset' | 'category'>('asset');
  const [addModalAssetType, setAddModalAssetType] = useState<'asset' | 'liability'>('asset');
  const [classFilter, setClassFilter] = useState<'all' | 'assets' | 'liabilities'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('largest');

  // Convert database entries to frontend Asset format with proper category mapping
  const assets = useMemo(() => {
    return entries.map(entry => ({
      id: entry.id,
      name: entry.asset_name,
      // Map database category name to frontend category ID
      category: entry.category_name.toLowerCase().replace(/\s+/g, ''),
      subcategory: entry.subcategory_name,
      value: entry.value,
      lastUpdated: entry.updated_at,
      isActive: entry.is_active,
      includeInNetWorth: entry.is_included_in_net_worth,
      notes: entry.notes,
      marketPrice: entry.market_price,
      quantity: entry.quantity
    } as Asset));
  }, [entries]);

  // Handle URL action parameter
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add') {
      setIsAddModalOpen(true);
    }
  }, [searchParams]);

  // No manual data fetching - centralized initialization handles this
  // Data is automatically loaded by NetWorthProvider

  // Convert database categories to frontend format with proper icon mapping
  const assetCategories = useMemo(() => {
    return categories.map(category => {
      // Get the icon component from mapping or use default
      const IconComponent = ICON_MAPPING[category.icon || 'default'] || ICON_MAPPING.default;
      
      // Generate a consistent frontend ID from the category name
      const frontendId = category.name.toLowerCase().replace(/\s+/g, '');
      
      // Get subcategories for this category
      const categorySubcategories = subcategories.get(category.id) || [];
      
      return {
        id: frontendId,
        name: category.name,
        icon: IconComponent,
        color: category.color || '#6B7280',
        type: category.type,
        databaseId: category.id, // Keep reference to original database ID
        sortOrder: category.sort_order,
        subcategories: categorySubcategories.map(sub => sub.name)
      };
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories, subcategories]);
  
  // Use database summary instead of manual calculations
  const totalAssets = summary?.total_assets || 0;
  const totalLiabilities = summary?.total_liabilities || 0;
  const netWorth = summary?.net_worth || 0;

  // Create category totals from database category summary
  const assetTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    // Initialize all categories to 0 using dynamic categories
    assetCategories.forEach(category => {
      totals[category.id] = 0;
    });
    
    // Map database category summary to frontend categories
    categorySummary.forEach(catSummary => {
      const frontendCategoryId = catSummary.category_name.toLowerCase().replace(/\s+/g, '');
      if (frontendCategoryId) {
        // For liabilities, make the value negative
        totals[frontendCategoryId] = catSummary.category_type === 'liability' 
          ? -catSummary.total_value 
          : catSummary.total_value;
      }
    });
    
    return totals;
  }, [categorySummary, assetCategories]);
  
  // Format currency
  const formatINR = (amount: number): string => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${Math.round(amount).toLocaleString()}`;
  };
  
  const formatFullINR = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Handle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Handle subcategory expansion
  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subcategoryId)) {
        newSet.delete(subcategoryId);
      } else {
        newSet.add(subcategoryId);
      }
      return newSet;
    });
  };

  // Handle adding assets
  const handleAddAsset = (categoryId: string) => {
    setAddModalCategory(categoryId);
    setAddModalMode('asset');
    // Find category info to determine if it's a liability
    const categoryInfo = assetCategories.find(cat => cat.id === categoryId);
    setAddModalAssetType(categoryInfo?.type === 'liability' ? 'liability' : 'asset');
    setIsAddModalOpen(true);
  };

  const handleAddAssetClass = (type: 'asset' | 'liability') => {
    setAddModalMode('category');
    setAddModalAssetType(type);
    setIsAddModalOpen(true);
  };

  // Handle asset operations
  const handleAssetAdded = async (asset: Omit<Asset, 'id' | 'lastUpdated'>) => {
    try {
      // Find the category name from dynamic categories
      const categoryInfo = assetCategories.find(cat => cat.id === asset.category);
      const categoryName = categoryInfo?.name || asset.category;
      
      await addEntry(asset, categoryName, asset.subcategory);
      // Note: addEntry already calls refresh internally, no need to call separately
    } catch (error) {
      console.error('Failed to add asset:', error);
    }
  };

  const handleEditAsset = (asset: Asset) => {
    // Implement edit functionality
    console.log('Edit asset:', asset);
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await deleteEntry(assetId);
      // Note: deleteEntry already calls refresh internally, no need to call separately
    } catch (error) {
      console.error('Failed to delete asset:', error);
    }
  };

  const toggleAssetVisibility = async (assetId: string) => {
    try {
      await toggleVisibility(assetId);
      // Note: toggleVisibility already calls refresh internally, no need to call separately
    } catch (error) {
      console.error('Failed to toggle asset visibility:', error);
    }
  };

  // Handle category selection
  const handleGridCategorySelect = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }
  };

  // Handle filter clicks
  const handleAssetFilterClick = () => {
    setClassFilter(classFilter === 'assets' ? 'all' : 'assets');
    setSelectedCategory(null);
  };

  const handleLiabilityFilterClick = () => {
    setClassFilter(classFilter === 'liabilities' ? 'all' : 'liabilities');
    setSelectedCategory(null);
  };

  // Filter categories based on class filter
  const filteredCategories = useMemo(() => {
    if (classFilter === 'assets') {
      return assetCategories.filter(cat => cat.type === 'asset');
    } else if (classFilter === 'liabilities') {
      return assetCategories.filter(cat => cat.type === 'liability');
    }
    return assetCategories;
  }, [classFilter, assetCategories]);

  // Prepare grid data with sorting
  const gridData = useMemo(() => {
    let data = filteredCategories
      .map(category => ({
        ...category,
        value: assetTotals[category.id] || 0,
        percentage: totalAssets > 0 ? (Math.abs(assetTotals[category.id] || 0) / totalAssets * 100) : 0,
        itemCount: assets.filter(asset => asset.category === category.id && asset.isActive).length
      }))
      .filter(item => item.value !== 0 || item.itemCount > 0);

    // Apply sorting
    switch (sortOption) {
      case 'largest':
        data = data.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
        break;
      case 'smallest':
        data = data.sort((a, b) => Math.abs(a.value) - Math.abs(b.value));
        break;
      case 'recent':
        data = data.sort((a, b) => {
          const aLatest = Math.max(...assets
            .filter(asset => asset.category === a.id)
            .map(asset => new Date(asset.lastUpdated).getTime()));
          const bLatest = Math.max(...assets
            .filter(asset => asset.category === b.id)
            .map(asset => new Date(asset.lastUpdated).getTime()));
          return bLatest - aLatest;
        });
        break;
      case 'oldest':
        data = data.sort((a, b) => {
          const aOldest = Math.min(...assets
            .filter(asset => asset.category === a.id)
            .map(asset => new Date(asset.lastUpdated).getTime()));
          const bOldest = Math.min(...assets
            .filter(asset => asset.category === b.id)
            .map(asset => new Date(asset.lastUpdated).getTime()));
          return aOldest - bOldest;
        });
        break;
    }

    return data;
  }, [filteredCategories, assetTotals, totalAssets, assets, sortOption]);

  // Calculate trend
  const trendPercentage = 8.5; // TODO: Get from database trend data
  const isPositiveTrend = trendPercentage > 0;

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4 sm:p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-muted rounded w-24 mx-auto mb-4"></div>
              <div className="h-12 bg-muted rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Net Worth</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => {
                fetchEntries();
                fetchSummary();
                fetchCategorySummary();
              }} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Total Net Worth Card with Add CTA */}
      <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="text-center flex-1">
              <h2 className="text-base sm:text-lg font-medium text-muted-foreground mb-2">Net Worth</h2>
              <p className={`text-2xl sm:text-3xl md:text-4xl font-bold ${
                netWorth >= 0 ? "text-green-500" : "text-red-500"
              }`}>
                {formatFullINR(netWorth)}
              </p>
              <div className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs sm:text-sm ${
                isPositiveTrend 
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
              }`}>
                {isPositiveTrend ? (
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                )}
                {isPositiveTrend ? '+' : ''}{trendPercentage}% since last month
              </div>
            </div>
            
            {/* Add Asset Class CTA */}
            <div className="flex flex-col space-y-1">
              <AddAssetCTA 
                onAddAsset={() => handleAddAssetClass('asset')}
                size="md"
                title="Add Asset Class"
              />
            </div>
          </div>
          
          {/* Assets vs Liabilities Summary - Clickable */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div 
              className="text-center cursor-pointer p-2 rounded-lg transition-colors hover:bg-green-50 dark:hover:bg-green-900/10" 
              onClick={handleAssetFilterClick}
            >
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Assets</p>
              <p className="text-lg sm:text-xl font-semibold text-green-600">{formatINR(totalAssets)}</p>
            </div>
            <div 
              className="text-center cursor-pointer p-2 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
              onClick={handleLiabilityFilterClick}
            >
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Liabilities</p>
              <p className="text-lg sm:text-xl font-semibold text-red-600">{formatINR(totalLiabilities)}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <Progress 
              value={totalAssets > 0 ? (totalAssets / (totalAssets + totalLiabilities)) * 100 : 0} 
              className="h-2 sm:h-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Assets</span>
              <span>Liabilities</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* List/Grid Toggle Bar with Sort */}
      <ListGridToggleBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        includeGenerational={includeGenerational}
        onToggleGenerational={() => setIncludeGenerational(!includeGenerational)}
        classFilter={classFilter}
        onClearFilter={() => {
          setClassFilter('all');
          setSelectedCategory(null);
        }}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          {/* Asset Classes Grid or Scrollable View */}
          {!selectedCategory ? (
            <AssetClassGridView
              gridData={gridData}
              onCategorySelect={handleGridCategorySelect}
              formatINR={formatINR}
            />
          ) : (
            <div className="space-y-4">
              <AssetClassScrollableView
                gridData={gridData}
                selectedCategory={selectedCategory}
                onCategorySelect={handleGridCategorySelect}
                formatINR={formatINR}
              />
              
              <AssetDetailsPanel
                selectedCategory={selectedCategory}
                selectedCategoryData={assetCategories.find(cat => cat.id === selectedCategory) || null}
                assets={assets}
                assetDetailViewMode={assetDetailViewMode}
                onAssetDetailViewModeChange={setAssetDetailViewMode}
                expandedSubcategories={expandedSubcategories}
                onToggleSubcategory={toggleSubcategory}
                onAddAsset={handleAddAsset}
                onEditCategory={(categoryId) => console.log('Edit category:', categoryId)}
                onDeleteCategory={(categoryId) => console.log('Delete category:', categoryId)}
                onEditAsset={handleEditAsset}
                onDeleteAsset={handleDeleteAsset}
                onToggleAssetVisibility={toggleAssetVisibility}
                formatINR={formatINR}
              />
            </div>
          )}

          {/* Financial Summary - Below Grid in Grid View */}
          <FinancialSummary
            gridData={gridData}
            assets={assets}
            formatINR={formatINR}
          />
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-3 sm:space-y-4">
          {/* List view categories */}
          {filteredCategories.map(category => {
            const categoryAssets = assets.filter(asset => asset.category === category.id);
            const categoryTotal = assetTotals[category.id] || 0;
            const isExpanded = expandedCategories.has(category.id);
            const Icon = category.icon;
            
            return (
              <Card key={category.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div 
                    className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <Icon 
                          className="w-4 h-4 sm:w-5 sm:h-5" 
                          style={{ color: category.color }}
                        />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-foreground">{category.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {categoryAssets.length} items
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className={`text-sm sm:text-base font-semibold ${
                          category.type === 'liability' 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {category.type === 'liability' ? '-' : ''}
                          {formatINR(Math.abs(categoryTotal))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {totalAssets > 0 ? (Math.abs(categoryTotal) / totalAssets * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <AddAssetCTA
                          onAddAsset={() => handleAddAsset(category.id)}
                          size="sm"
                          title="Add Asset"
                        />
                        
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Category Assets */}
                  {isExpanded && categoryAssets.length > 0 && (
                    <div className="border-t border-border">
                      {categoryAssets.map(asset => (
                        <div 
                          key={asset.id}
                          className={`flex items-center justify-between p-3 sm:p-4 border-b border-border last:border-b-0 ${
                            !asset.includeInNetWorth ? 'opacity-60' : ''
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm sm:text-base font-medium text-foreground">{asset.name}</h4>
                              {!asset.includeInNetWorth && (
                                <EyeOff className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground">{asset.subcategory}</p>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className={`text-sm sm:text-base font-semibold ${
                                category.type === 'liability' 
                                  ? 'text-red-600' 
                                  : 'text-green-600'
                              }`}>
                                {category.type === 'liability' ? '-' : ''}
                                {formatINR(asset.value)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Updated: {new Date(asset.lastUpdated).toLocaleDateString()}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleAssetVisibility(asset.id)}
                                className="p-1 h-6 w-6 sm:h-8 sm:w-8"
                              >
                                {asset.includeInNetWorth ? (
                                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                ) : (
                                  <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
                                )}
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditAsset(asset)}
                                className="p-1 h-6 w-6 sm:h-8 sm:w-8"
                              >
                                <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAsset(asset.id)}
                                className="p-1 h-6 w-6 sm:h-8 sm:w-8 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Financial Summary - Bottom in List View */}
          <FinancialSummary
            gridData={gridData}
            assets={assets}
            formatINR={formatINR}
          />
        </div>
      )}

      {/* Add Asset Modal */}
      <AddAssetModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAddAsset={handleAssetAdded}
        defaultCategory={addModalCategory}
        mode={addModalMode}
        assetType={addModalAssetType}
      />
    </div>
  );
};

// Main NetWorthSection Component with Error Boundary
const NetWorthSection: React.FC = () => {
  const fallbackUI = (
    <div className="space-y-4 sm:space-y-6">
      <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
        <CardContent className="p-4 sm:p-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Something went wrong</h3>
            <p className="text-red-600 mb-4">
              An unexpected error occurred while loading your net worth data.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ErrorBoundary
      fallback={fallbackUI}
      onError={(error, errorInfo) => {
        console.error('NetWorthSection Error:', error, errorInfo);
        // TODO: Send error to monitoring service
      }}
    >
      <NetWorthSectionContent />
    </ErrorBoundary>
  );
};

export default NetWorthSection; 