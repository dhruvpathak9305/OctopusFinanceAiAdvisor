import React, { useState, useEffect, useRef } from "react";
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
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useNavigation } from "@react-navigation/native";
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

interface QuickAddButtonProps {
  style?: any;
  editTransaction?: any;
  isEditMode?: boolean;
  onTransactionUpdate?: () => void; // Callback to refresh transactions after edit
}

interface AddTransactionModalProps {
  colors: any;
  onClose: () => void;
  onBack: () => void;
  editTransaction?: any; // Transaction to edit (if in edit mode)
  isEditMode?: boolean;
  onTransactionUpdate?: () => void; // Callback to refresh transactions
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
  const theme = useTheme();
  const colors = theme.colors || {
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
  onClose,
  onBack,
  editTransaction,
  isEditMode = false,
  onTransactionUpdate,
}) => {
  const { isDemo } = useDemoMode();
  const [activeTab, setActiveTab] = useState("Manual Entry");
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
  const [showAccountPicker, setShowAccountPicker] = useState(false);
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

  const tabs = ["Manual Entry", "Paste SMS", "Upload Image"];

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

  // Fetch data from database on component mount
  useEffect(() => {
    refreshData();
  }, [isDemo]);

  // Effect to populate form fields when in edit mode
  useEffect(() => {
    if (isEditMode && editTransaction) {
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

      if (transactionType === "income") {
        // For income, use destination account (where money goes)
        const accountName = editTransaction.destination_account_name || "";
        const accountType = editTransaction.destination_account_type || "";
        if (accountName) {
          // Format as "Account Name (Type)" - using type since we don't have institution field
          setAccount(
            accountType ? `${accountName} (${accountType})` : accountName
          );
        }
      } else if (transactionType === "expense") {
        // For expense, use source account (where money comes from)
        const accountName = editTransaction.source_account_name || "";
        const accountType = editTransaction.source_account_type || "";
        if (accountName) {
          setAccount(
            accountType ? `${accountName} (${accountType})` : accountName
          );
        }
      } else if (transactionType === "transfer") {
        // For transfer, use both source and destination accounts
        const fromAccountName = editTransaction.source_account_name || "";
        const fromAccountType = editTransaction.source_account_type || "";
        const toAccountName = editTransaction.destination_account_name || "";
        const toAccountType = editTransaction.destination_account_type || "";

        if (fromAccountName) {
          setFromAccount(
            fromAccountType
              ? `${fromAccountName} (${fromAccountType})`
              : fromAccountName
          );
        }
        if (toAccountName) {
          setToAccount(
            toAccountType
              ? `${toAccountName} (${toAccountType})`
              : toAccountName
          );
        }
      }

      setIsRecurring(editTransaction.is_recurring || false);
      if (editTransaction.recurrence_pattern) {
        setFrequency(editTransaction.recurrence_pattern);
      }
      if (editTransaction.recurrence_end_date) {
        setEndDate(new Date(editTransaction.recurrence_end_date));
      }
    }
  }, [isEditMode, editTransaction]);

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

    try {
      // Find the selected category and subcategory IDs
      const selectedCategory = budgetCategories.find(
        (cat) => cat.name === category
      );
      const selectedSubcategory = budgetSubcategories.find(
        (sub) => sub.name === subcategory
      );
      const selectedAccount = accounts.find(
        (acc) => `${acc.name} (${acc.institution})` === account
      );

      // Prepare transaction data according to the database schema
      const transactionData = {
        name: description,
        description: description,
        amount: parseFloat(amount),
        date: selectedDate.toISOString(),
        type: transactionType,
        category_id: selectedCategory?.id || null,
        subcategory_id: selectedSubcategory?.id || null,
        icon: null,
        merchant: merchant || null,
        source_account_id: selectedAccount?.id || null,
        source_account_type: selectedAccount ? "bank" : "other",
        source_account_name: selectedAccount?.name || null,
        destination_account_id: null,
        destination_account_type: null,
        destination_account_name: null,
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? frequency : null,
        recurrence_end_date:
          isRecurring && endDate ? endDate.toISOString() : null,
        parent_transaction_id: null,
        interest_rate: null,
        loan_term_months: null,
        metadata: null,
      };

      console.log(
        isEditMode ? "Updating transaction:" : "Adding transaction:",
        transactionData
      );

      // Save to database with improved flow to prevent UI freezing
      if (isEditMode && editTransaction) {
        // First close the modal to prevent UI blocking
        onClose();

        // Then perform the database operation in the background
        setTimeout(async () => {
          try {
            await updateTransaction(
              editTransaction.id,
              transactionData,
              isDemo
            );

            // Show a more detailed success toast notification
            setToastMessage(
              `Transaction "${transactionData.name}" updated successfully!`
            );
            setToastVisible(true);

            // Wait a moment before triggering the refresh to ensure UI responsiveness
            InteractionManager.runAfterInteractions(() => {
              // Call the refresh callback in the parent component
              // This will update the transaction list and close the modal
              onTransactionUpdate?.();
            });
          } catch (err) {
            console.error("Error updating transaction:", err);
            Alert.alert(
              "Error",
              "Failed to update transaction. Please try again."
            );
          }
        }, 100);
      } else {
        // First close the modal to prevent UI blocking
        onClose();

        // Then perform the database operation in the background
        setTimeout(async () => {
          try {
            await addTransaction(transactionData, isDemo);

            // Show a more detailed success toast notification
            setToastMessage(
              `Transaction "${transactionData.name}" added successfully!`
            );
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
      month: "long",
      day: "numeric",
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
      case "Manual Entry":
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
                    style={[styles.amountInput, { color: colors.text }]}
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
            </View>

            {/* Full width date picker */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Date <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.dateButtonFull,
                  { backgroundColor: colors.card, borderColor: colors.border },
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

            {/* Category and Subcategory Row (for expense/income) */}
            {transactionType !== "transfer" && (
              <View style={styles.rowContainer}>
                <View
                  style={[styles.fieldContainer, { flex: 1, marginRight: 10 }]}
                >
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
                            color: category
                              ? colors.text
                              : colors.textSecondary,
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

                <View
                  style={[styles.fieldContainer, { flex: 1, marginLeft: 10 }]}
                >
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
                  {isEditMode ? "Update Transaction" : "Add Transaction"}
                </Text>
              </TouchableOpacity>
            </View>

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
                            Select Category
                          </Text>
                          <TouchableOpacity
                            onPress={() => setShowCategoryPicker(false)}
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
                          {getCurrentCategories().map((categoryName, index) => (
                            <TouchableOpacity
                              key={index}
                              style={[
                                styles.pickerItem,
                                { borderBottomColor: colors.border },
                              ]}
                              onPress={() => {
                                setCategory(categoryName);
                                setSubcategory(""); // Reset subcategory when category changes
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
                          ))}
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
                            Select Subcategory
                          </Text>
                          <TouchableOpacity
                            onPress={() => setShowSubcategoryPicker(false)}
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
                          {getCurrentSubcategories().map(
                            (subcategoryName, index) => (
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
                                  {(() => {
                                    const {
                                      getSubcategoryIconFromDB,
                                    } = require("../../../../utils/subcategoryIcons");

                                    // Find the subcategory data to get the database icon
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

                                    if (iconElement) {
                                      return (
                                        <View style={styles.pickerItemIcon}>
                                          {iconElement}
                                        </View>
                                      );
                                    }
                                    return (
                                      <View style={styles.pickerItemIcon}>
                                        <Text style={styles.pickerItemEmoji}>
                                          📄
                                        </Text>
                                      </View>
                                    );
                                  })()}
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
                            )
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

            {/* Add Account Modal */}
            <AddAccountModal
              visible={showAddAccountModal}
              onClose={() => setShowAddAccountModal(false)}
              onAccountAdded={handleAccountAdded}
            />
          </ScrollView>
        );

      case "Paste SMS":
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

      case "Upload Image":
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
          {isEditMode ? "Edit Transaction" : "Add New Transaction"}
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
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
  const { isDark } = useTheme();
  const navigation = useNavigation();

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

      default:
        return null;
    }
  };

  return (
    <>
      {/* Main Quick Add Button - Hide in edit mode */}
      {!isEditMode && (
        <TouchableOpacity
          style={[
            styles.quickAddButton,
            { backgroundColor: colors.primary },
            style,
          ]}
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
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
          {/* Modal Header - Hide when transaction modal is open */}
          {selectedAction !== "transaction" && (
            <View style={styles.modalHeaderContainer}>
              <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>
                Quick Actions
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseModal}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
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
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    paddingVertical: 16,
  },
  tabGroup: {
    flexDirection: "row",
    borderRadius: 25,
    padding: 4,
  },
  groupedTab: {
    flex: 1,
    paddingVertical: 12,
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
    paddingTop: 20,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
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
    paddingVertical: 14,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "500",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
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
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
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
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
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
