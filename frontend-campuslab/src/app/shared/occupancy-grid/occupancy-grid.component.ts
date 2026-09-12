import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../../core/models/booking.model';
import { CatalogResource } from '../../core/models/resource.model';

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

/**
 * Grilla de ocupación (labs x hora) para el día indicado.
 * Se deriva de las reservas ya cargadas (bookings), no de un mock aparte:
 * cada celda se colorea según el estado de la reserva que ocupa ese bloque.
 */
@Component({
  selector: 'cl-occupancy-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './occupancy-grid.component.html',
  styleUrl: './occupancy-grid.component.scss',
})
export class OccupancyGridComponent {
  @Input({ required: true }) labs: CatalogResource[] = [];
  @Input({ required: true }) bookings: Booking[] = [];
  @Input() fecha: string = new Date().toISOString().slice(0, 10);

  hours = HOURS;
  hoverCell: { lab: string; hour: number; booking: Booking } | null = null;

  bookingAt(labId: string, hour: number): Booking | undefined {
    return this.bookings.find((b) => {
      if (b.labId !== labId || b.fecha !== this.fecha) return false;
      if (b.status === 'CANCELADA' || b.status === 'DEVUELTA') return false;
      const start = parseInt(b.horaInicio.split(':')[0], 10);
      const end = parseInt(b.horaFin.split(':')[0], 10);
      return hour >= start && hour < end;
    });
  }

  cellColor(booking: Booking | undefined): string {
    if (!booking) return '#EEF1EE';
    switch (booking.status) {
      case 'EN_USO': return '#0F6B5C';
      case 'EN_PREPARACION': return '#E3B14F';
      case 'APROBADA':
      case 'SOLICITADA':
      default: return '#E7C892';
    }
  }

  setHover(labId: string, hour: number, booking: Booking | undefined): void {
    this.hoverCell = booking ? { lab: labId, hour, booking } : null;
  }
}
