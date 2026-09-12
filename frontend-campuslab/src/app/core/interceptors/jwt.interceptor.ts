import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Temporalmente no se adjunta token: el backend y su scope aún no están disponibles.
  // Reactivar al integrar la API protegida.
  return next(req);
};
