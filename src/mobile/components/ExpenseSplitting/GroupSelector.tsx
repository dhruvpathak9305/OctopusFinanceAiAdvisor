import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Group } from "../../../types/splitting";
import { ExpenseSplittingService } from "../../../../services/expenseSplittingService";
import GroupManagement from "./GroupManagement";

interface GroupSelectorProps {
  selectedGroup?: Group;
  onSelectGroup: (group: Group | null) => void;
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

const GroupSelector: React.FC<GroupSelectorProps> = ({
  selectedGroup,
  onSelectGroup,
  colors,
  isDark = false,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  // Load user's groups
  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const userGroups = await ExpenseSplittingService.getUserGroups();
      setGroups(userGroups);
    } catch (error) {
      console.error("Failed to load groups:", error);
      Alert.alert("Error", "Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    try {
      setLoading(true);
      const newGroup = await ExpenseSplittingService.createGroup(
        newGroupName.trim()
      );
      setGroups([newGroup, ...groups]);
      setNewGroupName("");
      setShowCreateGroup(false);
      onSelectGroup(newGroup);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Failed to create group:", error);
      Alert.alert("Error", "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Group selector button with validation icon */}
      <View style={styles.selectorContainer}>
        <TouchableOpacity
          style={[
            styles.selectorButton,
            {
              backgroundColor: colors.card,
              borderColor: selectedGroup ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.selectorContent}>
            <Ionicons
              name={selectedGroup ? "people" : "people-outline"}
              size={20}
              color={selectedGroup ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.selectorText,
                {
                  color: selectedGroup ? colors.primary : colors.text,
                  fontWeight: selectedGroup ? "600" : "500",
                },
              ]}
            >
              {selectedGroup
                ? selectedGroup.name
                : "Select group or create new"}
            </Text>
            <Ionicons
              name="chevron-down"
              size={18}
              color={colors.textSecondary}
            />
          </View>
        </TouchableOpacity>

        {/* Validation icon beside the selector */}
        {selectedGroup && (
          <View style={styles.validationIconContainer}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.primary}
            />
          </View>
        )}
      </View>

      {/* Group selection modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: isDark ? "#1a1f2c" : colors.background,
                borderTopColor: isDark ? "#ffffff20" : colors.border,
              },
            ]}
          >
            {/* Modal header */}
            <View
              style={[styles.modalHeader, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Group
              </Text>
              <TouchableOpacity
                style={[
                  styles.doneButton,
                  {
                    backgroundColor: isDark
                      ? "#ffffff30"
                      : `${colors.primary}20`,
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

            <ScrollView style={styles.groupsList}>
              {/* No Group Option */}
              <TouchableOpacity
                style={[
                  styles.groupItem,
                  {
                    backgroundColor: !selectedGroup
                      ? `${colors.primary}15`
                      : colors.card,
                    borderColor: !selectedGroup
                      ? colors.primary
                      : colors.border,
                  },
                ]}
                onPress={() => {
                  onSelectGroup(null);
                  setIsModalVisible(false);
                }}
              >
                <View style={styles.groupItemContent}>
                  <Ionicons
                    name="person"
                    size={24}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.groupName, { color: colors.text }]}>
                    No Group (Individual)
                  </Text>
                  {!selectedGroup && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </View>
              </TouchableOpacity>

              {/* Existing Groups */}
              {groups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.groupItem,
                    {
                      backgroundColor:
                        selectedGroup?.id === group.id
                          ? `${colors.primary}15`
                          : colors.card,
                      borderColor:
                        selectedGroup?.id === group.id
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  onPress={() => {
                    onSelectGroup(group);
                    setIsModalVisible(false);
                  }}
                >
                  <View style={styles.groupItemContent}>
                    <Ionicons name="people" size={24} color={colors.primary} />
                    <View style={styles.groupInfo}>
                      <Text style={[styles.groupName, { color: colors.text }]}>
                        {group.name}
                      </Text>
                      {group.description && (
                        <Text
                          style={[
                            styles.groupDescription,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {group.description}
                        </Text>
                      )}
                    </View>
                    <View style={styles.groupActions}>
                      <GroupManagement
                        group={group}
                        members={[]} // Will be loaded by the component
                        onGroupUpdate={(updatedGroup) => {
                          // Update the local groups list
                          setGroups((prev) =>
                            prev.map((g) =>
                              g.id === updatedGroup.id ? updatedGroup : g
                            )
                          );
                        }}
                        onMembersUpdate={() => {
                          // Refresh members (handled by GroupManagement)
                        }}
                        onGroupDelete={(deletedGroupId) => {
                          // Remove group from list
                          setGroups((prev) =>
                            prev.filter((g) => g.id !== deletedGroupId)
                          );
                          // If this was the selected group, clear selection
                          if (selectedGroup?.id === deletedGroupId) {
                            onSelectGroup(null);
                          }
                        }}
                        colors={colors}
                        isDark={isDark}
                      />
                      <TouchableOpacity
                        style={[
                          styles.quickDeleteButton,
                          { backgroundColor: colors.error },
                        ]}
                        onPress={() => {
                          Alert.alert(
                            "Delete Group",
                            `Are you sure you want to delete "${group.name}"? This action cannot be undone.`,
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Delete",
                                style: "destructive",
                                onPress: async () => {
                                  try {
                                    await ExpenseSplittingService.deleteGroup(
                                      group.id
                                    );
                                    setGroups((prev) =>
                                      prev.filter((g) => g.id !== group.id)
                                    );
                                    if (selectedGroup?.id === group.id) {
                                      onSelectGroup(null);
                                    }
                                    Alert.alert(
                                      "Success",
                                      "Group deleted successfully!"
                                    );
                                  } catch (error) {
                                    console.error(
                                      "Failed to delete group:",
                                      error
                                    );
                                    Alert.alert(
                                      "Error",
                                      "Failed to delete group."
                                    );
                                  }
                                },
                              },
                            ]
                          );
                        }}
                      >
                        <Ionicons name="trash" size={14} color="white" />
                      </TouchableOpacity>
                      {selectedGroup?.id === group.id && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={colors.primary}
                          style={{ marginLeft: 8 }}
                        />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Create New Group */}
              {!showCreateGroup ? (
                <TouchableOpacity
                  style={[
                    styles.createGroupButton,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => setShowCreateGroup(true)}
                >
                  <Ionicons
                    name="add-circle"
                    size={24}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.createGroupText, { color: colors.primary }]}
                  >
                    Create New Group
                  </Text>
                </TouchableOpacity>
              ) : (
                <View
                  style={[
                    styles.createGroupForm,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.groupNameInput,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    placeholder="Enter group name (e.g., Trip to Goa)"
                    placeholderTextColor={colors.textSecondary}
                    value={newGroupName}
                    onChangeText={setNewGroupName}
                    autoFocus
                  />
                  <View style={styles.createGroupActions}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        { borderColor: colors.border },
                      ]}
                      onPress={() => {
                        setShowCreateGroup(false);
                        setNewGroupName("");
                      }}
                    >
                      <Text
                        style={[
                          styles.actionButtonText,
                          { color: colors.text },
                        ]}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        styles.createButton,
                        { backgroundColor: colors.primary },
                      ]}
                      onPress={handleCreateGroup}
                      disabled={loading}
                    >
                      <Text style={styles.createButtonText}>
                        {loading ? "Creating..." : "Create"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectorButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  selectorContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  validationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  selectorText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  modalTitle: {
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
  groupsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  groupItem: {
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 6,
    padding: 16,
  },
  groupItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupInfo: {
    flex: 1,
    marginLeft: 12,
  },
  groupActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quickDeleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  groupDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  createGroupButton: {
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    padding: 16,
    marginVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  createGroupText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  createGroupForm: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginVertical: 6,
  },
  groupNameInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  createGroupActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  createButton: {
    borderWidth: 0,
  },
  createButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
});

export default GroupSelector;
