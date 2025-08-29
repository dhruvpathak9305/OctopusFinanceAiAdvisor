import { useState, useEffect } from "react";
import { CreditCardFormData } from "../types";

export const useCreditCardForm = (visible: boolean) => {
  const [formData, setFormData] = useState<CreditCardFormData>({
    name: "",
    institution: "",
    lastFourDigits: "",
    creditLimit: "",
    currentBalance: "",
    dueDate: new Date(),
    billingCycle: "",
    logoUri: null,
  });

  const [customBillingDate, setCustomBillingDate] = useState<Date>(new Date());
  const [customInstitutions, setCustomInstitutions] = useState<string[]>([]);
  const [newCustomInstitution, setNewCustomInstitution] = useState("");

  // Modal visibility states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showInstitutionPicker, setShowInstitutionPicker] = useState(false);
  const [showBillingCyclePicker, setShowBillingCyclePicker] = useState(false);
  const [showCustomBillingDatePicker, setShowCustomBillingDatePicker] =
    useState(false);
  const [showAiExtractionModal, setShowAiExtractionModal] = useState(false);
  const [showCustomInstitutionModal, setShowCustomInstitutionModal] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const updateField = <K extends keyof CreditCardFormData>(
    field: K,
    value: CreditCardFormData[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      institution: "",
      lastFourDigits: "",
      creditLimit: "",
      currentBalance: "",
      dueDate: new Date(),
      billingCycle: "",
      logoUri: null,
    });

    setCustomBillingDate(new Date());
    setNewCustomInstitution("");

    // Reset all modal states
    setShowDatePicker(false);
    setShowInstitutionPicker(false);
    setShowBillingCyclePicker(false);
    setShowCustomBillingDatePicker(false);
    setShowAiExtractionModal(false);
    setShowCustomInstitutionModal(false);
    setLoading(false);
  };

  // Reset form when modal becomes visible
  useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible]);

  return {
    // Form data
    formData,
    updateField,
    resetForm,

    // Additional state
    customBillingDate,
    setCustomBillingDate,
    customInstitutions,
    setCustomInstitutions,
    newCustomInstitution,
    setNewCustomInstitution,

    // Modal states
    showDatePicker,
    setShowDatePicker,
    showInstitutionPicker,
    setShowInstitutionPicker,
    showBillingCyclePicker,
    setShowBillingCyclePicker,
    showCustomBillingDatePicker,
    setShowCustomBillingDatePicker,
    showAiExtractionModal,
    setShowAiExtractionModal,
    showCustomInstitutionModal,
    setShowCustomInstitutionModal,
    loading,
    setLoading,
  };
};
