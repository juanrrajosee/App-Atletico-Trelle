import { urlFotoPublica } from "@/lib/fotos";
import type { Tables } from "@/types/database";

export type Producto = Pick<
  Tables<"productos">,
  | "id"
  | "nombre"
  | "descripcion"
  | "precio_orientativo"
  | "foto"
  | "visible"
  | "orden"
>;

/** El bucket de Storage donde están las fotos de los productos. */
export const BUCKET_FOTOS = "productos";

/** La dirección pública de la foto de un producto. */
export function urlFoto(ruta: string) {
  return urlFotoPublica(BUCKET_FOTOS, ruta);
}

const formatoEuros = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const formatoEurosConCentimos = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

/** 20 → "20 €"; 12.5 → "12,50 €". */
export function formatearPrecio(precio: number) {
  return (
    Number.isInteger(precio) ? formatoEuros : formatoEurosConCentimos
  ).format(precio);
}

/** Para llamar: "tel:" y el número sin espacios. */
export function enlaceTelefono(telefono: string) {
  return `tel:${telefono.replace(/\s/g, "")}`;
}

/**
 * Para escribir por WhatsApp con el mensaje ya puesto. WhatsApp quiere el
 * número con el prefijo del país y sin "+": a un número español de nueve
 * cifras se le pone el 34.
 */
export function enlaceWhatsApp(telefono: string, mensaje: string) {
  let numero = telefono.replace(/\D/g, "");
  if (numero.length === 9) {
    numero = `34${numero}`;
  }
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

/** El mensaje de WhatsApp para pedir presupuesto de un producto. */
export function mensajePresupuesto(producto: Pick<Producto, "nombre">) {
  return `Hola, me interesa «${producto.nombre}» de la tienda del Atlético Trelle. ¿Me podéis dar presupuesto?`;
}
