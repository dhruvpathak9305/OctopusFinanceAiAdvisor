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

interface CustomInstitutionModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: () => void;
  customInstitution: string;
  onChangeCustomInstitution: (text: string) => void;
  colors: any;
  styles: any;
}

export const CustomInstitutionModal: React.FC<CustomInstitutionModalProps> = ({
  visible,
  onClose,
  onAdd,
  customInstitution,
  onChangeCustomInstitution,
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
                  Add Custom Institution
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
                  Institution Name
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
                  placeholder="e.g., Local Credit Union"
                  placeholderTextColor={colors.textSecondary}
                  value={customInstitution}
                  onChangeText={onChangeCustomInstitution}
                  autoFocus
                />
                <TouchableOpacity
                  style={[
                    styles.customModalButton,
                    {
                      backgroundColor: customInstitution.trim()
                        ? colors.primary
                        : colors.textSecondary,
                      opacity: customInstitution.trim() ? 1 : 0.5,
                    },
                  ]}
                  onPress={onAdd}
                  disabled={!customInstitution.trim()}
                >
                  <Text style={styles.customModalButtonText}>
                    Add Institution
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

export default CustomInstitutionModal;
