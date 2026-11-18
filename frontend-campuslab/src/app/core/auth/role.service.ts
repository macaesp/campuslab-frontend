import { Injectable, inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../../../environments/environment';

export type AppRole = 'Admin' | 'OperadorDominio' | 'ClienteDominio' | 'Auditor';
const DEVELOPMENT_ROLE_KEY = 'campuslab-development-role';

/**
 * Lee el claim "roles" del ID token (App roles asignados en Azure AD
 * al App Registration "CampusLab". Esto solo controla las vistas del frontend.
 */
@Injectable({ providedIn: 'root' })
export class RoleService {
  private msal = inject(MsalService);

  private get storage(): Storage | null {
    if (typeof window === 'undefined') return null;
    try {
      return typeof window.localStorage?.getItem === 'function' ? window.localStorage : null;
    } catch {
      return null;
    }
  }

  getRoles(): AppRole[] {
    const account = this.msal.instance.getActiveAccount();
    const claims = account?.idTokenClaims as { roles?: AppRole[] } | undefined;
    const roles = claims?.roles ?? [];

    // La previsualización es optativa; normalmente siempre se usan los roles reales.
    if (!environment.production && environment.allowRolePreview) {
      const preview = this.getDevelopmentRole();
      if (preview) return [preview];
    }

    return roles;
  }

  getDevelopmentRole(): AppRole | null {
    const storage = this.storage;
    if (environment.production || !environment.allowRolePreview || !storage) return null;
    const role = storage.getItem(DEVELOPMENT_ROLE_KEY) as AppRole | null;
    return role && ['Admin', 'OperadorDominio', 'ClienteDominio', 'Auditor'].includes(role)
      ? role
      : null;
  }

  setDevelopmentRole(role: AppRole): void {
    const storage = this.storage;
    if (!environment.production && environment.allowRolePreview && storage) {
      storage.setItem(DEVELOPMENT_ROLE_KEY, role);
    }
  }

  labelFor(role: AppRole): string {
    const labels: Record<AppRole, string> = {
      Admin: 'Administrador',
      OperadorDominio: 'Técnico (Operador)',
      ClienteDominio: 'Estudiante (Cliente)',
      Auditor: 'Auditor',
    };
    return labels[role];
  }

  hasAnyRole(allowed: AppRole[]): boolean {
    const mine = this.getRoles();
    return allowed.some((r) => mine.includes(r));
  }

  isAdmin(): boolean { return this.hasAnyRole(['Admin']); }
  isOperador(): boolean { return this.hasAnyRole(['OperadorDominio']); }
  isCliente(): boolean { return this.hasAnyRole(['ClienteDominio']); }
  isAuditor(): boolean { return this.hasAnyRole(['Auditor']); }

  displayName(): string {
    const account = this.msal.instance.getActiveAccount();
    return account?.name ?? account?.username ?? 'Usuario';
  }
}
