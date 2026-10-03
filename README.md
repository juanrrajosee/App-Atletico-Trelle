# App Atlético Trelle

Aplicación del Atlético Trelle para todo el pueblo: calendario y resultados, plantilla y estadísticas de los jugadores, votaciones de la afición, noticias, historia del club y tienda.

## Sobre el proyecto

Cualquiera puede abrir la aplicación y ver cuándo juega el equipo, cómo quedó el último partido o quién está en la plantilla, sin registrarse. La cuenta sirve para participar: cada aficionado vota una vez por categoría en cada partido (MVP, mejor suplente, jugador con más compromiso) y con esas votaciones se hacen los rankings de la temporada.

## Funcionalidades

| | Estado |
|---|---|
| Inicio con el próximo partido y el último resultado | Hecho |
| Plantilla pública (sin datos de salud) y su gestión por el administrador | Hecho |
| Cuentas de aficionado: registro con email confirmado o con Google, y recuperación de contraseña | Hecho |
| Calendario y resultados, con la edición del partido (resultado, alineación y estadísticas) | Hecho |
| Votaciones por partido y rankings por categoría | Hecho |
| Estadísticas de la temporada: balance del equipo, clasificaciones y ficha de cada jugador | Hecho |
| Noticias, con borradores, y su escritura por el administrador | Hecho |
| El club: historia, la de Trelle, directiva y contacto, y su edición por el administrador | Hecho |
| Tienda con fotos: pedir presupuesto por WhatsApp o por teléfono | Hecho |
| Panel de gestión del administrador con lo que falta por hacer | Hecho |
| Mi cuenta: cambiar la contraseña, salir y borrar la cuenta | Hecho |
| Política de privacidad y aviso legal (borrador, por revisar) | Hecho |
| Importación de los datos de la FGF | Pendiente de su autorización |

## Tecnologías

| Capa | Herramienta |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Estilos | Tailwind CSS + shadcn/ui |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Almacenamiento | Supabase Storage (fotos de la tienda) |
| Despliegue | Vercel |

## Roles

- **Aficionado** — cualquiera que se crea una cuenta. Ve lo mismo que sin cuenta y, además, vota después de cada partido.
- **Administrador** — gestiona los datos del club: la plantilla, los partidos (calendario, resultados y alineaciones), las noticias, la sección del club y la tienda.

Sin cuenta se puede consultar todo lo público. La base de datos lo impone con Row Level Security: el público solo lee, y únicamente el administrador escribe.

### Cuentas de usuario

**Crear una cuenta.** Cualquiera se registra desde la aplicación (*Entrar → Crear cuenta*): con email y contraseña (mínimo 8 caracteres), que hay que confirmar desde el enlace que llega por email, o con *Continuar con Google* si está activado. Toda cuenta nueva es de aficionado.

**Hacer administrador a una cuenta.** Se hace por SQL, desde el *SQL Editor* del panel de Supabase, nunca desde la aplicación (así nadie puede concederse a sí mismo más permisos):

```sql
update perfiles set rol = 'administrador'
where id = (select id from auth.users where email = 'correo@ejemplo.com');
```

**Contraseña olvidada.** Desde *Entrar → ¿Has olvidado tu contraseña?* llega un enlace por email para elegir una nueva.

**Mi cuenta.** Con la sesión iniciada, *Mi cuenta* (arriba a la derecha) enseña el email y deja cambiar la contraseña, salir y **borrar la cuenta**. Al borrarla desaparecen la cuenta y el perfil; los votos siguen contando en los resultados, pero sin dueño. Una cuenta de administrador no se puede borrar desde la aplicación, para no dejar el club sin nadie que lo gestione.

**En local**, los emails no salen a internet: los recoge Mailpit en `http://127.0.0.1:54324`, donde se pueden abrir los enlaces.

### Plantilla

El administrador da de alta a cada jugador desde *Equipo → Plantilla → Añadir*: nombre, apellidos, **apodo** (opcional), dorsal, posición y estado. Si tiene apodo, la aplicación le llama así en todas partes (plantilla, partidos, votaciones y estadísticas), con el nombre completo debajo en la plantilla y en su ficha. El dorsal no se puede repetir entre los que están en la plantilla. El estado (lesionado, sancionado) solo lo ve el administrador: es un dato de salud y no se publica.

### Partidos

El administrador lo hace todo desde la propia aplicación, en *Partidos*:

1. **Añadir el partido** al calendario (*Añadir*): rival, fecha y hora, en casa o fuera y, si se quiere, el campo y la competición. Las horas se escriben y se muestran siempre en hora de España.
2. **Poner el resultado** cuando se ha jugado (*Editar partido*): el estado pasa a *Jugado* y se piden los goles. Un partido que aún no ha empezado no puede estar jugado. Si se aplaza, se marca como *Aplazado*.
3. **Registrar la alineación** (*Alineación y estadísticas*): cada jugador como titular, suplente o no convocado y, de los convocados, los minutos, los goles, las asistencias y las tarjetas. Se guarda entera de una vez.

La base de datos cuida de que todo cuadre: un partido jugado tiene siempre los dos goles y uno sin jugar ninguno; los goles de los jugadores no pueden pasar de los del equipo (pueden quedarse por debajo, por ejemplo con un gol en propia puerta del rival); y a un partido con alineación no se le puede quitar el resultado: antes hay que borrarla (dejando a todos como no convocados).

Borrar un partido borra también su alineación y sus estadísticas.

### Votaciones

Después de cada partido, la afición vota en tres categorías:

| Categoría | A quién se puede votar |
|---|---|
| MVP del partido | A los que jugaron |
| Mejor suplente | A los suplentes que salieron al campo |
| Jugador con más compromiso | A todos los convocados |

- **Cuándo:** la votación se abre en cuanto el partido está jugado y tiene la alineación registrada, y dura 24 horas desde que se registró la alineación por primera vez (corregirla después no la alarga). Un partido de hace más de 7 días no abre votación aunque se le registre ahora la alineación, para que meter partidos antiguos no abra votaciones de golpe.
- **Quién:** cualquiera con cuenta, un voto por categoría y partido, que no se puede cambiar. Sin cuenta, la ficha del partido invita a entrar y, al hacerlo, se vuelve al partido.
- **Resultados:** mientras está abierta nadie ve cómo va. Al cerrarse, la ficha del partido enseña el recuento y quién ha ganado (con empate, ganan todos los empatados).
- **Ranking:** en *Votaciones*, por temporada (del 1 de julio al 30 de junio) y categoría: cuántas veces ha ganado cada jugador y, para desempatar, cuántos votos suma.
- **Privacidad:** nadie, tampoco el administrador, puede ver a quién ha votado cada cuenta: solo se publican los totales. Si se borra una cuenta, sus votos siguen contando, ya sin dueño.

Todas estas reglas las impone la base de datos, no solo la pantalla.

### Estadísticas

Salen solas de los resultados y de las alineaciones que registra el administrador; no hay que meter nada más. Van por temporada (del 1 de julio al 30 de junio), y en cada pantalla se puede pasar a las anteriores, desde la 2023/24.

- **Estadísticas:** el balance del equipo (partidos, victorias, empates, derrotas y goles) y las clasificaciones de goleadores, asistencias, minutos, partidos jugados y tarjetas.
- **Ficha de cada jugador:** sus convocatorias, partidos jugados, titularidades, minutos, goles, asistencias y tarjetas, lo que ha ganado en las votaciones y la lista de sus partidos.

Solo cuentan los partidos jugados. Un jugador está *convocado* si figura en la alineación, y ha *jugado* si fue titular o salió desde el banquillo. Los jugadores dados de baja conservan su historial.

### Noticias

El administrador las escribe desde *Noticias → Nueva*: título, un resumen opcional (para la lista y para la vista previa al compartir el enlace; si no hay, se usa el principio del texto) y el texto, con los párrafos separados por una línea en blanco. Puede llevar una **foto de portada** opcional: como en la tienda, se reduce en el móvil antes de subirla y se guarda en el bucket público `noticias` (migración `0023_fotos_noticias.sql`), donde solo el administrador sube y borra. Sale arriba en la noticia, en la destacada, como miniatura en las listas y en la vista previa al compartir el enlace. Al cambiarla, quitarla o borrar la noticia, la anterior se borra.

Una noticia se guarda como *borrador* (solo la ve el administrador) o *publicada*. Al publicarla se le pone la fecha de ese momento, que no cambia aunque se edite después. En *Noticias*, la más reciente sale destacada arriba; el inicio enseña las tres últimas publicadas.

### El club

La sección *Club* enseña la historia del club, la de Trelle, la directiva y el contacto (teléfono y email que se pueden pulsar, y el campo). El administrador lo rellena todo desde la propia sección: *Editar historia y contacto* para los textos y el contacto, y *Añadir* (o tocar a una persona) para la directiva, con su cargo y su posición en la lista. Lo que no se ha escrito no sale.

La directiva son datos de personas que se publican: se añade solo a quien esté de acuerdo.

### Tienda

Dentro de *Club*, en la pestaña *Tienda*. Los productos no se compran en la aplicación: cada uno tiene los botones *Por WhatsApp* (con un mensaje ya escrito: «Hola, me interesa … ¿Me podéis dar presupuesto?») y *Llamar*, los dos al teléfono del club que se pone en *Club → Editar historia y contacto*. Sin ese teléfono no salen los botones.

El administrador añade productos desde *Tienda → Añadir*: foto, nombre, descripción, precio orientativo (opcional; si no se pone, no se enseña), posición en la tienda y si se ve. Un producto agotado se puede ocultar en vez de borrarlo.

La foto se hace o se elige desde el móvil y **se reduce en el propio móvil** (1600 píxeles por el lado largo, en JPEG) antes de subirla, así pesa unos cientos de KB en lugar de varios MB. Se guarda en el bucket público `productos` de Supabase Storage, que crea la migración `0018_tienda.sql`: cualquiera ve las fotos, pero solo el administrador las sube y las borra. Al cambiar la foto, quitarla o borrar el producto, la anterior se borra.

### Gestión

El administrador ve *Gestión* en la cabecera. Lleva a un panel con atajos para añadir un partido, una noticia o un producto, la votación abierta si la hay, y lo pendiente: partidos cuya hora ya pasó y siguen sin resultado, partidos jugados sin alineación (sin ella no hay votación ni estadísticas), lo que falta en la sección del club y lo que está sin publicar. Cada aviso lleva a donde se arregla.

### Privacidad y aviso legal

Las páginas *Privacidad* y *Aviso legal* se enlazan en el pie de todas las pantallas y en el registro. Explican qué datos personales trata la aplicación, para qué, quién más los trata (Supabase, Vercel, el servicio de correo y, si se usa, Google) y cómo ejercer los derechos. Como responsable aparecen los datos legales del club (nombre, CIF, domicilio y email de privacidad), que se editan en *Club → Editar historia y contacto*; se cargaron con los de su ficha en la FGF.

Los textos son un **borrador** redactado para esta aplicación: antes de abrirla al público conviene que los revise alguien que conozca la normativa de protección de datos.

### Navegación

La barra de abajo tiene *Inicio*, *Partidos*, *Noticias*, *Equipo* y *Club*. *Equipo* reúne con pestañas la plantilla, las estadísticas y las votaciones, y *Club* la información del club y la tienda. En un móvil caben cómodamente cinco secciones, así que lo que venga se agrupa igual.

### Datos de la Federación Galega de Fútbol (FGF)

La web de la FGF publica el calendario, los resultados y las actas de los partidos del Trelle, pero su [aviso legal](https://www.futgal.es/pnfg/NNws_ShwNewDup?codigo=15023&cod_primaria=140&cod_secundaria=140) solo permite un uso particular: copiar o publicar sus contenidos requiere su autorización previa y por escrito. Además, la web oculta los marcadores a los programas que la leen. Por eso la aplicación no la importa: los datos se meten a mano, y la importación queda pendiente de pedirle permiso a la FGF.

## Puesta en marcha

Requisitos: Node.js 20 o superior y Docker (para levantar Supabase en local).

```bash
# Clonar el repositorio
git clone https://github.com/juanrrajosee/App-Atletico-Trelle.git
cd App-Atletico-Trelle

# Instalar dependencias (incluye la CLI de Supabase)
npm install

# Levantar Supabase en local; al terminar muestra la URL y las claves
npm run db:iniciar

# Configurar las variables de entorno con esos valores
cp .env.example .env.local

# Levantar el entorno de desarrollo
npm run dev
```

La aplicación queda disponible en `http://localhost:3000`. En desarrollo, ábrela con `localhost` y no con `127.0.0.1`: Next.js solo le sirve a `localhost` el JavaScript de las páginas, y con la otra dirección los botones que abren diálogos o cambian el formulario no responden.

### Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

En local, las muestra `npm run db:iniciar` (o `npx supabase status`). En un proyecto remoto están en el panel de Supabase, en *Project Settings → API Keys*. La clave *publishable* es pública: los permisos los controla Row Level Security en la base de datos. La aplicación no usa la clave `service_role` / *secret*, que **nunca** debe subirse al repositorio ni exponerse en el cliente.

Para probar *Continuar con Google* en local: poner `enabled = true` en `[auth.external.google]` de `supabase/config.toml`, definir `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` y `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` antes de `npm run db:iniciar`, y añadir `http://127.0.0.1:54321/auth/v1/callback` como URI autorizada en Google. Las credenciales **nunca** se suben al repositorio.

### Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | Comprobación de tipos (TypeScript) |
| `npm run db:iniciar` / `db:parar` | Arranca / para Supabase en local |
| `npm run db:reset` | Recrea la base de datos local aplicando todas las migraciones |
| `npm run db:test` | Tests de la base de datos (políticas RLS, reglas de los resultados, votaciones, estadísticas, noticias y sus fotos, club, tienda, apodos y borrado de cuentas) |
| `npm run db:tipos` | Genera `src/types/database.ts` a partir del esquema local |

## Publicar la aplicación

La aplicación se publica en dos servicios con plan gratuito suficiente para un club: **Supabase** (base de datos, cuentas y fotos) y **Vercel** (la aplicación web). Hay que hacerlo con las cuentas del club; ninguna clave se sube al repositorio.

### 1. Supabase

1. Crear una cuenta en [supabase.com](https://supabase.com) y un **proyecto nuevo** en una región de la Unión Europea (por ejemplo, *Central EU (Frankfurt)*). Guardar bien la contraseña de la base de datos.
2. **Crear la base de datos** desde este repositorio, con la CLI que ya instala `npm install`:
   ```bash
   npx supabase login
   npx supabase link --project-ref <referencia-del-proyecto>
   npx supabase db push
   ```
   La referencia es la parte de la dirección del proyecto: `https://<referencia>.supabase.co`. `db push` aplica todas las migraciones de `supabase/migrations/`: tablas, permisos (RLS), funciones, los buckets de fotos de la tienda y de las noticias y los datos legales del club.
3. En *Authentication → URL Configuration*: la dirección pública de la aplicación (la de Vercel, paso 2) como *Site URL*, y esa misma dirección con `/**` en *Redirect URLs*.
4. En *Authentication → Emails*:
   - **Servidor de correo (SMTP)** propio. El que trae Supabase de serie solo envía a los miembros del proyecto, así que sin uno propio los aficionados no reciben los emails de confirmación ni de cambio de contraseña. Hay servicios con plan gratuito de sobra para este volumen.
   - **Plantillas**: copiar `supabase/templates/confirmacion.html` en *Confirm signup* y `supabase/templates/recuperacion.html` en *Reset password*, con los asuntos que figuran en `supabase/config.toml`.
5. En *Authentication → Sign In / Providers*: registro permitido y confirmación de email activada (así vienen por defecto).
6. **Google** (opcional): crear unas credenciales OAuth de tipo *aplicación web* en Google Cloud Console, con `https://<referencia>.supabase.co/auth/v1/callback` como URI de redirección autorizada, y pegar el *Client ID* y el *Client Secret* en el proveedor de Google de Supabase. El botón aparece solo en cuanto el proveedor está activado.
7. En *Project Settings → API Keys*, apuntar la **URL del proyecto** y la clave **publishable** para Vercel.

### 2. Vercel

1. Crear una cuenta en [vercel.com](https://vercel.com) entrando con GitHub.
2. *Add New → Project* e importar el repositorio `App-Atletico-Trelle`. Vercel reconoce que es Next.js; no hay que cambiar nada de la compilación.
3. En *Environment Variables*, añadir `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` con los valores del paso 1.7.
4. *Deploy*. Vercel publica la rama principal del repositorio (`main`), así que el trabajo tiene que estar en ella. Al terminar da una dirección `https://<nombre>.vercel.app`, que es la que va en el paso 1.3. Más adelante se puede poner un dominio propio en *Settings → Domains* (y cambiarlo también en Supabase).
5. Opcional pero recomendable: en *Settings → Functions*, elegir una región europea (por ejemplo, Fráncfort) para que la aplicación esté cerca de la base de datos.

Cada vez que se sube un cambio a `main`, Vercel vuelve a publicar la aplicación sola. Si el cambio trae migraciones nuevas, hay que aplicarlas también con `npx supabase db push`.

### 3. Antes de abrirla al público

1. Crear la cuenta del administrador desde la propia aplicación (*Entrar → Crear cuenta*) y hacerla administradora con el SQL de [Cuentas de usuario](#cuentas-de-usuario), desde el *SQL Editor* de Supabase.
2. Rellenar lo básico desde *Gestión*: el teléfono y la información del club, la directiva, la plantilla y el calendario.
3. Tener la conformidad de los jugadores y de la directiva para que salgan en la aplicación.
4. Revisar los textos de *Privacidad* y *Aviso legal*.
5. Probar de principio a fin con un móvil: crear una cuenta con un email de verdad (que llegue la confirmación), votar y borrar la cuenta.

## Estructura del proyecto

```
src/
├── app/                   # Rutas y páginas (App Router)
│   ├── (auth)/            # Entrar, crear cuenta, recuperar contraseña, Google
│   ├── (publico)/         # Parte pública: cabecera, navegación inferior, pie e inicio
│   │   ├── administracion/ # Panel de gestión (administrador)
│   │   ├── aviso-legal/   # Aviso legal
│   │   ├── club/          # Historia, directiva, contacto y datos legales, y su edición (administrador)
│   │   ├── cuenta/        # Mi cuenta: contraseña, salir y borrar la cuenta
│   │   ├── estadisticas/  # Balance del equipo y clasificaciones de la temporada
│   │   ├── noticias/      # Noticias, y su escritura y publicación (administrador)
│   │   ├── partidos/      # Calendario y resultados, y alta, edición y alineación (administrador)
│   │   ├── plantilla/     # Plantilla y ficha de cada jugador con sus estadísticas; alta, edición y baja (administrador)
│   │   ├── privacidad/    # Política de privacidad
│   │   ├── tienda/        # Productos y pedir presupuesto, y su gestión con fotos (administrador)
│   │   └── votaciones/    # Votar, resultados y ranking de la temporada
│   └── auth/              # Vuelta de los enlaces de email y de Google
├── components/
│   ├── noticias/          # Lista de noticias
│   ├── partidos/          # Marcador, tarjeta, lista y etiqueta de los partidos
│   ├── plantilla/         # Piezas compartidas de la plantilla (etiqueta de estado)
│   ├── tienda/            # Foto de un producto
│   ├── ui/                # Componentes de shadcn/ui
│   ├── votaciones/        # Formulario de voto y aviso de votación abierta
│   ├── boton-borrar.tsx   # Botón de borrar con confirmación
│   ├── campo-formulario.tsx
│   ├── clasificacion.tsx  # Lista de jugadores con puestos (y empates)
│   ├── navegacion.tsx     # Secciones: abajo en el móvil, en la cabecera en el ordenador
│   ├── pagina-legal.tsx   # Piezas de las páginas de privacidad y aviso legal
│   ├── pestanas.tsx       # Pestañas de Equipo y de Club
│   ├── selector-temporada.tsx
│   └── texto.tsx          # Texto escrito en la aplicación, en párrafos
├── lib/
│   ├── auth.ts            # Usuario actual y comprobación de administrador
│   ├── fechas.ts          # Fechas siempre en hora de España (y su paso a UTC)
│   ├── formularios.ts     # Estado común de los formularios
│   ├── fotos.ts           # Reducir una foto en el navegador antes de subirla
│   ├── ids.ts             # Comprobación de ids
│   ├── noticias.ts        # Borrador o publicada, párrafos y resumen
│   ├── partidos.ts        # Estados, local y visitante, victoria, empate o derrota
│   ├── plantilla.ts       # Posiciones y estados: textos en español y colores
│   ├── rutas.ts           # A qué página volver después de entrar
│   ├── supabase/          # Clientes de Supabase y proveedores de acceso
│   ├── temporadas.ts      # Qué temporada es y cómo se llama
│   ├── textos.ts          # Singular y plural ("1 gol", "3 goles") y párrafos
│   ├── tienda.ts          # Precios, dirección de las fotos y enlaces de WhatsApp y teléfono
│   ├── utils.ts           # Función cn() que usan los componentes de shadcn/ui
│   └── votaciones.ts      # Categorías y candidatos de las votaciones
├── types/
│   └── database.ts        # Tipos generados desde el esquema (no editar a mano)
└── proxy.ts               # Refresca la sesión en cada petición
supabase/
├── config.toml            # Configuración de Supabase en local
├── migrations/            # Esquema de la base de datos, en SQL numerado
├── templates/             # Emails de confirmación y recuperación, en español
└── tests/                 # Tests de la base de datos (pgTAP)
```

Las escrituras se hacen con Server Actions usando la sesión del usuario, así que todas pasan por Row Level Security. La alineación se guarda con la función `guardar_alineacion()` de la base de datos, que reemplaza la anterior en una sola transacción, y los votos con `votar()`.

## Estado

Beta completa, lista para publicarse siguiendo [Publicar la aplicación](#publicar-la-aplicación). Primera versión prevista para la temporada 2026/27.

## Licencia

Proyecto personal sin ánimo de lucro para uso del club.
