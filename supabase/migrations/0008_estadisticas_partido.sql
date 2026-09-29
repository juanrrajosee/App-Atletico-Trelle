-- Estadísticas de cada jugador en cada partido.

create table public.estadisticas_partido (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references public.partidos (id) on delete cascade,
  jugador_id uuid not null references public.jugadores (id),
  titular boolean not null default false,
  minutos smallint not null default 0 check (minutos between 0 and 130),
  goles smallint not null default 0 check (goles >= 0),
  asistencias smallint not null default 0 check (asistencias >= 0),
  tarjetas_amarillas smallint not null default 0
    check (tarjetas_amarillas between 0 and 2),
  tarjeta_roja boolean not null default false,
  creado_en timestamptz not null default now(),
  unique (partido_id, jugador_id)
);

comment on table public.estadisticas_partido is
  'Estadísticas de un jugador en un partido concreto.';

create index estadisticas_partido_jugador_id_idx
  on public.estadisticas_partido (jugador_id);

alter table public.estadisticas_partido enable row level security;

-- El entrenador registra las estadísticas por completo.
create policy "estadisticas_partido_entrenador_todo"
  on public.estadisticas_partido for all
  using (public.es_entrenador())
  with check (public.es_entrenador());

-- Las estadísticas de partido son públicas dentro del equipo, como una
-- clasificación interna.
create policy "estadisticas_partido_leer_equipo"
  on public.estadisticas_partido for select
  using (public.tiene_acceso());
