<div class="hero" markdown>
<p class="eyebrow">Reto opcional de 40 días para 2º DAM</p>
<h1>UserManager API</h1>
<p>
Construye paso a paso una API REST completa de gestión de usuarios:
registro, login, JWT, roles, base de datos, Docker y conexión con un
frontend real en Next.js.
</p>
<div class="hero-actions">
  <a class="md-button md-button--primary" href="#calendario-del-reto">Ver calendario</a>
  <a class="md-button" href="#producto-final-esperado">Producto final</a>
</div>
</div>

!!! abstract "La idea del reto"
    No se trata de hacer ejercicios sueltos ni de resolver problemas de
    algoritmia. El objetivo es construir un backend parecido a lo que os
    podríais encontrar en una aplicación real, avanzando cada día con una
    mejora concreta.

    Cada día iremos explicando los conceptos involucrados antes de aplicarlos
    en el proyecto. La intención es que no solo completéis tareas, sino que
    entendáis qué problema resuelve cada pieza, por qué se usa y cómo encaja
    dentro de una API profesional.

!!! tip "Cómo usar esta guía"
    Cada día tiene un concepto, un producto, una tarea y un resultado. Si os
    atascáis, priorizad que el proyecto arranque, que las rutas respondan y
    que entendáis la decisión técnica antes de seguir acumulando código.

## Producto final esperado

Al terminar el reto, quien lo complete tendrá una API capaz de registrar
usuarios, iniciar sesión, proteger rutas, diferenciar roles y ser consumida por
un frontend real.

| Área | Resultado |
| --- | --- |
| Backend | Express + TypeScript |
| Datos | PostgreSQL |
| Persistencia | Prisma ORM |
| Arquitectura | Rutas, controladores, servicios y repositorios |
| Seguridad | Hash de contraseñas, JWT, autenticación y autorización |
| Usuarios | Registro, login, CRUD, roles y estado activo/inactivo |
| Integración | Frontend Next.js entregado y conectado |
| Operaciones | Docker Compose, variables de entorno y README |
| Calidad | Validaciones, errores centralizados y pruebas básicas |

- Registrar usuarios.
- Iniciar sesión.
- Gestionar usuarios.
- Proteger rutas con JWT.
- Diferenciar roles `USER` y `ADMIN`.
- Cambiar contraseña.
- Activar o desactivar usuarios.
- Conectarse a una base de datos.
- Ejecutarse con Docker.
- Ser consumida desde un frontend real.

## Endpoints finales

| Módulo | Método | Ruta | Acceso |
| --- | --- | --- | --- |
| Auth | `POST` | `/api/auth/register` | Público |
| Auth | `POST` | `/api/auth/login` | Público |
| Users | `GET` | `/api/users` | Solo `ADMIN` |
| Users | `GET` | `/api/users/:id` | `ADMIN` o el propio usuario |
| Users | `GET` | `/api/users/me` | Usuario autenticado |
| Users | `POST` | `/api/users` | Solo `ADMIN` |
| Users | `PATCH` | `/api/users/:id` | `ADMIN` o el propio usuario |
| Users | `DELETE` | `/api/users/:id` | Solo `ADMIN` |
| Security | `PATCH` | `/api/users/me/password` | Usuario autenticado |
| Security | `PATCH` | `/api/users/:id/role` | Solo `ADMIN` |
| Security | `PATCH` | `/api/users/:id/status` | Solo `ADMIN` |
| Health | `GET` | `/api/health` | Público |

## Modelo de datos principal

| Campo | Descripción |
| --- | --- |
| `id` | Identificador único |
| `name` | Nombre visible del usuario |
| `email` | Email único para login |
| `passwordHash` | Contraseña cifrada, nunca devuelta |
| `role` | `USER` o `ADMIN` |
| `isActive` | Permite activar o desactivar cuentas |
| `createdAt` | Fecha de creación |
| `updatedAt` | Fecha de última modificación |

!!! warning "Reglas que no se negocian"
    - El email no se puede repetir.
    - Nunca se devuelve `passwordHash`.
    - Un usuario normal solo puede consultar o modificar sus propios datos.
    - Un `ADMIN` puede listar usuarios, cambiar roles y activar/desactivar cuentas.
    - Un usuario desactivado no puede iniciar sesión.

## Calendario del reto

| Fase | Días | Objetivo |
| --- | --- | --- |
| 1 | 1-6 | Fundamentos de API REST, HTTP, JSON y pruebas |
| 2 | 7-11 | CRUD de usuarios en memoria |
| 3 | 12-15 | Validaciones, códigos de estado y errores |
| 4 | 16-25 | Base de datos, Docker, Prisma, migraciones, Studio y seed |
| 5 | 26-31 | Arquitectura por capas, repositorios, servicios y DTOs |
| 6 | 32-37 | Registro, login, hash, JWT, autenticación y roles |
| 7 | 38-40 | Frontend entregado, integración, pruebas finales y cierre |

## Fase 1: Fundamentos de API REST

### Día 1: Presentación del reto

| Campo | Detalle |
| --- | --- |
| Concepto | Qué es una API REST y qué producto vamos a construir |
| Producto | Presentación de UserManager API |
| Tarea | Definir qué podrá hacer nuestra API |
| Resultado | Documento breve con objetivos, recursos y funcionalidades |

```text title="Recursos iniciales"
/auth
/users
/health
```

### Día 2: Preparación del proyecto

| Campo | Detalle |
| --- | --- |
| Concepto | Estructura inicial de un backend |
| Producto | Proyecto Node.js + Express + TypeScript |
| Tarea | Inicializar proyecto, instalar dependencias y crear `server.ts` |
| Resultado | Servidor ejecutándose en local |

### Día 3: Primer endpoint

| Campo | Detalle |
| --- | --- |
| Concepto | Ruta HTTP básica |
| Producto | Endpoint de salud |
| Tarea | Crear `GET /api/health` |
| Resultado | La API responde correctamente |

```json title="Respuesta esperada"
{
  "status": "ok",
  "message": "UserManager API funcionando"
}
```

### Día 4: Métodos HTTP

| Campo | Detalle |
| --- | --- |
| Concepto | `GET`, `POST`, `PATCH` y `DELETE` |
| Producto | Diseño de endpoints de usuarios |
| Tarea | Probar peticiones simuladas aunque todavía no haya lógica real |
| Resultado | Entenderemos para qué sirve cada método |

```text title="Endpoints previstos"
GET    /api/users
GET    /api/users/:id
POST   /api/users
PATCH  /api/users/:id
DELETE /api/users/:id
```

### Día 5: JSON, body, params y headers

| Campo | Detalle |
| --- | --- |
| Concepto | Partes de una petición HTTP |
| Producto | Lectura de parámetros y cuerpo de petición |
| Tarea | Practicar `req.params`, `req.body`, `req.query` y headers |
| Resultado | Sabremos interpretar lo que llega al servidor |

```json title="Body de ejemplo"
{
  "name": "Ana Garcia",
  "email": "ana@email.com",
  "password": "123456"
}
```

### Día 6: Cliente HTTP y depuración

| Campo | Detalle |
| --- | --- |
| Concepto | Probar una API correctamente |
| Producto | Colección inicial en Postman o Thunder Client |
| Tarea | Probar `GET`, `POST`, `PATCH` y `DELETE` |
| Resultado | Aprenderemos a distinguir errores de ruta, método, body y servidor |

## Fase 2: CRUD de usuarios en memoria

### Día 7: Listado de usuarios

| Campo | Detalle |
| --- | --- |
| Concepto | Recurso REST |
| Producto | `GET /api/users` |
| Tarea | Crear un array de usuarios en memoria y devolverlo |
| Resultado | La API lista usuarios |

```ts title="Usuarios en memoria"
const users = [
  {
    id: 1,
    name: "Ana Garcia",
    email: "ana@email.com",
    role: "USER",
    isActive: true
  }
];
```

### Día 8: Consultar usuario por ID

| Campo | Detalle |
| --- | --- |
| Concepto | Parámetros de ruta |
| Producto | `GET /api/users/:id` |
| Tarea | Buscar un usuario por identificador |
| Resultado | La API devuelve un usuario concreto o un `404` |

### Día 9: Crear usuarios

| Campo | Detalle |
| --- | --- |
| Concepto | Método `POST` |
| Producto | `POST /api/users` |
| Tarea | Añadir usuarios al array |
| Resultado | Podremos crear usuarios desde Postman o Thunder Client |

```json title="Body"
{
  "name": "Carlos Perez",
  "email": "carlos@email.com",
  "password": "123456"
}
```

### Día 10: Actualizar usuarios

| Campo | Detalle |
| --- | --- |
| Concepto | Modificación parcial con `PATCH` |
| Producto | `PATCH /api/users/:id` |
| Tarea | Modificar nombre, email o estado |
| Resultado | Podremos actualizar datos básicos |

- `name`
- `email`
- `isActive`

### Día 11: Eliminar usuarios

| Campo | Detalle |
| --- | --- |
| Concepto | `DELETE` y borrado lógico |
| Producto | `DELETE /api/users/:id` |
| Tarea | Debatir entre eliminar o desactivar |
| Resultado | Introduciremos una primera decisión profesional |

!!! tip "Recomendación"
    En lugar de borrar físicamente, usar `isActive = false`.

## Fase 3: Validaciones y errores

### Día 12: Validación manual básica

| Campo | Detalle |
| --- | --- |
| Concepto | Validar datos antes de guardarlos |
| Producto | Validaciones de creación de usuario |
| Tarea | Comprobar campos obligatorios |
| Resultado | La API no aceptará datos incompletos |

- `name` obligatorio.
- `email` obligatorio.
- `password` obligatoria.
- `password` con mínimo de 6 caracteres.

### Día 13: Validación de email y duplicados

| Campo | Detalle |
| --- | --- |
| Concepto | Reglas de negocio básicas |
| Producto | Impedir emails repetidos |
| Tarea | Comprobar formato de email, normalización y duplicidad |
| Resultado | Aparecerá el error `409 Conflict` |

```json title="Error de ejemplo"
{
  "error": "El email ya está registrado"
}
```

### Día 14: Códigos de estado

| Campo | Detalle |
| --- | --- |
| Concepto | Respuestas HTTP correctas |
| Producto | Uso coherente de status codes |
| Tarea | Aplicar `200`, `201`, `400`, `404` y `409` |
| Resultado | La API comunicará mejor los errores |

| Código | Significado | Uso |
| --- | --- | --- |
| `200` | OK | Usuario encontrado |
| `201` | Created | Usuario creado |
| `400` | Bad Request | Datos incorrectos |
| `404` | Not Found | Usuario no encontrado |
| `409` | Conflict | Email duplicado |

### Día 15: Middleware centralizado de errores

| Campo | Detalle |
| --- | --- |
| Concepto | Gestión uniforme de errores |
| Producto | `error.middleware.ts` o middleware inicial en `server.ts` |
| Tarea | Crear un middleware global de errores |
| Resultado | Todas las respuestas de error tendrán el mismo formato |

```json title="Formato recomendado"
{
  "error": "Usuario no encontrado",
  "statusCode": 404
}
```

## Fase 4: Base de datos, Docker y Prisma

### Día 16: Por qué necesitamos base de datos

| Campo | Detalle |
| --- | --- |
| Concepto | Memoria frente a persistencia |
| Producto | Reflexión sobre persistencia |
| Tarea | Comprobar que los datos en memoria se pierden al reiniciar |
| Resultado | Entenderemos por qué una aplicación real necesita base de datos |

```text title="Problema"
Los datos creados en un array desaparecen al reiniciar el servidor.
```

### Día 17: PostgreSQL con Docker Compose

| Campo | Detalle |
| --- | --- |
| Concepto | Servicios con Docker Compose |
| Producto | PostgreSQL y Adminer levantados en contenedores |
| Tarea | Crear `docker-compose.yml` |
| Resultado | Base de datos funcionando sin instalación manual |

- `postgres`
- `adminer`

### Día 18: Diseño del modelo persistente `User`

| Campo | Detalle |
| --- | --- |
| Concepto | Pasar de objeto en memoria a modelo persistente |
| Producto | Diseño conceptual del modelo `User` |
| Tarea | Definir campos, restricciones y reglas |
| Resultado | Tendremos claro qué debe guardar la base de datos |

```text title="Modelo User"
id
name
email
passwordHash
role
isActive
createdAt
updatedAt
```

!!! warning "Regla importante"
    Aunque exista `passwordHash` en la base de datos, nunca debe devolverse al cliente.

### Día 19: ORM o acceso a datos

| Campo | Detalle |
| --- | --- |
| Concepto | Cómo accede el backend a la base de datos |
| Producto | Decisión técnica razonada |
| Tarea | Comparar SQL directo, Prisma, TypeORM y Sequelize |
| Resultado | Elegiremos Prisma como ORM principal del reto |

| Opción | Ventaja | Inconveniente |
| --- | --- | --- |
| SQL directo | Muy transparente | Más código manual |
| Prisma | Tipado, moderno y cómodo con TypeScript | Oculta parte del SQL |
| TypeORM | Orientado a clases | Más configuración |
| Sequelize | Muy conocido en Node.js | Menos natural con TypeScript moderno |

!!! success "Decisión del reto"
    Usaremos **Prisma** como ORM principal. SQL directo se explicará como alternativa conceptual, pero no será el camino principal.

### Día 20: Instalar y configurar Prisma

| Campo | Detalle |
| --- | --- |
| Concepto | Primer contacto con Prisma |
| Producto | Prisma instalado en el proyecto |
| Tarea | Instalar Prisma, Prisma Client y ejecutar `prisma init` |
| Resultado | El proyecto estará preparado para definir modelos persistentes |

```bash title="Comandos orientativos"
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
```

- `prisma/schema.prisma`
- `.env`

### Día 21: Modelo Prisma `User`

| Campo | Detalle |
| --- | --- |
| Concepto | Definición de modelos en Prisma |
| Producto | Modelo `User` y enum `Role` en `schema.prisma` |
| Tarea | Definir campos, tipos, valores por defecto y restricciones |
| Resultado | Modelo persistente definido en Prisma |

```prisma title="Modelo conceptual"
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

### Día 22: Migraciones con Prisma

| Campo | Detalle |
| --- | --- |
| Concepto | Evolución controlada del esquema |
| Producto | Migración inicial |
| Tarea | Ejecutar `prisma migrate dev` |
| Resultado | La tabla `User` se creará de forma reproducible |

```bash title="Comando"
npx prisma migrate dev --name init
```

```text title="Resultado"
prisma/migrations/
```

### Día 23: Prisma Studio

| Campo | Detalle |
| --- | --- |
| Concepto | Exploración visual de datos |
| Producto | Prisma Studio funcionando |
| Tarea | Abrir Studio y revisar la tabla `User` |
| Resultado | Podremos inspeccionar datos sin escribir SQL manual |

```bash title="Comando"
npx prisma studio
```

!!! note "Uso"
    Prisma Studio no sustituye a la API. Es una herramienta de apoyo para ver y comprobar los datos.

### Día 24: Seed y usuario administrador

| Campo | Detalle |
| --- | --- |
| Concepto | Datos iniciales del sistema |
| Producto | Script de seed |
| Tarea | Crear un usuario `ADMIN` inicial |
| Resultado | Podremos probar administración desde el primer momento |

```text title="Usuario inicial"
name: Admin
email: admin@email.com
password: admin123
role: ADMIN
isActive: true
```

!!! warning "Nota de seguridad"
    En esta fase la contraseña puede ser temporal. Más adelante se sustituirá por `passwordHash` con `bcrypt`.

### Día 25: Consultas básicas con Prisma

| Campo | Detalle |
| --- | --- |
| Concepto | Leer y escribir usando Prisma Client |
| Producto | Primeras operaciones con Prisma |
| Tarea | Practicar `findMany`, `findUnique` y `create` |
| Resultado | Entenderemos cómo Prisma sustituye consultas SQL directas |

```ts title="Ejemplos"
await prisma.user.findMany();
await prisma.user.findUnique({ where: { id } });
await prisma.user.create({ data: { name, email, passwordHash } });
```

## Fase 5: Arquitectura por capas

### Día 26: Separar rutas

| Campo | Detalle |
| --- | --- |
| Concepto | Separación de responsabilidades |
| Producto | `user.routes.ts` |
| Tarea | Mover rutas de usuario fuera de `server.ts` |
| Resultado | `server.ts` será más limpio |

```text title="Estructura"
src/
  routes/
    user.routes.ts
```

### Día 27: Controladores

| Campo | Detalle |
| --- | --- |
| Concepto | Controlar request y response |
| Producto | `user.controller.ts` |
| Tarea | Mover la lógica HTTP a controladores |
| Resultado | Las rutas solo definirán caminos y delegarán trabajo |

```text title="Responsabilidad"
Controller = recibe req, llama al servicio y devuelve res
```

### Día 28: Servicios

| Campo | Detalle |
| --- | --- |
| Concepto | Lógica de negocio |
| Producto | `user.service.ts` |
| Tarea | Mover reglas como email duplicado, usuario inexistente o usuario inactivo |
| Resultado | La lógica no quedará mezclada con HTTP |

```text title="Responsabilidad"
Service = reglas de negocio
```

### Día 29: Repository con Prisma

| Campo | Detalle |
| --- | --- |
| Concepto | Capa de acceso a datos |
| Producto | `user.repository.ts` |
| Tarea | Centralizar operaciones Prisma sobre usuarios |
| Resultado | El servicio no usará Prisma directamente |

```text title="Responsabilidad"
Repository = leer y escribir datos con Prisma
```

```ts title="Ejemplo conceptual"
userRepository.findById(id)
userRepository.findByEmail(email)
userRepository.create(data)
```

### Día 30: DTOs y respuestas seguras

| Campo | Detalle |
| --- | --- |
| Concepto | Controlar qué entra y qué sale de la API |
| Producto | DTOs y mapper de usuario |
| Tarea | Crear modelos de entrada y salida |
| Resultado | Nunca devolveremos información sensible |

- `CreateUserDto`
- `UpdateUserDto`
- `RegisterDto`
- `LoginDto`
- `UserResponseDto`

```json title="Respuesta correcta"
{
  "id": 1,
  "name": "Ana Garcia",
  "email": "ana@email.com",
  "role": "USER",
  "isActive": true
}
```

!!! danger "Dato prohibido en respuestas"
    `passwordHash`

### Día 31: CRUD persistente y refactor final de usuarios

| Campo | Detalle |
| --- | --- |
| Concepto | CRUD completo con arquitectura por capas |
| Producto | CRUD de usuarios persistente y ordenado |
| Tarea | Completar `GET`, `POST`, `PATCH` y `DELETE` usando servicio y repositorio |
| Resultado | La API ya no dependerá del array en memoria |

```text title="Rutas principales"
GET    /api/users
GET    /api/users/:id
POST   /api/users
PATCH  /api/users/:id
DELETE /api/users/:id
```

## Fase 6: Seguridad y autenticación

### Día 32: Hash de contraseñas

| Campo | Detalle |
| --- | --- |
| Concepto | Seguridad de credenciales |
| Producto | Integración de `bcrypt` o similar |
| Tarea | Guardar `passwordHash`, nunca `password` |
| Resultado | Las contraseñas no se almacenarán en texto plano |

```text title="Antes"
password: "123456"
```

```text title="Después"
passwordHash: "$2b$10$..."
```

### Día 33: Registro de usuarios

| Campo | Detalle |
| --- | --- |
| Concepto | Registro público |
| Producto | `POST /api/auth/register` |
| Tarea | Crear usuario desde una ruta pública |
| Resultado | Cualquier persona podrá registrarse |

```json title="Body"
{
  "name": "Laura Martinez",
  "email": "laura@email.com",
  "password": "123456"
}
```

### Día 34: Login

| Campo | Detalle |
| --- | --- |
| Concepto | Autenticación |
| Producto | `POST /api/auth/login` |
| Tarea | Comprobar email, contraseña y estado del usuario |
| Resultado | El usuario podrá iniciar sesión si sus datos son correctos |

```text title="Reglas"
El email debe existir.
La contraseña debe coincidir.
El usuario debe estar activo.
```

### Día 35: JWT

| Campo | Detalle |
| --- | --- |
| Concepto | Token de acceso |
| Producto | Generación de JWT |
| Tarea | Firmar un token con `userId` y `role` |
| Resultado | El cliente recibirá un token para autenticarse |

```json title="Respuesta"
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

- `userId`
- `role`

### Día 36: Middleware de autenticación y usuario actual

| Campo | Detalle |
| --- | --- |
| Concepto | Proteger rutas |
| Producto | `auth.middleware.ts` y `GET /api/users/me` |
| Tarea | Leer y validar el token enviado en la cabecera |
| Resultado | Solo usuarios autenticados podrán acceder a rutas protegidas |

```http title="Cabecera"
Authorization: Bearer token
```

```text title="Ruta protegida"
GET /api/users/me
```

### Día 37: Roles, autorización y acciones protegidas

| Campo | Detalle |
| --- | --- |
| Concepto | Autenticación no es autorización |
| Producto | `role.middleware.ts` y rutas protegidas por rol |
| Tarea | Permitir acciones según rol y proteger acciones sensibles |
| Resultado | La API diferenciará usuarios normales y administradores |

| Caso | Resultado |
| --- | --- |
| Sin token | No accede a rutas privadas |
| `USER` | Ve su perfil |
| `USER` | No lista usuarios |
| `ADMIN` | Lista usuarios |
| `ADMIN` | Cambia roles |
| `ADMIN` | Activa/desactiva usuarios |

```text title="Rutas protegidas"
PATCH /api/users/me/password
PATCH /api/users/:id/role
PATCH /api/users/:id/status
```

## Fase 7: Frontend entregado, integración y cierre

En este punto os entregaré un **frontend ya funcional en Next.js**. No tendréis
que construir la interfaz desde cero. Lo usaremos como cliente real para
comprobar si vuestra API funciona correctamente.

!!! quote "Cambio importante"
    Ya no se trata solo de que la API responda en Postman o Thunder Client.
    Ahora la API tendrá que funcionar con una aplicación real, respetando
    rutas, formatos de respuesta, códigos de estado, cabeceras y autenticación.

### [Día 38: Frontend entregado y conexión con la API](dia38.md)

| Campo | Detalle |
| --- | --- |
| Concepto | Conexión frontend-backend |
| Producto | Proyecto Next.js conectado a la API |
| Tarea | Configurar la URL base, comprender CORS y probar el login |
| Resultado | El frontend enviará peticiones y JWT a la API local |

```text title="Pantallas del frontend"
Login
Registro
Mi perfil
Dashboard
Panel de administración de usuarios
```

```text title="Endpoints que necesita consumir"
POST   /api/auth/register
POST   /api/auth/login
GET    /api/users/me
GET    /api/users
PATCH  /api/users/:id
DELETE /api/users/:id
```

!!! note "Idea clave"
    El frontend no se adapta mágicamente a cualquier API. Frontend y backend
    necesitan acordar rutas, datos y errores.

### [Día 39: Pruebas de integración desde el frontend](dia39.md)

| Campo | Detalle |
| --- | --- |
| Concepto | Pruebas de integración |
| Producto | Checklist completa de flujos y permisos |
| Tarea | Probar registro, login, perfiles y acciones ADMIN |
| Resultado | Comprobaremos códigos, permisos y persistencia |

```env title=".env.local del frontend"
NEXT_PUBLIC_API_URL=http://localhost:3000
```

```text title="Problemas esperados"
La API no está arrancada.
El puerto no coincide.
La ruta no existe.
El frontend espera otro nombre de campo.
El token no se envía.
Error de CORS.
```

```ts title="CORS más controlado"
app.use(cors({
  origin: "http://localhost:3001"
}));
```

### [Día 40: Documentación, demo y cierre](dia40.md)

| Campo | Detalle |
| --- | --- |
| Concepto | Cierre de producto |
| Producto | API funcional consumida por frontend |
| Tarea | Revisar, documentar y preparar una demo reproducible |
| Resultado | Proyecto final completo |

Pruebas mínimas desde el frontend:

- Registrar usuario.
- Iniciar sesión.
- Consultar mi perfil.
- Entrar como `ADMIN`.
- Listar usuarios.
- Crear usuario.
- Desactivar usuario.
- Comprobar que un `USER` no accede a zonas de `ADMIN`.

Entrega final recomendada:

- Backend funcionando.
- Frontend entregado conectado.
- Base de datos persistente.
- Prisma configurado.
- Usuario `ADMIN` inicial.
- Registro y login.
- JWT.
- Roles.
- CRUD de usuarios.
- Validaciones.
- Errores centralizados.
- CORS configurado.
- README.
- Docker Compose.
- Colección Postman o documentación Swagger.

## Estructura final del backend

```text
src/
  app.ts
  server.ts

  config/
    env.ts
    database.ts

  routes/
    auth.routes.ts
    user.routes.ts

  controllers/
    auth.controller.ts
    user.controller.ts

  services/
    auth.service.ts
    user.service.ts

  repositories/
    user.repository.ts

  middlewares/
    auth.middleware.ts
    role.middleware.ts
    error.middleware.ts

  dtos/
    create-user.dto.ts
    update-user.dto.ts
    login.dto.ts
    register.dto.ts
    user-response.dto.ts

  errors/
    AppError.ts

  utils/
    hash.ts
    jwt.ts
```

## README mínimo recomendado

```text
# UserManager API

## Requisitos
- Node.js
- Docker
- Docker Compose

## Instalación del backend
1. Clonar el repositorio.
2. Instalar dependencias.
3. Crear archivo .env.
4. Levantar base de datos.
5. Ejecutar migraciones de Prisma.
6. Ejecutar seed de Prisma.
7. Arrancar servidor.

## Variables de entorno backend
PORT=3000
DATABASE_URL=...
JWT_SECRET=...

## Instalación del frontend
1. Abrir proyecto Next.js.
2. Crear .env.local.
3. Configurar NEXT_PUBLIC_API_URL.
4. Arrancar frontend.

## Variables de entorno frontend
NEXT_PUBLIC_API_URL=http://localhost:3000/api

## Usuario administrador inicial
email: admin@email.com
password: admin123

## Endpoints principales
POST /api/auth/register
POST /api/auth/login
GET /api/users/me
GET /api/users
PATCH /api/users/:id
DELETE /api/users/:id
```

## Organización semanal orientativa

| Semana | Trabajo principal |
| --- | --- |
| 1 | Fundamentos de API, HTTP, JSON y pruebas con cliente HTTP |
| 2 | CRUD de usuarios en memoria y validaciones |
| 3 | Base de datos, Docker y decisión de ORM |
| 4 | Prisma, migraciones, Studio, seed y primeras consultas |
| 5 | Arquitectura por capas, repositorios, servicios, DTOs y CRUD persistente |
| 6 | Hash, registro, login, JWT, middleware, roles e integración con frontend entregado |

## Idea final del reto

Lo importante de este reto no es memorizar comandos ni copiar código. Lo
importante es entender cómo se construye un backend paso a paso.

Al final, deberíais poder explicar:

- Qué rutas tiene vuestra API.
- Cómo se conecta a la base de datos.
- Dónde se valida la información.
- Dónde está la lógica de negocio.
- Cómo se protege una ruta.
- Cómo se genera y valida un JWT.
- Qué puede hacer un `USER` y qué puede hacer un `ADMIN`.
- Cómo se conecta el frontend con el backend.
- Cómo se arranca el proyecto desde cero.

!!! success "Mensaje de cierre"
    Una API no está terminada cuando responde. Una API está terminada cuando es
    segura, persistente, mantenible, documentada y puede ser usada por un
    cliente real.
