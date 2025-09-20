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

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <View style={styles.container}>
      {/* Current model display */}
      <TouchableOpacity
        style={[
          styles.selector,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
        onPress={toggleModal}
      >
        <View style={styles.modelAvatar}>
          <ModelIcon model={selectedModel} size={24} />
        </View>
        <Text style={[styles.modelName, { color: colors.text }]}>
          {selectedModel.name}
        </Text>
        <View
          style={[styles.chevron, { borderTopColor: colors.textSecondary }]}
        ></View>
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
              { backgroundColor: colors.background },
            ]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View
              style={[styles.modalHeader, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select AI Model
              </Text>
              <TouchableOpacity onPress={toggleModal}>
                <Text style={[styles.closeButton, { color: colors.primary }]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modelList}>
              {models.map((model) => (
                <TouchableOpacity
                  key={model.id}
                  style={[
                    styles.modelItem,
                    {
                      backgroundColor:
                        model.id === selectedModel.id
                          ? `${colors.primary}20`
                          : "transparent",
                      borderBottomColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    onSelectModel(model);
                    toggleModal();
                  }}
                >
                  <View style={styles.modelItemContent}>
                  <View style={styles.modelItemAvatar}>
                    <ModelIcon model={model} size={28} />
                  </View>
                    <View style={styles.modelInfo}>
                      <Text
                        style={[styles.modelItemName, { color: colors.text }]}
                      >
                        {model.name}
                      </Text>
                      {model.description && (
                        <Text
                          style={[
                            styles.modelItemDescription,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {model.description}
                        </Text>
                      )}
                    </View>
                  </View>

                  {model.id === selectedModel.id && (
                    <Text style={[styles.checkmark, { color: colors.primary }]}>
                      ✓
                    </Text>
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
