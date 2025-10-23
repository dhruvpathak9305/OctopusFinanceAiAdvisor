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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Group, GroupMember } from "../../../types/splitting";
import { ExpenseSplittingService } from "../../../../services/expenseSplittingService";

interface GroupManagementProps {
  group: Group;
  members: GroupMember[];
  onGroupUpdate: (updatedGroup: Group) => void;
  onMembersUpdate: (updatedMembers: GroupMember[]) => void;
  onGroupDelete: (deletedGroupId: string) => void;
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    surface: string;
    error: string;
  };
  isDark?: boolean;
}

const GroupManagement: React.FC<GroupManagementProps> = ({
  group,
  members,
  onGroupUpdate,
  onMembersUpdate,
  onGroupDelete,
  colors,
  isDark = false,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"members" | "settings">("members");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [editGroupName, setEditGroupName] = useState(group.name);
  const [editGroupDescription, setEditGroupDescription] = useState(
    group.description || ""
  );
  const [loading, setLoading] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberMobile, setNewMemberMobile] = useState("");
  const [newMemberRelationship, setNewMemberRelationship] = useState("");
  const [localMembers, setLocalMembers] = useState<GroupMember[]>(members);
  const [editingMember, setEditingMember] = useState<GroupMember | null>(null);
  const [editMemberName, setEditMemberName] = useState("");
  const [editMemberEmail, setEditMemberEmail] = useState("");
  const [editMemberMobile, setEditMemberMobile] = useState("");
  const [editMemberRelationship, setEditMemberRelationship] = useState("");
  const [editMemberRole, setEditMemberRole] = useState<"member" | "admin">(
    "member"
  );

  // Load members when component mounts
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        const groupMembers = await ExpenseSplittingService.getGroupMembers(
          group.id
        );
        setLocalMembers(groupMembers);
        onMembersUpdate(groupMembers);
      } catch (error) {
        console.error("Failed to load group members:", error);
      } finally {
        setLoading(false);
      }
    };

    if (localMembers.length === 0) {
      loadMembers();
    }
  }, [group.id, onMembersUpdate]);

  // Update local members when props change
  useEffect(() => {
    setLocalMembers(members);
  }, [members]);

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    try {
      setLoading(true);
      console.log(
        `Adding member: ${newMemberEmail} (${newMemberName || "No name"})`
      );

      await ExpenseSplittingService.addGroupMember(
        group.id,
        newMemberEmail.trim(),
        newMemberName.trim() || undefined,
        "member",
        newMemberMobile.trim() || undefined,
        newMemberRelationship.trim() || undefined
      );

      // Small delay to ensure database operation completes
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Refresh members list
      console.log("Refreshing members list after adding member...");
      const updatedMembers = await ExpenseSplittingService.getGroupMembers(
        group.id
      );
      console.log("Updated members received:", updatedMembers);
      setLocalMembers(updatedMembers);
      onMembersUpdate(updatedMembers);

      setNewMemberEmail("");
      setNewMemberName("");
      setNewMemberMobile("");
      setNewMemberRelationship("");
      Alert.alert("Success", "Member added successfully!");
    } catch (error) {
      console.error("Failed to add member:", error);
      let errorMessage =
        "Failed to add member. Please check the email address.";

      if (error instanceof Error) {
        if (error.message.includes("already a member")) {
          errorMessage = "This person is already a member of this group.";
        }
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    Alert.alert("Remove Member", `Remove ${memberName} from ${group.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            console.log(`Removing member ${memberId} from group ${group.id}`);

            await ExpenseSplittingService.removeGroupMember(group.id, memberId);

            // Refresh members list
            const updatedMembers =
              await ExpenseSplittingService.getGroupMembers(group.id);
            setLocalMembers(updatedMembers);
            onMembersUpdate(updatedMembers);

            Alert.alert("Success", "Member removed successfully!");
          } catch (error) {
            console.error("Failed to remove member:", error);
            Alert.alert("Error", "Failed to remove member.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleEditMember = (member: GroupMember) => {
    setEditingMember(member);
    setEditMemberName(member.user_name || "");
    setEditMemberEmail(member.user_email || "");
    setEditMemberMobile(member.mobile_number || "");
    setEditMemberRelationship(member.relationship || "");
    setEditMemberRole(member.role);
  };

  const handleSaveMemberEdit = async () => {
    if (!editingMember) return;

    if (!editMemberName.trim() || !editMemberEmail.trim()) {
      Alert.alert("Error", "Name and email are required");
      return;
    }

    try {
      setLoading(true);
      await ExpenseSplittingService.editGroupMember(
        group.id,
        editingMember.id,
        {
          user_name: editMemberName.trim(),
          user_email: editMemberEmail.trim(),
          mobile_number: editMemberMobile.trim() || undefined,
          relationship: editMemberRelationship.trim() || undefined,
          role: editMemberRole,
        }
      );

      // Refresh members list
      const updatedMembers = await ExpenseSplittingService.getGroupMembers(
        group.id
      );
      setLocalMembers(updatedMembers);
      onMembersUpdate(updatedMembers);

      setEditingMember(null);
      Alert.alert("Success", "Member updated successfully!");
    } catch (error) {
      console.error("Failed to update member:", error);
      Alert.alert("Error", "Failed to update member.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGroup = async () => {
    if (!editGroupName.trim()) {
      Alert.alert("Error", "Group name cannot be empty");
      return;
    }

    try {
      setLoading(true);
      await ExpenseSplittingService.updateGroup(group.id, {
        name: editGroupName.trim(),
        description: editGroupDescription.trim(),
      });

      const updatedGroup = {
        ...group,
        name: editGroupName.trim(),
        description: editGroupDescription.trim(),
      };
      onGroupUpdate(updatedGroup);
      Alert.alert("Success", "Group updated successfully!");
      setIsModalVisible(false);
    } catch (error) {
      console.error("Failed to update group:", error);
      Alert.alert("Error", "Failed to update group.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      "Delete Group",
      `Are you sure you want to delete "${group.name}"? This action cannot be undone and will remove all members and expense history.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await ExpenseSplittingService.deleteGroup(group.id);
              onGroupDelete(group.id);
              Alert.alert("Success", "Group deleted successfully!");
              setIsModalVisible(false);
            } catch (error) {
              console.error("Failed to delete group:", error);
              Alert.alert("Error", "Failed to delete group.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      {/* Group Management Button */}
      <TouchableOpacity
        style={[
          styles.managementButton,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons
          name="settings-outline"
          size={16}
          color={colors.textSecondary}
        />
        <Text
          style={[styles.managementButtonText, { color: colors.textSecondary }]}
        >
          Manage Group
        </Text>
      </TouchableOpacity>

      {/* Group Management Modal */}
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
            {/* Modal Header */}
            <View
              style={[styles.modalHeader, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Manage "{group.name}"
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

            {/* Tab Selector */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  {
                    backgroundColor:
                      activeTab === "members" ? colors.primary : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setActiveTab("members")}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: activeTab === "members" ? "white" : colors.text,
                    },
                  ]}
                >
                  Members ({localMembers.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  {
                    backgroundColor:
                      activeTab === "settings" ? colors.primary : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setActiveTab("settings")}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: activeTab === "settings" ? "white" : colors.text,
                    },
                  ]}
                >
                  Settings
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {activeTab === "members" ? (
                <View style={styles.membersTab}>
                  {/* Add Member Section */}
                  <View style={styles.addMemberSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Add Member
                    </Text>
                    <View style={styles.inputFields}>
                      <TextInput
                        style={[
                          styles.textInput,
                          {
                            color: colors.text,
                            borderColor: colors.border,
                            backgroundColor: colors.card,
                            marginBottom: 8,
                          },
                        ]}
                        placeholder="Name (optional)"
                        placeholderTextColor={colors.textSecondary}
                        value={newMemberName}
                        onChangeText={setNewMemberName}
                        autoCapitalize="words"
                      />
                      <View style={styles.addMemberForm}>
                        <TextInput
                          style={[
                            styles.emailInput,
                            {
                              color: colors.text,
                              borderColor: colors.border,
                              backgroundColor: colors.card,
                            },
                          ]}
                          placeholder="Email address"
                          placeholderTextColor={colors.textSecondary}
                          value={newMemberEmail}
                          onChangeText={setNewMemberEmail}
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                        <TouchableOpacity
                          style={[
                            styles.addButton,
                            { backgroundColor: colors.primary },
                          ]}
                          onPress={handleAddMember}
                          disabled={loading}
                        >
                          {loading ? (
                            <ActivityIndicator size="small" color="white" />
                          ) : (
                            <Ionicons name="add" size={20} color="white" />
                          )}
                        </TouchableOpacity>
                      </View>
                      <TextInput
                        style={[
                          styles.textInput,
                          {
                            color: colors.text,
                            borderColor: colors.border,
                            backgroundColor: colors.card,
                            marginTop: 8,
                            marginBottom: 8,
                          },
                        ]}
                        placeholder="Mobile Number (optional)"
                        placeholderTextColor={colors.textSecondary}
                        value={newMemberMobile}
                        onChangeText={setNewMemberMobile}
                        keyboardType="phone-pad"
                      />
                      <TextInput
                        style={[
                          styles.textInput,
                          {
                            color: colors.text,
                            borderColor: colors.border,
                            backgroundColor: colors.card,
                            marginBottom: 8,
                          },
                        ]}
                        placeholder="Relationship (e.g., Friend, Family, Colleague)"
                        placeholderTextColor={colors.textSecondary}
                        value={newMemberRelationship}
                        onChangeText={setNewMemberRelationship}
                        autoCapitalize="words"
                      />
                      <Text
                        style={[
                          styles.helperText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Note: Members don't need to be registered users
                      </Text>
                    </View>
                  </View>

                  {/* Members List */}
                  <View style={styles.membersSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Current Members ({localMembers.length})
                    </Text>
                    {loading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator
                          size="small"
                          color={colors.primary}
                        />
                        <Text
                          style={[
                            styles.loadingText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          Loading members...
                        </Text>
                      </View>
                    ) : localMembers.length === 0 ? (
                      <View style={styles.emptyState}>
                        <Ionicons
                          name="people-outline"
                          size={48}
                          color={colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.emptyStateText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          No members yet
                        </Text>
                        <Text
                          style={[
                            styles.emptyStateSubtext,
                            { color: colors.textSecondary },
                          ]}
                        >
                          Add members to start splitting expenses
                        </Text>
                      </View>
                    ) : (
                      localMembers.map((member) => (
                        <View
                          key={member.id}
                          style={[
                            styles.memberItem,
                            {
                              backgroundColor: colors.card,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <View style={styles.memberInfo}>
                            <Ionicons
                              name={
                                member.is_registered_user
                                  ? "person-circle"
                                  : "person-outline"
                              }
                              size={24}
                              color={
                                member.is_registered_user
                                  ? colors.primary
                                  : colors.textSecondary
                              }
                            />
                            <View style={styles.memberDetails}>
                              <Text
                                style={[
                                  styles.memberName,
                                  { color: colors.text },
                                ]}
                              >
                                {member.user_name}
                              </Text>
                              <Text
                                style={[
                                  styles.memberEmail,
                                  { color: colors.textSecondary },
                                ]}
                              >
                                {member.user_email}
                              </Text>
                              {member.mobile_number && (
                                <Text
                                  style={[
                                    styles.memberPhone,
                                    { color: colors.textSecondary },
                                  ]}
                                >
                                  📱 {member.mobile_number}
                                </Text>
                              )}
                              {member.relationship && (
                                <Text
                                  style={[
                                    styles.memberRelationship,
                                    { color: colors.textSecondary },
                                  ]}
                                >
                                  👤 {member.relationship}
                                </Text>
                              )}
                              <View style={styles.memberBadges}>
                                {member.role === "admin" && (
                                  <Text
                                    style={[
                                      styles.adminBadge,
                                      { color: colors.primary },
                                    ]}
                                  >
                                    Admin
                                  </Text>
                                )}
                                {!member.is_registered_user && (
                                  <Text
                                    style={[
                                      styles.guestBadge,
                                      { color: colors.textSecondary },
                                    ]}
                                  >
                                    Guest
                                  </Text>
                                )}
                              </View>
                            </View>
                          </View>
                          <View style={styles.memberActions}>
                            <TouchableOpacity
                              style={[
                                styles.actionButton,
                                { backgroundColor: colors.primary },
                              ]}
                              onPress={() => handleEditMember(member)}
                            >
                              <Ionicons name="pencil" size={16} color="white" />
                            </TouchableOpacity>
                            {member.role !== "admin" && (
                              <TouchableOpacity
                                style={[
                                  styles.actionButton,
                                  { backgroundColor: colors.error },
                                ]}
                                onPress={() =>
                                  handleRemoveMember(
                                    member.id,
                                    member.user_name || "Unknown"
                                  )
                                }
                              >
                                <Ionicons
                                  name="trash"
                                  size={16}
                                  color="white"
                                />
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                </View>
              ) : (
                <View style={styles.settingsTab}>
                  {/* Group Settings */}
                  <View style={styles.settingSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Group Details
                    </Text>

                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: colors.text }]}>
                        Group Name
                      </Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          {
                            color: colors.text,
                            borderColor: colors.border,
                            backgroundColor: colors.card,
                          },
                        ]}
                        value={editGroupName}
                        onChangeText={setEditGroupName}
                        placeholder="Enter group name"
                        placeholderTextColor={colors.textSecondary}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: colors.text }]}>
                        Description (Optional)
                      </Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          styles.multilineInput,
                          {
                            color: colors.text,
                            borderColor: colors.border,
                            backgroundColor: colors.card,
                          },
                        ]}
                        value={editGroupDescription}
                        onChangeText={setEditGroupDescription}
                        placeholder="Enter group description"
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={3}
                      />
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.updateButton,
                        { backgroundColor: colors.primary },
                      ]}
                      onPress={handleUpdateGroup}
                      disabled={loading}
                    >
                      <Text style={styles.updateButtonText}>
                        {loading ? "Updating..." : "Update Group"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Danger Zone */}
                  <View style={styles.dangerZone}>
                    <Text
                      style={[styles.sectionTitle, { color: colors.error }]}
                    >
                      Danger Zone
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.dangerButton,
                        { borderColor: colors.error },
                      ]}
                      onPress={handleDeleteGroup}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color={colors.error}
                      />
                      <Text
                        style={[
                          styles.dangerButtonText,
                          { color: colors.error },
                        ]}
                      >
                        Delete Group
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        visible={editingMember !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditingMember(null)}
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
            {/* Modal Header */}
            <View
              style={[styles.modalHeader, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Edit Member
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
                onPress={() => setEditingMember(null)}
              >
                <Text
                  style={[
                    styles.doneButtonText,
                    { color: isDark ? "#ffffff" : colors.primary },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.settingsTab}>
                <View style={styles.settingSection}>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Name
                    </Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          color: colors.text,
                          borderColor: colors.border,
                          backgroundColor: colors.card,
                        },
                      ]}
                      value={editMemberName}
                      onChangeText={setEditMemberName}
                      placeholder="Enter member name"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Email
                    </Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          color: colors.text,
                          borderColor: colors.border,
                          backgroundColor: colors.card,
                        },
                      ]}
                      value={editMemberEmail}
                      onChangeText={setEditMemberEmail}
                      placeholder="Enter email address"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Mobile Number (Optional)
                    </Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          color: colors.text,
                          borderColor: colors.border,
                          backgroundColor: colors.card,
                        },
                      ]}
                      value={editMemberMobile}
                      onChangeText={setEditMemberMobile}
                      placeholder="Enter mobile number"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Relationship (Optional)
                    </Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          color: colors.text,
                          borderColor: colors.border,
                          backgroundColor: colors.card,
                        },
                      ]}
                      value={editMemberRelationship}
                      onChangeText={setEditMemberRelationship}
                      placeholder="e.g., Friend, Family, Colleague"
                      placeholderTextColor={colors.textSecondary}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Role
                    </Text>
                    <View style={styles.roleSelector}>
                      <TouchableOpacity
                        style={[
                          styles.roleButton,
                          {
                            backgroundColor:
                              editMemberRole === "member"
                                ? colors.primary
                                : colors.card,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => setEditMemberRole("member")}
                      >
                        <Text
                          style={[
                            styles.roleButtonText,
                            {
                              color:
                                editMemberRole === "member"
                                  ? "white"
                                  : colors.text,
                            },
                          ]}
                        >
                          Member
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.roleButton,
                          {
                            backgroundColor:
                              editMemberRole === "admin"
                                ? colors.primary
                                : colors.card,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => setEditMemberRole("admin")}
                      >
                        <Text
                          style={[
                            styles.roleButtonText,
                            {
                              color:
                                editMemberRole === "admin"
                                  ? "white"
                                  : colors.text,
                            },
                          ]}
                        >
                          Admin
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.updateButton,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={handleSaveMemberEdit}
                    disabled={loading}
                  >
                    <Text style={styles.updateButtonText}>
                      {loading ? "Saving..." : "Save Changes"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  managementButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginLeft: 8,
  },
  managementButtonText: {
    fontSize: 12,
    marginLeft: 4,
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
    maxHeight: "90%",
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
    fontSize: 18,
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
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  membersTab: {
    padding: 16,
  },
  settingsTab: {
    padding: 16,
  },
  addMemberSection: {
    marginBottom: 24,
  },
  inputFields: {
    width: "100%",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  addMemberForm: {
    flexDirection: "row",
    gap: 8,
  },
  emailInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  helperText: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: "italic",
  },
  membersSection: {
    marginBottom: 16,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  memberDetails: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  memberPhone: {
    fontSize: 13,
    marginBottom: 2,
  },
  memberRelationship: {
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: 2,
  },
  memberBadges: {
    flexDirection: "row",
    marginTop: 4,
    gap: 8,
  },
  adminBadge: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  guestBadge: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "rgba(156, 163, 175, 0.1)",
  },
  memberActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  roleSelector: {
    flexDirection: "row",
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  settingSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  updateButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  updateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  dangerZone: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(239, 68, 68, 0.2)",
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default GroupManagement;
