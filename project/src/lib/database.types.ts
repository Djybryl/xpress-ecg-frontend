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
      ecg_files: {
        Row: {
          created_at: string
          ecg_record_id: string
          file_path: string
          file_type: "WFDB" | "DICOM" | "JPEG" | "PNG"
          id: string
        }
        Insert: {
          created_at?: string
          ecg_record_id: string
          file_path: string
          file_type: "WFDB" | "DICOM" | "JPEG" | "PNG"
          id?: string
        }
        Update: {
          created_at?: string
          ecg_record_id?: string
          file_path?: string
          file_type?: "WFDB" | "DICOM" | "JPEG" | "PNG"
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ecg_files_ecg_record_id_fkey"
            columns: ["ecg_record_id"]
            isOneToOne: false
            referencedRelation: "ecg_records"
            referencedColumns: ["id"]
          }
        ]
      }
      ecg_records: {
        Row: {
          analyzed: boolean
          created_at: string
          date: string
          gender: string | null
          heart_rate: number | null
          hospital_id: string
          id: string
          medical_center: string
          notes: string | null
          patient_id: string | null
          patient_name: string
          referring_doctor_id: string
          status: "pending" | "analyzing" | "completed"
          updated_at: string
          viewed: boolean
        }
        Insert: {
          analyzed?: boolean
          created_at?: string
          date?: string
          gender?: string | null
          heart_rate?: number | null
          hospital_id: string
          id?: string
          medical_center: string
          notes?: string | null
          patient_id?: string | null
          patient_name: string
          referring_doctor_id: string
          status?: "pending" | "analyzing" | "completed"
          updated_at?: string
          viewed?: boolean
        }
        Update: {
          analyzed?: boolean
          created_at?: string
          date?: string
          gender?: string | null
          heart_rate?: number | null
          hospital_id?: string
          id?: string
          medical_center?: string
          notes?: string | null
          patient_id?: string | null
          patient_name?: string
          referring_doctor_id?: string
          status?: "pending" | "analyzing" | "completed"
          updated_at?: string
          viewed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "ecg_records_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecg_records_referring_doctor_id_fkey"
            columns: ["referring_doctor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      hospital_users: {
        Row: {
          created_at: string
          hospital_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hospital_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hospital_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_users_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospital_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      hospitals: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      second_opinions: {
        Row: {
          consultant_id: string
          created_at: string
          ecg_record_id: string
          id: string
          notes: string | null
          requesting_doctor_id: string
          response: string | null
          status: "pending" | "completed"
          updated_at: string
        }
        Insert: {
          consultant_id: string
          created_at?: string
          ecg_record_id: string
          id?: string
          notes?: string | null
          requesting_doctor_id: string
          response?: string | null
          status?: "pending" | "completed"
          updated_at?: string
        }
        Update: {
          consultant_id?: string
          created_at?: string
          ecg_record_id?: string
          id?: string
          notes?: string | null
          requesting_doctor_id?: string
          response?: string | null
          status?: "pending" | "completed"
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "second_opinions_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "second_opinions_ecg_record_id_fkey"
            columns: ["ecg_record_id"]
            isOneToOne: false
            referencedRelation: "ecg_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "second_opinions_requesting_doctor_id_fkey"
            columns: ["requesting_doctor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          role: "doctor" | "expert" | "secretary"
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          role: "doctor" | "expert" | "secretary"
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          role?: "doctor" | "expert" | "secretary"
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          content: string
          ecg_record_id: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          content: string
          ecg_record_id?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          content?: string
          ecg_record_id?: string | null
          read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          read: boolean
          reference_id: string | null
          reference_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          read?: boolean
          reference_id?: string | null
          reference_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          read?: boolean
          reference_id?: string | null
          reference_type?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      ecg_favorites: {
        Row: {
          id: string
          user_id: string
          ecg_record_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ecg_record_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ecg_record_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ecg_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecg_favorites_ecg_record_id_fkey"
            columns: ["ecg_record_id"]
            isOneToOne: false
            referencedRelation: "ecg_records"
            referencedColumns: ["id"]
          }
        ]
      }
      ecg_tags: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          created_at?: string
        }
        Relationships: []
      }
      ecg_tag_relations: {
        Row: {
          id: string
          ecg_record_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          id?: string
          ecg_record_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          id?: string
          ecg_record_id?: string
          tag_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ecg_tag_relations_ecg_record_id_fkey"
            columns: ["ecg_record_id"]
            isOneToOne: false
            referencedRelation: "ecg_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecg_tag_relations_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "ecg_tags"
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