# Día 20: Instalación y configuración inicial de Prisma

En el día 19 analizamos distintas formas de acceder a una base de datos desde el backend. Comparamos varias opciones:

- SQL directo
- Prisma
- TypeORM
- Sequelize

Y tomamos una decisión técnica para el resto del reto:

!!! success "Decisión del reto"
    Usaremos Prisma como ORM principal.

Hoy vamos a empezar a aplicar esa decisión.

No vamos a crear todavía el modelo completo `User`. Tampoco vamos a ejecutar migraciones. Eso llegará en los próximos días.

El objetivo de hoy será preparar el proyecto para que pueda usar Prisma.

Vamos a instalar las dependencias necesarias, inicializar Prisma y revisar los archivos que se generan.

Al final del día, el proyecto tendrá una nueva carpeta: `prisma/`.

Y dentro aparecerá el archivo principal de configuración: `schema.prisma`.

Ese archivo será muy importante durante toda la fase de persistencia.

## ¿Qué vamos a trabajar hoy?

Hoy trabajaremos estos conceptos:

| Concepto | Qué aprenderemos |
| --- | --- |
| Prisma CLI | Qué comandos ofrece Prisma |
| Prisma Client | Cómo consultará TypeScript la base de datos |
| `schema.prisma` | Dónde se define la configuración principal |
| `datasource` | Cómo se declara la conexión a PostgreSQL |
| `generator` | Cómo se genera Prisma Client |
| `DATABASE_URL` | Cómo se configura la URL de conexión |
| `.env` | Dónde guardar variables locales sensibles |
| `.env.example` | Cómo documentar variables sin secretos |
| `prisma init` | Cómo inicializar Prisma en el proyecto |
| Conexión con PostgreSQL | Cómo preparar Prisma para usar la base de datos |
| Configuración inicial del ORM | Qué dejamos listo para el día 21 |

El producto del día será tener Prisma instalado e inicializado en el proyecto.

El resultado esperado será que el proyecto quede preparado para que en el día 21 podamos definir el modelo `User`.

## ¿Qué es Prisma CLI?

Prisma CLI es la herramienta de línea de comandos de Prisma.

Nos permite ejecutar comandos como:

```bash
npx prisma init
npx prisma migrate dev
npx prisma generate
npx prisma studio
```

Cada comando tiene una función distinta.

| Comando              | Para qué sirve                          |
| -------------------- | --------------------------------------- |
| `prisma init`        | Inicializa Prisma en el proyecto        |
| `prisma migrate dev` | Crea y aplica migraciones               |
| `prisma generate`    | Genera el cliente de Prisma             |
| `prisma studio`      | Abre una interfaz visual para ver datos |
| `prisma --version`   | Muestra la versión instalada            |

Hoy usaremos principalmente:

```bash
npx prisma init
```

Y comprobaremos la instalación con:

```bash
npx prisma --version
```

## ¿Qué es Prisma Client?

Prisma Client es la herramienta que usaremos desde TypeScript para hacer consultas a la base de datos.

Más adelante podremos escribir código parecido a este:

```ts
const users = await prisma.user.findMany();
```

O:

```ts
const user = await prisma.user.findUnique({
  where: {
    id: 1
  }
});
```

Prisma Client se genera a partir del archivo `schema.prisma`.

Por eso es tan importante definir bien el modelo en los próximos días.

De momento, hoy solo instalaremos y dejaremos preparada la herramienta.

## ¿Qué es `schema.prisma`?

El archivo `schema.prisma` es el centro de configuración de Prisma.

En él definiremos tres cosas principales:

- El generador del cliente Prisma.
- La conexión con la base de datos.
- Los modelos de datos.

Una versión inicial puede tener una forma parecida a esta:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

La parte `generator` indica cómo se generará Prisma Client.

La parte `datasource` indica qué base de datos usamos y de dónde saldrá la URL de conexión.

Más adelante añadiremos aquí el modelo `User`.

## ¿Qué es `DATABASE_URL`?

`DATABASE_URL` es la variable de entorno que indica a Prisma cómo conectarse a la base de datos.

En nuestro caso, como usamos PostgreSQL en Docker Compose, tendrá una forma parecida a esta:

```env
DATABASE_URL="postgresql://usermanager:usermanager_password@localhost:5432/usermanager_db"
```

Esta URL contiene varios datos:

- Protocolo: `postgresql://`
- Usuario
- Contraseña
- Host
- Puerto
- Nombre de la base de datos

Descomposición:

| Parte | Valor |
| --- | --- |
| Usuario | `usermanager` |
| Contraseña | `usermanager_password` |
| Host | `localhost` |
| Puerto | `5432` |
| Base de datos | `usermanager_db` |

!!! note "Importante"
    La API se ejecuta fuera del contenedor, por eso usa `localhost`.

Adminer usaba `postgres` como servidor porque Adminer estaba dentro de Docker Compose.

Pero Prisma, al ejecutarse desde nuestro proyecto local, se conectará a `localhost:5432`.

## `.env` y `.env.example`

El archivo `.env` contiene variables de entorno reales para nuestro entorno local.

Ejemplo:

```env
PORT=3000
DATABASE_URL="postgresql://usermanager:usermanager_password@localhost:5432/usermanager_db"
JWT_SECRET="super_secret_key"
```

Este archivo no debe subirse a GitHub porque puede contener datos sensibles.

Por eso lo añadimos a `.gitignore`.

En cambio, sí subiremos un archivo `.env.example`.

Este archivo sirve como plantilla para que otra persona sepa qué variables necesita.

Ejemplo:

```env
PORT=3000
DATABASE_URL="postgresql://usermanager:usermanager_password@localhost:5432/usermanager_db"
JWT_SECRET="change_me"
```

## Flujo de configuración de Prisma

El trabajo de hoy seguirá este flujo:

```mermaid
flowchart TD
    A[Abrir proyecto] --> B[Comprobar Docker y PostgreSQL]
    B --> C[Instalar Prisma]
    C --> D[Ejecutar prisma init]
    D --> E[Revisar schema.prisma]
    E --> F[Configurar DATABASE_URL]
    F --> G[Comprobar Prisma CLI]
    G --> H[Documentar cambios]
```

Hoy no crearemos modelos todavía.

La idea es preparar el terreno.

## Parte guiada

### Paso 1: Abrir el proyecto

Abre una terminal y entra en el repositorio:

```bash
cd usermanager-api
```

Comprueba que estás en la raíz del proyecto.

Deberías ver archivos como:

```text
package.json
tsconfig.json
README.md
docker-compose.yml
src/
docs/
```

### Paso 2: Arrancar PostgreSQL

Antes de configurar Prisma, necesitamos asegurarnos de que PostgreSQL está funcionando.

Ejecuta:

```bash
docker compose up -d
```

Comprueba los servicios:

```bash
docker compose ps
```

Deberías ver el servicio de PostgreSQL en ejecución.

Por ejemplo:

```text
usermanager_postgres   running
```

Si también tienes Adminer, también debería estar arrancado.

### Paso 3: Revisar `docker-compose.yml`

Comprueba que tu `docker-compose.yml` contiene una configuración parecida a esta:

```yaml
services:
  postgres:
    image: postgres:16
    container_name: usermanager_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: usermanager
      POSTGRES_PASSWORD: usermanager_password
      POSTGRES_DB: usermanager_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  adminer:
    image: adminer:latest
    container_name: usermanager_adminer
    restart: unless-stopped
    ports:
      - "8080:8080"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

Los datos importantes para Prisma serán:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- Puerto `5432`

### Paso 4: Instalar Prisma

Desde la raíz del proyecto, ejecuta:

```bash
npm install -D prisma
```

Esto instala Prisma CLI como dependencia de desarrollo.

Después instala Prisma Client:

```bash
npm install @prisma/client
```

Resumen:

```text
prisma → herramienta de línea de comandos
@prisma/client → cliente que usaremos desde TypeScript
```

### Paso 5: Comprobar que Prisma está instalado

Ejecuta:

```bash
npx prisma --version
```

Deberías ver información sobre la versión de Prisma instalada.

Si el comando responde correctamente, Prisma CLI ya está disponible dentro del proyecto.

### Paso 6: Inicializar Prisma

Ahora ejecuta:

```bash
npx prisma init --datasource-provider postgresql
```

Este comando crea la estructura inicial de Prisma.

Después de ejecutarlo, deberían aparecer archivos nuevos:

```text
prisma/
  schema.prisma
.env
```

Si ya existía `.env`, Prisma puede modificarlo o añadir la variable `DATABASE_URL`.

### Paso 7: Revisar la nueva carpeta `prisma`

Después de ejecutar `prisma init`, revisa la estructura del proyecto.

Debería quedar algo parecido a:

```text
usermanager-api/
  prisma/
    schema.prisma
  src/
    server.ts
  docs/
  docker-compose.yml
  package.json
  README.md
  .env
```

La carpeta `prisma` será muy importante.

En ella estarán:

- `schema.prisma`
- `migrations/` más adelante
- `seed` más adelante

Todavía no aparecerá la carpeta `migrations`.

Se creará cuando hagamos la primera migración.

### Paso 8: Revisar `schema.prisma`

Abre:

```text
prisma/schema.prisma
```

Deberías ver algo parecido a:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Puede que, según la versión de Prisma, el archivo tenga pequeñas diferencias.

Lo importante hoy es reconocer estas dos partes:

- `generator client`
- `datasource db`

### Paso 9: Entender `generator client`

La parte:

```prisma
generator client {
  provider = "prisma-client-js"
}
```

indica que Prisma generará un cliente para JavaScript/TypeScript.

Ese cliente será el que más adelante nos permitirá escribir:

```ts
prisma.user.findMany()
prisma.user.create()
prisma.user.update()
```

Todavía no podemos usar `prisma.user`, porque aún no hemos definido el modelo `User`.

Eso llegará en el día 21.

### Paso 10: Entender `datasource db`

La parte:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

indica que Prisma usará PostgreSQL como base de datos.

La URL de conexión no se escribe directamente aquí.

Se lee desde `DATABASE_URL`.

Esto es una buena práctica, porque permite cambiar la conexión sin modificar el código del esquema.

### Paso 11: Configurar `.env`

Abre el archivo `.env`.

Asegúrate de que contiene:

```env
PORT=3000
DATABASE_URL="postgresql://usermanager:usermanager_password@localhost:5432/usermanager_db"
JWT_SECRET="super_secret_key"
```

Si Prisma ha creado una `DATABASE_URL` diferente, sustitúyela por la correspondiente a tu `docker-compose.yml`.

!!! note "Importante"
    `DATABASE_URL` debe coincidir con usuario, contraseña, puerto y base de datos
    de Docker Compose.

### Paso 12: Revisar `.gitignore`

Comprueba que tienes un archivo `.gitignore`.

Y que incluye:

```text
node_modules/
dist/
.env
```

Esto evita subir el archivo `.env` a GitHub.

### Paso 13: Crear o actualizar `.env.example`

Crea o actualiza el archivo:

```text
.env.example
```

Añade:

```env
PORT=3000
DATABASE_URL="postgresql://usermanager:usermanager_password@localhost:5432/usermanager_db"
JWT_SECRET="change_me"
```

Este archivo sí se sube al repositorio.

Sirve como plantilla.

### Paso 14: Probar conexión de Prisma de forma básica

Hoy todavía no tenemos modelos, así que no vamos a consultar usuarios.

Pero podemos comprobar que Prisma reconoce el esquema ejecutando:

```bash
npx prisma validate
```

Si todo está bien, deberías ver un mensaje indicando que el esquema es válido.

Si aparece un error, revisa:

```text
schema.prisma
DATABASE_URL
Sintaxis del archivo
Comillas en .env
```

### Paso 15: Generar Prisma Client

Aunque todavía no tengamos modelos propios, podemos ejecutar:

```bash
npx prisma generate
```

Este comando genera Prisma Client.

Más adelante, cada vez que cambiemos el modelo en `schema.prisma`, puede ser necesario regenerar el cliente.

En muchas ocasiones Prisma lo hará automáticamente al instalar o migrar, pero conviene conocer el comando.

### Paso 16: Revisar `package.json`

Abre:

```text
package.json
```

Comprueba que aparecen dependencias relacionadas con Prisma.

Deberías ver algo parecido a:

```json
"dependencies": {
  "@prisma/client": "..."
},
"devDependencies": {
  "prisma": "..."
}
```

No hace falta tocar nada más hoy.

### Paso 17: Añadir scripts útiles

Puedes añadir algunos scripts a `package.json` para facilitar el trabajo.

En la sección `"scripts"`, añade:

```json
{
  "prisma:validate": "prisma validate",
  "prisma:generate": "prisma generate",
  "prisma:studio": "prisma studio"
}
```

Si ya tienes scripts como `dev`, `build` y `start`, la sección podría quedar parecida a:

```json
"scripts": {
  "dev": "tsx watch src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "prisma:validate": "prisma validate",
  "prisma:generate": "prisma generate",
  "prisma:studio": "prisma studio"
}
```

Hoy no usaremos todavía Prisma Studio de forma importante. Lo veremos con más calma en el día 23.

### Paso 18: Crear el documento del día 20

Dentro de la carpeta `docs/`, crea un archivo:

```text
docs/dia-20-instalacion-prisma.md
```

Añade este contenido inicial:

````md
# Día 20 - Instalación y configuración inicial de Prisma

## Qué he hecho

- He instalado Prisma CLI.
- He instalado Prisma Client.
- He ejecutado prisma init.
- He creado la carpeta prisma.
- He revisado el archivo schema.prisma.
- He configurado DATABASE_URL.
- He revisado .env y .env.example.
- He comprobado que .env está en .gitignore.
- He validado el esquema de Prisma.
- He generado Prisma Client.

## Comandos usados

```bash
npm install -D prisma
npm install @prisma/client
npx prisma --version
npx prisma init --datasource-provider postgresql
npx prisma validate
npx prisma generate
```

## Archivos generados o modificados

```text
prisma/schema.prisma
.env
.env.example
.gitignore
package.json
package-lock.json
```

## schema.prisma inicial

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## DATABASE_URL

```env
DATABASE_URL="postgresql://usermanager:usermanager_password@localhost:5432/usermanager_db"
```

## Explicación personal

Prisma necesita un archivo schema.prisma para saber qué base de datos usamos y qué modelos tendrá el proyecto. Hoy todavía no hemos definido el modelo User, pero hemos dejado Prisma instalado y preparado para hacerlo en el siguiente día.
````

### Paso 19: Actualizar el README

Añade una sección al README:

````md
## Prisma

El proyecto utilizará Prisma como ORM principal para comunicarse con PostgreSQL.

Instalación:

```bash
npm install -D prisma
npm install @prisma/client
```

Inicialización:

```bash
npx prisma init --datasource-provider postgresql
```

Archivos importantes:

```text
prisma/schema.prisma
.env
.env.example
```

Validar esquema:

```bash
npx prisma validate
```

Generar cliente:

```bash
npx prisma generate
```
````

### Paso 20: Actualizar el índice del README

Añade el enlace:

```md
- [Día 20 - Instalación y configuración inicial de Prisma](docs/dia-20-instalacion-prisma.md)
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
```

### Paso 21: Guardar cambios en Git

Comprueba los cambios:

```bash
git status
```

Recuerda que `.env` no debería subirse.

Añade los archivos:

```bash
git add .
```

Crea un commit:

```bash
git commit -m "Dia 20 - Instalar y configurar Prisma"
```

Sube los cambios:

```bash
git push
```

## Problemas frecuentes

### Error: `npx prisma` no funciona

Comprueba que has instalado Prisma:

```bash
npm install -D prisma
```

Después prueba:

```bash
npx prisma --version
```

### Error en `DATABASE_URL`

Revisa que la URL coincida con `docker-compose.yml`.

Ejemplo:

```env
DATABASE_URL="postgresql://usermanager:usermanager_password@localhost:5432/usermanager_db"
```

Comprueba especialmente:

- Usuario
- Contraseña
- Puerto
- Nombre de la base de datos

### Error: PostgreSQL no está arrancado

Ejecuta:

```bash
docker compose up -d
docker compose ps
```

### Error: `.env` se quiere subir a Git

Comprueba `.gitignore`:

```text
.env
```

Después revisa:

```bash
git status
```

### `schema.prisma` tiene una sintaxis diferente

Según la versión de Prisma, el archivo generado puede tener pequeñas diferencias.

Lo importante hoy es que existan estas dos partes:

- `generator`
- `datasource`

Y que el datasource use:

- `postgresql`
- `DATABASE_URL`

## Parte libre

### Tarea libre 1: Explicar Prisma CLI y Prisma Client

Añade al documento una sección:

```md
## Prisma CLI y Prisma Client
```

Explica con tus palabras la diferencia entre:

```text
prisma
@prisma/client
```

Idea orientativa:

> Prisma CLI sirve para ejecutar comandos de Prisma. Prisma Client sirve para consultar la base de datos desde el código TypeScript.

### Tarea libre 2: Analizar `schema.prisma`

Añade una sección:

```md
## Partes de schema.prisma
```

Explica qué crees que hacen:

- `generator client`
- `datasource db`
- `provider`
- `url`
- `env("DATABASE_URL")`

### Tarea libre 3: Relacionar `.env` con Docker Compose

Completa una tabla:

| Parte         | Valor en Docker Compose | Valor en DATABASE_URL |
| ------------- | ----------------------- | --------------------- |
| Usuario       | `POSTGRES_USER`         |                       |
| Contraseña    | `POSTGRES_PASSWORD`     |                       |
| Base de datos | `POSTGRES_DB`           |                       |
| Puerto        | `5432:5432`             |                       |
| Host          | ejecución local         |                       |

### Tarea libre 4: Crear un esquema de flujo

Añade un diagrama Mermaid al documento:

```mermaid
flowchart LR
    A[schema.prisma] --> B[Prisma Client]
    B --> C[API Express]
    C --> D[PostgreSQL]
```

Después explica qué representa cada elemento.

### Tarea libre 5: Preparar el día 21

En el documento, añade una sección:

```md
## Preparación para el modelo User
```

Recupera del día 18 los campos que tendrá el modelo `User`:

- `id`
- `name`
- `email`
- `passwordHash`
- `role`
- `isActive`
- `createdAt`
- `updatedAt`

Y escribe qué restricciones necesitará cada uno.

## Entrega recomendada del día 20

Las respuestas no se entregan como archivo suelto. Deben quedar dentro del repositorio de GitHub.

Al finalizar el día 20, el repositorio debería tener esta estructura aproximada:

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
```

El documento del día 20 deberá estar en:

```text
docs/dia-20-instalacion-prisma.md
```

Y deberá incluir:

- Resumen de lo realizado.
- Comandos usados.
- Archivos generados o modificados.
- `schema.prisma` inicial.
- `DATABASE_URL`.
- Explicación de Prisma CLI y Prisma Client.
- Partes de `schema.prisma`.
- Relación entre `.env` y Docker Compose.
- Preparación para el modelo `User`.

En el foro, se compartirá el enlace actualizado al repositorio.

Ejemplo de mensaje:

```text
Hola, comparto el avance del día 20 del reto UserManager API:

https://github.com/usuario/usermanager-api

He instalado y configurado Prisma en el proyecto. La documentación está en:

docs/dia-20-instalacion-prisma.md
```

## Cierre del día

Hoy hemos preparado el proyecto para trabajar con Prisma.

Todavía no hemos definido el modelo `User`, no hemos creado migraciones y no hemos consultado la base de datos desde la API. Pero hemos dado el paso necesario para poder hacerlo en los próximos días.

Hoy hemos trabajado:

- Prisma CLI.
- Prisma Client.
- `schema.prisma`.
- `datasource`.
- `generator`.
- `DATABASE_URL`.
- `.env`.
- `.env.example`.
- `.gitignore`.
- `prisma init`.
- `prisma validate`.
- `prisma generate`.

A partir del próximo día convertiremos el diseño del modelo persistente `User` en un modelo real dentro de `schema.prisma`.

!!! success "Idea clave"
    Antes de usar un ORM para consultar datos, necesitamos instalarlo,
    inicializarlo y conectar su configuración con la base de datos del proyecto.
