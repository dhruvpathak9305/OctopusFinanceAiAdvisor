import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AccountData } from './hooks/useAccountSelection';
import DonutCenterLabel from './DonutCenterLabel';

interface AccountDistributionChartProps {
  chartData: AccountData[];
  selectedAccount: AccountData | null;
  totalBalance: number;
  onAccountSelect: (account: AccountData) => void;
}

const AccountDistributionChart: React.FC<AccountDistributionChartProps> = ({
  chartData,
  selectedAccount,
  totalBalance,
  onAccountSelect,
}) => {
  const handleDonutClick = (data: any) => {
    const accountData = data.payload;
    if (accountData) {
      onAccountSelect(accountData);
    }
  };

  return (
    <div className="relative" style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
            labelLine={false}
            onClick={handleDonutClick}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`enhanced-cell-${index}`} 
                fill={entry.color}
                opacity={
                  selectedAccount === null ? 1 : 
                  selectedAccount.id === entry.id ? 1 : 0.3
                }
                stroke={selectedAccount?.id === entry.id ? '#ffffff' : 'none'}
                strokeWidth={selectedAccount?.id === entry.id ? 2 : 0}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Label */}
      <DonutCenterLabel 
        selectedAccount={selectedAccount}
        totalBalance={totalBalance}
      />
    </div>
  );
};

export default AccountDistributionChart; 