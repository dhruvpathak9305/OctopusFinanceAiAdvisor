export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      account_balance_history: {
        Row: {
          account_id: string
          balance: number
          created_at: string
          id: string
          snapshot_date: string
          user_id: string
        }
        Insert: {
          account_id: string
          balance: number
          created_at?: string
          id?: string
          snapshot_date: string
          user_id: string
        }
        Update: {
          account_id?: string
          balance?: number
          created_at?: string
          id?: string
          snapshot_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_balance_history_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      account_balance_history_real: {
        Row: {
          account_id: string
          balance: number
          created_at: string
          id: string
          snapshot_date: string
          user_id: string
        }
        Insert: {
          account_id: string
          balance: number
          created_at?: string
          id?: string
          snapshot_date: string
          user_id: string
        }
        Update: {
          account_id?: string
          balance?: number
          created_at?: string
          id?: string
          snapshot_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_balance_history_real_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          account_number: string | null
          balance: number
          created_at: string
          id: string
          institution: string | null
          last_sync: string | null
          logo_url: string | null
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          balance?: number
          created_at?: string
          id?: string
          institution?: string | null
          last_sync?: string | null
          logo_url?: string | null
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          balance?: number
          created_at?: string
          id?: string
          institution?: string | null
          last_sync?: string | null
          logo_url?: string | null
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      accounts_real: {
        Row: {
          account_number: string | null
          bank_holder_name: string | null
          branch_address: string | null
          branch_name: string | null
          created_at: string
          crn: string | null
          currency: string | null
          id: string
          ifsc_code: string | null
          institution: string | null
          last_sync: string | null
          logo_url: string | null
          micr_code: string | null
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          bank_holder_name?: string | null
          branch_address?: string | null
          branch_name?: string | null
          created_at?: string
          crn?: string | null
          currency?: string | null
          id?: string
          ifsc_code?: string | null
          institution?: string | null
          last_sync?: string | null
          logo_url?: string | null
          micr_code?: string | null
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          bank_holder_name?: string | null
          branch_address?: string | null
          branch_name?: string | null
          created_at?: string
          crn?: string | null
          currency?: string | null
          id?: string
          ifsc_code?: string | null
          institution?: string | null
          last_sync?: string | null
          logo_url?: string | null
          micr_code?: string | null
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_spending_patterns: {
        Row: {
          category_id: string
          confidence_score: number
          created_at: string | null
          id: string
          pattern_data: Json
          pattern_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_id: string
          confidence_score: number
          created_at?: string | null
          id?: string
          pattern_data: Json
          pattern_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_id?: string
          confidence_score?: number
          created_at?: string | null
          id?: string
          pattern_data?: Json
          pattern_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_spending_patterns_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories_real"
            referencedColumns: ["id"]
          },
        ]
      }
      balance_real: {
        Row: {
          account_id: string
          account_name: string
          account_number: string | null
          account_type: string
          created_at: string
          currency: string | null
          current_balance: number
          id: string
          institution_name: string | null
          last_updated: string
          opening_balance: number
          user_id: string
        }
        Insert: {
          account_id: string
          account_name: string
          account_number?: string | null
          account_type: string
          created_at?: string
          currency?: string | null
          current_balance?: number
          id?: string
          institution_name?: string | null
          last_updated?: string
          opening_balance?: number
          user_id: string
        }
        Update: {
          account_id?: string
          account_name?: string
          account_number?: string | null
          account_type?: string
          created_at?: string
          currency?: string | null
          current_balance?: number
          id?: string
          institution_name?: string | null
          last_updated?: string
          opening_balance?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "balance_real_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts_real"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "balance_real_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "balance_verification"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_categories: {
        Row: {
          bg_color: string
          budget_limit: number
          category_type: string
          created_at: string
          description: string | null
          display_order: number | null
          frequency: string | null
          id: string
          is_active: string | null
          name: string
          percentage: number | null
          ring_color: string
          start_date: string | null
          status: string | null
          strategy: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bg_color: string
          budget_limit: number
          category_type?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          frequency?: string | null
          id?: string
          is_active?: string | null
          name: string
          percentage?: number | null
          ring_color: string
          start_date?: string | null
          status?: string | null
          strategy?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bg_color?: string
          budget_limit?: number
          category_type?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          frequency?: string | null
          id?: string
          is_active?: string | null
          name?: string
          percentage?: number | null
          ring_color?: string
          start_date?: string | null
          status?: string | null
          strategy?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      budget_categories_real: {
        Row: {
          bg_color: string
          budget_limit: number
          category_type: string
          created_at: string
          description: string | null
          display_order: number | null
          frequency: string | null
          icon: string | null
          id: string
          is_active: string | null
          name: string
          percentage: number | null
          ring_color: string
          start_date: string | null
          status: string | null
          strategy: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bg_color: string
          budget_limit: number
          category_type?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          frequency?: string | null
          icon?: string | null
          id?: string
          is_active?: string | null
          name: string
          percentage?: number | null
          ring_color: string
          start_date?: string | null
          status?: string | null
          strategy?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bg_color?: string
          budget_limit?: number
          category_type?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          frequency?: string | null
          icon?: string | null
          id?: string
          is_active?: string | null
          name?: string
          percentage?: number | null
          ring_color?: string
          start_date?: string | null
          status?: string | null
          strategy?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      budget_category_snapshots: {
        Row: {
          actual_spend: number | null
          bg_color: string
          budget_limit: number
          category_id: string
          created_at: string
          id: string
          name: string
          percentage: number
          period_id: string
          ring_color: string
          status: string | null
          updated_at: string
        }
        Insert: {
          actual_spend?: number | null
          bg_color: string
          budget_limit: number
          category_id: string
          created_at?: string
          id?: string
          name: string
          percentage: number
          period_id: string
          ring_color: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          actual_spend?: number | null
          bg_color?: string
          budget_limit?: number
          category_id?: string
          created_at?: string
          id?: string
          name?: string
          percentage?: number
          period_id?: string
          ring_color?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_category_snapshots_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories_real"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_category_snapshots_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "budget_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_periods: {
        Row: {
          apply_to_all_months: boolean | null
          budget_set_for_period: string | null
          budget_strategy: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string | null
          period_end: string
          period_start: string
          status: string | null
          total_budget: number | null
          total_spend: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          apply_to_all_months?: boolean | null
          budget_set_for_period?: string | null
          budget_strategy?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          period_end: string
          period_start: string
          status?: string | null
          total_budget?: number | null
          total_spend?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          apply_to_all_months?: boolean | null
          budget_set_for_period?: string | null
          budget_strategy?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          period_end?: string
          period_start?: string
          status?: string | null
          total_budget?: number | null
          total_spend?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      budget_periods_real: {
        Row: {
          apply_to_all_months: boolean | null
          budget_set_for_period: string | null
          budget_strategy: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string | null
          period_end: string
          period_start: string
          status: string | null
          total_budget: number | null
          total_spend: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          apply_to_all_months?: boolean | null
          budget_set_for_period?: string | null
          budget_strategy?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          period_end: string
          period_start: string
          status?: string | null
          total_budget?: number | null
          total_spend?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          apply_to_all_months?: boolean | null
          budget_set_for_period?: string | null
          budget_strategy?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          period_end?: string
          period_start?: string
          status?: string | null
          total_budget?: number | null
          total_spend?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      budget_subcategories: {
        Row: {
          amount: number
          budget_limit: number | null
          category_id: string
          color: string
          created_at: string
          current_spend: number | null
          description: string | null
          display_order: number | null
          icon: string
          id: string
          is_active: boolean | null
          name: string
          transaction_category_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          budget_limit?: number | null
          category_id: string
          color: string
          created_at?: string
          current_spend?: number | null
          description?: string | null
          display_order?: number | null
          icon: string
          id?: string
          is_active?: boolean | null
          name: string
          transaction_category_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          budget_limit?: number | null
          category_id?: string
          color?: string
          created_at?: string
          current_spend?: number | null
          description?: string | null
          display_order?: number | null
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          transaction_category_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories_real"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_subcategories_real: {
        Row: {
          amount: number
          budget_limit: number | null
          category_id: string
          color: string
          created_at: string
          current_spend: number | null
          description: string | null
          display_order: number | null
          icon: string
          id: string
          is_active: boolean | null
          name: string
          transaction_category_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          budget_limit?: number | null
          category_id: string
          color: string
          created_at?: string
          current_spend?: number | null
          description?: string | null
          display_order?: number | null
          icon: string
          id?: string
          is_active?: boolean | null
          name: string
          transaction_category_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          budget_limit?: number | null
          category_id?: string
          color?: string
          created_at?: string
          current_spend?: number | null
          description?: string | null
          display_order?: number | null
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          transaction_category_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_subcategories_real_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories_real"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_subcategory_snapshots: {
        Row: {
          actual_spend: number | null
          budget_limit: number
          color: string
          created_at: string
          icon: string
          id: string
          name: string
          snapshot_id: string
          subcategory_id: string
          updated_at: string
        }
        Insert: {
          actual_spend?: number | null
          budget_limit: number
          color: string
          created_at?: string
          icon: string
          id?: string
          name: string
          snapshot_id: string
          subcategory_id: string
          updated_at?: string
        }
        Update: {
          actual_spend?: number | null
          budget_limit?: number
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name?: string
          snapshot_id?: string
          subcategory_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_subcategory_snapshots_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "budget_category_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_subcategory_snapshots_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "budget_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_card_balance_history: {
        Row: {
          created_at: string
          credit_card_id: string
          credit_limit: number
          current_balance: number
          id: string
          snapshot_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credit_card_id: string
          credit_limit: number
          current_balance: number
          id?: string
          snapshot_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          credit_card_id?: string
          credit_limit?: number
          current_balance?: number
          id?: string
          snapshot_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_card_balance_history_credit_card_id_fkey"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_card_balance_history_real: {
        Row: {
          created_at: string
          credit_card_id: string
          credit_limit: number
          current_balance: number
          id: string
          snapshot_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credit_card_id: string
          credit_limit: number
          current_balance: number
          id?: string
          snapshot_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          credit_card_id?: string
          credit_limit?: number
          current_balance?: number
          id?: string
          snapshot_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_card_balance_history_real_credit_card_id_fkey"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards_real"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_cards: {
        Row: {
          billing_cycle: string | null
          created_at: string | null
          credit_limit: number
          current_balance: number
          due_date: string | null
          id: string
          institution: string
          last_four_digits: number
          logo_url: string | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string | null
          credit_limit: number
          current_balance: number
          due_date?: string | null
          id?: string
          institution: string
          last_four_digits: number
          logo_url?: string | null
          name: string
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string | null
          credit_limit?: number
          current_balance?: number
          due_date?: string | null
          id?: string
          institution?: string
          last_four_digits?: number
          logo_url?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credit_cards_real: {
        Row: {
          billing_cycle: string | null
          created_at: string | null
          credit_limit: number
          current_balance: number
          due_date: string | null
          id: string
          institution: string
          last_four_digits: number
          logo_url: string | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string | null
          credit_limit: number
          current_balance: number
          due_date?: string | null
          id?: string
          institution: string
          last_four_digits: number
          logo_url?: string | null
          name: string
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string | null
          credit_limit?: number
          current_balance?: number
          due_date?: string | null
          id?: string
          institution?: string
          last_four_digits?: number
          logo_url?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      envelope_budgets: {
        Row: {
          allocated_amount: number
          category_id: string
          created_at: string | null
          envelope_name: string
          id: string
          is_rollover_enabled: boolean | null
          period_id: string
          remaining_amount: number | null
          rollover_amount: number | null
          spent_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allocated_amount: number
          category_id: string
          created_at?: string | null
          envelope_name: string
          id?: string
          is_rollover_enabled?: boolean | null
          period_id: string
          remaining_amount?: number | null
          rollover_amount?: number | null
          spent_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allocated_amount?: number
          category_id?: string
          created_at?: string | null
          envelope_name?: string
          id?: string
          is_rollover_enabled?: boolean | null
          period_id?: string
          remaining_amount?: number | null
          rollover_amount?: number | null
          spent_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "envelope_budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories_real"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "envelope_budgets_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "budget_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_relationships: {
        Row: {
          created_at: string
          currency: string
          id: string
          is_active: boolean
          related_user_id: string
          relationship_type: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          related_user_id: string
          relationship_type: string
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          related_user_id?: string
          relationship_type?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          is_active: boolean
          is_registered_user: boolean | null
          joined_at: string
          role: string
          user_email: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          group_id: string
          id?: string
          is_active?: boolean
          is_registered_user?: boolean | null
          joined_at?: string
          role?: string
          user_email?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          group_id?: string
          id?: string
          is_active?: boolean
          is_registered_user?: boolean | null
          joined_at?: string
          role?: string
          user_email?: string | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          group_image_url: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          group_image_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          group_image_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      individual_contacts: {
        Row: {
          contact_email: string
          contact_name: string | null
          created_at: string
          id: string
          is_active: boolean
          relationship_summary: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_email: string
          contact_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          relationship_summary?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_email?: string
          contact_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          relationship_summary?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loan_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          id: string
          loan_id: string
          notes: string | null
          payment_date: string
          payment_method: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: string
          id?: string
          loan_id: string
          notes?: string | null
          payment_date?: string
          payment_method: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          id?: string
          loan_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_payments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          amount: number
          borrower_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          interest_rate: number | null
          lender_id: string
          relationship_id: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          borrower_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          interest_rate?: number | null
          lender_id: string
          relationship_id?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          borrower_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          interest_rate?: number | null
          lender_id?: string
          relationship_id?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "financial_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      net_worth_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          type: Database["public"]["Enums"]["net_worth_type"]
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          type: Database["public"]["Enums"]["net_worth_type"]
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          type?: Database["public"]["Enums"]["net_worth_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      net_worth_categories_real: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          type: Database["public"]["Enums"]["net_worth_type"]
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          type: Database["public"]["Enums"]["net_worth_type"]
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          type?: Database["public"]["Enums"]["net_worth_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      net_worth_entries: {
        Row: {
          asset_name: string
          category_id: string
          created_at: string | null
          date: string | null
          id: string
          is_active: boolean | null
          is_included_in_net_worth: boolean | null
          last_synced_at: string | null
          linked_source_id: string | null
          linked_source_type:
            | Database["public"]["Enums"]["linked_source_type"]
            | null
          market_price: number | null
          notes: string | null
          quantity: number | null
          subcategory_id: string
          updated_at: string | null
          user_id: string
          value: number
        }
        Insert: {
          asset_name: string
          category_id: string
          created_at?: string | null
          date?: string | null
          id?: string
          is_active?: boolean | null
          is_included_in_net_worth?: boolean | null
          last_synced_at?: string | null
          linked_source_id?: string | null
          linked_source_type?:
            | Database["public"]["Enums"]["linked_source_type"]
            | null
          market_price?: number | null
          notes?: string | null
          quantity?: number | null
          subcategory_id: string
          updated_at?: string | null
          user_id: string
          value?: number
        }
        Update: {
          asset_name?: string
          category_id?: string
          created_at?: string | null
          date?: string | null
          id?: string
          is_active?: boolean | null
          is_included_in_net_worth?: boolean | null
          last_synced_at?: string | null
          linked_source_id?: string | null
          linked_source_type?:
            | Database["public"]["Enums"]["linked_source_type"]
            | null
          market_price?: number | null
          notes?: string | null
          quantity?: number | null
          subcategory_id?: string
          updated_at?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "net_worth_entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "net_worth_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "net_worth_entries_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "net_worth_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      net_worth_entries_real: {
        Row: {
          asset_name: string
          category_id: string
          created_at: string | null
          date: string | null
          id: string
          is_active: boolean | null
          is_included_in_net_worth: boolean | null
          last_synced_at: string | null
          linked_source_id: string | null
          linked_source_type:
            | Database["public"]["Enums"]["linked_source_type"]
            | null
          market_price: number | null
          notes: string | null
          quantity: number | null
          subcategory_id: string
          updated_at: string | null
          user_id: string
          value: number
        }
        Insert: {
          asset_name: string
          category_id: string
          created_at?: string | null
          date?: string | null
          id?: string
          is_active?: boolean | null
          is_included_in_net_worth?: boolean | null
          last_synced_at?: string | null
          linked_source_id?: string | null
          linked_source_type?:
            | Database["public"]["Enums"]["linked_source_type"]
            | null
          market_price?: number | null
          notes?: string | null
          quantity?: number | null
          subcategory_id: string
          updated_at?: string | null
          user_id: string
          value?: number
        }
        Update: {
          asset_name?: string
          category_id?: string
          created_at?: string | null
          date?: string | null
          id?: string
          is_active?: boolean | null
          is_included_in_net_worth?: boolean | null
          last_synced_at?: string | null
          linked_source_id?: string | null
          linked_source_type?:
            | Database["public"]["Enums"]["linked_source_type"]
            | null
          market_price?: number | null
          notes?: string | null
          quantity?: number | null
          subcategory_id?: string
          updated_at?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "net_worth_entries_real_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "net_worth_categories_real"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "net_worth_entries_real_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "net_worth_subcategories_real"
            referencedColumns: ["id"]
          },
        ]
      }
      net_worth_entry_metadata: {
        Row: {
          created_at: string | null
          entry_id: string
          id: string
          key: string
          value: Json | null
        }
        Insert: {
          created_at?: string | null
          entry_id: string
          id?: string
          key: string
          value?: Json | null
        }
        Update: {
          created_at?: string | null
          entry_id?: string
          id?: string
          key?: string
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "net_worth_entry_metadata_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "net_worth_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "net_worth_entry_metadata_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "net_worth_entries_detailed"
            referencedColumns: ["id"]
          },
        ]
      }
      net_worth_entry_metadata_real: {
        Row: {
          created_at: string | null
          entry_id: string
          id: string
          key: string
          value: Json | null
        }
        Insert: {
          created_at?: string | null
          entry_id: string
          id?: string
          key: string
          value?: Json | null
        }
        Update: {
          created_at?: string | null
          entry_id?: string
          id?: string
          key?: string
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "net_worth_entry_metadata_real_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "net_worth_entries_detailed_real"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "net_worth_entry_metadata_real_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "net_worth_entries_real"
            referencedColumns: ["id"]
          },
        ]
      }
      net_worth_history: {
        Row: {
          created_at: string
          date: string
          id: string
          total_assets: number
          total_liabilities: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          total_assets: number
          total_liabilities: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          total_assets?: number
          total_liabilities?: number
          user_id?: string
        }
        Relationships: []
      }
      net_worth_snapshots: {
        Row: {
          category_breakdown: Json | null
          created_at: string | null
          id: string
          net_worth: number
          snapshot_date: string
          total_assets: number
          total_liabilities: number
          user_id: string
        }
        Insert: {
          category_breakdown?: Json | null
          created_at?: string | null
          id?: string
          net_worth?: number
          snapshot_date?: string
          total_assets?: number
          total_liabilities?: number
          user_id: string
        }
        Update: {
          category_breakdown?: Json | null
          created_at?: string | null
          id?: string
          net_worth?: number
          snapshot_date?: string
          total_assets?: number
          total_liabilities?: number
          user_id?: string
        }
        Relationships: []
      }
      net_worth_snapshots_real: {
        Row: {
          category_breakdown: Json | null
          created_at: string | null
          id: string
          net_worth: number
          snapshot_date: string
          total_assets: number
          total_liabilities: number
          user_id: string
        }
        Insert: {
          category_breakdown?: Json | null
          created_at?: string | null
          id?: string
          net_worth?: number
          snapshot_date?: string
          total_assets?: number
          total_liabilities?: number
          user_id: string
        }
        Update: {
          category_breakdown?: Json | null
          created_at?: string | null
          id?: string
          net_worth?: number
          snapshot_date?: string
          total_assets?: number
          total_liabilities?: number
          user_id?: string
        }
        Relationships: []
      }
      net_worth_subcategories: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "net_worth_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "net_worth_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      net_worth_subcategories_real: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "net_worth_subcategories_real_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "net_worth_categories_real"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_reminders: {
        Row: {
          amount: number
          created_at: string
          creator_id: string
          due_date: string
          id: string
          loan_id: string | null
          message: string | null
          recipient_id: string
          reminder_date: string
          split_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          creator_id: string
          due_date: string
          id?: string
          loan_id?: string | null
          message?: string | null
          recipient_id: string
          reminder_date: string
          split_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          creator_id?: string
          due_date?: string
          id?: string
          loan_id?: string | null
          message?: string | null
          recipient_id?: string
          reminder_date?: string
          split_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_reminders_split_id_fkey"
            columns: ["split_id"]
            isOneToOne: false
            referencedRelation: "transaction_splits"
            referencedColumns: ["id"]
          },
        ]
      }
      rolling_budget_adjustments: {
        Row: {
          adjustment_amount: number
          adjustment_reason: string
          adjustment_type: string
          category_id: string
          created_at: string | null
          id: string
          new_amount: number
          period_id: string
          previous_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          adjustment_amount: number
          adjustment_reason: string
          adjustment_type: string
          category_id: string
          created_at?: string | null
          id?: string
          new_amount: number
          period_id: string
          previous_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          adjustment_amount?: number
          adjustment_reason?: string
          adjustment_type?: string
          category_id?: string
          created_at?: string | null
          id?: string
          new_amount?: number
          period_id?: string
          previous_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rolling_budget_adjustments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories_real"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rolling_budget_adjustments_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "budget_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_splits: {
        Row: {
          created_at: string
          due_date: string | null
          group_id: string | null
          id: string
          is_paid: boolean
          notes: string | null
          paid_by: string | null
          relationship_id: string | null
          reminder_enabled: boolean
          settled_at: string | null
          settlement_method: string | null
          share_amount: number
          share_percentage: number | null
          split_type: string
          transaction_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          group_id?: string | null
          id?: string
          is_paid?: boolean
          notes?: string | null
          paid_by?: string | null
          relationship_id?: string | null
          reminder_enabled?: boolean
          settled_at?: string | null
          settlement_method?: string | null
          share_amount: number
          share_percentage?: number | null
          split_type?: string
          transaction_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          group_id?: string | null
          id?: string
          is_paid?: boolean
          notes?: string | null
          paid_by?: string | null
          relationship_id?: string | null
          reminder_enabled?: boolean
          settled_at?: string | null
          settlement_method?: string | null
          share_amount?: number
          share_percentage?: number | null
          split_type?: string
          transaction_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_splits_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_splits_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "financial_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_splits_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions_real"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          date: string
          description: string | null
          destination_account_id: string | null
          destination_account_name: string | null
          destination_account_type: string | null
          icon: string | null
          id: string
          interest_rate: number | null
          is_credit_card: boolean | null
          is_recurring: boolean | null
          loan_term_months: number | null
          merchant: string | null
          metadata: Json | null
          name: string
          parent_transaction_id: string | null
          recurrence_end_date: string | null
          recurrence_pattern: string | null
          source_account_id: string | null
          source_account_name: string | null
          source_account_type: string
          subcategory_id: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          date?: string
          description?: string | null
          destination_account_id?: string | null
          destination_account_name?: string | null
          destination_account_type?: string | null
          icon?: string | null
          id?: string
          interest_rate?: number | null
          is_credit_card?: boolean | null
          is_recurring?: boolean | null
          loan_term_months?: number | null
          merchant?: string | null
          metadata?: Json | null
          name: string
          parent_transaction_id?: string | null
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          source_account_id?: string | null
          source_account_name?: string | null
          source_account_type: string
          subcategory_id?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          date?: string
          description?: string | null
          destination_account_id?: string | null
          destination_account_name?: string | null
          destination_account_type?: string | null
          icon?: string | null
          id?: string
          interest_rate?: number | null
          is_credit_card?: boolean | null
          is_recurring?: boolean | null
          loan_term_months?: number | null
          merchant?: string | null
          metadata?: Json | null
          name?: string
          parent_transaction_id?: string | null
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          source_account_id?: string | null
          source_account_name?: string | null
          source_account_type?: string
          subcategory_id?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_destination_account_id_fkey"
            columns: ["destination_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_transaction_id_fkey"
            columns: ["parent_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_source_account_id_fkey"
            columns: ["source_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "budget_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions_real: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          date: string
          description: string | null
          destination_account_id: string | null
          destination_account_name: string | null
          destination_account_type: string | null
          icon: string | null
          id: string
          interest_rate: number | null
          is_credit_card: boolean | null
          is_recurring: boolean | null
          loan_term_months: number | null
          merchant: string | null
          metadata: Json | null
          name: string
          parent_transaction_id: string | null
          recurrence_end_date: string | null
          recurrence_pattern: string | null
          source_account_id: string | null
          source_account_name: string | null
          source_account_type: string
          subcategory_id: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          date?: string
          description?: string | null
          destination_account_id?: string | null
          destination_account_name?: string | null
          destination_account_type?: string | null
          icon?: string | null
          id?: string
          interest_rate?: number | null
          is_credit_card?: boolean | null
          is_recurring?: boolean | null
          loan_term_months?: number | null
          merchant?: string | null
          metadata?: Json | null
          name: string
          parent_transaction_id?: string | null
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          source_account_id?: string | null
          source_account_name?: string | null
          source_account_type: string
          subcategory_id?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          date?: string
          description?: string | null
          destination_account_id?: string | null
          destination_account_name?: string | null
          destination_account_type?: string | null
          icon?: string | null
          id?: string
          interest_rate?: number | null
          is_credit_card?: boolean | null
          is_recurring?: boolean | null
          loan_term_months?: number | null
          merchant?: string | null
          metadata?: Json | null
          name?: string
          parent_transaction_id?: string | null
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          source_account_id?: string | null
          source_account_name?: string | null
          source_account_type?: string
          subcategory_id?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_real_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories_real"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_real_parent_transaction_id_fkey"
            columns: ["parent_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions_real"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_real_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "budget_subcategories_real"
            referencedColumns: ["id"]
          },
        ]
      }
      upcoming_bills: {
        Row: {
          account_id: string | null
          amount: number
          autopay: boolean | null
          autopay_account_id: string | null
          autopay_credit_card_id: string | null
          autopay_source: string
          budget_period: string | null
          category_id: string | null
          created_at: string | null
          credit_card_id: string | null
          description: string | null
          due_date: string
          end_date: string | null
          frequency: string
          id: string
          is_included_in_budget: boolean | null
          last_paid_amount: number | null
          last_paid_date: string | null
          last_reminder_sent: string | null
          metadata: Json | null
          name: string
          next_due_date: string | null
          notes: string | null
          payment_count: number | null
          recurrence_count: number | null
          recurrence_end_date: string | null
          recurrence_pattern: Json | null
          reminder_days_before: number[] | null
          reminder_enabled: boolean | null
          status: string
          subcategory_id: string | null
          tags: string[] | null
          total_paid_amount: number | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          autopay?: boolean | null
          autopay_account_id?: string | null
          autopay_credit_card_id?: string | null
          autopay_source: string
          budget_period?: string | null
          category_id?: string | null
          created_at?: string | null
          credit_card_id?: string | null
          description?: string | null
          due_date: string
          end_date?: string | null
          frequency: string
          id?: string
          is_included_in_budget?: boolean | null
          last_paid_amount?: number | null
          last_paid_date?: string | null
          last_reminder_sent?: string | null
          metadata?: Json | null
          name: string
          next_due_date?: string | null
          notes?: string | null
          payment_count?: number | null
          recurrence_count?: number | null
          recurrence_end_date?: string | null
          recurrence_pattern?: Json | null
          reminder_days_before?: number[] | null
          reminder_enabled?: boolean | null
          status?: string
          subcategory_id?: string | null
          tags?: string[] | null
          total_paid_amount?: number | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          autopay?: boolean | null
          autopay_account_id?: string | null
          autopay_credit_card_id?: string | null
          autopay_source?: string
          budget_period?: string | null
          category_id?: string | null
          created_at?: string | null
          credit_card_id?: string | null
          description?: string | null
          due_date?: string
          end_date?: string | null
          frequency?: string
          id?: string
          is_included_in_budget?: boolean | null
          last_paid_amount?: number | null
          last_paid_date?: string | null
          last_reminder_sent?: string | null
          metadata?: Json | null
          name?: string
          next_due_date?: string | null
          notes?: string | null
          payment_count?: number | null
          recurrence_count?: number | null
          recurrence_end_date?: string | null
          recurrence_pattern?: Json | null
          reminder_days_before?: number[] | null
          reminder_enabled?: boolean | null
          status?: string
          subcategory_id?: string | null
          tags?: string[] | null
          total_paid_amount?: number | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "upcoming_bills_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upcoming_bills_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upcoming_bills_credit_card_id_fkey"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upcoming_bills_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "budget_subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upcoming_bills_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      upcoming_bills_real: {
        Row: {
          account_id: string | null
          amount: number
          autopay: boolean | null
          autopay_account_id: string | null
          autopay_credit_card_id: string | null
          autopay_source: string
          budget_period: string | null
          category_id: string | null
          created_at: string | null
          credit_card_id: string | null
          description: string | null
          due_date: string
          end_date: string | null
          frequency: string
          id: string
          is_included_in_budget: boolean | null
          last_paid_amount: number | null
          last_paid_date: string | null
          last_reminder_sent: string | null
          metadata: Json | null
          name: string
          next_due_date: string | null
          notes: string | null
          payment_count: number | null
          recurrence_count: number | null
          recurrence_end_date: string | null
          recurrence_pattern: Json | null
          reminder_days_before: number[] | null
          reminder_enabled: boolean | null
          status: string
          subcategory_id: string | null
          tags: string[] | null
          total_paid_amount: number | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          autopay?: boolean | null
          autopay_account_id?: string | null
          autopay_credit_card_id?: string | null
          autopay_source: string
          budget_period?: string | null
          category_id?: string | null
          created_at?: string | null
          credit_card_id?: string | null
          description?: string | null
          due_date: string
          end_date?: string | null
          frequency: string
          id?: string
          is_included_in_budget?: boolean | null
          last_paid_amount?: number | null
          last_paid_date?: string | null
          last_reminder_sent?: string | null
          metadata?: Json | null
          name: string
          next_due_date?: string | null
          notes?: string | null
          payment_count?: number | null
          recurrence_count?: number | null
          recurrence_end_date?: string | null
          recurrence_pattern?: Json | null
          reminder_days_before?: number[] | null
          reminder_enabled?: boolean | null
          status?: string
          subcategory_id?: string | null
          tags?: string[] | null
          total_paid_amount?: number | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          autopay?: boolean | null
          autopay_account_id?: string | null
          autopay_credit_card_id?: string | null
          autopay_source?: string
          budget_period?: string | null
          category_id?: string | null
          created_at?: string | null
          credit_card_id?: string | null
          description?: string | null
          due_date?: string
          end_date?: string | null
          frequency?: string
          id?: string
          is_included_in_budget?: boolean | null
          last_paid_amount?: number | null
          last_paid_date?: string | null
          last_reminder_sent?: string | null
          metadata?: Json | null
          name?: string
          next_due_date?: string | null
          notes?: string | null
          payment_count?: number | null
          recurrence_count?: number | null
          recurrence_end_date?: string | null
          recurrence_pattern?: Json | null
          reminder_days_before?: number[] | null
          reminder_enabled?: boolean | null
          status?: string
          subcategory_id?: string | null
          tags?: string[] | null
          total_paid_amount?: number | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "upcoming_bills_real_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts_real"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upcoming_bills_real_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "balance_verification"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upcoming_bills_real_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories_real"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upcoming_bills_real_credit_card_id_fkey"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards_real"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upcoming_bills_real_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "budget_subcategories_real"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upcoming_bills_real_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions_real"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_payments: {
        Row: {
          account_id: string | null
          amount: number
          bill_id: string
          created_at: string | null
          credit_card_id: string | null
          id: string
          metadata: Json | null
          notes: string | null
          payment_date: string
          payment_method: string | null
          reference_number: string | null
          status: string
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          bill_id: string
          created_at?: string | null
          credit_card_id?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          payment_date: string
          payment_method?: string | null
          reference_number?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          bill_id?: string
          created_at?: string | null
          credit_card_id?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          reference_number?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bill_payments_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "upcoming_bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_payments_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_payments_credit_card_id_fkey"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_payments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_payments_real: {
        Row: {
          account_id: string | null
          amount: number
          bill_id: string
          created_at: string | null
          credit_card_id: string | null
          id: string
          metadata: Json | null
          notes: string | null
          payment_date: string
          payment_method: string | null
          reference_number: string | null
          status: string
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          bill_id: string
          created_at?: string | null
          credit_card_id?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          payment_date: string
          payment_method?: string | null
          reference_number?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          bill_id?: string
          created_at?: string | null
          credit_card_id?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          reference_number?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bill_payments_real_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "upcoming_bills_real"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_payments_real_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts_real"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_payments_real_credit_card_id_fkey"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards_real"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_payments_real_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions_real"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_reminders: {
        Row: {
          bill_id: string
          created_at: string | null
          days_before: number | null
          delivery_method: string | null
          delivery_status: string | null
          id: string
          message: string | null
          metadata: Json | null
          reminder_date: string
          reminder_type: string | null
          sent_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bill_id: string
          created_at?: string | null
          days_before?: number | null
          delivery_method?: string | null
          delivery_status?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          reminder_date: string
          reminder_type?: string | null
          sent_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bill_id?: string
          created_at?: string | null
          days_before?: number | null
          delivery_method?: string | null
          delivery_status?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          reminder_date?: string
          reminder_type?: string | null
          sent_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bill_reminders_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "upcoming_bills"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_reminders_real: {
        Row: {
          bill_id: string
          created_at: string | null
          days_before: number | null
          delivery_method: string | null
          delivery_status: string | null
          id: string
          message: string | null
          metadata: Json | null
          reminder_date: string
          reminder_type: string | null
          sent_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bill_id: string
          created_at?: string | null
          days_before?: number | null
          delivery_method?: string | null
          delivery_status?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          reminder_date: string
          reminder_type?: string | null
          sent_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bill_id?: string
          created_at?: string | null
          days_before?: number | null
          delivery_method?: string | null
          delivery_status?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          reminder_date?: string
          reminder_type?: string | null
          sent_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bill_reminders_real_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "upcoming_bills_real"
            referencedColumns: ["id"]
          },
        ]
      }
      zero_based_budgets: {
        Row: {
          allocated_amount: number
          category_id: string
          created_at: string | null
          id: string
          period_id: string
          remaining_amount: number | null
          spent_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allocated_amount: number
          category_id: string
          created_at?: string | null
          id?: string
          period_id: string
          remaining_amount?: number | null
          spent_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allocated_amount?: number
          category_id?: string
          created_at?: string | null
          id?: string
          period_id?: string
          remaining_amount?: number | null
          spent_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zero_based_budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories_real"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zero_based_budgets_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "budget_periods"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      balance_system_health: {
        Row: {
          metric: string | null
          value: string | null
        }
        Relationships: []
      }
      balance_verification: {
        Row: {
          account_name: string | null
          account_type: string | null
          calculated_balance: number | null
          data_sync_status: string | null
          difference: number | null
          id: string | null
          last_updated: string | null
          stored_balance: number | null
        }
        Relationships: []
      }
      net_worth_entries_detailed: {
        Row: {
          asset_name: string | null
          category_color: string | null
          category_icon: string | null
          category_id: string | null
          category_name: string | null
          category_type: Database["public"]["Enums"]["net_worth_type"] | null
          created_at: string | null
          date: string | null
          id: string | null
          is_active: boolean | null
          is_included_in_net_worth: boolean | null
          last_synced_at: string | null
          linked_source_id: string | null
          linked_source_type:
            | Database["public"]["Enums"]["linked_source_type"]
            | null
          market_price: number | null
          notes: string | null
          quantity: number | null
          subcategory_id: string | null
          subcategory_name: string | null
          updated_at: string | null
          user_id: string | null
          value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "net_worth_entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "net_worth_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "net_worth_entries_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "net_worth_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      net_worth_entries_detailed_real: {
        Row: {
          asset_name: string | null
          category_color: string | null
          category_icon: string | null
          category_id: string | null
          category_name: string | null
          category_type: Database["public"]["Enums"]["net_worth_type"] | null
          created_at: string | null
          date: string | null
          id: string | null
          is_active: boolean | null
          is_included_in_net_worth: boolean | null
          last_synced_at: string | null
          linked_source_id: string | null
          linked_source_type:
            | Database["public"]["Enums"]["linked_source_type"]
            | null
          market_price: number | null
          notes: string | null
          quantity: number | null
          subcategory_id: string | null
          subcategory_name: string | null
          updated_at: string | null
          user_id: string | null
          value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "net_worth_entries_real_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "net_worth_categories_real"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "net_worth_entries_real_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "net_worth_subcategories_real"
            referencedColumns: ["id"]
          },
        ]
      }
      user_net_worth_summary: {
        Row: {
          asset_count: number | null
          category_name: string | null
          category_type: Database["public"]["Enums"]["net_worth_type"] | null
          color: string | null
          icon: string | null
          last_updated: string | null
          total_value: number | null
          user_id: string | null
        }
        Relationships: []
      }
      user_net_worth_summary_real: {
        Row: {
          asset_count: number | null
          category_name: string | null
          category_type: Database["public"]["Enums"]["net_worth_type"] | null
          color: string | null
          icon: string | null
          last_updated: string | null
          total_value: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_group_member: {
        Args: {
          p_email: string
          p_group_id: string
          p_name?: string
          p_role?: string
        }
        Returns: string
      }
      add_or_get_individual_contact: {
        Args: { p_contact_email: string; p_contact_name?: string }
        Returns: string
      }
      bulk_insert_transactions: {
        Args: { transactions_data: Json }
        Returns: {
          error_count: number
          errors: Json
          inserted_count: number
          status: string
        }[]
      }
      calculate_loan_interest: {
        Args: { p_calculation_date?: string; p_loan_id: string }
        Returns: number
      }
      calculate_user_net_worth: {
        Args: { user_uuid: string }
        Returns: {
          net_worth: number
          total_assets: number
          total_liabilities: number
        }[]
      }
      calculate_user_net_worth_real: {
        Args: { user_uuid: string }
        Returns: {
          net_worth: number
          total_assets: number
          total_liabilities: number
        }[]
      }
      create_group_with_members: {
        Args: {
          p_description?: string
          p_member_emails?: string[]
          p_name: string
        }
        Returns: string
      }
      create_net_worth_snapshot: {
        Args: { user_uuid: string }
        Returns: string
      }
      create_net_worth_snapshot_real: {
        Args: { user_uuid: string }
        Returns: string
      }
      create_or_get_financial_relationship: {
        Args: { p_related_user_id: string; p_relationship_type?: string }
        Returns: string
      }
      create_test_contacts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_transaction_with_splits: {
        Args: { p_splits: Json[]; p_transaction_data: Json }
        Returns: string
      }
      detect_duplicate_transactions: {
        Args: { transactions_data: Json; user_uuid: string }
        Returns: {
          duplicate_count: number
          duplicates: Json
        }[]
      }
      fix_all_balance_issues: {
        Args: Record<PropertyKey, never>
        Returns: {
          action: string
          result: string
        }[]
      }
      fix_missing_balance_records: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_budget_overview: {
        Args: { p_period_type?: string; p_user_id: string }
        Returns: {
          categories_over_budget: number
          categories_under_budget: number
          net_actual: number
          net_budget: number
          savings_rate: number
          total_categories: number
          total_expense_actual: number
          total_expense_budget: number
          total_income_actual: number
          total_income_budget: number
        }[]
      }
      get_budget_progress: {
        Args: {
          p_period_type?: string
          p_transaction_type?: string
          p_user_id: string
        }
        Returns: {
          bg_color: string
          budget_limit: number
          category_id: string
          category_name: string
          category_type: string
          display_order: number
          icon: string
          percentage_used: number
          remaining_amount: number
          ring_color: string
          spent_amount: number
          status: string
        }[]
      }
      get_budget_progress_filtered: {
        Args: {
          p_category_ids: string[]
          p_period_type?: string
          p_transaction_type?: string
          p_user_id: string
        }
        Returns: {
          budget_limit: number
          category_id: string
          category_name: string
          percentage_used: number
          spent_amount: number
        }[]
      }
      get_budget_summary: {
        Args: {
          p_period_type?: string
          p_transaction_type?: string
          p_user_id: string
        }
        Returns: {
          category_count: number
          category_type: string
          over_budget_count: number
          overall_percentage: number
          total_budget: number
          total_remaining: number
          total_spent: number
          under_budget_count: number
        }[]
      }
      get_category_details: {
        Args: {
          p_category_id: string
          p_period_type?: string
          p_transaction_type?: string
          p_user_id: string
        }
        Returns: {
          active_subcategory_count: number
          bg_color: string
          budget_limit: number
          category_id: string
          category_name: string
          category_type: string
          icon: string
          percentage_used: number
          period_end: string
          period_start: string
          recent_transactions_count: number
          remaining_amount: number
          ring_color: string
          spent_amount: number
          status: string
          subcategory_count: number
        }[]
      }
      get_group_balances: {
        Args: { p_group_id: string }
        Returns: {
          net_balance: number
          total_owed: number
          total_paid: number
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      get_subcategory_progress: {
        Args: {
          p_category_id: string
          p_period_type?: string
          p_transaction_type?: string
          p_user_id: string
        }
        Returns: {
          budget_limit: number
          color: string
          display_order: number
          icon: string
          is_active: boolean
          percentage_used: number
          remaining_amount: number
          spent_amount: number
          subcategory_id: string
          subcategory_name: string
          transaction_count: number
        }[]
      }
      get_subcategory_summary: {
        Args: {
          p_category_id: string
          p_period_type?: string
          p_transaction_type?: string
          p_user_id: string
        }
        Returns: {
          active_subcategories: number
          overall_percentage: number
          total_budget: number
          total_remaining: number
          total_spent: number
          total_subcategories: number
        }[]
      }
      get_subcategory_transactions: {
        Args: {
          p_limit?: number
          p_period_type?: string
          p_subcategory_id: string
          p_transaction_type?: string
          p_user_id: string
        }
        Returns: {
          amount: number
          date: string
          description: string
          merchant: string
          transaction_id: string
          transaction_name: string
        }[]
      }
      get_user_unsettled_splits: {
        Args: { p_user_id?: string }
        Returns: {
          group_name: string
          paid_by_name: string
          share_amount: number
          split_id: string
          transaction_date: string
          transaction_id: string
          transaction_name: string
        }[]
      }
      recalculate_account_balance: {
        Args: { account_uuid: string }
        Returns: number
      }
      recalculate_all_balances: {
        Args: Record<PropertyKey, never>
        Returns: {
          account_id: string
          account_name: string
          difference: number
          new_balance: number
          old_balance: number
        }[]
      }
      run_balance_diagnostics: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          details: string
          status: string
        }[]
      }
      settle_transaction_split: {
        Args: {
          p_notes?: string
          p_settlement_method?: string
          p_split_id: string
        }
        Returns: boolean
      }
      sync_accounts_to_net_worth: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sync_accounts_to_net_worth_real: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sync_all_account_details: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      sync_credit_cards_to_net_worth: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sync_credit_cards_to_net_worth_real: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_financial_relationship_balance: {
        Args: { p_relationship_id: string }
        Returns: number
      }
      validate_bulk_transactions: {
        Args: { transactions_data: Json }
        Returns: {
          is_valid: boolean
          total_count: number
          validation_errors: Json
        }[]
      }
    }
    Enums: {
      linked_source_type: "account" | "credit_card" | "transaction" | "manual"
      net_worth_type: "asset" | "liability"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      linked_source_type: ["account", "credit_card", "transaction", "manual"],
      net_worth_type: ["asset", "liability"],
    },
  },
} as const
