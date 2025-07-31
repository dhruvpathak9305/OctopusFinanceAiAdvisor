import { useState, useCallback } from 'react';

export interface AccountData {
  id: string;
  name: string;
  accountName: string;
  value: number;
  percentage: number;
  institution: string;
  color: string;
}

export const useAccountSelection = () => {
  const [selectedAccount, setSelectedAccount] = useState<AccountData | null>(null);

  const selectAccount = useCallback((account: AccountData) => {
    setSelectedAccount(prevSelected => 
      prevSelected?.id === account.id ? null : account
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedAccount(null);
  }, []);

  const isSelected = useCallback((accountId: string) => {
    return selectedAccount?.id === accountId;
  }, [selectedAccount]);

  return {
    selectedAccount,
    selectAccount,
    clearSelection,
    isSelected,
  };
}; 