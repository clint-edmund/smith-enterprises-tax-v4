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
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: number
          metadata: Json
          new_values: Json | null
          old_values: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: never
          metadata?: Json
          new_values?: Json | null
          old_values?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: never
          metadata?: Json
          new_values?: Json | null
          old_values?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          archived_at: string | null
          category: string
          client_id: string
          created_at: string
          description: string | null
          id: string
          mime_type: string
          original_file_name: string
          size_bytes: number
          status: string
          storage_bucket: string
          storage_path: string
          tax_return_id: string | null
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          archived_at?: string | null
          category?: string
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          mime_type: string
          original_file_name: string
          size_bytes: number
          status?: string
          storage_bucket: string
          storage_path: string
          tax_return_id?: string | null
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          archived_at?: string | null
          category?: string
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          mime_type?: string
          original_file_name?: string
          size_bytes?: number
          status?: string
          storage_bucket?: string
          storage_path?: string
          tax_return_id?: string | null
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_documents_tax_return_id_fkey"
            columns: ["tax_return_id"]
            isOneToOne: false
            referencedRelation: "tax_returns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          alternate_phone: string | null
          birth_date: string | null
          city: string | null
          client_number: number
          created_at: string
          created_by: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          middle_name: string | null
          notes: string | null
          phone: string | null
          postal_code: string | null
          preferred_name: string | null
          state: string | null
          status: Database["public"]["Enums"]["client_status"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          alternate_phone?: string | null
          birth_date?: string | null
          city?: string | null
          client_number?: number
          created_at?: string
          created_by?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          middle_name?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_name?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          alternate_phone?: string | null
          birth_date?: string | null
          city?: string | null
          client_number?: number
          created_at?: string
          created_by?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          middle_name?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_name?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_access_log: {
        Row: {
          action: string
          actor_id: string | null
          details: Json
          document_id: string
          id: number
          occurred_at: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          details?: Json
          document_id: string
          id?: number
          occurred_at?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          details?: Json
          document_id?: string
          id?: number
          occurred_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_access_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_access_log_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "client_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_categories: {
        Row: {
          code: string
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          created_by: string | null
          id: string
          is_voided: boolean
          notes: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          reference_number: string | null
          tax_return_id: string | null
          updated_at: string
          voided_at: string | null
          voided_by: string | null
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_voided?: boolean
          notes?: string | null
          payment_date?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          reference_number?: string | null
          tax_return_id?: string | null
          updated_at?: string
          voided_at?: string | null
          voided_by?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_voided?: boolean
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          reference_number?: string | null
          tax_return_id?: string | null
          updated_at?: string
          voided_at?: string | null
          voided_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tax_return_id_fkey"
            columns: ["tax_return_id"]
            isOneToOne: false
            referencedRelation: "tax_returns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_voided_by_fkey"
            columns: ["voided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          first_name?: string | null
          id: string
          is_active?: boolean
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      required_document_templates: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          is_required: boolean
          matching_keywords: string[]
          name: string
          return_type: Database["public"]["Enums"]["return_type"] | null
          sort_order: number
          tax_form: Database["public"]["Enums"]["tax_form_type"] | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          matching_keywords?: string[]
          name: string
          return_type?: Database["public"]["Enums"]["return_type"] | null
          sort_order?: number
          tax_form?: Database["public"]["Enums"]["tax_form_type"] | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          matching_keywords?: string[]
          name?: string
          return_type?: Database["public"]["Enums"]["return_type"] | null
          sort_order?: number
          tax_form?: Database["public"]["Enums"]["tax_form_type"] | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "required_document_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "required_document_templates_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      return_required_documents: {
        Row: {
          category: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_complete: boolean
          is_required: boolean
          matched_document_id: string | null
          name: string
          notes: string | null
          sort_order: number
          tax_return_id: string
          template_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_complete?: boolean
          is_required?: boolean
          matched_document_id?: string | null
          name: string
          notes?: string | null
          sort_order?: number
          tax_return_id: string
          template_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_complete?: boolean
          is_required?: boolean
          matched_document_id?: string | null
          name?: string
          notes?: string | null
          sort_order?: number
          tax_return_id?: string
          template_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "return_required_documents_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_required_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_required_documents_matched_document_id_fkey"
            columns: ["matched_document_id"]
            isOneToOne: false
            referencedRelation: "client_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_required_documents_tax_return_id_fkey"
            columns: ["tax_return_id"]
            isOneToOne: false
            referencedRelation: "tax_returns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_required_documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "required_document_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_required_documents_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_acknowledgments: {
        Row: {
          accepted_at: string
          created_at: string
          id: string
          metadata: Json
          notice_version: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          created_at?: string
          id?: string
          metadata?: Json
          notice_version: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          created_at?: string
          id?: string
          metadata?: Json
          notice_version?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_acknowledgments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_return_activity: {
        Row: {
          action: string
          actor_id: string | null
          id: string
          occurred_at: string
          return_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          id?: string
          occurred_at?: string
          return_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          id?: string
          occurred_at?: string
          return_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_return_activity_return_id_fkey"
            columns: ["return_id"]
            isOneToOne: false
            referencedRelation: "tax_returns"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_returns: {
        Row: {
          accepted_date: string | null
          assigned_at: string | null
          assigned_preparer_id: string | null
          assigned_reviewer_id: string | null
          client_id: string
          created_at: string
          created_by: string | null
          date_received: string | null
          description: string | null
          discount_amount: number
          due_date: string | null
          estimated_amount_due: number
          estimated_refund: number
          extension_date: string | null
          extension_filed: boolean
          federal_return_required: boolean
          filed_date: string | null
          filing_status: Database["public"]["Enums"]["filing_status"]
          id: string
          local_return_required: boolean
          notes: string | null
          preparation_fee: number
          return_type: Database["public"]["Enums"]["return_type"]
          state_return_required: boolean
          status: Database["public"]["Enums"]["return_status"]
          tax_form: Database["public"]["Enums"]["tax_form_type"]
          tax_year: number
          updated_at: string
          updated_by: string | null
          workflow_completed_at: string | null
          workflow_held_at: string | null
          workflow_hold_reason: string | null
          workflow_status: Database["public"]["Enums"]["tax_return_workflow_status"]
          workflow_status_changed_at: string
        }
        Insert: {
          accepted_date?: string | null
          assigned_at?: string | null
          assigned_preparer_id?: string | null
          assigned_reviewer_id?: string | null
          client_id: string
          created_at?: string
          created_by?: string | null
          date_received?: string | null
          description?: string | null
          discount_amount?: number
          due_date?: string | null
          estimated_amount_due?: number
          estimated_refund?: number
          extension_date?: string | null
          extension_filed?: boolean
          federal_return_required?: boolean
          filed_date?: string | null
          filing_status?: Database["public"]["Enums"]["filing_status"]
          id?: string
          local_return_required?: boolean
          notes?: string | null
          preparation_fee?: number
          return_type?: Database["public"]["Enums"]["return_type"]
          state_return_required?: boolean
          status?: Database["public"]["Enums"]["return_status"]
          tax_form?: Database["public"]["Enums"]["tax_form_type"]
          tax_year: number
          updated_at?: string
          updated_by?: string | null
          workflow_completed_at?: string | null
          workflow_held_at?: string | null
          workflow_hold_reason?: string | null
          workflow_status?: Database["public"]["Enums"]["tax_return_workflow_status"]
          workflow_status_changed_at?: string
        }
        Update: {
          accepted_date?: string | null
          assigned_at?: string | null
          assigned_preparer_id?: string | null
          assigned_reviewer_id?: string | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          date_received?: string | null
          description?: string | null
          discount_amount?: number
          due_date?: string | null
          estimated_amount_due?: number
          estimated_refund?: number
          extension_date?: string | null
          extension_filed?: boolean
          federal_return_required?: boolean
          filed_date?: string | null
          filing_status?: Database["public"]["Enums"]["filing_status"]
          id?: string
          local_return_required?: boolean
          notes?: string | null
          preparation_fee?: number
          return_type?: Database["public"]["Enums"]["return_type"]
          state_return_required?: boolean
          status?: Database["public"]["Enums"]["return_status"]
          tax_form?: Database["public"]["Enums"]["tax_form_type"]
          tax_year?: number
          updated_at?: string
          updated_by?: string | null
          workflow_completed_at?: string | null
          workflow_held_at?: string | null
          workflow_hold_reason?: string | null
          workflow_status?: Database["public"]["Enums"]["tax_return_workflow_status"]
          workflow_status_changed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_returns_assigned_preparer_id_fkey"
            columns: ["assigned_preparer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_returns_assigned_reviewer_id_fkey"
            columns: ["assigned_reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_returns_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_returns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_returns_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_security_notice: {
        Args: {
          requested_metadata?: Json
          requested_notice_version: string
          requested_user_agent?: string
        }
        Returns: {
          accepted_at: string
          created_at: string
          id: string
          metadata: Json
          notice_version: string
          user_agent: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "security_acknowledgments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      archive_client_document: {
        Args: { requested_document_id: string }
        Returns: undefined
      }
      assign_tax_return_preparer: {
        Args: { requested_preparer_id?: string; requested_return_id: string }
        Returns: undefined
      }
      complete_required_document: {
        Args: {
          requested_document_id?: string
          requested_is_complete?: boolean
          requested_notes?: string
          requested_required_document_id: string
        }
        Returns: {
          category: string
          completed_at: string
          completed_by: string
          created_at: string
          description: string
          id: string
          is_complete: boolean
          is_required: boolean
          matched_document_id: string
          name: string
          notes: string
          sort_order: number
          tax_return_id: string
          template_id: string
          updated_at: string
        }[]
      }
      create_client_record: {
        Args: {
          requested_address_line_1?: string
          requested_address_line_2?: string
          requested_alternate_phone?: string
          requested_birth_date?: string
          requested_city?: string
          requested_email?: string
          requested_first_name: string
          requested_last_name?: string
          requested_middle_name?: string
          requested_notes?: string
          requested_phone?: string
          requested_postal_code?: string
          requested_preferred_name?: string
          requested_state?: string
          requested_status?: Database["public"]["Enums"]["client_status"]
        }
        Returns: {
          address_line_1: string | null
          address_line_2: string | null
          alternate_phone: string | null
          birth_date: string | null
          city: string | null
          client_number: number
          created_at: string
          created_by: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          middle_name: string | null
          notes: string | null
          phone: string | null
          postal_code: string | null
          preferred_name: string | null
          state: string | null
          status: Database["public"]["Enums"]["client_status"]
          updated_at: string
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "clients"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_tax_return_record: {
        Args: {
          requested_accepted_date?: string
          requested_assigned_preparer_id?: string
          requested_assigned_reviewer_id?: string
          requested_client_id: string
          requested_date_received?: string
          requested_description?: string
          requested_discount_amount?: number
          requested_due_date?: string
          requested_estimated_amount_due?: number
          requested_estimated_refund?: number
          requested_extension_date?: string
          requested_extension_filed?: boolean
          requested_federal_return_required?: boolean
          requested_filed_date?: string
          requested_filing_status: Database["public"]["Enums"]["filing_status"]
          requested_local_return_required?: boolean
          requested_notes?: string
          requested_preparation_fee?: number
          requested_return_type: Database["public"]["Enums"]["return_type"]
          requested_state_return_required?: boolean
          requested_status: Database["public"]["Enums"]["return_status"]
          requested_tax_form: Database["public"]["Enums"]["tax_form_type"]
          requested_tax_year: number
        }
        Returns: {
          accepted_date: string | null
          assigned_at: string | null
          assigned_preparer_id: string | null
          assigned_reviewer_id: string | null
          client_id: string
          created_at: string
          created_by: string | null
          date_received: string | null
          description: string | null
          discount_amount: number
          due_date: string | null
          estimated_amount_due: number
          estimated_refund: number
          extension_date: string | null
          extension_filed: boolean
          federal_return_required: boolean
          filed_date: string | null
          filing_status: Database["public"]["Enums"]["filing_status"]
          id: string
          local_return_required: boolean
          notes: string | null
          preparation_fee: number
          return_type: Database["public"]["Enums"]["return_type"]
          state_return_required: boolean
          status: Database["public"]["Enums"]["return_status"]
          tax_form: Database["public"]["Enums"]["tax_form_type"]
          tax_year: number
          updated_at: string
          updated_by: string | null
          workflow_completed_at: string | null
          workflow_held_at: string | null
          workflow_hold_reason: string | null
          workflow_status: Database["public"]["Enums"]["tax_return_workflow_status"]
          workflow_status_changed_at: string
        }
        SetofOptions: {
          from: "*"
          to: "tax_returns"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_user_can_manage_records: { Args: never; Returns: boolean }
      current_user_is_active: { Args: never; Returns: boolean }
      current_user_is_admin: { Args: never; Returns: boolean }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      describe_tax_return_change: {
        Args: {
          new_record: Database["public"]["Tables"]["tax_returns"]["Row"]
          old_record: Database["public"]["Tables"]["tax_returns"]["Row"]
        }
        Returns: string
      }
      get_client_tax_returns: {
        Args: { requested_client_id: string }
        Returns: {
          accepted_date: string
          assigned_preparer_id: string
          assigned_preparer_name: string
          assigned_reviewer_id: string
          assigned_reviewer_name: string
          client_id: string
          created_at: string
          date_received: string
          discount_amount: number
          due_date: string
          filed_date: string
          filing_status: Database["public"]["Enums"]["filing_status"]
          id: string
          net_fee: number
          preparation_fee: number
          return_type: Database["public"]["Enums"]["return_type"]
          status: Database["public"]["Enums"]["return_status"]
          tax_form: Database["public"]["Enums"]["tax_form_type"]
          tax_year: number
          updated_at: string
        }[]
      }
      get_current_access_status: {
        Args: never
        Returns: {
          display_name: string
          email: string
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      get_dashboard_attention_items: {
        Args: { requested_limit?: number }
        Returns: {
          assigned_preparer_name: string
          client_id: string
          client_name: string
          client_number: number
          due_date: string
          id: string
          net_fee: number
          reason: string
          return_type: Database["public"]["Enums"]["return_type"]
          status: Database["public"]["Enums"]["return_status"]
          tax_form: Database["public"]["Enums"]["tax_form_type"]
          tax_year: number
          updated_at: string
        }[]
      }
      get_dashboard_executive_metrics: {
        Args: never
        Returns: {
          completed_this_month: number
          completed_this_week: number
          due_next_30_days: number
          due_next_7_days: number
          projected_revenue: number
          review_queue: number
        }[]
      }
      get_dashboard_monthly_financials: {
        Args: never
        Returns: {
          fees: number
          month_label: string
          month_start: string
          outstanding: number
          payments: number
        }[]
      }
      get_dashboard_my_workload: {
        Args: never
        Returns: {
          assigned_to_me: number
          due_this_week: number
          due_today: number
          overdue: number
          review_assigned_to_me: number
        }[]
      }
      get_dashboard_priority_queue: {
        Args: { requested_limit?: number }
        Returns: {
          action_route: string
          assigned_preparer_name: string
          assigned_reviewer_name: string
          client_id: string
          client_name: string
          days_since_activity: number
          days_until_due: number
          due_date: string
          id: string
          outstanding_balance: number
          readiness_score: number
          recommended_action: string
          return_id: string
          return_type: string
          risk_factors: Json
          risk_level: string
          risk_score: number
          status: string
          tax_year: number
        }[]
      }
      get_dashboard_readiness_metrics: {
        Args: never
        Returns: {
          active_returns: number
          average_readiness_score: number
          blocked_returns: number
          missing_preparer: number
          needs_documents: number
          office_health_score: number
          overdue_returns: number
          readiness_eligible_returns: number
          ready_for_preparation: number
          ready_for_review: number
        }[]
      }
      get_dashboard_recent_returns: {
        Args: { requested_limit?: number }
        Returns: {
          assigned_preparer_name: string
          client_id: string
          client_name: string
          client_number: number
          due_date: string
          id: string
          net_fee: number
          return_type: Database["public"]["Enums"]["return_type"]
          status: Database["public"]["Enums"]["return_status"]
          tax_form: Database["public"]["Enums"]["tax_form_type"]
          tax_year: number
          updated_at: string
        }[]
      }
      get_dashboard_smart_recommendations: {
        Args: { requested_limit?: number }
        Returns: {
          action_route: string
          client_id: string
          client_name: string
          due_date: string
          explanation: string
          id: string
          priority: string
          readiness_score: number
          recommendation_type: string
          return_id: string
          return_type: Database["public"]["Enums"]["return_type"]
          tax_year: number
          title: string
        }[]
      }
      get_dashboard_staff_workload: {
        Args: never
        Returns: {
          assigned_returns: number
          awaiting_review_returns: number
          overdue_returns: number
          staff_id: string
          staff_name: string
        }[]
      }
      get_dashboard_status_metrics: {
        Args: never
        Returns: {
          return_count: number
          status: Database["public"]["Enums"]["return_status"]
          status_label: string
        }[]
      }
      get_dashboard_summary: {
        Args: never
        Returns: {
          active_clients: number
          awaiting_review_returns: number
          completed_returns: number
          documents_pending: number
          in_progress_returns: number
          open_returns: number
          outstanding_balance: number
          overdue_returns: number
          total_fees: number
          total_payments: number
          total_returns: number
          unassigned_returns: number
          upcoming_deadlines: number
          workflow_completed: number
          workflow_documents_pending: number
          workflow_filed: number
          workflow_in_preparation: number
          workflow_intake: number
          workflow_on_hold: number
          workflow_ready_for_preparation: number
          workflow_ready_to_file: number
          workflow_review: number
          workflow_signature_pending: number
        }[]
      }
      get_recent_dashboard_activity: {
        Args: { requested_limit?: number }
        Returns: {
          action: string
          actor_name: string
          entity_id: string
          entity_type: string
          id: number
          occurred_at: string
        }[]
      }
      get_return_staff_options: {
        Args: never
        Returns: {
          display_name: string
          email: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      get_staff_workload_summary: {
        Args: never
        Returns: {
          assigned_preparation: number
          assigned_review: number
          awaiting_review: number
          display_name: string
          due_next_seven_days: number
          in_preparation: number
          on_hold: number
          overdue: number
          role: string
          staff_id: string
        }[]
      }
      get_tax_return_activity: {
        Args: { requested_limit?: number; requested_return_id: string }
        Returns: {
          action: string
          actor_id: string
          actor_name: string
          id: string
          occurred_at: string
        }[]
      }
      get_tax_return_details: {
        Args: { requested_return_id: string }
        Returns: {
          accepted_date: string
          assigned_preparer_email: string
          assigned_preparer_id: string
          assigned_preparer_name: string
          assigned_reviewer_email: string
          assigned_reviewer_id: string
          assigned_reviewer_name: string
          client_email: string
          client_first_name: string
          client_id: string
          client_last_name: string
          client_middle_name: string
          client_number: number
          client_phone: string
          client_preferred_name: string
          created_at: string
          date_received: string
          description: string
          discount_amount: number
          due_date: string
          estimated_amount_due: number
          estimated_refund: number
          extension_date: string
          extension_filed: boolean
          federal_return_required: boolean
          filed_date: string
          filing_status: Database["public"]["Enums"]["filing_status"]
          id: string
          local_return_required: boolean
          net_fee: number
          notes: string
          preparation_fee: number
          return_type: Database["public"]["Enums"]["return_type"]
          state_return_required: boolean
          status: Database["public"]["Enums"]["return_status"]
          tax_form: Database["public"]["Enums"]["tax_form_type"]
          tax_year: number
          updated_at: string
        }[]
      }
      has_accepted_security_notice: {
        Args: { requested_notice_version: string }
        Returns: boolean
      }
      initialize_required_documents: {
        Args: { requested_return_id: string }
        Returns: number
      }
      is_valid_return_status_transition: {
        Args: {
          current_status: Database["public"]["Enums"]["return_status"]
          requested_status: Database["public"]["Enums"]["return_status"]
        }
        Returns: boolean
      }
      list_client_documents: {
        Args: { requested_client_id: string; requested_tax_return_id?: string }
        Returns: {
          category: string
          client_id: string
          created_at: string
          description: string
          id: string
          mime_type: string
          original_file_name: string
          size_bytes: number
          status: string
          storage_bucket: string
          storage_path: string
          tax_return_id: string
          updated_at: string
          uploaded_by: string
          uploaded_by_name: string
        }[]
      }
      list_required_documents: {
        Args: { requested_return_id: string }
        Returns: {
          category: string
          completed_at: string
          completed_by: string
          completed_by_name: string
          created_at: string
          description: string
          id: string
          is_complete: boolean
          is_required: boolean
          matched_document_id: string
          matched_document_name: string
          name: string
          notes: string
          sort_order: number
          tax_return_id: string
          template_id: string
          updated_at: string
        }[]
      }
      record_security_event: {
        Args: { requested_action: string; requested_metadata?: Json }
        Returns: number
      }
      register_client_document: {
        Args: {
          requested_category: string
          requested_client_id: string
          requested_description?: string
          requested_mime_type: string
          requested_original_file_name: string
          requested_size_bytes: number
          requested_storage_bucket: string
          requested_storage_path: string
          requested_tax_return_id: string
        }
        Returns: {
          archived_at: string | null
          category: string
          client_id: string
          created_at: string
          description: string | null
          id: string
          mime_type: string
          original_file_name: string
          size_bytes: number
          status: string
          storage_bucket: string
          storage_path: string
          tax_return_id: string | null
          updated_at: string
          uploaded_by: string
        }[]
        SetofOptions: {
          from: "*"
          to: "client_documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      search_clients: {
        Args: {
          requested_limit?: number
          requested_search?: string
          requested_status?: Database["public"]["Enums"]["client_status"]
        }
        Returns: {
          city: string
          client_number: number
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          middle_name: string
          phone: string
          preferred_name: string
          state: string
          status: Database["public"]["Enums"]["client_status"]
          updated_at: string
        }[]
      }
      search_tax_returns: {
        Args: {
          requested_limit?: number
          requested_preparer_id?: string
          requested_search?: string
          requested_status?: Database["public"]["Enums"]["return_status"]
          requested_tax_year?: number
        }
        Returns: {
          accepted_date: string
          assigned_preparer_id: string
          assigned_preparer_name: string
          assigned_reviewer_id: string
          assigned_reviewer_name: string
          client_first_name: string
          client_id: string
          client_last_name: string
          client_number: number
          created_at: string
          date_received: string
          discount_amount: number
          due_date: string
          filed_date: string
          filing_status: Database["public"]["Enums"]["filing_status"]
          id: string
          net_fee: number
          preparation_fee: number
          return_type: Database["public"]["Enums"]["return_type"]
          status: Database["public"]["Enums"]["return_status"]
          tax_form: Database["public"]["Enums"]["tax_form_type"]
          tax_year: number
          updated_at: string
        }[]
      }
      update_client_record: {
        Args: {
          requested_address_line_1?: string
          requested_address_line_2?: string
          requested_alternate_phone?: string
          requested_birth_date?: string
          requested_city?: string
          requested_client_id: string
          requested_email?: string
          requested_first_name: string
          requested_last_name?: string
          requested_middle_name?: string
          requested_notes?: string
          requested_phone?: string
          requested_postal_code?: string
          requested_preferred_name?: string
          requested_state?: string
          requested_status?: Database["public"]["Enums"]["client_status"]
        }
        Returns: {
          address_line_1: string | null
          address_line_2: string | null
          alternate_phone: string | null
          birth_date: string | null
          city: string | null
          client_number: number
          created_at: string
          created_by: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          middle_name: string | null
          notes: string | null
          phone: string | null
          postal_code: string | null
          preferred_name: string | null
          state: string | null
          status: Database["public"]["Enums"]["client_status"]
          updated_at: string
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "clients"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_tax_return_record: {
        Args: {
          requested_accepted_date?: string
          requested_assigned_preparer_id?: string
          requested_assigned_reviewer_id?: string
          requested_client_id: string
          requested_date_received?: string
          requested_description?: string
          requested_discount_amount?: number
          requested_due_date?: string
          requested_estimated_amount_due?: number
          requested_estimated_refund?: number
          requested_extension_date?: string
          requested_extension_filed?: boolean
          requested_federal_return_required?: boolean
          requested_filed_date?: string
          requested_filing_status: Database["public"]["Enums"]["filing_status"]
          requested_local_return_required?: boolean
          requested_notes?: string
          requested_preparation_fee?: number
          requested_return_id: string
          requested_return_type: Database["public"]["Enums"]["return_type"]
          requested_state_return_required?: boolean
          requested_status: Database["public"]["Enums"]["return_status"]
          requested_tax_form: Database["public"]["Enums"]["tax_form_type"]
          requested_tax_year: number
        }
        Returns: {
          accepted_date: string | null
          assigned_at: string | null
          assigned_preparer_id: string | null
          assigned_reviewer_id: string | null
          client_id: string
          created_at: string
          created_by: string | null
          date_received: string | null
          description: string | null
          discount_amount: number
          due_date: string | null
          estimated_amount_due: number
          estimated_refund: number
          extension_date: string | null
          extension_filed: boolean
          federal_return_required: boolean
          filed_date: string | null
          filing_status: Database["public"]["Enums"]["filing_status"]
          id: string
          local_return_required: boolean
          notes: string | null
          preparation_fee: number
          return_type: Database["public"]["Enums"]["return_type"]
          state_return_required: boolean
          status: Database["public"]["Enums"]["return_status"]
          tax_form: Database["public"]["Enums"]["tax_form_type"]
          tax_year: number
          updated_at: string
          updated_by: string | null
          workflow_completed_at: string | null
          workflow_held_at: string | null
          workflow_hold_reason: string | null
          workflow_status: Database["public"]["Enums"]["tax_return_workflow_status"]
          workflow_status_changed_at: string
        }
        SetofOptions: {
          from: "*"
          to: "tax_returns"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role:
        | "administrator"
        | "manager"
        | "preparer"
        | "reviewer"
        | "receptionist"
        | "read_only"
      client_status: "active" | "inactive" | "archived"
      filing_status:
        | "single"
        | "married_filing_jointly"
        | "married_filing_separately"
        | "head_of_household"
        | "qualifying_surviving_spouse"
        | "not_applicable"
      payment_method:
        | "cash"
        | "check"
        | "credit_card"
        | "debit_card"
        | "ach"
        | "money_order"
        | "other"
      return_status:
        | "not_started"
        | "documents_pending"
        | "in_progress"
        | "ready_for_review"
        | "under_review"
        | "ready_to_file"
        | "filed"
        | "accepted"
        | "rejected"
        | "completed"
        | "on_hold"
      return_type: "individual" | "business" | "amended" | "extension" | "other"
      tax_form_type:
        | "1040"
        | "1040_nr"
        | "1041"
        | "1065"
        | "1120"
        | "1120_s"
        | "990"
        | "schedule_c"
        | "state_only"
        | "other"
      tax_return_workflow_status:
        | "intake"
        | "documents_pending"
        | "ready_for_preparation"
        | "in_preparation"
        | "review"
        | "signature_pending"
        | "ready_to_file"
        | "filed"
        | "completed"
        | "on_hold"
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
      app_role: [
        "administrator",
        "manager",
        "preparer",
        "reviewer",
        "receptionist",
        "read_only",
      ],
      client_status: ["active", "inactive", "archived"],
      filing_status: [
        "single",
        "married_filing_jointly",
        "married_filing_separately",
        "head_of_household",
        "qualifying_surviving_spouse",
        "not_applicable",
      ],
      payment_method: [
        "cash",
        "check",
        "credit_card",
        "debit_card",
        "ach",
        "money_order",
        "other",
      ],
      return_status: [
        "not_started",
        "documents_pending",
        "in_progress",
        "ready_for_review",
        "under_review",
        "ready_to_file",
        "filed",
        "accepted",
        "rejected",
        "completed",
        "on_hold",
      ],
      return_type: ["individual", "business", "amended", "extension", "other"],
      tax_form_type: [
        "1040",
        "1040_nr",
        "1041",
        "1065",
        "1120",
        "1120_s",
        "990",
        "schedule_c",
        "state_only",
        "other",
      ],
      tax_return_workflow_status: [
        "intake",
        "documents_pending",
        "ready_for_preparation",
        "in_preparation",
        "review",
        "signature_pending",
        "ready_to_file",
        "filed",
        "completed",
        "on_hold",
      ],
    },
  },
} as const
