import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { roleGuard } from './core/auth/role.guard';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent) },
  {
    path: '',
    component: ShellComponent,
    canActivate: [MsalGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'bookings', canActivate: [roleGuard], data: { roles: ['Admin', 'OperadorDominio', 'ClienteDominio'] }, loadComponent: () => import('./features/bookings/bookings.component').then((m) => m.BookingsComponent) },
      { path: 'catalog', canActivate: [roleGuard], data: { roles: ['Admin', 'OperadorDominio'] }, loadComponent: () => import('./features/catalog/catalog.component').then((m) => m.CatalogComponent) },
      { path: 'reports', canActivate: [roleGuard], data: { roles: ['Admin'] }, loadComponent: () => import('./features/reports/reports.component').then((m) => m.ReportsComponent) },
      { path: 'audit', canActivate: [roleGuard], data: { roles: ['Admin', 'Auditor'] }, loadComponent: () => import('./features/audit/audit.component').then((m) => m.AuditComponent) }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
