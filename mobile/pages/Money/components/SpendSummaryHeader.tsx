import React, { useState } from 'react';
import { Edit2, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SpendSummaryData {
  currentSpend: number;
  budget?: number;
  lastMonthSpend: number;
  percentageChange: number;
}

export interface SpendSummaryHeaderProps {
  data: SpendSummaryData;
  onBudgetEdit?: (newBudget: number) => void;
  className?: string;
}

const formatINR = (amount: number): string => {
  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);
  
  if (absoluteAmount >= 10000000) {
    return `${isNegative ? '-' : ''}₹${(absoluteAmount / 10000000).toFixed(1)}Cr`;
  } else if (absoluteAmount >= 100000) {
    return `${isNegative ? '-' : ''}₹${(absoluteAmount / 100000).toFixed(1)}L`;
  } else if (absoluteAmount >= 1000) {
    return `${isNegative ? '-' : ''}₹${(absoluteAmount / 1000).toFixed(1)}K`;
  } else {
    return `${isNegative ? '-' : ''}₹${absoluteAmount}`;
  }
};

/**
 * Get budget usage color based on spend percentage
 * < 50% → Green, 50-75% → Yellow, 75-100% → Orange, > 100% → Red
 */
const getBudgetUsageColor = (currentSpend: number, budget?: number): string => {
  if (!budget || budget <= 0) return 'text-foreground';
  
  const percentage = (currentSpend / budget) * 100;
  
  if (percentage < 50) {
    return 'text-green-500'; // Low usage - Green
  } else if (percentage < 75) {
    return 'text-yellow-500'; // Medium usage - Yellow
  } else if (percentage <= 100) {
    return 'text-orange-500'; // High usage - Orange
  } else {
    return 'text-red-500'; // Over budget - Red
  }
};

const SpendSummaryHeader: React.FC<SpendSummaryHeaderProps> = ({
  data,
  onBudgetEdit,
  className
}) => {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(data.budget?.toString() || '');

  const handleBudgetSave = () => {
    const newBudget = parseFloat(budgetInput);
    if (!isNaN(newBudget) && newBudget > 0) {
      onBudgetEdit?.(newBudget);
    }
    setIsEditingBudget(false);
  };

  const handleBudgetCancel = () => {
    setBudgetInput(data.budget?.toString() || '');
    setIsEditingBudget(false);
  };

  const isIncrease = data.percentageChange > 0;
  const TrendIcon = isIncrease ? TrendingUp : TrendingDown;
  const budgetUsageColor = getBudgetUsageColor(data.currentSpend, data.budget);

  return (
    <div 
      className={cn("space-y-3", className)}
      data-testid="spend-summary-header"
    >
      {/* This month spend */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">This month so far</p>
          <div className="flex items-baseline gap-2">
            <span 
              className={cn(
                "text-xl sm:text-2xl font-bold", // Smaller on mobile
                budgetUsageColor
              )}
              data-testid="current-spend"
            >
              {formatINR(data.currentSpend)}
            </span>
            {data.budget && (
              <span className="text-sm text-muted-foreground">
                / {formatINR(data.budget)}
              </span>
            )}
            {onBudgetEdit && !isEditingBudget && (
              <button
                onClick={() => setIsEditingBudget(true)}
                className="p-1 rounded hover:bg-muted/50 transition-colors"
                aria-label="Edit budget"
                data-testid="budget-edit-button"
              >
                <Edit2 className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        <div className="text-right space-y-1">
          <p className="text-sm text-muted-foreground">Last month</p>
          <span 
            className="text-lg font-semibold text-foreground"
            data-testid="last-month-spend"
          >
            {formatINR(data.lastMonthSpend)}
          </span>
        </div>
      </div>

      {/* Budget editing */}
      {isEditingBudget && (
        <div 
          className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg"
          data-testid="budget-edit-form"
        >
          <span className="text-sm text-muted-foreground">Budget:</span>
          <input
            type="number"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Enter budget amount"
            autoFocus
            data-testid="budget-input"
          />
          <button
            onClick={handleBudgetSave}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            data-testid="budget-save-button"
          >
            Save
          </button>
          <button
            onClick={handleBudgetCancel}
            className="px-3 py-1 text-sm border rounded hover:bg-muted/50 transition-colors"
            data-testid="budget-cancel-button"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Percentage change */}
      <div className="flex items-center gap-2">
        <TrendIcon 
          className={cn(
            "h-4 w-4",
            isIncrease ? "text-red-500" : "text-green-500"
          )} 
        />
        <span 
          className={cn(
            "text-sm font-medium",
            isIncrease ? "text-red-500" : "text-green-500"
          )}
          data-testid="percentage-change"
        >
          {Math.abs(data.percentageChange).toFixed(1)}% {isIncrease ? 'increase' : 'decrease'} from last month
        </span>
      </div>
    </div>
  );
};

export default SpendSummaryHeader; 