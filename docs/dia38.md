# Día 38: Frontend entregado y conexión con la API

Durante los días anteriores hemos construido una API REST bastante completa.

Empezamos con rutas muy sencillas, después trabajamos con usuarios en memoria, más adelante conectamos PostgreSQL con Prisma, reorganizamos el código por capas y finalmente añadimos seguridad.

Ahora nuestra API ya es capaz de:

- Registrar usuarios.
- Iniciar sesión.
- Generar un token JWT.
- Proteger rutas.
- Distinguir entre `USER` y `ADMIN`.
- Aplicar permisos.
- Consultar datos reales desde PostgreSQL.

Hasta ahora hemos probado casi todo usando herramientas como Thunder Client, Postman o peticiones manuales.

Hoy vamos a dar un paso más: vamos a conectar nuestra API con un frontend sencillo ya preparado.

No vamos a estudiar Next.js en profundidad.

No vamos a convertir este reto en un proyecto de frontend.

El objetivo es más concreto:

**Usar una interfaz web real para comprobar cómo se comunica con nuestra API.**

!!! info "Idea principal"
    Frontend y backend son aplicaciones independientes que se comunican mediante peticiones HTTP y respuestas JSON.

## ¿Qué vamos a trabajar hoy?

Hoy trabajaremos estos conceptos:

- Frontend cliente.
- Backend API.
- URL base de la API.
- `NEXT_PUBLIC_API_URL`.
- Fetch.
- JSON.
- CORS.
- Login desde frontend.
- `localStorage`.
- Token JWT.
- `Authorization: Bearer <token>`.
- Rutas públicas.
- Rutas protegidas.
- Arranque conjunto de PostgreSQL, backend y frontend.

El producto del día será:

**Frontend de UserManager conectado a nuestra API local.**

El resultado esperado será que podamos abrir una interfaz en el navegador, iniciar sesión y consultar datos reales de nuestra API.

## Qué hemos construido hasta ahora

Antes de conectar el frontend, conviene recordar qué tenemos en el backend.

Actualmente disponemos de endpoints como:

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/users/me`
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`

También tenemos estas reglas:

- `POST /api/auth/register` es público.
- `POST /api/auth/login` es público.
- `GET /api/users/me` requiere token.
- `GET /api/users` requiere `ADMIN`.
- `POST /api/users` requiere `ADMIN`.
- `GET /api/users/:id` requiere `ADMIN` o ser el propio usuario.
- `PATCH /api/users/:id` requiere `ADMIN` o ser el propio usuario.
- `DELETE /api/users/:id` requiere `ADMIN`.

Y usuarios iniciales creados mediante seed:

- `admin@email.com` / `admin123` / `ADMIN`
- `user@email.com` / `user123` / `USER`
- `inactive@email.com` / `inactive123` / `USER` inactivo

Hoy usaremos esos usuarios desde el frontend.

## Cómo encajan las piezas

A partir de hoy trabajaremos con tres elementos en marcha:

- PostgreSQL.
- Backend Express.
- Frontend Next.js.

El flujo general será:

```mermaid
flowchart LR
    A[Frontend Next.js] --> B[Fetch]
    B --> C[API Express]
    C --> D[Prisma 7 + PrismaPg]
    D --> E[PostgreSQL]
```

El navegador no consulta PostgreSQL directamente.

El navegador envía una petición HTTP a la API.

La API valida la petición, aplica autenticación y permisos, y consulta la base de datos mediante Prisma.

Después devuelve una respuesta JSON al frontend.

## Frontend y backend son aplicaciones distintas

Es importante entender que el frontend y el backend no son lo mismo.

| Parte      | Qué hace                | Puerto recomendado |
| ---------- | ----------------------- | ------------------ |
| Backend    | Expone la API REST      | `3000`             |
| Frontend   | Muestra la interfaz web | `3001`             |
| PostgreSQL | Guarda los datos        | `5432`             |

Por eso tendremos algo así:

```text
Backend:  http://localhost:3000
Frontend: http://localhost:3001
```

Aunque estén en el mismo ordenador, para el navegador son orígenes distintos.

Esto será importante cuando hablemos de CORS.

## URL base de la API

El frontend necesita saber dónde está escuchando el backend.

Podríamos escribir esto directamente en cada componente:

```ts
fetch("http://localhost:3000/api/auth/login")
```

Pero no es buena idea repetir la URL muchas veces.

En su lugar, usaremos una variable de entorno:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Así, si algún día cambia la URL del backend, solo tendremos que cambiarla en un sitio.

En el frontend tendremos una utilidad que une la URL base con la ruta concreta:

```ts
fetch(`${API_URL}${path}`, {
  ...options,
  headers
});
```

Por ejemplo, si llamamos a:

`/api/users/me`,

la URL final será:

`http://localhost:3000/api/users/me`.

## Qué significa `NEXT_PUBLIC_API_URL`

En Next.js, las variables que necesita leer el navegador deben empezar por:

`NEXT_PUBLIC_`.

Por eso usamos:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

!!! warning "Regla importante"
    No debemos guardar secretos en variables que empiecen por `NEXT_PUBLIC_`.

Esta variable no contiene una contraseña ni una clave privada.

Solo contiene la dirección pública de nuestra API local.

Eso sí es correcto.

## Qué es CORS

CORS es una política de seguridad del navegador.

Sirve para controlar qué orígenes pueden hacer peticiones a un servidor y leer sus respuestas.

En nuestro caso, el frontend y el backend estarán en orígenes distintos:

```text
http://localhost:3000  → backend
http://localhost:3001  → frontend
```

Aunque ambos estén en nuestro ordenador, el navegador los considera orígenes diferentes porque usan puertos distintos.

Por eso el backend debe permitir peticiones desde el frontend.

Si todavía no tenemos CORS configurado en Express, tendremos que añadirlo.

## CORS no sustituye a JWT

Es importante no confundir conceptos.

CORS responde a esta pregunta:

**¿Puede este origen del navegador leer respuestas de mi API?**

JWT responde a esta otra:

**¿Quién es el usuario que hace esta petición?**

Y los roles responden a esta:

**¿Tiene permiso este usuario para hacer esta acción?**

Por tanto:

- CORS no sustituye a JWT.
- CORS no sustituye a los permisos.
- CORS no convierte una ruta en segura.

La seguridad real sigue estando en la API.

## Pantallas entregadas

El frontend entregado tendrá varias pantallas sencillas.

| Pantalla    | Ruta           | Objetivo                            |
| ----------- | -------------- | ----------------------------------- |
| Inicio      | `/`            | Presentar el cliente y navegar      |
| Registro    | `/register`    | Crear una cuenta `USER`             |
| Login       | `/login`       | Obtener y guardar el JWT            |
| Dashboard   | `/dashboard`   | Consultar y editar el perfil        |
| Panel admin | `/admin/users` | Listar, crear y desactivar usuarios |

No buscamos un diseño avanzado.

Buscamos una interfaz clara para probar la API.

## Endpoints consumidos por el frontend

El frontend consumirá estos endpoints:

| Método   | Endpoint             | Pantalla    | Acceso                   |
| -------- | -------------------- | ----------- | ------------------------ |
| `POST`   | `/api/auth/register` | Registro    | Público                  |
| `POST`   | `/api/auth/login`    | Login       | Público                  |
| `GET`    | `/api/users/me`      | Dashboard   | Autenticado              |
| `PATCH`  | `/api/users/:id`     | Dashboard   | Propio usuario o `ADMIN` |
| `GET`    | `/api/users`         | Panel admin | `ADMIN`                  |
| `POST`   | `/api/users`         | Panel admin | `ADMIN`                  |
| `DELETE` | `/api/users/:id`     | Panel admin | `ADMIN`                  |

Esto nos permitirá comprobar todo lo trabajado en los días anteriores.

## Cómo se enviará el token

Cuando el usuario haga login, la API devolverá un token JWT.

El frontend lo guardará de forma sencilla en:

`localStorage`.

Después, cuando llame a rutas protegidas, enviará la cabecera:

`Authorization: Bearer <token>`.

Ejemplo:

```text
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Esto es exactamente lo que espera el middleware de autenticación que creamos en el día 36.

## Nota sobre `localStorage`

Para este reto usaremos `localStorage` por simplicidad didáctica.

Nos permite ver claramente:

- Dónde se guarda el token.
- Cómo se recupera.
- Cómo se añade a las peticiones protegidas.
- Cómo se elimina al cerrar sesión.

Ahora bien, debemos tener clara esta idea:

!!! warning "Nota de seguridad"
    Usar `localStorage` es útil para aprender, pero en producción habría que estudiar opciones más robustas según el contexto de seguridad.

En este reto nos interesa que el proceso sea visible y comprensible.

## Utilidad `apiFetch`

El frontend tendrá una función centralizada para hacer peticiones a la API.

Estará en un archivo parecido a:

`frontend/src/lib/api.ts`.

Su función será:

- Leer la URL base.
- Leer el token si existe.
- Añadir `Content-Type`.
- Añadir `Authorization` si hay token.
- Hacer `fetch`.
- Devolver JSON.
- Mostrar errores legibles.

Una versión orientativa sería:

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "Error en la petición");
  }

  return data;
}
```

De esta manera, las pantallas no tienen que repetir toda la lógica de conexión.

## Qué vamos a hacer hoy

Hoy no vamos a programar desde cero todo el frontend.

Hoy vamos a:

- Arrancar PostgreSQL.
- Preparar datos con seed.
- Arrancar el backend.
- Configurar CORS si hace falta.
- Configurar el frontend.
- Arrancar el frontend.
- Probar login.
- Comprobar que se guarda el token.
- Comprobar una ruta protegida.
- Observar peticiones en DevTools.

## Parte guiada

### Paso 1: Arrancar PostgreSQL

Desde la raíz del backend, ejecuta:

```bash
docker compose up -d
```

Comprueba el estado de los servicios:

```bash
docker compose ps
```

PostgreSQL debe aparecer como servicio activo.

### Paso 2: Instalar dependencias del backend

Si acabas de clonar el proyecto o cambiaste de equipo, instala dependencias:

```bash
npm install
```

Si ya las tienes instaladas, no hace falta repetirlo.

### Paso 3: Generar Prisma Client

Como este proyecto usa Prisma 7 con cliente generado dentro de `src/generated/prisma`, ejecuta:

```bash
npm run prisma:generate
```

O:

```bash
npx prisma generate
```

Recuerda:

No cambiamos los imports al patrón antiguo de `@prisma/client`.

El proyecto usa el cliente generado y el adapter PostgreSQL.

### Paso 4: Ejecutar el seed

Ejecuta:

```bash
npm run prisma:seed
```

O:

```bash
npx prisma db seed
```

Esto dejará preparados los usuarios de prueba:

```text
admin@email.com / admin123
user@email.com / user123
inactive@email.com / inactive123
```

### Paso 5: Arrancar el backend

Ejecuta:

```bash
npm run dev
```

La API debería quedar escuchando en:

```text
http://localhost:3000
```

Comprueba en el navegador o en un cliente HTTP:

```text
http://localhost:3000/api/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "message": "UserManager API funcionando",
  "timestamp": "..."
}
```

## Configurar CORS si hace falta

### Paso 6: Instalar CORS

Si el backend todavía no permite peticiones desde el frontend, instala:

```bash
npm install cors
```

Y los tipos:

```bash
npm install -D @types/cors
```

### Paso 7: Configurar CORS en `server.ts`

Abre:

```text
src/server.ts
```

Importa `cors`:

```ts
import cors from "cors";
```

Después, antes de registrar las rutas, añade:

```ts
app.use(
  cors({
    origin: "http://localhost:3001"
  })
);
```

El orden recomendado es:

```ts
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3001"
  })
);

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
```

Si tu proyecto ya tiene CORS configurado, revisa que permita el origen correcto.

### Paso 8: Entender la configuración de CORS

Esta configuración significa:

```text
El backend acepta peticiones del frontend que corre en http://localhost:3001.
```

Si el frontend corre en otro puerto, tendrás que ajustar el origen.

Por ejemplo:

```text
http://localhost:3002
```

## Configurar el frontend

### Paso 9: Entrar en la carpeta frontend

Abre otra terminal.

Desde la raíz del proyecto:

```bash
cd frontend
```

### Paso 10: Instalar dependencias del frontend

Ejecuta:

```bash
npm install
```

### Paso 11: Crear `.env.local`

Si existe un archivo de ejemplo, puedes hacer:

```bash
cp .env.example .env.local
```

Después abre:

```text
frontend/.env.local
```

Debe contener:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

No añadas `/api` al final si las llamadas del frontend ya empiezan por `/api`.

Correcto:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Incorrecto si el código llama a `/api/auth/login`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Paso 12: Arrancar el frontend

Ejecuta:

```bash
npm run dev
```

El frontend debería abrirse en:

```text
http://localhost:3001
```

Si no se abre automáticamente, entra manualmente desde el navegador.

## Probar login desde el frontend

### Paso 13: Abrir la pantalla de login

Entra en:

```text
http://localhost:3001/login
```

Usa las credenciales:

```text
user@email.com / user123
```

También puedes probar:

```text
admin@email.com / admin123
```

### Paso 14: Comprobar respuesta de login

Cuando el login sea correcto, la API devolverá:

```text
Usuario.
Token JWT.
```

El frontend debe guardar el token en `localStorage`.

Una forma habitual será:

```ts
localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));
```

Dependiendo de cómo esté estructurada la respuesta en tu frontend, puede que el acceso sea:

```ts
data.data.token
data.data.user
```

Lo importante es que el token quede guardado.

### Paso 15: Ver token en DevTools

Abre las herramientas de desarrollo del navegador.

Busca:

```text
Application
Local Storage
http://localhost:3001
```

Deberías ver una clave llamada:

```text
token
```

con un valor parecido a:

```text
eyJhbGciOiJIUzI1NiIs...
```

Eso confirma que el frontend ha guardado el JWT.

## Probar una ruta protegida

### Paso 16: Ir al dashboard

Entra en:

```text
/dashboard
```

El frontend debería llamar a:

```text
GET /api/users/me
```

usando el token guardado.

### Paso 17: Observar la cabecera Authorization

Abre DevTools y entra en la pestaña:

```text
Network
```

Busca la petición a:

```text
/api/users/me
```

Dentro de los headers de la petición deberías ver:

```text
Authorization: Bearer eyJ...
```

Esto es muy importante.

Significa que el frontend está enviando el token de la forma que espera la API.

### Paso 18: Comprobar respuesta del dashboard

La respuesta debería mostrar datos del usuario autenticado:

```text
id
name
email
role
isActive
createdAt
updatedAt
```

Si aparece un error `401`, probablemente el token no se está enviando.

Si aparece un error `403`, probablemente estás accediendo a una ruta para la que tu usuario no tiene permisos.

## Probar panel admin

### Paso 19: Entrar como USER

Haz login con:

```text
user@email.com / user123
```

Después entra en:

```text
/admin/users
```

Resultado esperado:

```text
La API debe devolver 403 Forbidden.
```

El frontend debe mostrar un mensaje claro:

```text
No tienes permiso para realizar esta acción.
```

Esto confirma que el frontend no es quien decide la seguridad.

La API bloquea el acceso.

### Paso 20: Entrar como ADMIN

Cierra sesión.

Haz login con:

```text
admin@email.com / admin123
```

Después entra otra vez en:

```text
/admin/users
```

Resultado esperado:

```text
Debe mostrarse el listado de usuarios.
```

Desde esta pantalla se podrá probar:

```text
Listar usuarios.
Crear usuarios.
Desactivar usuarios.
```

## Pruebas del día

Completa esta tabla durante la sesión:

| Prueba                                                 | Resultado |
| ------------------------------------------------------ | --------- |
| PostgreSQL aparece como servicio activo                |           |
| `/api/health` responde correctamente                   |           |
| El seed se ejecuta sin errores                         |           |
| El backend arranca en el puerto 3000                   |           |
| El frontend arranca en el puerto 3001                  |           |
| `NEXT_PUBLIC_API_URL` apunta a `http://localhost:3000` |           |
| Registro muestra respuesta de la API                   |           |
| Login guarda `token` en `localStorage`                 |           |
| Dashboard envía `Authorization`                        |           |
| `/api/users/me` devuelve el usuario autenticado        |           |
| USER recibe 403 en panel admin                         |           |
| ADMIN puede ver el panel admin                         |           |
| Logout elimina el token                                |           |

## Crear documentación del día 38

Dentro de la carpeta `docs/`, crea:

```text
docs/dia-38-frontend-conexion-api.md
```

Añade este contenido inicial:

````md
# Día 38 - Frontend entregado y conexión con la API

## Qué he hecho

- He arrancado PostgreSQL.
- He ejecutado el seed de datos iniciales.
- He generado Prisma Client.
- He arrancado el backend.
- He comprobado `/api/health`.
- He configurado CORS si era necesario.
- He entrado en la carpeta frontend.
- He instalado las dependencias del frontend.
- He creado o revisado `.env.local`.
- He configurado `NEXT_PUBLIC_API_URL`.
- He arrancado el frontend.
- He probado login desde la interfaz.
- He comprobado que el token se guarda en `localStorage`.
- He comprobado que el dashboard envía `Authorization`.
- He probado acceso al panel admin con USER.
- He probado acceso al panel admin con ADMIN.

## URLs usadas

| Aplicación | URL |
| --- | --- |
| Backend | `http://localhost:3000` |
| Frontend | `http://localhost:3001` |
| PostgreSQL | `localhost:5432` |

## Variable del frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Cabecera de autenticación

```text
Authorization: Bearer <token>
```

## Pantallas del frontend

| Pantalla | Ruta | Objetivo |
| --- | --- |---|
| Inicio | `/` | Presentar el cliente |
| Registro | `/register` | Crear cuenta |
| Login | `/login` | Obtener token |
| Dashboard | `/dashboard` | Consultar perfil |
| Panel admin | `/admin/users` | Gestionar usuarios |

## Endpoints consumidos

| Método | Endpoint | Acceso |
| --- | --- |---|
| `POST` | `/api/auth/register` | Público |
| `POST` | `/api/auth/login` | Público |
| `GET` | `/api/users/me` | Autenticado |
| `PATCH` | `/api/users/:id` | Propio usuario o ADMIN |
| `GET` | `/api/users` | ADMIN |
| `POST` | `/api/users` | ADMIN |
| `DELETE` | `/api/users/:id` | ADMIN |

## Explicación personal

El frontend y el backend son aplicaciones distintas. El frontend realiza peticiones HTTP a la API y la API responde con JSON. Cuando una ruta está protegida, el frontend debe enviar el token JWT en la cabecera Authorization.
````

### Paso 21: Añadir diagrama Mermaid

Añade al documento:

```mermaid
flowchart LR
    A[Frontend Next.js] --> B[Fetch]
    B --> C[API Express]
    C --> D[Prisma 7 + PrismaPg]
    D --> E[PostgreSQL]
```

### Paso 22: Añadir checklist

Añade:

```md
## Checklist de pruebas

| Prueba | Resultado |
| --- | --- |
| PostgreSQL activo | |
| Backend activo en puerto 3000 | |
| Frontend activo en puerto 3001 | |
| `/api/health` responde | |
| `.env.local` configurado | |
| Login correcto desde frontend | |
| Token guardado en localStorage | |
| Dashboard carga perfil | |
| Se envía cabecera Authorization | |
| USER recibe 403 en panel admin | |
| ADMIN accede al panel admin | |
| Logout elimina token | |
```

## Problemas frecuentes

### El frontend no conecta

Comprueba que el backend está arrancado:

```bash
npm run dev
```

Y que responde:

```text
http://localhost:3000/api/health
```

Si no hay respuesta HTTP en la pestaña Network, probablemente la API no está encendida o la URL está mal configurada.

### Error de CORS

Si aparece un error de CORS en consola, revisa que Express tenga configurado:

```ts
app.use(
  cors({
    origin: "http://localhost:3001"
  })
);
```

También revisa que el frontend esté realmente en:

```text
http://localhost:3001
```

Si está en otro puerto, el origen debe coincidir exactamente.

### `NEXT_PUBLIC_API_URL` incorrecta

Revisa:

```text
frontend/.env.local
```

Debe contener:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

No añadas `/api` al final si el código ya llama a rutas como:

```text
/api/auth/login
```

Después de modificar `.env.local`, reinicia el servidor de Next.js.

### Backend apagado

El backend se arranca desde la raíz del proyecto, no desde `frontend/`:

```bash
npm run dev
```

### El token no se guarda

Comprueba:

```text
Que el login devuelve 200.
Que la respuesta incluye token.
Que el frontend lee correctamente data.token o data.data.token.
Que localStorage no está bloqueado.
```

Puedes comprobarlo en DevTools:

```text
Application → Local Storage
```

### El dashboard devuelve `401`

Un `401` significa que la API no ha recibido un token válido.

Revisa:

```text
Que existe token en localStorage.
Que apiFetch añade Authorization.
Que el header tiene formato Bearer.
Que el token no está caducado.
```

### El panel admin devuelve `403`

Un `403` significa que el usuario está autenticado, pero no tiene permiso.

Si has iniciado sesión como:

```text
user@email.com
```

es correcto recibir `403` al entrar al panel admin.

Para acceder, inicia sesión como:

```text
admin@email.com
```

### Puerto `3000` ocupado

Si el puerto 3000 está ocupado, localiza qué aplicación lo está usando o cambia el puerto del backend.

Si cambias el puerto del backend, recuerda actualizar:

```env
NEXT_PUBLIC_API_URL
```

### Puerto `3001` ocupado

Si el puerto 3001 está ocupado, detén el proceso anterior o arranca temporalmente con otro puerto:

```bash
npx next dev -p 3002
```

Si usas otro puerto, recuerda actualizar también el origen permitido por CORS en el backend.

## Parte libre

### Tarea libre 1: Personalizar la pantalla de inicio

Personaliza un pequeño texto, color o tarjeta de la pantalla de inicio.

No es necesario hacer un rediseño completo.

El objetivo es familiarizarse con la estructura del frontend.

### Tarea libre 2: Indicar rutas públicas y protegidas

Añade en la interfaz una pequeña explicación visual que distinga:

- Acciones públicas.
- Acciones que requieren login.
- Acciones que requieren `ADMIN`.

Por ejemplo:

| Acción      | Tipo           |
| ----------- | -------------- |
| Registro    | Pública        |
| Login       | Pública        |
| Ver perfil  | Requiere token |
| Panel admin | Requiere ADMIN |

### Tarea libre 3: Observar una petición en Network

Abre DevTools y analiza una petición a:

`/api/users/me`.

Documenta:

- Método HTTP.
- URL.
- Status code.
- Cabecera `Authorization`.
- Respuesta JSON.

### Tarea libre 4: Explicar por qué la seguridad no debe depender del frontend

Añade una sección en tu documento:

```md
## Por qué la seguridad debe estar en la API
```

Explica por qué no sería suficiente ocultar un botón de admin en el frontend.

Pista:

Aunque ocultemos un botón, alguien podría llamar directamente a la API.

### Tarea libre 5: Preparar el día 39

Añade una sección:

```md
## Preparación para pruebas de integración
```

Responde:

- ¿Qué flujos completos vamos a probar?
- ¿Qué errores pueden aparecer?
- ¿Qué diferencia hay entre `401` y `403`?
- ¿Qué usuario sirve para probar permisos de `ADMIN`?
- ¿Qué usuario sirve para probar restricciones de `USER`?

## Entrega recomendada del día 38

Las respuestas no se entregan como archivo suelto. Deben quedar dentro del repositorio de GitHub.

Al finalizar el día 38, el repositorio debería tener esta estructura aproximada:

```text
usermanager-api/
  .env.example
  .gitignore
  docker-compose.yml
  package.json
  package-lock.json
  prisma.config.ts
  tsconfig.json
  prisma/
    schema.prisma
    seed.ts
    migrations/
      <timestamp>_init/
        migration.sql
  src/
    generated/
      prisma/
        client/
    controllers/
    errors/
    middlewares/
    repositories/
    routes/
    services/
    types/
    utils/
    prisma.ts
    server.ts
  frontend/
    README.md
    .env.example
    .env.local
    package.json
    src/
  docs/
    dia-01-diseno-inicial.md
    dia-02-preparacion-proyecto.md
    dia-03-primer-endpoint.md
    dia-04-metodos-http.md
    dia-05-json-body-params-headers.md
    dia-06-cliente-http-depuracion.md
    dia-07-listado-usuarios.md
    dia-08-consultar-usuario-id.md
    dia-09-crear-usuarios.md
    dia-10-actualizar-usuarios.md
    dia-11-eliminar-desactivar-usuarios.md
    dia-12-validacion-manual-basica.md
    dia-13-validacion-email-duplicados.md
    dia-14-codigos-estado-http.md
    dia-15-middleware-errores.md
    dia-16-base-datos-persistencia.md
    dia-17-postgresql-docker-compose.md
    dia-18-diseno-modelo-persistente-user.md
    dia-19-orm-acceso-datos.md
    dia-20-instalacion-prisma.md
    dia-21-modelo-prisma-user.md
    dia-22-primera-migracion-prisma.md
    dia-23-prisma-studio.md
    dia-24-seed-datos-iniciales.md
    dia-25-consultas-basicas-prisma.md
    dia-26-separar-rutas.md
    dia-27-controladores.md
    dia-28-servicios.md
    dia-29-repositorio-prisma.md
    dia-30-crud-persistente-ordenado.md
    dia-31-limpieza-refactor.md
    dia-32-bcrypt-passwords.md
    dia-33-auth-register.md
    dia-34-auth-login.md
    dia-35-jwt.md
    dia-36-auth-middleware.md
    dia-37-roles-permisos.md
    dia-38-frontend-conexion-api.md
```

El documento del día 38 deberá estar en:

```text
docs/dia-38-frontend-conexion-api.md
```

Y deberá incluir:

- Resumen de lo realizado.
- URLs usadas.
- Variable `NEXT_PUBLIC_API_URL`.
- Cabecera `Authorization`.
- Pantallas del frontend.
- Endpoints consumidos.
- Diagrama Mermaid.
- Checklist de pruebas.
- Problemas frecuentes.
- Parte libre.
- Preparación para pruebas de integración.

En el foro, se compartirá el enlace actualizado al repositorio.

Ejemplo de mensaje:

```text
Hola, comparto el avance del día 38 del reto UserManager API:

https://github.com/usuario/usermanager-api

He conectado el frontend entregado con la API local y he probado login, token y rutas protegidas. La documentación está en:

docs/dia-38-frontend-conexion-api.md
```

Además, se recomienda adjuntar o incluir:

- Captura del frontend abierto.
- Captura de Network con la cabecera `Authorization`.
- Breve explicación del recorrido frontend → API → base de datos.
- Un problema encontrado y cómo se resolvió.

## Guardar cambios en Git

Comprueba los cambios:

```bash
git status
```

Deberías ver cambios en archivos como:

- `frontend/`
- `README.md`
- `docs/dia-38-frontend-conexion-api.md`

Si has añadido CORS al backend, también verás cambios en:

- `package.json`
- `package-lock.json`
- `src/server.ts`

Añade los archivos:

```bash
git add .
```

Crea un commit:

```bash
git commit -m "Dia 38 - Conectar frontend con la API"
```

Sube los cambios:

```bash
git push
```

## Cierre del día

Hoy hemos conectado dos aplicaciones independientes.

Por un lado, tenemos nuestro backend Express, que conserva la responsabilidad de:

- Validar datos.
- Autenticar usuarios.
- Generar y verificar tokens.
- Aplicar permisos.
- Consultar PostgreSQL.
- Responder JSON.

Por otro lado, tenemos un frontend sencillo, que se encarga de:

- Mostrar formularios.
- Enviar peticiones HTTP.
- Guardar el token.
- Enviar `Authorization`.
- Mostrar respuestas y errores.

Lo importante es que el frontend no sustituye a la API.

Aunque la interfaz oculte botones o muestre pantallas distintas, la seguridad real debe seguir estando en el backend.

Hoy hemos trabajado:

- Frontend cliente.
- Next.js.
- URL base.
- `NEXT_PUBLIC_API_URL`.
- Fetch.
- CORS.
- `localStorage`.
- JWT en el navegador.
- `Authorization: Bearer`.
- DevTools.
- Network.
- Rutas protegidas.

Mañana usaremos esta interfaz para probar toda la integración de extremo a extremo.

!!! success "Idea clave"
    Un frontend no accede directamente a la base de datos; consume la API mediante HTTP, y la API mantiene el control sobre los datos, la identidad y los permisos.
