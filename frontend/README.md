# Frontend de UserManager API

Cliente web didáctico creado con Next.js, TypeScript y Fetch nativo. No tiene
base de datos ni rutas API propias: todas las operaciones se envían al backend.

## Instalación y arranque

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Abre `http://localhost:3001`. El backend debe estar disponible en el puerto
indicado por:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Reinicia el servidor de Next.js después de modificar esta variable.

## Pantallas y endpoints

| Pantalla | Ruta web | Endpoints |
| --- | --- | --- |
| Inicio | `/` | Ninguno |
| Registro | `/register` | `POST /api/auth/register` |
| Login | `/login` | `POST /api/auth/login` |
| Mi perfil | `/dashboard` | `GET /api/users/me`, `PATCH /api/users/:id` |
| Panel admin | `/admin/users` | `GET /api/users`, `POST /api/users`, `DELETE /api/users/:id` |

El token se guarda en `localStorage` con fines didácticos y `apiFetch` lo envía
como `Authorization: Bearer <token>`. En una aplicación de producción habría
que valorar mecanismos más resistentes a XSS, como cookies `HttpOnly`.

## Usuarios de prueba

| Email | Contraseña | Rol/estado |
| --- | --- | --- |
| `admin@email.com` | `admin123` | `ADMIN` |
| `user@email.com` | `user123` | `USER` |
| `inactive@email.com` | `inactive123` | `USER` inactivo |

Si el navegador muestra un error de conexión, comprueba que el backend está
arrancado y permite el origen `http://localhost:3001` mediante CORS.
