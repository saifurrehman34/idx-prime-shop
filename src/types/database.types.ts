
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
      addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          country: string
          created_at: string
          id: string
          is_default: boolean
          postal_code: string
          state: string
          user_id: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean
          postal_code: string
          state: string
          user_id: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean
          postal_code?: string
          state?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      blog_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string
          title?: string
        }
        Relationships: []
      }
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
      categories: {
        Row: {
          created_at: string
          data_ai_hint: string
          id: string
          image_url: string
          name: string
        }
        Insert: {
          created_at?: string
          data_ai_hint: string
          id?: string
          image_url: string
          name: string
        }
        Update: {
          created_at?: string
          data_ai_hint?: string
          id?: string
          image_url?: string
          name?: string
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          id: string
          created_at: string
          title: string
          subtitle: string | null
          image_url: string
          image_ai_hint: string | null
          link: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          subtitle?: string | null
          image_url: string
          image_ai_hint?: string | null
          link?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          subtitle?: string | null
          image_url?: string
          image_ai_hint?: string | null
          link?: string | null
          is_active?: boolean
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      offers: {
        Row: {
          created_at: string
          description: string
          id: string
          image_url: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          image_url: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          title?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Insert: {
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Update: {
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          payment_method: string
          shipping_address_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          payment_method: string
          shipping_address_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          payment_method?: string
          shipping_address_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_shipping_address_id_fkey"
            columns: ["shipping_address_id"]
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          data_ai_hint: string
          description: string
          id: string
          image_url: string
          is_best_seller: boolean
          is_featured: boolean
          long_description: string
          name: string
          price: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          data_ai_hint: string
          description: string
          id?: string
          image_url: string
          is_best_seller?: boolean
          is_featured?: boolean
          long_description: string
          name: string
          price: number
        }
        Update: {
          category_id?: string | null
          created_at?: string
          data_ai_hint?: string
          description?: string
          id?: string
          image_url?: string
          is_best_seller?: boolean
          is_featured?: boolean
          long_description?: string
          name?: string
          price?: number
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
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          product_id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      testimonials: {
        Row: {
          created_at: string
          id: string
          image_url: string
          name: string
          quote: string
          rating: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          name: string
          quote: string
          rating: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          name?: string
          quote?: string
          rating?: number
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          role: string
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          role?: string
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
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
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_user_id_fkey"
            columns: ["user_id"]
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
      execute_sql: {
        Args: {
          sql_query: string
        }
        Returns: Record<string, unknown>[]
      }
      get_admin_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_revenue: number
          total_orders: number
          pending_orders: number
          total_products: number
          total_users: number
          total_subscribers: number
        }[]
      }
      get_revenue_over_time: {
        Args: Record<PropertyKey, never>
        Returns: {
          month: string
          total_revenue: number
        }[]
      }
      get_user_order_stats: {
        Args: {
          p_user_id: string
        }
        Returns: {
          total_spent: number
          total_orders: number
          pending_orders: number
        }[]
      }
      user_has_purchased_product: {
        Args: {
          p_user_id: string
          p_product_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      order_status: "pending" | "shipped" | "delivered" | "cancelled"
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
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

    