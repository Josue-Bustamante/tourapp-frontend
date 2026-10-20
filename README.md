# TourApp Frontend

Aplicación web para la gestión y reserva de tours en Perú, construida con **Angular 22** (standalone), **Angular Material 3**, **signals** y una interfaz completamente en español.

Incluye un sitio público para explorar experiencias y reservar, además de un panel administrativo para gestionar todo el catálogo y la operación.

---

## Funcionalidades

### Sitio público

- **Inicio**: hero con búsqueda, destinos destacados, tours recomendados, propuesta de valor, testimonios y llamada a la acción.
- **Catálogo de tours** (`/tours`): búsqueda por texto, filtro por duración y ordenamiento por precio, duración o nombre.
- **Detalle del tour** (`/tours/:id`): descripción, itinerario con lugares y tarifas, salidas disponibles, selector de viajeros y precio total estimado.
- **Reserva** (`/reservar/:idTour`): selección de salida, datos del viajero (cliente nuevo o existente) y confirmación con código de reserva.

### Panel administrativo (`/admin`)

- Dashboard con indicadores, ingresos, reservas por mes, próximas salidas y actividad reciente.
- CRUD de **tours**, **lugares**, **viajes**, **reservas**, **clientes**, **buses**, **conductores**, **guías** y **usuarios**.
- Tablas con búsqueda, ordenamiento, paginación y diálogos de formulario reutilizables.
- Navegación lateral responsive con Angular Material Sidenav.

### Modo demostración

Si el backend no está disponible o la base de datos aún no tiene tours, el sitio público muestra un catálogo de ejemplo (identificadores negativos y etiqueta `Demo`) para poder recorrer la interfaz completa sin API. Las reservas realizadas en este modo son simuladas y no se guardan.

---

## Requisitos

- Node.js 20 o superior (probado con Node 24).
- npm 10 o superior.
- Backend `tourapp-backend` escuchando en `http://localhost:9494`.
- PostgreSQL con la base de datos `tourApp` (según la configuración del backend).

## Instalación y ejecución

```bash
npm install
npm start
```

La aplicación queda disponible en `http://localhost:4200`.

El archivo `proxy.conf.json` redirige las peticiones `/v1/**` hacia `http://localhost:9494`, evitando problemas de CORS durante el desarrollo:

```json
{
  "/v1": {
    "target": "http://localhost:9494",
    "secure": false,
    "changeOrigin": true
  }
}
```

## Compilación

```bash
npm run build
```

Los archivos de producción se generan en `dist/tourapp-frontend/browser`.

## Configuración del API

Las URLs se definen en `src/environments/environment.ts` y `src/environments/environment.development.ts`:

```ts
export const environment = {
  production: false,
  HOST: '', // Las peticiones usan rutas relativas /v1 y el proxy de desarrollo
};
```

En producción, si el API se sirve desde otro dominio, cambia `HOST` por la URL completa:

```ts
HOST: 'https://api.tudominio.com',
```

## Endpoints consumidos

| Recurso     | Endpoint       |
| ----------- | -------------- |
| Tours       | `/v1/tours`    |
| Lugares     | `/v1/places`   |
| Viajes      | `/v1/trips`    |
| Reservas    | `/v1/bookings` |
| Clientes    | `/v1/clients`  |
| Buses       | `/v1/buses`    |
| Conductores | `/v1/drivers`  |
| Guías       | `/v1/guides`   |
| Usuarios    | `/v1/userdata` |

> Las reservas y los clientes se crean con `POST`; el backend responde `201` con la cabecera `Location` y sin cuerpo. El frontend usa esa cabecera para obtener el identificador de la reserva creada.

## Estructura del proyecto

```text
src/
├── app/
│   ├── layout/          # Shells público y administrativo
│   ├── models/          # Interfaces del dominio
│   ├── pages/
│   │   ├── home/
│   │   ├── tours/
│   │   ├── tour-detail/
│   │   ├── reservation/
│   │   └── admin/       # Dashboard y páginas CRUD
│   ├── services/        # Servicios HTTP + CrudService base con signals
│   ├── shared/          # TourCard, EntityCrud, FormDialog y tipos
│   ├── app.config.ts
│   ├── app.routes.ts
│   ├── demo-data.ts
│   ├── pipes.ts
│   └── tour-images.ts
├── environments/
├── public/img/          # Fotografías de destinos y experiencias
├── material-theme.scss
├── styles.css
└── main.ts
```

## Rutas principales

| Ruta                | Descripción                   |
| ------------------- | ----------------------------- |
| `/`                 | Inicio                        |
| `/tours`            | Catálogo                      |
| `/tours/:id`        | Detalle del tour              |
| `/reservar/:idTour` | Flujo de reserva              |
| `/admin`            | Dashboard                     |
| `/admin/tours`      | Administración de tours       |
| `/admin/trips`      | Administración de viajes      |
| `/admin/bookings`   | Administración de reservas    |
| `/admin/clients`    | Administración de clientes    |
| `/admin/places`     | Administración de lugares     |
| `/admin/guides`     | Administración de guías       |
| `/admin/drivers`    | Administración de conductores |
| `/admin/buses`      | Administración de buses       |
| `/admin/users`      | Administración de usuarios    |

## Tecnologías

- Angular 22 (standalone components, signals, control flow `@if` / `@for`)
- Angular Material 3 + Angular CDK
- RxJS
- Reactive Forms
- TypeScript 6
- Vitest (configuración de pruebas de Angular)

## Notas académicas

- El panel administrativo no incluye autenticación; está pensado como demostración funcional del CRUD para el curso.
- Las contraseñas de usuarios se almacenan tal como se ingresan en el backend académico; no usar este esquema en producción.
- Las fotografías se incluyen en `public/img` con fines demostrativos.
- El backend actual declara `Bus.plate` como `char`, por lo que solo admite placas de un carácter y puede fallar al listar buses o viajes. Mientras no se corrija ese modelo, el CRUD de buses debe usarse con placas de un solo carácter y no se pueden programar viajes ni reservas sobre tours reales. El resto del catálogo y los CRUD funcionan con normalidad.
