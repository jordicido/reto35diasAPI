# Día 24: Seed de datos iniciales

En los últimos días hemos avanzado mucho en la parte de persistencia del proyecto.

Primero diseñamos el modelo persistente `User`.

Después instalamos Prisma.

Luego definimos el modelo `User` dentro de `schema.prisma`.

A continuación ejecutamos la primera migración y comprobamos con Prisma Studio que la tabla existía correctamente en PostgreSQL.

Ahora tenemos una base de datos con estructura, pero todavía sin datos útiles.

La tabla `User` existe, pero probablemente está vacía.

Hoy vamos a crear datos iniciales de forma controlada mediante un **seed**.

Un seed es un script que inserta datos iniciales en la base de datos.

Por ejemplo:

- Un usuario `ADMIN`.
- Un usuario `USER` activo.
- Un usuario `USER` inactivo.

Estos usuarios nos servirán para probar la API durante los próximos días.

!!! info "Idea importante"
    No queremos crear datos manualmente cada vez desde Prisma Studio o Adminer.
    Queremos que el proyecto pueda generar sus datos iniciales con un comando.

## ¿Qué vamos a trabajar hoy?

Hoy trabajaremos estos conceptos:

- Seed.
- Datos iniciales.
- Prisma Client.
- `prisma db seed`.
- `upsert`.
- Datos repetibles.
- Usuario `ADMIN` inicial.
- Usuarios de prueba.
- Base de datos preparada.
- Prisma Studio para comprobar datos.

El producto del día será el archivo `prisma/seed.ts` con usuarios iniciales.

El resultado esperado será que la base de datos tenga usuarios iniciales creados mediante Prisma.

## ¿Qué es un seed?

Un seed es un script que introduce datos iniciales en la base de datos.

En nuestro caso, el seed creará usuarios básicos para poder probar el proyecto.

Por ejemplo:

- `Admin Principal`.
- `Usuario Demo`.
- `Usuario Inactivo`.

Esto es útil porque, cuando alguien clone el proyecto o reinicie la base de datos, podrá dejarla preparada ejecutando un comando.

Sin seed, cada persona tendría que entrar manualmente en Prisma Studio y crear los usuarios uno a uno.

Con seed, el flujo será:

```mermaid
flowchart LR
    A[Base de datos vacía] --> B[Ejecutar seed]
    B --> C[Crear usuarios iniciales]
    C --> D[Base de datos preparada]
```

## ¿Para qué sirve el seed en este reto?

En este reto, el seed nos servirá para tener usuarios con distintos roles y estados.

Necesitaremos al menos:

- Un `ADMIN` para probar acciones de administración.
- Un `USER` activo para probar acciones normales.
- Un `USER` inactivo para probar restricciones futuras.

Más adelante, cuando tengamos login, JWT y roles, estos usuarios nos permitirán probar casos como:

- Un `ADMIN` puede listar usuarios.
- Un `USER` no puede listar usuarios.
- Un usuario inactivo no puede iniciar sesión.
- Un `ADMIN` puede activar o desactivar usuarios.

Aunque todavía no hemos implementado login ni roles en endpoints protegidos, podemos preparar los datos desde ahora.

## Migración frente a seed

Es importante no confundir estos dos conceptos.

| Concepto  | Qué hace                                          | Ejemplo                 |
| --------- | ------------------------------------------------- | ----------------------- |
| Migración | Crea o modifica la estructura de la base de datos | Crear la tabla `User`   |
| Seed      | Inserta datos iniciales                           | Crear `admin@email.com` |

La migración responde a esta pregunta: **¿qué tablas y campos existen?**

El seed responde a esta otra: **¿qué datos iniciales queremos tener?**

Visualmente:

```mermaid
flowchart LR
    A[schema.prisma] --> B[Migración]
    B --> C[Tabla User]
    C --> D[Seed]
    D --> E[Usuarios iniciales]
```

## Qué usuarios vamos a crear

Crearemos tres usuarios iniciales.

### Usuario administrador

| Campo | Valor |
| --- | --- |
| `name` | `Admin Principal` |
| `email` | `admin@email.com` |
| `password` | `admin123` |
| `role` | `ADMIN` |
| `isActive` | `true` |

Este usuario servirá para probar las funciones de administración.

Más adelante debería poder:

- Listar usuarios.
- Cambiar roles.
- Activar y desactivar cuentas.
- Eliminar o desactivar usuarios.

### Usuario normal activo

| Campo | Valor |
| --- | --- |
| `name` | `Usuario Demo` |
| `email` | `user@email.com` |
| `password` | `user123` |
| `role` | `USER` |
| `isActive` | `true` |

Este usuario servirá para probar acciones normales.

Más adelante debería poder:

- Iniciar sesión.
- Consultar su perfil.
- Cambiar algunos de sus datos.
- Cambiar su contraseña.

### Usuario normal inactivo

| Campo | Valor |
| --- | --- |
| `name` | `Usuario Inactivo` |
| `email` | `inactive@email.com` |
| `password` | `inactive123` |
| `role` | `USER` |
| `isActive` | `false` |

Este usuario nos permitirá probar una regla importante:

!!! warning "Regla futura"
    Un usuario inactivo no puede iniciar sesión.

Todavía no implementaremos esa restricción, pero dejamos el dato preparado.

## ¿Qué pasa con las contraseñas?

Nuestro modelo `User` tiene este campo: `passwordHash`.

No tiene un campo llamado `password`.

Esto es correcto.

La contraseña real nunca debe guardarse en texto plano.

Ahora bien, todavía no estamos en la fase de seguridad. El hash con `bcrypt` lo trabajaremos más adelante.

Por eso, en el seed de hoy usaremos valores temporales como:

- `hash_temporal_admin123`
- `hash_temporal_user123`
- `hash_temporal_inactive123`

Estos valores no son hashes reales.

Son valores temporales para poder rellenar el campo obligatorio `passwordHash`.

Más adelante, cuando trabajemos seguridad, sustituiremos esto por hashes reales generados con `bcrypt`.

!!! danger "Regla importante"
    Aunque hoy usemos valores temporales, nunca guardamos un campo `password` en la base de datos.

## ¿Por qué usar `upsert`?

Podríamos crear usuarios con:

```ts
prisma.user.create(...)
```

Pero si ejecutamos el seed dos veces, aparecería un problema: **el email ya existe**.

Como `email` es único, no podemos crear dos usuarios con el mismo email.

Para evitar ese problema, usaremos `upsert`.

`upsert` significa:

- Si existe, actualiza.
- Si no existe, crea.

Viene de combinar estas dos palabras: `update + insert = upsert`.

Ejemplo conceptual:

```ts
await prisma.user.upsert({
  where: { email: "admin@email.com" },
  update: {},
  create: {
    name: "Admin Principal",
    email: "admin@email.com",
    passwordHash: "hash_temporal_admin123",
    role: "ADMIN",
    isActive: true
  }
});
```

Esto hace que el seed sea repetible.

Podremos ejecutarlo varias veces sin crear usuarios duplicados.

## Flujo del seed

El flujo del día será:

```mermaid
flowchart TD
    A[Abrir proyecto] --> B[Comprobar PostgreSQL]
    B --> C[Crear prisma/seed.ts]
    C --> D[Configurar comando de seed]
    D --> E[Ejecutar prisma db seed]
    E --> F[Comprobar usuarios en Prisma Studio]
    F --> G[Documentar resultado]
```

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
prisma/
src/
docs/
```

### Paso 2: Comprobar que la migración existe

Revisa que tienes la carpeta:

```text
prisma/migrations/
```

Y dentro una migración inicial:

```text
prisma/migrations/<timestamp>_init/migration.sql
```

Si no existe, vuelve al día 22 y ejecuta la migración antes de continuar.

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

### Paso 16: Crear el documento del día 24

Dentro de la carpeta `docs/`, crea:

```text
docs/dia-24-seed-datos-iniciales.md
```

Añade este contenido inicial:

````md
# Día 24 - Seed de datos iniciales

## Qué he hecho

- He creado el archivo prisma/seed.ts.
- He usado Prisma Client dentro del seed.
- He creado un usuario ADMIN inicial.
- He creado un usuario USER activo.
- He creado un usuario USER inactivo.
- He usado upsert para evitar duplicados.
- He configurado el comando de seed.
- He ejecutado prisma db seed.
- He comprobado los datos con Prisma Studio.
- He ejecutado el seed más de una vez para comprobar que no duplica usuarios.

## Comando principal

```bash
npx prisma db seed
```

O mediante script:

```bash
npm run prisma:seed
```

## Usuarios creados

| Nombre | Email | Role | Activo |
| --- | --- | --- |---|
| Admin Principal | admin@email.com | ADMIN | sí |
| Usuario Demo | user@email.com | USER | sí |
| Usuario Inactivo | inactive@email.com | USER | no |

## Archivo creado

```text
prisma/seed.ts
```

## Explicación de upsert

`upsert` permite crear un registro si no existe o actualizarlo si ya existe.

En este seed se usa para que los usuarios iniciales no se dupliquen aunque ejecutemos el comando varias veces.

## Nota sobre passwordHash

De momento se usan valores temporales como:

```text
hash_temporal_admin123
```

Más adelante, en la fase de seguridad, estos valores se sustituirán por hashes reales generados con bcrypt.
````

### Paso 17: Añadir comparación entre datos manuales y seed

Añade al documento:

```md
## Datos manuales frente a seed

| Forma de crear datos | Ventaja | Problema |
| --- | --- | --- |
| Prisma Studio | Rápido para pruebas puntuales | No queda documentado en el código |
| Adminer | Permite trabajar directamente con la base de datos | Puede ser fácil cometer errores |
| Seed | Repetible y versionado | Requiere escribir un script |

El seed es la opción más adecuada para datos iniciales del proyecto.
```

### Paso 18: Añadir diagrama Mermaid

Añade este diagrama:

```mermaid
flowchart LR
    A[prisma/seed.ts] --> B[Prisma Client]
    B --> C[PostgreSQL]
    C --> D[Usuarios iniciales]
```

Explicación sugerida:

```md
El archivo seed.ts usa Prisma Client para insertar usuarios iniciales en PostgreSQL. Después podemos comprobarlos con Prisma Studio.
```

### Paso 19: Actualizar el README

Añade una sección al README:

````md
## Seed de datos iniciales

El proyecto incluye un seed para crear usuarios iniciales.

Archivo:

```text
prisma/seed.ts
```

Ejecutar seed:

```bash
npx prisma db seed
```

O mediante script:

```bash
npm run prisma:seed
```

Usuarios iniciales:

| Email | Role | Estado |
| --- | --- | --- |
| `admin@email.com` | `ADMIN` | activo |
| `user@email.com` | `USER` | activo |
| `inactive@email.com` | `USER` | inactivo |

Nota:

```text
Los passwordHash son temporales hasta implementar bcrypt en la fase de seguridad.
```
````

### Paso 20: Actualizar el índice del README

Añade el enlace:

```md
- [Día 24 - Seed de datos iniciales](docs/dia-24-seed-datos-iniciales.md)
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
```

### Paso 21: Guardar cambios en Git

Comprueba los cambios:

```bash
git status
```

Deberías ver cambios en archivos como:

```text
prisma/seed.ts
package.json
README.md
docs/dia-24-seed-datos-iniciales.md
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

## Problemas frecuentes

### Error: `tsx` no encontrado

Solución:

```bash
npm install -D tsx
```

Después vuelve a ejecutar:

```bash
npx prisma db seed
```

### Error: no se reconoce el comando de seed

Revisa que hayas configurado el seed en `package.json`:

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

O, si tu proyecto usa `prisma.config.ts`, revisa:

```ts
migrations: {
  path: "prisma/migrations",
  seed: "tsx prisma/seed.ts"
}
```

### Error de conexión con la base de datos

Comprueba que PostgreSQL está arrancado:

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

### No veo los usuarios en Prisma Studio

Comprueba:

- Que el seed se ha ejecutado sin errores.
- Que Prisma Studio apunta a la misma `DATABASE_URL`.
- Que estás mirando la tabla `User`.
- Que PostgreSQL está arrancado.

### `passwordHash` parece una contraseña falsa

Es normal.

Hoy usamos valores temporales.

Más adelante implementaremos hashes reales con `bcrypt`.

## Parte libre

### Tarea libre 1: Explicar qué es un seed

Añade al documento una sección:

```md
## Qué es un seed
```

Explícalo con tus palabras.

Idea orientativa:

> Un seed es un script que crea datos iniciales en una base de datos para que el proyecto pueda probarse o arrancar con información mínima.

### Tarea libre 2: Explicar por qué usamos `upsert`

Añade una sección:

```md
## Por qué usamos upsert
```

Explica qué problema tendríamos si usáramos `create` y ejecutáramos el seed dos veces.

### Tarea libre 3: Añadir un cuarto usuario de prueba

Añade un cuarto usuario al seed.

Propuesta:

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

| Concepto  | Cambia estructura | Inserta datos | Se guarda en el repositorio |
| --------- | ----------------- | ------------- | --------------------------- |
| Migración |                   |               |                             |
| Seed      |                   |               |                             |

### Tarea libre 5: Preparar los datos para futuras pruebas

Añade una tabla al documento con casos de prueba futuros:

| Caso futuro                      | Usuario que servirá para probarlo |
| -------------------------------- | --------------------------------- |
| Login como ADMIN                 |                                   |
| Login como USER                  |                                   |
| Usuario inactivo no puede entrar |                                   |
| ADMIN lista usuarios             |                                   |
| USER no puede listar usuarios    |                                   |

## Entrega recomendada del día 24

Las respuestas no se entregan como archivo suelto. Deben quedar dentro del repositorio de GitHub.

Al finalizar el día 24, el repositorio debería tener esta estructura aproximada:

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
```

El documento del día 24 deberá estar en:

```text
docs/dia-24-seed-datos-iniciales.md
```

Y deberá incluir:

- Resumen de lo realizado.
- Comando principal usado.
- Usuarios creados.
- Archivo `prisma/seed.ts`.
- Explicación de `upsert`.
- Nota sobre `passwordHash` temporal.
- Comparación entre datos manuales y seed.
- Diagrama del flujo del seed.
- Comprobación con Prisma Studio.
- Casos de prueba futuros.

En el foro, se compartirá el enlace actualizado al repositorio.

Ejemplo de mensaje:

```text
Hola, comparto el avance del día 24 del reto UserManager API:

https://github.com/usuario/usermanager-api

He creado un seed con usuarios iniciales usando Prisma. La documentación está en:

docs/dia-24-seed-datos-iniciales.md
```

## Cierre del día

Hoy hemos dejado la base de datos preparada con datos iniciales.

Ya no dependemos de crear usuarios manualmente desde Prisma Studio o Adminer. Ahora tenemos un script que puede generar los usuarios básicos del proyecto.

Hoy hemos trabajado:

- Seed.
- `prisma/seed.ts`.
- Prisma Client.
- `prisma db seed`.
- `upsert`.
- Usuario `ADMIN`.
- Usuario `USER` activo.
- Usuario `USER` inactivo.
- Datos repetibles.
- Comprobación con Prisma Studio.

Este paso será muy útil a partir de ahora, porque podremos probar consultas, roles, login y permisos con usuarios ya preparados.

!!! success "Idea clave"
    Un seed permite que la base de datos tenga datos iniciales de forma repetible, documentada y fácil de reconstruir.
