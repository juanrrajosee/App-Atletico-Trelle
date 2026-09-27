-- Noticias del club. Las escribe el administrador; cualquiera, con cuenta o
-- sin ella, lee las publicadas.

create table public.noticias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null check (char_length(trim(titulo)) between 1 and 120),
  -- Una o dos frases para la lista de noticias y la vista previa al
  -- compartirla. Si no hay, se usa el principio del texto.
  resumen text check (char_length(resumen) <= 300),
  -- Texto plano: los párrafos se separan con una línea en blanco.
  cuerpo text not null check (char_length(trim(cuerpo)) between 1 and 20000),
  -- null: borrador, solo lo ve el administrador. Con fecha: publicada desde
  -- ese momento (una fecha futura la deja programada).
  publicada_en timestamptz,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

comment on table public.noticias is
  'Noticias del club. Sin fecha de publicación son borradores.';

create index noticias_publicada_en_idx on public.noticias (publicada_en desc);

alter table public.noticias enable row level security;

create policy "noticias_leer_publicadas"
  on public.noticias for select
  using (publicada_en is not null and publicada_en <= now());

create policy "noticias_administrador_todo"
  on public.noticias for all
  using (public.es_administrador())
  with check (public.es_administrador());

-- Guarda cuándo se editó por última vez.
create function public.marcar_actualizacion()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

create trigger noticias_marcar_actualizacion
  before update on public.noticias
  for each row
  execute function public.marcar_actualizacion();
