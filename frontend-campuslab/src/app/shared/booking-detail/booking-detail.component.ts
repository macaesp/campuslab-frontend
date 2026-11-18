import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../../core/models/booking.model';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'cl-booking-detail',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <article class="detail">
      <header><h2>Detalle de la reserva</h2><div class="detail-actions"><cl-status-badge [status]="booking().status" /><ng-content select="[detail-close]" /></div></header>
      <div class="code" *ngIf="booking().trackingCode; else pendingCode"><span>Código de consulta</span><strong>{{ booking().trackingCode }}</strong>
        <small>Guarda este código para consultar la reserva desde la página principal. Quien tenga el código podrá ver estos detalles.</small></div>
      <ng-template #pendingCode><p>{{ booking().status === 'CANCELADA' ? 'La solicitud fue cancelada sin emitir un código de aprobación.' : 'El código de consulta se enviará a tu correo cuando se apruebe la reserva.' }}</p></ng-template>
      <dl>
        <div><dt>Reservado por</dt><dd>{{ booking().solicitanteNombre }}</dd></div>
        <div><dt>Correo del solicitante</dt><dd>{{ booking().solicitanteId }}</dd></div>
        <div><dt>Aprobada por</dt><dd>{{ booking().approvedByName || (booking().status === 'SOLICITADA' ? 'Pendiente de aprobación' : booking().status === 'CANCELADA' && !booking().trackingCode ? 'No fue aprobada' : 'No registrado') }}<small *ngIf="booking().approvedByRole">{{ booking().approvedByRole }}</small></dd></div>
        <div><dt>Laboratorio / sala</dt><dd>{{ booking().labNombre }}</dd></div>
        <div><dt>Recurso reservado</dt><dd>{{ booking().resourceNombre || booking().labNombre }}</dd></div>
        <div><dt>Cantidad</dt><dd>{{ booking().quantity ?? 1 }}</dd></div>
        <div><dt>Fecha de creación</dt><dd>{{ booking().createdAt ? (booking().createdAt | date:'dd/MM/yyyy HH:mm') : 'No registrada' }}</dd></div>
        <div><dt>Inicio de ocupación</dt><dd>{{ booking().startTime ? (booking().startTime | date:'dd/MM/yyyy HH:mm') : 'No registrado' }}</dd></div>
        <div><dt>Fin de ocupación</dt><dd>{{ booking().endTime ? (booking().endTime | date:'dd/MM/yyyy HH:mm') : 'No registrado' }}</dd></div>
        <div *ngIf="booking().cancellationReason"><dt>Motivo de cancelación</dt><dd>{{ booking().cancellationReason }}</dd></div>
      </dl>
    </article>`,
  styles: [`
    :host { display:block; } header { display:flex; height:auto; min-height:0; gap:12px; align-items:center; justify-content:space-between; margin-bottom:16px; }
    .detail-actions { display:flex; align-items:center; gap:10px; flex-shrink:0; }
    h2 { font-size:22px; margin:0; min-width:0; } .code { background:#eef5ff; color:#153d69; padding:18px; border-radius:12px; }
    .code span,.code strong,.code small { display:block; } .code strong { font-family:monospace; font-size:18px; overflow-wrap:anywhere; user-select:all; margin:8px 0; }
    dl { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:22px; margin:24px 0 0; }
    dt { color:#64748b; font-size:13px; margin-bottom:6px; } dd { margin:0; overflow-wrap:anywhere; }
    dd small { display:block; color:#64748b; font-size:12px; margin-top:4px; }
    @media(max-width:560px) { dl { grid-template-columns:1fr; } }
  `],
})
export class BookingDetailComponent { booking = input.required<Booking>(); }
