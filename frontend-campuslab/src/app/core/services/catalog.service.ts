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
  }

  create(resource: Partial<CatalogResource>): Observable<CatalogResource> {
    return this.http.post<ApiResource>(this.url, this.toApi(resource))
      .pipe(map(r => this.fromApi(r)));
  }

  update(id: string, resource: Partial<CatalogResource>): Observable<CatalogResource> {
    return this.http.put<ApiResource>(`${this.url}/${encodeURIComponent(id)}`, this.toApi(resource))
      .pipe(map(r => this.fromApi(r)));
  }
}
