import { Component, OnInit, inject } from '@angular/core';
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
  private catalogSvc = inject(CatalogService);
  private fb = inject(FormBuilder);
  roleService = inject(RoleService);

  resources: CatalogResource[] = [];
  loading = true;
  tab: ResourceType = 'LABORATORIO';

  showForm = false;
  editingId: string | null = null;

  form = this.fb.group({
    tipo: ['LABORATORIO' as ResourceType, Validators.required],
    nombre: ['', Validators.required],
    sede: ['', Validators.required],
    capacidad: [0],
    estado: ['DISPONIBLE'],
    stock: [0],
    umbral: [0],
    unidad: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    // GET /api/catalog/resources
    this.catalogSvc.list().subscribe({
      next: (r) => { this.resources = r; this.loading = false; },
      error: () => { this.loading = false; },
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
    this.editingId = null;
    this.form.reset({ tipo: this.tab, nombre: '', sede: '', capacidad: 0, estado: 'DISPONIBLE', stock: 0, umbral: 0, unidad: '' });
    this.showForm = true;
  }

  openEdit(r: CatalogResource): void {
    this.editingId = r.id;
    this.form.reset({
      tipo: r.tipo, nombre: r.nombre, sede: r.sede,
      capacidad: r.capacidad ?? 0, estado: r.estado ?? 'DISPONIBLE',
      stock: r.stock ?? 0, umbral: r.umbral ?? 0, unidad: r.unidad ?? '',
    });
    this.showForm = true;
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const payload: Partial<CatalogResource> = {
      tipo: v.tipo!, nombre: v.nombre!, sede: v.sede!,
      capacidad: v.tipo === 'LABORATORIO' ? Number(v.capacidad) : undefined,
      estado: v.tipo === 'EQUIPO' ? (v.estado as CatalogResource['estado']) : undefined,
      stock: v.tipo === 'INSUMO' ? Number(v.stock) : undefined,
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
    });
  }
}
