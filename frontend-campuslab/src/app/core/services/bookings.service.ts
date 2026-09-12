import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking, BookingStatus, CreateBookingRequest } from '../models/booking.model';

/**
 * Habla siempre con ms-campuslab-bff (nunca directo con ms-campuslab-bookings).
 * El MsalInterceptor adjunta el Bearer token automáticamente (ver auth-config.ts).
 */
@Injectable({ providedIn: 'root' })
export class BookingsService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/bookings`;
  private readonly mockBookings: Booking[] = [
    { id: 'RES-001', labId: 'LAB-REDES', labNombre: 'Laboratorio de Redes', resourceNombre: 'Kit de redes', solicitanteId: 'u-1', solicitanteNombre: 'Macarena Espinoza', fecha: '2026-09-12', horaInicio: '10:00', horaFin: '12:00', status: 'SOLICITADA', sede: 'Sede Central', createdAt: '2026-09-11T10:00:00Z' },
    { id: 'RES-002', labId: 'LAB-ELECT', labNombre: 'Laboratorio de Electrónica', resourceNombre: 'Osciloscopio digital', solicitanteId: 'u-2', solicitanteNombre: 'Ignacio Pérez', fecha: '2026-09-12', horaInicio: '14:00', horaFin: '16:00', status: 'APROBADA', sede: 'Sede Central', createdAt: '2026-09-11T11:00:00Z' },
    { id: 'RES-003', labId: 'LAB-INF', labNombre: 'Laboratorio de Informática', resourceNombre: 'Notebook', solicitanteId: 'u-3', solicitanteNombre: 'Ana Torres', fecha: '2026-09-13', horaInicio: '09:00', horaFin: '11:00', status: 'SOLICITADA', sede: 'Sede Central', createdAt: '2026-09-11T12:00:00Z' },
  ];

  // POST /api/bookings
  create(body: CreateBookingRequest): Observable<Booking> {
    return this.http.post<Booking>(this.base, body);
  }

  // GET /api/bookings/{id}
  getById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.base}/${id}`);
  }

  // PUT /api/bookings/{id}/status  body: { "status": "..." }
  updateStatus(id: string, status: BookingStatus): Observable<Booking> {
    return this.http.put<Booking>(`${this.base}/${id}/status`, { status });
  }

  // GET /api/bookings?status=&from=&to=
  list(filters?: { status?: BookingStatus; from?: string; to?: string }): Observable<Booking[]> {
    if (!environment.production) {
      return of(this.mockBookings.filter((booking) =>
        (!filters?.status || booking.status === filters.status) &&
        (!filters?.from || booking.fecha >= filters.from) &&
        (!filters?.to || booking.fecha <= filters.to),
      ));
    }

    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.from) params = params.set('from', filters.from);
    if (filters?.to) params = params.set('to', filters.to);
    return this.http.get<Booking[]>(this.base, { params }).pipe(
      catchError(() => of(this.mockBookings))
    );
  }
}
