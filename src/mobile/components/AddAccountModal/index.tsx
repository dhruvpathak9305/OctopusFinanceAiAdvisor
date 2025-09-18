import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
  Animated,
  Vibration,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useDemoMode } from "../../../../contexts/DemoModeContext";
import { addAccount } from "../../../../services/accountsService";
import { Account } from "../../../../contexts/AccountsContext";

interface AddAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onAccountAdded: (account: Account) => void;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({
  visible,
  onClose,
  onAccountAdded,
}) => {
  const { isDark } = useTheme();
  const { isDemo } = useDemoMode();

  const [name, setName] = useState("");
  const [type, setType] = useState("savings");
  const [balance, setBalance] = useState("0");
  const [institution, setInstitution] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showInstitutionPicker, setShowInstitutionPicker] = useState(false);
  const [showAiExtractionModal, setShowAiExtractionModal] = useState(false);

  // Animation for scan button
  const scanButtonScale = useState(new Animated.Value(1))[0];

  // Logo upload functionality
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
        setLogoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleRemoveLogo = () => {
    setLogoUri(null);
  };

  // Custom types and institutions state
  const [customAccountTypes, setCustomAccountTypes] = useState<
    Array<{ id: string; label: string; icon: string }>
  >([]);
  const [customInstitutions, setCustomInstitutions] = useState<string[]>([]);
  const [showCustomTypeModal, setShowCustomTypeModal] = useState(false);
  const [showCustomInstitutionModal, setShowCustomInstitutionModal] =
    useState(false);
  const [newCustomType, setNewCustomType] = useState("");
  const [newCustomInstitution, setNewCustomInstitution] = useState("");

  // Handle plus icon actions
  const handleAddCustomType = () => {
    setShowCustomTypeModal(true);
  };

  const handleAddCustomInstitution = () => {
    setShowCustomInstitutionModal(true);
  };

  const saveCustomType = () => {
    if (newCustomType.trim()) {
      const newType = {
        id: newCustomType.toLowerCase().replace(/\s+/g, "_"),
        label: newCustomType.trim(),
        icon: "wallet-outline",
      };
      setCustomAccountTypes((prev) => [...prev, newType]);
      setType(newType.id);
      setNewCustomType("");
      setShowCustomTypeModal(false);
    }
  };

  const saveCustomInstitution = () => {
    if (newCustomInstitution.trim()) {
      const institutionName = newCustomInstitution.trim();
      setCustomInstitutions((prev) => [...prev, institutionName]);
      setInstitution(institutionName);
      setNewCustomInstitution("");
      setShowCustomInstitutionModal(false);
    }
  };

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
        danger: "#EF4444",
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
        danger: "#EF4444",
      };

  const baseAccountTypes = [
    { id: "savings", label: "Savings Account", icon: "wallet-outline" },
    { id: "current", label: "Current Account", icon: "card-outline" },
    {
      id: "fixed_deposit",
      label: "Fixed Deposit",
      icon: "lock-closed-outline",
    },
    {
      id: "recurring_deposit",
      label: "Recurring Deposit",
      icon: "refresh-outline",
    },
    { id: "nri_account", label: "NRI Account", icon: "globe-outline" },
    { id: "joint_account", label: "Joint Account", icon: "people-outline" },
    { id: "business", label: "Business Account", icon: "business-outline" },
    { id: "other", label: "Other", icon: "ellipse-outline" },
  ];

  const accountTypes = [...baseAccountTypes, ...customAccountTypes];

  const baseInstitutions = [
    // Public Sector Banks
    "State Bank of India (SBI)",
    "Punjab National Bank (PNB)",
    "Bank of Baroda (BoB)",
    "Canara Bank",
    "Union Bank of India",
    "Indian Bank",
    "Bank of India",
    "Central Bank of India",
    "Indian Overseas Bank",
    "UCO Bank",
    "Bank of Maharashtra",
    "Punjab & Sind Bank",
    // Private Sector Banks
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Kotak Mahindra Bank",
    "IndusInd Bank",
    "Yes Bank",
    "IDFC FIRST Bank",
    "Federal Bank",
    "South Indian Bank",
    "RBL Bank",
    "Bandhan Bank",
    "DCB Bank",
    "City Union Bank",
    "Jammu & Kashmir Bank",
    "Karur Vysya Bank",
    "Karnataka Bank",
    "Tamilnad Mercantile Bank",
    // Foreign Banks
    "Standard Chartered Bank",
    "HSBC",
    "Deutsche Bank",
    "Citibank",
    "DBS Bank",
    "Other",
  ];

  const allInstitutions = [...baseInstitutions, ...customInstitutions];

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter an account name");
      return;
    }

    if (!institution.trim()) {
      Alert.alert("Error", "Please enter the financial institution");
      return;
    }

    if (!balance.trim() || isNaN(parseFloat(balance))) {
      Alert.alert("Error", "Please enter a valid balance");
      return;
    }

    setLoading(true);
    try {
      const newAccount: Account = {
        id: "temp-" + Date.now(), // Temporary ID that will be replaced by the service
        name: name.trim(),
        type,
        balance: parseFloat(balance),
        institution: institution.trim(),
        account_number: accountNumber.trim() || undefined,
        logo_url: logoUri || undefined,
      };

      const createdAccount = await addAccount(newAccount, isDemo);

      // Call the callback first, then show success message
      onAccountAdded(createdAccount);

      // Note: Don't call handleClose() here as the parent component handles modal closing
      Alert.alert("Success", "Bank account added successfully!");
    } catch (error) {
      console.error("Error creating account:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to add bank account. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset all form fields
    setName("");
    setType("savings");
    setBalance("0");
    setInstitution("");
    setAccountNumber("");
    setLogoUri(null);

    // Reset custom input fields
    setNewCustomType("");
    setNewCustomInstitution("");

    // Close all modals
    setShowTypePicker(false);
    setShowInstitutionPicker(false);
    setShowAiExtractionModal(false);
    setShowCustomTypeModal(false);
    setShowCustomInstitutionModal(false);

    // Reset loading state
    setLoading(false);

    onClose();
  };

  const handleAiExtraction = async (type: "image" | "document" | "sms") => {
    setShowAiExtractionModal(false);
    setLoading(true);

    // Simulate AI processing - replace with actual AI integration
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

      Alert.alert("Success", "Account details extracted successfully!");
    }, 2000);
  };

  const handleScanButtonPress = () => {
    // Button animation
    Animated.sequence([
      Animated.spring(scanButtonScale, {
        toValue: 0.9,
        useNativeDriver: true,
      }),
      Animated.spring(scanButtonScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    // Haptic feedback
    Vibration.vibrate(50);

    // Open modal
    setShowAiExtractionModal(true);
  };

  const formatAccountNumber = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, "");
    // Limit to 17 digits (typical max for account numbers)
    const limited = cleaned.substring(0, 17);
    // Add spaces every 4 digits for readability
    return limited.replace(/(\d{4})/g, "$1 ").trim();
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
            Add Bank Account
          </Text>
          <Animated.View style={{ transform: [{ scale: scanButtonScale }] }}>
            <TouchableOpacity
              onPress={handleScanButtonPress}
              style={[styles.scanButton, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="scan-outline" size={20} color="white" />
            </TouchableOpacity>
          </Animated.View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Account Name */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Account Name <Text style={{ color: colors.danger }}>*</Text>
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
              placeholder="My Checking Account"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              maxLength={50}
            />
          </View>

          {/* Account Type and Institution Row */}
          <View style={styles.rowContainer}>
            <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
              <View style={styles.labelWithAction}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  Account Type
                </Text>
                <TouchableOpacity
                  onPress={handleAddCustomType}
                  style={[styles.addButton, { borderColor: colors.primary }]}
                >
                  <Ionicons name="add" size={12} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => setShowTypePicker(true)}
              >
                <View style={styles.selectContent}>
                  <Ionicons
                    name={accountTypes.find((t) => t.id === type)?.icon as any}
                    size={14}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[styles.selectText, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {accountTypes.find((t) => t.id === type)?.label ||
                      "Select type"}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-down"
                  size={14}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
              <View style={styles.labelWithAction}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  Institution <Text style={{ color: colors.danger }}>*</Text>
                </Text>
                <TouchableOpacity
                  onPress={handleAddCustomInstitution}
                  style={[styles.addButton, { borderColor: colors.primary }]}
                >
                  <Ionicons name="add" size={12} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => setShowInstitutionPicker(true)}
              >
                <Text
                  style={[
                    styles.selectText,
                    { color: institution ? colors.text : colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {institution || "Select bank"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={14}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Opening Balance */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Opening Balance <Text style={{ color: colors.danger }}>*</Text>
            </Text>
            <View
              style={[
                styles.amountContainer,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text
                style={[styles.currencySymbol, { color: colors.textSecondary }]}
              >
                $
              </Text>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                value={balance}
                onChangeText={(text) => {
                  // Allow negative balances for checking accounts
                  const cleanedValue = text.replace(/[^0-9.-]/g, "");
                  const parts = cleanedValue.split(".");
                  if (parts.length > 2) {
                    setBalance(parts[0] + "." + parts.slice(1).join(""));
                  } else {
                    setBalance(cleanedValue);
                  }
                }}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Account Details Section */}
          <View
            style={[
              styles.sectionContainer,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Account Details (Optional)
            </Text>
            <Text
              style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
            >
              This information is encrypted and stored securely
            </Text>

            {/* Account Number */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Account Number
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="••••••••••••1234"
                placeholderTextColor={colors.textSecondary}
                value={accountNumber}
                onChangeText={(text) =>
                  setAccountNumber(formatAccountNumber(text))
                }
                keyboardType="numeric"
                secureTextEntry
                maxLength={20}
              />
            </View>

            {/* Bank Logo Upload */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Bank Logo (Optional)
              </Text>
              <TouchableOpacity
                style={[
                  styles.logoUploadButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={handleLogoUpload}
              >
                {logoUri ? (
                  <View style={styles.logoPreviewContainer}>
                    <Image
                      source={{ uri: logoUri }}
                      style={styles.logoPreview}
                    />
                    <View style={styles.logoActions}>
                      <Text
                        style={[styles.logoSuccessText, { color: colors.text }]}
                      >
                        Logo uploaded
                      </Text>
                      <TouchableOpacity
                        onPress={handleRemoveLogo}
                        style={styles.removeLogo}
                      >
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color={colors.danger}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.logoUploadContent}>
                    <Ionicons
                      name="image-outline"
                      size={24}
                      color={colors.primary}
                    />
                    <Text
                      style={[styles.logoUploadText, { color: colors.text }]}
                    >
                      Upload Bank Logo
                    </Text>
                    <Text
                      style={[
                        styles.logoUploadSubtext,
                        { color: colors.textSecondary },
                      ]}
                    >
                      JPG, PNG, WEBP (Max 5MB)
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

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
                {loading ? "Adding..." : "Add Account"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Account Type Picker Modal */}
        <Modal visible={showTypePicker} transparent animationType="slide">
          <TouchableWithoutFeedback onPress={() => setShowTypePicker(false)}>
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
                    <TouchableOpacity onPress={() => setShowTypePicker(false)}>
                      <Text
                        style={[
                          styles.pickerButton,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <Text style={[styles.pickerTitle, { color: colors.text }]}>
                      Select Account Type
                    </Text>
                    <TouchableOpacity onPress={() => setShowTypePicker(false)}>
                      <Text
                        style={[styles.pickerButton, { color: colors.primary }]}
                      >
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.pickerContent}>
                    {accountTypes.map((accountType, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.pickerItem,
                          { borderBottomColor: colors.border },
                        ]}
                        onPress={() => {
                          setType(accountType.id);
                          setShowTypePicker(false);
                        }}
                      >
                        <View style={styles.pickerItemContent}>
                          <Ionicons
                            name={accountType.icon as any}
                            size={20}
                            color={colors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.pickerItemText,
                              { color: colors.text },
                            ]}
                          >
                            {accountType.label}
                          </Text>
                        </View>
                        {type === accountType.id && (
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
                    <Text style={[styles.pickerTitle, { color: colors.text }]}>
                      Select Institution
                    </Text>
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
                    {allInstitutions.map((bank, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.pickerItem,
                          { borderBottomColor: colors.border },
                        ]}
                        onPress={() => {
                          setInstitution(bank);
                          setShowInstitutionPicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            { color: colors.text },
                          ]}
                        >
                          {bank}
                        </Text>
                        {institution === bank && (
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

        {/* AI Extraction Modal */}
        <Modal
          visible={showAiExtractionModal}
          transparent
          animationType="slide"
        >
          <TouchableWithoutFeedback
            onPress={() => setShowAiExtractionModal(false)}
          >
            <View style={styles.pickerOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View
                  style={[
                    styles.aiModalContainer,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <View
                    style={[
                      styles.aiModalHeader,
                      {
                        backgroundColor: colors.card,
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.aiModalTitle, { color: colors.text }]}>
                      Extract Account Details
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowAiExtractionModal(false)}
                    >
                      <Ionicons
                        name="close"
                        size={24}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.aiModalContent}>
                    <Text
                      style={[
                        styles.aiModalSubtitle,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Choose your preferred method to extract account data
                    </Text>

                    {/* 1x3 Horizontal Grid Layout */}
                    <View style={styles.aiOptionsGrid}>
                      <TouchableOpacity
                        style={[
                          styles.aiGridOption,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => handleAiExtraction("image")}
                        disabled={loading}
                      >
                        <Ionicons
                          name="camera-outline"
                          size={20}
                          color={colors.primary}
                        />
                        <Text
                          style={[styles.aiGridTitle, { color: colors.text }]}
                        >
                          Photo
                        </Text>
                        <Text
                          style={[
                            styles.aiGridSubtitle,
                            { color: colors.textSecondary },
                          ]}
                        >
                          Bank Statement
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.aiGridOption,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => handleAiExtraction("document")}
                        disabled={loading}
                      >
                        <Ionicons
                          name="document-outline"
                          size={20}
                          color={colors.primary}
                        />
                        <Text
                          style={[styles.aiGridTitle, { color: colors.text }]}
                        >
                          Document
                        </Text>
                        <Text
                          style={[
                            styles.aiGridSubtitle,
                            { color: colors.textSecondary },
                          ]}
                        >
                          PDF, Images
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.aiGridOption,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => handleAiExtraction("sms")}
                        disabled={loading}
                      >
                        <Ionicons
                          name="chatbubble-outline"
                          size={20}
                          color={colors.primary}
                        />
                        <Text
                          style={[styles.aiGridTitle, { color: colors.text }]}
                        >
                          SMS
                        </Text>
                        <Text
                          style={[
                            styles.aiGridSubtitle,
                            { color: colors.textSecondary },
                          ]}
                        >
                          Transaction Text
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {loading && (
                      <View style={styles.loadingContainer}>
                        <Text
                          style={[styles.loadingText, { color: colors.text }]}
                        >
                          Extracting account details...
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Custom Account Type Modal */}
        <Modal visible={showCustomTypeModal} transparent animationType="slide">
          <TouchableWithoutFeedback
            onPress={() => setShowCustomTypeModal(false)}
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
                      { borderBottomColor: colors.border },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => setShowCustomTypeModal(false)}
                    >
                      <Text
                        style={[
                          styles.pickerCancel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <Text style={[styles.pickerTitle, { color: colors.text }]}>
                      Add Custom Account Type
                    </Text>
                    <TouchableOpacity onPress={saveCustomType}>
                      <Text
                        style={[styles.pickerDone, { color: colors.primary }]}
                      >
                        Add
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.customInputContainer}>
                    <TextInput
                      style={[
                        styles.customInput,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                      ]}
                      placeholder="Enter account type name"
                      placeholderTextColor={colors.textSecondary}
                      value={newCustomType}
                      onChangeText={setNewCustomType}
                      maxLength={30}
                    />
                  </View>
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
                      { borderBottomColor: colors.border },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => setShowCustomInstitutionModal(false)}
                    >
                      <Text
                        style={[
                          styles.pickerCancel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <Text style={[styles.pickerTitle, { color: colors.text }]}>
                      Add Custom Institution
                    </Text>
                    <TouchableOpacity onPress={saveCustomInstitution}>
                      <Text
                        style={[styles.pickerDone, { color: colors.primary }]}
                      >
                        Add
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.customInputContainer}>
                    <TextInput
                      style={[
                        styles.customInput,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                      ]}
                      placeholder="Enter institution name"
                      placeholderTextColor={colors.textSecondary}
                      value={newCustomInstitution}
                      onChangeText={setNewCustomInstitution}
                      maxLength={50}
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    paddingTop: 44,
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
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  labelWithAction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  addButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Logo upload styles
  logoUploadButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  logoUploadContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoUploadText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  logoUploadSubtext: {
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  logoPreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  logoPreview: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  logoActions: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 12,
  },
  logoSuccessText: {
    fontSize: 14,
    fontWeight: "500",
  },
  removeLogo: {
    padding: 4,
  },
  // Custom modal styles
  customInputContainer: {
    padding: 24,
    minHeight: 120,
  },
  customInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 48,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 50,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
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
  rowContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
  },
  selectContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  selectText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 8,
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
  pickerItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  pickerItemText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  pickerCancel: {
    fontSize: 16,
    fontWeight: "400",
  },
  pickerDone: {
    fontSize: 16,
    fontWeight: "600",
  },
  sectionContainer: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 16,
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
    paddingVertical: 16,
    alignItems: "center",
    minHeight: 54,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 2,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    minHeight: 54,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  // Header button styles
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scanButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // AI Modal Styles
  aiModalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  aiModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  aiModalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  aiModalContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  aiModalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
    textAlign: "center",
  },
  // 1x3 Horizontal Grid Layout
  aiOptionsGrid: {
    flexDirection: "row",
    gap: 6,
    marginVertical: 16,
  },
  aiGridOption: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 75,
    justifyContent: "center",
  },
  aiGridTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
  aiGridSubtitle: {
    fontSize: 11,
    marginTop: 2,
    textAlign: "center",
    lineHeight: 14,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default AddAccountModal;
