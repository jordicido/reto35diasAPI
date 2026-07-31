# Día 39: Pruebas de integración desde el frontend

En el día 38 conectamos el frontend entregado con nuestra API.

Hasta ese momento habíamos probado la mayoría de funcionalidades usando herramientas como Thunder Client, Postman o peticiones manuales.

Ahora ya tenemos una interfaz web sencilla que se comunica con nuestro backend.

Hoy no vamos a programar muchas funcionalidades nuevas.

El objetivo del día será comprobar que todas las piezas funcionan juntas:

- Navegador.
- Frontend.
- API Express.
- Autenticación.
- JWT.
- Permisos.
- Prisma.
- PostgreSQL.
- Seed.

Esto se llama prueba de integración.

Una prueba de integración no comprueba una función aislada.

Comprueba que varias partes del sistema colaboran correctamente.

!!! info "Idea principal"
    Una prueba de integración comprueba que varias piezas del proyecto funcionan correctamente cuando trabajan juntas.

## ¿Qué vamos a trabajar hoy?

Hoy trabajaremos estos conceptos:

- Pruebas de integración.
- Frontend como cliente de la API.
- Login desde interfaz.
- Registro desde interfaz.
- Token JWT en `localStorage`.
- Cabecera `Authorization`.
- Rutas protegidas.
- Permisos `USER` y `ADMIN`.
- Códigos HTTP.
- Prisma Studio.
- Persistencia de datos.
- Diagnóstico de errores.
- DevTools.
- Network.

El producto del día será:

**Checklist de integración completada con resultados y evidencias.**

El resultado esperado será que podamos demostrar que el frontend y el backend trabajan correctamente juntos.

## Qué significa probar integración

En días anteriores hemos probado muchas partes por separado.

Por ejemplo:

- Probar una ruta desde Thunder Client.
- Comprobar un usuario en Prisma Studio.
- Hacer login y copiar un token.
- Enviar manualmente `Authorization`.
- Comprobar un middleware.

Hoy haremos algo diferente.

Vamos a probar flujos completos desde la interfaz.

Por ejemplo:

- El usuario escribe email y contraseña en el frontend.
- El frontend llama a `POST /api/auth/login`.
- La API valida las credenciales.
- La API genera un JWT.
- El frontend guarda el token.
- El frontend llama a `GET /api/users/me`.
- La API verifica el token.
- La API consulta PostgreSQL.
- El frontend muestra el perfil.

Ese recorrido atraviesa muchas capas.

Por eso es una prueba de integración.

## Flujo que estamos probando

El flujo principal será:

```mermaid
flowchart TD
    A[Login frontend] --> B[API valida credenciales]
    B --> C[API devuelve JWT]
    C --> D[Frontend guarda token]
    D --> E[Frontend llama rutas protegidas]
    E --> F[API comprueba autenticación]
    F --> G[API comprueba permisos]
    G --> H[Prisma consulta PostgreSQL]
    H --> I[Frontend muestra resultado]
```

Hoy no nos basta con que una pantalla “parezca funcionar”.

Queremos comprobar:

- Qué petición se envía.
- Qué endpoint se llama.
- Qué código HTTP responde la API.
- Qué JSON devuelve.
- Qué datos cambian en PostgreSQL.
- Qué ocurre con `USER`.
- Qué ocurre con `ADMIN`.
- Qué ocurre cuando falta el token.
- Qué ocurre cuando el usuario no tiene permiso.

## Qué partes del sistema vamos a comprobar

Durante el día comprobaremos estas partes:

| Parte      | Qué comprobaremos                             |
| ---------- | --------------------------------------------- |
| Frontend   | Formularios, botones, navegación y mensajes   |
| API        | Respuestas, códigos HTTP y reglas de permisos |
| JWT        | Token guardado y enviado en `Authorization`   |
| Roles      | Diferencias entre `USER` y `ADMIN`            |
| Prisma     | Consultas y modificaciones reales             |
| PostgreSQL | Persistencia de usuarios                      |
| DevTools   | Peticiones, headers, payloads y respuestas    |

## Códigos HTTP que debemos distinguir

Durante las pruebas aparecerán varios códigos.

Es importante no interpretarlos todos como “error genérico”.

| Código             | Significado                     | Ejemplo                                    |
| ------------------ | ------------------------------- | ------------------------------------------ |
| `200 OK`           | Petición correcta               | Login correcto o perfil obtenido           |
| `201 Created`      | Recurso creado                  | Registro o creación de usuario             |
| `400 Bad Request`  | Datos incorrectos o incompletos | Nombre vacío, email inválido o ID inválido |
| `401 Unauthorized` | No autenticado                  | Token ausente, inválido o caducado         |
| `403 Forbidden`    | Autenticado sin permiso         | `USER` intenta listar usuarios             |
| `404 Not Found`    | Recurso no encontrado           | Usuario inexistente                        |
| `409 Conflict`     | Conflicto con el estado actual  | Email duplicado                            |

La diferencia más importante de hoy será:

!!! warning "Regla importante"
    `401` no significa lo mismo que `403`.

## Diferencia entre 401 y 403

Estos dos códigos suelen confundirse.

| Código             | Pregunta que responde                   | Situación                                          |
| ------------------ | --------------------------------------- | -------------------------------------------------- |
| `401 Unauthorized` | ¿Te has autenticado correctamente?      | No hay token o el token no es válido               |
| `403 Forbidden`    | ¿Tienes permiso para hacer esta acción? | Hay token válido, pero el rol no permite la acción |

Ejemplos:

- `GET /api/users` sin token: `401`.
- `GET /api/users` con token de `USER`: `403`.
- `GET /api/users` con token de `ADMIN`: `200`.

Esto demuestra que autenticación y autorización no son lo mismo.

## Matriz general de pruebas

Usaremos esta matriz como guía.

| Acción                   | Endpoint                  | Rol necesario            | Resultado con USER   | Resultado con ADMIN  |
| ------------------------ | ------------------------- | ------------------------ | -------------------- | -------------------- |
| Registro                 | `POST /api/auth/register` | Público                  | `201`                | `201`                |
| Login                    | `POST /api/auth/login`    | Público                  | `200` + JWT          | `200` + JWT          |
| Ver perfil               | `GET /api/users/me`       | Autenticado              | `200`, propio perfil | `200`, propio perfil |
| Editar nombre            | `PATCH /api/users/:id`    | Propio usuario o `ADMIN` | `200` si es propio   | `200`                |
| Listar usuarios          | `GET /api/users`          | `ADMIN`                  | `403`                | `200`                |
| Crear usuario            | `POST /api/users`         | `ADMIN`                  | `403`                | `201`                |
| Desactivar usuario       | `DELETE /api/users/:id`   | `ADMIN`                  | `403`                | `200`                |
| Ruta protegida sin token | Varias                    | Token válido             | `401`                | `401`                |

## Usuarios de prueba

Usaremos los usuarios del seed.

| Usuario          | Email                | Password      | Rol     | Estado   |
| ---------------- | -------------------- | ------------- | ------- | -------- |
| Admin Principal  | `admin@email.com`    | `admin123`    | `ADMIN` | Activo   |
| Usuario Demo     | `user@email.com`     | `user123`     | `USER`  | Activo   |
| Usuario Inactivo | `inactive@email.com` | `inactive123` | `USER`  | Inactivo |

Estos usuarios nos permiten probar tres situaciones diferentes:

- Un administrador.
- Un usuario normal activo.
- Un usuario inactivo.

## Preparación del entorno

Antes de empezar las pruebas, necesitamos tener todo en marcha.

### Paso 1: Arrancar PostgreSQL

Desde la raíz del proyecto:

```bash
docker compose up -d
```

Comprueba que está activo:

```bash
docker compose ps
```

### Paso 2: Instalar dependencias del backend

Si hace falta:

```bash
npm install
```

### Paso 3: Generar Prisma Client

Ejecuta:

```bash
npm run prisma:generate
```

O:

```bash
npx prisma generate
```

Recuerda que el proyecto usa Prisma 7, cliente generado en `src/generated/prisma` y adapter PostgreSQL.

### Paso 4: Ejecutar el seed

Ejecuta:

```bash
npm run prisma:seed
```

Esto nos asegura que existen los usuarios de prueba.

### Paso 5: Arrancar backend

Ejecuta:

```bash
npm run dev
```

Comprueba:

```text
http://localhost:3000/api/health
```

### Paso 6: Arrancar frontend

El frontend está en un repositorio separado:

[jordicido/frontend-reto35diasapi](https://github.com/jordicido/frontend-reto35diasapi)

En otra terminal, entra en ese proyecto. Si aún no lo tienes descargado:

```bash
git clone https://github.com/jordicido/frontend-reto35diasapi.git
cd frontend-reto35diasapi
npm install
npm run dev
```

Si ya lo tienes clonado, entra directamente en `frontend-reto35diasapi` y ejecuta `npm run dev`.

El frontend debería quedar disponible en:

```text
http://localhost:3001
```

### Paso 7: Abrir Prisma Studio

En otra terminal, si quieres observar los datos:

```bash
npx prisma studio
```

O:

```bash
npm run prisma:studio
```

Prisma Studio nos servirá para comprobar que los cambios realizados desde el frontend realmente llegan a PostgreSQL.

## Parte guiada: checklist completa

Durante las pruebas anota siempre:

```text
Cuenta usada.
Acción realizada.
Endpoint llamado.
Código HTTP esperado.
Código HTTP obtenido.
Resultado observado.
```

### Paso 8: Registro desde frontend

Entra en:

```text
/register
```

Crea una cuenta nueva.

Ejemplo:

```text
Nombre: Usuario Integración
Email: usuario.integracion@email.com
Password: 123456
```

Resultado esperado:

```text
201 Created
```

Comprueba que el frontend muestra un mensaje de éxito o la respuesta de la API.

Después abre Prisma Studio y comprueba que el usuario existe.

### Paso 9: Email duplicado

Repite el mismo registro con el mismo email:

```text
usuario.integracion@email.com
```

Resultado esperado:

```text
409 Conflict
```

Mensaje esperado:

```text
El email ya está registrado
```

Esto confirma que la restricción de email único sigue funcionando desde el frontend.

### Paso 10: Login desde frontend

Entra en:

```text
/login
```

Usa:

```text
user@email.com / user123
```

Resultado esperado:

```text
200 OK + JWT
```

Comprueba en DevTools:

```text
Application → Local Storage
```

Debe aparecer una clave:

```text
token
```

### Paso 11: Login como USER

Haz login con:

```text
user@email.com / user123
```

Comprueba que el frontend identifica al usuario como:

```text
USER
```

Este usuario nos servirá para probar restricciones de permisos.

### Paso 12: Login como ADMIN

Cierra sesión.

Haz login con:

```text
admin@email.com / admin123
```

Comprueba que el frontend identifica al usuario como:

```text
ADMIN
```

Este usuario nos servirá para probar acciones administrativas.

### Paso 13: Login con usuario inactivo

Cierra sesión.

Intenta iniciar sesión con:

```text
inactive@email.com / inactive123
```

Resultado esperado:

```text
403 Forbidden
```

El usuario existe en PostgreSQL, pero no debe conseguir un token válido porque está inactivo.

Comprueba en Prisma Studio que:

```text
isActive = false
```

### Paso 14: Ver mi perfil

Haz login como usuario normal:

```text
user@email.com / user123
```

Entra en:

```text
/dashboard
```

El frontend debería llamar a:

```text
GET /api/users/me
```

Resultado esperado:

```text
200 OK
```

Debe mostrar datos como:

```text
id
name
email
role
isActive
createdAt
updatedAt
```

### Paso 15: Observar la petición en Network

Abre DevTools:

```text
Network
```

Busca la petición a:

```text
/api/users/me
```

Comprueba:

```text
Método: GET
Status: 200
Authorization: Bearer eyJ...
Respuesta JSON con el usuario
```

No compartas públicamente un JWT real.

En capturas puedes ocultar parte del token.

### Paso 16: Editar mi nombre

Desde el dashboard, cambia el nombre del usuario.

Por ejemplo:

```text
Usuario Demo Actualizado
```

El frontend debería llamar a:

```text
PATCH /api/users/:id
```

Resultado esperado:

```text
200 OK
```

Después recarga el dashboard.

El cambio debe persistir.

Comprueba también en Prisma Studio que el nombre se ha actualizado.

### Paso 17: Panel admin con USER

Con sesión iniciada como:

```text
user@email.com
```

entra en:

```text
/admin/users
```

Resultado esperado:

```text
403 Forbidden
```

El frontend debe mostrar un mensaje claro, por ejemplo:

```text
No tienes permiso para realizar esta acción.
```

Esto es correcto.

No estamos buscando ocultar totalmente el panel.

Queremos observar que la API bloquea la acción.

### Paso 18: Panel admin con ADMIN

Cierra sesión.

Haz login con:

```text
admin@email.com / admin123
```

Entra en:

```text
/admin/users
```

Resultado esperado:

```text
200 OK
```

Debe mostrarse el listado de usuarios.

### Paso 19: Listar usuarios como ADMIN

Desde el panel admin, comprueba que se llama a:

```text
GET /api/users
```

Resultado esperado:

```text
200 OK
```

Debe aparecer una tabla con usuarios.

Comprueba que no se muestra:

```text
passwordHash
```

### Paso 20: Crear usuario como ADMIN

Desde el panel admin, crea un usuario nuevo.

Ejemplo:

```text
Nombre: Usuario Admin Test
Email: admin.test@email.com
Password: 123456
```

El frontend debería llamar a:

```text
POST /api/users
```

Resultado esperado:

```text
201 Created
```

Comprueba que el usuario aparece en la tabla.

Después confirma en Prisma Studio que se ha guardado.

### Paso 21: Desactivar usuario como ADMIN

Desde el panel admin, desactiva un usuario de prueba.

El frontend debería llamar a:

```text
DELETE /api/users/:id
```

Resultado esperado:

```text
200 OK
```

Dependiendo de la implementación, también podría usarse `204 No Content`, pero en nuestro backend venimos trabajando normalmente con `200 OK` y una respuesta JSON.

Comprueba en Prisma Studio que:

```text
isActive = false
```

### Paso 22: Cerrar sesión

Pulsa logout.

El frontend debe eliminar el token de:

```text
localStorage
```

Comprueba en DevTools que ya no aparece la clave:

```text
token
```

### Paso 23: Ruta protegida sin token

Después de cerrar sesión, intenta entrar en:

```text
/dashboard
```

El frontend intentará llamar a:

```text
GET /api/users/me
```

pero no llevará `Authorization`.

Resultado esperado:

```text
401 Unauthorized
```

Este caso demuestra que el backend no permite acceder a rutas protegidas sin token.

## Tabla de evidencias

Completa una tabla como esta durante la sesión:

| Prueba                | Usuario usado        | Endpoint                  | Código esperado | Código obtenido | Resultado |
| --------------------- | -------------------- | ------------------------- | --------------- | --------------- | --------- |
| Registro nuevo        | Nuevo                | `POST /api/auth/register` | `201`           |                 |           |
| Email duplicado       | Nuevo                | `POST /api/auth/register` | `409`           |                 |           |
| Login USER            | `user@email.com`     | `POST /api/auth/login`    | `200`           |                 |           |
| Login ADMIN           | `admin@email.com`    | `POST /api/auth/login`    | `200`           |                 |           |
| Login inactivo        | `inactive@email.com` | `POST /api/auth/login`    | `403`           |                 |           |
| Ver perfil            | USER                 | `GET /api/users/me`       | `200`           |                 |           |
| Panel admin con USER  | USER                 | `GET /api/users`          | `403`           |                 |           |
| Panel admin con ADMIN | ADMIN                | `GET /api/users`          | `200`           |                 |           |
| Crear usuario admin   | ADMIN                | `POST /api/users`         | `201`           |                 |           |
| Ruta sin token        | Sin sesión           | `GET /api/users/me`       | `401`           |                 |           |

## Cómo recoger evidencias

Para cada prueba importante, usa DevTools.

Entra en:

```text
DevTools → Network
```

Selecciona una petición y anota:

| Dato                | Dónde verlo     |
| ------------------- | --------------- |
| URL                 | General         |
| Método              | General         |
| Código HTTP         | Status          |
| Token enviado       | Request Headers |
| Body enviado        | Payload         |
| JSON recibido       | Response        |
| Tiempo de respuesta | Timing          |

No hace falta capturar todo.

Basta con recoger evidencias claras de:

```text
Una petición correcta.
Un error 401.
Un error 403.
Una modificación persistida en base de datos.
```

## No compartir tokens reales

Los JWT son credenciales temporales.

Durante las prácticas podemos verlos para aprender, pero no debemos compartirlos públicamente.

Si haces una captura, puedes ocultar parte del token:

```text
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...OCULTO
```

La idea es demostrar que se envía el header, no publicar el token completo.

## Pruebas centradas en seguridad

### `USER` intenta acceder al panel admin

Esta prueba es muy importante.

No ocultamos totalmente el enlace al panel admin porque queremos provocar la petición.

Lo importante es observar que la API responde:

```text
403 Forbidden
```

Esto demuestra que la seguridad no depende de ocultar botones en el frontend.

Aunque alguien construyera su propia petición manualmente, la API seguiría rechazando la acción.

### Ruta protegida sin token

Después de logout, abre:

```text
/dashboard
```

La petición no llevará:

```text
Authorization
```

La API debe responder:

```text
401 Unauthorized
```

Esto demuestra que la autenticación se comprueba en el backend.

### Usuario inactivo

El usuario inactivo existe en la base de datos, pero no debe conseguir un token válido al hacer login.

Prueba:

```text
inactive@email.com / inactive123
```

Resultado esperado:

```text
403 Forbidden
```

Esto comprueba que `isActive` se tiene en cuenta en el login.

### Email duplicado

Al intentar registrar dos veces el mismo email, la API debe responder:

```text
409 Conflict
```

Esto comprueba que se mantiene la restricción de unicidad.

## Checklist de pruebas del día

Completa esta checklist:

| Prueba                                  | Resultado |
| --------------------------------------- | --------- |
| Registro desde frontend                 |           |
| Email duplicado devuelve `409`          |           |
| Login desde frontend devuelve token     |           |
| Login como USER funciona                |           |
| Login como ADMIN funciona               |           |
| Login con usuario inactivo falla        |           |
| Dashboard muestra mi perfil             |           |
| Dashboard envía `Authorization`         |           |
| Editar mi nombre funciona               |           |
| El cambio persiste al recargar          |           |
| El cambio aparece en Prisma Studio      |           |
| Panel admin con USER devuelve `403`     |           |
| Panel admin con ADMIN devuelve listado  |           |
| ADMIN puede crear usuario               |           |
| ADMIN puede desactivar usuario          |           |
| Prisma Studio refleja los cambios       |           |
| Logout elimina token                    |           |
| Ruta protegida sin token devuelve `401` |           |

## Crear documentación del día 39

Dentro de la carpeta `docs/`, crea:

```text
docs/dia-39-pruebas-integracion-frontend.md
```

Añade este contenido inicial:

````md
# Día 39 - Pruebas de integración desde el frontend

## Qué he hecho

- He arrancado PostgreSQL.
- He ejecutado el seed.
- He arrancado el backend.
- He arrancado el frontend.
- He probado registro desde el frontend.
- He probado email duplicado.
- He probado login como USER.
- He probado login como ADMIN.
- He probado login con usuario inactivo.
- He comprobado el token en localStorage.
- He comprobado la cabecera Authorization en Network.
- He probado el dashboard.
- He editado mi nombre desde el frontend.
- He comprobado persistencia en Prisma Studio.
- He probado panel admin con USER.
- He probado panel admin con ADMIN.
- He creado un usuario como ADMIN.
- He desactivado un usuario como ADMIN.
- He probado logout.
- He probado una ruta protegida sin token.
- He distinguido códigos 400, 401, 403 y 409.

## Idea principal

```text
Una prueba de integración comprueba que varias piezas del proyecto funcionan correctamente cuando trabajan juntas.
```

## Flujo probado

```text
Frontend → API → JWT → permisos → Prisma → PostgreSQL
```

## Códigos trabajados

| Código | Significado | Ejemplo |
| --- | --- |---|
| `400` | Datos incorrectos | Email inválido |
| `401` | No autenticado | Falta token |
| `403` | Sin permiso | USER intenta listar usuarios |
| `409` | Conflicto | Email duplicado |

## Usuarios usados

| Email | Rol | Uso |
| --- | --- |---|
| `user@email.com` | USER | Probar usuario normal |
| `admin@email.com` | ADMIN | Probar administración |
| `inactive@email.com` | USER inactivo | Probar bloqueo de login |

## Evidencias recogidas

| Evidencia | Descripción |
| --- | --- |
| Petición correcta | |
| Error 401 | |
| Error 403 | |
| Cambio en Prisma Studio | |

## Explicación personal

Hoy he usado el frontend como punto de entrada para comprobar que todas las capas funcionan juntas. No basta con que la pantalla muestre datos; también hay que revisar códigos HTTP, cabeceras, respuestas JSON y persistencia en base de datos.
````

### Paso 24: Añadir diagrama Mermaid

Añade al documento:

```mermaid
flowchart TD
    A[Login frontend] --> B[API valida credenciales]
    B --> C[API devuelve JWT]
    C --> D[Frontend guarda token]
    D --> E[Frontend llama rutas protegidas]
    E --> F[API comprueba permisos]
    F --> G[Prisma consulta PostgreSQL]
    G --> H[Frontend muestra resultado]
```

### Paso 25: Añadir matriz de pruebas

Añade:

```md
## Matriz de pruebas

| Acción | Endpoint | Rol necesario | Resultado con USER | Resultado con ADMIN |
| --- | --- |---| --- | --- |
| Registro | `POST /api/auth/register` | Público | `201` | `201` |
| Login | `POST /api/auth/login` | Público | `200` + JWT | `200` + JWT |
| Ver perfil | `GET /api/users/me` | Autenticado | `200` | `200` |
| Editar nombre | `PATCH /api/users/:id` | Propio o ADMIN | `200` si es propio | `200` |
| Listar usuarios | `GET /api/users` | ADMIN | `403` | `200` |
| Crear usuario | `POST /api/users` | ADMIN | `403` | `201` |
| Desactivar usuario | `DELETE /api/users/:id` | ADMIN | `403` | `200` |
| Ruta sin token | `GET /api/users/me` | Autenticado | `401` | `401` |
```

## Problemas frecuentes

### Login correcto pero dashboard falla

Comprueba:

```text
Que el token se guarda con la clave correcta.
Que apiFetch lee esa misma clave.
Que la cabecera empieza por Bearer.
Que GET /api/users/me existe.
Que GET /api/users/me está declarado antes de GET /api/users/:id.
```

Si `/me` se interpreta como un ID, revisa el orden de rutas.

### Token caducado

Si el token ha caducado, la API debe responder:

```text
401 Unauthorized
```

No debe responder `403`.

Solución:

```text
Eliminar token.
Volver a iniciar sesión.
Repetir la petición.
```

### `USER` intentando entrar en admin

Si has iniciado sesión con:

```text
user@email.com
```

y entras en:

```text
/admin/users
```

el resultado correcto es:

```text
403 Forbidden
```

Para continuar con operaciones administrativas, inicia sesión como:

```text
admin@email.com
```

### Seed no ejecutado

Si las credenciales de prueba no funcionan, puede que no existan los usuarios.

Ejecuta:

```bash
npm run prisma:seed
```

Después vuelve a probar login.

### Contraseña incorrecta

Revisa:

```text
Mayúsculas.
Minúsculas.
Espacios al copiar.
Usuario correcto.
```

La API no debería indicar con demasiado detalle si falló el email o la contraseña.

### Usuario inactivo

Si `inactive@email.com` no puede iniciar sesión, es correcto.

Comprueba en Prisma Studio:

```text
isActive = false
```

El rechazo es intencionado.

### Los datos no aparecen en Prisma Studio

Prueba:

- Pulsar Refresh.
- Comprobar que Prisma Studio usa la misma `DATABASE_URL`.
- Comprobar que el backend apunta a la misma base de datos.
- Revisar si la operación realmente respondió `200` o `201`.

### El frontend muestra error genérico

Revisa la pestaña Network.

A veces el mensaje visual es genérico, pero la respuesta JSON de la API contiene más información.

Busca:

- Status code.
- Response.
- Payload.
- Request headers.

## Parte libre

### Tarea libre 1: Diseñar dos pruebas negativas adicionales

Diseña dos pruebas negativas antes de ejecutarlas.

Ejemplos:

- Contraseña demasiado corta.
- Email inválido.
- ID inexistente.
- Body vacío.
- Modificar `isActive` con `USER`.
- Token inventado.

Completa esta tabla:

| Prueba negativa | Resultado esperado | Resultado obtenido |
| --------------- | ------------------ | ------------------ |
|                 |                    |                    |
|                 |                    |                    |

### Tarea libre 2: Probar modificación de `isActive` con USER

Haz login como:

`user@email.com`.

Intenta enviar una modificación de estado:

```json
{
  "isActive": false
}
```

Resultado esperado:

```text
403 Forbidden
```

Explica por qué esta acción debe estar reservada para `ADMIN`.

### Tarea libre 3: Probar token inventado

Elimina el token real y prueba manualmente uno falso:

```text
Authorization: Bearer token_inventado
```

Resultado esperado:

```text
401 Unauthorized
```

### Tarea libre 4: Documentar una incidencia

Elige un problema encontrado durante las pruebas y documenta:

- Qué ocurrió.
- Qué esperabas.
- Qué viste en Network.
- Qué parte estaba fallando.
- Cómo lo resolviste.

### Tarea libre 5: Preparar el día 40

Añade una sección:

```md
## Preparación para demo final
```

Responde:

- ¿Qué flujo enseñarías en una demo?
- ¿Qué usuario usarías primero?
- ¿Qué error mostrarías para demostrar permisos?
- ¿Qué captura incluirías?
- ¿Qué comandos necesita otra persona para arrancar el proyecto?

## Entrega recomendada del día 39

Las respuestas no se entregan como archivo suelto. Deben quedar dentro del repositorio de GitHub.

Al finalizar el día 39, deberías tener dos repositorios preparados:

- Backend: `https://github.com/usuario/usermanager-api`
- Frontend: `https://github.com/jordicido/frontend-reto35diasapi`

El backend debería mantener una estructura parecida a:

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
    dia-39-pruebas-integracion-frontend.md
```

El frontend se trabaja en el repositorio separado:

```text
frontend-reto35diasapi/
  README.md
  .env.example
  .env.local
  package.json
  src/
```

El documento del día 39 deberá estar en:

```text
docs/dia-39-pruebas-integracion-frontend.md
```

Y deberá incluir:

- Resumen de lo realizado.
- Idea principal.
- Flujo probado.
- Códigos HTTP trabajados.
- Usuarios usados.
- Evidencias recogidas.
- Diagrama Mermaid.
- Matriz de pruebas.
- Checklist completa.
- Problemas frecuentes.
- Pruebas negativas.
- Preparación para demo final.

En el foro, se compartirá el enlace actualizado al repositorio.

Ejemplo de mensaje:

```text
Hola, comparto el avance del día 39 del reto UserManager API:

https://github.com/usuario/usermanager-api

Frontend usado:

https://github.com/jordicido/frontend-reto35diasapi

He probado la integración completa desde el frontend: registro, login, token, perfil, permisos USER/ADMIN y cambios persistidos en base de datos. La documentación está en:

docs/dia-39-pruebas-integracion-frontend.md
```

Además, se recomienda adjuntar o incluir:

- Checklist completada.
- Tabla con código esperado y código obtenido.
- Captura de una petición correcta.
- Captura de un error `401`.
- Captura de un error `403`.
- Explicación breve de una incidencia y su diagnóstico.

## Guardar cambios en Git

Comprueba los cambios:

```bash
git status
```

Deberías ver cambios en:

`docs/dia-39-pruebas-integracion-frontend.md`.

Si has ajustado algo del frontend para mostrar mejor errores o evidencias, también aparecerán cambios en:

el repositorio `frontend-reto35diasapi`.

Añade los archivos:

```bash
git add .
```

Crea un commit:

```bash
git commit -m "Dia 39 - Probar integracion desde frontend"
```

Sube los cambios:

```bash
git push
```

## Cierre del día

Hoy hemos usado el frontend como punto de entrada, pero realmente hemos comprobado todas las capas del proyecto.

Hemos comprobado que:

- El frontend envía peticiones HTTP.
- La API responde con códigos correctos.
- El login genera token.
- El token se guarda y se envía.
- Las rutas protegidas exigen autenticación.
- Los permisos distinguen `USER` y `ADMIN`.
- Los cambios se guardan en PostgreSQL.
- Prisma Studio permite verificar la persistencia.

Esto es mucho más completo que probar solo una función aislada.

Hoy hemos trabajado:

- Pruebas de integración.
- Frontend.
- Backend.
- JWT.
- `Authorization`.
- `401`.
- `403`.
- `409`.
- Roles.
- Permisos.
- Prisma Studio.
- DevTools.
- Network.
- Persistencia.

Mañana dejaremos el proyecto preparado para enseñarlo, documentarlo y presentarlo como cierre del reto.

!!! success "Idea clave"
    Una aplicación no está realmente probada hasta que comprobamos que sus piezas principales funcionan juntas en un flujo real.
