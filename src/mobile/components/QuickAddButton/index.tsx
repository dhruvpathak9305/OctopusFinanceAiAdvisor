import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  TextInput,
  Platform,
  TouchableWithoutFeedback,
  Image,
  InteractionManager,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { LoanCreationModal } from "../LoanCreation";
import BankStatementUploader from "../BankStatementUploader";
import BankStatementErrorBoundary from "../BankStatementUploader/BankStatementErrorBoundary";
// Import database services
import {
  fetchBudgetCategories,
  fetchBudgetSubcategories,
  BudgetCategory,
  BudgetSubcategory,
} from "../../../../services/budgetService";
import { fetchAccounts } from "../../../../services/accountsService";
import { Account } from "../../../../contexts/AccountsContext";
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "../../../../services/transactionsService";
import { useDemoMode } from "../../../../contexts/DemoModeContext";
// Import modals
import AddCategoryModal from "../AddCategoryModal";
import AddSubcategoryModal from "../AddSubcategoryModal";
import AddAccountModal from "../AddAccountModal";
import AddCreditCardModal from "../AddCreditCardModal";
import { CreditCard } from "../../../../services/creditCardService";
// Import AI services
import {
  OctopusSMSAnalyzer,
  ContextData,
} from "../../../../services/smsAnalyzer";
import { OpenAIService } from "../../../../services/openaiService";
// Import image handling
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
// Import expense splitting
import ExpenseSplittingInterface from "../ExpenseSplitting/ExpenseSplittingInterface";
import {
  Group,
  SplitCalculation,
  SplitValidation,
} from "../../../../types/splitting";
import { ExpenseSplittingService } from "../../../../services/expenseSplittingService";

interface QuickAddButtonProps {
  style?: any;
  editTransaction?: any;
  isEditMode?: boolean;
  onTransactionUpdate?: (updatedTransactionId?: string) => void; // Callback to refresh transactions after edit
}

interface AddTransactionModalProps {
  colors: any;
  isDark: boolean;
  onClose: () => void;
  onBack: () => void;
  editTransaction?: any; // Transaction to edit (if in edit mode)
  isEditMode?: boolean;
  isCopyMode?: boolean; // New prop to indicate copy mode
  onTransactionUpdate?: (updatedTransactionId?: string) => void; // Callback to refresh transactions
}

// Enhanced non-blocking toast notification component
const ToastNotification = ({
  message,
  visible,
  onHide,
}: {
  message: string;
  visible: boolean;
  onHide: () => void;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const { isDark } = useTheme();
  const colors = isDark
    ? {
        text: "#FFFFFF",
        textSecondary: "#9CA3AF",
        border: "#374151",
        card: "#1F2937",
        background: "#111827",
      }
    : {
        text: "#111827",
        textSecondary: "#6B7280",
        border: "#E5E7EB",
        card: "#FFFFFF",
        background: "#F9FAFB",
      };

  useEffect(() => {
    if (visible) {
      // Animate in with fade and scale for better visual feedback
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after 2.5 seconds (slightly longer for better visibility)
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide();
        });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible, fadeAnim, scaleAnim, onHide]);

  if (!visible) return null;

  // Success toast styling
  const successBackground = "#10B98110"; // Light green background with low opacity
  const successBorder = "#10B981"; // Green border

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 100,
        left: 20,
        right: 20,
        backgroundColor: successBackground,
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4.5,
        elevation: 6,
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: successBorder,
      }}
    >
      <Ionicons
        name="checkmark-circle"
        size={24}
        color="#10B981"
        style={{ marginRight: 12 }}
      />
      <Text
        style={{
          color: colors.text,
          fontSize: 16,
          fontWeight: "600",
          letterSpacing: 0.3,
        }}
      >
        {message}
      </Text>
    </Animated.View>
  );
};

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  colors,
  isDark,
  onClose,
  onBack,
  editTransaction,
  isEditMode = false,
  isCopyMode = false,
  onTransactionUpdate,
}) => {
  const { isDemo } = useDemoMode();
  const [activeTab, setActiveTab] = useState("Manual");
  // Toast notification state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [transactionType, setTransactionType] = useState<
    "expense" | "income" | "transfer"
  >("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSubcategoryPicker, setShowSubcategoryPicker] = useState(false);
  const [categoryViewMode, setCategoryViewMode] = useState<"list" | "grid">("list");
  const [subcategoryViewMode, setSubcategoryViewMode] = useState<"list" | "grid">("grid");
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showFromAccountPicker, setShowFromAccountPicker] = useState(false);
  const [showToAccountPicker, setShowToAccountPicker] = useState(false);
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showAutopayAccountPicker, setShowAutopayAccountPicker] =
    useState(false);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [merchant, setMerchant] = useState("");
  const [account, setAccount] = useState("");
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [smsText, setSmsText] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  // SMS Analysis states
  const [isAnalyzingSMS, setIsAnalyzingSMS] = useState(false);
  const [smsAnalysisResult, setSmsAnalysisResult] = useState<any>(null);
  // Image Analysis states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState<any>(null);
  const [frequency, setFrequency] = useState("Monthly");
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState(new Date());
  const [enableAutopay, setEnableAutopay] = useState(false);
  const [autopayAccount, setAutopayAccount] = useState("");
  const [useSameAccount, setUseSameAccount] = useState(true);

  // Expense splitting state
  const [isSplitEnabled, setIsSplitEnabled] = useState(false);
  const [selectedSplitGroup, setSelectedSplitGroup] = useState<Group | null>(
    null
  );
  const [splitCalculations, setSplitCalculations] = useState<
    SplitCalculation[]
  >([]);
  const [splitValidation, setSplitValidation] = useState<SplitValidation>({
    is_valid: true,
    total_shares: 0,
    expected_total: 0,
    difference: 0,
    errors: [],
    warnings: [],
  });

  // Database state
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(
    []
  );
  const [budgetSubcategories, setBudgetSubcategories] = useState<
    BudgetSubcategory[]
  >([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddSubcategoryModal, setShowAddSubcategoryModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showAddCreditCardModal, setShowAddCreditCardModal] = useState(false);
  const [selectedCategoryForSubcategory, setSelectedCategoryForSubcategory] =
    useState<BudgetCategory | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyTransactionData, setCopyTransactionData] = useState<any>(null);

  const tabs = ["Manual", "SMS", "Image"];

  const transactionTypes = [
    { id: "expense", label: "Expense", icon: "arrow-up", color: "#EF4444" },
    { id: "income", label: "Income", icon: "arrow-down", color: "#10B981" },
    {
      id: "transfer",
      label: "Transfer",
      icon: "swap-horizontal",
      color: "#3B82F6",
    },
  ];

  // Refresh functions
  const refreshData = async () => {
    try {
      setLoading(true);

      // Fetch all required data in parallel
      const [categoriesData, subcategoriesData, accountsData] =
        await Promise.all([
          fetchBudgetCategories(isDemo),
          fetchBudgetSubcategories(isDemo),
          fetchAccounts(isDemo),
        ]);

      // Map the database results to the expected format
      const mappedCategories = categoriesData.map((cat: any) => ({
        ...cat,
        limit: cat.budget_limit || 0,
        bgColor: cat.bg_color || "#047857",
        ringColor: cat.ring_color || "#10b981",
        is_active: cat.is_active === "true" || cat.is_active === true,
      }));

      setBudgetCategories(mappedCategories);
      setBudgetSubcategories(subcategoriesData);
      setAccounts(accountsData);
    } catch (error) {
      console.error("Error refreshing dropdown data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const handleCategoryAdded = (newCategory: BudgetCategory) => {
    setBudgetCategories((prev) => [...prev, newCategory]);
    setCategory(newCategory.name);
    setShowAddCategoryModal(false);
  };

  const handleSubcategoryAdded = (newSubcategory: BudgetSubcategory) => {
    setBudgetSubcategories((prev) => [...prev, newSubcategory]);
    setSubcategory(newSubcategory.name);
    setShowAddSubcategoryModal(false);
  };

  const handleAccountAdded = (newAccount: Account) => {
    setAccounts((prev) => [...prev, newAccount]);
    setAccount(`${newAccount.name} (${newAccount.institution})`);
    setShowAddAccountModal(false);
  };

  const handleCreditCardAdded = (newCreditCard: CreditCard) => {
    // Credit cards could be added to accounts list for selection
    const creditCardAsAccount: Account = {
      id: newCreditCard.id,
      name: newCreditCard.name,
      type: "credit_card",
      balance: -newCreditCard.currentBalance, // Negative because it's debt
      institution: newCreditCard.institution,
    };
    setAccounts((prev) => [...prev, creditCardAsAccount]);
    setAccount(`${newCreditCard.name} (${newCreditCard.institution})`);
    setShowAddCreditCardModal(false);
  };

  // Handle expense splitting changes
  const handleSplitChange = useCallback(
    async (enabled: boolean, splits?: SplitCalculation[], group?: Group) => {
      setIsSplitEnabled(enabled);
      setSelectedSplitGroup(group || null);

      // Enrich splits with group member details (mobile, relationship)
      if (enabled && splits && splits.length > 0 && group) {
        try {
          // Fetch group members to get additional details
          const groupMembers = await ExpenseSplittingService.getGroupMembers(
            group.id
          );

          // Enrich each split with member details
          const enrichedSplits = splits.map((split: any) => {
            // Find the corresponding group member
            const member = groupMembers.find(
              (m) =>
                m.user_id === split.user_id ||
                m.user_email === split.user_email ||
                m.user_name === split.user_name
            );

            if (member) {
              // Add mobile and relationship from group member
              return {
                ...split,
                mobile_number: member.mobile_number,
                relationship: member.relationship,
                is_guest: !member.is_registered_user,
                user_email: member.user_email,
                user_name: member.user_name,
              };
            }

            return split;
          });

          setSplitCalculations(enrichedSplits);

          // Update validation with enriched splits
          const validation = ExpenseSplittingService.validateSplits(
            parseFloat(amount) || 0,
            enrichedSplits
          );
          setSplitValidation(validation);
        } catch (error) {
          console.error("Error enriching split data:", error);
          // Fall back to original splits if enrichment fails
          setSplitCalculations(splits || []);
          const validation = ExpenseSplittingService.validateSplits(
            parseFloat(amount) || 0,
            splits
          );
          setSplitValidation(validation);
        }
      } else {
        setSplitCalculations(splits || []);

        // Update validation when splits change
        if (enabled && splits && splits.length > 0) {
          const validation = ExpenseSplittingService.validateSplits(
            parseFloat(amount) || 0,
            splits
          );
          setSplitValidation(validation);
        } else {
          setSplitValidation({
            is_valid: true,
            total_shares: 0,
            expected_total: 0,
            difference: 0,
            errors: [],
            warnings: [],
          });
        }
      }
    },
    [amount]
  );

  // Fetch data from database on component mount
  useEffect(() => {
    refreshData();
  }, [isDemo]);

  // Effect to populate form fields when in edit mode or copy mode
  useEffect(() => {
    console.log("🔥 FORM DEBUG - useEffect triggered:", {
      isEditMode,
      isCopyMode,
      editTransaction: !!editTransaction,
    });
    if ((isEditMode || isCopyMode) && editTransaction) {
      setDescription(editTransaction.name || editTransaction.description || "");
      setAmount(editTransaction.amount?.toString() || "");
      setTransactionType(editTransaction.type || "expense");
      setSelectedDate(new Date(editTransaction.date) || new Date());
      setMerchant(editTransaction.merchant || "");

      // Set category and subcategory names
      const categoryName =
        editTransaction.category_name ||
        editTransaction.budget_categories?.name ||
        "";
      const subcategoryName =
        editTransaction.subcategory_name ||
        editTransaction.budget_subcategories?.name ||
        "";
      setCategory(categoryName);
      setSubcategory(subcategoryName);

      // Set account fields based on transaction type using correct field names from database
      const transactionType = editTransaction.type || "expense";

      // Wait for accounts to load before setting account
      if (accounts.length > 0) {
        if (transactionType === "income") {
          // For income, use destination account (where money goes)
          const accountId = editTransaction.destination_account_id;
          if (accountId) {
            const matchedAccount = accounts.find(acc => acc.id === accountId);
            if (matchedAccount) {
              const formattedAccount = `${matchedAccount.name} (${matchedAccount.institution})`;
              console.log("🔥 ACCOUNT DEBUG - Setting income account:", formattedAccount);
              setAccount(formattedAccount);
            } else {
              // Fallback to name matching
              const accountName = editTransaction.destination_account_name || "";
              const accountInstitution = editTransaction.destination_account_type || "";
              if (accountName) {
                const formattedAccount = accountInstitution
                  ? `${accountName} (${accountInstitution})`
                  : accountName;
                console.log("🔥 ACCOUNT DEBUG - Fallback income account:", formattedAccount);
                setAccount(formattedAccount);
              }
            }
          }
        } else if (transactionType === "expense") {
          // For expense, use source account (where money comes from)
          const accountId = editTransaction.source_account_id;
          if (accountId) {
            const matchedAccount = accounts.find(acc => acc.id === accountId);
            if (matchedAccount) {
              const formattedAccount = `${matchedAccount.name} (${matchedAccount.institution})`;
              console.log("🔥 ACCOUNT DEBUG - Setting expense account:", formattedAccount);
              setAccount(formattedAccount);
            } else {
              // Fallback to name matching
              const accountName = editTransaction.source_account_name || "";
              const accountInstitution = editTransaction.source_account_type || "";
              if (accountName) {
                const formattedAccount = accountInstitution
                  ? `${accountName} (${accountInstitution})`
                  : accountName;
                console.log("🔥 ACCOUNT DEBUG - Fallback expense account:", formattedAccount);
                setAccount(formattedAccount);
              }
            }
          }
        } else if (transactionType === "transfer") {
          // For transfer, use both source and destination accounts
          const fromAccountId = editTransaction.source_account_id;
          const toAccountId = editTransaction.destination_account_id;

          if (fromAccountId) {
            const matchedAccount = accounts.find(acc => acc.id === fromAccountId);
            if (matchedAccount) {
              setFromAccount(`${matchedAccount.name} (${matchedAccount.institution})`);
            }
          }

          if (toAccountId) {
            const matchedAccount = accounts.find(acc => acc.id === toAccountId);
            if (matchedAccount) {
              setToAccount(`${matchedAccount.name} (${matchedAccount.institution})`);
            }
          }
        }
      }

      setIsRecurring(editTransaction.is_recurring || false);
      if (editTransaction.recurrence_pattern) {
        setFrequency(editTransaction.recurrence_pattern);
      }
      if (editTransaction.recurrence_end_date) {
        setEndDate(new Date(editTransaction.recurrence_end_date));
      }

      // Load split data if this transaction has splits
      const loadSplitData = async () => {
        try {
          console.log("🔍 SPLIT DEBUG - Checking for splits:", {
            editTransaction_id: editTransaction?.id,
            metadata: editTransaction?.metadata,
            metadata_type: typeof editTransaction?.metadata,
          });

          const metadata = editTransaction.metadata;
          const hasSplits = 
            metadata?.has_splits === true || 
            metadata?.has_splits === 'true' || 
            (metadata?.split_count && Number(metadata.split_count) > 0);

          console.log("🔍 SPLIT DEBUG - Has splits check:", {
            has_splits: metadata?.has_splits,
            split_count: metadata?.split_count,
            hasSplits,
          });

          if (hasSplits && editTransaction.id) {
            console.log("🔀 Loading split data for transaction:", editTransaction.id);
            
            // Fetch splits from database
            const splits = await ExpenseSplittingService.getTransactionSplits(editTransaction.id);
            
            if (splits && splits.length > 0) {
              console.log("🔀 Fetched splits:", splits);

              // Load group FIRST if exists
              let matchedGroup = null;
              const groupId = splits[0]?.group_id;
              
              if (groupId) {
                try {
                  console.log("🔀 Loading group for ID:", groupId);
                  const groups = await ExpenseSplittingService.getUserGroups();
                  matchedGroup = groups.find(g => g.id === groupId);
                  if (matchedGroup) {
                    console.log("🔀 Loaded group:", matchedGroup.name);
                  } else {
                    console.log("⚠️ Group not found in user groups");
                  }
                } catch (err) {
                  console.error("❌ Error loading group:", err);
                }
              }

              // Convert TransactionSplit[] to SplitCalculation[]
              const splitCalculations: SplitCalculation[] = splits.map((split) => ({
                user_id: split.user_id || undefined,
                user_name: (split.is_guest_user ? split.guest_name : split.user_name) || "Unknown",
                user_email: split.is_guest_user ? split.guest_email : split.user_email,
                share_amount: split.share_amount,
                share_percentage: split.share_percentage || (split.share_amount / editTransaction.amount) * 100,
                is_paid: split.is_paid,
                is_guest: split.is_guest_user || false,
                mobile_number: split.is_guest_user ? split.guest_mobile : undefined,
                relationship: split.is_guest_user ? split.guest_relationship : undefined,
              }));

              // Set ALL split state together AFTER group is loaded
              console.log("🎯 Setting all split state together:", {
                splitCount: splitCalculations.length,
                hasGroup: !!matchedGroup,
                groupName: matchedGroup?.name,
              });
              
              setIsSplitEnabled(true);
              setSplitCalculations(splitCalculations);
              if (matchedGroup) {
                setSelectedSplitGroup(matchedGroup);
              }

              // Validate the splits
              const validation = ExpenseSplittingService.validateSplits(
                editTransaction.amount,
                splitCalculations
              );
              setSplitValidation(validation);

              console.log("✅ Split data loaded successfully:", {
                splitCount: splitCalculations.length,
                isValid: validation.is_valid,
                groupId,
              });
            } else {
              console.log("⚠️ No splits found in database for transaction:", editTransaction.id);
            }
          } else {
            console.log("⚠️ Split check failed:", {
              hasSplits,
              hasTransactionId: !!editTransaction.id,
              reason: !hasSplits ? "hasSplits is false" : "no transaction ID",
            });
          }
        } catch (error) {
          console.error("❌ Error loading split data:", error);
          // Don't show error to user - just log it
          // The form will still work, just won't have split data pre-populated
        }
      };

      loadSplitData();
    }
  }, [isEditMode, isCopyMode, editTransaction, accounts]);

  // Note: Categories and subcategories now come from database via useEffect

  const merchants = [
    "Starbucks",
    "Amazon",
    "Walmart",
    "Target",
    "McDonald's",
    "Shell",
    "Uber",
    "Netflix",
    "Spotify",
  ];

  const frequencies = ["Weekly", "Monthly", "Quarterly", "Yearly", "Custom"];

  const handleAddTransaction = async () => {
    if (!description || !amount) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // Validate account is selected for non-transfer transactions
    if (transactionType !== "transfer" && !account) {
      Alert.alert("Error", "Please select an account");
      return;
    }

    // Validate transfer accounts
    if (transactionType === "transfer") {
      if (!fromAccount || !toAccount) {
        Alert.alert("Error", "Please select both accounts for transfer");
        return;
      }
    }

    // Validate splits if splitting is enabled
    if (isSplitEnabled) {
      if (!splitValidation.is_valid) {
        Alert.alert(
          "Invalid Split",
          `Please fix the split errors:\n${splitValidation.errors.join("\n")}`
        );
        return;
      }

      if (splitCalculations.length === 0) {
        Alert.alert("Error", "Please select a group and configure splits");
        return;
      }
    }

    try {
      // Find the selected category and subcategory IDs
      const selectedCategory = budgetCategories.find(
        (cat) => cat.name === category
      );
      const selectedSubcategory = budgetSubcategories.find(
        (sub) => sub.name === subcategory
      );
      
      // Find account by matching formatted string
      const selectedAccount = accounts.find(
        (acc) => `${acc.name} (${acc.institution})` === account
      );

      // Additional validation for account selection
      if (transactionType !== "transfer" && !selectedAccount) {
        console.error("❌ Account not found:", account);
        console.error("Available accounts:", accounts.map(acc => `${acc.name} (${acc.institution})`));
        Alert.alert(
          "Account Error",
          `Could not find the selected account. Please select an account from the list.`
        );
        return;
      }

      // Prepare transaction data based on transaction type
      let transactionData: any = {
        name: description,
        description: description,
        amount: parseFloat(amount),
        date: selectedDate.toISOString(),
        type: transactionType,
        category_id: selectedCategory?.id || null,
        subcategory_id: selectedSubcategory?.id || null,
        icon: null,
        merchant: merchant || null,
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? frequency : null,
        recurrence_end_date:
          isRecurring && endDate ? endDate.toISOString() : null,
        parent_transaction_id: null,
        interest_rate: null,
        loan_term_months: null,
        metadata: null,
      };

      // Set account fields based on transaction type
      if (transactionType === "expense") {
        // For expense: money goes OUT from source account
        transactionData.source_account_id = selectedAccount?.id || null;
        transactionData.source_account_type = selectedAccount ? "bank" : "other";
        transactionData.source_account_name = selectedAccount?.name || null;
        transactionData.destination_account_id = null;
        transactionData.destination_account_type = null;
        transactionData.destination_account_name = null;
      } else if (transactionType === "income") {
        // For income: money comes IN to destination account
        transactionData.source_account_id = null;
        transactionData.source_account_type = null;
        transactionData.source_account_name = null;
        transactionData.destination_account_id = selectedAccount?.id || null;
        transactionData.destination_account_type = selectedAccount ? "bank" : "other";
        transactionData.destination_account_name = selectedAccount?.name || null;
      } else if (transactionType === "transfer") {
        // For transfer: money moves from source to destination
        const selectedFromAccount = accounts.find(
          (acc) => `${acc.name} (${acc.institution})` === fromAccount
        );
        const selectedToAccount = accounts.find(
          (acc) => `${acc.name} (${acc.institution})` === toAccount
        );

        if (!selectedFromAccount || !selectedToAccount) {
          console.error("❌ Transfer accounts not found:", { fromAccount, toAccount });
          console.error("Available accounts:", accounts.map(acc => `${acc.name} (${acc.institution})`));
          Alert.alert(
            "Transfer Error",
            "Could not find the selected accounts. Please select valid accounts from the list."
          );
          return;
        }

        transactionData.source_account_id = selectedFromAccount.id;
        transactionData.source_account_type = "bank";
        transactionData.source_account_name = selectedFromAccount.name;
        transactionData.destination_account_id = selectedToAccount.id;
        transactionData.destination_account_type = "bank";
        transactionData.destination_account_name = selectedToAccount.name;
      }

      console.log(
        isEditMode ? "Updating transaction:" : "Adding transaction:",
        transactionData
      );

      // Save to database with improved flow to prevent UI freezing
      if (isEditMode && editTransaction) {
        // Perform the database operation first
        try {
          console.log(`💾 Updating transaction ${editTransaction.id} in database...`);
          await updateTransaction(
            editTransaction.id,
            transactionData,
            isDemo
          );

          console.log(`✅ Transaction ${editTransaction.id} updated in database`);

          // Close modal AFTER successful update
          onClose();

          // Show success toast notification
          setToastMessage(
            `Transaction "${transactionData.name}" updated successfully!`
          );
          setToastVisible(true);

          // Call the refresh callback immediately after closing
          console.log(`🔔 QuickAddButton: Calling onTransactionUpdate with ID: ${editTransaction.id}`);
          if (onTransactionUpdate) {
            onTransactionUpdate(editTransaction.id);
          } else {
            console.warn("⚠️ onTransactionUpdate callback is not defined!");
          }
        } catch (err: any) {
          console.error("Error updating transaction:", err);
          
          // Show more specific error message based on error code
          let errorMessage = "Failed to update transaction. Please try again.";
          if (err?.message) {
            if (err.message.includes("source_account_id")) {
              errorMessage = "Please select an account for this transaction.";
            } else if (err.message.includes("destination_account_id")) {
              errorMessage = "Please select a destination account.";
            } else if (err.message.includes("requires")) {
              errorMessage = err.message;
            }
          }
          
          Alert.alert(
            "Update Failed",
            errorMessage
          );
        }
      } else {
        // First close the modal to prevent UI blocking
        onClose();

        // Then perform the database operation in the background
        setTimeout(async () => {
          try {
            // Check if this is a split transaction
            if (
              isSplitEnabled &&
              splitCalculations.length > 0 &&
              splitValidation.is_valid
            ) {
              // Create transaction with splits
              await ExpenseSplittingService.createTransactionWithSplits(
                transactionData,
                splitCalculations,
                selectedSplitGroup?.id
              );

              // Show split-specific success message
              setToastMessage(
                `Split transaction "${transactionData.name}" created with ${splitCalculations.length} participants!`
              );
            } else {
              // Regular transaction without splits
              await addTransaction(transactionData, isDemo);

              // Show regular success message
              setToastMessage(
                `Transaction "${transactionData.name}" added successfully!`
              );
            }

            setToastVisible(true);

            // Wait a moment before triggering the refresh to ensure UI responsiveness
            InteractionManager.runAfterInteractions(() => {
              // Call the refresh callback in the parent component
              onTransactionUpdate?.();
            });
          } catch (err) {
            console.error("Error adding transaction:", err);
            Alert.alert(
              "Error",
              "Failed to add transaction. Please try again."
            );
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      Alert.alert("Error", "Failed to add transaction. Please try again.");
    }
  };

  const handleDeleteTransaction = async () => {
    if (!isEditMode || !editTransaction) return;

    try {
      setShowDeleteConfirmation(false);

      // Close modal first
      onClose();

      // Delete transaction
      setTimeout(async () => {
        try {
          await deleteTransaction(editTransaction.id, isDemo);

          setToastMessage(`Transaction "${description}" deleted successfully!`);
          setToastVisible(true);

          InteractionManager.runAfterInteractions(() => {
            onTransactionUpdate?.();
          });
        } catch (err) {
          console.error("Error deleting transaction:", err);
          Alert.alert(
            "Error",
            "Failed to delete transaction. Please try again."
          );
        }
      }, 100);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      Alert.alert("Error", "Failed to delete transaction. Please try again.");
    }
  };

  const handleCopyTransaction = () => {
    if (!editTransaction) {
      Alert.alert("Error", "No transaction data available to copy");
      return;
    }

    console.log("🔥 COPY DEBUG - Original editTransaction:", editTransaction);

    // Use the original editTransaction data directly, just modify the description
    const copyData = {
      ...editTransaction,
      id: null, // New transaction, no ID
      name: `Copy - ${
        editTransaction.name || editTransaction.description || ""
      }`,
      description: `Copy - ${
        editTransaction.name || editTransaction.description || ""
      }`,
      // Keep all other fields exactly as they were in the original transaction
    };

    console.log("🔥 COPY DEBUG - Final copy data:", copyData);
    setCopyTransactionData(copyData);
    setShowCopyModal(true);
  };

  const handleCloseCopyModal = () => {
    setShowCopyModal(false);
    setCopyTransactionData(null);
  };

  const handleCopyTransactionUpdate = () => {
    // Close copy modal and refresh parent
    handleCloseCopyModal();
    onTransactionUpdate?.();
  };

  const handleAnalyzeSMS = async () => {
    if (!smsText.trim()) {
      Alert.alert("Error", "Please paste your SMS text");
      return;
    }

    setIsAnalyzingSMS(true);
    setSmsAnalysisResult(null);

    try {
      // Prepare context data for SMS analyzer
      const contextData: ContextData = {
        accounts: accounts.map((acc) => ({
          id: acc.id || "",
          name: acc.name,
          type: acc.type,
          institution: acc.institution,
        })),
        creditCards: [], // Could be extended later
        categories: budgetCategories.map((cat) => ({
          id: cat.id || "",
          name: cat.name,
          type: cat.category_type || "expense",
        })),
        subcategories: budgetSubcategories.map((sub) => ({
          id: sub.id,
          name: sub.name,
          category_id: sub.category_id,
        })),
      };

      // Initialize SMS analyzer
      const smsAnalyzer = new OctopusSMSAnalyzer(contextData);

      // Analyze SMS
      const result = smsAnalyzer.analyzeSMS(smsText);

      console.log("SMS Analysis Result:", result);
      setSmsAnalysisResult(result);

      if (result.success && result.data) {
        // Auto-fill form fields with analyzed data
        const data = result.data;

        if (data.amount) setAmount(data.amount.toString());
        if (data.description) setDescription(data.description);
        if (data.merchant) setMerchant(data.merchant);
        if (data.categoryName) setCategory(data.categoryName);
        if (data.subcategoryName) setSubcategory(data.subcategoryName);
        if (data.accountName) setAccount(data.accountName);

        // Set transaction type based on analysis
        if (data.transactionType === "debit") {
          setTransactionType("expense");
        } else if (data.transactionType === "credit") {
          setTransactionType("income");
        }

        Alert.alert(
          "SMS Analyzed Successfully!",
          `Found transaction: ${data.merchant || "Unknown"} - ₹${
            data.amount
          }\nConfidence: ${Math.round((result.confidence || 0) * 100)}%`
        );
      } else {
        Alert.alert(
          "Analysis Failed",
          result.error || "Could not extract transaction data from SMS"
        );
      }
    } catch (error) {
      console.error("SMS Analysis Error:", error);
      Alert.alert("Error", "Failed to analyze SMS. Please try again.");
    } finally {
      setIsAnalyzingSMS(false);
    }
  };

  const handleSelectImage = async () => {
    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access camera roll is required!"
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setImageAnalysisResult(null);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to select image");
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert("Error", "Please select an image first");
      return;
    }

    setIsAnalyzingImage(true);
    setImageAnalysisResult(null);

    try {
      // Read image as base64
      const imageBase64 = await FileSystem.readAsStringAsync(selectedImage, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Get OpenAI service instance
      const openaiService = OpenAIService.getInstance();

      // Create a prompt for image analysis
      const prompt = `Analyze this receipt/bill image and extract transaction details. Return a JSON object with:
      - amount (number)
      - merchant (string)
      - date (string in YYYY-MM-DD format)
      - description (string)
      - category (string, best guess from: food, transport, shopping, bills, entertainment, etc.)
      - type (either "expense" or "income")
      
      If you cannot extract clear information, return null for that field.`;

      // Note: This is a simplified approach. In a real implementation, you'd need to use OpenAI's vision API
      // For now, we'll simulate the analysis
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate processing time

      // Simulated result for demonstration
      const simulatedResult = {
        success: true,
        data: {
          amount: 150.0,
          merchant: "Restaurant ABC",
          date: new Date().toISOString().split("T")[0],
          description: "Dining expense",
          category: "Food & Dining",
          type: "expense",
        },
        confidence: 0.85,
      };

      setImageAnalysisResult(simulatedResult);

      if (simulatedResult.success && simulatedResult.data) {
        // Auto-fill form fields with analyzed data
        const data = simulatedResult.data;

        if (data.amount) setAmount(data.amount.toString());
        if (data.description) setDescription(data.description);
        if (data.merchant) setMerchant(data.merchant);
        if (data.category) setCategory(data.category);

        // Set transaction type
        if (data.type === "expense") {
          setTransactionType("expense");
        } else if (data.type === "income") {
          setTransactionType("income");
        }

        Alert.alert(
          "Image Analyzed Successfully!",
          `Found transaction: ${data.merchant || "Unknown"} - ₹${
            data.amount
          }\nConfidence: ${Math.round(
            (simulatedResult.confidence || 0) * 100
          )}%`
        );
      } else {
        Alert.alert(
          "Analysis Failed",
          "Could not extract transaction data from image"
        );
      }
    } catch (error) {
      console.error("Image Analysis Error:", error);
      Alert.alert("Error", "Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleDueDateChange = (event: any, date?: Date) => {
    setShowDueDatePicker(Platform.OS === "ios");
    if (date) {
      setDueDate(date);
    }
  };

  const handleEndDateChange = (event: any, date?: Date) => {
    setShowEndDatePicker(Platform.OS === "ios");
    if (date) {
      setEndDate(date);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getCurrentCategories = () => {
    if (loading) return [];

    // Filter categories based on transaction type using category_type column
    let filteredCategories = budgetCategories.filter((cat) => {
      if (!cat.is_active) return false;

      // Check category_type from database
      if (transactionType === "expense") {
        return cat.category_type === "expense";
      } else if (transactionType === "income") {
        return cat.category_type === "income";
      }

      // For transfer, show all active categories
      return true;
    });

    return filteredCategories.map((cat) => cat.name);
  };

  const getCurrentSubcategories = () => {
    if (loading || !category) return [];

    // Find the selected category
    const selectedCategory = budgetCategories.find(
      (cat) => cat.name === category
    );
    if (!selectedCategory) return [];

    // Return subcategories for this category
    return budgetSubcategories
      .filter((sub) => sub.category_id === selectedCategory.id)
      .map((sub) => sub.name);
  };

  const getAccountOptions = () => {
    if (loading) return [];
    return accounts.map((acc) => `${acc.name} (${acc.institution})`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Manual":
        return (
          <ScrollView
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Transaction Type Selection */}
            <View style={styles.typeContainer}>
              {transactionTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        transactionType === type.id ? type.color : colors.card,
                    },
                    transactionType === type.id && styles.typeButtonActive,
                  ]}
                  onPress={() => setTransactionType(type.id as any)}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={16}
                    color={transactionType === type.id ? "white" : colors.text}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      {
                        color:
                          transactionType === type.id ? "white" : colors.text,
                      },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Description Field */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Description <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Coffee, Groceries, Salary, etc."
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Amount and Date Row */}
            <View style={styles.rowContainer}>
              <View
                style={[styles.fieldContainer, { flex: 1, marginRight: 10 }]}
              >
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  Amount <Text style={styles.required}>*</Text>
                </Text>
                <View
                  style={[
                    styles.amountContainer,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.currencySymbol,
                      { color: colors.textSecondary },
                    ]}
                  >
                    $
                  </Text>
                  <TextInput
                    style={[
                      styles.amountInput,
                      { color: colors.text, fontSize: 14 },
                    ]}
                    placeholder="0.00"
                    placeholderTextColor={colors.textSecondary}
                    value={amount}
                    onChangeText={(text) => {
                      // Only allow numbers and one decimal point
                      const numericValue = text.replace(/[^0-9.]/g, "");
                      // Ensure only one decimal point
                      const parts = numericValue.split(".");
                      if (parts.length > 2) {
                        setAmount(parts[0] + "." + parts.slice(1).join(""));
                      } else {
                        setAmount(numericValue);
                      }
                    }}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {/* Date field in the same row as Amount */}
              <View
                style={[styles.fieldContainer, { flex: 1, marginLeft: 10 }]}
              >
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  Date <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.dateButton,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons
                    name="calendar"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.dateText, { color: colors.text }]}>
                    {formatDate(selectedDate)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Expense Splitting Interface */}
            {transactionType === "expense" && (
              <View style={styles.fieldContainer}>
                <ExpenseSplittingInterface
                  transactionAmount={parseFloat(amount) || 0}
                  onSplitChange={handleSplitChange}
                  colors={colors}
                  isDark={isDark}
                  disabled={loading}
                  initialSplitEnabled={isSplitEnabled}
                  initialSplits={splitCalculations}
                  initialGroup={selectedSplitGroup || undefined}
                />
              </View>
            )}

            {/* Category (full width for expense/income) */}
            {transactionType !== "transfer" && (
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  Category <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.selectContainer}>
                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      if (loading) return;
                      const categories = getCurrentCategories();
                      console.log("Available categories:", categories);
                      setShowCategoryPicker(true);
                    }}
                  >
                    <Text
                      style={[
                        styles.selectText,
                        {
                          color: category ? colors.text : colors.textSecondary,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {category ||
                        (loading
                          ? "Loading..."
                          : getCurrentCategories().length > 0
                          ? "Select category"
                          : "No categories available")}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setShowAddCategoryModal(true)}
                  >
                    <Ionicons
                      name="add"
                      size={16}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Subcategory (full width for expense/income) */}
            {transactionType !== "transfer" && (
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  Subcategory
                </Text>
                <View style={styles.selectContainer}>
                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      if (loading || !category) return;
                      const subcategories = getCurrentSubcategories();
                      console.log("Available subcategories:", subcategories);
                      setShowSubcategoryPicker(true);
                    }}
                  >
                    <View style={styles.selectTextContainer}>
                      {subcategory &&
                        (() => {
                          const {
                            getSubcategoryIconFromDB,
                            getSubcategoryIconName,
                          } = require("../../../../utils/subcategoryIcons");

                          // Try to get icon from database first, fallback to name-based lookup
                          const subcategoryData = budgetSubcategories.find(
                            (sub) => sub.name === subcategory
                          );
                          const dbIconName = subcategoryData?.icon;
                          const iconElement = getSubcategoryIconFromDB(
                            dbIconName,
                            subcategory,
                            16,
                            "#10B981"
                          );

                          if (iconElement) {
                            return (
                              <View style={styles.subcategoryIconContainer}>
                                {iconElement}
                              </View>
                            );
                          }
                          return null;
                        })()}
                      <Text
                        style={[
                          styles.selectText,
                          {
                            color: subcategory
                              ? colors.text
                              : colors.textSecondary,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {subcategory ||
                          (loading
                            ? "Loading..."
                            : !category
                            ? "Select category first"
                            : getCurrentSubcategories().length > 0
                            ? "Select subcategory"
                            : "No subcategories available")}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      if (!category) {
                        Alert.alert(
                          "Select Category First",
                          "Please select a category before adding a subcategory"
                        );
                        return;
                      }
                      const selectedCat = budgetCategories.find(
                        (cat) => cat.name === category
                      );
                      if (selectedCat) {
                        setSelectedCategoryForSubcategory(selectedCat);
                        setShowAddSubcategoryModal(true);
                      }
                    }}
                  >
                    <Ionicons
                      name="add"
                      size={16}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Transfer Accounts (for transfer) */}
            {transactionType === "transfer" && (
              <View style={styles.rowContainer}>
                <View
                  style={[styles.fieldContainer, { flex: 1, marginRight: 10 }]}
                >
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    From Account <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.selectContainer}>
                    <TouchableOpacity
                      style={[
                        styles.selectButton,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => {
                        if (loading) return;
                        setShowFromAccountPicker(true);
                      }}
                    >
                      <Text
                        style={[
                          styles.selectText,
                          {
                            color: fromAccount
                              ? colors.text
                              : colors.textSecondary,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {fromAccount || "Select source account"}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={16}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.addButton,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => setShowAddAccountModal(true)}
                    >
                      <Ionicons
                        name="add"
                        size={16}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View
                  style={[styles.fieldContainer, { flex: 1, marginLeft: 10 }]}
                >
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    To Account <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.selectContainer}>
                    <TouchableOpacity
                      style={[
                        styles.selectButton,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => {
                        if (loading) return;
                        setShowToAccountPicker(true);
                      }}
                    >
                      <Text
                        style={[
                          styles.selectText,
                          {
                            color: toAccount
                              ? colors.text
                              : colors.textSecondary,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {toAccount || "Select destination account"}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={16}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.addButton,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => setShowAddAccountModal(true)}
                    >
                      <Ionicons
                        name="add"
                        size={16}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Merchant and Account Row (for expense/income) */}
            {transactionType !== "transfer" && (
              <View style={styles.rowContainer}>
                <View
                  style={[styles.fieldContainer, { flex: 1, marginRight: 10 }]}
                >
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    Merchant/Payee
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.card,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    placeholder="Store or person name"
                    placeholderTextColor={colors.textSecondary}
                    value={merchant}
                    onChangeText={setMerchant}
                  />
                </View>

                <View
                  style={[styles.fieldContainer, { flex: 1, marginLeft: 10 }]}
                >
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    Account <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.selectContainer}>
                    <TouchableOpacity
                      style={[
                        styles.selectButton,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => {
                        if (loading) return;
                        const accountOptions = getAccountOptions();
                        console.log("Available accounts:", accountOptions);
                        setShowAccountPicker(true);
                      }}
                    >
                      <Text
                        style={[
                          styles.selectText,
                          {
                            color: account ? colors.text : colors.textSecondary,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {account ||
                          (loading
                            ? "Loading..."
                            : getAccountOptions().length > 0
                            ? "Select account"
                            : "No accounts available")}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={16}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.addButton,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => setShowAddAccountModal(true)}
                    >
                      <Ionicons
                        name="add"
                        size={16}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Recurring Transaction Checkbox */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsRecurring(!isRecurring)}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: colors.border,
                    backgroundColor: isRecurring
                      ? colors.primary
                      : "transparent",
                  },
                ]}
              >
                {isRecurring && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
              <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                Recurring Transaction
              </Text>
            </TouchableOpacity>

            {/* Recurring Bill Details */}
            {isRecurring && (
              <View
                style={[
                  styles.recurringSection,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text
                  style={[styles.recurringSectionTitle, { color: colors.text }]}
                >
                  {transactionType === "expense"
                    ? "Recurring Bill Details"
                    : transactionType === "income"
                    ? "Recurring Income Details"
                    : "Recurring Transfer Details"}
                </Text>

                {/* Frequency */}
                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    Frequency <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setShowFrequencyPicker(true)}
                  >
                    <Text
                      style={[styles.selectText, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {frequency}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {/* End Date */}
                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    End Date (Optional)
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.dateButtonFull,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Ionicons
                      name="calendar"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.dateText,
                        { color: endDate ? colors.text : colors.textSecondary },
                      ]}
                    >
                      {endDate ? formatDate(endDate) : "No end date"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Due Date */}
                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    Due Date <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.dateButtonFull,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setShowDueDatePicker(true)}
                  >
                    <Ionicons
                      name="calendar"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.dateText, { color: colors.text }]}>
                      {formatDate(dueDate)}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Enable Autopay */}
                <View style={styles.autopayContainer}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    Enable Autopay
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.toggle,
                      {
                        backgroundColor: enableAutopay
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                    onPress={() => setEnableAutopay(!enableAutopay)}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        {
                          backgroundColor: "white",
                          transform: [{ translateX: enableAutopay ? 20 : 2 }],
                        },
                      ]}
                    />
                  </TouchableOpacity>
                </View>

                {/* Autopay Account */}
                {enableAutopay && (
                  <>
                    <View style={styles.fieldContainer}>
                      <Text style={[styles.fieldLabel, { color: colors.text }]}>
                        Autopay Bank Account{" "}
                        <Text style={styles.required}>*</Text>
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.selectButton,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => setShowAutopayAccountPicker(true)}
                      >
                        <Text
                          style={[
                            styles.selectText,
                            {
                              color: autopayAccount
                                ? colors.text
                                : colors.textSecondary,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {autopayAccount || "Select account"}
                        </Text>
                        <Ionicons
                          name="chevron-down"
                          size={16}
                          color={colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Use Same Account Checkbox */}
                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() => setUseSameAccount(!useSameAccount)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          {
                            borderColor: colors.border,
                            backgroundColor: useSameAccount
                              ? colors.primary
                              : "transparent",
                          },
                        ]}
                      >
                        {useSameAccount && (
                          <Ionicons name="checkmark" size={16} color="white" />
                        )}
                      </View>
                      <Text
                        style={[styles.checkboxLabel, { color: colors.text }]}
                      >
                        Use same as transaction account
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {/* Action Buttons */}
            {isEditMode ? (
              // Edit mode: Show Update, Copy, Delete buttons (Copy in middle)
              <View style={styles.editButtonContainer}>
                <TouchableOpacity
                  style={[styles.updateButton, { backgroundColor: "#10B981" }]}
                  onPress={handleAddTransaction}
                >
                  <Text style={styles.updateButtonText}>Update</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.copyButton, { backgroundColor: "#3B82F6" }]}
                  onPress={handleCopyTransaction}
                >
                  <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: "#EF4444" }]}
                  onPress={() => setShowDeleteConfirmation(true)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Add mode: Show Cancel and Add buttons
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={onClose}
                >
                  <Text
                    style={[styles.cancelButtonText, { color: colors.text }]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.addTransactionButton,
                    {
                      backgroundColor:
                        transactionTypes.find((t) => t.id === transactionType)
                          ?.color || colors.primary,
                    },
                  ]}
                  onPress={handleAddTransaction}
                >
                  <Text style={styles.addTransactionButtonText}>
                    Add Transaction
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Date Picker Modal */}
            {showDatePicker && Platform.OS === "ios" && (
              <Modal visible={showDatePicker} transparent animationType="slide">
                <View style={styles.datePickerOverlay}>
                  <View
                    style={[
                      styles.datePickerContainer,
                      { backgroundColor: colors.background },
                    ]}
                  >
                    <View
                      style={[
                        styles.datePickerHeader,
                        {
                          backgroundColor: colors.card,
                          borderBottomColor: colors.border,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text
                          style={[
                            styles.datePickerButton,
                            { color: colors.textSecondary },
                          ]}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text
                          style={[
                            styles.datePickerButton,
                            { color: colors.primary },
                          ]}
                        >
                          Done
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                      style={[
                        styles.datePicker,
                        { backgroundColor: colors.background },
                      ]}
                    />
                  </View>
                </View>
              </Modal>
            )}

            {/* Android Date Picker */}
            {showDatePicker && Platform.OS === "android" && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            {/* Due Date Picker Modal */}
            {showDueDatePicker && Platform.OS === "ios" && (
              <Modal
                visible={showDueDatePicker}
                transparent
                animationType="slide"
              >
                <View style={styles.datePickerOverlay}>
                  <View
                    style={[
                      styles.datePickerContainer,
                      { backgroundColor: colors.background },
                    ]}
                  >
                    <View
                      style={[
                        styles.datePickerHeader,
                        {
                          backgroundColor: colors.card,
                          borderBottomColor: colors.border,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => setShowDueDatePicker(false)}
                      >
                        <Text
                          style={[
                            styles.datePickerButton,
                            { color: colors.textSecondary },
                          ]}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setShowDueDatePicker(false)}
                      >
                        <Text
                          style={[
                            styles.datePickerButton,
                            { color: colors.primary },
                          ]}
                        >
                          Done
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={dueDate}
                      mode="date"
                      display="spinner"
                      onChange={handleDueDateChange}
                      style={[
                        styles.datePicker,
                        { backgroundColor: colors.background },
                      ]}
                    />
                  </View>
                </View>
              </Modal>
            )}

            {/* Android Due Date Picker */}
            {showDueDatePicker && Platform.OS === "android" && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display="default"
                onChange={handleDueDateChange}
              />
            )}

            {/* Category Picker Modal */}
            {showCategoryPicker && (
              <Modal
                visible={showCategoryPicker}
                transparent
                animationType="slide"
              >
                <TouchableWithoutFeedback
                  onPress={() => setShowCategoryPicker(false)}
                >
                  <View style={styles.pickerOverlay}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                      <View
                        style={[
                          styles.pickerContainer,
                          { backgroundColor: colors.background },
                        ]}
                      >
                        <View
                          style={[
                            styles.pickerHeader,
                            {
                              backgroundColor: colors.card,
                              borderBottomColor: colors.border,
                            },
                          ]}
                        >
                          <TouchableOpacity
                            onPress={() => setShowCategoryPicker(false)}
                            style={styles.pickerHeaderButton}
                          >
                            <Ionicons
                              name="close"
                              size={24}
                              color={colors.textSecondary}
                            />
                          </TouchableOpacity>
                          <View style={styles.pickerTitleRow}>
                            <Text
                              style={[styles.pickerTitle, { color: colors.text }]}
                            >
                              Select Category
                            </Text>
                            <TouchableOpacity
                              style={[
                                styles.viewToggleSingleButton,
                                { backgroundColor: categoryViewMode === "grid" ? colors.primary : colors.card }
                              ]}
                              onPress={() => setCategoryViewMode(categoryViewMode === "grid" ? "list" : "grid")}
                            >
                              <Ionicons
                                name="grid"
                                size={16}
                                color={categoryViewMode === "grid" ? "#fff" : colors.textSecondary}
                              />
                            </TouchableOpacity>
                          </View>
                          <TouchableOpacity
                            onPress={() => setShowCategoryPicker(false)}
                            style={styles.pickerHeaderButton}
                          >
                            <Ionicons
                              name="checkmark"
                              size={24}
                              color={colors.primary}
                            />
                          </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.pickerContent}>
                          {categoryViewMode === "list" ? (
                            // List View
                            getCurrentCategories().map((categoryName, index) => (
                              <TouchableOpacity
                                key={index}
                                style={[
                                  styles.pickerItem,
                                  { borderBottomColor: colors.border },
                                ]}
                                onPress={() => {
                                  setCategory(categoryName);
                                  setSubcategory("");
                                  setShowCategoryPicker(false);
                                }}
                              >
                                <Text
                                  style={[
                                    styles.pickerItemText,
                                    {
                                      color:
                                        category === categoryName
                                          ? colors.primary
                                          : colors.text,
                                      fontWeight:
                                        category === categoryName ? "600" : "400",
                                    },
                                  ]}
                                >
                                  {categoryName}
                                </Text>
                                {category === categoryName && (
                                  <Ionicons
                                    name="checkmark"
                                    size={20}
                                    color={colors.primary}
                                  />
                                )}
                              </TouchableOpacity>
                            ))
                          ) : (
                            // Grid View
                            <View style={styles.gridContainer}>
                              {getCurrentCategories().map((categoryName, index) => (
                                <TouchableOpacity
                                  key={index}
                                  style={[
                                    styles.gridItem,
                                    {
                                      backgroundColor: category === categoryName ? colors.primary + "20" : colors.card,
                                      borderColor: category === categoryName ? colors.primary : colors.border,
                                    },
                                  ]}
                                  onPress={() => {
                                    setCategory(categoryName);
                                    setSubcategory("");
                                    setShowCategoryPicker(false);
                                  }}
                                >
                                  <Text
                                    style={[
                                      styles.gridItemText,
                                      {
                                        color:
                                          category === categoryName
                                            ? colors.primary
                                            : colors.text,
                                      },
                                    ]}
                                  >
                                    {categoryName}
                                  </Text>
                                  {category === categoryName && (
                                    <Ionicons
                                      name="checkmark-circle"
                                      size={16}
                                      color={colors.primary}
                                      style={styles.gridItemCheckmark}
                                    />
                                  )}
                                </TouchableOpacity>
                              ))}
                            </View>
                          )}
                        </ScrollView>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            )}

            {/* Subcategory Picker Modal */}
            {showSubcategoryPicker && (
              <Modal
                visible={showSubcategoryPicker}
                transparent
                animationType="slide"
              >
                <TouchableWithoutFeedback
                  onPress={() => setShowSubcategoryPicker(false)}
                >
                  <View style={styles.pickerOverlay}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                      <View
                        style={[
                          styles.pickerContainer,
                          { backgroundColor: colors.background },
                        ]}
                      >
                        <View
                          style={[
                            styles.pickerHeader,
                            {
                              backgroundColor: colors.card,
                              borderBottomColor: colors.border,
                            },
                          ]}
                        >
                          <TouchableOpacity
                            onPress={() => setShowSubcategoryPicker(false)}
                            style={styles.pickerHeaderButton}
                          >
                            <Ionicons
                              name="close"
                              size={24}
                              color={colors.textSecondary}
                            />
                          </TouchableOpacity>
                          <View style={styles.pickerTitleRow}>
                            <Text
                              style={[styles.pickerTitle, { color: colors.text }]}
                            >
                              Select Subcategory
                            </Text>
                            <TouchableOpacity
                              style={[
                                styles.viewToggleSingleButton,
                                { backgroundColor: subcategoryViewMode === "grid" ? colors.primary : colors.card }
                              ]}
                              onPress={() => setSubcategoryViewMode(subcategoryViewMode === "grid" ? "list" : "grid")}
                            >
                              <Ionicons
                                name="grid"
                                size={16}
                                color={subcategoryViewMode === "grid" ? "#fff" : colors.textSecondary}
                              />
                            </TouchableOpacity>
                          </View>
                          <TouchableOpacity
                            onPress={() => setShowSubcategoryPicker(false)}
                            style={styles.pickerHeaderButton}
                          >
                            <Ionicons
                              name="checkmark"
                              size={24}
                              color={colors.primary}
                            />
                          </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.pickerContent}>
                          {subcategoryViewMode === "list" ? (
                            // List View
                            getCurrentSubcategories().map(
                              (subcategoryName, index) => {
                                const {
                                  getSubcategoryIconFromDB,
                                } = require("../../../../utils/subcategoryIcons");
                                
                                const subcategoryData =
                                  budgetSubcategories.find(
                                    (sub) => sub.name === subcategoryName
                                  );
                                const dbIconName = subcategoryData?.icon;
                                const iconElement =
                                  getSubcategoryIconFromDB(
                                    dbIconName,
                                    subcategoryName,
                                    20,
                                    "#10B981"
                                  );

                                return (
                                  <TouchableOpacity
                                    key={index}
                                    style={[
                                      styles.pickerItem,
                                      { borderBottomColor: colors.border },
                                    ]}
                                    onPress={() => {
                                      setSubcategory(subcategoryName);
                                      setShowSubcategoryPicker(false);
                                    }}
                                  >
                                    <View style={styles.pickerItemContent}>
                                      <View style={styles.pickerItemIcon}>
                                        {iconElement || <Text style={styles.pickerItemEmoji}>📄</Text>}
                                      </View>
                                      <Text
                                        style={[
                                          styles.pickerItemText,
                                          {
                                            color:
                                              subcategory === subcategoryName
                                                ? colors.primary
                                                : colors.text,
                                            fontWeight:
                                              subcategory === subcategoryName
                                                ? "600"
                                                : "400",
                                          },
                                        ]}
                                      >
                                        {subcategoryName}
                                      </Text>
                                    </View>
                                    {subcategory === subcategoryName && (
                                      <Ionicons
                                        name="checkmark"
                                        size={20}
                                        color={colors.primary}
                                      />
                                    )}
                                  </TouchableOpacity>
                                );
                              }
                            )
                          ) : (
                            // Grid View
                            <View style={styles.gridContainer}>
                              {getCurrentSubcategories().map(
                                (subcategoryName, index) => {
                                  const {
                                    getSubcategoryIconFromDB,
                                  } = require("../../../../utils/subcategoryIcons");
                                  
                                  const subcategoryData =
                                    budgetSubcategories.find(
                                      (sub) => sub.name === subcategoryName
                                    );
                                  const dbIconName = subcategoryData?.icon;
                                  const iconElement =
                                    getSubcategoryIconFromDB(
                                      dbIconName,
                                      subcategoryName,
                                      20,
                                      subcategory === subcategoryName ? colors.primary : colors.text
                                    );

                                  return (
                                    <TouchableOpacity
                                      key={index}
                                      style={[
                                        styles.gridItemLarge,
                                        {
                                          backgroundColor: subcategory === subcategoryName ? colors.primary + "20" : colors.card,
                                          borderColor: subcategory === subcategoryName ? colors.primary : colors.border,
                                        },
                                      ]}
                                      onPress={() => {
                                        setSubcategory(subcategoryName);
                                        setShowSubcategoryPicker(false);
                                      }}
                                    >
                                      <View style={styles.gridItemIcon}>
                                        {iconElement || <Text style={{fontSize: 20}}>📄</Text>}
                                      </View>
                                      <Text
                                        style={[
                                          styles.gridItemTextLarge,
                                          {
                                            color:
                                              subcategory === subcategoryName
                                                ? colors.primary
                                                : colors.text,
                                          },
                                        ]}
                                        numberOfLines={2}
                                      >
                                        {subcategoryName}
                                      </Text>
                                      {subcategory === subcategoryName && (
                                        <Ionicons
                                          name="checkmark-circle"
                                          size={16}
                                          color={colors.primary}
                                          style={styles.gridItemCheckmark}
                                        />
                                      )}
                                    </TouchableOpacity>
                                  );
                                }
                              )}
                            </View>
                          )}
                        </ScrollView>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            )}

            {/* Account Picker Modal */}
            {showAccountPicker && (
              <Modal
                visible={showAccountPicker}
                transparent
                animationType="slide"
              >
                <TouchableWithoutFeedback
                  onPress={() => setShowAccountPicker(false)}
                >
                  <View style={styles.pickerOverlay}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                      <View
                        style={[
                          styles.pickerContainer,
                          { backgroundColor: colors.background },
                        ]}
                      >
                        <View
                          style={[
                            styles.pickerHeader,
                            {
                              backgroundColor: colors.card,
                              borderBottomColor: colors.border,
                            },
                          ]}
                        >
                          <TouchableOpacity
                            onPress={() => setShowAccountPicker(false)}
                          >
                            <Text
                              style={[
                                styles.pickerButton,
                                { color: colors.textSecondary },
                              ]}
                            >
                              Cancel
                            </Text>
                          </TouchableOpacity>
                          <Text
                            style={[styles.pickerTitle, { color: colors.text }]}
                          >
                            Select Account
                          </Text>
                          <TouchableOpacity
                            onPress={() => setShowAccountPicker(false)}
                          >
                            <Text
                              style={[
                                styles.pickerButton,
                                { color: colors.primary },
                              ]}
                            >
                              Done
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.pickerContent}>
                          {getAccountOptions().map((accountName, index) => (
                            <TouchableOpacity
                              key={index}
                              style={[
                                styles.pickerItem,
                                { borderBottomColor: colors.border },
                              ]}
                              onPress={() => {
                                setAccount(accountName);
                                setShowAccountPicker(false);
                              }}
                            >
                              <Text
                                style={[
                                  styles.pickerItemText,
                                  {
                                    color:
                                      account === accountName
                                        ? colors.primary
                                        : colors.text,
                                    fontWeight:
                                      account === accountName ? "600" : "400",
                                  },
                                ]}
                              >
                                {accountName}
                              </Text>
                              {account === accountName && (
                                <Ionicons
                                  name="checkmark"
                                  size={20}
                                  color={colors.primary}
                                />
                              )}
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            )}

            {/* Frequency Picker Modal */}
            {showFrequencyPicker && (
              <Modal
                visible={showFrequencyPicker}
                transparent
                animationType="slide"
              >
                <TouchableWithoutFeedback
                  onPress={() => setShowFrequencyPicker(false)}
                >
                  <View style={styles.pickerOverlay}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                      <View
                        style={[
                          styles.pickerContainer,
                          { backgroundColor: colors.background },
                        ]}
                      >
                        <View
                          style={[
                            styles.pickerHeader,
                            {
                              backgroundColor: colors.card,
                              borderBottomColor: colors.border,
                            },
                          ]}
                        >
                          <TouchableOpacity
                            onPress={() => setShowFrequencyPicker(false)}
                          >
                            <Text
                              style={[
                                styles.pickerButton,
                                { color: colors.textSecondary },
                              ]}
                            >
                              Cancel
                            </Text>
                          </TouchableOpacity>
                          <Text
                            style={[styles.pickerTitle, { color: colors.text }]}
                          >
                            Select Frequency
                          </Text>
                          <TouchableOpacity
                            onPress={() => setShowFrequencyPicker(false)}
                          >
                            <Text
                              style={[
                                styles.pickerButton,
                                { color: colors.primary },
                              ]}
                            >
                              Done
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.pickerContent}>
                          {frequencies.map((freq, index) => (
                            <TouchableOpacity
                              key={index}
                              style={[
                                styles.pickerItem,
                                { borderBottomColor: colors.border },
                              ]}
                              onPress={() => {
                                setFrequency(freq);
                                setShowFrequencyPicker(false);
                              }}
                            >
                              <Text
                                style={[
                                  styles.pickerItemText,
                                  {
                                    color:
                                      frequency === freq
                                        ? colors.primary
                                        : colors.text,
                                    fontWeight:
                                      frequency === freq ? "600" : "400",
                                  },
                                ]}
                              >
                                {freq}
                              </Text>
                              {frequency === freq && (
                                <Ionicons
                                  name="checkmark"
                                  size={20}
                                  color={colors.primary}
                                />
                              )}
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            )}

            {/* End Date Picker Modal */}
            {showEndDatePicker && Platform.OS === "ios" && (
              <Modal
                visible={showEndDatePicker}
                transparent
                animationType="slide"
              >
                <View style={styles.datePickerOverlay}>
                  <View
                    style={[
                      styles.datePickerContainer,
                      { backgroundColor: colors.background },
                    ]}
                  >
                    <View
                      style={[
                        styles.datePickerHeader,
                        {
                          backgroundColor: colors.card,
                          borderBottomColor: colors.border,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => setShowEndDatePicker(false)}
                      >
                        <Text
                          style={[
                            styles.datePickerButton,
                            { color: colors.textSecondary },
                          ]}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setShowEndDatePicker(false)}
                      >
                        <Text
                          style={[
                            styles.datePickerButton,
                            { color: colors.primary },
                          ]}
                        >
                          Done
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={endDate || new Date()}
                      mode="date"
                      display="spinner"
                      onChange={handleEndDateChange}
                      style={[
                        styles.datePicker,
                        { backgroundColor: colors.background },
                      ]}
                    />
                  </View>
                </View>
              </Modal>
            )}

            {/* Android End Date Picker */}
            {showEndDatePicker && Platform.OS === "android" && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                display="default"
                onChange={handleEndDateChange}
              />
            )}

            {/* From Account Picker Modal */}
            {showFromAccountPicker && (
              <Modal
                visible={showFromAccountPicker}
                transparent
                animationType="slide"
              >
                <TouchableWithoutFeedback
                  onPress={() => setShowFromAccountPicker(false)}
                >
                  <View style={styles.pickerOverlay}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                      <View
                        style={[
                          styles.pickerContainer,
                          { backgroundColor: colors.background },
                        ]}
                      >
                        <View
                          style={[
                            styles.pickerHeader,
                            {
                              backgroundColor: colors.card,
                              borderBottomColor: colors.border,
                            },
                          ]}
                        >
                          <TouchableOpacity
                            onPress={() => setShowFromAccountPicker(false)}
                          >
                            <Text
                              style={[
                                styles.pickerButton,
                                { color: colors.textSecondary },
                              ]}
                            >
                              Cancel
                            </Text>
                          </TouchableOpacity>
                          <Text
                            style={[styles.pickerTitle, { color: colors.text }]}
                          >
                            Select Account
                          </Text>
                          <TouchableOpacity
                            onPress={() => setShowFromAccountPicker(false)}
                          >
                            <Text
                              style={[
                                styles.pickerButton,
                                { color: colors.primary },
                              ]}
                            >
                              Done
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.pickerContent}>
                          {getAccountOptions().map((accountName, index) => (
                            <TouchableOpacity
                              key={index}
                              style={[
                                styles.pickerItem,
                                { borderBottomColor: colors.border },
                              ]}
                              onPress={() => {
                                setFromAccount(accountName);
                                setShowFromAccountPicker(false);
                              }}
                            >
                              <Text
                                style={[
                                  styles.pickerItemText,
                                  { color: colors.text },
                                ]}
                              >
                                {accountName}
                              </Text>
                              {fromAccount === accountName && (
                                <Ionicons
                                  name="checkmark"
                                  size={20}
                                  color={colors.primary}
                                />
                              )}
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            )}

            {/* To Account Picker Modal */}
            {showToAccountPicker && (
              <Modal
                visible={showToAccountPicker}
                transparent
                animationType="slide"
              >
                <TouchableWithoutFeedback
                  onPress={() => setShowToAccountPicker(false)}
                >
                  <View style={styles.pickerOverlay}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                      <View
                        style={[
                          styles.pickerContainer,
                          { backgroundColor: colors.background },
                        ]}
                      >
                        <View
                          style={[
                            styles.pickerHeader,
                            {
                              backgroundColor: colors.card,
                              borderBottomColor: colors.border,
                            },
                          ]}
                        >
                          <TouchableOpacity
                            onPress={() => setShowToAccountPicker(false)}
                          >
                            <Text
                              style={[
                                styles.pickerButton,
                                { color: colors.textSecondary },
                              ]}
                            >
                              Cancel
                            </Text>
                          </TouchableOpacity>
                          <Text
                            style={[styles.pickerTitle, { color: colors.text }]}
                          >
                            Select Account
                          </Text>
                          <TouchableOpacity
                            onPress={() => setShowToAccountPicker(false)}
                          >
                            <Text
                              style={[
                                styles.pickerButton,
                                { color: colors.primary },
                              ]}
                            >
                              Done
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.pickerContent}>
                          {getAccountOptions().map((accountName, index) => (
                            <TouchableOpacity
                              key={index}
                              style={[
                                styles.pickerItem,
                                { borderBottomColor: colors.border },
                              ]}
                              onPress={() => {
                                setToAccount(accountName);
                                setShowToAccountPicker(false);
                              }}
                            >
                              <Text
                                style={[
                                  styles.pickerItemText,
                                  { color: colors.text },
                                ]}
                              >
                                {accountName}
                              </Text>
                              {toAccount === accountName && (
                                <Ionicons
                                  name="checkmark"
                                  size={20}
                                  color={colors.primary}
                                />
                              )}
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            )}

            {/* Autopay Account Picker Modal */}
            {showAutopayAccountPicker && (
              <Modal
                visible={showAutopayAccountPicker}
                transparent
                animationType="slide"
              >
                <TouchableWithoutFeedback
                  onPress={() => setShowAutopayAccountPicker(false)}
                >
                  <View style={styles.pickerOverlay}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                      <View
                        style={[
                          styles.pickerContainer,
                          { backgroundColor: colors.background },
                        ]}
                      >
                        <View
                          style={[
                            styles.pickerHeader,
                            {
                              backgroundColor: colors.card,
                              borderBottomColor: colors.border,
                            },
                          ]}
                        >
                          <TouchableOpacity
                            onPress={() => setShowAutopayAccountPicker(false)}
                          >
                            <Text
                              style={[
                                styles.pickerButton,
                                { color: colors.textSecondary },
                              ]}
                            >
                              Cancel
                            </Text>
                          </TouchableOpacity>
                          <Text
                            style={[styles.pickerTitle, { color: colors.text }]}
                          >
                            Select Autopay Account
                          </Text>
                          <TouchableOpacity
                            onPress={() => setShowAutopayAccountPicker(false)}
                          >
                            <Text
                              style={[
                                styles.pickerButton,
                                { color: colors.primary },
                              ]}
                            >
                              Done
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.pickerContent}>
                          {getAccountOptions().map((accountName, index) => (
                            <TouchableOpacity
                              key={index}
                              style={[
                                styles.pickerItem,
                                { borderBottomColor: colors.border },
                              ]}
                              onPress={() => {
                                setAutopayAccount(accountName);
                                setShowAutopayAccountPicker(false);
                              }}
                            >
                              <Text
                                style={[
                                  styles.pickerItemText,
                                  {
                                    color:
                                      autopayAccount === accountName
                                        ? colors.primary
                                        : colors.text,
                                    fontWeight:
                                      autopayAccount === accountName
                                        ? "600"
                                        : "400",
                                  },
                                ]}
                              >
                                {accountName}
                              </Text>
                              {autopayAccount === accountName && (
                                <Ionicons
                                  name="checkmark"
                                  size={20}
                                  color={colors.primary}
                                />
                              )}
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            )}

            {/* Add Category Modal */}
            <AddCategoryModal
              visible={showAddCategoryModal}
              onClose={() => setShowAddCategoryModal(false)}
              onCategoryAdded={handleCategoryAdded}
              transactionType={
                transactionType === "income" ? "income" : "expense"
              }
            />

            {/* Add Subcategory Modal */}
            <AddSubcategoryModal
              visible={showAddSubcategoryModal}
              onClose={() => setShowAddSubcategoryModal(false)}
              onSubcategoryAdded={handleSubcategoryAdded}
              parentCategory={selectedCategoryForSubcategory}
            />

            {/* Add Account Modal */}
            <AddAccountModal
              visible={showAddAccountModal}
              onClose={() => setShowAddAccountModal(false)}
              onAccountAdded={handleAccountAdded}
            />

            {/* Add Credit Card Modal */}
            <AddCreditCardModal
              visible={showAddCreditCardModal}
              onClose={() => setShowAddCreditCardModal(false)}
              onCreditCardAdded={handleCreditCardAdded}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteConfirmation && (
              <Modal
                visible={showDeleteConfirmation}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDeleteConfirmation(false)}
              >
                <View style={styles.deleteModalOverlay}>
                  <View
                    style={[
                      styles.deleteModalContainer,
                      { backgroundColor: colors.card },
                    ]}
                  >
                    <View style={styles.deleteModalHeader}>
                      <Text
                        style={[
                          styles.deleteModalTitle,
                          { color: colors.text },
                        ]}
                      >
                        Delete Transaction
                      </Text>
                    </View>

                    <View style={styles.deleteModalContent}>
                      <Text
                        style={[
                          styles.deleteModalMessage,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Are you sure you want to delete this transaction? This
                        action cannot be undone.
                      </Text>
                      <Text
                        style={[
                          styles.deleteModalTransaction,
                          { color: colors.text },
                        ]}
                      >
                        "{description}"
                      </Text>
                    </View>

                    <View style={styles.deleteModalActions}>
                      <TouchableOpacity
                        style={[
                          styles.deleteModalButton,
                          styles.cancelDeleteButton,
                          { borderColor: colors.border },
                        ]}
                        onPress={() => setShowDeleteConfirmation(false)}
                      >
                        <Text
                          style={[
                            styles.deleteModalButtonText,
                            { color: colors.text },
                          ]}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.deleteModalButton,
                          styles.confirmDeleteButton,
                        ]}
                        onPress={handleDeleteTransaction}
                      >
                        <Text
                          style={[
                            styles.deleteModalButtonText,
                            { color: "#FFFFFF" },
                          ]}
                        >
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            )}

            {/* Copy Transaction Modal */}
            {showCopyModal && copyTransactionData && (
              <Modal
                visible={showCopyModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={handleCloseCopyModal}
              >
                <AddTransactionModal
                  colors={colors}
                  isDark={isDark}
                  onClose={handleCloseCopyModal}
                  onBack={handleCloseCopyModal}
                  editTransaction={copyTransactionData}
                  isEditMode={false}
                  isCopyMode={true}
                  onTransactionUpdate={handleCopyTransactionUpdate}
                />
              </Modal>
            )}
          </ScrollView>
        );

      case "SMS":
        return (
          <View style={styles.smsContainer}>
            <Text style={[styles.smsTitle, { color: colors.text }]}>
              Paste Transaction SMS
            </Text>
            <TextInput
              style={[
                styles.smsInput,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Paste your transaction SMS here..."
              placeholderTextColor={colors.textSecondary}
              value={smsText}
              onChangeText={setSmsText}
              multiline
              textAlignVertical="top"
              editable={!isAnalyzingSMS}
            />

            {/* Analysis Result Display */}
            {smsAnalysisResult && (
              <View
                style={[
                  styles.analysisResultContainer,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text
                  style={[styles.analysisResultTitle, { color: colors.text }]}
                >
                  Analysis Result
                </Text>
                {smsAnalysisResult.success ? (
                  <View>
                    <Text
                      style={[
                        styles.analysisResultText,
                        { color: colors.primary },
                      ]}
                    >
                      ✅ Success (Confidence:{" "}
                      {Math.round((smsAnalysisResult.confidence || 0) * 100)}%)
                    </Text>
                    <Text
                      style={[
                        styles.analysisResultDetail,
                        { color: colors.text },
                      ]}
                    >
                      Amount: ₹{smsAnalysisResult.data?.amount || "N/A"}
                    </Text>
                    <Text
                      style={[
                        styles.analysisResultDetail,
                        { color: colors.text },
                      ]}
                    >
                      Merchant: {smsAnalysisResult.data?.merchant || "N/A"}
                    </Text>
                    <Text
                      style={[
                        styles.analysisResultDetail,
                        { color: colors.text },
                      ]}
                    >
                      Type: {smsAnalysisResult.data?.transactionType || "N/A"}
                    </Text>
                    <Text
                      style={[
                        styles.analysisResultDetail,
                        { color: colors.text },
                      ]}
                    >
                      Category: {smsAnalysisResult.data?.categoryName || "N/A"}
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={[styles.analysisResultText, { color: "#EF4444" }]}
                  >
                    ❌ {smsAnalysisResult.error || "Analysis failed"}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={onClose}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.analyzeSmsButton,
                  {
                    backgroundColor: isAnalyzingSMS
                      ? colors.textSecondary
                      : colors.primary,
                    opacity: isAnalyzingSMS ? 0.7 : 1,
                  },
                ]}
                onPress={handleAnalyzeSMS}
                disabled={isAnalyzingSMS}
              >
                <Text style={styles.analyzeSmsButtonText}>
                  {isAnalyzingSMS ? "Analyzing..." : "Analyze SMS"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case "Image":
        return (
          <View style={styles.imageContainer}>
            <Text style={[styles.imageTitle, { color: colors.text }]}>
              Upload Receipt/Bill Image
            </Text>

            {selectedImage ? (
              <View
                style={[
                  styles.selectedImageContainer,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.selectedImage}
                />
                <TouchableOpacity
                  style={[
                    styles.changeImageButton,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={handleSelectImage}
                >
                  <Text
                    style={[
                      styles.changeImageButtonText,
                      { color: colors.text },
                    ]}
                  >
                    Change Image
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.uploadArea, { borderColor: colors.border }]}>
                <Ionicons
                  name="camera"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text
                  style={[styles.uploadText, { color: colors.textSecondary }]}
                >
                  Click to upload or drag and drop
                </Text>
                <Text
                  style={[
                    styles.uploadSubtext,
                    { color: colors.textSecondary },
                  ]}
                >
                  JPG, PNG, or HEIC up to 10MB
                </Text>
                <TouchableOpacity
                  style={[
                    styles.selectImageButton,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={handleSelectImage}
                >
                  <Text
                    style={[styles.selectImageText, { color: colors.text }]}
                  >
                    Select Image
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Analysis Result Display */}
            {imageAnalysisResult && (
              <View
                style={[
                  styles.analysisResultContainer,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text
                  style={[styles.analysisResultTitle, { color: colors.text }]}
                >
                  Analysis Result
                </Text>
                {imageAnalysisResult.success ? (
                  <View>
                    <Text
                      style={[
                        styles.analysisResultText,
                        { color: colors.primary },
                      ]}
                    >
                      ✅ Success (Confidence:{" "}
                      {Math.round((imageAnalysisResult.confidence || 0) * 100)}
                      %)
                    </Text>
                    <Text
                      style={[
                        styles.analysisResultDetail,
                        { color: colors.text },
                      ]}
                    >
                      Amount: ₹{imageAnalysisResult.data?.amount || "N/A"}
                    </Text>
                    <Text
                      style={[
                        styles.analysisResultDetail,
                        { color: colors.text },
                      ]}
                    >
                      Merchant: {imageAnalysisResult.data?.merchant || "N/A"}
                    </Text>
                    <Text
                      style={[
                        styles.analysisResultDetail,
                        { color: colors.text },
                      ]}
                    >
                      Type: {imageAnalysisResult.data?.type || "N/A"}
                    </Text>
                    <Text
                      style={[
                        styles.analysisResultDetail,
                        { color: colors.text },
                      ]}
                    >
                      Category: {imageAnalysisResult.data?.category || "N/A"}
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={[styles.analysisResultText, { color: "#EF4444" }]}
                  >
                    ❌ Analysis failed
                  </Text>
                )}
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={onClose}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.analyzeImageButton,
                  {
                    backgroundColor: isAnalyzingImage
                      ? colors.textSecondary
                      : colors.primary,
                    opacity: isAnalyzingImage || !selectedImage ? 0.7 : 1,
                  },
                ]}
                onPress={handleAnalyzeImage}
                disabled={isAnalyzingImage || !selectedImage}
              >
                <Text style={styles.analyzeImageButtonText}>
                  {isAnalyzingImage ? "Analyzing..." : "Analyze Image"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View
      style={[
        styles.transactionModalContainer,
        { backgroundColor: colors.background },
      ]}
    >
      {/* Toast notification */}
      <ToastNotification
        message={toastMessage}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
      {/* Header */}
      <View
        style={[
          styles.transactionModalHeader,
          { borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.transactionModalTitle, { color: colors.text }]}>
          {isEditMode
            ? "Edit Transaction"
            : isCopyMode
            ? "Copy Transaction"
            : "Add New Transaction"}
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={20} color="#10B981" />
        </TouchableOpacity>
      </View>

      {/* Grouped Tab Navigation */}
      <View
        style={[
          styles.groupedTabContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <View style={[styles.tabGroup, { backgroundColor: colors.card }]}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.groupedTab,
                {
                  backgroundColor:
                    activeTab === tab ? colors.primary : "transparent",
                },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.groupedTabText,
                  {
                    color: activeTab === tab ? "white" : colors.text,
                    fontWeight: activeTab === tab ? "700" : "500",
                  },
                ]}
                numberOfLines={1}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tab Content */}
      {renderTabContent()}
    </View>
  );
};

const QuickAddButton: React.FC<QuickAddButtonProps> = ({
  style,
  editTransaction,
  isEditMode = false,
  onTransactionUpdate,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Form states for loan and contact actions
  const [recipientType, setRecipientType] = useState<
    "person" | "group" | "bank"
  >("person");
  const [loanType, setLoanType] = useState<"give" | "take" | null>("take");
  const [selectedContact, setSelectedContact] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [interestRate, setInterestRate] = useState("0");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formProgress, setFormProgress] = useState(0);

  // Enhanced loan data capture states
  const [loanStartDate, setLoanStartDate] = useState("");
  const [loanEndDate, setLoanEndDate] = useState("");
  const [repaymentFrequency, setRepaymentFrequency] = useState("monthly");
  const [numberOfInstallments, setNumberOfInstallments] = useState("");
  const [gracePeriod, setGracePeriod] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDays, setReminderDays] = useState("3");
  const [notes, setNotes] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loanReference, setLoanReference] = useState("");
  const [groupMembers, setGroupMembers] = useState<
    Array<{ name: string; share: string }>
  >([]);
  const [currency, setCurrency] = useState("INR");
  const { isDark } = useTheme();
  const navigation = useNavigation();

  // Mock data for the reusable LoanCreationModal
  const mockPersons = [
    {
      id: "1",
      name: "John Doe",
      type: "person" as const,
      email: "john@example.com",
      balance: 5000,
    },
    {
      id: "2",
      name: "Jane Smith",
      type: "person" as const,
      email: "jane@example.com",
      balance: -2000,
    },
    {
      id: "3",
      name: "Mike Johnson",
      type: "person" as const,
      email: "mike@example.com",
      balance: 0,
    },
  ];

  const mockGroups = [
    { id: "1", name: "Family", type: "group" as const, memberCount: 5 },
    { id: "2", name: "Office Team", type: "group" as const, memberCount: 8 },
    {
      id: "3",
      name: "Weekend Friends",
      type: "group" as const,
      memberCount: 6,
    },
  ];

  const mockBanks = [
    {
      id: "1",
      name: "Chase Bank",
      type: "bank" as const,
      branch: "Downtown Branch",
    },
    {
      id: "2",
      name: "Wells Fargo",
      type: "bank" as const,
      branch: "Main Street Branch",
    },
    {
      id: "3",
      name: "Bank of America",
      type: "bank" as const,
      branch: "Central Branch",
    },
  ];

  // Handle loan creation from the reusable component
  const handleCreateLoan = async (loanData: any) => {
    try {
      console.log("Creating loan with data:", loanData);
      // Here you would integrate with your loan management service
      // await LoanManagementService.createLoan(loanData.selectedRecipient, Number(loanData.amount), {
      //   interestRate: Number(loanData.interestRate),
      //   dueDate: loanData.dueDate,
      //   description: loanData.description,
      // });

      // Show success message
      Alert.alert("Success", "Loan created successfully!");

      // Close the modal
      handleCloseModal();
    } catch (error) {
      console.error("Error creating loan:", error);
      Alert.alert("Error", "Failed to create loan. Please try again.");
    }
  };

  // Smart suggestions based on loan amount
  const getSuggestions = (amount: number): string[] => {
    if (amount <= 5000) {
      return [
        "Emergency expenses",
        "Medical bills",
        "Phone/Laptop repair",
        "Monthly expenses",
      ];
    } else if (amount <= 25000) {
      return [
        "Education fees",
        "Home appliances",
        "Wedding expenses",
        "Medical treatment",
      ];
    } else if (amount <= 100000) {
      return [
        "Home renovation",
        "Vehicle down payment",
        "Business investment",
        "Debt consolidation",
      ];
    } else {
      return [
        "Property investment",
        "Business expansion",
        "Major home renovation",
        "Education abroad",
      ];
    }
  };

  // Calculate form progress
  useEffect(() => {
    if (selectedAction === "loan") {
      const fields = [
        loanType,
        recipientType,
        selectedContact,
        amount,
        description,
      ];
      const filledFields = fields.filter((field) => {
        if (typeof field === "string") {
          return field && field.trim() !== "";
        }
        return field !== null && field !== undefined;
      }).length;
      setFormProgress((filledFields / fields.length) * 100);
    } else if (selectedAction === "contact") {
      const fields = [description];
      const filledFields = fields.filter(
        (field) => field && field.trim() !== ""
      ).length;
      setFormProgress((filledFields / fields.length) * 100);
    }
  }, [
    selectedAction,
    loanType,
    recipientType,
    selectedContact,
    amount,
    description,
    interestRate,
    repaymentFrequency,
    numberOfInstallments,
    paymentMethod,
  ]);

  // Auto-open modal for edit mode
  useEffect(() => {
    if (isEditMode && editTransaction) {
      setSelectedAction("transaction");
      setIsModalVisible(true);
    }
  }, [isEditMode, editTransaction]);

  // Fetch accounts for bulk upload
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const accountsData = await fetchAccounts();
        setAccounts(accountsData);
        // Auto-select first account if available
        if (accountsData.length > 0) {
          setSelectedAccount(accountsData[0]);
        }
      } catch (error) {
        console.error("Failed to load accounts:", error);
      }
    };
    loadAccounts();
  }, []);

  const colors = isDark
    ? {
        background: "#1F2937",
        card: "#374151",
        text: "#FFFFFF",
        textSecondary: "#9CA3AF",
        border: "#4B5563",
        primary: "#10B981",
        secondary: "#3B82F6",
        accent: "#F59E0B",
      }
    : {
        background: "#FFFFFF",
        card: "#F9FAFB",
        text: "#111827",
        textSecondary: "#6B7280",
        border: "#E5E7EB",
        primary: "#10B981",
        secondary: "#3B82F6",
        accent: "#F59E0B",
      };

  const quickActions = [
    {
      id: "transaction",
      title: "Add Transaction",
      subtitle: "Record income or expense",
      icon: "add-circle",
      color: colors.primary,
      action: () => {
        setSelectedAction("transaction");
        setIsModalVisible(true);
      },
    },
    {
      id: "bank-statement",
      title: "Upload Statement",
      subtitle: "Import from bank statement",
      icon: "document-text",
      color: colors.secondary,
      action: () => {
        setSelectedAction("bank-statement");
        setIsModalVisible(true);
      },
    },
    {
      id: "goal",
      title: "Set Goal",
      subtitle: "Create financial goal",
      icon: "flag",
      color: colors.accent,
      action: () => {
        setSelectedAction("goal");
        setIsModalVisible(true);
      },
    },
    {
      id: "budget",
      title: "Set Budget",
      subtitle: "Create spending budget",
      icon: "pie-chart",
      color: "#8B5CF6",
      action: () => {
        setSelectedAction("budget");
        setIsModalVisible(true);
      },
    },
    {
      id: "travel",
      title: "Travel Expense",
      subtitle: "Track travel costs",
      icon: "airplane",
      color: "#8B5CF6",
      action: () => {
        setSelectedAction("travel");
        setIsModalVisible(true);
      },
    },
    {
      id: "date",
      title: "Date Range",
      subtitle: "Filter by date",
      icon: "calendar",
      color: "#F59E0B",
      action: () => {
        setSelectedAction("date");
        setIsModalVisible(true);
      },
    },
    {
      id: "receipt",
      title: "Scan Receipt",
      subtitle: "Photo to transaction",
      icon: "camera",
      color: "#EF4444",
      action: () => {
        setSelectedAction("receipt");
        setIsModalVisible(true);
      },
    },
    {
      id: "recurring",
      title: "Recurring Bill",
      subtitle: "Set up auto bills",
      icon: "refresh",
      color: "#06B6D4",
      action: () => {
        setSelectedAction("recurring");
        setIsModalVisible(true);
      },
    },
    {
      id: "loan",
      title: "Add Loan",
      subtitle: "Create or manage loans",
      icon: "cash-outline",
      color: "#10B981",
      action: () => {
        setSelectedAction("loan");
        setIsModalVisible(true);
      },
    },
    {
      id: "contact",
      title: "Add Contact",
      subtitle: "Add individual or group",
      icon: "person-add-outline",
      color: "#F59E0B",
      action: () => {
        setSelectedAction("contact");
        setIsModalVisible(true);
      },
    },
  ];

  const handleBankStatementUpload = (fileData: any) => {
    if (fileData && fileData.success) {
      Alert.alert("Upload Successful", fileData.message);
      // Here you can add logic to process the uploaded file
      // For example, send it to your backend or parse it
    } else {
      Alert.alert("Upload Failed", "Please try uploading the file again.");
    }
  };

  const handleBackToQuickActions = () => {
    setSelectedAction(null);
  };

  const handleCloseModal = () => {
    setSelectedAction(null);
    setIsModalVisible(false);
  };

  const renderModalContent = () => {
    switch (selectedAction) {
      case "bank-statement":
        return (
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Upload Bank Statement
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleBackToQuickActions}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <BankStatementErrorBoundary>
              <BankStatementUploader
                onUpload={handleBankStatementUpload}
                onUploadComplete={(result) => {
                  console.log("✅ Bank statement upload completed!", result);
                  if (result.success) {
                    Alert.alert(
                      "Upload Successful!",
                      `Successfully uploaded ${
                        result.result?.inserted_count || 0
                      } transactions!`
                    );
                    handleCloseModal();
                  }
                }}
                onClose={handleBackToQuickActions}
                isLoading={false}
                fileName=""
                showPlusIcons={true}
                accountId={selectedAccount?.id}
                accountName={selectedAccount?.name}
              />
            </BankStatementErrorBoundary>
          </View>
        );

      case "transaction":
        return (
          <AddTransactionModal
            colors={colors}
            isDark={isDark}
            onClose={handleCloseModal}
            onBack={handleBackToQuickActions}
            editTransaction={editTransaction}
            isEditMode={isEditMode}
            onTransactionUpdate={onTransactionUpdate}
          />
        );

      case "goal":
        return (
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Set Financial Goal
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleBackToQuickActions}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.placeholderContent}>
              <Ionicons name="flag" size={64} color={colors.accent} />
              <Text style={[styles.placeholderTitle, { color: colors.text }]}>
                Set Goal
              </Text>
              <Text
                style={[
                  styles.placeholderText,
                  { color: colors.textSecondary },
                ]}
              >
                Goal setting form will be implemented here
              </Text>
            </View>
          </View>
        );

      case "budget":
        return (
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Set Budget
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleBackToQuickActions}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.placeholderContent}>
              <Ionicons name="pie-chart" size={64} color="#8B5CF6" />
              <Text style={[styles.placeholderTitle, { color: colors.text }]}>
                Set Budget
              </Text>
              <Text
                style={[
                  styles.placeholderText,
                  { color: colors.textSecondary },
                ]}
              >
                Budget setting form will be implemented here
              </Text>
            </View>
          </View>
        );

      case "loan":
        return (
          <LoanCreationModal
            visible={selectedAction === "loan"}
            onClose={handleCloseModal}
            onCreateLoan={handleCreateLoan}
            headerStyle="clean"
            enableProgress={true}
            enableAdvancedOptions={true}
            // Don't pass recipients prop - let it fetch from DB automatically
          />
        );

      case "contact":
        return (
          <View style={styles.modalContent}>
            <View style={styles.enhancedModalHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackToQuickActions}
              >
                <Ionicons name="arrow-back" size={24} color="#10B981" />
              </TouchableOpacity>
              <View style={styles.headerTitleContainer}>
                <View style={styles.headerIconContainer}>
                  <Ionicons name="person-add" size={24} color="#F59E0B" />
                  <View style={styles.progressRing}>
                    <View
                      style={[
                        styles.progressRingFill,
                        {
                          transform: [{ rotate: `${formProgress * 3.6}deg` }],
                          opacity: formProgress > 0 ? 1 : 0,
                          borderTopColor: "#F59E0B",
                          borderRightColor:
                            formProgress > 25 ? "#F59E0B" : "transparent",
                          borderBottomColor:
                            formProgress > 50 ? "#F59E0B" : "transparent",
                          borderLeftColor:
                            formProgress > 75 ? "#F59E0B" : "transparent",
                        },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.headerTitleContainer}>
                  <Text
                    style={[styles.enhancedModalTitle, { color: colors.text }]}
                  >
                    Add Contact
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    Create individual or group contact
                  </Text>
                </View>
              </View>

              <View style={styles.headerSpacer}>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBarBackground,
                      { backgroundColor: colors.border },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${formProgress}%`,
                          backgroundColor:
                            formProgress === 100 ? "#F59E0B" : "#8B5CF6",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>{formProgress}%</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseModal}
              >
                <Ionicons name="close" size={20} color="#10B981" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="person" size={20} color="#10B981" />
                  <Text
                    style={[
                      styles.fullWidthSectionTitle,
                      { color: colors.text },
                    ]}
                  >
                    Loan Type
                  </Text>
                  <View style={styles.loanTypeCards}>
                    <TouchableOpacity
                      style={[
                        styles.loanTypeCard,
                        {
                          backgroundColor:
                            loanType === "take" ? "#F59E0B" : colors.card,
                          borderColor:
                            loanType === "take"
                              ? "#F59E0B"
                              : "rgba(245,158,11,0.3)", // Better inactive border
                          shadowColor: loanType === "take" ? "#F59E0B" : "#000",
                          shadowOpacity: loanType === "take" ? 0.3 : 0.15,
                        },
                      ]}
                      onPress={() => setLoanType("take")}
                    >
                      <View style={styles.slimLoanContent}>
                        <View style={styles.slimIconContainer}>
                          <Ionicons
                            name="arrow-down-circle-outline"
                            size={20} // Much smaller icon for slim design
                            color={loanType === "take" ? "#FFFFFF" : "#F59E0B"}
                          />
                        </View>
                        <View style={styles.slimTextContainer}>
                          <Text
                            style={[
                              styles.slimLoanTitle,
                              {
                                color:
                                  loanType === "take" ? "#FFFFFF" : colors.text,
                              },
                            ]}
                          >
                            Take Loan
                          </Text>
                          <Text
                            style={[
                              styles.slimLoanDescription,
                              {
                                color:
                                  loanType === "take"
                                    ? "rgba(255,255,255,0.7)"
                                    : colors.textSecondary,
                              },
                            ]}
                          >
                            Borrow money
                          </Text>
                        </View>
                        {loanType === "take" && (
                          <View style={styles.slimSelectedIndicator}>
                            <Ionicons
                              name="checkmark-circle"
                              size={16}
                              color="#FFFFFF"
                            />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.loanTypeCard,
                        {
                          backgroundColor:
                            loanType === "give" ? "#10B981" : colors.card,
                          borderColor:
                            loanType === "give"
                              ? "#10B981"
                              : "rgba(16,185,129,0.3)", // Better inactive border
                          shadowColor: loanType === "give" ? "#10B981" : "#000",
                          shadowOpacity: loanType === "give" ? 0.3 : 0.15,
                        },
                      ]}
                      onPress={() => setLoanType("give")}
                    >
                      <View style={styles.slimLoanContent}>
                        <View style={styles.slimIconContainer}>
                          <Ionicons
                            name="arrow-up-circle-outline"
                            size={20} // Much smaller icon for slim design
                            color={loanType === "give" ? "#FFFFFF" : "#10B981"}
                          />
                        </View>
                        <View style={styles.slimTextContainer}>
                          <Text
                            style={[
                              styles.slimLoanTitle,
                              {
                                color:
                                  loanType === "give" ? "#FFFFFF" : colors.text,
                              },
                            ]}
                          >
                            Give Loan
                          </Text>
                          <Text
                            style={[
                              styles.slimLoanDescription,
                              {
                                color:
                                  loanType === "give"
                                    ? "rgba(255,255,255,0.7)"
                                    : colors.textSecondary,
                              },
                            ]}
                          >
                            Lend money
                          </Text>
                        </View>
                        {loanType === "give" && (
                          <View style={styles.slimSelectedIndicator}>
                            <Ionicons
                              name="checkmark-circle"
                              size={16}
                              color="#FFFFFF"
                            />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Contact Selection */}
                {(loanType === "give" || loanType === "take") && (
                  <View style={styles.contactSection}>
                    <Text
                      style={[
                        styles.fullWidthSectionTitle,
                        { color: colors.text },
                      ]}
                    >
                      {loanType === "give" ? "Lend To" : "Borrow From"}
                    </Text>

                    {/* Contact Type Tabs */}
                    <View style={styles.tabsWithAddNew}>
                      <View style={styles.fullWidthTabs}>
                        <TouchableOpacity
                          style={[
                            styles.fullWidthTab,
                            {
                              backgroundColor:
                                selectedContact === "person"
                                  ? "#10B981"
                                  : "rgba(16,185,129,0.1)",
                              borderColor:
                                selectedContact === "person"
                                  ? "#10B981"
                                  : "rgba(16,185,129,0.3)",
                              borderBottomColor:
                                selectedContact === "person"
                                  ? "#10B981"
                                  : "transparent", // Active tab indicator
                            },
                          ]}
                          onPress={() => setSelectedContact("person")}
                        >
                          <Ionicons
                            name="person"
                            size={20}
                            color={
                              selectedContact === "person"
                                ? "#FFFFFF"
                                : "#10B981"
                            }
                          />
                          <Text
                            style={[
                              styles.fullWidthTabText,
                              {
                                color:
                                  selectedContact === "person"
                                    ? "#FFFFFF"
                                    : "#10B981",
                              },
                            ]}
                          >
                            Person
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.fullWidthTab,
                            {
                              backgroundColor:
                                selectedContact === "group"
                                  ? "#8B5CF6"
                                  : "rgba(139,92,246,0.1)",
                              borderColor:
                                selectedContact === "group"
                                  ? "#8B5CF6"
                                  : "rgba(139,92,246,0.3)",
                              borderBottomColor:
                                selectedContact === "group"
                                  ? "#8B5CF6"
                                  : "transparent", // Active tab indicator
                            },
                          ]}
                          onPress={() => setSelectedContact("group")}
                        >
                          <Ionicons
                            name="people"
                            size={20}
                            color={
                              selectedContact === "group"
                                ? "#FFFFFF"
                                : "#8B5CF6"
                            }
                          />
                          <Text
                            style={[
                              styles.fullWidthTabText,
                              {
                                color:
                                  selectedContact === "group"
                                    ? "#FFFFFF"
                                    : "#8B5CF6",
                              },
                            ]}
                          >
                            Group
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.fullWidthTab,
                            {
                              backgroundColor:
                                selectedContact === "bank"
                                  ? "#EF4444"
                                  : "rgba(239,68,68,0.1)",
                              borderColor:
                                selectedContact === "bank"
                                  ? "#EF4444"
                                  : "rgba(239,68,68,0.3)",
                              borderBottomColor:
                                selectedContact === "bank"
                                  ? "#EF4444"
                                  : "transparent", // Active tab indicator
                            },
                          ]}
                          onPress={() => setSelectedContact("bank")}
                        >
                          <Ionicons
                            name="business"
                            size={20}
                            color={
                              selectedContact === "bank" ? "#FFFFFF" : "#EF4444"
                            }
                          />
                          <Text
                            style={[
                              styles.fullWidthTabText,
                              {
                                color:
                                  selectedContact === "bank"
                                    ? "#FFFFFF"
                                    : "#EF4444",
                              },
                            ]}
                          >
                            Bank
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Add New Button */}
                      <TouchableOpacity style={styles.addNewButton}>
                        <Ionicons name="add-circle" size={16} color="#10B981" />
                        <Text style={[styles.addNewText, { color: "#10B981" }]}>
                          Add New
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Contact List */}
                    <View style={styles.contactList}>
                      {selectedContact === "person" && (
                        <>
                          <TouchableOpacity style={styles.contactItem}>
                            <View style={styles.contactAvatar}>
                              <Text style={styles.contactInitial}>RK</Text>
                            </View>
                            <View style={styles.contactInfo}>
                              <Text
                                style={[
                                  styles.contactName,
                                  { color: colors.text },
                                ]}
                              >
                                Rahul Kumar
                              </Text>
                              <Text
                                style={[
                                  styles.contactDetail,
                                  { color: colors.textSecondary },
                                ]}
                              >
                                +91 98765 43210
                              </Text>
                              <Text
                                style={[
                                  styles.contactBalance,
                                  { color: "#10B981" },
                                ]}
                              >
                                ₹2,500 owed to you
                              </Text>
                            </View>
                            <View style={styles.contactActions}>
                              <TouchableOpacity style={styles.actionButton}>
                                <Ionicons
                                  name="information-circle"
                                  size={14}
                                  color={colors.textSecondary}
                                />
                              </TouchableOpacity>
                              <TouchableOpacity style={styles.actionButton}>
                                <Ionicons
                                  name="time"
                                  size={14}
                                  color={colors.textSecondary}
                                />
                              </TouchableOpacity>
                            </View>
                          </TouchableOpacity>

                          <TouchableOpacity style={styles.contactItem}>
                            <View
                              style={[
                                styles.contactAvatar,
                                { backgroundColor: "#F59E0B" },
                              ]}
                            >
                              <Text style={styles.contactInitial}>PS</Text>
                            </View>
                            <View style={styles.contactInfo}>
                              <Text
                                style={[
                                  styles.contactName,
                                  { color: colors.text },
                                ]}
                              >
                                Priya Sharma
                              </Text>
                              <Text
                                style={[
                                  styles.contactDetail,
                                  { color: colors.textSecondary },
                                ]}
                              >
                                priya.sharma@email.com
                              </Text>
                              <Text
                                style={[
                                  styles.contactBalance,
                                  { color: "#EF4444" },
                                ]}
                              >
                                You owe ₹1,200
                              </Text>
                            </View>
                            <View style={styles.contactActions}>
                              <TouchableOpacity style={styles.actionButton}>
                                <Ionicons
                                  name="information-circle"
                                  size={14}
                                  color={colors.textSecondary}
                                />
                              </TouchableOpacity>
                              <TouchableOpacity style={styles.actionButton}>
                                <Ionicons
                                  name="time"
                                  size={14}
                                  color={colors.textSecondary}
                                />
                              </TouchableOpacity>
                            </View>
                          </TouchableOpacity>
                        </>
                      )}

                      {selectedContact === "group" && (
                        <>
                          <TouchableOpacity style={styles.contactItem}>
                            <View
                              style={[
                                styles.contactAvatar,
                                { backgroundColor: "#8B5CF6" },
                              ]}
                            >
                              <Ionicons
                                name="people"
                                size={20}
                                color="#FFFFFF"
                              />
                            </View>
                            <View style={styles.contactInfo}>
                              <Text
                                style={[
                                  styles.contactName,
                                  { color: colors.text },
                                ]}
                              >
                                Family Group
                              </Text>
                              <Text
                                style={[
                                  styles.contactDetail,
                                  { color: colors.textSecondary },
                                ]}
                              >
                                4 members
                              </Text>
                            </View>
                            <Ionicons
                              name="chevron-forward"
                              size={20}
                              color={colors.textSecondary}
                            />
                          </TouchableOpacity>

                          <TouchableOpacity style={styles.contactItem}>
                            <View
                              style={[
                                styles.contactAvatar,
                                { backgroundColor: "#10B981" },
                              ]}
                            >
                              <Ionicons
                                name="briefcase"
                                size={20}
                                color="#FFFFFF"
                              />
                            </View>
                            <View style={styles.contactInfo}>
                              <Text
                                style={[
                                  styles.contactName,
                                  { color: colors.text },
                                ]}
                              >
                                Office Team
                              </Text>
                              <Text
                                style={[
                                  styles.contactDetail,
                                  { color: colors.textSecondary },
                                ]}
                              >
                                8 members
                              </Text>
                            </View>
                            <Ionicons
                              name="chevron-forward"
                              size={20}
                              color={colors.textSecondary}
                            />
                          </TouchableOpacity>
                        </>
                      )}

                      {selectedContact === "bank" && (
                        <>
                          <TouchableOpacity style={styles.contactItem}>
                            <View
                              style={[
                                styles.contactAvatar,
                                { backgroundColor: "#EF4444" },
                              ]}
                            >
                              <Text style={styles.contactInitial}>SBI</Text>
                            </View>
                            <View style={styles.contactInfo}>
                              <Text
                                style={[
                                  styles.contactName,
                                  { color: colors.text },
                                ]}
                              >
                                State Bank of India
                              </Text>
                              <Text
                                style={[
                                  styles.contactDetail,
                                  { color: colors.textSecondary },
                                ]}
                              >
                                Account: ****1234
                              </Text>
                            </View>
                            <Ionicons
                              name="chevron-forward"
                              size={20}
                              color={colors.textSecondary}
                            />
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                )}

                {/* Amount Section */}
                {(loanType === "give" || loanType === "take") &&
                  selectedContact && (
                    <View style={styles.amountSection}>
                      <Text
                        style={[
                          styles.fullWidthSectionTitle,
                          { color: colors.text },
                        ]}
                      >
                        Amount
                      </Text>

                      <View style={styles.amountInputContainer}>
                        <View style={styles.currencySection}>
                          <Text
                            style={[styles.largeCurrency, { color: "#10B981" }]}
                          >
                            ₹
                          </Text>
                        </View>
                        <TextInput
                          style={[styles.amountInput, { color: colors.text }]}
                          placeholder="0"
                          placeholderTextColor={colors.textSecondary}
                          keyboardType="numeric"
                          value={amount}
                          onChangeText={setAmount}
                          onFocus={() => setFocusedField("amount")}
                          onBlur={() => setFocusedField(null)}
                          autoFocus={false} // Will be controlled by touch
                          returnKeyType="done"
                        />
                      </View>

                      {/* Quick Amount Grid */}
                      <View style={styles.quickAmountGrid}>
                        {[
                          { value: "1000", label: "₹1K" },
                          { value: "5000", label: "₹5K" },
                          { value: "10000", label: "₹10K" },
                          { value: "25000", label: "₹25K" },
                          { value: "50000", label: "₹50K" },
                          { value: "100000", label: "₹1L" },
                        ].map((quickAmount) => (
                          <TouchableOpacity
                            key={quickAmount.value}
                            style={[
                              styles.quickAmountGridItem,
                              {
                                backgroundColor:
                                  amount === quickAmount.value
                                    ? "#10B981"
                                    : colors.card,
                                borderColor:
                                  amount === quickAmount.value
                                    ? "#10B981"
                                    : colors.border,
                              },
                            ]}
                            onPress={() => setAmount(quickAmount.value)}
                          >
                            <Text
                              style={[
                                styles.quickAmountGridText,
                                {
                                  color:
                                    amount === quickAmount.value
                                      ? "#FFFFFF"
                                      : colors.text,
                                },
                              ]}
                            >
                              {quickAmount.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                {/* Loan Details Section */}
                {amount && (
                  <View style={styles.loanDetailsSection}>
                    <Text
                      style={[
                        styles.fullWidthSectionTitle,
                        { color: colors.text },
                      ]}
                    >
                      Loan Details
                    </Text>

                    {/* Purpose */}
                    <View style={styles.detailInputGroup}>
                      <Text style={[styles.inputLabel, { color: colors.text }]}>
                        Purpose
                      </Text>
                      <TextInput
                        style={[
                          styles.detailInput,
                          {
                            backgroundColor: colors.card,
                            borderColor:
                              focusedField === "description"
                                ? "#10B981"
                                : colors.border,
                            color: colors.text,
                          },
                        ]}
                        placeholder={
                          loanType === "give"
                            ? "What is this loan for?"
                            : "Why do you need this loan?"
                        }
                        placeholderTextColor={colors.textSecondary}
                        value={description}
                        onChangeText={setDescription}
                        onFocus={() => setFocusedField("description")}
                        onBlur={() => setFocusedField(null)}
                        multiline
                        numberOfLines={3}
                      />
                    </View>

                    {/* Due Date & Interest Rate Row */}
                    <View style={styles.detailRow}>
                      <View style={styles.detailHalfInput}>
                        <Text
                          style={[styles.inputLabel, { color: colors.text }]}
                        >
                          Due Date
                        </Text>
                        <TextInput
                          style={[
                            styles.detailInput,
                            {
                              backgroundColor: colors.card,
                              borderColor: colors.border,
                              color: colors.text,
                            },
                          ]}
                          placeholder="DD/MM/YYYY"
                          placeholderTextColor={colors.textSecondary}
                          value={dueDate}
                          onChangeText={setDueDate}
                        />
                      </View>

                      <View style={styles.detailHalfInput}>
                        <Text
                          style={[styles.inputLabel, { color: colors.text }]}
                        >
                          Interest Rate (%)
                        </Text>
                        <TextInput
                          style={[
                            styles.detailInput,
                            {
                              backgroundColor: colors.card,
                              borderColor: colors.border,
                              color: colors.text,
                            },
                          ]}
                          placeholder="0.0"
                          placeholderTextColor={colors.textSecondary}
                          keyboardType="numeric"
                          value={interestRate}
                          onChangeText={setInterestRate}
                        />
                      </View>
                    </View>

                    {/* Smart Suggestions */}
                    {amount && parseInt(amount) > 0 && (
                      <View style={styles.smartSuggestionsSection}>
                        <Text
                          style={[
                            styles.suggestionsTitle,
                            { color: colors.textSecondary },
                          ]}
                        >
                          💡 Suggested purposes for ₹{amount}:
                        </Text>
                        <View style={styles.suggestionTags}>
                          {getSuggestions(parseInt(amount)).map(
                            (suggestion, index) => (
                              <TouchableOpacity
                                key={index}
                                style={[
                                  styles.suggestionTag,
                                  {
                                    backgroundColor:
                                      description === suggestion
                                        ? "#10B981"
                                        : "rgba(16,185,129,0.1)",
                                    borderColor:
                                      description === suggestion
                                        ? "#10B981"
                                        : "rgba(16,185,129,0.3)",
                                  },
                                ]}
                                onPress={() => setDescription(suggestion)}
                              >
                                <Text
                                  style={[
                                    styles.suggestionTagText,
                                    {
                                      color:
                                        description === suggestion
                                          ? "#FFFFFF"
                                          : "#10B981",
                                    },
                                  ]}
                                >
                                  {suggestion}
                                </Text>
                              </TouchableOpacity>
                            )
                          )}
                        </View>
                      </View>
                    )}

                    {/* Terms Section */}
                    <View style={styles.termsSection}>
                      <View style={styles.sectionHeaderWithIcon}>
                        <Ionicons
                          name="document-text"
                          size={16}
                          color="#10B981"
                        />
                        <Text
                          style={[
                            styles.fullWidthSectionTitle,
                            { color: colors.text },
                          ]}
                        >
                          Loan Terms
                        </Text>
                      </View>

                      {/* Repayment Schedule */}
                      <View style={styles.detailRow}>
                        <View style={styles.detailHalfInput}>
                          <Text
                            style={[styles.inputLabel, { color: colors.text }]}
                          >
                            Repayment Frequency
                          </Text>
                          <View style={styles.pickerContainer}>
                            <ScrollView
                              horizontal
                              showsHorizontalScrollIndicator={false}
                            >
                              {["weekly", "monthly", "quarterly", "yearly"].map(
                                (freq) => (
                                  <TouchableOpacity
                                    key={freq}
                                    style={[
                                      styles.frequencyChip,
                                      {
                                        backgroundColor:
                                          repaymentFrequency === freq
                                            ? "#10B981"
                                            : colors.card,
                                        borderColor:
                                          repaymentFrequency === freq
                                            ? "#10B981"
                                            : colors.border,
                                      },
                                    ]}
                                    onPress={() => setRepaymentFrequency(freq)}
                                  >
                                    <Text
                                      style={[
                                        styles.frequencyChipText,
                                        {
                                          color:
                                            repaymentFrequency === freq
                                              ? "#FFFFFF"
                                              : colors.text,
                                        },
                                      ]}
                                    >
                                      {freq.charAt(0).toUpperCase() +
                                        freq.slice(1)}
                                    </Text>
                                  </TouchableOpacity>
                                )
                              )}
                            </ScrollView>
                          </View>
                        </View>

                        <View style={styles.detailHalfInput}>
                          <Text
                            style={[styles.inputLabel, { color: colors.text }]}
                          >
                            Installments
                          </Text>
                          <TextInput
                            style={[
                              styles.detailInput,
                              {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                                color: colors.text,
                              },
                            ]}
                            placeholder="12"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="numeric"
                            value={numberOfInstallments}
                            onChangeText={setNumberOfInstallments}
                          />
                        </View>
                      </View>

                      {/* Start Date & Grace Period */}
                      <View style={styles.detailRow}>
                        <View style={styles.detailHalfInput}>
                          <Text
                            style={[styles.inputLabel, { color: colors.text }]}
                          >
                            Start Date
                          </Text>
                          <TextInput
                            style={[
                              styles.detailInput,
                              {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                                color: colors.text,
                              },
                            ]}
                            placeholder="DD/MM/YYYY"
                            placeholderTextColor={colors.textSecondary}
                            value={loanStartDate}
                            onChangeText={setLoanStartDate}
                          />
                        </View>

                        <View style={styles.detailHalfInput}>
                          <Text
                            style={[styles.inputLabel, { color: colors.text }]}
                          >
                            Grace Period (days)
                          </Text>
                          <TextInput
                            style={[
                              styles.detailInput,
                              {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                                color: colors.text,
                              },
                            ]}
                            placeholder="30"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="numeric"
                            value={gracePeriod}
                            onChangeText={setGracePeriod}
                          />
                        </View>
                      </View>
                    </View>

                    {/* Payment Method Section */}
                    <View style={styles.paymentSection}>
                      <View style={styles.sectionHeaderWithIcon}>
                        <Ionicons name="card" size={16} color="#10B981" />
                        <Text
                          style={[
                            styles.fullWidthSectionTitle,
                            { color: colors.text },
                          ]}
                        >
                          Payment Method
                        </Text>
                      </View>
                      <View style={styles.paymentMethodGrid}>
                        {[
                          { id: "cash", label: "Cash", icon: "cash" },
                          {
                            id: "bank",
                            label: "Bank Transfer",
                            icon: "business",
                          },
                          { id: "upi", label: "UPI", icon: "phone-portrait" },
                          { id: "card", label: "Card", icon: "card" },
                        ].map((method) => (
                          <TouchableOpacity
                            key={method.id}
                            style={[
                              styles.paymentMethodItem,
                              {
                                backgroundColor:
                                  paymentMethod === method.id
                                    ? "#10B981"
                                    : colors.card,
                                borderColor:
                                  paymentMethod === method.id
                                    ? "#10B981"
                                    : colors.border,
                              },
                            ]}
                            onPress={() => setPaymentMethod(method.id)}
                          >
                            <Ionicons
                              name={method.icon as any}
                              size={14}
                              color={
                                paymentMethod === method.id
                                  ? "#FFFFFF"
                                  : "#10B981"
                              }
                            />
                            <Text
                              style={[
                                styles.paymentMethodText,
                                {
                                  color:
                                    paymentMethod === method.id
                                      ? "#FFFFFF"
                                      : colors.text,
                                },
                              ]}
                            >
                              {method.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Group Members Section */}
                    {selectedContact === "group" && (
                      <View style={styles.groupMembersSection}>
                        <View style={styles.sectionHeaderWithIcon}>
                          <Ionicons name="people" size={16} color="#8B5CF6" />
                          <Text
                            style={[
                              styles.fullWidthSectionTitle,
                              { color: colors.text },
                            ]}
                          >
                            Member Contributions
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.inputLabel,
                            { color: colors.textSecondary, marginBottom: 12 },
                          ]}
                        >
                          Specify how much each member owes or contributes
                        </Text>

                        {/* Sample Group Members */}
                        <View style={styles.membersList}>
                          {[
                            { name: "John Doe", defaultShare: "25" },
                            { name: "Jane Smith", defaultShare: "25" },
                            { name: "Mike Johnson", defaultShare: "25" },
                            { name: "Sarah Wilson", defaultShare: "25" },
                          ].map((member, index) => (
                            <View key={index} style={styles.memberItem}>
                              <View style={styles.memberInfo}>
                                <View
                                  style={[
                                    styles.memberAvatar,
                                    { backgroundColor: "#8B5CF6" },
                                  ]}
                                >
                                  <Text style={styles.memberInitial}>
                                    {member.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </Text>
                                </View>
                                <Text
                                  style={[
                                    styles.memberName,
                                    { color: colors.text },
                                  ]}
                                >
                                  {member.name}
                                </Text>
                              </View>
                              <View style={styles.memberShareContainer}>
                                <TextInput
                                  style={[
                                    styles.memberShareInput,
                                    {
                                      backgroundColor: colors.card,
                                      borderColor: colors.border,
                                      color: colors.text,
                                    },
                                  ]}
                                  placeholder="0"
                                  placeholderTextColor={colors.textSecondary}
                                  keyboardType="numeric"
                                  defaultValue={member.defaultShare}
                                />
                                <Text
                                  style={[
                                    styles.percentageText,
                                    { color: colors.textSecondary },
                                  ]}
                                >
                                  %
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>

                        <TouchableOpacity style={styles.addMemberButton}>
                          <Ionicons
                            name="add-circle"
                            size={20}
                            color="#8B5CF6"
                          />
                          <Text
                            style={[styles.addMemberText, { color: "#8B5CF6" }]}
                          >
                            Add Member
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Contact Information Section */}
                    {selectedContact === "person" && (
                      <View style={styles.contactInfoSection}>
                        <View style={styles.sectionHeaderWithIcon}>
                          <Ionicons name="call" size={16} color="#10B981" />
                          <Text
                            style={[
                              styles.fullWidthSectionTitle,
                              { color: colors.text },
                            ]}
                          >
                            Contact Information
                          </Text>
                        </View>
                        <TextInput
                          style={[
                            styles.detailInput,
                            {
                              backgroundColor: colors.card,
                              borderColor: colors.border,
                              color: colors.text,
                            },
                          ]}
                          placeholder="Phone number or email address"
                          placeholderTextColor={colors.textSecondary}
                          value={contactInfo}
                          onChangeText={setContactInfo}
                        />
                      </View>
                    )}

                    {/* Bank Details Section */}
                    {selectedContact === "bank" && (
                      <View style={styles.bankDetailsSection}>
                        <View style={styles.sectionHeaderWithIcon}>
                          <Ionicons name="business" size={16} color="#10B981" />
                          <Text
                            style={[
                              styles.fullWidthSectionTitle,
                              { color: colors.text },
                            ]}
                          >
                            Bank Details
                          </Text>
                        </View>
                        <View style={styles.detailInputGroup}>
                          <Text
                            style={[styles.inputLabel, { color: colors.text }]}
                          >
                            Branch Name
                          </Text>
                          <TextInput
                            style={[
                              styles.detailInput,
                              {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                                color: colors.text,
                              },
                            ]}
                            placeholder="Main Branch, City"
                            placeholderTextColor={colors.textSecondary}
                            value={bankBranch}
                            onChangeText={setBankBranch}
                          />
                        </View>
                        <View style={styles.detailRow}>
                          <View style={styles.detailHalfInput}>
                            <Text
                              style={[
                                styles.inputLabel,
                                { color: colors.text },
                              ]}
                            >
                              Account Number
                            </Text>
                            <TextInput
                              style={[
                                styles.detailInput,
                                {
                                  backgroundColor: colors.card,
                                  borderColor: colors.border,
                                  color: colors.text,
                                },
                              ]}
                              placeholder="****1234"
                              placeholderTextColor={colors.textSecondary}
                              value={accountNumber}
                              onChangeText={setAccountNumber}
                            />
                          </View>
                          <View style={styles.detailHalfInput}>
                            <Text
                              style={[
                                styles.inputLabel,
                                { color: colors.text },
                              ]}
                            >
                              Loan Reference
                            </Text>
                            <TextInput
                              style={[
                                styles.detailInput,
                                {
                                  backgroundColor: colors.card,
                                  borderColor: colors.border,
                                  color: colors.text,
                                },
                              ]}
                              placeholder="LN123456"
                              placeholderTextColor={colors.textSecondary}
                              value={loanReference}
                              onChangeText={setLoanReference}
                            />
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Reminders Section */}
                    <View style={styles.remindersSection}>
                      <View style={styles.sectionHeaderWithIcon}>
                        <Ionicons
                          name="notifications"
                          size={16}
                          color="#10B981"
                        />
                        <Text
                          style={[
                            styles.fullWidthSectionTitle,
                            { color: colors.text },
                          ]}
                        >
                          Payment Reminders
                        </Text>
                      </View>
                      <View style={styles.reminderToggleContainer}>
                        <TouchableOpacity
                          style={styles.reminderToggle}
                          onPress={() => setReminderEnabled(!reminderEnabled)}
                        >
                          <View
                            style={[
                              styles.toggleSwitch,
                              {
                                backgroundColor: reminderEnabled
                                  ? "#10B981"
                                  : colors.border,
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.toggleThumb,
                                {
                                  transform: [
                                    {
                                      translateX: reminderEnabled ? 20 : 2,
                                    },
                                  ],
                                },
                              ]}
                            />
                          </View>
                          <Text
                            style={[
                              styles.reminderToggleText,
                              { color: colors.text },
                            ]}
                          >
                            Enable payment reminders
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {reminderEnabled && (
                        <View style={styles.reminderDaysContainer}>
                          <Text
                            style={[styles.inputLabel, { color: colors.text }]}
                          >
                            Remind me (days before due date)
                          </Text>
                          <View style={styles.reminderDaysGrid}>
                            {["1", "3", "7", "14"].map((days) => (
                              <TouchableOpacity
                                key={days}
                                style={[
                                  styles.reminderDayChip,
                                  {
                                    backgroundColor:
                                      reminderDays === days
                                        ? "#10B981"
                                        : colors.card,
                                    borderColor:
                                      reminderDays === days
                                        ? "#10B981"
                                        : colors.border,
                                  },
                                ]}
                                onPress={() => setReminderDays(days)}
                              >
                                <Text
                                  style={[
                                    styles.reminderDayText,
                                    {
                                      color:
                                        reminderDays === days
                                          ? "#FFFFFF"
                                          : colors.text,
                                    },
                                  ]}
                                >
                                  {days} day{days !== "1" ? "s" : ""}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>

                    {/* Notes Section */}
                    <View style={styles.notesSection}>
                      <View style={styles.sectionHeaderWithIcon}>
                        <Ionicons name="create" size={16} color="#10B981" />
                        <Text
                          style={[
                            styles.fullWidthSectionTitle,
                            { color: colors.text },
                          ]}
                        >
                          Additional Notes
                        </Text>
                      </View>
                      <TextInput
                        style={[
                          styles.detailInput,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                            color: colors.text,
                            minHeight: 80,
                          },
                        ]}
                        placeholder="Add any additional notes or terms..."
                        placeholderTextColor={colors.textSecondary}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={4}
                      />
                    </View>
                  </View>
                )}

                {/* Action Buttons */}
                {amount && description && (
                  <View style={styles.fullWidthActions}>
                    <TouchableOpacity
                      style={[
                        styles.fullWidthCancelButton,
                        { borderColor: colors.border },
                      ]}
                      onPress={handleBackToQuickActions}
                    >
                      <Text
                        style={[
                          styles.fullWidthCancelText,
                          { color: colors.text },
                        ]}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.fullWidthSubmitButton,
                        {
                          backgroundColor:
                            loanType === "give" ? "#10B981" : "#F59E0B",
                          opacity:
                            !amount || !selectedContact || !description
                              ? 0.6
                              : 1,
                        },
                      ]}
                      disabled={!amount || !selectedContact || !description}
                      onPress={() => {
                        const action =
                          loanType === "give" ? "Loan given" : "Loan taken";
                        Alert.alert("Success", `${action} successfully!`);
                        setAmount("");
                        setDescription("");
                        setDueDate("");
                        setInterestRate("0");
                        setSelectedContact("");
                        setRecipientType("person");
                        handleCloseModal();
                      }}
                    >
                      <Ionicons
                        name={
                          loanType === "give"
                            ? "arrow-up-circle"
                            : "arrow-down-circle"
                        }
                        size={24}
                        color="#FFFFFF"
                      />
                      <Text style={styles.fullWidthSubmitText}>
                        {loanType === "give" ? "Give Loan" : "Take Loan"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Bottom Spacing */}
                <View style={{ height: 40 }} />
              </View>
            </ScrollView>
          </View>
        );

      case "contact":
        return (
          <View style={styles.modalContent}>
            <View style={styles.enhancedModalHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackToQuickActions}
              >
                <Ionicons name="arrow-back" size={24} color="#10B981" />
              </TouchableOpacity>
              <View style={styles.headerTitleContainer}>
                <View style={styles.headerIconContainer}>
                  <Ionicons name="person-add" size={24} color="#F59E0B" />
                  <View style={styles.progressRing}>
                    <View
                      style={[
                        styles.progressRingFill,
                        {
                          transform: [{ rotate: `${formProgress * 3.6}deg` }],
                          opacity: formProgress > 0 ? 1 : 0,
                          borderTopColor: "#F59E0B",
                          borderRightColor: "#F59E0B",
                        },
                      ]}
                    />
                  </View>
                </View>
                <Text
                  style={[styles.enhancedModalTitle, { color: colors.text }]}
                >
                  Add Contact
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Create new financial relationships
                </Text>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground} />
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${formProgress}%`,
                        backgroundColor:
                          formProgress === 100 ? "#F59E0B" : "#8B5CF6",
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[styles.progressText, { color: colors.textSecondary }]}
                >
                  {Math.round(formProgress)}% Complete
                </Text>
              </View>
              <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.modalScrollView}>
              <View style={styles.formContainer}>
                {/* Contact Type Selection */}
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="person-circle" size={20} color="#F59E0B" />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Contact Type
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.sectionDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Choose between individual or group contact
                  </Text>
                </View>
                <View style={styles.recipientTypeTabs}>
                  <TouchableOpacity
                    style={[
                      styles.recipientTypeTab,
                      recipientType === "person" && styles.activeRecipientTab,
                    ]}
                    onPress={() => setRecipientType("person")}
                  >
                    <Ionicons
                      name="person"
                      size={18}
                      color={
                        recipientType === "person"
                          ? "#10B981"
                          : colors.textSecondary
                      }
                      style={styles.recipientTabIcon}
                    />
                    <Text
                      style={[
                        styles.recipientTabText,
                        {
                          color:
                            recipientType === "person"
                              ? "#10B981"
                              : colors.textSecondary,
                        },
                      ]}
                    >
                      Individual
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.recipientTypeTab,
                      recipientType === "group" && styles.activeRecipientTab,
                    ]}
                    onPress={() => setRecipientType("group")}
                  >
                    <Ionicons
                      name="people"
                      size={18}
                      color={
                        recipientType === "group"
                          ? "#10B981"
                          : colors.textSecondary
                      }
                      style={styles.recipientTabIcon}
                    />
                    <Text
                      style={[
                        styles.recipientTabText,
                        {
                          color:
                            recipientType === "group"
                              ? "#10B981"
                              : colors.textSecondary,
                        },
                      ]}
                    >
                      Group
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Name Input */}
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {recipientType === "group" ? "Group Name" : "Contact Name"}
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      recipientType === "group"
                        ? "people-outline"
                        : "person-outline"
                    }
                    size={20}
                    color={colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder={
                      recipientType === "group"
                        ? "Enter group name"
                        : "Enter contact name"
                    }
                    placeholderTextColor={colors.textSecondary}
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>

                {/* Email Input (for individuals) */}
                {recipientType === "person" && (
                  <>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Email (Optional)
                    </Text>
                    <View
                      style={[
                        styles.inputContainer,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color={colors.textSecondary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Enter email address"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="email-address"
                      />
                    </View>

                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Phone (Optional)
                    </Text>
                    <View
                      style={[
                        styles.inputContainer,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name="call-outline"
                        size={20}
                        color={colors.textSecondary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Enter phone number"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="phone-pad"
                      />
                    </View>
                  </>
                )}

                {/* Description Input (for groups) */}
                {recipientType === "group" && (
                  <>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Description (Optional)
                    </Text>
                    <View
                      style={[
                        styles.inputContainer,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name="information-circle-outline"
                        size={20}
                        color={colors.textSecondary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Enter group description"
                        placeholderTextColor={colors.textSecondary}
                      />
                    </View>

                    <Text
                      style={[
                        styles.inputLabel,
                        { color: colors.text, marginTop: 20 },
                      ]}
                    >
                      Members will be added in the next step
                    </Text>
                  </>
                )}

                {/* Action Buttons */}
                <View style={styles.enhancedModalActions}>
                  <TouchableOpacity
                    style={[
                      styles.enhancedCancelButton,
                      { borderColor: colors.border },
                    ]}
                    onPress={handleBackToQuickActions}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={20}
                      color={colors.text}
                    />
                    <Text
                      style={[
                        styles.enhancedCancelButtonText,
                        { color: colors.text },
                      ]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.enhancedSubmitButton,
                      {
                        backgroundColor:
                          recipientType === "group" ? "#8B5CF6" : "#F59E0B",
                        opacity: !description ? 0.6 : 1,
                      },
                    ]}
                    disabled={!description}
                    onPress={() => {
                      const contactType =
                        recipientType === "group" ? "Group" : "Contact";
                      Alert.alert(
                        "Success",
                        `${contactType} added successfully!`
                      );
                      setDescription("");
                      handleCloseModal();
                    }}
                  >
                    <Ionicons
                      name={
                        recipientType === "group"
                          ? "people-circle"
                          : "person-add"
                      }
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.enhancedSubmitButtonText}>
                      {recipientType === "group"
                        ? "Create Group"
                        : "Add Contact"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Main Quick Add Button - Hide in edit mode */}
      {!isEditMode && (
        <>
          {/* New plus FAB just above the grid FAB (same size and style) */}
          <TouchableOpacity
            style={[
              styles.quickAddButtonSecondary,
              { backgroundColor: "transparent" },
              style,
            ]}
            onPress={() => {
              // Direct to Add Transaction screen
              setSelectedAction("transaction");
              setIsModalVisible(true);
            }}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Add transaction"
            accessibilityHint="Opens the add transaction screen directly"
          >
            <BlurView
              tint="dark"
              intensity={20}
              style={StyleSheet.absoluteFillObject}
            />
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>

          {/* Existing grid FAB */}
          <TouchableOpacity
            style={[
              styles.quickAddButton,
              { backgroundColor: "transparent" },
              style,
            ]}
            onPress={() => setIsModalVisible(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Open quick actions"
            accessibilityHint="Opens the quick actions menu"
          >
            <BlurView
              tint="dark"
              intensity={10}
              style={StyleSheet.absoluteFillObject}
            />
            <Ionicons name="grid" size={20} color="white" />
          </TouchableOpacity>
        </>
      )}

      {/* Quick Actions Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          {/* Modal Header - Hide when specific action modals are open */}
          {selectedAction !== "transaction" &&
            selectedAction !== "loan" &&
            selectedAction !== "contact" && (
              <View style={styles.modalHeaderContainer}>
                <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>
                  Quick Actions
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseModal}
                >
                  <Ionicons name="close" size={20} color="#10B981" />
                </TouchableOpacity>
              </View>
            )}

          {/* Quick Actions Grid */}
          {!selectedAction && (
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.quickActionsGrid}>
                {quickActions.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={[
                      styles.actionCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={action.action}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.actionIconContainer,
                        { backgroundColor: `${action.color}20` },
                      ]}
                    >
                      <Ionicons
                        name={action.icon as any}
                        size={32}
                        color={action.color}
                      />
                    </View>
                    <Text style={[styles.actionTitle, { color: colors.text }]}>
                      {action.title}
                    </Text>
                    <Text
                      style={[
                        styles.actionSubtitle,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {action.subtitle}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

          {/* Action-Specific Content */}
          {selectedAction && renderModalContent()}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  quickAddButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#D4AF37", // sleek golden border
    overflow: "hidden", // Important for BlurView to be contained
  },
  quickAddButtonSecondary: {
    position: "absolute",
    bottom: 90, // placed above the grid FAB
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#D4AF37", // sleek golden border
    overflow: "hidden", // Important for BlurView to be contained
  },
  modalContainer: {
    flex: 1,
    paddingTop: 30, // Reduced from 40
  },
  modalHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10, // Reduced from 12
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
    borderRadius: 18,
    backgroundColor: "rgba(16,185,129,0.1)",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
  },
  modalScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingTop: 12,
    gap: 10,
  },
  actionCard: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIconContainer: {
    width: 52, // Reduced from 56
    height: 52, // Reduced from 56
    borderRadius: 26, // Reduced from 28
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10, // Reduced from 12
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 5, // Reduced from 6
    textAlign: "center",
  },
  actionSubtitle: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 14,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10, // Reduced from 12
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  placeholderContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24, // Reduced from 32
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10, // Reduced from 12
    marginBottom: 5, // Reduced from 6
  },
  placeholderText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },

  // Form styles for loan and contact actions - matching Financial Relationships
  recipientTypeTabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    padding: 4,
  },
  recipientTypeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeRecipientTab: {
    backgroundColor: "rgba(16,185,129,0.15)",
  },
  recipientTabIcon: {
    marginRight: 6,
  },
  recipientTabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  pickerContainer: {
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  contactPicker: {
    flex: 1,
  },
  contactChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    flex: 2,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  contactChipText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // Enhanced Modal Header Styles
  enhancedModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(16,185,129,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  enhancedModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.8,
  },
  headerSpacer: {
    width: 44,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(16,185,129,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Enhanced Section Styles
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginLeft: 28,
    opacity: 0.8,
  },

  // Enhanced Input Styles
  enhancedInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    minHeight: 60,
  },
  currencyContainer: {
    backgroundColor: "rgba(16,185,129,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "700",
  },
  enhancedInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    padding: 0,
  },
  inputValidIcon: {
    marginLeft: 8,
  },

  // Quick Amount Styles
  quickAmountContainer: {
    marginBottom: 24,
  },
  quickAmountLabel: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: "500",
  },
  quickAmountButtons: {
    flexDirection: "row",
    gap: 8,
  },
  quickAmountButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Enhanced Action Button Styles
  enhancedModalActions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 32,
    marginBottom: 20,
  },
  enhancedCancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  enhancedCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  enhancedSubmitButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  enhancedSubmitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  // Progress Ring and Bar Styles
  progressRing: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 26,
  },
  progressRingFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 26,
    borderWidth: 3,
    borderTopColor: "#10B981",
    borderRightColor: "#10B981",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
  },
  progressBarContainer: {
    width: "80%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    marginTop: 12,
    overflow: "hidden",
  },
  progressBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
  },

  // Floating Label Styles
  floatingLabelContainer: {
    position: "relative",
    marginBottom: 20,
  },
  floatingLabel: {
    position: "absolute",
    top: -8,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: "600",
    zIndex: 1,
  },

  // Enhanced Quick Amount Button Styles
  popularAmountButton: {
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  popularBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#F59E0B",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  popularBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },

  // Smart Suggestions Styles
  smartSuggestionsContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "rgba(16,185,129,0.05)",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  smartSuggestionsLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  suggestionChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  suggestionChipText: {
    fontSize: 13,
    fontWeight: "500",
  },

  // Full Width Modal Styles - Enhanced Visual Hierarchy
  fullScreenModalContent: {
    flex: 1,
    backgroundColor: "#0B1426",
    borderTopLeftRadius: 0, // Remove border radius for full screen
    borderTopRightRadius: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },

  // Clean Header Styles (sleeker and thinner)
  cleanHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10, // Minimal safe area padding for full screen
    paddingBottom: 10, // Reduced bottom padding
    paddingHorizontal: 20,
    backgroundColor: "#1F2937",
    borderBottomWidth: 0.5, // Thinner border
    borderBottomColor: "rgba(255,255,255,0.08)", // More subtle border
  },
  cleanBackButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  cleanTitle: {
    fontSize: 18, // Match Add New Transaction size
    fontWeight: "600", // Match Add New Transaction weight
    textAlign: "center",
    flex: 1,
    letterSpacing: -0.2, // Tighter letter spacing
  },
  cleanCloseButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerMainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modernBackButton: {
    width: 44, // Increased for better touch target
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    // Add subtle press feedback
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  primaryTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  modernCloseButton: {
    width: 44, // Increased for better touch target
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    // Add subtle press feedback
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  compactProgressIndicator: {
    backgroundColor: "rgba(16,185,129,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
  },
  fullWidthHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16, // Consistent with app spacing
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: "#1F2937", // Dark card background
    borderBottomWidth: 1,
    borderBottomColor: "#374151", // App border color
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(16,185,129,0.15)", // App primary color with opacity
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
  },
  headerCenter: {
    flex: 1,
    marginLeft: 16,
  },
  fullWidthTitle: {
    fontSize: 18, // Reduced from 20px for better proportion
    fontWeight: "600", // Reduced from 700 for less visual weight
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  fullWidthSubtitle: {
    fontSize: 14, // App standard body size
    fontWeight: "500",
    color: "#9CA3AF", // App secondary text color
    lineHeight: 20,
  },
  progressIndicator: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(16,185,129,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
  },
  progressStep: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  fullWidthScrollView: {
    flex: 1,
    backgroundColor: "#0B1426", // App background
  },
  fullWidthContainer: {
    paddingHorizontal: 20, // Increased for better mobile spacing
    paddingTop: 8, // Small top padding for breathing room
    paddingBottom: 32, // Increased bottom padding for safe area
  },

  // Loan Type Section - Tighter Spacing
  loanTypeSection: {
    marginTop: 8, // Further reduced for tighter layout
    marginBottom: 12, // Further reduced for tighter layout
  },
  fullWidthSectionTitle: {
    fontSize: 16, // Smaller heading for compact design
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8, // Reduced spacing
    letterSpacing: -0.1,
  },
  loanTypeCards: {
    flexDirection: "row",
    gap: 12, // App spacing
  },
  loanTypeCard: {
    flex: 1,
    paddingVertical: 12, // Much thinner vertical padding
    paddingHorizontal: 16, // Maintain horizontal padding for text
    borderRadius: 8, // Smaller radius for slimmer look
    borderWidth: 1, // Very thin border
    alignItems: "center",
    minHeight: 60, // Much slimmer height
    justifyContent: "center",
    backgroundColor: "#1F2937",
    elevation: 1, // Minimal elevation for slim appearance
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Ultra-slim inactive state
    borderColor: "rgba(255,255,255,0.05)", // Very subtle border
  },
  loanTypeIconContainer: {
    marginBottom: 6, // Sleeker spacing
    position: "relative", // For positioning the selected indicator
    padding: 6, // Reduced padding for sleeker look
    borderRadius: 50, // Circular background for icon
    backgroundColor: "rgba(255,255,255,0.03)", // More subtle background
  },
  selectedIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#10B981", // Use app's primary green
    borderRadius: 10,
    padding: 2,
    borderWidth: 1.5,
    borderColor: "#FFFFFF", // White border for contrast
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  loanTypeTitle: {
    fontSize: 15, // Sleeker font size
    fontWeight: "600", // Slightly lighter for sleeker look
    marginBottom: 3, // Tighter spacing
    textAlign: "center",
    letterSpacing: -0.2, // Tighter letter spacing
  },
  loanTypeDescription: {
    fontSize: 11, // Smaller for sleeker appearance
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 14, // Tighter line height
    opacity: 0.8, // More subtle for sleeker hierarchy
  },

  // New Slim Design Styles
  slimLoanContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  slimIconContainer: {
    marginRight: 12,
    padding: 4,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  slimTextContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  slimLoanTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  slimLoanDescription: {
    fontSize: 10,
    fontWeight: "500",
    opacity: 0.7,
    lineHeight: 12,
  },
  slimSelectedIndicator: {
    marginLeft: 8,
    padding: 2,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  // Contact Section - Tighter Spacing
  contactSection: {
    marginBottom: 12,
  },
  tabsWithAddNew: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  fullWidthTabs: {
    flexDirection: "row",
    gap: 6,
    flex: 1, // Take available space, leaving room for Add New button
  },
  addNewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
    backgroundColor: "rgba(16,185,129,0.1)",
  },
  addNewText: {
    fontSize: 12,
    fontWeight: "600",
  },
  fullWidthTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    backgroundColor: "#1F2937",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Add bottom border space for active indicator
    borderBottomWidth: 3,
    borderBottomColor: "transparent", // Default transparent bottom border
  },
  fullWidthTabText: {
    fontSize: 13, // Slightly smaller for compact design
    fontWeight: "600",
  },
  contactList: {
    gap: 6, // Reduced gap for compact design
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12, // App padding
    borderRadius: 8, // App border radius
    backgroundColor: "#1F2937", // App card background
    borderWidth: 1,
    borderColor: "#374151", // App border color
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 1,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#10B981", // App primary color
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactInitial: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 14, // App body size
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  contactDetail: {
    fontSize: 12, // App caption size
    fontWeight: "500",
    color: "#9CA3AF", // App secondary text
    lineHeight: 16,
  },
  contactBalance: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
    lineHeight: 14,
  },
  contactActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  // Amount Section - Tighter Spacing
  amountSection: {
    marginBottom: 12, // Further reduced for tighter layout
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#1F2937",
    borderWidth: 2,
    borderColor: "#374151",
    paddingHorizontal: 14, // Slightly reduced
    paddingVertical: 10, // Reduced for compact design
    marginBottom: 12, // Reduced spacing
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currencySection: {
    marginRight: 8,
  },
  largeCurrency: {
    fontSize: 24, // Reduced for better proportion
    fontWeight: "700",
    color: "#10B981", // App primary color
  },
  amountInput: {
    flex: 1,
    fontSize: 24, // Reduced for better proportion
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "left",
  },
  quickAmountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8, // App spacing
  },
  quickAmountGridItem: {
    width: "30%",
    paddingVertical: 14, // Slightly larger for better touch
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 2, // Thicker border for better definition
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderColor: "#374151",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  quickAmountGridText: {
    fontSize: 15, // Slightly larger for better readability
    fontWeight: "700", // Bolder for better visibility
    letterSpacing: 0.5,
  },

  // Loan Details Section - App Theme
  loanDetailsSection: {
    marginBottom: 24,
  },
  detailInputGroup: {
    marginBottom: 16,
  },
  detailInput: {
    borderRadius: 8, // App border radius
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14, // App body size
    fontWeight: "500",
    minHeight: 44, // App touch target
    backgroundColor: "#1F2937", // App card background
    borderColor: "#374151", // App border color
    color: "#FFFFFF",
  },
  detailRow: {
    flexDirection: "row",
    gap: 12, // App spacing
    marginBottom: 16,
  },
  detailHalfInput: {
    flex: 1,
  },
  smartSuggestionsSection: {
    marginTop: 16,
  },
  suggestionsTitle: {
    fontSize: 12, // App caption size
    fontWeight: "600",
    color: "#9CA3AF", // App secondary text
    marginBottom: 8,
    lineHeight: 16,
  },
  suggestionTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6, // App spacing
  },
  suggestionTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12, // App border radius
    borderWidth: 1,
    backgroundColor: "#1F2937", // App card background
  },
  suggestionTagText: {
    fontSize: 11, // App small size
    fontWeight: "500",
    lineHeight: 14,
  },

  // Full Width Actions - App Theme
  fullWidthActions: {
    flexDirection: "row",
    gap: 12, // App spacing
    marginTop: 20,
    marginBottom: 16,
    paddingHorizontal: 4, // Slight inset for visual balance
  },
  fullWidthCancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8, // App border radius
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1F2937", // App card background
    borderColor: "#374151", // App border color
  },
  fullWidthCancelText: {
    fontSize: 14, // App body size
    fontWeight: "600",
    color: "#9CA3AF", // App secondary text
  },
  fullWidthSubmitButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8, // App border radius
    gap: 6,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  fullWidthSubmitText: {
    color: "#FFFFFF",
    fontSize: 16, // App subheading size
    fontWeight: "700",
    letterSpacing: 0.1,
  },

  // Enhanced Data Capture Styles
  sectionHeaderWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  termsSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  frequencyChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    minWidth: 70,
    alignItems: "center",
  },
  frequencyChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  paymentSection: {
    marginBottom: 16,
  },
  paymentMethodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  paymentMethodItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  paymentMethodText: {
    fontSize: 13,
    fontWeight: "600",
  },
  contactInfoSection: {
    marginBottom: 16,
  },
  bankDetailsSection: {
    marginBottom: 16,
  },
  remindersSection: {
    marginBottom: 16,
  },
  reminderToggleContainer: {
    marginBottom: 12,
  },
  reminderToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  reminderToggleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  reminderDaysContainer: {
    marginTop: 8,
  },
  reminderDaysGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  reminderDayChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  reminderDayText: {
    fontSize: 12,
    fontWeight: "600",
  },
  notesSection: {
    marginBottom: 16,
  },
  groupMembersSection: {
    marginBottom: 16,
  },
  membersList: {
    gap: 8,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#1F2937",
    borderWidth: 1,
    borderColor: "#374151",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  memberInitial: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  memberName: {
    fontSize: 14,
    fontWeight: "600",
  },
  memberShareContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  memberShareInput: {
    width: 50,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  percentageText: {
    fontSize: 13,
    fontWeight: "600",
  },
  addMemberButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.3)",
    backgroundColor: "rgba(139,92,246,0.1)",
    marginTop: 8,
  },
  addMemberText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Add Transaction Modal Styles
  transactionModalContainer: {
    flex: 1,
    paddingTop: 0,
  },
  transactionModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  transactionModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 20,
  },
  groupedTabContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tabGroup: {
    flexDirection: "row",
    borderRadius: 25,
    padding: 4,
  },
  groupedTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  groupedTabText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  typeButtonActive: {
    // backgroundColor will be set dynamically
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  required: {
    color: "#EF4444",
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 48, // Match date field height
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  dateButtonFull: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
    width: "100%",
  },
  dateText: {
    fontSize: 16,
  },
  selectContainer: {
    flexDirection: "row",
    gap: 8,
  },
  selectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectText: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 32,
  },
  addTransactionButton: {
    flex: 2,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  addTransactionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  // Edit Mode Button Styles
  editButtonContainer: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 32,
  },
  updateButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  updateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  deleteButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  copyButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  // Delete Modal Styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteModalContainer: {
    width: "85%",
    maxWidth: 400,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  deleteModalHeader: {
    padding: 20,
    paddingBottom: 10,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  deleteModalContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  deleteModalMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 10,
  },
  deleteModalTransaction: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    fontStyle: "italic",
  },
  deleteModalActions: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 10,
    gap: 12,
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelDeleteButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  confirmDeleteButton: {
    backgroundColor: "#EF4444",
  },
  deleteModalButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  smsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  smsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  smsInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 24,
    minHeight: 200,
  },
  analyzeSmsButton: {
    flex: 2,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  analyzeSmsButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  imageContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  imageTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  uploadArea: {
    flex: 1,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    paddingVertical: 40,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 16,
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    marginBottom: 24,
  },
  selectImageButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  selectImageText: {
    fontSize: 14,
    fontWeight: "600",
  },
  analyzeImageButton: {
    flex: 2,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  analyzeImageButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },

  // Recurring Section Styles
  recurringSection: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  recurringSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  autopayContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 2,
  },

  // Date Picker Styles
  datePickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  datePickerContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    backgroundColor: "#FFFFFF", // Ensure proper background
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#F9FAFB", // Light background for header
  },
  datePickerButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  datePicker: {
    backgroundColor: "transparent",
  },

  // Picker Modal Styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  pickerContainer: {
    maxHeight: "70%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  pickerButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  pickerContent: {
    maxHeight: 300,
  },
  pickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  pickerItemText: {
    fontSize: 16,
    flex: 1,
  },
  pickerItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  pickerItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  pickerItemEmoji: {
    fontSize: 16,
  },
  selectTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minHeight: 20, // Ensure consistent height
  },
  subcategoryIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    flexShrink: 0, // Prevent shrinking
  },

  // View toggle styles
  pickerTitleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  pickerHeaderButton: {
    padding: 4,
  },
  viewToggleContainer: {
    flexDirection: "row",
    marginTop: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  viewToggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    marginHorizontal: 2,
    borderRadius: 6,
  },
  viewToggleButtonActive: {
    borderWidth: 2,
  },
  viewToggleContainerInline: {
    flexDirection: "row",
    borderRadius: 6,
    overflow: "hidden",
  },
  viewToggleButtonSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginHorizontal: 1,
  },
  viewToggleButtonActiveSmall: {
    // Active state handled by backgroundColor
  },
  viewToggleSingleButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 12,
  },

  // Grid view styles
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
  },
  gridItem: {
    width: "31%",
    margin: "1%",
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  gridItemText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  gridItemLarge: {
    width: "31%",
    margin: "1%",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
  },
  gridItemIcon: {
    marginBottom: 4,
  },
  gridItemTextLarge: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 14,
  },
  gridItemCheckmark: {
    position: "absolute",
    top: 4,
    right: 4,
  },

  // Analysis result styles
  analysisResultContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  analysisResultTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  analysisResultText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  analysisResultDetail: {
    fontSize: 13,
    marginBottom: 4,
  },

  // Image upload styles
  selectedImageContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  selectedImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  changeImageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  changeImageButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default QuickAddButton;
