import { TestBed } from '@angular/core/testing';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { AccountInfo, InteractionStatus } from '@azure/msal-browser';
import { BehaviorSubject } from 'rxjs';
import { RoleService } from './role.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Recuperación de la sesión', () => {
  let accounts: AccountInfo[];
  let active: AccountInfo | null;
  let progress: BehaviorSubject<InteractionStatus>;
  const user = (roles: string[] = ['ClienteDominio']) => ({
    homeAccountId: 'test', localAccountId: 'test', environment: 'test', tenantId: 'test',
    username: 'estudiante@example.test', name: 'Estudiante CampusLab', idTokenClaims: { roles },
  }) as AccountInfo;

  beforeEach(() => {
    accounts = []; active = null;
    progress = new BehaviorSubject<InteractionStatus>(InteractionStatus.Startup);
    TestBed.configureTestingModule({ providers: [
      RoleService,
      { provide: MsalBroadcastService, useValue: { inProgress$: progress } },
      { provide: MsalService, useValue: { instance: {
        getAllAccounts: () => accounts,
        getActiveAccount: () => active,
        setActiveAccount: vi.fn((account: AccountInfo) => { active = account; }),
      } } },
    ] });
  });

  it('recupera la cuenta almacenada al abrir directamente dashboard', () => {
    const roles = TestBed.inject(RoleService);
    accounts = [user()]; progress.next(InteractionStatus.None);
    expect(active).toBe(accounts[0]);
    expect(roles.displayName()).toBe('Estudiante CampusLab');
    expect(roles.getRoles()).toEqual(['ClienteDominio']);
  });

  it('actualiza la cuenta cuando finaliza el retorno del login', () => {
    const roles = TestBed.inject(RoleService);
    expect(roles.sessionReady()).toBe(false);
    const account = user(['OperadorDominio']);
    roles.refreshAccount(account);
    expect(active).toBe(account);
    expect(roles.getRoles()).toEqual(['OperadorDominio']);
  });

  it('no inventa permisos si Microsoft no entrega roles', () => {
    const roles = TestBed.inject(RoleService);
    accounts = [user([])]; progress.next(InteractionStatus.None);
    expect(roles.displayName()).toBe('Estudiante CampusLab');
    expect(roles.getRoles()).toEqual([]);
    expect(roles.isAdmin()).toBe(false);
  });

  it('no elige arbitrariamente entre varias cuentas', () => {
    const roles = TestBed.inject(RoleService);
    accounts = [user(), user(['Admin'])]; progress.next(InteractionStatus.None);
    expect(active).toBe(null);
    expect(roles.getRoles()).toEqual([]);
  });
});

