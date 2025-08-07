import React from 'react';
import { formatCompactINR, formatFullINR } from './utils/formatters';
import { AccountData } from './hooks/useAccountSelection';

interface AccountChipsProps {
  chartData: AccountData[];
  selectedAccount: AccountData | null;
  onAccountSelect: (account: AccountData) => void;
}

const AccountChips: React.FC<AccountChipsProps> = ({
  chartData,
  selectedAccount,
  onAccountSelect,
}) => {
  return (
    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
      {chartData.map((entry, index) => (
        <button
          key={index}
          onClick={() => onAccountSelect(entry)}
          className={`flex items-center gap-2 p-2 rounded-lg transition-all hover:bg-muted/50 ${
            selectedAccount?.id === entry.id ? 'bg-muted ring-2 ring-primary/20' : ''
          }`}
        >
          <div
            className={`w-3 h-3 rounded transition-all ${
              selectedAccount?.id === entry.id ? 'ring-2 ring-white shadow-md' : ''
            }`}
            style={{ backgroundColor: entry.color }}
          />
          <div className="min-w-0 flex-1 text-left">
            <p className={`font-medium truncate ${
              selectedAccount?.id === entry.id ? 'text-foreground' : 'text-foreground/80'
            }`}>
              {entry.institution}
            </p>
            <div className="flex items-center gap-1 text-[10px]">
              <span className="text-green-500 font-semibold">
                {selectedAccount?.id === entry.id 
                  ? formatFullINR(entry.value).replace('₹', '₹')
                  : formatCompactINR(entry.value)
                }
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-yellow-500 font-medium">
                {entry.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default AccountChips; 