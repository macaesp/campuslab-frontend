export interface AuditEvent {
  id: string;
  timestamp: string;
  actorNombre: string;
  actorRol: string;
  accion: 'SOLICITO' | 'APROBO' | 'PREPARO' | 'ENTREGO' | 'RECIBIO' | 'CANCELO' | 'DEVOLVIO' | 'ELIMINO';
  objeto: string;
  sede: string;
  motivo?: string;
}

export interface AuditFilter {
  usuario?: string;
  desde?: string;
  hasta?: string;
  tipoEvento?: string;
}

export interface KpiSummary {
  reservasHoy: number;
  ocupacionPromedio: number | null;
  tiempoCicloPromedioMin: number | null;
  labsActivos: number;
  ciclosCompletados: number;
  catalogAvailable: boolean;
  periodStart: string;
  periodEnd: string;
  coverageStartedAt: string | null;
  lastEventAt: string | null;
}

export interface TopResource {
  resourceId: number;
  nombre: string;
  usos: number;
}

export interface HourlyBookings {
  hora: string;
  reservas: number;
}
