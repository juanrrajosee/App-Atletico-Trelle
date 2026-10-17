-- Funciones internas de disparadores: nadie tiene que poder llamarlas desde
-- fuera.
--
-- Supabase da permiso de ejecución a todos los roles de la API sobre las
-- funciones nuevas del esquema public. Estas tres solo las usa Postgres, al
-- saltar un disparador, y para eso no hace falta ningún permiso de quien lanza
-- la operación (se comprueba al crear el disparador, y ya está creado). Con
-- este revoke dejan de aparecer como funciones de la API y de salir en el
-- Security Advisor de Supabase.
--
-- No se toca ninguna de las funciones que SÍ se llaman desde fuera: son las
-- de votar, guardar la alineación, los resultados públicos de las votaciones,
-- los límites de intentos, borrar la propia cuenta y es_administrador (que
-- usan las reglas de RLS).

-- Crea el perfil al registrarse alguien (security definer).
revoke execute on function public.gestionar_nuevo_usuario()
  from public, anon, authenticated;

-- Apunta cuándo se cambió por última vez una noticia o el club.
revoke execute on function public.marcar_actualizacion()
  from public, anon, authenticated;

-- Impide un resultado que no cuadra con la alineación registrada.
revoke execute on function public.comprobar_resultado_con_alineacion()
  from public, anon, authenticated;
