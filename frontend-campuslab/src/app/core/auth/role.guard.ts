import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleService, AppRole } from './role.service';

/**
 * Guard funcional por rol. Se combina con MsalGuard en las rutas:
 * MsalGuard exige sesión; RoleGuard exige que el rol del usuario esté
 * en route.data['roles']. Ver tabla "6. Pantallas propuestas" del caso.
 */
export const roleGuard: CanActivateFn = (route) => {
  const roleService = inject(RoleService);
  const router = inject(Router);

  const allowed = (route.data['roles'] as AppRole[] | undefined) ?? [];
  if (allowed.length === 0 || roleService.hasAnyRole(allowed)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
