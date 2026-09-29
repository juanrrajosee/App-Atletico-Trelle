-- Reglas de los resultados y guardado de la alineación de cada partido.

-- Un partido jugado tiene siempre los dos goles; uno programado o aplazado
-- no tiene ninguno. Así nunca hay un resultado a medias ni un marcador en un
-- partido que no se ha jugado.
alter table public.partidos
  add constraint partidos_resultado_coherente check (
    case
      when estado = 'jugado'
        then goles_favor is not null and goles_contra is not null
      else goles_favor is null and goles_contra is null
    end
  );

-- La alineación de un partido (quién jugó, de titular o suplente, y sus
-- estadísticas) se guarda entera de una vez: se borran las filas que
-- hubiera y se escriben las nuevas, todo en la misma transacción. Si algo
-- falla, no se queda a medias.
--
-- p_filas es un array JSON de objetos con: jugador_id, titular, minutos,
-- goles, asistencias, tarjetas_amarillas y tarjeta_roja. Un array vacío
-- borra la alineación.
--
-- security invoker: se ejecuta con los permisos de quien la llama, así que
-- RLS se aplica igual que en un insert normal. La comprobación de
-- administrador de arriba es para dar un error claro.
create function public.guardar_alineacion(p_partido_id uuid, p_filas jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_partido public.partidos;
  v_goles_jugadores integer;
begin
  if not public.es_administrador() then
    raise exception 'Solo el administrador puede guardar alineaciones.'
      using errcode = '42501';
  end if;

  select * into v_partido from public.partidos where id = p_partido_id;

  if not found then
    raise exception 'El partido no existe.' using errcode = 'P0002';
  end if;

  if v_partido.estado <> 'jugado' then
    raise exception 'Solo se puede guardar la alineación de un partido jugado.';
  end if;

  -- Los goles de los jugadores no pueden pasar de los del equipo (pueden
  -- quedarse por debajo: un gol en propia puerta del rival no es de nadie).
  select coalesce(sum(f.goles), 0) into v_goles_jugadores
  from jsonb_to_recordset(p_filas) as f(goles smallint);

  if v_goles_jugadores > v_partido.goles_favor then
    raise exception 'Los goles de los jugadores (%) pasan de los que marcó el Atlético Trelle (%).',
      v_goles_jugadores, v_partido.goles_favor;
  end if;

  delete from public.estadisticas_partido where partido_id = p_partido_id;

  insert into public.estadisticas_partido (
    partido_id, jugador_id, titular, minutos, goles, asistencias,
    tarjetas_amarillas, tarjeta_roja
  )
  select
    p_partido_id, f.jugador_id, f.titular, f.minutos, f.goles,
    f.asistencias, f.tarjetas_amarillas, f.tarjeta_roja
  from jsonb_to_recordset(p_filas) as f(
    jugador_id uuid,
    titular boolean,
    minutos smallint,
    goles smallint,
    asistencias smallint,
    tarjetas_amarillas smallint,
    tarjeta_roja boolean
  );
end;
$$;

comment on function public.guardar_alineacion(uuid, jsonb) is
  'Reemplaza de una vez la alineación y las estadísticas de un partido jugado.';

revoke execute on function public.guardar_alineacion(uuid, jsonb)
  from public, anon;

-- Lo mismo al revés: si el partido ya tiene alineación, no se le puede
-- quitar el resultado (dejaría estadísticas de un partido sin jugar) ni
-- bajar sus goles por debajo de los que suman sus jugadores.
--
-- Los mensajes de estos errores (código P0001) están pensados para
-- enseñárselos tal cual al administrador.
create function public.comprobar_resultado_con_alineacion()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_filas integer;
  v_goles_jugadores integer;
begin
  select count(*), coalesce(sum(goles), 0)
    into v_filas, v_goles_jugadores
  from public.estadisticas_partido
  where partido_id = new.id;

  if v_filas = 0 then
    return new;
  end if;

  if new.estado <> 'jugado' then
    raise exception 'Este partido tiene la alineación registrada. Bórrala antes de quitarle el resultado.';
  end if;

  if new.goles_favor < v_goles_jugadores then
    raise exception 'Los goles de los jugadores de este partido suman %: el Atlético Trelle no puede tener menos.',
      v_goles_jugadores;
  end if;

  return new;
end;
$$;

create trigger partidos_comprobar_resultado_con_alineacion
  before update of estado, goles_favor on public.partidos
  for each row
  execute function public.comprobar_resultado_con_alineacion();
