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

@Injectable({ providedIn: 'root' })
export class BookingsService {
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
  }

  availability(fecha: string, inicio: string, fin: string, quantity: number): Observable<ResourceAvailability[]> {
    const params = new HttpParams().set('startTime', `${fecha}T${inicio}:00`)
      .set('endTime', `${fecha}T${fin}:00`).set('quantity', quantity);
    return this.http.get<ResourceAvailability[]>(`${this.url}/availability`, { params });
  }

  getById(id: string): Observable<Booking> {
    return this.http.get<ApiBooking>(`${this.url}/${encodeURIComponent(id)}`)
      .pipe(map(b => this.fromApi(b)));
  }

  lookup(code: string): Observable<Booking> {
    return this.http.get<ApiBooking>(`${this.url}/public/${encodeURIComponent(code.trim())}`)
      .pipe(map(b => this.fromApi(b)));
  }

  updateStatus(id: string, status: BookingStatus): Observable<Booking> {
    return this.http.put<ApiBooking>(`${this.url}/${encodeURIComponent(id)}/status`, { status })
      .pipe(map(b => this.fromApi(b)));
  }

  list(filters?: { status?: BookingStatus; from?: string; to?: string }): Observable<Booking[]> {
    return this.http.get<ApiBooking[]>(this.url).pipe(map(rows => sortBookings(rows.map(b => this.fromApi(b)).filter(b =>
      (!filters?.status || b.status === filters.status) &&
      (!filters?.from || b.fecha >= filters.from) && (!filters?.to || b.fecha <= filters.to)))));
  }
}
