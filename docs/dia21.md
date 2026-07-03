# Día 21: Modelo Prisma `User`

En el día 20 instalamos y configuramos Prisma en el proyecto. Creamos la carpeta `prisma/`.

Y dentro apareció el archivo principal de configuración: `prisma/schema.prisma`.

Ese archivo es el centro del trabajo con Prisma. En él se define:

- La conexión con la base de datos.
- El cliente de Prisma.
- Los modelos de datos del proyecto.

Hasta ahora, el archivo `schema.prisma` solo tenía una configuración inicial parecida a esta:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Hoy vamos a añadir el primer modelo real del proyecto: `User`.

Este modelo representará a los usuarios de UserManager API.

El objetivo del día será traducir el diseño conceptual del día 18 a sintaxis de Prisma.

No ejecutaremos migraciones todavía. Hoy solo definiremos el modelo y comprobaremos que el esquema es válido.

## ¿Qué vamos a trabajar hoy?

Hoy trabajaremos estos conceptos:

| Concepto | Qué aprenderemos |
| --- | --- |
| Modelo Prisma | Cómo representar `User` en `schema.prisma` |
| `schema.prisma` | Dónde vive la definición del modelo |
| `model User` | Cómo declarar la entidad de usuario |
| `enum Role` | Cómo limitar roles a valores controlados |
| `@id` | Cómo marcar la clave primaria |
| `@default` | Cómo definir valores por defecto |
| `@unique` | Cómo impedir emails repetidos |
| `autoincrement()` | Cómo generar ids automáticamente |
| `now()` | Cómo crear fechas automáticamente |
| `@updatedAt` | Cómo actualizar la fecha de modificación |
| `Boolean` | Cómo representar activo/inactivo |
| `DateTime` | Cómo representar fechas |
| Restricciones del modelo | Cómo convertir reglas de negocio en esquema |
| Validación del esquema | Cómo comprobar que Prisma entiende el modelo |

El producto del día será tener el modelo `User` definido en `schema.prisma`.

El resultado esperado será que Prisma pueda validar correctamente el esquema.

## Recordatorio del modelo persistente

En el día 18 diseñamos el modelo persistente `User`.

Los campos principales eran:

- `id`
- `name`
- `email`
- `passwordHash`
- `role`
- `isActive`
- `createdAt`
- `updatedAt`

También definimos varias reglas:

- El email no se puede repetir.
- La contraseña no se guarda en texto plano.
- Se guarda `passwordHash`.
- `passwordHash` nunca se devuelve al cliente.
- Todo usuario tiene un `role`.
- El `role` por defecto es `USER`.
- Todo usuario se crea activo.
- `createdAt` se genera automáticamente.
- `updatedAt` cambia cuando se modifica el usuario.

Hoy vamos a llevar ese diseño al archivo `schema.prisma`.

## ¿Qué es un modelo en Prisma?

Un modelo en Prisma representa una entidad de nuestra aplicación.

Por ejemplo:

```prisma
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
}
```

Este modelo indica que existe una entidad llamada `User` con tres campos:

- `id`
- `name`
- `email`

Cuando más adelante ejecutemos una migración, Prisma usará ese modelo para crear una tabla en PostgreSQL.

Podemos pensar en este flujo:

```mermaid
flowchart LR
    A[Modelo User en schema.prisma] --> B[Migración Prisma]
    B --> C[Tabla User en PostgreSQL]
    C --> D[Prisma Client]
    D --> E[API Express]
```

Hoy solo trabajaremos el primer paso.

## ¿Qué es un campo en Prisma?

Cada línea dentro de un modelo representa un campo.

Ejemplo:

```prisma
name String
```

Esto significa que el modelo tiene un campo llamado `name` de tipo `String`.

Prisma tiene tipos como:

- `Int`
- `String`
- `Boolean`
- `DateTime`

En nuestro modelo `User` usaremos:

| Campo          | Tipo Prisma | Significado       |
| -------------- | ----------- | ----------------- |
| `id`           | `Int`       | Número entero     |
| `name`         | `String`    | Texto             |
| `email`        | `String`    | Texto             |
| `passwordHash` | `String`    | Texto             |
| `role`         | `Role`      | Enum propio       |
| `isActive`     | `Boolean`   | Verdadero o falso |
| `createdAt`    | `DateTime`  | Fecha y hora      |
| `updatedAt`    | `DateTime`  | Fecha y hora      |

## Campo `id`

El campo `id` será el identificador único del usuario.

En Prisma lo definiremos así:

```prisma
id Int @id @default(autoincrement())
```

Vamos por partes.

- `Int`: indica que es un número entero.
- `@id`: indica que es la clave primaria del modelo.
- `@default(autoincrement())`: indica que el valor se generará automáticamente incrementando el número.

Esto significa que no tendremos que indicar manualmente el `id` al crear un usuario.

Prisma y PostgreSQL se encargarán de ello.

## Campo `name`

El campo `name` será el nombre visible del usuario.

```prisma
name String
```

Esto indica que `name` es un texto obligatorio.

En Prisma, si un campo no lleva `?`, es obligatorio.

Por ejemplo:

```prisma
name String
```

Obligatorio.

```prisma
name String?
```

Opcional.

En nuestro caso, el nombre será obligatorio.

## Campo `email`

El campo `email` será único.

```prisma
email String @unique
```

Esto indica dos cosas:

- `email` es un texto obligatorio.
- `email` no puede repetirse.

La parte importante es:

```prisma
@unique
```

Esto le dice a Prisma que no debe permitir dos usuarios con el mismo email.

Esta regla es fundamental para:

- Evitar cuentas duplicadas.
- Hacer login por email.
- Buscar usuarios de forma fiable.

## Campo `passwordHash`

En el modelo no guardaremos `password`.

Guardaremos:

```prisma
passwordHash String
```

Este campo contendrá el hash de la contraseña.

Ejemplo conceptual:

```text
$2b$10$...
```

Regla importante: `passwordHash` existe en la base de datos, pero nunca debe devolverse al cliente.

Prisma lo tendrá en el modelo porque necesita guardarlo y leerlo para comprobar login.

Pero nuestras respuestas de la API deberán ocultarlo.

## Campo `role`

El campo `role` representará el rol del usuario.

Queremos que solo pueda tener dos valores:

- `USER`
- `ADMIN`

Para eso usaremos un enum de Prisma.

Primero definiremos:

```prisma
enum Role {
  USER
  ADMIN
}
```

Después, dentro del modelo `User`, usaremos:

```prisma
role Role @default(USER)
```

Esto significa:

- El campo `role` usa el enum `Role`.
- Por defecto, un usuario será `USER`.

Este diseño nos ayudará más adelante con permisos y autorización.

## Campo `isActive`

El campo `isActive` indicará si el usuario está activo.

```prisma
isActive Boolean @default(true)
```

Esto significa:

- `isActive` es `true` o `false`.
- Por defecto será `true`.

Lo usaremos para borrado lógico.

En lugar de borrar usuarios físicamente, podremos hacer `isActive = false`.

Reglas asociadas:

- Un usuario activo puede iniciar sesión.
- Un usuario desactivado no puede iniciar sesión.
- Un `ADMIN` puede activar o desactivar usuarios.

## Campo `createdAt`

El campo `createdAt` indicará cuándo se creó el usuario.

```prisma
createdAt DateTime @default(now())
```

Esto significa:

- `createdAt` es una fecha.
- Por defecto se asigna el momento actual al crear el usuario.

No lo escribirá manualmente el cliente.

Lo gestionará el sistema.

## Campo `updatedAt`

El campo `updatedAt` indicará cuándo se modificó el usuario por última vez.

```prisma
updatedAt DateTime @updatedAt
```

La parte importante es:

```prisma
@updatedAt
```

Esto indica que Prisma actualizará este campo cuando se modifique el registro.

Este campo nos ayuda a saber cuándo se produjo el último cambio en el usuario.

## Modelo completo `User`

El modelo completo será:

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

Este modelo recoge lo que diseñamos en el día 18.

Todavía no crea la tabla por sí solo.

Para crear la tabla necesitaremos una migración, que haremos en el día 22.

## ¿Por qué no usamos `password`?

El modelo persistente no tiene un campo llamado `password`. Tiene `passwordHash`.

Esto es una decisión de seguridad.

Cuando un usuario se registre, enviará:

```json
{
  "name": "Ana García",
  "email": "ana@email.com",
  "password": "123456"
}
```

Pero la API no guardará `123456`.

Más adelante hará algo parecido a: `password` → hash → `passwordHash`.

Y guardará solo el hash.

```mermaid
flowchart LR
    A[password recibida] --> B[bcrypt]
    B --> C[passwordHash]
    C --> D[Modelo User en base de datos]
```

## ¿Por qué usamos `Role` como enum?

Podríamos haber hecho:

```prisma
role String
```

Pero entonces podrían aparecer valores incorrectos como:

- `ROOT`
- `PROFESOR`
- `INVITADO`
- `SUPERADMIN`

Al usar un enum:

```prisma
enum Role {
  USER
  ADMIN
}
```

Limitamos los valores posibles.

Esto hace que el modelo sea más claro y más seguro.

## ¿Por qué no añadimos más campos?

Podríamos añadir campos como:

- `avatarUrl`
- `phone`
- `lastLoginAt`
- `bio`

Pero para este reto no son necesarios.

El objetivo es construir una API de gestión de usuarios centrada en:

- Registro.
- Login.
- JWT.
- Roles.
- CRUD.
- Activación y desactivación.
- Frontend de prueba.

Si añadimos demasiados campos ahora, podemos perder foco.

Por eso el modelo inicial será pequeño pero completo.

Más adelante se podría ampliar.

## Parte guiada

### Paso 1: Abrir el proyecto

Abre el repositorio:

```bash
cd usermanager-api
```

Comprueba que tienes la carpeta:

```text
prisma/
```

Y dentro:

```text
schema.prisma
```

### Paso 2: Abrir `schema.prisma`

Abre el archivo:

```text
prisma/schema.prisma
```

Deberías tener una estructura inicial parecida a:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Paso 3: Añadir el enum `Role`

Debajo del bloque `datasource`, añade:

```prisma
enum Role {
  USER
  ADMIN
}
```

Este enum define los dos roles permitidos en la aplicación.

### Paso 4: Añadir el modelo `User`

Debajo del enum, añade:

```prisma
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

### Paso 5: Revisar el archivo completo

El archivo `schema.prisma` debería quedar parecido a esto:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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

### Paso 6: Validar el esquema

Ejecuta:

```bash
npx prisma validate
```

Si todo está bien, Prisma indicará que el esquema es válido.

Si hay un error, revisa:

```text
Llaves de apertura y cierre.
Nombres de campos.
Indentación.
Que Role esté definido antes o después del modelo.
Que no falte DATABASE_URL.
```

### Paso 7: Generar Prisma Client

Ejecuta:

```bash
npx prisma generate
```

Este comando genera el cliente de Prisma a partir del modelo actualizado.

Aunque todavía no vamos a consultar la base de datos desde la API, es buena práctica generar el cliente después de modificar `schema.prisma`.

### Paso 8: No ejecutar migraciones todavía

Hoy no ejecutaremos:

```bash
npx prisma migrate dev
```

Eso será el día 22.

Es importante separar las fases:

```text
Día 21 → Definir modelo.
Día 22 → Crear migración.
```

Hoy solo queremos que el modelo esté bien escrito y validado.

### Paso 9: Crear el documento del día 21

Dentro de la carpeta `docs/`, crea un archivo:

```text
docs/dia-21-modelo-prisma-user.md
```

Añade este contenido inicial:

````md
# Día 21 - Modelo Prisma User

## Qué he hecho

- He abierto el archivo prisma/schema.prisma.
- He añadido el enum Role.
- He definido el modelo User.
- He marcado id como clave primaria.
- He marcado email como único.
- He añadido passwordHash.
- He definido role con valor por defecto USER.
- He definido isActive con valor por defecto true.
- He añadido createdAt y updatedAt.
- He validado el esquema con Prisma.
- He generado Prisma Client.

## Modelo definido

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

## Explicación de campos

| Campo | Explicación |
|---|---|
| `id` | Identificador único del usuario |
| `name` | Nombre visible |
| `email` | Email único |
| `passwordHash` | Hash de la contraseña |
| `role` | Rol del usuario |
| `isActive` | Indica si la cuenta está activa |
| `createdAt` | Fecha de creación |
| `updatedAt` | Fecha de última modificación |

## Comandos usados

```bash
npx prisma validate
npx prisma generate
```

## Explicación personal

El modelo User en Prisma representa cómo se guardarán los usuarios en la base de datos. Todavía no hemos creado la tabla real, pero ya hemos definido su estructura principal.
````

### Paso 10: Actualizar el README

Añade una sección al README:

````md
## Modelo Prisma User

El modelo principal del proyecto será `User`.

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

Reglas principales:

```text
email único
passwordHash obligatorio
role por defecto USER
isActive por defecto true
createdAt automático
updatedAt automático al modificar
```
````

### Paso 11: Actualizar el índice del README

Añade el enlace:

```md
- [Día 21 - Modelo Prisma User](docs/dia-21-modelo-prisma-user.md)
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
```

### Paso 12: Guardar cambios en Git

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
git commit -m "Dia 21 - Definir modelo Prisma User"
```

Sube los cambios:

```bash
git push
```

## Problemas frecuentes

### Error por llaves mal cerradas

Revisa que todos los bloques tengan apertura y cierre:

```prisma
model User {
  ...
}
```

```prisma
enum Role {
  USER
  ADMIN
}
```

### Error porque `Role` no existe

Si usas:

```prisma
role Role
```

Pero no has definido:

```prisma
enum Role {
  USER
  ADMIN
}
```

Prisma mostrará un error.

### Error en `DATABASE_URL`

Aunque hoy no migramos, Prisma puede necesitar leer `.env`.

Revisa:

```env
DATABASE_URL="postgresql://usermanager:usermanager_password@localhost:5432/usermanager_db"
```

### Error por ejecutar migración antes de tiempo

Si ejecutas:

```bash
npx prisma migrate dev
```

no pasa necesariamente nada grave, pero estarías adelantando el trabajo del día 22.

Hoy solo tocaba:

```bash
npx prisma validate
npx prisma generate
```

## Parte libre

### Tarea libre 1: Explicar atributos de Prisma

Añade al documento una sección:

```md
## Atributos usados en el modelo
```

Explica con tus palabras qué significan:

```text
@id
@default
@unique
@updatedAt
```

### Tarea libre 2: Explicar el enum `Role`

Añade una sección:

```md
## Enum Role
```

Explica por qué es mejor usar:

```prisma
enum Role {
  USER
  ADMIN
}
```

que guardar cualquier texto libre en el campo `role`.

### Tarea libre 3: Relacionar modelo y reglas de negocio

Completa esta tabla:

| Regla de negocio                                            | Campo o atributo Prisma relacionado |
| ----------------------------------------------------------- | ----------------------------------- |
| El email no se puede repetir                                |                                     |
| Todo usuario tiene un identificador único                   |                                     |
| Todo usuario empieza activo                                 |                                     |
| El rol por defecto es USER                                  |                                     |
| La fecha de creación se asigna automáticamente              |                                     |
| La fecha de modificación se actualiza al cambiar el usuario |                                     |

### Tarea libre 4: Pensar campos opcionales

Propón un campo opcional que podría añadirse en el futuro.

Ejemplos:

- `avatarUrl`
- `phone`
- `lastLoginAt`
- `bio`

Escribe cómo se vería en Prisma.

Ejemplo:

```prisma
avatarUrl String?
```

El símbolo `?` indica que el campo es opcional.

### Tarea libre 5: Explicar por qué no migramos hoy

Añade una sección:

```md
## Por qué no ejecutamos migraciones hoy
```

Explica con tus palabras por qué hoy solo definimos el modelo y dejamos la migración para el día siguiente.

Idea orientativa:

> Primero queremos entender y validar el modelo. Después crearemos una migración para aplicar ese modelo a PostgreSQL.

## Entrega recomendada del día 21

Las respuestas no se entregan como archivo suelto. Deben quedar dentro del repositorio de GitHub.

Al finalizar el día 21, el repositorio debería tener esta estructura aproximada:

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
    dia-21-modelo-prisma-user.md
```

El documento del día 21 deberá estar en:

```text
docs/dia-21-modelo-prisma-user.md
```

Y deberá incluir:

- Resumen de lo realizado.
- Modelo Prisma `User`.
- Enum `Role`.
- Explicación de campos.
- Comandos usados.
- Atributos de Prisma.
- Relación entre modelo y reglas de negocio.
- Explicación de por qué no migramos todavía.

En el foro, se compartirá el enlace actualizado al repositorio.

Ejemplo de mensaje:

```text
Hola, comparto el avance del día 21 del reto UserManager API:

https://github.com/usuario/usermanager-api

He definido el modelo User y el enum Role en Prisma. La documentación está en:

docs/dia-21-modelo-prisma-user.md
```

## Cierre del día

Hoy hemos convertido el diseño conceptual del modelo `User` en un modelo real de Prisma.

Todavía no hemos creado la tabla en PostgreSQL, pero ya hemos definido cómo debe ser.

Hoy hemos trabajado:

- `schema.prisma`.
- `model User`.
- `enum Role`.
- `@id`.
- `@default`.
- `@unique`.
- `autoincrement()`.
- `now()`.
- `@updatedAt`.
- `Boolean`.
- `DateTime`.

Este paso es fundamental porque el modelo de Prisma será la base para crear la migración, generar la tabla y usar Prisma Client desde la API.

!!! success "Idea clave"
    Antes de crear tablas o escribir consultas, necesitamos definir correctamente
    el modelo que representa nuestra entidad principal.
