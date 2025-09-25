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
import { ExpenseSplittingService } from "../../../../services/expenseSplittingService";

interface IndividualPerson {
  id: string;
  name: string;
  email: string;
  share_amount: number;
  share_percentage: number;
}

interface IndividualSplittingProps {
  totalAmount: number;
  onPeopleUpdate: (people: IndividualPerson[]) => void;
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

const IndividualSplitting: React.FC<IndividualSplittingProps> = ({
  totalAmount,
  onPeopleUpdate,
  colors,
  isDark = false,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [people, setPeople] = useState<IndividualPerson[]>([]);
  const [existingPeople, setExistingPeople] = useState<IndividualPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [editingPerson, setEditingPerson] = useState<IndividualPerson | null>(
    null
  );
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonEmail, setNewPersonEmail] = useState("");
  const [editPersonName, setEditPersonName] = useState("");
  const [editPersonEmail, setEditPersonEmail] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const [splitType, setSplitType] = useState<"equal" | "percentage" | "custom">(
    "equal"
  );
  const [currentUser, setCurrentUser] = useState<IndividualPerson | null>(null);

  // Add current user by default when component mounts
  useEffect(() => {
    addCurrentUser();
  }, []);

  // Function to add current user by default
  const addCurrentUser = async () => {
    try {
      setLoading(true);
      const user = await ExpenseSplittingService.getCurrentUser();
      if (user) {
        // Add user to people list if not already there
        const isAlreadyAdded = people.some((p) => p.id === user.id);
        if (!isAlreadyAdded) {
          const updatedPeople = [...people, user];
          setPeople(updatedPeople);
          calculateSplits(updatedPeople);
          setCurrentUser(user);
        }
      }
    } catch (error) {
      console.error("Failed to add current user:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load existing people when modal opens
  useEffect(() => {
    if (isModalVisible) {
      loadExistingPeople();
    }
  }, [isModalVisible]);

  const loadExistingPeople = async () => {
    try {
      setLoading(true);
      // Load existing individuals from database
      const individuals =
        await ExpenseSplittingService.getExistingIndividuals();
      setExistingPeople(individuals);
    } catch (error) {
      console.error("Failed to load existing people:", error);
      setExistingPeople([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPerson = async () => {
    if (!newPersonEmail.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    try {
      setLoading(true);
      // Add person to database and get the contact
      const newPerson = await ExpenseSplittingService.addIndividualContact(
        newPersonEmail.trim(),
        newPersonName.trim() || undefined
      );

      // Refresh existing people list to show the newly added person
      await loadExistingPeople();

      setNewPersonName("");
      setNewPersonEmail("");
      setShowAddPerson(false);

      // Show success message
      Alert.alert(
        "Success",
        "Person added! You can now select them from the existing list."
      );
    } catch (error) {
      console.error("Failed to add person:", error);
      Alert.alert("Error", "Failed to add person. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPerson = (person: IndividualPerson) => {
    // Check if this is the current user
    const isSelf = currentUser && person.id === currentUser.id;

    setEditingPerson({
      ...person,
      // Add a flag to identify if this is the current user
      isSelf: isSelf,
    } as IndividualPerson & { isSelf?: boolean });

    setEditPersonName(person.name);
    setEditPersonEmail(person.email);
    setShowEditForm(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPerson || !editPersonEmail.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    try {
      setLoading(true);

      // Check if this is the current user (self)
      const isSelf = (editingPerson as any).isSelf;

      if (!isSelf) {
        // Update external contact in database
        await ExpenseSplittingService.updateIndividualContact(
          editingPerson.id,
          {
            name: editPersonName.trim() || undefined,
            email: editPersonEmail.trim(),
          }
        );
      } else {
        // For self, we just update the local state
        // In a real app, you might want to update the user profile in the database
        console.log("Updating self in the split");
      }

      // Update local state
      const updatedPeople = people.map((p) =>
        p.id === editingPerson.id
          ? { ...p, name: editPersonName.trim(), email: editPersonEmail.trim() }
          : p
      );

      setPeople(updatedPeople);
      calculateSplits(updatedPeople);

      // If this was the current user, update the currentUser state
      if (isSelf) {
        setCurrentUser({
          ...currentUser!,
          name: editPersonName.trim(),
          email: editPersonEmail.trim(),
        });
      }

      // Refresh existing people list
      await loadExistingPeople();

      setEditingPerson(null);
      setEditPersonName("");
      setEditPersonEmail("");
      setShowEditForm(false);
    } catch (error) {
      console.error("Failed to update person:", error);
      Alert.alert("Error", "Failed to update person. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPerson(null);
    setEditPersonName("");
    setEditPersonEmail("");
    setShowEditForm(false);
  };

  const calculateSplits = (peopleList: IndividualPerson[]) => {
    if (peopleList.length === 0) {
      onPeopleUpdate([]);
      return;
    }

    const amountPerPerson = totalAmount / peopleList.length;
    const updatedPeople = peopleList.map((person) => ({
      ...person,
      share_amount: amountPerPerson,
      share_percentage: 100 / peopleList.length,
    }));

    setPeople(updatedPeople);
    onPeopleUpdate(updatedPeople);
  };

  const handleRemovePerson = (personId: string) => {
    // Check if this is the current user
    if (currentUser && personId === currentUser.id) {
      // Confirm before removing self
      Alert.alert(
        "Remove Yourself",
        "Are you sure you want to remove yourself from the split?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => {
              const updatedPeople = people.filter((p) => p.id !== personId);
              setPeople(updatedPeople);
              calculateSplits(updatedPeople);
              onPeopleUpdate(updatedPeople);
            },
          },
        ]
      );
    } else {
      // Remove other person normally
      const updatedPeople = people.filter((p) => p.id !== personId);
      setPeople(updatedPeople);
      calculateSplits(updatedPeople);
      onPeopleUpdate(updatedPeople);
    }
  };

  const handleDeletePerson = (personId: string) => {
    // Check if this is the current user
    if (currentUser && personId === currentUser.id) {
      Alert.alert(
        "Cannot Delete Yourself",
        "You cannot delete yourself from the contacts. You can only remove yourself from this split.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    Alert.alert(
      "Delete Person",
      "Are you sure you want to permanently delete this person? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              // Delete from database
              await ExpenseSplittingService.deleteIndividualContact(personId);

              // Remove from existing people
              setExistingPeople((prev) =>
                prev.filter((p) => p.id !== personId)
              );
              // Also remove from selected people if they were selected
              const updatedPeople = people.filter((p) => p.id !== personId);
              setPeople(updatedPeople);
              calculateSplits(updatedPeople);
              onPeopleUpdate(updatedPeople);
            } catch (error) {
              console.error("Failed to delete person:", error);
              Alert.alert(
                "Error",
                "Failed to delete person. Please try again."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSelectPerson = (person: IndividualPerson) => {
    const isAlreadySelected = people.some((p) => p.email === person.email);
    if (!isAlreadySelected) {
      const updatedPeople = [...people, person];
      setPeople(updatedPeople);
      calculateSplits(updatedPeople);
      onPeopleUpdate(updatedPeople);
    }
  };

  const handleAmountChange = (personId: string, amountText: string) => {
    const amount = parseFloat(amountText) || 0;
    const updatedPeople = people.map((person) =>
      person.id === personId ? { ...person, share_amount: amount } : person
    );
    setPeople(updatedPeople);
    onPeopleUpdate(updatedPeople);
  };

  return (
    <>
      {/* Individual selector button with validation icon */}
      <View style={styles.selectorContainer}>
        <TouchableOpacity
          style={[
            styles.selectorButton,
            {
              backgroundColor: colors.card,
              borderColor: people.length > 0 ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.selectorContent}>
            <Ionicons
              name={people.length > 0 ? "person" : "person-outline"}
              size={20}
              color={people.length > 0 ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.selectorText,
                {
                  color: people.length > 0 ? colors.primary : colors.text,
                  fontWeight: people.length > 0 ? "600" : "500",
                },
              ]}
            >
              {people.length > 0
                ? `${people.length} person${
                    people.length > 1 ? "s" : ""
                  } selected`
                : "Select individuals or add new"}
            </Text>
            <Ionicons
              name="chevron-down"
              size={18}
              color={colors.textSecondary}
            />
          </View>
        </TouchableOpacity>

        {/* Validation icon beside the selector */}
        {people.length > 0 && (
          <View style={styles.validationIconContainer}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.primary}
            />
          </View>
        )}
      </View>

      {/* Individual selection modal */}
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
                Select Individuals
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

            <ScrollView
              style={styles.peopleList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Add New Person Section */}
              <View style={styles.addSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Add New Person
                </Text>
                <View style={styles.addPersonForm}>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    placeholder="Name (optional)"
                    placeholderTextColor={colors.textSecondary}
                    value={newPersonName}
                    onChangeText={setNewPersonName}
                  />
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    placeholder="Email address"
                    placeholderTextColor={colors.textSecondary}
                    value={newPersonEmail}
                    onChangeText={setNewPersonEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={[
                      styles.addPersonButton,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={handleAddPerson}
                    disabled={!newPersonEmail.trim()}
                  >
                    <Text style={styles.addPersonButtonText}>Add Person</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Edit Person Form */}
              {showEditForm && editingPerson && (
                <View
                  style={[styles.editForm, { backgroundColor: colors.card }]}
                >
                  <Text style={[styles.editTitle, { color: colors.text }]}>
                    Edit Person
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    placeholder="Name (optional)"
                    placeholderTextColor={colors.textSecondary}
                    value={editPersonName}
                    onChangeText={setEditPersonName}
                  />
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    placeholder="Email address"
                    placeholderTextColor={colors.textSecondary}
                    value={editPersonEmail}
                    onChangeText={setEditPersonEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={[
                        styles.cancelButton,
                        { borderColor: colors.border },
                      ]}
                      onPress={handleCancelEdit}
                    >
                      <Text
                        style={[
                          styles.cancelButtonText,
                          { color: colors.text },
                        ]}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.saveButton,
                        { backgroundColor: colors.primary },
                      ]}
                      onPress={handleSaveEdit}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Existing People Section */}
              <View style={styles.existingSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Select from Existing
                </Text>
                {existingPeople.length > 0 ? (
                  existingPeople.map((person) => {
                    const isSelected = people.some(
                      (p) => p.email === person.email
                    );
                    return (
                      <TouchableOpacity
                        key={person.id}
                        style={[
                          styles.personItem,
                          {
                            backgroundColor: isSelected
                              ? `${colors.primary}15`
                              : colors.card,
                            borderColor: isSelected
                              ? colors.primary
                              : colors.border,
                          },
                        ]}
                        onPress={() => {
                          if (isSelected) {
                            handleRemovePerson(
                              people.find((p) => p.email === person.email)
                                ?.id || ""
                            );
                          } else {
                            handleSelectPerson(person);
                          }
                        }}
                      >
                        <View style={styles.personItemContent}>
                          <Ionicons
                            name={isSelected ? "person" : "person-outline"}
                            size={24}
                            color={
                              isSelected ? colors.primary : colors.textSecondary
                            }
                          />
                          <View style={styles.personInfo}>
                            <Text
                              style={[
                                styles.personName,
                                {
                                  color: isSelected
                                    ? colors.primary
                                    : colors.text,
                                  fontWeight: isSelected ? "600" : "500",
                                },
                              ]}
                            >
                              {person.name || person.email.split("@")[0]}
                            </Text>
                            <Text
                              style={[
                                styles.personEmail,
                                { color: colors.textSecondary },
                              ]}
                            >
                              {person.email}
                            </Text>
                          </View>
                          <View style={styles.personActions}>
                            <TouchableOpacity
                              style={styles.editButton}
                              onPress={() => handleEditPerson(person)}
                            >
                              <Ionicons
                                name="create-outline"
                                size={20}
                                color={colors.primary}
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.deleteButton}
                              onPress={() => handleDeletePerson(person.id)}
                            >
                              <Ionicons
                                name="trash-outline"
                                size={20}
                                color={colors.error}
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => {
                                if (isSelected) {
                                  handleRemovePerson(
                                    people.find((p) => p.email === person.email)
                                      ?.id || ""
                                  );
                                } else {
                                  handleSelectPerson(person);
                                }
                              }}
                            >
                              <Ionicons
                                name={
                                  isSelected ? "checkmark-circle" : "add-circle"
                                }
                                size={24}
                                color={
                                  isSelected ? colors.primary : colors.primary
                                }
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={styles.emptyExistingState}>
                    <Ionicons
                      name="people-outline"
                      size={48}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.emptyExistingText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      No previous individuals found
                    </Text>
                    <Text
                      style={[
                        styles.emptyExistingSubtext,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Add people above to get started
                    </Text>
                  </View>
                )}
              </View>

              {/* Selected People Section - Enhanced */}
              {people.length > 0 && (
                <View style={styles.selectedSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Selected ({people.length})
                  </Text>
                  {people.map((person) => (
                    <View
                      key={person.id}
                      style={[
                        styles.personItem,
                        {
                          backgroundColor: `${colors.primary}15`,
                          borderColor: colors.primary,
                        },
                      ]}
                    >
                      <View style={styles.personItemContent}>
                        <Ionicons
                          name="person"
                          size={20}
                          color={colors.primary}
                        />
                        <View style={styles.personInfo}>
                          <Text
                            style={[styles.personName, { color: colors.text }]}
                          >
                            {person.name || person.email.split("@")[0]}
                          </Text>
                          <Text
                            style={[
                              styles.personAmount,
                              { color: colors.primary },
                            ]}
                          >
                            ₹{person.share_amount.toFixed(2)}
                          </Text>
                        </View>
                        <View style={styles.personActions}>
                          <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => handleEditPerson(person)}
                          >
                            <Ionicons
                              name="create-outline"
                              size={18}
                              color={colors.primary}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => handleRemovePerson(person.id)}
                          >
                            <Ionicons
                              name="close-circle"
                              size={20}
                              color={colors.error}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Empty State - Only show if there are existing individuals but none selected */}
              {people.length === 0 && existingPeople.length > 0 && (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="people-outline"
                    size={48}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[styles.emptyText, { color: colors.textSecondary }]}
                  >
                    No people selected
                  </Text>
                  <Text
                    style={[
                      styles.emptySubtext,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Select people above to split the expense
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Split Type Selection */}
      {people.length > 0 && (
        <View style={styles.splitTypeSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Split Type
          </Text>
          <View style={styles.splitTypeButtons}>
            <TouchableOpacity
              style={[
                styles.splitTypeButton,
                {
                  backgroundColor:
                    splitType === "equal" ? colors.primary : colors.card,
                  borderColor:
                    splitType === "equal" ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSplitType("equal")}
            >
              <Ionicons
                name="people"
                size={16}
                color={splitType === "equal" ? "white" : colors.text}
              />
              <Text
                style={[
                  styles.splitTypeButtonText,
                  { color: splitType === "equal" ? "white" : colors.text },
                ]}
              >
                Equal
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.splitTypeButton,
                {
                  backgroundColor:
                    splitType === "percentage" ? colors.primary : colors.card,
                  borderColor:
                    splitType === "percentage" ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSplitType("percentage")}
            >
              <Ionicons
                name="pie-chart"
                size={16}
                color={splitType === "percentage" ? "white" : colors.text}
              />
              <Text
                style={[
                  styles.splitTypeButtonText,
                  { color: splitType === "percentage" ? "white" : colors.text },
                ]}
              >
                %
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.splitTypeButton,
                {
                  backgroundColor:
                    splitType === "custom" ? colors.primary : colors.card,
                  borderColor:
                    splitType === "custom" ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSplitType("custom")}
            >
              <Ionicons
                name="calculator"
                size={16}
                color={splitType === "custom" ? "white" : colors.text}
              />
              <Text
                style={[
                  styles.splitTypeButtonText,
                  { color: splitType === "custom" ? "white" : colors.text },
                ]}
              >
                Custom
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Participants Section */}
      {people.length > 0 && (
        <View style={styles.participantsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Participants ({people.length})
          </Text>
          {people.map((person) => (
            <View
              key={person.id}
              style={[
                styles.participantItem,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.participantInfo}>
                <Ionicons
                  name="person-circle"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.participantName, { color: colors.text }]}>
                  {person.name || person.email.split("@")[0]}
                </Text>
              </View>

              <View style={styles.participantInputs}>
                {splitType === "percentage" && (
                  <View style={styles.inputGroup}>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: colors.text,
                          borderColor: colors.border,
                        },
                      ]}
                      value={(person.share_percentage || 0).toFixed(1)}
                      onChangeText={(text) => {
                        const percentage = parseFloat(text) || 0;
                        const updatedPeople = people.map((p) =>
                          p.id === person.id
                            ? {
                                ...p,
                                share_percentage: percentage,
                                share_amount: (totalAmount * percentage) / 100,
                              }
                            : p
                        );
                        setPeople(updatedPeople);
                        calculateSplits(updatedPeople);
                      }}
                      keyboardType="numeric"
                      placeholder="0.0"
                      placeholderTextColor={colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.inputSuffix,
                        { color: colors.textSecondary },
                      ]}
                    >
                      %
                    </Text>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text
                    style={[
                      styles.currencySymbol,
                      { color: colors.textSecondary },
                    ]}
                  >
                    ₹
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={person.share_amount.toFixed(2)}
                    onChangeText={(text) => {
                      if (splitType === "custom") {
                        handleAmountChange(person.id, text);
                      }
                    }}
                    keyboardType="numeric"
                    editable={splitType === "custom"}
                    placeholder="0.00"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Summary Section */}
      {people.length > 0 && (
        <View style={styles.summarySection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Summary
          </Text>
          <View
            style={[
              styles.summaryContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.summaryRow}>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Total Amount:
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                ₹{totalAmount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Split Total:
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                ₹
                {people
                  .reduce((sum, person) => sum + person.share_amount, 0)
                  .toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Per Person:
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                ₹
                {people.length > 0
                  ? (totalAmount / people.length).toFixed(2)
                  : "0.00"}
              </Text>
            </View>
          </View>
        </View>
      )}
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
  peopleList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  addSection: {
    marginBottom: 24,
  },
  selectedSection: {
    marginBottom: 16,
  },
  existingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  addPersonForm: {
    gap: 12,
  },
  textInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
  },
  addPersonButton: {
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addPersonButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  personItem: {
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 6,
    padding: 16,
  },
  personItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  personInfo: {
    flex: 1,
    marginLeft: 12,
  },
  personName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  personEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  personAmount: {
    fontSize: 12,
    fontWeight: "600",
  },
  personActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 8,
  },
  editButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  removeButton: {
    padding: 4,
  },
  editForm: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  editTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  summarySection: {
    marginVertical: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  emptyExistingState: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyExistingText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 12,
  },
  emptyExistingSubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  // New styles for split sections
  splitTypeSection: {
    marginVertical: 16,
  },
  splitTypeButtons: {
    flexDirection: "row",
    gap: 8,
  },
  splitTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  splitTypeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  participantsSection: {
    marginVertical: 16,
  },
  participantItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  participantInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  participantAmount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  participantInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    minWidth: 60,
    textAlign: "right",
  },
  inputSuffix: {
    fontSize: 14,
    marginLeft: 4,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
  },
  amountInput: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    textAlign: "center",
    fontSize: 16,
  },
  summaryContainer: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default IndividualSplitting;
