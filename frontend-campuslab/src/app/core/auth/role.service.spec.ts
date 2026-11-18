import { TestBed } from '@angular/core/testing';
import { MsalService } from '@azure/msal-angular';
import { afterEach, describe, expect, it } from 'vitest';
import { RoleService } from './role.service';

describe('Real account roles', () => {
  afterEach(() => localStorage.removeItem('campuslab-development-role'));
  it('does not turn a student into Admin through a saved development preview', () => {
    localStorage.setItem('campuslab-development-role', 'Admin');
    TestBed.configureTestingModule({ providers: [{ provide: MsalService, useValue: {
      instance: { getActiveAccount: () => ({ idTokenClaims: { roles: ['ClienteDominio'] } }) },
    } }] });
    const roles = TestBed.inject(RoleService);
    expect(roles.getRoles()).toEqual(['ClienteDominio']); expect(roles.isAdmin()).toBe(false);
  });
  it('does not assume Admin when there are no role claims', () => {
    TestBed.configureTestingModule({ providers: [{ provide: MsalService, useValue: {
      instance: { getActiveAccount: () => ({ idTokenClaims: {} }) },
    } }] });
    expect(TestBed.inject(RoleService).getRoles()).toEqual([]);
  });
});
