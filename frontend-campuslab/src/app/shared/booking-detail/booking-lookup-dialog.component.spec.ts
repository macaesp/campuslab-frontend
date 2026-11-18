import { TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BookingLookupDialogComponent } from './booking-lookup-dialog.component';
import { BookingsService } from '../../core/services/bookings.service';
import { Booking } from '../../core/models/booking.model';

describe('Reservation lookup dialog', () => {
  const booking: Booking = { id: '', trackingCode: 'a'.repeat(32), labId: '', labNombre: 'Sala A', solicitanteId: 'student@example.test',
    solicitanteNombre: 'Estudiante', status: 'APROBADA', createdAt: '', fecha: '', horaInicio: '', horaFin: '', sede: '' };
  let service: { lookup: ReturnType<typeof vi.fn> };
  beforeEach(() => {
    service = { lookup: vi.fn(() => of(booking)) };
    TestBed.configureTestingModule({ imports: [BookingLookupDialogComponent], providers: [{ provide: BookingsService, useValue: service }] });
  });
  function open() {
    const fixture = TestBed.createComponent(BookingLookupDialogComponent);
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    dialog.showModal = () => dialog.setAttribute('open', '');
    fixture.componentInstance.show();
    return fixture;
  }
  it('opens a code box, rejects malformed input and displays valid reservation details', async () => {
    const fixture = open();
    fixture.componentInstance.code = 'wrong'; fixture.componentInstance.search();
    await fixture.whenStable();
    expect(service.lookup).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('32 caracteres');
    fixture.componentInstance.code = 'a'.repeat(32); fixture.componentInstance.search();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Sala A');
    expect(fixture.nativeElement.textContent).toContain('Estudiante');
  });
  it('does not show previous results for an invalid code or a closed request', async () => {
    const pending = new Subject<Booking>(); service.lookup.mockReturnValue(pending);
    const fixture = open(); fixture.componentInstance.code = 'a'.repeat(32); fixture.componentInstance.search();
    fixture.componentInstance.cancelSearch(); pending.next(booking); pending.complete();
    await fixture.whenStable(); expect(fixture.componentInstance.booking()).toBeNull();
    service.lookup.mockImplementation(() => new Subject<Booking>());
    fixture.componentInstance.show(); fixture.componentInstance.code = 'a'.repeat(32); fixture.componentInstance.search();
    fixture.componentInstance.cancelSearch();
    const missing = new Subject<Booking>(); service.lookup.mockReturnValue(missing);
    fixture.componentInstance.search(); missing.error({ status: 404 });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('no corresponde a una reserva aprobada');
  });
});
