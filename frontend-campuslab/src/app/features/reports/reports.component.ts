import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../core/services/report.service';
import { KpiSummary, TopResource } from '../../core/models/audit.model';

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

  kpis: KpiSummary | null = null;
  topResources: TopResource[] = [];
  loading = true;
  loadError = '';
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    forkJoin({ kpis: this.reportSvc.getKpis(), top: this.reportSvc.getTopResources() }).subscribe({
      next: ({ kpis, top }) => { this.kpis = kpis; this.topResources = top; this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.loadError = 'No se pudieron cargar los reportes. Comprueba la conexión con catálogo y reservas.'; this.loading = false; this.cdr.markForCheck(); },
    });
  }
  get maxUsos(): number {
    return Math.max(1, ...this.topResources.map((r) => r.usos));
  }
}

