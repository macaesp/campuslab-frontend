import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { BookingDetailDialogComponent } from '../../shared/booking-detail/booking-detail-dialog.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RoleService } from '../../core/auth/role.service';
import { BookingsService } from '../../core/services/bookings.service';
import { CatalogService } from '../../core/services/catalog.service';
import { ReportService } from '../../core/services/report.service';
import { Booking } from '../../core/models/booking.model';
import { CatalogResource } from '../../core/models/resource.model';
import { KpiSummary } from '../../core/models/audit.model';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { OccupancyGridComponent } from '../../shared/occupancy-grid/occupancy-grid.component';

/**
 * /dashboard · todos los autenticados.
 * Admin: ocupación de labs (grilla) + alertas de catálogo.
 * Técnico (Operador): reservas por preparar.
 * Estudiante (Cliente): próximas reservas y estado.
 * Auditor: resumen de eventos recientes.
 */
@Component({
  selector: 'cl-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, OccupancyGridComponent, BookingDetailDialogComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  errorMessage = '';
  private bookingsSvc = inject(BookingsService);
  private catalogSvc = inject(CatalogService);
  private reportSvc = inject(ReportService);
  roleService = inject(RoleService);

  kpis: KpiSummary | null = null;
  bookings: Booking[] = [];
  resources: CatalogResource[] = [];
  loading = true;

  ngOnInit(): void {
    // Diferimos la carga hasta después del render inicial.
    queueMicrotask(() => this.loadDashboard());
  }

  private loadDashboard(): void {
    this.bookingsSvc.list().subscribe({
      next: (b) => { this.bookings = b; this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.loading = false; this.errorMessage = 'No se pudieron cargar las reservas.'; this.cdr.markForCheck(); },
    });

    if (this.roleService.isAdmin()) {
      // GET /api/report/kpis?range=last24h
      this.reportSvc.getKpis('last24h').subscribe({
        next: (k) => { this.kpis = k; this.cdr.markForCheck(); },
        error: () => { this.kpis = null; this.cdr.markForCheck(); },
      });
      // GET /api/catalog/resources -> alimenta la grilla de ocupación y las alertas
      this.catalogSvc.list().subscribe({
        next: (r) => { this.resources = r; this.cdr.markForCheck(); },
        error: () => { this.resources = []; this.cdr.markForCheck(); },
      });
    }
  }

  get labs(): CatalogResource[] {
    return this.resources.filter((r) => r.tipo === 'LABORATORIO');
  }

  get equiposNoDevueltos(): CatalogResource[] {
    return this.resources.filter((r) => r.tipo === 'EQUIPO' && r.estado === 'NO_DEVUELTO');
  }

  get insumosBajoUmbral(): CatalogResource[] {
    return this.resources.filter((r) => r.tipo === 'INSUMO' && (r.stock ?? 0) < (r.umbral ?? 0));
  }

  get ticketsPreparacion(): Booking[] {
    return this.bookings.filter((b) => b.status === 'SOLICITADA' || b.status === 'APROBADA');
  }

  get proximasReservas(): Booking[] {
    return this.bookings.filter((b) => b.status !== 'CANCELADA' && b.status !== 'DEVUELTA');
  }
}
