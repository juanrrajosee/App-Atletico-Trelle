-- Calendario de partidos.

create table public.partidos (
  id uuid primary key default gen_random_uuid(),
  rival text not null,
  fecha_hora timestamptz not null,
  campo text,
  condicion public.condicion_partido not null,
  competicion text,
  goles_favor smallint check (goles_favor >= 0),
  goles_contra smallint check (goles_contra >= 0),
  estado public.estado_partido not null default 'programado',
  creado_en timestamptz not null default now()
);

comment on table public.partidos is 'Calendario y resultados de partidos.';

create index partidos_fecha_hora_idx on public.partidos (fecha_hora);

alter table public.partidos enable row level security;

-- El entrenador gestiona el calendario por completo.
create policy "partidos_entrenador_todo"
  on public.partidos for all
  using (public.es_entrenador())
  with check (public.es_entrenador());

-- Cualquier cuenta con acceso al equipo puede consultar el calendario.
create policy "partidos_leer_equipo"
  on public.partidos for select
  using (public.tiene_acceso());
