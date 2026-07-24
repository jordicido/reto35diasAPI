# Día 36: Middleware de autenticación

El **Día 36** usa el JWT generado en el login para crear un **middleware de autenticación**. La idea será verificar el token con `jwt.verify`, que es la función de `jsonwebtoken` pensada para comprobar tokens firmados antes de confiar en su contenido.

En el día 35 modificamos el login para que devolviera un token JWT.

Antes, el login respondía solo con el usuario:

```json
{
  "message": "Login correcto",
  "data": {
    "user": {
      "id": 2,
      "email": "user@email.com",
      "role": "USER"
    }
  }
}
```

Después del día 35, el login devuelve también un token:

```json
{
  "message": "Login correcto",
  "data": {
    "user": {
      "id": 2,
      "email": "user@email.com",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

Ese token sirve para que el cliente pueda identificarse en futuras peticiones.

Pero todavía no lo estamos usando.

Hoy vamos a crear un middleware de autenticación.

Este middleware leerá el token enviado por el cliente, comprobará que es válido y guardará la información del usuario autenticado dentro de la petición.

!!! info "Idea principal"
    Una ruta protegida solo debe ejecutarse si la petición incluye un token válido.

## ¿Qué vamos a trabajar hoy?

Hoy trabajaremos estos conceptos:

- Middleware de autenticación.
- Authorization header.
- Bearer token.
- `jwt.verify`.
- Token válido.
- Token ausente.
- Token inválido.
- Token caducado.
- `req.user`.
- Rutas protegidas.
- `401 Unauthorized`.
- Preparación para roles.

El producto del día será el middleware `authMiddleware` funcionando.

El resultado esperado será poder proteger rutas como:

- `GET /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`

usando un token enviado en la cabecera:

`Authorization: Bearer <token>`.

## Qué significa proteger una ruta

Una ruta protegida es una ruta que no puede usarse libremente.

Por ejemplo, antes cualquiera podía llamar a:

`GET /api/users`

y obtener el listado de usuarios.

A partir de hoy, esa ruta podrá exigir un token.

Si el cliente no envía token, la API responderá:

`401 Unauthorized`.

Si el token es inválido, también responderá:

`401 Unauthorized`.

Si el token es válido, la petición continuará.

## Cómo se envía un token

El cliente enviará el token en una cabecera HTTP llamada:

`Authorization`.

El formato habitual será:

`Authorization: Bearer <token>`.

Ejemplo:

`Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`

La palabra `Bearer` indica que estamos enviando un token de acceso.

El middleware tendrá que comprobar:

- Que existe la cabecera `Authorization`.
- Que empieza por `Bearer`.
- Que después de `Bearer` hay un token.
- Que el token se puede verificar.

## Qué hará el middleware

El middleware seguirá este flujo:

```mermaid
flowchart TD
    A[Petición HTTP] --> B{Tiene Authorization?}
    B -- No --> C[401 Token no proporcionado]
    B -- Sí --> D{Formato Bearer válido?}
    D -- No --> E[401 Formato inválido]
    D -- Sí --> F[Extraer token]
    F --> G[jwt.verify]
    G --> H{Token válido?}
    H -- No --> I[401 Token inválido]
    H -- Sí --> J[Guardar datos en req.user]
    J --> K[next]
```

El objetivo final será que cualquier controlador posterior pueda consultar:

```ts
req.user
```

y saber qué usuario hizo la petición.

## Qué datos tendrá `req.user`

En el día 35 generamos el token con este payload:

```ts
{
  userId: user.id,
  email: user.email,
  role: user.role
}
```

Por tanto, cuando verifiquemos el token, podremos recuperar:

- `userId`
- `email`
- `role`

Y guardarlo en la petición:

```ts
req.user = {
  userId: 2,
  email: "user@email.com",
  role: "USER"
};
```

Esto será fundamental para el día 37, cuando trabajemos roles y permisos.

## Qué no haremos todavía

Hoy comprobaremos si el usuario está autenticado.

Pero no aplicaremos todavía permisos por rol.

Es decir, hoy nos centraremos en esta pregunta:

**¿El usuario ha iniciado sesión?**

Mañana trabajaremos esta otra:

**¿Este usuario tiene permiso para hacer esta acción?**

La progresión es:

| Día | Tema |
| --- | --- |
| Día 35 | Generar JWT |
| Día 36 | Verificar JWT con middleware |
| Día 37 | Roles y permisos |

## Archivos que vamos a tocar

Hoy modificaremos o crearemos:

- `src/types/auth.types.ts`
- `src/utils/jwt.utils.ts`
- `src/middlewares/auth.middleware.ts`
- `src/routes/user.routes.ts`
- `src/controllers/auth.controller.ts`
- `src/routes/auth.routes.ts`
- `README.md`
- `docs/dia-36-auth-middleware.md`

La estructura quedará así:

```text
src/
  controllers/
    auth.controller.ts
    health.controller.ts
    user.controller.ts
  errors/
    AppError.ts
  middlewares/
    auth.middleware.ts
  repositories/
    user.repository.ts
  routes/
    auth.routes.ts
    health.routes.ts
    user.routes.ts
  services/
    auth.service.ts
    user.service.ts
  types/
    auth.types.ts
  utils/
    jwt.utils.ts
    parse.utils.ts
    password.utils.ts
    string.utils.ts
```

## Parte guiada

### Paso 1: Abrir el proyecto

Abre una terminal y entra en el repositorio:

```bash
cd usermanager-api
```

Comprueba que el proyecto compila antes de empezar:

```bash
npm run build
```

## Crear tipos de autenticación

### Paso 2: Crear carpeta `types`

Dentro de `src/`, crea:

```text
src/types/
```

### Paso 3: Crear `auth.types.ts`

Dentro de `src/types/`, crea:

```text
src/types/auth.types.ts
```

Añade:

```ts
import { Request } from "express";
import { Role } from "@prisma/client";

export type AuthenticatedUser = {
  userId: number;
  email: string;
  role: Role;
};

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};
```

Este archivo define qué información guardaremos en la petición cuando el usuario esté autenticado.

### Paso 4: Entender `AuthenticatedUser`

El tipo:

```ts
export type AuthenticatedUser = {
  userId: number;
  email: string;
  role: Role;
};
```

representa los datos que vienen dentro del token.

No incluye:

- `password`
- `passwordHash`
- `name`
- `createdAt`
- `updatedAt`

Solo guardamos lo necesario para identificar al usuario y preparar permisos.

### Paso 5: Entender `AuthenticatedRequest`

Express no sabe por defecto que una petición puede tener:

```ts
req.user
```

Por eso creamos:

```ts
export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};
```

Este tipo nos permitirá trabajar con `req.user` sin perder completamente el tipado.

## Ampliar utilidades JWT

### Paso 6: Abrir `jwt.utils.ts`

Abre:

```text
src/utils/jwt.utils.ts
```

En el día 35 creamos:

`generateToken`.

Hoy añadiremos:

`verifyToken`.

### Paso 7: Actualizar imports

Asegúrate de tener algo parecido a:

```ts
import jwt, { SignOptions } from "jsonwebtoken";
import { AppError } from "../errors/AppError";
import { AuthenticatedUser } from "../types/auth.types";
```

Si en tu versión no usaste `SignOptions`, adapta el import manteniendo `jwt`.

### Paso 8: Revisar `generateToken`

Tu archivo ya debería tener algo parecido a:

```ts
type JwtPayload = {
  userId: number;
  email: string;
  role: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError("JWT_SECRET no está configurado", 500);
  }

  return secret;
}

function getJwtSignOptions(): SignOptions {
  return {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h"
  };
}

export function generateToken(payload: JwtPayload) {
  return jwt.sign(payload, getJwtSecret(), getJwtSignOptions());
}
```

Hoy lo ajustaremos ligeramente para reutilizar el tipo `AuthenticatedUser`.

### Paso 9: Ajustar el tipo del payload

Puedes cambiar:

```ts
type JwtPayload = {
  userId: number;
  email: string;
  role: string;
};
```

por:

```ts
type JwtPayload = AuthenticatedUser;
```

O directamente usar `AuthenticatedUser` en `generateToken`:

```ts
export function generateToken(payload: AuthenticatedUser) {
  return jwt.sign(payload, getJwtSecret(), getJwtSignOptions());
}
```

Así el payload del token y `req.user` tendrán la misma forma.

### Paso 10: Crear función de validación del payload

Añade esta función auxiliar:

```ts
function isAuthenticatedUserPayload(
  payload: unknown
): payload is AuthenticatedUser {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Partial<AuthenticatedUser>;

  return (
    typeof candidate.userId === "number" &&
    typeof candidate.email === "string" &&
    (candidate.role === "USER" || candidate.role === "ADMIN")
  );
}
```

Esto sirve para comprobar que el token contiene los datos que esperamos.

### Paso 11: Crear `verifyToken`

Añade:

```ts
export function verifyToken(token: string): AuthenticatedUser {
  try {
    const decoded = jwt.verify(token, getJwtSecret());

    if (!isAuthenticatedUserPayload(decoded)) {
      throw new AppError("Token inválido", 401);
    }

    return decoded;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Token inválido o caducado", 401);
  }
}
```

Esta función:

- Verifica la firma del token.
- Comprueba que el payload tiene la forma esperada.
- Devuelve los datos autenticados.
- Lanza error `401` si algo falla.

### Paso 12: Revisar `jwt.utils.ts` completo

Una versión posible del archivo completo sería:

```ts
import jwt, { SignOptions } from "jsonwebtoken";
import { AppError } from "../errors/AppError";
import { AuthenticatedUser } from "../types/auth.types";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError("JWT_SECRET no está configurado", 500);
  }

  return secret;
}

function getJwtSignOptions(): SignOptions {
  return {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h"
  };
}

function isAuthenticatedUserPayload(
  payload: unknown
): payload is AuthenticatedUser {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Partial<AuthenticatedUser>;

  return (
    typeof candidate.userId === "number" &&
    typeof candidate.email === "string" &&
    (candidate.role === "USER" || candidate.role === "ADMIN")
  );
}

export function generateToken(payload: AuthenticatedUser) {
  return jwt.sign(payload, getJwtSecret(), getJwtSignOptions());
}

export function verifyToken(token: string): AuthenticatedUser {
  try {
    const decoded = jwt.verify(token, getJwtSecret());

    if (!isAuthenticatedUserPayload(decoded)) {
      throw new AppError("Token inválido", 401);
    }

    return decoded;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Token inválido o caducado", 401);
  }
}
```

## Revisar `auth.service.ts`

### Paso 13: Ajustar `generateToken` si hace falta

Abre:

```text
src/services/auth.service.ts
```

Busca:

```ts
const token = generateToken({
  userId: user.id,
  email: user.email,
  role: user.role
});
```

Esto debería seguir funcionando.

Ahora `generateToken` espera un `AuthenticatedUser`.

Como `user.role` viene de Prisma y es de tipo `Role`, encaja con:

```ts
role: Role
```

## Crear middleware de autenticación

### Paso 14: Crear carpeta `middlewares`

Dentro de `src/`, crea:

```text
src/middlewares/
```

### Paso 15: Crear `auth.middleware.ts`

Dentro de `src/middlewares/`, crea:

```text
src/middlewares/auth.middleware.ts
```

Añade:

```ts
import { Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { AuthenticatedRequest } from "../types/auth.types";
import { verifyToken } from "../utils/jwt.utils";

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("Token no proporcionado", 401);
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      throw new AppError("Formato de token inválido", 401);
    }

    const authenticatedUser = verifyToken(token);

    req.user = authenticatedUser;

    next();
  } catch (error) {
    next(error);
  }
}
```

Este middleware es la pieza central del día.

### Paso 16: Analizar el middleware

El middleware hace esto:

- Lee `req.headers.authorization`.
- Comprueba que existe.
- Divide el contenido en `type` y `token`.
- Comprueba que `type` sea `Bearer`.
- Verifica el token.
- Guarda el payload en `req.user`.
- Llama a `next`.

Si algo falla, envía el error al middleware centralizado:

```ts
next(error);
```

## Crear ruta de prueba: `/api/auth/me`

Antes de proteger rutas de usuarios, crearemos una ruta sencilla para probar que el middleware funciona.

### Paso 17: Crear controlador `meController`

Abre:

```text
src/controllers/auth.controller.ts
```

Añade el import del tipo:

```ts
import { AuthenticatedRequest } from "../types/auth.types";
```

Después añade este controlador:

```ts
export async function meController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    return res.status(200).json({
      message: "Usuario autenticado",
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
}
```

Este controlador simplemente devuelve lo que el middleware ha guardado en:

`req.user`.

### Paso 18: Proteger `/api/auth/me`

Abre:

```text
src/routes/auth.routes.ts
```

Importa `authMiddleware`:

```ts
import { authMiddleware } from "../middlewares/auth.middleware";
```

Importa también `meController`:

```ts
import {
  loginController,
  meController,
  registerController
} from "../controllers/auth.controller";
```

Añade la ruta:

```ts
authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.get("/me", authMiddleware, meController);
```

La ruta final será:

`GET /api/auth/me`.

Y exigirá token.

## Probar `/api/auth/me`

### Paso 19: Arrancar PostgreSQL

```bash
docker compose up -d
```

### Paso 20: Arrancar API

```bash
npm run dev
```

### Paso 21: Hacer login

Petición:

`POST http://localhost:3000/api/auth/login`

Body:

```json
{
  "email": "user@email.com",
  "password": "user123"
}
```

Copia el token de la respuesta.

### Paso 22: Llamar a `/api/auth/me` sin token

Petición:

`GET http://localhost:3000/api/auth/me`

Respuesta esperada:

`401 Unauthorized`.

Mensaje esperado:

```json
{
  "error": "Token no proporcionado"
}
```

### Paso 23: Llamar a `/api/auth/me` con token

Petición:

`GET http://localhost:3000/api/auth/me`

Cabecera:

`Authorization: Bearer <token>`

Respuesta esperada:

```json
{
  "message": "Usuario autenticado",
  "data": {
    "user": {
      "userId": 2,
      "email": "user@email.com",
      "role": "USER"
    }
  }
}
```

Esto confirma que el middleware funciona.

### Paso 24: Probar token mal formado

Envía:

`Authorization: <token>`

sin `Bearer`.

Respuesta esperada:

`401 Unauthorized`.

Mensaje:

```json
{
  "error": "Formato de token inválido"
}
```

### Paso 25: Probar token inventado

Envía:

`Authorization: Bearer token_inventado`

Respuesta esperada:

`401 Unauthorized`.

Mensaje:

```json
{
  "error": "Token inválido o caducado"
}
```

## Proteger rutas de usuarios

Ahora que `/api/auth/me` funciona, podemos proteger rutas de usuario.

### Paso 26: Abrir `user.routes.ts`

Abre:

```text
src/routes/user.routes.ts
```

Importa el middleware:

```ts
import { authMiddleware } from "../middlewares/auth.middleware";
```

### Paso 27: Aplicar middleware a todas las rutas de usuarios

Puedes proteger todas las rutas de este archivo añadiendo:

```ts
userRouter.use(authMiddleware);
```

justo después de crear el router:

```ts
export const userRouter = Router();

userRouter.use(authMiddleware);

userRouter.get("/", listUsers);
userRouter.get("/:id", getUserById);
userRouter.post("/", createUserController);
userRouter.patch("/:id", updateUserController);
userRouter.delete("/:id", deleteUserController);
```

Con esto, todas las rutas de `/api/users` exigirán token.

### Paso 28: Entender `router.use`

Cuando hacemos:

```ts
userRouter.use(authMiddleware);
```

estamos diciendo:

Antes de ejecutar cualquier ruta de `userRouter`, ejecuta `authMiddleware`.

Por tanto:

- `GET /api/users`
- `GET /api/users/1`
- `POST /api/users`
- `PATCH /api/users/1`
- `DELETE /api/users/1`

quedan protegidas.

## Probar rutas protegidas

### Paso 29: Probar `GET /api/users` sin token

Petición:

`GET http://localhost:3000/api/users`

Respuesta esperada:

`401 Unauthorized`.

### Paso 30: Probar `GET /api/users` con token

Petición:

`GET http://localhost:3000/api/users`

Cabecera:

`Authorization: Bearer <token>`

Respuesta esperada:

`200 OK`.

### Paso 31: Probar `GET /api/users/:id` con token

`GET http://localhost:3000/api/users/1`

Cabecera:

`Authorization: Bearer <token>`

Respuesta esperada:

`200 OK`.

### Paso 32: Probar `POST /api/users` con token

`POST http://localhost:3000/api/users`

Body:

```json
{
  "name": "Usuario Protegido",
  "email": "usuario.protegido@email.com",
  "password": "123456"
}
```

Cabecera:

`Authorization: Bearer <token>`

Respuesta esperada:

`201 Created`.

Hoy cualquier usuario autenticado podrá llamar a esta ruta.

Mañana limitaremos esto por rol.

## Ejecutar build

### Paso 33: Compilar TypeScript

Ejecuta:

```bash
npm run build
```

Si aparece algún error, revisa:

- Tipos de `AuthenticatedRequest`.
- Import de `authMiddleware`.
- Import de `AuthenticatedUser`.
- `verifyToken`.
- `jwt.utils.ts`.
- `auth.controller.ts`.

## Actualizar README

### Paso 34: Añadir sección de middleware de autenticación

En el README, añade:

````md
## Middleware de autenticación

El proyecto ya puede verificar tokens JWT enviados por el cliente.

Formato de la cabecera:

```text
Authorization: Bearer <token>
```

Middleware creado:

```text
src/middlewares/auth.middleware.ts
```

El middleware:

- Lee la cabecera `Authorization`.
- Comprueba que el formato sea `Bearer`.
- Verifica el token con `JWT_SECRET`.
- Guarda los datos autenticados en `req.user`.
- Bloquea la petición si el token falta o es inválido.

Ruta de prueba:

`GET /api/auth/me`

Rutas protegidas:

`/api/users/*`

Todavía no se aplican permisos por rol. Eso se trabajará en el siguiente paso.
````

### Paso 35: Actualizar estructura

Añade:

- `src/middlewares/auth.middleware.ts`
- `src/types/auth.types.ts`

La estructura puede quedar así:

```text
src/
  controllers/
    auth.controller.ts
    health.controller.ts
    user.controller.ts
  errors/
    AppError.ts
  middlewares/
    auth.middleware.ts
  repositories/
    user.repository.ts
  routes/
    auth.routes.ts
    health.routes.ts
    user.routes.ts
  services/
    auth.service.ts
    user.service.ts
  types/
    auth.types.ts
  utils/
    jwt.utils.ts
    parse.utils.ts
    password.utils.ts
    string.utils.ts
```

### Paso 36: Actualizar índice del README

Añade:

```md
- [Día 36 - Middleware de autenticación](docs/dia-36-auth-middleware.md)
```

El bloque debería quedar parecido a:

```md
## Documentación del reto

- [Día 1 - Diseño inicial](docs/dia-01-diseno-inicial.md)
- [Día 2 - Preparación del proyecto](docs/dia-02-preparacion-proyecto.md)
- [Día 3 - Primer endpoint](docs/dia-03-primer-endpoint.md)
- [Día 4 - Métodos HTTP](docs/dia-04-metodos-http.md)
- [Día 5 - JSON, body, params y headers](docs/dia-05-json-body-params-headers.md)
- [Día 6 - Cliente HTTP y depuración](docs/dia-06-cliente-http-depuracion.md)
- [Día 7 - Listado de usuarios en memoria](docs/dia-07-listado-usuarios.md)
- [Día 8 - Consultar usuario por ID](docs/dia-08-consultar-usuario-id.md)
- [Día 9 - Crear usuarios en memoria](docs/dia-09-crear-usuarios.md)
- [Día 10 - Actualizar usuarios en memoria](docs/dia-10-actualizar-usuarios.md)
- [Día 11 - Eliminar o desactivar usuarios en memoria](docs/dia-11-eliminar-desactivar-usuarios.md)
- [Día 12 - Validación manual básica](docs/dia-12-validacion-manual-basica.md)
- [Día 13 - Validación de email y duplicados](docs/dia-13-validacion-email-duplicados.md)
- [Día 14 - Códigos de estado HTTP](docs/dia-14-codigos-estado-http.md)
- [Día 15 - Middleware centralizado de errores](docs/dia-15-middleware-errores.md)
- [Día 16 - Base de datos y persistencia](docs/dia-16-base-datos-persistencia.md)
- [Día 17 - PostgreSQL con Docker Compose](docs/dia-17-postgresql-docker-compose.md)
- [Día 18 - Diseño del modelo persistente User](docs/dia-18-diseno-modelo-persistente-user.md)
- [Día 19 - ORM o acceso a datos](docs/dia-19-orm-acceso-datos.md)
- [Día 20 - Instalación y configuración inicial de Prisma](docs/dia-20-instalacion-prisma.md)
- [Día 21 - Modelo Prisma User](docs/dia-21-modelo-prisma-user.md)
- [Día 22 - Primera migración con Prisma](docs/dia-22-primera-migracion-prisma.md)
- [Día 23 - Prisma Studio](docs/dia-23-prisma-studio.md)
- [Día 24 - Seed de datos iniciales](docs/dia-24-seed-datos-iniciales.md)
- [Día 25 - Consultas básicas con Prisma Client](docs/dia-25-consultas-basicas-prisma.md)
- [Día 26 - Separar rutas](docs/dia-26-separar-rutas.md)
- [Día 27 - Controladores](docs/dia-27-controladores.md)
- [Día 28 - Servicios](docs/dia-28-servicios.md)
- [Día 29 - Repositorio con Prisma](docs/dia-29-repositorio-prisma.md)
- [Día 30 - CRUD persistente ordenado](docs/dia-30-crud-persistente-ordenado.md)
- [Día 31 - Limpieza y refactor](docs/dia-31-limpieza-refactor.md)
- [Día 32 - Contraseñas seguras con bcrypt](docs/dia-32-bcrypt-passwords.md)
- [Día 33 - Registro de usuarios](docs/dia-33-auth-register.md)
- [Día 34 - Login de usuarios](docs/dia-34-auth-login.md)
- [Día 35 - Generación de token JWT](docs/dia-35-jwt.md)
- [Día 36 - Middleware de autenticación](docs/dia-36-auth-middleware.md)
```

## Crear el documento del día 36

Dentro de la carpeta `docs/`, crea:

```text
docs/dia-36-auth-middleware.md
```

Añade este contenido inicial:

````md
# Día 36 - Middleware de autenticación

## Qué he hecho

- He creado la carpeta src/types.
- He creado auth.types.ts.
- He definido AuthenticatedUser.
- He definido AuthenticatedRequest.
- He añadido verifyToken en jwt.utils.ts.
- He creado la carpeta src/middlewares.
- He creado auth.middleware.ts.
- He creado authMiddleware.
- He leído la cabecera Authorization.
- He comprobado el formato Bearer.
- He verificado tokens con JWT_SECRET.
- He guardado el payload en req.user.
- He creado GET /api/auth/me.
- He protegido las rutas de /api/users.
- He probado rutas sin token.
- He probado rutas con token.
- He ejecutado npm run build.

## Cabecera usada

```text
Authorization: Bearer <token>
```

## Archivos creados

```text
src/types/auth.types.ts
src/middlewares/auth.middleware.ts
```

## Archivos modificados

```text
src/utils/jwt.utils.ts
src/controllers/auth.controller.ts
src/routes/auth.routes.ts
src/routes/user.routes.ts
```

## Middleware creado

```text
authMiddleware
```

## Qué hace el middleware

```text
Lee Authorization.
Comprueba que exista.
Comprueba que use Bearer.
Extrae el token.
Verifica el token.
Guarda el usuario autenticado en req.user.
Permite continuar con next().
```

## Ruta de prueba

```text
GET /api/auth/me
```

## Rutas protegidas

```text
GET    /api/users
GET    /api/users/:id
POST   /api/users
PATCH  /api/users/:id
DELETE /api/users/:id
```

## Flujo

```text
Cliente → Authorization Bearer token → authMiddleware → req.user → controlador
```

## Explicación personal

El middleware de autenticación permite comprobar si una petición pertenece a un usuario autenticado. Si el token es válido, la API guarda sus datos en req.user y deja continuar la petición. Si el token falta o es inválido, responde con 401.
````

### Paso 37: Añadir diagrama Mermaid

Añade al documento:

```mermaid
flowchart TD
    A[Petición] --> B{Authorization?}
    B -- No --> C[401 Token no proporcionado]
    B -- Sí --> D{Bearer token?}
    D -- No --> E[401 Formato inválido]
    D -- Sí --> F[verifyToken]
    F --> G{Token válido?}
    G -- No --> H[401 Token inválido]
    G -- Sí --> I[req.user]
    I --> J[Controlador]
```

### Paso 38: Añadir checklist de pruebas

Añade:

```md
## Checklist de pruebas

| Prueba | Resultado |
| --- | --- |
| Login devuelve token | |
| `GET /api/auth/me` sin token devuelve 401 | |
| `GET /api/auth/me` con token devuelve usuario | |
| Token sin Bearer devuelve 401 | |
| Token inventado devuelve 401 | |
| `GET /api/users` sin token devuelve 401 | |
| `GET /api/users` con token devuelve 200 | |
| `POST /api/users` con token funciona | |
| `npm run build` funciona | |
```

## Guardar cambios en Git

### Paso 39: Revisar cambios

Ejecuta:

```bash
git status
```

Deberías ver cambios en:

- `src/types/auth.types.ts`
- `src/utils/jwt.utils.ts`
- `src/middlewares/auth.middleware.ts`
- `src/controllers/auth.controller.ts`
- `src/routes/auth.routes.ts`
- `src/routes/user.routes.ts`
- `README.md`
- `docs/dia-36-auth-middleware.md`

### Paso 40: Añadir archivos

```bash
git add .
```

### Paso 41: Crear commit

```bash
git commit -m "Dia 36 - Crear middleware de autenticacion"
```

### Paso 42: Subir cambios

```bash
git push
```

## Problemas frecuentes

### `GET /api/auth/me` devuelve 404

Revisa que en `auth.routes.ts` tienes:

```ts
authRouter.get("/me", authMiddleware, meController);
```

Y que `authRouter` está montado en `server.ts`:

```ts
app.use("/api/auth", authRouter);
```

### Siempre recibo “Token no proporcionado”

Comprueba que envías la cabecera:

`Authorization`

con el formato:

`Bearer <token>`.

No la pongas dentro del body.

### Siempre recibo “Formato de token inválido”

Comprueba que has escrito:

`Authorization: Bearer eyJ...`

No:

`Authorization: eyJ...`

Ni:

`Authorization: Token eyJ...`

### Siempre recibo “Token inválido o caducado”

Posibles causas:

- El token está mal copiado.
- El token ha caducado.
- Has reiniciado el servidor con otro `JWT_SECRET`.
- El `JWT_SECRET` usado para firmar no coincide con el usado para verificar.

Haz login de nuevo y copia un token nuevo.

### TypeScript se queja de `req.user`

Usa el tipo:

```ts
AuthenticatedRequest
```

en los lugares donde necesites acceder a `req.user`.

### `POST /api/auth/login` también queda protegido por error

No apliques `authMiddleware` a todo `authRouter`.

Correcto:

```ts
authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.get("/me", authMiddleware, meController);
```

Incorrecto:

```ts
authRouter.use(authMiddleware);
authRouter.post("/login", loginController);
```

Si proteges login, nadie podrá iniciar sesión.

## Parte libre

### Tarea libre 1: Probar token caducado

Cambia temporalmente:

```env
JWT_EXPIRES_IN="10s"
```

Reinicia el servidor, haz login y espera unos segundos.

Después llama a:

`GET /api/auth/me`.

Documenta qué ocurre.

Después vuelve a dejar:

```env
JWT_EXPIRES_IN="1h"
```

### Tarea libre 2: Crear tabla de errores del middleware

Completa:

| Caso                     | Código esperado | Mensaje |
| ------------------------ | --------------- | ------- |
| No hay Authorization     |                 |         |
| Authorization sin Bearer |                 |         |
| Bearer sin token         |                 |         |
| Token inventado          |                 |         |
| Token caducado           |                 |         |
| Token correcto           |                 |         |

### Tarea libre 3: Explicar qué es `req.user`

Añade una sección:

```md
## Qué es req.user
```

Explica con tus palabras por qué guardamos ahí los datos del token.

### Tarea libre 4: Probar CRUD con token de USER

Haz login con:

`user@email.com`

y prueba:

- `GET /api/users`
- `POST /api/users`
- `DELETE /api/users/:id`

Documenta que hoy funciona porque todavía no hemos aplicado roles.

### Tarea libre 5: Preparar el día 37

Añade una sección:

```md
## Preparación para roles y permisos
```

Responde:

- ¿Qué rutas deberían ser solo `ADMIN`?
- ¿Qué rutas podría usar un `USER`?
- ¿Cómo podemos comprobar el `role` del usuario?
- ¿Dónde está guardado el `role` después del middleware?
- ¿Qué código debería devolver una ruta si el usuario está autenticado pero no tiene permiso?

Pistas:

- `req.user.role`
- `403 Forbidden`
- `GET /api/users` solo `ADMIN`
- `DELETE /api/users/:id` solo `ADMIN`
- `GET /api/users/me` usuario autenticado

## Entrega recomendada del día 36

Las respuestas no se entregan como archivo suelto. Deben quedar dentro del repositorio de GitHub.

Al finalizar el día 36, el repositorio debería tener esta estructura aproximada:

```text
usermanager-api/
  .env.example
  .gitignore
  docker-compose.yml
  README.md
  package.json
  package-lock.json
  tsconfig.json
  prisma/
    schema.prisma
    seed.ts
    migrations/
      <timestamp>_init/
        migration.sql
  src/
    prisma.ts
    server.ts
    controllers/
      auth.controller.ts
      health.controller.ts
      user.controller.ts
    errors/
      AppError.ts
    middlewares/
      auth.middleware.ts
    repositories/
      user.repository.ts
    routes/
      auth.routes.ts
      health.routes.ts
      user.routes.ts
    services/
      auth.service.ts
      user.service.ts
    types/
      auth.types.ts
    utils/
      jwt.utils.ts
      parse.utils.ts
      password.utils.ts
      string.utils.ts
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
```

El documento del día 36 deberá estar en:

```text
docs/dia-36-auth-middleware.md
```

Y deberá incluir:

- Resumen de lo realizado.
- Cabecera `Authorization` usada.
- Archivos creados.
- Archivos modificados.
- Middleware creado.
- Qué hace el middleware.
- Ruta de prueba.
- Rutas protegidas.
- Flujo del middleware.
- Diagrama Mermaid.
- Checklist de pruebas.
- Tabla de errores.
- Explicación de `req.user`.
- Preparación para roles y permisos.

En el foro, se compartirá el enlace actualizado al repositorio.

Ejemplo de mensaje:

```text
Hola, comparto el avance del día 36 del reto UserManager API:

https://github.com/usuario/usermanager-api

He creado el middleware de autenticación con JWT y he protegido las rutas de usuarios. La documentación está en:

docs/dia-36-auth-middleware.md
```

## Cierre del día

Hoy hemos dado un paso clave: el token ya sirve para algo.

Hasta ayer, el login generaba JWT, pero ninguna ruta lo utilizaba.

Ahora la API puede recibir:

`Authorization: Bearer <token>`

verificarlo y guardar sus datos en:

`req.user`.

Hoy hemos trabajado:

- `authMiddleware`.
- Authorization header.
- Bearer token.
- `verifyToken`.
- `jwt.verify`.
- `req.user`.
- `AuthenticatedRequest`.
- Rutas protegidas.
- `401 Unauthorized`.
- `GET /api/auth/me`.

El proyecto ya distingue entre peticiones anónimas y peticiones autenticadas.

Todavía falta distinguir entre usuarios normales y administradores.

Eso será el objetivo del día 37.

!!! success "Idea clave"
    Autenticar una petición significa comprobar que trae un token válido y asociar esa petición con los datos del usuario que inició sesión.
