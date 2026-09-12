import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../../../environments/environment';
import { Booking, BookingStatus, CreateBookingRequest } from '../models/booking.model';

interface BookingDto {
  id: number;
  resourceId: number;
  studentEmail: string;
  status: BookingStatus;
  startTime?: string;
  endTime?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class BookingsService {
  private readonly apiUrl = `${environment.apiUrl}/api/bookings`;

  constructor(
    private http: HttpClient,
    private msal: MsalService,
  ) {}

  create(body: CreateBookingRequest): Observable<Booking> {
    const account = this.msal.instance.getActiveAccount();
    return this.http
      .post<BookingDto>(this.apiUrl, {
        resourceId: Number(body.resourceId || body.labId),
        studentEmail: account?.username ?? '',
        startTime: `${body.fecha}T${body.horaInicio}:00`,
        endTime: `${body.fecha}T${body.horaFin}:00`,
      })
      .pipe(map((booking) => this.toModel(booking)));
  }

  getById(id: string): Observable<Booking> {
    return this.http
      .get<BookingDto>(`${this.apiUrl}/${id}`)
      .pipe(map((booking) => this.toModel(booking)));
  }

  updateStatus(id: string, status: BookingStatus): Observable<Booking> {
    return this.http
      .put<BookingDto>(`${this.apiUrl}/${id}/status`, { status })
      .pipe(map((booking) => this.toModel(booking)));
  }

  list(filters?: { status?: BookingStatus; from?: string; to?: string }): Observable<Booking[]> {
    return this.http.get<BookingDto[]>(this.apiUrl).pipe(
      map((bookings) => bookings.map((booking) => this.toModel(booking))),
      map((bookings) =>
        bookings.filter(
          (booking) =>
            (!filters?.status || booking.status === filters.status) &&
            (!filters?.from || booking.fecha >= filters.from) &&
            (!filters?.to || booking.fecha <= filters.to),
        ),
      ),
    );
  }

  private toModel(booking: BookingDto): Booking {
    const start = booking.startTime ?? '';
    const end = booking.endTime ?? '';
    return {
      id: String(booking.id),
      labId: String(booking.resourceId),
      labNombre: 'Recurso reservado',
      resourceId: String(booking.resourceId),
      solicitanteId: booking.studentEmail,
      solicitanteNombre: booking.studentEmail,
      fecha: start.slice(0, 10),
      horaInicio: start.slice(11, 16),
      horaFin: end.slice(11, 16),
      status: booking.status,
      sede: '',
      createdAt: booking.createdAt ?? '',
    };
  }
}
