import { supabase } from "../lib/supabase/client";
import {
  FinancialRelationship,
  RelationshipSummary,
  RelationshipType,
  RelationshipTransaction,
} from "../types/financial-relationships";

/**
 * Service for managing financial relationships between users
 */
export class FinancialRelationshipService {
  /**
   * Creates a new financial relationship between the current user and another user
   * @param relatedUserId - ID of the user to create a relationship with
   * @param relationshipType - Type of relationship ('lender', 'borrower', 'split_expense')
   * @returns The created relationship
   */
  static async createRelationship(
    relatedUserId: string,
    relationshipType: RelationshipType = "split_expense"
  ): Promise<FinancialRelationship> {
    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Use the stored function to create or get relationship
      const { data: relationshipId, error } = await supabase.rpc(
        "create_or_get_financial_relationship",
        {
          p_related_user_id: relatedUserId,
          p_relationship_type: relationshipType,
        }
      );

      if (error) {
        throw error;
      }

      // Fetch the created/existing relationship
      const { data: relationship, error: fetchError } = await supabase
        .from("financial_relationships")
        .select("*")
        .eq("id", relationshipId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      return relationship;
    } catch (error) {
      console.error("Error creating financial relationship:", error);
      throw new Error("Failed to create financial relationship");
    }
  }

  /**
   * Gets all financial relationships for the current user
   * @param filter - Optional filter criteria ('all', 'positive', 'negative')
   * @returns Array of financial relationships
   */
  static async getRelationships(
    filter: "all" | "positive" | "negative" = "all"
  ): Promise<FinancialRelationship[]> {
    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Start building the query
      let query = supabase
        .from("financial_relationships")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);

      // Apply filter if needed
      if (filter === "positive") {
        query = query.gt("total_amount", 0);
      } else if (filter === "negative") {
        query = query.lt("total_amount", 0);
      }

      // Execute query
      const { data, error } = await query.order("updated_at", {
        ascending: false,
      });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching financial relationships:", error);
      throw new Error("Failed to fetch financial relationships");
    }
  }

  /**
   * Gets a summary of a specific financial relationship
   * @param relationshipId - ID of the relationship
   * @returns Relationship summary object
   */
  static async getRelationshipSummary(
    relationshipId: string
  ): Promise<RelationshipSummary> {
    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Fetch the relationship
      const { data: relationship, error: relationshipError } = await supabase
        .from("financial_relationships")
        .select("*")
        .eq("id", relationshipId)
        .eq("user_id", user.id)
        .single();

      if (relationshipError) {
        throw relationshipError;
      }

      if (!relationship) {
        throw new Error("Relationship not found");
      }

      // Fetch active loans
      const { data: loans, error: loansError } = await supabase
        .from("loans")
        .select("*")
        .eq("relationship_id", relationshipId)
        .neq("status", "paid");

      if (loansError) {
        throw loansError;
      }

      // Fetch transaction splits
      const { data: splits, error: splitsError } = await supabase
        .from("transaction_splits")
        .select("*, transactions(*)")
        .eq("relationship_id", relationshipId)
        .eq("is_paid", false);

      if (splitsError) {
        throw splitsError;
      }

      // Fetch recent transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from("transaction_splits")
        .select("*, transactions(*)")
        .eq("relationship_id", relationshipId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (transactionsError) {
        throw transactionsError;
      }

      // Format transactions for the summary
      const formattedTransactions: RelationshipTransaction[] = (
        transactions || []
      ).map((split: any) => ({
        id: split.id,
        transactionId: split.transaction_id,
        description: split.transactions?.description || "Transaction",
        amount: split.share_amount,
        date: split.created_at,
        isPaid: split.is_paid,
        type: "split",
      }));

      // Add loan transactions
      const { data: loanPayments, error: paymentsError } = await supabase
        .from("loan_payments")
        .select("*, loans(*)")
        .in(
          "loan_id",
          (loans || []).map((loan: any) => loan.id)
        )
        .order("payment_date", { ascending: false })
        .limit(10);

      if (paymentsError) {
        throw paymentsError;
      }

      // Add loan payments to transactions
      (loanPayments || []).forEach((payment: any) => {
        formattedTransactions.push({
          id: payment.id,
          transactionId: payment.loan_id,
          description: `Loan Payment: ${payment.loans?.description || "Loan"}`,
          amount: payment.amount,
          date: payment.payment_date,
          isPaid: true,
          type: "loan_payment",
        });
      });

      // Sort transactions by date
      formattedTransactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      return {
        id: relationship.id,
        userId: relationship.user_id,
        relatedUserId: relationship.related_user_id,
        relationshipType: relationship.relationship_type,
        totalAmount: relationship.total_amount,
        currency: relationship.currency,
        activeLoans: loans || [],
        unpaidSplits: splits || [],
        recentTransactions: formattedTransactions.slice(0, 10),
        updatedAt: relationship.updated_at,
      };
    } catch (error) {
      console.error("Error fetching relationship summary:", error);
      throw new Error("Failed to fetch relationship summary");
    }
  }

  /**
   * Updates the balance of a financial relationship
   * @param relationshipId - ID of the relationship to update
   * @returns The updated total amount
   */
  static async updateRelationshipBalance(
    relationshipId: string
  ): Promise<number> {
    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Use the stored function to update the balance
      const { data: updatedAmount, error } = await supabase.rpc(
        "update_financial_relationship_balance",
        {
          p_relationship_id: relationshipId,
        }
      );

      if (error) {
        throw error;
      }

      return updatedAmount;
    } catch (error) {
      console.error("Error updating relationship balance:", error);
      throw new Error("Failed to update relationship balance");
    }
  }

  /**
   * Gets a financial relationship between the current user and another user
   * @param relatedUserId - ID of the related user
   * @returns The financial relationship or null if none exists
   */
  static async getRelationshipWithUser(
    relatedUserId: string
  ): Promise<FinancialRelationship | null> {
    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Fetch the relationship
      const { data, error } = await supabase
        .from("financial_relationships")
        .select("*")
        .eq("user_id", user.id)
        .eq("related_user_id", relatedUserId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching relationship with user:", error);
      throw new Error("Failed to fetch relationship with user");
    }
  }

  /**
   * Gets all users who have a financial relationship with the current user
   * @returns Array of user IDs and relationship details
   */
  static async getRelatedUsers(): Promise<
    { userId: string; relationshipId: string; totalAmount: number }[]
  > {
    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Fetch relationships
      const { data, error } = await supabase
        .from("financial_relationships")
        .select("id, related_user_id, total_amount")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (error) {
        throw error;
      }

      return (data || []).map((rel) => ({
        userId: rel.related_user_id,
        relationshipId: rel.id,
        totalAmount: rel.total_amount,
      }));
    } catch (error) {
      console.error("Error fetching related users:", error);
      throw new Error("Failed to fetch related users");
    }
  }
}
