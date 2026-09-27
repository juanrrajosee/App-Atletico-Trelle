-- Cada aficionado puede borrar su propia cuenta desde la aplicación
-- (derecho de supresión del RGPD), sin tener que pedírselo al club.
--
-- Al borrar la cuenta se borra su perfil y sus votos se quedan sin dueño
-- (votos.perfil_id pasa a null): siguen contando en los resultados, pero
-- ya sin relación con nadie.
--
-- security definer: borrar de auth.users no lo puede hacer la cuenta por sí
-- misma. La función solo borra la cuenta de quien la llama.
create function public.borrar_mi_cuenta()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'No hay ninguna cuenta con la sesión iniciada.'
      using errcode = '42501';
  end if;

  -- Para no quedarse sin nadie que gestione el club por un despiste.
  if public.es_administrador() then
    raise exception 'Una cuenta de administrador no se puede borrar desde la aplicación.';
  end if;

  delete from auth.users where id = auth.uid();
end;
$$;

comment on function public.borrar_mi_cuenta() is
  'Borra la cuenta de quien la llama (salvo administradores); sus votos quedan sin dueño.';

revoke execute on function public.borrar_mi_cuenta() from public, anon;
