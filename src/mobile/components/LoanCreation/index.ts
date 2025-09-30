/**
 * Reusable Loan Creation Component System
 * Export all components and utilities for easy import
 */

// Main component
export { LoanCreationModal } from "./LoanCreationModal";

// Sub-components
export { LoanTypeSelector } from "./components/LoanTypeSelector";
export { RecipientSelector } from "./components/RecipientSelector";
export { LoanFormFields } from "./components/LoanFormFields";
export { EnhancedLoanFormFields } from "./components/EnhancedLoanFormFields";
export { DatePickerModal } from "./components/DatePickerModal";
export { RepaymentMethodSelector } from "./components/RepaymentMethodSelector";
export { InterestRateSection } from "./components/InterestRateSection";
export { CompactRepaymentSelector } from "./components/CompactRepaymentSelector";
export { CompactInterestSection } from "./components/CompactInterestSection";
export { RecipientTypeModal } from "./components/RecipientTypeModal";

// Hooks
export { useLoanForm } from "./hooks/useLoanForm";
export { useLoanRecipients } from "./hooks/useLoanRecipients";

// Types and constants
export * from "./types";

// Usage examples and documentation
export const LOAN_CREATION_EXAMPLES = {
  // Basic usage
  basic: `
import { LoanCreationModal } from './components/LoanCreation';

<LoanCreationModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  onCreateLoan={handleCreateLoan}
  recipients={{
    persons: [{ id: '1', name: 'John Doe', type: 'person' }],
    groups: [],
    banks: []
  }}
/>`,

  // Advanced usage with all options
  advanced: `
import { LoanCreationModal, LoanFormData } from './components/LoanCreation';

const handleCreateLoan = async (data: LoanFormData) => {
  await LoanManagementService.createLoan(data.selectedRecipient, Number(data.amount), {
    interestRate: Number(data.interestRate),
    dueDate: data.dueDate,
    description: data.description,
  });
};

<LoanCreationModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  onCreateLoan={handleCreateLoan}
  title="Custom Loan Creation"
  showLoanTypeSelection={true}
  allowedRecipientTypes={['person', 'group']}
  defaultLoanType="take"
  enableAdvancedOptions={true}
  enableReminders={true}
  enableProgress={true}
  headerStyle="clean"
  theme="compact"
  recipients={recipientsData}
  initialData={{
    amount: '5000',
    description: 'Emergency fund'
  }}
/>`,

  // Quick integration with existing modals
  quickIntegration: `
// Replace existing loan creation with reusable component

// Before (in FinancialDashboard.tsx):
// 2000+ lines of duplicated code

// After:
import { LoanCreationModal } from './components/LoanCreation';

const [showLoanModal, setShowLoanModal] = useState(false);

<LoanCreationModal
  visible={showLoanModal}
  onClose={() => setShowLoanModal(false)}
  onCreateLoan={handleCreateLoan}
  recipients={recipientsData}
  enableAdvancedOptions={true}
/>`,

  // Custom styling
  customStyling: `
// The component automatically adapts to your app's theme
// via useTheme() hook, but you can customize further:

<LoanCreationModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  onCreateLoan={handleCreateLoan}
  headerStyle="clean" // or "standard"
  theme="compact" // or "default" or "full"
  enableProgress={true}
  recipients={recipientsData}
/>`,
};

export const INTEGRATION_GUIDE = `
# Loan Creation Component Integration Guide

## 1. Replace Existing Implementations

### Current Issues:
- Duplicated code in FinancialDashboard.tsx (~1000 lines)
- Duplicated code in QuickAddButton/index.tsx (~2000 lines)
- Inconsistent UI and validation
- Hard to maintain and update

### Solution:
Replace both implementations with the reusable LoanCreationModal

## 2. Integration Steps

### Step 1: Update FinancialDashboard.tsx
\`\`\`tsx
// Remove existing modal code (lines 1000-2107)
// Replace with:
import { LoanCreationModal } from '../LoanCreation';

<LoanCreationModal
  visible={createLoanModalVisible}
  onClose={() => setCreateLoanModalVisible(false)}
  onCreateLoan={handleCreateLoan}
  recipients={{ persons: contacts, groups, banks }}
  enableAdvancedOptions={true}
/>
\`\`\`

### Step 2: Update QuickAddButton/index.tsx
\`\`\`tsx
// Remove loan case code (lines 3747-5600)
// Replace with:
import { LoanCreationModal } from '../LoanCreation';

<LoanCreationModal
  visible={selectedAction === 'loan'}
  onClose={handleCloseModal}
  onCreateLoan={handleCreateLoan}
  headerStyle="clean"
  enableProgress={true}
  recipients={{ persons: mockPersons, groups: mockGroups, banks: mockBanks }}
/>
\`\`\`

### Step 3: Remove Duplicated Code
- Delete ~3000 lines of duplicated loan creation logic
- Remove duplicate state management
- Remove duplicate validation logic
- Remove duplicate styling

## 3. Benefits After Integration

### Code Reduction:
- ~3000 lines removed
- Single source of truth
- Consistent UI/UX
- Easier maintenance

### Features:
- Advanced form validation
- Progress tracking
- Quick amount presets
- Responsive design
- Theme integration
- TypeScript support

### Customization:
- Multiple header styles
- Configurable features
- Custom recipients
- Pre-filled data
- Custom callbacks

## 4. Testing Checklist

- [ ] FinancialDashboard loan creation works
- [ ] QuickAddButton loan creation works
- [ ] All form validations work
- [ ] Theme integration works
- [ ] Progress tracking works
- [ ] Quick amounts work
- [ ] Recipient selection works
- [ ] Error handling works
- [ ] Modal animations work
- [ ] Keyboard handling works
`;
