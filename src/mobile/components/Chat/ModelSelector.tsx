import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
  Image,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ChatModel } from "../../types/chat";

interface ModelSelectorProps {
  models: ChatModel[];
  selectedModel: ChatModel;
  onSelectModel: (model: ChatModel) => void;
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
  };
}

// Import shared ModelIcon component
import ModelIcon from '../../components/ModelIcon';

const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onSelectModel,
  colors,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <View style={styles.container}>
      {/* Enhanced model selector with modern styling */}
      <TouchableOpacity
        style={[
          styles.enhancedSelector,
          { 
            backgroundColor: colors.card,
            borderColor: colors.primary + '30',
          },
        ]}
        onPress={toggleModal}
        activeOpacity={0.7}
      >
        <View style={styles.modelIconContainer}>
          <ModelIcon model={selectedModel} size={26} />
        </View>
        <Text style={[styles.enhancedModelName, { color: colors.text }]}>
          {selectedModel.name}
        </Text>
        <View style={styles.chevronContainer}>
          <Ionicons 
            name="chevron-down" 
            size={18} 
            color={colors.primary} 
          />
        </View>
      </TouchableOpacity>

      {/* Model selection modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleModal}
      >
        <Pressable style={styles.modalOverlay} onPress={toggleModal}>
          <View
            style={[
              styles.modalContainer,
              { 
                backgroundColor: isDark ? '#1a1f2c' : colors.background,
                borderTopColor: isDark ? '#ffffff20' : colors.border,
                borderTopWidth: 1,
              },
            ]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View
              style={[styles.enhancedModalHeader, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.enhancedModalTitle, { color: colors.text }]}>
                Select AI Model
              </Text>
              <TouchableOpacity 
                style={[
                  styles.doneButton, 
                  { 
                    backgroundColor: isDark ? '#ffffff30' : colors.primary + '20',
                    borderWidth: isDark ? 1 : 0,
                    borderColor: isDark ? '#ffffff50' : 'transparent',
                  }
                ]} 
                onPress={toggleModal}
              >
                <Text style={[
                  styles.doneButtonText, 
                  { color: isDark ? '#ffffff' : colors.primary }
                ]}>
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
                      borderColor: model.id === selectedModel.id ? colors.primary + "30" : colors.border,
                    },
                  ]}
                  onPress={() => {
                    onSelectModel(model);
                    toggleModal();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.enhancedModelItemContent}>
                    <View style={[
                      styles.enhancedModelIconContainer,
                      {
                        backgroundColor: model.id === selectedModel.id ? colors.primary + "20" : colors.card,
                      }
                    ]}>
                      <ModelIcon model={model} size={32} />
                    </View>
                    <View style={styles.modelInfo}>
                      <Text
                        style={[styles.enhancedModelItemName, { color: colors.text }]}
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
                    <View style={[
                      styles.enhancedCheckmark,
                      { backgroundColor: colors.primary }
                    ]}>
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  // Enhanced selector styles
  enhancedSelector: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  modelIconContainer: {
    marginRight: 10,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enhancedModelName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  chevronContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Original styles kept for reference
  selector: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 40,
  },
  modelAvatar: {
    marginRight: 8,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modelName: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  chevron: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderLeftColor: "transparent",
    borderRightWidth: 5,
    borderRightColor: "transparent",
    borderTopWidth: 5,
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
  // Enhanced modal header styles
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
  // Original modal header styles kept for reference
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  modelList: {
    padding: 16,
    paddingTop: 8,
  },
  // Enhanced model item styles
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
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Original model item styles kept for reference
  modelItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
  },
  modelItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modelItemAvatar: {
    fontSize: 22,
    marginRight: 12,
  },
  modelInfo: {
    flex: 1,
  },
  modelItemName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  modelItemDescription: {
    fontSize: 12,
  },
  checkmark: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default ModelSelector;
