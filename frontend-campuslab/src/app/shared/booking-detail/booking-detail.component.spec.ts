import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { BookingDetailComponent } from './booking-detail.component';
import { Booking } from '../../core/models/booking.model';

describe('Reservation approver details', () => {
  const booking: Booking = { id: '1', labId: '1', labNombre: 'Lab', solicitanteId: 'student@example.test',
    solicitanteNombre: 'Estudiante', status: 'APROBADA', createdAt: '', fecha: '', horaInicio: '', horaFin: '', sede: '' };
  it('shows the persisted approver and role', async () => {
    TestBed.configureTestingModule({ imports: [BookingDetailComponent] });
    const fixture = TestBed.createComponent(BookingDetailComponent);
    fixture.componentRef.setInput('booking', { ...booking, approvedByName: 'Operadora real', approvedByRole: 'OperadorDominio' });
    fixture.detectChanges(); await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Aprobada por');
    expect(fixture.nativeElement.textContent).toContain('Operadora real');
    expect(fixture.nativeElement.textContent).toContain('OperadorDominio');
  });
  it('does not invent an approver for old reservations', async () => {
    TestBed.configureTestingModule({ imports: [BookingDetailComponent] });
    const fixture = TestBed.createComponent(BookingDetailComponent);
    fixture.componentRef.setInput('booking', booking);
    fixture.detectChanges(); await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('No registrado');
  });
});
