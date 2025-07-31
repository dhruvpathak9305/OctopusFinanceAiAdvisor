import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, X, Banknote, TrendingUp, Building, Home, Coins, Shield, Briefcase, Car, Heart, Gift, AlertTriangle } from 'lucide-react';
import { Asset } from './NetWorthSection';
import { useNetWorthData } from '@/contexts/NetWorthContext';

// Icon mapping for categories
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
  'default': Banknote
};

interface AddAssetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAsset: (asset: Omit<Asset, 'id' | 'lastUpdated'>) => void;
  defaultCategory?: string;
  mode?: 'asset' | 'category';
  assetType?: 'asset' | 'liability';
}

const AddAssetModal: React.FC<AddAssetModalProps> = ({
  open,
  onOpenChange,
  onAddAsset,
  defaultCategory = 'liquid',
  mode = 'asset',
  assetType = 'asset'
}) => {
  // Get dynamic categories from context
  const { categories, subcategories, loading: categoriesLoading } = useNetWorthData();

  // Convert database categories to frontend format
  const assetCategories = useMemo(() => {
    return categories.map(category => {
      const IconComponent = ICON_MAPPING[category.icon || 'default'] || ICON_MAPPING.default;
      const frontendId = category.name.toLowerCase().replace(/\s+/g, '');
      const categorySubcategories = subcategories.get(category.id) || [];
      
      return {
        id: frontendId,
        name: category.name,
        icon: IconComponent,
        color: category.color || '#6B7280',
        type: category.type,
        databaseId: category.id,
        sortOrder: category.sort_order,
        subcategories: categorySubcategories.map(sub => sub.name)
      };
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories, subcategories]);

  const [formData, setFormData] = useState({
    name: '',
    category: defaultCategory,
    subcategory: '',
    value: '',
    notes: '',
    quantity: '',
    marketPrice: '',
    isActive: true,
    includeInNetWorth: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingSubcategory, setIsCreatingSubcategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');

  const selectedCategory = assetCategories.find(cat => cat.id === formData.category);

  // Filter categories based on asset type when in category mode
  const availableCategories = useMemo(() => {
    if (mode === 'category') {
      return assetCategories.filter(cat => 
        assetType === 'liability' 
          ? cat.type === 'liability'
          : cat.type === 'asset'
      );
    }
    return assetCategories;
  }, [mode, assetType, assetCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Asset name is required';
    }
    
    if (!formData.value || isNaN(Number(formData.value)) || Number(formData.value) <= 0) {
      newErrors.value = 'Please enter a valid positive amount';
    }
    
    if (!formData.subcategory) {
      newErrors.subcategory = 'Please select a subcategory';
    }

    if (formData.quantity && isNaN(Number(formData.quantity))) {
      newErrors.quantity = 'Quantity must be a valid number';
    }

    if (formData.marketPrice && isNaN(Number(formData.marketPrice))) {
      newErrors.marketPrice = 'Market price must be a valid number';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // Create asset object
      const newAsset: Omit<Asset, 'id' | 'lastUpdated'> = {
        name: formData.name.trim(),
        category: formData.category,
        subcategory: formData.subcategory,
        value: Number(formData.value),
        quantity: formData.quantity ? Number(formData.quantity) : undefined,
        marketPrice: formData.marketPrice ? Number(formData.marketPrice) : undefined,
        notes: formData.notes.trim() || undefined,
        isActive: formData.isActive,
        includeInNetWorth: formData.includeInNetWorth,
      };
      
      onAddAsset(newAsset);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      category: defaultCategory,
      subcategory: '',
      value: '',
      quantity: '',
      marketPrice: '',
      notes: '',
      isActive: true,
      includeInNetWorth: true,
    });
    setErrors({});
    onOpenChange(false);
  };

  const handleCategoryChange = (newCategory: string) => {
    setFormData(prev => ({
      ...prev,
      category: newCategory,
      subcategory: '' // Reset subcategory when category changes
    }));
  };

  // Add handlers for category/subcategory creation
  const handleAddNewCategory = () => {
    console.log('Add new category:', newCategoryName);
    setIsCreatingCategory(false);
    setNewCategoryName('');
    // In a real implementation, this would create a new category
  };

  const handleAddNewSubcategory = () => {
    console.log('Add new subcategory:', newSubcategoryName);
    setIsCreatingSubcategory(false);
    setNewSubcategoryName('');
    // In a real implementation, this would create a new subcategory
  };

  // Update dialog title based on mode
  const getDialogTitle = () => {
    if (mode === 'category') {
      return `Add New ${assetType === 'liability' ? 'Liability' : 'Asset'} Class`;
    }
    return 'Add New Asset';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto border-2 border-yellow-400 bg-background">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-semibold">
            {getDialogTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 text-sm">
          {/* Asset/Category Name */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="name" className="text-xs sm:text-sm font-medium">
              {mode === 'category' ? 'Category Name *' : 'Asset Name *'}
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={mode === 'category' 
                ? 'e.g., Custom Investment Category' 
                : 'e.g., HDFC Savings Account, Reliance Industries'
              }
              className="text-sm h-9"
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
          </div>

          {/* Category Selection (only in asset mode) */}
          {mode === 'asset' && (
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="category" className="text-xs sm:text-sm font-medium">
                Category *
              </Label>
              <div className="flex items-center space-x-2">
                <Select
                  value={formData.category}
                  onValueChange={(value) => {
                    setFormData({ ...formData, category: value, subcategory: '' });
                    setErrors({ ...errors, category: '', subcategory: '' });
                  }}
                >
                  <SelectTrigger className="text-sm h-9 flex-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  type="button"
                  variant="outline"
                  className="p-1 h-9 w-9 flex-shrink-0"
                  onClick={() => setIsCreatingCategory(true)}
                  title="Add new category"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {errors.category && <p className="text-red-500 text-xs">{errors.category}</p>}
            </div>
          )}

          {/* Subcategory Selection (only in asset mode) */}
          {mode === 'asset' && (
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="subcategory" className="text-xs sm:text-sm font-medium">
                Subcategory *
              </Label>
              <div className="flex items-center space-x-2">
                <Select
                  value={formData.subcategory}
                  onValueChange={(value) => {
                    setFormData({ ...formData, subcategory: value });
                    setErrors({ ...errors, subcategory: '' });
                  }}
                >
                  <SelectTrigger className="text-sm h-9 flex-1">
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCategory?.subcategories.map(subcategory => (
                      <SelectItem key={subcategory} value={subcategory}>
                        {subcategory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  type="button"
                  variant="outline"
                  className="p-1 h-9 w-9 flex-shrink-0"
                  onClick={() => setIsCreatingSubcategory(true)}
                  title="Add new subcategory"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {errors.subcategory && <p className="text-red-500 text-xs">{errors.subcategory}</p>}
            </div>
          )}

          {/* Asset Type Selection (only in category mode) */}
          {mode === 'category' && (
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm font-medium">
                Type *
              </Label>
              <Select
                value={assetType}
                onValueChange={() => {}} // Read-only in this implementation
              >
                <SelectTrigger className="text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asset">Asset</SelectItem>
                  <SelectItem value="liability">Liability</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Value */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="value" className="text-xs sm:text-sm font-medium">Value (₹) *</Label>
            <Input
              id="value"
              type="number"
              value={formData.value}
              onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
              placeholder="Enter amount in rupees"
              min="0"
              step="0.01"
              className={`text-sm h-9 ${errors.value ? 'border-red-500' : ''}`}
            />
            {errors.value && <p className="text-xs text-red-500">{errors.value}</p>}
          </div>

          {/* Quantity and Market Price (for investments) */}
          {selectedCategory && ['equity', 'debt', 'alternative'].some(type => 
            selectedCategory.name.toLowerCase().includes(type) || 
            selectedCategory.name.toLowerCase().includes('investment')
          ) && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="quantity" className="text-xs sm:text-sm font-medium">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="Units/Shares"
                  min="0"
                  step="0.01"
                  className={`text-sm h-9 ${errors.quantity ? 'border-red-500' : ''}`}
                />
                {errors.quantity && <p className="text-xs text-red-500">{errors.quantity}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="marketPrice" className="text-xs sm:text-sm font-medium">Market Price (₹)</Label>
                <Input
                  id="marketPrice"
                  type="number"
                  value={formData.marketPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, marketPrice: e.target.value }))}
                  placeholder="Price per unit"
                  min="0"
                  step="0.01"
                  className={`text-sm h-9 ${errors.marketPrice ? 'border-red-500' : ''}`}
                />
                {errors.marketPrice && <p className="text-xs text-red-500">{errors.marketPrice}</p>}
              </div>
            </div>
          )}

          {/* Show loading state if categories are being loaded */}
          {categoriesLoading && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Loading categories...</p>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="notes" className="text-xs sm:text-sm font-medium">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional details about this asset..."
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          {/* Switches */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs sm:text-sm font-medium">Include in Net Worth</Label>
                <p className="text-xs text-muted-foreground">
                  Whether to include this asset in net worth calculations
                </p>
              </div>
              <Switch
                checked={formData.includeInNetWorth}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, includeInNetWorth: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs sm:text-sm font-medium">Active Asset</Label>
                <p className="text-xs text-muted-foreground">
                  Whether this asset is currently active/held
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isActive: checked }))
                }
              />
            </div>
          </div>
        </form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={handleClose} className="text-sm h-9">
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} className="text-sm h-9">
            {mode === 'category' ? 'Create Category' : 'Add Asset'}
          </Button>
        </DialogFooter>

        {/* Category Creation Modal */}
        {isCreatingCategory && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-background p-6 rounded-lg max-w-sm w-full mx-4 border-2 border-yellow-400">
              <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="mb-4"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreatingCategory(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddNewCategory}
                  className="flex-1"
                  disabled={!newCategoryName.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Subcategory Creation Modal */}
        {isCreatingSubcategory && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-background p-6 rounded-lg max-w-sm w-full mx-4 border-2 border-yellow-400">
              <h3 className="text-lg font-semibold mb-4">Add New Subcategory</h3>
              <Input
                value={newSubcategoryName}
                onChange={(e) => setNewSubcategoryName(e.target.value)}
                placeholder="Subcategory name"
                className="mb-4"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreatingSubcategory(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddNewSubcategory}
                  className="flex-1"
                  disabled={!newSubcategoryName.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddAssetModal; 