import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BookingsService } from '../../core/services/bookings.service';
import { Booking } from '../../core/models/booking.model';
import { BookingDetailComponent } from './booking-detail.component';

@Component({
  selector: 'cl-booking-lookup-dialog', standalone: true,
  imports: [CommonModule, FormsModule, BookingDetailComponent],
  template: `<dialog #dialog aria-labelledby="lookup-title" (close)="cancelSearch()" (cancel)="cancelSearch()">
    <div class="dialog-heading"><h2 id="lookup-title">Consultar reserva por código</h2>
      <button class="close" type="button" aria-label="Cerrar consulta de reserva" title="Cerrar" (click)="dialog.close()">×</button></div>
    <p>Ingresa el código que recibiste por correo cuando se aprobó tu reserva.</p>
    <form (ngSubmit)="search()">
      <label for="lookup-code">Código de reserva</label>
      <div class="search-row"><input id="lookup-code" name="code" [(ngModel)]="code" maxlength="32" autocomplete="off"
        spellcheck="false" placeholder="Código de 32 caracteres" [disabled]="loading()" required autofocus />
        <button type="submit" [disabled]="loading() || !code.trim()">{{ loading() ? 'Buscando…' : 'Consultar' }}</button></div>
    </form>
    <p *ngIf="error()" role="alert">{{ error() }}</p>
    <div aria-live="polite"><cl-booking-detail *ngIf="booking() as result" [booking]="result" /></div>
  </dialog>`,
  styles: [`dialog { border:1px solid #dce5ef; border-radius:18px; padding:28px; width:min(760px,92vw); max-height:88vh; box-sizing:border-box; color:#152a43; }
    dialog::backdrop { background:rgba(15,23,42,.5); } .dialog-heading { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:8px; }
    h2 { margin:0; font-size:22px; min-width:0; } p { color:#576b83; }
    label { display:block; margin:16px 0 8px; font-weight:600; } .search-row { display:flex; gap:12px; }
    input { flex:1; min-width:0; border:1px solid #b8c8dc; border-radius:8px; padding:12px; font:inherit; }
    button { border:0; background:#245db0; color:white; padding:12px 18px; border-radius:8px; font:inherit; cursor:pointer; }
    button:disabled { opacity:.6; }
    .close { display:grid; place-items:center; flex-shrink:0; width:34px; height:34px; background:transparent; color:#64748b; padding:0; font-size:26px; line-height:1; }
    .close:hover { background:#eef3f9; color:#245db0; } .close:focus-visible { outline:2px solid #245db0; outline-offset:2px; }
    cl-booking-detail { border-top:1px solid #e0e8f1; padding-top:24px; margin-top:24px; }
    @media(max-width:560px) { .search-row { flex-direction:column; } dialog { padding:20px; } }`],
})
export class BookingLookupDialogComponent {
  private dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private bookings = inject(BookingsService);
  private pending?: Subscription;
  code = '';
  loading = signal(false);
  error = signal('');
  booking = signal<Booking | null>(null);

  show(): void {
    this.cancelSearch(); this.code = ''; this.error.set(''); this.booking.set(null);
    this.dialog().nativeElement.showModal();
  }

  cancelSearch(): void { this.pending?.unsubscribe(); this.loading.set(false); }

  search(): void {
    if (this.loading()) return;
    this.error.set(''); this.booking.set(null);
    if (!/^[a-f0-9]{32}$/i.test(this.code.trim())) {
      this.error.set('Ingresa el código completo de 32 caracteres enviado a tu correo.'); return;
    }
    this.loading.set(true);
    this.pending = this.bookings.lookup(this.code).subscribe({
      next: booking => { this.booking.set(booking); this.loading.set(false); },
      error: error => { this.loading.set(false); this.error.set(error.status === 404
        ? 'El código no corresponde a una reserva aprobada.' : 'No pudimos consultar la reserva. Inténtalo nuevamente.'); },
    });
  }
}
