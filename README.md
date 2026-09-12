# CampusLab — Frontend

Frontend de **CampusLab**, una plataforma para gestionar la reserva de laboratorios, equipos e insumos académicos en instituciones de educación superior.

## Integrantes

- Macarena Espinoza
- Ignacio Perez

## Tecnologías

- Angular 21
- MSAL para Angular
- Microsoft Entra ID (Azure AD)
- TypeScript y CSS

## Funcionalidades

- Inicio de sesión corporativo con Microsoft Entra ID.
- Navegación y autorización según el rol del usuario.
- Dashboard con ocupación del día, equipos pendientes e insumos bajo umbral.
- Gestión de reservas.
- Catálogo de laboratorios, equipos e insumos.
- Reportería operacional.
- Auditoría de eventos.

## Roles

| Rol | Permisos principales |
| --- | --- |
| Admin | Acceso a todas las vistas; administra catálogo y revisa reportes. |
| Operador del dominio | Gestiona reservas y catálogo. |
| Cliente del dominio | Solicita y consulta sus reservas. |
| Auditor | Consulta la vista de auditoría. |

## Rutas principales

| Pantalla | Ruta |
| --- | --- |
| Login | `/login` |
| Dashboard | `/dashboard` |
| Reservas | `/bookings` |
| Catálogo de recursos | `/catalog` |
| Reportería | `/reports` |
| Auditoría | `/audit` |

> Mientras el backend está en desarrollo, las pantallas muestran datos de ejemplo. Las operaciones que requieren guardar información estarán disponibles cuando se conecte la API.

## Ejecutar el proyecto

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Inicia la aplicación:

   ```bash
   npm start
   ```

3. Abre `http://localhost:4200` en el navegador.

## Configuración de Entra ID

La configuración de la aplicación se encuentra en:

`src/environments/environment.development.ts`

Allí se definen el `clientId`, `tenantId`, `authority` y la URL de retorno. Para producción, usa valores propios y no publiques secretos en este repositorio.

## Comandos útiles

```bash
npm run build     # Genera la versión de producción
npm test          # Ejecuta las pruebas
```