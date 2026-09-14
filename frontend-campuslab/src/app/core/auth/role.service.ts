import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AccountInfo, InteractionStatus } from '@azure/msal-browser';
import { filter } from 'rxjs';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
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
  private broadcast = inject(MsalBroadcastService);
  private account = signal<AccountInfo | null>(null, {
    equal: (previous, current) => JSON.stringify(previous) === JSON.stringify(current),
  });
  readonly sessionReady = signal(false);

  constructor() {
    this.broadcast.inProgress$
      .pipe(filter(status => status === InteractionStatus.None), takeUntilDestroyed())
      .subscribe(() => this.refreshAccount());
  }

  refreshAccount(preferred?: AccountInfo | null): void {
    const accounts = this.msal.instance.getAllAccounts();
    const account = preferred ?? this.msal.instance.getActiveAccount()
      ?? (accounts.length === 1 ? accounts[0] : null);
    if (account) this.msal.instance.setActiveAccount(account);
    this.account.set(account);
    this.sessionReady.set(true);
  }

  private currentAccount(): AccountInfo | null {
    return this.account() ?? this.msal.instance.getActiveAccount();
  }

  private get storage(): Storage | null {
    if (typeof window === 'undefined') return null;
    try {
      return typeof window.localStorage?.getItem === 'function' ? window.localStorage : null;
    } catch {
      return null;
    }
  }

  getRoles(): AppRole[] {
    const account = this.currentAccount();
    const claims = account?.idTokenClaims as { roles?: AppRole[] } | undefined;
    const roles = claims?.roles ?? [];

    // Permite revisar todas las vistas hasta que Entra ID entregue los app roles.
    // En producción siempre prevalece el rol real incluido en el token.
    if (!environment.production && environment.allowRolePreview) {
      return [this.getDevelopmentRole() ?? roles[0] ?? 'Admin'];
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
    const account = this.currentAccount();
    return account?.name ?? account?.username ?? 'Usuario';
  }
}


