-- Roles nuevos: "aficionado" (cualquiera que se crea una cuenta para votar)
-- y "administrador" (quien gestiona los datos del club). Toda cuenta nueva
-- es de aficionado; el administrador se asigna a mano por SQL, nunca desde
-- la aplicación. Las cuentas de entrenador pasan a ser de administrador.

-- Todo lo que depende del rol antiguo.
drop policy "perfiles_leer_entrenador" on public.perfiles;
drop policy "jugadores_entrenador_todo" on public.jugadores;
drop policy "partidos_entrenador_todo" on public.partidos;
drop policy "estadisticas_partido_entrenador_todo" on public.estadisticas_partido;
drop function public.es_entrenador();

-- Postgres no permite quitar valores de un enum: se crea uno nuevo y se
-- pasa la columna a él.
alter type public.rol_usuario rename to rol_usuario_antiguo;
create type public.rol_usuario as enum ('aficionado', 'administrador');

alter table public.perfiles alter column rol drop default;
alter table public.perfiles
  alter column rol type public.rol_usuario
  using (
    case rol::text
      when 'entrenador' then 'administrador'
      else 'aficionado'
    end
  )::public.rol_usuario;
alter table public.perfiles alter column rol set default 'aficionado';

drop type public.rol_usuario_antiguo;

comment on table public.perfiles is
  'Un perfil por cuenta de auth.users. El rol administrador se asigna a mano por SQL.';

create function public.es_administrador()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol = 'administrador'
  );
$$;

comment on function public.es_administrador() is
  'True si la cuenta autenticada tiene rol administrador.';

create policy "perfiles_leer_administrador"
  on public.perfiles for select
  using (public.es_administrador());

create policy "jugadores_administrador_todo"
  on public.jugadores for all
  using (public.es_administrador())
  with check (public.es_administrador());

create policy "partidos_administrador_todo"
  on public.partidos for all
  using (public.es_administrador())
  with check (public.es_administrador());

create policy "estadisticas_partido_administrador_todo"
  on public.estadisticas_partido for all
  using (public.es_administrador())
  with check (public.es_administrador());
