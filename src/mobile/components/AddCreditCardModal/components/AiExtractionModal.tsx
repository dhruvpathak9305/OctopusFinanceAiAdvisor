import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AiExtractionModalProps, AiExtractionOption } from "../types";

const AI_EXTRACTION_OPTIONS: AiExtractionOption[] = [
  {
    type: "image",
    title: "Photo",
    subtitle: "Card, Statement",
    icon: "camera-outline",
  },
  {
    type: "document",
    title: "Statement",
    subtitle: "PDF, Excel, CSV",
    icon: "document-outline",
  },
  {
    type: "sms",
    title: "SMS",
    subtitle: "Text Message",
    icon: "chatbubble-outline",
  },
];

export const AiExtractionModal: React.FC<AiExtractionModalProps> = ({
  visible,
  onClose,
  onExtract,
  loading,
  colors,
  styles,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.aiModalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View
              style={[
                styles.aiModalContainer,
                { backgroundColor: colors.background },
              ]}
            >
              <View style={styles.aiModalHeader}>
                <Text style={[styles.aiModalTitle, { color: colors.text }]}>
                  Extract Credit Card Details
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <Text
                style={[
                  styles.aiModalSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Choose your preferred method to extract card data
              </Text>

              <View style={styles.aiGridContainer}>
                {AI_EXTRACTION_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.type}
                    style={[
                      styles.aiGridOption,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => onExtract(option.type)}
                    disabled={loading}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[styles.aiGridTitle, { color: colors.text }]}>
                      {option.title}
                    </Text>
                    <Text
                      style={[
                        styles.aiGridSubtitle,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {option.subtitle}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
