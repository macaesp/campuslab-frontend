import { Component, OnInit, inject } from '@angular/core';
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

  ngOnInit(): void {
    this.reportSvc.getKpis('last24h').subscribe({ next: (k) => (this.kpis = k) });
    this.reportSvc.getTopResources('last7d').subscribe({
      next: (t) => { this.topResources = t; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  get maxUsos(): number {
    return Math.max(1, ...this.topResources.map((r) => r.usos));
  }
}
