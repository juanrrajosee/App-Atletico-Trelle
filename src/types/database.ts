export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
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
            referencedRelation: "jugadores_publicos";
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
          foto: string | null;
          id: string;
          nombre: string;
          posicion: Database["public"]["Enums"]["posicion_jugador"];
        };
        Insert: {
          apellidos: string;
          creado_en?: string;
          dorsal: number;
          estado?: Database["public"]["Enums"]["estado_jugador"];
          foto?: string | null;
          id?: string;
          nombre: string;
          posicion: Database["public"]["Enums"]["posicion_jugador"];
        };
        Update: {
          apellidos?: string;
          creado_en?: string;
          dorsal?: number;
          estado?: Database["public"]["Enums"]["estado_jugador"];
          foto?: string | null;
          id?: string;
          nombre?: string;
          posicion?: Database["public"]["Enums"]["posicion_jugador"];
        };
        Relationships: [];
      };
      noticias: {
        Row: {
          actualizado_en: string;
          creado_en: string;
          cuerpo: string;
          id: string;
          publicada_en: string | null;
          resumen: string | null;
          titulo: string;
        };
        Insert: {
          actualizado_en?: string;
          creado_en?: string;
          cuerpo: string;
          id?: string;
          publicada_en?: string | null;
          resumen?: string | null;
          titulo: string;
        };
        Update: {
          actualizado_en?: string;
          creado_en?: string;
          cuerpo?: string;
          id?: string;
          publicada_en?: string | null;
          resumen?: string | null;
          titulo?: string;
        };
        Relationships: [];
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
      votos: {
        Row: {
          categoria: Database["public"]["Enums"]["categoria_votacion"];
          creado_en: string;
          id: string;
          jugador_id: string;
          partido_id: string;
          perfil_id: string | null;
        };
        Insert: {
          categoria: Database["public"]["Enums"]["categoria_votacion"];
          creado_en?: string;
          id?: string;
          jugador_id: string;
          partido_id: string;
          perfil_id?: string | null;
        };
        Update: {
          categoria?: Database["public"]["Enums"]["categoria_votacion"];
          creado_en?: string;
          id?: string;
          jugador_id?: string;
          partido_id?: string;
          perfil_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "votos_jugador_id_fkey";
            columns: ["jugador_id"];
            isOneToOne: false;
            referencedRelation: "jugadores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "votos_jugador_id_fkey";
            columns: ["jugador_id"];
            isOneToOne: false;
            referencedRelation: "jugadores_publicos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "votos_partido_id_fkey";
            columns: ["partido_id"];
            isOneToOne: false;
            referencedRelation: "partidos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "votos_perfil_id_fkey";
            columns: ["perfil_id"];
            isOneToOne: false;
            referencedRelation: "perfiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      jugadores_publicos: {
        Row: {
          activo: boolean | null;
          apellidos: string | null;
          dorsal: number | null;
          id: string | null;
          nombre: string | null;
          posicion: Database["public"]["Enums"]["posicion_jugador"] | null;
        };
        Insert: {
          activo?: never;
          apellidos?: string | null;
          dorsal?: number | null;
          id?: string | null;
          nombre?: string | null;
          posicion?: Database["public"]["Enums"]["posicion_jugador"] | null;
        };
        Update: {
          activo?: never;
          apellidos?: string | null;
          dorsal?: number | null;
          id?: string | null;
          nombre?: string | null;
          posicion?: Database["public"]["Enums"]["posicion_jugador"] | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      cierre_votacion: { Args: { p_fecha_hora: string }; Returns: string };
      consultar_votacion: {
        Args: { p_partido_id: string };
        Returns: {
          cierre: string;
          estado: Database["public"]["Enums"]["estado_votacion"];
        }[];
      };
      es_administrador: { Args: Record<PropertyKey, never>; Returns: boolean };
      es_candidato: {
        Args: {
          p_categoria: Database["public"]["Enums"]["categoria_votacion"];
          p_jugador_id: string;
          p_partido_id: string;
        };
        Returns: boolean;
      };
      estadisticas_jugadores: {
        Args: { p_temporada: number };
        Returns: {
          asistencias: number;
          convocatorias: number;
          goles: number;
          jugador_id: string;
          minutos: number;
          partidos_jugados: number;
          tarjetas_amarillas: number;
          tarjetas_rojas: number;
          titularidades: number;
        }[];
      };
      guardar_alineacion: { Args: { p_filas: Json; p_partido_id: string }; Returns: undefined };
      inicio_temporada: { Args: { p_temporada: number }; Returns: string };
      ranking_votaciones: {
        Args: { p_temporada: number };
        Returns: {
          categoria: Database["public"]["Enums"]["categoria_votacion"];
          jugador_id: string;
          victorias: number;
          votos: number;
        }[];
      };
      resultados_votacion: {
        Args: { p_partido_id: string };
        Returns: {
          categoria: Database["public"]["Enums"]["categoria_votacion"];
          jugador_id: string;
          votos: number;
        }[];
      };
      votacion_abierta: { Args: { p_partido_id: string }; Returns: boolean };
      votar: {
        Args: {
          p_categoria: Database["public"]["Enums"]["categoria_votacion"];
          p_jugador_id: string;
          p_partido_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      categoria_votacion: "mvp" | "mejor_suplente" | "compromiso";
      condicion_partido: "local" | "visitante";
      estado_jugador: "disponible" | "lesionado" | "sancionado" | "baja";
      estado_partido: "programado" | "jugado" | "aplazado";
      estado_votacion: "pendiente" | "abierta" | "cerrada";
      posicion_jugador: "portero" | "defensa" | "centrocampista" | "delantero";
      rol_usuario: "aficionado" | "administrador";
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
      categoria_votacion: ["mvp", "mejor_suplente", "compromiso"],
      condicion_partido: ["local", "visitante"],
      estado_jugador: ["disponible", "lesionado", "sancionado", "baja"],
      estado_partido: ["programado", "jugado", "aplazado"],
      estado_votacion: ["pendiente", "abierta", "cerrada"],
      posicion_jugador: ["portero", "defensa", "centrocampista", "delantero"],
      rol_usuario: ["aficionado", "administrador"],
    },
  },
} as const;
