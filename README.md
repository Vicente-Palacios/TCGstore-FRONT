# TCGstore — Frontend

Aplicación web de TCGstore para consultar y administrar cartas coleccionables y solicitar informes. Desarrollada con React, TypeScript y Vite. La autenticación se integra con Amazon Cognito y las solicitudes de datos se envían a la API configurada, normalmente AWS API Gateway.

## Funcionalidades

- Inicio de sesión con Cognito mediante OpenID Connect y flujo Authorization Code.
- Catálogo con búsqueda y filtros, carrito y vistas de inventario y administración.
- Creación y edición de cartas para Admin y Colaborador; eliminación para Admin.
- Solicitud de informes desde la vista de administración para Admin.
- Rutas protegidas y adaptación de la interfaz según grupos de Cognito.

La autorización definitiva se aplica en el BFF. El carrito es estado del cliente; no se documenta como venta persistida ni como integración de pagos.

## Tecnologías

React 19, TypeScript, Vite, React Router, `react-oidc-context`, `oidc-client-ts` y API `fetch`.

## Requisitos

- Node.js compatible con las versiones de Vite del proyecto y npm. Se recomienda Node 24 LTS.
- Un User Pool de Cognito, cliente SPA y API configurados para el ambiente elegido.

## Instalación y ejecución

Desde la carpeta raíz del frontend, en PowerShell:

```powershell
npm ci
Copy-Item .env.example .env.local
```

Edita `.env.local` con los valores de tu ambiente:

```dotenv
VITE_COGNITO_AUTHORITY=https://cognito-idp.<region>.amazonaws.com/<user-pool-id>
VITE_COGNITO_CLIENT_ID=<client-id>
VITE_API_BASE_URL=https://<api-gateway>
```

La URL de la API debe ir sin barra final. Configura en Cognito la URL exacta del frontend como callback, por ejemplo `http://localhost:5173`; revisa también la configuración de cierre de sesión. La API debe permitir el origen mediante CORS.

```powershell
npm run dev
```

Abre la URL indicada por Vite, normalmente `http://localhost:5173`.

| Comando | Función |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run build` | Comprueba TypeScript y genera `dist/`. |
| `npm run preview` | Sirve localmente el build generado. |
| `npm run lint` | Ejecuta oxlint. |

## Configuración en Vercel

Importa el repositorio en Vercel, configura las tres variables `VITE_*` para el ambiente correspondiente y realiza un nuevo despliegue después de modificarlas: Vite las incorpora al compilar. `vercel.json` configura la reescritura para las rutas de la SPA. Agrega el origen de Vercel a las callback URLs de Cognito y a CORS del API Gateway.

Las variables `VITE_*` quedan expuestas en el navegador: **no incluyas contraseñas, claves secretas, credenciales de AWS ni el secreto del Gateway**.

## Comunicación y seguridad

El cliente usa `/api/cards` para el catálogo y `POST /api/informes/generar` para solicitar informes. La respuesta `202` indica que la solicitud fue aceptada, no que el informe ya terminó.

En esta versión `CardsContext` envía `access_token` y `AdminPage` envía `id_token` para informes. Hay que comprobar que el API Gateway y el BFF admitan los tokens enviados, validen el cliente y apliquen los permisos esperados; los scopes no se deben dar por validados solo porque existan en el token. No subas tokens reales a Git.

## Estructura

- `src/api/`: llamadas HTTP para cartas e informes.
- `src/components/`, `src/pages/` y `src/layouts/`: interfaz.
- `src/context/`: estado del catálogo y carrito.
- `src/hooks/` y `src/routes/`: roles y protección de rutas.
- `src/main.tsx`: configuración de Cognito y arranque.
- `src/config.ts`: dirección base de la API.

## Solución de problemas

- **Error al iniciar sesión:** comprueba issuer, client ID y callback URL en Cognito.
- **Error CORS:** habilita el origen exacto y los métodos/cabeceras necesarios en API Gateway.
- **401 o 403:** revisa token, configuración del authorizer y grupo del usuario; 403 también puede indicar falta de permisos.
- **Variables cambiadas en Vercel sin efecto:** vuelve a desplegar el frontend.
