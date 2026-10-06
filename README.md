# Foliovio Frontend

Repositorio independiente de la interfaz de Foliovio, construido con React y Vite. Se comunica por HTTP con el backend; no necesita su código, un workspace ni un paquete compartido para instalarse o compilarse.

## Desarrollo

Requiere Node.js 22.13 o superior y npm 10 o superior. Desde este repositorio:

```bash
npm ci
cp .env.example .env
npm run dev
```

En PowerShell, `Copy-Item .env.example .env`. Abre `http://localhost:5173`. Inicia el backend en otra terminal con sus propios comandos; el proxy de Vite dirige `/api` a `http://localhost:3001`.

Para usar un backend remoto, configura `VITE_API_URL=https://api.ejemplo.com`, sin `/api` final. Esta variable, al igual que las demás `VITE_*`, es pública y se incorpora durante la compilación. Nunca incluyas secretos de administración, JWT o webhooks aquí.

## Comandos

| Comando | Función |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en el puerto 5173 |
| `npm run build` | Validar TypeScript y generar `dist/` |
| `npm run preview` | Revisar `dist/` en el puerto 5173, con proxy local al backend |
| `npm test` | Prueba de importación de currículums |
| `npm run lint` | Análisis estático del frontend |

## Configuración

Consulta `.env.example`: URL de API, precio mostrado, checkout, WhatsApp y contacto. El frontend utiliza cookies mediante `credentials: include`; el backend debe permitir el origen de esta aplicación en `APP_ORIGIN`.

La interfaz consulta el usuario y su plan mediante `/api/auth/me`. Las rutas `/api/auth/register`, `/api/auth/login`, `/api/auth/logout` gestionan la sesión. `/api/billing/subscription` consulta el plan y `/api/billing/export` autoriza la descarga. La activación `/api/billing/activate` solo está habilitada en desarrollo.

Los tipos del cliente están en `src/contracts/api.d.ts`. Son una copia del contrato HTTP, sin importaciones al repositorio del backend. Al cambiar la API, mantén compatibilidad o actualiza esta copia y el cliente HTTP de `src/api.ts`. La implementación del backend es la fuente de las reglas de suscripción.

## Despliegue

1. Clona únicamente este repositorio e instala con `npm ci`.
2. Configura `VITE_API_URL` y las demás variables públicas antes de `npm run build`.
3. Publica `dist/` en un hosting estático con fallback de navegación a `index.html`.
4. También puedes dejar `VITE_API_URL` vacío y configurar un proxy del hosting desde `/api` al backend. El proxy de Vite solo aplica al desarrollo y a `preview`.

Usa HTTPS y, preferentemente, el mismo sitio para frontend y API. Las cookies entre sitios distintos dependen de la configuración del backend y de las restricciones del navegador. Este repositorio dispone de su propio workflow de CI, lockfile y configuración Git.

## Procedencia y datos

Extraído del estado local de `dev` de Foliovio el 6 de octubre de 2026, incluyendo la separación de suscripciones realizada después del commit `c3c8f24`. El historial original permanece en el repositorio `foliovio`; este repositorio inicia su propia historia. No se copiaron secretos, bases de datos ni artefactos compilados.

El CV sigue almacenándose en el navegador; no hay almacenamiento remoto de CV por usuario. La impresión es del lado del cliente. El acceso Pro y el consumo se verifican en el backend antes del flujo normal de exportación.
