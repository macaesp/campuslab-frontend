import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MsalService } from '@azure/msal-angular';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BookingsService } from './bookings.service';
import { environment } from '../../../environments/environment';
import { msalInterceptorConfigFactory } from '../../../msal-interceptor-config';

describe('Booking details and public lookup', () => {
  let service: BookingsService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(),
      { provide: MsalService, useValue: { instance: { getActiveAccount: () => ({ username: 'student@example.test', name: 'Estudiante' }) } } },
    ] });
    service = TestBed.inject(BookingsService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('keeps the oldest active request first and closed reservations at the bottom', () => {
    service.list().subscribe(rows => expect(rows.map(b => b.id)).toEqual(['3', '2', '1', '4']));
    http.expectOne(`${environment.apiUrl}/api/bookings`).flush([
      { id: 1, status: 'DEVUELTA', createdAt: '2026-11-01T10:00:00' },
      { id: 2, status: 'SOLICITADA', createdAt: '2026-11-16T10:00:00', startTime: '2026-11-18T10:00:00' },
      { id: 3, status: 'APROBADA', createdAt: '2026-11-14T10:00:00', startTime: '2026-11-20T10:00:00' },
      { id: 4, status: 'CANCELADA', createdAt: '2026-11-15T10:00:00' },
    ]);
  });
  it('maps public details without requiring internal IDs', () => {
    const code = 'abcdef0123456789abcdef0123456789';
    service.lookup(code).subscribe(b => {
      expect(b.trackingCode).toBe(code); expect(b.labNombre).toBe('Sala A');
      expect(b.solicitanteNombre).toBe('Estudiante'); expect(b.id).toBe('');
      expect(b.createdAt).toBe('2026-10-28T10:00:00');
      expect(b.endTime).toBe('2026-11-01T12:00:00');
      expect(b.approvedByName).toBe('Operadora de prueba');
      expect(b.approvedByRole).toBe('OperadorDominio');
    });
    http.expectOne(`${environment.apiUrl}/api/bookings/public/${code}`).flush({ trackingCode: code,
      labName: 'Sala A', resourceName: 'Proyector', studentName: 'Estudiante', studentEmail: 'student@example.test',
      status: 'APROBADA', approvedByName: 'Operadora de prueba', approvedByRole: 'OperadorDominio',
      createdAt: '2026-10-28T10:00:00', startTime: '2026-11-01T10:00:00', endTime: '2026-11-01T12:00:00' });
  });
  it('sends the laboratory separately from the selected equipment', () => {
    service.create({ labId: '1', resourceId: '2', fecha: '2026-11-01', horaInicio: '10:00', horaFin: '12:00' }).subscribe();
    const request = http.expectOne(`${environment.apiUrl}/api/bookings`);
    expect(request.request.body.labId).toBe(1); expect(request.request.body.resourceId).toBe(2);
    expect(request.request.body.studentName).toBe('Estudiante');
    request.flush({ id: 3, resourceId: 2, studentEmail: 'student@example.test', status: 'SOLICITADA' });
  });
  it('excludes the public endpoint before the general authenticated API rule', () => {
    const rules = [...msalInterceptorConfigFactory().protectedResourceMap.entries()];
    expect(rules[0]).toEqual([`${environment.apiUrl}/api/bookings/public/*`, null]);
    expect(rules[1][1]).toContain(environment.azure.apiScope);
  });
});
