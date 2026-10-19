import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CatalogResource, ResourceType } from '../models/resource.model';
import { environment } from '../../../environments/environment';

interface ApiResource {
  id: number; name: string; type: ResourceType; availableStock: number;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/catalog/resources`;
  private fromApi(r: ApiResource): CatalogResource {
    return { id: String(r.id), nombre: r.name, tipo: r.type, sede: '',
      capacidad: r.type === 'LABORATORIO' ? r.availableStock : undefined,
      stock: r.availableStock,
      estado: r.availableStock > 0 ? 'DISPONIBLE' : 'EN_USO' };
  }
  private toApi(r: Partial<CatalogResource>) {
    return { name: r.nombre, type: r.tipo,
      availableStock: r.tipo === 'LABORATORIO' ? (r.capacidad ?? 0) : (r.stock ?? (r.estado === 'DISPONIBLE' ? 1 : 0)) };
  }
  list(): Observable<CatalogResource[]> {
    return this.http.get<ApiResource[]>(this.url).pipe(map(rows => rows.map(r => this.fromApi(r))));
  }
  create(resource: Partial<CatalogResource>): Observable<CatalogResource> {
    return this.http.post<ApiResource>(this.url, this.toApi(resource)).pipe(map(r => this.fromApi(r)));
  }
  update(id: string, resource: Partial<CatalogResource>): Observable<CatalogResource> {
    return this.http.put<ApiResource>(`${this.url}/${encodeURIComponent(id)}`, this.toApi(resource))
      .pipe(map(r => this.fromApi(r)));
  }
}
