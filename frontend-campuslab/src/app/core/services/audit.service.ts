import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuditEvent, AuditFilter } from '../models/audit.model';
import { environment } from '../../../environments/environment';

interface ApiEvent {
  eventId: string; timestamp: string; actorName: string; actorRole: string;
  reason?: string;
  action: AuditEvent['accion']; bookingId: number; labName?: string;
}

export interface AuditPage {
  events: AuditEvent[];
  totalPages: number;
  totalElements: number;
}

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly http = inject(HttpClient);

  list(filter?: AuditFilter, page = 0): Observable<AuditPage> {
    let params = new HttpParams().set('page', page).set('size', 50);
    for (const [key, value] of Object.entries(filter ?? {})) {
      if (value) params = params.set(key, value);
    }
    return this.http.get<{ content: ApiEvent[]; totalPages: number; totalElements: number }>(
      `${environment.apiUrl}/api/audit/events`, { params },
    ).pipe(map(result => ({
      events: result.content.map(event => ({
        id: event.eventId, timestamp: event.timestamp, actorNombre: event.actorName,
        actorRol: event.actorRole, accion: event.action, objeto: `RES-${event.bookingId}`,
        sede: event.labName || 'Sin laboratorio registrado',
        motivo: event.reason,
      })),
      totalPages: result.totalPages,
      totalElements: result.totalElements,
    })));
  }
}
