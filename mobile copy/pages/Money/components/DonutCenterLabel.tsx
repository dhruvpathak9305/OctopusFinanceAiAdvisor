import React from 'react';
import { formatCenterAmount } from './utils/formatters';
import { AccountData } from './hooks/useAccountSelection';

interface DonutCenterLabelProps {
  selectedAccount: AccountData | null;
  totalBalance: number;
}

const DonutCenterLabel: React.FC<DonutCenterLabelProps> = ({
  selectedAccount,
  totalBalance,
}) => {
  if (selectedAccount) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-lg sm:text-xl font-bold text-foreground">
          {formatCenterAmount(selectedAccount.value)}
        </div>
        <div className="text-xs text-muted-foreground">
          {selectedAccount.institution}
        </div>
        <div className="text-xs text-yellow-500 font-medium">
          {selectedAccount.percentage.toFixed(1)}% of total
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <div className="text-lg sm:text-xl font-bold text-foreground">
        {formatCenterAmount(totalBalance)}
      </div>
      <div className="text-xs text-muted-foreground">
        Total Balance
      </div>
    </div>
  );
};

export default DonutCenterLabel; 