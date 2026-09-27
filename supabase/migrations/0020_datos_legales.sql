-- Datos del titular de la aplicación, para la política de privacidad y el
-- aviso legal. Se editan con el resto de la información del club.
alter table public.club
  add column titular_nombre text
    check (char_length(trim(titular_nombre)) between 1 and 120),
  add column titular_cif text check (titular_cif ~ '^[A-Z0-9]{9}$'),
  add column titular_domicilio text
    check (char_length(trim(titular_domicilio)) between 1 and 200),
  -- Dónde se ejercen los derechos de protección de datos.
  add column email_privacidad text
    check (email_privacidad ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- Los del club tal como figuran en su ficha de la Federación Galega de
-- Fútbol, confirmados por el club para esto.
update public.club
set
  titular_nombre = 'Atlético Trelle',
  titular_cif = 'G13688841',
  titular_domicilio = 'Lagar de Trelle, s/n (Local Social), 32920 Toén (Ourense)',
  email_privacidad = 'atleticotrelle@gmail.com';
