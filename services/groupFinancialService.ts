/**
 * Group Financial Service
 * 
 * Provides clean API for fetching group data with financial summaries
 * for display in the Money Ties (Financial Relationships) screen.
 * 
 * Responsibilities:
 * - Fetch groups with member count
 * - Calculate financial summaries (owed/owing amounts)
 * - Aggregate split transactions
 * - Handle errors gracefully
 */

import { supabase } from '../lib/supabase/client';

export interface GroupMemberSummary {
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  role?: string;
}

export interface GroupFinancialSummary {
  total_splits: number;
  total_owed_to_you: number;
  total_you_owe: number;
  net_balance: number; // Positive = they owe you, Negative = you owe them
  has_active_splits: boolean;
  last_transaction_date: string | null;
}

export interface GroupWithFinancials {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  members: GroupMemberSummary[];
  member_count: number;
  financial_summary: GroupFinancialSummary;
}

export interface GroupFinancialServiceError {
  message: string;
  code?: string;
  details?: any;
}

export interface GroupMemberBalance {
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  total_paid: number;
  total_owed: number;
  net_balance: number; // Positive = others owe them, Negative = they owe others
}

class GroupFinancialServiceClass {
  /**
   * Fetch all groups for a user with financial summaries
   */
  async getUserGroupsWithFinancials(userId: string): Promise<{
    data: GroupWithFinancials[] | null;
    error: GroupFinancialServiceError | null;
  }> {
    try {
      console.log('[GroupFinancialService] Fetching groups for user:', userId);

      // Step 1: Fetch all groups where user is a member
      const { data: groupMemberships, error: membershipError } = await supabase
        .from('group_members')
        .select(`
          group_id,
          role,
          groups:group_id (
            id,
            name,
            description,
            created_by,
            created_at,
            updated_at,
            is_active
          )
        `)
        .eq('user_id', userId);

      if (membershipError) {
        console.error('[GroupFinancialService] Error fetching group memberships:', membershipError);
        return {
          data: null,
          error: {
            message: 'Failed to fetch group memberships',
            code: membershipError.code,
            details: membershipError,
          },
        };
      }

      if (!groupMemberships || groupMemberships.length === 0) {
        console.log('[GroupFinancialService] No groups found for user');
        return { data: [], error: null };
      }

      // Extract unique groups
      const groups = groupMemberships
        .map((membership: any) => membership.groups)
        .filter((group: any) => group && group.is_active);

      console.log(`[GroupFinancialService] Found ${groups.length} active groups`);

      // Step 2: Fetch all group members and financial data for each group
      const groupsWithFinancials = await Promise.all(
        groups.map(async (group: any) => {
          try {
            // Fetch all members for this group
            const { data: members, error: membersError } = await supabase
              .from('group_members')
              .select('user_id, user_name, user_email, role')
              .eq('group_id', group.id);

            if (membersError) {
              console.error(`[GroupFinancialService] Error fetching members for group ${group.id}:`, membersError);
            }

            // Fetch split transactions for this group
            const financialSummary = await this.calculateGroupFinancialSummary(
              group.id,
              userId
            );

            return {
              id: group.id,
              name: group.name,
              description: group.description,
              created_by: group.created_by,
              created_at: group.created_at,
              updated_at: group.updated_at,
              is_active: group.is_active,
              members: members || [],
              member_count: members?.length || 0,
              financial_summary: financialSummary,
            };
          } catch (error) {
            console.error(`[GroupFinancialService] Error processing group ${group.id}:`, error);
            // Return group with empty financial summary on error
            return {
              id: group.id,
              name: group.name,
              description: group.description,
              created_by: group.created_by,
              created_at: group.created_at,
              updated_at: group.updated_at,
              is_active: group.is_active,
              members: [],
              member_count: 0,
              financial_summary: {
                total_splits: 0,
                total_owed_to_you: 0,
                total_you_owe: 0,
                net_balance: 0,
                has_active_splits: false,
                last_transaction_date: null,
              },
            };
          }
        })
      );

      console.log('[GroupFinancialService] Successfully processed groups:', groupsWithFinancials.length);
      return { data: groupsWithFinancials, error: null };
    } catch (error: any) {
      console.error('[GroupFinancialService] Unexpected error:', error);
      return {
        data: null,
        error: {
          message: error.message || 'An unexpected error occurred',
          details: error,
        },
      };
    }
  }

  /**
   * Calculate financial summary for a specific group and user
   */
  private async calculateGroupFinancialSummary(
    groupId: string,
    userId: string
  ): Promise<GroupFinancialSummary> {
    try {
      // Fetch all transaction splits for this group
      const { data: splits, error: splitsError } = await supabase
        .from('transaction_splits')
        .select(`
          id,
          transaction_id,
          user_id,
          share_amount,
          is_paid,
          settled_at,
          created_at,
          transactions_real (
            id,
            amount,
            user_id,
            date,
            created_at,
            metadata
          )
        `)
        .eq('group_id', groupId)
        .eq('is_paid', false); // Only unpaid splits

      if (splitsError) {
        console.error('[GroupFinancialService] Error fetching splits for group:', groupId, splitsError);
        return {
          total_splits: 0,
          total_owed_to_you: 0,
          total_you_owe: 0,
          net_balance: 0,
          has_active_splits: false,
          last_transaction_date: null,
        };
      }

      console.log('[GroupFinancialService] Fetched splits for group:', groupId, 'Count:', splits?.length || 0);

      if (!splits || splits.length === 0) {
        console.log('[GroupFinancialService] No unpaid splits found for group:', groupId);
        return {
          total_splits: 0,
          total_owed_to_you: 0,
          total_you_owe: 0,
          net_balance: 0,
          has_active_splits: false,
          last_transaction_date: null,
        };
      }

      // Calculate amounts
      let total_owed_to_you = 0;
      let total_you_owe = 0;
      let last_transaction_date: string | null = null;
      
      console.log('[GroupFinancialService] Processing', splits.length, 'splits for user:', userId);

      // Group splits by transaction to determine who paid
      const transactionMap = new Map<string, any[]>();
      splits.forEach((split: any) => {
        const transId = split.transaction_id;
        if (!transactionMap.has(transId)) {
          transactionMap.set(transId, []);
        }
        transactionMap.get(transId)?.push(split);
      });

      // Process each transaction
      transactionMap.forEach((transactionSplits, transactionId) => {
        // Find who paid (the one with the transaction in transactions_real)
        const paidBySplit = transactionSplits.find((s: any) => s.transactions_real);

        if (!paidBySplit || !paidBySplit.transactions_real) {
          console.log('[GroupFinancialService] No transaction found for split:', transactionId);
          return;
        }

        const transaction = paidBySplit.transactions_real;
        const paidByUserId = transaction.metadata?.paid_by_user_id || transaction.user_id;

        // Calculate owed amounts
        transactionSplits.forEach((split: any) => {
          if (split.user_id === userId) {
            // This is the current user's split
            if (paidByUserId !== userId && !split.is_paid) {
              // User owes someone else
              total_you_owe += split.share_amount;
            }
          } else if (paidByUserId === userId && !split.is_paid) {
            // Current user paid, others owe them
            total_owed_to_you += split.share_amount;
          }
        });

        // Track last transaction date
        if (transaction.created_at) {
          if (!last_transaction_date || transaction.created_at > last_transaction_date) {
            last_transaction_date = transaction.created_at;
          }
        }
      });

      const net_balance = total_owed_to_you - total_you_owe;

      console.log('[GroupFinancialService] Calculated financials for group:', groupId, {
        total_splits: splits.length,
        total_owed_to_you,
        total_you_owe,
        net_balance,
      });

      return {
        total_splits: splits.length,
        total_owed_to_you,
        total_you_owe,
        net_balance,
        has_active_splits: splits.length > 0,
        last_transaction_date,
      };
    } catch (error) {
      console.error('[GroupFinancialService] Error calculating financial summary:', error);
      return {
        total_splits: 0,
        total_owed_to_you: 0,
        total_you_owe: 0,
        net_balance: 0,
        has_active_splits: false,
        last_transaction_date: null,
      };
    }
  }

  /**
   * Fetch a single group with its financial summary
   */
  async getGroupWithFinancials(
    groupId: string,
    userId: string
  ): Promise<{
    data: GroupWithFinancials | null;
    error: GroupFinancialServiceError | null;
  }> {
    try {
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError || !group) {
        return {
          data: null,
          error: {
            message: 'Group not found',
            code: groupError?.code,
            details: groupError,
          },
        };
      }

      const { data: members } = await supabase
        .from('group_members')
        .select('user_id, user_name, user_email, role')
        .eq('group_id', groupId);

      const financialSummary = await this.calculateGroupFinancialSummary(
        groupId,
        userId
      );

      return {
        data: {
          ...group,
          members: members || [],
          member_count: members?.length || 0,
          financial_summary: financialSummary,
        },
        error: null,
      };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to fetch group',
          details: error,
        },
      };
    }
  }

  /**
   * Get individual member balances for a group
   * Shows who owes whom within the group
   */
  async getGroupMemberBalances(groupId: string): Promise<{
    data: GroupMemberBalance[] | null;
    error: GroupFinancialServiceError | null;
  }> {
    try {
      console.log('[GroupFinancialService] Fetching member balances for group:', groupId);

      const { data, error } = await supabase.rpc('get_group_balances', {
        p_group_id: groupId,
      });

      if (error) {
        console.error('[GroupFinancialService] Error fetching group member balances:', error);
        return {
          data: null,
          error: {
            message: 'Failed to fetch group member balances',
            code: error.code,
            details: error,
          },
        };
      }

      console.log('[GroupFinancialService] Fetched', data?.length || 0, 'member balances');

      return {
        data: data || [],
        error: null,
      };
    } catch (error: any) {
      console.error('[GroupFinancialService] Exception fetching member balances:', error);
      return {
        data: null,
        error: {
          message: error.message || 'Failed to fetch group member balances',
          details: error,
        },
      };
    }
  }
}

// Export singleton instance
export const GroupFinancialService = new GroupFinancialServiceClass();
export default GroupFinancialService;

