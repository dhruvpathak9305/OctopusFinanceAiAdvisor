import React, { useState, useMemo } from 'react';
import { useAccounts } from '@/contexts/AccountsContext';
import FilterBar from './FilterBar';
import TotalBalanceCard from './TotalBalanceCard';
import BankIconsRow from './BankIconsRow';
import ExtraCashInBankCard from '@/components/common/ExtraCashInBankCard/ExtraCashInBankCard';
import TrendsSection from './TrendsSection';
import AddAccountModal from '@/components/common/AddAccountModal';

export interface AccountsSectionProps {
  onAccountSelect?: (account: any) => void;
}

const AccountsSection: React.FC<AccountsSectionProps> = ({
  onAccountSelect,
}) => {
  const { accounts, loading } = useAccounts();
  const [selectedInstitution, setSelectedInstitution] = useState("All");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter out credit cards and get only bank accounts
  const bankAccounts = useMemo(() => {
    return accounts.filter(
      (account) =>
        account.type !== "Credit Card" &&
        account.type !== "Credit" &&
        account.type !== "Loan"
    );
  }, [accounts]);

  // Get unique institutions for filter chips
  const institutions = useMemo(() => {
    const uniqueInstitutions = [
      ...new Set(bankAccounts.map((account) => account.institution).filter(Boolean)),
    ];
    return uniqueInstitutions.sort();
  }, [bankAccounts]);

  // Filter accounts based on selected institution
  const filteredAccounts = useMemo(() => {
    if (selectedInstitution === "All") {
      return bankAccounts;
    }
    return bankAccounts.filter((account) => account.institution === selectedInstitution);
  }, [bankAccounts, selectedInstitution]);

  // Calculate total balance
  const totalBalance = useMemo(() => {
    return filteredAccounts.reduce((sum, account) => sum + account.balance, 0);
  }, [filteredAccounts]);

  // Get the most recent sync time from all accounts
  const lastSyncTime = useMemo(() => {
    const syncTimes = filteredAccounts
      .map(account => account.last_sync)
      .filter(Boolean)
      .sort()
      .reverse();
    
    return syncTimes[0] || new Date().toISOString(); // Fallback to current time
  }, [filteredAccounts]);

  const handleInstitutionChange = (institution: string) => {
    setSelectedInstitution(institution);
    // Reset account selection when institution changes
    setSelectedAccountId(null);
  };

  const handleAddAccount = () => {
    setIsAddModalOpen(true);
  };

  const handleAccountSelect = (account: any | null) => {
    const newAccountId = account?.id || null;
    setSelectedAccountId(newAccountId);
    
    // Call the external callback if provided
    if (onAccountSelect && account) {
      onAccountSelect(account);
    } else {
      console.log('Selected account:', account);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <FilterBar
        institutions={institutions}
        selectedInstitution={selectedInstitution}
        onInstitutionChange={handleInstitutionChange}
        onAddAccount={handleAddAccount}
      />

      {/* Main Content with mobile-optimized padding */}
      <div className="px-2 space-y-4">
        {filteredAccounts.length === 0 ? (
          // Empty State
          <div className="text-center py-12 text-muted-foreground">
            <i className="fas fa-university text-4xl mb-4 text-muted-foreground/50"></i>
            <p className="mb-2">
              {selectedInstitution === "All"
                ? "No bank accounts found"
                : `No ${selectedInstitution} accounts found`}
            </p>
            <button
              onClick={handleAddAccount}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Your First Account
            </button>
          </div>
        ) : (
          <>
            {/* Total Balance Card with Donut Chart */}
            <TotalBalanceCard
              totalBalance={totalBalance}
              lastSyncTime={lastSyncTime}
              accountCount={filteredAccounts.length}
              accounts={filteredAccounts}
            />

            {/* Bank Icons Row */}
            <BankIconsRow
              accounts={filteredAccounts}
              selectedAccountId={selectedAccountId}
              onAccountSelect={handleAccountSelect}
            />

            {/* Extra Cash in Bank Card */}
            <ExtraCashInBankCard 
              totalAccountBalance={totalBalance}
            />

            {/* Trends Section with Account Filtering */}
            <TrendsSection 
              selectedAccountId={selectedAccountId}
              selectedInstitution={selectedInstitution}
            />
          </>
        )}
      </div>

      {/* Add Account Modal */}
      <AddAccountModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        isCreditCard={false}
      />
    </div>
  );
};

export default AccountsSection; 