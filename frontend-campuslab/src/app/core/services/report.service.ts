import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HourlyBookings, KpiSummary, TopResource } from '../models/audit.model';
import { environment } from '../../../environments/environment';

/** Indicadores reales calculados por el consumidor de eventos de Reportes. */
@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/api/report`;
  getKpis(range: 'last24h' | 'last7d' = 'last24h'): Observable<KpiSummary> {
    return this.http.get<KpiSummary>(`${this.url}/kpis`, { params: { range } });
  }

  getTopResources(range: 'last24h' | 'last7d' = 'last7d'): Observable<TopResource[]> {
    return this.http.get<TopResource[]>(`${this.url}/top-resources`, { params: { range } });
  }

  getBookingsByHour(range: 'last24h' | 'last7d' = 'last24h'): Observable<HourlyBookings[]> {
    return this.http.get<HourlyBookings[]>(`${this.url}/bookings-by-hour`, { params: { range } });
  }
}
