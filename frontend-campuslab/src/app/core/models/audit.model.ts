export interface AuditEvent {
  id: string;
  timestamp: string;
  actorNombre: string;
  actorRol: string;
  accion: 'SOLICITO' | 'APROBO' | 'ENTREGO' | 'RECIBIO' | 'CANCELO' | 'DEVOLVIO';
  objeto: string;
  sede: string;
}

export interface AuditFilter {
  usuario?: string;
  desde?: string;
  hasta?: string;
  tipoEvento?: string;
}

export interface KpiSummary {
  reservasHoy: number;
  ocupacionPromedio: number;   // %
  tiempoCicloPromedioMin: number;
  labsActivos: number;
}

export interface TopResource {
  nombre: string;
  usos: number;
}
