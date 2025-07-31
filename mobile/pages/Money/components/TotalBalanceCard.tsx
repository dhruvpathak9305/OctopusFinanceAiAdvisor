import React, { useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getBankConfig, DEFAULT_BANK_CONFIG } from '@/config/bankConfig';
import { useAccountSelection, AccountData } from './hooks/useAccountSelection';
import { formatCompactINR } from './utils/formatters';
import TotalBalanceHeader from './TotalBalanceHeader';
import AccountDistributionChart from './AccountDistributionChart';
import AccountChips from './AccountChips';

export interface TotalBalanceCardProps {
  totalBalance: number;
  lastSyncTime: string;
  accountCount: number;
  accounts: Array<{
    id: string;
    name: string;
    institution?: string;
    balance: number;
    type?: string;
  }>;
  title?: string;
  currencyFormat?: string;
}

const TotalBalanceCard: React.FC<TotalBalanceCardProps> = ({
  totalBalance,
  lastSyncTime,
  accountCount,
  accounts,
  title,
  currencyFormat = '₹',
}) => {
  const [showDistribution, setShowDistribution] = React.useState(false);
  const [hoveredAccount, setHoveredAccount] = React.useState<string | null>(null);
  
  const { selectedAccount, selectAccount, isSelected } = useAccountSelection();

  // Soft color palette for better visual consistency
  const colorPalette = [
    '#FF8C42', // Orange
    '#E74C3C', // Red
    '#9B59B6', // Purple  
    '#3498DB', // Blue
    '#2ECC71', // Green
    '#F39C12', // Yellow
    '#1ABC9C', // Teal
    '#95A5A6', // Gray for Others
  ];

  // Prepare compact donut chart data (max 4 slices + Others)
  const compactChartData = useMemo(() => {
    const sortedAccounts = accounts
      .filter((account) => account.balance > 0)
      .sort((a, b) => b.balance - a.balance);

    const topAccounts = sortedAccounts.slice(0, 3);
    const othersAccounts = sortedAccounts.slice(3);
    
    const data = topAccounts.map((account, index) => {
      const bankConfig = getBankConfig(account.institution || '') || DEFAULT_BANK_CONFIG;
      return {
        name: account.name,
        value: account.balance,
        institution: account.institution || 'Other',
        color: bankConfig.primaryColor,
        id: account.id,
      };
    });

    if (othersAccounts.length > 0) {
      const othersTotal = othersAccounts.reduce((sum, acc) => sum + acc.balance, 0);
      data.push({
        name: 'Others',
        value: othersTotal,
        institution: 'Others',
        color: '#9CA3AF',
        id: 'others',
      });
    }

    return data;
  }, [accounts]);

  // Enhanced donut chart data for expanded view
  const enhancedChartData: AccountData[] = useMemo(() => {
    const validAccounts = accounts.filter((account) => account.balance > 0);
    const sortedAccounts = validAccounts.sort((a, b) => b.balance - a.balance);
    
    // Calculate percentages
    const accountsWithPercentage = sortedAccounts.map((account, index) => {
      const percentage = (account.balance / totalBalance) * 100;
      const bankConfig = getBankConfig(account.institution || '') || DEFAULT_BANK_CONFIG;
      
      return {
        name: account.name,
        accountName: account.name,
        value: account.balance,
        percentage: percentage,
        institution: account.institution || 'Other',
        color: colorPalette[index % colorPalette.length],
        id: account.id,
      };
    });

    // Group small accounts (< 0.5%) into "Others"
    const significantAccounts = accountsWithPercentage.filter(acc => acc.percentage >= 0.5);
    const smallAccounts = accountsWithPercentage.filter(acc => acc.percentage < 0.5);
    
    const data = [...significantAccounts];
    
    if (smallAccounts.length > 0) {
      const othersTotal = smallAccounts.reduce((sum, acc) => sum + acc.value, 0);
      const othersPercentage = (othersTotal / totalBalance) * 100;
      
      data.push({
        name: 'Others',
        accountName: 'Others',
        value: othersTotal,
        percentage: othersPercentage,
        institution: 'Others',
        color: colorPalette[colorPalette.length - 1], // Gray
        id: 'others',
      });
    }

    return data;
  }, [accounts, totalBalance]);

  const CompactDonutTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover text-popover-foreground p-2 rounded-lg shadow-lg border border-border text-xs">
          <p className="font-medium">{data.name}</p>
          <p className="text-muted-foreground">{data.institution}</p>
          <p className="font-semibold">{formatCompactINR(data.value)}</p>
          <p className="text-muted-foreground text-[10px]">
            {((data.value / totalBalance) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm mb-4">
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Header with Total Balance and Compact Chart */}
          <div className="flex items-start justify-between">
            <TotalBalanceHeader
              totalBalance={totalBalance}
              lastSyncTime={lastSyncTime}
              title={title}
            />

            {/* Compact Donut Chart */}
            {compactChartData.length > 0 && (
              <div className="flex flex-col items-end">
                <div style={{ width: 80, height: 80 }} className="relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={compactChartData}
                        innerRadius={28}
                        outerRadius={38}
                        paddingAngle={1}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {compactChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            opacity={hoveredAccount === entry.id ? 0.8 : 1}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Account Count Below Chart */}
                <p className="text-xs text-muted-foreground mt-2">
                  {accountCount} account{accountCount !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>

          {/* Expandable Account Distribution */}
          {enhancedChartData.length > 0 && (
            <div className="border-t pt-4">
              <button
                onClick={() => setShowDistribution(!showDistribution)}
                className="flex items-center gap-2 text-sm font-medium text-foreground focus:outline-none hover:text-primary transition-colors"
                aria-label={showDistribution ? "Hide account breakdown" : "Show account breakdown"}
              >
                Account Distribution
                {showDistribution ? 
                  <ChevronUp className="w-4 h-4" /> : 
                  <ChevronDown className="w-4 h-4" />
                }
              </button>

              {/* Smooth Expand/Collapse Animation */}
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  showDistribution ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                {showDistribution && (
                  <div className="mt-4">
                    {/* Enhanced Donut Chart */}
                    <AccountDistributionChart
                      chartData={enhancedChartData}
                      selectedAccount={selectedAccount}
                      totalBalance={totalBalance}
                      onAccountSelect={selectAccount}
                    />

                    {/* Account Chips */}
                    <AccountChips
                      chartData={enhancedChartData}
                      selectedAccount={selectedAccount}
                      onAccountSelect={selectAccount}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TotalBalanceCard;
