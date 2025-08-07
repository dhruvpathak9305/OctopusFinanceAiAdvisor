import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff,
  List,
  Grid3X3,
  MoreVertical
} from 'lucide-react';
import AddAssetCTA from './AddAssetCTA';

interface Asset {
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

interface CategoryData {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  type: 'asset' | 'liability';
  subcategories: string[];
}

interface AssetDetailsPanelProps {
  selectedCategory: string;
  selectedCategoryData: CategoryData | null;
  assets: Asset[];
  assetDetailViewMode: 'list' | 'grid';
  onAssetDetailViewModeChange: (mode: 'list' | 'grid') => void;
  expandedSubcategories: Set<string>;
  onToggleSubcategory: (subcategory: string) => void;
  onAddAsset: (categoryId: string) => void;
  onEditCategory: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onEditAsset: (asset: Asset) => void;
  onDeleteAsset: (assetId: string) => void;
  onToggleAssetVisibility: (assetId: string) => void;
  formatINR: (amount: number) => string;
}

const AssetDetailsPanel: React.FC<AssetDetailsPanelProps> = ({
  selectedCategory,
  selectedCategoryData,
  assets,
  assetDetailViewMode,
  onAssetDetailViewModeChange,
  expandedSubcategories,
  onToggleSubcategory,
  onAddAsset,
  onEditCategory,
  onDeleteCategory,
  onEditAsset,
  onDeleteAsset,
  onToggleAssetVisibility,
  formatINR,
}) => {
  if (!selectedCategoryData) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-base sm:text-lg font-semibold">
              {selectedCategoryData.name}
            </h3>
            
            {/* Asset Detail View Toggle */}
            <div className="flex items-center space-x-1 ml-4">
              <Button
                variant={assetDetailViewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onAssetDetailViewModeChange('list')}
                className="p-1 h-7 w-7"
                title="List View"
              >
                <List className="w-3 h-3" />
              </Button>
              <Button
                variant={assetDetailViewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onAssetDetailViewModeChange('grid')}
                className="p-1 h-7 w-7"
                title="Grid View"
              >
                <Grid3X3 className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Add Asset CTA */}
            <AddAssetCTA 
              onAddAsset={() => onAddAsset(selectedCategory)}
              size="md"
              title="Add Asset"
            />
            
            {/* Three-dot Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="p-1 h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditCategory(selectedCategory)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Category
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDeleteCategory(selectedCategory)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Category
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Subcategories - List or Grid View */}
        {assetDetailViewMode === 'list' ? (
          // List View
          <div className="space-y-4">
            {selectedCategoryData.subcategories.map(subcategory => {
              const subcategoryAssets = assets.filter(asset => 
                asset.category === selectedCategory && 
                asset.subcategory === subcategory &&
                asset.isActive
              );
              const isExpanded = expandedSubcategories.has(subcategory);

              if (subcategoryAssets.length === 0) return null;

              return (
                <div key={subcategory} className="mb-4 last:mb-0">
                  <div 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => onToggleSubcategory(subcategory)}
                  >
                    <div>
                      <h4 className="text-sm sm:text-base font-medium">{subcategory}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {subcategoryAssets.length} assets
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-green-600">
                        {formatINR(subcategoryAssets.reduce((sum, asset) => sum + asset.value, 0))}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-2 space-y-2">
                      {subcategoryAssets.map(asset => (
                        <div 
                          key={asset.id}
                          className={`flex items-center justify-between p-3 bg-background border rounded-lg ${
                            !asset.includeInNetWorth ? 'opacity-60' : ''
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h5 className="text-sm sm:text-base font-medium text-foreground">{asset.name}</h5>
                              {!asset.includeInNetWorth && (
                                <EyeOff className="w-3 h-3 text-muted-foreground" />
                              )}
                            </div>
                            {asset.quantity && asset.marketPrice && (
                              <p className="text-xs text-muted-foreground">
                                {asset.quantity} units × ₹{asset.marketPrice}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className="text-sm font-semibold text-green-600">
                                {formatINR(asset.value)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(asset.lastUpdated).toLocaleDateString()}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onToggleAssetVisibility(asset.id)}
                                className="p-1 h-6 w-6"
                              >
                                {asset.includeInNetWorth ? (
                                  <Eye className="w-3 h-3" />
                                ) : (
                                  <EyeOff className="w-3 h-3" />
                                )}
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditAsset(asset)}
                                className="p-1 h-6 w-6"
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeleteAsset(asset.id)}
                                className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // Grid View for Assets
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {selectedCategoryData.subcategories.map(subcategory => {
              const subcategoryAssets = assets.filter(asset => 
                asset.category === selectedCategory && 
                asset.subcategory === subcategory &&
                asset.isActive
              );

              if (subcategoryAssets.length === 0) return null;

              return subcategoryAssets.map(asset => (
                <Card 
                  key={asset.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    !asset.includeInNetWorth ? 'opacity-60' : ''
                  }`}
                >
                  <CardContent className="p-3 text-center">
                    <div className="mb-2">
                      <h5 className="text-sm font-medium text-foreground mb-1 leading-tight">
                        {asset.name}
                      </h5>
                      <p className="text-xs text-muted-foreground mb-2">
                        {subcategory}
                      </p>
                      <p className="text-sm font-semibold text-green-600">
                        {formatINR(asset.value)}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleAssetVisibility(asset.id);
                        }}
                        className="p-1 h-6 w-6"
                      >
                        {asset.includeInNetWorth ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditAsset(asset);
                        }}
                        className="p-1 h-6 w-6"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteAsset(asset.id);
                        }}
                        className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ));
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssetDetailsPanel; 