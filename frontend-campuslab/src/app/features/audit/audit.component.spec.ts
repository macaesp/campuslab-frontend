import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuditComponent } from './audit.component';
import { AuditPage, AuditService } from '../../core/services/audit.service';

describe('Audit view with asynchronous API data', () => {
  let pending: Subject<AuditPage>;
  beforeEach(() => {
    pending = new Subject<AuditPage>();
    TestBed.configureTestingModule({ imports: [AuditComponent], providers: [
      { provide: AuditService, useValue: { list: vi.fn(() => pending) } },
    ] });
  });

  it('renders server events and pagination without requiring another user action', async () => {
    const fixture = TestBed.createComponent(AuditComponent);
    fixture.detectChanges(); await Promise.resolve();
    pending.next({ events: [{ id: 'event-1', timestamp: '2026-11-14T12:00:00Z', actorNombre: '[DEMO LOCAL] Operador',
      actorRol: 'OperadorDominio', accion: 'APROBO', objeto: 'RES-1', sede: 'Laboratorio de prueba' }], totalPages: 2, totalElements: 51 });
    pending.complete(); await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('[DEMO LOCAL] Operador');
    expect(fixture.nativeElement.textContent).toContain('Aprobó');
    expect(fixture.nativeElement.textContent).toContain('51 eventos');
    expect(fixture.nativeElement.textContent).not.toContain('Cargando');
  });

  it('renders the API failure instead of remaining stuck on loading', async () => {
    const fixture = TestBed.createComponent(AuditComponent);
    fixture.detectChanges(); await Promise.resolve();
    pending.error(new Error('API unavailable')); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('No se pudo cargar');
    expect(fixture.nativeElement.textContent).not.toContain('Cargando');
  });
});
