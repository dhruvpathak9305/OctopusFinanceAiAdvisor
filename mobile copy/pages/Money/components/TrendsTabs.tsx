import React from 'react';
import { cn } from '@/lib/utils';

export type TrendTab = 'spend' | 'invested' | 'income';

export interface TrendsTabsProps {
  activeTab: TrendTab;
  onTabChange: (tab: TrendTab) => void;
  className?: string;
}

const tabs: { id: TrendTab; label: string; icon: string; activeColor: string; borderColor: string }[] = [
  { 
    id: 'spend', 
    label: 'Spend', 
    icon: '💸',
    activeColor: 'bg-red-500 text-white border-red-500', // Red for expense
    borderColor: 'border-red-200'
  },
  { 
    id: 'invested', 
    label: 'Invested', 
    icon: '📈',
    activeColor: 'bg-blue-500 text-white border-blue-500', // Blue for invest
    borderColor: 'border-blue-200'
  },
  { 
    id: 'income', 
    label: 'Income', 
    icon: '💰',
    activeColor: 'bg-green-500 text-white border-green-500', // Green for income
    borderColor: 'border-green-200'
  },
];

const TrendsTabs: React.FC<TrendsTabsProps> = ({
  activeTab,
  onTabChange,
  className
}) => {
  return (
    <div 
      className={cn("flex bg-muted/50 rounded-lg p-1 gap-1", className)}
      data-testid="trends-tabs"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 border",
            activeTab === tab.id
              ? tab.activeColor
              : cn(
                  "bg-background text-muted-foreground border-border",
                  "hover:text-foreground hover:bg-muted/80 hover:" + tab.borderColor
                )
          )}
          data-testid={`tab-${tab.id}`}
          aria-pressed={activeTab === tab.id}
          role="tab"
        >
          <span className="text-base" role="img" aria-hidden="true">
            {tab.icon}
          </span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TrendsTabs; 