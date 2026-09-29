/**
 * Lee la URL y la clave pública (publishable) del proyecto de Supabase.
 *
 * Las variables NEXT_PUBLIC_* se incrustan en el código al compilar, por eso
 * se leen con su nombre literal y no de forma dinámica.
 */
export function obtenerEntornoSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !clave) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. " +
        "Copia .env.example a .env.local y rellena los valores.",
    );
  }

  return { url, clave };
}
