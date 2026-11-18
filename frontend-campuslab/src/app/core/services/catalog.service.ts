<<<<<<< Updated upstream
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
=======
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CatalogResource, ResourceType } from '../models/resource.model';
import { environment } from '../../../environments/environment';

interface ApiResource {
  sede?: string | null; enabled?: boolean | null; archived?: boolean | null;
  id: number; name: string; type: ResourceType; availableStock: number;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/catalog/resources`;
  private fromApi(r: ApiResource): CatalogResource {
    return { id: String(r.id), nombre: r.name, tipo: r.type, sede: r.sede ?? '', enabled: r.enabled !== false, archived: r.archived === true,
      capacidad: r.type === 'LABORATORIO' ? r.availableStock : undefined,
      stock: r.availableStock,
      estado: r.enabled === false ? 'MANTENIMIENTO' : r.availableStock > 0 ? 'DISPONIBLE' : 'EN_USO' };
  }
  private toApi(r: Partial<CatalogResource>) {
    return { name: r.nombre, type: r.tipo, sede: r.sede, enabled: r.enabled,
      availableStock: r.tipo === 'LABORATORIO' ? (r.capacidad ?? 0) : (r.stock ?? 0) };
  }
  list(includeArchived = false): Observable<CatalogResource[]> {
    return this.http.get<ApiResource[]>(this.url, includeArchived ? { params: { includeArchived: 'true' } } : {})
      .pipe(map(rows => rows.map(r => this.fromApi(r))));
  }
  remove(id: string): Observable<void> { return this.http.delete<void>(`${this.url}/${encodeURIComponent(id)}`); }
  restore(id: string): Observable<CatalogResource> {
    return this.http.put<ApiResource>(`${this.url}/${encodeURIComponent(id)}`, { archived: false, enabled: false }).pipe(map(r => this.fromApi(r)));
>>>>>>> Stashed changes
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
