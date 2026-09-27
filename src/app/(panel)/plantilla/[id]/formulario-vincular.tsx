"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import type { EstadoVinculacion } from "../acciones";
import type { Cuenta } from "../datos";

type Props = {
  accion: (
    estado: EstadoVinculacion,
    formData: FormData,
  ) => Promise<EstadoVinculacion>;
  cuentasLibres: Cuenta[];
};

export function FormularioVincular({ accion, cuentasLibres }: Props) {
  const [estado, enviar, pendiente] = useActionState(accion, { error: null });

  return (
    <form
      action={enviar}
      className="grid gap-3 *:data-[slot=native-select-wrapper]:w-full"
    >
      <Label htmlFor="perfil_id">Cuenta</Label>
      <NativeSelect
        id="perfil_id"
        name="perfil_id"
        defaultValue=""
        className="h-11"
        aria-invalid={estado.error ? true : undefined}
      >
        <NativeSelectOption value="" disabled>
          Elige una cuenta…
        </NativeSelectOption>
        {cuentasLibres.map((cuenta) => (
          <NativeSelectOption key={cuenta.perfilId} value={cuenta.perfilId}>
            {cuenta.rol === "entrenador"
              ? `${cuenta.email} (entrenador)`
              : cuenta.email}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      {estado.error && (
        <p role="alert" className="text-sm text-destructive">
          {estado.error}
        </p>
      )}
      <Button type="submit" disabled={pendiente} className="h-11">
        {pendiente ? "Vinculando…" : "Vincular cuenta"}
      </Button>
    </form>
  );
}
