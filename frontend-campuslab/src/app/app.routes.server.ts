import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // El navegador debe procesar la respuesta de MSAL antes de navegar al dashboard.
    path: '',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    // Authenticated pages depend on the browser's MSAL session.
    renderMode: RenderMode.Client
  }
];
