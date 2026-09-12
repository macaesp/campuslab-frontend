import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CatalogResource } from '../models/resource.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private resources: CatalogResource[] = [
    { id: 'LAB-REDES', tipo: 'LABORATORIO', nombre: 'Laboratorio de Redes', sede: 'Sede Central', capacidad: 30 },
    { id: 'LAB-ELECT', tipo: 'LABORATORIO', nombre: 'Laboratorio de Electrónica', sede: 'Sede Central', capacidad: 24 },
    { id: 'EQ-001', tipo: 'EQUIPO', nombre: 'Osciloscopio Digital', sede: 'Sede Central', estado: 'DISPONIBLE' },
    { id: 'INS-001', tipo: 'INSUMO', nombre: 'Kit Arduino', sede: 'Sede Central', stock: 12, umbral: 10, unidad: 'unidades' },
  ];

  list(): Observable<CatalogResource[]> {
    return of(this.resources);
  }

  create(resource: Partial<CatalogResource>): Observable<CatalogResource> {
    const saved = { ...resource, id: `REC-${String(this.resources.length + 1).padStart(3, '0')}` } as CatalogResource;
    this.resources = [saved, ...this.resources];
    return of(saved);
  }

  update(id: string, resource: Partial<CatalogResource>): Observable<CatalogResource> {
    const current = this.resources.find((item) => item.id === id)!;
    const saved = { ...current, ...resource } as CatalogResource;
    this.resources = this.resources.map((item) => item.id === id ? saved : item);
    return of(saved);
  }
}
