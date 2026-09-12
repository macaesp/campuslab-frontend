import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CatalogResource } from '../models/resource.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/catalog/resources`;

  // GET /api/catalog/resources
  list(): Observable<CatalogResource[]> {
    return this.http.get<CatalogResource[]>(this.base).pipe(
      catchError(() => of([
        { id: 'LAB-REDES', tipo: 'LABORATORIO', nombre: 'Laboratorio de Redes', sede: 'Sede Central', capacidad: 30 },
        { id: 'EQ-001', tipo: 'EQUIPO', nombre: 'Osciloscopio Digital', sede: 'Sede Central', estado: 'DISPONIBLE' },
        { id: 'INS-001', tipo: 'INSUMO', nombre: 'Kit Arduino', sede: 'Sede Central', stock: 12, umbral: 10, unidad: 'unidades' }
      ] as CatalogResource[]))
    );
  }

  // POST /api/catalog/resources (Admin)
  create(resource: Partial<CatalogResource>): Observable<CatalogResource> {
    return this.http.post<CatalogResource>(this.base, resource);
  }

  // PUT /api/catalog/resources/{id} (cupo/stock) (Admin)
  update(id: string, resource: Partial<CatalogResource>): Observable<CatalogResource> {
    return this.http.put<CatalogResource>(`${this.base}/${id}`, resource);
  }
}
