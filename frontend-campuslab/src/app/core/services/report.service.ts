import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { KpiSummary, TopResource } from '../models/audit.model';

/** ms-campuslab-report: lectura, alimentado por Kafka (bookings.events) sin bloquear el core. */
@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/report`;

  // GET /api/report/kpis?range=last24h
  getKpis(range: 'last24h' | 'last7d' = 'last24h'): Observable<KpiSummary> {
    return this.http.get<KpiSummary>(`${this.base}/kpis`, { params: new HttpParams().set('range', range) }).pipe(catchError(() => of({ reservasHoy: 18, ocupacionPromedio: 72, tiempoCicloPromedioMin: 42, labsActivos: 16 })));
  }

  // GET /api/report/top-resources?range=last7d
  getTopResources(range: 'last24h' | 'last7d' = 'last7d'): Observable<TopResource[]> {
    return this.http.get<TopResource[]>(`${this.base}/top-resources`, { params: new HttpParams().set('range', range) }).pipe(catchError(() => of([{ nombre: 'Laboratorio de Redes', usos: 24 }, { nombre: 'Osciloscopio Digital', usos: 19 }])));
  }
}
