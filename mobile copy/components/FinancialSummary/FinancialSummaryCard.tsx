import React from 'react';
import { Card } from "@/components/ui/card";
import { Loader, Plus } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface FinancialSummaryCardProps {
  title: string;
  iconClass: string;
  data: Array<{ month: string; value: number }>;
  total: number;
  monthlyChange: string;
  themeColor: string;
  loading: boolean;
  error: string | null;
  onViewAll: () => void;
  onAddNew?: () => void;
}

const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({
  title,
  iconClass,
  data,
  total,
  monthlyChange,
  themeColor,
  loading,
  error,
  onViewAll,
  onAddNew
}) => {
  if (loading) {
    return (
      <Card className="p-4 h-[180px] bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden relative">
        <div className="flex h-full w-full items-center justify-center">
          <Loader className="h-8 w-8 text-primary animate-spin" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 h-[180px] bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden relative">
        <div className="flex h-full w-full items-center justify-center flex-col">
          <p className="text-sm text-red-500 mb-2">Error</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </Card>
    );
  }

  const chartLineColor = themeColor;
  const tooltipBgColor = '#f9fafb';
  const tooltipTextColor = '#1f2937';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 rounded-md shadow-md text-xs" style={{ backgroundColor: tooltipBgColor, color: tooltipTextColor }}>
          <p>{`${label}: ${new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
          }).format(payload[0].value)}`}</p>
          <p>{`Month: ${label}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-4 h-[180px] bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden relative">
      <div className="relative z-10 h-full">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
              <i className={iconClass}></i>
              {title}
            </h3>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0,
              }).format(total)}
            </p>
            <div className="inline-flex items-center mt-1 px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
              <i className="fas fa-arrow-up mr-1 text-xs text-green-500"></i>
              <span className="text-xs font-medium text-green-500">{monthlyChange} from last month</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 mb-2">
              <button
                className="text-xs text-primary hover:underline"
                onClick={onViewAll}
              >
                View All
              </button>
              {onAddNew && (
                <button
                  onClick={onAddNew}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Add new"
                >
                  <Plus className="h-3 w-3 text-primary" />
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="h-[60px] w-full mt-2 touch-pan-y overflow-hidden" 
             style={{ touchAction: 'pan-y' }}
             onTouchStart={(e) => {
               // Allow chart interaction - stop event propagation to parent card
               e.stopPropagation();
             }}
             onTouchMove={(e) => {
               // Allow chart interaction - stop event propagation to parent card
               e.stopPropagation();
             }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id={`summaryGradient-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartLineColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartLineColor} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartLineColor}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#summaryGradient-${title.replace(/\s+/g, '')})`}
                activeDot={{ r: 4, strokeWidth: 0, fill: chartLineColor }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default FinancialSummaryCard;
