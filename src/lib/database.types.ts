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
      activity_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          document_id: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          document_id: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          document_id?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          content: Json
          created_at: string | null
          created_by: string | null
          id: string
          page_id: string
          parent_id: string | null
          position: number
          styles: Json | null
          type: Database["public"]["Enums"]["block_type"]
          updated_at: string | null
        }
        Insert: {
          content?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          page_id: string
          parent_id?: string | null
          position: number
          styles?: Json | null
          type: Database["public"]["Enums"]["block_type"]
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          page_id?: string
          parent_id?: string | null
          position?: number
          styles?: Json | null
          type?: Database["public"]["Enums"]["block_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocks_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          block_id: string | null
          content: string
          created_at: string | null
          document_id: string
          id: string
          is_resolved: boolean | null
          is_suggestion: boolean | null
          page_id: string | null
          parent_id: string | null
          position_data: Json | null
          suggested_content: Json | null
          updated_at: string | null
        }
        Insert: {
          author_id: string
          block_id?: string | null
          content: string
          created_at?: string | null
          document_id: string
          id?: string
          is_resolved?: boolean | null
          is_suggestion?: boolean | null
          page_id?: string | null
          parent_id?: string | null
          position_data?: Json | null
          suggested_content?: Json | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          block_id?: string | null
          content?: string
          created_at?: string | null
          document_id?: string
          id?: string
          is_resolved?: boolean | null
          is_suggestion?: boolean | null
          page_id?: string | null
          parent_id?: string | null
          position_data?: Json | null
          suggested_content?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      document_collaborators: {
        Row: {
          accepted_at: string | null
          document_id: string
          email: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean | null
          permission: Database["public"]["Enums"]["permission_level"]
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          document_id: string
          email?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          permission?: Database["public"]["Enums"]["permission_level"]
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          document_id?: string
          email?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          permission?: Database["public"]["Enums"]["permission_level"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_collaborators_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          content_snapshot: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          document_id: string
          id: string
          title: string | null
          version_number: number
        }
        Insert: {
          content_snapshot?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_id: string
          id?: string
          title?: string | null
          version_number: number
        }
        Update: {
          content_snapshot?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_id?: string
          id?: string
          title?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          custom_height: number | null
          custom_width: number | null
          description: string | null
          id: string
          is_archived: boolean | null
          is_template: boolean | null
          last_accessed_at: string | null
          margin_bottom: number | null
          margin_left: number | null
          margin_right: number | null
          margin_top: number | null
          metadata: Json | null
          owner_id: string
          page_orientation: Database["public"]["Enums"]["page_orientation"] | null
          page_size: Database["public"]["Enums"]["page_size"] | null
          tags: string[] | null
          template_id: string | null
          title: string
          updated_at: string | null
          version: number | null
          visibility: Database["public"]["Enums"]["document_visibility"] | null
        }
        Insert: {
          created_at?: string | null
          custom_height?: number | null
          custom_width?: number | null
          description?: string | null
          id?: string
          is_archived?: boolean | null
          is_template?: boolean | null
          last_accessed_at?: string | null
          margin_bottom?: number | null
          margin_left?: number | null
          margin_right?: number | null
          margin_top?: number | null
          metadata?: Json | null
          owner_id: string
          page_orientation?: Database["public"]["Enums"]["page_orientation"] | null
          page_size?: Database["public"]["Enums"]["page_size"] | null
          tags?: string[] | null
          template_id?: string | null
          title?: string
          updated_at?: string | null
          version?: number | null
          visibility?: Database["public"]["Enums"]["document_visibility"] | null
        }
        Update: {
          created_at?: string | null
          custom_height?: number | null
          custom_width?: number | null
          description?: string | null
          id?: string
          is_archived?: boolean | null
          is_template?: boolean | null
          last_accessed_at?: string | null
          margin_bottom?: number | null
          margin_left?: number | null
          margin_right?: number | null
          margin_top?: number | null
          metadata?: Json | null
          owner_id?: string
          page_orientation?: Database["public"]["Enums"]["page_orientation"] | null
          page_size?: Database["public"]["Enums"]["page_size"] | null
          tags?: string[] | null
          template_id?: string | null
          title?: string
          updated_at?: string | null
          version?: number | null
          visibility?: Database["public"]["Enums"]["document_visibility"] | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      file_uploads: {
        Row: {
          created_at: string | null
          document_id: string | null
          expires_at: string | null
          file_size: number
          filename: string
          id: string
          is_temporary: boolean | null
          mime_type: string
          original_filename: string
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          expires_at?: string | null
          file_size: number
          filename: string
          id?: string
          is_temporary?: boolean | null
          mime_type: string
          original_filename: string
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          expires_at?: string | null
          file_size?: number
          filename?: string
          id?: string
          is_temporary?: boolean | null
          mime_type?: string
          original_filename?: string
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_uploads_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_settings: {
        Row: {
          access_token: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          refresh_token: string | null
          service_name: string
          settings: Json | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          refresh_token?: string | null
          service_name: string
          settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          refresh_token?: string | null
          service_name?: string
          settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          created_at: string | null
          document_id: string
          id: string
          ocr_text: string | null
          page_number: number
          pdf_page_number: number | null
          pdf_source_url: string | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_id: string
          id?: string
          ocr_text?: string | null
          page_number: number
          pdf_page_number?: number | null
          pdf_source_url?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string
          id?: string
          ocr_text?: string | null
          page_number?: number
          pdf_page_number?: number | null
          pdf_source_url?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pages_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          preview_url: string | null
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          preview_url?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          preview_url?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          auto_save_interval: number | null
          created_at: string | null
          default_orientation: Database["public"]["Enums"]["page_orientation"] | null
          default_page_size: Database["public"]["Enums"]["page_size"] | null
          editor_preferences: Json | null
          keyboard_shortcuts: Json | null
          notification_settings: Json | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_save_interval?: number | null
          created_at?: string | null
          default_orientation?: Database["public"]["Enums"]["page_orientation"] | null
          default_page_size?: Database["public"]["Enums"]["page_size"] | null
          editor_preferences?: Json | null
          keyboard_shortcuts?: Json | null
          notification_settings?: Json | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_save_interval?: number | null
          created_at?: string | null
          default_orientation?: Database["public"]["Enums"]["page_orientation"] | null
          default_page_size?: Database["public"]["Enums"]["page_size"] | null
          editor_preferences?: Json | null
          keyboard_shortcuts?: Json | null
          notification_settings?: Json | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          created_at: string | null
          created_by: string | null
          document_id: string
          events: string[]
          failure_count: number | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          secret: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          document_id: string
          events: string[]
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          secret?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          document_id?: string
          events?: string[]
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          secret?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_documents: {
        Args: { search_query: string; user_uuid: string }
        Returns: {
          description: string
          document_id: string
          owner_id: string
          rank: number
          snippet: string
          title: string
        }[]
      }
    }
    Enums: {
      block_type:
        | "text"
        | "heading"
        | "list"
        | "image"
        | "video"
        | "audio"
        | "table"
        | "code"
        | "math"
        | "embed"
        | "pdf_page"
      document_visibility: "private" | "shared" | "public" | "organization"
      page_orientation: "portrait" | "landscape"
      page_size: "a4" | "letter" | "legal" | "a3" | "custom"
      permission_level: "owner" | "editor" | "viewer" | "commenter"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Specific table types for easier use
export type Document = Tables<'documents'>
export type Page = Tables<'pages'>
export type Block = Tables<'blocks'>
export type Comment = Tables<'comments'>
export type Template = Tables<'templates'>
export type DocumentCollaborator = Tables<'document_collaborators'>
export type UserPreferences = Tables<'user_preferences'>
export type ActivityLog = Tables<'activity_log'>

// Enum types
export type BlockType = Enums<'block_type'>
export type DocumentVisibility = Enums<'document_visibility'>
export type PageOrientation = Enums<'page_orientation'>
export type PageSize = Enums<'page_size'>
export type PermissionLevel = Enums<'permission_level'>