import { supabase } from "../lib/supabase/client";
import {
  Loan,
  LoanPayment,
  LoanStatus,
  LOAN_STATUS,
} from "../types/financial-relationships";
import { FinancialRelationshipService } from "./financialRelationshipService";

/**
 * Service for managing loans between users
 */
export class LoanManagementService {
  /**
   * Creates a new loan
   * @param borrowerId - ID of the borrower
   * @param amount - Loan amount
   * @param options - Additional loan options
   * @returns The created loan
   */
  static async createLoan(
    borrowerId: string,
    amount: number,
    options?: {
      interestRate?: number;
      dueDate?: string;
      description?: string;
      relationshipId?: string;
    }
  ): Promise<Loan> {
    try {
      // Get current user (lender)
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Get or create financial relationship
      let relationshipId = options?.relationshipId;
      if (!relationshipId) {
        try {
          // Check if relationship exists
          const existingRelationship =
            await FinancialRelationshipService.getRelationshipWithUser(
              borrowerId
            );

          if (existingRelationship) {
            relationshipId = existingRelationship.id;
          } else {
            // Create new relationship as lender
            const newRelationship =
              await FinancialRelationshipService.createRelationship(
                borrowerId,
                "lender"
              );
            relationshipId = newRelationship.id;
          }
        } catch (err) {
          console.error("Error getting/creating relationship:", err);
          // Continue without relationship if there's an error
        }
      }

      // Insert the loan
      const { data, error } = await supabase
        .from("loans")
        .insert({
          lender_id: user.id,
          borrower_id: borrowerId,
          relationship_id: relationshipId,
          amount,
          interest_rate: options?.interestRate,
          due_date: options?.dueDate,
          description: options?.description,
          status: LOAN_STATUS.ACTIVE,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update relationship balance if we have a relationship
      if (relationshipId) {
        try {
          await FinancialRelationshipService.updateRelationshipBalance(
            relationshipId
          );
        } catch (err) {
          console.error(
            `Error updating relationship balance for ${relationshipId}:`,
            err
          );
          // Continue even if balance update fails
        }
      }

      return data;
    } catch (error) {
      console.error("Error creating loan:", error);
      throw new Error("Failed to create loan");
    }
  }

  /**
   * Gets details of a specific loan
   * @param loanId - ID of the loan
   * @returns The loan details with payments
   */
  static async getLoanDetails(
    loanId: string
  ): Promise<{ loan: Loan; payments: LoanPayment[]; accruedInterest: number }> {
    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Fetch the loan
      const { data: loan, error: loanError } = await supabase
        .from("loans")
        .select("*")
        .eq("id", loanId)
        .or(`lender_id.eq.${user.id},borrower_id.eq.${user.id}`)
        .single();

      if (loanError) {
        throw loanError;
      }

      if (!loan) {
        throw new Error(
          "Loan not found or you don't have permission to view it"
        );
      }

      // Fetch loan payments
      const { data: payments, error: paymentsError } = await supabase
        .from("loan_payments")
        .select("*")
        .eq("loan_id", loanId)
        .order("payment_date", { ascending: false });

      if (paymentsError) {
        throw paymentsError;
      }

      // Calculate accrued interest
      let accruedInterest = 0;
      if (loan.interest_rate && loan.interest_rate > 0) {
        try {
          const { data: interest, error: interestError } = await supabase.rpc(
            "calculate_loan_interest",
            {
              p_loan_id: loanId,
              p_calculation_date: new Date().toISOString(),
            }
          );

          if (!interestError) {
            accruedInterest = interest || 0;
          }
        } catch (err) {
          console.error("Error calculating interest:", err);
          // Continue with zero interest if calculation fails
        }
      }

      return {
        loan,
        payments: payments || [],
        accruedInterest,
      };
    } catch (error) {
      console.error("Error fetching loan details:", error);
      throw new Error("Failed to fetch loan details");
    }
  }

  /**
   * Records a payment on a loan
   * @param loanId - ID of the loan
   * @param amount - Payment amount
   * @param options - Additional payment options
   * @returns The created payment
   */
  static async recordPayment(
    loanId: string,
    amount: number,
    options?: {
      paymentDate?: string;
      paymentMethod?: string;
      notes?: string;
    }
  ): Promise<LoanPayment> {
    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Verify loan exists and user is part of it
      const { data: loan, error: loanError } = await supabase
        .from("loans")
        .select("*")
        .eq("id", loanId)
        .or(`lender_id.eq.${user.id},borrower_id.eq.${user.id}`)
        .single();

      if (loanError) {
        throw loanError;
      }

      if (!loan) {
        throw new Error(
          "Loan not found or you don't have permission to record payments"
        );
      }

      // Insert the payment
      const { data, error } = await supabase
        .from("loan_payments")
        .insert({
          loan_id: loanId,
          amount,
          payment_date: options?.paymentDate || new Date().toISOString(),
          payment_method: options?.paymentMethod || "other",
          notes: options?.notes,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update loan status if needed
      await this.updateLoanStatus(loanId);

      // Update relationship balance
      if (loan.relationship_id) {
        try {
          await FinancialRelationshipService.updateRelationshipBalance(
            loan.relationship_id
          );
        } catch (err) {
          console.error(
            `Error updating relationship balance for ${loan.relationship_id}:`,
            err
          );
          // Continue even if balance update fails
        }
      }

      return data;
    } catch (error) {
      console.error("Error recording loan payment:", error);
      throw new Error("Failed to record loan payment");
    }
  }

  /**
   * Calculates interest for a loan
   * @param loanId - ID of the loan
   * @param calculationDate - Date to calculate interest up to
   * @returns The accrued interest amount
   */
  static async calculateInterest(
    loanId: string,
    calculationDate?: string
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

      // Calculate interest using the database function
      const { data, error } = await supabase.rpc("calculate_loan_interest", {
        p_loan_id: loanId,
        p_calculation_date: calculationDate || new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      return data || 0;
    } catch (error) {
      console.error("Error calculating loan interest:", error);
      throw new Error("Failed to calculate loan interest");
    }
  }

  /**
   * Updates the status of a loan based on payments and due date
   * @param loanId - ID of the loan to update
   * @returns The updated loan status
   */
  static async updateLoanStatus(loanId: string): Promise<LoanStatus> {
    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Get loan details
      const { data: loan, error: loanError } = await supabase
        .from("loans")
        .select("*")
        .eq("id", loanId)
        .single();

      if (loanError) {
        throw loanError;
      }

      // Get total payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("loan_payments")
        .select("amount")
        .eq("loan_id", loanId);

      if (paymentsError) {
        throw paymentsError;
      }

      const totalPaid = (paymentsData || []).reduce(
        (sum, payment) => sum + payment.amount,
        0
      );

      // Determine new status
      let newStatus: LoanStatus = loan.status;

      // If fully paid
      if (totalPaid >= loan.amount) {
        newStatus = LOAN_STATUS.PAID;
      }
      // If overdue
      else if (
        loan.due_date &&
        new Date(loan.due_date) < new Date() &&
        loan.status !== LOAN_STATUS.DEFAULTED
      ) {
        newStatus = LOAN_STATUS.OVERDUE;
      }
      // If was overdue but now has payments and not fully paid
      else if (
        loan.status === LOAN_STATUS.OVERDUE &&
        totalPaid > 0 &&
        totalPaid < loan.amount
      ) {
        newStatus = LOAN_STATUS.ACTIVE;
      }

      // Update loan status if changed
      if (newStatus !== loan.status) {
        const { error: updateError } = await supabase
          .from("loans")
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq("id", loanId);

        if (updateError) {
          throw updateError;
        }
      }

      return newStatus;
    } catch (error) {
      console.error("Error updating loan status:", error);
      throw new Error("Failed to update loan status");
    }
  }

  /**
   * Gets all loans for the current user (as lender or borrower)
   * @param filter - Optional filter criteria
   * @returns Array of loans
   */
  static async getLoans(filter?: {
    role?: "lender" | "borrower" | "both";
    status?: LoanStatus | "all";
  }): Promise<Loan[]> {
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
      let query = supabase.from("loans").select("*");

      // Apply role filter
      if (!filter?.role || filter.role === "both") {
        query = query.or(`lender_id.eq.${user.id},borrower_id.eq.${user.id}`);
      } else if (filter.role === "lender") {
        query = query.eq("lender_id", user.id);
      } else {
        query = query.eq("borrower_id", user.id);
      }

      // Apply status filter
      if (filter?.status && filter.status !== "all") {
        query = query.eq("status", filter.status);
      }

      // Execute query
      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching loans:", error);
      throw new Error("Failed to fetch loans");
    }
  }

  /**
   * Gets all overdue loans where the current user is the lender
   * @returns Array of overdue loans
   */
  static async getOverdueLoans(): Promise<Loan[]> {
    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Fetch overdue loans
      const { data, error } = await supabase
        .from("loans")
        .select("*")
        .eq("lender_id", user.id)
        .eq("status", LOAN_STATUS.OVERDUE)
        .order("due_date", { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching overdue loans:", error);
      throw new Error("Failed to fetch overdue loans");
    }
  }

  /**
   * Gets upcoming loan payments due to the current user
   * @param daysAhead - Number of days ahead to look
   * @returns Array of upcoming due loans
   */
  static async getUpcomingDueLoans(daysAhead: number = 7): Promise<Loan[]> {
    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Calculate date range
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + daysAhead);

      // Fetch upcoming loans
      const { data, error } = await supabase
        .from("loans")
        .select("*")
        .eq("lender_id", user.id)
        .in("status", [LOAN_STATUS.ACTIVE])
        .gte("due_date", today.toISOString())
        .lte("due_date", futureDate.toISOString())
        .order("due_date", { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching upcoming due loans:", error);
      throw new Error("Failed to fetch upcoming due loans");
    }
  }
}
