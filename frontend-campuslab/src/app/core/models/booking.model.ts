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
  labId: string;
  resourceId?: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
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
