import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Account } from "../../../../contexts/AccountsContext";
import { addAccount } from "../../../../services/accountsService";

interface AccountType {
  id: string;
  label: string;
  icon: string;
}

export const useAddAccountModal = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("savings");
  const [balance, setBalance] = useState("");
  const [institution, setInstitution] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showInstitutionPicker, setShowInstitutionPicker] = useState(false);
  const [showCustomTypeModal, setShowCustomTypeModal] = useState(false);
  const [showCustomInstitutionModal, setShowCustomInstitutionModal] =
    useState(false);
  const [showAiExtractionModal, setShowAiExtractionModal] = useState(false);

  // Custom data
  const [customType, setCustomType] = useState("");
  const [customInstitution, setCustomInstitution] = useState("");
  const [customAccountTypes, setCustomAccountTypes] = useState<AccountType[]>(
    []
  );
  const [customInstitutions, setCustomInstitutions] = useState<string[]>([]);

  const resetForm = () => {
    setName("");
    setType("savings");
    setBalance("");
    setInstitution("");
    setAccountNumber("");
    setLogoUri(null);
    setCustomType("");
    setCustomInstitution("");
    setShowCustomTypeModal(false);
    setShowCustomInstitutionModal(false);
    setShowAiExtractionModal(false);
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter an account name");
      return false;
    }

    if (!institution.trim()) {
      Alert.alert("Error", "Please enter the financial institution");
      return false;
    }

    if (!balance.trim() || isNaN(parseFloat(balance))) {
      Alert.alert("Error", "Please enter a valid opening balance");
      return false;
    }

    return true;
  };

  const createAccount = async (
    isDemo: boolean,
    onAccountAdded: (account: Account) => void
  ) => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newAccount: Account = {
        id: "temp-" + Date.now(),
        name: name.trim(),
        type,
        balance: parseFloat(balance),
        institution: institution.trim(),
        account_number: accountNumber.trim() || undefined,
        logo_url: logoUri || undefined,
      };

      const createdAccount = await addAccount(newAccount, isDemo);
      onAccountAdded(createdAccount);
      Alert.alert("Success", "Bank account added successfully!");
      return true;
    } catch (error) {
      console.error("Error creating account:", error);
      Alert.alert("Error", "Failed to add bank account. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    // Form state
    name,
    setName,
    type,
    setType,
    balance,
    setBalance,
    institution,
    setInstitution,
    accountNumber,
    setAccountNumber,
    logoUri,
    setLogoUri,
    loading,

    // Modal states
    showTypePicker,
    setShowTypePicker,
    showInstitutionPicker,
    setShowInstitutionPicker,
    showCustomTypeModal,
    setShowCustomTypeModal,
    showCustomInstitutionModal,
    setShowCustomInstitutionModal,
    showAiExtractionModal,
    setShowAiExtractionModal,

    // Custom data
    customType,
    setCustomType,
    customInstitution,
    setCustomInstitution,
    customAccountTypes,
    setCustomAccountTypes,
    customInstitutions,
    setCustomInstitutions,

    // Functions
    resetForm,
    validateForm,
    createAccount,
  };
};

export const useCustomAccountType = () => {
  const handleAddCustomType = (
    customType: string,
    setCustomAccountTypes: React.Dispatch<React.SetStateAction<AccountType[]>>,
    setType: (type: string) => void,
    setCustomType: (type: string) => void,
    setShowCustomTypeModal: (show: boolean) => void
  ) => {
    if (customType.trim()) {
      const newType = {
        id: customType.toLowerCase().replace(/\s+/g, "_"),
        label: customType.trim(),
        icon: "document-outline",
      };
      setCustomAccountTypes((prev) => [...prev, newType]);
      setType(newType.id);
      setCustomType("");
      setShowCustomTypeModal(false);
    }
  };

  return { handleAddCustomType };
};

export const useCustomInstitution = () => {
  const handleAddCustomInstitution = (
    customInstitution: string,
    setCustomInstitutions: React.Dispatch<React.SetStateAction<string[]>>,
    setInstitution: (institution: string) => void,
    setCustomInstitution: (institution: string) => void,
    setShowCustomInstitutionModal: (show: boolean) => void
  ) => {
    if (customInstitution.trim()) {
      setCustomInstitutions((prev) => [...prev, customInstitution.trim()]);
      setInstitution(customInstitution.trim());
      setCustomInstitution("");
      setShowCustomInstitutionModal(false);
    }
  };

  return { handleAddCustomInstitution };
};

export const useImagePicker = () => {
  const handleImagePicker = async (
    setLogoUri: (uri: string | null) => void
  ) => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant camera roll permissions to upload images."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setLogoUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  return { handleImagePicker };
};

export const useAiExtraction = () => {
  const handleAiExtraction = async (
    type: "image" | "document" | "sms",
    setLoading: (loading: boolean) => void,
    setName: (name: string) => void,
    setInstitution: (institution: string) => void,
    setAccountNumber: (accountNumber: string) => void,
    setType: (type: string) => void,
    setShowAiExtractionModal: (show: boolean) => void
  ) => {
    try {
      let result;

      if (type === "image") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission needed",
            "Please grant camera roll permissions."
          );
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
      } else if (type === "document") {
        result = await DocumentPicker.getDocumentAsync({
          type: ["image/*", "application/pdf", "text/plain"],
          copyToCacheDirectory: true,
        });
      }

      if (
        (type === "image" && !result.canceled) ||
        (type === "document" && !result.canceled)
      ) {
        setLoading(true);

        // Simulate AI processing - replace with actual AI service
        setTimeout(() => {
          const mockData = {
            name: "HDFC Savings Account",
            institution: "HDFC Bank",
            accountNumber: "1234567890123456",
            type: "savings",
          };

          setName(mockData.name);
          setInstitution(mockData.institution);
          setAccountNumber(mockData.accountNumber);
          setType(mockData.type);
          setLoading(false);
          setShowAiExtractionModal(false);

          Alert.alert("Success", "Account details extracted successfully!");
        }, 2000);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Failed to process the file");
    }
  };

  return { handleAiExtraction };
};

// Format utility functions
export const formatAccountNumber = (text: string) => {
  const cleaned = text.replace(/\D/g, "");
  const limited = cleaned.substring(0, 17);
  return limited.replace(/(\d{4})/g, "$1 ").trim();
};

export const formatBalance = (text: string) => {
  const cleanedValue = text.replace(/[^0-9.-]/g, "");
  const parts = cleanedValue.split(".");
  if (parts.length > 2) {
    return parts[0] + "." + parts.slice(1).join("");
  }
  return cleanedValue;
};
