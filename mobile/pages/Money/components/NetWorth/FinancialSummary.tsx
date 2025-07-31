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

interface FinancialSummaryProps {
  gridData: GridDataItem[];
  assets: Asset[];
  formatINR: (amount: number) => string;
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  gridData,
  assets,
  formatINR,
}) => {
  // Find the largest asset category
  const largestAssetCategory = gridData.reduce((max, item) => 
    Math.abs(item.value) > Math.abs(max.value) ? item : max, 
    gridData[0] || { name: 'None', value: 0 }
  );

  // Find the top allocation category
  const topAllocationCategory = gridData.length > 0 ? gridData[0] : { name: 'None', percentage: 0 };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Financial Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
          
          {/* Asset Classes */}
          <div>
            <p className="text-lg sm:text-2xl font-bold text-green-600">
              {gridData.length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Asset Classes</p>
          </div>

          {/* Total Assets */}
          <div>
            <p className="text-lg sm:text-2xl font-bold text-blue-600">
              {assets.filter(a => a.isActive && a.includeInNetWorth).length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Assets</p>
          </div>

          {/* Largest Asset */}
          <div>
            <p className="text-lg sm:text-2xl font-bold text-orange-600">
              {formatINR(Math.abs(largestAssetCategory.value))}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Largest Asset</p>
          </div>

          {/* Top Allocation */}
          <div>
            <p className="text-lg sm:text-2xl font-bold text-purple-600">
              {topAllocationCategory.percentage.toFixed(1)}%
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Top Allocation</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSummary; 