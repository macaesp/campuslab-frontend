import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { KpiSummary, TopResource } from '../models/audit.model';

/** Datos de demostración para la reportaría del frontend. */
@Injectable({ providedIn: 'root' })
export class ReportService {
  getKpis(range: 'last24h' | 'last7d' = 'last24h'): Observable<KpiSummary> {
    return of({ reservasHoy: range === 'last24h' ? 18 : 94, ocupacionPromedio: 72, tiempoCicloPromedioMin: 42, labsActivos: 16 });
  }

  getTopResources(range: 'last24h' | 'last7d' = 'last7d'): Observable<TopResource[]> {
    return of([{ nombre: 'Laboratorio de Redes', usos: range === 'last7d' ? 24 : 8 }, { nombre: 'Osciloscopio Digital', usos: 19 }]);
  }
}
