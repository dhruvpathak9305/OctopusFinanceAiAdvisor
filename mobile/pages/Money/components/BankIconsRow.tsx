import React from 'react';
import { cn } from '@/lib/utils';
import { getBankConfig, DEFAULT_BANK_CONFIG } from '@/config/bankConfig';

export interface BankIconsRowProps {
  accounts: Array<{
    id: string;
    name: string;
    institution?: string;
    balance: number;
    type?: string;
  }>;
  selectedAccountId?: string | null; // null means no specific account selected (show all)
  onAccountSelect?: (account: any | null) => void; // null for deselecting
  className?: string;
}

// Format: ₹9.2K, ₹2.89L, ₹1.1Cr
const formatAbbreviatedBalance = (amount: number): string => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(amount >= 100000000 ? 0 : 1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(amount >= 1000000 ? 0 : 1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(amount >= 10000 ? 0 : 1)}K`;
  return `₹${amount.toFixed(0)}`;
};

const BankIconsRow: React.FC<BankIconsRowProps> = ({ 
  accounts, 
  selectedAccountId = null,
  onAccountSelect, 
  className 
}) => {
  if (accounts.length === 0) return null;

  return (
    <div 
      className={cn("flex gap-3 overflow-x-auto scrollbar-hide px-2 py-3", className)}
      data-testid="bank-icons-row"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* Individual Account Icons */}
      {accounts.map((account) => {
        const bankConfig = getBankConfig(account.institution || '') || DEFAULT_BANK_CONFIG;
        const isSelected = selectedAccountId === account.id;
        const hasSelection = selectedAccountId !== null;

        return (
          <button
            key={account.id}
            onClick={() => {
              // If clicking on already selected account, deselect it (show all)
              // Otherwise, select this account
              const newSelection = isSelected ? null : account;
              onAccountSelect?.(newSelection);
            }}
            className={cn(
              "flex flex-col items-center gap-1 min-w-fit transition-all duration-200",
              isSelected 
                ? "scale-105" 
                : hasSelection 
                  ? "opacity-60 hover:opacity-80" 
                  : "hover:opacity-80"
            )}
            data-testid={`account-icon-${account.id}`}
          >
            {/* Icon Circle */}
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
                isSelected 
                  ? "ring-2 ring-offset-2 ring-offset-background shadow-lg" 
                  : "shadow-md"
              )}
              style={{ 
                backgroundColor: bankConfig.primaryColor,
                ...(isSelected && { 
                  '--tw-ring-color': bankConfig.primaryColor 
                } as React.CSSProperties)
              }}
            >
              {bankConfig.logoPath ? (
                <img
                  src={bankConfig.logoPath}
                  alt={bankConfig.name}
                  className="w-5 h-5 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<i class="fas fa-university text-white text-sm"></i>';
                    }
                  }}
                />
              ) : (
                <i className="fas fa-university text-white text-sm"></i>
              )}
            </div>

            {/* Balance */}
            <span className={cn(
              "text-xs font-medium transition-colors",
              isSelected 
                ? "text-foreground" 
                : hasSelection 
                  ? "text-muted-foreground" 
                  : "text-foreground"
            )}>
              {formatAbbreviatedBalance(account.balance)}
            </span>

            {/* Bank Name (truncated) */}
            <span className={cn(
              "text-[10px] transition-colors max-w-16 truncate",
              isSelected 
                ? "text-foreground font-medium" 
                : hasSelection 
                  ? "text-muted-foreground" 
                  : "text-muted-foreground"
            )}>
              {account.institution || account.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default BankIconsRow;
