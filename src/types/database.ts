export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          created_at: string;
          onboarding_completed: boolean;
          subscription_tier: string;
          units: string;
          settings: Json;
        };
        Insert: {
          id?: string;
          email?: string | null;
          created_at?: string;
          onboarding_completed?: boolean;
          subscription_tier?: string;
          units?: string;
          settings?: Json;
        };
        Update: {
          id?: string;
          email?: string | null;
          created_at?: string;
          onboarding_completed?: boolean;
          subscription_tier?: string;
          units?: string;
          settings?: Json;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string | null;
          domains: string[];
          fitness_level: string;
          goal: string;
          gym_days_per_week: number | null;
          run_days_per_week: number | null;
          age: number | null;
          weight_kg: number | null;
          height_cm: number | null;
          sex: string | null;
          resting_hr: number | null;
          tdee_estimated: number | null;
          protein_target_g: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          domains: string[];
          fitness_level: string;
          goal: string;
          gym_days_per_week?: number | null;
          run_days_per_week?: number | null;
          age?: number | null;
          weight_kg?: number | null;
          height_cm?: number | null;
          sex?: string | null;
          resting_hr?: number | null;
          tdee_estimated?: number | null;
          protein_target_g?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'user_profiles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      plans: {
        Row: {
          id: string;
          user_id: string | null;
          plan_type: string;
          plan_data: Json;
          week_number: number;
          created_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          plan_type: string;
          plan_data: Json;
          week_number?: number;
          created_at?: string;
          is_active?: boolean;
        };
        Update: Partial<Database['public']['Tables']['plans']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'plans_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      workout_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          plan_id: string | null;
          workout_template: string;
          started_at: string;
          completed_at: string | null;
          duration_seconds: number | null;
          exercises: Json;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          plan_id?: string | null;
          workout_template: string;
          started_at: string;
          completed_at?: string | null;
          duration_seconds?: number | null;
          exercises: Json;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['workout_sessions']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'workout_sessions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'workout_sessions_plan_id_fkey';
            columns: ['plan_id'];
            isOneToOne: false;
            referencedRelation: 'plans';
            referencedColumns: ['id'];
          },
        ];
      };
      run_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          plan_id: string | null;
          session_type: string;
          started_at: string;
          completed_at: string | null;
          duration_seconds: number | null;
          distance_meters: number | null;
          avg_hr: number | null;
          target_zone: string | null;
          intervals: Json | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          plan_id?: string | null;
          session_type: string;
          started_at: string;
          completed_at?: string | null;
          duration_seconds?: number | null;
          distance_meters?: number | null;
          avg_hr?: number | null;
          target_zone?: string | null;
          intervals?: Json | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['run_sessions']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'run_sessions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'run_sessions_plan_id_fkey';
            columns: ['plan_id'];
            isOneToOne: false;
            referencedRelation: 'plans';
            referencedColumns: ['id'];
          },
        ];
      };
      nutrition_checkins: {
        Row: {
          id: string;
          user_id: string | null;
          date: string;
          protein_servings: number;
          veggie_servings: number;
          water_glasses: number;
          followed_plan: boolean | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          date: string;
          protein_servings?: number;
          veggie_servings?: number;
          water_glasses?: number;
          followed_plan?: boolean | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['nutrition_checkins']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'nutrition_checkins_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      exercises: {
        Row: {
          id: string;
          name: string;
          category: string;
          movement_pattern: string;
          primary_muscles: string[];
          secondary_muscles: string[] | null;
          equipment: string;
          alternatives: string[] | null;
          citation_ids: string[] | null;
          instructions: string | null;
          cues: string[] | null;
        };
        Insert: {
          id: string;
          name: string;
          category: string;
          movement_pattern: string;
          primary_muscles: string[];
          secondary_muscles?: string[] | null;
          equipment: string;
          alternatives?: string[] | null;
          citation_ids?: string[] | null;
          instructions?: string | null;
          cues?: string[] | null;
        };
        Update: Partial<Database['public']['Tables']['exercises']['Insert']>;
        Relationships: [];
      };
      citations: {
        Row: {
          id: string;
          authors: string;
          year: number;
          title: string;
          journal: string;
          finding: string;
          doi: string | null;
          confidence: string;
        };
        Insert: {
          id: string;
          authors: string;
          year: number;
          title: string;
          journal: string;
          finding: string;
          doi?: string | null;
          confidence: string;
        };
        Update: Partial<Database['public']['Tables']['citations']['Insert']>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

// Convenience aliases (matches Supabase CLI codegen output)
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
