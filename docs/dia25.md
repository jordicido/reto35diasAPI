# Día 25: Consultas básicas con Prisma Client

En el día 24 creamos un seed de datos iniciales.

Gracias a ese seed, nuestra base de datos ya tiene usuarios de prueba:

- `admin@email.com`
- `user@email.com`
- `inactive@email.com`

También comprobamos esos datos con Prisma Studio.

Hasta ahora hemos trabajado con Prisma desde fuera de la API mediante
`schema.prisma`, las migraciones, Prisma Studio y el seed.

Pero todavía no hemos usado Prisma desde nuestro código de Express.

Hoy vamos a dar ese paso.

El objetivo será usar **Prisma Client** dentro de la API para consultar y crear usuarios.

No vamos a reorganizar todavía todo el proyecto por capas. Eso empezará en el día 26.

Hoy haremos pruebas controladas, preferiblemente en rutas temporales de debug, para entender cómo se consulta la base de datos desde TypeScript.

!!! info "Objetivo"
    Prisma Client será el puente entre nuestro código TypeScript y PostgreSQL.

## ¿Qué vamos a trabajar hoy?

Hoy trabajaremos estos conceptos:

| Concepto | Qué aprenderemos |
| --- | --- |
| Prisma Client | Cómo comunicar TypeScript con PostgreSQL |
| `findMany` | Cómo obtener varios registros |
| `findUnique` | Cómo buscar un registro por un campo único |
| `create` | Cómo insertar un registro |
| `select` | Cómo controlar los campos devueltos |
| `where` | Cómo filtrar resultados |
| `orderBy` | Cómo ordenar resultados |
| `data` | Cómo proporcionar los datos de escritura |
| `async` / `await` | Cómo ejecutar consultas asíncronas |
| Rutas de debug | Cómo probar Prisma sin alterar todavía el CRUD principal |

El producto del día serán las primeras consultas a la base de datos desde
Express usando Prisma Client.

El resultado esperado será poder probar rutas temporales que consultan usuarios reales desde PostgreSQL.

## ¿Dónde estamos en el reto?

Hasta ahora teníamos este recorrido:

1. **Día 18:** diseño del modelo persistente `User`.
2. **Día 19:** decisión técnica: Prisma.
3. **Día 20:** instalación y configuración de Prisma.
4. **Día 21:** modelo Prisma `User`.
5. **Día 22:** primera migración.
6. **Día 23:** Prisma Studio.
7. **Día 24:** seed de datos iniciales.

Hoy empezamos a usar Prisma desde la API.

Pero todavía no vamos a hacer la arquitectura final.

Es decir, hoy todavía no crearemos las carpetas `routes/`, `controllers/`,
`services/` y `repositories/`.

Eso empezará en la siguiente fase.

Hoy trabajaremos directamente desde `server.ts` o con un pequeño archivo de conexión para entender el funcionamiento básico.

## ¿Qué es Prisma Client?

Prisma Client es el cliente generado por Prisma a partir de `prisma/schema.prisma`.

Como tenemos un modelo `User`, Prisma genera métodos para trabajar con usuarios.

Por ejemplo:

```ts
prisma.user.findMany()
prisma.user.findUnique()
prisma.user.create()
prisma.user.update()
prisma.user.delete()
```

Hoy trabajaremos solo con tres operaciones:

| Operación | Uso |
| --- | --- |
| `findMany` | Buscar varios registros |
| `findUnique` | Buscar un registro único |
| `create` | Crear un registro |

Visualmente:

```mermaid
flowchart LR
    A[Express] --> B[Prisma Client]
    B --> C[PostgreSQL]
    C --> B
    B --> A
```

## ¿Qué es `findMany`?

`findMany` permite obtener varios registros de una tabla.

Ejemplo simple:

```ts
const users = await prisma.user.findMany();
```

Eso devuelve todos los usuarios.

Pero hay un problema importante.

Si hacemos eso sin controlar los campos, Prisma puede devolver también
`passwordHash`.

Y eso no nos interesa.

Por eso usaremos `select`.

Ejemplo seguro:

```ts
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
    isActive: true,
    createdAt: true,
    updatedAt: true
  }
});
```

Así indicamos exactamente qué campos queremos devolver.

## ¿Qué es `select`?

`select` permite elegir qué campos devuelve Prisma.

Ejemplo:

```ts
select: {
  id: true,
  name: true,
  email: true
}
```

Esto significa que Prisma devolverá `id`, `name` y `email`, pero no el resto de
los campos.

En nuestro proyecto esto será fundamental, porque el modelo `User` contiene
`passwordHash`.

Pero la API nunca debe devolverlo.

!!! danger "Protege los datos sensibles"
    Siempre que devolvamos usuarios al cliente, debemos controlar los campos de
    salida. `passwordHash` nunca debe formar parte de la respuesta.

## ¿Qué es `findUnique`?

`findUnique` permite buscar un único registro usando un campo único.

Por ejemplo, podemos buscar por `id`:

```ts
const user = await prisma.user.findUnique({
  where: {
    id: 1
  }
});
```

También podríamos buscar por `email`, porque en nuestro modelo el email es único:

```ts
const user = await prisma.user.findUnique({
  where: {
    email: "admin@email.com"
  }
});
```

Esto funciona porque en `schema.prisma` definimos:

```prisma
email String @unique
```

Si el usuario no existe, `findUnique` devuelve `null`.

Por eso la API deberá comprobarlo y responder con `404`.

## ¿Qué es `create`?

`create` permite insertar un nuevo registro.

Ejemplo:

```ts
const user = await prisma.user.create({
  data: {
    name: "Nuevo Usuario",
    email: "nuevo@email.com",
    passwordHash: "hash_temporal_123456",
    role: "USER",
    isActive: true
  }
});
```

La parte importante es:

```ts
data: {
  ...
}
```

Ahí indicamos los datos del usuario que queremos crear.

Como nuestro modelo tiene valores por defecto, podríamos omitir algunos campos:

| Campo | Valor |
| --- | --- |
| `role` | `USER` por defecto |
| `isActive` | `true` por defecto |
| `createdAt` | Automático |
| `updatedAt` | Automático |

Pero hoy los veremos de forma explícita para entender qué se guarda.

## Rutas temporales de debug

Hoy no queremos sustituir todavía todo el CRUD en memoria por Prisma.

Eso lo haremos más adelante, después de empezar la arquitectura por capas.

Por eso crearemos rutas temporales, por ejemplo:

- `GET /api/debug/prisma/users`
- `GET /api/debug/prisma/users/:id`
- `POST /api/debug/prisma/users`

Estas rutas nos permitirán practicar Prisma sin romper todavía las rutas principales.

Más adelante, cuando el código esté organizado por capas, llevaremos esta
lógica a `user.repository.ts`, `user.service.ts`, `user.controller.ts` y
`user.routes.ts`.

## Flujo del día

El flujo de trabajo será:

```mermaid
flowchart TD
    A[Crear src/prisma.ts] --> B[Importar Prisma Client]
    B --> C[Crear rutas debug]
    C --> D[Probar findMany]
    D --> E[Probar findUnique]
    E --> F[Probar create]
    F --> G[Comprobar datos con Prisma Studio]
    G --> H[Documentar resultados]
```

## Parte guiada

### Paso 1: Abrir el proyecto

Abre el repositorio:

```bash
cd usermanager-api
```

Comprueba que tienes:

```text
prisma/
src/
docs/
package.json
docker-compose.yml
```

### Paso 2: Arrancar PostgreSQL

Ejecuta:

```bash
docker compose up -d
```

Comprueba:

```bash
docker compose ps
```

La base de datos debe estar funcionando.

### Paso 3: Comprobar que hay datos iniciales

Ejecuta el seed si todavía no lo has hecho:

```bash
npm run prisma:seed
```

O:

```bash
npx prisma db seed
```

Después puedes comprobar con Prisma Studio:

```bash
npm run prisma:studio
```

Deberías tener usuarios como `admin@email.com`, `user@email.com` e
`inactive@email.com`.

### Paso 4: Crear `src/prisma.ts`

Dentro de `src/`, crea el archivo `src/prisma.ts`.

Añade:

```ts
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
```

Este archivo crea una instancia de Prisma Client que podremos usar desde el backend.

Más adelante, cuando organicemos el proyecto por capas, este archivo nos servirá como punto común de acceso a Prisma.

### Paso 5: Importar Prisma en `server.ts`

Abre `src/server.ts`.

Añade arriba:

```ts
import { prisma } from "./prisma";
```

Esto nos permitirá usar Prisma dentro de las rutas temporales.

### Paso 6: Crear un selector seguro de usuario

Para no repetir `select` en cada consulta, podemos crear una constante.

En `server.ts`, antes de las rutas, añade:

```ts
const userSafeSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
};
```

Este selector evita devolver `passwordHash`.

Lo usaremos en `findMany`, `findUnique` y `create`.

### Paso 7: Ruta `findMany`

Añade esta ruta temporal:

```ts
app.get("/api/debug/prisma/users", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: userSafeSelect,
      orderBy: {
        id: "asc"
      }
    });

    return res.status(200).json({
      message: "Usuarios obtenidos con Prisma",
      total: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
});
```

Esta ruta usa `findMany`, `select` y `orderBy`.

Prueba `GET http://localhost:3000/api/debug/prisma/users` en Thunder Client o
Postman.

Respuesta esperada:

```json
{
  "message": "Usuarios obtenidos con Prisma",
  "total": 3,
  "data": [
    {
      "id": 1,
      "name": "Admin Principal",
      "email": "admin@email.com",
      "role": "ADMIN",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

Comprueba que no aparece `passwordHash`.

### Paso 8: Ruta `findUnique` por ID

Añade esta ruta temporal:

```ts
app.get("/api/debug/prisma/users/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        error: "El ID debe ser un número"
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id
      },
      select: userSafeSelect
    });

    if (!user) {
      return res.status(404).json({
        error: "Usuario no encontrado"
      });
    }

    return res.status(200).json({
      message: "Usuario encontrado con Prisma",
      data: user
    });
  } catch (error) {
    next(error);
  }
});
```

Prueba estas peticiones:

- `GET http://localhost:3000/api/debug/prisma/users/1`
- `GET http://localhost:3000/api/debug/prisma/users/999`

Resultados esperados:

| Caso | Estado HTTP |
| --- | --- |
| Usuario existente | `200 OK` |
| Usuario inexistente | `404 Not Found` |
| ID no numérico | `400 Bad Request` |

### Paso 9: Ruta `create`

Añade esta ruta temporal:

```ts
app.post("/api/debug/prisma/users", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "name, email y password son obligatorios"
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    if (cleanName.length === 0) {
      return res.status(400).json({
        error: "El nombre no puede estar vacío"
      });
    }

    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      return res.status(400).json({
        error: "El email no tiene un formato válido"
      });
    }

    if (cleanPassword.length < 6) {
      return res.status(400).json({
        error: "La contraseña debe tener al menos 6 caracteres"
      });
    }

    const createdUser = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        passwordHash: `hash_temporal_${cleanPassword}`
      },
      select: userSafeSelect
    });

    return res.status(201).json({
      message: "Usuario creado con Prisma",
      data: createdUser
    });
  } catch (error) {
    next(error);
  }
});
```

Prueba `POST http://localhost:3000/api/debug/prisma/users`.

Body:

```json
{
  "name": "Usuario Prisma",
  "email": "usuario.prisma@email.com",
  "password": "123456"
}
```

Respuesta esperada:

```json
{
  "message": "Usuario creado con Prisma",
  "data": {
    "id": 4,
    "name": "Usuario Prisma",
    "email": "usuario.prisma@email.com",
    "role": "USER",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

Observa que no hemos indicado `role` ni `isActive`.

Prisma aplica los valores por defecto del modelo: `role` será `USER` e
`isActive` será `true`.

### Paso 10: Comprobar el usuario en Prisma Studio

Abre Prisma Studio:

```bash
npm run prisma:studio
```

Entra en la tabla `User`.

Deberías ver el usuario creado desde la API.

Esto demuestra que la ruta Express ha escrito realmente en PostgreSQL mediante Prisma.

### Paso 11: Probar email duplicado

Vuelve a crear el mismo usuario con el mismo email:

```json
{
  "name": "Usuario Prisma Repetido",
  "email": "usuario.prisma@email.com",
  "password": "123456"
}
```

Es probable que la API devuelva un error de base de datos, porque el email es único.

Más adelante gestionaremos este error de forma más limpia.

Hoy basta con observar que la restricción existe.

La regla viene del modelo:

```prisma
email String @unique
```

### Paso 12: Mejorar temporalmente el error de email duplicado

Puedes capturar el error de forma sencilla.

Sustituye el `catch` de la ruta `POST` por:

```ts
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "El email ya está registrado"
      });
    }

    next(error);
  }
```

El código `P2002` indica una restricción única incumplida.

Con esto, el email duplicado devolverá `409 Conflict`.

Respuesta:

```json
{
  "error": "El email ya está registrado"
}
```

Más adelante moveremos esta lógica a servicios y repositorios.

### Paso 13: Filtrar usuarios activos con `where`

Añade otra ruta temporal:

```ts
app.get("/api/debug/prisma/users-active", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        isActive: true
      },
      select: userSafeSelect,
      orderBy: {
        id: "asc"
      }
    });

    return res.status(200).json({
      message: "Usuarios activos obtenidos con Prisma",
      total: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
});
```

!!! warning "Orden de las rutas"
    La ruta de usuarios activos debe ir antes de la ruta dinámica. Si esta
    última va primero, Express podría interpretar `users-active` como un `id`.

```ts
app.get("/api/debug/prisma/users/:id", ...)
```

Prueba `GET http://localhost:3000/api/debug/prisma/users-active`.

Aquí practicamos `where`, `isActive` y `findMany`.

### Paso 14: Orden recomendado de rutas

El orden de rutas debería ser:

```ts
app.get("/api/debug/prisma/users-active", ...);

app.get("/api/debug/prisma/users", ...);

app.get("/api/debug/prisma/users/:id", ...);

app.post("/api/debug/prisma/users", ...);
```

!!! tip "Regla general"
    Las rutas más concretas deben ir antes que las rutas con parámetros.

### Paso 15: Crear el documento del día 25

Dentro de la carpeta `docs/`, crea:

```text
docs/dia-25-consultas-basicas-prisma.md
```

Añade este contenido inicial:

````md
# Día 25 - Consultas básicas con Prisma Client

## Qué he hecho

- He creado el archivo src/prisma.ts.
- He importado Prisma Client en la API.
- He creado rutas temporales de debug.
- He usado findMany para listar usuarios.
- He usado findUnique para consultar un usuario por id.
- He usado create para crear un usuario.
- He usado select para no devolver passwordHash.
- He usado where para filtrar usuarios activos.
- He usado orderBy para ordenar resultados.
- He comprobado los datos con Prisma Studio.
- He probado el error de email duplicado.

## Archivo creado

```text
src/prisma.ts
```

## Código principal

```ts
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
```

## Rutas temporales creadas

```text
GET  /api/debug/prisma/users
GET  /api/debug/prisma/users/:id
GET  /api/debug/prisma/users-active
POST /api/debug/prisma/users
```

## Operaciones Prisma usadas

| Operación | Para qué sirve |
|---|---|
| `findMany` | Obtener varios usuarios |
| `findUnique` | Obtener un usuario único |
| `create` | Crear un usuario |
| `select` | Elegir campos devueltos |
| `where` | Filtrar registros |
| `orderBy` | Ordenar resultados |

## Nota de seguridad

Aunque el modelo User contiene passwordHash, la API no debe devolverlo.

Por eso usamos:

```ts
select: {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
}
```

## Explicación personal

Prisma Client permite consultar y modificar PostgreSQL desde TypeScript usando métodos como findMany, findUnique y create. En este día hemos usado rutas temporales para entender el funcionamiento antes de organizar el código por capas.
````

### Paso 16: Actualizar el README

Añade una sección al README:

````md
## Consultas básicas con Prisma Client

El proyecto ya utiliza Prisma Client desde Express.

Archivo principal:

```text
src/prisma.ts
```

Operaciones trabajadas:

```text
findMany
findUnique
create
select
where
orderBy
```

Rutas temporales de prueba:

```text
GET  /api/debug/prisma/users
GET  /api/debug/prisma/users/:id
GET  /api/debug/prisma/users-active
POST /api/debug/prisma/users
```

Estas rutas son temporales. Más adelante la lógica se moverá a rutas, controladores, servicios y repositorios.
````

### Paso 17: Actualizar el índice del README

Añade el enlace:

```md
- [Día 25 - Consultas básicas con Prisma Client](docs/dia-25-consultas-basicas-prisma.md)
```

El bloque debería quedar parecido a:

```md
## Documentación del reto

- [Día 1 - Diseño inicial](docs/dia-01-diseno-inicial.md)
- [Día 2 - Preparación del proyecto](docs/dia-02-preparacion-proyecto.md)
- [Día 3 - Primer endpoint](docs/dia-03-primer-endpoint.md)
- [Día 4 - Métodos HTTP](docs/dia-04-metodos-http.md)
- [Día 5 - JSON, body, params y headers](docs/dia-05-json-body-params-headers.md)
- [Día 6 - Cliente HTTP y depuración](docs/dia-06-cliente-depuracion.md)
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
```

### Paso 18: Guardar cambios en Git

Comprueba los cambios:

```bash
git status
```

Añade los archivos:

```bash
git add .
```

Crea un commit:

```bash
git commit -m "Dia 25 - Consultas basicas con Prisma Client"
```

Sube los cambios:

```bash
git push
```

## Problemas frecuentes

### Error: Prisma Client no está generado

Ejecuta:

```bash
npx prisma generate
```

Después reinicia el servidor.

### Error de conexión con PostgreSQL

Comprueba:

```bash
docker compose up -d
docker compose ps
```

Y revisa:

```env
DATABASE_URL="postgresql://usermanager:usermanager_password@localhost:5432/usermanager_db"
```

### No aparecen usuarios

Ejecuta el seed:

```bash
npm run prisma:seed
```

Después comprueba con Prisma Studio.

### Aparece `passwordHash` en la respuesta

Revisa que estés usando `select`.

No uses:

```ts
const users = await prisma.user.findMany();
```

Usa:

```ts
const users = await prisma.user.findMany({
  select: userSafeSelect
});
```

### Error al crear email duplicado

Es normal.

El email es único.

Puedes capturar temporalmente el error `P2002` y devolver `409`.

### Express interpreta una ruta como ID

Si tienes:

```ts
app.get("/api/debug/prisma/users/:id", ...)
```

antes de:

```ts
app.get("/api/debug/prisma/users-active", ...)
```

Express puede interpretar `users-active` como un parámetro.

**Solución:** pon las rutas más concretas antes que las rutas con parámetros.

## Parte libre

### Tarea libre 1: Buscar usuario por email

Crea la ruta temporal `GET /api/debug/prisma/users-by-email/:email`.

Debe buscar usando:

```ts
findUnique({
  where: {
    email
  }
})
```

Recuerda no devolver `passwordHash`.

### Tarea libre 2: Listar usuarios inactivos

Crea la ruta temporal `GET /api/debug/prisma/users-inactive`.

Debe devolver usuarios con:

```ts
isActive: false
```

### Tarea libre 3: Crear usuario con rol ADMIN

Crea una ruta temporal o prueba en el código cómo crear un usuario con
`role: "ADMIN"`.

Después comprueba en Prisma Studio que aparece correctamente.

### Tarea libre 4: Comparar memoria y Prisma

Completa esta tabla:

| Operación       | Array en memoria    | Prisma |
| --------------- | ------------------- | ------ |
| Listar usuarios | `users`             |        |
| Buscar por id   | `users.find(...)`   |        |
| Crear usuario   | `users.push(...)`   |        |
| Filtrar activos | `users.filter(...)` |        |

### Tarea libre 5: Explicar por qué estas rutas son temporales

Añade una sección:

```md
## Por qué usamos rutas debug
```

Explica por qué hoy no hemos migrado directamente las rutas finales `/api/users`.

Idea orientativa:

```text
Primero queremos entender las operaciones básicas de Prisma. Después moveremos esta lógica a una arquitectura por capas con rutas, controladores, servicios y repositorios.
```

## Entrega recomendada del día 25

Las respuestas no se entregan como archivo suelto. Deben quedar dentro del repositorio de GitHub.

Al finalizar el día 25, el repositorio debería tener esta estructura aproximada:

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
```

El documento del día 25 deberá estar en:

```text
docs/dia-25-consultas-basicas-prisma.md
```

Y deberá incluir:

- Resumen de lo realizado.
- Archivo `src/prisma.ts`.
- Rutas temporales creadas.
- Operaciones Prisma usadas.
- Explicación de `findMany`.
- Explicación de `findUnique`.
- Explicación de `create`.
- Uso de `select` para no devolver `passwordHash`.
- Comprobación con Prisma Studio.
- Comparación entre el array en memoria y Prisma.
- Explicación de por qué las rutas de debug son temporales.

En el foro, se compartirá el enlace actualizado al repositorio.

Ejemplo de mensaje:

```text
Hola, comparto el avance del día 25 del reto UserManager API:

https://github.com/usuario/usermanager-api

He usado Prisma Client desde Express para hacer consultas básicas con findMany, findUnique y create. La documentación está en:

docs/dia-25-consultas-basicas-prisma.md
```

## Cierre del día

Hoy hemos usado Prisma Client desde nuestra API por primera vez.

Ya no solo tenemos modelo, migraciones, Studio y seed. Ahora Express puede comunicarse con PostgreSQL usando Prisma.

Hoy hemos trabajado:

- Prisma Client.
- `src/prisma.ts`.
- `findMany`.
- `findUnique`.
- `create`.
- `select`.
- `where`.
- `orderBy`.
- Rutas temporales de debug.
- Protección de `passwordHash`.
- Comprobación con Prisma Studio.

Este día es un puente entre la fase de persistencia y la fase de arquitectura.

A partir del siguiente día empezaremos a ordenar el proyecto para que estas consultas no estén mezcladas directamente en `server.ts`.

!!! success "Idea clave"
    Prisma Client permite que nuestra API consulte y modifique PostgreSQL desde
    TypeScript, pero debemos controlar siempre qué datos salen hacia el cliente.
