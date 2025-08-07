import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface GridDataItem {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  type?: 'asset' | 'liability';
  value: number;
  percentage: number;
  itemCount: number;
}

interface AssetClassGridViewProps {
  gridData: GridDataItem[];
  onCategorySelect: (categoryId: string) => void;
  formatINR: (amount: number) => string;
}

const AssetClassGridView: React.FC<AssetClassGridViewProps> = ({
  gridData,
  onCategorySelect,
  formatINR,
}) => {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {gridData.map(category => {
        const Icon = category.icon;
        
        return (
          <Card 
            key={category.id} 
            className="cursor-pointer transition-all duration-200 hover:shadow-md"
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
                category.type === 'liability' 
                  ? 'text-red-600' 
                  : 'text-green-600'
              }`}>
                {category.type === 'liability' && category.value < 0 ? '-' : ''}
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
  );
};

export default AssetClassGridView; 