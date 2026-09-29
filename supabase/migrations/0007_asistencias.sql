-- Asistencia a entrenamientos (pasar lista).

create table public.asistencias (
  id uuid primary key default gen_random_uuid(),
  entrenamiento_id uuid not null
    references public.entrenamientos (id) on delete cascade,
  jugador_id uuid not null references public.jugadores (id),
  estado public.estado_asistencia not null,
  creado_en timestamptz not null default now(),
  unique (entrenamiento_id, jugador_id)
);

comment on table public.asistencias is
  'Asistencia de cada jugador a cada entrenamiento.';

create index asistencias_jugador_id_idx on public.asistencias (jugador_id);

alter table public.asistencias enable row level security;

-- El entrenador pasa lista: gestiona la asistencia por completo.
create policy "asistencias_entrenador_todo"
  on public.asistencias for all
  using (public.es_entrenador())
  with check (public.es_entrenador());

-- La asistencia es un dato personal: un jugador solo ve la suya, no la de
-- sus compañeros.
create policy "asistencias_leer_propia"
  on public.asistencias for select
  using (jugador_id = public.mi_jugador_id());
