import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface GridDataItem {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  value: number;
  percentage: number;
  itemCount: number;
}

interface AssetClassScrollableViewProps {
  gridData: GridDataItem[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
  formatINR: (amount: number) => string;
}

const AssetClassScrollableView: React.FC<AssetClassScrollableViewProps> = ({
  gridData,
  selectedCategory,
  onCategorySelect,
  formatINR,
}) => {
  return (
    <div className="overflow-x-auto scrollbar-hide pb-2 px-1 mt-2">
      <div className="flex space-x-3 min-w-max">
        {gridData.map(category => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          
          return (
            <Card 
              key={category.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md flex-shrink-0 w-32 sm:w-36 ${
                isSelected ? 'ring-2 ring-yellow-400 bg-yellow-50 dark:bg-yellow-900/10 mt-1' : ''
              }`}
              onClick={() => onCategorySelect(category.id)}
            >
              <CardContent className="p-3 sm:p-4 text-center">
                <div 
                  className="p-2 sm:p-3 rounded-lg mx-auto mb-2 sm:mb-3 w-fit"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <Icon 
                    className="w-4 h-4 sm:w-6 sm:h-6" 
                    style={{ color: category.color }}
                  />
                </div>
                <h3 className="text-xs sm:text-sm font-medium text-foreground mb-1 leading-tight">
                  {category.name}
                </h3>
                <p className={`text-xs sm:text-sm font-semibold ${
                  category.id === 'liabilities' 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  {category.id === 'liabilities' && category.value < 0 ? '-' : ''}
                  {formatINR(Math.abs(category.value))}
                </p>
                <p className="text-xs text-muted-foreground">
                  {category.itemCount} items
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AssetClassScrollableView; 