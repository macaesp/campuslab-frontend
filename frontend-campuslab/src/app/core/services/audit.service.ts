import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AuditEvent, AuditFilter } from '../models/audit.model';
@Injectable({ providedIn: 'root' })
export class AuditService {
  list(_filter?: AuditFilter): Observable<AuditEvent[]> {
    return throwError(() => new Error('El servicio de historial de auditoría aún no está conectado.'));
  }
}
