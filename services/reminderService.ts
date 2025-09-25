import { supabase } from "../lib/supabase/client";
import {
  PaymentReminder,
  ReminderStatus,
  REMINDER_STATUS,
} from "../types/financial-relationships";

/**
 * Service for managing payment reminders
 */
export class ReminderService {
  /**
   * Creates a new payment reminder
   * @param recipientId - ID of the recipient
   * @param amount - Amount due
   * @param dueDate - Due date for the payment
   * @param reminderDate - Date to send the reminder
   * @param options - Additional reminder options
   * @returns The created reminder
   */
  static async createReminder(
    recipientId: string,
    amount: number,
    dueDate: string,
    reminderDate: string,
    options?: {
      loanId?: string;
      splitId?: string;
      message?: string;
    }
  ): Promise<PaymentReminder> {
    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Validate that either loanId or splitId is provided
      if (!options?.loanId && !options?.splitId) {
        throw new Error("Either loanId or splitId must be provided");
      }

      // Validate that only one of loanId or splitId is provided
      if (options?.loanId && options?.splitId) {
        throw new Error("Cannot provide both loanId and splitId");
      }

      // Insert the reminder
      const { data, error } = await supabase
        .from("payment_reminders")
        .insert({
          loan_id: options?.loanId,
          split_id: options?.splitId,
          creator_id: user.id,
          recipient_id: recipientId,
          amount,
          due_date: dueDate,
          reminder_date: reminderDate,
          status: REMINDER_STATUS.PENDING,
          message: options?.message,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error creating payment reminder:", error);
      throw new Error("Failed to create payment reminder");
    }
  }

  /**
   * Sends a payment reminder
   * @param reminderId - ID of the reminder to send
   * @returns Success status
   */
  static async sendReminder(reminderId: string): Promise<boolean> {
    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Get the reminder
      const { data: reminder, error: reminderError } = await supabase
        .from("payment_reminders")
        .select("*")
        .eq("id", reminderId)
        .eq("creator_id", user.id)
        .single();

      if (reminderError) {
        throw reminderError;
      }

      if (!reminder) {
        throw new Error(
          "Reminder not found or you don't have permission to send it"
        );
      }

      // In a real implementation, this would integrate with a notification system
      // For now, we'll just update the status to sent
      const { error: updateError } = await supabase
        .from("payment_reminders")
        .update({
          status: REMINDER_STATUS.SENT,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reminderId);

      if (updateError) {
        throw updateError;
      }

      return true;
    } catch (error) {
      console.error("Error sending payment reminder:", error);
      throw new Error("Failed to send payment reminder");
    }
  }

  /**
   * Gets all reminders created by the current user
   * @param filter - Optional filter criteria
   * @returns Array of payment reminders
   */
  static async getReminders(filter?: {
    status?: ReminderStatus | "all";
    type?: "loan" | "split" | "all";
  }): Promise<PaymentReminder[]> {
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
        .from("payment_reminders")
        .select("*")
        .eq("creator_id", user.id);

      // Apply status filter
      if (filter?.status && filter.status !== "all") {
        query = query.eq("status", filter.status);
      }

      // Apply type filter
      if (filter?.type) {
        if (filter.type === "loan") {
          query = query.not("loan_id", "is", null);
        } else if (filter.type === "split") {
          query = query.not("split_id", "is", null);
        }
      }

      // Execute query
      const { data, error } = await query.order("reminder_date", {
        ascending: true,
      });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching payment reminders:", error);
      throw new Error("Failed to fetch payment reminders");
    }
  }

  /**
   * Gets all upcoming reminders that need to be sent
   * @returns Array of reminders due to be sent
   */
  static async getUpcomingReminders(): Promise<PaymentReminder[]> {
    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Get current date
      const now = new Date();

      // Fetch upcoming reminders
      const { data, error } = await supabase
        .from("payment_reminders")
        .select("*")
        .eq("creator_id", user.id)
        .eq("status", REMINDER_STATUS.PENDING)
        .lte("reminder_date", now.toISOString())
        .order("reminder_date", { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching upcoming reminders:", error);
      throw new Error("Failed to fetch upcoming reminders");
    }
  }

  /**
   * Cancels a payment reminder
   * @param reminderId - ID of the reminder to cancel
   * @returns Success status
   */
  static async cancelReminder(reminderId: string): Promise<boolean> {
    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Update reminder status
      const { error } = await supabase
        .from("payment_reminders")
        .update({
          status: REMINDER_STATUS.CANCELLED,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reminderId)
        .eq("creator_id", user.id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error cancelling payment reminder:", error);
      throw new Error("Failed to cancel payment reminder");
    }
  }

  /**
   * Creates reminders for a loan
   * @param loanId - ID of the loan
   * @param options - Reminder configuration options
   * @returns Array of created reminders
   */
  static async createLoanReminders(
    loanId: string,
    options: {
      beforeDueDays?: number[];
      onDueDate?: boolean;
      message?: string;
    }
  ): Promise<PaymentReminder[]> {
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
        .eq("lender_id", user.id)
        .single();

      if (loanError) {
        throw loanError;
      }

      if (!loan) {
        throw new Error(
          "Loan not found or you don't have permission to create reminders"
        );
      }

      if (!loan.due_date) {
        throw new Error("Loan does not have a due date");
      }

      const createdReminders: PaymentReminder[] = [];
      const dueDate = new Date(loan.due_date);
      const defaultMessage = `Your payment of ${
        loan.amount
      } is due on ${dueDate.toLocaleDateString()}`;
      const message = options.message || defaultMessage;

      // Create before-due-date reminders
      if (options.beforeDueDays && options.beforeDueDays.length > 0) {
        for (const days of options.beforeDueDays) {
          const reminderDate = new Date(dueDate);
          reminderDate.setDate(dueDate.getDate() - days);

          // Skip if reminder date is in the past
          if (reminderDate < new Date()) {
            continue;
          }

          const reminder = await this.createReminder(
            loan.borrower_id,
            loan.amount,
            loan.due_date,
            reminderDate.toISOString(),
            {
              loanId: loan.id,
              message: `${message} (${days} days before due date)`,
            }
          );

          createdReminders.push(reminder);
        }
      }

      // Create on-due-date reminder
      if (options.onDueDate && dueDate >= new Date()) {
        const reminder = await this.createReminder(
          loan.borrower_id,
          loan.amount,
          loan.due_date,
          loan.due_date,
          {
            loanId: loan.id,
            message: `${message} (due today)`,
          }
        );

        createdReminders.push(reminder);
      }

      return createdReminders;
    } catch (error) {
      console.error("Error creating loan reminders:", error);
      throw new Error("Failed to create loan reminders");
    }
  }

  /**
   * Creates reminders for a transaction split
   * @param splitId - ID of the split
   * @param options - Reminder configuration options
   * @returns Array of created reminders
   */
  static async createSplitReminders(
    splitId: string,
    options: {
      beforeDueDays?: number[];
      onDueDate?: boolean;
      message?: string;
    }
  ): Promise<PaymentReminder[]> {
    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Get split details
      const { data: split, error: splitError } = await supabase
        .from("transaction_splits")
        .select("*")
        .eq("id", splitId)
        .single();

      if (splitError) {
        throw splitError;
      }

      if (!split) {
        throw new Error("Split not found");
      }

      if (!split.due_date) {
        throw new Error("Split does not have a due date");
      }

      // Verify that the current user is involved in this split
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .select("user_id")
        .eq("id", split.transaction_id)
        .single();

      if (transactionError) {
        throw transactionError;
      }

      if (transaction.user_id !== user.id && split.user_id !== user.id) {
        throw new Error(
          "You don't have permission to create reminders for this split"
        );
      }

      // Determine recipient (the other person in the split)
      const recipientId =
        transaction.user_id === user.id ? split.user_id : transaction.user_id;

      const createdReminders: PaymentReminder[] = [];
      const dueDate = new Date(split.due_date);
      const defaultMessage = `Your payment of ${
        split.share_amount
      } is due on ${dueDate.toLocaleDateString()}`;
      const message = options.message || defaultMessage;

      // Create before-due-date reminders
      if (options.beforeDueDays && options.beforeDueDays.length > 0) {
        for (const days of options.beforeDueDays) {
          const reminderDate = new Date(dueDate);
          reminderDate.setDate(dueDate.getDate() - days);

          // Skip if reminder date is in the past
          if (reminderDate < new Date()) {
            continue;
          }

          const reminder = await this.createReminder(
            recipientId,
            split.share_amount,
            split.due_date,
            reminderDate.toISOString(),
            {
              splitId: split.id,
              message: `${message} (${days} days before due date)`,
            }
          );

          createdReminders.push(reminder);
        }
      }

      // Create on-due-date reminder
      if (options.onDueDate && dueDate >= new Date()) {
        const reminder = await this.createReminder(
          recipientId,
          split.share_amount,
          split.due_date,
          split.due_date,
          {
            splitId: split.id,
            message: `${message} (due today)`,
          }
        );

        createdReminders.push(reminder);
      }

      return createdReminders;
    } catch (error) {
      console.error("Error creating split reminders:", error);
      throw new Error("Failed to create split reminders");
    }
  }
}
