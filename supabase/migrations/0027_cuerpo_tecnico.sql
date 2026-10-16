-- Cuerpo técnico del club: entrenador, delegado, etc.
--
-- Como la directiva, son datos de personas que se publican: se añade a cada
-- una con su conformidad. Lo ve cualquiera, sin cuenta; lo cambia solo el
-- administrador.
create table public.cuerpo_tecnico (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(trim(nombre)) between 1 and 120),
  cargo text not null check (char_length(trim(cargo)) between 1 and 60),
  -- Posición en la lista (de menor a mayor): el entrenador, primero.
  orden smallint not null default 0 check (orden between 0 and 99),
  creado_en timestamptz not null default now()
);

comment on table public.cuerpo_tecnico is
  'Cuerpo técnico del club (entrenador, delegado...). Solo con la conformidad de cada persona.';

alter table public.cuerpo_tecnico enable row level security;

create policy "cuerpo_tecnico_leer_todos"
  on public.cuerpo_tecnico for select
  using (true);

create policy "cuerpo_tecnico_administrador_todo"
  on public.cuerpo_tecnico for all
  using (public.es_administrador())
  with check (public.es_administrador());
