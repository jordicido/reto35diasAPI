# Día 24: Seed de datos iniciales

En los últimos días hemos avanzado mucho en la parte de persistencia del proyecto.

Ya tenemos:

- El modelo persistente `User`.
- Prisma instalado.
- El modelo `User` definido en `prisma/schema.prisma`.
- Una migración inicial aplicada sobre PostgreSQL.
- Prisma Client generado en `src/generated/prisma`.

Ahora tenemos una base de datos con estructura, pero todavía sin datos útiles.

Hoy vamos a crear datos iniciales de forma controlada mediante un **seed**.

Un seed es un script que inserta datos iniciales en la base de datos.

En nuestro caso crearemos:

- Un usuario `ADMIN`.
- Un usuario `USER` activo.
- Un usuario `USER` inactivo.

!!! info "Objetivo"
    No queremos crear datos manualmente cada vez desde Prisma Studio o Adminer.
    El proyecto debe poder generar sus datos iniciales con `npm run prisma:seed`
    o directamente con `npx prisma db seed`.

## ¿Qué vamos a trabajar hoy?

Hoy trabajaremos estos conceptos:

| Concepto | Qué aprenderemos |
| --- | --- |
| Seed | Cómo generar datos iniciales mediante un script |
| Prisma Client | Cómo usar el cliente generado en `src/generated/prisma` |
| Adapter de PostgreSQL | Cómo conectar Prisma 7 con PostgreSQL |
| `upsert` | Cómo evitar registros duplicados |
| `prisma db seed` | Cómo ejecutar el seed del proyecto |
| Prisma Studio | Cómo comprobar los datos creados |

El producto del día será el archivo `prisma/seed.ts` con usuarios iniciales.

El resultado esperado será poder ejecutar el seed varias veces sin duplicar usuarios.

## ¿Qué es un seed?

Un seed es un script que introduce datos iniciales en una base de datos.

En nuestro caso, el seed creará usuarios básicos para poder probar el proyecto.

Por ejemplo: **Admin Principal**, **Usuario Demo** y **Usuario Inactivo**.

Esto es útil porque, cuando alguien clone el proyecto o reinicie la base de datos,
podrá dejarla preparada ejecutando un comando.

Sin seed, cada persona tendría que entrar manualmente en Prisma Studio o Adminer
y crear los usuarios uno a uno.

Con seed, el flujo será:

```mermaid
flowchart LR
    A[Base de datos vacía] --> B[Ejecutar seed]
    B --> C[Crear usuarios iniciales]
    C --> D[Base de datos preparada]
```

## ¿Para qué sirve el seed en este reto?

En este reto, el seed nos servirá para tener usuarios con distintos roles y
estados.

Necesitaremos al menos:

- Un `ADMIN` para probar acciones de administración.
- Un `USER` activo para probar acciones normales.
- Un `USER` inactivo para probar restricciones futuras.

Más adelante, cuando tengamos login, JWT y roles, estos usuarios nos permitirán
probar casos como:

- Un `ADMIN` puede listar usuarios.
- Un `USER` no puede listar usuarios.
- Un usuario inactivo no puede iniciar sesión.
- Un `ADMIN` puede activar o desactivar usuarios.

Aunque todavía no hemos implementado login ni roles en endpoints protegidos,
podemos preparar los datos desde ahora.

## Migración frente a seed

Es importante no confundir estos dos conceptos.

| Concepto | Qué hace | Ejemplo |
| --- | --- | --- |
| Migración | Crea o modifica la estructura de la base de datos | Crear la tabla `User` |
| Seed | Inserta datos iniciales | Crear `admin@email.com` |

La migración responde a **qué tablas y campos existen**.

El seed responde a **qué datos iniciales queremos tener**.

Visualmente:

```mermaid
flowchart LR
    A[schema.prisma] --> B[Migración]
    B --> C[Tabla User]
    C --> D[Seed]
    D --> E[Usuarios iniciales]
```

## Importante sobre este proyecto

Este proyecto usa Prisma 7 con el generator nuevo:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}
```

Por eso el cliente de Prisma **no se importa desde** `@prisma/client`.

En este proyecto se importa desde:

```ts
../src/generated/prisma/client
```

Además, como usamos PostgreSQL con Prisma 7, necesitamos el adapter:

```bash
npm install @prisma/adapter-pg
```

## Usuarios iniciales

| Nombre | Email | Password temporal | Role | Activo |
| --- | --- | --- | --- | --- |
| Admin Principal | `admin@email.com` | `admin123` | `ADMIN` | `true` |
| Usuario Demo | `user@email.com` | `user123` | `USER` | `true` |
| Usuario Inactivo | `inactive@email.com` | `inactive123` | `USER` | `false` |

## Nota sobre contraseñas

El modelo `User` no tiene un campo `password`.

Tiene un campo:

```ts
passwordHash
```

Esto es correcto, porque nunca debemos guardar contraseñas en texto plano.

!!! danger "Nunca guardes contraseñas en texto plano"
    Aunque hoy usemos valores temporales, nunca guardamos un campo `password`
    en la base de datos.

De momento usaremos valores temporales:

```ts
hash_temporal_admin123
hash_temporal_user123
hash_temporal_inactive123
```

Más adelante se sustituirán por hashes reales generados con `bcrypt`.

## Datos manuales frente a seed

Podríamos crear usuarios manualmente desde Prisma Studio o Adminer, pero esos
datos no quedarían bien documentados en el proyecto.

| Forma de crear datos | Ventaja | Problema |
| --- | --- | --- |
| Prisma Studio | Rápido para pruebas puntuales | No queda documentado en el código |
| Adminer | Permite trabajar directamente con la base de datos | Puede ser fácil cometer errores |
| Seed | Repetible y versionado | Requiere escribir un script |

El seed es la opción más adecuada para datos iniciales del proyecto.

## Parte guiada

### Paso 1: Comprobar PostgreSQL

Arranca la base de datos:

```bash
docker compose up -d
```

Comprueba que el contenedor está activo:

```bash
docker compose ps
```

### Paso 2: Comprobar la migración

Debe existir la carpeta:

```text
prisma/migrations/
```

Si no existe, ejecuta primero:

```bash
npm run prisma:migrate
```

### Paso 3: Instalar el adapter de PostgreSQL

Como este proyecto usa Prisma 7, instalamos el adapter:

```bash
npm install @prisma/adapter-pg
```

En `package.json` debe aparecer:

```json
"dependencies": {
  "@prisma/adapter-pg": "...",
  "@prisma/client": "..."
}
```

### Paso 4: Crear `prisma/seed.ts`

Crea el archivo:

```text
prisma/seed.ts
```

Con este contenido:

```ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.upsert({
    where: {
      email: "admin@email.com"
    },
    update: {},
    create: {
      name: "Admin Principal",
      email: "admin@email.com",
      passwordHash: "hash_temporal_admin123",
      role: Role.ADMIN,
      isActive: true
    }
  });

  const user = await prisma.user.upsert({
    where: {
      email: "user@email.com"
    },
    update: {},
    create: {
      name: "Usuario Demo",
      email: "user@email.com",
      passwordHash: "hash_temporal_user123",
      role: Role.USER,
      isActive: true
    }
  });

  const inactiveUser = await prisma.user.upsert({
    where: {
      email: "inactive@email.com"
    },
    update: {},
    create: {
      name: "Usuario Inactivo",
      email: "inactive@email.com",
      passwordHash: "hash_temporal_inactive123",
      role: Role.USER,
      isActive: false
    }
  });

  console.log("Seed ejecutado correctamente:");
  console.log({ admin, user, inactiveUser });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Error ejecutando el seed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
```

### Paso 5: Entender el cliente de Prisma

En este proyecto no usamos:

```ts
import { PrismaClient } from "@prisma/client";
```

Usamos:

```ts
import { PrismaClient, Role } from "../src/generated/prisma/client";
```

Esto ocurre porque en `schema.prisma` hemos indicado un output personalizado:

```prisma
output = "../src/generated/prisma"
```

### Paso 6: Entender el adapter

Con Prisma 7 y PostgreSQL, el cliente necesita un adapter:

```ts
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });
```

La variable `DATABASE_URL` debe estar definida en `.env`.

Ejemplo:

```env
DATABASE_URL="postgresql://usermanager:usermanager_password@localhost:5432/usermanager_db"
```

### Paso 7: Entender `upsert`

Usamos `upsert` para que el seed sea repetible.

```ts
await prisma.user.upsert({
  where: {
    email: "admin@email.com"
  },
  update: {},
  create: {
    name: "Admin Principal",
    email: "admin@email.com",
    passwordHash: "hash_temporal_admin123",
    role: Role.ADMIN,
    isActive: true
  }
});
```

Esto significa:

- Si existe un usuario con ese email, no se crea otro.
- Si no existe, se crea.
- Podemos ejecutar el seed varias veces sin duplicar usuarios.

### Paso 8: Configurar Prisma Seed

Como este proyecto tiene `prisma.config.ts`, configuramos el seed ahí.

Archivo:

```text
prisma.config.ts
```

Contenido esperado:

```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

### Paso 9: Configurar `package.json`

En `package.json`, añadimos un script cómodo:

```json
"scripts": {
  "prisma:seed": "prisma db seed"
}
```

También puede mantenerse esta configuración:

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

Pero en este proyecto, como existe `prisma.config.ts`, lo importante es tener:

```ts
seed: "tsx prisma/seed.ts"
```

dentro de `migrations`.

### Paso 10: Ajustar `tsconfig.json`

Como `rootDir` apunta a `src`, el build no debe intentar compilar `prisma/seed.ts`.

Configuración recomendada:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

El seed se ejecuta con `tsx`, no forma parte del build de producción.

### Paso 11: Generar Prisma Client

Después de cambios en `schema.prisma`, ejecuta:

```bash
npm run prisma:generate
```

O:

```bash
npx prisma generate
```

### Paso 12: Ejecutar el seed

Ejecuta:

```bash
npm run prisma:seed
```

O directamente:

```bash
npx prisma db seed
```

Si todo va bien, verás algo parecido a:

```text
Seed ejecutado correctamente:
{
  admin: { ... },
  user: { ... },
  inactiveUser: { ... }
}
```

### Paso 13: Comprobar en Prisma Studio

Abre Prisma Studio:

```bash
npm run prisma:studio
```

O:

```bash
npx prisma studio
```

Comprueba la tabla `User`.

Deben existir estos usuarios:

| Email | Role | isActive |
| --- | --- | --- |
| `admin@email.com` | `ADMIN` | `true` |
| `user@email.com` | `USER` | `true` |
| `inactive@email.com` | `USER` | `false` |

### Paso 14: Ejecutar el seed otra vez

Vuelve a ejecutar:

```bash
npm run prisma:seed
```

No deberían crearse usuarios duplicados.

Esto ocurre porque usamos `upsert` y buscamos cada usuario por `email`.

### Paso 15: Documentar el día 24

Dentro de la carpeta `docs/`, el avance del día debe quedar documentado.

El documento final debe explicar:

- Qué es un seed.
- Qué archivo se ha creado.
- Qué usuarios iniciales se han insertado.
- Por qué se usa `upsert`.
- Qué diferencia hay entre migración y seed.
- Cómo se comprueban los usuarios con Prisma Studio.

### Paso 16: Actualizar el README

Añade una sección al `README.md` con el comando del seed:

```bash
npm run prisma:seed
```

También puedes indicar el comando directo:

```bash
npx prisma db seed
```

Y los usuarios iniciales:

| Email | Role | Estado |
| --- | --- | --- |
| `admin@email.com` | `ADMIN` | activo |
| `user@email.com` | `USER` | activo |
| `inactive@email.com` | `USER` | inactivo |

### Paso 17: Guardar cambios en Git

Comprueba los cambios:

```bash
git status
```

Deberías ver cambios en archivos como:

```text
prisma/seed.ts
prisma.config.ts
package.json
README.md
docs/dia24.md
```

Añade los archivos:

```bash
git add .
```

Crea un commit:

```bash
git commit -m "Dia 24 - Crear seed de datos iniciales"
```

Sube los cambios:

```bash
git push
```

## Flujo final recomendado

```bash
docker compose up -d
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run prisma:studio
```

## Problemas frecuentes

### Error: Prisma Client no está generado

Ejecuta:

```bash
npm run prisma:generate
```

O directamente:

```bash
npx prisma generate
```

Después vuelve a ejecutar el seed.

### Error: no se encuentra `@prisma/adapter-pg`

Instala el adapter:

```bash
npm install @prisma/adapter-pg
```

Este proyecto usa Prisma 7 con PostgreSQL, por eso el seed crea el cliente con:

```ts
const prisma = new PrismaClient({ adapter });
```

### Error de conexión con PostgreSQL

Comprueba que la base de datos está arrancada:

```bash
docker compose up -d
docker compose ps
```

Y revisa `DATABASE_URL`:

```env
DATABASE_URL="postgresql://usermanager:usermanager_password@localhost:5432/usermanager_db"
```

### Error por email duplicado

Si estás usando `upsert`, no debería duplicar usuarios.

Revisa que no estés usando `create` directamente.

Debe aparecer algo así:

```ts
await prisma.user.upsert({
  where: {
    email: "admin@email.com"
  },
  update: {},
  create: {
    ...
  }
});
```

### Error al importar Prisma Client

En este proyecto no importamos desde:

```ts
import { PrismaClient } from "@prisma/client";
```

Importamos desde el cliente generado:

```ts
import { PrismaClient, Role } from "../src/generated/prisma/client";
```

### No veo los usuarios en Prisma Studio

Comprueba:

- Que el seed se ha ejecutado sin errores.
- Que Prisma Studio apunta a la misma `DATABASE_URL`.
- Que estás mirando la tabla `User`.
- Que PostgreSQL está arrancado.
- Que has generado Prisma Client después de cambiar `schema.prisma`.

### `passwordHash` parece una contraseña falsa

Es normal.

Hoy usamos valores temporales como:

```text
hash_temporal_admin123
```

Más adelante implementaremos hashes reales con `bcrypt`.

## Parte libre

### Tarea libre 1: Explicar qué es un seed

Añade una sección:

```md
## Qué es un seed
```

Explícalo con tus palabras.

Idea orientativa:

```text
Un seed es un script que crea datos iniciales en una base de datos para que el proyecto pueda probarse o arrancar con información mínima.
```

### Tarea libre 2: Explicar por qué usamos `upsert`

Añade una sección:

```md
## Por qué usamos upsert
```

Explica qué problema tendríamos si usáramos `create` y ejecutáramos el seed dos
veces.

### Tarea libre 3: Añadir un cuarto usuario de prueba

Añade un cuarto usuario al seed con esta propuesta:

| Campo | Valor |
| --- | --- |
| `name` | `Editor Demo` |
| `email` | `editor@email.com` |
| `passwordHash` | `hash_temporal_editor123` |
| `role` | `USER` |
| `isActive` | `true` |

Como solo tenemos roles `USER` y `ADMIN`, este usuario seguirá siendo `USER`.

Después comprueba que aparece en Prisma Studio.

### Tarea libre 4: Comparar migración y seed

Completa esta tabla:

| Concepto | Cambia estructura | Inserta datos | Se guarda en el repositorio |
| --- | --- | --- | --- |
| Migración | | | |
| Seed | | | |

### Tarea libre 5: Preparar los datos para futuras pruebas

Añade una tabla con casos de prueba futuros:

| Caso futuro | Usuario que servirá para probarlo |
| --- | --- |
| Login como ADMIN | |
| Login como USER | |
| Usuario inactivo no puede entrar | |
| ADMIN lista usuarios | |
| USER no puede listar usuarios | |

## Entrega recomendada del día 24

Las respuestas no se entregan como archivo suelto. Deben quedar dentro del
repositorio de GitHub.

Al finalizar el día 24, el repositorio debería tener esta estructura aproximada:

```text
usermanager-api/
  .env.example
  .gitignore
  docker-compose.yml
  README.md
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
    server.ts
  docs/
    dia1.md
    dia2.md
    dia3.md
    ...
    dia23.md
    dia24.md
```

El documento del día 24 deberá estar en:

```text
docs/dia24.md
```

Y deberá incluir:

- Resumen de lo realizado.
- Comando principal usado.
- Usuarios creados.
- Archivo `prisma/seed.ts`.
- Configuración de seed en `prisma.config.ts`.
- Script `prisma:seed`.
- Explicación del adapter de PostgreSQL.
- Explicación de `upsert`.
- Nota sobre `passwordHash` temporal.
- Comparación entre migración y seed.
- Comprobación con Prisma Studio.
- Casos de prueba futuros.

En el foro, se compartirá el enlace actualizado al repositorio.

Ejemplo de mensaje:

```text
Hola, comparto el avance del día 24 del reto UserManager API:

https://github.com/usuario/usermanager-api

He creado un seed con usuarios iniciales usando Prisma 7, Prisma Client generado y el adapter de PostgreSQL. La documentación está en:

docs/dia24.md
```

## Cierre del día

Hoy hemos dejado la base de datos preparada con datos iniciales.

Ya no dependemos de crear usuarios manualmente desde Prisma Studio o Adminer.
Ahora tenemos un script que puede generar los usuarios básicos del proyecto.

Al terminar, el proyecto tendrá:

- Un archivo `prisma/seed.ts`.
- Seed configurado en `prisma.config.ts`.
- Script `prisma:seed` en `package.json`.
- Tres usuarios iniciales en PostgreSQL.
- Seed repetible sin duplicados.

Hoy hemos trabajado:

- Seed.
- `prisma/seed.ts`.
- Prisma Client generado en `src/generated/prisma`.
- Adapter de PostgreSQL.
- `prisma db seed`.
- `upsert`.
- Usuario `ADMIN`.
- Usuario `USER` activo.
- Usuario `USER` inactivo.
- Comprobación con Prisma Studio.

Este paso será muy útil a partir de ahora, porque podremos probar consultas,
roles, login y permisos con usuarios ya preparados.

!!! success "Idea clave"
    Un seed permite preparar datos iniciales de forma repetible, documentada
    y fácil de comprobar durante el desarrollo.
