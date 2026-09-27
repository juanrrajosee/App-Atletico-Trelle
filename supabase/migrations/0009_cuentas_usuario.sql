-- Cuentas de usuario para que el entrenador las vincule a una ficha.
--
-- El email de cada cuenta vive en auth.users, que no está expuesto a la
-- aplicación. En lugar de copiarlo a "perfiles" (y tener que mantenerlo
-- sincronizado si cambia), esta función lo lee de auth.users y solo lo
-- devuelve al entrenador: para cualquier otra cuenta devuelve cero filas.

create function public.cuentas_usuario()
returns table (
  perfil_id uuid,
  email text,
  rol public.rol_usuario,
  jugador_id uuid
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, u.email::text, p.rol, j.id
  from public.perfiles p
  join auth.users u on u.id = p.id
  left join public.jugadores j on j.perfil_id = p.id
  where public.es_entrenador()
  order by u.email;
$$;

comment on function public.cuentas_usuario() is
  'Cuentas con su email y la ficha vinculada. Solo devuelve filas al entrenador.';

-- Sin sesión no tiene sentido llamarla.
revoke execute on function public.cuentas_usuario() from public, anon;
