import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme as useNavTheme } from "@react-navigation/native";
import {
  useTheme,
  darkTheme,
  lightTheme,
} from "../../../../contexts/ThemeContext";
import { FinancialRelationshipService } from "../../../../services/financialRelationshipService";
import { FinancialRelationship } from "../../../../types/financial-relationships";

interface RelationshipListProps {
  onSelectRelationship: (relationshipId: string) => void;
  onAddRelationship?: () => void;
}

type FilterType = "all" | "positive" | "negative";
type CategoryType = "all" | "individuals" | "groups" | "active";

const RelationshipList: React.FC<RelationshipListProps> = ({
  onSelectRelationship,
  onAddRelationship,
}) => {
  const { isDark } = useTheme();
  const navTheme = useNavTheme();
  const [loading, setLoading] = useState(true);
  const [relationships, setRelationships] = useState<FinancialRelationship[]>(
    []
  );
  const [filteredRelationships, setFilteredRelationships] = useState<
    FinancialRelationship[]
  >([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [category, setCategory] = useState<CategoryType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Use the dark theme but with specific adjustments to match the main dashboard
  const colors = {
    ...darkTheme,
    ...navTheme.colors,
    card: "#1F2937", // Darker card background to match the main dashboard
    primary: "#10B981", // Green primary color for buttons and accents
    success: "#10B981", // Green success color
    text: "#FFFFFF", // White text
    textSecondary: "#9CA3AF", // Gray secondary text
  };

  useEffect(() => {
    loadRelationships();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let filtered = [...relationships];

    // Apply type filter
    if (filter === "positive") {
      filtered = filtered.filter((rel) => rel.total_amount > 0);
    } else if (filter === "negative") {
      filtered = filtered.filter((rel) => rel.total_amount < 0);
    }

    // Apply category filter
    if (category === "individuals") {
      filtered = filtered.filter(
        (rel) => rel.relationship_type === "individual"
      );
    } else if (category === "groups") {
      filtered = filtered.filter((rel) => rel.relationship_type === "group");
    } else if (category === "active") {
      filtered = filtered.filter(
        (rel) => rel.has_active_loans || rel.has_active_splits
      );
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      // In a real implementation, we would search by user name/email
      // For now, we'll just filter by ID as a placeholder
      filtered = filtered.filter((rel) =>
        rel.related_user_id.toLowerCase().includes(query)
      );
    }

    setFilteredRelationships(filtered);
  }, [relationships, filter, category, searchQuery]);

  const loadRelationships = async () => {
    try {
      setLoading(true);

      // In a real implementation, we would fetch from the database
      // For now, create mock data based on the DB schema provided

      // Mock individual contacts from individual_contacts table
      const mockIndividualContacts = [
        {
          id: "ind-1",
          user_id: "current-user-id",
          contact_name: "Rahul Kumar",
          contact_email: "rahul@example.com",
          created_at: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updated_at: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          is_active: true,
          relationship_summary: JSON.stringify({
            total_borrowed: 2000,
            total_lent: 0,
            has_active_loans: true,
            has_active_splits: false,
            last_transaction_date: new Date(
              Date.now() - 5 * 24 * 60 * 60 * 1000
            ).toISOString(),
          }),
        },
        {
          id: "ind-2",
          user_id: "current-user-id",
          contact_name: "Priya Sharma",
          contact_email: "priya@example.com",
          created_at: new Date(
            Date.now() - 45 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updated_at: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
          is_active: true,
          relationship_summary: JSON.stringify({
            total_borrowed: 0,
            total_lent: 1500,
            has_active_loans: false,
            has_active_splits: true,
            last_transaction_date: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
          }),
        },
        {
          id: "ind-3",
          user_id: "current-user-id",
          contact_name: "Vikram Singh",
          contact_email: "vikram@example.com",
          created_at: new Date(
            Date.now() - 60 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updated_at: new Date(
            Date.now() - 15 * 24 * 60 * 60 * 1000
          ).toISOString(),
          is_active: true,
          relationship_summary: JSON.stringify({
            total_borrowed: 0,
            total_lent: 0,
            has_active_loans: false,
            has_active_splits: false,
            last_transaction_date: new Date(
              Date.now() - 15 * 24 * 60 * 60 * 1000
            ).toISOString(),
          }),
        },
      ];

      // Mock groups data from groups and group_members tables
      const mockGroups = [
        {
          id: "group-1",
          name: "Weekend Trip",
          description: "Trip to Goa expenses",
          created_by: "current-user-id",
          created_at: new Date(
            Date.now() - 20 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updated_at: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
          is_active: true,
          group_image_url: null,
          members: [
            { user_id: "user-1", user_name: "Rahul Kumar", role: "member" },
            { user_id: "user-2", user_name: "Priya Sharma", role: "member" },
            { user_id: "current-user-id", user_name: "You", role: "admin" },
          ],
          relationship_summary: {
            total_borrowed: 1200,
            total_lent: 3000,
            has_active_loans: true,
            has_active_splits: true,
            last_transaction_date: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        },
        {
          id: "group-2",
          name: "Office Team",
          description: "Office lunch and events",
          created_by: "user-4",
          created_at: new Date(
            Date.now() - 90 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updated_at: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          is_active: true,
          group_image_url: null,
          members: [
            { user_id: "user-3", user_name: "Amit Patel", role: "admin" },
            { user_id: "user-4", user_name: "Neha Gupta", role: "member" },
            { user_id: "current-user-id", user_name: "You", role: "member" },
            { user_id: "user-5", user_name: "Karan Malhotra", role: "member" },
          ],
          relationship_summary: {
            total_borrowed: 2500,
            total_lent: 0,
            has_active_loans: true,
            has_active_splits: false,
            last_transaction_date: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        },
      ];

      // Transform individual contacts to financial relationships
      const individualRelationships = mockIndividualContacts.map((contact) => {
        const summary =
          typeof contact.relationship_summary === "string"
            ? JSON.parse(contact.relationship_summary)
            : contact.relationship_summary || {};

        const totalAmount =
          (summary.total_lent || 0) - (summary.total_borrowed || 0);

        return {
          id: contact.id,
          user_id: contact.user_id,
          related_user_id: contact.id,
          relationship_type: "individual",
          total_amount: totalAmount,
          currency: "INR",
          is_active: contact.is_active,
          created_at: contact.created_at,
          updated_at: contact.updated_at,
          has_active_loans: summary.has_active_loans || false,
          has_active_splits: summary.has_active_splits || false,
          display_name: contact.contact_name,
          contact_email: contact.contact_email,
          last_activity: summary.last_transaction_date,
        };
      });

      // Transform groups to financial relationships
      const groupRelationships = mockGroups.map((group) => {
        const summary = group.relationship_summary || {};
        const totalAmount =
          (summary.total_lent || 0) - (summary.total_borrowed || 0);

        return {
          id: group.id,
          user_id: group.created_by,
          related_user_id: group.id,
          relationship_type: "group",
          total_amount: totalAmount,
          currency: "INR",
          is_active: group.is_active,
          created_at: group.created_at,
          updated_at: group.updated_at,
          has_active_loans: summary.has_active_loans || false,
          has_active_splits: summary.has_active_splits || false,
          display_name: group.name,
          description: group.description,
          member_count: group.members.length,
          last_activity: summary.last_transaction_date,
          group_image_url: group.group_image_url,
        };
      });

      // Combine all relationships with type assertion
      const allRelationships = [
        ...individualRelationships,
        ...groupRelationships,
      ] as FinancialRelationship[];

      setRelationships(allRelationships);
      setFilteredRelationships(allRelationships);
    } catch (error) {
      console.error("Error loading relationships:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${Math.abs(amount).toFixed(2)}`;
  };

  const getRelationshipLastActivity = (relationship: FinancialRelationship) => {
    // Use last_activity from our mock data if available
    if (relationship.last_activity) {
      const lastActivity = new Date(relationship.last_activity);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - lastActivity.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return "Today";
      } else if (diffDays === 1) {
        return "Yesterday";
      } else {
        return `${diffDays} days ago`;
      }
    }

    // Fallback to using the updated_at field
    if (relationship.updated_at) {
      const lastUpdate = new Date(relationship.updated_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - lastUpdate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return "Today";
      } else if (diffDays === 1) {
        return "Yesterday";
      } else {
        return `${diffDays} days ago`;
      }
    }

    // Final fallback
    return "No recent activity";
  };

  const getUserName = (item: FinancialRelationship) => {
    // Use display_name from our mock data if available
    if (item.display_name) {
      return item.display_name;
    }

    // Fallback to random name generation
    const userId = item.related_user_id;
    const names = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Neha"];
    const nameIndex =
      Math.abs(userId.charCodeAt(0) + userId.charCodeAt(userId.length - 1)) %
      names.length;
    return names[nameIndex];
  };

  const renderRelationshipItem = ({
    item,
  }: {
    item: FinancialRelationship;
  }) => {
    const isPositive = item.total_amount >= 0;
    const isGroup = item.relationship_type === "group";
    const hasActiveItems = item.has_active_loans || item.has_active_splits;

    // Status indicator at the top
    const getStatusColor = () => {
      if (hasActiveItems) {
        return isPositive ? "#10B981" : "#EF4444";
      }
      return "#6B7280"; // Gray for inactive
    };

    return (
      <TouchableOpacity
        style={[styles.relationshipCard, { backgroundColor: darkTheme.card }]}
        onPress={() => onSelectRelationship(item.id)}
      >
        {/* Status indicator strip */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: getStatusColor(),
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        />

        <View style={styles.relationshipHeader}>
          <View style={styles.userInfo}>
            <View
              style={[
                styles.userAvatar,
                {
                  backgroundColor: isGroup
                    ? "rgba(59,130,246,0.2)" // Blue for groups
                    : isPositive
                    ? "rgba(16,185,129,0.2)" // Green for positive
                    : "rgba(239,68,68,0.2)", // Red for negative
                },
              ]}
            >
              <Ionicons
                name={isGroup ? "people" : "person"}
                size={24}
                color={
                  isGroup
                    ? "#3B82F6" // Blue for groups
                    : isPositive
                    ? "#10B981" // Green for positive
                    : "#EF4444" // Red for negative
                }
              />
            </View>
            <View>
              <Text style={[styles.userName, { color: colors.text }]}>
                {getUserName(item)}
              </Text>
              <View style={styles.badgeContainer}>
                {isGroup && (
                  <View
                    style={[
                      styles.typeBadge,
                      { backgroundColor: "rgba(59,130,246,0.2)" },
                    ]}
                  >
                    <Text style={[styles.typeBadgeText, { color: "#3B82F6" }]}>
                      Group{item.member_count ? ` (${item.member_count})` : ""}
                    </Text>
                  </View>
                )}
                {item.has_active_loans && (
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: "rgba(245,158,11,0.2)" },
                    ]}
                  >
                    <Text
                      style={[styles.statusBadgeText, { color: "#F59E0B" }]}
                    >
                      Loan
                    </Text>
                  </View>
                )}
                {item.has_active_splits && (
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: "rgba(16,185,129,0.2)" },
                    ]}
                  >
                    <Text
                      style={[styles.statusBadgeText, { color: "#10B981" }]}
                    >
                      Split
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </View>

        <View style={styles.relationshipDetails}>
          <View style={styles.balanceContainer}>
            <Text
              style={[styles.balanceLabel, { color: colors.textSecondary }]}
            >
              {isPositive ? "They owe you:" : "You owe:"}
            </Text>
            <Text
              style={[
                styles.balanceAmount,
                { color: isPositive ? "#10B981" : "#EF4444" },
              ]}
            >
              {formatCurrency(item.total_amount)}
            </Text>
          </View>

          {isGroup && item.description && (
            <Text
              style={[styles.groupDescription, { color: colors.textSecondary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.description}
            </Text>
          )}
          <Text style={[styles.lastActivity, { color: colors.textSecondary }]}>
            Last activity: {getRelationshipLastActivity(item)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: darkTheme.background }]}>
      {/* Header */}
      <Text style={[styles.title, { color: colors.text }]}>
        FINANCIAL RELATIONSHIPS
      </Text>

      {/* Filter Tabs - Balance Filter */}
      <View
        style={[
          styles.filterTabs,
          { backgroundColor: "#1F2937", borderColor: "#374151" },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "all" && { backgroundColor: "#10B981" },
          ]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: filter === "all" ? "white" : colors.text },
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "positive" && { backgroundColor: "#10B981" },
          ]}
          onPress={() => setFilter("positive")}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: filter === "positive" ? "white" : colors.text },
            ]}
          >
            They owe me
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "negative" && { backgroundColor: "#10B981" },
          ]}
          onPress={() => setFilter("negative")}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: filter === "negative" ? "white" : colors.text },
            ]}
          >
            I owe them
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Tabs - Type Filter */}
      <View
        style={[
          styles.categoryTabs,
          { backgroundColor: "#1F2937", borderColor: "#374151", marginTop: 10 },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.categoryTab,
            category === "all" && { backgroundColor: "#10B981" },
          ]}
          onPress={() => setCategory("all")}
        >
          <Ionicons
            name="people"
            size={16}
            color={category === "all" ? "white" : colors.text}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.categoryTabText,
              { color: category === "all" ? "white" : colors.text },
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.categoryTab,
            category === "individuals" && { backgroundColor: "#10B981" },
          ]}
          onPress={() => setCategory("individuals")}
        >
          <Ionicons
            name="person"
            size={16}
            color={category === "individuals" ? "white" : colors.text}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.categoryTabText,
              { color: category === "individuals" ? "white" : colors.text },
            ]}
          >
            Individuals
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.categoryTab,
            category === "groups" && { backgroundColor: "#10B981" },
          ]}
          onPress={() => setCategory("groups")}
        >
          <Ionicons
            name="people-circle"
            size={16}
            color={category === "groups" ? "white" : colors.text}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.categoryTabText,
              { color: category === "groups" ? "white" : colors.text },
            ]}
          >
            Groups
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.categoryTab,
            category === "active" && { backgroundColor: "#10B981" },
          ]}
          onPress={() => setCategory("active")}
        >
          <Ionicons
            name="pulse"
            size={16}
            color={category === "active" ? "white" : colors.text}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.categoryTabText,
              { color: category === "active" ? "white" : colors.text },
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: "#1F2937", borderColor: "#374151" },
        ]}
      >
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search relationships..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Relationships List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredRelationships.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No relationships found
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            {filter !== "all"
              ? "Try changing your filter"
              : searchQuery
              ? "Try a different search term"
              : "Add a relationship to get started"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRelationships}
          keyExtractor={(item) => item.id}
          renderItem={renderRelationshipItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Add Relationship Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={onAddRelationship}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  filterTabs: {
    flexDirection: "row",
    marginBottom: 8,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 4,
    alignItems: "center",
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  categoryTabs: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    marginRight: 4,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 80, // Space for the add button
  },
  relationshipCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  relationshipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "rgba(16,185,129,0.1)",
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
  },
  badgeContainer: {
    flexDirection: "row",
    marginTop: 4,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  relationshipDetails: {
    marginTop: 4,
  },
  balanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  groupDescription: {
    fontSize: 12,
    marginTop: 2,
    fontStyle: "italic",
  },
  lastActivity: {
    fontSize: 12,
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default RelationshipList;
