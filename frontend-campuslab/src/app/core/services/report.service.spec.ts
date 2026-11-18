import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ReportService } from './report.service';
import { environment } from '../../../environments/environment';

describe('Real reports API', () => {
  let service: ReportService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ReportService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('requests the selected range and preserves missing metrics as null', () => {
    service.getKpis('last7d').subscribe(kpis => expect(kpis.ocupacionPromedio).toBeNull());
    const request = http.expectOne(r => r.url === `${environment.apiUrl}/api/report/kpis`);
    expect(request.request.params.get('range')).toBe('last7d');
    request.flush({ reservasHoy: 0, ocupacionPromedio: null, tiempoCicloPromedioMin: null });
  });

  it('loads real usage rankings and hourly requests without demonstration fallback', () => {
    service.getTopResources().subscribe(rows => expect(rows).toEqual([]));
    http.expectOne(r => r.url.endsWith('/api/report/top-resources') && r.params.get('range') === 'last7d').flush([]);
    service.getBookingsByHour().subscribe(rows => expect(rows[0].reservas).toBe(3));
    http.expectOne(r => r.url.endsWith('/api/report/bookings-by-hour')).flush([{ hora: '2026-11-14T10:00:00Z', reservas: 3 }]);
  });
});
