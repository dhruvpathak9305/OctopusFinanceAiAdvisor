import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useCreditCards } from '@/contexts/CreditCardContext';
import { CreditCardView } from '@/components/common/credit-cards';
import AddAccountModal from '@/components/common/AddAccountModal';
import FilterBar from './FilterBar';

export interface CreditCardsSectionProps {
  onManageCard?: (cardId: string) => void;
  onViewBreakdown?: (cardId: string) => void;
}

const CreditCardsSection: React.FC<CreditCardsSectionProps> = ({
  onManageCard,
  onViewBreakdown,
}) => {
  const [selectedInstitution, setSelectedInstitution] = useState("All");
  const [isAddCreditCardModalOpen, setIsAddCreditCardModalOpen] = useState(false);
  
  const { creditCards, loading: creditCardsLoading } = useCreditCards();

  // Get unique institutions for filter chips
  const institutions = useMemo(() => {
    const uniqueInstitutions = [
      ...new Set(creditCards.map((card) => card.bank)),
    ];
    return uniqueInstitutions.sort();
  }, [creditCards]);

  // Filter credit cards based on selected institution
  const filteredCreditCards = useMemo(() => {
    if (selectedInstitution === "All") {
      return creditCards;
    }
    return creditCards.filter((card) => card.bank === selectedInstitution);
  }, [creditCards, selectedInstitution]);

  const handleManageCardDefault = (cardId: string) => {
    if (onManageCard) {
      onManageCard(cardId);
    } else {
      console.log("Manage card:", cardId);
    }
  };

  const handleViewBreakdownDefault = (cardId: string) => {
    if (onViewBreakdown) {
      onViewBreakdown(cardId);
    } else {
      console.log("View breakdown for card:", cardId);
    }
  };

  const handleAddCreditCard = () => {
    setIsAddCreditCardModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <FilterBar
        institutions={institutions}
        selectedInstitution={selectedInstitution}
        onInstitutionChange={setSelectedInstitution}
        onAddAccount={handleAddCreditCard}
        title="Filter by:"
      />

      {/* Main Content with reduced padding for mobile optimization */}
      <div className="px-2 space-y-4">
        {/* Header with count */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {selectedInstitution === "All"
                ? "All cards"
                : `${selectedInstitution} cards`}
            </h2>
            <p className="text-xs text-muted-foreground">
              As of last available statement
            </p>
          </div>
          {filteredCreditCards.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {filteredCreditCards.length} card
              {filteredCreditCards.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Credit Cards List */}
        {creditCardsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredCreditCards.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <i className="fas fa-credit-card text-4xl mb-4 text-muted-foreground/50"></i>
            <p className="mb-2">
              {selectedInstitution === "All"
                ? "No credit cards found"
                : `No ${selectedInstitution} cards found`}
            </p>
            <Button
              variant="outline"
              onClick={handleAddCreditCard}
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Credit Card
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCreditCards.map((card) => (
              <CreditCardView
                key={card.id}
                id={card.id}
                name={card.name}
                institution={card.bank}
                logoUrl={card.logoUrl}
                lastFourDigits={parseInt(card.lastFourDigits)}
                creditLimit={card.creditLimit}
                currentBalance={card.currentBalance}
                dueDate={card.dueDate}
                billingCycle={card.billingCycle}
                onManageCard={handleManageCardDefault}
                onViewBreakdown={handleViewBreakdownDefault}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Credit Card Modal */}
      <AddAccountModal
        open={isAddCreditCardModalOpen}
        onOpenChange={setIsAddCreditCardModalOpen}
        isCreditCard={true}
      />
    </div>
  );
};

export default CreditCardsSection; 