import { RenderMode, ServerRoute } from '@angular/ssr';

// El login y los datos se procesan en el navegador; S3 solo sirve los archivos.
export const serverRoutes: ServerRoute[] = [
  { path: '**', renderMode: RenderMode.Client },
];
