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
      lists: {
        Row: {
          id: string
          user_id: string
          name: string
          slug: string
          description: string
          image: string | null
          prompt_ids: string[]
          likes: number
          views: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          slug: string
          description: string
          image?: string | null
          prompt_ids: string[]
          likes?: number
          views?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          slug?: string
          description?: string
          image?: string | null
          prompt_ids?: string[]
          likes?: number
          views?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      prompts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          image: string | null
          tags: string[]
          likes: number
          views: number
          created_at: string
          updated_at: string
          theme: string | null
          category: string | null
          group: string | null
          json_prompt: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          image?: string | null
          tags: string[]
          likes?: number
          views?: number
          created_at?: string
          updated_at?: string
          theme?: string | null
          category?: string | null
          group?: string | null
          json_prompt?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          image?: string | null
          tags?: string[]
          likes?: number
          views?: number
          created_at?: string
          updated_at?: string
          theme?: string | null
          category?: string | null
          group?: string | null
          json_prompt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          created_at: string
          liked_prompts: string[]
          prompt_language: string
          site_language: string
          username: string | null
          bio: string | null
          social_links: string[] | null
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string | null
          created_at?: string
          liked_prompts?: string[]
          prompt_language?: string
          site_language?: string
          username?: string | null
          bio?: string | null
          social_links?: string[] | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          created_at?: string
          liked_prompts?: string[]
          prompt_language?: string
          site_language?: string
          username?: string | null
          bio?: string | null
          social_links?: string[] | null
        }
        Relationships: []
      }
      user_likes: {
        Row: {
          id: string
          user_id: string
          prompt_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_likes_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          title: string
          message: string
          link_text: string | null
          link_url: string | null
          icon: string | null
          is_active: boolean
          activate_start: string | null
          activate_end: string | null
          background_color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          message: string
          link_text?: string | null
          link_url?: string | null
          icon?: string | null
          is_active?: boolean
          activate_start?: string | null
          activate_end?: string | null
          background_color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          message?: string
          link_text?: string | null
          link_url?: string | null
          icon?: string | null
          is_active?: boolean
          activate_start?: string | null
          activate_end?: string | null
          background_color?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          id: string
          email: string
          kvkk_accepted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          kvkk_accepted: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          kvkk_accepted?: boolean
          created_at?: string
        }
        Relationships: []
      }
      stats: {
        Row: {
          id: string
          metric: string
          value: number
          updated_at: string
        }
        Insert: {
          id?: string
          metric: string
          value?: number
          updated_at?: string
        }
        Update: {
          id?: string
          metric?: string
          value?: number
          updated_at?: string
        }
        Relationships: []
      }
      prompt_variants: {
        Row: {
          id: string
          prompt_id: string
          user_id: string
          image_url: string
          file_name: string
          file_size: number
          file_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          user_id: string
          image_url: string
          file_name: string
          file_size: number
          file_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          prompt_id?: string
          user_id?: string
          image_url?: string
          file_name?: string
          file_size?: number
          file_type?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_variants_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_variants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
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
      update_stats_from_aggregates: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
      increment_stats_metric: {
        Args: { metric_name: string; increment_by?: number }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
