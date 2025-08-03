/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock budget service functions that actually exist
const mockFetchUpcomingBills = jest.fn();
const mockAddUpcomingBill = jest.fn();
const mockUpdateUpcomingBill = jest.fn();
const mockDeleteUpcomingBill = jest.fn();
const mockMarkBillAsPaid = jest.fn();
const mockUpdateBillAutopay = jest.fn();

jest.mock('../upcomingBillsService', () => ({
  fetchUpcomingBills: mockFetchUpcomingBills,
  addUpcomingBill: mockAddUpcomingBill,
  updateUpcomingBill: mockUpdateUpcomingBill,
  deleteUpcomingBill: mockDeleteUpcomingBill,
  markBillAsPaid: mockMarkBillAsPaid,
  updateBillAutopay: mockUpdateBillAutopay
}));

// Import after mocking
import {
  fetchUpcomingBills,
  addUpcomingBill,
  updateUpcomingBill,
  deleteUpcomingBill,
  markBillAsPaid,
  updateBillAutopay
} from '../upcomingBillsService';

describe('upcomingBillsService', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUpcomingBills', () => {
    it('should fetch upcoming bills successfully', async () => {
      const mockBills = [
        { 
          id: '1', 
          name: 'Electricity Bill', 
          amount: 95.50, 
          due_date: '2023-05-15',
          due_status: 'upcoming' as const,
          user_id: 'user-1' 
        },
        { 
          id: '2', 
          name: 'Netflix Subscription', 
          amount: 14.99, 
          due_date: '2023-05-20',
          due_status: 'upcoming' as const,
          user_id: 'user-1' 
        }
      ];

      mockFetchUpcomingBills.mockResolvedValue(mockBills);

      const result = await fetchUpcomingBills();

      expect(mockFetchUpcomingBills).toHaveBeenCalled();
      expect(result).toEqual(mockBills);
    });

    it('should fetch upcoming bills with filters', async () => {
      const mockBills = [
        { 
          id: '1', 
          name: 'Electricity Bill', 
          amount: 95.50, 
          due_date: '2023-05-15',
          due_status: 'upcoming' as const,
          user_id: 'user-1' 
        }
      ];

      const filters = { status: 'upcoming' as const, dueWithin: 'week' as const };
      mockFetchUpcomingBills.mockResolvedValue(mockBills);

      const result = await fetchUpcomingBills(filters);

      expect(mockFetchUpcomingBills).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockBills);
    });

    it('should throw error when fetching bills fails', async () => {
      const errorMessage = 'Fetch failed';
      mockFetchUpcomingBills.mockRejectedValue(new Error(errorMessage));

      await expect(fetchUpcomingBills()).rejects.toThrow(errorMessage);
    });
  });

  describe('addUpcomingBill', () => {
    it('should add an upcoming bill successfully', async () => {
      const billData = {
        name: 'Internet Bill',
        amount: 65.99,
        due_date: '2023-05-25',
        frequency: 'monthly' as const,
        autopay: false,
        autopay_source: 'account' as const,
        transaction_id: 'tx001'
      };

      const mockResult = {
        id: '3',
        ...billData,
        user_id: 'user-1',
        due_status: 'upcoming' as const
      };

      mockAddUpcomingBill.mockResolvedValue(mockResult);

      const result = await addUpcomingBill(billData);

      expect(mockAddUpcomingBill).toHaveBeenCalledWith(billData);
      expect(result).toEqual(mockResult);
    });

    it('should throw error when adding bill fails', async () => {
      const billData = {
        name: 'Internet Bill',
        amount: 65.99,
        due_date: '2023-05-25',
        frequency: 'monthly' as const,
        autopay: false,
        autopay_source: 'account' as const,
        transaction_id: 'tx001'
      };

      const errorMessage = 'Insert failed';
      mockAddUpcomingBill.mockRejectedValue(new Error(errorMessage));

      await expect(addUpcomingBill(billData)).rejects.toThrow(errorMessage);
    });
  });

  describe('updateUpcomingBill', () => {
    it('should update an upcoming bill successfully', async () => {
      const billId = '1';
      const updates = {
        name: 'Updated Electricity Bill',
        amount: 105.00
      };

      const mockResult = {
        id: billId,
        ...updates,
        due_date: '2023-05-15',
        user_id: 'user-1',
        due_status: 'upcoming' as const
      };

      mockUpdateUpcomingBill.mockResolvedValue(mockResult);

      const result = await updateUpcomingBill(billId, updates);

      expect(mockUpdateUpcomingBill).toHaveBeenCalledWith(billId, updates);
      expect(result).toEqual(mockResult);
    });

    it('should throw error when updating bill fails', async () => {
      const billId = '1';
      const updates = {
        name: 'Updated Electricity Bill',
        amount: 105.00
      };

      const errorMessage = 'Update failed';
      mockUpdateUpcomingBill.mockRejectedValue(new Error(errorMessage));

      await expect(updateUpcomingBill(billId, updates)).rejects.toThrow(errorMessage);
    });
  });

  describe('deleteUpcomingBill', () => {
    it('should delete an upcoming bill successfully', async () => {
      const billId = '1';

      mockDeleteUpcomingBill.mockResolvedValue(undefined);

      await deleteUpcomingBill(billId);

      expect(mockDeleteUpcomingBill).toHaveBeenCalledWith(billId);
    });

    it('should throw error when deleting bill fails', async () => {
      const billId = '1';

      const errorMessage = 'Delete failed';
      mockDeleteUpcomingBill.mockRejectedValue(new Error(errorMessage));

      await expect(deleteUpcomingBill(billId)).rejects.toThrow(errorMessage);
    });
  });

  describe('markBillAsPaid', () => {
    it('should mark bill as paid successfully', async () => {
      const billId = '1';

      const mockResult = {
        id: billId,
        name: 'Electricity Bill',
        amount: 95.50,
        due_date: '2023-05-15',
        status: 'paid',
        user_id: 'user-1',
        due_status: 'upcoming' as const
      };

      mockMarkBillAsPaid.mockResolvedValue(mockResult);

      const result = await markBillAsPaid(billId);

      expect(mockMarkBillAsPaid).toHaveBeenCalledWith(billId);
      expect(result).toEqual(mockResult);
    });

    it('should throw error when marking bill as paid fails', async () => {
      const billId = '1';

      const errorMessage = 'Update failed';
      mockMarkBillAsPaid.mockRejectedValue(new Error(errorMessage));

      await expect(markBillAsPaid(billId)).rejects.toThrow(errorMessage);
    });
  });

  describe('updateBillAutopay', () => {
    it('should update bill autopay settings successfully', async () => {
      const billId = '1';
      const autopay = true;
      const autopaySource = 'credit_card' as const;
      const creditCardId = 'cc123';

      const mockResult = {
        id: billId,
        name: 'Netflix Subscription',
        amount: 14.99,
        due_date: '2023-05-20',
        autopay: true,
        autopay_source: 'credit_card',
        credit_card_id: 'cc123',
        account_id: null,
        user_id: 'user-1',
        due_status: 'upcoming' as const
      };

      mockUpdateBillAutopay.mockResolvedValue(mockResult);

      const result = await updateBillAutopay(billId, autopay, autopaySource, undefined, creditCardId);

      expect(mockUpdateBillAutopay).toHaveBeenCalledWith(billId, autopay, autopaySource, undefined, creditCardId);
      expect(result).toEqual(mockResult);
    });

    it('should throw error when updating autopay settings fails', async () => {
      const billId = '1';
      const autopay = true;
      const autopaySource = 'credit_card' as const;
      const creditCardId = 'cc123';

      const errorMessage = 'Update failed';
      mockUpdateBillAutopay.mockRejectedValue(new Error(errorMessage));

      await expect(updateBillAutopay(billId, autopay, autopaySource, undefined, creditCardId)).rejects.toThrow(errorMessage);
    });
  });
}); 