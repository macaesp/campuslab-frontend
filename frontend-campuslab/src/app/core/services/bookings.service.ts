import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Booking, BookingStatus, CreateBookingRequest } from '../models/booking.model';

/**
 * Datos locales temporales para demostrar las vistas antes de integrar servicios externos.
 */
@Injectable({ providedIn: 'root' })
export class BookingsService {
  private bookings: Booking[] = [
    { id: 'RES-001', labId: 'LAB-REDES', labNombre: 'Laboratorio de Redes', resourceNombre: 'Kit de redes', solicitanteId: 'u-1', solicitanteNombre: 'Macarena Espinoza', fecha: '2026-09-12', horaInicio: '10:00', horaFin: '12:00', status: 'SOLICITADA', sede: 'Sede Central', createdAt: '2026-09-11T10:00:00Z' },
    { id: 'RES-002', labId: 'LAB-ELECT', labNombre: 'Laboratorio de Electrónica', resourceNombre: 'Osciloscopio digital', solicitanteId: 'u-2', solicitanteNombre: 'Ignacio Pérez', fecha: '2026-09-12', horaInicio: '14:00', horaFin: '16:00', status: 'APROBADA', sede: 'Sede Central', createdAt: '2026-09-11T11:00:00Z' },
    { id: 'RES-003', labId: 'LAB-INF', labNombre: 'Laboratorio de Informática', resourceNombre: 'Notebook', solicitanteId: 'u-3', solicitanteNombre: 'Ana Torres', fecha: '2026-09-13', horaInicio: '09:00', horaFin: '11:00', status: 'SOLICITADA', sede: 'Sede Central', createdAt: '2026-09-11T12:00:00Z' },
  ];

  create(body: CreateBookingRequest): Observable<Booking> {
    const booking: Booking = {
      id: `RES-${String(this.bookings.length + 1).padStart(3, '0')}`,
      labId: body.labId, labNombre: 'Laboratorio seleccionado', resourceId: body.resourceId,
      solicitanteId: 'demo-user', solicitanteNombre: 'Usuario', fecha: body.fecha,
      horaInicio: body.horaInicio, horaFin: body.horaFin, status: 'SOLICITADA',
      sede: 'Sede Central', createdAt: new Date().toISOString(),
    };
    this.bookings = [booking, ...this.bookings];
    return of(booking);
  }

  getById(id: string): Observable<Booking> {
    return of(this.bookings.find((booking) => booking.id === id)!);
  }

  updateStatus(id: string, status: BookingStatus): Observable<Booking> {
    const booking = this.bookings.find((item) => item.id === id)!;
    const updated = { ...booking, status };
    this.bookings = this.bookings.map((item) => item.id === id ? updated : item);
    return of(updated);
  }

  list(filters?: { status?: BookingStatus; from?: string; to?: string }): Observable<Booking[]> {
    return of(this.bookings.filter((booking) =>
      (!filters?.status || booking.status === filters.status) &&
      (!filters?.from || booking.fecha >= filters.from) &&
      (!filters?.to || booking.fecha <= filters.to),
    ));
  }
}
