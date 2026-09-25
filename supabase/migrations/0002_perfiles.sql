-- Perfiles: un perfil por cada cuenta de auth.users, con su rol.
--
-- Las cuentas las crea el entrenador a mano desde el panel de Supabase
-- (Authentication → Add user). No hay registro público en la aplicación.
-- Toda cuenta nueva empieza como "jugador"; el ascenso a "entrenador" se
-- hace directamente en SQL (o desde el panel), nunca desde la aplicación,
-- para que nadie pueda concederse a sí mismo más permisos.

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  rol public.rol_usuario not null default 'jugador',
  creado_en timestamptz not null default now()
);

comment on table public.perfiles is
  'Un perfil por cuenta de auth.users. El rol se asigna a mano por SQL.';

alter table public.perfiles enable row level security;

-- Crea el perfil automáticamente al dar de alta una cuenta en auth.users.
create function public.gestionar_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id) values (new.id);
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.gestionar_nuevo_usuario();

-- Helper para las políticas de RLS de esta y otras tablas. security definer
-- para no depender de las políticas de "perfiles" al evaluarse dentro de
-- ellas mismas o de las de otras tablas.
create function public.es_entrenador()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol = 'entrenador'
  );
$$;

comment on function public.es_entrenador() is
  'True si la cuenta autenticada tiene rol entrenador.';

-- Cada cuenta ve su propio perfil (lo necesita para saber su rol y si está
-- pendiente de vincularse a una ficha de jugador).
create policy "perfiles_leer_propio"
  on public.perfiles for select
  using (id = auth.uid());

-- El entrenador ve todos los perfiles, para poder vincularlos a jugadores.
create policy "perfiles_leer_entrenador"
  on public.perfiles for select
  using (public.es_entrenador());

-- No hay políticas de insert/update/delete: los perfiles los crea el
-- trigger (como security definer, sin pasar por RLS) y el rol solo se
-- cambia por SQL directo, nunca desde la aplicación.
