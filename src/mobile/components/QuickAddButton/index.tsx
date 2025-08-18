import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import BankStatementUploader from '../BankStatementUploader';
import BankStatementErrorBoundary from '../BankStatementUploader/BankStatementErrorBoundary';

interface QuickAddButtonProps {
  style?: any;
}

const QuickAddButton: React.FC<QuickAddButtonProps> = ({ style }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const { isDark } = useTheme();
  const navigation = useNavigation();

  const colors = isDark ? {
    background: '#1F2937',
    card: '#374151',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#4B5563',
    primary: '#10B981',
    secondary: '#3B82F6',
    accent: '#F59E0B',
  } : {
    background: '#FFFFFF',
    card: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    primary: '#10B981',
    secondary: '#3B82F6',
    accent: '#F59E0B',
  };

  const quickActions = [
    {
      id: 'transaction',
      title: 'Add Transaction',
      subtitle: 'Record income or expense',
      icon: 'add-circle',
      color: colors.primary,
      action: () => {
        setSelectedAction('transaction');
        setIsModalVisible(true);
      }
    },
    {
      id: 'bank-statement',
      title: 'Upload Statement',
      subtitle: 'Import from bank statement',
      icon: 'document-text',
      color: colors.secondary,
      action: () => {
        setSelectedAction('bank-statement');
        setIsModalVisible(true);
      }
    },
    {
      id: 'goal',
      title: 'Set Goal',
      subtitle: 'Create financial goal',
      icon: 'flag',
      color: colors.accent,
      action: () => {
        setSelectedAction('goal');
        setIsModalVisible(true);
      }
    },
    {
      id: 'budget',
      title: 'Set Budget',
      subtitle: 'Create spending budget',
      icon: 'pie-chart',
      color: '#8B5CF6',
      action: () => {
        setSelectedAction('budget');
        setIsModalVisible(true);
      }
    }
  ];

  const handleBankStatementUpload = (fileData: any) => {
    if (fileData && fileData.success) {
      Alert.alert('Upload Successful', fileData.message);
      // Here you can add logic to process the uploaded file
      // For example, send it to your backend or parse it
    } else {
      Alert.alert('Upload Failed', 'Please try uploading the file again.');
    }
  };

  const handleBackToQuickActions = () => {
    setSelectedAction(null);
  };

  const handleCloseModal = () => {
    setSelectedAction(null);
    setIsModalVisible(false);
  };

  const renderModalContent = () => {
    switch (selectedAction) {
      case 'bank-statement':
        return (
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Upload Bank Statement
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleBackToQuickActions}
              >
                <Ionicons name="arrow-back" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <BankStatementErrorBoundary>
              <BankStatementUploader
                onUpload={handleBankStatementUpload}
                isLoading={false}
                fileName=""
                showPlusIcons={true}
              />
            </BankStatementErrorBoundary>
          </View>
        );
      
      case 'transaction':
        return (
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Add Transaction
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleBackToQuickActions}
              >
                <Ionicons name="arrow-back" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.placeholderContent}>
              <Ionicons name="add-circle" size={64} color={colors.primary} />
              <Text style={[styles.placeholderTitle, { color: colors.text }]}>
                Add Transaction
              </Text>
              <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                Transaction form will be implemented here
              </Text>
            </View>
          </View>
        );
      
      case 'goal':
        return (
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Set Financial Goal
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleBackToQuickActions}
              >
                <Ionicons name="arrow-back" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.placeholderContent}>
              <Ionicons name="flag" size={64} color={colors.accent} />
              <Text style={[styles.placeholderTitle, { color: colors.text }]}>
                Set Goal
              </Text>
              <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                Goal setting form will be implemented here
              </Text>
            </View>
          </View>
        );
      
      case 'budget':
        return (
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Set Budget
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleBackToQuickActions}
              >
                <Ionicons name="arrow-back" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.placeholderContent}>
              <Ionicons name="pie-chart" size={64} color="#8B5CF6" />
              <Text style={[styles.placeholderTitle, { color: colors.text }]}>
                Set Budget
              </Text>
              <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                Budget setting form will be implemented here
              </Text>
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      {/* Main Quick Add Button */}
      <TouchableOpacity
        style={[styles.quickAddButton, { backgroundColor: colors.primary }, style]}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Quick Actions Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Modal Header */}
          <View style={styles.modalHeaderContainer}>
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>
              Quick Actions
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseModal}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Quick Actions Grid */}
          {!selectedAction && (
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.quickActionsGrid}>
                {quickActions.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={action.action}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.actionIconContainer, { backgroundColor: `${action.color}20` }]}>
                      <Ionicons name={action.icon as any} size={32} color={action.color} />
                    </View>
                    <Text style={[styles.actionTitle, { color: colors.text }]}>
                      {action.title}
                    </Text>
                    <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
                      {action.subtitle}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

          {/* Action-Specific Content */}
          {selectedAction && renderModalContent()}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  quickAddButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 30, // Reduced from 40
  },
  modalHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10, // Reduced from 12
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  modalScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 12, // Reduced from 16
    gap: 10, // Reduced from 12
  },
  actionCard: {
    width: '48%',
    padding: 14, // Reduced from 16
    borderRadius: 10, // Reduced from 12
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIconContainer: {
    width: 52, // Reduced from 56
    height: 52, // Reduced from 56
    borderRadius: 26, // Reduced from 28
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10, // Reduced from 12
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 5, // Reduced from 6
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10, // Reduced from 12
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24, // Reduced from 32
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10, // Reduced from 12
    marginBottom: 5, // Reduced from 6
  },
  placeholderText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default QuickAddButton;
