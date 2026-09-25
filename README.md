# App Atlético Trelle

Aplicación web para la gestión del Atlético Trelle: plantilla, calendario de partidos, convocatorias, asistencia a entrenamientos y estadísticas de jugadores.

## Sobre el proyecto

La idea es tener en un solo sitio todo lo que ahora mismo vive repartido entre grupos de WhatsApp, capturas de pantalla y la memoria del entrenador. El cuerpo técnico gestiona convocatorias y resultados desde el panel, y los jugadores consultan desde el móvil cuándo juegan, dónde y si están convocados.

Está pensada como PWA: se instala en el móvil desde el navegador y se usa como una app normal, sin pasar por ninguna tienda de aplicaciones.

## Funcionalidades

**Plantilla**
- Ficha de cada jugador: dorsal, posición, fecha de alta y foto
- Estado del jugador (disponible, lesionado, sancionado, baja)

**Calendario y partidos**
- Próximos partidos con rival, fecha, hora y campo
- Registro de resultados y goleadores
- Histórico de la temporada

**Convocatorias**
- El entrenador selecciona a los convocados para cada partido
- Los jugadores confirman o rechazan su disponibilidad
- Vista rápida de quién falta por responder

**Entrenamientos**
- Control de asistencia por sesión
- Porcentaje de asistencia por jugador a lo largo de la temporada

**Estadísticas**
- Partidos jugados, minutos, goles, asistencias y tarjetas
- Clasificación interna de la plantilla

## Tecnologías

| Capa | Herramienta |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Estilos | Tailwind CSS + shadcn/ui |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Almacenamiento | Supabase Storage (fotos de jugadores, escudo) |
| Despliegue | Vercel |

## Roles

- **Entrenador / cuerpo técnico** — acceso completo: gestiona plantilla, crea partidos, convoca, pasa lista y registra estadísticas.
- **Jugador** — consulta calendario y convocatorias, confirma disponibilidad y ve sus propias estadísticas.

### Cuentas de usuario

No hay registro público: la aplicación no tiene pantalla de alta y Supabase rechaza cualquier alta desde fuera. Las cuentas las crea el entrenador a mano y se las pasa a cada jugador por el canal que use ahora el equipo.

**Crear una cuenta.** En el panel de Supabase (en local, `http://127.0.0.1:54323`): *Authentication → Users → Add user → Create new user*, con email y contraseña (mínimo 8 caracteres) y marcando *Auto Confirm User*.

**Hacer entrenador a una cuenta.** Toda cuenta nueva empieza como `jugador`. El ascenso se hace por SQL, desde el *SQL Editor* del panel, nunca desde la aplicación (así nadie puede concederse a sí mismo más permisos):

```sql
update perfiles set rol = 'entrenador'
where id = (select id from auth.users where email = 'correo@ejemplo.com');
```

**Vincular la cuenta a su ficha.** Hasta que el entrenador no vincula una cuenta de jugador con su ficha (desde la propia aplicación, a partir de la fase 4), esa cuenta solo ve una pantalla de "cuenta pendiente" y no puede leer ningún dato del equipo.

**Contraseña olvidada.** La recuperación por email necesita un servidor de correo propio, que la beta no tiene. El entrenador pone una contraseña nueva desde el *SQL Editor* y se la pasa al jugador:

```sql
update auth.users
set encrypted_password = extensions.crypt('contraseña-nueva', extensions.gen_salt('bf'))
where email = 'correo@ejemplo.com';
```

**En el proyecto de Supabase real** (cuando se despliegue), hay que desactivar el registro en *Authentication → Sign In / Providers → Allow new users to sign up*, dejando activado el proveedor de email (si se desactiva, tampoco se puede iniciar sesión).

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
│   ├── (auth)/            # Pantalla de acceso y acciones de sesión
│   ├── (panel)/           # Zona privada: cabecera, navegación inferior e inicio
│   └── pendiente/         # Cuenta de jugador aún sin vincular a su ficha
├── components/
│   ├── ui/                # Componentes de shadcn/ui
│   └── navegacion-inferior.tsx
├── lib/
│   ├── auth.ts            # Usuario actual y comprobación de acceso
│   ├── fechas.ts          # Fechas siempre en hora de España
│   ├── supabase/          # Clientes de Supabase (servidor y proxy)
│   └── utils.ts           # Función cn() que usan los componentes de shadcn/ui
├── types/
│   └── database.ts        # Tipos generados desde el esquema (no editar a mano)
└── proxy.ts               # Refresca la sesión y manda a /acceso si no la hay
supabase/
├── config.toml            # Configuración de Supabase en local
├── migrations/            # Esquema de la base de datos, en SQL numerado
└── tests/                 # Tests de las políticas RLS
```

Las escrituras se hacen con Server Actions usando la sesión del usuario, así que todas pasan por Row Level Security.

## Estado

En desarrollo. Primera versión prevista para la temporada 2026/27.

## Licencia

Proyecto personal sin ánimo de lucro para uso del club.
