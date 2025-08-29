import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AiExtractionModalProps {
  visible: boolean;
  onClose: () => void;
  onExtract: (type: "image" | "document" | "sms") => void;
  loading: boolean;
  colors: any;
  styles: any;
}

export const AiExtractionModal: React.FC<AiExtractionModalProps> = ({
  visible,
  onClose,
  onExtract,
  loading,
  colors,
  styles,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
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
                <TouchableOpacity onPress={onClose}>
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
                  Upload a bank statement, passbook photo, or SMS to
                  automatically extract account details
                </Text>

                <TouchableOpacity
                  style={[
                    styles.aiOptionButton,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      opacity: loading ? 0.5 : 1,
                    },
                  ]}
                  onPress={() => onExtract("image")}
                  disabled={loading}
                >
                  <Ionicons
                    name="camera-outline"
                    size={24}
                    color={colors.primary}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.aiOptionText, { color: colors.text }]}>
                      Upload Bank Statement Photo
                    </Text>
                    <Text
                      style={[
                        styles.aiOptionSubtext,
                        { color: colors.textSecondary },
                      ]}
                    >
                      JPG, PNG, WEBP
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.aiOptionButton,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      opacity: loading ? 0.5 : 1,
                    },
                  ]}
                  onPress={() => onExtract("document")}
                  disabled={loading}
                >
                  <Ionicons
                    name="document-outline"
                    size={24}
                    color={colors.primary}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.aiOptionText, { color: colors.text }]}>
                      Upload Document
                    </Text>
                    <Text
                      style={[
                        styles.aiOptionSubtext,
                        { color: colors.textSecondary },
                      ]}
                    >
                      PDF, TXT, Images
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.aiOptionButton,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      opacity: loading ? 0.5 : 1,
                    },
                  ]}
                  onPress={() => onExtract("sms")}
                  disabled={loading}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={24}
                    color={colors.primary}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.aiOptionText, { color: colors.text }]}>
                      Paste SMS Text
                    </Text>
                    <Text
                      style={[
                        styles.aiOptionSubtext,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Bank transaction SMS
                    </Text>
                  </View>
                </TouchableOpacity>

                {loading && (
                  <View style={styles.loadingContainer}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons
                        name="sync-outline"
                        size={20}
                        color={colors.primary}
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={[styles.loadingText, { color: colors.text }]}
                      >
                        Extracting account details...
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AiExtractionModal;
