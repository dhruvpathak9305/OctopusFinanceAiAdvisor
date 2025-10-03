/**
 * ADD NET WORTH ENTRY MODAL
 * =============================================================================
 *
 * Comprehensive form for adding new net worth entries (assets/liabilities)
 * with multiple input methods: manual, photo scan, SMS extraction
 *
 * Features:
 * - Manual entry form
 * - Photo scanning capability
 * - SMS extraction
 * - Category and subcategory selection
 * - Asset/Liability specific fields
 * - Theme-consistent UI
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

import { useDemoMode } from "../../../../contexts/DemoModeContext";
import { useTheme } from "../../../../contexts/ThemeContext";
import {
  fetchCategories,
  fetchSubcategories,
  createNetWorthEntry,
  fetchInstitutions,
} from "../../../../services/netWorthService";

interface AddNetWorthEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave?: () => void;
  categoryType?: "asset" | "liability";
  preSelectedCategory?: string;
  preSelectedSubcategory?: string;
}

interface FormData {
  name: string;
  description: string;
  amount: string;
  category: string;
  subcategory: string;
  type: "asset" | "liability";
  // Asset specific fields
  acquisitionDate?: string;
  currentValue?: string;
  appreciationRate?: string;
  // Liability specific fields
  interestRate?: string;
  monthlyPayment?: string;
  maturityDate?: string;
  // Common fields
  institution?: string;
  accountNumber?: string;
  notes?: string;
}

type InputMethod = "manual" | "photo" | "sms";

const AddNetWorthEntryModal: React.FC<AddNetWorthEntryModalProps> = ({
  visible,
  onClose,
  onSave,
  categoryType = "asset",
  preSelectedCategory,
  preSelectedSubcategory,
}) => {
  const [inputMethod, setInputMethod] = useState<InputMethod>("manual");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);

  // Picker modal states
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSubcategoryPicker, setShowSubcategoryPicker] = useState(false);
  const [showInstitutionPicker, setShowInstitutionPicker] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    amount: "",
    category: preSelectedCategory || "",
    subcategory: preSelectedSubcategory || "",
    type: categoryType,
    acquisitionDate: new Date().toISOString().split("T")[0],
    currentValue: "",
    appreciationRate: "",
    interestRate: "",
    monthlyPayment: "",
    maturityDate: "",
    institution: "",
    accountNumber: "",
    notes: "",
  });

  // Get theme and demo mode
  const { isDark } = useTheme();
  const { isDemo } = useDemoMode();

  // Dynamic colors based on entry type
  const colors = isDark
    ? {
        background: "#1F2937",
        card: "#374151",
        border: "#4B5563",
        text: "#F9FAFB",
        textSecondary: "#D1D5DB",
        primary: categoryType === "liability" ? "#EF4444" : "#10B981",
        error: "#EF4444",
      }
    : {
        background: "#FFFFFF",
        card: "#F9FAFB",
        border: "#E5E7EB",
        text: "#111827",
        textSecondary: "#6B7280",
        primary: categoryType === "liability" ? "#EF4444" : "#10B981",
        error: "#EF4444",
      };

  // Function definitions with useCallback for proper hoisting
  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await fetchCategories(isDemo);
      const filteredCategories = categoriesData.filter(
        (cat) => cat.type === categoryType
      );
      setCategories(filteredCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
      Alert.alert("Error", "Failed to load categories");
    }
  }, [isDemo, categoryType]);

  const loadSubcategories = useCallback(
    async (categoryId: string) => {
      try {
        const subcategoriesData = await fetchSubcategories(categoryId, isDemo);
        setSubcategories(subcategoriesData);
      } catch (error) {
        console.error("Error loading subcategories:", error);
        Alert.alert("Error", "Failed to load subcategories");
      }
    },
    [isDemo]
  );

  const loadInstitutions = useCallback(async () => {
    try {
      const institutionsData = await fetchInstitutions(isDemo);
      setInstitutions(institutionsData);
    } catch (error) {
      console.error("Error loading institutions:", error);
      // Don't show alert for institutions as it's not critical
    }
  }, [isDemo]);

  // Load categories and institutions on mount
  useEffect(() => {
    const initializeData = async () => {
      await loadCategories();
      await loadInstitutions();
    };
    initializeData();
  }, [loadCategories, loadInstitutions]);

  // Load subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      loadSubcategories(formData.category);
    }
  }, [formData.category, loadSubcategories]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhotoCapture = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Camera permission is required to scan documents"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        // Here you would integrate with OCR service to extract data
        await processImageForData(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error capturing photo:", error);
      Alert.alert("Error", "Failed to capture photo");
    }
  };

  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        await processImageForData(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload image");
    }
  };

  const processImageForData = async (imageUri: string) => {
    setLoading(true);
    try {
      // Simulate OCR processing - in real app, integrate with OCR service
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock extracted data
      const mockExtractedData = {
        name: "Investment Account",
        amount: "50000",
        institution: "ABC Bank",
        accountNumber: "****1234",
      };

      setExtractedData(mockExtractedData);
      setFormData((prev) => ({
        ...prev,
        ...mockExtractedData,
      }));

      Alert.alert("Success", "Data extracted from image successfully!");
    } catch (error) {
      console.error("Error processing image:", error);
      Alert.alert("Error", "Failed to extract data from image");
    } finally {
      setLoading(false);
    }
  };

  const handleSMSExtraction = async () => {
    try {
      // In real app, integrate with SMS reading permissions and parsing
      Alert.alert(
        "SMS Extraction",
        "This feature would read SMS messages to extract financial data. For demo purposes, we'll use sample data.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Use Sample",
            onPress: () => {
              const sampleData = {
                name: "Bank Statement Entry",
                amount: "25000",
                description: "Monthly salary credit",
                institution: "XYZ Bank",
              };
              setFormData((prev) => ({ ...prev, ...sampleData }));
              Alert.alert("Success", "Sample data loaded from SMS!");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error extracting SMS:", error);
      Alert.alert("Error", "Failed to extract SMS data");
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert("Validation Error", "Entry name is required");
      return false;
    }
    if (!formData.amount.trim() || isNaN(Number(formData.amount))) {
      Alert.alert("Validation Error", "Valid amount is required");
      return false;
    }
    if (!formData.category) {
      Alert.alert("Validation Error", "Category is required");
      return false;
    }
    if (!formData.subcategory) {
      Alert.alert("Validation Error", "Subcategory is required");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const entryData = {
        name: formData.name,
        description: formData.description,
        amount: Number(formData.amount),
        category_id: formData.category,
        subcategory_id: formData.subcategory,
        type: formData.type,
        acquisition_date: formData.acquisitionDate,
        current_value: formData.currentValue
          ? Number(formData.currentValue)
          : undefined,
        appreciation_rate: formData.appreciationRate
          ? Number(formData.appreciationRate)
          : undefined,
        interest_rate: formData.interestRate
          ? Number(formData.interestRate)
          : undefined,
        monthly_payment: formData.monthlyPayment
          ? Number(formData.monthlyPayment)
          : undefined,
        maturity_date: formData.maturityDate,
        institution: formData.institution,
        account_number: formData.accountNumber,
        notes: formData.notes,
      };

      await createNetWorthEntry(entryData, isDemo);

      Alert.alert("Success", "Net worth entry created successfully!", [
        {
          text: "OK",
          onPress: () => {
            onSave?.();
            onClose();
          },
        },
      ]);
    } catch (error) {
      console.error("Error creating entry:", error);
      Alert.alert("Error", "Failed to create net worth entry");
    } finally {
      setLoading(false);
    }
  };

  const renderInputMethodSelector = () => (
    <View style={styles.inputMethodSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Input Method
      </Text>
      <View style={styles.inputMethodButtons}>
        <TouchableOpacity
          style={[
            styles.inputMethodButton,
            {
              backgroundColor:
                inputMethod === "manual" ? colors.primary : colors.card,
              borderColor:
                inputMethod === "manual" ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setInputMethod("manual")}
        >
          <Ionicons
            name="create-outline"
            size={20}
            color={inputMethod === "manual" ? "white" : colors.text}
          />
          <Text
            style={[
              styles.inputMethodText,
              { color: inputMethod === "manual" ? "white" : colors.text },
            ]}
          >
            Manual Entry
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.inputMethodButton,
            {
              backgroundColor:
                inputMethod === "photo" ? colors.primary : colors.card,
              borderColor:
                inputMethod === "photo" ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setInputMethod("photo")}
        >
          <Ionicons
            name="camera-outline"
            size={20}
            color={inputMethod === "photo" ? "white" : colors.text}
          />
          <Text
            style={[
              styles.inputMethodText,
              { color: inputMethod === "photo" ? "white" : colors.text },
            ]}
          >
            Scan Photo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.inputMethodButton,
            {
              backgroundColor:
                inputMethod === "sms" ? colors.primary : colors.card,
              borderColor:
                inputMethod === "sms" ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setInputMethod("sms")}
        >
          <Ionicons
            name="chatbubble-outline"
            size={20}
            color={inputMethod === "sms" ? "white" : colors.text}
          />
          <Text
            style={[
              styles.inputMethodText,
              { color: inputMethod === "sms" ? "white" : colors.text },
            ]}
          >
            Extract SMS
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPhotoSection = () => {
    if (inputMethod !== "photo") return null;

    return (
      <View style={styles.photoSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Document Scanning
        </Text>

        {selectedImage && (
          <View style={styles.imagePreview}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.previewImage}
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close-circle" size={24} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.photoButtons}>
          <TouchableOpacity
            style={[styles.photoButton, { backgroundColor: colors.primary }]}
            onPress={handlePhotoCapture}
          >
            <Ionicons name="camera" size={20} color="white" />
            <Text style={styles.photoButtonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.photoButton, { backgroundColor: colors.secondary }]}
            onPress={handleImageUpload}
          >
            <Ionicons name="image" size={20} color="white" />
            <Text style={styles.photoButtonText}>Upload Image</Text>
          </TouchableOpacity>
        </View>

        {extractedData && (
          <View
            style={[
              styles.extractedDataSection,
              { backgroundColor: colors.primary + "10" },
            ]}
          >
            <Text
              style={[styles.extractedDataTitle, { color: colors.primary }]}
            >
              Extracted Data
            </Text>
            <Text style={[styles.extractedDataText, { color: colors.text }]}>
              {JSON.stringify(extractedData, null, 2)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderSMSSection = () => {
    if (inputMethod !== "sms") return null;

    return (
      <View style={styles.smsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          SMS Extraction
        </Text>
        <Text style={[styles.smsDescription, { color: colors.textSecondary }]}>
          Extract financial data from SMS messages like bank statements,
          transaction alerts, etc.
        </Text>

        <TouchableOpacity
          style={[styles.smsButton, { backgroundColor: colors.primary }]}
          onPress={handleSMSExtraction}
        >
          <Ionicons name="chatbubble-ellipses" size={20} color="white" />
          <Text style={styles.smsButtonText}>Extract from SMS</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFormFields = () => (
    <View style={styles.formSection}>
      {/* Entry Name */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: colors.text }]}>
          Entry Name <Text style={{ color: colors.error }}>*</Text>
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
          value={formData.name}
          onChangeText={(value) => handleInputChange("name", value)}
          placeholder={
            categoryType === "liability"
              ? "e.g., Home Loan, Credit Card Debt"
              : "e.g., Savings Account, Investment Portfolio"
          }
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Description */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: colors.text }]}>
          Description
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
          value={formData.description}
          onChangeText={(value) => handleInputChange("description", value)}
          placeholder="Brief description of this entry"
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={2}
        />
      </View>

      {/* Category */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: colors.text }]}>
          Category <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <TouchableOpacity
          style={[
            styles.selectButton,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => setShowCategoryPicker(true)}
        >
          <View style={styles.selectContent}>
            {formData.category && (
              <Ionicons
                name={
                  (categories.find((cat) => cat.id === formData.category)
                    ?.icon as any) || "folder"
                }
                size={16}
                color={colors.text}
                style={styles.selectIcon}
              />
            )}
            <Text
              style={[
                styles.selectText,
                {
                  color: formData.category ? colors.text : colors.textSecondary,
                },
              ]}
            >
              {formData.category
                ? categories.find((cat) => cat.id === formData.category)
                    ?.name || "Select category"
                : "Select category"}
            </Text>
          </View>
          <Ionicons
            name="chevron-down"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Subcategory */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: colors.text }]}>
          Subcategory <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <TouchableOpacity
          style={[
            styles.selectButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: subcategories.length > 0 ? 1 : 0.5,
            },
          ]}
          onPress={() => {
            if (subcategories.length > 0) {
              setShowSubcategoryPicker(true);
            }
          }}
          disabled={subcategories.length === 0}
        >
          <View style={styles.selectContent}>
            {formData.subcategory && (
              <Ionicons
                name={
                  (subcategories.find((sub) => sub.id === formData.subcategory)
                    ?.icon as any) || "list"
                }
                size={14}
                color={colors.text}
                style={styles.selectIcon}
              />
            )}
            <Text
              style={[
                styles.selectText,
                {
                  color: formData.subcategory
                    ? colors.text
                    : colors.textSecondary,
                },
              ]}
            >
              {formData.subcategory
                ? subcategories.find((sub) => sub.id === formData.subcategory)
                    ?.name || "Select subcategory"
                : subcategories.length > 0
                ? "Select subcategory"
                : "Select category first"}
            </Text>
          </View>
          <Ionicons
            name="chevron-down"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Asset-specific fields */}
      {formData.type === "asset" && (
        <>
          {/* Amount & Acquisition Date - Side by Side */}
          <View style={styles.rowContainer}>
            <View style={[styles.fieldGroup, styles.halfWidth]}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Amount <Text style={{ color: colors.error }}>*</Text>
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
                value={formData.amount}
                onChangeText={(value) => handleInputChange("amount", value)}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.fieldGroup, styles.halfWidth]}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Acquisition Date
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
                value={formData.acquisitionDate}
                onChangeText={(value) =>
                  handleInputChange("acquisitionDate", value)
                }
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          {/* Current Value & Appreciation Rate - Side by Side */}
          <View style={styles.rowContainer}>
            <View style={[styles.fieldGroup, styles.halfWidth]}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Current Value
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
                value={formData.currentValue}
                onChangeText={(value) =>
                  handleInputChange("currentValue", value)
                }
                placeholder="Market value"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.fieldGroup, styles.halfWidth]}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Appreciation Rate (%)
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
                value={formData.appreciationRate}
                onChangeText={(value) =>
                  handleInputChange("appreciationRate", value)
                }
                placeholder="Annual %"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>
        </>
      )}

      {/* Liability-specific fields */}
      {formData.type === "liability" && (
        <>
          {/* Amount - Full Width for Liabilities */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Amount <Text style={{ color: colors.error }}>*</Text>
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
              value={formData.amount}
              onChangeText={(value) => handleInputChange("amount", value)}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          {/* Interest Rate & Monthly Payment - Side by Side */}
          <View style={styles.rowContainer}>
            <View style={[styles.fieldGroup, styles.halfWidth]}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Interest Rate (%)
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
                value={formData.interestRate}
                onChangeText={(value) =>
                  handleInputChange("interestRate", value)
                }
                placeholder="Annual %"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.fieldGroup, styles.halfWidth]}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Monthly Payment
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
                value={formData.monthlyPayment}
                onChangeText={(value) =>
                  handleInputChange("monthlyPayment", value)
                }
                placeholder="EMI amount"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Maturity Date
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
              value={formData.maturityDate}
              onChangeText={(value) => handleInputChange("maturityDate", value)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </>
      )}

      {/* Institution & Account Number - Side by Side */}
      <View style={styles.rowContainer}>
        <View style={[styles.fieldGroup, styles.halfWidth]}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            Institution
          </Text>
          <TouchableOpacity
            style={[
              styles.selectButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setShowInstitutionPicker(true)}
          >
            <View style={styles.selectContent}>
              {formData.institution && (
                <Ionicons
                  name={
                    (institutions.find(
                      (inst) => inst.id === formData.institution
                    )?.icon as any) || "business-outline"
                  }
                  size={16}
                  color={colors.text}
                  style={styles.selectIcon}
                />
              )}
              <Text
                style={[
                  styles.selectText,
                  {
                    color: formData.institution
                      ? colors.text
                      : colors.textSecondary,
                  },
                ]}
              >
                {formData.institution
                  ? institutions.find(
                      (inst) => inst.id === formData.institution
                    )?.name || formData.institution
                  : "Select institution"}
              </Text>
            </View>
            <Ionicons
              name="chevron-down"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.fieldGroup, styles.halfWidth]}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            Account Number
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
            value={formData.accountNumber}
            onChangeText={(value) => handleInputChange("accountNumber", value)}
            placeholder="****1234"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      {/* Notes */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: colors.text }]}>Notes</Text>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          value={formData.notes}
          onChangeText={(value) => handleInputChange("notes", value)}
          placeholder="Additional notes or comments"
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: colors.card, borderBottomColor: colors.border },
          ]}
        >
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Add {categoryType === "asset" ? "Asset" : "Liability"} Entry
          </Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="checkmark" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderInputMethodSelector()}
          {renderPhotoSection()}
          {renderSMSSection()}
          {renderFormFields()}
        </ScrollView>

        {/* Footer Buttons */}
        <View
          style={[
            styles.footer,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: colors.border }]}
            onPress={onClose}
          >
            <Text
              style={[styles.cancelButtonText, { color: colors.textSecondary }]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.saveButtonText}>
                Add {categoryType === "asset" ? "Asset" : "Liability"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Picker Modal */}
      {showCategoryPicker && (
        <Modal visible={showCategoryPicker} transparent animationType="slide">
          <TouchableWithoutFeedback
            onPress={() => setShowCategoryPicker(false)}
          >
            <View style={styles.pickerOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View
                  style={[
                    styles.pickerModalContainer,
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
                    <Text style={[styles.pickerTitle, { color: colors.text }]}>
                      Select Category
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowCategoryPicker(false)}
                    >
                      <Text
                        style={[styles.pickerButton, { color: colors.primary }]}
                      >
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.pickerContent}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.pickerItem,
                          { borderBottomColor: colors.border },
                        ]}
                        onPress={() => {
                          handleInputChange("category", category.id);
                          setShowCategoryPicker(false);
                        }}
                      >
                        <View style={styles.pickerItemContent}>
                          {category.icon && (
                            <Ionicons
                              name={category.icon as any}
                              size={20}
                              color={
                                formData.category === category.id
                                  ? colors.primary
                                  : colors.textSecondary
                              }
                              style={styles.pickerItemIcon}
                            />
                          )}
                          <Text
                            style={[
                              styles.pickerItemText,
                              {
                                color:
                                  formData.category === category.id
                                    ? colors.primary
                                    : colors.text,
                                fontWeight:
                                  formData.category === category.id
                                    ? "600"
                                    : "400",
                              },
                            ]}
                          >
                            {category.name}
                          </Text>
                        </View>
                        {formData.category === category.id && (
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
                    styles.pickerModalContainer,
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
                    <Text style={[styles.pickerTitle, { color: colors.text }]}>
                      Select Subcategory
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowSubcategoryPicker(false)}
                    >
                      <Text
                        style={[styles.pickerButton, { color: colors.primary }]}
                      >
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.pickerContent}>
                    {subcategories.map((subcategory) => (
                      <TouchableOpacity
                        key={subcategory.id}
                        style={[
                          styles.pickerItem,
                          { borderBottomColor: colors.border },
                        ]}
                        onPress={() => {
                          handleInputChange("subcategory", subcategory.id);
                          setShowSubcategoryPicker(false);
                        }}
                      >
                        <View style={styles.pickerItemContent}>
                          {subcategory.icon && (
                            <Ionicons
                              name={subcategory.icon as any}
                              size={18}
                              color={
                                formData.subcategory === subcategory.id
                                  ? colors.primary
                                  : colors.textSecondary
                              }
                              style={styles.pickerItemIcon}
                            />
                          )}
                          <Text
                            style={[
                              styles.pickerItemText,
                              {
                                color:
                                  formData.subcategory === subcategory.id
                                    ? colors.primary
                                    : colors.text,
                                fontWeight:
                                  formData.subcategory === subcategory.id
                                    ? "600"
                                    : "400",
                              },
                            ]}
                          >
                            {subcategory.name}
                          </Text>
                        </View>
                        {formData.subcategory === subcategory.id && (
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

      {/* Institution Picker Modal */}
      {showInstitutionPicker && (
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
                    styles.pickerModalContainer,
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
                          styles.pickerHeaderButton,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <Text
                      style={[styles.pickerHeaderTitle, { color: colors.text }]}
                    >
                      Select Institution
                    </Text>
                    <View style={{ width: 60 }} />
                  </View>
                  <ScrollView style={styles.pickerScrollView}>
                    {/* Option to enter custom institution */}
                    <TouchableOpacity
                      style={[
                        styles.pickerItem,
                        { borderBottomColor: colors.border },
                      ]}
                      onPress={() => {
                        setShowInstitutionPicker(false);
                        Alert.prompt(
                          "Enter Institution",
                          "Enter the institution name:",
                          (text) => {
                            if (text && text.trim()) {
                              handleInputChange("institution", text.trim());
                            }
                          },
                          "plain-text",
                          formData.institution
                        );
                      }}
                    >
                      <View style={styles.pickerItemContent}>
                        <Ionicons
                          name="add-circle-outline"
                          size={20}
                          color={colors.primary}
                          style={styles.pickerItemIcon}
                        />
                        <Text
                          style={[
                            styles.pickerItemText,
                            { color: colors.primary, fontWeight: "500" },
                          ]}
                        >
                          Add Custom Institution
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Clear selection option */}
                    {formData.institution && (
                      <TouchableOpacity
                        style={[
                          styles.pickerItem,
                          { borderBottomColor: colors.border },
                        ]}
                        onPress={() => {
                          handleInputChange("institution", "");
                          setShowInstitutionPicker(false);
                        }}
                      >
                        <View style={styles.pickerItemContent}>
                          <Ionicons
                            name="close-circle-outline"
                            size={20}
                            color={colors.error}
                            style={styles.pickerItemIcon}
                          />
                          <Text
                            style={[
                              styles.pickerItemText,
                              { color: colors.error, fontWeight: "500" },
                            ]}
                          >
                            Clear Selection
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}

                    {/* Existing institutions from accounts */}
                    {institutions.map((institution) => (
                      <TouchableOpacity
                        key={institution.id}
                        style={[
                          styles.pickerItem,
                          { borderBottomColor: colors.border },
                        ]}
                        onPress={() => {
                          handleInputChange("institution", institution.id);
                          setShowInstitutionPicker(false);
                        }}
                      >
                        <View style={styles.pickerItemContent}>
                          {institution.icon && (
                            <Ionicons
                              name={institution.icon as any}
                              size={20}
                              color={
                                formData.institution === institution.id
                                  ? colors.primary
                                  : colors.textSecondary
                              }
                              style={styles.pickerItemIcon}
                            />
                          )}
                          <Text
                            style={[
                              styles.pickerItemText,
                              {
                                color:
                                  formData.institution === institution.id
                                    ? colors.primary
                                    : colors.text,
                                fontWeight:
                                  formData.institution === institution.id
                                    ? "600"
                                    : "400",
                              },
                            ]}
                          >
                            {institution.name}
                          </Text>
                        </View>
                        {formData.institution === institution.id && (
                          <Ionicons
                            name="checkmark"
                            size={20}
                            color={colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    ))}

                    {/* Show message if no institutions found */}
                    {institutions.length === 0 && (
                      <View style={styles.emptyStateContainer}>
                        <Ionicons
                          name="business-outline"
                          size={48}
                          color={colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.emptyStateText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          No institutions found in your accounts
                        </Text>
                        <Text
                          style={[
                            styles.emptyStateSubtext,
                            { color: colors.textSecondary },
                          ]}
                        >
                          Add accounts first or use "Add Custom Institution"
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
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
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputMethodSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  inputMethodButtons: {
    flexDirection: "row",
    gap: 8,
  },
  inputMethodButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  inputMethodText: {
    fontSize: 12,
    fontWeight: "500",
  },
  photoSection: {
    marginBottom: 24,
  },
  imagePreview: {
    position: "relative",
    marginBottom: 16,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  photoButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  photoButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  photoButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  extractedDataSection: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  extractedDataTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  extractedDataText: {
    fontSize: 12,
    fontFamily: "monospace",
  },
  smsSection: {
    marginBottom: 24,
  },
  smsDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  smsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  smsButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  formSection: {
    gap: 16,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  textInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  pickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
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
  },
  selectIcon: {
    marginRight: 8,
  },
  // Picker Modal Styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  pickerModalContainer: {
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
    marginRight: 12,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    flex: 2,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  // Row layout styles for side-by-side fields
  rowContainer: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  pickerHeaderButton: {
    fontSize: 16,
    fontWeight: "500",
  },
  pickerHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  pickerScrollView: {
    maxHeight: 400,
  },
});

export default AddNetWorthEntryModal;
