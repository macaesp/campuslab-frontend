import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuditService } from './audit.service';
import { environment } from '../../../environments/environment';

describe('Audit API', () => {
  let service: AuditService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuditService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('queries filters and pagination and displays actual server events', () => {
    service.list({ usuario: 'Operadora real', desde: '2026-11-13', tipoEvento: 'APROBO' }, 2).subscribe(page => {
      expect(page.events[0].actorNombre).toBe('Operadora real');
      expect(page.events[0].objeto).toBe('RES-42');
      expect(page.events[0].sede).toBe('Lab de Redes');
      expect(page.totalPages).toBe(3); expect(page.totalElements).toBe(101);
    });
    const request = http.expectOne(r => r.url === `${environment.apiUrl}/api/audit/events`);
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('size')).toBe('50');
    expect(request.request.params.get('usuario')).toBe('Operadora real');
    expect(request.request.params.get('desde')).toBe('2026-11-13');
    expect(request.request.params.has('hasta')).toBe(false);
    request.flush({ content: [{ eventId: 'event-id', timestamp: '2026-11-13T10:00:00Z',
      actorName: 'Operadora real', actorRole: 'OperadorDominio', action: 'APROBO', bookingId: 42, labName: 'Lab de Redes' }],
      totalPages: 3, totalElements: 101 });
  });

  it('propagates an unavailable API instead of returning demonstration events', () => {
    let status = 0;
    service.list().subscribe({ error: error => status = error.status });
    http.expectOne(r => r.url.endsWith('/api/audit/events')).flush('unavailable', { status: 503, statusText: 'Unavailable' });
    expect(status).toBe(503);
  });
});
