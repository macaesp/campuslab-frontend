import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface AuditEvent {
  id: string;
  bookingId: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  details: string;
  ipAddress: string;
}

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit.components.html',
  styleUrl: './audit.components.css'
})
export class AuditComponent {
  searchTerm = '';
  selectedFilter = 'TODOS';

  // Timeline alimentado por Kafka (ms-campuslab-audit)[cite: 1]
  auditEvents: AuditEvent[] = [
    { id: 'EVT-1004', bookingId: 'RES-001', timestamp: '2026-09-11 18:30:12', actor: 'Carlos Técnico', role: 'Operador', action: 'CAMBIO_ESTADO', details: 'Cambió estado a EN_PREPARACIÓN', ipAddress: '192.168.1.45' },
    { id: 'EVT-1003', bookingId: 'RES-001', timestamp: '2026-09-11 16:15:00', actor: 'Carlos Técnico', role: 'Operador', action: 'APROBACION', details: 'Aprobó solicitud de laboratorio', ipAddress: '192.168.1.45' },
    { id: 'EVT-1002', bookingId: 'RES-002', timestamp: '2026-09-11 14:22:10', actor: 'Ana Admin', role: 'Admin', action: 'MODIFICACION_STOCK', details: 'Aumentó stock de Osciloscopios (+2)', ipAddress: '192.168.1.10' },
    { id: 'EVT-1001', bookingId: 'RES-001', timestamp: '2026-09-11 10:00:05', actor: 'Juan Pérez', role: 'Cliente', action: 'CREACION_RESERVA', details: 'Solicitó Lab. Redes y Telecom #2', ipAddress: '10.0.4.12' }
  ];

  get filteredEvents(): AuditEvent[] {
    return this.auditEvents.filter(evt => {
      const matchesSearch = evt.bookingId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            evt.actor.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesType = this.selectedFilter === 'TODOS' || evt.action === this.selectedFilter;
      return matchesSearch && matchesType;
    });
  }
}
