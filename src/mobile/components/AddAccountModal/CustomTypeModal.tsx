import React from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CustomTypeModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: () => void;
  customType: string;
  onChangeCustomType: (text: string) => void;
  colors: any;
  styles: any;
}

export const CustomTypeModal: React.FC<CustomTypeModalProps> = ({
  visible,
  onClose,
  onAdd,
  customType,
  onChangeCustomType,
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
                styles.customModalContainer,
                { backgroundColor: colors.background },
              ]}
            >
              <View
                style={[
                  styles.customModalHeader,
                  {
                    backgroundColor: colors.card,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.customModalTitle, { color: colors.text }]}>
                  Add Custom Account Type
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.customModalContent}>
                <Text style={[styles.customModalLabel, { color: colors.text }]}>
                  Account Type Name
                </Text>
                <TextInput
                  style={[
                    styles.customModalInput,
                    {
                      backgroundColor: colors.card,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="e.g., Student Account"
                  placeholderTextColor={colors.textSecondary}
                  value={customType}
                  onChangeText={onChangeCustomType}
                  autoFocus
                />
                <TouchableOpacity
                  style={[
                    styles.customModalButton,
                    {
                      backgroundColor: customType.trim()
                        ? colors.primary
                        : colors.textSecondary,
                      opacity: customType.trim() ? 1 : 0.5,
                    },
                  ]}
                  onPress={onAdd}
                  disabled={!customType.trim()}
                >
                  <Text style={styles.customModalButtonText}>
                    Add Account Type
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CustomTypeModal;
