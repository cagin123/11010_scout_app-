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
      match_entries: {
        Row: {
          alliance: string
          auto_climb_attempted: boolean
          auto_fuel_total: number
          broke_down: boolean
          climb_result: string
          created_at: string
          cycles_completed: number
          defense: string
          driver_skill_rating: number
          effective_over_bumps: boolean
          id: string
          left_starting_zone: boolean
          lost_comms: boolean
          match_number: number
          notes: string | null
          parked_only: boolean
          regional: string
          scouted_by: string
          scouted_by_team: string
          team_number: string
          teleop_fuel_total: number
          tipped_over: boolean
          used_trench_well: boolean
        }
        Insert: {
          alliance: string
          auto_climb_attempted?: boolean
          auto_fuel_total?: number
          broke_down?: boolean
          climb_result?: string
          created_at?: string
          cycles_completed?: number
          defense?: string
          driver_skill_rating?: number
          effective_over_bumps?: boolean
          id?: string
          left_starting_zone?: boolean
          lost_comms?: boolean
          match_number: number
          notes?: string | null
          parked_only?: boolean
          regional?: string
          scouted_by: string
          scouted_by_team?: string
          team_number: string
          teleop_fuel_total?: number
          tipped_over?: boolean
          used_trench_well?: boolean
        }
        Update: {
          alliance?: string
          auto_climb_attempted?: boolean
          auto_fuel_total?: number
          broke_down?: boolean
          climb_result?: string
          created_at?: string
          cycles_completed?: number
          defense?: string
          driver_skill_rating?: number
          effective_over_bumps?: boolean
          id?: string
          left_starting_zone?: boolean
          lost_comms?: boolean
          match_number?: number
          notes?: string | null
          parked_only?: boolean
          regional?: string
          scouted_by?: string
          scouted_by_team?: string
          team_number?: string
          teleop_fuel_total?: number
          tipped_over?: boolean
          used_trench_well?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          team_number: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          team_number: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          team_number?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      regionals: {
        Row: {
          created_at: string
          id: string
          name: string
          team_number: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          team_number: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          team_number?: string
        }
        Relationships: []
      }
      team_users: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          password: string
          role: string
          team_number: string
          username: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          password: string
          role?: string
          team_number: string
          username: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          password?: string
          role?: string
          team_number?: string
          username?: string
        }
        Relationships: []
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
      app_role: "admin" | "scout" | "strategist"
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
      app_role: ["admin", "scout", "strategist"],
    },
  },
} as const
