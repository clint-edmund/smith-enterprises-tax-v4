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
          assigned_reviewer_id: string | null
          assigned_reviewer_name: string | null
          category: string
          client_id: string
          created_at: string
          description: string | null
          file_hash: string | null
          hash_algorithm: string
          id: string
          is_current_version: boolean
          is_favorite: boolean
          mime_type: string
          original_file_name: string
          previous_version_id: string | null
          review_comments: string | null
          review_due_at: string | null
          review_requested_at: string | null
          review_requested_by: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_name: string | null
          size_bytes: number
          status: string
          storage_bucket: string
          storage_path: string
          tax_return_id: string | null
          updated_at: string
          uploaded_by: string
          version_group_id: string
          version_notes: string | null
          version_number: number
        }
        Insert: {
          archived_at?: string | null
          assigned_reviewer_id?: string | null
          assigned_reviewer_name?: string | null
          category?: string
          client_id: string
          created_at?: string
          description?: string | null
          file_hash?: string | null
          hash_algorithm?: string
          id?: string
          is_current_version?: boolean
          is_favorite?: boolean
          mime_type: string
          original_file_name: string
          previous_version_id?: string | null
          review_comments?: string | null
          review_due_at?: string | null
          review_requested_at?: string | null
          review_requested_by?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_by_name?: string | null
          size_bytes: number
          status?: string
          storage_bucket: string
          storage_path: string
          tax_return_id?: string | null
          updated_at?: string
          uploaded_by: string
          version_group_id: string
          version_notes?: string | null
          version_number?: number
        }
        Update: {
          archived_at?: string | null
          assigned_reviewer_id?: string | null
          assigned_reviewer_name?: string | null
          category?: string
          client_id?: string
          created_at?: string
          description?: string | null
          file_hash?: string | null
          hash_algorithm?: string
          id?: string
          is_current_version?: boolean
          is_favorite?: boolean
          mime_type?: string
          original_file_name?: string
          previous_version_id?: string | null
          review_comments?: string | null
          review_due_at?: string | null
          review_requested_at?: string | null
          review_requested_by?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_by_name?: string | null
          size_bytes?: number
          status?: string
          storage_bucket?: string
          storage_path?: string
          tax_return_id?: string | null
          updated_at?: string
          uploaded_by?: string
          version_group_id?: string
          version_notes?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_assigned_reviewer_id_fkey"
            columns: ["assigned_reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_documents_previous_version_id_fkey"
            columns: ["previous_version_id"]
            isOneToOne: false
            referencedRelation: "client_documents"
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
          {
            foreignKeyName: "client_documents_version_group_id_fkey"
            columns: ["version_group_id"]
            isOneToOne: false
            referencedRelation: "client_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_accounts: {
        Row: {
          accepted_at: string | null
          auth_user_id: string | null
          client_id: string
          created_at: string
          email: string
          failed_sign_in_attempts: number
          id: string
          invitation_expires_at: string | null
          invitation_sent_at: string | null
          invitation_status: Database["public"]["Enums"]["portal_invitation_status"]
          invitation_token_hash: string | null
          last_sign_in_at: string | null
          locked_at: string | null
          status: Database["public"]["Enums"]["portal_account_status"]
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          auth_user_id?: string | null
          client_id: string
          created_at?: string
          email: string
          failed_sign_in_attempts?: number
          id?: string
          invitation_expires_at?: string | null
          invitation_sent_at?: string | null
          invitation_status?: Database["public"]["Enums"]["portal_invitation_status"]
          invitation_token_hash?: string | null
          last_sign_in_at?: string | null
          locked_at?: string | null
          status?: Database["public"]["Enums"]["portal_account_status"]
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          auth_user_id?: string | null
          client_id?: string
          created_at?: string
          email?: string
          failed_sign_in_attempts?: number
          id?: string
          invitation_expires_at?: string | null
          invitation_sent_at?: string | null
          invitation_status?: Database["public"]["Enums"]["portal_invitation_status"]
          invitation_token_hash?: string | null
          last_sign_in_at?: string | null
          locked_at?: string | null
          status?: Database["public"]["Enums"]["portal_account_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_accounts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_profiles: {
        Row: {
          activated_at: string | null
          auth_user_id: string
          client_id: string
          created_at: string
          email: string
          id: string
          invited_at: string | null
          last_login_at: string | null
          portal_status: Database["public"]["Enums"]["client_portal_status"]
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          auth_user_id: string
          client_id: string
          created_at?: string
          email: string
          id?: string
          invited_at?: string | null
          last_login_at?: string | null
          portal_status?: Database["public"]["Enums"]["client_portal_status"]
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          auth_user_id?: string
          client_id?: string
          created_at?: string
          email?: string
          id?: string
          invited_at?: string | null
          last_login_at?: string | null
          portal_status?: Database["public"]["Enums"]["client_portal_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_tax_organizer_banking_information: {
        Row: {
          account_holder_name: string | null
          account_type: string | null
          authorize_direct_debit: boolean | null
          bank_name: string | null
          created_at: string
          id: string
          organizer_id: string
          updated_at: string
          use_direct_deposit: boolean | null
        }
        Insert: {
          account_holder_name?: string | null
          account_type?: string | null
          authorize_direct_debit?: boolean | null
          bank_name?: string | null
          created_at?: string
          id?: string
          organizer_id: string
          updated_at?: string
          use_direct_deposit?: boolean | null
        }
        Update: {
          account_holder_name?: string | null
          account_type?: string | null
          authorize_direct_debit?: boolean | null
          bank_name?: string | null
          created_at?: string
          id?: string
          organizer_id?: string
          updated_at?: string
          use_direct_deposit?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "client_tax_organizer_banking_information_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: true
            referencedRelation: "client_tax_organizers"
            referencedColumns: ["id"]
          },
        ]
      }
      client_tax_organizer_dependents: {
        Row: {
          birth_date: string
          claimed_by_another_taxpayer: boolean
          created_at: string
          display_order: number
          first_name: string
          id: string
          is_full_time_student: boolean
          is_permanently_disabled: boolean
          last_name: string
          lived_with_taxpayer_all_year: boolean
          middle_name: string | null
          months_lived_with_taxpayer: number
          organizer_id: string
          relationship: string
          suffix: string | null
          updated_at: string
          us_citizen_or_resident: boolean
        }
        Insert: {
          birth_date: string
          claimed_by_another_taxpayer?: boolean
          created_at?: string
          display_order?: number
          first_name: string
          id?: string
          is_full_time_student?: boolean
          is_permanently_disabled?: boolean
          last_name: string
          lived_with_taxpayer_all_year?: boolean
          middle_name?: string | null
          months_lived_with_taxpayer?: number
          organizer_id: string
          relationship: string
          suffix?: string | null
          updated_at?: string
          us_citizen_or_resident?: boolean
        }
        Update: {
          birth_date?: string
          claimed_by_another_taxpayer?: boolean
          created_at?: string
          display_order?: number
          first_name?: string
          id?: string
          is_full_time_student?: boolean
          is_permanently_disabled?: boolean
          last_name?: string
          lived_with_taxpayer_all_year?: boolean
          middle_name?: string | null
          months_lived_with_taxpayer?: number
          organizer_id?: string
          relationship?: string
          suffix?: string | null
          updated_at?: string
          us_citizen_or_resident?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "client_tax_organizer_dependents_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "client_tax_organizers"
            referencedColumns: ["id"]
          },
        ]
      }
      client_tax_organizer_healthcare_coverages: {
        Row: {
          coverage_type: string
          covered_person_name: string
          created_at: string
          display_order: number
          document_received: boolean
          document_type: string | null
          end_month: number | null
          id: string
          is_full_year_coverage: boolean
          notes: string | null
          organizer_id: string
          policy_number: string | null
          provider_name: string
          record_status: string
          start_month: number | null
          updated_at: string
        }
        Insert: {
          coverage_type: string
          covered_person_name: string
          created_at?: string
          display_order?: number
          document_received?: boolean
          document_type?: string | null
          end_month?: number | null
          id?: string
          is_full_year_coverage?: boolean
          notes?: string | null
          organizer_id: string
          policy_number?: string | null
          provider_name: string
          record_status?: string
          start_month?: number | null
          updated_at?: string
        }
        Update: {
          coverage_type?: string
          covered_person_name?: string
          created_at?: string
          display_order?: number
          document_received?: boolean
          document_type?: string | null
          end_month?: number | null
          id?: string
          is_full_year_coverage?: boolean
          notes?: string | null
          organizer_id?: string
          policy_number?: string | null
          provider_name?: string
          record_status?: string
          start_month?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_tax_organizer_healthcare_coverages_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "client_tax_organizers"
            referencedColumns: ["id"]
          },
        ]
      }
      client_tax_organizer_identity_information: {
        Row: {
          citizenship_status: string | null
          created_at: string
          has_government_photo_id: boolean | null
          has_identity_changed: boolean | null
          identification_expiration_date: string | null
          identification_issue_date: string | null
          identification_number: string | null
          identification_state: string | null
          identification_type: string | null
          is_us_citizen: boolean | null
          organizer_id: string
          updated_at: string
        }
        Insert: {
          citizenship_status?: string | null
          created_at?: string
          has_government_photo_id?: boolean | null
          has_identity_changed?: boolean | null
          identification_expiration_date?: string | null
          identification_issue_date?: string | null
          identification_number?: string | null
          identification_state?: string | null
          identification_type?: string | null
          is_us_citizen?: boolean | null
          organizer_id: string
          updated_at?: string
        }
        Update: {
          citizenship_status?: string | null
          created_at?: string
          has_government_photo_id?: boolean | null
          has_identity_changed?: boolean | null
          identification_expiration_date?: string | null
          identification_issue_date?: string | null
          identification_number?: string | null
          identification_state?: string | null
          identification_type?: string | null
          is_us_citizen?: boolean | null
          organizer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_tax_organizer_identity_information_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: true
            referencedRelation: "client_tax_organizers"
            referencedColumns: ["id"]
          },
        ]
      }
      client_tax_organizer_income_1099_div_details: {
        Row: {
          collectibles_28_percent_rate_gain: number | null
          created_at: string
          exempt_interest_dividends: number | null
          federal_income_tax_withheld: number | null
          foreign_country_or_us_possession: string | null
          foreign_tax_paid: number | null
          income_source_id: string
          investment_expenses: number | null
          nondividend_distributions: number | null
          payer_identification_number: string | null
          qualified_dividends: number | null
          section_1202_gain: number | null
          section_199a_dividends: number | null
          section_897_capital_gain: number | null
          section_897_ordinary_dividends: number | null
          specified_private_activity_bond_interest_dividends: number | null
          state_code: string | null
          state_identification_number: string | null
          state_tax_withheld: number | null
          total_capital_gain_distributions: number | null
          total_ordinary_dividends: number | null
          unrecaptured_section_1250_gain: number | null
          updated_at: string
        }
        Insert: {
          collectibles_28_percent_rate_gain?: number | null
          created_at?: string
          exempt_interest_dividends?: number | null
          federal_income_tax_withheld?: number | null
          foreign_country_or_us_possession?: string | null
          foreign_tax_paid?: number | null
          income_source_id: string
          investment_expenses?: number | null
          nondividend_distributions?: number | null
          payer_identification_number?: string | null
          qualified_dividends?: number | null
          section_1202_gain?: number | null
          section_199a_dividends?: number | null
          section_897_capital_gain?: number | null
          section_897_ordinary_dividends?: number | null
          specified_private_activity_bond_interest_dividends?: number | null
          state_code?: string | null
          state_identification_number?: string | null
          state_tax_withheld?: number | null
          total_capital_gain_distributions?: number | null
          total_ordinary_dividends?: number | null
          unrecaptured_section_1250_gain?: number | null
          updated_at?: string
        }
        Update: {
          collectibles_28_percent_rate_gain?: number | null
          created_at?: string
          exempt_interest_dividends?: number | null
          federal_income_tax_withheld?: number | null
          foreign_country_or_us_possession?: string | null
          foreign_tax_paid?: number | null
          income_source_id?: string
          investment_expenses?: number | null
          nondividend_distributions?: number | null
          payer_identification_number?: string | null
          qualified_dividends?: number | null
          section_1202_gain?: number | null
          section_199a_dividends?: number | null
          section_897_capital_gain?: number | null
          section_897_ordinary_dividends?: number | null
          specified_private_activity_bond_interest_dividends?: number | null
          state_code?: string | null
          state_identification_number?: string | null
          state_tax_withheld?: number | null
          total_capital_gain_distributions?: number | null
          total_ordinary_dividends?: number | null
          unrecaptured_section_1250_gain?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_tax_organizer_income_1099_div_deta_income_source_id_fkey"
            columns: ["income_source_id"]
            isOneToOne: true
            referencedRelation: "client_tax_organizer_income_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      client_tax_organizer_income_1099_int_details: {
        Row: {
          bond_premium: number | null
          bond_premium_on_tax_exempt_bond: number | null
          bond_premium_on_treasury_obligations: number | null
          created_at: string
          early_withdrawal_penalty: number | null
          federal_income_tax_withheld: number | null
          foreign_country_or_us_possession: string | null
          foreign_tax_paid: number | null
          income_source_id: string
          interest_income: number | null
          interest_on_us_savings_bonds_and_treasury_obligations: number | null
          investment_expenses: number | null
          market_discount: number | null
          payer_identification_number: string | null
          specified_private_activity_bond_interest: number | null
          state_code: string | null
          state_identification_number: string | null
          state_tax_withheld: number | null
          tax_exempt_interest: number | null
          updated_at: string
        }
        Insert: {
          bond_premium?: number | null
          bond_premium_on_tax_exempt_bond?: number | null
          bond_premium_on_treasury_obligations?: number | null
          created_at?: string
          early_withdrawal_penalty?: number | null
          federal_income_tax_withheld?: number | null
          foreign_country_or_us_possession?: string | null
          foreign_tax_paid?: number | null
          income_source_id: string
          interest_income?: number | null
          interest_on_us_savings_bonds_and_treasury_obligations?: number | null
          investment_expenses?: number | null
          market_discount?: number | null
          payer_identification_number?: string | null
          specified_private_activity_bond_interest?: number | null
          state_code?: string | null
          state_identification_number?: string | null
          state_tax_withheld?: number | null
          tax_exempt_interest?: number | null
          updated_at?: string
        }
        Update: {
          bond_premium?: number | null
          bond_premium_on_tax_exempt_bond?: number | null
          bond_premium_on_treasury_obligations?: number | null
          created_at?: string
          early_withdrawal_penalty?: number | null
          federal_income_tax_withheld?: number | null
          foreign_country_or_us_possession?: string | null
          foreign_tax_paid?: number | null
          income_source_id?: string
          interest_income?: number | null
          interest_on_us_savings_bonds_and_treasury_obligations?: number | null
          investment_expenses?: number | null
          market_discount?: number | null
          payer_identification_number?: string | null
          specified_private_activity_bond_interest?: number | null
          state_code?: string | null
          state_identification_number?: string | null
          state_tax_withheld?: number | null
          tax_exempt_interest?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_tax_organizer_income_1099_int_deta_income_source_id_fkey"
            columns: ["income_source_id"]
            isOneToOne: true
            referencedRelation: "client_tax_organizer_income_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      client_tax_organizer_income_sources: {
        Row: {
          created_at: string
          display_order: number
          document_received: boolean
          id: string
          income_type: string
          notes: string | null
          organizer_id: string
          payer_name: string
          recipient_type: string
          record_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          document_received?: boolean
          id?: string
          income_type: string
          notes?: string | null
          organizer_id: string
          payer_name: string
          recipient_type?: string
          record_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          document_received?: boolean
          id?: string
          income_type?: string
          notes?: string | null
          organizer_id?: string
          payer_name?: string
          recipient_type?: string
          record_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_tax_organizer_income_sources_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "client_tax_organizers"
            referencedColumns: ["id"]
          },
        ]
      }
      client_tax_organizer_income_w2_details: {
        Row: {
          created_at: string
          employer_identification_number: string | null
          federal_income_tax_withheld: number | null
          income_source_id: string
          local_income_tax_withheld: number | null
          local_wages: number | null
          medicare_tax_withheld: number | null
          medicare_wages: number | null
          social_security_tax_withheld: number | null
          social_security_wages: number | null
          state_code: string | null
          state_income_tax_withheld: number | null
          state_wages: number | null
          updated_at: string
          wages: number | null
        }
        Insert: {
          created_at?: string
          employer_identification_number?: string | null
          federal_income_tax_withheld?: number | null
          income_source_id: string
          local_income_tax_withheld?: number | null
          local_wages?: number | null
          medicare_tax_withheld?: number | null
          medicare_wages?: number | null
          social_security_tax_withheld?: number | null
          social_security_wages?: number | null
          state_code?: string | null
          state_income_tax_withheld?: number | null
          state_wages?: number | null
          updated_at?: string
          wages?: number | null
        }
        Update: {
          created_at?: string
          employer_identification_number?: string | null
          federal_income_tax_withheld?: number | null
          income_source_id?: string
          local_income_tax_withheld?: number | null
          local_wages?: number | null
          medicare_tax_withheld?: number | null
          medicare_wages?: number | null
          social_security_tax_withheld?: number | null
          social_security_wages?: number | null
          state_code?: string | null
          state_income_tax_withheld?: number | null
          state_wages?: number | null
          updated_at?: string
          wages?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_tax_organizer_income_w2_details_income_source_id_fkey"
            columns: ["income_source_id"]
            isOneToOne: true
            referencedRelation: "client_tax_organizer_income_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      client_tax_organizer_personal_information: {
        Row: {
          address_changed_this_year: boolean | null
          address_line_1: string | null
          address_line_2: string | null
          alternate_phone: string | null
          birth_date: string | null
          city: string | null
          created_at: string | null
          email: string | null
          employer_changed_this_year: boolean | null
          filing_status: string | null
          legal_first_name: string | null
          legal_last_name: string | null
          legal_middle_name: string | null
          marital_status_changed_this_year: boolean | null
          mobile_phone: string | null
          occupation: string | null
          organizer_id: string
          postal_code: string | null
          preferred_name: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address_changed_this_year?: boolean | null
          address_line_1?: string | null
          address_line_2?: string | null
          alternate_phone?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          employer_changed_this_year?: boolean | null
          filing_status?: string | null
          legal_first_name?: string | null
          legal_last_name?: string | null
          legal_middle_name?: string | null
          marital_status_changed_this_year?: boolean | null
          mobile_phone?: string | null
          occupation?: string | null
          organizer_id: string
          postal_code?: string | null
          preferred_name?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address_changed_this_year?: boolean | null
          address_line_1?: string | null
          address_line_2?: string | null
          alternate_phone?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          employer_changed_this_year?: boolean | null
          filing_status?: string | null
          legal_first_name?: string | null
          legal_last_name?: string | null
          legal_middle_name?: string | null
          marital_status_changed_this_year?: boolean | null
          mobile_phone?: string | null
          occupation?: string | null
          organizer_id?: string
          postal_code?: string | null
          preferred_name?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_tax_organizer_personal_information_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: true
            referencedRelation: "client_tax_organizers"
            referencedColumns: ["id"]
          },
        ]
      }
      client_tax_organizer_sections: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          last_saved_at: string | null
          organizer_id: string
          progress_percentage: number
          section_key: Database["public"]["Enums"]["tax_organizer_section_key"]
          started_at: string | null
          status: Database["public"]["Enums"]["tax_organizer_section_status"]
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          last_saved_at?: string | null
          organizer_id: string
          progress_percentage?: number
          section_key: Database["public"]["Enums"]["tax_organizer_section_key"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["tax_organizer_section_status"]
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          last_saved_at?: string | null
          organizer_id?: string
          progress_percentage?: number
          section_key?: Database["public"]["Enums"]["tax_organizer_section_key"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["tax_organizer_section_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_tax_organizer_sections_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "client_tax_organizers"
            referencedColumns: ["id"]
          },
        ]
      }
      client_tax_organizers: {
        Row: {
          client_id: string
          created_at: string
          current_section: Database["public"]["Enums"]["tax_organizer_section_key"]
          id: string
          last_saved_at: string | null
          progress_percentage: number
          reviewed_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["tax_organizer_status"]
          submitted_at: string | null
          tax_year: number
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          current_section?: Database["public"]["Enums"]["tax_organizer_section_key"]
          id?: string
          last_saved_at?: string | null
          progress_percentage?: number
          reviewed_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["tax_organizer_status"]
          submitted_at?: string | null
          tax_year: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          current_section?: Database["public"]["Enums"]["tax_organizer_section_key"]
          id?: string
          last_saved_at?: string | null
          progress_percentage?: number
          reviewed_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["tax_organizer_status"]
          submitted_at?: string | null
          tax_year?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_tax_organizers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
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
      document_activity: {
        Row: {
          action: string
          client_id: string
          created_at: string
          details: string | null
          document_id: string
          id: string
          metadata: Json
          performed_by: string | null
        }
        Insert: {
          action: string
          client_id: string
          created_at?: string
          details?: string | null
          document_id: string
          id?: string
          metadata?: Json
          performed_by?: string | null
        }
        Update: {
          action?: string
          client_id?: string
          created_at?: string
          details?: string | null
          document_id?: string
          id?: string
          metadata?: Json
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_activity_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_activity_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "client_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_activity_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      document_notifications: {
        Row: {
          actor_user_id: string | null
          archived_at: string | null
          client_id: string | null
          created_at: string
          document_id: string | null
          id: string
          message: string
          metadata: Json
          notification_type: string
          read_at: string | null
          recipient_user_id: string
          tax_return_id: string | null
          title: string
        }
        Insert: {
          actor_user_id?: string | null
          archived_at?: string | null
          client_id?: string | null
          created_at?: string
          document_id?: string | null
          id?: string
          message: string
          metadata?: Json
          notification_type: string
          read_at?: string | null
          recipient_user_id: string
          tax_return_id?: string | null
          title: string
        }
        Update: {
          actor_user_id?: string | null
          archived_at?: string | null
          client_id?: string | null
          created_at?: string
          document_id?: string | null
          id?: string
          message?: string
          metadata?: Json
          notification_type?: string
          read_at?: string | null
          recipient_user_id?: string
          tax_return_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_notifications_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_notifications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_notifications_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "client_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_notifications_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_notifications_tax_return_id_fkey"
            columns: ["tax_return_id"]
            isOneToOne: false
            referencedRelation: "tax_returns"
            referencedColumns: ["id"]
          },
        ]
      }
      document_types: {
        Row: {
          category: string
          code: string
          created_at: string
          default_required: boolean
          description: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
          supports_multiple: boolean
          updated_at: string
        }
        Insert: {
          category?: string
          code: string
          created_at?: string
          default_required?: boolean
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          supports_multiple?: boolean
          updated_at?: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          default_required?: boolean
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          supports_multiple?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          assignment_notifications: boolean
          auto_mark_read: boolean
          badge_counter: boolean
          browser_notifications: boolean
          client_notifications: boolean
          created_at: string
          daily_digest: boolean
          desktop_toasts: boolean
          email_notifications: boolean
          high_priority_notifications: boolean
          id: string
          notification_sound: boolean
          payment_notifications: boolean
          quiet_hours_enabled: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          retention_days: number
          return_notifications: boolean
          security_notifications: boolean
          system_notifications: boolean
          updated_at: string
          user_id: string
          weekly_digest: boolean
        }
        Insert: {
          assignment_notifications?: boolean
          auto_mark_read?: boolean
          badge_counter?: boolean
          browser_notifications?: boolean
          client_notifications?: boolean
          created_at?: string
          daily_digest?: boolean
          desktop_toasts?: boolean
          email_notifications?: boolean
          high_priority_notifications?: boolean
          id?: string
          notification_sound?: boolean
          payment_notifications?: boolean
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          retention_days?: number
          return_notifications?: boolean
          security_notifications?: boolean
          system_notifications?: boolean
          updated_at?: string
          user_id: string
          weekly_digest?: boolean
        }
        Update: {
          assignment_notifications?: boolean
          auto_mark_read?: boolean
          badge_counter?: boolean
          browser_notifications?: boolean
          client_notifications?: boolean
          created_at?: string
          daily_digest?: boolean
          desktop_toasts?: boolean
          email_notifications?: boolean
          high_priority_notifications?: boolean
          id?: string
          notification_sound?: boolean
          payment_notifications?: boolean
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          retention_days?: number
          return_notifications?: boolean
          security_notifications?: boolean
          system_notifications?: boolean
          updated_at?: string
          user_id?: string
          weekly_digest?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          archived_at: string | null
          category: string
          created_at: string
          deleted_at: string | null
          expires_at: string | null
          id: string
          is_archived: boolean
          is_read: boolean
          message: string
          metadata: Json
          priority: string
          read_at: string | null
          recipient_user_id: string
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
        }
        Insert: {
          action_url?: string | null
          archived_at?: string | null
          category?: string
          created_at?: string
          deleted_at?: string | null
          expires_at?: string | null
          id?: string
          is_archived?: boolean
          is_read?: boolean
          message: string
          metadata?: Json
          priority?: string
          read_at?: string | null
          recipient_user_id: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
        }
        Update: {
          action_url?: string | null
          archived_at?: string | null
          category?: string
          created_at?: string
          deleted_at?: string | null
          expires_at?: string | null
          id?: string
          is_archived?: boolean
          is_read?: boolean
          message?: string
          metadata?: Json
          priority?: string
          read_at?: string | null
          recipient_user_id?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
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
          receipt_issued_at: string | null
          receipt_issued_by: string | null
          receipt_number: string | null
          reference_number: string | null
          tax_return_id: string | null
          updated_at: string
          void_reason: string | null
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
          receipt_issued_at?: string | null
          receipt_issued_by?: string | null
          receipt_number?: string | null
          reference_number?: string | null
          tax_return_id?: string | null
          updated_at?: string
          void_reason?: string | null
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
          receipt_issued_at?: string | null
          receipt_issued_by?: string | null
          receipt_number?: string | null
          reference_number?: string | null
          tax_return_id?: string | null
          updated_at?: string
          void_reason?: string | null
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
            foreignKeyName: "payments_receipt_issued_by_fkey"
            columns: ["receipt_issued_by"]
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
      return_workflow_history: {
        Row: {
          actor_user_id: string | null
          client_id: string
          created_at: string
          event_data: Json
          event_description: string | null
          event_label: string
          event_type: string
          id: string
          is_client_visible: boolean
          new_status: string | null
          occurred_at: string
          previous_status: string | null
          tax_return_id: string
        }
        Insert: {
          actor_user_id?: string | null
          client_id: string
          created_at?: string
          event_data?: Json
          event_description?: string | null
          event_label: string
          event_type: string
          id?: string
          is_client_visible?: boolean
          new_status?: string | null
          occurred_at?: string
          previous_status?: string | null
          tax_return_id: string
        }
        Update: {
          actor_user_id?: string | null
          client_id?: string
          created_at?: string
          event_data?: Json
          event_description?: string | null
          event_label?: string
          event_type?: string
          id?: string
          is_client_visible?: boolean
          new_status?: string | null
          occurred_at?: string
          previous_status?: string | null
          tax_return_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "return_workflow_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_workflow_history_tax_return_id_fkey"
            columns: ["tax_return_id"]
            isOneToOne: false
            referencedRelation: "tax_returns"
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
      tax_package_template_items: {
        Row: {
          created_at: string
          document_type_id: string
          id: string
          instructions: string | null
          requirement_level: string
          sort_order: number
          template_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_type_id: string
          id?: string
          instructions?: string | null
          requirement_level?: string
          sort_order?: number
          template_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_type_id?: string
          id?: string
          instructions?: string | null
          requirement_level?: string
          sort_order?: number
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_package_template_items_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_package_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "tax_package_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_package_templates: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          return_form: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          return_form: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          return_form?: string
          updated_at?: string
        }
        Relationships: []
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
      vault_audit_log: {
        Row: {
          action: string
          actor_user_id: string | null
          client_id: string | null
          created_at: string
          dependent_id: string | null
          id: string
          ip_address: unknown
          metadata: Json
          organizer_id: string | null
          outcome: string
          reason: string | null
          request_id: string | null
          secret_type: string | null
          session_id: string | null
          source: string
          user_agent: string | null
          vault_secret_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          client_id?: string | null
          created_at?: string
          dependent_id?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json
          organizer_id?: string | null
          outcome?: string
          reason?: string | null
          request_id?: string | null
          secret_type?: string | null
          session_id?: string | null
          source?: string
          user_agent?: string | null
          vault_secret_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          client_id?: string | null
          created_at?: string
          dependent_id?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json
          organizer_id?: string | null
          outcome?: string
          reason?: string | null
          request_id?: string | null
          secret_type?: string | null
          session_id?: string | null
          source?: string
          user_agent?: string | null
          vault_secret_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_audit_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_audit_log_dependent_id_fkey"
            columns: ["dependent_id"]
            isOneToOne: false
            referencedRelation: "client_tax_organizer_dependents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_audit_log_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "client_tax_organizers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_audit_log_vault_secret_id_fkey"
            columns: ["vault_secret_id"]
            isOneToOne: false
            referencedRelation: "vault_secrets"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_key_versions: {
        Row: {
          activated_at: string | null
          active: boolean
          algorithm: string
          created_at: string
          description: string | null
          id: string
          key_version: number
          retired_at: string | null
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          active?: boolean
          algorithm: string
          created_at?: string
          description?: string | null
          id?: string
          key_version: number
          retired_at?: string | null
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          active?: boolean
          algorithm?: string
          created_at?: string
          description?: string | null
          id?: string
          key_version?: number
          retired_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vault_secrets: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          authentication_tag: string
          client_id: string
          created_at: string
          created_by: string | null
          dependent_id: string | null
          encrypted_value: string
          id: string
          initialization_vector: string
          key_version: number
          masked_value: string
          organizer_id: string | null
          secret_type: string
          status: string
          updated_at: string
          updated_by: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          authentication_tag: string
          client_id: string
          created_at?: string
          created_by?: string | null
          dependent_id?: string | null
          encrypted_value: string
          id?: string
          initialization_vector: string
          key_version: number
          masked_value: string
          organizer_id?: string | null
          secret_type: string
          status?: string
          updated_at?: string
          updated_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          authentication_tag?: string
          client_id?: string
          created_at?: string
          created_by?: string | null
          dependent_id?: string | null
          encrypted_value?: string
          id?: string
          initialization_vector?: string
          key_version?: number
          masked_value?: string
          organizer_id?: string | null
          secret_type?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_secrets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_secrets_dependent_id_fkey"
            columns: ["dependent_id"]
            isOneToOne: false
            referencedRelation: "client_tax_organizer_dependents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_secrets_key_version_fkey"
            columns: ["key_version"]
            isOneToOne: false
            referencedRelation: "vault_key_versions"
            referencedColumns: ["key_version"]
          },
          {
            foreignKeyName: "vault_secrets_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "client_tax_organizers"
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
      activate_client_portal_account: {
        Args: { requested_token_hash: string }
        Returns: {
          accepted_at: string | null
          auth_user_id: string | null
          client_id: string
          created_at: string
          email: string
          failed_sign_in_attempts: number
          id: string
          invitation_expires_at: string | null
          invitation_sent_at: string | null
          invitation_status: Database["public"]["Enums"]["portal_invitation_status"]
          invitation_token_hash: string | null
          last_sign_in_at: string | null
          locked_at: string | null
          status: Database["public"]["Enums"]["portal_account_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "client_portal_accounts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      add_client_organizer_dependent: {
        Args: {
          requested_birth_date: string
          requested_claimed_by_another_taxpayer: boolean
          requested_first_name: string
          requested_is_full_time_student: boolean
          requested_is_permanently_disabled: boolean
          requested_last_name: string
          requested_lived_with_taxpayer_all_year: boolean
          requested_middle_name: string
          requested_months_lived_with_taxpayer: number
          requested_organizer_id: string
          requested_relationship: string
          requested_suffix: string
          requested_us_citizen_or_resident: boolean
        }
        Returns: {
          birth_date: string
          claimed_by_another_taxpayer: boolean
          created_at: string
          dependent_id: string
          display_order: number
          first_name: string
          is_full_time_student: boolean
          is_permanently_disabled: boolean
          last_name: string
          lived_with_taxpayer_all_year: boolean
          middle_name: string
          months_lived_with_taxpayer: number
          organizer_id: string
          organizer_progress_percentage: number
          relationship: string
          section_progress_percentage: number
          section_status: Database["public"]["Enums"]["tax_organizer_section_status"]
          suffix: string
          updated_at: string
          us_citizen_or_resident: boolean
        }[]
      }
      approve_document: {
        Args: { p_comments?: string; p_document_id: string }
        Returns: {
          archived_at: string | null
          assigned_reviewer_id: string | null
          assigned_reviewer_name: string | null
          category: string
          client_id: string
          created_at: string
          description: string | null
          file_hash: string | null
          hash_algorithm: string
          id: string
          is_current_version: boolean
          is_favorite: boolean
          mime_type: string
          original_file_name: string
          previous_version_id: string | null
          review_comments: string | null
          review_due_at: string | null
          review_requested_at: string | null
          review_requested_by: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_name: string | null
          size_bytes: number
          status: string
          storage_bucket: string
          storage_path: string
          tax_return_id: string | null
          updated_at: string
          uploaded_by: string
          version_group_id: string
          version_notes: string | null
          version_number: number
        }
        SetofOptions: {
          from: "*"
          to: "client_documents"
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
      can_view_executive_financial_analytics: { Args: never; Returns: boolean }
      complete_client_portal_activation: {
        Args: { requested_token_hash: string }
        Returns: {
          activated_at: string
          client_id: string
          email: string
          portal_profile_id: string
        }[]
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
      create_client_organizer_healthcare_coverage: {
        Args: {
          requested_coverage_type: string
          requested_covered_person_name: string
          requested_document_received: boolean
          requested_document_type: string
          requested_end_month: number
          requested_is_full_year_coverage: boolean
          requested_notes: string
          requested_organizer_id: string
          requested_policy_number: string
          requested_provider_name: string
          requested_start_month: number
        }
        Returns: {
          coverage_id: string
          coverage_type: string
          covered_person_name: string
          created_at: string
          display_order: number
          document_received: boolean
          document_type: string
          end_month: number
          is_full_year_coverage: boolean
          notes: string
          organizer_id: string
          policy_number: string
          provider_name: string
          record_status: string
          start_month: number
          updated_at: string
        }[]
      }
      create_client_organizer_income_source: {
        Args: {
          requested_income_type: string
          requested_notes: string
          requested_organizer_id: string
          requested_payer_name: string
          requested_recipient_type: string
        }
        Returns: {
          created_at: string
          display_order: number
          document_received: boolean
          income_source_id: string
          income_type: string
          notes: string
          organizer_id: string
          payer_name: string
          recipient_type: string
          record_status: string
          updated_at: string
        }[]
      }
      create_client_portal_account: {
        Args: {
          requested_client_id: string
          requested_email: string
          requested_invitation_expires_at: string
          requested_invitation_token_hash: string
        }
        Returns: {
          accepted_at: string | null
          auth_user_id: string | null
          client_id: string
          created_at: string
          email: string
          failed_sign_in_attempts: number
          id: string
          invitation_expires_at: string | null
          invitation_sent_at: string | null
          invitation_status: Database["public"]["Enums"]["portal_invitation_status"]
          invitation_token_hash: string | null
          last_sign_in_at: string | null
          locked_at: string | null
          status: Database["public"]["Enums"]["portal_account_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "client_portal_accounts"
          isOneToOne: true
          isSetofReturn: false
        }
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
      create_document_version: {
        Args: {
          requested_document_id: string
          requested_file_hash?: string
          requested_hash_algorithm?: string
          requested_mime_type: string
          requested_original_file_name: string
          requested_size_bytes: number
          requested_storage_bucket: string
          requested_storage_path: string
          requested_version_notes?: string
        }
        Returns: {
          archived_at: string | null
          assigned_reviewer_id: string | null
          assigned_reviewer_name: string | null
          category: string
          client_id: string
          created_at: string
          description: string | null
          file_hash: string | null
          hash_algorithm: string
          id: string
          is_current_version: boolean
          is_favorite: boolean
          mime_type: string
          original_file_name: string
          previous_version_id: string | null
          review_comments: string | null
          review_due_at: string | null
          review_requested_at: string | null
          review_requested_by: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_name: string | null
          size_bytes: number
          status: string
          storage_bucket: string
          storage_path: string
          tax_return_id: string | null
          updated_at: string
          uploaded_by: string
          version_group_id: string
          version_notes: string | null
          version_number: number
        }[]
        SetofOptions: {
          from: "*"
          to: "client_documents"
          isOneToOne: false
          isSetofReturn: true
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
      current_actor_id: { Args: never; Returns: string }
      current_client_id: { Args: never; Returns: string }
      current_client_portal_is_active: { Args: never; Returns: boolean }
      current_client_portal_profile_id: { Args: never; Returns: string }
      current_user_can_manage_records: { Args: never; Returns: boolean }
      current_user_is_active: { Args: never; Returns: boolean }
      current_user_is_admin: { Args: never; Returns: boolean }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      delete_client_organizer_dependent: {
        Args: { requested_dependent_id: string; requested_organizer_id: string }
        Returns: {
          deleted_at: string
          dependent_id: string
          dependent_name: string
          organizer_id: string
          organizer_progress_percentage: number
          remaining_dependent_count: number
          section_progress_percentage: number
          section_status: Database["public"]["Enums"]["tax_organizer_section_status"]
        }[]
      }
      delete_client_organizer_healthcare_coverage: {
        Args: { requested_coverage_id: string; requested_organizer_id: string }
        Returns: {
          coverage_id: string
          deleted_at: string
          organizer_id: string
          provider_name: string
          remaining_coverage_count: number
        }[]
      }
      delete_client_organizer_income_source: {
        Args: {
          requested_income_source_id: string
          requested_organizer_id: string
        }
        Returns: {
          deleted_at: string
          income_source_id: string
          organizer_id: string
          payer_name: string
          remaining_income_source_count: number
        }[]
      }
      describe_tax_return_change: {
        Args: {
          new_record: Database["public"]["Tables"]["tax_returns"]["Row"]
          old_record: Database["public"]["Tables"]["tax_returns"]["Row"]
        }
        Returns: string
      }
      find_matching_document_hash: {
        Args: {
          requested_client_id: string
          requested_file_hash: string
          requested_tax_return_id: string
        }
        Returns: {
          category: string
          created_at: string
          id: string
          original_file_name: string
          size_bytes: number
        }[]
      }
      generate_payment_receipt_number: { Args: never; Returns: string }
      get_active_vault_key_version: {
        Args: never
        Returns: {
          activated_at: string
          algorithm: string
          key_version: number
        }[]
      }
      get_client_document_activity: {
        Args: { requested_client_id: string; requested_limit?: number }
        Returns: {
          action: string
          actor_name: string
          description: string
          document_name: string
          entity_id: string
          entity_type: string
          id: string
          occurred_at: string
        }[]
      }
      get_client_organizer_banking_information: {
        Args: { requested_organizer_id: string }
        Returns: {
          account_holder_name: string
          account_type: string
          authorize_direct_debit: boolean
          bank_account_number_masked: string
          bank_name: string
          created_at: string
          has_bank_account_number: boolean
          has_routing_number: boolean
          organizer_id: string
          routing_number_masked: string
          updated_at: string
          use_direct_deposit: boolean
        }[]
      }
      get_client_organizer_dependents: {
        Args: { requested_organizer_id: string }
        Returns: {
          birth_date: string
          claimed_by_another_taxpayer: boolean
          created_at: string
          dependent_id: string
          display_order: number
          first_name: string
          is_full_time_student: boolean
          is_permanently_disabled: boolean
          last_name: string
          lived_with_taxpayer_all_year: boolean
          middle_name: string
          months_lived_with_taxpayer: number
          organizer_id: string
          relationship: string
          suffix: string
          updated_at: string
          us_citizen_or_resident: boolean
        }[]
      }
      get_client_organizer_healthcare_coverages: {
        Args: { requested_organizer_id: string }
        Returns: {
          coverage_id: string
          coverage_type: string
          covered_person_name: string
          created_at: string
          display_order: number
          document_received: boolean
          document_type: string
          end_month: number
          is_full_year_coverage: boolean
          notes: string
          organizer_id: string
          policy_number: string
          provider_name: string
          record_status: string
          start_month: number
          updated_at: string
        }[]
      }
      get_client_organizer_identity_information: {
        Args: { requested_organizer_id: string }
        Returns: {
          citizenship_status: string
          created_at: string
          has_government_photo_id: boolean
          has_identity_changed: boolean
          identification_expiration_date: string
          identification_issue_date: string
          identification_state: string
          identification_type: string
          is_us_citizen: boolean
          result_organizer_id: string
          updated_at: string
        }[]
      }
      get_client_organizer_income_sources: {
        Args: { requested_organizer_id: string }
        Returns: {
          created_at: string
          display_order: number
          document_received: boolean
          income_source_id: string
          income_type: string
          notes: string
          organizer_id: string
          payer_name: string
          recipient_type: string
          record_status: string
          updated_at: string
        }[]
      }
      get_client_organizer_income_w2_details: {
        Args: {
          requested_income_source_id: string
          requested_organizer_id: string
        }
        Returns: {
          created_at: string
          employer_identification_number: string
          federal_income_tax_withheld: number
          income_source_id: string
          local_income_tax_withheld: number
          local_wages: number
          medicare_tax_withheld: number
          medicare_wages: number
          social_security_tax_withheld: number
          social_security_wages: number
          state_code: string
          state_income_tax_withheld: number
          state_wages: number
          updated_at: string
          wages: number
        }[]
      }
      get_client_organizer_personal_information: {
        Args: { requested_organizer_id: string }
        Returns: {
          address_changed_this_year: boolean
          address_line_1: string
          address_line_2: string
          alternate_phone: string
          birth_date: string
          city: string
          created_at: string
          email: string
          employer_changed_this_year: boolean
          filing_status: string
          legal_first_name: string
          legal_last_name: string
          legal_middle_name: string
          marital_status_changed_this_year: boolean
          mobile_phone: string
          occupation: string
          organizer_id: string
          postal_code: string
          preferred_name: string
          state: string
          updated_at: string
        }[]
      }
      get_client_portal_dashboard: {
        Args: never
        Returns: {
          assigned_preparer_name: string
          client_id: string
          client_number: number
          current_return_id: string
          current_return_status: Database["public"]["Enums"]["return_status"]
          current_return_type: Database["public"]["Enums"]["return_type"]
          current_return_updated_at: string
          current_tax_form: Database["public"]["Enums"]["tax_form_type"]
          current_tax_year: number
          discount_amount: number
          document_count: number
          first_name: string
          outstanding_balance: number
          preferred_name: string
          preparation_fee: number
          recent_document_category: string
          recent_document_id: string
          recent_document_name: string
          recent_document_status: string
          recent_document_uploaded_at: string
          total_payments: number
        }[]
      }
      get_client_returns: {
        Args: never
        Returns: {
          assigned_preparer_name: string
          discount_amount: number
          document_count: number
          outstanding_balance: number
          preparation_fee: number
          return_id: string
          return_type: Database["public"]["Enums"]["return_type"]
          status: Database["public"]["Enums"]["return_status"]
          tax_form: Database["public"]["Enums"]["tax_form_type"]
          tax_year: number
          total_payments: number
          updated_at: string
        }[]
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
      get_current_client_profile: {
        Args: never
        Returns: {
          activated_at: string
          auth_user_id: string
          client_id: string
          client_number: number
          created_at: string
          email: string
          first_name: string
          invited_at: string
          last_login_at: string
          last_name: string
          middle_name: string
          phone: string
          portal_profile_id: string
          portal_status: Database["public"]["Enums"]["client_portal_status"]
          preferred_name: string
          updated_at: string
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
      get_executive_financial_analytics: { Args: never; Returns: Json }
      get_my_unread_document_notification_count: {
        Args: never
        Returns: number
      }
      get_office_payment_summary: {
        Args: never
        Returns: {
          outstanding_receivables: number
          payment_count_this_month: number
          payment_count_today: number
          payments_this_month: number
          payments_today: number
          returns_with_balance: number
          voided_payment_count: number
          voided_payments_total: number
        }[]
      }
      get_or_create_client_tax_organizer: {
        Args: { requested_tax_year: number }
        Returns: {
          client_id: string
          created_at: string
          current_section: Database["public"]["Enums"]["tax_organizer_section_key"]
          last_saved_at: string
          organizer_id: string
          organizer_status: Database["public"]["Enums"]["tax_organizer_status"]
          progress_percentage: number
          reviewed_at: string
          sections: Json
          started_at: string
          submitted_at: string
          tax_year: number
          updated_at: string
        }[]
      }
      get_payment_receipt: {
        Args: { requested_payment_id: string }
        Returns: {
          amount: number
          client_id: string
          client_name: string
          client_number: number
          created_at: string
          created_by: string
          created_by_name: string
          is_voided: boolean
          notes: string
          payment_date: string
          payment_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          receipt_issued_at: string
          receipt_issued_by: string
          receipt_issued_by_name: string
          receipt_number: string
          reference_number: string
          return_type: Database["public"]["Enums"]["return_type"]
          tax_return_id: string
          tax_year: number
          updated_at: string
          void_reason: string
          voided_at: string
          voided_by: string
          voided_by_name: string
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
      get_recent_office_payments: {
        Args: { requested_limit?: number }
        Returns: {
          amount: number
          client_id: string
          client_name: string
          client_number: number
          created_at: string
          created_by: string
          created_by_name: string
          is_voided: boolean
          payment_date: string
          payment_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          receipt_number: string
          reference_number: string
          return_type: Database["public"]["Enums"]["return_type"]
          tax_form: Database["public"]["Enums"]["tax_form_type"]
          tax_return_id: string
          tax_year: number
          void_reason: string
          voided_at: string
        }[]
      }
      get_return_payment_summary: {
        Args: { requested_return_id: string }
        Returns: {
          discount_amount: number
          net_fee: number
          outstanding_balance: number
          payment_count: number
          preparation_fee: number
          total_paid: number
        }[]
      }
      get_return_payments: {
        Args: { requested_return_id: string }
        Returns: {
          amount: number
          client_id: string
          created_at: string
          created_by: string
          created_by_name: string
          id: string
          is_voided: boolean
          notes: string
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          receipt_issued_at: string
          receipt_issued_by: string
          receipt_number: string
          reference_number: string
          tax_return_id: string
          updated_at: string
          void_reason: string
          voided_at: string
          voided_by: string
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
      get_return_workflow_history: {
        Args: { requested_return_id: string }
        Returns: {
          actor_name: string
          actor_user_id: string
          client_id: string
          created_at: string
          event_data: Json
          event_description: string
          event_label: string
          event_type: string
          id: string
          is_client_visible: boolean
          occurred_at: string
          tax_return_id: string
        }[]
      }
      get_return_workspace_summary: {
        Args: { p_return_id: string }
        Returns: {
          assigned_preparer: string
          assigned_reviewer: string
          client_id: string
          client_name: string
          created_at: string
          due_date: string
          estimated_amount_due: number
          outstanding_balance: number
          payments_received: number
          return_id: string
          return_type: string
          status: string
          tax_year: number
          updated_at: string
          workflow_percent: number
        }[]
      }
      get_staff_organizer_dependents_review: {
        Args: { requested_client_id: string; requested_tax_year: number }
        Returns: {
          birth_date: string
          claimed_by_another_taxpayer: boolean
          created_at: string
          dependent_id: string
          display_order: number
          first_name: string
          is_full_time_student: boolean
          is_permanently_disabled: boolean
          last_name: string
          lived_with_taxpayer_all_year: boolean
          middle_name: string
          months_lived_with_taxpayer: number
          organizer_id: string
          relationship: string
          suffix: string
          updated_at: string
          us_citizen_or_resident: boolean
        }[]
      }
      get_staff_organizer_healthcare_review: {
        Args: { requested_client_id: string; requested_tax_year: number }
        Returns: {
          coverage_id: string
          coverage_type: string
          covered_person_name: string
          created_at: string
          display_order: number
          document_received: boolean
          document_type: string
          end_month: number
          is_full_year_coverage: boolean
          notes: string
          organizer_id: string
          policy_number: string
          provider_name: string
          record_status: string
          start_month: number
          updated_at: string
        }[]
      }
      get_staff_organizer_income_review: {
        Args: { requested_client_id: string; requested_tax_year: number }
        Returns: {
          created_at: string
          display_order: number
          document_received: boolean
          employer_identification_number: string
          federal_income_tax_withheld: number
          income_source_id: string
          income_type: string
          local_income_tax_withheld: number
          local_wages: number
          medicare_tax_withheld: number
          medicare_wages: number
          notes: string
          organizer_id: string
          payer_name: string
          recipient_type: string
          record_status: string
          social_security_tax_withheld: number
          social_security_wages: number
          state_code: string
          state_income_tax_withheld: number
          state_wages: number
          updated_at: string
          wages: number
        }[]
      }
      get_staff_organizer_summary: {
        Args: { requested_client_id: string; requested_tax_year: number }
        Returns: Json
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
          assigned_reviewer_id: string
          assigned_reviewer_name: string
          category: string
          client_id: string
          created_at: string
          description: string
          file_hash: string
          hash_algorithm: string
          id: string
          is_current_version: boolean
          is_favorite: boolean
          mime_type: string
          original_file_name: string
          previous_version_id: string
          review_comments: string
          review_due_at: string
          review_requested_at: string
          review_requested_by: string
          review_status: string
          reviewed_at: string
          reviewed_by: string
          reviewed_by_name: string
          size_bytes: number
          status: string
          storage_bucket: string
          storage_path: string
          tax_return_id: string
          updated_at: string
          uploaded_by: string
          uploaded_by_name: string
          version_group_id: string
          version_notes: string
          version_number: number
        }[]
      }
      list_document_reviewers: {
        Args: never
        Returns: {
          display_name: string
          email: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      list_document_versions: {
        Args: { requested_document_id: string }
        Returns: {
          archived_at: string
          category: string
          client_id: string
          created_at: string
          description: string
          file_hash: string
          hash_algorithm: string
          id: string
          is_current_version: boolean
          is_favorite: boolean
          mime_type: string
          original_file_name: string
          previous_version_id: string
          size_bytes: number
          status: string
          storage_bucket: string
          storage_path: string
          tax_return_id: string
          updated_at: string
          uploaded_by: string
          uploaded_by_name: string
          version_group_id: string
          version_notes: string
          version_number: number
        }[]
      }
      list_my_assigned_document_reviews: {
        Args: never
        Returns: {
          assigned_reviewer_id: string
          assigned_reviewer_name: string
          category: string
          client_id: string
          client_name: string
          client_number: number
          created_at: string
          days_until_due: number
          document_id: string
          original_file_name: string
          priority_code: string
          return_type: string
          review_due_at: string
          review_requested_at: string
          review_requested_by: string
          review_requested_by_name: string
          review_status: string
          tax_return_id: string
          tax_year: number
          uploaded_by: string
          uploaded_by_name: string
        }[]
      }
      list_my_document_notifications: {
        Args: { p_limit?: number }
        Returns: {
          client_id: string
          created_at: string
          document_id: string
          id: string
          message: string
          metadata: Json
          notification_type: string
          read_at: string
          tax_return_id: string
          title: string
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
      log_return_workflow: {
        Args: {
          requested_event_data?: Json
          requested_event_description?: string
          requested_event_label: string
          requested_event_type: string
          requested_is_client_visible?: boolean
          requested_occurred_at?: string
          requested_return_id: string
        }
        Returns: string
      }
      mark_all_document_notifications_read: { Args: never; Returns: number }
      mark_document_notification_read: {
        Args: { p_notification_id: string }
        Returns: undefined
      }
      record_client_portal_login: { Args: never; Returns: undefined }
      record_return_payment: {
        Args: {
          requested_amount: number
          requested_notes?: string
          requested_payment_date?: string
          requested_payment_method: Database["public"]["Enums"]["payment_method"]
          requested_reference_number?: string
          requested_return_id: string
        }
        Returns: {
          amount: number
          client_id: string
          created_at: string
          created_by: string | null
          id: string
          is_voided: boolean
          notes: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          receipt_issued_at: string | null
          receipt_issued_by: string | null
          receipt_number: string | null
          reference_number: string | null
          tax_return_id: string | null
          updated_at: string
          void_reason: string | null
          voided_at: string | null
          voided_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
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
          requested_file_hash?: string
          requested_hash_algorithm?: string
          requested_mime_type: string
          requested_original_file_name: string
          requested_size_bytes: number
          requested_storage_bucket: string
          requested_storage_path: string
          requested_tax_return_id: string
        }
        Returns: {
          archived_at: string | null
          assigned_reviewer_id: string | null
          assigned_reviewer_name: string | null
          category: string
          client_id: string
          created_at: string
          description: string | null
          file_hash: string | null
          hash_algorithm: string
          id: string
          is_current_version: boolean
          is_favorite: boolean
          mime_type: string
          original_file_name: string
          previous_version_id: string | null
          review_comments: string | null
          review_due_at: string | null
          review_requested_at: string | null
          review_requested_by: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_name: string | null
          size_bytes: number
          status: string
          storage_bucket: string
          storage_path: string
          tax_return_id: string | null
          updated_at: string
          uploaded_by: string
          version_group_id: string
          version_notes: string | null
          version_number: number
        }[]
        SetofOptions: {
          from: "*"
          to: "client_documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      request_document_changes: {
        Args: { p_comments: string; p_document_id: string }
        Returns: {
          archived_at: string | null
          assigned_reviewer_id: string | null
          assigned_reviewer_name: string | null
          category: string
          client_id: string
          created_at: string
          description: string | null
          file_hash: string | null
          hash_algorithm: string
          id: string
          is_current_version: boolean
          is_favorite: boolean
          mime_type: string
          original_file_name: string
          previous_version_id: string | null
          review_comments: string | null
          review_due_at: string | null
          review_requested_at: string | null
          review_requested_by: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_name: string | null
          size_bytes: number
          status: string
          storage_bucket: string
          storage_path: string
          tax_return_id: string | null
          updated_at: string
          uploaded_by: string
          version_group_id: string
          version_notes: string | null
          version_number: number
        }
        SetofOptions: {
          from: "*"
          to: "client_documents"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      request_document_review: {
        Args: { p_document_id: string }
        Returns: {
          archived_at: string | null
          assigned_reviewer_id: string | null
          assigned_reviewer_name: string | null
          category: string
          client_id: string
          created_at: string
          description: string | null
          file_hash: string | null
          hash_algorithm: string
          id: string
          is_current_version: boolean
          is_favorite: boolean
          mime_type: string
          original_file_name: string
          previous_version_id: string | null
          review_comments: string | null
          review_due_at: string | null
          review_requested_at: string | null
          review_requested_by: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_name: string | null
          size_bytes: number
          status: string
          storage_bucket: string
          storage_path: string
          tax_return_id: string | null
          updated_at: string
          uploaded_by: string
          version_group_id: string
          version_notes: string | null
          version_number: number
        }
        SetofOptions: {
          from: "*"
          to: "client_documents"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      request_document_review_assignment: {
        Args: {
          p_document_id: string
          p_review_due_at?: string
          p_reviewer_id: string
        }
        Returns: {
          archived_at: string | null
          assigned_reviewer_id: string | null
          assigned_reviewer_name: string | null
          category: string
          client_id: string
          created_at: string
          description: string | null
          file_hash: string | null
          hash_algorithm: string
          id: string
          is_current_version: boolean
          is_favorite: boolean
          mime_type: string
          original_file_name: string
          previous_version_id: string | null
          review_comments: string | null
          review_due_at: string | null
          review_requested_at: string | null
          review_requested_by: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_name: string | null
          size_bytes: number
          status: string
          storage_bucket: string
          storage_path: string
          tax_return_id: string | null
          updated_at: string
          uploaded_by: string
          version_group_id: string
          version_notes: string | null
          version_number: number
        }[]
        SetofOptions: {
          from: "*"
          to: "client_documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      reset_document_review: {
        Args: { p_document_id: string }
        Returns: {
          archived_at: string | null
          assigned_reviewer_id: string | null
          assigned_reviewer_name: string | null
          category: string
          client_id: string
          created_at: string
          description: string | null
          file_hash: string | null
          hash_algorithm: string
          id: string
          is_current_version: boolean
          is_favorite: boolean
          mime_type: string
          original_file_name: string
          previous_version_id: string | null
          review_comments: string | null
          review_due_at: string | null
          review_requested_at: string | null
          review_requested_by: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_name: string | null
          size_bytes: number
          status: string
          storage_bucket: string
          storage_path: string
          tax_return_id: string | null
          updated_at: string
          uploaded_by: string
          version_group_id: string
          version_notes: string | null
          version_number: number
        }
        SetofOptions: {
          from: "*"
          to: "client_documents"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      restore_document_version: {
        Args: { requested_document_id: string }
        Returns: {
          archived_at: string | null
          assigned_reviewer_id: string | null
          assigned_reviewer_name: string | null
          category: string
          client_id: string
          created_at: string
          description: string | null
          file_hash: string | null
          hash_algorithm: string
          id: string
          is_current_version: boolean
          is_favorite: boolean
          mime_type: string
          original_file_name: string
          previous_version_id: string | null
          review_comments: string | null
          review_due_at: string | null
          review_requested_at: string | null
          review_requested_by: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_name: string | null
          size_bytes: number
          status: string
          storage_bucket: string
          storage_path: string
          tax_return_id: string | null
          updated_at: string
          uploaded_by: string
          version_group_id: string
          version_notes: string | null
          version_number: number
        }[]
        SetofOptions: {
          from: "*"
          to: "client_documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      save_client_organizer_banking_information: {
        Args: {
          requested_account_holder_name: string
          requested_account_type: string
          requested_authorize_direct_debit: boolean
          requested_bank_name: string
          requested_organizer_id: string
          requested_use_direct_deposit: boolean
        }
        Returns: {
          organizer_id: string
          organizer_progress_percentage: number
          saved_at: string
          section_progress_percentage: number
          section_status: Database["public"]["Enums"]["tax_organizer_section_status"]
        }[]
      }
      save_client_organizer_identity_information: {
        Args: {
          requested_citizenship_status: string
          requested_has_government_photo_id: boolean
          requested_has_identity_changed: boolean
          requested_identification_expiration_date: string
          requested_identification_issue_date: string
          requested_identification_state: string
          requested_identification_type: string
          requested_is_us_citizen: boolean
          requested_organizer_id: string
        }
        Returns: {
          last_saved_at: string
          organizer_progress_percentage: number
          result_organizer_id: string
          section_progress_percentage: number
          section_status: Database["public"]["Enums"]["tax_organizer_section_status"]
        }[]
      }
      save_client_organizer_income_w2_details: {
        Args: {
          requested_document_received: boolean
          requested_employer_identification_number: string
          requested_federal_income_tax_withheld: number
          requested_income_source_id: string
          requested_local_income_tax_withheld: number
          requested_local_wages: number
          requested_medicare_tax_withheld: number
          requested_medicare_wages: number
          requested_organizer_id: string
          requested_social_security_tax_withheld: number
          requested_social_security_wages: number
          requested_state_code: string
          requested_state_income_tax_withheld: number
          requested_state_wages: number
          requested_wages: number
        }
        Returns: {
          display_order: number
          document_received: boolean
          employer_identification_number: string
          federal_income_tax_withheld: number
          income_created_at: string
          income_source_id: string
          income_type: string
          income_updated_at: string
          local_income_tax_withheld: number
          local_wages: number
          medicare_tax_withheld: number
          medicare_wages: number
          notes: string
          organizer_id: string
          payer_name: string
          recipient_type: string
          record_status: string
          social_security_tax_withheld: number
          social_security_wages: number
          state_code: string
          state_income_tax_withheld: number
          state_wages: number
          w2_created_at: string
          w2_updated_at: string
          wages: number
        }[]
      }
      save_client_organizer_personal_information: {
        Args: {
          requested_address_changed_this_year: boolean
          requested_address_line_1: string
          requested_address_line_2: string
          requested_alternate_phone: string
          requested_birth_date: string
          requested_city: string
          requested_email: string
          requested_employer_changed_this_year: boolean
          requested_filing_status: string
          requested_legal_first_name: string
          requested_legal_last_name: string
          requested_legal_middle_name: string
          requested_marital_status_changed_this_year: boolean
          requested_mobile_phone: string
          requested_occupation: string
          requested_organizer_id: string
          requested_postal_code: string
          requested_preferred_name: string
          requested_state: string
        }
        Returns: {
          last_saved_at: string
          organizer_id: string
          organizer_progress_percentage: number
          section_progress_percentage: number
          section_status: Database["public"]["Enums"]["tax_organizer_section_status"]
        }[]
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
      store_vault_secret: {
        Args: {
          requested_actor_user_id: string
          requested_authentication_tag: string
          requested_client_id: string
          requested_encrypted_value: string
          requested_initialization_vector: string
          requested_key_version: number
          requested_masked_value: string
          requested_organizer_id: string
          requested_secret_type: string
        }
        Returns: {
          key_version: number
          masked_value: string
          replaced_existing_secret: boolean
          status: string
          updated_at: string
          vault_secret_id: string
        }[]
      }
      store_vault_secret_v2: {
        Args: {
          requested_actor_user_id: string
          requested_authentication_tag: string
          requested_client_id: string
          requested_dependent_id: string
          requested_encrypted_value: string
          requested_initialization_vector: string
          requested_key_version: number
          requested_masked_value: string
          requested_organizer_id: string
          requested_secret_type: string
        }
        Returns: {
          key_version: number
          masked_value: string
          replaced_existing_secret: boolean
          status: string
          updated_at: string
          vault_secret_id: string
        }[]
      }
      toggle_client_document_favorite: {
        Args: { requested_document_id: string }
        Returns: {
          archived_at: string | null
          assigned_reviewer_id: string | null
          assigned_reviewer_name: string | null
          category: string
          client_id: string
          created_at: string
          description: string | null
          file_hash: string | null
          hash_algorithm: string
          id: string
          is_current_version: boolean
          is_favorite: boolean
          mime_type: string
          original_file_name: string
          previous_version_id: string | null
          review_comments: string | null
          review_due_at: string | null
          review_requested_at: string | null
          review_requested_by: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_name: string | null
          size_bytes: number
          status: string
          storage_bucket: string
          storage_path: string
          tax_return_id: string | null
          updated_at: string
          uploaded_by: string
          version_group_id: string
          version_notes: string | null
          version_number: number
        }[]
        SetofOptions: {
          from: "*"
          to: "client_documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_client_organizer_dependent: {
        Args: {
          requested_birth_date: string
          requested_claimed_by_another_taxpayer: boolean
          requested_dependent_id: string
          requested_first_name: string
          requested_is_full_time_student: boolean
          requested_is_permanently_disabled: boolean
          requested_last_name: string
          requested_lived_with_taxpayer_all_year: boolean
          requested_middle_name: string
          requested_months_lived_with_taxpayer: number
          requested_organizer_id: string
          requested_relationship: string
          requested_suffix: string
          requested_us_citizen_or_resident: boolean
        }
        Returns: {
          birth_date: string
          claimed_by_another_taxpayer: boolean
          created_at: string
          dependent_id: string
          display_order: number
          first_name: string
          is_full_time_student: boolean
          is_permanently_disabled: boolean
          last_name: string
          lived_with_taxpayer_all_year: boolean
          middle_name: string
          months_lived_with_taxpayer: number
          organizer_id: string
          organizer_progress_percentage: number
          relationship: string
          section_progress_percentage: number
          section_status: Database["public"]["Enums"]["tax_organizer_section_status"]
          suffix: string
          updated_at: string
          us_citizen_or_resident: boolean
        }[]
      }
      update_client_organizer_healthcare_coverage: {
        Args: {
          requested_coverage_id: string
          requested_coverage_type: string
          requested_covered_person_name: string
          requested_document_received: boolean
          requested_document_type: string
          requested_end_month: number
          requested_is_full_year_coverage: boolean
          requested_notes: string
          requested_organizer_id: string
          requested_policy_number: string
          requested_provider_name: string
          requested_start_month: number
        }
        Returns: {
          coverage_id: string
          coverage_type: string
          covered_person_name: string
          created_at: string
          display_order: number
          document_received: boolean
          document_type: string
          end_month: number
          is_full_year_coverage: boolean
          notes: string
          organizer_id: string
          policy_number: string
          provider_name: string
          record_status: string
          start_month: number
          updated_at: string
        }[]
      }
      update_client_organizer_income_source: {
        Args: {
          requested_document_received: boolean
          requested_income_source_id: string
          requested_notes: string
          requested_organizer_id: string
          requested_payer_name: string
          requested_recipient_type: string
          requested_record_status: string
        }
        Returns: {
          created_at: string
          display_order: number
          document_received: boolean
          income_source_id: string
          income_type: string
          notes: string
          organizer_id: string
          payer_name: string
          recipient_type: string
          record_status: string
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
      update_return_payment: {
        Args: {
          requested_amount: number
          requested_notes?: string
          requested_payment_date: string
          requested_payment_id: string
          requested_payment_method: Database["public"]["Enums"]["payment_method"]
          requested_reference_number?: string
        }
        Returns: {
          amount: number
          client_id: string
          created_at: string
          created_by: string | null
          id: string
          is_voided: boolean
          notes: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          receipt_issued_at: string | null
          receipt_issued_by: string | null
          receipt_number: string | null
          reference_number: string | null
          tax_return_id: string | null
          updated_at: string
          void_reason: string | null
          voided_at: string | null
          voided_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "payments"
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
      validate_client_portal_invitation: {
        Args: { requested_token_hash: string }
        Returns: {
          client_id: string
          client_name: string
          email: string
          expires_at: string
          invitation_status: Database["public"]["Enums"]["portal_invitation_status"]
          portal_account_id: string
        }[]
      }
      void_return_payment: {
        Args: { requested_payment_id: string; requested_void_reason: string }
        Returns: {
          amount: number
          client_id: string
          created_at: string
          created_by: string | null
          id: string
          is_voided: boolean
          notes: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          receipt_issued_at: string | null
          receipt_issued_by: string | null
          receipt_number: string | null
          reference_number: string | null
          tax_return_id: string | null
          updated_at: string
          void_reason: string | null
          voided_at: string | null
          voided_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      write_vault_audit_event: {
        Args: {
          requested_action: string
          requested_actor_user_id: string
          requested_client_id: string
          requested_ip_address: unknown
          requested_metadata: Json
          requested_organizer_id: string
          requested_outcome: string
          requested_reason: string
          requested_request_id: string
          requested_secret_type: string
          requested_session_id: string
          requested_source: string
          requested_user_agent: string
          requested_vault_secret_id: string
        }
        Returns: string
      }
      write_vault_audit_event_v2: {
        Args: {
          requested_action: string
          requested_actor_user_id: string
          requested_client_id: string
          requested_dependent_id: string
          requested_ip_address: unknown
          requested_metadata: Json
          requested_organizer_id: string
          requested_outcome: string
          requested_reason: string
          requested_request_id: string
          requested_secret_type: string
          requested_session_id: string
          requested_source: string
          requested_user_agent: string
          requested_vault_secret_id: string
        }
        Returns: string
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
      client_portal_status: "invited" | "active" | "disabled"
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
      portal_account_status: "inactive" | "active" | "locked"
      portal_invitation_status: "pending" | "accepted" | "expired" | "revoked"
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
      tax_organizer_section_key:
        | "personal"
        | "identity"
        | "banking"
        | "dependents"
        | "income"
        | "business"
        | "rental"
        | "healthcare"
        | "education"
        | "deductions"
        | "documents"
        | "review"
        | "signature"
      tax_organizer_section_status:
        | "not_started"
        | "in_progress"
        | "completed"
        | "needs_attention"
      tax_organizer_status:
        | "not_started"
        | "in_progress"
        | "submitted"
        | "under_review"
        | "changes_requested"
        | "approved"
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
      client_portal_status: ["invited", "active", "disabled"],
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
      portal_account_status: ["inactive", "active", "locked"],
      portal_invitation_status: ["pending", "accepted", "expired", "revoked"],
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
      tax_organizer_section_key: [
        "personal",
        "identity",
        "banking",
        "dependents",
        "income",
        "business",
        "rental",
        "healthcare",
        "education",
        "deductions",
        "documents",
        "review",
        "signature",
      ],
      tax_organizer_section_status: [
        "not_started",
        "in_progress",
        "completed",
        "needs_attention",
      ],
      tax_organizer_status: [
        "not_started",
        "in_progress",
        "submitted",
        "under_review",
        "changes_requested",
        "approved",
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
