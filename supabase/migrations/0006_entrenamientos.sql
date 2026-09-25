-- Sesiones de entrenamiento.

create table public.entrenamientos (
  id uuid primary key default gen_random_uuid(),
  fecha_hora timestamptz not null,
  lugar text not null,
  notas text,
  creado_en timestamptz not null default now()
);

comment on table public.entrenamientos is 'Sesiones de entrenamiento del equipo.';

create index entrenamientos_fecha_hora_idx on public.entrenamientos (fecha_hora);

alter table public.entrenamientos enable row level security;

-- El entrenador gestiona los entrenamientos por completo.
create policy "entrenamientos_entrenador_todo"
  on public.entrenamientos for all
  using (public.es_entrenador())
  with check (public.es_entrenador());

-- Cualquier cuenta con acceso al equipo puede consultar los entrenamientos.
create policy "entrenamientos_leer_equipo"
  on public.entrenamientos for select
  using (public.tiene_acceso());
