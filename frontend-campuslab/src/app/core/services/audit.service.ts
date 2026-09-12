import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditEvent, AuditFilter } from '../models/audit.model';

/**
 * ms-campuslab-audit: read-only, consume Kafka (audit.timeline) y persiste eventos.
 * El caso expone la base /api/audit/* pero no detalla el endpoint de listado;
 * se asume GET /api/audit/events con filtros, a confirmar con el equipo backend.
 */
@Injectable({ providedIn: 'root' })
export class AuditService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/audit/events`;
  private readonly mockEvents: AuditEvent[] = [
    { id: 'AUD-001', timestamp: '2026-09-11T10:15:00Z', actorNombre: 'Macarena Espinoza', actorRol: 'Cliente', accion: 'SOLICITO', objeto: 'RES-001', sede: 'Sede Central' },
    { id: 'AUD-002', timestamp: '2026-09-11T11:20:00Z', actorNombre: 'Ignacio Pérez', actorRol: 'Operador', accion: 'APROBO', objeto: 'RES-002', sede: 'Sede Central' },
    { id: 'AUD-003', timestamp: '2026-09-11T12:00:00Z', actorNombre: 'Ignacio Pérez', actorRol: 'Operador', accion: 'ENTREGO', objeto: 'EQ-014', sede: 'Sede Central' },
  ];

  list(filter?: AuditFilter): Observable<AuditEvent[]> {
    if (!environment.production) {
      const usuario = filter?.usuario?.toLocaleLowerCase() ?? '';
      return of(this.mockEvents.filter((event) =>
        (!usuario || event.actorNombre.toLocaleLowerCase().includes(usuario)) &&
        (!filter?.tipoEvento || event.accion === filter.tipoEvento) &&
        (!filter?.desde || event.timestamp.slice(0, 10) >= filter.desde) &&
        (!filter?.hasta || event.timestamp.slice(0, 10) <= filter.hasta),
      ));
    }

    let params = new HttpParams();
    if (filter?.usuario) params = params.set('usuario', filter.usuario);
    if (filter?.desde) params = params.set('desde', filter.desde);
    if (filter?.hasta) params = params.set('hasta', filter.hasta);
    if (filter?.tipoEvento) params = params.set('tipoEvento', filter.tipoEvento);
    return this.http.get<AuditEvent[]>(this.base, { params }).pipe(
      catchError(() => of(this.mockEvents)),
    );
  }
}
