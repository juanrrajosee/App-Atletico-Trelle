-- Convocatorias: a quién convoca el entrenador para cada partido, y su
-- confirmación de disponibilidad.

create table public.convocatorias (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references public.partidos (id) on delete cascade,
  jugador_id uuid not null references public.jugadores (id),
  convocado boolean not null default true,
  confirmacion public.estado_confirmacion not null default 'pendiente',
  respondido_en timestamptz,
  creado_en timestamptz not null default now(),
  unique (partido_id, jugador_id)
);

comment on table public.convocatorias is
  'Convocatoria de un jugador a un partido y su confirmación.';

create index convocatorias_jugador_id_idx on public.convocatorias (jugador_id);

alter table public.convocatorias enable row level security;

-- El entrenador gestiona las convocatorias por completo (crea, edita,
-- borra, y también puede cambiar la confirmación de un jugador si este le
-- avisa por otro medio).
create policy "convocatorias_entrenador_todo"
  on public.convocatorias for all
  using (public.es_entrenador())
  with check (public.es_entrenador());

-- Cualquier cuenta con acceso al equipo ve todas las convocatorias (quién
-- está citado y quién ha respondido), como una lista de convocados normal.
create policy "convocatorias_leer_equipo"
  on public.convocatorias for select
  using (public.tiene_acceso());

-- Un jugador solo puede tocar su propia convocatoria. Qué puede cambiar
-- exactamente lo limita el trigger de más abajo.
create policy "convocatorias_actualizar_propia"
  on public.convocatorias for update
  using (jugador_id = public.mi_jugador_id())
  with check (jugador_id = public.mi_jugador_id());

-- RLS filtra filas, no columnas: sin este trigger, la política de arriba
-- dejaría a un jugador cambiar cualquier columna de su fila (por ejemplo,
-- marcarse a sí mismo como convocado). El trigger se aplica a toda
-- actualización de la tabla; para el entrenador no restringe nada.
create function public.restringir_actualizacion_convocatoria()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.es_entrenador() then
    return new;
  end if;

  if old.convocado is distinct from true then
    raise exception 'Solo puedes responder a convocatorias en las que estés convocado.';
  end if;

  if new.partido_id is distinct from old.partido_id
    or new.jugador_id is distinct from old.jugador_id
    or new.convocado is distinct from old.convocado
  then
    raise exception 'Un jugador solo puede cambiar su propia confirmación.';
  end if;

  new.respondido_en = now();
  return new;
end;
$$;

create trigger antes_de_actualizar_convocatoria
  before update on public.convocatorias
  for each row execute function public.restringir_actualizacion_convocatoria();
