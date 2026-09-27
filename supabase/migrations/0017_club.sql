-- El club: su historia, la de Trelle, cómo contactar y la directiva. Lo
-- escribe el administrador desde la aplicación; cualquiera lo lee.

-- La información del club es una sola: la tabla tiene exactamente una
-- fila, que se crea aquí vacía y el administrador rellena.
create table public.club (
  id boolean primary key default true check (id),
  -- Textos: los párrafos se separan con una línea en blanco.
  historia_club text check (char_length(historia_club) <= 20000),
  historia_trelle text check (char_length(historia_trelle) <= 20000),
  email text check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  telefono text check (telefono ~ '^\+?[0-9 ]{9,20}$'),
  campo text check (char_length(campo) <= 200),
  actualizado_en timestamptz not null default now()
);

comment on table public.club is
  'Información del club (una sola fila): historia, la de Trelle y contacto.';

insert into public.club default values;

alter table public.club enable row level security;

create policy "club_leer_todos"
  on public.club for select
  using (true);

-- Solo se actualiza: no hay políticas de insert ni de delete, así que la
-- fila única no se puede duplicar ni borrar.
create policy "club_administrador_actualizar"
  on public.club for update
  using (public.es_administrador())
  with check (public.es_administrador());

create trigger club_marcar_actualizacion
  before update on public.club
  for each row
  execute function public.marcar_actualizacion();

-- La directiva actual. Son datos de personas que se publican: se añade a
-- cada una con su conformidad.
create table public.directiva (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(trim(nombre)) between 1 and 120),
  cargo text not null check (char_length(trim(cargo)) between 1 and 60),
  -- Posición en la lista (de menor a mayor): la presidencia, primero.
  orden smallint not null default 0,
  creado_en timestamptz not null default now()
);

comment on table public.directiva is 'Miembros de la directiva actual del club.';

alter table public.directiva enable row level security;

create policy "directiva_leer_todos"
  on public.directiva for select
  using (true);

create policy "directiva_administrador_todo"
  on public.directiva for all
  using (public.es_administrador())
  with check (public.es_administrador());
