import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { cn } from '@/lib/utils';

export type ChartType = 'line' | 'bar';
export type ChartPeriod = 'daily' | 'monthly';

export interface TrendChartData {
  date: string;
  value: number;
  budget?: number;
}

export interface TrendChartProps {
  data: TrendChartData[];
  chartType?: ChartType;
  period?: ChartPeriod;
  showBudgetLine?: boolean;
  budget?: number;
  color?: string;
  className?: string;
  onPeriodChange?: (period: ChartPeriod) => void;
}

const formatINR = (amount: number): string => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  } else {
    return `₹${amount}`;
  }
};

const formatDate = (dateString: string, period: ChartPeriod): string => {
  const date = new Date(dateString);
  if (period === 'daily') {
    return date.getDate().toString();
  } else {
    // For monthly view, show month abbreviation and year if different from current
    const currentYear = new Date().getFullYear();
    const dateYear = date.getFullYear();
    
    if (dateYear !== currentYear) {
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short' });
    }
  }
};

const CustomTooltip = ({ active, payload, label, period }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-md">
        <p className="text-sm font-medium">
          {period === 'daily' ? `Day ${label}` : label}
        </p>
        <p className="text-sm text-primary">
          Amount: {formatINR(data.value)}
        </p>
        {data.budget && (
          <p className="text-sm text-muted-foreground">
            Budget: {formatINR(data.budget)}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  chartType = 'line',
  period = 'daily',
  showBudgetLine = false,
  budget,
  color = '#3B82F6',
  className,
  onPeriodChange
}) => {
  const chartData = data.map(item => ({
    ...item,
    displayDate: formatDate(item.date, period)
  }));

  const ChartComponent = chartType === 'line' ? LineChart : BarChart;

  // Calculate daily budget if showing budget line and period is daily
  const dailyBudget = showBudgetLine && budget && period === 'daily' 
    ? budget / 30  // Approximate daily budget
    : budget;

  return (
    <div 
      className={cn("w-full", className)}
      data-testid="trend-chart"
    >
      {/* Chart container with exact width matching */}
      <div className="w-full h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: 10,
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--muted))" 
              opacity={0.3}
            />
            <XAxis 
              dataKey="displayDate"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              height={30}
            />
            <YAxis 
              tickFormatter={formatINR}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              width={50}
            />
            <Tooltip content={<CustomTooltip period={period} />} />
            
            {/* Enhanced Budget Line */}
            {showBudgetLine && dailyBudget && (
              <ReferenceLine
                y={dailyBudget}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                opacity={0.6}
                label={{ 
                  value: period === 'daily' ? "Daily Budget" : "Budget", 
                  position: "top",
                  offset: 10,
                  style: { 
                    fontSize: '12px', 
                    fill: 'hsl(var(--muted-foreground))',
                    fontWeight: 500
                  }
                }}
              />
            )}
            
            {chartType === 'line' ? (
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2.5}
                dot={{ r: 4, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: color, strokeWidth: 2, stroke: '#fff' }}
              />
            ) : (
              <Bar
                dataKey="value"
                fill={color}
                radius={[2, 2, 0, 0]}
                opacity={0.8}
              />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>

      {/* Period Toggle - Only render if onPeriodChange is provided */}
      {onPeriodChange && (
        <div className="flex justify-center">
          <div className="inline-flex bg-muted/50 rounded-lg p-1">
            <button
              onClick={() => onPeriodChange('daily')}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                period === 'daily'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              data-testid="daily-period-button"
            >
              Daily
            </button>
            <button
              onClick={() => onPeriodChange('monthly')}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                period === 'monthly'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              data-testid="monthly-period-button"
            >
              Monthly
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendChart; 