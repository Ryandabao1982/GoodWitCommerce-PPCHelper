/**
 * Database Type Definitions
 * Auto-generated types matching the Supabase database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          preferences: Json
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
      }
      brands: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          logo_url: string | null
          metadata: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          logo_url?: string | null
          metadata?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          metadata?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      keywords: {
        Row: {
          id: string
          brand_id: string
          keyword: string
          type: 'Broad' | 'Phrase' | 'Exact' | 'Long-tail'
          category: 'Core' | 'Opportunity' | 'Branded' | 'Low-hanging Fruit' | 'Complementary'
          search_volume: string
          competition: 'Low' | 'Medium' | 'High'
          relevance: number
          source: 'AI' | 'Web'
          deep_dive_data: Json | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          keyword: string
          type: 'Broad' | 'Phrase' | 'Exact' | 'Long-tail'
          category: 'Core' | 'Opportunity' | 'Branded' | 'Low-hanging Fruit' | 'Complementary'
          search_volume: string
          competition: 'Low' | 'Medium' | 'High'
          relevance: number
          source: 'AI' | 'Web'
          deep_dive_data?: Json | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          keyword?: string
          type?: 'Broad' | 'Phrase' | 'Exact' | 'Long-tail'
          category?: 'Core' | 'Opportunity' | 'Branded' | 'Low-hanging Fruit' | 'Complementary'
          search_volume?: string
          competition?: 'Low' | 'Medium' | 'High'
          relevance?: number
          source?: 'AI' | 'Web'
          deep_dive_data?: Json | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          brand_id: string
          name: string
          campaign_type: string | null
          total_budget: number | null
          projections: Json | null
          status: 'active' | 'paused' | 'archived'
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          name: string
          campaign_type?: string | null
          total_budget?: number | null
          projections?: Json | null
          status?: 'active' | 'paused' | 'archived'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          name?: string
          campaign_type?: string | null
          total_budget?: number | null
          projections?: Json | null
          status?: 'active' | 'paused' | 'archived'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      ad_groups: {
        Row: {
          id: string
          campaign_id: string
          name: string
          default_bid: number | null
          status: 'active' | 'paused' | 'archived'
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          name: string
          default_bid?: number | null
          status?: 'active' | 'paused' | 'archived'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          name?: string
          default_bid?: number | null
          status?: 'active' | 'paused' | 'archived'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      ad_group_keywords: {
        Row: {
          id: string
          ad_group_id: string
          keyword_id: string
          match_type: 'Broad' | 'Phrase' | 'Exact' | null
          bid: number | null
          status: 'enabled' | 'paused' | 'archived'
          assigned_at: string
        }
        Insert: {
          id?: string
          ad_group_id: string
          keyword_id: string
          match_type?: 'Broad' | 'Phrase' | 'Exact' | null
          bid?: number | null
          status?: 'enabled' | 'paused' | 'archived'
          assigned_at?: string
        }
        Update: {
          id?: string
          ad_group_id?: string
          keyword_id?: string
          match_type?: 'Broad' | 'Phrase' | 'Exact' | null
          bid?: number | null
          status?: 'enabled' | 'paused' | 'archived'
          assigned_at?: string
        }
      }
      search_history: {
        Row: {
          id: string
          brand_id: string
          search_terms: string[]
          search_mode: 'simple' | 'advanced'
          settings: Json | null
          results_count: number
          searched_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          search_terms: string[]
          search_mode: 'simple' | 'advanced'
          settings?: Json | null
          results_count?: number
          searched_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          search_terms?: string[]
          search_mode?: 'simple' | 'advanced'
          settings?: Json | null
          results_count?: number
          searched_at?: string
        }
      }
      keyword_clusters: {
        Row: {
          id: string
          brand_id: string
          cluster_name: string
          keyword_ids: string[]
          intent: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          cluster_name: string
          keyword_ids: string[]
          intent?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          cluster_name?: string
          keyword_ids?: string[]
          intent?: string | null
          metadata?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
