import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingStatus, STATUS_LABEL } from '../../core/models/booking.model';

const STATUS_COLOR: Record<BookingStatus, { bg: string; fg: string }> = {
  SOLICITADA: { bg: '#F5E6D0', fg: '#8A5A16' },
  APROBADA: { bg: '#DCEAE4', fg: '#0F6B5C' },
  EN_PREPARACION: { bg: '#E7EBE7', fg: '#5C6B62' },
  EN_USO: { bg: '#0F6B5C', fg: '#FFFFFF' },
  DEVUELTA: { bg: '#E7EBE7', fg: '#5C6B62' },
  CANCELADA: { bg: '#F4DBD8', fg: '#A6392E' },
};

@Component({
  selector: 'cl-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [style.background]="color.bg" [style.color]="color.fg">
      {{ label }}
    </span>
  `,
  styles: [`
    .badge { display:inline-block; padding:3px 9px; border-radius:20px; font-size:11.5px; font-weight:500; }
  `],
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: BookingStatus;

  get label(): string { return STATUS_LABEL[this.status]; }
  get color() { return STATUS_COLOR[this.status]; }
}
