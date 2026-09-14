import { Injectable, inject } from '@angular/core';
import { forkJoin, map } from 'rxjs';
import { BookingsService } from './bookings.service';
import { CatalogService } from './catalog.service';
import { KpiSummary, TopResource } from '../models/audit.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private bookings = inject(BookingsService);
  private catalog = inject(CatalogService);
  getKpis(_range: 'last24h' | 'last7d' = 'last24h') {
    const today = this.day(new Date());
    return forkJoin({ bookings: this.bookings.list(), resources: this.catalog.list() }).pipe(map(({ bookings, resources }): KpiSummary => ({
      reservasHoy: bookings.filter(b => b.fecha === today && b.status !== 'CANCELADA').length,
      labsActivos: resources.filter(r => r.tipo === 'LABORATORIO').length,
      reservasAprobadas: bookings.filter(b => b.status === 'APROBADA').length,
      reservasEnUso: bookings.filter(b => b.status === 'EN_USO').length,
    })));
  }
  getTopResources(_range: 'last24h' | 'last7d' = 'last7d') {
    const now = new Date();
    const end = this.day(now);
    now.setDate(now.getDate() - 6);
    const start = this.day(now);
    return forkJoin({ bookings: this.bookings.list(), resources: this.catalog.list() }).pipe(map(({ bookings, resources }): TopResource[] => {
      const counts = new Map<string, number>();
      bookings.filter(b => b.fecha >= start && b.fecha <= end && b.status !== 'CANCELADA').forEach(b => {
        const id = b.resourceId || b.labId;
        counts.set(id, (counts.get(id) || 0) + 1);
      });
      return [...counts].map(([id, usos]) => ({ nombre: resources.find(r => r.id === id)?.nombre || `Recurso ${id}`, usos })).sort((a,b) => b.usos - a.usos);
    }));
  }
  private day(date: Date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
}

