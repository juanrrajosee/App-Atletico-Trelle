-- Clasificación de la liga, tal como la publica la Federación Galega de
-- Fútbol.
--
-- No se calcula con nuestros partidos (solo tenemos los del Atlético Trelle):
-- el administrador la copia de la web de la federación después de cada
-- jornada, una fila por equipo y temporada. Lo ve cualquiera, sin cuenta; lo
-- cambia solo el administrador.
create table public.clasificacion (
  id uuid primary key default gen_random_uuid(),
  -- Año en que empieza la temporada: 2026 es la 2026/27.
  temporada smallint not null check (temporada between 2023 and 2100),
  posicion smallint not null check (posicion between 1 and 30),
  equipo text not null check (char_length(trim(equipo)) between 1 and 80),
  puntos smallint not null check (puntos between -99 and 999),
  jugados smallint not null check (jugados between 0 and 99),
  ganados smallint not null check (ganados between 0 and 99),
  empatados smallint not null check (empatados between 0 and 99),
  perdidos smallint not null check (perdidos between 0 and 99),
  -- Puntos que la federación le ha quitado al equipo.
  sancion smallint not null default 0 check (sancion between 0 and 99),
  -- Los últimos resultados, como los enseña la federación: G (ganado),
  -- E (empatado) o P (perdido).
  ultimos text not null default '' check (ultimos ~ '^[GEP]{0,5}$'),
  -- La franja de color de la federación, si la tiene.
  zona text check (zona in ('ascenso', 'promocion', 'descenso')),
  actualizada_en timestamptz not null default now(),
  constraint clasificacion_partidos_cuadran
    check (ganados + empatados + perdidos = jugados),
  constraint clasificacion_posicion_unica unique (temporada, posicion),
  constraint clasificacion_equipo_unico unique (temporada, equipo)
);

comment on table public.clasificacion is
  'Clasificación de la liga copiada de la Federación Galega de Fútbol, una fila por equipo y temporada.';

alter table public.clasificacion enable row level security;

create policy "clasificacion_leer_todos"
  on public.clasificacion for select
  using (true);

create policy "clasificacion_administrador_todo"
  on public.clasificacion for all
  using (public.es_administrador())
  with check (public.es_administrador());
