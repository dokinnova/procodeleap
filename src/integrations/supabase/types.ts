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
      app_users: {
        Row: {
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      child_documents: {
        Row: {
          child_id: string
          created_at: string
          description: string | null
          file_path: string
          file_size: number
          file_type: string
          filename: string
          id: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          child_id: string
          created_at?: string
          description?: string | null
          file_path: string
          file_size: number
          file_type: string
          filename: string
          id?: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          child_id?: string
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number
          file_type?: string
          filename?: string
          id?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_documents_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          age: number
          birth_date: string
          created_at: string
          grade: string | null
          id: string
          image_url: string | null
          location: string
          name: string
          priority: string | null
          school_id: string | null
          status: Database["public"]["Enums"]["child_status"]
          story: string | null
        }
        Insert: {
          age: number
          birth_date: string
          created_at?: string
          grade?: string | null
          id?: string
          image_url?: string | null
          location: string
          name: string
          priority?: string | null
          school_id?: string | null
          status?: Database["public"]["Enums"]["child_status"]
          story?: string | null
        }
        Update: {
          age?: number
          birth_date?: string
          created_at?: string
          grade?: string | null
          id?: string
          image_url?: string | null
          location?: string
          name?: string
          priority?: string | null
          school_id?: string | null
          status?: Database["public"]["Enums"]["child_status"]
          story?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      email_batches: {
        Row: {
          content: string
          created_at: string | null
          id: string
          recipients_count: number
          sent_at: string | null
          status: Database["public"]["Enums"]["email_batch_status"] | null
          subject: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          recipients_count: number
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_batch_status"] | null
          subject: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          recipients_count?: number
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_batch_status"] | null
          subject?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          account_number: string | null
          bank_name: string | null
          card_last_four: string | null
          created_at: string
          id: string
          is_default: boolean | null
          method: Database["public"]["Enums"]["payment_method"]
          paypal_email: string | null
          sponsor_id: string
        }
        Insert: {
          account_number?: string | null
          bank_name?: string | null
          card_last_four?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          method: Database["public"]["Enums"]["payment_method"]
          paypal_email?: string | null
          sponsor_id: string
        }
        Update: {
          account_number?: string | null
          bank_name?: string | null
          card_last_four?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          method?: Database["public"]["Enums"]["payment_method"]
          paypal_email?: string | null
          sponsor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          amount: number
          created_at: string
          id: string
          month: number
          payment_date: string | null
          sponsorship_id: string
          status: Database["public"]["Enums"]["receipt_status"] | null
          year: number
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          month: number
          payment_date?: string | null
          sponsorship_id: string
          status?: Database["public"]["Enums"]["receipt_status"] | null
          year: number
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          month?: number
          payment_date?: string | null
          sponsorship_id?: string
          status?: Database["public"]["Enums"]["receipt_status"] | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "receipts_sponsorship_id_fkey"
            columns: ["sponsorship_id"]
            isOneToOne: false
            referencedRelation: "sponsorships"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: number
          logo_url: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          logo_url?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          logo_url?: string | null
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          address: string | null
          city: string | null
          contribution: number
          country: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          mobile_phone: string | null
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["sponsor_status"]
        }
        Insert: {
          address?: string | null
          city?: string | null
          contribution?: number
          country?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          mobile_phone?: string | null
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["sponsor_status"]
        }
        Update: {
          address?: string | null
          city?: string | null
          contribution?: number
          country?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          mobile_phone?: string | null
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["sponsor_status"]
        }
        Relationships: []
      }
      sponsorships: {
        Row: {
          child_id: string
          created_at: string
          id: string
          notes: string | null
          sponsor_id: string
          start_date: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          notes?: string | null
          sponsor_id: string
          start_date: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          sponsor_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsorships_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsorships_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: true
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          child_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          related_to: string | null
          sponsor_id: string | null
          status: string
          title: string
        }
        Insert: {
          child_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          related_to?: string | null
          sponsor_id?: string | null
          status: string
          title: string
        }
        Update: {
          child_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          related_to?: string | null
          sponsor_id?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      child_status: "assigned" | "assignable" | "inactive" | "pending" | "baja"
      email_batch_status: "pending" | "sent" | "failed"
      payment_method: "bank_transfer" | "credit_card" | "paypal" | "cash"
      receipt_status: "pending" | "paid" | "cancelled"
      sponsor_status: "active" | "inactive" | "pending" | "baja"
      user_role: "admin" | "editor" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
