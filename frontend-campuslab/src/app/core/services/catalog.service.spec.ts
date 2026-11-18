import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CatalogService } from './catalog.service';
import { environment } from '../../../environments/environment';

describe('Configured physical inventory', () => {
  let service: CatalogService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CatalogService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('keeps multiple equipment units and maintenance state separate', () => {
    service.update('3', { tipo: 'EQUIPO', nombre: 'Proyector', sede: 'Central', stock: 5, enabled: false }).subscribe(r => {
      expect(r.stock).toBe(5); expect(r.enabled).toBe(false); expect(r.sede).toBe('Central');
    });
    const request = http.expectOne(`${environment.apiUrl}/api/catalog/resources/3`);
    expect(request.request.body.availableStock).toBe(5);
    expect(request.request.body.enabled).toBe(false);
    request.flush({ id: 3, name: 'Proyector', type: 'EQUIPO', availableStock: 5, sede: 'Central', enabled: false });
  });
  it('lists archived resources only on request and restores without changing their inventory', () => {
    service.list(true).subscribe();
    http.expectOne(r => r.url.endsWith('/api/catalog/resources') && r.params.get('includeArchived') === 'true').flush([]);
    service.restore('3').subscribe();
    const restore = http.expectOne(`${environment.apiUrl}/api/catalog/resources/3`);
    expect(restore.request.body).toEqual({ archived: false, enabled: false });
    restore.flush({ id: 3, name: 'Proyector', type: 'EQUIPO', availableStock: 5, enabled: false, archived: false });
  });
});
