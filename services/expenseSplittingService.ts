import { supabase } from "../lib/supabase/client";
import {
  Group,
  GroupMember,
  TransactionSplit,
  SplitCalculation,
  GroupBalance,
  SplitFormData,
  SplitValidation,
  SPLIT_TYPES,
  SETTLEMENT_METHODS,
  IndividualPerson,
} from "../types/splitting";
import { FinancialRelationshipService } from "./financialRelationshipService";

export class ExpenseSplittingService {
  // Create a new group
  static async createGroup(
    name: string,
    description?: string,
    memberEmails: string[] = []
  ): Promise<Group> {
    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Create group
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert({
          name,
          description,
          created_by: user.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin
      const { error: adminError } = await supabase
        .from("group_members")
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: "admin",
          user_name: user.email?.split("@")[0] || "You",
          user_email: user.email || "",
          is_registered_user: true,
        });

      if (adminError) {
        console.error("Error adding creator as admin:", adminError);
        // Don't throw error, group was created successfully
      }

      // Add other members as regular members
      for (const email of memberEmails) {
        try {
          await this.addGroupMember(group.id, email, undefined, "member");
        } catch (error) {
          console.error(`Failed to add member ${email}:`, error);
          // Continue with other members
        }
      }

      return group;
    } catch (error) {
      console.error("Error creating group:", error);
      throw new Error("Failed to create group");
    }
  }

  // Get user's groups
  static async getUserGroups(): Promise<Group[]> {
    try {
      // Get current user first
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Simplified query to avoid RLS recursion
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .eq("created_by", user.id)
        .eq("is_active", true)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching user groups:", error);
      throw new Error("Failed to fetch groups");
    }
  }

  // Get group members
  static async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    try {
      console.log("Fetching group members for group:", groupId);

      // Get current user for authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Fetch real members from database
      console.log(`Querying group_members for group_id: ${groupId}`);
      const { data, error } = await supabase
        .from("group_members")
        .select("*")
        .eq("group_id", groupId)
        .eq("is_active", true)
        .order("joined_at", { ascending: true });

      if (error) {
        console.error("Database error fetching group members:", error);
        throw error;
      }

      console.log("Raw database data:", data);

      // Transform database data to GroupMember format
      const members: GroupMember[] = (data || []).map((member: any) => ({
        id: member.id,
        group_id: member.group_id,
        user_id: member.user_id,
        role: member.role,
        joined_at: member.joined_at,
        is_active: member.is_active,
        user_name: member.user_name || "Unknown",
        user_email: member.user_email || "",
        mobile_number: member.mobile_number || undefined,
        relationship: member.relationship || undefined,
        is_registered_user: member.is_registered_user || false,
      }));

      console.log("Transformed group members:", members);
      return members;
    } catch (error) {
      console.error("Error fetching group members:", error);
      throw new Error("Failed to fetch group members");
    }
  }

  // Calculate equal splits
  static calculateEqualSplits(
    totalAmount: number,
    participants: { user_id: string; user_name: string }[]
  ): SplitCalculation[] {
    const splitAmount = totalAmount / participants.length;
    const roundedSplit = Math.round(splitAmount * 100) / 100;

    // Handle rounding by giving the difference to the first participant
    const totalRounded = roundedSplit * participants.length;
    const difference = Math.round((totalAmount - totalRounded) * 100) / 100;

    return participants.map((participant, index) => ({
      user_id: participant.user_id,
      user_name: participant.user_name,
      share_amount: index === 0 ? roundedSplit + difference : roundedSplit,
      share_percentage: 100 / participants.length,
      is_paid: false,
    }));
  }

  // Calculate percentage splits
  static calculatePercentageSplits(
    totalAmount: number,
    participants: { user_id: string; user_name: string; percentage: number }[]
  ): SplitCalculation[] {
    return participants.map((participant) => ({
      user_id: participant.user_id,
      user_name: participant.user_name,
      share_amount:
        Math.round(((totalAmount * participant.percentage) / 100) * 100) / 100,
      share_percentage: participant.percentage,
      is_paid: false,
    }));
  }

  // Validate split calculations
  static validateSplits(
    totalAmount: number,
    splits: SplitCalculation[]
  ): SplitValidation {
    const totalShares = splits.reduce(
      (sum, split) => sum + split.share_amount,
      0
    );
    const difference = Math.round((totalShares - totalAmount) * 100) / 100;
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if splits total matches transaction amount
    if (Math.abs(difference) > 0.01) {
      errors.push(
        `Split total (₹${totalShares}) doesn't match transaction amount (₹${totalAmount})`
      );
    }

    // Check for negative amounts
    const negativeAmounts = splits.filter((split) => split.share_amount < 0);
    if (negativeAmounts.length > 0) {
      errors.push("Split amounts cannot be negative");
    }

    // Check for zero amounts
    const zeroAmounts = splits.filter((split) => split.share_amount === 0);
    if (zeroAmounts.length > 0) {
      warnings.push(`${zeroAmounts.length} participants have zero amount`);
    }

    return {
      is_valid: errors.length === 0,
      total_shares: totalShares,
      expected_total: totalAmount,
      difference: difference,
      errors,
      warnings,
    };
  }

  // Create transaction with splits (supports both registered and guest users)
  static async createTransactionWithSplits(
    transactionData: any,
    splits: SplitCalculation[],
    groupId?: string,
    splitType: string = "equal",
    paidByUserId?: string  // NEW: Who actually paid for this expense
  ): Promise<string> {
    try {
      // Validate splits first
      const validation = this.validateSplits(transactionData.amount, splits);
      if (!validation.is_valid) {
        throw new Error(`Invalid splits: ${validation.errors.join(", ")}`);
      }

      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Check if paidByUserId is a guest user (doesn't exist in auth.users)
      const payerGuest = paidByUserId && splits.find(
        s => (s.is_guest || !s.user_id) && s.user_id === paidByUserId
      );
      
      const isPayerGuest = !!payerGuest;
      
      // Determine actual paid_by value and guest payer details:
      // - If payer is a guest: paid_by = NULL, populate guest payer fields
      // - If payer is specified and registered: paid_by = paidByUserId
      // - Default: paid_by = current user
      const actualPaidBy = isPayerGuest ? null : (paidByUserId || user.id);
      
      // Extract guest payer details if payer is a guest
      const guestPayerDetails = isPayerGuest ? {
        paid_by_guest_name: payerGuest?.user_name || payerGuest?.name || null,
        paid_by_guest_email: payerGuest?.user_email || payerGuest?.email || null,
        paid_by_guest_mobile: payerGuest?.mobile_number || payerGuest?.phone || null,
      } : {
        paid_by_guest_name: null,
        paid_by_guest_email: null,
        paid_by_guest_mobile: null,
      };
      
      // Log payer information
      if (isPayerGuest) {
        console.log(
          `✅ Guest user selected as payer: ${guestPayerDetails.paid_by_guest_name} (${guestPayerDetails.paid_by_guest_email})`
        );
      } else if (paidByUserId) {
        console.log(`✅ Registered user selected as payer: ${paidByUserId}`);
      } else {
        console.log(`✅ Current user is payer (default): ${user.id}`);
      }

      // Prepare splits data for database function
      const splitsData = await Promise.all(
        splits.map(async (split: any) => {
          // Check if this is a guest user (has user_email but not registered)
          const isGuest = split.is_guest || (split.user_email && !split.user_id);

          if (isGuest) {
            // Guest user split
            return {
              is_guest: true,
              user_name: split.user_name || split.name,
              user_email: split.user_email || split.email,
              mobile_number: split.mobile_number || split.phone || null,
              relationship: split.relationship || null,
              group_id: groupId || null,
              share_amount: split.share_amount,
              share_percentage: split.share_percentage || null,
              split_type: splitType,
              paid_by: actualPaidBy, // NULL for guest payers
              // Guest payer details (populated if a guest paid)
              paid_by_guest_name: guestPayerDetails.paid_by_guest_name,
              paid_by_guest_email: guestPayerDetails.paid_by_guest_email,
              paid_by_guest_mobile: guestPayerDetails.paid_by_guest_mobile,
              notes: split.notes || null,
            };
          } else {
            // Registered user split
            // Create or get financial relationship for this split
            let relationshipId = null;

            // Only create relationship if this is not the current user
            if (split.user_id !== user.id) {
              try {
                const relationship =
                  await FinancialRelationshipService.getRelationshipWithUser(
                    split.user_id
                  );
                if (relationship) {
                  relationshipId = relationship.id;
                } else {
                  const newRelationship =
                    await FinancialRelationshipService.createRelationship(
                      split.user_id,
                      "split_expense"
                    );
                  relationshipId = newRelationship.id;
                }
              } catch (err) {
                console.error("Error creating financial relationship:", err);
                // Continue without relationship if there's an error
              }
            }

            return {
              is_guest: false,
              user_id: split.user_id,
              group_id: groupId || null,
              relationship_id: relationshipId,
              share_amount: split.share_amount,
              share_percentage: split.share_percentage || null,
              split_type: splitType,
              paid_by: actualPaidBy, // Registered user ID or NULL for guest payers
              // Guest payer details (populated if a guest paid)
              paid_by_guest_name: guestPayerDetails.paid_by_guest_name,
              paid_by_guest_email: guestPayerDetails.paid_by_guest_email,
              paid_by_guest_mobile: guestPayerDetails.paid_by_guest_mobile,
              notes: split.notes || null,
            };
          }
        })
      );

      // Add split_type to transaction metadata
      const enhancedTransactionData = {
        ...transactionData,
        metadata: {
          ...(transactionData.metadata || {}),
          has_splits: true,
          split_count: splits.length,
          split_type: splitType,
        },
      };

      // Debug: Log what we're sending to database
      console.log("📤 Sending to database function:");
      console.log("  Transaction:", enhancedTransactionData.name);
      console.log("  Splits count:", splitsData.length);
      console.log("  Splits paid_by values:", splitsData.map(s => ({
        user: s.user_name || s.user_id,
        is_guest: s.is_guest,
        paid_by: s.paid_by,
      })));

      const { data, error } = await supabase.rpc(
        "create_transaction_with_splits",
        {
          p_transaction_data: enhancedTransactionData,
          p_splits: splitsData,
        }
      );

      if (error) {
        console.error("❌ Database function error:", error);
        throw error;
      }
      
      console.log("✅ Transaction created successfully:", data);

      // Update relationship balances for registered users only (skip guest users)
      const relationshipIds = splitsData
        .map((split) => split.relationship_id)
        .filter((id) => id !== null && id !== undefined && id !== '') as string[];

      // Update each relationship balance
      if (relationshipIds.length > 0) {
        console.log(`Updating ${relationshipIds.length} relationship balances...`);
        for (const relationshipId of relationshipIds) {
          try {
            await FinancialRelationshipService.updateRelationshipBalance(
              relationshipId
            );
          } catch (err) {
            console.warn(
              `Skipping relationship balance update for ${relationshipId}:`,
              err
            );
            // Continue even if balance update fails - this is non-critical for guest users
          }
        }
      } else {
        console.log('No registered user relationships to update (all splits are guests)');
      }

      return data;
    } catch (error) {
      console.error("Error creating transaction with splits:", error);
      throw new Error("Failed to create split transaction");
    }
  }

  // Get transaction splits
  static async getTransactionSplits(
    transactionId: string
  ): Promise<TransactionSplit[]> {
    try {
      const { data, error } = await supabase
        .from("transaction_splits")
        .select("*")
        .eq("transaction_id", transactionId);

      if (error) throw error;

      // Return splits with all fields
      // User data is stored in guest fields (guest_name, guest_email, etc.)
      return (data || []).map((split: any) => ({
        ...split,
        // Map guest fields to user fields for backward compatibility
        user_name: split.guest_name || null,
        user_email: split.guest_email || null,
      }));
    } catch (error) {
      console.error("Error fetching transaction splits:", error);
      throw new Error("Failed to fetch transaction splits");
    }
  }

  // Get group balances
  static async getGroupBalances(groupId: string): Promise<GroupBalance[]> {
    try {
      const { data, error } = await supabase.rpc("get_group_balances", {
        p_group_id: groupId,
      });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching group balances:", error);
      throw new Error("Failed to fetch group balances");
    }
  }

  // Settle a split
  static async settleSplit(
    splitId: string,
    settlementMethod: string = "other",
    notes?: string
  ): Promise<boolean> {
    try {
      // First, get the split to find the relationship_id
      const { data: splitData, error: splitError } = await supabase
        .from("transaction_splits")
        .select("relationship_id")
        .eq("id", splitId)
        .single();

      if (splitError) throw splitError;

      // Call the RPC to settle the split
      const { data, error } = await supabase.rpc("settle_transaction_split", {
        p_split_id: splitId,
        p_settlement_method: settlementMethod,
        p_notes: notes,
      });

      if (error) throw error;

      // If there's a relationship, update its balance
      if (splitData?.relationship_id) {
        try {
          await FinancialRelationshipService.updateRelationshipBalance(
            splitData.relationship_id
          );
        } catch (err) {
          console.error(
            `Error updating relationship balance for ${splitData.relationship_id}:`,
            err
          );
          // Continue even if balance update fails
        }
      }

      return data;
    } catch (error) {
      console.error("Error settling split:", error);
      throw new Error("Failed to settle split");
    }
  }

  // Get user's unsettled splits
  static async getUserUnsettledSplits(): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc("get_user_unsettled_splits");

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching unsettled splits:", error);
      throw new Error("Failed to fetch unsettled splits");
    }
  }

  // Add member to group (supports both registered and non-registered users)
  static async addGroupMember(
    groupId: string,
    userEmail: string,
    userName?: string,
    role: "member" | "admin" = "member",
    mobileNumber?: string,
    relationship?: string
  ): Promise<boolean> {
    try {
      console.log(
        `Adding member to group ${groupId}: ${userEmail} (${
          userName || "no name provided"
        })`
      );

      // Get current user for authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // For now, treat all users as guests since we can't easily check auth.users
      // In a real implementation, you'd have a users table or use Supabase's admin API
      // Generate a proper UUID for guest users
      const generateUUID = () => {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
          /[xy]/g,
          function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          }
        );
      };

      const userId = generateUUID();
      const isRegisteredUser = false;
      const finalUserName = userName || userEmail.split("@")[0];

      // Check if user is already in the group
      const { data: existingMember } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", groupId)
        .eq("user_id", userId)
        .single();

      if (existingMember) {
        throw new Error("This person is already a member of this group");
      }

      // Insert the member directly
      const { data, error } = await supabase
        .from("group_members")
        .insert({
          group_id: groupId,
          user_id: userId,
          role: role,
          user_name: finalUserName,
          user_email: userEmail,
          mobile_number: mobileNumber || null,
          relationship: relationship || null,
          is_registered_user: isRegisteredUser,
        })
        .select()
        .single();

      if (error) {
        console.error("Database error adding member:", error);
        throw error;
      }

      console.log("Member added successfully:", data);
      return true;
    } catch (error) {
      console.error("Error adding group member:", error);
      // Provide more specific error message based on the error
      if (error instanceof Error) {
        if (error.message.includes("already a member")) {
          throw new Error("This person is already a member of this group");
        }
      }
      throw new Error("Failed to add group member");
    }
  }

  // Edit member in group
  static async editGroupMember(
    groupId: string,
    memberId: string,
    updates: {
      user_name?: string;
      user_email?: string;
      mobile_number?: string;
      relationship?: string;
      role?: "member" | "admin";
    }
  ): Promise<boolean> {
    try {
      console.log(`Editing member ${memberId} in group ${groupId}:`, updates);

      const { error } = await supabase
        .from("group_members")
        .update(updates)
        .eq("id", memberId)
        .eq("group_id", groupId);

      if (error) {
        console.error("Database error editing member:", error);
        throw error;
      }

      console.log("Member edited successfully");
      return true;
    } catch (error) {
      console.error("Error editing group member:", error);
      throw new Error("Failed to edit group member");
    }
  }

  // Remove member from group
  static async removeGroupMember(
    groupId: string,
    memberId: string
  ): Promise<boolean> {
    try {
      console.log(`Removing member ${memberId} from group ${groupId}`);

      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("id", memberId)
        .eq("group_id", groupId);

      if (error) {
        console.error("Database error removing member:", error);
        throw error;
      }

      console.log("Member removed successfully");
      return true;
    } catch (error) {
      console.error("Error removing group member:", error);
      throw new Error("Failed to remove group member");
    }
  }

  // Update group details
  static async updateGroup(
    groupId: string,
    updates: {
      name?: string;
      description?: string;
    }
  ): Promise<boolean> {
    try {
      console.log(`Updating group ${groupId}:`, updates);

      const { error } = await supabase
        .from("groups")
        .update(updates)
        .eq("id", groupId);

      if (error) {
        console.error("Database error updating group:", error);
        throw error;
      }

      console.log("Group updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating group:", error);
      throw new Error("Failed to update group");
    }
  }

  // Delete group
  static async deleteGroup(groupId: string): Promise<boolean> {
    try {
      console.log(`Deleting group ${groupId}`);

      const { error } = await supabase
        .from("groups")
        .delete()
        .eq("id", groupId);

      if (error) {
        console.error("Database error deleting group:", error);
        throw error;
      }

      console.log("Group deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting group:", error);
      throw new Error("Failed to delete group");
    }
  }

  // Get current user information
  static async getCurrentUser(): Promise<IndividualPerson | null> {
    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Create IndividualPerson object for current user
      return {
        id: user.id,
        name: user.email?.split("@")[0] || "You",
        email: user.email || "",
        share_amount: 0,
        share_percentage: 0,
      };
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  /**
   * Creates a test contact in the database for the current user
   * This is used for debugging and ensuring at least one contact exists
   * @returns Promise<boolean> - Success status
   */
  static async createTestContact(): Promise<boolean> {
    try {
      // Call the stored procedure to create a test contact
      const { error } = await supabase.rpc("create_test_contacts");

      if (error) {
        console.error("Error creating test contact:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error creating test contact:", error);
      return false;
    }
  }

  /**
   * Retrieves all individual contacts for the current user from the database
   * These contacts can be used for expense splitting
   * @returns Promise<IndividualPerson[]> - List of individual contacts
   */
  static async getExistingIndividuals(): Promise<IndividualPerson[]> {
    try {
      // Get current user for authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Create a test contact to ensure we have at least one (for development)
      await this.createTestContact();

      // Fetch contacts from the individual_contacts table
      const { data, error } = await supabase
        .from("individual_contacts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Database error fetching contacts:", error);
        throw error;
      }

      // Convert database records to IndividualPerson objects
      const individuals: IndividualPerson[] = (data || []).map(
        (contact: any) => ({
          id: contact.id,
          name: contact.contact_name || contact.contact_email.split("@")[0],
          email: contact.contact_email,
          share_amount: 0,
          share_percentage: 0,
        })
      );

      return individuals;
    } catch (error) {
      console.error("Error fetching existing individuals:", error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  /**
   * Adds a new individual contact to the database
   * If the contact already exists, returns the existing contact
   * @param email - Email address of the contact
   * @param name - Optional name of the contact
   * @returns Promise<IndividualPerson> - The created or existing contact
   */
  static async addIndividualContact(
    email: string,
    name?: string
  ): Promise<IndividualPerson> {
    try {
      // Get current user for authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Insert into individual_contacts table
      const { data, error } = await supabase
        .from("individual_contacts")
        .insert({
          user_id: user.id,
          contact_name: name || null,
          contact_email: email,
        })
        .select()
        .single();

      if (error) {
        // Check for unique constraint violation
        if (error.code === "23505") {
          // If it's a duplicate, try to fetch the existing record
          const { data: existingData, error: fetchError } = await supabase
            .from("individual_contacts")
            .select("*")
            .eq("user_id", user.id)
            .eq("contact_email", email)
            .eq("is_active", true)
            .single();

          if (fetchError) {
            console.error("Error fetching existing contact:", fetchError);
            throw new Error(
              "This contact already exists but couldn't be retrieved"
            );
          }

          // Return the existing contact
          const existingContact: IndividualPerson = {
            id: existingData.id,
            name:
              existingData.contact_name ||
              existingData.contact_email.split("@")[0],
            email: existingData.contact_email,
            share_amount: 0,
            share_percentage: 0,
          };

          return existingContact;
        }
        console.error("Database error adding contact:", error);
        throw error;
      }

      // Convert to IndividualPerson
      const contact: IndividualPerson = {
        id: data.id,
        name: data.contact_name || data.contact_email.split("@")[0],
        email: data.contact_email,
        share_amount: 0,
        share_percentage: 0,
      };

      return contact;
    } catch (error) {
      console.error("Error adding individual contact:", error);
      throw new Error("Failed to add individual contact");
    }
  }

  /**
   * Marks an individual contact as inactive (soft delete)
   * @param contactId - ID of the contact to delete
   * @returns Promise<boolean> - Success status
   */
  static async deleteIndividualContact(contactId: string): Promise<boolean> {
    try {
      // Get current user for authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Delete from database (or mark as inactive)
      const { error } = await supabase
        .from("individual_contacts")
        .update({ is_active: false })
        .eq("id", contactId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Database error deleting contact:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error deleting individual contact:", error);
      throw new Error("Failed to delete individual contact");
    }
  }

  /**
   * Updates an existing individual contact
   * @param contactId - ID of the contact to update
   * @param updates - Object containing name and/or email to update
   * @returns Promise<boolean> - Success status
   */
  static async updateIndividualContact(
    contactId: string,
    updates: { name?: string; email?: string }
  ): Promise<boolean> {
    try {
      // Get current user for authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Prepare update data
      const updateData: { contact_name?: string; contact_email?: string } = {};
      if (updates.name !== undefined) {
        updateData.contact_name = updates.name || null; // Allow clearing the name
      }
      if (updates.email !== undefined) {
        updateData.contact_email = updates.email;
      }

      // Update in database
      const { error } = await supabase
        .from("individual_contacts")
        .update(updateData)
        .eq("id", contactId)
        .eq("user_id", user.id);

      if (error) {
        // Check for unique constraint violation
        if (error.code === "23505") {
          throw new Error("A contact with this email already exists");
        }
        console.error("Database error updating contact:", error);
        throw error;
      }

      console.log("Contact updated successfully in database");
      return true;
    } catch (error) {
      console.error("Error updating individual contact:", error);
      throw new Error("Failed to update individual contact");
    }
  }
}
