import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

export const roleGuard: CanActivateFn = (route) => {
  const msalService = inject(MsalService);
  const router = inject(Router);
  const account = msalService.instance.getActiveAccount();
  const requiredRoles = (route.data?.['roles'] as string[] | undefined) ?? [];
  const roles = (account?.idTokenClaims?.['roles'] as string[] | undefined) ?? [];

  if (requiredRoles.some((role) => roles.includes(role))) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
