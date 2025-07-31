import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MonthSelectorProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  className?: string;
}

const formatMonth = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
};

const MonthSelector: React.FC<MonthSelectorProps> = ({
  currentMonth,
  onMonthChange,
  className
}) => {
  const handlePreviousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    onMonthChange(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    onMonthChange(nextMonth);
  };

  return (
    <div 
      className={cn("flex items-center justify-between", className)}
      data-testid="month-selector"
    >
      <button
        onClick={handlePreviousMonth}
        className="p-2 rounded-full hover:bg-muted/50 transition-colors"
        aria-label="Previous month"
        data-testid="prev-month-button"
      >
        <ChevronLeft className="h-5 w-5 text-muted-foreground" />
      </button>

      <div className="flex-1 text-center">
        <h2 
          className="text-lg font-semibold text-foreground"
          data-testid="current-month"
        >
          {formatMonth(currentMonth)}
        </h2>
      </div>

      <button
        onClick={handleNextMonth}
        className="p-2 rounded-full hover:bg-muted/50 transition-colors"
        aria-label="Next month"
        data-testid="next-month-button"
      >
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </button>
    </div>
  );
};

export default MonthSelector; 