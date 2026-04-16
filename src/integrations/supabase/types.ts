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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          cover_letter: string | null
          created_at: string
          id: string
          job_id: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          about: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          education: Json | null
          email: string | null
          experience: Json | null
          id: string
          name: string | null
          projects: Json | null
          skills: Json | null
        }
        Insert: {
          about?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          education?: Json | null
          email?: string | null
          experience?: Json | null
          id?: string
          name?: string | null
          projects?: Json | null
          skills?: Json | null
        }
        Update: {
          about?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          education?: Json | null
          email?: string | null
          experience?: Json | null
          id?: string
          name?: string | null
          projects?: Json | null
          skills?: Json | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          created_at: string
          credential_url: string | null
          id: string
          issue_date: string | null
          issuer: string | null
          name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          credential_url?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string | null
          name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          credential_url?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string | null
          name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string
          description: string | null
          email: string | null
          id: string
          location: string | null
          logo_url: string | null
          name: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          name?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          name?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      connections: {
        Row: {
          created_at: string
          id: string
          recipient_id: string
          requester_id: string
          status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_id: string
          requester_id: string
          status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          recipient_id?: string
          requester_id?: string
          status?: string | null
        }
        Relationships: []
      }
      education: {
        Row: {
          created_at: string
          degree: string | null
          end_date: string | null
          field_of_study: string | null
          id: string
          school: string | null
          start_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          degree?: string | null
          end_date?: string | null
          field_of_study?: string | null
          id?: string
          school?: string | null
          start_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          degree?: string | null
          end_date?: string | null
          field_of_study?: string | null
          id?: string
          school?: string | null
          start_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      employee_requests: {
        Row: {
          company_id: string | null
          created_at: string
          department: string | null
          email: string | null
          id: string
          name: string | null
          role: string | null
          status: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          name?: string | null
          role?: string | null
          status?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          name?: string | null
          role?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          company_id: string | null
          created_at: string
          department: string | null
          email: string | null
          id: string
          joined_at: string | null
          name: string | null
          role: string | null
          status: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          joined_at?: string | null
          name?: string | null
          role?: string | null
          status?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          joined_at?: string | null
          name?: string | null
          role?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      experience: {
        Row: {
          company: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          location: string | null
          role: string | null
          start_date: string | null
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          location?: string | null
          role?: string | null
          start_date?: string | null
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          location?: string | null
          role?: string | null
          start_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      hr_members: {
        Row: {
          company_id: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          role: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          role?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          ats_config: Json | null
          company_id: string | null
          created_at: string
          description: string | null
          github_requirement: Json | null
          id: string
          job_type: string | null
          kaggle_requirement: Json | null
          leetcode_requirement: Json | null
          location: string | null
          priority_order: Json | null
          requirements: Json | null
          status: string | null
          title: string | null
          work_mode: string | null
        }
        Insert: {
          ats_config?: Json | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          github_requirement?: Json | null
          id?: string
          job_type?: string | null
          kaggle_requirement?: Json | null
          leetcode_requirement?: Json | null
          location?: string | null
          priority_order?: Json | null
          requirements?: Json | null
          status?: string | null
          title?: string | null
          work_mode?: string | null
        }
        Update: {
          ats_config?: Json | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          github_requirement?: Json | null
          id?: string
          job_type?: string | null
          kaggle_requirement?: Json | null
          leetcode_requirement?: Json | null
          location?: string | null
          priority_order?: Json | null
          requirements?: Json | null
          status?: string | null
          title?: string | null
          work_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_goals: {
        Row: {
          created_at: string
          goal: string | null
          id: string
          progress: number | null
          status: string | null
          target_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          goal?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          target_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          goal?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          target_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_read: boolean | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string | null
          metadata: Json | null
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          about: string | null
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          full_name: string | null
          github_url: string | null
          headline: string | null
          id: string
          kaggle_url: string | null
          leetcode_url: string | null
          linkedin_url: string | null
          location: string | null
          open_to_work: boolean | null
          phone: string | null
          seeking_type: string | null
          updated_at: string
          user_id: string
          website: string | null
          work_mode: string | null
        }
        Insert: {
          about?: string | null
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          github_url?: string | null
          headline?: string | null
          id?: string
          kaggle_url?: string | null
          leetcode_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          open_to_work?: boolean | null
          phone?: string | null
          seeking_type?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          work_mode?: string | null
        }
        Update: {
          about?: string | null
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          github_url?: string | null
          headline?: string | null
          id?: string
          kaggle_url?: string | null
          leetcode_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          open_to_work?: boolean | null
          phone?: string | null
          seeking_type?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          work_mode?: string | null
        }
        Relationships: []
      }
      project_comments: {
        Row: {
          content: string | null
          created_at: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          github_url: string | null
          id: string
          start_date: string | null
          tech_stack: Json | null
          title: string | null
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          github_url?: string | null
          id?: string
          start_date?: string | null
          tech_stack?: Json | null
          title?: string | null
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          github_url?: string | null
          id?: string
          start_date?: string | null
          tech_stack?: Json | null
          title?: string | null
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
          percentage: number | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
          percentage?: number | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          percentage?: number | null
          user_id?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
