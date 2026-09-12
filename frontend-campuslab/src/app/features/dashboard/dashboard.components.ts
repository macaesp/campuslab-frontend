import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="dashboard">
      <span class="eyebrow">PANEL DE OPERACIONES</span>
      <h2>Bienvenida{{ userName ? ', ' + userName : '' }}</h2>
      <p>Gestiona las reservas de la red académica desde un único lugar.</p>
      <div class="actions">
        <a routerLink="/bookings">Ver reservas</a>
        <a routerLink="/catalog">Consultar catálogo</a>
      </div>
    </section>
  `,
  styles: [`
    .dashboard { max-width: 760px; padding: 2.5rem; border-radius: 14px; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,.06); }
    .eyebrow { color: #05668d; font-size: .75rem; font-weight: 700; letter-spacing: .1em; } h2 { color: #003366; margin: .5rem 0; } p { color: #52616b; }
    .actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 1.5rem; } a { padding: .65rem 1rem; border-radius: 6px; background: #003366; color: #fff; text-decoration: none; font-weight: 600; }
  `]
})
export class DashboardComponent {
  private readonly msalService = inject(MsalService);
  readonly userName = this.msalService.instance.getActiveAccount()?.name ?? '';
}
