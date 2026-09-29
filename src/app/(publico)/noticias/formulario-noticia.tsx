"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CampoFormulario } from "@/components/campo-formulario";
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
  textoBoton: string;
  hrefCancelar: string;
};

export function FormularioNoticia({
  accion,
  valoresIniciales,
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
      action={enviar}
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
        <Button type="submit" disabled={pendiente} className="h-11 w-full">
          {pendiente ? "Guardando…" : textoBoton}
        </Button>
        <Button asChild variant="ghost" className="h-11 w-full">
          <Link href={hrefCancelar}>Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
