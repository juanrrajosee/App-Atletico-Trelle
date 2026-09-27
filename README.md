# App Atlético Trelle

Aplicación del Atlético Trelle para todo el pueblo: calendario y resultados, plantilla y estadísticas de los jugadores, votaciones de la afición, noticias, historia del club y tienda.

## Sobre el proyecto

Cualquiera puede abrir la aplicación y ver cuándo juega el equipo, cómo quedó el último partido o quién está en la plantilla, sin registrarse. La cuenta sirve para participar: cada aficionado vota una vez por categoría en cada partido (MVP, mejor suplente, jugador con más compromiso) y con esas votaciones se hacen los rankings de la temporada.

## Funcionalidades

| | Estado |
|---|---|
| Inicio con el próximo partido | Hecho |
| Plantilla pública (sin datos de salud) y su gestión por el administrador | Hecho |
| Cuentas de aficionado: registro con email confirmado o con Google, y recuperación de contraseña | Hecho |
| Calendario y resultados, con la edición del partido (resultado, alineación y estadísticas) | Fase 6 |
| Votaciones por partido y rankings por categoría | Fase 7 |
| Estadísticas públicas de los jugadores | Fase 8 |
| Noticias, historia del club y directiva, tienda (pedir presupuesto por teléfono) | Fases 9 a 11 |
| Parte de edición completa | Fase 12 |

## Tecnologías

| Capa | Herramienta |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Estilos | Tailwind CSS + shadcn/ui |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Almacenamiento | Supabase Storage (fotos, en fases posteriores) |
| Despliegue | Vercel |

## Roles

- **Aficionado** — cualquiera que se crea una cuenta. Ve lo mismo que sin cuenta y, además, podrá votar.
- **Administrador** — gestiona los datos del club (de momento, la plantilla).

Sin cuenta se puede consultar todo lo público. La base de datos lo impone con Row Level Security: el público solo lee, y únicamente el administrador escribe.

### Cuentas de usuario

**Crear una cuenta.** Cualquiera se registra desde la aplicación (*Entrar → Crear cuenta*): con email y contraseña (mínimo 8 caracteres), que hay que confirmar desde el enlace que llega por email, o con *Continuar con Google* si está activado. Toda cuenta nueva es de aficionado.

**Hacer administrador a una cuenta.** Se hace por SQL, desde el *SQL Editor* del panel de Supabase, nunca desde la aplicación (así nadie puede concederse a sí mismo más permisos):

```sql
update perfiles set rol = 'administrador'
where id = (select id from auth.users where email = 'correo@ejemplo.com');
```

**Contraseña olvidada.** Desde *Entrar → ¿Has olvidado tu contraseña?* llega un enlace por email para elegir una nueva.

**En local**, los emails no salen a internet: los recoge Mailpit en `http://127.0.0.1:54324`, donde se pueden abrir los enlaces.

### Configuración del proyecto de Supabase real

Cuando se despliegue, en el panel de Supabase (apartado *Authentication*):

1. **URL del sitio y de retorno**: la dirección pública de la aplicación como *Site URL*, y esa misma dirección con `/**` en las *Redirect URLs*.
2. **Servidor de correo (SMTP)**: el que trae Supabase de serie solo envía a los miembros del propio proyecto, así que para que los aficionados reciban la confirmación y la recuperación de contraseña hace falta uno propio (hay servicios gratuitos para este volumen).
3. **Plantillas de email**: copiar el contenido de `supabase/templates/confirmacion.html` y `supabase/templates/recuperacion.html` en las plantillas de *Confirm signup* y *Reset password*, con los asuntos que figuran en `supabase/config.toml`.
4. **Confirmación de email** activada y **registro** permitido.
5. **Google** (opcional): crear unas credenciales OAuth de tipo *aplicación web* en Google Cloud Console, con `https://<tu-proyecto>.supabase.co/auth/v1/callback` como URI de redirección autorizada, y pegar el *Client ID* y el *Client Secret* en el proveedor de Google de Supabase. El botón aparece solo en cuanto el proveedor está activado.

Para probar Google en local: poner `enabled = true` en `[auth.external.google]` de `supabase/config.toml`, definir `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` y `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` antes de `npm run db:iniciar`, y añadir `http://127.0.0.1:54321/auth/v1/callback` como URI autorizada en Google. Las credenciales **nunca** se suben al repositorio.

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

La aplicación queda disponible en `http://localhost:3000`.

### Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

En local, las muestra `npm run db:iniciar` (o `npx supabase status`). En un proyecto remoto están en el panel de Supabase, en *Project Settings → API Keys*. La clave *publishable* es pública: los permisos los controla Row Level Security en la base de datos. La aplicación no usa la clave `service_role` / *secret*, que **nunca** debe subirse al repositorio ni exponerse en el cliente.

### Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | Comprobación de tipos (TypeScript) |
| `npm run db:iniciar` / `db:parar` | Arranca / para Supabase en local |
| `npm run db:reset` | Recrea la base de datos local aplicando todas las migraciones |
| `npm run db:test` | Tests de la base de datos (políticas RLS) |
| `npm run db:tipos` | Genera `src/types/database.ts` a partir del esquema local |

## Estructura del proyecto

```
src/
├── app/                   # Rutas y páginas (App Router)
│   ├── (auth)/            # Entrar, crear cuenta, recuperar contraseña, Google
│   ├── (publico)/         # Parte pública: cabecera, navegación inferior e inicio
│   │   └── plantilla/     # Plantilla pública, y alta, edición y baja (administrador)
│   └── auth/              # Vuelta de los enlaces de email y de Google
├── components/
│   ├── plantilla/         # Piezas compartidas de la plantilla (etiqueta de estado)
│   ├── ui/                # Componentes de shadcn/ui
│   └── navegacion-inferior.tsx
├── lib/
│   ├── auth.ts            # Usuario actual y comprobación de administrador
│   ├── fechas.ts          # Fechas siempre en hora de España
│   ├── plantilla.ts       # Posiciones y estados: textos en español y colores
│   ├── supabase/          # Clientes de Supabase y proveedores de acceso
│   └── utils.ts           # Función cn() que usan los componentes de shadcn/ui
├── types/
│   └── database.ts        # Tipos generados desde el esquema (no editar a mano)
└── proxy.ts               # Refresca la sesión en cada petición
supabase/
├── config.toml            # Configuración de Supabase en local
├── migrations/            # Esquema de la base de datos, en SQL numerado
├── templates/             # Emails de confirmación y recuperación, en español
└── tests/                 # Tests de las políticas RLS
```

Las escrituras se hacen con Server Actions usando la sesión del usuario, así que todas pasan por Row Level Security.

## Estado

En desarrollo. Primera versión prevista para la temporada 2026/27.

## Licencia

Proyecto personal sin ánimo de lucro para uso del club.
