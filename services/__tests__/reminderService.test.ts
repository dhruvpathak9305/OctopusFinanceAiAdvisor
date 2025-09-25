import { ReminderService } from "../reminderService";
import { supabase } from "../../lib/supabase/client";
import { REMINDER_STATUS } from "../../types/financial-relationships";

// Mock the Supabase client
jest.mock("../../lib/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
            lte: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
          not: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        not: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    }),
  },
}));

describe("ReminderService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authenticated user
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "test-user-id" } },
      error: null,
    });
  });

  describe("createReminder", () => {
    it("should create a new reminder for a loan", async () => {
      const mockReminder = {
        id: "reminder-1",
        loan_id: "loan-1",
        split_id: null,
        creator_id: "test-user-id",
        recipient_id: "recipient-id",
        amount: 100,
        due_date: "2023-06-01",
        reminder_date: "2023-05-25",
        status: "pending",
        message: "Payment reminder",
      };

      // Mock insert query
      const singleMock = jest.fn(() => Promise.resolve({ data: mockReminder, error: null }));
      const selectMock = jest.fn(() => ({ single: singleMock }));
      const insertMock = jest.fn(() => ({ select: selectMock }));

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        insert: insertMock,
      }));

      const result = await ReminderService.createReminder(
        "recipient-id",
        100,
        "2023-06-01",
        "2023-05-25",
        {
          loanId: "loan-1",
          message: "Payment reminder",
        }
      );

      expect(insertMock).toHaveBeenCalledWith({
        loan_id: "loan-1",
        split_id: undefined,
        creator_id: "test-user-id",
        recipient_id: "recipient-id",
        amount: 100,
        due_date: "2023-06-01",
        reminder_date: "2023-05-25",
        status: "pending",
        message: "Payment reminder",
      });
      
      expect(result).toEqual(mockReminder);
    });

    it("should throw an error if neither loanId nor splitId is provided", async () => {
      await expect(
        ReminderService.createReminder(
          "recipient-id",
          100,
          "2023-06-01",
          "2023-05-25"
        )
      ).rejects.toThrow("Either loanId or splitId must be provided");
    });

    it("should throw an error if both loanId and splitId are provided", async () => {
      await expect(
        ReminderService.createReminder(
          "recipient-id",
          100,
          "2023-06-01",
          "2023-05-25",
          {
            loanId: "loan-1",
            splitId: "split-1",
          }
        )
      ).rejects.toThrow("Cannot provide both loanId and splitId");
    });
  });

  describe("sendReminder", () => {
    it("should send a reminder", async () => {
      const mockReminder = {
        id: "reminder-1",
        creator_id: "test-user-id",
        status: "pending",
      };

      // Mock reminder query
      const reminderSingleMock = jest.fn(() => Promise.resolve({ data: mockReminder, error: null }));
      const creatorEqMock = jest.fn(() => ({ single: reminderSingleMock }));
      const idEqMock = jest.fn(() => ({ eq: creatorEqMock }));
      const reminderSelectMock = jest.fn(() => ({ eq: idEqMock }));

      // Mock update query
      const updateEqMock = jest.fn(() => Promise.resolve({ data: null, error: null }));
      const updateIdEqMock = jest.fn(() => ({ eq: updateEqMock }));
      const updateMock = jest.fn(() => ({ eq: updateIdEqMock }));

      // Mock from calls
      (supabase.from as jest.Mock)
        .mockImplementationOnce(() => ({ select: reminderSelectMock }))
        .mockImplementationOnce(() => ({ update: updateMock }));

      const result = await ReminderService.sendReminder("reminder-1");

      expect(reminderSelectMock).toHaveBeenCalled();
      expect(updateMock).toHaveBeenCalledWith({
        status: REMINDER_STATUS.SENT,
        updated_at: expect.any(String),
      });
      
      expect(result).toBe(true);
    });

    it("should throw an error if reminder not found", async () => {
      // Mock reminder query with null result
      const reminderSingleMock = jest.fn(() => Promise.resolve({ data: null, error: null }));
      const creatorEqMock = jest.fn(() => ({ single: reminderSingleMock }));
      const idEqMock = jest.fn(() => ({ eq: creatorEqMock }));
      const reminderSelectMock = jest.fn(() => ({ eq: idEqMock }));

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: reminderSelectMock,
      }));

      await expect(
        ReminderService.sendReminder("reminder-1")
      ).rejects.toThrow("Reminder not found or you don't have permission to send it");
    });
  });

  describe("getReminders", () => {
    it("should fetch reminders with filters", async () => {
      const mockReminders = [
        { id: "reminder-1", status: "pending", loan_id: "loan-1" },
        { id: "reminder-2", status: "sent", split_id: "split-1" },
      ];

      // Mock query builder
      const orderMock = jest.fn(() => Promise.resolve({ data: mockReminders, error: null }));
      const statusEqMock = jest.fn(() => ({ order: orderMock }));
      const creatorEqMock = jest.fn(() => ({ eq: statusEqMock }));
      const selectMock = jest.fn(() => ({ eq: creatorEqMock }));

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: selectMock,
      }));

      const result = await ReminderService.getReminders({
        status: "pending",
        type: "loan",
      });

      expect(selectMock).toHaveBeenCalled();
      expect(result).toEqual(mockReminders);
    });
  });

  describe("getUpcomingReminders", () => {
    it("should fetch upcoming reminders", async () => {
      const mockReminders = [
        { id: "reminder-1", status: "pending", reminder_date: "2023-01-01" },
      ];

      // Mock query builder
      const orderMock = jest.fn(() => Promise.resolve({ data: mockReminders, error: null }));
      const lteEqMock = jest.fn(() => ({ order: orderMock }));
      const statusEqMock = jest.fn(() => ({ lte: lteEqMock }));
      const creatorEqMock = jest.fn(() => ({ eq: statusEqMock }));
      const selectMock = jest.fn(() => ({ eq: creatorEqMock }));

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: selectMock,
      }));

      const result = await ReminderService.getUpcomingReminders();

      expect(selectMock).toHaveBeenCalled();
      expect(creatorEqMock).toHaveBeenCalledWith("creator_id", "test-user-id");
      expect(statusEqMock).toHaveBeenCalledWith("status", REMINDER_STATUS.PENDING);
      expect(result).toEqual(mockReminders);
    });
  });

  describe("cancelReminder", () => {
    it("should cancel a reminder", async () => {
      // Mock update query
      const updateEqMock = jest.fn(() => Promise.resolve({ data: null, error: null }));
      const creatorEqMock = jest.fn(() => ({ eq: updateEqMock }));
      const idEqMock = jest.fn(() => ({ eq: creatorEqMock }));
      const updateMock = jest.fn(() => ({ eq: idEqMock }));

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        update: updateMock,
      }));

      const result = await ReminderService.cancelReminder("reminder-1");

      expect(updateMock).toHaveBeenCalledWith({
        status: REMINDER_STATUS.CANCELLED,
        updated_at: expect.any(String),
      });
      expect(idEqMock).toHaveBeenCalledWith("id", "reminder-1");
      expect(creatorEqMock).toHaveBeenCalledWith("creator_id", "test-user-id");
      
      expect(result).toBe(true);
    });
  });

  describe("createLoanReminders", () => {
    it("should create reminders for a loan", async () => {
      const mockLoan = {
        id: "loan-1",
        lender_id: "test-user-id",
        borrower_id: "borrower-id",
        amount: 100,
        due_date: "2023-06-01",
      };

      const mockReminder = {
        id: "reminder-1",
        loan_id: "loan-1",
        recipient_id: "borrower-id",
        amount: 100,
        due_date: "2023-06-01",
        reminder_date: "2023-05-29", // 3 days before
        status: "pending",
      };

      // Mock loan query
      const loanSingleMock = jest.fn(() => Promise.resolve({ data: mockLoan, error: null }));
      const lenderEqMock = jest.fn(() => ({ single: loanSingleMock }));
      const idEqMock = jest.fn(() => ({ eq: lenderEqMock }));
      const loanSelectMock = jest.fn(() => ({ eq: idEqMock }));

      // Mock createReminder
      jest.spyOn(ReminderService, "createReminder").mockResolvedValueOnce(mockReminder);

      // Mock from calls
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: loanSelectMock,
      }));

      const result = await ReminderService.createLoanReminders("loan-1", {
        beforeDueDays: [3],
        onDueDate: true,
      });

      expect(loanSelectMock).toHaveBeenCalled();
      expect(ReminderService.createReminder).toHaveBeenCalled();
      expect(result).toEqual([mockReminder]);
    });

    it("should throw an error if loan not found", async () => {
      // Mock loan query with null result
      const loanSingleMock = jest.fn(() => Promise.resolve({ data: null, error: null }));
      const lenderEqMock = jest.fn(() => ({ single: loanSingleMock }));
      const idEqMock = jest.fn(() => ({ eq: lenderEqMock }));
      const loanSelectMock = jest.fn(() => ({ eq: idEqMock }));

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: loanSelectMock,
      }));

      await expect(
        ReminderService.createLoanReminders("loan-1", {})
      ).rejects.toThrow("Loan not found or you don't have permission to create reminders");
    });

    it("should throw an error if loan has no due date", async () => {
      const mockLoan = {
        id: "loan-1",
        lender_id: "test-user-id",
        borrower_id: "borrower-id",
        amount: 100,
        due_date: null,
      };

      // Mock loan query
      const loanSingleMock = jest.fn(() => Promise.resolve({ data: mockLoan, error: null }));
      const lenderEqMock = jest.fn(() => ({ single: loanSingleMock }));
      const idEqMock = jest.fn(() => ({ eq: lenderEqMock }));
      const loanSelectMock = jest.fn(() => ({ eq: idEqMock }));

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: loanSelectMock,
      }));

      await expect(
        ReminderService.createLoanReminders("loan-1", {})
      ).rejects.toThrow("Loan does not have a due date");
    });
  });

  describe("createSplitReminders", () => {
    it("should create reminders for a transaction split", async () => {
      const mockSplit = {
        id: "split-1",
        transaction_id: "transaction-1",
        user_id: "other-user-id",
        share_amount: 50,
        due_date: "2023-06-01",
      };

      const mockTransaction = {
        user_id: "test-user-id", // Current user created the transaction
      };

      const mockReminder = {
        id: "reminder-1",
        split_id: "split-1",
        recipient_id: "other-user-id",
        amount: 50,
        due_date: "2023-06-01",
        reminder_date: "2023-06-01", // On due date
        status: "pending",
      };

      // Mock split query
      const splitSingleMock = jest.fn(() => Promise.resolve({ data: mockSplit, error: null }));
      const splitEqMock = jest.fn(() => ({ single: splitSingleMock }));
      const splitSelectMock = jest.fn(() => ({ eq: splitEqMock }));

      // Mock transaction query
      const transactionSingleMock = jest.fn(() => Promise.resolve({ data: mockTransaction, error: null }));
      const transactionEqMock = jest.fn(() => ({ single: transactionSingleMock }));
      const transactionSelectMock = jest.fn(() => ({ eq: transactionEqMock }));

      // Mock createReminder
      jest.spyOn(ReminderService, "createReminder").mockResolvedValueOnce(mockReminder);

      // Mock from calls
      (supabase.from as jest.Mock)
        .mockImplementationOnce(() => ({ select: splitSelectMock }))
        .mockImplementationOnce(() => ({ select: transactionSelectMock }));

      const result = await ReminderService.createSplitReminders("split-1", {
        onDueDate: true,
      });

      expect(splitSelectMock).toHaveBeenCalled();
      expect(transactionSelectMock).toHaveBeenCalled();
      expect(ReminderService.createReminder).toHaveBeenCalled();
      expect(result).toEqual([mockReminder]);
    });

    it("should throw an error if split not found", async () => {
      // Mock split query with null result
      const splitSingleMock = jest.fn(() => Promise.resolve({ data: null, error: null }));
      const splitEqMock = jest.fn(() => ({ single: splitSingleMock }));
      const splitSelectMock = jest.fn(() => ({ eq: splitEqMock }));

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: splitSelectMock,
      }));

      await expect(
        ReminderService.createSplitReminders("split-1", {})
      ).rejects.toThrow("Split not found");
    });

    it("should throw an error if split has no due date", async () => {
      const mockSplit = {
        id: "split-1",
        transaction_id: "transaction-1",
        user_id: "other-user-id",
        share_amount: 50,
        due_date: null,
      };

      // Mock split query
      const splitSingleMock = jest.fn(() => Promise.resolve({ data: mockSplit, error: null }));
      const splitEqMock = jest.fn(() => ({ single: splitSingleMock }));
      const splitSelectMock = jest.fn(() => ({ eq: splitEqMock }));

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: splitSelectMock,
      }));

      await expect(
        ReminderService.createSplitReminders("split-1", {})
      ).rejects.toThrow("Split does not have a due date");
    });
  });
});
