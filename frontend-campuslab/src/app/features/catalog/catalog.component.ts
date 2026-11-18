import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RoleService } from '../../core/auth/role.service';
import { CatalogService } from '../../core/services/catalog.service';
import { CatalogResource, ResourceType } from '../../core/models/resource.model';

/** /catalog · Admin, Técnico (Operador). CRUD de laboratorios, equipos e insumos. */
@Component({
  selector: 'cl-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss',
})
export class CatalogComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private catalogSvc = inject(CatalogService);
  private fb = inject(FormBuilder);
  roleService = inject(RoleService);

  resources: CatalogResource[] = [];
  loading = true;
  errorMessage = '';
  notice = '';
  includeArchived = false;
  tab: ResourceType = 'LABORATORIO';

  showForm = false;
  editingId: string | null = null;

  form = this.fb.group({
    tipo: ['LABORATORIO' as ResourceType, Validators.required],
    nombre: ['', Validators.required],
    sede: ['', Validators.required],
    capacidad: [0, [Validators.required, Validators.min(0), Validators.pattern('^[0-9]+$')]],
    enabled: [true],
    estado: ['DISPONIBLE'],
    stock: [0, [Validators.required, Validators.min(0), Validators.pattern('^[0-9]+$')]],
    umbral: [0],
    unidad: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    // GET /api/catalog/resources
    this.catalogSvc.list(this.includeArchived).subscribe({
      next: (r) => { this.resources = r; this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.loading = false; this.cdr.markForCheck(); },
    });
  }

  remove(resource: CatalogResource): void {
    this.catalogSvc.remove(resource.id).subscribe({
      next: () => {
        this.resources = this.includeArchived ? this.resources.map(r => r.id === resource.id ? { ...r, archived: true, enabled: false } : r)
          : this.resources.filter(r => r.id !== resource.id);
        this.notice = 'Recurso eliminado del catálogo activo. Puedes restaurarlo con Mostrar archivados.';
        this.cdr.markForCheck();
      },
      error: () => { this.errorMessage = 'No se pudo quitar el recurso.'; this.cdr.markForCheck(); },
    });
  }

  restore(resource: CatalogResource): void {
    this.catalogSvc.restore(resource.id).subscribe({
      next: saved => {
        this.resources = this.resources.map(r => r.id === saved.id ? saved : r);
        this.notice = 'Recurso restaurado y deshabilitado. Revisa sus unidades y habilítalo al editar.';
        this.cdr.markForCheck();
      },
      error: () => { this.errorMessage = 'No se pudo restaurar el recurso.'; this.cdr.markForCheck(); },
    });
  }

  get filtered(): CatalogResource[] {
    return this.resources.filter((r) => r.tipo === this.tab);
  }

  get canEdit(): boolean {
    return this.roleService.isAdmin() || this.roleService.isOperador();
  }

  bajoUmbral(r: CatalogResource): boolean {
    return r.tipo === 'INSUMO' && (r.stock ?? 0) < (r.umbral ?? 0);
  }

  openCreate(): void {
    this.errorMessage = '';
    this.form.controls.tipo.enable();
    this.editingId = null;
    this.form.reset({ tipo: this.tab, nombre: '', sede: '', capacidad: 0, enabled: true, estado: 'DISPONIBLE', stock: 0, umbral: 0, unidad: '' });
    this.showForm = true;
  }

  openEdit(r: CatalogResource): void {
    this.errorMessage = '';
    this.editingId = r.id;
    this.form.reset({
      tipo: r.tipo, nombre: r.nombre, sede: r.sede,
      capacidad: r.capacidad ?? 0, estado: r.estado ?? 'DISPONIBLE',
      stock: r.stock ?? 0, umbral: r.umbral ?? 0, unidad: r.unidad ?? '',
      enabled: r.enabled !== false,
    });
    this.form.controls.tipo.disable();
    this.showForm = true;
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const payload: Partial<CatalogResource> = {
      tipo: v.tipo!, nombre: v.nombre!, sede: v.sede!,
      enabled: v.enabled ?? true,
      capacidad: v.tipo === 'LABORATORIO' ? Number(v.capacidad) : undefined,
      estado: v.tipo === 'EQUIPO' ? (v.estado as CatalogResource['estado']) : undefined,
      stock: v.tipo !== 'LABORATORIO' ? Number(v.stock) : undefined,
      umbral: v.tipo === 'INSUMO' ? Number(v.umbral) : undefined,
      unidad: v.tipo === 'INSUMO' ? v.unidad! : undefined,
    };

    const req$ = this.editingId
      ? this.catalogSvc.update(this.editingId, payload)   // PUT /api/catalog/resources/{id}
      : this.catalogSvc.create(payload);                  // POST /api/catalog/resources

    req$.subscribe({
      next: (saved) => {
        this.resources = this.editingId
          ? this.resources.map((r) => (r.id === saved.id ? saved : r))
          : [saved, ...this.resources];
        this.showForm = false;
      },
      error: error => {
        this.errorMessage = error.error?.message || 'No se pudo guardar. Revisa nombre, sede y unidades.';
        this.cdr.markForCheck();
      },
    });
  }
}
