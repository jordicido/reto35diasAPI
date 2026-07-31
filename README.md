# UserManager API · Reto de 40 días

Material didáctico para construir paso a paso una API REST de gestión de
usuarios con Express, TypeScript, PostgreSQL, Prisma, JWT y roles, y conectarla
con un frontend sencillo en Next.js.

La guía completa y el índice de los días 1–40 están en
[`docs/index.md`](docs/index.md).

## Últimos días

- [Día 38 - Frontend entregado y conexión con la API](docs/dia-38-frontend-conexion-api.md)
- [Día 39 - Pruebas de integración desde el frontend](docs/dia-39-pruebas-integracion-frontend.md)
- [Día 40 - Documentación, demo y cierre](docs/dia-40-documentacion-demo-cierre.md)

## Frontend de prueba

El proyecto incluye un frontend sencillo en la carpeta `frontend/` para probar
la conexión con la API.

Arranque:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Variable necesaria:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

El frontend se abre en `http://localhost:3001`. Consulta
[`frontend/README.md`](frontend/README.md) para ver las pantallas, endpoints y
usuarios de prueba.

## Documentación web

El sitio se genera con Zensical:

```bash
./.venv/bin/zensical build
```

Los archivos fuente están en `docs/`. La carpeta `site/` contiene la salida
generada.
