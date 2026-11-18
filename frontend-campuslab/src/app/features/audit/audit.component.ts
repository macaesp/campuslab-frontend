import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

  events: AuditEvent[] = [];
  loading = true;
  error = '';
  page = 0;
  totalPages = 0;
  totalElements = 0;

  filtroUsuario = '';
  filtroDesde = '';
  filtroHasta = '';
  filtroTipo = '';

  actionLabel(action: AuditEvent['accion']): string {
    return ({ SOLICITO: 'Solicitó', APROBO: 'Aprobó', PREPARO: 'Preparó', ENTREGO: 'Entregó',
      RECIBIO: 'Recibió', CANCELO: 'Canceló', DEVOLVIO: 'Devolvió', ELIMINO: 'Eliminó' })[action];
  }

  ngOnInit(): void {
    // Diferir la primera búsqueda evita cambiar la vista durante su verificación inicial.
    queueMicrotask(() => this.buscar());
  }

  buscar(page = 0): void {
    this.page = page;
    this.error = '';
    this.loading = true;
    this.auditSvc
      .list({
        usuario: this.filtroUsuario || undefined,
        desde: this.filtroDesde || undefined,
        hasta: this.filtroHasta || undefined,
        tipoEvento: this.filtroTipo || undefined,
      }, page)
      .subscribe({
        next: (result) => {
          this.events = result.events;
          this.totalPages = result.totalPages;
          this.totalElements = result.totalElements;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => { this.events = []; this.error = 'No se pudo cargar el historial. Intenta nuevamente.'; this.loading = false; this.cdr.markForCheck(); },
      });
  }
}
