import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind, resolviendo conflictos (por ejemplo, si se
 * pasa "p-2" y luego "p-4", se queda con "p-4"). La usan todos los
 * componentes de shadcn/ui.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
