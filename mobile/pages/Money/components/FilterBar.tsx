import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface FilterBarProps {
  institutions: string[];
  selectedInstitution: string;
  onInstitutionChange: (institution: string) => void;
  onAddAccount: () => void;
  title?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  institutions,
  selectedInstitution,
  onInstitutionChange,
  onAddAccount,
  title = "Filter by:",
}) => {
  return (
    <div className="px-4 pb-4">
      <div className="flex items-center pb-2 space-x-2">
        {/* Static Filter label */}
        <span className="text-muted-foreground text-[10px] whitespace-nowrap shrink-0">
          {title}
        </span>

        {/* Horizontally scrollable chips */}
        <div
          className="flex items-center space-x-2 overflow-x-auto scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* All chip */}
          <button
            onClick={() => onInstitutionChange("All")}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors text-[10px] ${
              selectedInstitution === "All"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <i className="fas fa-list mr-1"></i>
            All
          </button>

          {/* Institution chips */}
          {institutions.map((institution) => (
            <button
              key={institution}
              onClick={() => onInstitutionChange(institution)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors text-[10px] ${
                selectedInstitution === institution
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {institution}
            </button>
          ))}

          {/* Add Account chip */}
          <button
            onClick={onAddAccount}
            className="px-3 py-1.5 rounded-full whitespace-nowrap transition-colors bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 text-[10px]"
          >
            <Plus className="w-3 h-3 mr-1 inline" />
            Add Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar; 