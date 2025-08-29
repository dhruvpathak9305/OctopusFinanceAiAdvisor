import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  Alert,
  Vibration,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../contexts/ThemeContext";
import { useDemoMode } from "../../../contexts/DemoModeContext";
import { addCreditCard, CreditCard } from "../../../services/creditCardService";

// Import modular components
import { FormSection, ActionButtons, ModalManager } from "./components";
import { useCreditCardForm } from "./hooks/useCreditCardForm";
import { useFormValidation } from "./hooks/useFormValidation";
import {
  BILLING_CYCLES,
  BASE_INSTITUTIONS,
  MOCK_CREDIT_CARD_DATA,
} from "./constants";
import { createStyles } from "./styles";

interface AddCreditCardModalProps {
  visible: boolean;
  onClose: () => void;
  onCreditCardAdded: (creditCard: CreditCard) => void;
}

export const AddCreditCardModal: React.FC<AddCreditCardModalProps> = ({
  visible,
  onClose,
  onCreditCardAdded,
}) => {
  const { isDark } = useTheme();
  const { isDemo } = useDemoMode();

  // Get form data and handlers from custom hook
  const {
    formData,
    updateField,
    resetForm,
    customInstitutions,
    setCustomInstitutions,
    showInstitutionPicker,
    setShowInstitutionPicker,
    showBillingCyclePicker,
    setShowBillingCyclePicker,
    showCustomInstitutionModal,
    setShowCustomInstitutionModal,
    customInstitutionName,
    setCustomInstitutionName,
    showAiExtractionModal,
    setShowAiExtractionModal,
    loading,
    setLoading,
  } = useCreditCardForm(visible);

  const { errors, clearError, clearAllErrors, validateForm } =
    useFormValidation();

  // Additional modal states
  const [showStatementUploadModal, setShowStatementUploadModal] =
    useState(false);

  // Date picker states
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showCustomBillingDatePicker, setShowCustomBillingDatePicker] =
    useState(false);
  const [tempDueDate, setTempDueDate] = useState<Date>(new Date());
  const [tempCustomBillingDate, setTempCustomBillingDate] = useState<Date>(
    new Date()
  );

  // Animation for scan button
  const scanButtonScale = React.useState(new Animated.Value(1))[0];

  const colors = isDark
    ? {
        background: "#1F2937",
        card: "#374151",
        border: "#4B5563",
        text: "#F9FAFB",
        textSecondary: "#D1D5DB",
        primary: "#10B981",
        error: "#EF4444",
      }
    : {
        background: "#FFFFFF",
        card: "#F9FAFB",
        border: "#E5E7EB",
        text: "#111827",
        textSecondary: "#6B7280",
        primary: "#10B981",
        error: "#EF4444",
      };

  const styles = createStyles();
  const allInstitutions = [...BASE_INSTITUTIONS, ...customInstitutions];

  // Utility functions
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatLastFourDigits = (text: string): string => {
    const cleaned = text.replace(/\D/g, "").substring(0, 4);
    return cleaned;
  };

  // Event handlers
  const handleClose = () => {
    resetForm();
    clearAllErrors();
    onClose();
  };

  const handleLogoUpload = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission needed",
          "Please grant permission to access your photo library."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        updateField("logoUri", result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload logo. Please try again.");
    }
  };

  const handleRemoveLogo = () => {
    updateField("logoUri", "");
  };

  const handleScanButtonPress = () => {
    Animated.sequence([
      Animated.timing(scanButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scanButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (Platform.OS === "ios") {
      Vibration.vibrate();
    } else {
      Vibration.vibrate(50);
    }

    setShowAiExtractionModal(true);
  };

  const handleAiExtraction = async (type: "image" | "document" | "sms") => {
    setShowAiExtractionModal(false);

    try {
      if (type === "image") {
        // Handle image extraction
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission needed",
            "Please grant camera roll permissions to extract credit card details from photos."
          );
          return;
        }

        Alert.alert(
          "Select Image Source",
          "Choose how you want to capture the credit card image:",
          [
            {
              text: "Camera",
              onPress: async () => {
                const cameraPermission =
                  await ImagePicker.requestCameraPermissionsAsync();
                if (cameraPermission.status !== "granted") {
                  Alert.alert(
                    "Permission needed",
                    "Camera access is required to take photos."
                  );
                  return;
                }
                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  quality: 0.8,
                  allowsEditing: true,
                });
                processImageResult(result);
              },
            },
            {
              text: "Gallery",
              onPress: async () => {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  quality: 0.8,
                  allowsEditing: true,
                  allowsMultipleSelection: false,
                });
                processImageResult(result);
              },
            },
            { text: "Cancel", style: "cancel" },
          ]
        );
        return;
      } else if (type === "document") {
        setShowStatementUploadModal(true);
        return;
      } else if (type === "sms") {
        handleSmsExtraction();
        return;
      }
    } catch (error) {
      setLoading(false);
      console.error("Error in AI extraction:", error);
      Alert.alert(
        "Error",
        "Failed to extract credit card details. Please try again."
      );
    }
  };

  const processImageResult = (result: any) => {
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setLoading(true);
      setTimeout(() => {
        clearAllErrors();
        const extractedData = {
          name: "Platinum Credit Card",
          institution: "State Bank of India (SBI)",
          lastFourDigits: "1234",
          creditLimit: "150000",
          currentBalance: "32500",
        };
        populateFormData(extractedData);
        setLoading(false);
        Alert.alert("Success", "Credit card image processed successfully!");
      }, 2000);
    }
  };

  const handleSmsExtraction = () => {
    Alert.prompt(
      "SMS Extraction",
      "Paste your SMS text containing credit card details:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Extract",
          onPress: (smsText) => {
            if (smsText && smsText.trim()) {
              setLoading(true);
              setTimeout(() => {
                clearAllErrors();
                let extractedData;
                if (smsText.toLowerCase().includes("hdfc")) {
                  extractedData = {
                    name: "HDFC Regalia Card",
                    institution: "HDFC Bank",
                    lastFourDigits: "6789",
                    creditLimit: "200000",
                    currentBalance: "18500",
                  };
                } else if (smsText.toLowerCase().includes("sbi")) {
                  extractedData = {
                    name: "SBI SimplyCLICK Card",
                    institution: "State Bank of India (SBI)",
                    lastFourDigits: "3456",
                    creditLimit: "100000",
                    currentBalance: "25000",
                  };
                } else {
                  extractedData = MOCK_CREDIT_CARD_DATA;
                }
                populateFormData(extractedData);
                setLoading(false);
                Alert.alert("Success", "SMS text processed successfully!");
              }, 1500);
            } else {
              Alert.alert("Error", "Please enter valid SMS text.");
            }
          },
        },
      ],
      "plain-text",
      "",
      "default"
    );
  };

  const populateFormData = (data: any) => {
    updateField("name", data.name);
    updateField("institution", data.institution);
    updateField("lastFourDigits", data.lastFourDigits);
    updateField("creditLimit", data.creditLimit);
    updateField("currentBalance", data.currentBalance);
  };

  const handleStatementUpload = async (fileType?: string) => {
    setShowStatementUploadModal(false);

    try {
      let allowedTypes: string[] = [];

      switch (fileType) {
        case "pdf":
          allowedTypes = ["application/pdf"];
          break;
        case "excel":
          allowedTypes = [
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ];
          break;
        case "csv":
          allowedTypes = ["text/csv", "text/plain"];
          break;
        case "word":
          allowedTypes = [
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
          ];
          break;
        case "all":
        default:
          allowedTypes = [
            "image/*",
            "application/pdf",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
            "text/csv",
            "text/plain",
          ];
          break;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: allowedTypes,
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setLoading(true);

        setTimeout(() => {
          clearAllErrors();
          let extractedData;
          if (file.mimeType?.includes("pdf")) {
            extractedData = {
              name: "Premium Rewards Card",
              institution: "HDFC Bank",
              lastFourDigits: "4567",
              creditLimit: "250000",
              currentBalance: "45230",
            };
            Alert.alert(
              "Success",
              `PDF statement processed successfully!\nFile: ${file.name}`
            );
          } else if (
            file.mimeType?.includes("excel") ||
            file.mimeType?.includes("spreadsheet")
          ) {
            extractedData = {
              name: "Business Credit Card",
              institution: "ICICI Bank",
              lastFourDigits: "8901",
              creditLimit: "500000",
              currentBalance: "125000",
            };
            Alert.alert(
              "Success",
              `Excel file processed successfully!\nFile: ${file.name}`
            );
          } else if (
            file.mimeType?.includes("word") ||
            file.name?.toLowerCase().includes(".doc")
          ) {
            extractedData = {
              name: "Corporate Credit Card",
              institution: "Axis Bank",
              lastFourDigits: "2468",
              creditLimit: "300000",
              currentBalance: "75000",
            };
            Alert.alert(
              "Success",
              `Word document processed successfully!\nFile: ${file.name}`
            );
          } else if (
            file.mimeType?.includes("csv") ||
            file.name?.toLowerCase().includes(".csv")
          ) {
            extractedData = {
              name: "Travel Rewards Card",
              institution: "Kotak Mahindra Bank",
              lastFourDigits: "1357",
              creditLimit: "400000",
              currentBalance: "89000",
            };
            Alert.alert(
              "Success",
              `CSV file processed successfully!\nFile: ${file.name}`
            );
          } else {
            extractedData = MOCK_CREDIT_CARD_DATA;
            Alert.alert(
              "Success",
              `Document processed successfully!\nFile: ${file.name}`
            );
          }

          populateFormData(extractedData);
          setLoading(false);
        }, 2500);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error in document upload:", error);
      Alert.alert("Error", "Failed to upload document. Please try again.");
    }
  };

  // Date picker handlers
  const handleDueDatePress = () => {
    setTempDueDate(formData.dueDate || new Date());
    setShowDueDatePicker(true);
  };

  const handleDatePickerDone = () => {
    updateField("dueDate", tempDueDate);
    setShowDueDatePicker(false);
  };

  const handleDatePickerCancel = () => {
    setShowDueDatePicker(false);
  };

  const handleDatePickerChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDueDatePicker(false);
      if (selectedDate) {
        updateField("dueDate", selectedDate);
      }
    } else if (selectedDate) {
      setTempDueDate(selectedDate);
    }
  };

  const handleCustomBillingDateDone = () => {
    updateField("billingCycle", formatDate(tempCustomBillingDate));
    setShowCustomBillingDatePicker(false);
  };

  const handleCustomBillingDateCancel = () => {
    setShowCustomBillingDatePicker(false);
  };

  const handleCustomBillingDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowCustomBillingDatePicker(false);
      if (selectedDate) {
        updateField("billingCycle", formatDate(selectedDate));
      }
    } else if (selectedDate) {
      setTempCustomBillingDate(selectedDate);
    }
  };

  // Institution and billing cycle handlers
  const handleInstitutionSelect = (institution: string) => {
    updateField("institution", institution);
    clearError("institution");
    setShowInstitutionPicker(false);
  };

  const handleBillingCycleSelect = (cycle: string) => {
    updateField("billingCycle", cycle);
    setShowBillingCyclePicker(false);
  };

  const handleCustomBillingSelect = () => {
    setShowBillingCyclePicker(false);
    setTempCustomBillingDate(new Date());
    setShowCustomBillingDatePicker(true);
  };

  const handleSaveCustomInstitution = () => {
    if (customInstitutionName.trim()) {
      const newInstitutions = [
        ...customInstitutions,
        customInstitutionName.trim(),
      ];
      setCustomInstitutions(newInstitutions);
      updateField("institution", customInstitutionName.trim());
      clearError("institution");
      setCustomInstitutionName("");
      setShowCustomInstitutionModal(false);
    }
  };

  const handleSave = async () => {
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      const creditCardData: Omit<CreditCard, "id"> = {
        name: formData.name,
        institution: formData.institution,
        logoUrl: formData.logoUri || null,
        lastFourDigits: formData.lastFourDigits,
        creditLimit: parseFloat(formData.creditLimit),
        currentBalance: parseFloat(formData.currentBalance),
        dueDate: formData.dueDate ? formatDate(formData.dueDate) : null,
        billingCycle: formData.billingCycle || null,
      };

      const result = await addCreditCard(creditCardData, isDemo);
      onCreditCardAdded(result);
      Alert.alert("Success", "Credit card added successfully!");
      handleClose();
    } catch (error) {
      Alert.alert("Error", "Failed to add credit card. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <TouchableWithoutFeedback onPress={() => {}}>
        <View style={styles.overlay}>
          <View
            style={[styles.container, { backgroundColor: colors.background }]}
          >
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Add Credit Card
              </Text>
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleScanButtonPress}
              >
                <Ionicons name="scan" size={18} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              <FormSection
                formData={formData}
                updateField={updateField}
                errors={errors}
                clearError={clearError}
                handleLogoUpload={handleLogoUpload}
                handleRemoveLogo={handleRemoveLogo}
                formatLastFourDigits={formatLastFourDigits}
                formatDate={formatDate}
                onInstitutionPress={() => setShowInstitutionPicker(true)}
                onCustomInstitutionPress={() =>
                  setShowCustomInstitutionModal(true)
                }
                onBillingCyclePress={() => setShowBillingCyclePicker(true)}
                onDueDatePress={handleDueDatePress}
                allInstitutions={allInstitutions}
                billingCycles={BILLING_CYCLES}
                colors={colors}
                styles={styles}
              />
            </ScrollView>

            <ActionButtons
              onScanPress={handleScanButtonPress}
              onSave={handleSave}
              scanButtonScale={scanButtonScale}
              colors={colors}
              styles={styles}
            />

            <ModalManager
              showAiExtractionModal={showAiExtractionModal}
              onCloseAiExtraction={() => setShowAiExtractionModal(false)}
              onAiExtract={handleAiExtraction}
              aiLoading={loading}
              showStatementUploadModal={showStatementUploadModal}
              onCloseStatementUpload={() => setShowStatementUploadModal(false)}
              onStatementUpload={handleStatementUpload}
              showInstitutionPicker={showInstitutionPicker}
              onCloseInstitutionPicker={() => setShowInstitutionPicker(false)}
              onSelectInstitution={handleInstitutionSelect}
              allInstitutions={allInstitutions}
              showBillingCyclePicker={showBillingCyclePicker}
              onCloseBillingCycle={() => setShowBillingCyclePicker(false)}
              onSelectBillingCycle={handleBillingCycleSelect}
              onSelectCustomBilling={handleCustomBillingSelect}
              billingCycles={BILLING_CYCLES}
              showCustomInstitutionModal={showCustomInstitutionModal}
              onCloseCustomInstitution={() =>
                setShowCustomInstitutionModal(false)
              }
              onSaveCustomInstitution={handleSaveCustomInstitution}
              customInstitutionName={customInstitutionName}
              onChangeCustomInstitution={setCustomInstitutionName}
              showDueDatePicker={showDueDatePicker}
              onCloseDueDatePicker={() => setShowDueDatePicker(false)}
              onConfirmDueDate={handleDatePickerDone}
              onCancelDueDate={handleDatePickerCancel}
              tempDueDate={tempDueDate}
              onDueDateChange={handleDatePickerChange}
              showCustomBillingDatePicker={showCustomBillingDatePicker}
              onCloseCustomBillingDate={() =>
                setShowCustomBillingDatePicker(false)
              }
              onConfirmCustomBillingDate={handleCustomBillingDateDone}
              onCancelCustomBillingDate={handleCustomBillingDateCancel}
              tempCustomBillingDate={tempCustomBillingDate}
              onCustomBillingDateChange={handleCustomBillingDateChange}
              loading={loading}
              colors={colors}
              styles={styles}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
