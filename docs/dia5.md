# Día 5: JSON, body, params y headers

En el día 4 trabajamos los métodos HTTP principales que usaremos durante todo el
reto:

```text
GET
POST
PATCH
DELETE
```

Vimos que una API REST no se entiende solo por sus rutas, sino por la
combinación entre **método HTTP + ruta**.

| Endpoint | Acción |
| --- | --- |
| `GET /api/users` | Consultar usuarios |
| `POST /api/users` | Crear un usuario |
| `PATCH /api/users/1` | Modificar un usuario |
| `DELETE /api/users/1` | Eliminar o desactivar un usuario |

Hoy vamos a centrarnos en una parte fundamental de cualquier API: **cómo viajan
los datos dentro de una petición HTTP**.

Cuando un cliente se comunica con una API, no solo indica una ruta. También
puede enviar información en distintos lugares de la petición:

```text
Body
Params
Query params
Headers
```

!!! abstract "Objetivo del día"
    Identificar dónde viaja cada dato en una petición HTTP y aprender a leerlo
    desde Express con `req.body`, `req.params`, `req.query` y `req.headers`.

Durante el reto usaremos estos elementos constantemente: para crear usuarios,
consultar usuarios concretos, filtrar listados o enviar tokens de autenticación.

## Qué vamos a trabajar hoy

| Concepto | Qué aprenderemos |
| --- | --- |
| JSON | Formato de intercambio entre cliente y servidor |
| Body | Datos principales enviados al servidor |
| Route params | Valores variables dentro de la ruta |
| Query params | Filtros u opciones al final de la URL |
| Headers | Metadatos de la petición |
| `Content-Type` | Formato de los datos enviados |
| `Authorization` | Header que usaremos para enviar tokens |
| `req.body` | Leer body en Express |
| `req.params` | Leer parámetros de ruta |
| `req.query` | Leer query params |
| `req.headers` | Leer headers |
| Pruebas HTTP | Probar con Thunder Client o Postman |

## Qué es JSON

JSON significa **JavaScript Object Notation**.

Es un formato de texto muy utilizado para enviar y recibir datos entre
aplicaciones.

```json title="Ejemplo de JSON"
{
  "name": "Laura Martínez",
  "email": "laura@email.com",
  "role": "USER",
  "isActive": true
}
```

Aunque se parece mucho a un objeto de JavaScript, JSON es un formato de
intercambio de datos. Lo puede entender una API hecha con Node.js, pero también
una aplicación hecha con Java, Python, PHP, C#, Kotlin o cualquier otro lenguaje.

En una API REST, JSON se usa normalmente para:

```text
Enviar datos desde el cliente al servidor.
Devolver respuestas desde el servidor al cliente.
Comunicar errores.
Enviar información entre frontend y backend.
```

=== "Petición"

    ```json
    {
      "name": "Carlos Pérez",
      "email": "carlos@email.com",
      "password": "123456"
    }
    ```

=== "Respuesta"

    ```json
    {
      "id": 1,
      "name": "Carlos Pérez",
      "email": "carlos@email.com",
      "role": "USER",
      "isActive": true
    }
    ```

## Qué es el body

El **body** es el cuerpo de una petición HTTP.

Sirve para enviar datos al servidor, especialmente en peticiones como:

```text
POST
PATCH
PUT
```

En nuestro proyecto lo usaremos para enviar datos como:

```text
Datos de registro
Datos de login
Cambios en el perfil
Nueva contraseña
Nuevo rol
Nuevo estado del usuario
```

```http title="Petición"
POST /api/users
Content-Type: application/json
```

```json title="Body"
{
  "name": "Ana García",
  "email": "ana@email.com",
  "password": "123456"
}
```

En Express podemos acceder al body mediante:

```ts
req.body
```

```ts
app.post("/api/users", (req, res) => {
  const userData = req.body;

  res.status(201).json({
    message: "Datos recibidos",
    data: userData
  });
});
```

Para que Express pueda leer JSON correctamente, necesitamos esta línea:

```ts
app.use(express.json());
```

Esa línea ya la añadimos en días anteriores.

## Qué son los route params

Los **route params** son valores que forman parte de la ruta.

```http
GET /api/users/1
GET /api/users/25
GET /api/users/300
```

En todos los casos estamos consultando un usuario, pero cambia el identificador.

No creamos una ruta diferente para cada usuario. Creamos una ruta dinámica:

```ts
app.get("/api/users/:id", (req, res) => {
  const { id } = req.params;

  res.json({
    message: "Usuario solicitado",
    id: id
  });
});
```

La parte `:id` indica que ese fragmento es variable.

| Petición | Valor recibido |
| --- | --- |
| `GET /api/users/7` | `req.params.id = "7"` |

!!! warning "Importante"
    Los parámetros de ruta llegan como texto. Aunque el valor parezca un número,
    Express lo recibe como string. Más adelante, cuando trabajemos con IDs
    numéricos, tendremos que convertirlo.

```ts
const id = Number(req.params.id);
```

## Qué son los query params

Los **query params** son parámetros que se envían al final de la URL después del
signo `?`.

```http
GET /api/users?role=ADMIN
```

Aquí estamos pidiendo usuarios, pero añadiendo un filtro:

```text
role=ADMIN
```

Podemos enviar varios query params separándolos con `&`:

```http
GET /api/users?role=USER&isActive=true
```

Esto podría significar:

```text
Quiero usuarios con rol USER y que estén activos.
```

En Express se leen mediante:

```ts
req.query
```

```ts
app.get("/api/users/search", (req, res) => {
  const { role, isActive } = req.query;

  res.json({
    message: "Filtros recibidos",
    filters: {
      role,
      isActive
    }
  });
});
```

| URL | Significado |
| --- | --- |
| `/api/users/1` | Quiero el usuario `1` |
| `/api/users?role=ADMIN` | Quiero usuarios filtrados por rol `ADMIN` |

!!! note "Diferencia clave"
    Los route params identifican un recurso concreto. Los query params filtran,
    ordenan o modifican una consulta.

## Qué son los headers

Los **headers** son metadatos de la petición.

No suelen contener los datos principales, sino información adicional sobre la
petición.

| Header | Uso |
| --- | --- |
| `Content-Type` | Indica el formato de los datos enviados |
| `Authorization` | Envía credenciales o tokens |
| `Accept` | Indica qué tipo de respuesta espera el cliente |
| `User-Agent` | Identifica el cliente que realiza la petición |

### Content-Type

Indica el formato de los datos que enviamos.

Cuando enviamos JSON, usamos:

```http
Content-Type: application/json
```

Thunder Client y Postman suelen añadirlo automáticamente cuando elegimos body
JSON, pero es importante saber que existe.

### Authorization

Más adelante lo usaremos para enviar el token JWT.

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

Esto servirá para que la API sepa quién está haciendo la petición.

En Express podemos leer headers con:

```ts
req.headers
```

```ts
app.get("/api/debug/headers", (req, res) => {
  res.json({
    headers: req.headers
  });
});
```

No hace falta entender todos los headers ahora. Lo importante es saber que
existen y que más adelante serán fundamentales para la autenticación.

## Resumen visual de una petición HTTP

Una petición HTTP puede llevar información en distintos lugares:

```mermaid
flowchart TD
    A["Petición HTTP"] --> B["Método"]
    A --> C["Ruta"]
    A --> D["Params"]
    A --> E["Query params"]
    A --> F["Headers"]
    A --> G["Body"]

    B --> B1["GET, POST, PATCH, DELETE"]
    C --> C1["/api/users"]
    D --> D1["/api/users/:id"]
    E --> E1["?role=ADMIN"]
    F --> F1["Authorization, Content-Type"]
    G --> G1["JSON enviado al servidor"]
```

```http title="Ejemplo completo"
PATCH /api/users/5?notify=true
Content-Type: application/json
Authorization: Bearer token
```

```json title="Body"
{
  "name": "Nuevo nombre"
}
```

En Express podríamos leer:

| Dato | Dónde se lee |
| --- | --- |
| `5` | `req.params.id` |
| `true` | `req.query.notify` |
| Headers | `req.headers` |
| `Nuevo nombre` | `req.body.name` |

## Dónde debe viajar cada dato

Una parte importante de diseñar APIs es decidir dónde enviar cada dato.

| Tipo de dato | Dónde suele ir | Ejemplo |
| --- | --- | --- |
| ID de un recurso | Route params | `/api/users/1` |
| Datos para crear | Body | `{ "name": "Ana" }` |
| Datos para modificar | Body | `{ "email": "nuevo@email.com" }` |
| Filtros | Query params | `/api/users?role=ADMIN` |
| Token de acceso | Headers | `Authorization: Bearer token` |
| Formato de datos | Headers | `Content-Type: application/json` |

| Caso | Dónde viaja el dato |
| --- | --- |
| Crear usuario | Datos en body |
| Consultar usuario concreto | ID en route params |
| Filtrar usuarios activos | Filtro en query params |
| Consultar perfil autenticado | Token en headers |

## Errores frecuentes

Al empezar a trabajar con peticiones HTTP, son habituales estos errores:

```text
Olvidar app.use(express.json()).
Enviar body como texto en lugar de JSON.
No configurar Content-Type: application/json.
Buscar un dato en req.params cuando viene en req.body.
Buscar un dato en req.body cuando viene en req.query.
Escribir mal la ruta.
Usar GET cuando debería ser POST.
No reiniciar o no tener arrancado el servidor.
```

Por eso es importante probar con calma cada endpoint y revisar:

```text
Método usado.
URL.
Body.
Headers.
Código de estado.
Respuesta recibida.
```

## Parte guiada

### Paso 1: Abrir el proyecto

Abre el repositorio:

```text
usermanager-api
```

Entra en la carpeta:

```bash
cd usermanager-api
```

Arranca el servidor:

```bash
npm run dev
```

Comprueba que sigue funcionando:

```http
GET http://localhost:3000/api/health
```

### Paso 2: Revisar `express.json()`

Abre:

```text
src/server.ts
```

Comprueba que tienes esta línea antes de definir las rutas:

```ts
app.use(express.json());
```

Debe estar antes de las rutas que leen `req.body`.

```ts title="Ejemplo"
const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "UserManager API"
  });
});
```

Si esta línea no está, añádela.

### Paso 3: Crear una ruta para probar body

Añade esta ruta:

```ts
app.post("/api/debug/body", (req, res) => {
  res.status(200).json({
    message: "Body recibido correctamente",
    body: req.body
  });
});
```

```http title="Prueba"
POST http://localhost:3000/api/debug/body
```

```json title="Body JSON"
{
  "name": "Ana García",
  "email": "ana@email.com"
}
```

```json title="Respuesta esperada"
{
  "message": "Body recibido correctamente",
  "body": {
    "name": "Ana García",
    "email": "ana@email.com"
  }
}
```

### Paso 4: Crear una ruta para probar params

Añade esta ruta:

```ts
app.get("/api/debug/params/:id", (req, res) => {
  res.status(200).json({
    message: "Params recibidos correctamente",
    params: req.params
  });
});
```

```http title="Prueba"
GET http://localhost:3000/api/debug/params/25
```

```json title="Respuesta esperada"
{
  "message": "Params recibidos correctamente",
  "params": {
    "id": "25"
  }
}
```

Fíjate en que el ID llega como texto:

```text
"25"
```

### Paso 5: Crear una ruta para probar query params

Añade esta ruta:

```ts
app.get("/api/debug/query", (req, res) => {
  res.status(200).json({
    message: "Query params recibidos correctamente",
    query: req.query
  });
});
```

```http title="Prueba"
GET http://localhost:3000/api/debug/query?role=ADMIN&isActive=true
```

```json title="Respuesta esperada"
{
  "message": "Query params recibidos correctamente",
  "query": {
    "role": "ADMIN",
    "isActive": "true"
  }
}
```

!!! warning "Importante"
    Los query params también llegan como texto. Aunque `true` parezca booleano,
    llega como string: `"true"`.

### Paso 6: Crear una ruta para probar headers

Añade esta ruta:

```ts
app.get("/api/debug/headers", (req, res) => {
  res.status(200).json({
    message: "Headers recibidos correctamente",
    headers: req.headers
  });
});
```

```http title="Prueba"
GET http://localhost:3000/api/debug/headers
```

Verás muchos headers. Algunos los envía automáticamente Thunder Client, Postman
o el navegador.

Después añade manualmente un header:

```http
Authorization: Bearer token-de-prueba
```

Vuelve a enviar la petición y comprueba que aparece en la respuesta.

### Paso 7: Crear una ruta combinada

Ahora vamos a crear una ruta que combine varios elementos:

```ts
app.patch("/api/debug/users/:id", (req, res) => {
  const { id } = req.params;
  const { notify } = req.query;
  const authorization = req.headers.authorization;
  const changes = req.body;

  res.status(200).json({
    message: "Datos combinados recibidos",
    id,
    notify,
    authorization,
    changes
  });
});
```

```http title="Prueba"
PATCH http://localhost:3000/api/debug/users/7?notify=true
Authorization: Bearer token-de-prueba
```

```json title="Body"
{
  "name": "Nombre actualizado"
}
```

```json title="Respuesta esperada"
{
  "message": "Datos combinados recibidos",
  "id": "7",
  "notify": "true",
  "authorization": "Bearer token-de-prueba",
  "changes": {
    "name": "Nombre actualizado"
  }
}
```

Esta ruta resume muy bien lo que estamos trabajando hoy:

| Dato | Origen |
| --- | --- |
| `id` | Params |
| `notify` | Query |
| `authorization` | Headers |
| `changes` | Body |

### Paso 8: Crear una colección de pruebas del día 5

En Thunder Client o Postman crea una colección llamada:

```text
UserManager API - Día 5
```

Añade estas peticiones:

```http
POST   http://localhost:3000/api/debug/body
GET    http://localhost:3000/api/debug/params/25
GET    http://localhost:3000/api/debug/query?role=ADMIN&isActive=true
GET    http://localhost:3000/api/debug/headers
PATCH  http://localhost:3000/api/debug/users/7?notify=true
```

Recuerda configurar body y headers cuando sea necesario.

### Paso 9: Actualizar el README

Añade una sección temporal para las rutas de debug:

````md title="README.md"
## Rutas temporales de debug

Estas rutas se han creado para practicar cómo leer datos de una petición HTTP.

```http
POST /api/debug/body
GET /api/debug/params/:id
GET /api/debug/query
GET /api/debug/headers
PATCH /api/debug/users/:id
```

Más adelante estas rutas podrán eliminarse, ya que no forman parte de la API final.
````

### Paso 10: Crear el documento del día 5

Dentro de la carpeta `docs/`, crea un archivo:

```text
docs/dia-05-json-body-params-headers.md
```

Añade este contenido inicial:

````md title="docs/dia-05-json-body-params-headers.md"
# Día 5: JSON, body, params y headers

## Qué he hecho

- He repasado qué es JSON.
- He aprendido para qué sirve el body.
- He probado route params.
- He probado query params.
- He probado headers.
- He creado rutas temporales de debug.
- He creado una colección de pruebas en Thunder Client o Postman.

## Rutas trabajadas

```http
POST /api/debug/body
GET /api/debug/params/:id
GET /api/debug/query
GET /api/debug/headers
PATCH /api/debug/users/:id
```

## Explicación personal

El body sirve para enviar datos principales al servidor.
Los params sirven para identificar recursos concretos en la ruta.
Los query params sirven para enviar filtros u opciones en la URL.
Los headers sirven para enviar información adicional de la petición.
````

### Paso 11: Añadir tabla de pruebas realizadas

En el documento del día 5, añade una tabla como esta:

| Petición | Dato probado | Código esperado | Resultado obtenido |
| --- | --- | ---: | --- |
| `POST /api/debug/body` | Body | 200 | |
| `GET /api/debug/params/25` | Params | 200 | |
| `GET /api/debug/query?role=ADMIN&isActive=true` | Query params | 200 | |
| `GET /api/debug/headers` | Headers | 200 | |
| `PATCH /api/debug/users/7?notify=true` | Combinado | 200 | |

Completa la última columna con el resultado real obtenido.

### Paso 12: Actualizar el índice del README

Añade el enlace al documento del día 5:

```md
## Documentación del reto

- [Día 1 - Diseño inicial](docs/dia-01-diseno-inicial.md)
- [Día 2 - Preparación del proyecto](docs/dia-02-preparacion-proyecto.md)
- [Día 3 - Primer endpoint](docs/dia-03-primer-endpoint.md)
- [Día 4 - Métodos HTTP](docs/dia-04-metodos-http.md)
- [Día 5 - JSON, body, params y headers](docs/dia-05-json-body-params-headers.md)
```

### Paso 13: Guardar cambios en Git

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
git commit -m "Dia 5 - Practicar body params query y headers"
```

Sube los cambios:

```bash
git push
```

## Parte libre

Ahora toca practicar un poco sin seguir todos los pasos guiados.

### Tarea libre 1: Crear una ruta de búsqueda simulada

Crea una ruta:

```http
GET /api/users/search
```

Debe aceptar query params como:

```http
GET /api/users/search?name=ana&role=USER
```

Y devolver una respuesta parecida a:

```json
{
  "message": "Búsqueda de usuarios",
  "filters": {
    "name": "ana",
    "role": "USER"
  }
}
```

Todavía no tiene que buscar usuarios reales. Solo debe demostrar que sabes leer
`req.query`.

### Tarea libre 2: Crear una ruta de cambio de contraseña simulada

Crea una ruta:

```http
PATCH /api/users/me/password
```

Debe recibir un body como este:

```json
{
  "currentPassword": "123456",
  "newPassword": "abcdef"
}
```

Y devolver una respuesta parecida a:

```json
{
  "message": "Solicitud de cambio de contraseña recibida"
}
```

!!! danger "Buen hábito"
    No devuelvas las contraseñas en la respuesta. Aunque todavía sea una
    simulación, debemos empezar a crear buenos hábitos.

### Tarea libre 3: Leer un header personalizado

Crea una ruta temporal:

```http
GET /api/debug/client
```

Debe leer un header llamado:

```http
x-client-name: thunder-client
```

Y devolver:

```json
{
  "client": "thunder-client"
}
```

En Express puedes acceder a ese header así:

```ts
req.headers["x-client-name"]
```

### Tarea libre 4: Explicar dónde viaja cada dato

En el documento del día 5, añade una tabla como esta y complétala con tus
palabras:

| Dato | ¿Dónde viajaría? | Ejemplo |
| --- | --- | --- |
| ID de usuario | | |
| Email de registro | | |
| Filtro por rol | | |
| Token JWT | | |
| Nueva contraseña | | |

## Entrega recomendada del día 5

Las respuestas no se entregan como archivo suelto. Deben quedar dentro del
repositorio de GitHub.

Al finalizar el día 5, el repositorio debería tener esta estructura aproximada:

```text
usermanager-api/
  README.md
  package.json
  package-lock.json
  tsconfig.json
  src/
    server.ts
  docs/
    dia-01-diseno-inicial.md
    dia-02-preparacion-proyecto.md
    dia-03-primer-endpoint.md
    dia-04-metodos-http.md
    dia-05-json-body-params-headers.md
```

El documento del día 5 deberá estar en:

```text
docs/dia-05-json-body-params-headers.md
```

Y deberá incluir:

- Resumen de lo realizado.
- Rutas trabajadas.
- Explicación personal de body, params, query params y headers.
- Tabla de pruebas realizadas.
- Tabla sobre dónde viaja cada dato.

En el foro, se compartirá el enlace actualizado al repositorio.

```text title="Mensaje de ejemplo"
Hola, comparto el avance del día 5 del reto UserManager API:

https://github.com/usuario/usermanager-api

He trabajado JSON, body, params, query params y headers, y he añadido la
documentación del día 5 en:
docs/dia-05-json-body-params-headers.md
```

## Cierre del día

Hoy hemos trabajado una parte fundamental de cualquier API: cómo viajan los
datos en una petición HTTP.

Hemos visto que no todos los datos se envían en el mismo sitio:

```text
El body sirve para enviar datos principales.
Los route params sirven para identificar recursos concretos.
Los query params sirven para filtros u opciones.
Los headers sirven para información adicional, como tokens.
```

Esto será clave durante todo el reto.

| Caso futuro | Dónde leeremos los datos |
| --- | --- |
| Crear usuarios | Body |
| Consultar un usuario por ID | Params |
| Filtrar usuarios | Query params |
| Proteger rutas con JWT | Headers |

!!! success "Idea clave"
    Una API no solo necesita rutas: también necesita saber leer correctamente
    los datos que llegan en cada petición.
