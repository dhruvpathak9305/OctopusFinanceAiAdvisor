import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Vibration,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useDemoMode } from "../../../../contexts/DemoModeContext";
import {
  addCreditCard,
  CreditCard,
} from "../../../../services/creditCardService";

// Import our new components
import {
  FormField,
  SelectField,
  DatePicker,
  LogoUpload,
  CreditUtilization,
  AiExtractionModal,
  StatementUploadModal,
} from "./components";
import { useCreditCardForm } from "./hooks/useCreditCardForm";
import { useFormValidation } from "./hooks/useFormValidation";
import {
  BILLING_CYCLES,
  BASE_INSTITUTIONS,
  MOCK_CREDIT_CARD_DATA,
} from "./constants";
import { CreditCardFormData } from "./types";

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

  // Custom hooks
  const {
    formData,
    updateField,
    resetForm,
    customBillingDate,
    setCustomBillingDate,
    customInstitutions,
    setCustomInstitutions,
    newCustomInstitution,
    setNewCustomInstitution,
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
  } = useCreditCardForm(visible);

  const { errors, clearError, clearAllErrors, validateForm } =
    useFormValidation();

  // Additional modal states
  const [showStatementUploadModal, setShowStatementUploadModal] =
    useState(false);

  // Animation for scan button
  const scanButtonScale = React.useState(new Animated.Value(1))[0];

  const colors = isDark
    ? {
        background: "#1F2937",
        card: "#374151",
        text: "#FFFFFF",
        textSecondary: "#9CA3AF",
        border: "#4B5563",
        primary: "#10B981",
        success: "#10B981",
        danger: "#EF4444",
        accent: "#F59E0B",
      }
    : {
        background: "#FFFFFF",
        card: "#FFFFFF",
        text: "#111827",
        textSecondary: "#6B7280",
        border: "#E5E7EB",
        primary: "#10B981",
        success: "#10B981",
        danger: "#EF4444",
        accent: "#F59E0B",
      };

  const allInstitutions = [...BASE_INSTITUTIONS, ...customInstitutions];

  // Utility functions
  const formatDate = (date: Date): string => {
    if (!date) return "Select due date";
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
          "Permission Required",
          "Please allow access to your photos to upload a logo."
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
        updateField("logoUri", result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleRemoveLogo = () => {
    updateField("logoUri", null);
  };

  const handleScanButtonPress = () => {
    // Animate button
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

    // Haptic feedback
    Vibration.vibrate(50);
    setShowAiExtractionModal(true);
  };

  const handleAiExtraction = async (type: "image" | "document" | "sms") => {
    setShowAiExtractionModal(false);

    try {
      let result;
      let extractedData;

      if (type === "image") {
        // Handle photo/image extraction
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission needed",
            "Please grant camera roll permissions to extract credit card details from photos."
          );
          return;
        }

        // Show options for camera or gallery
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
                result = await ImagePicker.launchCameraAsync({
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
                result = await ImagePicker.launchImageLibraryAsync({
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
        // Open the Statement Upload Modal
        setShowStatementUploadModal(true);
        return;
      } else if (type === "sms") {
        // Handle SMS text extraction
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

      // Simulate AI processing of the image
      setTimeout(() => {
        clearAllErrors();

        // Different mock data based on image processing
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
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Extract",
          onPress: (smsText) => {
            if (smsText && smsText.trim()) {
              setLoading(true);

              // Simulate SMS text processing
              setTimeout(() => {
                clearAllErrors();

                // Extract data from SMS text (simulation)
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
      // Define file types based on the selected option
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

        // Simulate document processing based on file type
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

  const [tempDueDate, setTempDueDate] = useState<Date>(new Date());
  const [tempCustomBillingDate, setTempCustomBillingDate] = useState<Date>(
    new Date()
  );

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      // On Android, update immediately and close
      if (selectedDate) {
        updateField("dueDate", selectedDate);
      }
      setShowDatePicker(false);
    } else {
      // On iOS, just store temporarily
      if (selectedDate) {
        setTempDueDate(selectedDate);
      }
    }
  };

  const handleDatePickerDone = () => {
    updateField("dueDate", tempDueDate);
    setShowDatePicker(false);
  };

  const handleDatePickerCancel = () => {
    setTempDueDate(formData.dueDate);
    setShowDatePicker(false);
  };

  const handleDatePickerOpen = () => {
    setTempDueDate(formData.dueDate);
    setShowDatePicker(true);
  };

  const handleCustomBillingDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      // On Android, update immediately and close
      if (selectedDate) {
        setCustomBillingDate(selectedDate);
        const day = selectedDate.getDate();
        let dayText = `${day}`;
        if (day === 1 || day === 21 || day === 31) dayText += "st";
        else if (day === 2 || day === 22) dayText += "nd";
        else if (day === 3 || day === 23) dayText += "rd";
        else dayText += "th";
        updateField("billingCycle", `${dayText} of month`);
      }
      setShowCustomBillingDatePicker(false);
    } else {
      // On iOS, just store temporarily
      if (selectedDate) {
        setTempCustomBillingDate(selectedDate);
      }
    }
  };

  const handleCustomBillingDateDone = () => {
    setCustomBillingDate(tempCustomBillingDate);
    const day = tempCustomBillingDate.getDate();
    let dayText = `${day}`;
    if (day === 1 || day === 21 || day === 31) dayText += "st";
    else if (day === 2 || day === 22) dayText += "nd";
    else if (day === 3 || day === 23) dayText += "rd";
    else dayText += "th";
    updateField("billingCycle", `${dayText} of month`);
    setShowCustomBillingDatePicker(false);
  };

  const handleCustomBillingDateCancel = () => {
    setTempCustomBillingDate(customBillingDate);
    setShowCustomBillingDatePicker(false);
  };

  const handleCustomBillingDateOpen = () => {
    setTempCustomBillingDate(customBillingDate);
    setShowCustomBillingDatePicker(true);
  };

  const handleBillingCycleSelection = (cycle: string) => {
    if (cycle === "Custom") {
      setShowBillingCyclePicker(false);
      handleCustomBillingDateOpen();
    } else {
      updateField("billingCycle", cycle);
      setShowBillingCyclePicker(false);
    }
  };

  const handleAddCustomInstitution = () => {
    setShowCustomInstitutionModal(true);
  };

  const saveCustomInstitution = () => {
    if (newCustomInstitution.trim()) {
      setCustomInstitutions((prev) => [...prev, newCustomInstitution.trim()]);
      updateField("institution", newCustomInstitution.trim());
      setNewCustomInstitution("");
      setShowCustomInstitutionModal(false);
    }
  };

  const handleSave = async () => {
    clearAllErrors();

    if (!validateForm(formData)) {
      return;
    }

    setLoading(true);
    try {
      const newCreditCard: Omit<CreditCard, "id"> = {
        name: formData.name.trim(),
        institution: formData.institution.trim(),
        lastFourDigits: Number(formData.lastFourDigits),
        creditLimit: parseFloat(formData.creditLimit),
        currentBalance: parseFloat(formData.currentBalance),
        logoUrl: formData.logoUri,
        dueDate: formData.dueDate.toISOString().split("T")[0],
        billingCycle: formData.billingCycle,
      };

      const createdCreditCard = await addCreditCard(newCreditCard, isDemo);
      onCreditCardAdded(createdCreditCard);
      Alert.alert("Success", "Credit card added successfully!");
    } catch (error) {
      console.error("Error adding credit card:", error);
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Add Credit Card
          </Text>
          <Animated.View style={{ transform: [{ scale: scanButtonScale }] }}>
            <TouchableOpacity
              onPress={handleScanButtonPress}
              style={[styles.scanButton, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="scan" size={18} color="white" />
            </TouchableOpacity>
          </Animated.View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Card Name */}
          <FormField
            label="Card Name"
            value={formData.name}
            onChangeText={(text) => {
              updateField("name", text);
              if (errors.name) clearError("name");
            }}
            placeholder="My Rewards Card"
            required
            error={errors.name}
            maxLength={50}
            colors={colors}
            styles={styles}
          />

          {/* Card Issuer and Last 4 Digits Row */}
          <View style={styles.rowContainer}>
            <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
              <SelectField
                label="Card Issuer"
                value={formData.institution}
                onPress={() => setShowInstitutionPicker(true)}
                placeholder="Select issuer"
                required
                error={errors.institution}
                showAddButton
                onAddPress={handleAddCustomInstitution}
                colors={colors}
                styles={styles}
              />
            </View>

            <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
              <View style={styles.labelWithAction}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  Last 4 Digits <Text style={styles.required}>*</Text>
                </Text>
                <View style={{ width: 20 }} />
              </View>
              <View
                style={[
                  styles.cardNumberContainer,
                  {
                    backgroundColor: colors.card,
                    borderColor: errors.lastFourDigits
                      ? colors.danger
                      : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cardNumberPrefix,
                    { color: colors.textSecondary },
                  ]}
                >
                  ••••
                </Text>
                <TextInput
                  style={[styles.cardNumberInput, { color: colors.text }]}
                  value={formData.lastFourDigits}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9]/g, "");
                    updateField("lastFourDigits", numericValue);
                    if (errors.lastFourDigits) clearError("lastFourDigits");
                  }}
                  placeholder="1234"
                  placeholderTextColor={colors.textSecondary}
                  maxLength={4}
                  keyboardType="number-pad"
                />
              </View>
              {errors.lastFourDigits ? (
                <Text style={[styles.errorText, { color: colors.danger }]}>
                  {errors.lastFourDigits}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Credit Limit and Current Balance */}
          <View style={styles.rowContainer}>
            <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Credit Limit <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.amountContainer,
                  {
                    backgroundColor: colors.card,
                    borderColor: errors.creditLimit
                      ? colors.danger
                      : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.currencySymbol,
                    { color: colors.textSecondary },
                  ]}
                >
                  ₹
                </Text>
                <TextInput
                  style={[styles.amountInput, { color: colors.text }]}
                  value={formData.creditLimit}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9.]/g, "");
                    const parts = numericValue.split(".");
                    if (parts.length > 2) {
                      updateField(
                        "creditLimit",
                        parts[0] + "." + parts.slice(1).join("")
                      );
                    } else {
                      updateField("creditLimit", numericValue);
                    }
                    if (errors.creditLimit) clearError("creditLimit");
                  }}
                  placeholder="5000"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>
              {errors.creditLimit ? (
                <Text style={[styles.errorText, { color: colors.danger }]}>
                  {errors.creditLimit}
                </Text>
              ) : null}
            </View>

            <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Current Balance <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.amountContainer,
                  {
                    backgroundColor: colors.card,
                    borderColor: errors.currentBalance
                      ? colors.danger
                      : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.currencySymbol,
                    { color: colors.textSecondary },
                  ]}
                >
                  ₹
                </Text>
                <TextInput
                  style={[styles.amountInput, { color: colors.text }]}
                  value={formData.currentBalance}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9.]/g, "");
                    const parts = numericValue.split(".");
                    if (parts.length > 2) {
                      updateField(
                        "currentBalance",
                        parts[0] + "." + parts.slice(1).join("")
                      );
                    } else {
                      updateField("currentBalance", numericValue);
                    }
                    if (errors.currentBalance) clearError("currentBalance");
                  }}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>
              {errors.currentBalance ? (
                <Text style={[styles.errorText, { color: colors.danger }]}>
                  {errors.currentBalance}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Due Date and Billing Cycle Row */}
          <View style={styles.rowContainer}>
            <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
              <View style={styles.labelWithAction}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  Due Date <Text style={styles.required}>*</Text>
                </Text>
                <View style={{ width: 20 }} />
              </View>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={handleDatePickerOpen}
              >
                <Ionicons
                  name="calendar"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {formatDate(formData.dueDate)}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
              <SelectField
                label="Billing Cycle"
                value={formData.billingCycle}
                onPress={() => setShowBillingCyclePicker(true)}
                placeholder="Select cycle"
                colors={colors}
                styles={styles}
              />
            </View>
          </View>

          {/* Logo Upload */}
          <LogoUpload
            logoUri={formData.logoUri}
            onUpload={handleLogoUpload}
            onRemove={handleRemoveLogo}
            colors={colors}
            styles={styles}
          />

          {/* Credit Utilization */}
          <CreditUtilization
            currentBalance={formData.currentBalance}
            creditLimit={formData.creditLimit}
            colors={colors}
            styles={styles}
          />

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={handleClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? "Adding..." : "Add Credit Card"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Due Date Picker */}
        {showDatePicker && Platform.OS === "ios" && (
          <Modal visible={showDatePicker} transparent animationType="slide">
            <View style={styles.datePickerOverlay}>
              <View
                style={[
                  styles.datePickerContainer,
                  {
                    backgroundColor: colors.background,
                    width: "100%",
                    marginHorizontal: 0,
                  },
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
                  <TouchableOpacity onPress={handleDatePickerCancel}>
                    <Text
                      style={[
                        styles.datePickerButton,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDatePickerDone}>
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
                  value={tempDueDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, date) => {
                    if (date) setTempDueDate(date);
                  }}
                  minimumDate={new Date()}
                  textColor={colors.text}
                  accentColor={colors.primary}
                  style={[
                    styles.datePicker,
                    {
                      backgroundColor: colors.background,
                      width: "100%",
                      height: 200,
                    },
                  ]}
                />
              </View>
            </View>
          </Modal>
        )}

        {/* Android Due Date Picker */}
        {showDatePicker && Platform.OS === "android" && (
          <DateTimePicker
            value={formData.dueDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {/* Custom Billing Date Picker */}
        {showCustomBillingDatePicker && Platform.OS === "ios" && (
          <Modal
            visible={showCustomBillingDatePicker}
            transparent
            animationType="slide"
          >
            <View style={styles.datePickerOverlay}>
              <View
                style={[
                  styles.datePickerContainer,
                  {
                    backgroundColor: colors.background,
                    width: "100%",
                    marginHorizontal: 0,
                  },
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
                  <TouchableOpacity onPress={handleCustomBillingDateCancel}>
                    <Text
                      style={[
                        styles.datePickerButton,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCustomBillingDateDone}>
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
                  value={tempCustomBillingDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, date) => {
                    if (date) setTempCustomBillingDate(date);
                  }}
                  textColor={colors.text}
                  accentColor={colors.primary}
                  style={[
                    styles.datePicker,
                    {
                      backgroundColor: colors.background,
                      width: "100%",
                      height: 200,
                    },
                  ]}
                />
              </View>
            </View>
          </Modal>
        )}

        {/* Android Custom Billing Date Picker */}
        {showCustomBillingDatePicker && Platform.OS === "android" && (
          <DateTimePicker
            value={customBillingDate}
            mode="date"
            display="default"
            onChange={handleCustomBillingDateChange}
          />
        )}

        {/* AI Extraction Modal */}
        <AiExtractionModal
          visible={showAiExtractionModal}
          onClose={() => setShowAiExtractionModal(false)}
          onExtract={handleAiExtraction}
          loading={loading}
          colors={colors}
          styles={styles}
        />

        {/* Statement Upload Modal */}
        <StatementUploadModal
          visible={showStatementUploadModal}
          onClose={() => setShowStatementUploadModal(false)}
          onUpload={handleStatementUpload}
          colors={colors}
          styles={styles}
        />

        {/* Institution Picker Modal */}
        <Modal
          visible={showInstitutionPicker}
          transparent
          animationType="slide"
        >
          <TouchableWithoutFeedback
            onPress={() => setShowInstitutionPicker(false)}
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
                      onPress={() => setShowInstitutionPicker(false)}
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
                    <TouchableOpacity
                      onPress={() => setShowInstitutionPicker(false)}
                    >
                      <Text
                        style={[styles.pickerButton, { color: colors.primary }]}
                      >
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.pickerContent}>
                    {allInstitutions.map((provider, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.pickerItem,
                          { borderBottomColor: colors.border },
                        ]}
                        onPress={() => {
                          updateField("institution", provider);
                          setShowInstitutionPicker(false);
                          if (errors.institution) clearError("institution");
                        }}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            { color: colors.text },
                          ]}
                        >
                          {provider}
                        </Text>
                        {formData.institution === provider && (
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

        {/* Billing Cycle Picker Modal */}
        <Modal
          visible={showBillingCyclePicker}
          transparent
          animationType="slide"
        >
          <TouchableWithoutFeedback
            onPress={() => setShowBillingCyclePicker(false)}
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
                      onPress={() => setShowBillingCyclePicker(false)}
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
                    <TouchableOpacity
                      onPress={() => setShowBillingCyclePicker(false)}
                    >
                      <Text
                        style={[styles.pickerButton, { color: colors.primary }]}
                      >
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.pickerContent}>
                    {BILLING_CYCLES.map((cycle, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.pickerItem,
                          { borderBottomColor: colors.border },
                        ]}
                        onPress={() => handleBillingCycleSelection(cycle)}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            { color: colors.text },
                          ]}
                        >
                          {cycle}
                        </Text>
                        {formData.billingCycle === cycle && (
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

        {/* Custom Institution Modal */}
        <Modal
          visible={showCustomInstitutionModal}
          transparent
          animationType="slide"
        >
          <TouchableWithoutFeedback
            onPress={() => setShowCustomInstitutionModal(false)}
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
                      onPress={() => {
                        setShowCustomInstitutionModal(false);
                        setNewCustomInstitution("");
                      }}
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
                    <TouchableOpacity onPress={saveCustomInstitution}>
                      <Text
                        style={[styles.pickerButton, { color: colors.primary }]}
                      >
                        Save
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.customInputContainer}>
                    <FormField
                      label="Institution Name"
                      value={newCustomInstitution}
                      onChangeText={setNewCustomInstitution}
                      placeholder="Enter institution name"
                      colors={colors}
                      styles={styles}
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <View
              style={[
                styles.loadingContainer,
                { backgroundColor: colors.background },
              ]}
            >
              <Text style={[styles.loadingText, { color: colors.text }]}>
                Processing AI extraction...
              </Text>
              <Text
                style={[styles.loadingSubtext, { color: colors.textSecondary }]}
              >
                Please wait while we analyze your data
              </Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  fieldContainer: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  required: {
    color: "#EF4444",
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 38,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cardNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 38,
    height: 38,
  },
  cardNumberPrefix: {
    fontSize: 14,
    fontWeight: "500",
    textAlignVertical: "center",
  },
  cardNumberInput: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
    minWidth: 50,
    padding: 0,
    textAlign: "left",
    textAlignVertical: "center",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 38,
    height: 38,
  },
  currencySymbol: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
    textAlign: "left",
    textAlignVertical: "center",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    minHeight: 38,
    height: 38,
  },
  dateText: {
    fontSize: 14,
    flex: 1,
  },
  utilizationContainer: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  utilizationTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  utilizationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  utilizationPercentage: {
    fontSize: 18,
    fontWeight: "700",
  },
  utilizationAmount: {
    fontSize: 14,
    fontWeight: "500",
  },
  utilizationBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  utilizationFill: {
    height: "100%",
    borderRadius: 3,
  },
  headerButton: {
    padding: 4,
  },
  scanButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  labelWithAction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    minHeight: 20,
  },
  addButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  selectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 38,
    height: 38,
  },
  selectText: {
    fontSize: 14,
    flex: 1,
  },
  logoUploadButton: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  logoUploadText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  logoUploadSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  logoPreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  logoActions: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  logoButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    paddingBottom: 24,
    marginTop: 6,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    minHeight: 44,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  saveButton: {
    flex: 2,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    minHeight: 44,
  },
  saveButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  aiModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  aiModalContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "85%",
    minHeight: "60%",
    width: "100%",
    paddingBottom: 20,
  },
  aiModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  aiModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  aiModalContent: {
    padding: 20,
  },
  aiModalSubtitle: {
    fontSize: 14,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 30,
    textAlign: "center",
  },
  aiGridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    gap: 12,
  },
  aiGridOption: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    minHeight: 90,
    justifyContent: "center",
  },
  aiGridTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
  },
  aiGridSubtitle: {
    fontSize: 10,
    marginTop: 2,
    textAlign: "center",
  },
  // Picker Modal Styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  pickerContainer: {
    maxHeight: "70%",
    minHeight: 250,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
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
  customInputContainer: {
    padding: 20,
    minHeight: 120,
  },
  // Date Picker Modal Styles
  datePickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  datePickerContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "50%",
    minHeight: 250,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  datePickerButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  datePicker: {
    width: "100%",
    height: 200,
  },
  // Loading Overlay Styles
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingContainer: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  loadingSubtext: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  // Statement Upload Modal Styles
  statementModalContainer: {
    flex: 1,
    paddingTop: 50,
  },
  statementModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  statementModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  statementModalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  uploadIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
  },
  uploadSubtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  quickOptionsContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  quickOptionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  fileTypesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  fileTypeItem: {
    alignItems: "center",
    flex: 1,
  },
  fileTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  fileTypeLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  tipsContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  tipsList: {
    marginLeft: 24,
  },
  tipItem: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 2,
  },
});
