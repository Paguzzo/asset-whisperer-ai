export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          asset_id: string
          confidence_score: number | null
          content: string
          created_at: string
          id: string
          insight_type: string
          metadata: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_id: string
          confidence_score?: number | null
          content: string
          created_at?: string
          id?: string
          insight_type: string
          metadata?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_id?: string
          confidence_score?: number | null
          content?: string
          created_at?: string
          id?: string
          insight_type?: string
          metadata?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_logs: {
        Row: {
          alert_id: string | null
          alert_type: string
          asset_id: string
          id: string
          message: string
          metadata: Json | null
          sent_at: string
          user_id: string
          whatsapp_status: string | null
        }
        Insert: {
          alert_id?: string | null
          alert_type: string
          asset_id: string
          id?: string
          message: string
          metadata?: Json | null
          sent_at?: string
          user_id: string
          whatsapp_status?: string | null
        }
        Update: {
          alert_id?: string | null
          alert_type?: string
          asset_id?: string
          id?: string
          message?: string
          metadata?: Json | null
          sent_at?: string
          user_id?: string
          whatsapp_status?: string | null
        }
        Relationships: []
      }
      assets: {
        Row: {
          asset_type: string
          created_at: string
          exchange: string | null
          id: string
          is_active: boolean
          name: string
          symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_type: string
          created_at?: string
          exchange?: string | null
          id?: string
          is_active?: boolean
          name: string
          symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_type?: string
          created_at?: string
          exchange?: string | null
          id?: string
          is_active?: boolean
          name?: string
          symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monitoring_configs: {
        Row: {
          asset_id: string
          created_at: string
          id: string
          intervals: Json
          is_active: boolean
          pre_alert_percentage: number | null
          stop_loss_price: number | null
          take_profit_price: number | null
          target_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          id?: string
          intervals?: Json
          is_active?: boolean
          pre_alert_percentage?: number | null
          stop_loss_price?: number | null
          take_profit_price?: number | null
          target_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          id?: string
          intervals?: Json
          is_active?: boolean
          pre_alert_percentage?: number | null
          stop_loss_price?: number | null
          take_profit_price?: number | null
          target_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_configs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      news_article_assets: {
        Row: {
          asset_id: string
          created_at: string
          id: string
          news_article_id: string
          relevance_score: number | null
        }
        Insert: {
          asset_id: string
          created_at?: string
          id?: string
          news_article_id: string
          relevance_score?: number | null
        }
        Update: {
          asset_id?: string
          created_at?: string
          id?: string
          news_article_id?: string
          relevance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_news_article_assets_asset"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_news_article_assets_news_article"
            columns: ["news_article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles: {
        Row: {
          author: string | null
          content: string | null
          created_at: string
          description: string | null
          entities: string[] | null
          id: string
          impact_score: number | null
          published_at: string | null
          raw_data: Json | null
          sentiment_score: number | null
          snippet: string | null
          source: string
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          author?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          entities?: string[] | null
          id?: string
          impact_score?: number | null
          published_at?: string | null
          raw_data?: Json | null
          sentiment_score?: number | null
          snippet?: string | null
          source: string
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          author?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          entities?: string[] | null
          id?: string
          impact_score?: number | null
          published_at?: string | null
          raw_data?: Json | null
          sentiment_score?: number | null
          snippet?: string | null
          source?: string
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      news_summaries: {
        Row: {
          articles_count: number
          confidence_score: number | null
          content: string
          created_at: string
          id: string
          key_events: string[] | null
          market_impact_analysis: string | null
          raw_articles: Json | null
          sentiment_overview: string | null
          summary_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          articles_count?: number
          confidence_score?: number | null
          content: string
          created_at?: string
          id?: string
          key_events?: string[] | null
          market_impact_analysis?: string | null
          raw_articles?: Json | null
          sentiment_overview?: string | null
          summary_type: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          articles_count?: number
          confidence_score?: number | null
          content?: string
          created_at?: string
          id?: string
          key_events?: string[] | null
          market_impact_analysis?: string | null
          raw_articles?: Json | null
          sentiment_overview?: string | null
          summary_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      price_alerts: {
        Row: {
          alert_type: string
          asset_id: string
          condition: string
          created_at: string
          id: string
          is_active: boolean
          is_triggered: boolean
          pre_alert_percentage: number | null
          target_price: number
          triggered_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_type: string
          asset_id: string
          condition: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_triggered?: boolean
          pre_alert_percentage?: number | null
          target_price: number
          triggered_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          asset_id?: string
          condition?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_triggered?: boolean
          pre_alert_percentage?: number | null
          target_price?: number
          triggered_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      price_data: {
        Row: {
          asset_id: string
          change_24h: number | null
          change_percent_24h: number | null
          created_at: string
          id: string
          interval_type: string
          market_cap: number | null
          price: number
          raw_data: Json | null
          source: string
          timestamp: string
          volume: number | null
        }
        Insert: {
          asset_id: string
          change_24h?: number | null
          change_percent_24h?: number | null
          created_at?: string
          id?: string
          interval_type: string
          market_cap?: number | null
          price: number
          raw_data?: Json | null
          source: string
          timestamp: string
          volume?: number | null
        }
        Update: {
          asset_id?: string
          change_24h?: number | null
          change_percent_24h?: number | null
          created_at?: string
          id?: string
          interval_type?: string
          market_cap?: number | null
          price?: number
          raw_data?: Json | null
          source?: string
          timestamp?: string
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "price_data_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      social_sentiment: {
        Row: {
          alt_rank: number | null
          asset_id: string
          created_at: string
          galaxy_score: number | null
          id: string
          market_cap_rank: number | null
          raw_data: Json | null
          sentiment_absolute: number | null
          sentiment_score: number | null
          social_contributors: number | null
          social_dominance: number | null
          social_volume: number | null
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alt_rank?: number | null
          asset_id: string
          created_at?: string
          galaxy_score?: number | null
          id?: string
          market_cap_rank?: number | null
          raw_data?: Json | null
          sentiment_absolute?: number | null
          sentiment_score?: number | null
          social_contributors?: number | null
          social_dominance?: number | null
          social_volume?: number | null
          source: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alt_rank?: number | null
          asset_id?: string
          created_at?: string
          galaxy_score?: number | null
          id?: string
          market_cap_rank?: number | null
          raw_data?: Json | null
          sentiment_absolute?: number | null
          sentiment_score?: number | null
          social_contributors?: number | null
          social_dominance?: number | null
          social_volume?: number | null
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_configs: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_verified: boolean
          phone_number: string
          twilio_account_sid: string | null
          twilio_auth_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          phone_number: string
          twilio_account_sid?: string | null
          twilio_auth_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          phone_number?: string
          twilio_account_sid?: string | null
          twilio_auth_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
