import "server-only";

import { obtenerEntornoSupabase } from "./entorno";

/**
 * Si "Entrar con Google" está activado en Supabase. Se le pregunta al propio
 * Auth (sus ajustes públicos), para no enseñar un botón que no funcionaría.
 * La respuesta se guarda 5 minutos: al activarlo en el panel de Supabase, el
 * botón aparece como mucho en ese tiempo.
 */
export async function googleActivado(): Promise<boolean> {
  const { url, clave } = obtenerEntornoSupabase();

  try {
    const respuesta = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: clave },
      next: { revalidate: 300 },
    });
    if (!respuesta.ok) {
      return false;
    }
    const ajustes = (await respuesta.json()) as {
      external?: { google?: boolean };
    };
    return ajustes.external?.google === true;
  } catch {
    return false;
  }
}
