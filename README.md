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
| `npm test` | Pruebas de importación de currículums y caducidad por inactividad |
| `npm run lint` | Análisis estático del frontend |

## Configuración

Consulta `.env.example`: URL de API, precio mostrado, checkout, WhatsApp y contacto. El frontend utiliza cookies mediante `credentials: include`; el backend debe permitir el origen de esta aplicación en `APP_ORIGIN`.

La interfaz consulta el usuario y su plan mediante `/api/auth/me`. Las rutas `/api/auth/register`, `/api/auth/login`, `/api/auth/logout` gestionan la sesión. `/api/billing/subscription` consulta el plan y `/api/billing/export` autoriza la descarga. La activación `/api/billing/activate` solo está habilitada en desarrollo.

Los tipos del cliente están en `src/contracts/api.d.ts`. Son una copia del contrato HTTP, sin importaciones al repositorio del backend. Al cambiar la API, mantén compatibilidad o actualiza esta copia y el cliente HTTP de `src/api.ts`. La implementación del backend es la fuente de las reglas de suscripción.

## Ramas y Railway

La sesión se cierra tras 10 minutos sin interacción (teclado, puntero, rueda o
toque), con un aviso para volver a entrar y sin borrar el currículum guardado.
La actividad se comunica al backend como máximo una vez cada 10 segundos;
el tiempo entre la interacción y el envío no renueva artificialmente la sesión.
Las consultas automáticas, el foco y recargar la página no reinician el plazo.
Al volver de una pestaña suspendida se comprueba el tiempo transcurrido.
Las pestañas del mismo origen comparten actividad y cierre para la misma sesión;
si el almacenamiento está deshabilitado se conserva la caducidad en memoria.
El backend aplica también el límite, incluso si el navegador está desconectado.
Desplegar con la migración 4 del backend: las sesiones antiguas requieren otro
inicio de sesión y no hay variables de entorno nuevas.

Paddle Billing usa el SDK oficial `@paddle/paddle-js`. La configuración pública y el precio se consultan al backend en `/api/billing/config`; no necesitas claves `VITE_PADDLE_*`. El checkout usa una transacción creada por el backend para el usuario autenticado. El cuadro mensual explica renovación y cancelación; Mi cuenta permite abrir el portal de pagos. El evento de checkout completado consulta el plan, pero solo el webhook firmado del backend concede Pro. Para activar Paddle configura las cinco variables `PADDLE_*` siguiendo `docs/paddle.md` del backend. Si Paddle está habilitado tiene prioridad sobre el checkout anterior y los enlaces manuales. Mantén `VITE_PRICE` alineado con el precio comercial del producto.

El registro nuevo requiere activación por correo. La interfaz muestra el estado pendiente, ofrece reenviar el enlace y procesa `/#verify-email=TOKEN` con confirmación manual. Después de confirmar, el usuario inicia sesión con su contraseña. Las credenciales de SendGrid se configuran únicamente en el backend (`SENDGRID_API_KEY`, `EMAIL_FROM`, `EMAIL_FROM_NAME`); el frontend no envía correos. `APP_ORIGIN` en el backend debe coincidir con el dominio público del frontend para generar los enlaces.

Trabajamos en `dev` y publicamos desde `prd`. La primera versión de producción parte de `dev`; los siguientes cambios pasan mediante un PR de `dev` a `prd`. Configura el servicio de Railway para seguir únicamente `prd` y esperar al CI. La guía enlazada más abajo detalla la configuración inicial del proyecto.

`Dockerfile` compila la aplicación y Caddy sirve `dist/` en producción. `railway.json` usa ese Dockerfile y verifica `/healthz`. Caddy hace fallback a `index.html` y reenvía `/api` al backend indicado por `API_UPSTREAM`, conservando la ruta y las cookies.

La imagen fija `VITE_API_URL` vacío para usar ese proxy del mismo origen. `API_UPSTREAM` es una variable del servidor en ejecución, por ejemplo `http://backend.railway.internal:3001`; nunca se envía al navegador. Precio y enlaces públicos `VITE_*` se configuran al compilar mediante los argumentos declarados en el Dockerfile. Para el desarrollo con Vite se mantiene la configuración habitual de `.env.example`.

Consulta [la guía de Railway](docs/railway.md). No uses `vite preview` como servidor de producción.

## Procedencia y datos

Extraído del estado local de `dev` de Foliovio el 6 de octubre de 2026, incluyendo la separación de suscripciones realizada después del commit `c3c8f24`. Este repositorio mantiene su propia historia. No se copiaron secretos, bases de datos ni artefactos compilados.

El CV sigue almacenándose en el navegador; no hay almacenamiento remoto de CV por usuario. La impresión es del lado del cliente. El acceso Pro y el consumo se verifican en el backend antes del flujo normal de exportación.
