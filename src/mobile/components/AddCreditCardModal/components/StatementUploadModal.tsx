import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatementUploadModalProps } from "../types";

const FILE_TYPES = [
  {
    name: "PDF",
    color: "#FF4757",
    icon: "document-text",
    types: ["application/pdf"],
  },
  {
    name: "CSV",
    color: "#2ED573",
    icon: "grid",
    types: ["text/csv", "text/plain"],
  },
  {
    name: "Excel",
    color: "#FFA726",
    icon: "analytics",
    types: [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
  },
  {
    name: "Word",
    color: "#8E44AD",
    icon: "document",
    types: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ],
  },
];

export const StatementUploadModal: React.FC<StatementUploadModalProps> = ({
  visible,
  onClose,
  onUpload,
  colors,
  styles,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View
        style={[
          styles.statementModalContainer,
          { backgroundColor: colors.background },
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles.statementModalHeader,
            { borderBottomColor: colors.border },
          ]}
        >
          <TouchableOpacity style={styles.headerBackButton} onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.statementModalTitle, { color: colors.text }]}>
            Upload Bank Statement
          </Text>
          <TouchableOpacity style={styles.headerBackButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.statementModalContent}>
          {/* Main Upload Area */}
          <TouchableOpacity
            style={[
              styles.uploadArea,
              {
                borderColor: colors.primary,
                backgroundColor: colors.card,
              },
            ]}
            onPress={() => onUpload("all")}
          >
            <View
              style={[
                styles.uploadIconContainer,
                { backgroundColor: colors.primary },
              ]}
            >
              <Ionicons name="cloud-upload" size={32} color="white" />
            </View>
            <Text style={[styles.uploadTitle, { color: colors.text }]}>
              Upload Bank Statement
            </Text>
            <Text
              style={[styles.uploadSubtitle, { color: colors.textSecondary }]}
            >
              Tap to select your bank statement file
            </Text>
          </TouchableOpacity>

          {/* Quick Upload Options */}
          <View
            style={[
              styles.quickOptionsContainer,
              { backgroundColor: colors.card },
            ]}
          >
            <Text style={[styles.quickOptionsTitle, { color: colors.text }]}>
              Quick Upload Options:
            </Text>
            <View style={styles.fileTypesGrid}>
              {FILE_TYPES.map((fileType, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.fileTypeItem}
                  onPress={() => onUpload(fileType.name.toLowerCase())}
                >
                  <View
                    style={[
                      styles.fileTypeIcon,
                      { backgroundColor: fileType.color },
                    ]}
                  >
                    <Ionicons
                      name={fileType.icon as any}
                      size={20}
                      color="white"
                    />
                  </View>
                  <Text style={[styles.fileTypeLabel, { color: colors.text }]}>
                    {fileType.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tips Section */}
          <View style={[styles.tipsContainer, { backgroundColor: "#FFF3CD" }]}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={16} color="#856404" />
              <Text style={[styles.tipsTitle, { color: "#856404" }]}>
                Tips for best results:
              </Text>
            </View>
            <View style={styles.tipsList}>
              <Text style={[styles.tipItem, { color: "#856404" }]}>
                • Ensure your document is clear and readable
              </Text>
              <Text style={[styles.tipItem, { color: "#856404" }]}>
                • PDFs should have selectable text
              </Text>
              <Text style={[styles.tipItem, { color: "#856404" }]}>
                • Excel/CSV files with headers work best
              </Text>
              <Text style={[styles.tipItem, { color: "#856404" }]}>
                • Check that dates and amounts are properly formatted
              </Text>
              <Text style={[styles.tipItem, { color: "#856404" }]}>
                • Maximum file size: 10MB
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};
