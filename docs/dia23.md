# Día 23: Prisma Studio

En el día 22 creamos la primera migración con Prisma.

Hasta ese momento teníamos un modelo `User` definido en `prisma/schema.prisma`.

Después ejecutamos una migración y Prisma creó la tabla correspondiente en PostgreSQL.

Ahora nuestra base de datos ya tiene una estructura real.

Deberíamos tener, como mínimo, las tablas `User` y `_prisma_migrations`.

La tabla `User` almacenará los usuarios de nuestra API.

La tabla `_prisma_migrations` sirve para que Prisma controle qué migraciones se han aplicado.

Hoy vamos a trabajar con una herramienta visual de Prisma: **Prisma Studio**.

Prisma Studio nos permite ver y modificar los datos de la base de datos desde el navegador.

No sustituye a la API, ni sustituye al código, ni sustituye a las migraciones. Es una herramienta de apoyo para comprobar qué hay realmente guardado en la base de datos.

El objetivo del día será abrir Prisma Studio, explorar la tabla `User`, entender la estructura generada por la migración y comprobar visualmente cómo se comporta nuestro modelo.

## ¿Qué vamos a trabajar hoy?

Hoy trabajaremos estos conceptos:

| Concepto | Qué aprenderemos |
| --- | --- |
| Prisma Studio | Cómo abrir la interfaz visual de Prisma |
| Tablas y registros | Cómo explorar la información almacenada |
| Columnas | Cómo relacionarlas con el modelo Prisma |
| Edición manual | Cómo crear, modificar y eliminar datos temporales |
| Restricciones | Cómo comprobar valores únicos, enums y valores por defecto |
| Persistencia | Cómo verificar qué datos existen realmente en PostgreSQL |
| Herramientas de desarrollo | Cuándo utilizar Prisma Studio durante el proyecto |

El producto del día será Prisma Studio funcionando y documentado.

El resultado esperado será poder observar visualmente la tabla `User` y comprobar su estructura.

## ¿Qué es Prisma Studio?

Prisma Studio es una herramienta visual que permite explorar la base de datos asociada al proyecto Prisma.

En lugar de mirar la base de datos solo desde terminal o desde Adminer, podemos abrir una interfaz web y ver las tablas de forma más cómoda.

Con Prisma Studio podremos:

- Ver tablas y registros.
- Crear, editar y eliminar registros manualmente.
- Comprobar campos y valores por defecto.
- Revisar si una migración ha creado correctamente la estructura.

En nuestro caso, lo usaremos para observar el modelo `User`.

El flujo será:

```mermaid
flowchart LR
    A[schema.prisma] --> B[Migración aplicada]
    B --> C[PostgreSQL]
    C --> D[Prisma Studio]
    D --> E[Visualización de datos]
```

## ¿Para qué nos sirve en este reto?

Prisma Studio será útil durante muchos días del reto.

Por ejemplo, nos permitirá comprobar:

- Si la tabla `User` existe y sus campos se han creado correctamente.
- Si `email` es único.
- Si `role` contiene los valores `USER` o `ADMIN`.
- Si `isActive` contiene `true` o `false`.
- Si `createdAt` y `updatedAt` se rellenan.
- Si el seed del día 24 ha funcionado.
- Si el registro y el login crean usuarios correctamente.
- Si un cambio desde la API se refleja en la base de datos.

!!! question "Pregunta clave"
    ¿Qué hay realmente guardado en la base de datos?

Durante los primeros días del reto, mirábamos el array `users` dentro del código.

Ahora, los datos estarán en PostgreSQL.

Prisma Studio será una ventana visual a esos datos.

## Prisma Studio no es la API

Es importante no confundir Prisma Studio con nuestra API.

Prisma Studio es una herramienta para desarrolladores.

Nuestra API es el producto que estamos construyendo.

| Herramienta        | Para qué sirve                      |
| ------------------ | ----------------------------------- |
| API Express        | Responder peticiones HTTP           |
| Prisma             | Comunicar el backend con PostgreSQL |
| PostgreSQL         | Guardar los datos reales            |
| Prisma Studio      | Ver y editar datos visualmente      |
| Thunder/Postman    | Probar endpoints HTTP               |
| Frontend entregado | Probar la API como cliente real     |

Prisma Studio no debe usarse como forma normal de gestionar usuarios en una aplicación final.

En una aplicación real, los usuarios se crearán desde endpoints como:

- `POST /api/auth/register`
- `POST /api/users`

Pero para desarrollo y pruebas, Prisma Studio es muy útil.

## Prisma Studio frente a Adminer

En el día 17 usamos Adminer para comprobar que PostgreSQL estaba funcionando.

Adminer es una herramienta genérica para bases de datos.

Prisma Studio, en cambio, está pensada para trabajar con proyectos Prisma.

| Herramienta   | Ventaja principal                                           |
| ------------- | ----------------------------------------------------------- |
| Adminer       | Permite gestionar bases de datos de forma general           |
| Prisma Studio | Muestra los datos desde el punto de vista del modelo Prisma |

Adminer ve la base de datos como una base de datos.

Prisma Studio ve la base de datos desde el ecosistema de Prisma.

Para este reto usaremos ambas herramientas en momentos diferentes.

## ¿Qué veremos hoy?

Hoy deberíamos poder ver la tabla `User` con estos campos:

- `id`
- `name`
- `email`
- `passwordHash`
- `role`
- `isActive`
- `createdAt`
- `updatedAt`

Es probable que todavía no haya ningún usuario.

Eso es normal.

La migración creó la estructura de la tabla, pero no creó datos.

Los datos iniciales los crearemos en el día 24 con un seed.

Hoy, como práctica, podemos crear un usuario temporal desde Prisma Studio para observar cómo funciona la herramienta.

Después podremos borrarlo para dejar la base de datos limpia antes del seed.

## Qué debemos comprobar en la tabla `User`

Al abrir la tabla `User`, debemos fijarnos en varios aspectos.

### Campos

La tabla debe contener los campos definidos en el modelo Prisma:

- `id`
- `name`
- `email`
- `passwordHash`
- `role`
- `isActive`
- `createdAt`
- `updatedAt`

### Tipos

Cada campo debe tener un tipo coherente:

| Campo | Tipo o valores |
| --- | --- |
| `id` | Número |
| `name` | Texto |
| `email` | Texto |
| `passwordHash` | Texto |
| `role` | `USER` o `ADMIN` |
| `isActive` | Booleano |
| `createdAt` | Fecha |
| `updatedAt` | Fecha |

### Restricciones

Debemos recordar algunas reglas:

- `email` no puede repetirse.
- `role` solo puede ser `USER` o `ADMIN`.
- `isActive` tendrá `true` por defecto.
- `createdAt` se genera automáticamente.
- `updatedAt` se actualiza al modificar el registro.

Prisma Studio nos ayudará a observar estas reglas de forma visual.

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

Antes de abrir Prisma Studio, la base de datos debe estar funcionando.

Ejecuta:

```bash
docker compose up -d
```

Comprueba los contenedores:

```bash
docker compose ps
```

Debes tener PostgreSQL en ejecución.

### Paso 3: Revisar `DATABASE_URL`

Abre `.env`.

Comprueba que tienes una URL parecida a:

```env
DATABASE_URL="postgresql://usermanager:usermanager_password@localhost:5432/usermanager_db"
```

Prisma Studio usará esa variable para conectarse a la base de datos.

Si `DATABASE_URL` está mal, Prisma Studio no podrá abrir correctamente los datos.

### Paso 4: Comprobar que la migración existe

Revisa que existe la carpeta:

```text
prisma/migrations/
```

Dentro debería haber una migración inicial:

```text
prisma/migrations/<timestamp>_init/migration.sql
```

Si no existe, vuelve al trabajo del día 22 antes de continuar.

Prisma Studio podrá abrirse, pero si la tabla no existe no veremos el modelo `User` como esperamos.

### Paso 5: Ejecutar Prisma Studio

Ejecuta:

```bash
npx prisma studio
```

También puedes usar el script si lo añadiste al `package.json`:

```bash
npm run prisma:studio
```

Prisma Studio abrirá una interfaz en el navegador.

Normalmente se abrirá en <http://localhost:5555>.

Si no se abre automáticamente, copia la URL que aparece en la terminal y pégala en el navegador.

### Paso 6: Observar la pantalla inicial

En Prisma Studio deberías ver una lista de modelos o tablas.

Busca el modelo `User` y haz clic sobre él.

Si no aparece, revisa:

- Que el modelo `User` exista en `schema.prisma`.
- Que hayas ejecutado la migración del día 22.
- Que `DATABASE_URL` apunte a la base de datos correcta.

### Paso 7: Revisar las columnas

Dentro de `User`, revisa estas columnas:

- `id`
- `name`
- `email`
- `passwordHash`
- `role`
- `isActive`
- `createdAt`
- `updatedAt`

Compara la tabla visual con el modelo de Prisma:

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

La estructura visual debe coincidir con el modelo.

### Paso 8: Comprobar que todavía no hay usuarios

Es normal que la tabla esté vacía.

La migración crea la estructura, pero no inserta datos.

!!! info "Diferencia importante"
    Una **migración** crea o modifica la estructura; un **seed** crea los datos
    iniciales.

Hoy estamos justo entre ambos pasos.

### Paso 9: Crear un usuario temporal desde Prisma Studio

Como práctica, crea un usuario temporal desde Prisma Studio.

Datos sugeridos:

| Campo | Valor |
| --- | --- |
| `name` | `Usuario Temporal` |
| `email` | `temporal@email.com` |
| `passwordHash` | `hash_temporal` |
| `role` | `USER` |
| `isActive` | `true` |

No hace falta escribir `id` si Prisma Studio permite dejar que se genere automáticamente.

Tampoco hace falta introducir manualmente `createdAt` si aparece gestionado automáticamente.

Si Prisma Studio te pide algún campo obligatorio, rellénalo.

El objetivo es observar cómo se comportan los campos del modelo.

### Paso 10: Observar valores automáticos

Después de crear el usuario temporal, revisa `id`, `createdAt` y `updatedAt`.

El `id` debería generarse automáticamente.

`createdAt` debería tener una fecha de creación.

`updatedAt` debería tener una fecha relacionada con la creación o modificación.

Esto confirma que los valores automáticos funcionan.

### Paso 11: Intentar crear un email duplicado

Intenta crear otro usuario temporal con el mismo email: `temporal@email.com`.

Debería aparecer un error porque `email` tiene una restricción única.

Esto viene de esta parte del modelo:

```prisma
email String @unique
```

No pasa nada si aparece un error. De hecho, es una buena señal: la restricción está funcionando.

### Paso 12: Probar el enum `Role`

Comprueba que el campo `role` solo permite los valores `USER` y `ADMIN` del enum.

Esto viene de:

```prisma
enum Role {
  USER
  ADMIN
}
```

El objetivo es observar que `role` no es un texto libre cualquiera.

### Paso 13: Modificar `isActive`

Edita el usuario temporal, cambia `isActive` a `false` y guarda el cambio.

Esto simula una desactivación de cuenta.

Más adelante, la API hará esto mediante endpoints como:

- `PATCH /api/users/:id/status`
- `DELETE /api/users/:id`

Pero hoy solo queremos observar el dato visualmente.

### Paso 14: Borrar el usuario temporal

Al terminar la práctica, borra el usuario temporal.

¿Por qué?

Porque el día 24 crearemos usuarios iniciales con un seed.

Conviene empezar el seed con una base de datos limpia o, al menos, sin registros manuales innecesarios.

Si prefieres conservarlo para observarlo, puedes hacerlo, pero documenta que fue creado manualmente.

### Paso 15: Cerrar Prisma Studio

Para cerrar Prisma Studio, vuelve a la terminal donde se está ejecutando y pulsa
<kbd>Ctrl</kbd> + <kbd>C</kbd>.

Prisma Studio dejará de estar disponible en el navegador.

La base de datos seguirá funcionando mientras el contenedor de PostgreSQL esté activo.

### Paso 16: Crear el documento del día 23

Dentro de la carpeta `docs/`, crea:

```text
docs/dia-23-prisma-studio.md
```

Añade este contenido inicial:

````md
# Día 23 - Prisma Studio

## Qué he hecho

- He arrancado PostgreSQL con Docker Compose.
- He comprobado que existe la migración inicial.
- He ejecutado Prisma Studio.
- He abierto la tabla User.
- He revisado las columnas del modelo.
- He comprobado visualmente los campos id, name, email, passwordHash, role, isActive, createdAt y updatedAt.
- He creado un usuario temporal.
- He comprobado valores automáticos.
- He probado la restricción de email único.
- He probado el enum Role.
- He modificado isActive.
- He eliminado el usuario temporal.

## Comando usado

```bash
npx prisma studio
```

O mediante script:

```bash
npm run prisma:studio
```

## URL habitual

```text
http://localhost:5555
```

## Tabla revisada

```text
User
```

## Campos observados

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

## Diferencia entre migración y seed

| Concepto | Qué hace |
|---|---|
| Migración | Crea o modifica la estructura de la base de datos |
| Seed | Inserta datos iniciales |

## Explicación personal

Prisma Studio es una herramienta visual que permite ver y editar los datos de la base de datos. Me ayuda a comprobar que la migración ha creado correctamente la tabla User y que las restricciones del modelo funcionan.
````

### Paso 17: Añadir comparación con Adminer

Añade al documento:

```md
## Prisma Studio frente a Adminer

| Herramienta | Para qué sirve |
|---|---|
| Adminer | Gestionar la base de datos de forma general |
| Prisma Studio | Ver y editar datos desde el modelo Prisma |

Adminer muestra la base de datos desde un punto de vista más general. Prisma Studio está más integrado con el proyecto Prisma.
```

### Paso 18: Añadir diagrama Mermaid

Añade este diagrama:

```mermaid
flowchart LR
    A[PostgreSQL] --> B[Prisma]
    B --> C[Prisma Studio]
    C --> D[Visualización de User]
```

Explicación sugerida:

```md
Prisma Studio se conecta a la base de datos usando la configuración de Prisma y permite visualizar los modelos como tablas editables.
```

### Paso 19: Actualizar el README

Añade una sección al README:

````md
## Prisma Studio

Prisma Studio permite explorar visualmente los datos de la base de datos.

Comando:

```bash
npx prisma studio
```

O mediante script:

```bash
npm run prisma:studio
```

URL habitual:

```text
http://localhost:5555
```

Uso en el proyecto:

```text
Comprobar tablas.
Revisar usuarios.
Ver datos iniciales del seed.
Comprobar cambios realizados desde la API.
Detectar errores de persistencia.
```

Prisma Studio es una herramienta de desarrollo. La gestión real de usuarios se hará desde la API.
````

### Paso 20: Actualizar el índice del README

Añade el enlace:

```md
- [Día 23 - Prisma Studio](docs/dia-23-prisma-studio.md)
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
```

### Paso 21: Guardar cambios en Git

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
git commit -m "Dia 23 - Explorar base de datos con Prisma Studio"
```

Sube los cambios:

```bash
git push
```

## Problemas frecuentes

### Prisma Studio no se abre

Prueba a ejecutar:

```bash
npx prisma studio
```

Y copia manualmente la URL que aparece en la terminal.

Normalmente será:

```text
http://localhost:5555
```

### Error de conexión con la base de datos

Revisa:

- Que PostgreSQL esté arrancado.
- Que `DATABASE_URL` sea correcta.
- Que el puerto coincida.
- Que la base de datos exista.

Comandos útiles:

```bash
docker compose up -d
docker compose ps
```

### No aparece la tabla `User`

Comprueba que ejecutaste la migración del día 22:

```bash
npx prisma migrate dev --name init
```

También puedes comprobar que existe:

```text
prisma/migrations/
```

### La tabla aparece vacía

Es normal.

Hoy todavía no hemos creado el seed.

La tabla puede estar vacía porque solo hemos creado la estructura.

### Error al crear un email duplicado

Es correcto.

El campo `email` tiene esta restricción:

```prisma
email String @unique
```

Eso significa que no puede haber dos usuarios con el mismo email.

### He creado usuarios manualmente y ahora no sé si borrarlos

Para este reto, lo recomendable es borrar los usuarios manuales antes del día 24.

El día 24 crearemos usuarios iniciales mediante seed.

Si dejas usuarios manuales, documenta cuáles son y por qué existen.

## Parte libre

### Tarea libre 1: Explicar para qué sirve Prisma Studio

Añade una sección:

```md
## Para qué sirve Prisma Studio
```

Explica con tus palabras qué utilidad tiene esta herramienta durante el desarrollo.

Puedes apoyarte en estas ideas:

- Ver datos.
- Comprobar migraciones.
- Editar registros temporales.
- Revisar si una operación de la API se ha guardado.
- Detectar errores de persistencia.

### Tarea libre 2: Comparar herramientas de prueba

Completa esta tabla:

| Herramienta        | Qué prueba |
| ------------------ | ---------- |
| Thunder/Postman    |            |
| Prisma Studio      |            |
| Adminer            |            |
| Frontend entregado |            |

### Tarea libre 3: Observar restricciones

Intenta comprobar visualmente estas restricciones:

- `email` único.
- `role` limitado a `USER` o `ADMIN`.
- `isActive` booleano.

Documenta qué has observado.

### Tarea libre 4: Crear y borrar un usuario temporal

Crea un usuario temporal con estos datos:

| Campo | Valor |
| --- | --- |
| `name` | `Usuario Temporal` |
| `email` | `temporal@email.com` |
| `passwordHash` | `hash_temporal` |
| `role` | `USER` |
| `isActive` | `true` |

Después bórralo.

En la documentación, explica por qué no conviene dejar datos manuales antes del seed.

### Tarea libre 5: Preparar el día 24

Añade una sección:

```md
## Preparación para el seed
```

Escribe qué usuarios iniciales crees que debería tener el proyecto.

Propuesta mínima:

- Un usuario `ADMIN`.
- Un usuario `USER` activo.
- Un usuario `USER` inactivo.

Ejemplo:

```text
Admin Principal
admin@email.com
ADMIN
activo

Usuario Demo
user@email.com
USER
activo

Usuario Inactivo
inactive@email.com
USER
inactivo
```

## Entrega recomendada del día 23

Las respuestas no se entregan como archivo suelto. Deben quedar dentro del repositorio de GitHub.

Al finalizar el día 23, el repositorio debería tener esta estructura aproximada:

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
    dia-23-prisma-studio.md
```

El documento del día 23 deberá estar en:

```text
docs/dia-23-prisma-studio.md
```

Y deberá incluir:

- Resumen de lo realizado.
- Comando usado para abrir Prisma Studio.
- URL habitual.
- Tabla revisada.
- Campos observados.
- Diferencia entre migración y seed.
- Comparación entre Prisma Studio y Adminer.
- Diagrama de funcionamiento.
- Explicación de restricciones observadas.
- Preparación para el seed del día 24.

En el foro, se compartirá el enlace actualizado al repositorio.

Ejemplo de mensaje:

```text
Hola, comparto el avance del día 23 del reto UserManager API:

https://github.com/usuario/usermanager-api

He usado Prisma Studio para explorar visualmente la tabla User y comprobar la estructura creada por la migración. La documentación está en:

docs/dia-23-prisma-studio.md
```

## Cierre del día

Hoy hemos usado Prisma Studio para observar visualmente la base de datos.

Después de crear la migración en el día 22, necesitábamos comprobar que la tabla `User` existe y que sus campos son los esperados.

Hoy hemos trabajado:

- Prisma Studio.
- Visualización de tablas.
- Tabla `User`.
- Campos del modelo.
- Restricción `unique`.
- Enum `Role`.
- `isActive`.
- Datos temporales.
- Diferencia entre migración y seed.
- Herramientas de desarrollo.

Todavía no hemos creado datos iniciales de forma controlada. Eso llegará en el día 24 con el seed.

!!! success "Idea clave"
    Prisma Studio no sustituye a la API, pero nos permite comprobar visualmente
    qué estructura y qué datos existen realmente en la base de datos.
