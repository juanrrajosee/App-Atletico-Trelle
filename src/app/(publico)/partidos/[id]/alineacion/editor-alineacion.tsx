"use client";

import { Minus, Plus } from "lucide-react";
import Link from "next/link";
import {
  startTransition,
  useActionState,
  useId,
  useState,
  type FormEvent,
} from "react";
import { EtiquetaEstado } from "@/components/plantilla/etiqueta-estado";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NOMBRE_POSICION_PLURAL, POSICIONES } from "@/lib/plantilla";
import { cn } from "@/lib/utils";
import type { FilaGuardada, JugadorAlineacion } from "../../datos";
import type { EstadoAlineacion, FilaAlineacion } from "./validacion";

type Participacion = "titular" | "suplente" | "no_convocado";

const PARTICIPACIONES: { valor: Participacion; nombre: string }[] = [
  { valor: "titular", nombre: "Titular" },
  { valor: "suplente", nombre: "Suplente" },
  { valor: "no_convocado", nombre: "No convocado" },
];

/** Lo que se va rellenando de cada jugador; los minutos, como se escriben. */
type Fila = Omit<FilaAlineacion, "jugador_id" | "minutos"> & {
  minutos: string;
};

/** Un jugador recién convocado: sin nada anotado y los minutos por poner. */
const FILA_NUEVA: Fila = {
  titular: false,
  minutos: "",
  goles: 0,
  asistencias: 0,
  tarjetas_amarillas: 0,
  tarjeta_roja: false,
};

type Props = {
  accion: (
    estado: EstadoAlineacion,
    filas: FilaAlineacion[],
  ) => Promise<EstadoAlineacion>;
  jugadores: JugadorAlineacion[];
  filasGuardadas: FilaGuardada[];
  /** Goles del Atlético Trelle en el partido. */
  golesEquipo: number;
  hrefCancelar: string;
};

export function EditorAlineacion({
  accion,
  jugadores,
  filasGuardadas,
  golesEquipo,
  hrefCancelar,
}: Props) {
  const [estado, enviar, pendiente] = useActionState(accion, {
    mensaje: null,
    errores: {},
  });

  // Solo están los jugadores convocados; el resto, no convocados.
  const [filas, setFilas] = useState<Record<string, Fila>>(() =>
    Object.fromEntries(
      filasGuardadas.map(({ jugador_id, minutos, ...resto }) => [
        jugador_id,
        { ...resto, minutos: String(minutos) },
      ]),
    ),
  );

  function cambiarParticipacion(jugadorId: string, valor: Participacion) {
    setFilas((actuales) => {
      const { [jugadorId]: actual, ...resto } = actuales;
      if (valor === "no_convocado") {
        return resto;
      }
      return {
        ...resto,
        [jugadorId]: { ...(actual ?? FILA_NUEVA), titular: valor === "titular" },
      };
    });
  }

  function cambiarFila(jugadorId: string, cambios: Partial<Fila>) {
    setFilas((actuales) => ({
      ...actuales,
      [jugadorId]: { ...actuales[jugadorId], ...cambios },
    }));
  }

  function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const lista: FilaAlineacion[] = Object.entries(filas).map(
      ([jugadorId, { minutos, ...resto }]) => ({
        jugador_id: jugadorId,
        ...resto,
        minutos: minutos.trim() === "" ? null : Number(minutos),
      }),
    );
    startTransition(() => enviar(lista));
  }

  const convocados = Object.values(filas);
  const titulares = convocados.filter((fila) => fila.titular).length;
  const suplentes = convocados.length - titulares;
  const golesJugadores = convocados.reduce((suma, fila) => suma + fila.goles, 0);

  return (
    <form onSubmit={guardar} className="flex flex-col gap-6" noValidate>
      {POSICIONES.map((posicion) => {
        const delGrupo = jugadores.filter(
          (jugador) => jugador.posicion === posicion,
        );
        if (delGrupo.length === 0) {
          return null;
        }
        return (
          <section key={posicion}>
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">
              {NOMBRE_POSICION_PLURAL[posicion]}
            </h2>
            <ul className="divide-y overflow-hidden rounded-xl border bg-card">
              {delGrupo.map((jugador) => (
                <FilaJugador
                  key={jugador.id}
                  jugador={jugador}
                  fila={filas[jugador.id]}
                  error={estado.errores[jugador.id]}
                  onParticipacion={(valor) =>
                    cambiarParticipacion(jugador.id, valor)
                  }
                  onCambio={(cambios) => cambiarFila(jugador.id, cambios)}
                />
              ))}
            </ul>
          </section>
        );
      })}

      {jugadores.length === 0 && (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          No hay jugadores en la plantilla.
        </p>
      )}

      {filasGuardadas.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Para borrar la alineación, deja a todos como no convocados y guarda.
        </p>
      )}

      {/* Siempre a mano encima de la barra de navegación: la lista es larga. */}
      <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] -mx-4 flex flex-col gap-3 border-t bg-background px-4 py-3">
        <p className="text-sm text-muted-foreground">
          {titulares} {titulares === 1 ? "titular" : "titulares"} ·{" "}
          {suplentes} {suplentes === 1 ? "suplente" : "suplentes"} ·{" "}
          <span
            className={cn(
              golesJugadores > golesEquipo && "font-medium text-destructive",
            )}
          >
            {golesJugadores} de {golesEquipo}{" "}
            {golesEquipo === 1 ? "gol" : "goles"}
          </span>
        </p>

        {estado.mensaje && (
          <p role="alert" className="text-sm text-destructive">
            {estado.mensaje}
          </p>
        )}

        <div className="grid grid-cols-[auto_1fr] gap-3">
          <Button asChild variant="ghost" className="h-11">
            <Link href={hrefCancelar}>Cancelar</Link>
          </Button>
          <Button type="submit" disabled={pendiente} className="h-11">
            {pendiente ? "Guardando…" : "Guardar alineación"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function FilaJugador({
  jugador,
  fila,
  error,
  onParticipacion,
  onCambio,
}: {
  jugador: JugadorAlineacion;
  fila: Fila | undefined;
  error: string | undefined;
  onParticipacion: (valor: Participacion) => void;
  onCambio: (cambios: Partial<Fila>) => void;
}) {
  const id = useId();
  const participacion: Participacion = fila
    ? fila.titular
      ? "titular"
      : "suplente"
    : "no_convocado";

  return (
    <li
      className={cn("flex flex-col gap-3 px-4 py-3", fila && "bg-accent/40")}
    >
      <div className="flex items-center gap-3">
        <span className="w-8 text-center text-lg font-semibold tabular-nums">
          {jugador.dorsal}
        </span>
        <span id={`${id}-nombre`} className="min-w-0 flex-1 truncate font-medium">
          {jugador.nombre} {jugador.apellidos}
        </span>
        {jugador.estado !== "disponible" && (
          <EtiquetaEstado estado={jugador.estado} />
        )}
      </div>

      <div
        role="radiogroup"
        aria-labelledby={`${id}-nombre`}
        className="grid grid-cols-3 gap-1 rounded-lg border bg-background p-1"
      >
        {PARTICIPACIONES.map(({ valor, nombre }) => (
          <label
            key={valor}
            className={cn(
              "flex h-10 cursor-pointer items-center justify-center rounded-md text-sm has-focus-visible:ring-2 has-focus-visible:ring-ring",
              participacion !== valor
                ? "text-muted-foreground"
                : // No convocado es lo normal: se marca sin llamar la atención.
                  valor === "no_convocado"
                  ? "bg-muted font-medium text-foreground"
                  : "bg-primary font-medium text-primary-foreground",
            )}
          >
            <input
              type="radio"
              name={`${id}-participacion`}
              value={valor}
              checked={participacion === valor}
              onChange={() => onParticipacion(valor)}
              className="sr-only"
            />
            {nombre}
          </label>
        ))}
      </div>

      {fila && (
        <div className="grid grid-cols-2 gap-3">
          <div className="grid content-start gap-2">
            <Label htmlFor={`${id}-minutos`}>Minutos</Label>
            <Input
              id={`${id}-minutos`}
              type="number"
              inputMode="numeric"
              min={0}
              max={130}
              value={fila.minutos}
              onChange={(evento) => onCambio({ minutos: evento.target.value })}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              className="h-11 bg-background"
            />
          </div>
          <Contador
            etiqueta="Goles"
            valor={fila.goles}
            maximo={20}
            onCambio={(goles) => onCambio({ goles })}
          />
          <Contador
            etiqueta="Asistencias"
            valor={fila.asistencias}
            maximo={20}
            onCambio={(asistencias) => onCambio({ asistencias })}
          />
          <Contador
            etiqueta="Amarillas"
            valor={fila.tarjetas_amarillas}
            maximo={2}
            onCambio={(tarjetas_amarillas) => onCambio({ tarjetas_amarillas })}
          />
          <label className="col-span-2 flex h-11 cursor-pointer items-center gap-3 rounded-md border bg-background px-3 text-sm font-medium has-focus-visible:ring-2 has-focus-visible:ring-ring">
            <input
              type="checkbox"
              checked={fila.tarjeta_roja}
              onChange={(evento) =>
                onCambio({ tarjeta_roja: evento.target.checked })
              }
              className="size-5 accent-red-600"
            />
            Tarjeta roja
          </label>
        </div>
      )}

      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </li>
  );
}

/** Un número pequeño que se sube y se baja con el pulgar. */
function Contador({
  etiqueta,
  valor,
  maximo,
  onCambio,
}: {
  etiqueta: string;
  valor: number;
  maximo: number;
  onCambio: (valor: number) => void;
}) {
  const id = useId();

  return (
    <div className="grid content-start gap-2">
      <span id={id} className="text-sm leading-none font-medium">
        {etiqueta}
      </span>
      <div
        role="group"
        aria-labelledby={id}
        className="flex h-11 items-center justify-between rounded-md border bg-background"
      >
        <Button
          type="button"
          variant="ghost"
          className="h-full w-11 rounded-r-none"
          aria-label={`Quitar uno (${etiqueta.toLowerCase()})`}
          disabled={valor <= 0}
          onClick={() => onCambio(valor - 1)}
        >
          <Minus aria-hidden />
        </Button>
        <output aria-live="polite" className="font-medium tabular-nums">
          {valor}
        </output>
        <Button
          type="button"
          variant="ghost"
          className="h-full w-11 rounded-l-none"
          aria-label={`Añadir uno (${etiqueta.toLowerCase()})`}
          disabled={valor >= maximo}
          onClick={() => onCambio(valor + 1)}
        >
          <Plus aria-hidden />
        </Button>
      </div>
    </div>
  );
}
