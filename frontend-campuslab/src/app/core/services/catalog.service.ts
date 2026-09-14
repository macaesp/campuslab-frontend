import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CatalogResource } from '../models/resource.model';

interface CatalogResourceDto {
  id: number;
  name: string;
  description?: string;
  type: CatalogResource['tipo'];
  availableStock: number;
}

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private apiUrl = `${environment.apiUrl}/api/catalog/resources`;

  constructor(private http: HttpClient) {}

  list(): Observable<CatalogResource[]> {
    return this.http
      .get<CatalogResourceDto[]>(this.apiUrl)
      .pipe(map((resources) => resources.map((resource) => this.toModel(resource))));
  }

  create(payload: Partial<CatalogResource>): Observable<CatalogResource> {
    return this.http
      .post<CatalogResourceDto>(this.apiUrl, this.toDto(payload))
      .pipe(map((resource) => this.toModel(resource)));
  }

  update(id: string | number, payload: Partial<CatalogResource>): Observable<CatalogResource> {
    return this.http
      .put<CatalogResourceDto>(`${this.apiUrl}/${id}`, this.toDto(payload))
      .pipe(map((resource) => this.toModel(resource)));
  }

  private toModel(resource: CatalogResourceDto): CatalogResource {
    return {
      id: String(resource.id),
      tipo: resource.type,
      nombre: resource.name,
      sede: resource.description ?? '',
      stock: resource.availableStock,
      capacidad: resource.type === 'LABORATORIO' ? resource.availableStock : undefined,
      estado:
        resource.type === 'EQUIPO'
          ? resource.availableStock > 0
            ? 'DISPONIBLE'
            : 'SIN_STOCK'
          : undefined,
    };
  }

  private toDto(resource: Partial<CatalogResource>): Omit<CatalogResourceDto, 'id'> {
    return {
      name: resource.nombre ?? '',
      description: resource.sede ?? '',
      type: resource.tipo ?? 'INSUMO',
      availableStock: resource.stock ?? resource.capacidad ?? 0,
    };
  }
}

