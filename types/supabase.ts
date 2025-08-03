export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
            foreignKeyName: "transactions_real_destination_account_id_fkey"
            columns: ["destination_account_id"]
            isOneToOne: false
            referencedRelation: "accounts_real"
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
          autopay_source: string
          category_id: string | null
          created_at: string | null
          credit_card_id: string | null
          description: string | null
          due_date: string
          end_date: string | null
          frequency: string
          id: string
          name: string
          status: string
          subcategory_id: string | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          autopay?: boolean | null
          autopay_source: string
          category_id?: string | null
          created_at?: string | null
          credit_card_id?: string | null
          description?: string | null
          due_date: string
          end_date?: string | null
          frequency: string
          id?: string
          name: string
          status?: string
          subcategory_id?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          autopay?: boolean | null
          autopay_source?: string
          category_id?: string | null
          created_at?: string | null
          credit_card_id?: string | null
          description?: string | null
          due_date?: string
          end_date?: string | null
          frequency?: string
          id?: string
          name?: string
          status?: string
          subcategory_id?: string | null
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
          autopay_source: string
          category_id: string | null
          created_at: string | null
          credit_card_id: string | null
          description: string | null
          due_date: string
          end_date: string | null
          frequency: string
          id: string
          name: string
          status: string
          subcategory_id: string | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          autopay?: boolean | null
          autopay_source: string
          category_id?: string | null
          created_at?: string | null
          credit_card_id?: string | null
          description?: string | null
          due_date: string
          end_date?: string | null
          frequency: string
          id?: string
          name: string
          status?: string
          subcategory_id?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          autopay?: boolean | null
          autopay_source?: string
          category_id?: string | null
          created_at?: string | null
          credit_card_id?: string | null
          description?: string | null
          due_date?: string
          end_date?: string | null
          frequency?: string
          id?: string
          name?: string
          status?: string
          subcategory_id?: string | null
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
    }
    Functions: {
      calculate_user_net_worth: {
        Args: { user_uuid: string }
        Returns: {
          total_assets: number
          total_liabilities: number
          net_worth: number
        }[]
      }
      create_net_worth_snapshot: {
        Args: { user_uuid: string }
        Returns: string
      }
      sync_accounts_to_net_worth: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sync_credit_cards_to_net_worth: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
