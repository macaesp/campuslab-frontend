import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuditEvent, AuditFilter } from '../models/audit.model';

/**
 * Timeline local de demostración.
 */
@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly mockEvents: AuditEvent[] = [
    { id: 'AUD-001', timestamp: '2026-09-11T10:15:00Z', actorNombre: 'Macarena Espinoza', actorRol: 'Cliente', accion: 'SOLICITO', objeto: 'RES-001', sede: 'Sede Central' },
    { id: 'AUD-002', timestamp: '2026-09-11T11:20:00Z', actorNombre: 'Ignacio Pérez', actorRol: 'Operador', accion: 'APROBO', objeto: 'RES-002', sede: 'Sede Central' },
    { id: 'AUD-003', timestamp: '2026-09-11T12:00:00Z', actorNombre: 'Ignacio Pérez', actorRol: 'Operador', accion: 'ENTREGO', objeto: 'EQ-014', sede: 'Sede Central' },
  ];

  list(filter?: AuditFilter): Observable<AuditEvent[]> {
    const usuario = filter?.usuario?.toLocaleLowerCase() ?? '';
    return of(this.mockEvents.filter((event) =>
      (!usuario || event.actorNombre.toLocaleLowerCase().includes(usuario)) &&
      (!filter?.tipoEvento || event.accion === filter.tipoEvento) &&
      (!filter?.desde || event.timestamp.slice(0, 10) >= filter.desde) &&
      (!filter?.hasta || event.timestamp.slice(0, 10) <= filter.hasta),
    ));
  }
}
