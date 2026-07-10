# Día 25: Consultas básicas con Prisma Client

En el día 24 dejamos la base de datos preparada con datos iniciales mediante un seed.

Creamos usuarios como:

- `admin@email.com`
- `user@email.com`
- `inactive@email.com`

También vimos que, en este proyecto, estamos usando Prisma 7 con PostgreSQL y un adapter específico:

`@prisma/adapter-pg`.

Además, nuestro cliente de Prisma no se importa desde:

```ts
import { PrismaClient } from "@prisma/client";
```

sino desde el cliente generado dentro del proyecto:

```ts
import { PrismaClient } from "./generated/prisma/client";
```

Esto es importante porque en `schema.prisma` hemos configurado un `output` personalizado:

```prisma
output = "../src/generated/prisma"
```

Hoy vamos a usar Prisma Client desde nuestra API Express.

Hasta ahora hemos usado Prisma en:

`prisma/seed.ts`.

Pero todavía no lo hemos usado desde rutas de Express.

El objetivo de hoy será crear algunas rutas temporales de prueba para consultar datos reales desde PostgreSQL.

!!! info "Idea principal"
    La API ya no leerá usuarios desde un array en memoria, sino desde PostgreSQL usando Prisma Client.

## ¿Qué vamos a trabajar hoy?

Hoy trabajaremos estos conceptos:

- Prisma Client.
- Cliente generado personalizado.
- Prisma 7.
- Adapter PostgreSQL.
- Consultas básicas.
- `findMany`.
- `findUnique`.
- `create`.
- `select`.
- `where`.
- `orderBy`.
- Rutas temporales de debug.
- Conexión API → Prisma → PostgreSQL.

El producto del día será:

**Rutas temporales que consultan y crean usuarios reales usando Prisma Client.**

El resultado esperado será poder probar desde un cliente HTTP rutas como:

- `GET /api/debug/prisma/users`
- `GET /api/debug/prisma/users/:id`
- `POST /api/debug/prisma/users`

Estas rutas serán temporales.

Más adelante las reorganizaremos dentro de rutas, controladores, servicios y repositorios.

## Qué venimos de hacer

En los días anteriores ya hicimos esta secuencia:

- Día 20: Instalación y configuración inicial de Prisma.
- Día 21: Modelo Prisma User.
- Día 22: Primera migración.
- Día 23: Prisma Studio.
- Día 24: Seed de datos iniciales.

Ahora tenemos:

- PostgreSQL funcionando.
- Tabla `User` creada.
- Usuarios iniciales insertados.
- Prisma Client generado.
- Seed ejecutable.
- Prisma Studio para visualizar datos.

Hoy vamos a conectar esa base de datos con Express.

## Recordatorio de la estructura actual

Después del día 24, el proyecto debería tener una estructura parecida a esta:

```text
usermanager-api/
  .env
  .env.example
  docker-compose.yml
  package.json
  prisma.config.ts
  tsconfig.json
  prisma/
    schema.prisma
    seed.ts
    migrations/
  src/
    generated/
      prisma/
        client/
    server.ts
  docs/
```

El cliente generado está dentro de:

`src/generated/prisma/client`.

Por tanto, desde archivos que estén dentro de `src/`, lo importaremos con rutas relativas.

## Diferencia importante respecto a otros proyectos Prisma

En muchos tutoriales se usa esto:

```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
```

Pero en este proyecto no lo haremos así.

Usaremos:

```ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });
```

Esto es coherente con lo trabajado en el día 24.

En el seed ya usamos una idea parecida:

```ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "../src/generated/prisma/client";
```

En el código de la API, como estaremos dentro de `src/`, la ruta será:

```ts
import { PrismaClient } from "./generated/prisma/client";
```

## Qué rutas vamos a crear hoy

Hoy crearemos rutas temporales bajo el prefijo:

`/api/debug/prisma`.

Concretamente:

| Método | Ruta                             | Acción                  |
| ------ | -------------------------------- | ----------------------- |
| `GET`  | `/api/debug/prisma/users`        | Listar usuarios         |
| `GET`  | `/api/debug/prisma/users-active` | Listar usuarios activos |
| `GET`  | `/api/debug/prisma/users/:id`    | Buscar usuario por ID   |
| `POST` | `/api/debug/prisma/users`        | Crear usuario de prueba |

Estas rutas no serán las rutas finales del proyecto.

Son rutas de aprendizaje para comprobar que Express ya puede comunicarse con Prisma y PostgreSQL.

## Regla importante: no devolver `passwordHash`

Aunque todavía usamos valores temporales como:

`hash_temporal_admin123`,

el campo `passwordHash` sigue siendo un dato sensible.

La API no debe devolverlo en las respuestas.

Por eso usaremos `select`.

Ejemplo:

```ts
const userSafeSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
} as const;
```

Este selector indica qué campos sí queremos devolver.

No incluye:

```text
passwordHash
```

## Flujo de una consulta con Prisma

Cuando hagamos:

`GET /api/debug/prisma/users`

ocurrirá esto:

```mermaid
flowchart LR
    A[Cliente HTTP] --> B[Express]
    B --> C[Prisma Client]
    C --> D[Adapter PostgreSQL]
    D --> E[PostgreSQL]
    E --> D
    D --> C
    C --> B
    B --> A
```

La API recibirá la petición, Prisma consultará PostgreSQL y Express devolverá la respuesta en JSON.

## Parte guiada

### Paso 1: Abrir el proyecto

Abre una terminal y entra en el repositorio:

```bash
cd usermanager-api
```

Comprueba que estás en la raíz del proyecto.

Deberías ver:

```text
package.json
docker-compose.yml
prisma.config.ts
prisma/
src/
docs/
```

### Paso 2: Comprobar que PostgreSQL está arrancado

Ejecuta:

```bash
docker compose up -d
```

Después comprueba:

```bash
docker compose ps
```

El contenedor de PostgreSQL debería estar activo.

### Paso 3: Comprobar que el seed funciona

Antes de consultar desde Express, asegúrate de que la base de datos tiene datos.

Ejecuta:

```bash
npm run prisma:seed
```

O:

```bash
npx prisma db seed
```

Deberías ver algo parecido a:

```text
Seed ejecutado correctamente:
{
  admin: { ... },
  user: { ... },
  inactiveUser: { ... }
}
```

### Paso 4: Generar Prisma Client

Ejecuta:

```bash
npm run prisma:generate
```

O:

```bash
npx prisma generate
```

Esto es especialmente importante porque el cliente se genera en:

`src/generated/prisma`.

Si el cliente no está generado, los imports desde `src/generated/prisma/client` fallarán.

## Crear un cliente Prisma reutilizable

### Paso 5: Crear `src/prisma.ts`

Dentro de `src/`, crea el archivo:

```text
src/prisma.ts
```

Este archivo tendrá una única responsabilidad:

Crear y exportar una instancia de Prisma Client para usarla en la API.

Añade este contenido:

```ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL no está configurada");
}

const adapter = new PrismaPg({
  connectionString
});

export const prisma = new PrismaClient({ adapter });
```

### Paso 6: Entender `src/prisma.ts`

Este archivo hace varias cosas importantes.

Primero carga variables de entorno:

```ts
import "dotenv/config";
```

Esto permite leer:

`DATABASE_URL`

desde `.env`.

Después crea el adapter de PostgreSQL:

```ts
const adapter = new PrismaPg({
  connectionString
});
```

Y finalmente crea Prisma Client:

```ts
export const prisma = new PrismaClient({ adapter });
```

A partir de ahora, en otros archivos podremos importar:

```ts
import { prisma } from "./prisma";
```

### Paso 7: Por qué usamos un archivo separado

Podríamos crear Prisma directamente dentro de `server.ts`, pero no es buena idea.

Mejor tener:

`src/prisma.ts`,

porque más adelante lo usaremos desde:

- `repositories/`
- `services/`

El objetivo es no repetir la creación del cliente en muchos archivos.

## Preparar `server.ts`

### Paso 8: Abrir `src/server.ts`

Abre el archivo:

```text
src/server.ts
```

Comprueba que tiene una estructura parecida a esta:

```ts
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "UserManager API"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
```

### Paso 9: Importar Prisma

Añade al principio:

```ts
import { prisma } from "./prisma";
```

El inicio del archivo podría quedar así:

```ts
import express from "express";
import { prisma } from "./prisma";
```

### Paso 10: Crear selector seguro de usuario

Debajo de la configuración inicial, añade:

```ts
const userSafeSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
} as const;
```

Este selector se usará en todas las consultas de hoy.

Recuerda:

```text
No incluimos passwordHash.
```

## Crear rutas de consulta

### Paso 11: Crear `GET /api/debug/prisma/users`

Añade esta ruta:

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

Esta ruta usa:

```text
findMany
select
orderBy
```

### Paso 12: Probar listado de usuarios

Arranca la API:

```bash
npm run dev
```

Prueba:

```text
GET http://localhost:3000/api/debug/prisma/users
```

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

Comprueba que no aparece:

```text
passwordHash
```

### Paso 13: Crear `GET /api/debug/prisma/users-active`

Añade esta ruta:

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

Esta ruta usa:

```text
where
```

para filtrar usuarios activos.

### Paso 14: Probar usuarios activos

Prueba:

```text
GET http://localhost:3000/api/debug/prisma/users-active
```

Respuesta esperada:

```text
Solo deben aparecer usuarios con isActive = true.
```

Si el seed tiene tres usuarios y uno está inactivo, deberían aparecer dos usuarios activos.

### Paso 15: Crear `GET /api/debug/prisma/users/:id`

Añade:

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

Esta ruta usa:

```text
findUnique
where
id
```

### Paso 16: Probar búsqueda por ID

Prueba:

```text
GET http://localhost:3000/api/debug/prisma/users/1
```

Respuesta esperada:

```text
200 OK
```

Prueba también:

```text
GET http://localhost:3000/api/debug/prisma/users/999
```

Respuesta esperada:

```text
404 Not Found
```

Y:

```text
GET http://localhost:3000/api/debug/prisma/users/abc
```

Respuesta esperada:

```text
400 Bad Request
```

## Crear usuarios con Prisma

### Paso 17: Crear función auxiliar para errores únicos

Cuando intentemos crear un usuario con un email repetido, Prisma devolverá un error con código:

```text
P2002
```

Para evitar usar `any`, podemos crear una función auxiliar:

```ts
function isPrismaUniqueError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}
```

Añádela cerca de `userSafeSelect`.

### Paso 18: Crear `POST /api/debug/prisma/users`

Añade esta ruta:

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
    if (isPrismaUniqueError(error)) {
      return res.status(409).json({
        error: "El email ya está registrado"
      });
    }

    next(error);
  }
});
```

### Paso 19: Probar creación de usuario

Prueba:

```text
POST http://localhost:3000/api/debug/prisma/users
```

Body:

```json
{
  "name": "Usuario Prisma",
  "email": "usuario.prisma@email.com",
  "password": "123456"
}
```

Respuesta esperada:

```text
201 Created
```

La respuesta debe incluir:

```text
id
name
email
role
isActive
createdAt
updatedAt
```

Pero no debe incluir:

```text
passwordHash
```

### Paso 20: Probar email duplicado

Vuelve a enviar el mismo body:

```json
{
  "name": "Usuario Prisma",
  "email": "usuario.prisma@email.com",
  "password": "123456"
}
```

Respuesta esperada:

```text
409 Conflict
```

Mensaje esperado:

```json
{
  "error": "El email ya está registrado"
}
```

## Código orientativo completo de `server.ts`

Después de añadir las rutas, tu `server.ts` podría tener una estructura parecida a esta:

```ts
import express from "express";
import { prisma } from "./prisma";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const userSafeSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
} as const;

function isPrismaUniqueError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

app.get("/", (req, res) => {
  res.json({
    message: "UserManager API"
  });
});

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
    if (isPrismaUniqueError(error)) {
      return res.status(409).json({
        error: "El email ya está registrado"
      });
    }

    next(error);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
```

## Comprobar con Prisma Studio

Después de crear un usuario desde la API, abre Prisma Studio:

```bash
npm run prisma:studio
```

O:

```bash
npx prisma studio
```

Comprueba la tabla:

```text
User
```

Deberías ver:

```text
Los usuarios del seed.
El usuario creado desde la API.
El campo passwordHash rellenado con valor temporal.
```

Recuerda que el valor temporal se sustituirá más adelante por `bcrypt`.

## Ejecutar build

Ejecuta:

```bash
npm run build
```

Si has ajustado `tsconfig.json` como en el día 24:

```json
{
  "include": ["src"]
}
```

el build compilará solo el código de `src`.

El seed no formará parte del build de producción porque está fuera de `src`.

Esto es correcto.

## Problemas frecuentes

### Error: no se encuentra `./generated/prisma/client`

Ejecuta:

```bash
npm run prisma:generate
```

O:

```bash
npx prisma generate
```

Después comprueba que existe:

```text
src/generated/prisma/client
```

### Error: `DATABASE_URL no está configurada`

Revisa el archivo:

```text
.env
```

Debe contener algo parecido a:

```env
DATABASE_URL="postgresql://usermanager:usermanager_password@localhost:5432/usermanager_db"
```

También comprueba que en `src/prisma.ts` tienes:

```ts
import "dotenv/config";
```

### Error relacionado con `@prisma/adapter-pg`

Asegúrate de haber instalado el adapter en el día 24:

```bash
npm install @prisma/adapter-pg
```

Si no aparece en `package.json`, instálalo.

### Error por usar `@prisma/client`

En este proyecto no debemos importar así:

```ts
import { PrismaClient } from "@prisma/client";
```

Debemos importar desde el cliente generado:

```ts
import { PrismaClient } from "./generated/prisma/client";
```

En el seed, como está dentro de `prisma/`, la ruta es distinta:

```ts
import { PrismaClient, Role } from "../src/generated/prisma/client";
```

### Error al crear usuario duplicado

Si intentas crear dos usuarios con el mismo email, es correcto recibir:

```text
409 Conflict
```

El campo `email` es único.

### Aparece `passwordHash` en la respuesta

Revisa que usas:

```ts
select: userSafeSelect
```

en todas las consultas que devuelven usuarios.

### No aparecen usuarios del seed

Ejecuta:

```bash
npm run prisma:seed
```

Después abre Prisma Studio y comprueba la tabla `User`.

## Crear el documento del día 25

Dentro de `docs/`, crea:

```text
docs/dia-25-consultas-basicas-prisma.md
```

Añade este contenido inicial:

````md
# Día 25 - Consultas básicas con Prisma Client

## Qué he hecho

- He comprobado que PostgreSQL está funcionando.
- He ejecutado el seed del día 24.
- He generado Prisma Client.
- He creado src/prisma.ts.
- He configurado Prisma Client con PrismaPg.
- He importado el cliente generado desde src/generated/prisma/client.
- He creado rutas temporales de debug.
- He consultado usuarios con findMany.
- He consultado usuarios activos con where.
- He buscado usuarios por ID con findUnique.
- He creado usuarios con prisma.user.create.
- He usado select para no devolver passwordHash.
- He comprobado los datos con Prisma Studio.
- He ejecutado npm run build.

## Rutas creadas

| Método | Ruta | Acción |
| --- | --- |---|
| GET | `/api/debug/prisma/users` | Listar usuarios |
| GET | `/api/debug/prisma/users-active` | Listar usuarios activos |
| GET | `/api/debug/prisma/users/:id` | Buscar usuario por ID |
| POST | `/api/debug/prisma/users` | Crear usuario |

## Archivo creado

```text
src/prisma.ts
```

## Configuración usada

```ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL no está configurada");
}

const adapter = new PrismaPg({
  connectionString
});

export const prisma = new PrismaClient({ adapter });
```

## Selector seguro

```ts
const userSafeSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
} as const;
```

## Regla importante

```text
passwordHash no debe devolverse en las respuestas de la API.
```

## Consultas trabajadas

```text
findMany
findUnique
create
where
select
orderBy
```

## Explicación personal

Hoy la API ha empezado a comunicarse con PostgreSQL mediante Prisma Client. Las rutas creadas son temporales y sirven para comprobar que Express puede leer y crear usuarios reales en la base de datos.
````

## Añadir diagrama Mermaid

Añade al documento:

```mermaid
flowchart LR
    A[Cliente HTTP] --> B[Express]
    B --> C[src/prisma.ts]
    C --> D[Prisma Client generado]
    D --> E[PrismaPg Adapter]
    E --> F[PostgreSQL]
```

Explicación sugerida:

```md
La API usa una instancia compartida de Prisma Client configurada con el adapter de PostgreSQL. Las rutas de Express llaman a Prisma y Prisma consulta la base de datos.
```

## Añadir comparación con el CRUD en memoria

Añade:

```md
## Antes y después

| Antes | Ahora |
| --- | --- |
| Los usuarios estaban en un array | Los usuarios están en PostgreSQL |
| Al reiniciar se perdían los datos | Los datos persisten |
| Se usaba `users.find(...)` | Se usa `prisma.user.findUnique(...)` |
| Se usaba `users.push(...)` | Se usa `prisma.user.create(...)` |
| No había base de datos real | Prisma consulta PostgreSQL |
```

## Actualizar README

Añade una sección:

````md
## Consultas básicas con Prisma

La API ya puede consultar usuarios desde PostgreSQL usando Prisma Client.

Archivo de cliente compartido:

```text
src/prisma.ts
```

Este proyecto usa Prisma 7 con adapter PostgreSQL:

```ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
```

Rutas temporales de prueba:

| Método | Ruta | Acción |
| --- | --- |---|
| GET | `/api/debug/prisma/users` | Listar usuarios |
| GET | `/api/debug/prisma/users-active` | Listar usuarios activos |
| GET | `/api/debug/prisma/users/:id` | Buscar usuario por ID |
| POST | `/api/debug/prisma/users` | Crear usuario |

Regla:

```text
Las respuestas no deben incluir passwordHash.
```
````

## Actualizar índice del README

Añade:

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
```

## Guardar cambios en Git

Comprueba los cambios:

```bash
git status
```

Deberías ver cambios en archivos como:

```text
src/prisma.ts
src/server.ts
README.md
docs/dia-25-consultas-basicas-prisma.md
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

## Parte libre

### Tarea libre 1: Añadir ruta de conteo

Crea una ruta:

```text
GET /api/debug/prisma/users-count
```

Debe devolver:

```json
{
  "total": 4
}
```

Pista:

```ts
const total = await prisma.user.count();
```

### Tarea libre 2: Añadir filtro por rol

Crea una ruta:

```text
GET /api/debug/prisma/users-role/:role
```

Debe permitir probar:

```text
/api/debug/prisma/users-role/USER
/api/debug/prisma/users-role/ADMIN
```

Valida que el rol sea `USER` o `ADMIN`.

### Tarea libre 3: Explicar `select`

Añade al documento una sección:

```md
## Para qué sirve select
```

Explica por qué usamos `select` y qué problema tendríamos si devolviéramos todos los campos.

### Tarea libre 4: Explicar el adapter

Añade una sección:

```md
## Por qué usamos PrismaPg
```

Explica que este proyecto usa Prisma 7 con adapter PostgreSQL y por eso la instancia de Prisma Client se crea con:

```ts
const adapter = new PrismaPg({
  connectionString
});

export const prisma = new PrismaClient({ adapter });
```

### Tarea libre 5: Preparar el día 26

Añade una sección:

```md
## Preparación para separar rutas
```

Responde:

- ¿Qué rutas de debug hemos creado?
- ¿Por qué `server.ts` empieza a crecer demasiado?
- ¿Qué código podríamos mover a una carpeta `routes`?
- ¿Qué pasará cuando añadamos más endpoints?

Pista:

En el día 26 empezaremos a separar rutas para que `server.ts` no concentre todo el código.

## Entrega recomendada del día 25

Las respuestas no se entregan como archivo suelto. Deben quedar dentro del repositorio de GitHub.

Al finalizar el día 25, el repositorio debería tener esta estructura aproximada:

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
- Rutas creadas.
- Archivo `src/prisma.ts`.
- Configuración con `PrismaPg`.
- Import del cliente generado.
- Selector seguro.
- Consultas trabajadas.
- Comparación con el CRUD en memoria.
- Diagrama del flujo Express → Prisma → PostgreSQL.
- Problemas frecuentes.
- Preparación para separar rutas.

En el foro, se compartirá el enlace actualizado al repositorio.

Ejemplo de mensaje:

```text
Hola, comparto el avance del día 25 del reto UserManager API:

https://github.com/usuario/usermanager-api

He conectado Express con PostgreSQL usando Prisma Client y he creado rutas temporales de debug para consultar y crear usuarios. La documentación está en:

docs/dia-25-consultas-basicas-prisma.md
```

## Cierre del día

Hoy hemos conectado por primera vez nuestra API Express con PostgreSQL usando Prisma Client.

Ya no dependemos únicamente de arrays en memoria.

Ahora podemos consultar usuarios reales, creados mediante el seed, y también crear nuevos usuarios desde una ruta HTTP.

Hoy hemos trabajado:

- Prisma Client.
- Cliente generado en `src/generated/prisma`.
- `PrismaPg` adapter.
- `src/prisma.ts`.
- `findMany`.
- `findUnique`.
- `create`.
- `where`.
- `select`.
- `orderBy`.
- Rutas temporales de debug.
- No devolver `passwordHash`.
- Prisma Studio.

Este paso es clave porque conecta todas las piezas trabajadas hasta ahora:

`Express + Prisma + PostgreSQL + Seed`

A partir del próximo día empezaremos a organizar mejor el código separando rutas.

!!! success "Idea clave"
    Prisma Client permite que nuestra API trabaje con datos reales de PostgreSQL usando código TypeScript, manteniendo el acceso a datos más claro y seguro que escribir consultas SQL manualmente.
