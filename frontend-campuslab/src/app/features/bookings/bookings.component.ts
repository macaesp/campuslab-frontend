<<<<<<< Updated upstream
import { Component, OnInit, inject } from '@angular/core';
=======
import { ChangeDetectorRef, Component, DestroyRef, NgZone, OnInit, inject, viewChild } from '@angular/core';
import { Subscription, debounceTime, distinctUntilChanged, map, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BookingDetailDialogComponent } from '../../shared/booking-detail/booking-detail-dialog.component';
>>>>>>> Stashed changes
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RoleService } from '../../core/auth/role.service';
import { BookingsService } from '../../core/services/bookings.service';
import { CatalogService } from '../../core/services/catalog.service';
import { Booking, BookingStatus, ResourceAvailability, VALID_TRANSITIONS, sortBookings } from '../../core/models/booking.model';
import { CatalogResource } from '../../core/models/resource.model';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';

/**
 * /bookings · Admin, Técnico (Operador), Estudiante (Cliente).
 * Listar, crear (estudiante o técnico) y cambiar estado (técnico/admin),
 * respetando la máquina de estados: no se puede pasar a EN_USO sin APROBAR.
 */
@Component({
  selector: 'cl-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StatusBadgeComponent, BookingDetailDialogComponent],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.scss',
})
export class BookingsComponent implements OnInit {
  private details = viewChild(BookingDetailDialogComponent);
  private bookingsSvc = inject(BookingsService);
  private catalogSvc = inject(CatalogService);
  private fb = inject(FormBuilder);
<<<<<<< Updated upstream
=======
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private zone = inject(NgZone);
  private listRequest?: Subscription;
  private refreshing = false;
  private availabilityRequest?: Subscription;
  private availabilityKey = '';
  availabilityRows: ResourceAvailability[] = [];
  availabilityLoading = false;
  availabilityMessage = '';
  submitting = false;
>>>>>>> Stashed changes
  roleService = inject(RoleService);

  bookings: Booking[] = [];
  labs: CatalogResource[] = [];
  equipos: CatalogResource[] = [];
  loading = true;
  showForm = false;
  statusFilter: BookingStatus | 'todas' = 'todas';

  form = this.fb.group({
    labId: ['', Validators.required],
    resourceId: [''],
    fecha: ['', Validators.required],
    horaInicio: ['', Validators.required],
    horaFin: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1), Validators.pattern('^[1-9][0-9]*$')]],
  });

  ngOnInit(): void {
    this.refresh();
    this.zone.runOutsideAngular(() => {
      const interval = setInterval(() => this.zone.run(() => {
        this.refresh(true);
        if (this.showForm) this.refreshAvailability();
      }), 30000);
      this.destroyRef.onDestroy(() => clearInterval(interval));
    });
    this.destroyRef.onDestroy(() => { this.listRequest?.unsubscribe(); this.availabilityRequest?.unsubscribe(); });
    this.form.valueChanges.pipe(map(() => this.currentAvailabilityKey()), distinctUntilChanged(),
      tap(() => { this.availabilityRequest?.unsubscribe(); this.availabilityKey = ''; this.availabilityRows = []; this.cdr.markForCheck(); }),
      debounceTime(250), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.refreshAvailability());
    // GET /api/catalog/resources -> puebla los selects de laboratorio/equipo del formulario
    this.catalogSvc.list().subscribe({
      next: (r) => {
        this.labs = r.filter((x) => x.tipo === 'LABORATORIO');
<<<<<<< Updated upstream
        this.equipos = r.filter((x) => x.tipo === 'EQUIPO');
=======
        this.equipos = r.filter((x) => x.tipo === 'EQUIPO' || x.tipo === 'INSUMO');
        this.cdr.markForCheck();
>>>>>>> Stashed changes
      },
    });
  }

<<<<<<< Updated upstream
  refresh(): void {
    this.loading = true;
    const status = this.statusFilter === 'todas' ? undefined : this.statusFilter;
    this.bookingsSvc.list({ status }).subscribe({
      next: (b) => { this.bookings = b; this.loading = false; },
      error: () => { this.loading = false; },
=======
  openForm(): void { this.showForm = true; this.refreshAvailability(); }

  private currentAvailabilityKey(): string {
    const v = this.form.getRawValue();
    return [v.fecha, v.horaInicio, v.horaFin, v.quantity].join('|');
  }

  refreshAvailability(): void {
    this.availabilityRequest?.unsubscribe();
    const v = this.form.getRawValue();
    this.availabilityKey = ''; this.availabilityRows = []; this.availabilityMessage = '';
    if (!v.fecha || !v.horaInicio || !v.horaFin || v.horaFin <= v.horaInicio || !Number.isInteger(v.quantity) || v.quantity! < 1) {
      this.availabilityLoading = false;
      this.availabilityMessage = 'Selecciona fecha, horario y una cantidad válida para consultar disponibilidad.';
      this.cdr.markForCheck();
      return;
    }
    const key = this.currentAvailabilityKey();
    this.availabilityLoading = true;
    this.cdr.markForCheck();
    this.availabilityRequest = this.bookingsSvc.availability(v.fecha, v.horaInicio, v.horaFin, v.quantity!).subscribe({
      next: rows => {
        if (this.currentAvailabilityKey() !== key) return;
        this.availabilityRows = rows; this.availabilityKey = key; this.availabilityLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.availabilityLoading = false;
        this.availabilityMessage = 'No se pudo consultar la disponibilidad. Intenta nuevamente.';
        this.cdr.markForCheck();
      },
    });
  }

  available(id: string): boolean {
    return !this.availabilityLoading && this.availabilityKey === this.currentAvailabilityKey()
      && this.availabilityRows.some(r => String(r.resourceId) === id && r.available);
  }

  availabilityLabel(id: string): string {
    const row = this.availabilityRows.find(r => String(r.resourceId) === id);
    if (!row) return 'Sin consultar';
    return row.type === 'LABORATORIO' ? row.available ? 'Libre' : 'No disponible'
      : `${row.availableQuantity} de ${row.totalQuantity} unidades libres`;
  }

  resourceSelectionChanged(): void {
    if (!this.form.value.resourceId) this.form.controls.quantity.setValue(1);
  }

  get canSubmit(): boolean {
    const v = this.form.getRawValue();
    return !this.submitting && this.form.valid && this.available(v.labId!) && (!v.resourceId || this.available(v.resourceId));
  }

  refresh(silent = false): void {
    if (silent && this.refreshing) return;
    this.listRequest?.unsubscribe();
    this.refreshing = true;
    this.errorMessage = '';
    if (!silent) this.loading = true;
    const status = this.statusFilter === 'todas' ? undefined : this.statusFilter;
    this.listRequest = this.bookingsSvc.list({ status }).subscribe({
      next: (b) => {
        this.bookings = sortBookings(b); this.loading = false; this.refreshing = false;
        this.details()?.updateFromList(b);
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.refreshing = false;
        this.loading = false;
        this.errorMessage = error.status === 401 ? 'Tu sesión no fue aceptada por el servidor. Vuelve a iniciar sesión.'
          : error.status === 403 ? 'El servidor rechazó el acceso a las reservas (403).'
          : error.status === 0 ? 'No se pudo conectar con el servidor de reservas.'
          : `No se pudieron cargar las reservas del servidor${error.status ? ' (' + error.status + ')' : ''}.`;
        this.cdr.markForCheck();
      },
>>>>>>> Stashed changes
    });
  }

  /** Solo ofrece transiciones válidas desde el estado actual (VALID_TRANSITIONS). */
  nextStatuses(current: BookingStatus): BookingStatus[] {
    if (this.roleService.isOperador() || this.roleService.isAdmin()) {
      return VALID_TRANSITIONS[current];
    }
    return [];
  }

  changeStatus(booking: Booking, next: BookingStatus): void {
    // PUT /api/bookings/{id}/status
    this.bookingsSvc.updateStatus(booking.id, next).subscribe({
      next: (updated) => {
<<<<<<< Updated upstream
        this.bookings = this.bookings.map((b) => (b.id === updated.id ? updated : b));
      },
=======
        this.listRequest?.unsubscribe(); this.refreshing = false;
        this.bookings = sortBookings(this.bookings.map((b) => (b.id === updated.id ? updated : b))
          .filter((b) => this.statusFilter === 'todas' || b.status === this.statusFilter));
        this.details()?.updateFromList([updated]);
        this.refresh(true);
        this.cdr.markForCheck();
      },
      error: error => { this.errorMessage = error.error?.message || 'No se pudo confirmar el cambio de estado. Recarga las reservas para comprobar su estado actual.'; this.cdr.markForCheck(); },
>>>>>>> Stashed changes
    });
  }

  submitBooking(): void {
<<<<<<< Updated upstream
    if (this.form.invalid) return;
=======
    this.errorMessage = '';
    if (!this.canSubmit) return;
>>>>>>> Stashed changes
    const v = this.form.getRawValue();
    if (v.horaFin! <= v.horaInicio!) {
      this.errorMessage = 'La hora de fin debe ser posterior a la hora de inicio.';
      return;
    }
    this.submitting = true;
    // Approval allocates units for this interval; total physical inventory remains unchanged.
    this.bookingsSvc
      .create({
        labId: v.labId!,
        resourceId: v.resourceId || undefined,
        fecha: v.fecha!,
        horaInicio: v.horaInicio!,
        horaFin: v.horaFin!,
        quantity: v.resourceId ? v.quantity! : 1,
      })
      .subscribe({
        next: (created) => {
          this.submitting = false;
          this.listRequest?.unsubscribe(); this.refreshing = false;
          this.bookings = sortBookings([created, ...this.bookings]
            .filter((b) => this.statusFilter === 'todas' || b.status === this.statusFilter));
          this.refresh(true);
          this.form.reset({ quantity: 1 });
          this.showForm = false;
<<<<<<< Updated upstream
        },
=======
          this.details()?.show(created);
          this.cdr.markForCheck();
        },
        error: error => {
          this.submitting = false;
          this.errorMessage = error.error?.message || 'No se pudo crear la reserva. Comprueba tu sesión y el recurso seleccionado.';
          this.refreshAvailability(); this.cdr.markForCheck();
        },
>>>>>>> Stashed changes
      });
  }
}
