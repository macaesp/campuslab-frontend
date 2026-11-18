/**
 * Máquina de estados exacta del caso (sección 5, ms-campuslab-bookings):
 * SOLICITADA -> APROBADA -> EN_PREPARACION -> EN_USO -> DEVUELTA
 *                                  \-> CANCELADA (desde SOLICITADA o APROBADA)
 * Regla clave: no se puede pasar a EN_USO sin haber pasado por APROBADA.
 */
export type BookingStatus =
  | 'SOLICITADA'
  | 'APROBADA'
  | 'EN_PREPARACION'
  | 'EN_USO'
  | 'DEVUELTA'
  | 'CANCELADA';

export interface Booking {
  quantity?: number;
  trackingCode?: string;
  cancellationReason?: string;
  approvedByName?: string;
  approvedByRole?: string;
  startTime?: string;
  endTime?: string;
  id: string;
  labId: string;
  labNombre: string;
  resourceId?: string;
  resourceNombre?: string;
  solicitanteId: string;
  solicitanteNombre: string;
  fecha: string;       // ISO date
  horaInicio: string;  // HH:mm
  horaFin: string;     // HH:mm
  status: BookingStatus;
  sede: string;
  createdAt: string;
}

export interface CreateBookingRequest {
  quantity?: number;
  labId: string;
  resourceId?: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

export interface ResourceAvailability {
  resourceId: number;
  name: string;
  type: 'LABORATORIO' | 'EQUIPO' | 'INSUMO';
  totalQuantity: number;
  availableQuantity: number;
  available: boolean;
}

/** Transiciones válidas desde cada estado (misma regla que debe validar el backend). */
export const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  SOLICITADA: ['APROBADA', 'CANCELADA'],
  APROBADA: ['EN_PREPARACION', 'CANCELADA'],
  EN_PREPARACION: ['EN_USO', 'CANCELADA'],
  EN_USO: ['DEVUELTA'],
  DEVUELTA: [],
  CANCELADA: [],
};

export const STATUS_LABEL: Record<BookingStatus, string> = {
  SOLICITADA: 'Solicitada',
  APROBADA: 'Aprobada',
  EN_PREPARACION: 'En preparación',
  EN_USO: 'En uso',
  DEVUELTA: 'Devuelta',
  CANCELADA: 'Cancelada',
};

/** Active requests first, oldest creation first in both groups. Reservation date is not priority. */
export function sortBookings(bookings: Booking[]): Booking[] {
  const closed = (b: Booking) => Number(b.status === 'DEVUELTA' || b.status === 'CANCELADA');
  return [...bookings].sort((a, b) => closed(a) - closed(b)
    || (a.createdAt || '\uffff').localeCompare(b.createdAt || '\uffff')
    || a.id.localeCompare(b.id, undefined, { numeric: true }));
}
