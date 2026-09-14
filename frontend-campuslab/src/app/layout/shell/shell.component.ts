import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { RoleService, AppRole } from '../../core/auth/role.service';
import { environment } from '../../../environments/environment';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  roles: AppRole[];
}

const NAV: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: '⌂', roles: ['Admin', 'OperadorDominio', 'ClienteDominio', 'Auditor'] },
  { path: '/bookings', label: 'Reservas', icon: '▣', roles: ['Admin', 'OperadorDominio', 'ClienteDominio'] },
  { path: '/catalog', label: 'Catálogo de recursos', icon: '⌬', roles: ['Admin', 'OperadorDominio'] },
  { path: '/reports', label: 'Reportería', icon: '▤', roles: ['Admin'] },
  { path: '/audit', label: 'Auditoría', icon: '◷', roles: ['Admin', 'Auditor'] },
];

/** Shell autenticado: sidebar filtrada por rol + topbar. Envuelve las 5 pantallas protegidas. */
@Component({
  selector: 'cl-shell',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  private msal = inject(MsalService);
  private router = inject(Router);
  roleService = inject(RoleService);
  readonly isDevelopment = !environment.production && environment.allowRolePreview;
  selectedRole: AppRole = this.roleService.getRoles()[0];
  readonly roleOptions: AppRole[] = ['Admin', 'OperadorDominio', 'ClienteDominio', 'Auditor'];

  get items(): NavItem[] {
    return NAV.filter((n) => this.roleService.hasAnyRole(n.roles));
  }

  logout(): void {
    this.msal.logoutRedirect();
  }

  changeRole(role: AppRole): void {
    this.roleService.setDevelopmentRole(role);
    this.selectedRole = role;
    this.router.navigate(['/dashboard']);
  }
}
