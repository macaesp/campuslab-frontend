import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { Booking, ResourceAvailability } from '../../core/models/booking.model';
import { BookingsComponent } from './bookings.component';
import { BookingsService } from '../../core/services/bookings.service';
import { CatalogService } from '../../core/services/catalog.service';
import { RoleService } from '../../core/auth/role.service';

describe('Student reservation controls', () => {
  afterEach(() => vi.restoreAllMocks());
  it('disables requests until capacity is loaded and discards availability after a time change', () => {
    const answer = new Subject<ResourceAvailability[]>();
    TestBed.configureTestingModule({ imports: [BookingsComponent], providers: [
      { provide: BookingsService, useValue: { list: () => of([]), availability: () => answer } },
      { provide: CatalogService, useValue: { list: () => of([
        { id: '1', tipo: 'LABORATORIO', nombre: 'Sala A' }, { id: '3', tipo: 'EQUIPO', nombre: 'Proyector' },
      ]) } },
      { provide: RoleService, useValue: { isCliente: () => true, isAdmin: () => false, isOperador: () => false } },
    ] });
    const fixture = TestBed.createComponent(BookingsComponent); fixture.detectChanges();
    const page = fixture.componentInstance; page.openForm();
    page.form.patchValue({ fecha: '2026-11-20', horaInicio: '10:00', horaFin: '11:00', quantity: 2, labId: '1', resourceId: '3' });
    page.refreshAvailability(); fixture.detectChanges();
    const submit = () => fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submit().disabled).toBe(true);
    answer.next([
      { resourceId: 1, name: 'Sala A', type: 'LABORATORIO', totalQuantity: 1, availableQuantity: 1, available: true },
      { resourceId: 3, name: 'Proyector', type: 'EQUIPO', totalQuantity: 3, availableQuantity: 2, available: true },
    ]);
    fixture.detectChanges(); expect(submit().disabled).toBe(false);
    page.form.patchValue({ horaFin: '12:00' });
    // A delayed response from the previous range must not re-enable the submit button.
    answer.next([{ resourceId: 1, name: 'Sala A', type: 'LABORATORIO', totalQuantity: 1, availableQuantity: 1, available: true }]);
    fixture.detectChanges(); expect(submit().disabled).toBe(true);
    expect(page.form.value.quantity).toBe(2);
    fixture.destroy();
  });
  it('refreshes automatic changes every 30 seconds without resetting a draft and stops on destroy', () => {
    let tick: () => void = () => {};
    const nativeInterval = globalThis.setInterval;
    vi.spyOn(globalThis, 'setInterval').mockImplementation((handler, delay, ...args) => {
      if (delay === 30000) {
        tick = handler as () => void;
        return 123 as unknown as ReturnType<typeof setInterval>;
      }
      return Reflect.apply(nativeInterval, globalThis, [handler, delay, ...args]);
    });
    const clear = vi.spyOn(globalThis, 'clearInterval');
    const pending = { id: '1', status: 'SOLICITADA', createdAt: '2026-11-17T10:00:00' } as Booking;
    const list = vi.fn().mockReturnValueOnce(of([pending]))
      .mockReturnValue(of([{ ...pending, status: 'CANCELADA' }]));
    TestBed.configureTestingModule({ imports: [BookingsComponent], providers: [
      { provide: BookingsService, useValue: { list } },
      { provide: CatalogService, useValue: { list: () => of([]) } },
      { provide: RoleService, useValue: { isCliente: () => true, isAdmin: () => false, isOperador: () => false } },
    ] });
    const fixture = TestBed.createComponent(BookingsComponent);
    fixture.detectChanges();
    fixture.componentInstance.showForm = true;
    fixture.componentInstance.form.patchValue({ fecha: '2026-11-20', horaInicio: '10:00' });
    tick();
    expect(fixture.componentInstance.bookings[0].status).toBe('CANCELADA');
    expect(fixture.componentInstance.showForm).toBe(true);
    expect(fixture.componentInstance.form.value.fecha).toBe('2026-11-20');
    expect(fixture.componentInstance.loading).toBe(false);
    fixture.destroy();
    expect(clear).toHaveBeenCalledWith(123);
  });
  it('offers a new request but no confirmation or other status actions', async () => {
    TestBed.configureTestingModule({ imports: [BookingsComponent], providers: [
      { provide: BookingsService, useValue: { list: () => of([]) } },
      { provide: CatalogService, useValue: { list: () => of([]) } },
      { provide: RoleService, useValue: { isCliente: () => true, isAdmin: () => false, isOperador: () => false } },
    ] });
    const fixture = TestBed.createComponent(BookingsComponent);
    fixture.detectChanges(); await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Nueva reserva');
    for (const status of ['SOLICITADA', 'APROBADA', 'EN_PREPARACION', 'EN_USO', 'DEVUELTA', 'CANCELADA'] as const) {
      expect(fixture.componentInstance.nextStatuses(status)).toEqual([]);
    }
  });
});
