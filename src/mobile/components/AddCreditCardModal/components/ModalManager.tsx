import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AiExtractionModal, StatementUploadModal, FormField } from "./index";

interface ModalManagerProps {
  // AI Extraction Modal
  showAiExtractionModal: boolean;
  onCloseAiExtraction: () => void;
  onAiExtract: (type: "image" | "document" | "sms") => void;
  aiLoading: boolean;

  // Statement Upload Modal
  showStatementUploadModal: boolean;
  onCloseStatementUpload: () => void;
  onStatementUpload: (fileType?: string) => void;

  // Institution Picker Modal
  showInstitutionPicker: boolean;
  onCloseInstitutionPicker: () => void;
  onSelectInstitution: (institution: string) => void;
  allInstitutions: string[];

  // Billing Cycle Picker Modal
  showBillingCyclePicker: boolean;
  onCloseBillingCycle: () => void;
  onSelectBillingCycle: (cycle: string) => void;
  onSelectCustomBilling: () => void;
  billingCycles: Array<{ label: string; value: string }>;

  // Custom Institution Modal
  showCustomInstitutionModal: boolean;
  onCloseCustomInstitution: () => void;
  onSaveCustomInstitution: () => void;
  customInstitutionName: string;
  onChangeCustomInstitution: (text: string) => void;

  // Due Date Picker
  showDueDatePicker: boolean;
  onCloseDueDatePicker: () => void;
  onConfirmDueDate: () => void;
  onCancelDueDate: () => void;
  tempDueDate: Date;
  onDueDateChange: (event: any, selectedDate?: Date) => void;

  // Custom Billing Date Picker
  showCustomBillingDatePicker: boolean;
  onCloseCustomBillingDate: () => void;
  onConfirmCustomBillingDate: () => void;
  onCancelCustomBillingDate: () => void;
  tempCustomBillingDate: Date;
  onCustomBillingDateChange: (event: any, selectedDate?: Date) => void;

  // Loading
  loading: boolean;

  colors: any;
  styles: any;
}

export const ModalManager: React.FC<ModalManagerProps> = ({
  showAiExtractionModal,
  onCloseAiExtraction,
  onAiExtract,
  aiLoading,
  showStatementUploadModal,
  onCloseStatementUpload,
  onStatementUpload,
  showInstitutionPicker,
  onCloseInstitutionPicker,
  onSelectInstitution,
  allInstitutions,
  showBillingCyclePicker,
  onCloseBillingCycle,
  onSelectBillingCycle,
  onSelectCustomBilling,
  billingCycles,
  showCustomInstitutionModal,
  onCloseCustomInstitution,
  onSaveCustomInstitution,
  customInstitutionName,
  onChangeCustomInstitution,
  showDueDatePicker,
  onCloseDueDatePicker,
  onConfirmDueDate,
  onCancelDueDate,
  tempDueDate,
  onDueDateChange,
  showCustomBillingDatePicker,
  onCloseCustomBillingDate,
  onConfirmCustomBillingDate,
  onCancelCustomBillingDate,
  tempCustomBillingDate,
  onCustomBillingDateChange,
  loading,
  colors,
  styles,
}) => {
  return (
    <>
      {/* Due Date Picker */}
      {showDueDatePicker && Platform.OS === "ios" && (
        <Modal transparent animationType="fade">
          <TouchableWithoutFeedback onPress={onCancelDueDate}>
            <View style={styles.pickerOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View
                  style={[
                    styles.pickerContainer,
                    { backgroundColor: colors.card },
                  ]}
                >
                  <View
                    style={[
                      styles.pickerHeader,
                      { borderBottomColor: colors.border },
                    ]}
                  >
                    <TouchableOpacity onPress={onCancelDueDate}>
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
                      Select Due Date
                    </Text>
                    <TouchableOpacity onPress={onConfirmDueDate}>
                      <Text
                        style={[styles.pickerButton, { color: colors.primary }]}
                      >
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.datePickerContainer}>
                    <DateTimePicker
                      value={tempDueDate}
                      mode="date"
                      display="wheels"
                      onChange={onDueDateChange}
                      style={styles.datePicker}
                      textColor={colors.text}
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {/* Android Due Date Picker */}
      {showDueDatePicker && Platform.OS === "android" && (
        <DateTimePicker
          value={tempDueDate}
          mode="date"
          display="default"
          onChange={onDueDateChange}
        />
      )}

      {/* Custom Billing Date Picker */}
      {showCustomBillingDatePicker && Platform.OS === "ios" && (
        <Modal transparent animationType="fade">
          <TouchableWithoutFeedback onPress={onCancelCustomBillingDate}>
            <View style={styles.pickerOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View
                  style={[
                    styles.pickerContainer,
                    { backgroundColor: colors.card },
                  ]}
                >
                  <View
                    style={[
                      styles.pickerHeader,
                      { borderBottomColor: colors.border },
                    ]}
                  >
                    <TouchableOpacity onPress={onCancelCustomBillingDate}>
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
                      Select Billing Date
                    </Text>
                    <TouchableOpacity onPress={onConfirmCustomBillingDate}>
                      <Text
                        style={[styles.pickerButton, { color: colors.primary }]}
                      >
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.datePickerContainer}>
                    <DateTimePicker
                      value={tempCustomBillingDate}
                      mode="date"
                      display="wheels"
                      onChange={onCustomBillingDateChange}
                      style={styles.datePicker}
                      textColor={colors.text}
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {/* Android Custom Billing Date Picker */}
      {showCustomBillingDatePicker && Platform.OS === "android" && (
        <DateTimePicker
          value={tempCustomBillingDate}
          mode="date"
          display="default"
          onChange={onCustomBillingDateChange}
        />
      )}

      {/* AI Extraction Modal */}
      <AiExtractionModal
        visible={showAiExtractionModal}
        onClose={onCloseAiExtraction}
        onExtract={onAiExtract}
        loading={aiLoading}
        colors={colors}
        styles={styles}
      />

      {/* Statement Upload Modal */}
      <StatementUploadModal
        visible={showStatementUploadModal}
        onClose={onCloseStatementUpload}
        onUpload={onStatementUpload}
        colors={colors}
        styles={styles}
      />

      {/* Institution Picker Modal */}
      <Modal visible={showInstitutionPicker} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={onCloseInstitutionPicker}>
          <View style={styles.pickerOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={[
                  styles.pickerContainer,
                  { backgroundColor: colors.card },
                ]}
              >
                <View
                  style={[
                    styles.pickerHeader,
                    { borderBottomColor: colors.border },
                  ]}
                >
                  <TouchableOpacity onPress={onCloseInstitutionPicker}>
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
                  <View style={{ width: 60 }} />
                </View>
                <ScrollView style={styles.pickerScrollView}>
                  {allInstitutions.map((institution, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.pickerItem}
                      onPress={() => onSelectInstitution(institution)}
                    >
                      <Text
                        style={[styles.pickerItemText, { color: colors.text }]}
                      >
                        {institution}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Billing Cycle Picker Modal */}
      <Modal visible={showBillingCyclePicker} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={onCloseBillingCycle}>
          <View style={styles.pickerOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={[
                  styles.pickerContainer,
                  { backgroundColor: colors.card },
                ]}
              >
                <View
                  style={[
                    styles.pickerHeader,
                    { borderBottomColor: colors.border },
                  ]}
                >
                  <TouchableOpacity onPress={onCloseBillingCycle}>
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
                    Select Billing Cycle
                  </Text>
                  <View style={{ width: 60 }} />
                </View>
                <ScrollView style={styles.pickerScrollView}>
                  {billingCycles.map((cycle, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.pickerItem}
                      onPress={() => onSelectBillingCycle(cycle.value)}
                    >
                      <Text
                        style={[styles.pickerItemText, { color: colors.text }]}
                      >
                        {cycle.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={[
                      styles.pickerItem,
                      { borderTopWidth: 1, borderTopColor: colors.border },
                    ]}
                    onPress={onSelectCustomBilling}
                  >
                    <Text
                      style={[styles.pickerItemText, { color: colors.primary }]}
                    >
                      Custom Date
                    </Text>
                  </TouchableOpacity>
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
        <TouchableWithoutFeedback onPress={onCloseCustomInstitution}>
          <View style={styles.pickerOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={[
                  styles.pickerContainer,
                  { backgroundColor: colors.card },
                ]}
              >
                <View
                  style={[
                    styles.pickerHeader,
                    { borderBottomColor: colors.border },
                  ]}
                >
                  <TouchableOpacity onPress={onCloseCustomInstitution}>
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
                    Add Custom Institution
                  </Text>
                  <TouchableOpacity onPress={onSaveCustomInstitution}>
                    <Text
                      style={[styles.pickerButton, { color: colors.primary }]}
                    >
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.customModalContent}>
                  <FormField
                    value={customInstitutionName}
                    onChangeText={onChangeCustomInstitution}
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
            style={[styles.loadingContainer, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Processing AI extraction...
            </Text>
            <Text
              style={[styles.loadingSubtext, { color: colors.textSecondary }]}
            >
              Analyzing your document
            </Text>
          </View>
        </View>
      )}
    </>
  );
};
