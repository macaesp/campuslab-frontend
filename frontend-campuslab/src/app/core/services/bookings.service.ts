<<<<<<< Updated upstream
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Booking, BookingStatus, CreateBookingRequest } from '../models/booking.model';
=======
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MsalService } from '@azure/msal-angular';
import { Observable, map, throwError } from 'rxjs';
import { Booking, BookingStatus, CreateBookingRequest, ResourceAvailability, sortBookings } from '../models/booking.model';
import { environment } from '../../../environments/environment';

interface ApiBooking {
  quantity?: number | null;
  cancellationReason?: string | null;
  approvedByName?: string | null; approvedByRole?: string | null;
  trackingCode?: string | null; labId?: number; labName?: string; resourceName?: string; studentName?: string;
  id: number; resourceId: number; studentEmail: string; status: BookingStatus;
  startTime: string | null; endTime: string | null; createdAt: string;
}
>>>>>>> Stashed changes

/**
 * Datos locales temporales para demostrar las vistas antes de integrar servicios externos.
 */
@Injectable({ providedIn: 'root' })
export class BookingsService {
<<<<<<< Updated upstream
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
=======
  private http = inject(HttpClient);
  private auth = inject(MsalService);
  private url = `${environment.apiUrl}/api/bookings`;

  private fromApi(b: ApiBooking): Booking {
    return {
      quantity: b.quantity ?? 1,
      trackingCode: b.trackingCode ?? undefined, startTime: b.startTime ?? '', endTime: b.endTime ?? '',
      approvedByName: b.approvedByName ?? undefined, approvedByRole: b.approvedByRole ?? undefined,
      cancellationReason: b.cancellationReason ?? undefined,
      id: b.id == null ? '' : String(b.id), resourceId: b.resourceId == null ? undefined : String(b.resourceId), labId: String(b.labId ?? b.resourceId ?? ''),
      labNombre: b.labName || (b.labId ? `Laboratorio ${b.labId}` : 'No registrado'),
      resourceNombre: b.resourceName || (b.resourceId ? `Recurso ${b.resourceId}` : 'No registrado'), solicitanteId: b.studentEmail,
      solicitanteNombre: b.studentName || b.studentEmail, fecha: b.startTime?.slice(0, 10) ?? '',
      horaInicio: b.startTime?.slice(11, 16) ?? '', horaFin: b.endTime?.slice(11, 16) ?? '',
      status: b.status, sede: '', createdAt: b.createdAt,
    };
  }

  create(body: CreateBookingRequest): Observable<Booking> {
    const account = this.auth.instance.getActiveAccount() ?? this.auth.instance.getAllAccounts()[0];
    const email = account?.username;
    const resourceId = Number(body.resourceId || body.labId);
    if (!email || !Number.isSafeInteger(resourceId) || resourceId <= 0) {
      return throwError(() => new Error('Inicia sesión y selecciona un recurso del catálogo.'));
    }
    return this.http.post<ApiBooking>(this.url, {
      resourceId, labId: Number(body.labId), studentEmail: email, studentName: account?.name || email,
      quantity: body.quantity ?? 1,
      startTime: `${body.fecha}T${body.horaInicio}:00`,
      endTime: `${body.fecha}T${body.horaFin}:00`,
    }).pipe(map(b => this.fromApi(b)));
>>>>>>> Stashed changes
  }

  availability(fecha: string, inicio: string, fin: string, quantity: number): Observable<ResourceAvailability[]> {
    const params = new HttpParams().set('startTime', `${fecha}T${inicio}:00`)
      .set('endTime', `${fecha}T${fin}:00`).set('quantity', quantity);
    return this.http.get<ResourceAvailability[]>(`${this.url}/availability`, { params });
  }

  getById(id: string): Observable<Booking> {
    return of(this.bookings.find((booking) => booking.id === id)!);
  }

  lookup(code: string): Observable<Booking> {
    return this.http.get<ApiBooking>(`${this.url}/public/${encodeURIComponent(code.trim())}`)
      .pipe(map(b => this.fromApi(b)));
  }

  updateStatus(id: string, status: BookingStatus): Observable<Booking> {
    const booking = this.bookings.find((item) => item.id === id)!;
    const updated = { ...booking, status };
    this.bookings = this.bookings.map((item) => item.id === id ? updated : item);
    return of(updated);
  }

  list(filters?: { status?: BookingStatus; from?: string; to?: string }): Observable<Booking[]> {
<<<<<<< Updated upstream
    return of(this.bookings.filter((booking) =>
      (!filters?.status || booking.status === filters.status) &&
      (!filters?.from || booking.fecha >= filters.from) &&
      (!filters?.to || booking.fecha <= filters.to),
    ));
=======
    return this.http.get<ApiBooking[]>(this.url).pipe(map(rows => sortBookings(rows.map(b => this.fromApi(b)).filter(b =>
      (!filters?.status || b.status === filters.status) &&
      (!filters?.from || b.fecha >= filters.from) && (!filters?.to || b.fecha <= filters.to)))));
>>>>>>> Stashed changes
  }
}
