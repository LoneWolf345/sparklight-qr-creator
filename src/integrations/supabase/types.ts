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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          base_url: string
          created_at: string
          default_destination_url: string
          id: string
          logo_url: string | null
          primary_color: string
          qr_background_color: string
          qr_border_bottom_style: string
          qr_border_bottom_text: string | null
          qr_border_color: string
          qr_border_dasharray: string | null
          qr_border_enabled: boolean
          qr_border_inner_color: string
          qr_border_inner_thickness: number
          qr_border_license_key: string | null
          qr_border_outer_color: string
          qr_border_outer_thickness: number
          qr_border_round: number
          qr_border_thickness: number
          qr_border_top_style: string
          qr_border_top_text: string | null
          qr_corner_dot_color: string
          qr_corner_dot_type: string
          qr_corner_square_color: string
          qr_corner_square_type: string
          qr_dot_color: string
          qr_dot_type: string
          qr_error_correction: string
          qr_image_margin: number
          qr_image_size: number
          qr_image_url: string | null
          qr_size_inches: number
          quiet_zone_modules: number
          secondary_color: string
          updated_at: string
          x_offset_mm: number
          y_offset_mm: number
        }
        Insert: {
          base_url?: string
          created_at?: string
          default_destination_url?: string
          id?: string
          logo_url?: string | null
          primary_color?: string
          qr_background_color?: string
          qr_border_bottom_style?: string
          qr_border_bottom_text?: string | null
          qr_border_color?: string
          qr_border_dasharray?: string | null
          qr_border_enabled?: boolean
          qr_border_inner_color?: string
          qr_border_inner_thickness?: number
          qr_border_license_key?: string | null
          qr_border_outer_color?: string
          qr_border_outer_thickness?: number
          qr_border_round?: number
          qr_border_thickness?: number
          qr_border_top_style?: string
          qr_border_top_text?: string | null
          qr_corner_dot_color?: string
          qr_corner_dot_type?: string
          qr_corner_square_color?: string
          qr_corner_square_type?: string
          qr_dot_color?: string
          qr_dot_type?: string
          qr_error_correction?: string
          qr_image_margin?: number
          qr_image_size?: number
          qr_image_url?: string | null
          qr_size_inches?: number
          quiet_zone_modules?: number
          secondary_color?: string
          updated_at?: string
          x_offset_mm?: number
          y_offset_mm?: number
        }
        Update: {
          base_url?: string
          created_at?: string
          default_destination_url?: string
          id?: string
          logo_url?: string | null
          primary_color?: string
          qr_background_color?: string
          qr_border_bottom_style?: string
          qr_border_bottom_text?: string | null
          qr_border_color?: string
          qr_border_dasharray?: string | null
          qr_border_enabled?: boolean
          qr_border_inner_color?: string
          qr_border_inner_thickness?: number
          qr_border_license_key?: string | null
          qr_border_outer_color?: string
          qr_border_outer_thickness?: number
          qr_border_round?: number
          qr_border_thickness?: number
          qr_border_top_style?: string
          qr_border_top_text?: string | null
          qr_corner_dot_color?: string
          qr_corner_dot_type?: string
          qr_corner_square_color?: string
          qr_corner_square_type?: string
          qr_dot_color?: string
          qr_dot_type?: string
          qr_error_correction?: string
          qr_image_margin?: number
          qr_image_size?: number
          qr_image_url?: string | null
          qr_size_inches?: number
          quiet_zone_modules?: number
          secondary_color?: string
          updated_at?: string
          x_offset_mm?: number
          y_offset_mm?: number
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string
          entity_name: string | null
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id: string
          entity_name?: string | null
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string
          entity_name?: string | null
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      qr_batches: {
        Row: {
          city: string | null
          created_at: string
          created_by: string
          destination_url_override: string | null
          id: string
          market: string | null
          name: string
          row_count: number
          state: string | null
          status: string
          template: string
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          created_by: string
          destination_url_override?: string | null
          id?: string
          market?: string | null
          name: string
          row_count?: number
          state?: string | null
          status?: string
          template?: string
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          created_by?: string
          destination_url_override?: string | null
          id?: string
          market?: string | null
          name?: string
          row_count?: number
          state?: string | null
          status?: string
          template?: string
          updated_at?: string
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          address: string
          batch_id: string
          created_at: string
          created_by: string | null
          homes_passed_id: string
          id: string
          status: string
        }
        Insert: {
          address?: string
          batch_id: string
          created_at?: string
          created_by?: string | null
          homes_passed_id: string
          id?: string
          status?: string
        }
        Update: {
          address?: string
          batch_id?: string
          created_at?: string
          created_by?: string | null
          homes_passed_id?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "qr_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "associate"
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
      app_role: ["admin", "associate"],
    },
  },
} as const
