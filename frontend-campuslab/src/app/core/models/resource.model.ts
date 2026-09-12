export type ResourceType = 'LABORATORIO' | 'EQUIPO' | 'INSUMO';
export type EquipmentStatus = 'DISPONIBLE' | 'EN_USO' | 'MANTENIMIENTO' | 'NO_DEVUELTO';

export interface CatalogResource {
  id: string;
  tipo: ResourceType;
  nombre: string;
  sede: string;
  labId?: string;
  capacidad?: number;       // laboratorios
  estado?: EquipmentStatus; // equipos
  stock?: number;           // insumos
  umbral?: number;          // insumos: stock mínimo antes de alertar
  unidad?: string;          // insumos
}
