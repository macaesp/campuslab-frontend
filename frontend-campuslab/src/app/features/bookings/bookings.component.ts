import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RoleService } from '../../core/auth/role.service';
import { BookingsService } from '../../core/services/bookings.service';
import { CatalogService } from '../../core/services/catalog.service';
import { Booking, BookingStatus, VALID_TRANSITIONS } from '../../core/models/booking.model';
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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StatusBadgeComponent],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.scss',
})
export class BookingsComponent implements OnInit {
  private bookingsSvc = inject(BookingsService);
  private catalogSvc = inject(CatalogService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  roleService = inject(RoleService);

  bookings: Booking[] = [];
  labs: CatalogResource[] = [];
  equipos: CatalogResource[] = [];
  loading = true;
  errorMessage = '';
  showForm = false;
  statusFilter: BookingStatus | 'todas' = 'todas';

  form = this.fb.group({
    labId: ['', Validators.required],
    resourceId: [''],
    fecha: ['', Validators.required],
    horaInicio: ['', Validators.required],
    horaFin: ['', Validators.required],
  });

  ngOnInit(): void {
    this.refresh();
    // GET /api/catalog/resources -> puebla los selects de laboratorio/equipo del formulario
    this.catalogSvc.list().subscribe({
      next: (r) => {
        this.labs = r.filter((x) => x.tipo === 'LABORATORIO');
        this.equipos = r.filter((x) => x.tipo === 'EQUIPO');
        this.cdr.markForCheck();
      },
    });
  }

  refresh(): void {
    this.errorMessage = '';
    this.loading = true;
    const status = this.statusFilter === 'todas' ? undefined : this.statusFilter;
    this.bookingsSvc.list({ status }).subscribe({
      next: (b) => { this.bookings = b; this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.loading = false; this.errorMessage = 'No se pudieron cargar las reservas del servidor.'; this.cdr.markForCheck(); },
    });
  }

  /** Solo ofrece transiciones válidas desde el estado actual (VALID_TRANSITIONS). */
  nextStatuses(current: BookingStatus): BookingStatus[] {
    if (this.roleService.isCliente()) {
      return current === 'SOLICITADA' ? ['CANCELADA'] : [];
    }
    if (this.roleService.isOperador() || this.roleService.isAdmin()) {
      return VALID_TRANSITIONS[current];
    }
    return [];
  }

  changeStatus(booking: Booking, next: BookingStatus): void {
    this.errorMessage = '';
    // PUT /api/bookings/{id}/status
    this.bookingsSvc.updateStatus(booking.id, next).subscribe({
      next: (updated) => {
        this.bookings = this.bookings.map((b) => (b.id === updated.id ? updated : b))
          .filter((b) => this.statusFilter === 'todas' || b.status === this.statusFilter);
        this.cdr.markForCheck();
      },
      error: () => { this.errorMessage = 'No se pudo confirmar el cambio de estado. Recarga las reservas para comprobar su estado actual.'; this.cdr.markForCheck(); },
    });
  }

  submitBooking(): void {
    this.errorMessage = '';
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    // POST /api/bookings — el stock/cupo del recurso baja cuando el técnico/admin aprueba, no al crear.
    this.bookingsSvc
      .create({
        labId: v.labId!,
        resourceId: v.resourceId || undefined,
        fecha: v.fecha!,
        horaInicio: v.horaInicio!,
        horaFin: v.horaFin!,
      })
      .subscribe({
        next: (created) => {
          this.bookings = [created, ...this.bookings];
          this.form.reset();
          this.showForm = false;
          this.cdr.markForCheck();
        },
        error: () => { this.errorMessage = 'No se pudo crear la reserva. Comprueba tu sesión y el recurso seleccionado.'; this.cdr.markForCheck(); },
      });
  }
}
