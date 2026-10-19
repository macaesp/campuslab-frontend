import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MsalService } from '@azure/msal-angular';
import { Observable, map, throwError } from 'rxjs';
import { Booking, BookingStatus, CreateBookingRequest } from '../models/booking.model';
import { environment } from '../../../environments/environment';

interface ApiBooking {
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
      id: String(b.id), resourceId: String(b.resourceId), labId: String(b.resourceId),
      labNombre: `Recurso ${b.resourceId}`, solicitanteId: b.studentEmail,
      solicitanteNombre: b.studentEmail, fecha: b.startTime?.slice(0, 10) ?? '',
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
      resourceId, studentEmail: email,
      startTime: `${body.fecha}T${body.horaInicio}:00`,
      endTime: `${body.fecha}T${body.horaFin}:00`,
    }).pipe(map(b => this.fromApi(b)));
  }

  getById(id: string): Observable<Booking> {
    return this.http.get<ApiBooking>(`${this.url}/${encodeURIComponent(id)}`).pipe(map(b => this.fromApi(b)));
  }

  updateStatus(id: string, status: BookingStatus): Observable<Booking> {
    return this.http.put<ApiBooking>(`${this.url}/${encodeURIComponent(id)}/status`, { status })
      .pipe(map(b => this.fromApi(b)));
  }

  list(filters?: { status?: BookingStatus; from?: string; to?: string }): Observable<Booking[]> {
    return this.http.get<ApiBooking[]>(this.url).pipe(map(rows => rows.map(b => this.fromApi(b)).filter(b =>
      (!filters?.status || b.status === filters.status) &&
      (!filters?.from || b.fecha >= filters.from) && (!filters?.to || b.fecha <= filters.to))));
  }
}
