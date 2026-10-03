/**
 * Lo que se ve mientras llega una pantalla: la cabecera y la barra de abajo
 * siguen en su sitio, y en medio, la forma de lo que va a aparecer.
 */
export default function Cargando() {
  return (
    <div role="status" className="flex flex-col gap-6">
      <span className="sr-only">Cargando…</span>
      <div aria-hidden className="flex flex-col gap-2">
        <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-56 animate-pulse rounded-md bg-muted" />
      </div>
      <div aria-hidden className="flex flex-col gap-3">
        <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
        <div className="h-36 animate-pulse rounded-xl bg-muted" />
      </div>
      <div aria-hidden className="flex flex-col gap-3">
        <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
        <div className="h-16 animate-pulse rounded-xl bg-muted" />
        <div className="h-16 animate-pulse rounded-xl bg-muted" />
        <div className="h-16 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}
