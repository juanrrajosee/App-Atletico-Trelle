-- Tests de los límites de intentos (migración 0025).
begin;

select plan(16);

-- Huellas de prueba (64 caracteres hexadecimales, como un SHA-256).
\set clave_a '''aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'''
\set clave_b '''bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'''

-- Cada test parte de la tabla vacía; el rollback del final la deja como
-- estaba.
delete from privado.intentos;

-- Sin sesión, como llama el servidor de la aplicación a quien aún no ha
-- entrado.
set local role anon;
set local request.jwt.claim.sub = '';

select is(public.intentos_agotados('entrar_email', :clave_a), false,
  'al principio quedan intentos');

select lives_ok(
  $$ select public.apuntar_intento('entrar_email', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa') $$,
  'sin cuenta se puede apuntar un intento'
);

select lives_ok(
  $$ select public.apuntar_intento('entrar_email', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
     from generate_series(1, 8) $$,
  'y varios seguidos'
);

select is(public.intentos_agotados('entrar_email', :clave_a), false,
  'con 9 contraseñas equivocadas aún queda un intento');

select public.apuntar_intento('entrar_email', :clave_a);

select is(public.intentos_agotados('entrar_email', :clave_a), true,
  'con 10 se agotan los intentos de ese email');

select is(public.intentos_agotados('entrar_email', :clave_b), false,
  'los de otro email no cuentan');

select is(public.intentos_agotados('entrar_ip', :clave_a), false,
  'ni los de otra acción con la misma huella');

select throws_ok(
  $$ select * from privado.intentos $$,
  '42501', null,
  'desde fuera no se puede leer la tabla de intentos'
);

select throws_ok(
  $$ delete from privado.intentos $$,
  '42501', null,
  'ni borrarla para saltarse el límite'
);

select throws_ok(
  $$ select public.apuntar_intento('entrar_email', 'pepe@example.com') $$,
  '22023', null,
  'no se guarda un email o una IP tal cual: solo huellas'
);

select throws_ok(
  $$ select public.intentos_agotados('lo_que_sea', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa') $$,
  '22023', null,
  'una acción desconocida da error'
);

select throws_ok(
  $$ select privado.limite_de('entrar_email') $$,
  '42501', null,
  'quien llama no puede consultar ni cambiar los límites'
);

reset role;

-- Los intentos viejos dejan de contar: se pasan los de antes a hace 16
-- minutos (la ventana de entrar es de 15).
update privado.intentos set creado_en = now() - interval '16 minutes';

select is(public.intentos_agotados('entrar_email', :clave_a), false,
  'pasado el rato, se puede volver a intentar');

-- Otros límites: 3 emails de recuperación por hora para un mismo email.
select public.apuntar_intento('recuperar_email', :clave_b) from generate_series(1, 3);

select is(public.intentos_agotados('recuperar_email', :clave_b), true,
  'como mucho 3 emails de recuperación por hora a un mismo email');

-- Limpieza: al apuntar un intento se borran los de hace más de un día.
update privado.intentos set creado_en = now() - interval '2 days'
  where accion = 'recuperar_email';
select public.apuntar_intento('registro_ip', :clave_a);

select is(
  (select count(*)::int from privado.intentos where accion = 'recuperar_email'),
  0,
  'los intentos de hace más de un día se borran'
);

select is(
  (select count(*)::int from privado.intentos where accion = 'registro_ip'),
  1,
  'y el nuevo queda apuntado'
);

select * from finish();
rollback;
