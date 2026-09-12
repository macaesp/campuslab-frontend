import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../../core/services/audit.service';
import { AuditEvent } from '../../core/models/audit.model';

/** /audit · Admin, Auditor (solo lectura). Filtros: usuario, fechas, tipo de evento. */
@Component({
  selector: 'cl-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.scss',
})
export class AuditComponent implements OnInit {
  private auditSvc = inject(AuditService);

  events: AuditEvent[] = [];
  loading = true;

  filtroUsuario = '';
  filtroDesde = '';
  filtroHasta = '';
  filtroTipo = '';

  ngOnInit(): void {
    // La API usa datos de respaldo mientras el servicio de auditoría se implementa.
    // Diferir la primera búsqueda evita cambiar la vista durante su verificación inicial.
    queueMicrotask(() => this.buscar());
  }

  buscar(): void {
    this.loading = true;
    this.auditSvc
      .list({
        usuario: this.filtroUsuario || undefined,
        desde: this.filtroDesde || undefined,
        hasta: this.filtroHasta || undefined,
        tipoEvento: this.filtroTipo || undefined,
      })
      .subscribe({
        next: (e) => { this.events = e; this.loading = false; },
        error: () => { this.loading = false; },
      });
  }
}
