import { Component, OnInit, inject } from '@angular/core';
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
  imports: [CommonModule, RouterLink, StatusBadgeComponent, OccupancyGridComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private bookingsSvc = inject(BookingsService);
  private catalogSvc = inject(CatalogService);
  private reportSvc = inject(ReportService);
  roleService = inject(RoleService);

  kpis: KpiSummary | null = { reservasHoy: 18, ocupacionPromedio: 72, tiempoCicloPromedioMin: 42, labsActivos: 16 };
  bookings: Booking[] = [];
  resources: CatalogResource[] = [
    { id: 'LAB-REDES', tipo: 'LABORATORIO', nombre: 'Laboratorio de Redes', sede: 'Sede Central', capacidad: 30 },
    { id: 'LAB-ELECT', tipo: 'LABORATORIO', nombre: 'Laboratorio de Electrónica', sede: 'Sede Central', capacidad: 24 },
    { id: 'EQ-001', tipo: 'EQUIPO', nombre: 'Osciloscopio Digital', sede: 'Sede Central', estado: 'NO_DEVUELTO' },
    { id: 'INS-001', tipo: 'INSUMO', nombre: 'Kit Arduino', sede: 'Sede Central', stock: 8, umbral: 10, unidad: 'unidades' }
  ];
  loading = true;

  ngOnInit(): void {
    // Evita que los datos de demostración cambien la vista durante el render inicial.
    queueMicrotask(() => this.loadDashboard());
  }

  private loadDashboard(): void {
    this.bookingsSvc.list().subscribe({
      next: (b) => { this.bookings = b; this.loading = false; },
      error: () => { this.loading = false; },
    });

    if (this.roleService.isAdmin()) {
      // GET /api/report/kpis?range=last24h
      this.reportSvc.getKpis('last24h').subscribe({ next: (k) => (this.kpis = k), error: () => (this.kpis = null) });
      // GET /api/catalog/resources -> alimenta la grilla de ocupación y las alertas
      this.catalogSvc.list().subscribe({ next: (r) => (this.resources = r) });
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
