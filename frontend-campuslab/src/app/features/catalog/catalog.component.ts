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
  private catalogSvc = inject(CatalogService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  roleService = inject(RoleService);

  resources: CatalogResource[] = [];
  loading = true;
  loadError = '';
  tab: ResourceType = 'LABORATORIO';

  showForm = false;
  saving = false;
  saveError = '';
  editingId: string | null = null;

  form = this.fb.group({
    tipo: ['LABORATORIO' as ResourceType, Validators.required],
    nombre: ['', Validators.required],
    sede: ['', Validators.required],
    capacidad: [0],
    estado: ['DISPONIBLE'],
    stock: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    umbral: [0],
    unidad: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = '';
    // GET /api/catalog/resources
    this.catalogSvc.list().subscribe({
      next: (r) => { this.resources = r; this.loading = false; this.cdr.markForCheck(); },
            error: (err) => {
        this.loading = false;
        this.loadError = err.status === 401 || err.status === 403
          ? 'No se pudo acceder al catálogo. Revisa los permisos de tu cuenta para la API.'
          : 'No se pudo cargar el catálogo. Comprueba que el BFF y el servicio de catálogo estén iniciados.';
        this.cdr.markForCheck();
      },
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
    this.saveError = '';
    this.editingId = null;
    this.form.reset({ tipo: this.tab, nombre: '', sede: '', capacidad: 0, estado: 'DISPONIBLE', stock: 0, umbral: 0, unidad: '' });
    this.showForm = true;
  }

  openEdit(r: CatalogResource): void {
    this.saveError = '';
    this.editingId = r.id;
    this.form.reset({
      tipo: r.tipo, nombre: r.nombre, sede: r.sede,
      capacidad: r.capacidad ?? 0, estado: r.estado ?? 'DISPONIBLE',
      stock: r.stock ?? 0, umbral: r.umbral ?? 0, unidad: r.unidad ?? '',
    });
    this.showForm = true;
  }

  save(): void {
    if (this.form.invalid || this.saving) return;
    const v = this.form.getRawValue();
    const payload: Partial<CatalogResource> = {
      tipo: v.tipo!, nombre: v.nombre!, sede: v.sede!,
      capacidad: v.tipo === 'LABORATORIO' ? Number(v.capacidad) : undefined,
      estado: v.tipo === 'EQUIPO' ? (v.estado as CatalogResource['estado']) : undefined,
      stock: v.tipo !== 'LABORATORIO' ? Number(v.stock) : undefined,
      umbral: v.tipo === 'INSUMO' ? Number(v.umbral) : undefined,
      unidad: v.tipo === 'INSUMO' ? v.unidad! : undefined,
    };

    const req$ = this.editingId
      ? this.catalogSvc.update(this.editingId, payload)   // PUT /api/catalog/resources/{id}
      : this.catalogSvc.create(payload);                  // POST /api/catalog/resources

    this.saving = true;
    this.saveError = '';
    req$.subscribe({
      next: (saved) => {
        this.resources = this.editingId
          ? this.resources.map((r) => (r.id === saved.id ? saved : r))
          : [saved, ...this.resources];
        this.showForm = false;
        this.saving = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.saving = false;
        this.saveError = 'No se pudo guardar el recurso. Revisa la conexión y los permisos e inténtalo nuevamente.';
        this.cdr.markForCheck();
      },
    });
  }
}
