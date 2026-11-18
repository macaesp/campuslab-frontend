import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../../core/models/booking.model';
import { BookingDetailComponent } from './booking-detail.component';

@Component({
  selector: 'cl-booking-detail-dialog', standalone: true,
  imports: [CommonModule, BookingDetailComponent],
  template: `<dialog #dialog aria-label="Detalle de la reserva" (click)="backdrop($event)">
    <cl-booking-detail *ngIf="booking() as selected" [booking]="selected">
      <button detail-close class="close" type="button" aria-label="Cerrar detalle de la reserva" title="Cerrar" (click)="dialog.close()" autofocus>×</button>
    </cl-booking-detail>
  </dialog>`,
  styles: [`dialog { border:1px solid #dce5ef; border-radius:18px; padding:28px; width:min(700px,90vw); max-height:85vh; box-sizing:border-box; color:#152a43; }
    dialog::backdrop { background:rgba(15,23,42,.5); }
    .close { display:grid; place-items:center; flex-shrink:0; width:34px; height:34px; border:0; background:transparent; color:#64748b; border-radius:8px; padding:0; font-size:26px; line-height:1; cursor:pointer; }
    .close:hover { background:#eef3f9; color:#245db0; } .close:focus-visible { outline:2px solid #245db0; outline-offset:2px; }
    @media(max-width:560px) { dialog { padding:20px; } }`],
})
export class BookingDetailDialogComponent {
  private dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  booking = signal<Booking | null>(null);
  updateFromList(bookings: Booking[]): void {
    const updated = bookings.find(b => b.id === this.booking()?.id);
    if (updated) this.booking.set(updated);
  }
  show(booking: Booking): void { this.booking.set(booking); this.dialog().nativeElement.showModal(); }
  backdrop(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) {
      const rect = this.dialog().nativeElement.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) this.dialog().nativeElement.close();
    }
  }
}
