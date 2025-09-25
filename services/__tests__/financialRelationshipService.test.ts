import { FinancialRelationshipService } from "../financialRelationshipService";
import { supabase } from "../../lib/supabase/client";

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
            order: jest.fn(() => ({
              maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
              single: jest.fn(() => Promise.resolve({ data: null, error: null })),
              limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
            maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
          neq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
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
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    }),
    rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
  },
}));

describe("FinancialRelationshipService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authenticated user
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "test-user-id" } },
      error: null,
    });
  });

  describe("createRelationship", () => {
    it("should create a new financial relationship", async () => {
      const mockRelationshipId = "test-relationship-id";
      const mockRelationship = {
        id: mockRelationshipId,
        user_id: "test-user-id",
        related_user_id: "related-user-id",
        relationship_type: "split_expense",
        total_amount: 0,
      };

      // Mock RPC call
      (supabase.rpc as jest.Mock).mockResolvedValueOnce({
        data: mockRelationshipId,
        error: null,
      });

      // Mock fetching the created relationship
      const selectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: mockRelationship, error: null })),
        })),
      }));

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: selectMock,
      }));

      const result = await FinancialRelationshipService.createRelationship(
        "related-user-id",
        "split_expense"
      );

      expect(supabase.rpc).toHaveBeenCalledWith(
        "create_or_get_financial_relationship",
        {
          p_related_user_id: "related-user-id",
          p_relationship_type: "split_expense",
        }
      );
      
      expect(selectMock).toHaveBeenCalled();
      expect(result).toEqual(mockRelationship);
    });

    it("should throw an error if user is not authenticated", async () => {
      // Mock unauthenticated user
      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      await expect(
        FinancialRelationshipService.createRelationship("related-user-id")
      ).rejects.toThrow("User not authenticated");
    });
  });

  describe("getRelationships", () => {
    it("should fetch all relationships for the current user", async () => {
      const mockRelationships = [
        {
          id: "rel-1",
          user_id: "test-user-id",
          related_user_id: "related-1",
          relationship_type: "split_expense",
          total_amount: 100,
        },
        {
          id: "rel-2",
          user_id: "test-user-id",
          related_user_id: "related-2",
          relationship_type: "lender",
          total_amount: -50,
        },
      ];

      // Mock query builder
      const orderMock = jest.fn(() => Promise.resolve({ data: mockRelationships, error: null }));
      const eqMock = jest.fn(() => ({ eq: jest.fn(() => ({ order: orderMock })) }));
      const selectMock = jest.fn(() => ({ eq: eqMock }));

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: selectMock,
      }));

      const result = await FinancialRelationshipService.getRelationships();

      expect(selectMock).toHaveBeenCalled();
      expect(result).toEqual(mockRelationships);
    });

    it("should apply filters correctly", async () => {
      const mockRelationships = [
        {
          id: "rel-1",
          user_id: "test-user-id",
          related_user_id: "related-1",
          relationship_type: "lender",
          total_amount: 100,
        },
      ];

      // Mock query builder with gt filter
      const orderMock = jest.fn(() => Promise.resolve({ data: mockRelationships, error: null }));
      const gtMock = jest.fn(() => ({ order: orderMock }));
      const eqMock = jest.fn(() => ({ eq: jest.fn(() => ({ gt: gtMock })) }));
      const selectMock = jest.fn(() => ({ eq: eqMock }));

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: selectMock,
      }));

      await FinancialRelationshipService.getRelationships("positive");

      expect(selectMock).toHaveBeenCalled();
      // Additional checks for filter application could be added here
    });
  });

  describe("getRelationshipSummary", () => {
    it("should fetch a comprehensive summary of a relationship", async () => {
      const mockRelationship = {
        id: "rel-1",
        user_id: "test-user-id",
        related_user_id: "related-1",
        relationship_type: "split_expense",
        total_amount: 100,
        currency: "USD",
        updated_at: "2023-01-01",
      };

      const mockLoans = [
        { id: "loan-1", amount: 100, status: "active" },
      ];

      const mockSplits = [
        { id: "split-1", share_amount: 50, is_paid: false },
      ];

      const mockTransactions = [
        { 
          id: "trans-1", 
          transaction_id: "t1", 
          share_amount: 50, 
          created_at: "2023-01-01",
          transactions: { description: "Test" },
          is_paid: false 
        },
      ];

      // Mock relationship query
      const relationshipSingleMock = jest.fn(() => 
        Promise.resolve({ data: mockRelationship, error: null })
      );
      const relationshipEqMock = jest.fn(() => ({ 
        single: relationshipSingleMock 
      }));
      const relationshipSelectMock = jest.fn(() => ({ 
        eq: relationshipEqMock 
      }));

      // Mock loans query
      const loansEqMock = jest.fn(() => 
        Promise.resolve({ data: mockLoans, error: null })
      );
      const loansNeqMock = jest.fn(() => ({ 
        eq: loansEqMock 
      }));
      const loansSelectMock = jest.fn(() => ({ 
        neq: loansNeqMock 
      }));

      // Mock splits query
      const splitsEqMock = jest.fn(() => 
        Promise.resolve({ data: mockSplits, error: null })
      );
      const splitsSelectMock = jest.fn(() => ({ 
        eq: splitsEqMock 
      }));

      // Mock transactions query
      const transactionsLimitMock = jest.fn(() => 
        Promise.resolve({ data: mockTransactions, error: null })
      );
      const transactionsOrderMock = jest.fn(() => ({ 
        limit: transactionsLimitMock 
      }));
      const transactionsEqMock = jest.fn(() => ({ 
        order: transactionsOrderMock 
      }));
      const transactionsSelectMock = jest.fn(() => ({ 
        eq: transactionsEqMock 
      }));

      // Mock from calls for different queries
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: relationshipSelectMock,
      })).mockImplementationOnce(() => ({
        select: loansSelectMock,
      })).mockImplementationOnce(() => ({
        select: splitsSelectMock,
      })).mockImplementationOnce(() => ({
        select: transactionsSelectMock,
      })).mockImplementationOnce(() => ({
        select: jest.fn(() => ({
          in: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        })),
      }));

      const result = await FinancialRelationshipService.getRelationshipSummary("rel-1");

      expect(relationshipSelectMock).toHaveBeenCalled();
      expect(loansSelectMock).toHaveBeenCalled();
      expect(splitsSelectMock).toHaveBeenCalled();
      expect(transactionsSelectMock).toHaveBeenCalled();
      
      expect(result).toHaveProperty("id", "rel-1");
      expect(result).toHaveProperty("activeLoans");
      expect(result).toHaveProperty("unpaidSplits");
      expect(result).toHaveProperty("recentTransactions");
    });
  });

  describe("updateRelationshipBalance", () => {
    it("should call the RPC function to update balance", async () => {
      const mockUpdatedAmount = 150;
      
      (supabase.rpc as jest.Mock).mockResolvedValueOnce({
        data: mockUpdatedAmount,
        error: null,
      });

      const result = await FinancialRelationshipService.updateRelationshipBalance("rel-1");

      expect(supabase.rpc).toHaveBeenCalledWith(
        "update_financial_relationship_balance",
        {
          p_relationship_id: "rel-1",
        }
      );
      
      expect(result).toEqual(mockUpdatedAmount);
    });
  });

  describe("getRelationshipWithUser", () => {
    it("should fetch a relationship with a specific user", async () => {
      const mockRelationship = {
        id: "rel-1",
        user_id: "test-user-id",
        related_user_id: "related-1",
        relationship_type: "split_expense",
        total_amount: 100,
      };

      // Mock query builder
      const maybeSingleMock = jest.fn(() => 
        Promise.resolve({ data: mockRelationship, error: null })
      );
      const eqMock = jest.fn(() => ({ 
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: maybeSingleMock,
          })),
        })),
      }));
      const selectMock = jest.fn(() => ({ eq: eqMock }));

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: selectMock,
      }));

      const result = await FinancialRelationshipService.getRelationshipWithUser("related-1");

      expect(selectMock).toHaveBeenCalled();
      expect(result).toEqual(mockRelationship);
    });

    it("should return null if no relationship exists", async () => {
      // Mock query builder with null result
      const maybeSingleMock = jest.fn(() => 
        Promise.resolve({ data: null, error: null })
      );
      const eqMock = jest.fn(() => ({ 
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: maybeSingleMock,
          })),
        })),
      }));
      const selectMock = jest.fn(() => ({ eq: eqMock }));

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: selectMock,
      }));

      const result = await FinancialRelationshipService.getRelationshipWithUser("related-1");

      expect(selectMock).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("getRelatedUsers", () => {
    it("should fetch all users with financial relationships", async () => {
      const mockRelationships = [
        {
          id: "rel-1",
          related_user_id: "related-1",
          total_amount: 100,
        },
        {
          id: "rel-2",
          related_user_id: "related-2",
          total_amount: -50,
        },
      ];

      // Mock query builder
      const orderMock = jest.fn(() => Promise.resolve({ data: mockRelationships, error: null }));
      const eqMock = jest.fn(() => ({ eq: jest.fn(() => ({ order: orderMock })) }));
      const selectMock = jest.fn(() => ({ eq: eqMock }));

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: selectMock,
      }));

      const result = await FinancialRelationshipService.getRelatedUsers();

      expect(selectMock).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("userId", "related-1");
      expect(result[0]).toHaveProperty("relationshipId", "rel-1");
      expect(result[0]).toHaveProperty("totalAmount", 100);
    });
  });
});
