# Día 22: Primera migración con Prisma

En el día 21 definimos el modelo `User` dentro de `schema.prisma`.

Nuestro archivo quedó preparado con un enum `Role` y un modelo `User` parecido a este:

```prisma
enum Role {
  USER
  ADMIN
}

model User {
  id           Int      @id @default(autoincrement())
  name         String
  email        String   @unique
  passwordHash String
  role         Role     @default(USER)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

Ese modelo ya existe en nuestro proyecto, pero todavía no existe como tabla real en PostgreSQL.

Hoy vamos a dar el siguiente paso: crear la primera migración.

Una migración es un conjunto de instrucciones que transforma la estructura de la base de datos para adaptarla a nuestro modelo.

!!! info "En pocas palabras"
    `schema.prisma` describe cómo queremos que sea la base de datos y la
    migración aplica esos cambios en PostgreSQL.

Hoy no vamos a crear usuarios todavía. Eso llegará en el día 24 con el seed.

El objetivo de hoy será que Prisma cree la tabla `User` en PostgreSQL a partir del modelo definido.

## ¿Qué vamos a trabajar hoy?

Hoy trabajaremos estos conceptos:

| Concepto | Qué aprenderemos |
| --- | --- |
| Migración | Cómo versionar cambios en la estructura de datos |
| Prisma Migrate | Cómo gestionar migraciones con Prisma |
| `prisma migrate dev` | Cómo crear y aplicar una migración en desarrollo |
| `migration.sql` | Cómo Prisma traduce el esquema a SQL |
| Historial de migraciones | Cómo registrar los cambios aplicados |
| Tabla `_prisma_migrations` | Dónde controla Prisma el estado de las migraciones |
| PostgreSQL | Cómo aplicar el modelo sobre la base de datos |
| Sincronización | Cómo mantener alineados el esquema y la base de datos |
| Validación | Cómo comprobar la estructura resultante |

El producto del día será la primera migración creada y aplicada.

El resultado esperado será que la tabla `User` exista en PostgreSQL.

## ¿Qué es una migración?

Una migración es una forma controlada de modificar la estructura de una base de datos.

Por ejemplo, si nuestra aplicación necesita una tabla de usuarios, podríamos crearla manualmente con SQL.

Pero en un proyecto profesional es mejor que esos cambios estén versionados y formen parte del repositorio.

Una migración permite responder preguntas como:

- Qué cambió en la base de datos.
- Cuándo cambió.
- Quién lo cambió.
- Cómo se puede reconstruir la estructura desde cero.

En nuestro caso, la primera migración creará la tabla correspondiente al modelo `User`.

El flujo será:

```mermaid
flowchart LR
    A[schema.prisma] --> B[Prisma Migrate]
    B --> C[Archivo migration.sql]
    C --> D[PostgreSQL]
    D --> E[Tabla User]
```

## ¿Por qué no crear la tabla manualmente?

Podríamos entrar en Adminer y escribir SQL manualmente:

```sql
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);
```

Pero no lo haremos así.

Si creamos tablas manualmente, el proyecto depende de pasos que no quedan bien registrados.

En cambio, con Prisma:

- El modelo se define en `schema.prisma`.
- La migración queda guardada en `prisma/migrations`.
- La base de datos puede reconstruirse.
- El equipo puede compartir los cambios.
- El repositorio contiene la evolución del esquema.

!!! tip "Principio importante"
    La estructura de la base de datos también forma parte del código del proyecto.

## ¿Qué hará `prisma migrate dev`?

El comando que usaremos será:

```bash
npx prisma migrate dev --name init
```

Este comando hará varias cosas:

1. Leerá `schema.prisma`.
2. Detectará que existe un modelo `User`.
3. Creará una carpeta de migración.
4. Generará un archivo `migration.sql`.
5. Aplicará la migración en PostgreSQL.
6. Actualizará el historial de migraciones.
7. Generará Prisma Client.

El nombre `init` indica que será nuestra migración inicial.

La carpeta generada tendrá un nombre parecido a:

```text
prisma/migrations/20260627120000_init/
```

Dentro aparecerá:

```text
migration.sql
```

Ese archivo contendrá las instrucciones SQL que Prisma ha generado.

## ¿Qué es `migration.sql`?

`migration.sql` es el archivo SQL que Prisma genera a partir de nuestro modelo.

Aunque nosotros trabajamos en `schema.prisma`, PostgreSQL entiende SQL.

Por eso Prisma traduce el modelo a instrucciones SQL.

El archivo puede tener una forma parecida a esta:

```sql
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

No hace falta memorizar todo este SQL.

Lo importante es entender que Prisma lo ha generado a partir del modelo `User`.

## ¿Qué es la tabla `_prisma_migrations`?

Cuando Prisma aplica migraciones, guarda un historial interno en la base de datos.

Ese historial se guarda en una tabla llamada:

```text
_prisma_migrations
```

Esta tabla permite a Prisma saber qué migraciones ya han sido aplicadas.

Por ejemplo, Prisma puede distinguir entre:

- La migración `init` aplicada.
- Otra migración pendiente.
- Otra migración ya aplicada.

No debemos editar esta tabla manualmente.

Solo sirve para que Prisma controle el estado de las migraciones.

## Modelo, migración y tabla

Conviene diferenciar estos tres conceptos:

| Concepto  | Dónde está                            | Para qué sirve                               |
| --------- | ------------------------------------- | -------------------------------------------- |
| Modelo    | `prisma/schema.prisma`                | Describe cómo queremos que sea la estructura |
| Migración | `prisma/migrations/.../migration.sql` | Guarda el cambio que se aplicará             |
| Tabla     | PostgreSQL                            | Almacena los datos reales                    |

El flujo correcto es:

```mermaid
flowchart TD
    A[Editamos schema.prisma] --> B[Ejecutamos migrate dev]
    B --> C[Se crea migration.sql]
    C --> D[Se aplica en PostgreSQL]
    D --> E[La tabla existe en la base de datos]
```

## ¿Qué diferencia hay entre `migrate dev` y `db push`?

Prisma tiene otro comando llamado:

```bash
npx prisma db push
```

Ese comando también puede sincronizar el esquema con la base de datos.

Pero para este reto usaremos:

```bash
npx prisma migrate dev
```

¿Por qué?

Porque `migrate dev` crea un historial de migraciones.

Eso es mejor para un proyecto que queremos documentar, versionar y reconstruir.

Resumen sencillo:

| Comando              | Crea historial de migraciones | Uso recomendado                        |
| -------------------- | ----------------------------- | -------------------------------------- |
| `prisma migrate dev` | sí                            | Desarrollo con migraciones versionadas |
| `prisma db push`     | no                            | Prototipos rápidos                     |

En este reto queremos aprender una forma más profesional de evolucionar la base de datos, así que usaremos migraciones.

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

### Paso 2: Arrancar PostgreSQL

Antes de ejecutar la migración, asegúrate de que PostgreSQL está funcionando.

Ejecuta:

```bash
docker compose up -d
```

Comprueba los contenedores:

```bash
docker compose ps
```

Deberías ver el contenedor de PostgreSQL en ejecución.

### Paso 3: Revisar `DATABASE_URL`

Abre el archivo `.env`.

Comprueba que tienes una variable parecida a esta:

```env
DATABASE_URL="postgresql://usermanager:usermanager_password@localhost:5432/usermanager_db"
```

Esta URL debe coincidir con lo configurado en `docker-compose.yml`.

Por ejemplo:

```yaml
environment:
  POSTGRES_USER: usermanager
  POSTGRES_PASSWORD: usermanager_password
  POSTGRES_DB: usermanager_db
ports:
  - "5432:5432"
```

Si estos datos no coinciden, Prisma no podrá conectarse a la base de datos.

### Paso 4: Revisar el modelo `User`

Abre `prisma/schema.prisma`.

Comprueba que tienes el enum y el modelo:

```prisma
enum Role {
  USER
  ADMIN
}

model User {
  id           Int      @id @default(autoincrement())
  name         String
  email        String   @unique
  passwordHash String
  role         Role     @default(USER)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Paso 5: Validar el esquema antes de migrar

Ejecuta:

```bash
npx prisma validate
```

Si el esquema es válido, puedes continuar.

Si hay errores, no ejecutes la migración todavía.

Primero corrige el archivo `schema.prisma`.

### Paso 6: Ejecutar la primera migración

Ahora ejecuta:

```bash
npx prisma migrate dev --name init
```

El nombre `init` indica que es la migración inicial.

Durante el proceso, Prisma puede mostrar mensajes como:

```text
Applying migration `20260627120000_init`
The following migration(s) have been created and applied
Generated Prisma Client
```

El timestamp será diferente en cada equipo.

### Paso 7: Revisar la carpeta de migraciones

Después de ejecutar el comando, revisa la carpeta:

```text
prisma/migrations/
```

Deberías ver algo parecido a:

```text
prisma/
  migrations/
    20260627120000_init/
      migration.sql
  schema.prisma
```

El nombre exacto de la carpeta será diferente porque incluye fecha y hora.

Lo importante es que exista:

```text
migration.sql
```

### Paso 8: Abrir `migration.sql`

Abre `prisma/migrations/..._init/migration.sql`.

Lee su contenido.

Deberías encontrar instrucciones parecidas a:

```sql
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
```

Y:

```sql
CREATE TABLE "User" (
  ...
);
```

Y también algo relacionado con el email único:

```sql
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

Esto confirma que Prisma ha traducido el modelo a SQL.

### Paso 9: Comprobar la tabla desde Adminer

Abre Adminer en el navegador: <http://localhost:8080>.

Datos de conexión habituales:

| Campo | Valor |
| --- | --- |
| Sistema | PostgreSQL |
| Servidor | `postgres` |
| Usuario | `usermanager` |
| Contraseña | `usermanager_password` |
| Base de datos | `usermanager_db` |

Una vez dentro, deberías ver tablas como:

```text
User
_prisma_migrations
```

La tabla `User` es la tabla de usuarios.

La tabla `_prisma_migrations` es el historial interno de Prisma.

### Paso 10: Comprobar la estructura de `User`

Dentro de Adminer, entra en la tabla `User`.

Comprueba que aparecen estos campos:

- `id`
- `name`
- `email`
- `passwordHash`
- `role`
- `isActive`
- `createdAt`
- `updatedAt`

No debería haber usuarios todavía.

La tabla existe, pero está vacía.

Eso es correcto.

Los datos iniciales los crearemos en el día 24 mediante un seed.

### Paso 11: No crear usuarios manualmente todavía

Hoy no vamos a crear registros manualmente desde Adminer.

Podrías hacerlo, pero no es el objetivo.

Hoy queremos comprobar que:

- La migración existe.
- La migración se ha aplicado.
- La tabla `User` existe.
- El historial de migraciones existe.

El día 24 crearemos datos iniciales de forma controlada con un script de seed.

### Paso 12: Revisar que Prisma Client se ha generado

El comando `migrate dev` normalmente genera Prisma Client.

Aun así, si quieres asegurarte, puedes ejecutar:

```bash
npx prisma generate
```

Este comando no debería dar errores.

Más adelante usaremos Prisma Client desde TypeScript.

### Paso 13: Añadir script de migración en `package.json`

Puedes añadir un script útil en `package.json`.

Busca la sección:

```json
"scripts": {
  ...
}
```

Añade:

```json
"prisma:migrate": "prisma migrate dev"
```

La sección podría quedar así:

```json
"scripts": {
  "dev": "tsx watch src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "prisma:validate": "prisma validate",
  "prisma:generate": "prisma generate",
  "prisma:studio": "prisma studio",
  "prisma:migrate": "prisma migrate dev"
}
```

Así más adelante podrás ejecutar:

```bash
npm run prisma:migrate -- --name nombre_de_migracion
```

### Paso 14: Crear el documento del día 22

Dentro de la carpeta `docs/`, crea:

```text
docs/dia-22-primera-migracion-prisma.md
```

Añade este contenido inicial:

````md
# Día 22 - Primera migración con Prisma

## Qué he hecho

- He revisado que PostgreSQL esté arrancado.
- He comprobado la variable DATABASE_URL.
- He validado el archivo schema.prisma.
- He ejecutado la primera migración con Prisma.
- He creado la carpeta prisma/migrations.
- He revisado el archivo migration.sql.
- He comprobado que existe la tabla User.
- He comprobado que existe la tabla _prisma_migrations.
- He entendido la diferencia entre modelo, migración y tabla.

## Comando principal

```bash
npx prisma migrate dev --name init
```

## Archivos generados

```text
prisma/migrations/
  <timestamp>_init/
    migration.sql
```

## Tablas creadas

```text
User
_prisma_migrations
```

## Campos de la tabla User

```text
id
name
email
passwordHash
role
isActive
createdAt
updatedAt
```

## Explicación personal

La migración convierte el modelo User de schema.prisma en una tabla real dentro de PostgreSQL. A partir de ahora la estructura de la base de datos queda versionada en el repositorio.
````

### Paso 15: Añadir tabla comparativa

Añade al documento esta tabla:

```md
## Modelo, migración y tabla

| Concepto | Dónde está | Para qué sirve |
|---|---|---|
| Modelo | prisma/schema.prisma | Define cómo queremos que sea la estructura |
| Migración | prisma/migrations/.../migration.sql | Guarda el cambio generado |
| Tabla | PostgreSQL | Almacena los datos reales |
```

### Paso 16: Añadir explicación de `migrate dev`

Añade:

```md
## Qué hace prisma migrate dev

El comando `prisma migrate dev` lee el archivo schema.prisma, detecta cambios en el modelo, genera una migración SQL, la aplica sobre la base de datos de desarrollo y actualiza el historial de migraciones.
```

### Paso 17: Añadir diagrama Mermaid

Añade este diagrama:

```mermaid
flowchart LR
    A[schema.prisma] --> B[prisma migrate dev]
    B --> C[migration.sql]
    C --> D[PostgreSQL]
    D --> E[Tabla User]
```

### Paso 18: Actualizar el README

Añade una sección al README:

````md
## Migraciones con Prisma

El proyecto usa Prisma Migrate para versionar la estructura de la base de datos.

Primera migración:

```bash
npx prisma migrate dev --name init
```

Esto genera:

```text
prisma/migrations/<timestamp>_init/migration.sql
```

Y crea en PostgreSQL:

```text
User
_prisma_migrations
```

La tabla `User` almacena los usuarios de la aplicación.

La tabla `_prisma_migrations` guarda el historial interno de migraciones de Prisma.
````

### Paso 19: Actualizar el índice del README

Añade el enlace:

```md
- [Día 22 - Primera migración con Prisma](docs/dia-22-primera-migracion-prisma.md)
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
```

### Paso 20: Guardar cambios en Git

Comprueba los cambios:

```bash
git status
```

Deberías ver cambios en archivos como:

```text
prisma/migrations/...
README.md
docs/dia-22-primera-migracion-prisma.md
package.json
package-lock.json
```

Añade los archivos:

```bash
git add .
```

Crea un commit:

```bash
git commit -m "Dia 22 - Crear primera migracion Prisma"
```

Sube los cambios:

```bash
git push
```

## Problemas frecuentes

### Error: PostgreSQL no está arrancado

Solución:

```bash
docker compose up -d
docker compose ps
```

### Error: no se puede conectar a la base de datos

Revisa `DATABASE_URL`.

Debe coincidir con tu `docker-compose.yml`.

Ejemplo:

```env
DATABASE_URL="postgresql://usermanager:usermanager_password@localhost:5432/usermanager_db"
```

Comprueba:

- El usuario.
- La contraseña.
- El host.
- El puerto.
- El nombre de la base de datos.

### Error: el puerto 5432 está ocupado

Puede que tengas otra base de datos PostgreSQL funcionando en tu equipo.

Opciones:

- Parar el otro servicio PostgreSQL.
- Cambiar el puerto en `docker-compose.yml`.
- Usar otro puerto externo, por ejemplo `5433:5432`.

Si cambias el puerto externo a:

```yaml
ports:
  - "5433:5432"
```

Entonces `DATABASE_URL` deberá usar:

```env
DATABASE_URL="postgresql://usermanager:usermanager_password@localhost:5433/usermanager_db"
```

### Error en el modelo Prisma

Ejecuta:

```bash
npx prisma validate
```

Revisa especialmente:

- Llaves mal cerradas.
- Campos duplicados.
- El enum `Role` mal escrito.
- Atributos `@default` incorrectos.
- `DATABASE_URL` ausente.

### He creado la migración con otro nombre

No pasa nada.

Si has usado:

```bash
npx prisma migrate dev --name primera_migracion
```

el nombre de la carpeta será distinto.

Lo importante es que exista:

```text
prisma/migrations/.../migration.sql
```

### La tabla no se llama `users`, se llama `User`

Por defecto, Prisma puede crear la tabla con el nombre del modelo:

```text
User
```

Esto es correcto para el reto.

Más adelante podríamos cambiar nombres de tablas usando mapeos, pero ahora no lo necesitamos.

### No veo usuarios en la tabla

Es normal.

Hoy solo hemos creado la estructura de la tabla.

Todavía no hemos insertado datos.

Los usuarios iniciales se crearán en el día 24 mediante seed.

## Parte libre

### Tarea libre 1: Explicar qué es una migración

Añade al documento una sección:

```md
## Qué es una migración
```

Explícalo con tus palabras.

Idea orientativa:

```text
Una migración es un cambio versionado en la estructura de la base de datos. Permite crear, modificar o eliminar tablas de forma controlada.
```

### Tarea libre 2: Revisar `migration.sql`

Abre el archivo `migration.sql` generado y localiza:

- La creación del enum `Role`.
- La creación de la tabla `User`.
- La clave primaria.
- El índice único de `email`.

Después copia en la documentación los fragmentos que te parezcan más importantes.

### Tarea libre 3: Comparar `migrate dev` y `db push`

Completa esta tabla:

| Comando              | Crea migraciones | Se guarda en el repositorio | Uso principal |
| -------------------- | ---------------- | --------------------------- | ------------- |
| `prisma migrate dev` | sí               | sí                          |               |
| `prisma db push`     | no               | no                          |               |

### Tarea libre 4: Dibujar el flujo de una migración

Añade un diagrama Mermaid diferente al de la parte guiada.

Debe incluir estos elementos:

- `schema.prisma`
- Prisma Migrate
- `migration.sql`
- PostgreSQL
- La tabla `User`

### Tarea libre 5: Explicar por qué versionar la base de datos

Añade una sección:

```md
## Por qué versionar la base de datos
```

Explica por qué no basta con crear tablas manualmente desde Adminer.

Puedes apoyarte en estas ideas:

- El proyecto debe poder reconstruirse.
- Otros compañeros deben poder aplicar la misma estructura.
- Los cambios deben quedar registrados.
- La base de datos evoluciona junto al código.

## Entrega recomendada del día 22

Las respuestas no se entregan como archivo suelto. Deben quedar dentro del repositorio de GitHub.

Al finalizar el día 22, el repositorio debería tener esta estructura aproximada:

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
```

El documento del día 22 deberá estar en:

```text
docs/dia-22-primera-migracion-prisma.md
```

Y deberá incluir:

- Resumen de lo realizado.
- Comando principal usado.
- Archivos generados.
- Tablas creadas.
- Campos de la tabla `User`.
- Diferencia entre modelo, migración y tabla.
- Explicación de `prisma migrate dev`.
- Diagrama del flujo de migración.
- Comparación entre `migrate dev` y `db push`.
- Explicación de por qué versionar la base de datos.

En el foro, se compartirá el enlace actualizado al repositorio.

Ejemplo de mensaje:

```text
Hola, comparto el avance del día 22 del reto UserManager API:

https://github.com/usuario/usermanager-api

He creado la primera migración con Prisma y ya existe la tabla User en PostgreSQL. La documentación está en:

docs/dia-22-primera-migracion-prisma.md
```

## Cierre del día

Hoy hemos aplicado por primera vez nuestro modelo Prisma sobre PostgreSQL.

Hasta ahora teníamos un diseño en `schema.prisma`. Después de la migración, ese diseño ya se ha convertido en una tabla real en la base de datos.

Hoy hemos trabajado:

- Prisma Migrate.
- `prisma migrate dev`.
- Migración inicial.
- `migration.sql`.
- Tabla `User`.
- Enum `Role`.
- Historial de migraciones.
- `_prisma_migrations`.
- Versionado de la base de datos.

Todavía no hemos creado datos iniciales. La tabla está preparada, pero vacía.

En los próximos días usaremos herramientas de Prisma para explorar la base de datos y después crearemos un seed con usuarios iniciales.

!!! success "Idea clave"
    Una migración convierte el modelo definido en el código en una estructura
    real dentro de la base de datos, dejando ese cambio registrado y versionado.
