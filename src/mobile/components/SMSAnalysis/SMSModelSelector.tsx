import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SMSModel } from "../../types/sms";
import ModelIcon from "../ModelIcon";

interface SMSModelSelectorProps {
  models: SMSModel[];
  selectedModel: SMSModel;
  onSelectModel: (model: SMSModel) => void;
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    surface: string;
  };
  isDark?: boolean;
}

const SMSModelSelector: React.FC<SMSModelSelectorProps> = ({
  models,
  selectedModel,
  onSelectModel,
  colors,
  isDark = false,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSelectModel = (model: SMSModel) => {
    onSelectModel(model);
    setIsModalVisible(false);
  };

  return (
    <>
      {/* Model selector button */}
      <TouchableOpacity
        style={[
          styles.appThemedSelector,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.modelIconContainer}>
          <ModelIcon model={selectedModel as any} size={24} />
        </View>
        <Text style={[styles.appModelName, { color: colors.text }]}>
          {selectedModel.name}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.text} />
      </TouchableOpacity>

      {/* Model selection modal - matching AI Advisor exactly */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsModalVisible(false)}
        >
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor: isDark ? "#1a1f2c" : colors.background,
                borderTopColor: isDark ? "#ffffff20" : colors.border,
                borderTopWidth: 1,
              },
            ]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View
              style={[
                styles.enhancedModalHeader,
                { borderBottomColor: colors.border },
              ]}
            >
              <Text style={[styles.enhancedModalTitle, { color: colors.text }]}>
                Select Analysis Model
              </Text>
              <TouchableOpacity
                style={[
                  styles.doneButton,
                  {
                    backgroundColor: isDark
                      ? "#ffffff30"
                      : colors.primary + "20",
                    borderWidth: isDark ? 1 : 0,
                    borderColor: isDark ? "#ffffff50" : "transparent",
                  },
                ]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text
                  style={[
                    styles.doneButtonText,
                    { color: isDark ? "#ffffff" : colors.primary },
                  ]}
                >
                  Done
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modelList}>
              {models.map((model) => (
                <TouchableOpacity
                  key={model.id}
                  style={[
                    styles.enhancedModelItem,
                    {
                      backgroundColor:
                        model.id === selectedModel.id
                          ? `${colors.primary}15`
                          : colors.card,
                      borderBottomColor: colors.border,
                      borderColor:
                        model.id === selectedModel.id
                          ? colors.primary + "30"
                          : colors.border,
                    },
                  ]}
                  onPress={() => {
                    handleSelectModel(model);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.enhancedModelItemContent}>
                    <View
                      style={[
                        styles.enhancedModelIconContainer,
                        {
                          backgroundColor:
                            model.id === selectedModel.id
                              ? colors.primary + "20"
                              : colors.card,
                        },
                      ]}
                    >
                      <ModelIcon model={model as any} size={32} />
                    </View>
                    <View style={styles.modelInfo}>
                      <Text
                        style={[
                          styles.enhancedModelItemName,
                          { color: colors.text },
                        ]}
                      >
                        {model.name}
                      </Text>
                      {model.description && (
                        <Text
                          style={[
                            styles.enhancedModelItemDescription,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {model.description}
                        </Text>
                      )}
                    </View>
                  </View>

                  {model.id === selectedModel.id && (
                    <View
                      style={[
                        styles.enhancedCheckmark,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  appThemedSelector: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 21,
    borderWidth: 1,
    height: 46,
    minHeight: 46,
  },
  modelIconContainer: {
    marginRight: 8,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  appModelName: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "70%",
  },
  enhancedModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  enhancedModalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  doneButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modelList: {
    padding: 16,
    paddingTop: 8,
  },
  enhancedModelItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  enhancedModelItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  enhancedModelIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  modelInfo: {
    flex: 1,
  },
  enhancedModelItemName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 3,
  },
  enhancedModelItemDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  enhancedCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SMSModelSelector;
