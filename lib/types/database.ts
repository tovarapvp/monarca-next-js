export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          is_per_unit: boolean | null
          notes: string | null
          order_id: string
          price_at_purchase: number
          product_id: string
          product_variant_id: string | null
          quantity: number
          unit_type: string | null
          variant_id: string | null
          variant_name: string | null
          variant_options: Json | null
          variant_value: string | null
        }
        Insert: {
          id?: string
          is_per_unit?: boolean | null
          notes?: string | null
          order_id: string
          price_at_purchase: number
          product_id: string
          product_variant_id?: string | null
          quantity: number
          unit_type?: string | null
          variant_id?: string | null
          variant_name?: string | null
          variant_options?: Json | null
          variant_value?: string | null
        }
        Update: {
          id?: string
          is_per_unit?: boolean | null
          notes?: string | null
          order_id?: string
          price_at_purchase?: number
          product_id?: string
          product_variant_id?: string | null
          quantity?: number
          unit_type?: string | null
          variant_id?: string | null
          variant_name?: string | null
          variant_options?: Json | null
          variant_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_email: string
          customer_name: string
          id: string
          shipping_address: Json
          status: Database["public"]["Enums"]["order_status"] | null
          total: number
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          customer_name: string
          id?: string
          shipping_address: Json
          status?: Database["public"]["Enums"]["order_status"] | null
          total: number
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          id?: string
          shipping_address?: Json
          status?: Database["public"]["Enums"]["order_status"] | null
          total?: number
        }
        Relationships: []
      }
      product_option_values: {
        Row: {
          created_at: string | null
          id: string
          option_id: string
          position: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_id: string
          position?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_id?: string
          position?: number | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_option_values_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "product_options"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          created_at: string | null
          id: string
          name: string
          position: number | null
          product_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          position?: number | null
          product_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          position?: number | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          allow_backorder: boolean | null
          barcode: string | null
          compare_at_price: number | null
          created_at: string | null
          id: string
          images: string[] | null
          is_available: boolean | null
          max_quantity: number | null
          min_quantity: number | null
          price: number
          price_per_unit: number | null
          pricing_type: string | null
          product_id: string
          sku: string | null
          stock_quantity: number | null
          track_inventory: boolean | null
          unit_type: string | null
          weight_grams: number | null
        }
        Insert: {
          allow_backorder?: boolean | null
          barcode?: string | null
          compare_at_price?: number | null
          created_at?: string | null
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          max_quantity?: number | null
          min_quantity?: number | null
          price: number
          price_per_unit?: number | null
          pricing_type?: string | null
          product_id: string
          sku?: string | null
          stock_quantity?: number | null
          track_inventory?: boolean | null
          unit_type?: string | null
          weight_grams?: number | null
        }
        Update: {
          allow_backorder?: boolean | null
          barcode?: string | null
          compare_at_price?: number | null
          created_at?: string | null
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          max_quantity?: number | null
          min_quantity?: number | null
          price?: number
          price_per_unit?: number | null
          pricing_type?: string | null
          product_id?: string
          sku?: string | null
          stock_quantity?: number | null
          track_inventory?: boolean | null
          unit_type?: string | null
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          care_instructions: string | null
          category: string | null
          color: string | null
          created_at: string | null
          description: string | null
          details: Json | null
          has_variants: boolean | null
          id: string
          images: string[] | null
          in_stock: boolean | null
          material: string | null
          max_quantity: number | null
          min_quantity: number | null
          name: string
          price: number
          price_per_unit: number | null
          pricing_type: string | null
          shipping_info: string | null
          size: string | null
          tags: string[] | null
          unit_type: string | null
          weight_grams: number | null
        }
        Insert: {
          care_instructions?: string | null
          category?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          details?: Json | null
          has_variants?: boolean | null
          id?: string
          images?: string[] | null
          in_stock?: boolean | null
          material?: string | null
          max_quantity?: number | null
          min_quantity?: number | null
          name: string
          price: number
          price_per_unit?: number | null
          pricing_type?: string | null
          shipping_info?: string | null
          size?: string | null
          tags?: string[] | null
          unit_type?: string | null
          weight_grams?: number | null
        }
        Update: {
          care_instructions?: string | null
          category?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          details?: Json | null
          has_variants?: boolean | null
          id?: string
          images?: string[] | null
          in_stock?: boolean | null
          material?: string | null
          max_quantity?: number | null
          min_quantity?: number | null
          name?: string
          price?: number
          price_per_unit?: number | null
          pricing_type?: string | null
          shipping_info?: string | null
          size?: string | null
          tags?: string[] | null
          unit_type?: string | null
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          full_name: string | null
          id: string
          role: string
        }
        Insert: {
          full_name?: string | null
          id: string
          role?: string
        }
        Update: {
          full_name?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      variant_option_values: {
        Row: {
          option_value_id: string
          variant_id: string
        }
        Insert: {
          option_value_id: string
          variant_id: string
        }
        Update: {
          option_value_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "variant_option_values_option_value_id_fkey"
            columns: ["option_value_id"]
            isOneToOne: false
            referencedRelation: "product_option_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variant_option_values_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      variants: {
        Row: {
          id: string
          name: string
          price: number | null
          product_id: string
          value: string
        }
        Insert: {
          id?: string
          name: string
          price?: number | null
          product_id: string
          value: string
        }
        Update: {
          id?: string
          name?: string
          price?: number | null
          product_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_inquiry_order: {
        Args: {
          customer_email_input: string
          customer_name_input: string
          items: Json
          shipping_address_input: Json
        }
        Returns: string
      }
      generate_variant_sku: {
        Args: { option_values: string[]; product_name: string }
        Returns: string
      }
    }
    Enums: {
      order_status:
        | "inquiry"
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      order_status: [
        "inquiry",
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const

