import { LoanManagementService } from "../loanManagementService";
import { FinancialRelationshipService } from "../financialRelationshipService";
import { supabase } from "../../lib/supabase/client";
import { LOAN_STATUS } from "../../types/financial-relationships";

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
            or: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null, error: null })),
            })),
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          or: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
          in: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        or: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    }),
    rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
  },
}));

// Mock FinancialRelationshipService
jest.mock("../financialRelationshipService", () => ({
  FinancialRelationshipService: {
    getRelationshipWithUser: jest.fn(),
    createRelationship: jest.fn(),
    updateRelationshipBalance: jest.fn(),
  },
}));

describe("LoanManagementService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authenticated user
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "test-user-id" } },
      error: null,
    });
  });

  describe("createLoan", () => {
    it("should create a new loan", async () => {
      const mockLoan = {
        id: "loan-1",
        lender_id: "test-user-id",
        borrower_id: "borrower-id",
        amount: 100,
        status: "active",
      };

      // Mock relationship service
      (FinancialRelationshipService.getRelationshipWithUser as jest.Mock).mockResolvedValueOnce({
        id: "rel-1",
      });

      // Mock insert query
      const singleMock = jest.fn(() => Promise.resolve({ data: mockLoan, error: null }));
      const selectMock = jest.fn(() => ({ single: singleMock }));
      const insertMock = jest.fn(() => ({ select: selectMock }));

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        insert: insertMock,
      }));

      const result = await LoanManagementService.createLoan("borrower-id", 100, {
        description: "Test loan",
      });

      expect(insertMock).toHaveBeenCalledWith({
        lender_id: "test-user-id",
        borrower_id: "borrower-id",
        relationship_id: "rel-1",
        amount: 100,
        interest_rate: undefined,
        due_date: undefined,
        description: "Test loan",
        status: "active",
      });
      
      expect(FinancialRelationshipService.updateRelationshipBalance).toHaveBeenCalledWith("rel-1");
      expect(result).toEqual(mockLoan);
    });

    it("should create a relationship if none exists", async () => {
      const mockLoan = {
        id: "loan-1",
        lender_id: "test-user-id",
        borrower_id: "borrower-id",
        amount: 100,
        status: "active",
      };

      // Mock relationship service - no existing relationship
      (FinancialRelationshipService.getRelationshipWithUser as jest.Mock).mockResolvedValueOnce(null);
      (FinancialRelationshipService.createRelationship as jest.Mock).mockResolvedValueOnce({
        id: "new-rel-1",
      });

      // Mock insert query
      const singleMock = jest.fn(() => Promise.resolve({ data: mockLoan, error: null }));
      const selectMock = jest.fn(() => ({ single: singleMock }));
      const insertMock = jest.fn(() => ({ select: selectMock }));

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        insert: insertMock,
      }));

      await LoanManagementService.createLoan("borrower-id", 100);

      expect(FinancialRelationshipService.createRelationship).toHaveBeenCalledWith(
        "borrower-id",
        "lender"
      );
      
      expect(insertMock).toHaveBeenCalled();
      expect(FinancialRelationshipService.updateRelationshipBalance).toHaveBeenCalledWith("new-rel-1");
    });
  });

  describe("getLoanDetails", () => {
    it("should fetch loan details with payments and interest", async () => {
      const mockLoan = {
        id: "loan-1",
        lender_id: "test-user-id",
        borrower_id: "borrower-id",
        amount: 100,
        interest_rate: 5,
        status: "active",
      };

      const mockPayments = [
        { id: "payment-1", amount: 25, payment_date: "2023-01-01" },
      ];

      // Mock loan query
      const loanSingleMock = jest.fn(() => Promise.resolve({ data: mockLoan, error: null }));
      const loanOrMock = jest.fn(() => ({ single: loanSingleMock }));
      const loanEqMock = jest.fn(() => ({ or: loanOrMock }));
      const loanSelectMock = jest.fn(() => ({ eq: loanEqMock }));

      // Mock payments query
      const paymentsOrderMock = jest.fn(() => Promise.resolve({ data: mockPayments, error: null }));
      const paymentsEqMock = jest.fn(() => ({ order: paymentsOrderMock }));
      const paymentsSelectMock = jest.fn(() => ({ eq: paymentsEqMock }));

      // Mock interest calculation
      (supabase.rpc as jest.Mock).mockResolvedValueOnce({
        data: 2.5, // Accrued interest
        error: null,
      });

      // Mock from calls for different queries
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: loanSelectMock,
      })).mockImplementationOnce(() => ({
        select: paymentsSelectMock,
      }));

      const result = await LoanManagementService.getLoanDetails("loan-1");

      expect(loanSelectMock).toHaveBeenCalled();
      expect(paymentsSelectMock).toHaveBeenCalled();
      expect(supabase.rpc).toHaveBeenCalledWith(
        "calculate_loan_interest",
        expect.any(Object)
      );
      
      expect(result).toHaveProperty("loan", mockLoan);
      expect(result).toHaveProperty("payments", mockPayments);
      expect(result).toHaveProperty("accruedInterest", 2.5);
    });
  });

  describe("recordPayment", () => {
    it("should record a payment on a loan", async () => {
      const mockLoan = {
        id: "loan-1",
        lender_id: "test-user-id",
        borrower_id: "borrower-id",
        amount: 100,
        relationship_id: "rel-1",
        status: "active",
      };

      const mockPayment = {
        id: "payment-1",
        loan_id: "loan-1",
        amount: 50,
        payment_date: "2023-01-01",
        payment_method: "cash",
      };

      // Mock loan query
      const loanSingleMock = jest.fn(() => Promise.resolve({ data: mockLoan, error: null }));
      const loanOrMock = jest.fn(() => ({ single: loanSingleMock }));
      const loanEqMock = jest.fn(() => ({ or: loanOrMock }));
      const loanSelectMock = jest.fn(() => ({ eq: loanEqMock }));

      // Mock payment insert
      const paymentSingleMock = jest.fn(() => Promise.resolve({ data: mockPayment, error: null }));
      const paymentSelectMock = jest.fn(() => ({ single: paymentSingleMock }));
      const paymentInsertMock = jest.fn(() => ({ select: paymentSelectMock }));

      // Mock from calls
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: loanSelectMock,
      })).mockImplementationOnce(() => ({
        insert: paymentInsertMock,
      }));

      // Mock updateLoanStatus
      jest.spyOn(LoanManagementService, "updateLoanStatus").mockResolvedValueOnce("active");

      const result = await LoanManagementService.recordPayment("loan-1", 50, {
        paymentMethod: "cash",
      });

      expect(loanSelectMock).toHaveBeenCalled();
      expect(paymentInsertMock).toHaveBeenCalled();
      expect(LoanManagementService.updateLoanStatus).toHaveBeenCalledWith("loan-1");
      expect(FinancialRelationshipService.updateRelationshipBalance).toHaveBeenCalledWith("rel-1");
      
      expect(result).toEqual(mockPayment);
    });
  });

  describe("updateLoanStatus", () => {
    it("should update loan status based on payments and due date", async () => {
      const mockLoan = {
        id: "loan-1",
        amount: 100,
        status: "active",
        due_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      };

      const mockPayments = [
        { amount: 25 },
      ];

      // Mock loan query
      const loanSingleMock = jest.fn(() => Promise.resolve({ data: mockLoan, error: null }));
      const loanEqMock = jest.fn(() => ({ single: loanSingleMock }));
      const loanSelectMock = jest.fn(() => ({ eq: loanEqMock }));

      // Mock payments query
      const paymentsEqMock = jest.fn(() => Promise.resolve({ data: mockPayments, error: null }));
      const paymentsSelectMock = jest.fn(() => ({ eq: paymentsEqMock }));

      // Mock update query
      const updateEqMock = jest.fn(() => Promise.resolve({ data: null, error: null }));
      const updateMock = jest.fn(() => ({ eq: updateEqMock }));

      // Mock from calls
      (supabase.from as jest.Mock)
        .mockImplementationOnce(() => ({ select: loanSelectMock }))
        .mockImplementationOnce(() => ({ select: paymentsSelectMock }))
        .mockImplementationOnce(() => ({ update: updateMock }));

      const result = await LoanManagementService.updateLoanStatus("loan-1");

      expect(loanSelectMock).toHaveBeenCalled();
      expect(paymentsSelectMock).toHaveBeenCalled();
      expect(updateMock).toHaveBeenCalled();
      
      // Should be overdue since due date is past and not fully paid
      expect(result).toBe(LOAN_STATUS.OVERDUE);
    });

    it("should mark loan as paid when fully paid", async () => {
      const mockLoan = {
        id: "loan-1",
        amount: 100,
        status: "active",
      };

      const mockPayments = [
        { amount: 100 },
      ];

      // Mock loan query
      const loanSingleMock = jest.fn(() => Promise.resolve({ data: mockLoan, error: null }));
      const loanEqMock = jest.fn(() => ({ single: loanSingleMock }));
      const loanSelectMock = jest.fn(() => ({ eq: loanEqMock }));

      // Mock payments query
      const paymentsEqMock = jest.fn(() => Promise.resolve({ data: mockPayments, error: null }));
      const paymentsSelectMock = jest.fn(() => ({ eq: paymentsEqMock }));

      // Mock update query
      const updateEqMock = jest.fn(() => Promise.resolve({ data: null, error: null }));
      const updateMock = jest.fn(() => ({ eq: updateEqMock }));

      // Mock from calls
      (supabase.from as jest.Mock)
        .mockImplementationOnce(() => ({ select: loanSelectMock }))
        .mockImplementationOnce(() => ({ select: paymentsSelectMock }))
        .mockImplementationOnce(() => ({ update: updateMock }));

      const result = await LoanManagementService.updateLoanStatus("loan-1");

      expect(updateMock).toHaveBeenCalledWith({
        status: LOAN_STATUS.PAID,
        updated_at: expect.any(String),
      });
      
      expect(result).toBe(LOAN_STATUS.PAID);
    });
  });

  describe("getLoans", () => {
    it("should fetch loans with filters", async () => {
      const mockLoans = [
        { id: "loan-1", status: "active" },
        { id: "loan-2", status: "overdue" },
      ];

      // Mock query builder
      const orderMock = jest.fn(() => Promise.resolve({ data: mockLoans, error: null }));
      const eqMock = jest.fn(() => ({ order: orderMock }));
      const orMock = jest.fn(() => ({ eq: eqMock }));
      const selectMock = jest.fn(() => ({ or: orMock }));

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: selectMock,
      }));

      const result = await LoanManagementService.getLoans({
        role: "lender",
        status: "active",
      });

      expect(selectMock).toHaveBeenCalled();
      expect(result).toEqual(mockLoans);
    });
  });

  describe("getOverdueLoans", () => {
    it("should fetch overdue loans", async () => {
      const mockLoans = [
        { id: "loan-1", status: "overdue", due_date: "2023-01-01" },
      ];

      // Mock query builder
      const orderMock = jest.fn(() => Promise.resolve({ data: mockLoans, error: null }));
      const statusEqMock = jest.fn(() => ({ order: orderMock }));
      const lenderEqMock = jest.fn(() => ({ eq: statusEqMock }));
      const selectMock = jest.fn(() => ({ eq: lenderEqMock }));

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: selectMock,
      }));

      const result = await LoanManagementService.getOverdueLoans();

      expect(selectMock).toHaveBeenCalled();
      expect(lenderEqMock).toHaveBeenCalledWith("lender_id", "test-user-id");
      expect(statusEqMock).toHaveBeenCalledWith("status", LOAN_STATUS.OVERDUE);
      expect(result).toEqual(mockLoans);
    });
  });

  describe("getUpcomingDueLoans", () => {
    it("should fetch upcoming due loans", async () => {
      const mockLoans = [
        { id: "loan-1", status: "active", due_date: "2023-01-05" },
      ];

      // Mock query builder
      const orderMock = jest.fn(() => Promise.resolve({ data: mockLoans, error: null }));
      const lteEqMock = jest.fn(() => ({ order: orderMock }));
      const gteEqMock = jest.fn(() => ({ lte: lteEqMock }));
      const inEqMock = jest.fn(() => ({ gte: gteEqMock }));
      const lenderEqMock = jest.fn(() => ({ in: inEqMock }));
      const selectMock = jest.fn(() => ({ eq: lenderEqMock }));

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: selectMock,
      }));

      const result = await LoanManagementService.getUpcomingDueLoans(7);

      expect(selectMock).toHaveBeenCalled();
      expect(lenderEqMock).toHaveBeenCalledWith("lender_id", "test-user-id");
      expect(inEqMock).toHaveBeenCalledWith("status", [LOAN_STATUS.ACTIVE]);
      expect(result).toEqual(mockLoans);
    });
  });
});
