"use client";

import { Newspaper } from "lucide-react";
import Link from "next/link";
import { startTransition, useActionState, type FormEvent } from "react";
import { CampoFormulario } from "@/components/campo-formulario";
import { SelectorFoto, useSelectorFoto } from "@/components/selector-foto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { CampoNoticia, EstadoFormularioNoticia } from "./validacion";

type Props = {
  accion: (
    estado: EstadoFormularioNoticia,
    formData: FormData,
  ) => Promise<EstadoFormularioNoticia>;
  valoresIniciales: EstadoFormularioNoticia["valores"];
  /** Dirección de la foto de portada que ya tiene la noticia, si tiene. */
  fotoActual?: string | null;
  textoBoton: string;
  hrefCancelar: string;
};

/**
 * Formulario de una noticia. Se envía a mano (no con action) para mandar
 * la foto ya reducida en lugar de la original.
 */
export function FormularioNoticia({
  accion,
  valoresIniciales,
  fotoActual = null,
  textoBoton,
  hrefCancelar,
}: Props) {
  const [estado, enviar, pendiente] = useActionState(accion, {
    errores: {},
    mensaje: null,
    valores: valoresIniciales,
    intento: 0,
  });
  const { errores, valores } = estado;

  // Fuera del <form>, que se vuelve a montar tras cada envío: así la foto
  // elegida no se pierde si hay que corregir otro campo.
  const selectorFoto = useSelectorFoto(fotoActual);

  function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    selectorFoto.prepararEnvio(datos);
    startTransition(() => enviar(datos));
  }

  /**
   * Atributos comunes para marcar un campo con error y enlazarlo con su
   * error y, si tiene, con su texto de ayuda.
   */
  const describir = (campo: CampoNoticia, conAyuda = false) => ({
    ...(errores[campo] ? { "aria-invalid": true } : {}),
    "aria-describedby":
      [errores[campo] && `${campo}-error`, conAyuda && `${campo}-ayuda`]
        .filter(Boolean)
        .join(" ") || undefined,
  });

  return (
    <form
      key={estado.intento}
      onSubmit={guardar}
      className="flex flex-col gap-5"
      noValidate
    >
      <CampoFormulario id="titulo" etiqueta="Título" error={errores.titulo}>
        <Input
          id="titulo"
          name="titulo"
          autoComplete="off"
          defaultValue={valores.titulo}
          className="h-11"
          {...describir("titulo")}
        />
      </CampoFormulario>

      <SelectorFoto
        selector={selectorFoto}
        error={errores.foto}
        icono={Newspaper}
        alt="Foto de portada"
        apaisada
      />

      <CampoFormulario
        id="resumen"
        etiqueta="Resumen (opcional)"
        error={errores.resumen}
      >
        <Textarea
          id="resumen"
          name="resumen"
          rows={2}
          defaultValue={valores.resumen}
          {...describir("resumen", true)}
        />
        <p id="resumen-ayuda" className="text-xs text-muted-foreground">
          Una o dos frases para la lista de noticias y para cuando se comparte
          el enlace. Si lo dejas vacío, se usa el principio del texto.
        </p>
      </CampoFormulario>

      <CampoFormulario id="cuerpo" etiqueta="Texto" error={errores.cuerpo}>
        <Textarea
          id="cuerpo"
          name="cuerpo"
          rows={12}
          defaultValue={valores.cuerpo}
          className="min-h-60"
          {...describir("cuerpo", true)}
        />
        <p id="cuerpo-ayuda" className="text-xs text-muted-foreground">
          Separa los párrafos con una línea en blanco.
        </p>
      </CampoFormulario>

      <CampoFormulario id="estado" etiqueta="Estado" error={errores.estado}>
        <NativeSelect
          id="estado"
          name="estado"
          defaultValue={valores.estado ?? "borrador"}
          className="h-11"
          {...describir("estado")}
        >
          <NativeSelectOption value="borrador">
            Borrador (solo lo ves tú)
          </NativeSelectOption>
          <NativeSelectOption value="publicada">Publicada</NativeSelectOption>
        </NativeSelect>
      </CampoFormulario>

      {estado.mensaje && (
        <p role="alert" className="text-sm text-destructive">
          {estado.mensaje}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          disabled={pendiente || selectorFoto.procesando}
          className="h-11 w-full"
        >
          {pendiente ? "Guardando…" : textoBoton}
        </Button>
        <Button asChild variant="ghost" className="h-11 w-full">
          <Link href={hrefCancelar}>Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
