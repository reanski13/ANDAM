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
      access_requests: {
        Row: {
          area: string | null
          contact_email: string
          created_at: string
          id: string
          name: string
          position: string | null
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          area?: string | null
          contact_email: string
          created_at?: string
          id?: string
          name: string
          position?: string | null
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          area?: string | null
          contact_email?: string
          created_at?: string
          id?: string
          name?: string
          position?: string | null
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      admin_actions: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string | null
          id: string
          metadata: Json
          status: string | null
          target_scope: string | null
          timestamp: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string | null
          id?: string
          metadata?: Json
          status?: string | null
          target_scope?: string | null
          timestamp?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string | null
          id?: string
          metadata?: Json
          status?: string | null
          target_scope?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      evacuation_centers: {
        Row: {
          address: string | null
          amenities: string[]
          capacity: number | null
          contact: string | null
          created_at: string
          elevation_label: string | null
          elevation_m: number | null
          id: string
          image_query: string | null
          is_active: boolean
          lat: number
          lon: number
          name: string
          purok: string | null
          role: string | null
          sector: string | null
        }
        Insert: {
          address?: string | null
          amenities?: string[]
          capacity?: number | null
          contact?: string | null
          created_at?: string
          elevation_label?: string | null
          elevation_m?: number | null
          id?: string
          image_query?: string | null
          is_active?: boolean
          lat: number
          lon: number
          name: string
          purok?: string | null
          role?: string | null
          sector?: string | null
        }
        Update: {
          address?: string | null
          amenities?: string[]
          capacity?: number | null
          contact?: string | null
          created_at?: string
          elevation_label?: string | null
          elevation_m?: number | null
          id?: string
          image_query?: string | null
          is_active?: boolean
          lat?: number
          lon?: number
          name?: string
          purok?: string | null
          role?: string | null
          sector?: string | null
        }
        Relationships: []
      }
      evacuation_routes: {
        Row: {
          center_id: string
          created_at: string
          from_purok: string | null
          geometry: Json
          id: string
          notes: string | null
        }
        Insert: {
          center_id: string
          created_at?: string
          from_purok?: string | null
          geometry: Json
          id?: string
          notes?: string | null
        }
        Update: {
          center_id?: string
          created_at?: string
          from_purok?: string | null
          geometry?: Json
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evacuation_routes_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "evacuation_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      flood_incidents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          lat: number | null
          location: string | null
          lon: number | null
          reported_by: string | null
          severity: string | null
          timestamp: string
          verified: boolean
          water_level_cm: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          lat?: number | null
          location?: string | null
          lon?: number | null
          reported_by?: string | null
          severity?: string | null
          timestamp?: string
          verified?: boolean
          water_level_cm?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          lat?: number | null
          location?: string | null
          lon?: number | null
          reported_by?: string | null
          severity?: string | null
          timestamp?: string
          verified?: boolean
          water_level_cm?: number | null
        }
        Relationships: []
      }
      hazard_zones: {
        Row: {
          created_at: string
          description: string | null
          geometry: Json | null
          id: string
          is_active: boolean
          name: string
          radius_m: number | null
          severity: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          geometry?: Json | null
          id?: string
          is_active?: boolean
          name: string
          radius_m?: number | null
          severity: string
        }
        Update: {
          created_at?: string
          description?: string | null
          geometry?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          radius_m?: number | null
          severity?: string
        }
        Relationships: []
      }
      ml_models: {
        Row: {
          algorithm: string | null
          created_at: string
          id: string
          is_active: boolean
          metrics: Json
          params: Json
          trained_at: string | null
          version: string
        }
        Insert: {
          algorithm?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          metrics?: Json
          params?: Json
          trained_at?: string | null
          version: string
        }
        Update: {
          algorithm?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          metrics?: Json
          params?: Json
          trained_at?: string | null
          version?: string
        }
        Relationships: []
      }
      ml_predictions: {
        Row: {
          confidence: number | null
          horizon_hours: number
          id: string
          issued_at: string
          model_version: string
          predicted_level_m: number | null
          sensor_id: string | null
        }
        Insert: {
          confidence?: number | null
          horizon_hours: number
          id?: string
          issued_at?: string
          model_version: string
          predicted_level_m?: number | null
          sensor_id?: string | null
        }
        Update: {
          confidence?: number | null
          horizon_hours?: number
          id?: string
          issued_at?: string
          model_version?: string
          predicted_level_m?: number | null
          sensor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ml_predictions_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "sensors"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_snapshots: {
        Row: {
          id: string
          inputs: Json
          level: string
          reading_id: string | null
          reasons: Json
          score: number
          timestamp: string
        }
        Insert: {
          id?: string
          inputs?: Json
          level: string
          reading_id?: string | null
          reasons?: Json
          score: number
          timestamp?: string
        }
        Update: {
          id?: string
          inputs?: Json
          level?: string
          reading_id?: string | null
          reasons?: Json
          score?: number
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_snapshots_reading_id_fkey"
            columns: ["reading_id"]
            isOneToOne: false
            referencedRelation: "weather_readings"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_hourly: {
        Row: {
          battery_min_pct: number | null
          bucket: string
          level_avg_m: number | null
          level_max_m: number | null
          level_min_m: number | null
          sensor_id: string
        }
        Insert: {
          battery_min_pct?: number | null
          bucket: string
          level_avg_m?: number | null
          level_max_m?: number | null
          level_min_m?: number | null
          sensor_id: string
        }
        Update: {
          battery_min_pct?: number | null
          bucket?: string
          level_avg_m?: number | null
          level_max_m?: number | null
          level_min_m?: number | null
          sensor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sensor_hourly_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "sensors"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_readings: {
        Row: {
          battery_pct: number | null
          created_at: string
          flow_cms: number | null
          id: string
          sensor_id: string
          source: string | null
          timestamp: string
          water_level_m: number | null
        }
        Insert: {
          battery_pct?: number | null
          created_at?: string
          flow_cms?: number | null
          id?: string
          sensor_id: string
          source?: string | null
          timestamp?: string
          water_level_m?: number | null
        }
        Update: {
          battery_pct?: number | null
          created_at?: string
          flow_cms?: number | null
          id?: string
          sensor_id?: string
          source?: string | null
          timestamp?: string
          water_level_m?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sensor_readings_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "sensors"
            referencedColumns: ["id"]
          },
        ]
      }
      sensors: {
        Row: {
          created_at: string
          danger_level_m: number | null
          data_source: string
          elevation_m: number | null
          id: string
          is_active: boolean
          is_simulated: boolean
          lat: number
          lon: number
          name: string
          normal_level_m: number | null
          purok: string | null
          station_id: string | null
          status: string
          type: string
          warning_level_m: number | null
        }
        Insert: {
          created_at?: string
          danger_level_m?: number | null
          data_source?: string
          elevation_m?: number | null
          id?: string
          is_active?: boolean
          is_simulated?: boolean
          lat: number
          lon: number
          name: string
          normal_level_m?: number | null
          purok?: string | null
          station_id?: string | null
          status?: string
          type: string
          warning_level_m?: number | null
        }
        Update: {
          created_at?: string
          danger_level_m?: number | null
          data_source?: string
          elevation_m?: number | null
          id?: string
          is_active?: boolean
          is_simulated?: boolean
          lat?: number
          lon?: number
          name?: string
          normal_level_m?: number | null
          purok?: string | null
          station_id?: string | null
          status?: string
          type?: string
          warning_level_m?: number | null
        }
        Relationships: []
      }
      weather_daily: {
        Row: {
          bucket: string
          rain_total_mm: number | null
          source: string
          temp_max: number | null
          temp_min: number | null
          wind_max_kmh: number | null
        }
        Insert: {
          bucket: string
          rain_total_mm?: number | null
          source: string
          temp_max?: number | null
          temp_min?: number | null
          wind_max_kmh?: number | null
        }
        Update: {
          bucket?: string
          rain_total_mm?: number | null
          source?: string
          temp_max?: number | null
          temp_min?: number | null
          wind_max_kmh?: number | null
        }
        Relationships: []
      }
      weather_forecasts: {
        Row: {
          condition: string | null
          fetched_at: string
          humidity: number | null
          icon: string | null
          id: string
          rain_3h_mm: number | null
          source: string
          temperature: number | null
          valid_at: string
          wind_direction_deg: number | null
          wind_speed_kmh: number | null
        }
        Insert: {
          condition?: string | null
          fetched_at?: string
          humidity?: number | null
          icon?: string | null
          id?: string
          rain_3h_mm?: number | null
          source?: string
          temperature?: number | null
          valid_at: string
          wind_direction_deg?: number | null
          wind_speed_kmh?: number | null
        }
        Update: {
          condition?: string | null
          fetched_at?: string
          humidity?: number | null
          icon?: string | null
          id?: string
          rain_3h_mm?: number | null
          source?: string
          temperature?: number | null
          valid_at?: string
          wind_direction_deg?: number | null
          wind_speed_kmh?: number | null
        }
        Relationships: []
      }
      weather_hourly: {
        Row: {
          avg_humidity: number | null
          avg_pressure: number | null
          avg_temp: number | null
          avg_wind_kmh: number | null
          bucket: string
          max_wind_kmh: number | null
          source: string
          sum_rain_mm: number | null
        }
        Insert: {
          avg_humidity?: number | null
          avg_pressure?: number | null
          avg_temp?: number | null
          avg_wind_kmh?: number | null
          bucket: string
          max_wind_kmh?: number | null
          source: string
          sum_rain_mm?: number | null
        }
        Update: {
          avg_humidity?: number | null
          avg_pressure?: number | null
          avg_temp?: number | null
          avg_wind_kmh?: number | null
          bucket?: string
          max_wind_kmh?: number | null
          source?: string
          sum_rain_mm?: number | null
        }
        Relationships: []
      }
      weather_readings: {
        Row: {
          condition: string | null
          created_at: string
          humidity: number | null
          id: string
          lat: number | null
          lon: number | null
          pressure_hpa: number | null
          rain_24h_mm: number | null
          rain_6h_mm: number | null
          rainfall_mm: number | null
          source: string
          temperature: number | null
          timestamp: string
          wind_direction: string | null
          wind_direction_deg: number | null
          wind_speed_kmh: number | null
        }
        Insert: {
          condition?: string | null
          created_at?: string
          humidity?: number | null
          id?: string
          lat?: number | null
          lon?: number | null
          pressure_hpa?: number | null
          rain_24h_mm?: number | null
          rain_6h_mm?: number | null
          rainfall_mm?: number | null
          source: string
          temperature?: number | null
          timestamp?: string
          wind_direction?: string | null
          wind_direction_deg?: number | null
          wind_speed_kmh?: number | null
        }
        Update: {
          condition?: string | null
          created_at?: string
          humidity?: number | null
          id?: string
          lat?: number | null
          lon?: number | null
          pressure_hpa?: number | null
          rain_24h_mm?: number | null
          rain_6h_mm?: number | null
          rainfall_mm?: number | null
          source?: string
          temperature?: number | null
          timestamp?: string
          wind_direction?: string | null
          wind_direction_deg?: number | null
          wind_speed_kmh?: number | null
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
    Enums: {},
  },
} as const
