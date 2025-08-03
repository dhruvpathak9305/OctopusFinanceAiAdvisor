import { useState, useCallback, useEffect } from 'react';
import { Transaction, TransactionFormData } from '../types/transactions';
import { 
  fetchCategories, 
  fetchSubcategories, 
  getEmptyFormData, 
  mapTransactionToFormData, 
  createCategory, 
  createSubcategory 
} from '../utils/transactionFormHelpers';
import { validateTransactionForm, clearValidationError } from '../utils/transactionValidation';
import { toast } from '@/components/ui/use-toast';
import { useAccounts } from '../contexts/AccountsContext';
import { useCreditCards } from '../contexts/CreditCardContext';

interface UseTransactionFormProps {
  mode: 'add' | 'edit';
  transactionData?: Transaction;
  onSubmit: (formData: TransactionFormData) => Promise<void>;
}

export const useTransactionForm = ({
  mode,
  transactionData,
  onSubmit
}: UseTransactionFormProps) => {
  // Context hooks for real data
  const { accounts } = useAccounts();
  const { creditCards } = useCreditCards();
  
  // Basic form state
  const [formData, setFormData] = useState<TransactionFormData>(getEmptyFormData());
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'sms' | 'image'>('manual');
  
  // Category and subcategory state
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [subcategories, setSubcategories] = useState<Array<{ id: string; name: string; category_id: string }>>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
  // Date picker states
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [billDueDatePickerOpen, setBillDueDatePickerOpen] = useState(false);
  const [recurrenceEndDatePickerOpen, setRecurrenceEndDatePickerOpen] = useState(false);
  
  // SMS analysis state
  const [smsText, setSmsText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Image upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Account form state
  const [accountFormOpen, setAccountFormOpen] = useState(false);

  // Form field setters - Define this first to avoid circular dependency
  const updateFormField = useCallback(<K extends keyof TransactionFormData>(
    field: K,
    value: TransactionFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field if it exists
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [validationErrors]);

  // Handle category change
  const handleCategoryChange = useCallback((categoryId: string, categoryName: string) => {
    updateFormField('selectedCategoryId', categoryId);
    updateFormField('selectedCategoryName', categoryName);
    updateFormField('selectedSubcategoryId', null);
    updateFormField('selectedSubcategoryName', '');
  }, [updateFormField]);

  // Handle subcategory change
  const handleSubcategoryChange = useCallback((subcategoryId: string, subcategoryName: string) => {
    updateFormField('selectedSubcategoryId', subcategoryId);
    updateFormField('selectedSubcategoryName', subcategoryName);
  }, [updateFormField]);

  // Handle add category
  const handleAddCategory = useCallback(async (name: string) => {
    try {
      const newCategory = await createCategory(
        name,
        1000, // Default budget limit
        '#10b981', // Default ring color (green)
        '#f0fdf4', // Default background color (light green)
        undefined, // userId will be set by the service
        `Auto-created category: ${name}`, // Description
        'active', // isActive
        10 // Default percentage
      );
      if (newCategory) {
        setCategories(prev => [...prev, newCategory]);
        handleCategoryChange(newCategory.id, newCategory.name);
        return newCategory;
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
    return null;
  }, [handleCategoryChange]);

  // Handle add subcategory
  const handleAddSubcategory = useCallback(async (name: string) => {
    if (!formData.selectedCategoryId) {
      toast({
        title: "Error",
        description: "Please select a category first",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      const newSubcategory = await createSubcategory(
        name,
        formData.selectedCategoryId,
        500, // Default amount
        '#10b981', // Default color (green)
        'receipt', // Default icon
        `Auto-created subcategory: ${name}`, // Description
        undefined // transactionCategoryId
      );
      if (newSubcategory) {
        setSubcategories(prev => [...prev, newSubcategory]);
        handleSubcategoryChange(newSubcategory.id, newSubcategory.name);
        return newSubcategory;
      }
    } catch (error) {
      console.error('Error adding subcategory:', error);
      toast({
        title: "Error",
        description: "Failed to add subcategory",
        variant: "destructive",
      });
    }
    return null;
  }, [formData.selectedCategoryId, handleSubcategoryChange]);

  // Initialize the form based on edit/add mode
  useEffect(() => {
    if (transactionData) {
      // If we have transaction data, use it to populate the form
      // This handles both edit mode and pre-filled add mode (like SMS analysis)
      const formData = mapTransactionToFormData(transactionData);
      
      // Check if this is SMS analysis data that needs category resolution
      if (transactionData.metadata?.isSmsAnalysis) {
        // We'll resolve categories after they're loaded
        setFormData(formData);
      } else {
        setFormData(formData);
      }
    } else {
      setFormData(getEmptyFormData());
    }
  }, [mode, transactionData]);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Load subcategories for all categories (needed for SMS analysis context)
  useEffect(() => {
    const loadAllSubcategories = async () => {
      try {
        // Load subcategories for all categories to have complete context for SMS analysis
        const allSubcategoriesPromises = categories.map(async (category) => {
          try {
            return await fetchSubcategories(category.id);
          } catch (error) {
            console.error(`Error loading subcategories for category ${category.id}:`, error);
            return [];
          }
        });
        
        const allSubcategoriesArrays = await Promise.all(allSubcategoriesPromises);
        const allSubcategories = allSubcategoriesArrays.flat();
        setSubcategories(allSubcategories);
      } catch (error) {
        console.error('Error loading all subcategories:', error);
      }
    };

    if (categories.length > 0) {
      loadAllSubcategories();
    }
  }, [categories]);

  // Resolve SMS analysis categories after categories are loaded
  useEffect(() => {
    if (transactionData?.metadata?.isSmsAnalysis && categories.length > 0 && formData.selectedCategoryName) {
      // Find matching category by name
      const matchingCategory = categories.find(cat => 
        cat.name.toLowerCase() === formData.selectedCategoryName?.toLowerCase()
      );
      
      if (matchingCategory && matchingCategory.id !== formData.selectedCategoryId) {
        updateFormField('selectedCategoryId', matchingCategory.id);
      } else if (!matchingCategory && formData.selectedCategoryId?.startsWith('temp-')) {
        // Auto-create category if it doesn't exist and we have a temporary ID
        handleAddCategory(formData.selectedCategoryName);
      }
    }
  }, [categories, transactionData, formData.selectedCategoryName, formData.selectedCategoryId, updateFormField, handleAddCategory]);

  // Resolve SMS analysis subcategories after subcategories are loaded
  useEffect(() => {
    if (transactionData?.metadata?.isSmsAnalysis && formData.selectedSubcategoryName && formData.selectedCategoryId && !formData.selectedCategoryId.startsWith('temp-')) {
      // Find matching subcategory by name
      const matchingSubcategory = subcategories.find(subcat => 
        subcat.name.toLowerCase() === formData.selectedSubcategoryName?.toLowerCase()
      );
      
      if (matchingSubcategory && matchingSubcategory.id !== formData.selectedSubcategoryId) {
        updateFormField('selectedSubcategoryId', matchingSubcategory.id);
      } else if (!matchingSubcategory && subcategories.length >= 0) {
        // Auto-create subcategory if it doesn't exist and we have a valid category
        handleAddSubcategory(formData.selectedSubcategoryName);
      }
    }
  }, [subcategories, transactionData, formData.selectedSubcategoryName, formData.selectedSubcategoryId, formData.selectedCategoryId, updateFormField, handleAddSubcategory]);

  // Utility to clear validation errors
  const handleClearValidationError = useCallback((field: string) => {
    setValidationErrors(prev => clearValidationError(prev, field));
  }, []);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(getEmptyFormData());
    setValidationErrors({});
    setSmsText("");
    setImagePreview(null);
    setIsProcessing(false);
    setActiveTab('manual');
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateTransactionForm(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "An error occurred while submitting the form",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit, resetForm]);

  // Process SMS text
  const processSmsText = useCallback(async () => {
    if (!smsText.trim()) {
      toast({
        title: "Error",
        description: "Please enter SMS text",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      // Import and use the SMS Analyzer
      const { analyzeWithOctopus } = await import('@/services/smsAnalyzer');
      
      // Prepare context data from actual app data
      const contextData = {
        categories: categories.map(cat => ({ 
          id: cat.id, 
          name: cat.name 
        })),
        subcategories: subcategories.map(sub => ({ 
          id: sub.id, 
          name: sub.name, 
          category_id: sub.category_id 
        })),
        // Use real account data from context
        accounts: accounts.map(acc => ({
          id: acc.id,
          name: acc.name,
          institution: acc.institution
        })),
        // Use real credit cards data from context, with card number from lastFourDigits
        creditCards: creditCards.map(cc => ({
          id: cc.id || '',
          name: cc.name,
          bank: cc.bank,
          cardNumber: cc.lastFourDigits // Map lastFourDigits to cardNumber for SMS matching
        }))
      };
      
      const result = analyzeWithOctopus(smsText, contextData);
      console.log("🚀 ~ processSmsText ~ result:", result)
      
      if (result.success && result.data) {
        // Map the SMS analysis result to form fields (basic fields first)
        updateFormField('name', result.data.name || result.data.description || 'SMS Transaction');
        updateFormField('amount', result.data.amount?.toString() || '0');
        updateFormField('type', result.data.type || 'expense');
        updateFormField('merchant', result.data.merchant || '');
        // Set account ID (not name) for proper AccountSelector functionality
        updateFormField('account', result.data.accountId || '');
        updateFormField('date', result.data.date ? new Date(result.data.date) : new Date());
        
        // Set category first, then subcategory with a slight delay to ensure proper sequencing
        if (result.data.categoryId && result.data.categoryName) {
          updateFormField('selectedCategoryId', result.data.categoryId);
          updateFormField('selectedCategoryName', result.data.categoryName);
          
          // Set subcategory after category to avoid timing conflicts
          if (result.data.subcategoryId && result.data.subcategoryName) {
            setTimeout(() => {
              updateFormField('selectedSubcategoryId', result.data.subcategoryId);
              updateFormField('selectedSubcategoryName', result.data.subcategoryName);
            }, 50);
          }
        }
        
        // Final debug log with essential parsed data
        console.log('📊 SMS parsed and selections made:', {
          parsedCategory: result.data.categoryName,
          parsedSubcategory: result.data.subcategoryName,
          parsedAccount: result.data.accountName,
          parsedAccountId: result.data.accountId,
          parsedCategoryId: result.data.categoryId,
          parsedSubcategoryId: result.data.subcategoryId
        });
        
        toast({
          title: "SMS Processed",
          description: `Transaction details extracted successfully (${Math.round(result.confidence * 100)}% confidence)`,
        });
        
        setActiveTab("manual");
      } else {
        toast({
          title: "Analysis Failed",
          description: result.error || "Could not extract transaction details from SMS",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing SMS:', error);
      toast({
        title: "Error",
        description: "Failed to process SMS text",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [smsText, updateFormField, categories, subcategories]);

  // Handle image upload
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Reset image upload
  const resetImageUpload = useCallback(() => {
    setImagePreview(null);
  }, []);

  // Process uploaded image
  const processImage = useCallback(async () => {
    if (!imagePreview) {
      toast({
        title: "Error",
        description: "Please upload an image",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      // In a real implementation, call your API to process image
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      updateFormField('name', "Receipt Transaction");
      updateFormField('amount', "78.50");
      updateFormField('type', "expense");
      updateFormField('merchant', "Receipt Merchant");
      
      toast({
        title: "Image Processed",
        description: "Transaction details extracted successfully",
      });
      
      setActiveTab("manual");
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [imagePreview, updateFormField]);

  return {
    // Form data and state
    formData,
    updateFormField,
    validationErrors,
    clearValidationError: handleClearValidationError,
    isSubmitting,
    handleSubmit,
    resetForm,
    
    // Active tab
    activeTab,
    setActiveTab,
    
    // Categories and subcategories
    categories,
    subcategories,
    categoriesLoading,
    handleCategoryChange,
    handleSubcategoryChange,
    handleAddCategory,
    handleAddSubcategory,
    
    // Date pickers
    datePickerOpen,
    setDatePickerOpen,
    billDueDatePickerOpen,
    setBillDueDatePickerOpen,
    recurrenceEndDatePickerOpen,
    setRecurrenceEndDatePickerOpen,
    
    // SMS analysis
    smsText,
    setSmsText,
    isProcessing,
    processSmsText,
    
    // Image upload
    imagePreview,
    handleImageUpload,
    resetImageUpload,
    processImage,
    
    // Account form
    accountFormOpen,
    setAccountFormOpen,
  };
}; 