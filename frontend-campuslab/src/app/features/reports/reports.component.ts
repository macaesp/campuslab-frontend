import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../core/services/report.service';
import { HourlyBookings, KpiSummary, TopResource } from '../../core/models/audit.model';
import { forkJoin } from 'rxjs';

/** /reports · Admin. Reservas por hora, tiempo de ciclo, recursos más usados. Alimentado por Kafka. */
@Component({
  selector: 'cl-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent implements OnInit {
  private reportSvc = inject(ReportService);
  private cdr = inject(ChangeDetectorRef);

  kpis: KpiSummary | null = null;
  topResources: TopResource[] = [];
  loading = true;
  error = '';
  hourly: HourlyBookings[] = [];

  ngOnInit(): void {
    queueMicrotask(() => this.load());
  }

  load(): void {
    this.loading = true;
    this.error = '';
    forkJoin({ kpis: this.reportSvc.getKpis('last24h'), top: this.reportSvc.getTopResources('last7d'),
      hourly: this.reportSvc.getBookingsByHour('last24h') }).subscribe({
      next: result => { this.kpis = result.kpis; this.topResources = result.top; this.hourly = result.hourly; this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.kpis = null; this.topResources = []; this.hourly = []; this.error = 'No se pudieron cargar los reportes.'; this.loading = false; this.cdr.markForCheck(); },
    });
  }

  get maxUsos(): number {
    return Math.max(1, ...this.topResources.map((r) => r.usos));
  }

  get maxReservasHora(): number { return Math.max(1, ...this.hourly.map(item => item.reservas)); }
}
