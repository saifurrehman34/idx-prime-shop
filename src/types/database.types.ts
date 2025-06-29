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
      brands: {
        Row: {
          created_at: string
          id: string
          image_url: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          name?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          content: string
          image_url: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          image_url: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          image_url?: string
          created_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          image_url: string
          data_ai_hint: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          image_url: string
          data_ai_hint: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          image_url?: string
          data_ai_hint?: string
          created_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          id: string
          title: string
          description: string
          image_url: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          image_url: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          image_url?: string
          created_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          name: string
          price: number
          image_url: string
          description: string
          long_description: string
          data_ai_hint: string
          is_featured: boolean
          created_at: string
          category_id: string | null
        }
        Insert: {
          id?: string
          name: string
          price: number
          image_url: string
          description: string
          long_description: string
          data_ai_hint: string
          is_featured?: boolean
          created_at?: string
          category_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          price?: number
          image_url?: string
          description?: string
          long_description?: string
          data_ai_hint?: string
          is_featured?: boolean
          created_at?: string
          category_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      testimonials: {
        Row: {
          id: string
          name: string
          quote: string
          rating: number
          image_url: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          quote: string
          rating: number
          image_url: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          quote?: string
          rating?: number
          image_url?: string
          created_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          role: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
