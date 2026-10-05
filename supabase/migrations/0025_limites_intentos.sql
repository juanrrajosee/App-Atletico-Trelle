-- Límites de intentos: cuántas veces se puede intentar entrar, crear una
-- cuenta o pedir el email para recuperar la contraseña, desde una misma
-- dirección (IP) o para un mismo email, en un rato.
--
-- Supabase tiene sus propios límites por IP, pero la aplicación habla con él
-- desde su servidor, así que Supabase ve la dirección del servidor y no la de
-- cada persona. Estos límites los aplica la aplicación con la dirección real.
--
-- No se guarda ni la IP ni el email: solo su huella (SHA-256), y un día como
-- mucho.

-- Esquema que la API no publica: desde fuera no se puede leer ni escribir.
create schema privado;

create table privado.intentos (
  id bigint generated always as identity primary key,
  -- Qué se intenta y contra qué: "entrar_email", "registro_ip"…
  accion text not null,
  -- Huella de la IP o del email.
  clave text not null,
  creado_en timestamptz not null default now()
);

comment on table privado.intentos is
  'Intentos recientes de entrar, registrarse y recuperar la contraseña (huellas, un día como mucho).';

create index intentos_accion_clave_idx
  on privado.intentos (accion, clave, creado_en);
create index intentos_creado_en_idx on privado.intentos (creado_en);

-- Sin políticas: nadie la toca salvo las funciones de abajo.
alter table privado.intentos enable row level security;

-- Cuántos intentos caben y en cuánto tiempo, para cada acción. Los fija la
-- base de datos: quien llama no puede elegirlos.
create function privado.limite_de(
  p_accion text,
  out maximo integer,
  out ventana interval
)
language plpgsql
immutable
set search_path = ''
as $$
begin
  case p_accion
    -- Contraseñas equivocadas para un mismo email, y desde una misma IP.
    when 'entrar_email' then maximo := 10; ventana := interval '15 minutes';
    when 'entrar_ip' then maximo := 30; ventana := interval '15 minutes';
    -- Cuentas nuevas desde una misma IP.
    when 'registro_ip' then maximo := 10; ventana := interval '1 hour';
    -- Emails para recuperar la contraseña.
    when 'recuperar_email' then maximo := 3; ventana := interval '1 hour';
    when 'recuperar_ip' then maximo := 10; ventana := interval '1 hour';
    else
      raise exception 'Acción desconocida: %', p_accion using errcode = '22023';
  end case;
end;
$$;

-- Que la clave sea una huella SHA-256 (64 caracteres hexadecimales): así
-- nunca se guarda una IP o un email tal cual, y nadie llena la tabla de texto.
create function privado.comprobar_clave(p_clave text)
returns void
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_clave is null or p_clave !~ '^[0-9a-f]{64}$' then
    raise exception 'La clave tiene que ser una huella SHA-256.' using errcode = '22023';
  end if;
end;
$$;

-- Si ya se han agotado los intentos de esa acción para esa clave.
create function public.intentos_agotados(p_accion text, p_clave text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_limite record;
  v_recientes integer;
begin
  perform privado.comprobar_clave(p_clave);
  select * into v_limite from privado.limite_de(p_accion);

  select count(*) into v_recientes
  from privado.intentos
  where accion = p_accion
    and clave = p_clave
    and creado_en > now() - v_limite.ventana;

  return v_recientes >= v_limite.maximo;
end;
$$;

comment on function public.intentos_agotados(text, text) is
  'Si se han agotado los intentos de una acción para una huella de IP o de email.';

-- Apunta un intento, y de paso borra los de hace más de un día.
create function public.apuntar_intento(p_accion text, p_clave text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform privado.comprobar_clave(p_clave);
  perform privado.limite_de(p_accion);

  delete from privado.intentos where creado_en < now() - interval '1 day';

  insert into privado.intentos (accion, clave) values (p_accion, p_clave);
end;
$$;

comment on function public.apuntar_intento(text, text) is
  'Apunta un intento de una acción para una huella de IP o de email.';

-- Las llama el servidor de la aplicación, con o sin sesión.
revoke execute on function public.intentos_agotados(text, text) from public;
revoke execute on function public.apuntar_intento(text, text) from public;
grant execute on function public.intentos_agotados(text, text) to anon, authenticated;
grant execute on function public.apuntar_intento(text, text) to anon, authenticated;

revoke execute on function privado.limite_de(text) from public;
revoke execute on function privado.comprobar_clave(text) from public;
