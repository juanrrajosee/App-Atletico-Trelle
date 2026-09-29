-- Plantilla de jugadores.

create table public.jugadores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  apellidos text not null,
  dorsal smallint not null check (dorsal between 1 and 99),
  posicion public.posicion_jugador not null,
  fecha_nacimiento date,
  telefono text,
  -- Ruta a la foto en Supabase Storage. La beta no sube fotos todavía:
  -- la columna queda preparada y la interfaz muestra iniciales mientras
  -- esté vacía.
  foto text,
  estado public.estado_jugador not null default 'disponible',
  -- Cuenta de auth.users vinculada a esta ficha (la crea el entrenador).
  -- Puede quedar sin vincular, y una cuenta solo puede vincularse a un
  -- jugador.
  perfil_id uuid unique references public.perfiles (id) on delete set null,
  creado_en timestamptz not null default now()
);

comment on table public.jugadores is 'Ficha de cada jugador de la plantilla.';
comment on column public.jugadores.foto is
  'Ruta en Supabase Storage. Sin usar en la beta (fuera de alcance).';

-- El dorsal es único entre los jugadores que no estén de baja: uno dado de
-- baja puede dejar su dorsal libre para otro sin tener que cambiarlo a mano.
create unique index jugadores_dorsal_activo_idx
  on public.jugadores (dorsal)
  where estado <> 'baja';

create index jugadores_perfil_id_idx on public.jugadores (perfil_id);

alter table public.jugadores enable row level security;

-- Id del jugador vinculado a la cuenta autenticada, o null si no lo está.
create function public.mi_jugador_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.jugadores where perfil_id = auth.uid();
$$;

comment on function public.mi_jugador_id() is
  'Id de jugadores de la cuenta autenticada, o null si no está vinculada.';

-- Puede leer datos del equipo: el entrenador, o un jugador ya vinculado a
-- una ficha. Una cuenta de jugador sin vincular no ve nada todavía.
create function public.tiene_acceso()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.es_entrenador() or public.mi_jugador_id() is not null;
$$;

comment on function public.tiene_acceso() is
  'True para el entrenador y para un jugador ya vinculado a su ficha.';

-- El entrenador gestiona la plantilla por completo.
create policy "jugadores_entrenador_todo"
  on public.jugadores for all
  using (public.es_entrenador())
  with check (public.es_entrenador());

-- Un jugador ve su propia ficha completa (incluye teléfono y fecha de
-- nacimiento). Los datos básicos del resto de la plantilla se sirven por
-- separado, a través de la vista jugadores_roster.
create policy "jugadores_leer_propio"
  on public.jugadores for select
  using (perfil_id = auth.uid());

-- Datos de la plantilla visibles para todo el equipo: sin teléfono ni
-- fecha de nacimiento, que son solo del entrenador y del propio jugador.
--
-- Es una vista normal (no "security_invoker"), así que se ejecuta con los
-- permisos del rol que la crea (postgres, que salta la RLS de la tabla).
-- Por eso el filtro de acceso va en el "where" de la propia vista.
create view public.jugadores_roster
  with (security_invoker = false)
  as
  select id, nombre, apellidos, dorsal, posicion, estado, foto
  from public.jugadores
  where public.tiene_acceso();

comment on view public.jugadores_roster is
  'Datos públicos de la plantilla (sin teléfono ni fecha de nacimiento).';
