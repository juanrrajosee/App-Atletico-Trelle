export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      asistencias: {
        Row: {
          creado_en: string;
          entrenamiento_id: string;
          estado: Database["public"]["Enums"]["estado_asistencia"];
          id: string;
          jugador_id: string;
        };
        Insert: {
          creado_en?: string;
          entrenamiento_id: string;
          estado: Database["public"]["Enums"]["estado_asistencia"];
          id?: string;
          jugador_id: string;
        };
        Update: {
          creado_en?: string;
          entrenamiento_id?: string;
          estado?: Database["public"]["Enums"]["estado_asistencia"];
          id?: string;
          jugador_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "asistencias_entrenamiento_id_fkey";
            columns: ["entrenamiento_id"];
            isOneToOne: false;
            referencedRelation: "entrenamientos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "asistencias_jugador_id_fkey";
            columns: ["jugador_id"];
            isOneToOne: false;
            referencedRelation: "jugadores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "asistencias_jugador_id_fkey";
            columns: ["jugador_id"];
            isOneToOne: false;
            referencedRelation: "jugadores_roster";
            referencedColumns: ["id"];
          },
        ];
      };
      convocatorias: {
        Row: {
          confirmacion: Database["public"]["Enums"]["estado_confirmacion"];
          convocado: boolean;
          creado_en: string;
          id: string;
          jugador_id: string;
          partido_id: string;
          respondido_en: string | null;
        };
        Insert: {
          confirmacion?: Database["public"]["Enums"]["estado_confirmacion"];
          convocado?: boolean;
          creado_en?: string;
          id?: string;
          jugador_id: string;
          partido_id: string;
          respondido_en?: string | null;
        };
        Update: {
          confirmacion?: Database["public"]["Enums"]["estado_confirmacion"];
          convocado?: boolean;
          creado_en?: string;
          id?: string;
          jugador_id?: string;
          partido_id?: string;
          respondido_en?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "convocatorias_jugador_id_fkey";
            columns: ["jugador_id"];
            isOneToOne: false;
            referencedRelation: "jugadores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "convocatorias_jugador_id_fkey";
            columns: ["jugador_id"];
            isOneToOne: false;
            referencedRelation: "jugadores_roster";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "convocatorias_partido_id_fkey";
            columns: ["partido_id"];
            isOneToOne: false;
            referencedRelation: "partidos";
            referencedColumns: ["id"];
          },
        ];
      };
      entrenamientos: {
        Row: {
          creado_en: string;
          fecha_hora: string;
          id: string;
          lugar: string;
          notas: string | null;
        };
        Insert: {
          creado_en?: string;
          fecha_hora: string;
          id?: string;
          lugar: string;
          notas?: string | null;
        };
        Update: {
          creado_en?: string;
          fecha_hora?: string;
          id?: string;
          lugar?: string;
          notas?: string | null;
        };
        Relationships: [];
      };
      estadisticas_partido: {
        Row: {
          asistencias: number;
          creado_en: string;
          goles: number;
          id: string;
          jugador_id: string;
          minutos: number;
          partido_id: string;
          tarjeta_roja: boolean;
          tarjetas_amarillas: number;
          titular: boolean;
        };
        Insert: {
          asistencias?: number;
          creado_en?: string;
          goles?: number;
          id?: string;
          jugador_id: string;
          minutos?: number;
          partido_id: string;
          tarjeta_roja?: boolean;
          tarjetas_amarillas?: number;
          titular?: boolean;
        };
        Update: {
          asistencias?: number;
          creado_en?: string;
          goles?: number;
          id?: string;
          jugador_id?: string;
          minutos?: number;
          partido_id?: string;
          tarjeta_roja?: boolean;
          tarjetas_amarillas?: number;
          titular?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "estadisticas_partido_jugador_id_fkey";
            columns: ["jugador_id"];
            isOneToOne: false;
            referencedRelation: "jugadores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "estadisticas_partido_jugador_id_fkey";
            columns: ["jugador_id"];
            isOneToOne: false;
            referencedRelation: "jugadores_roster";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "estadisticas_partido_partido_id_fkey";
            columns: ["partido_id"];
            isOneToOne: false;
            referencedRelation: "partidos";
            referencedColumns: ["id"];
          },
        ];
      };
      jugadores: {
        Row: {
          apellidos: string;
          creado_en: string;
          dorsal: number;
          estado: Database["public"]["Enums"]["estado_jugador"];
          fecha_nacimiento: string | null;
          foto: string | null;
          id: string;
          nombre: string;
          perfil_id: string | null;
          posicion: Database["public"]["Enums"]["posicion_jugador"];
          telefono: string | null;
        };
        Insert: {
          apellidos: string;
          creado_en?: string;
          dorsal: number;
          estado?: Database["public"]["Enums"]["estado_jugador"];
          fecha_nacimiento?: string | null;
          foto?: string | null;
          id?: string;
          nombre: string;
          perfil_id?: string | null;
          posicion: Database["public"]["Enums"]["posicion_jugador"];
          telefono?: string | null;
        };
        Update: {
          apellidos?: string;
          creado_en?: string;
          dorsal?: number;
          estado?: Database["public"]["Enums"]["estado_jugador"];
          fecha_nacimiento?: string | null;
          foto?: string | null;
          id?: string;
          nombre?: string;
          perfil_id?: string | null;
          posicion?: Database["public"]["Enums"]["posicion_jugador"];
          telefono?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "jugadores_perfil_id_fkey";
            columns: ["perfil_id"];
            isOneToOne: true;
            referencedRelation: "perfiles";
            referencedColumns: ["id"];
          },
        ];
      };
      partidos: {
        Row: {
          campo: string | null;
          competicion: string | null;
          condicion: Database["public"]["Enums"]["condicion_partido"];
          creado_en: string;
          estado: Database["public"]["Enums"]["estado_partido"];
          fecha_hora: string;
          goles_contra: number | null;
          goles_favor: number | null;
          id: string;
          rival: string;
        };
        Insert: {
          campo?: string | null;
          competicion?: string | null;
          condicion: Database["public"]["Enums"]["condicion_partido"];
          creado_en?: string;
          estado?: Database["public"]["Enums"]["estado_partido"];
          fecha_hora: string;
          goles_contra?: number | null;
          goles_favor?: number | null;
          id?: string;
          rival: string;
        };
        Update: {
          campo?: string | null;
          competicion?: string | null;
          condicion?: Database["public"]["Enums"]["condicion_partido"];
          creado_en?: string;
          estado?: Database["public"]["Enums"]["estado_partido"];
          fecha_hora?: string;
          goles_contra?: number | null;
          goles_favor?: number | null;
          id?: string;
          rival?: string;
        };
        Relationships: [];
      };
      perfiles: {
        Row: {
          creado_en: string;
          id: string;
          rol: Database["public"]["Enums"]["rol_usuario"];
        };
        Insert: {
          creado_en?: string;
          id: string;
          rol?: Database["public"]["Enums"]["rol_usuario"];
        };
        Update: {
          creado_en?: string;
          id?: string;
          rol?: Database["public"]["Enums"]["rol_usuario"];
        };
        Relationships: [];
      };
    };
    Views: {
      jugadores_roster: {
        Row: {
          apellidos: string | null;
          dorsal: number | null;
          estado: Database["public"]["Enums"]["estado_jugador"] | null;
          foto: string | null;
          id: string | null;
          nombre: string | null;
          posicion: Database["public"]["Enums"]["posicion_jugador"] | null;
        };
        Insert: {
          apellidos?: string | null;
          dorsal?: number | null;
          estado?: Database["public"]["Enums"]["estado_jugador"] | null;
          foto?: string | null;
          id?: string | null;
          nombre?: string | null;
          posicion?: Database["public"]["Enums"]["posicion_jugador"] | null;
        };
        Update: {
          apellidos?: string | null;
          dorsal?: number | null;
          estado?: Database["public"]["Enums"]["estado_jugador"] | null;
          foto?: string | null;
          id?: string | null;
          nombre?: string | null;
          posicion?: Database["public"]["Enums"]["posicion_jugador"] | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      es_entrenador: { Args: Record<PropertyKey, never>; Returns: boolean };
      mi_jugador_id: { Args: Record<PropertyKey, never>; Returns: string };
      tiene_acceso: { Args: Record<PropertyKey, never>; Returns: boolean };
    };
    Enums: {
      condicion_partido: "local" | "visitante";
      estado_asistencia: "presente" | "ausente" | "justificado";
      estado_confirmacion: "pendiente" | "confirmado" | "rechazado";
      estado_jugador: "disponible" | "lesionado" | "sancionado" | "baja";
      estado_partido: "programado" | "jugado" | "aplazado";
      posicion_jugador: "portero" | "defensa" | "centrocampista" | "delantero";
      rol_usuario: "entrenador" | "jugador";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      condicion_partido: ["local", "visitante"],
      estado_asistencia: ["presente", "ausente", "justificado"],
      estado_confirmacion: ["pendiente", "confirmado", "rechazado"],
      estado_jugador: ["disponible", "lesionado", "sancionado", "baja"],
      estado_partido: ["programado", "jugado", "aplazado"],
      posicion_jugador: ["portero", "defensa", "centrocampista", "delantero"],
      rol_usuario: ["entrenador", "jugador"],
    },
  },
} as const;
